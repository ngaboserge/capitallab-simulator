-- Add RLS policy to allow IB Advisors to update applications assigned to them

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "IB Advisors can update assigned applications" ON ipo_applications;

-- Create policy for IB Advisors to update applications assigned to them
CREATE POLICY "IB Advisors can update assigned applications" 
ON ipo_applications 
FOR UPDATE 
USING (
  -- IB Advisors can update applications assigned to them
  assigned_ib_advisor = auth.uid()
)
WITH CHECK (
  -- IB Advisors can update applications assigned to them
  assigned_ib_advisor = auth.uid()
);

-- Verify the policy was created
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'ipo_applications' 
  AND policyname = 'IB Advisors can update assigned applications';
