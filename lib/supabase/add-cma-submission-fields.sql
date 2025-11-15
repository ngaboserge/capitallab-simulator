-- Migration: Add CMA Submission Support
-- This migration ensures the ipo_applications table has all necessary fields
-- for tracking CMA submissions from IB Advisors

-- Add submission_date field if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'ipo_applications' 
    AND column_name = 'submission_date'
  ) THEN
    ALTER TABLE ipo_applications 
    ADD COLUMN submission_date TIMESTAMP WITH TIME ZONE;
  END IF;
END $$;

-- Add approved_at field if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'ipo_applications' 
    AND column_name = 'approved_at'
  ) THEN
    ALTER TABLE ipo_applications 
    ADD COLUMN approved_at TIMESTAMP WITH TIME ZONE;
  END IF;
END $$;

-- Add rejected_at field if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'ipo_applications' 
    AND column_name = 'rejected_at'
  ) THEN
    ALTER TABLE ipo_applications 
    ADD COLUMN rejected_at TIMESTAMP WITH TIME ZONE;
  END IF;
END $$;

-- Update status CHECK constraint to include CMA_REVIEW
ALTER TABLE ipo_applications 
DROP CONSTRAINT IF EXISTS ipo_applications_status_check;

ALTER TABLE ipo_applications 
ADD CONSTRAINT ipo_applications_status_check 
CHECK (status IN ('DRAFT', 'IN_PROGRESS', 'SUBMITTED', 'IB_REVIEW', 'QUERY_TO_ISSUER', 'CMA_REVIEW', 'UNDER_REVIEW', 'QUERY_ISSUED', 'APPROVED', 'REJECTED', 'WITHDRAWN'));

-- Update current_phase CHECK constraint to include CMA phases
ALTER TABLE ipo_applications 
DROP CONSTRAINT IF EXISTS ipo_applications_current_phase_check;

ALTER TABLE ipo_applications 
ADD CONSTRAINT ipo_applications_current_phase_check 
CHECK (current_phase IN ('TEAM_SETUP', 'DATA_COLLECTION', 'IB_REVIEW', 'CMA_SUBMISSION', 'CMA_REVIEW', 'APPROVED', 'REJECTED', 'COMPLETED'));

-- Add index for faster queries on CMA officer assignments
CREATE INDEX IF NOT EXISTS idx_ipo_applications_assigned_cma_officer 
ON ipo_applications(assigned_cma_officer) 
WHERE assigned_cma_officer IS NOT NULL;

-- Add index for CMA review status queries
CREATE INDEX IF NOT EXISTS idx_ipo_applications_cma_review 
ON ipo_applications(status, assigned_cma_officer) 
WHERE status IN ('CMA_REVIEW', 'QUERY_ISSUED', 'APPROVED', 'REJECTED');

-- Add index for submission date queries (only if column exists)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'ipo_applications' 
    AND column_name = 'submission_date'
  ) THEN
    CREATE INDEX IF NOT EXISTS idx_ipo_applications_submission_date 
    ON ipo_applications(submission_date) 
    WHERE submission_date IS NOT NULL;
  END IF;
END $$;

-- Create a view for CMA regulator dashboard
CREATE OR REPLACE VIEW cma_regulator_applications AS
SELECT 
  a.id,
  a.application_number,
  a.status,
  a.current_phase,
  a.completion_percentage,
  a.target_amount,
  a.assigned_ib_advisor,
  a.assigned_cma_officer,
  a.submission_date,
  a.created_at,
  a.updated_at,
  c.legal_name as company_name,
  c.trading_name,
  ib.full_name as ib_advisor_name,
  ib.email as ib_advisor_email,
  reg.full_name as cma_officer_name,
  reg.email as cma_officer_email
FROM ipo_applications a
LEFT JOIN companies c ON a.company_id = c.id
LEFT JOIN profiles ib ON a.assigned_ib_advisor = ib.id
LEFT JOIN profiles reg ON a.assigned_cma_officer = reg.id
WHERE a.status IN ('CMA_REVIEW', 'QUERY_ISSUED', 'APPROVED', 'REJECTED')
ORDER BY a.submission_date DESC NULLS LAST;

-- Grant access to the view
GRANT SELECT ON cma_regulator_applications TO authenticated;

-- Add RLS policy for CMA regulators to view their assigned applications
DROP POLICY IF EXISTS "CMA regulators can view assigned applications" ON ipo_applications;
CREATE POLICY "CMA regulators can view assigned applications"
ON ipo_applications
FOR SELECT
TO authenticated
USING (
  auth.uid() = assigned_cma_officer
  OR 
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('CMA_REGULATOR', 'CMA_ADMIN')
  )
);

-- Add RLS policy for IB advisors to update applications they're working on
DROP POLICY IF EXISTS "IB advisors can submit to CMA" ON ipo_applications;
CREATE POLICY "IB advisors can submit to CMA"
ON ipo_applications
FOR UPDATE
TO authenticated
USING (
  auth.uid() = assigned_ib_advisor
  AND status IN ('IB_REVIEW', 'QUERY_TO_ISSUER')
)
WITH CHECK (
  auth.uid() = assigned_ib_advisor
  AND status IN ('CMA_REVIEW', 'IB_REVIEW', 'QUERY_TO_ISSUER')
);

COMMENT ON VIEW cma_regulator_applications IS 
'View for CMA regulators to see applications assigned to them with relevant company and IB advisor information';
