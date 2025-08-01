-- Simple Database Fix for Tango CRM
-- This script adds only the essential missing columns

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ========================================
-- FIX CONTENT_ITEMS TABLE - Add content_type column
-- ========================================
DO $$ 
BEGIN
    -- Add content_type column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'content_items' AND column_name = 'content_type') THEN
        ALTER TABLE content_items ADD COLUMN content_type TEXT NOT NULL DEFAULT 'post';
        RAISE NOTICE 'Added content_type column to content_items table';
    ELSE
        RAISE NOTICE 'content_type column already exists in content_items table';
    END IF;
    
    -- Add niche column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'content_items' AND column_name = 'niche') THEN
        ALTER TABLE content_items ADD COLUMN niche TEXT DEFAULT 'creator';
        RAISE NOTICE 'Added niche column to content_items table';
    END IF;
    
    -- Add creation_date column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'content_items' AND column_name = 'creation_date') THEN
        ALTER TABLE content_items ADD COLUMN creation_date TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        RAISE NOTICE 'Added creation_date column to content_items table';
    END IF;
    
    -- Add hashtags column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'content_items' AND column_name = 'hashtags') THEN
        ALTER TABLE content_items ADD COLUMN hashtags TEXT[] DEFAULT '{}';
        RAISE NOTICE 'Added hashtags column to content_items table';
    END IF;
    
    -- Add views column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'content_items' AND column_name = 'views') THEN
        ALTER TABLE content_items ADD COLUMN views INTEGER DEFAULT 0;
        RAISE NOTICE 'Added views column to content_items table';
    END IF;
    
    -- Add likes column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'content_items' AND column_name = 'likes') THEN
        ALTER TABLE content_items ADD COLUMN likes INTEGER DEFAULT 0;
        RAISE NOTICE 'Added likes column to content_items table';
    END IF;
    
    -- Add comments column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'content_items' AND column_name = 'comments') THEN
        ALTER TABLE content_items ADD COLUMN comments INTEGER DEFAULT 0;
        RAISE NOTICE 'Added comments column to content_items table';
    END IF;
    
    -- Add shares column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'content_items' AND column_name = 'shares') THEN
        ALTER TABLE content_items ADD COLUMN shares INTEGER DEFAULT 0;
        RAISE NOTICE 'Added shares column to content_items table';
    END IF;
    
    -- Add saves column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'content_items' AND column_name = 'saves') THEN
        ALTER TABLE content_items ADD COLUMN saves INTEGER DEFAULT 0;
        RAISE NOTICE 'Added saves column to content_items table';
    END IF;
    
    -- Add revenue column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'content_items' AND column_name = 'revenue') THEN
        ALTER TABLE content_items ADD COLUMN revenue DECIMAL(10,2) DEFAULT 0;
        RAISE NOTICE 'Added revenue column to content_items table';
    END IF;
    
    -- Add deliverables column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'content_items' AND column_name = 'deliverables') THEN
        ALTER TABLE content_items ADD COLUMN deliverables TEXT[] DEFAULT '{}';
        RAISE NOTICE 'Added deliverables column to content_items table';
    END IF;
END $$;

-- ========================================
-- FIX OPPORTUNITIES TABLE - Add missing columns
-- ========================================
DO $$ 
BEGIN
    -- Add user_timezone column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'opportunities' AND column_name = 'user_timezone') THEN
        ALTER TABLE opportunities ADD COLUMN user_timezone TEXT NOT NULL DEFAULT 'UTC';
        RAISE NOTICE 'Added user_timezone column to opportunities table';
    END IF;
    
    -- Add custom_fields column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'opportunities' AND column_name = 'custom_fields') THEN
        ALTER TABLE opportunities ADD COLUMN custom_fields JSONB DEFAULT '{}';
        RAISE NOTICE 'Added custom_fields column to opportunities table';
    END IF;
END $$;

-- ========================================
-- FIX CALENDAR_EVENTS TABLE - Add missing columns
-- ========================================
DO $$ 
BEGIN
    -- Add event_type column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'calendar_events' AND column_name = 'event_type') THEN
        ALTER TABLE calendar_events ADD COLUMN event_type TEXT DEFAULT 'meeting';
        RAISE NOTICE 'Added event_type column to calendar_events table';
    END IF;
    
    -- Add user_timezone column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'calendar_events' AND column_name = 'user_timezone') THEN
        ALTER TABLE calendar_events ADD COLUMN user_timezone TEXT NOT NULL DEFAULT 'UTC';
        RAISE NOTICE 'Added user_timezone column to calendar_events table';
    END IF;
    
    -- Add all_day column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'calendar_events' AND column_name = 'all_day') THEN
        ALTER TABLE calendar_events ADD COLUMN all_day BOOLEAN DEFAULT FALSE;
        RAISE NOTICE 'Added all_day column to calendar_events table';
    END IF;
    
    -- Add location column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'calendar_events' AND column_name = 'location') THEN
        ALTER TABLE calendar_events ADD COLUMN location TEXT;
        RAISE NOTICE 'Added location column to calendar_events table';
    END IF;
    
    -- Add status column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'calendar_events' AND column_name = 'status') THEN
        ALTER TABLE calendar_events ADD COLUMN status TEXT DEFAULT 'scheduled';
        RAISE NOTICE 'Added status column to calendar_events table';
    END IF;
END $$;

-- ========================================
-- CREATE INDEXES FOR PERFORMANCE
-- ========================================

-- Content items indexes
CREATE INDEX IF NOT EXISTS idx_content_items_content_type ON content_items(content_type);
CREATE INDEX IF NOT EXISTS idx_content_items_niche ON content_items(niche);

-- Opportunities indexes
CREATE INDEX IF NOT EXISTS idx_opportunities_user_timezone ON opportunities(user_timezone);

-- Calendar events indexes
CREATE INDEX IF NOT EXISTS idx_calendar_events_user_timezone ON calendar_events(user_timezone);
CREATE INDEX IF NOT EXISTS idx_calendar_events_event_type ON calendar_events(event_type);

RAISE NOTICE 'Simple database fix completed successfully!'; 