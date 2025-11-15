-- Check user roles and company associations
-- Run this to see what roles are actually stored in the database

SELECT 
  p.id,
  p.email,
  p.full_name,
  p.role as database_role,
  p.company_id,
  c.legal_name as company_name,
  CASE 
    WHEN p.role LIKE 'ISSUER_%' THEN REPLACE(p.role, 'ISSUER_', '')
    ELSE p.role
  END as extracted_company_role
FROM profiles p
LEFT JOIN companies c ON p.company_id = c.id
WHERE p.role LIKE 'ISSUER%'
ORDER BY c.legal_name, p.role;

-- Check if there are any profiles with incorrect role format
SELECT 
  email,
  role,
  company_id,
  'Role should be ISSUER_CEO, ISSUER_CFO, ISSUER_SECRETARY, or ISSUER_LEGAL_ADVISOR' as note
FROM profiles
WHERE role LIKE 'ISSUER%' 
  AND role NOT IN ('ISSUER_CEO', 'ISSUER_CFO', 'ISSUER_SECRETARY', 'ISSUER_LEGAL_ADVISOR', 'ISSUER_LEGAL', 'ISSUER');
