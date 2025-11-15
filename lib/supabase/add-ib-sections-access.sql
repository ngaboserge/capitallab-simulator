-- Add RLS policy to allow IB Advisors to view application sections for their assigned applications

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "IB Advisors can view assigned application sections" ON application_sections;

-- Create policy for IB Advisors to view sections for applications assigned to them
CREATE POLICY "IB Advisors can view assigned application sections" 
ON application_sections 
FOR SELECT 
USING (
  -- IB Advisors can see sections for applications assigned to them
  application_id IN (
    SELECT id 
    FROM ipo_applications 
    WHERE assigned_ib_advisor = auth.uid()
  )
);

-- Verify the policy was created
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'application_sections' 
  AND policyname = 'IB Advisors can view assigned application sections';
