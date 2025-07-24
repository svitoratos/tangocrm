-- Fix existing tables and add missing columns
-- This script safely updates existing tables and creates missing ones

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ========================================
-- FIX USERS TABLE
-- ========================================
DO $$ 
BEGIN
    -- Check if users table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users') THEN
        -- Add missing columns to existing users table
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'niche') THEN
            ALTER TABLE users ADD COLUMN niche TEXT DEFAULT 'creator';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'subscription_status') THEN
            ALTER TABLE users ADD COLUMN subscription_status TEXT DEFAULT 'free';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'subscription_tier') THEN
            ALTER TABLE users ADD COLUMN subscription_tier TEXT DEFAULT 'basic';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'stripe_customer_id') THEN
            ALTER TABLE users ADD COLUMN stripe_customer_id TEXT;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'updated_at') THEN
            ALTER TABLE users ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        END IF;
        
        RAISE NOTICE 'Updated existing users table with missing columns';
    ELSE
        -- Create users table if it doesn't exist
        CREATE TABLE users (
            id TEXT PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
            email TEXT UNIQUE NOT NULL,
            full_name TEXT,
            avatar_url TEXT,
            timezone TEXT DEFAULT 'UTC',
            niche TEXT DEFAULT 'creator',
            subscription_status TEXT DEFAULT 'free',
            subscription_tier TEXT DEFAULT 'basic',
            stripe_customer_id TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        RAISE NOTICE 'Created new users table';
    END IF;
END $$;

-- ========================================
-- FIX CLIENTS TABLE
-- ========================================
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'clients') THEN
        -- Add missing columns to existing clients table
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clients' AND column_name = 'updated_at') THEN
            ALTER TABLE clients ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clients' AND column_name = 'tags') THEN
            ALTER TABLE clients ADD COLUMN tags TEXT[] DEFAULT '{}';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clients' AND column_name = 'status') THEN
            ALTER TABLE clients ADD COLUMN status TEXT DEFAULT 'active';
        END IF;
        
        RAISE NOTICE 'Updated existing clients table with missing columns';
    ELSE
        CREATE TABLE clients (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            name TEXT NOT NULL,
            email TEXT,
            phone TEXT,
            company TEXT,
            website TEXT,
            notes TEXT,
            tags TEXT[] DEFAULT '{}',
            status TEXT DEFAULT 'active',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        RAISE NOTICE 'Created new clients table';
    END IF;
END $$;

-- ========================================
-- FIX OPPORTUNITIES TABLE
-- ========================================
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'opportunities') THEN
        -- Add missing columns to existing opportunities table
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'opportunities' AND column_name = 'type') THEN
            ALTER TABLE opportunities ADD COLUMN type TEXT DEFAULT 'other';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'opportunities' AND column_name = 'niche') THEN
            ALTER TABLE opportunities ADD COLUMN niche TEXT DEFAULT 'creator';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'opportunities' AND column_name = 'source') THEN
            ALTER TABLE opportunities ADD COLUMN source TEXT;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'opportunities' AND column_name = 'user_timezone') THEN
            ALTER TABLE opportunities ADD COLUMN user_timezone TEXT DEFAULT 'UTC';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'opportunities' AND column_name = 'discovery_call_date') THEN
            ALTER TABLE opportunities ADD COLUMN discovery_call_date TIMESTAMP WITH TIME ZONE;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'opportunities' AND column_name = 'scheduled_date') THEN
            ALTER TABLE opportunities ADD COLUMN scheduled_date TIMESTAMP WITH TIME ZONE;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'opportunities' AND column_name = 'custom_fields') THEN
            ALTER TABLE opportunities ADD COLUMN custom_fields JSONB DEFAULT '{}';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'opportunities' AND column_name = 'updated_at') THEN
            ALTER TABLE opportunities ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        END IF;
        
        RAISE NOTICE 'Updated existing opportunities table with missing columns';
    ELSE
        CREATE TABLE opportunities (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
            title TEXT NOT NULL,
            description TEXT,
            value DECIMAL(10,2) DEFAULT 0,
            status TEXT DEFAULT 'prospecting',
            stage TEXT DEFAULT 'prospecting',
            type TEXT DEFAULT 'other',
            niche TEXT NOT NULL DEFAULT 'creator',
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
            custom_fields JSONB DEFAULT '{}',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        RAISE NOTICE 'Created new opportunities table';
    END IF;
END $$;

-- ========================================
-- CREATE OTHER TABLES IF THEY DON'T EXIST
-- ========================================

-- Calendar events table
CREATE TABLE IF NOT EXISTS calendar_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    opportunity_id UUID REFERENCES opportunities(id) ON DELETE SET NULL,
    client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    all_day BOOLEAN DEFAULT FALSE,
    location TEXT,
    event_type TEXT DEFAULT 'meeting',
    status TEXT DEFAULT 'scheduled',
    user_timezone TEXT NOT NULL DEFAULT 'UTC',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Content items table
CREATE TABLE IF NOT EXISTS content_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    content_type TEXT NOT NULL DEFAULT 'post',
    status TEXT DEFAULT 'draft',
    stage TEXT DEFAULT 'planning',
    due_date TIMESTAMP WITH TIME ZONE,
    published_date TIMESTAMP WITH TIME ZONE,
    platform TEXT,
    tags TEXT[] DEFAULT '{}',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Goals table
CREATE TABLE IF NOT EXISTS goals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    goal_type TEXT NOT NULL DEFAULT 'revenue',
    target_value DECIMAL(10,2),
    current_value DECIMAL(10,2) DEFAULT 0,
    start_date DATE,
    end_date DATE,
    status TEXT DEFAULT 'active',
    progress_percentage INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Journal entries table
CREATE TABLE IF NOT EXISTS journal_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT,
    content TEXT NOT NULL,
    mood TEXT,
    tags TEXT[] DEFAULT '{}',
    entry_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- CREATE INDEXES
-- ========================================

-- Users indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_niche ON users(niche);
CREATE INDEX IF NOT EXISTS idx_users_timezone ON users(timezone);

-- Clients indexes
CREATE INDEX IF NOT EXISTS idx_clients_user_id ON clients(user_id);
CREATE INDEX IF NOT EXISTS idx_clients_status ON clients(status);
CREATE INDEX IF NOT EXISTS idx_clients_company ON clients(company);

-- Opportunities indexes
CREATE INDEX IF NOT EXISTS idx_opportunities_user_id ON opportunities(user_id);
CREATE INDEX IF NOT EXISTS idx_opportunities_client_id ON opportunities(client_id);
CREATE INDEX IF NOT EXISTS idx_opportunities_status ON opportunities(status);
CREATE INDEX IF NOT EXISTS idx_opportunities_stage ON opportunities(stage);
CREATE INDEX IF NOT EXISTS idx_opportunities_type ON opportunities(type);
CREATE INDEX IF NOT EXISTS idx_opportunities_niche ON opportunities(niche);
CREATE INDEX IF NOT EXISTS idx_opportunities_user_timezone ON opportunities(user_timezone);
CREATE INDEX IF NOT EXISTS idx_opportunities_expected_close_date ON opportunities(expected_close_date);
CREATE INDEX IF NOT EXISTS idx_opportunities_follow_up_date ON opportunities(follow_up_date);
CREATE INDEX IF NOT EXISTS idx_opportunities_scheduled_date ON opportunities(scheduled_date);

-- Calendar events indexes
CREATE INDEX IF NOT EXISTS idx_calendar_events_user_id ON calendar_events(user_id);
CREATE INDEX IF NOT EXISTS idx_calendar_events_opportunity_id ON calendar_events(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_calendar_events_client_id ON calendar_events(client_id);
CREATE INDEX IF NOT EXISTS idx_calendar_events_start_time ON calendar_events(start_time);
CREATE INDEX IF NOT EXISTS idx_calendar_events_end_time ON calendar_events(end_time);
CREATE INDEX IF NOT EXISTS idx_calendar_events_event_type ON calendar_events(event_type);

-- Content items indexes
CREATE INDEX IF NOT EXISTS idx_content_items_user_id ON content_items(user_id);
CREATE INDEX IF NOT EXISTS idx_content_items_content_type ON content_items(content_type);
CREATE INDEX IF NOT EXISTS idx_content_items_status ON content_items(status);
CREATE INDEX IF NOT EXISTS idx_content_items_stage ON content_items(stage);
CREATE INDEX IF NOT EXISTS idx_content_items_due_date ON content_items(due_date);

-- Goals indexes
CREATE INDEX IF NOT EXISTS idx_goals_user_id ON goals(user_id);
CREATE INDEX IF NOT EXISTS idx_goals_goal_type ON goals(goal_type);
CREATE INDEX IF NOT EXISTS idx_goals_status ON goals(status);
CREATE INDEX IF NOT EXISTS idx_goals_end_date ON goals(end_date);

-- Journal entries indexes
CREATE INDEX IF NOT EXISTS idx_journal_entries_user_id ON journal_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_journal_entries_entry_date ON journal_entries(entry_date);
CREATE INDEX IF NOT EXISTS idx_journal_entries_mood ON journal_entries(mood);

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

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
DROP TRIGGER IF EXISTS update_clients_updated_at ON clients;
DROP TRIGGER IF EXISTS update_opportunities_updated_at ON opportunities;
DROP TRIGGER IF EXISTS update_calendar_events_updated_at ON calendar_events;
DROP TRIGGER IF EXISTS update_content_items_updated_at ON content_items;
DROP TRIGGER IF EXISTS update_goals_updated_at ON goals;
DROP TRIGGER IF EXISTS update_journal_entries_updated_at ON journal_entries;
DROP TRIGGER IF EXISTS trigger_set_opportunity_user_timezone ON opportunities;
DROP TRIGGER IF EXISTS trigger_set_calendar_event_user_timezone ON calendar_events;

-- Create triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_opportunities_updated_at BEFORE UPDATE ON opportunities FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_calendar_events_updated_at BEFORE UPDATE ON calendar_events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_content_items_updated_at BEFORE UPDATE ON content_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_goals_updated_at BEFORE UPDATE ON goals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_journal_entries_updated_at BEFORE UPDATE ON journal_entries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_set_opportunity_user_timezone BEFORE INSERT ON opportunities FOR EACH ROW EXECUTE FUNCTION set_user_timezone();
CREATE TRIGGER trigger_set_calendar_event_user_timezone BEFORE INSERT ON calendar_events FOR EACH ROW EXECUTE FUNCTION set_user_timezone();

-- ========================================
-- SETUP ROW LEVEL SECURITY
-- ========================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;

DROP POLICY IF EXISTS "Users can view own clients" ON clients;
DROP POLICY IF EXISTS "Users can insert own clients" ON clients;
DROP POLICY IF EXISTS "Users can update own clients" ON clients;
DROP POLICY IF EXISTS "Users can delete own clients" ON clients;

DROP POLICY IF EXISTS "Users can view own opportunities" ON opportunities;
DROP POLICY IF EXISTS "Users can insert own opportunities" ON opportunities;
DROP POLICY IF EXISTS "Users can update own opportunities" ON opportunities;
DROP POLICY IF EXISTS "Users can delete own opportunities" ON opportunities;

DROP POLICY IF EXISTS "Users can view own calendar events" ON calendar_events;
DROP POLICY IF EXISTS "Users can insert own calendar events" ON calendar_events;
DROP POLICY IF EXISTS "Users can update own calendar events" ON calendar_events;
DROP POLICY IF EXISTS "Users can delete own calendar events" ON calendar_events;

DROP POLICY IF EXISTS "Users can view own content items" ON content_items;
DROP POLICY IF EXISTS "Users can insert own content items" ON content_items;
DROP POLICY IF EXISTS "Users can update own content items" ON content_items;
DROP POLICY IF EXISTS "Users can delete own content items" ON content_items;

DROP POLICY IF EXISTS "Users can view own goals" ON goals;
DROP POLICY IF EXISTS "Users can insert own goals" ON goals;
DROP POLICY IF EXISTS "Users can update own goals" ON goals;
DROP POLICY IF EXISTS "Users can delete own goals" ON goals;

DROP POLICY IF EXISTS "Users can view own journal entries" ON journal_entries;
DROP POLICY IF EXISTS "Users can insert own journal entries" ON journal_entries;
DROP POLICY IF EXISTS "Users can update own journal entries" ON journal_entries;
DROP POLICY IF EXISTS "Users can delete own journal entries" ON journal_entries;

-- Create policies
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid()::text = id);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid()::text = id);
CREATE POLICY "Users can insert own profile" ON users FOR INSERT WITH CHECK (auth.uid()::text = id);

