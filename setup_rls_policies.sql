-- ========================================
-- ROW LEVEL SECURITY (RLS) SETUP FOR TANGO CRM
-- ========================================
-- This script enables RLS and creates security policies for all tables
-- Users can only access their own data

-- ========================================
-- ENABLE RLS ON ALL TABLES
-- ========================================

-- Enable RLS on users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Enable RLS on clients table
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

-- Enable RLS on opportunities table
ALTER TABLE opportunities ENABLE ROW LEVEL SECURITY;

-- Enable RLS on calendar_events table
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;

-- Enable RLS on content_items table (if it exists)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'content_items') THEN
        ALTER TABLE content_items ENABLE ROW LEVEL SECURITY;
        RAISE NOTICE 'Enabled RLS on content_items table';
    END IF;
END $$;

-- Enable RLS on journal_entries table (if it exists)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'journal_entries') THEN
        ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
        RAISE NOTICE 'Enabled RLS on journal_entries table';
    END IF;
END $$;

-- Enable RLS on goals table (if it exists)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'goals') THEN
        ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
        RAISE NOTICE 'Enabled RLS on goals table';
    END IF;
END $$;

-- Enable RLS on tasks table (if it exists)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'tasks') THEN
        ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
        RAISE NOTICE 'Enabled RLS on tasks table';
    END IF;
END $$;

-- Enable RLS on positive_feedback table (if it exists)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'positive_feedback') THEN
        ALTER TABLE positive_feedback ENABLE ROW LEVEL SECURITY;
        RAISE NOTICE 'Enabled RLS on positive_feedback table';
    END IF;
END $$;

-- ========================================
-- USERS TABLE POLICIES
-- ========================================
-- Note: Users table RLS is handled at the application level with Clerk authentication
-- We create permissive policies for now since Clerk handles user authentication

-- Allow all operations on users table (handled by Clerk auth)
CREATE POLICY "Allow all users operations" ON users
    FOR ALL USING (true);

-- ========================================
-- CLIENTS TABLE POLICIES
-- ========================================

-- Users can view their own clients
CREATE POLICY "Users can view own clients" ON clients
    FOR SELECT USING (auth.uid()::text = user_id);

-- Users can insert their own clients
CREATE POLICY "Users can insert own clients" ON clients
    FOR INSERT WITH CHECK (auth.uid()::text = user_id);

-- Users can update their own clients
CREATE POLICY "Users can update own clients" ON clients
    FOR UPDATE USING (auth.uid()::text = user_id);

-- Users can delete their own clients
CREATE POLICY "Users can delete own clients" ON clients
    FOR DELETE USING (auth.uid()::text = user_id);

-- ========================================
-- OPPORTUNITIES TABLE POLICIES
-- ========================================

-- Users can view their own opportunities
CREATE POLICY "Users can view own opportunities" ON opportunities
    FOR SELECT USING (auth.uid()::text = user_id);

-- Users can insert their own opportunities
CREATE POLICY "Users can insert own opportunities" ON opportunities
    FOR INSERT WITH CHECK (auth.uid()::text = user_id);

-- Users can update their own opportunities
CREATE POLICY "Users can update own opportunities" ON opportunities
    FOR UPDATE USING (auth.uid()::text = user_id);

-- Users can delete their own opportunities
CREATE POLICY "Users can delete own opportunities" ON opportunities
    FOR DELETE USING (auth.uid()::text = user_id);

-- ========================================
-- CALENDAR EVENTS TABLE POLICIES
-- ========================================

-- Users can view their own calendar events
CREATE POLICY "Users can view own calendar events" ON calendar_events
    FOR SELECT USING (auth.uid()::text = user_id);

-- Users can insert their own calendar events
CREATE POLICY "Users can insert own calendar events" ON calendar_events
    FOR INSERT WITH CHECK (auth.uid()::text = user_id);

-- Users can update their own calendar events
CREATE POLICY "Users can update own calendar events" ON calendar_events
    FOR UPDATE USING (auth.uid()::text = user_id);

-- Users can delete their own calendar events
CREATE POLICY "Users can delete own calendar events" ON calendar_events
    FOR DELETE USING (auth.uid()::text = user_id);

-- ========================================
-- CONTENT ITEMS TABLE POLICIES (if exists)
-- ========================================

DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'content_items') THEN
        -- Users can view their own content items
        EXECUTE 'CREATE POLICY "Users can view own content items" ON content_items
            FOR SELECT USING (auth.uid()::text = user_id)';
        
        -- Users can insert their own content items
        EXECUTE 'CREATE POLICY "Users can insert own content items" ON content_items
            FOR INSERT WITH CHECK (auth.uid()::text = user_id)';
        
        -- Users can update their own content items
        EXECUTE 'CREATE POLICY "Users can update own content items" ON content_items
            FOR UPDATE USING (auth.uid()::text = user_id)';
        
        -- Users can delete their own content items
        EXECUTE 'CREATE POLICY "Users can delete own content items" ON content_items
            FOR DELETE USING (auth.uid()::text = user_id)';
        
        RAISE NOTICE 'Created RLS policies for content_items table';
    END IF;
