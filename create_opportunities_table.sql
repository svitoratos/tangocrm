-- Create opportunities table from scratch
-- This script creates the opportunities table with all required fields

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ========================================
-- CREATE OPPORTUNITIES TABLE
-- ========================================
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
    niche TEXT NOT NULL DEFAULT 'creator',
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
    custom_fields JSONB DEFAULT '{}',
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- ADD FOREIGN KEY CONSTRAINTS
-- ========================================

-- Add foreign key to users table if it exists
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users') THEN
        ALTER TABLE opportunities 
        ADD CONSTRAINT opportunities_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
        RAISE NOTICE 'Added foreign key constraint to users table';
    ELSE
        RAISE NOTICE 'Users table does not exist, skipping foreign key constraint';
    END IF;
END $$;

-- Add foreign key to clients table if it exists
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'clients') THEN
        ALTER TABLE opportunities 
        ADD CONSTRAINT opportunities_client_id_fkey 
        FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE SET NULL;
        RAISE NOTICE 'Added foreign key constraint to clients table';
    ELSE
        RAISE NOTICE 'Clients table does not exist, skipping foreign key constraint';
    END IF;
END $$;

-- ========================================
-- CREATE INDEXES
-- ========================================
CREATE INDEX idx_opportunities_user_id ON opportunities(user_id);
CREATE INDEX idx_opportunities_client_id ON opportunities(client_id);
CREATE INDEX idx_opportunities_status ON opportunities(status);
CREATE INDEX idx_opportunities_stage ON opportunities(stage);
CREATE INDEX idx_opportunities_type ON opportunities(type);
CREATE INDEX idx_opportunities_niche ON opportunities(niche);
CREATE INDEX idx_opportunities_user_timezone ON opportunities(user_timezone);
CREATE INDEX idx_opportunities_expected_close_date ON opportunities(expected_close_date);
CREATE INDEX idx_opportunities_follow_up_date ON opportunities(follow_up_date);
CREATE INDEX idx_opportunities_scheduled_date ON opportunities(scheduled_date);

-- ========================================
-- CREATE TRIGGER FUNCTIONS
-- ========================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Function to set user_timezone automatically
CREATE OR REPLACE FUNCTION set_user_timezone()
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

-- ========================================
-- CREATE TRIGGERS
-- ========================================
CREATE TRIGGER update_opportunities_updated_at 
    BEFORE UPDATE ON opportunities
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_set_opportunity_user_timezone
    BEFORE INSERT ON opportunities
    FOR EACH ROW
    EXECUTE FUNCTION set_user_timezone();

-- ========================================
-- SETUP ROW LEVEL SECURITY
-- ========================================

-- Enable RLS
ALTER TABLE opportunities ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view own opportunities" ON opportunities
    FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert own opportunities" ON opportunities
    FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update own opportunities" ON opportunities
    FOR UPDATE USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete own opportunities" ON opportunities
    FOR DELETE USING (auth.uid()::text = user_id);

-- ========================================
-- VERIFICATION
-- ========================================

-- Show table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'opportunities' 
ORDER BY ordinal_position;

-- Count opportunities
SELECT COUNT(*) as total_opportunities FROM opportunities;

-- Show that table was created
SELECT 'Opportunities table created successfully!' as status; 