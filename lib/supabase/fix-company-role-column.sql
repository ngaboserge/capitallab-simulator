-- Fix missing company_role column in profiles table
-- This column is needed for the signup process

-- Add the missing company_role column
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS company_role TEXT;

-- Add a check constraint for valid company roles
ALTER TABLE profiles 
ADD CONSTRAINT check_company_role 
CHECK (company_role IS NULL OR company_role IN ('CEO', 'CFO', 'CTO', 'COO', 'DIRECTOR', 'MANAGER', 'OFFICER', 'OTHER'));

-- Update the comment to reflect the new column
COMMENT ON COLUMN profiles.company_role IS 'Role within the company (for ISSUER users only)';

-- Verify the column was added
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND column_name = 'company_role';

SELECT 'company_role column added successfully to profiles table' as status;