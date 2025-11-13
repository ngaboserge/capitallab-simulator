-- CMA Backend Integration - Complete Database Reset Script
-- WARNING: This will delete ALL existing data and tables
-- Only run this if you want a completely fresh start

-- Step 1: Drop all RLS policies first
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT schemaname, tablename, policyname 
              FROM pg_policies 
              WHERE schemaname = 'public') 
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON ' || r.schemaname || '.' || r.tablename || ' CASCADE';
    END LOOP;
END $$;

-- Step 2: Drop storage policies
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects') 
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON storage.objects CASCADE';
    END LOOP;
END $$;

-- Step 3: Drop all triggers
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT trigger_name, event_object_table 
              FROM information_schema.triggers 
              WHERE trigger_schema = 'public') 
    LOOP
        EXECUTE 'DROP TRIGGER IF EXISTS ' || r.trigger_name || ' ON ' || r.event_object_table || ' CASCADE';
    END LOOP;
END $$;

-- Step 4: Drop all tables
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS cma_reviews CASCADE;
DROP TABLE IF EXISTS query_letters CASCADE;
DROP TABLE IF EXISTS comments CASCADE;
DROP TABLE IF EXISTS documents CASCADE;
DROP TABLE IF EXISTS application_sections CASCADE;
DROP TABLE IF EXISTS team_assignments CASCADE;
DROP TABLE IF EXISTS ipo_applications CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
DROP TABLE IF EXISTS companies CASCADE;

-- Step 5: Drop all functions
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS generate_application_number() CASCADE;
DROP FUNCTION IF EXISTS calculate_application_completion() CASCADE;
DROP FUNCTION IF EXISTS create_audit_log() CASCADE;
DROP FUNCTION IF EXISTS get_user_role() CASCADE;
DROP FUNCTION IF EXISTS get_user_company_id() CASCADE;
DROP FUNCTION IF EXISTS is_cma_staff() CASCADE;
DROP FUNCTION IF EXISTS is_ib_advisor() CASCADE;
DROP FUNCTION IF EXISTS is_issuer() CASCADE;
DROP FUNCTION IF EXISTS generate_storage_path(UUID, INTEGER, UUID, TEXT) CASCADE;
DROP FUNCTION IF EXISTS extract_application_id_from_path(TEXT) CASCADE;
DROP FUNCTION IF EXISTS extract_section_number_from_path(TEXT) CASCADE;

-- Step 6: Drop sequences
DROP SEQUENCE IF EXISTS application_number_seq CASCADE;

-- Step 7: Delete storage bucket (optional - comment out if you want to keep it)
-- DELETE FROM storage.buckets WHERE id = 'applications';

SELECT 'Database reset complete! You can now run schema-backend-integration.sql' as message;
