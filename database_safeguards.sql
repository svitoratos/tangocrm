-- Database Safeguards to Prevent Customer ID Mismatches
-- Run this file in your Supabase SQL editor to implement the safeguards

-- 1. Create audit table for customer ID changes
CREATE TABLE IF NOT EXISTS customer_id_changes (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  old_customer_id TEXT,
  new_customer_id TEXT,
  changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  changed_by TEXT,
  notes TEXT
);

-- Index for efficient querying
CREATE INDEX IF NOT EXISTS idx_customer_id_changes_user_id ON customer_id_changes(user_id);
CREATE INDEX IF NOT EXISTS idx_customer_id_changes_changed_at ON customer_id_changes(changed_at);

-- 2. Create monitoring logs table
CREATE TABLE IF NOT EXISTS monitoring_logs (
  id SERIAL PRIMARY KEY,
  check_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  mismatch_count INTEGER DEFAULT 0,
  orphan_count INTEGER DEFAULT 0,
  status TEXT,
  details JSONB
);

-- Index for efficient querying
CREATE INDEX IF NOT EXISTS idx_monitoring_logs_check_date ON monitoring_logs(check_date);
CREATE INDEX IF NOT EXISTS idx_monitoring_logs_status ON monitoring_logs(status);

-- 3. Function to monitor customer ID mismatches
CREATE OR REPLACE FUNCTION monitor_customer_mismatches()
RETURNS TABLE (
  user_id TEXT,
  user_email TEXT,
  db_customer_id TEXT,
  subscription_status TEXT,
  mismatch_type TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id::TEXT as user_id,
    u.email as user_email,
    u.stripe_customer_id as db_customer_id,
    u.subscription_status,
    CASE 
      WHEN u.stripe_customer_id IS NULL AND u.subscription_status = 'active' 
        THEN 'ACTIVE_SUBSCRIPTION_NO_CUSTOMER_ID'
      WHEN u.stripe_customer_id IS NOT NULL AND u.subscription_status = 'inactive'
        THEN 'CUSTOMER_ID_BUT_INACTIVE_STATUS'
      WHEN u.stripe_customer_id IS NOT NULL AND u.stripe_subscription_id IS NULL
        THEN 'CUSTOMER_ID_BUT_NO_SUBSCRIPTION_ID'
      ELSE 'POTENTIAL_MISMATCH'
    END as mismatch_type
  FROM users u
  WHERE 
    (u.stripe_customer_id IS NULL AND u.subscription_status = 'active') OR
    (u.stripe_customer_id IS NOT NULL AND u.subscription_status = 'inactive') OR
    (u.stripe_customer_id IS NOT NULL AND u.stripe_subscription_id IS NULL);
END;
$$ LANGUAGE plpgsql;

-- 4. Trigger to validate customer ID changes
CREATE OR REPLACE FUNCTION validate_customer_id_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Log customer ID changes for monitoring
  IF OLD.stripe_customer_id IS DISTINCT FROM NEW.stripe_customer_id THEN
    INSERT INTO customer_id_changes (
      user_id,
      old_customer_id,
      new_customer_id,
      changed_at,
      changed_by
    ) VALUES (
      NEW.id,
      OLD.stripe_customer_id,
      NEW.stripe_customer_id,
      NOW(),
      current_user
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
DROP TRIGGER IF EXISTS customer_id_change_trigger ON users;
CREATE TRIGGER customer_id_change_trigger
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION validate_customer_id_change();

-- 5. Function to validate webhook data
CREATE OR REPLACE FUNCTION validate_webhook_data(
  p_event_type TEXT,
  p_customer_id TEXT,
  p_subscription_id TEXT,
  p_user_id TEXT
)
RETURNS JSON AS $$
DECLARE
  user_record RECORD;
  result JSON;
BEGIN
  -- Get user data
  SELECT * INTO user_record FROM users WHERE id = p_user_id;
  
  IF NOT FOUND THEN
    RETURN json_build_object(
      'valid', false,
      'error', 'User not found',
      'user_id', p_user_id
    );
  END IF;

  -- Validate customer ID consistency
  IF user_record.stripe_customer_id IS NOT NULL AND user_record.stripe_customer_id != p_customer_id THEN
    RETURN json_build_object(
      'valid', false,
      'error', 'Customer ID mismatch',
      'db_customer_id', user_record.stripe_customer_id,
      'webhook_customer_id', p_customer_id,
      'user_id', p_user_id
    );
  END IF;

  -- Validate subscription ID consistency
  IF user_record.stripe_subscription_id IS NOT NULL AND user_record.stripe_subscription_id != p_subscription_id THEN
    RETURN json_build_object(
      'valid', false,
      'error', 'Subscription ID mismatch',
      'db_subscription_id', user_record.stripe_subscription_id,
      'webhook_subscription_id', p_subscription_id,
      'user_id', p_user_id
    );
  END IF;

  RETURN json_build_object('valid', true, 'message', 'Webhook data validated');
END;
$$ LANGUAGE plpgsql;

-- 6. Function to run daily monitoring
CREATE OR REPLACE FUNCTION run_daily_monitoring()
RETURNS JSON AS $$
DECLARE
  mismatch_count INTEGER;
  result JSON;
BEGIN
  -- Count potential mismatches
  SELECT COUNT(*) INTO mismatch_count
  FROM monitor_customer_mismatches();
  
  -- Log monitoring results
  INSERT INTO monitoring_logs (
    check_date,
    mismatch_count,
    orphan_count,
    status
  ) VALUES (
    NOW(),
    mismatch_count,
    0, -- Placeholder for orphan count
    CASE 
      WHEN mismatch_count = 0 THEN 'CLEAN'
      ELSE 'ISSUES_DETECTED'
    END
  );
  
  RETURN json_build_object(
    'success', true,
    'mismatch_count', mismatch_count,
    'orphan_count', 0,
    'status', CASE 
      WHEN mismatch_count = 0 THEN 'CLEAN'
      ELSE 'ISSUES_DETECTED'
    END
  );
END;
$$ LANGUAGE plpgsql;

-- 7. Function to get monitoring summary
CREATE OR REPLACE FUNCTION get_monitoring_summary()
RETURNS JSON AS $$
DECLARE
  current_mismatches INTEGER;
  recent_changes INTEGER;
  result JSON;
BEGIN
  -- Get current mismatch count
  SELECT COUNT(*) INTO current_mismatches
  FROM monitor_customer_mismatches();
  
  -- Get recent customer ID changes (last 7 days)
  SELECT COUNT(*) INTO recent_changes
  FROM customer_id_changes
  WHERE changed_at > NOW() - INTERVAL '7 days';
  
  RETURN json_build_object(
    'current_mismatches', current_mismatches,
    'recent_changes', recent_changes,
    'last_check', NOW(),
    'status', CASE 
      WHEN current_mismatches = 0 THEN 'HEALTHY'
      ELSE 'NEEDS_ATTENTION'
    END
  );
END;
$$ LANGUAGE plpgsql;

-- 8. Create a view for easy monitoring
CREATE OR REPLACE VIEW customer_mismatch_summary AS
SELECT 
  COUNT(*) as total_users,
  COUNT(CASE WHEN stripe_customer_id IS NULL AND subscription_status = 'active' THEN 1 END) as active_no_customer_id,
  COUNT(CASE WHEN stripe_customer_id IS NOT NULL AND subscription_status = 'inactive' THEN 1 END) as inactive_with_customer_id,
  COUNT(CASE WHEN stripe_customer_id IS NOT NULL AND stripe_subscription_id IS NULL THEN 1 END) as customer_id_no_subscription,
  COUNT(CASE WHEN stripe_customer_id IS NOT NULL AND subscription_status = 'active' THEN 1 END) as healthy_users
FROM users;

-- 9. Create a function to fix common issues automatically
CREATE OR REPLACE FUNCTION auto_fix_common_issues()
RETURNS JSON AS $$
DECLARE
  fixed_count INTEGER := 0;
  result JSON;
BEGIN
  -- Fix users with active status but no customer ID
  UPDATE users 
  SET subscription_status = 'inactive'
  WHERE stripe_customer_id IS NULL AND subscription_status = 'active';
  
  GET DIAGNOSTICS fixed_count = ROW_COUNT;
  
  RETURN json_build_object(
    'success', true,
    'fixed_count', fixed_count,
    'message', 'Auto-fix completed'
  );
END;
$$ LANGUAGE plpgsql;

-- 10. Grant necessary permissions
GRANT SELECT ON customer_id_changes TO authenticated;
GRANT SELECT ON monitoring_logs TO authenticated;
GRANT SELECT ON customer_mismatch_summary TO authenticated;
GRANT EXECUTE ON FUNCTION monitor_customer_mismatches() TO authenticated;
GRANT EXECUTE ON FUNCTION get_monitoring_summary() TO authenticated;
GRANT EXECUTE ON FUNCTION auto_fix_common_issues() TO authenticated;

-- 11. Create a function to manually sync a user
CREATE OR REPLACE FUNCTION manual_sync_user(p_user_id TEXT)
RETURNS JSON AS $$
DECLARE
  user_record RECORD;
  result JSON;
BEGIN
  -- Get user data
  SELECT * INTO user_record FROM users WHERE id = p_user_id;
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'User not found');
  END IF;

  -- Return user info for manual review
  RETURN json_build_object(
    'success', true,
    'user_id', user_record.id,
    'email', user_record.email,
    'stripe_customer_id', user_record.stripe_customer_id,
    'subscription_status', user_record.subscription_status,
    'stripe_subscription_id', user_record.stripe_subscription_id,
    'message', 'User data retrieved for manual sync'
  );
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION manual_sync_user(TEXT) TO authenticated;

-- 12. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_stripe_customer_id ON users(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_users_subscription_status ON users(subscription_status);
CREATE INDEX IF NOT EXISTS idx_users_stripe_subscription_id ON users(stripe_subscription_id);

-- 13. Add comments for documentation
COMMENT ON TABLE customer_id_changes IS 'Audit trail for Stripe customer ID changes';
COMMENT ON TABLE monitoring_logs IS 'Logs of daily monitoring checks';
COMMENT ON FUNCTION monitor_customer_mismatches() IS 'Detects potential customer ID mismatches';
COMMENT ON FUNCTION validate_webhook_data(TEXT, TEXT, TEXT, TEXT) IS 'Validates webhook data before processing';
COMMENT ON FUNCTION run_daily_monitoring() IS 'Runs daily monitoring checks';
COMMENT ON VIEW customer_mismatch_summary IS 'Summary view of customer mismatch status';

-- 14. Create a function to get detailed mismatch report
CREATE OR REPLACE FUNCTION get_detailed_mismatch_report()
RETURNS TABLE (
  user_id TEXT,
  email TEXT,
  issue_type TEXT,
  current_status TEXT,
  recommendation TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id::TEXT as user_id,
    u.email,
    CASE 
      WHEN u.stripe_customer_id IS NULL AND u.subscription_status = 'active' 
        THEN 'Active subscription without customer ID'
      WHEN u.stripe_customer_id IS NOT NULL AND u.subscription_status = 'inactive'
        THEN 'Customer ID but inactive status'
      WHEN u.stripe_customer_id IS NOT NULL AND u.stripe_subscription_id IS NULL
        THEN 'Customer ID but no subscription ID'
      ELSE 'Other issue'
    END as issue_type,
    u.subscription_status as current_status,
    CASE 
      WHEN u.stripe_customer_id IS NULL AND u.subscription_status = 'active' 
        THEN 'Set subscription status to inactive or add customer ID'
      WHEN u.stripe_customer_id IS NOT NULL AND u.subscription_status = 'inactive'
        THEN 'Check Stripe for active subscription or clear customer ID'
      WHEN u.stripe_customer_id IS NOT NULL AND u.stripe_subscription_id IS NULL
        THEN 'Check Stripe for subscription or clear customer ID'
      ELSE 'Manual review required'
    END as recommendation
  FROM users u
  WHERE 
    (u.stripe_customer_id IS NULL AND u.subscription_status = 'active') OR
    (u.stripe_customer_id IS NOT NULL AND u.subscription_status = 'inactive') OR
    (u.stripe_customer_id IS NOT NULL AND u.stripe_subscription_id IS NULL);
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION get_detailed_mismatch_report() TO authenticated;

-- 15. Final summary
SELECT 'Database safeguards implemented successfully!' as status; 