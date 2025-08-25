-- =====================================================
-- VERIFICATION SCRIPT FOR JOURNALS AND GOALS SETUP
-- Run this after running the setup script to verify everything is working
-- =====================================================

-- Check if tables exist
SELECT 
    'Tables Check' as check_type,
    table_name,
    CASE 
        WHEN table_name IS NOT NULL THEN '✅ EXISTS'
        ELSE '❌ MISSING'
    END as status
FROM information_schema.tables 
WHERE table_name IN ('journal_entries', 'goals')
ORDER BY table_name;

-- Check table structure for journal_entries
SELECT 
    'Journal Entries Structure' as check_type,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'journal_entries'
ORDER BY ordinal_position;

-- Check table structure for goals
SELECT 
    'Goals Structure' as check_type,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'goals'
ORDER BY ordinal_position;

-- Check if indexes exist
SELECT 
    'Indexes Check' as check_type,
    indexname,
    tablename,
    CASE 
        WHEN indexname IS NOT NULL THEN '✅ EXISTS'
        ELSE '❌ MISSING'
    END as status
FROM pg_indexes 
WHERE tablename IN ('journal_entries', 'goals')
ORDER BY tablename, indexname;

-- Check if RLS is enabled
SELECT 
    'RLS Check' as check_type,
    tablename,
    CASE 
        WHEN rowsecurity = true THEN '✅ ENABLED'
        ELSE '❌ DISABLED'
    END as rls_status
FROM pg_tables 
WHERE tablename IN ('journal_entries', 'goals')
ORDER BY tablename;

-- Check if policies exist
SELECT 
    'Policies Check' as check_type,
    tablename,
    policyname,
    cmd,
    CASE 
        WHEN policyname IS NOT NULL THEN '✅ EXISTS'
        ELSE '❌ MISSING'
    END as status
FROM pg_policies 
WHERE tablename IN ('journal_entries', 'goals')
ORDER BY tablename, policyname;

-- Check if triggers exist
SELECT 
    'Triggers Check' as check_type,
    trigger_name,
    event_object_table,
    action_timing,
    event_manipulation,
    CASE 
        WHEN trigger_name IS NOT NULL THEN '✅ EXISTS'
        ELSE '❌ MISSING'
    END as status
FROM information_schema.triggers 
WHERE event_object_table IN ('journal_entries', 'goals')
ORDER BY event_object_table, trigger_name;

-- Summary
SELECT 
    'SUMMARY' as check_type,
    'Total Tables' as item,
    COUNT(*)::text as count
FROM information_schema.tables 
WHERE table_name IN ('journal_entries', 'goals')

UNION ALL

SELECT 
    'SUMMARY' as check_type,
    'Total Indexes' as item,
    COUNT(*)::text as count
FROM pg_indexes 
WHERE tablename IN ('journal_entries', 'goals')

UNION ALL

SELECT 
    'SUMMARY' as check_type,
    'Total Policies' as item,
    COUNT(*)::text as count
FROM pg_policies 
WHERE tablename IN ('journal_entries', 'goals')

UNION ALL

SELECT 
    'SUMMARY' as check_type,
    'Total Triggers' as item,
    COUNT(*)::text as count
FROM information_schema.triggers 
WHERE event_object_table IN ('journal_entries', 'goals');
