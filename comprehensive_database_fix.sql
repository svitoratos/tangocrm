-- Comprehensive Database Fix for Tango CRM
-- This script fixes all database issues for the entire application

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
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'primary_niche') THEN
            ALTER TABLE users ADD COLUMN primary_niche TEXT DEFAULT 'creator';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'niches') THEN
            ALTER TABLE users ADD COLUMN niches TEXT[] DEFAULT '{}';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'onboarding_completed') THEN
            ALTER TABLE users ADD COLUMN onboarding_completed BOOLEAN DEFAULT FALSE;
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
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'stripe_subscription_id') THEN
            ALTER TABLE users ADD COLUMN stripe_subscription_id TEXT;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'email_notifications_enabled') THEN
            ALTER TABLE users ADD COLUMN email_notifications_enabled BOOLEAN DEFAULT TRUE;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'notification_preferences') THEN
            ALTER TABLE users ADD COLUMN notification_preferences JSONB DEFAULT '{"email": true}'::jsonb;
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
            primary_niche TEXT DEFAULT 'creator',
            niches TEXT[] DEFAULT '{}',
            onboarding_completed BOOLEAN DEFAULT FALSE,
            subscription_status TEXT DEFAULT 'free',
            subscription_tier TEXT DEFAULT 'basic',
            stripe_customer_id TEXT,
            stripe_subscription_id TEXT,
            email_notifications_enabled BOOLEAN DEFAULT TRUE,
            notification_preferences JSONB DEFAULT '{"email": true}'::jsonb,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        RAISE NOTICE 'Created new users table';
    END IF;
END $$;

