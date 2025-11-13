-- Simple fix for company_role constraint
-- Add LEGAL_ADVISOR and SECRETARY to allowed values

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

-- Success message
SELECT 'Constraint updated - LEGAL_ADVISOR and SECRETARY now allowed' as result;