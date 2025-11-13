-- Comprehensive fix for signup issues
-- 1. Add missing company_role column
-- 2. Fix RLS policies to prevent recursion
-- 3. Ensure proper permissions for signup process

-- ============================================================================
-- 1. ADD MISSING COMPANY_ROLE COLUMN
-- ============================================================================

-- Add the missing company_role column
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS company_role TEXT;

-- Add a check constraint for valid company roles
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'check_company_role' 
        AND table_name = 'profiles'
    ) THEN
        ALTER TABLE profiles 
        ADD CONSTRAINT check_company_role 
        CHECK (company_role IS NULL OR company_role IN ('CEO', 'CFO', 'CTO', 'COO', 'DIRECTOR', 'MANAGER', 'OFFICER', 'OTHER'));
    END IF;
END $$;

-- ============================================================================
-- 2. FIX RLS POLICIES TO PREVENT RECURSION
-- ============================================================================

-- Drop all existing policies on profiles to start fresh
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Allow profile access for login and self-view" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Service role can insert profiles" ON profiles;
DROP POLICY IF EXISTS "CMA Admin can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON profiles;
DROP POLICY IF EXISTS "Enable update for users based on email" ON profiles;

-- Temporarily disable RLS for development
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 3. ENSURE PROPER PERMISSIONS FOR AUTH OPERATIONS
-- ============================================================================

-- Grant necessary permissions to authenticated users
GRANT SELECT, INSERT, UPDATE ON profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE ON companies TO authenticated;

-- Grant service role full access (needed for signup)
GRANT ALL ON profiles TO service_role;
GRANT ALL ON companies TO service_role;
GRANT ALL ON ipo_applications TO service_role;
GRANT ALL ON application_sections TO service_role;

-- ============================================================================
-- 4. CREATE SIMPLE, NON-RECURSIVE RLS POLICIES (OPTIONAL - COMMENTED OUT)
-- ============================================================================

-- Uncomment these if you want to re-enable RLS later with safe policies
-- These policies avoid recursion by not calling auth.uid() in complex ways

/*
-- Re-enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Simple policy: Users can view their own profile
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

-- Simple policy: Users can update their own profile
CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- Service role can do everything (for signup/admin operations)
CREATE POLICY "Service role full access" ON profiles
    FOR ALL USING (auth.role() = 'service_role');
*/

-- ============================================================================
-- 5. VERIFICATION
-- ============================================================================

-- Verify the company_role column exists
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND column_name = 'company_role';

-- Check RLS status
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'profiles';

-- Success message
SELECT 'Signup issues fixed: company_role column added, RLS disabled for development' as status;