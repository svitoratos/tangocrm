-- Opportunities (Deals) Schema with Timezone Support - FIXED VERSION
-- Run this step by step to avoid syntax errors

-- Step 1: Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Step 2: Create or update users table
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT,
    avatar_url TEXT,
    primary_niche TEXT,
    niches TEXT[] DEFAULT '{}',
    onboarding_completed BOOLEAN DEFAULT FALSE,
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    subscription_status TEXT DEFAULT 'inactive',
    subscription_tier TEXT DEFAULT 'free',
    timezone TEXT NOT NULL DEFAULT 'UTC',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 3: Create or update clients table
CREATE TABLE IF NOT EXISTS clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT,
    company TEXT,
    phone TEXT,
    website TEXT,
    social_media JSONB,
    notes TEXT,
    tags TEXT[] DEFAULT '{}',
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 4: Drop existing deals table if it exists (BE CAREFUL - this will delete data)
-- Uncomment the next line only if you want to recreate the table from scratch
-- DROP TABLE IF EXISTS deals CASCADE;

-- Step 5: Create deals table with timezone support
CREATE TABLE IF NOT EXISTS deals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    value DECIMAL(10,2) DEFAULT 0,
    status TEXT DEFAULT 'prospecting',
    stage TEXT DEFAULT 'prospecting',
    niche TEXT NOT NULL,
    source TEXT,
    expected_close_date TIMESTAMP WITH TIME ZONE,
    actual_close_date TIMESTAMP WITH TIME ZONE,
    follow_up_date TIMESTAMP WITH TIME ZONE,
    discovery_call_date TIMESTAMP WITH TIME ZONE,
    scheduled_date TIMESTAMP WITH TIME ZONE,
    user_timezone TEXT NOT NULL DEFAULT 'UTC',
    probability INTEGER DEFAULT 0,
    notes TEXT,
    tags TEXT[] DEFAULT '{}',
    custom_fields JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 6: Create indexes
CREATE INDEX IF NOT EXISTS idx_deals_user_id ON deals(user_id);
CREATE INDEX IF NOT EXISTS idx_deals_client_id ON deals(client_id);
CREATE INDEX IF NOT EXISTS idx_deals_status ON deals(status);
CREATE INDEX IF NOT EXISTS idx_deals_niche ON deals(niche);
CREATE INDEX IF NOT EXISTS idx_deals_user_timezone ON deals(user_timezone);
CREATE INDEX IF NOT EXISTS idx_deals_expected_close_date ON deals(expected_close_date);
CREATE INDEX IF NOT EXISTS idx_deals_follow_up_date ON deals(follow_up_date);
CREATE INDEX IF NOT EXISTS idx_deals_scheduled_date ON deals(scheduled_date);

-- Step 7: Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Step 8: Create trigger for deals table
DROP TRIGGER IF EXISTS update_deals_updated_at ON deals;
CREATE TRIGGER update_deals_updated_at 
    BEFORE UPDATE ON deals
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Step 9: Create function to automatically set user_timezone
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

-- Step 10: Create trigger for new deals
DROP TRIGGER IF EXISTS trigger_set_deal_user_timezone ON deals;
CREATE TRIGGER trigger_set_deal_user_timezone
    BEFORE INSERT ON deals
    FOR EACH ROW
    EXECUTE FUNCTION set_deal_user_timezone();

-- Step 11: Create timezone conversion functions
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

-- Step 12: Create views
CREATE OR REPLACE VIEW deals_with_timezone AS
SELECT 
    d.*,
    convert_deal_date_to_user_timezone(d.expected_close_date, d.user_timezone) as expected_close_date_local,
    convert_deal_date_to_user_timezone(d.actual_close_date, d.user_timezone) as actual_close_date_local,
    convert_deal_date_to_user_timezone(d.follow_up_date, d.user_timezone) as follow_up_date_local,
    convert_deal_date_to_user_timezone(d.discovery_call_date, d.user_timezone) as discovery_call_date_local,
    convert_deal_date_to_user_timezone(d.scheduled_date, d.user_timezone) as scheduled_date_local
FROM deals d;