CREATE POLICY "Users can view own clients" ON clients FOR SELECT USING (auth.uid()::text = user_id);
CREATE POLICY "Users can insert own clients" ON clients FOR INSERT WITH CHECK (auth.uid()::text = user_id);
CREATE POLICY "Users can update own clients" ON clients FOR UPDATE USING (auth.uid()::text = user_id);
CREATE POLICY "Users can delete own clients" ON clients FOR DELETE USING (auth.uid()::text = user_id);

CREATE POLICY "Users can view own opportunities" ON opportunities FOR SELECT USING (auth.uid()::text = user_id);
CREATE POLICY "Users can insert own opportunities" ON opportunities FOR INSERT WITH CHECK (auth.uid()::text = user_id);
CREATE POLICY "Users can update own opportunities" ON opportunities FOR UPDATE USING (auth.uid()::text = user_id);
CREATE POLICY "Users can delete own opportunities" ON opportunities FOR DELETE USING (auth.uid()::text = user_id);

CREATE POLICY "Users can view own calendar events" ON calendar_events FOR SELECT USING (auth.uid()::text = user_id);
CREATE POLICY "Users can insert own calendar events" ON calendar_events FOR INSERT WITH CHECK (auth.uid()::text = user_id);
CREATE POLICY "Users can update own calendar events" ON calendar_events FOR UPDATE USING (auth.uid()::text = user_id);
CREATE POLICY "Users can delete own calendar events" ON calendar_events FOR DELETE USING (auth.uid()::text = user_id);

