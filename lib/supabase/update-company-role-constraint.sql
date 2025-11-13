-- Update company_role constraint to include new issuer team roles
-- This fixes the constraint violation for LEGAL_ADVISOR and SECRETARY roles

-- Drop the existing constraint
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS check_company_role;

-- Add updated constraint with new roles
ALTER TABLE profiles 
ADD CONSTRAINT check_company_role 
CHECK (company_role IS NULL OR company_role IN (
  'CEO', 
  'CFO', 
  'CTO', 
  'COO', 
  'LEGAL_ADVISOR',
  'SECRETARY', 
  'DIRECTOR', 
  'MANAGER', 
  'OFFICER', 
  'OTHER'
));

-- Update the comment to reflect the new roles
COMMENT ON COLUMN profiles.company_role IS 'Role within the company (for ISSUER users only). Supports CEO, CFO, LEGAL_ADVISOR, SECRETARY and other standard roles.';

-- Verify the constraint was updated
SELECT 
  conname as constraint_name
FROM pg_constraint 
WHERE conname = 'check_company_role';

SELECT 'company_role constraint updated successfully to include LEGAL_ADVISOR and SECRETARY' as status;