-- Quick verification script to check if tables exist
-- Run this in Supabase SQL Editor to verify your schema is deployed

SELECT 
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
  AND table_name IN (
    'profiles',
    'companies',
    'ipo_applications',
    'application_sections',
    'documents',
    'comments',
    'cma_reviews',
    'notifications',
    'audit_logs'
  )
ORDER BY table_name;

-- Check if RLS is enabled
SELECT 
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    'profiles',
    'companies',
    'ipo_applications',
    'application_sections',
    'documents',
    'comments',
    'cma_reviews',
    'notifications',
    'audit_logs'
  )
ORDER BY tablename;
