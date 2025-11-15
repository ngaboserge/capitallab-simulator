-- Fix invalid current_phase values in ipo_applications table
-- This script updates any records with 'PREPARATION' to 'DATA_COLLECTION'
-- and ensures all phase values match the constraint

-- First, check what invalid values exist (for logging purposes)
DO $$
DECLARE
  invalid_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO invalid_count
  FROM ipo_applications
  WHERE current_phase NOT IN ('TEAM_SETUP', 'DATA_COLLECTION', 'IB_REVIEW', 'CMA_SUBMISSION', 'CMA_REVIEW', 'APPROVED', 'REJECTED');
  
  RAISE NOTICE 'Found % records with invalid current_phase values', invalid_count;
END $$;

-- Update 'PREPARATION' to 'DATA_COLLECTION'
UPDATE ipo_applications
SET current_phase = 'DATA_COLLECTION',
    updated_at = NOW()
WHERE current_phase = 'PREPARATION';

-- Update any other invalid values to 'DATA_COLLECTION' as a safe default
UPDATE ipo_applications
SET current_phase = 'DATA_COLLECTION',
    updated_at = NOW()
WHERE current_phase NOT IN ('TEAM_SETUP', 'DATA_COLLECTION', 'IB_REVIEW', 'CMA_SUBMISSION', 'CMA_REVIEW', 'APPROVED', 'REJECTED');

-- Verify the fix
DO $$
DECLARE
  remaining_invalid INTEGER;
BEGIN
  SELECT COUNT(*) INTO remaining_invalid
  FROM ipo_applications
  WHERE current_phase NOT IN ('TEAM_SETUP', 'DATA_COLLECTION', 'IB_REVIEW', 'CMA_SUBMISSION', 'CMA_REVIEW', 'APPROVED', 'REJECTED');
  
  IF remaining_invalid > 0 THEN
    RAISE EXCEPTION 'Still have % records with invalid current_phase values', remaining_invalid;
  ELSE
    RAISE NOTICE 'All current_phase values are now valid!';
  END IF;
END $$;

-- Show summary of current phase distribution
SELECT 
  current_phase,
  COUNT(*) as count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentage
FROM ipo_applications
GROUP BY current_phase
ORDER BY count DESC;
