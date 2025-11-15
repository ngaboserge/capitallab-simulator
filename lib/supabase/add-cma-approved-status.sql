-- Add CMA_APPROVED and CMA_REJECTED to the status check constraint

-- First, drop the existing constraint
ALTER TABLE ipo_applications DROP CONSTRAINT IF EXISTS ipo_applications_status_check;

-- Recreate the constraint with the new statuses
ALTER TABLE ipo_applications ADD CONSTRAINT ipo_applications_status_check 
  CHECK (status IN (
    'DRAFT',
    'IB_REVIEW',
    'IB_APPROVED',
    'IB_REJECTED',
    'CMA_REVIEW',
    'CMA_APPROVED',
    'CMA_REJECTED',
    'APPROVED',
    'REJECTED',
    'QUERY_ISSUED',
    'UNDER_REVIEW',
    'SUBMITTED'
  ));

-- Also update current_phase constraint if it exists
ALTER TABLE ipo_applications DROP CONSTRAINT IF EXISTS ipo_applications_current_phase_check;

ALTER TABLE ipo_applications ADD CONSTRAINT ipo_applications_current_phase_check 
  CHECK (current_phase IN (
    'DRAFT',
    'IB_REVIEW',
    'IB_APPROVED',
    'CMA_REVIEW',
    'APPROVED',
    'REJECTED',
    'QUERY_ISSUED',
    'UNDER_REVIEW'
  ));

COMMENT ON CONSTRAINT ipo_applications_status_check ON ipo_applications IS 
  'Ensures status is one of the valid application statuses including CMA approval/rejection';