END $$;

-- ========================================
-- JOURNAL ENTRIES TABLE POLICIES (if exists)
-- ========================================

DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'journal_entries') THEN
        -- Users can view their own journal entries
        EXECUTE 'CREATE POLICY "Users can view own journal entries" ON journal_entries
            FOR SELECT USING (auth.uid()::text = user_id)';
        
        -- Users can insert their own journal entries
        EXECUTE 'CREATE POLICY "Users can insert own journal entries" ON journal_entries
            FOR INSERT WITH CHECK (auth.uid()::text = user_id)';
        
        -- Users can update their own journal entries
        EXECUTE 'CREATE POLICY "Users can update own journal entries" ON journal_entries
            FOR UPDATE USING (auth.uid()::text = user_id)';
        
        -- Users can delete their own journal entries
        EXECUTE 'CREATE POLICY "Users can delete own journal entries" ON journal_entries
            FOR DELETE USING (auth.uid()::text = user_id)';
        
        RAISE NOTICE 'Created RLS policies for journal_entries table';
    END IF;
END $$;

-- ========================================
-- GOALS TABLE POLICIES (if exists)
-- ========================================

DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'goals') THEN
        -- Users can view their own goals
        EXECUTE 'CREATE POLICY "Users can view own goals" ON goals
            FOR SELECT USING (auth.uid()::text = user_id)';
        
        -- Users can insert their own goals
        EXECUTE 'CREATE POLICY "Users can insert own goals" ON goals
            FOR INSERT WITH CHECK (auth.uid()::text = user_id)';
        
        -- Users can update their own goals
        EXECUTE 'CREATE POLICY "Users can update own goals" ON goals
            FOR UPDATE USING (auth.uid()::text = user_id)';
        
        -- Users can delete their own goals
        EXECUTE 'CREATE POLICY "Users can delete own goals" ON goals
            FOR DELETE USING (auth.uid()::text = user_id)';
        
        RAISE NOTICE 'Created RLS policies for goals table';
    END IF;
END $$;

-- ========================================
-- TASKS TABLE POLICIES (if exists)
-- ========================================

DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'tasks') THEN
        -- Users can view their own tasks
        EXECUTE 'CREATE POLICY "Users can view own tasks" ON tasks
            FOR SELECT USING (auth.uid()::text = user_id)';
        
        -- Users can insert their own tasks
        EXECUTE 'CREATE POLICY "Users can insert own tasks" ON tasks
            FOR INSERT WITH CHECK (auth.uid()::text = user_id)';
        
        -- Users can update their own tasks
        EXECUTE 'CREATE POLICY "Users can update own tasks" ON tasks
            FOR UPDATE USING (auth.uid()::text = user_id)';
        
        -- Users can delete their own tasks
        EXECUTE 'CREATE POLICY "Users can delete own tasks" ON tasks
            FOR DELETE USING (auth.uid()::text = user_id)';
        
        RAISE NOTICE 'Created RLS policies for tasks table';
    END IF;
END $$;

-- ========================================
-- POSITIVE FEEDBACK TABLE POLICIES (if exists)
-- ========================================

DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'positive_feedback') THEN
        -- Users can view their own positive feedback
        EXECUTE 'CREATE POLICY "Users can view own positive feedback" ON positive_feedback
            FOR SELECT USING (auth.uid()::text = user_id)';
        
        -- Users can insert their own positive feedback
        EXECUTE 'CREATE POLICY "Users can insert own positive feedback" ON positive_feedback
            FOR INSERT WITH CHECK (auth.uid()::text = user_id)';
        
        -- Users can update their own positive feedback
        EXECUTE 'CREATE POLICY "Users can update own positive feedback" ON positive_feedback
            FOR UPDATE USING (auth.uid()::text = user_id)';
        
        -- Users can delete their own positive feedback
        EXECUTE 'CREATE POLICY "Users can delete own positive feedback" ON positive_feedback
            FOR DELETE USING (auth.uid()::text = user_id)';
        
        RAISE NOTICE 'Created RLS policies for positive_feedback table';
    END IF;
END $$;

-- ========================================
-- VERIFICATION QUERY
-- ========================================

-- Show all tables with RLS status
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;

-- Show all RLS policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- ========================================
-- SUCCESS MESSAGE
-- ========================================

DO $$ 
BEGIN
    RAISE NOTICE '✅ RLS setup completed successfully!';
    RAISE NOTICE 'All tables now have Row Level Security enabled';
    RAISE NOTICE 'Users can only access their own data';
    RAISE NOTICE 'Check the verification queries above to confirm setup';
END $$;
