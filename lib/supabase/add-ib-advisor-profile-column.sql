-- Add IB Advisor Profile Column to Profiles Table
-- This migration adds support for storing IB Advisor profile data

-- Add the ib_advisor_profile column to store IB Advisor specific data
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS ib_advisor_profile JSONB DEFAULT NULL;

-- Add a comment to document the column
COMMENT ON COLUMN profiles.ib_advisor_profile IS 'JSON data containing IB Advisor profile information including company details, experience, team, fees, etc.';

-- Create an index for better query performance on IB Advisor profiles
CREATE INDEX IF NOT EXISTS idx_profiles_ib_advisor_profile 
ON profiles USING GIN (ib_advisor_profile) 
WHERE role = 'IB_ADVISOR';

-- Add a check constraint to ensure only IB_ADVISOR roles can have this data
ALTER TABLE profiles 
ADD CONSTRAINT check_ib_advisor_profile_role 
CHECK (
  (role = 'IB_ADVISOR' AND ib_advisor_profile IS NOT NULL) OR 
  (role != 'IB_ADVISOR' AND ib_advisor_profile IS NULL) OR
  ib_advisor_profile IS NULL
);

-- Update existing IB_ADVISOR profiles to have an empty JSON object if they don't have profile data
UPDATE profiles 
SET ib_advisor_profile = '{}'::jsonb 
WHERE role = 'IB_ADVISOR' AND ib_advisor_profile IS NULL;

-- Verify the changes
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
  AND column_name = 'ib_advisor_profile';

-- Show sample of IB_ADVISOR profiles
SELECT 
  id, 
  username, 
  full_name, 
  role,
  CASE 
    WHEN ib_advisor_profile IS NOT NULL THEN 'Has Profile Data'
    ELSE 'No Profile Data'
  END as profile_status
FROM profiles 
WHERE role = 'IB_ADVISOR'
LIMIT 5;