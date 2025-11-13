-- Quick Migration: Add IB Advisor Profile Support
-- Run this in your Supabase SQL Editor

-- Step 1: Add the column
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS ib_advisor_profile JSONB DEFAULT NULL;

-- Step 2: Add index for performance
CREATE INDEX IF NOT EXISTS idx_profiles_ib_advisor_profile 
ON profiles USING GIN (ib_advisor_profile) 
WHERE role = 'IB_ADVISOR';

-- Step 3: Verify the column was added
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'profiles' 
  AND column_name = 'ib_advisor_profile';

-- Step 4: Test inserting IB Advisor profile data
-- This should work after the column is added
SELECT 'Migration completed successfully!' as status;