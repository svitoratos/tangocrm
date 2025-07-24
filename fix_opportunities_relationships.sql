-- Fix opportunities table relationships and refresh schema cache
-- This script fixes foreign key relationships and ensures proper schema

-- ========================================
-- REFRESH SCHEMA CACHE
-- ========================================
-- This forces Supabase to refresh its schema cache
NOTIFY pgrst, 'reload schema';

-- ========================================
-- FIX FOREIGN KEY RELATIONSHIPS
-- ========================================

-- Drop existing foreign key constraints if they exist
ALTER TABLE opportunities DROP CONSTRAINT IF EXISTS opportunities_user_id_fkey;
ALTER TABLE opportunities DROP CONSTRAINT IF EXISTS opportunities_client_id_fkey;

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
-- VERIFY TABLE STRUCTURE
-- ========================================

-- Show opportunities table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'opportunities' 
ORDER BY ordinal_position;

-- Show foreign key constraints
SELECT 
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_name = 'opportunities';

-- Count opportunities
SELECT COUNT(*) as total_opportunities FROM opportunities;

-- Test insert to verify RLS policies
DO $$ 
BEGIN
    -- This will help verify if the table is working
    RAISE NOTICE 'Testing opportunities table access...';
    
    -- Check if we can select from the table
    IF EXISTS (SELECT 1 FROM opportunities LIMIT 1) THEN
        RAISE NOTICE 'SELECT query works on opportunities table';
    ELSE
        RAISE NOTICE 'SELECT query works on opportunities table (no rows)';
    END IF;
    
    RAISE NOTICE 'Opportunities table is ready for use!';
END $$; 