-- Fix issuer roles that don't have the proper ISSUER_ROLE format
-- This script updates profiles that have generic 'ISSUER' role to proper role format

-- First, show what will be updated
SELECT 
  email,
  full_name,
  role as current_role,
  company_id,
  'Will be updated to ISSUER_CEO or needs manual review' as note
FROM profiles
WHERE role = 'ISSUER' OR role NOT LIKE 'ISSUER_%';

-- Update generic 'ISSUER' roles to 'ISSUER_CEO' (assuming they are CEOs)
-- You may need to manually verify this is correct for your users
UPDATE profiles
SET role = 'ISSUER_CEO',
    updated_at = NOW()
WHERE role = 'ISSUER' AND company_id IS NOT NULL;

-- Verify the update
SELECT 
  email,
  full_name,
  role,
  company_id,
  CASE 
    WHEN role LIKE 'ISSUER_%' THEN REPLACE(role, 'ISSUER_', '')
    ELSE 'UNKNOWN'
  END as company_role
FROM profiles
WHERE company_id IS NOT NULL
ORDER BY company_id, role;
