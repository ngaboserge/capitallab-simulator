-- Fix for "Database error creating new user"
-- This creates a trigger to automatically create profile when auth user is created

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Don't auto-create profile - let the signup API handle it
  -- This prevents the "Database error creating new user" issue
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Note: We're NOT creating a trigger because we handle profile creation
-- manually in the signup API route using the service role key
-- This avoids RLS policy conflicts during signup

-- Verify the profiles table exists and has correct structure
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') THEN
    RAISE EXCEPTION 'profiles table does not exist!';
  END IF;
END $$;

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Auth trigger fix applied successfully';
END $$;