-- ========================================
-- FIX CONTENT_ITEMS TABLE
-- ========================================
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'content_items') THEN
        -- Add missing content_type column if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'content_items' AND column_name = 'content_type') THEN
            ALTER TABLE content_items ADD COLUMN content_type TEXT NOT NULL DEFAULT 'post';
            RAISE NOTICE 'Added content_type column to content_items table';
        END IF;
        
        -- Add other missing columns
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'content_items' AND column_name = 'niche') THEN
            ALTER TABLE content_items ADD COLUMN niche TEXT DEFAULT 'creator';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'content_items' AND column_name = 'creation_date') THEN
            ALTER TABLE content_items ADD COLUMN creation_date TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'content_items' AND column_name = 'hashtags') THEN
            ALTER TABLE content_items ADD COLUMN hashtags TEXT[] DEFAULT '{}';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'content_items' AND column_name = 'views') THEN
            ALTER TABLE content_items ADD COLUMN views INTEGER DEFAULT 0;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'content_items' AND column_name = 'likes') THEN
            ALTER TABLE content_items ADD COLUMN likes INTEGER DEFAULT 0;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'content_items' AND column_name = 'comments') THEN
            ALTER TABLE content_items ADD COLUMN comments INTEGER DEFAULT 0;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'content_items' AND column_name = 'shares') THEN
            ALTER TABLE content_items ADD COLUMN shares INTEGER DEFAULT 0;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'content_items' AND column_name = 'saves') THEN
            ALTER TABLE content_items ADD COLUMN saves INTEGER DEFAULT 0;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'content_items' AND column_name = 'revenue') THEN
            ALTER TABLE content_items ADD COLUMN revenue DECIMAL(10,2) DEFAULT 0;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'content_items' AND column_name = 'deliverables') THEN
            ALTER TABLE content_items ADD COLUMN deliverables TEXT[] DEFAULT '{}';
        END IF;
        
        RAISE NOTICE 'Updated content_items table with missing columns';
    ELSE
        -- Create content_items table if it doesn't exist
        CREATE TABLE content_items (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            title TEXT NOT NULL,
            description TEXT,
            content_type TEXT NOT NULL DEFAULT 'post',
            status TEXT DEFAULT 'draft',
            stage TEXT DEFAULT 'planning',
            niche TEXT DEFAULT 'creator',
            type TEXT,
            platform TEXT,
            brand TEXT,
            creation_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            post_date TIMESTAMP WITH TIME ZONE,
            hashtags TEXT[] DEFAULT '{}',
            hook TEXT,
            notes TEXT,
            views INTEGER DEFAULT 0,
            likes INTEGER DEFAULT 0,
            comments INTEGER DEFAULT 0,
            shares INTEGER DEFAULT 0,
            saves INTEGER DEFAULT 0,
            engagement_rate DECIMAL(5,2),
            revenue DECIMAL(10,2) DEFAULT 0,
            program_type TEXT,
            custom_program_type TEXT,
            length INTEGER,
            price DECIMAL(10,2),
            enrolled INTEGER DEFAULT 0,
            milestones INTEGER DEFAULT 0,
            start_date TIMESTAMP WITH TIME ZONE,
            end_date TIMESTAMP WITH TIME ZONE,
            enrollment_deadline TIMESTAMP WITH TIME ZONE,
            client_progress TEXT,
            hosting_platform TEXT,
            guest TEXT,
            sponsor TEXT,
            duration TEXT,
            custom_duration TEXT,
            topics TEXT,
            script TEXT,
            client TEXT,
            deadline TIMESTAMP WITH TIME ZONE,
            budget DECIMAL(10,2),
            deliverables TEXT[] DEFAULT '{}',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        RAISE NOTICE 'Created new content_items table';
    END IF;
END $$;

-- ========================================
-- FIX OPPORTUNITIES TABLE
-- ========================================
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'opportunities') THEN
        -- Add missing columns
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'opportunities' AND column_name = 'user_timezone') THEN
            ALTER TABLE opportunities ADD COLUMN user_timezone TEXT NOT NULL DEFAULT 'UTC';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'opportunities' AND column_name = 'custom_fields') THEN
            ALTER TABLE opportunities ADD COLUMN custom_fields JSONB DEFAULT '{}';
        END IF;
        
        RAISE NOTICE 'Updated opportunities table with missing columns';
    ELSE
        -- Create opportunities table if it doesn't exist
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
-- FIX CALENDAR_EVENTS TABLE
-- ========================================
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'calendar_events') THEN
        -- Add missing columns
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'calendar_events' AND column_name = 'user_timezone') THEN
            ALTER TABLE calendar_events ADD COLUMN user_timezone TEXT NOT NULL DEFAULT 'UTC';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'calendar_events' AND column_name = 'all_day') THEN
            ALTER TABLE calendar_events ADD COLUMN all_day BOOLEAN DEFAULT FALSE;
        END IF;
        
        RAISE NOTICE 'Updated calendar_events table with missing columns';
    ELSE
        -- Create calendar_events table if it doesn't exist
        CREATE TABLE calendar_events (
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
        RAISE NOTICE 'Created new calendar_events table';
    END IF;
END $$;

-- ========================================
-- CREATE MISSING TABLES
-- ========================================

-- Create clients table if it doesn't exist
CREATE TABLE IF NOT EXISTS clients (
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

-- Create goals table if it doesn't exist
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

-- Create journal_entries table if it doesn't exist
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
CREATE INDEX IF NOT EXISTS idx_users_primary_niche ON users(primary_niche);
CREATE INDEX IF NOT EXISTS idx_users_timezone ON users(timezone);
CREATE INDEX IF NOT EXISTS idx_users_onboarding_completed ON users(onboarding_completed);
CREATE INDEX IF NOT EXISTS idx_users_subscription_status ON users(subscription_status);

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
CREATE INDEX IF NOT EXISTS idx_content_items_niche ON content_items(niche);

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
-- CREATE TRIGGERS AND FUNCTIONS
-- ========================================

-- Function to update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Function to set user timezone
CREATE OR REPLACE FUNCTION set_user_timezone()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.user_timezone IS NULL THEN
        SELECT timezone INTO NEW.user_timezone 
        FROM users 
        WHERE id = NEW.user_id;
        
        IF NEW.user_timezone IS NULL THEN
            NEW.user_timezone = 'UTC';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_clients_updated_at ON clients;
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_opportunities_updated_at ON opportunities;
CREATE TRIGGER update_opportunities_updated_at BEFORE UPDATE ON opportunities FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_calendar_events_updated_at ON calendar_events;
CREATE TRIGGER update_calendar_events_updated_at BEFORE UPDATE ON calendar_events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_content_items_updated_at ON content_items;
CREATE TRIGGER update_content_items_updated_at BEFORE UPDATE ON content_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_goals_updated_at ON goals;
CREATE TRIGGER update_goals_updated_at BEFORE UPDATE ON goals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_journal_entries_updated_at ON journal_entries;
CREATE TRIGGER update_journal_entries_updated_at BEFORE UPDATE ON journal_entries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Timezone triggers
DROP TRIGGER IF EXISTS trigger_set_opportunity_user_timezone ON opportunities;
CREATE TRIGGER trigger_set_opportunity_user_timezone BEFORE INSERT ON opportunities FOR EACH ROW EXECUTE FUNCTION set_user_timezone();

DROP TRIGGER IF EXISTS trigger_set_calendar_event_user_timezone ON calendar_events;
CREATE TRIGGER trigger_set_calendar_event_user_timezone BEFORE INSERT ON calendar_events FOR EACH ROW EXECUTE FUNCTION set_user_timezone();

-- ========================================
-- SETUP ROW LEVEL SECURITY (RLS)
-- ========================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for users table
DROP POLICY IF EXISTS "Users can view own profile" ON users;
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON users;
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON users;
CREATE POLICY "Users can insert own profile" ON users FOR INSERT WITH CHECK (auth.uid() = id);

-- Create RLS policies for other tables
DROP POLICY IF EXISTS "Users can manage own clients" ON clients;
CREATE POLICY "Users can manage own clients" ON clients FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own opportunities" ON opportunities;
CREATE POLICY "Users can manage own opportunities" ON opportunities FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own calendar events" ON calendar_events;
CREATE POLICY "Users can manage own calendar events" ON calendar_events FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own content items" ON content_items;
CREATE POLICY "Users can manage own content items" ON content_items FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own goals" ON goals;
CREATE POLICY "Users can manage own goals" ON goals FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own journal entries" ON journal_entries;
CREATE POLICY "Users can manage own journal entries" ON journal_entries FOR ALL USING (auth.uid() = user_id);

RAISE NOTICE 'Comprehensive database fix completed successfully!'; 