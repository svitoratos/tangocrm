-- =====================================================
-- SUPABASE JOURNALS AND GOALS SETUP
-- Run this in your Supabase SQL Editor
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- JOURNAL ENTRIES TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS journal_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    mood TEXT,
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for journal_entries
CREATE INDEX IF NOT EXISTS idx_journal_entries_user_id ON journal_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_journal_entries_created_at ON journal_entries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_journal_entries_mood ON journal_entries(mood);
CREATE INDEX IF NOT EXISTS idx_journal_entries_tags ON journal_entries USING GIN(tags);

-- =====================================================
-- GOALS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS goals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT NOT NULL,
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

-- Indexes for goals
CREATE INDEX IF NOT EXISTS idx_goals_user_id ON goals(user_id);
CREATE INDEX IF NOT EXISTS idx_goals_status ON goals(status);
CREATE INDEX IF NOT EXISTS idx_goals_category ON goals(category);
CREATE INDEX IF NOT EXISTS idx_goals_niche ON goals(niche);
CREATE INDEX IF NOT EXISTS idx_goals_deadline ON goals(deadline);
CREATE INDEX IF NOT EXISTS idx_goals_created_at ON goals(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_goals_tags ON goals USING GIN(tags);

-- =====================================================
-- UPDATED_AT TRIGGER FUNCTION
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- =====================================================
-- TRIGGERS
-- =====================================================

DROP TRIGGER IF EXISTS update_journal_entries_updated_at ON journal_entries;
CREATE TRIGGER update_journal_entries_updated_at 
    BEFORE UPDATE ON journal_entries 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_goals_updated_at ON goals;
CREATE TRIGGER update_goals_updated_at 
    BEFORE UPDATE ON goals 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- RLS POLICIES FOR JOURNAL ENTRIES
-- =====================================================

DROP POLICY IF EXISTS "Users can view own journal entries" ON journal_entries;
DROP POLICY IF EXISTS "Users can insert own journal entries" ON journal_entries;
DROP POLICY IF EXISTS "Users can update own journal entries" ON journal_entries;
DROP POLICY IF EXISTS "Users can delete own journal entries" ON journal_entries;

CREATE POLICY "Users can view own journal entries" ON journal_entries
    FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert own journal entries" ON journal_entries
    FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update own journal entries" ON journal_entries
    FOR UPDATE USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete own journal entries" ON journal_entries
    FOR DELETE USING (auth.uid()::text = user_id);

-- =====================================================
-- RLS POLICIES FOR GOALS
-- =====================================================

DROP POLICY IF EXISTS "Users can view own goals" ON goals;
DROP POLICY IF EXISTS "Users can insert own goals" ON goals;
DROP POLICY IF EXISTS "Users can update own goals" ON goals;
DROP POLICY IF EXISTS "Users can delete own goals" ON goals;

CREATE POLICY "Users can view own goals" ON goals
    FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert own goals" ON goals
    FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update own goals" ON goals
    FOR UPDATE USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete own goals" ON goals
    FOR DELETE USING (auth.uid()::text = user_id);
