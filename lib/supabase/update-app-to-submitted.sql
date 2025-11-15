-- Update application status from DRAFT to SUBMITTED
-- This allows the IB Advisor to interact with it

UPDATE ipo_applications
SET 
  status = 'SUBMITTED',
  submitted_at = NOW(),
  updated_at = NOW()
WHERE id = 'b7463e3a-fc67-490a-b78b-f8094a2256f3';

-- Verify the update
SELECT 
  id,
  company_id,
  status,
  assigned_ib_advisor,
  submitted_at,
  created_at,
  updated_at
FROM ipo_applications
WHERE id = 'b7463e3a-fc67-490a-b78b-f8094a2256f3';
