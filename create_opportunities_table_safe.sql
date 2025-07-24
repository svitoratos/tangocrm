-- Simple opportunities table creation script
-- This script safely creates the opportunities table with all required fields

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing views that might conflict
DROP VIEW IF EXISTS opportunities_with_timezone;
DROP VIEW IF EXISTS overdue_opportunities;
DROP VIEW IF EXISTS upcoming_follow_ups;

-- Drop existing table if it exists and recreate it
DROP TABLE IF EXISTS opportunities CASCADE;

-- Create opportunities table with all required fields
CREATE TABLE opportunities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT NOT NULL,
    client_id UUID,
    title TEXT NOT NULL,
    description TEXT,
    value DECIMAL(10,2) DEFAULT 0,
    status TEXT DEFAULT 'prospecting',
    stage TEXT DEFAULT 'prospecting',
    type TEXT DEFAULT 'other',
    niche TEXT NOT NULL,
    source TEXT,
    
    -- Timezone-aware date fields
    expected_close_date TIMESTAMP WITH TIME ZONE,
    actual_close_date TIMESTAMP WITH TIME ZONE,
    follow_up_date TIMESTAMP WITH TIME ZONE,
    discovery_call_date TIMESTAMP WITH TIME ZONE,
    scheduled_date TIMESTAMP WITH TIME ZONE,
    
    -- User's timezone for proper date conversion
    user_timezone TEXT NOT NULL DEFAULT 'UTC',
    
    probability INTEGER DEFAULT 0,
    notes TEXT,
    tags TEXT[] DEFAULT '{}',
    custom_fields JSONB,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add foreign key constraints
ALTER TABLE opportunities 
ADD CONSTRAINT opportunities_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE opportunities 
ADD CONSTRAINT opportunities_client_id_fkey 
FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE SET NULL;

-- Create indexes for better performance
CREATE INDEX idx_opportunities_user_id ON opportunities(user_id);
CREATE INDEX idx_opportunities_client_id ON opportunities(client_id);
CREATE INDEX idx_opportunities_status ON opportunities(status);
CREATE INDEX idx_opportunities_type ON opportunities(type);
CREATE INDEX idx_opportunities_niche ON opportunities(niche);
CREATE INDEX idx_opportunities_user_timezone ON opportunities(user_timezone);
CREATE INDEX idx_opportunities_expected_close_date ON opportunities(expected_close_date);
CREATE INDEX idx_opportunities_follow_up_date ON opportunities(follow_up_date);
CREATE INDEX idx_opportunities_scheduled_date ON opportunities(scheduled_date);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
CREATE TRIGGER update_opportunities_updated_at 
    BEFORE UPDATE ON opportunities
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically set user_timezone when creating new opportunities
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

-- Create trigger for user_timezone
CREATE TRIGGER trigger_set_opportunity_user_timezone
    BEFORE INSERT ON opportunities
    FOR EACH ROW
    EXECUTE FUNCTION set_opportunity_user_timezone();

-- Row Level Security (RLS) policies
ALTER TABLE opportunities ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own opportunities" ON opportunities;
DROP POLICY IF EXISTS "Users can insert own opportunities" ON opportunities;
DROP POLICY IF EXISTS "Users can update own opportunities" ON opportunities;
DROP POLICY IF EXISTS "Users can delete own opportunities" ON opportunities;

-- Create RLS policies
CREATE POLICY "Users can view own opportunities" ON opportunities
    FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert own opportunities" ON opportunities
    FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update own opportunities" ON opportunities
    FOR UPDATE USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete own opportunities" ON opportunities
    FOR DELETE USING (auth.uid()::text = user_id);

-- Update calendar_events table to reference opportunities instead of deals
DO $$ 
BEGIN
    -- Check if deal_id column exists
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'calendar_events' AND column_name = 'deal_id') THEN
        -- Drop the foreign key constraint if it exists
        ALTER TABLE calendar_events DROP CONSTRAINT IF EXISTS calendar_events_deal_id_fkey;
        
        -- Rename the column
        ALTER TABLE calendar_events RENAME COLUMN deal_id TO opportunity_id;
        
        -- Add the new foreign key constraint
        ALTER TABLE calendar_events ADD CONSTRAINT calendar_events_opportunity_id_fkey 
            FOREIGN KEY (opportunity_id) REFERENCES opportunities(id) ON DELETE SET NULL;
            
        RAISE NOTICE 'Successfully updated calendar_events table';
    ELSE
        RAISE NOTICE 'calendar_events table already has opportunity_id column or deal_id column does not exist';
    END IF;
END $$;

-- Verification query
SELECT 
    'Opportunities table created successfully' as status,
    COUNT(*) as total_opportunities
FROM opportunities;

-- Show table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'opportunities' 
ORDER BY ordinal_position; 