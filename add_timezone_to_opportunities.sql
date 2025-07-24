-- Migration: Add timezone support to opportunities (deals) table
-- This script updates the deals table to properly handle user timezones for due dates

-- Step 1: Add user_timezone column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'deals' AND column_name = 'user_timezone') THEN
        ALTER TABLE deals ADD COLUMN user_timezone TEXT DEFAULT 'UTC';
        RAISE NOTICE 'Added user_timezone column to deals table';
    ELSE
        RAISE NOTICE 'user_timezone column already exists in deals table';
    END IF;
END $$;

-- Step 2: Convert existing DATE fields to TIMESTAMP WITH TIME ZONE
DO $$ 
BEGIN
    -- Check if expected_close_date is still DATE type
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'deals' 
               AND column_name = 'expected_close_date' 
               AND data_type = 'date') THEN
        
        RAISE NOTICE 'Converting expected_close_date from DATE to TIMESTAMP WITH TIME ZONE';
        
        -- Convert expected_close_date from DATE to TIMESTAMP WITH TIME ZONE
        ALTER TABLE deals 
        ALTER COLUMN expected_close_date TYPE TIMESTAMP WITH TIME ZONE 
        USING expected_close_date::timestamp with time zone;
        
        -- Update existing records to set timezone to user's timezone or UTC
        UPDATE deals 
        SET user_timezone = COALESCE(
            (SELECT timezone FROM users WHERE users.id = deals.user_id), 
            'UTC'
        )
        WHERE user_timezone IS NULL OR user_timezone = 'UTC';
        
        RAISE NOTICE 'Updated user_timezone for existing deals';
    ELSE
        RAISE NOTICE 'expected_close_date is already TIMESTAMP WITH TIME ZONE';
    END IF;
    
    -- Check if actual_close_date is still DATE type
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'deals' 
               AND column_name = 'actual_close_date' 
               AND data_type = 'date') THEN
        
        RAISE NOTICE 'Converting actual_close_date from DATE to TIMESTAMP WITH TIME ZONE';
        
        -- Convert actual_close_date from DATE to TIMESTAMP WITH TIME ZONE
        ALTER TABLE deals 
        ALTER COLUMN actual_close_date TYPE TIMESTAMP WITH TIME ZONE 
        USING actual_close_date::timestamp with time zone;
    ELSE
        RAISE NOTICE 'actual_close_date is already TIMESTAMP WITH TIME ZONE';
    END IF;
END $$;

-- Step 3: Create function to convert dates to user's timezone for display
CREATE OR REPLACE FUNCTION convert_deal_date_to_user_timezone(
    deal_date TIMESTAMP WITH TIME ZONE,
    user_timezone TEXT DEFAULT 'UTC'
) RETURNS TIMESTAMP WITH TIME ZONE AS $$
BEGIN
    -- Convert from UTC to user's timezone for display
    RETURN deal_date AT TIME ZONE user_timezone;
END;
$$ LANGUAGE plpgsql;

-- Step 4: Create function to convert user's local date to UTC for storage
CREATE OR REPLACE FUNCTION convert_user_date_to_utc(
    user_date TIMESTAMP WITHOUT TIME ZONE,
    user_timezone TEXT DEFAULT 'UTC'
) RETURNS TIMESTAMP WITH TIME ZONE AS $$
BEGIN
    -- Convert from user's timezone to UTC for storage
    RETURN user_date AT TIME ZONE user_timezone AT TIME ZONE 'UTC';
END;
$$ LANGUAGE plpgsql;

-- Step 5: Create view for displaying deals with proper timezone conversion
CREATE OR REPLACE VIEW deals_with_timezone AS
SELECT 
    d.*,
    convert_deal_date_to_user_timezone(d.expected_close_date, d.user_timezone) as expected_close_date_local,
    convert_deal_date_to_user_timezone(d.actual_close_date, d.user_timezone) as actual_close_date_local
FROM deals d;

-- Step 6: Create trigger to automatically set user_timezone when creating new deals
CREATE OR REPLACE FUNCTION set_deal_user_timezone()
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

-- Create trigger for new deals
DROP TRIGGER IF EXISTS trigger_set_deal_user_timezone ON deals;
CREATE TRIGGER trigger_set_deal_user_timezone
    BEFORE INSERT ON deals
    FOR EACH ROW
    EXECUTE FUNCTION set_deal_user_timezone();

-- Step 7: Update sample data to include timezone information
UPDATE deals 
SET user_timezone = COALESCE(
    (SELECT timezone FROM users WHERE users.id = deals.user_id), 
    'UTC'
)
WHERE user_timezone IS NULL OR user_timezone = 'UTC';

-- Step 8: Create indexes for better performance with timezone queries
CREATE INDEX IF NOT EXISTS idx_deals_user_timezone ON deals(user_timezone);
CREATE INDEX IF NOT EXISTS idx_deals_expected_close_date_timezone ON deals(expected_close_date, user_timezone);

-- Verification queries
SELECT 
    'Migration completed successfully' as status,
    COUNT(*) as total_deals,
    COUNT(CASE WHEN user_timezone != 'UTC' THEN 1 END) as deals_with_timezone,
    COUNT(CASE WHEN expected_close_date IS NOT NULL THEN 1 END) as deals_with_due_dates
FROM deals;

-- Show sample of converted data
SELECT 
    id,
    title,
    expected_close_date,
    user_timezone,
    convert_deal_date_to_user_timezone(expected_close_date, user_timezone) as expected_close_date_local
FROM deals 
WHERE expected_close_date IS NOT NULL 
LIMIT 5; 