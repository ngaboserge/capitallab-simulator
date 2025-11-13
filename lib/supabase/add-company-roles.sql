-- Add company-specific roles for issuer users
-- This allows users within a company to have specific roles like CEO, CFO, etc.

-- Add company_role column to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS company_role TEXT 
CHECK (company_role IN ('CEO', 'CFO', 'LEGAL_ADVISOR', 'SECRETARY', 'DIRECTOR', 'MANAGER', 'EMPLOYEE'));

-- Add comment for clarity
COMMENT ON COLUMN profiles.company_role IS 'Specific role within the company (for ISSUER users only)';

-- Update existing ISSUER users to have a default company role
UPDATE profiles 
SET company_role = 'CEO' 
WHERE role = 'ISSUER' AND company_role IS NULL;

-- Success message
SELECT 'Company roles added successfully' as status;