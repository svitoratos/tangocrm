-- Creator CRM Platform Database Schema
-- This file contains the complete database schema for the Creator CRM Platform

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Clerk users)
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

-- Clients table
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

-- Deals/Opportunities table
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
    user_timezone TEXT DEFAULT 'UTC',
    probability INTEGER DEFAULT 0,
    notes TEXT,
    tags TEXT[] DEFAULT '{}',
    custom_fields JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Content items table
CREATE TABLE IF NOT EXISTS content (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    type TEXT NOT NULL,
    status TEXT DEFAULT 'draft',
    stage TEXT DEFAULT 'idea',
    niche TEXT NOT NULL,
    description TEXT,
    content_url TEXT,
    scheduled_date TIMESTAMP WITH TIME ZONE,
    published_date TIMESTAMP WITH TIME ZONE,
    platform TEXT,
    tags TEXT[] DEFAULT '{}',
    notes TEXT,
    custom_fields JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Calendar events table
CREATE TABLE IF NOT EXISTS calendar_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    type TEXT DEFAULT 'meeting',
    color TEXT DEFAULT 'blue',
    niche TEXT NOT NULL DEFAULT 'creator',
    client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
    deal_id UUID REFERENCES deals(id) ON DELETE SET NULL,
    status TEXT DEFAULT 'scheduled',
    location TEXT,
    meeting_url TEXT,
    notes TEXT,
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Journal entries table
CREATE TABLE IF NOT EXISTS journal_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    mood TEXT,
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Goals table
CREATE TABLE IF NOT EXISTS goals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    target_value DECIMAL(10,2),
    current_value DECIMAL(10,2) DEFAULT 0,
    unit TEXT,
    deadline DATE,
    status TEXT DEFAULT 'active',
    category TEXT NOT NULL,
    niche TEXT NOT NULL,
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_stripe_customer_id ON users(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_clients_user_id ON clients(user_id);
CREATE INDEX IF NOT EXISTS idx_deals_user_id ON deals(user_id);
CREATE INDEX IF NOT EXISTS idx_deals_client_id ON deals(client_id);
CREATE INDEX IF NOT EXISTS idx_deals_status ON deals(status);
CREATE INDEX IF NOT EXISTS idx_deals_niche ON deals(niche);
CREATE INDEX IF NOT EXISTS idx_content_user_id ON content(user_id);
CREATE INDEX IF NOT EXISTS idx_content_status ON content(status);
CREATE INDEX IF NOT EXISTS idx_content_niche ON content(niche);
CREATE INDEX IF NOT EXISTS idx_calendar_events_user_id ON calendar_events(user_id);
CREATE INDEX IF NOT EXISTS idx_calendar_events_start_time ON calendar_events(start_time);
CREATE INDEX IF NOT EXISTS idx_calendar_events_niche ON calendar_events(niche);
CREATE INDEX IF NOT EXISTS idx_journal_entries_user_id ON journal_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_goals_user_id ON goals(user_id);
CREATE INDEX IF NOT EXISTS idx_goals_status ON goals(status);
CREATE INDEX IF NOT EXISTS idx_goals_niche ON goals(niche);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_deals_updated_at BEFORE UPDATE ON deals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_content_updated_at BEFORE UPDATE ON content
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_calendar_events_updated_at BEFORE UPDATE ON calendar_events
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_journal_entries_updated_at BEFORE UPDATE ON journal_entries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_goals_updated_at BEFORE UPDATE ON goals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Migration: Update existing deals table to support timezone-aware dates
-- This migration should be run if the table already exists with DATE fields

-- Step 1: Add user_timezone column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'deals' AND column_name = 'user_timezone') THEN
        ALTER TABLE deals ADD COLUMN user_timezone TEXT DEFAULT 'UTC';
    END IF;
END $$;

-- Step 2: Convert existing DATE fields to TIMESTAMP WITH TIME ZONE
-- This preserves the date while adding timezone information
DO $$ 
BEGIN
    -- Check if expected_close_date is still DATE type
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'deals' 
               AND column_name = 'expected_close_date' 
               AND data_type = 'date') THEN
        
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
        
        -- Convert actual_close_date from DATE to TIMESTAMP WITH TIME ZONE
        ALTER TABLE deals 
        ALTER COLUMN actual_close_date TYPE TIMESTAMP WITH TIME ZONE 
        USING actual_close_date::timestamp with time zone;
    END IF;
END $$;

-- Step 3: Create function to convert dates to user's timezone for display
CREATE OR REPLACE FUNCTION convert_deal_date_to_user_timezone(
    deal_date TIMESTAMP WITH TIME ZONE,
    user_timezone TEXT DEFAULT 'UTC'
) RETURNS TIMESTAMP WITH TIME ZONE AS $$
BEGIN
    -- If the date is already in the user's timezone, return as-is
    -- Otherwise, convert from UTC to user's timezone
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

-- Insert sample data for testing
INSERT INTO users (id, email, full_name, primary_niche, niches, onboarding_completed, subscription_status, subscription_tier) VALUES
('demo_user_001', 'demo@tango.com', 'Demo User', 'content-creator', '{"content-creator"}', true, 'active', 'core')
ON CONFLICT (id) DO NOTHING;

-- Insert sample clients
INSERT INTO clients (user_id, name, email, company, status) VALUES
('demo_user_001', 'Acme Corp', 'contact@acme.com', 'Acme Corporation', 'active'),
('demo_user_001', 'Tech Startup', 'hello@techstartup.com', 'Tech Startup Inc', 'active')
ON CONFLICT DO NOTHING;

-- Insert sample deals
INSERT INTO deals (user_id, client_id, title, value, status, stage, niche, probability) VALUES
('demo_user_001', (SELECT id FROM clients WHERE email = 'contact@acme.com' LIMIT 1), 'Brand Partnership Deal', 5000.00, 'negotiation', 'negotiation', 'content-creator', 75),
('demo_user_001', (SELECT id FROM clients WHERE email = 'hello@techstartup.com' LIMIT 1), 'Sponsored Content', 2500.00, 'proposal', 'proposal', 'content-creator', 60)
ON CONFLICT DO NOTHING;

-- Insert sample content
INSERT INTO content (user_id, title, type, status, stage, niche, platform) VALUES
('demo_user_001', 'Q1 Brand Campaign', 'video', 'scheduled', 'production', 'content-creator', 'YouTube'),
('demo_user_001', 'Product Review', 'post', 'draft', 'idea', 'content-creator', 'Instagram')
ON CONFLICT DO NOTHING;

-- Insert sample goals
INSERT INTO goals (user_id, title, target_value, current_value, unit, category, niche, status) VALUES
('demo_user_001', 'Monthly Revenue Goal', 10000.00, 7500.00, 'USD', 'revenue', 'content-creator', 'active'),
('demo_user_001', 'New Clients This Month', 5, 3, 'clients', 'growth', 'content-creator', 'active')
ON CONFLICT DO NOTHING;
