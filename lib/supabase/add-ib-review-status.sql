-- Add 'IB_REVIEW' status to the ipo_applications status check constraint

-- Drop the existing constraint
ALTER TABLE ipo_applications 
DROP CONSTRAINT IF EXISTS ipo_applications_status_check;

-- Add the new constraint with 'IB_REVIEW' included
ALTER TABLE ipo_applications 
ADD CONSTRAINT ipo_applications_status_check 
CHECK (status IN (
  'DRAFT', 
  'SUBMITTED', 
  'IB_REVIEW',
  'UNDER_REVIEW', 
  'QUERY_ISSUED', 
  'APPROVED', 
  'REJECTED', 
  'WITHDRAWN'
));

-- Verify the constraint
SELECT 
  conname AS constraint_name,
  pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conname = 'ipo_applications_status_check';
