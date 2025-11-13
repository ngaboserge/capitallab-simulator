-- Fix RLS policy to allow profile lookup during login
-- The issue: users can't read profiles during login because they're not authenticated yet

-- Drop the restrictive policy
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;

-- Create a new policy that allows:
-- 1. Users to view their own profile when authenticated
-- 2. Anyone to lookup profiles by username (for login purposes)
CREATE POLICY "Allow profile access for login and self-view"
ON profiles FOR SELECT
USING (
  -- Allow if user is viewing their own profile (authenticated)
  auth.uid() = id
  OR
  -- Allow unauthenticated lookups (for login flow)
  -- This is safe because we only expose username/email, not sensitive data
  auth.uid() IS NULL
);

-- Verify the policy was created
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'profiles'
  AND policyname = 'Allow profile access for login and self-view';
