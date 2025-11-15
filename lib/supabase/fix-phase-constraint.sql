-- Check current constraint definition
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'ipo_applications'::regclass 
AND conname = 'ipo_applications_current_phase_check';

-- Drop the old constraint
ALTER TABLE ipo_applications 
DROP CONSTRAINT IF EXISTS ipo_applications_current_phase_check;

-- Add the correct constraint with all valid phase values
ALTER TABLE ipo_applications 
ADD CONSTRAINT ipo_applications_current_phase_check 
CHECK (current_phase IN ('TEAM_SETUP', 'DATA_COLLECTION', 'IB_REVIEW', 'CMA_SUBMISSION', 'CMA_REVIEW', 'APPROVED', 'REJECTED'));

-- Verify the new constraint
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'ipo_applications'::regclass 
AND conname = 'ipo_applications_current_phase_check';

-- Show all current phase values in the table
SELECT current_phase, COUNT(*) as count
FROM ipo_applications
GROUP BY current_phase
ORDER BY count DESC;
