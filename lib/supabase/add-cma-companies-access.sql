-- Add RLS policy to allow CMA regulators to view companies of applications assigned to them

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "CMA regulators can view assigned companies" ON companies;

-- Create policy for CMA regulators to view companies
CREATE POLICY "CMA regulators can view assigned companies"
ON companies
FOR SELECT
TO public
USING (
  -- Allow if user is CMA_REGULATOR or CMA_ADMIN and the company has an application assigned to them
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('CMA_REGULATOR', 'CMA_ADMIN')
  )
  AND (
    -- CMA_ADMIN can see all companies
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'CMA_ADMIN'
    )
    OR
    -- CMA_REGULATOR can see companies of applications assigned to them
    id IN (
      SELECT company_id
      FROM ipo_applications
      WHERE assigned_cma_officer = auth.uid()
    )
  )
);

-- Verify the policy was created
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename = 'companies'
ORDER BY policyname;
