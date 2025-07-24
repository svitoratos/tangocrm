-- Migration: Rename deals table to opportunities
-- This script renames the deals table to opportunities for consistency

-- Step 1: Rename the table
ALTER TABLE deals RENAME TO opportunities;

-- Step 2: Rename indexes
ALTER INDEX idx_deals_user_id RENAME TO idx_opportunities_user_id;
ALTER INDEX idx_deals_client_id RENAME TO idx_opportunities_client_id;
ALTER INDEX idx_deals_status RENAME TO idx_opportunities_status;
ALTER INDEX idx_deals_niche RENAME TO idx_opportunities_niche;
ALTER INDEX idx_deals_user_timezone RENAME TO idx_opportunities_user_timezone;
ALTER INDEX idx_deals_expected_close_date RENAME TO idx_opportunities_expected_close_date;
ALTER INDEX idx_deals_follow_up_date RENAME TO idx_opportunities_follow_up_date;
ALTER INDEX idx_deals_scheduled_date RENAME TO idx_opportunities_scheduled_date;

-- Step 3: Rename triggers
ALTER TRIGGER update_deals_updated_at ON opportunities RENAME TO update_opportunities_updated_at;
ALTER TRIGGER trigger_set_deal_user_timezone ON opportunities RENAME TO trigger_set_opportunity_user_timezone;

-- Step 4: Rename functions
CREATE OR REPLACE FUNCTION set_opportunity_user_timezone()
RETURNS TRIGGER AS $$
BEGIN
    -- Set user_timezone to the user's timezone if not already set
    IF NEW.user_timezone IS NULL OR NEW.user_timezone = 'UTC' THEN
        NEW.user_timezone := COALESCE(
            (SELECT timezone FROM users WHERE users.id = NEW.user_id), 
            'UTC'
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 5: Update trigger function reference
DROP TRIGGER IF EXISTS trigger_set_opportunity_user_timezone ON opportunities;
CREATE TRIGGER trigger_set_opportunity_user_timezone
    BEFORE INSERT ON opportunities
    FOR EACH ROW
    EXECUTE FUNCTION set_opportunity_user_timezone();

-- Step 6: Rename functions to be more specific
CREATE OR REPLACE FUNCTION convert_opportunity_date_to_user_timezone(
    opportunity_date TIMESTAMP WITH TIME ZONE,
    user_timezone TEXT DEFAULT 'UTC'
) RETURNS TIMESTAMP WITH TIME ZONE AS $$
BEGIN
    -- Convert from UTC to user's timezone for display
    RETURN opportunity_date AT TIME ZONE user_timezone;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION convert_user_date_to_utc(
    user_date TIMESTAMP WITHOUT TIME ZONE,
    user_timezone TEXT DEFAULT 'UTC'
) RETURNS TIMESTAMP WITH TIME ZONE AS $$
BEGIN
    -- Convert from user's timezone to UTC for storage
    RETURN user_date AT TIME ZONE user_timezone AT TIME ZONE 'UTC';
END;
$$ LANGUAGE plpgsql;

-- Step 7: Update views
CREATE OR REPLACE VIEW opportunities_with_timezone AS
SELECT 
    o.*,
    convert_opportunity_date_to_user_timezone(o.expected_close_date, o.user_timezone) as expected_close_date_local,
    convert_opportunity_date_to_user_timezone(o.actual_close_date, o.user_timezone) as actual_close_date_local,
    convert_opportunity_date_to_user_timezone(o.follow_up_date, o.user_timezone) as follow_up_date_local,
    convert_opportunity_date_to_user_timezone(o.discovery_call_date, o.user_timezone) as discovery_call_date_local,
    convert_opportunity_date_to_user_timezone(o.scheduled_date, o.user_timezone) as scheduled_date_local
FROM opportunities o;

-- Step 8: Update other views
CREATE OR REPLACE VIEW overdue_opportunities AS
SELECT 
    o.*,
    convert_opportunity_date_to_user_timezone(o.expected_close_date, o.user_timezone) as due_date_local,
    convert_opportunity_date_to_user_timezone(o.follow_up_date, o.user_timezone) as follow_up_date_local
FROM opportunities o
WHERE o.expected_close_date IS NOT NULL 
AND convert_opportunity_date_to_user_timezone(o.expected_close_date, o.user_timezone) < NOW();

CREATE OR REPLACE VIEW upcoming_follow_ups AS
SELECT 
    o.*,
    convert_opportunity_date_to_user_timezone(o.follow_up_date, o.user_timezone) as follow_up_date_local
FROM opportunities o
WHERE o.follow_up_date IS NOT NULL 
AND convert_opportunity_date_to_user_timezone(o.follow_up_date, o.user_timezone) >= NOW()
AND convert_opportunity_date_to_user_timezone(o.follow_up_date, o.user_timezone) <= NOW() + INTERVAL '7 days'
ORDER BY o.follow_up_date;

-- Step 9: Update RLS policies
DROP POLICY IF EXISTS "Users can view own deals" ON opportunities;
DROP POLICY IF EXISTS "Users can insert own deals" ON opportunities;
DROP POLICY IF EXISTS "Users can update own deals" ON opportunities;
DROP POLICY IF EXISTS "Users can delete own deals" ON opportunities;

CREATE POLICY "Users can view own opportunities" ON opportunities
    FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert own opportunities" ON opportunities
    FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update own opportunities" ON opportunities
    FOR UPDATE USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete own opportunities" ON opportunities
    FOR DELETE USING (auth.uid()::text = user_id);

-- Step 10: Update foreign key references in calendar_events table
ALTER TABLE calendar_events DROP CONSTRAINT IF EXISTS calendar_events_deal_id_fkey;
ALTER TABLE calendar_events ADD CONSTRAINT calendar_events_opportunity_id_fkey 
    FOREIGN KEY (deal_id) REFERENCES opportunities(id) ON DELETE SET NULL;

-- Step 11: Rename the column in calendar_events table
ALTER TABLE calendar_events RENAME COLUMN deal_id TO opportunity_id;

-- Step 12: Update the foreign key constraint name
ALTER TABLE calendar_events DROP CONSTRAINT IF EXISTS calendar_events_opportunity_id_fkey;
ALTER TABLE calendar_events ADD CONSTRAINT calendar_events_opportunity_id_fkey 
    FOREIGN KEY (opportunity_id) REFERENCES opportunities(id) ON DELETE SET NULL;

-- Step 13: Verification query
SELECT 
    'Migration completed successfully' as status,
    COUNT(*) as total_opportunities,
    COUNT(CASE WHEN user_timezone != 'UTC' THEN 1 END) as opportunities_with_timezone,
    COUNT(CASE WHEN expected_close_date IS NOT NULL THEN 1 END) as opportunities_with_due_dates,
    COUNT(CASE WHEN follow_up_date IS NOT NULL THEN 1 END) as opportunities_with_follow_ups
FROM opportunities;

-- Step 14: Show sample of renamed table
SELECT 
    id,
    title,
    status,
    niche,
    user_timezone,
    created_at
FROM opportunities 
LIMIT 5; 