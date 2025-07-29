-- Add notification preferences to users table
-- This migration adds fields to store user notification preferences

-- Add email_notifications_enabled column
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS email_notifications_enabled BOOLEAN DEFAULT true;

-- Add notification_preferences JSON column for future extensibility
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS notification_preferences JSONB DEFAULT '{"email": true}'::jsonb;

-- Update existing users to have email notifications enabled by default
UPDATE users 
SET 
  email_notifications_enabled = true,
  notification_preferences = '{"email": true}'::jsonb
WHERE email_notifications_enabled IS NULL;

-- Add comments for documentation
COMMENT ON COLUMN users.email_notifications_enabled IS 'Whether the user has email notifications enabled';
COMMENT ON COLUMN users.notification_preferences IS 'JSON object storing user notification preferences';

-- Create index on email_notifications_enabled for efficient queries
CREATE INDEX IF NOT EXISTS idx_users_email_notifications_enabled 
ON users(email_notifications_enabled);

-- Verify the changes
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
  AND column_name IN ('email_notifications_enabled', 'notification_preferences')
ORDER BY column_name; 