CREATE POLICY "Users can view own content items" ON content_items FOR SELECT USING (auth.uid()::text = user_id);
CREATE POLICY "Users can insert own content items" ON content_items FOR INSERT WITH CHECK (auth.uid()::text = user_id);
CREATE POLICY "Users can update own content items" ON content_items FOR UPDATE USING (auth.uid()::text = user_id);
CREATE POLICY "Users can delete own content items" ON content_items FOR DELETE USING (auth.uid()::text = user_id);

CREATE POLICY "Users can view own goals" ON goals FOR SELECT USING (auth.uid()::text = user_id);
CREATE POLICY "Users can insert own goals" ON goals FOR INSERT WITH CHECK (auth.uid()::text = user_id);
CREATE POLICY "Users can update own goals" ON goals FOR UPDATE USING (auth.uid()::text = user_id);
CREATE POLICY "Users can delete own goals" ON goals FOR DELETE USING (auth.uid()::text = user_id);

CREATE POLICY "Users can view own journal entries" ON journal_entries FOR SELECT USING (auth.uid()::text = user_id);
CREATE POLICY "Users can insert own journal entries" ON journal_entries FOR INSERT WITH CHECK (auth.uid()::text = user_id);
CREATE POLICY "Users can update own journal entries" ON journal_entries FOR UPDATE USING (auth.uid()::text = user_id);
CREATE POLICY "Users can delete own journal entries" ON journal_entries FOR DELETE USING (auth.uid()::text = user_id);

-- ========================================
-- VERIFICATION
-- ========================================

-- Show all tables
SELECT 
    table_name,
    'Table ready' as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('users', 'clients', 'opportunities', 'calendar_events', 'content_items', 'goals', 'journal_entries')
ORDER BY table_name;

-- Show opportunities table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'opportunities' 
ORDER BY ordinal_position;

-- Count records
SELECT 'users' as table_name, COUNT(*) as record_count FROM users
UNION ALL
SELECT 'clients' as table_name, COUNT(*) as record_count FROM clients
UNION ALL
SELECT 'opportunities' as table_name, COUNT(*) as record_count FROM opportunities
UNION ALL
SELECT 'calendar_events' as table_name, COUNT(*) as record_count FROM calendar_events
UNION ALL
SELECT 'content_items' as table_name, COUNT(*) as record_count FROM content_items
UNION ALL
SELECT 'goals' as table_name, COUNT(*) as record_count FROM goals
UNION ALL
SELECT 'journal_entries' as table_name, COUNT(*) as record_count FROM journal_entries; 