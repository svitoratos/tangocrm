-- Migration script for existing deals table
-- This script adds timezone support to an existing deals table without dropping it

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

-- Step 2: Add new date columns if they don't exist
DO $$ 
BEGIN
    -- Add follow_up_date column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'deals' AND column_name = 'follow_up_date') THEN
        ALTER TABLE deals ADD COLUMN follow_up_date TIMESTAMP WITH TIME ZONE;
        RAISE NOTICE 'Added follow_up_date column to deals table';
    ELSE
        RAISE NOTICE 'follow_up_date column already exists in deals table';
    END IF;
    
    -- Add discovery_call_date column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'deals' AND column_name = 'discovery_call_date') THEN
        ALTER TABLE deals ADD COLUMN discovery_call_date TIMESTAMP WITH TIME ZONE;
        RAISE NOTICE 'Added discovery_call_date column to deals table';
    ELSE
        RAISE NOTICE 'discovery_call_date column already exists in deals table';
    END IF;
    
    -- Add scheduled_date column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'deals' AND column_name = 'scheduled_date') THEN
        ALTER TABLE deals ADD COLUMN scheduled_date TIMESTAMP WITH TIME ZONE;
        RAISE NOTICE 'Added scheduled_date column to deals table';
    ELSE
        RAISE NOTICE 'scheduled_date column already exists in deals table';
    END IF;
END $$;

-- Step 3: Convert existing DATE fields to TIMESTAMP WITH TIME ZONE
DO $$ 
BEGIN
    -- Convert expected_close_date if it's still DATE type
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'deals' 
               AND column_name = 'expected_close_date' 
               AND data_type = 'date') THEN
        
        RAISE NOTICE 'Converting expected_close_date from DATE to TIMESTAMP WITH TIME ZONE';
        ALTER TABLE deals 
        ALTER COLUMN expected_close_date TYPE TIMESTAMP WITH TIME ZONE 
        USING expected_close_date::timestamp with time zone;
    ELSE
        RAISE NOTICE 'expected_close_date is already TIMESTAMP WITH TIME ZONE';
    END IF;
    
    -- Convert actual_close_date if it's still DATE type
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'deals' 
               AND column_name = 'actual_close_date' 
               AND data_type = 'date') THEN
        
        RAISE NOTICE 'Converting actual_close_date from DATE to TIMESTAMP WITH TIME ZONE';
        ALTER TABLE deals 
        ALTER COLUMN actual_close_date TYPE TIMESTAMP WITH TIME ZONE 
        USING actual_close_date::timestamp with time zone;
    ELSE
        RAISE NOTICE 'actual_close_date is already TIMESTAMP WITH TIME ZONE';
    END IF;
END $$;

-- Step 4: Update existing records with user timezone
UPDATE deals 
SET user_timezone = COALESCE(
    (SELECT timezone FROM users WHERE users.id = deals.user_id), 
    'UTC'
)
WHERE user_timezone IS NULL OR user_timezone = 'UTC';

-- Step 5: Create indexes for new columns
CREATE INDEX IF NOT EXISTS idx_deals_user_timezone ON deals(user_timezone);
CREATE INDEX IF NOT EXISTS idx_deals_follow_up_date ON deals(follow_up_date);
CREATE INDEX IF NOT EXISTS idx_deals_discovery_call_date ON deals(discovery_call_date);
CREATE INDEX IF NOT EXISTS idx_deals_scheduled_date ON deals(scheduled_date);

-- Step 6: Create timezone conversion functions
CREATE OR REPLACE FUNCTION convert_deal_date_to_user_timezone(
    deal_date TIMESTAMP WITH TIME ZONE,
    user_timezone TEXT DEFAULT 'UTC'
) RETURNS TIMESTAMP WITH TIME ZONE AS $$
BEGIN
    RETURN deal_date AT TIME ZONE user_timezone;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION convert_user_date_to_utc(
    user_date TIMESTAMP WITHOUT TIME ZONE,
    user_timezone TEXT DEFAULT 'UTC'
) RETURNS TIMESTAMP WITH TIME ZONE AS $$
BEGIN
    RETURN user_date AT TIME ZONE user_timezone AT TIME ZONE 'UTC';
END;
$$ LANGUAGE plpgsql;

-- Step 7: Create function to automatically set user_timezone
CREATE OR REPLACE FUNCTION set_deal_user_timezone()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.user_timezone IS NULL OR NEW.user_timezone = 'UTC' THEN
        NEW.user_timezone := COALESCE(
            (SELECT timezone FROM users WHERE users.id = NEW.user_id), 
            'UTC'
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 8: Create trigger for new deals
DROP TRIGGER IF EXISTS trigger_set_deal_user_timezone ON deals;
CREATE TRIGGER trigger_set_deal_user_timezone
    BEFORE INSERT ON deals
    FOR EACH ROW
    EXECUTE FUNCTION set_deal_user_timezone();

-- Step 9: Create view for timezone-aware display
CREATE OR REPLACE VIEW deals_with_timezone AS
SELECT 
    d.*,
    convert_deal_date_to_user_timezone(d.expected_close_date, d.user_timezone) as expected_close_date_local,
    convert_deal_date_to_user_timezone(d.actual_close_date, d.user_timezone) as actual_close_date_local,
    convert_deal_date_to_user_timezone(d.follow_up_date, d.user_timezone) as follow_up_date_local,
    convert_deal_date_to_user_timezone(d.discovery_call_date, d.user_timezone) as discovery_call_date_local,
    convert_deal_date_to_user_timezone(d.scheduled_date, d.user_timezone) as scheduled_date_local
FROM deals d;

-- Step 10: Verification
SELECT 
    'Migration completed successfully' as status,
    COUNT(*) as total_deals,
    COUNT(CASE WHEN user_timezone != 'UTC' THEN 1 END) as deals_with_timezone,
    COUNT(CASE WHEN expected_close_date IS NOT NULL THEN 1 END) as deals_with_due_dates,
    COUNT(CASE WHEN follow_up_date IS NOT NULL THEN 1 END) as deals_with_follow_ups
FROM deals;

-- Show sample of converted data
SELECT 
    id,
    title,
    expected_close_date as due_date_utc,
    user_timezone,
    convert_deal_date_to_user_timezone(expected_close_date, user_timezone) as due_date_local
FROM deals 
WHERE expected_close_date IS NOT NULL 
LIMIT 5; 