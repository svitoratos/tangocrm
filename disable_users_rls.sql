-- ========================================
-- TEMPORARY FIX: Disable RLS on users table
-- ========================================
-- This script temporarily disables RLS on the users table
-- to allow user profile creation during development

-- Disable RLS on users table
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow all users operations" ON users;
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;

-- Show confirmation
SELECT 'RLS disabled on users table' as status;
