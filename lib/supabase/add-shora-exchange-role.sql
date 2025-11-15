-- Add SHORA_EXCHANGE roles to the profiles role check constraint

-- First, let's see what roles currently exist (for debugging)
-- SELECT DISTINCT role FROM profiles WHERE role IS NOT NULL;

-- Drop the existing constraint
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;

-- Recreate the constraint with SHORA roles included
-- Include all existing roles plus new SHORA roles
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check 
  CHECK (role IN (
    'ISSUER_CEO',
    'ISSUER_CFO',
    'ISSUER_SECRETARY',
    'ISSUER_DIRECTOR',
    'ISSUER_MANAGER',
    'ISSUER_LEGAL_ADVISOR',
    'ISSUER',
    'IB_ADVISOR',
    'CMA_REGULATOR',
    'CMA_ADMIN',
    'SHORA_EXCHANGE',
    'SHORA_ADMIN',
    'SHORA_OPERATOR'
  ));

COMMENT ON CONSTRAINT profiles_role_check ON profiles IS 
  'Ensures role is one of the valid user roles including Shora Exchange roles';
