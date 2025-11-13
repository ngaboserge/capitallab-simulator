-- Test Script for CMA Issuer Application System
-- Run this after setting up the database to verify everything works

-- Test 1: Check if all tables exist
SELECT 
    table_name,
    CASE 
        WHEN table_name IN ('companies', 'profiles', 'ipo_applications', 'application_sections', 'team_assignments', 'documents', 'comments', 'notifications') 
        THEN '✅ EXISTS' 
        ELSE '❌ MISSING' 
    END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
    AND table_name IN ('companies', 'profiles', 'ipo_applications', 'application_sections', 'team_assignments', 'documents', 'comments', 'notifications')
ORDER BY table_name;

-- Test 2: Check if RLS is enabled
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
    AND tablename IN ('companies', 'profiles', 'ipo_applications', 'application_sections', 'team_assignments', 'documents', 'comments', 'notifications')
ORDER BY tablename;

-- Test 3: Count policies per table
SELECT 
    schemaname,
    tablename,
    COUNT(*) as policy_count
FROM pg_policies 
WHERE schemaname = 'public'
GROUP BY schemaname, tablename
ORDER BY tablename;

-- Test 4: List all policies
SELECT 
    tablename,
    policyname,
    cmd as command_type,
    CASE 
        WHEN qual IS NOT NULL THEN 'Has USING clause'
        ELSE 'No USING clause'
    END as using_clause,
    CASE 
        WHEN with_check IS NOT NULL THEN 'Has WITH CHECK clause'
        ELSE 'No WITH CHECK clause'
    END as with_check_clause
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Test 5: Check indexes
SELECT 
    indexname,
    tablename,
    indexdef
FROM pg_indexes 
WHERE schemaname = 'public' 
    AND tablename IN ('companies', 'profiles', 'ipo_applications', 'application_sections', 'team_assignments', 'documents', 'comments', 'notifications')
ORDER BY tablename, indexname;

-- Test 6: Check triggers
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_timing,
    action_statement
FROM information_schema.triggers 
WHERE event_object_schema = 'public'
    AND event_object_table IN ('companies', 'profiles', 'ipo_applications', 'application_sections', 'comments')
ORDER BY event_object_table, trigger_name;

-- Expected Results Summary:
-- ✅ 8 tables should exist
-- ✅ All 8 tables should have RLS enabled (rowsecurity = true)
-- ✅ Should have 15+ policies total across all tables
-- ✅ Should have 9+ indexes
-- ✅ Should have 5 update triggers for updated_at columns