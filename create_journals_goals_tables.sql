-- =====================================================
-- JOURNALS AND GOALS TABLES SETUP FOR SUPABASE
-- =====================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- JOURNAL ENTRIES TABLE
-- =====================================================

-- Create journal_entries table
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

-- Create indexes for journal_entries
CREATE INDEX IF NOT EXISTS idx_journal_entries_user_id ON journal_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_journal_entries_created_at ON journal_entries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_journal_entries_mood ON journal_entries(mood);
CREATE INDEX IF NOT EXISTS idx_journal_entries_tags ON journal_entries USING GIN(tags);

-- =====================================================
-- GOALS TABLE
-- =====================================================

-- Create goals table
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

-- Create indexes for goals
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

-- Create or replace the update_updated_at_column function
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

-- Create triggers for journal_entries
DROP TRIGGER IF EXISTS update_journal_entries_updated_at ON journal_entries;
CREATE TRIGGER update_journal_entries_updated_at 
    BEFORE UPDATE ON journal_entries 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Create triggers for goals
DROP TRIGGER IF EXISTS update_goals_updated_at ON goals;
CREATE TRIGGER update_goals_updated_at 
    BEFORE UPDATE ON goals 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on journal_entries
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;

-- Enable RLS on goals
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- RLS POLICIES FOR JOURNAL ENTRIES
-- =====================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own journal entries" ON journal_entries;
DROP POLICY IF EXISTS "Users can insert own journal entries" ON journal_entries;
DROP POLICY IF EXISTS "Users can update own journal entries" ON journal_entries;
DROP POLICY IF EXISTS "Users can delete own journal entries" ON journal_entries;

-- Create RLS policies for journal_entries
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

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own goals" ON goals;
DROP POLICY IF EXISTS "Users can insert own goals" ON goals;
DROP POLICY IF EXISTS "Users can update own goals" ON goals;
DROP POLICY IF EXISTS "Users can delete own goals" ON goals;

-- Create RLS policies for goals
CREATE POLICY "Users can view own goals" ON goals
    FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert own goals" ON goals
    FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update own goals" ON goals
    FOR UPDATE USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete own goals" ON goals
    FOR DELETE USING (auth.uid()::text = user_id);

-- =====================================================
-- SAMPLE DATA (OPTIONAL)
-- =====================================================

-- Insert sample journal entries (uncomment if you want sample data)
/*
INSERT INTO journal_entries (user_id, title, content, mood, tags) VALUES
('demo_user_001', 'First Day of Building', 'Today I started building my creator business. Feeling excited about the journey ahead!', 'excited', ARRAY['business', 'motivation']),
('demo_user_001', 'Content Creation Breakthrough', 'Finally figured out my content strategy. This feels like a major breakthrough.', 'happy', ARRAY['content', 'strategy']),
('demo_user_001', 'Challenging Day', 'Had some technical difficulties today, but managed to work through them. Learning to be more patient.', 'frustrated', ARRAY['learning', 'patience']);
*/

-- Insert sample goals (uncomment if you want sample data)
/*
INSERT INTO goals (user_id, title, description, target_value, current_value, unit, deadline, status, category, niche, tags) VALUES
('demo_user_001', 'Monthly Revenue Goal', 'Achieve consistent monthly revenue', 10000.00, 7500.00, 'USD', '2024-12-31', 'active', 'revenue', 'creator', ARRAY['business', 'revenue']),
('demo_user_001', 'Client Acquisition', 'Get 5 new clients this quarter', 5, 2, 'clients', '2024-12-31', 'active', 'clients', 'creator', ARRAY['clients', 'growth']),
('demo_user_001', 'Content Creation', 'Publish 20 videos this month', 20, 8, 'videos', '2024-12-31', 'active', 'content', 'creator', ARRAY['content', 'videos']);
*/

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Verify tables were created
SELECT 
    table_name, 
    table_type 
FROM information_schema.tables 
WHERE table_name IN ('journal_entries', 'goals')
ORDER BY table_name;

-- Verify indexes were created
SELECT 
    indexname, 
    tablename 
FROM pg_indexes 
WHERE tablename IN ('journal_entries', 'goals')
ORDER BY tablename, indexname;

-- Verify RLS is enabled
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename IN ('journal_entries', 'goals')
ORDER BY tablename;

-- Verify policies were created
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename IN ('journal_entries', 'goals')
ORDER BY tablename, policyname;

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '✅ Journals and Goals tables setup completed successfully!';
    RAISE NOTICE '📊 Tables created: journal_entries, goals';
    RAISE NOTICE '🔒 RLS enabled with user-specific policies';
    RAISE NOTICE '📈 Indexes created for optimal performance';
    RAISE NOTICE '🔄 Triggers set up for automatic updated_at timestamps';
END $$;