-- Step 13: Enable RLS
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;

-- Step 14: Create RLS policies
DROP POLICY IF EXISTS "Users can view own deals" ON deals;
CREATE POLICY "Users can view own deals" ON deals
    FOR SELECT USING (auth.uid()::text = user_id);

DROP POLICY IF EXISTS "Users can insert own deals" ON deals;
CREATE POLICY "Users can insert own deals" ON deals
    FOR INSERT WITH CHECK (auth.uid()::text = user_id);

DROP POLICY IF EXISTS "Users can update own deals" ON deals;
CREATE POLICY "Users can update own deals" ON deals
    FOR UPDATE USING (auth.uid()::text = user_id);

DROP POLICY IF EXISTS "Users can delete own deals" ON deals;
CREATE POLICY "Users can delete own deals" ON deals
    FOR DELETE USING (auth.uid()::text = user_id);

-- Step 15: Insert sample data
INSERT INTO users (id, email, full_name, primary_niche, niches, onboarding_completed, subscription_status, subscription_tier, timezone) VALUES
('demo_user_001', 'demo@tango.com', 'Demo User', 'content-creator', '{"content-creator"}', true, 'active', 'core', 'America/New_York'),
('demo_user_002', 'demo2@tango.com', 'Demo User 2', 'coach', '{"coach"}', true, 'active', 'core', 'Europe/London')
ON CONFLICT (id) DO NOTHING;

INSERT INTO clients (user_id, name, email, company, status) VALUES
('demo_user_001', 'Acme Corp', 'contact@acme.com', 'Acme Corporation', 'active'),
('demo_user_001', 'Tech Startup', 'hello@techstartup.com', 'Tech Startup Inc', 'active'),
('demo_user_002', 'Global Consulting', 'info@globalconsulting.com', 'Global Consulting Ltd', 'active')
ON CONFLICT DO NOTHING;

INSERT INTO deals (
    user_id, 
    client_id, 
    title, 
    value, 
    status, 
    stage, 
    niche, 
    probability,
    expected_close_date,
    follow_up_date,
    user_timezone
) VALUES
(
    'demo_user_001',
    (SELECT id FROM clients WHERE email = 'contact@acme.com' LIMIT 1),
    'Brand Partnership Deal',
    5000.00,
    'negotiation',
    'negotiation',
    'creator',
    75,
    NOW() + INTERVAL '30 days',
    NOW() + INTERVAL '3 days',
    'America/New_York'
),
(
    'demo_user_001',
    (SELECT id FROM clients WHERE email = 'hello@techstartup.com' LIMIT 1),
    'Sponsored Content',
    2500.00,
    'proposal',
    'proposal',
    'creator',
    60,
    NOW() + INTERVAL '15 days',
    NOW() + INTERVAL '1 day',
    'America/New_York'
),
(
    'demo_user_002',
    (SELECT id FROM clients WHERE email = 'info@globalconsulting.com' LIMIT 1),
    'Coaching Program',
    3000.00,
    'qualification',
    'qualification',
    'coach',
    40,
    NOW() + INTERVAL '45 days',
    NOW() + INTERVAL '5 days',
    'Europe/London'
)
ON CONFLICT DO NOTHING;

-- Step 16: Verification queries
SELECT 
    'Schema created successfully' as status,
    COUNT(*) as total_deals,
    COUNT(CASE WHEN user_timezone != 'UTC' THEN 1 END) as deals_with_timezone,
    COUNT(CASE WHEN expected_close_date IS NOT NULL THEN 1 END) as deals_with_due_dates,
    COUNT(CASE WHEN follow_up_date IS NOT NULL THEN 1 END) as deals_with_follow_ups
FROM deals;

-- Show sample of timezone conversion
SELECT 
    id,
    title,
    expected_close_date as due_date_utc,
    user_timezone,
    convert_deal_date_to_user_timezone(expected_close_date, user_timezone) as due_date_local,
    follow_up_date as follow_up_utc,
    convert_deal_date_to_user_timezone(follow_up_date, user_timezone) as follow_up_local
FROM deals 
WHERE expected_close_date IS NOT NULL 
LIMIT 5; 