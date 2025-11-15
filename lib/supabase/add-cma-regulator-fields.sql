-- Add CMA Regulator specific fields to profiles table

-- Add employee_id field for CMA regulators
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' 
    AND column_name = 'employee_id'
  ) THEN
    ALTER TABLE profiles 
    ADD COLUMN employee_id TEXT;
  END IF;
END $$;

-- Add department field for CMA regulators
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' 
    AND column_name = 'department'
  ) THEN
    ALTER TABLE profiles 
    ADD COLUMN department TEXT;
  END IF;
END $$;

-- Add index for employee_id lookups
CREATE INDEX IF NOT EXISTS idx_profiles_employee_id 
ON profiles(employee_id) 
WHERE employee_id IS NOT NULL;

-- Add index for CMA regulator queries
CREATE INDEX IF NOT EXISTS idx_profiles_cma_regulators 
ON profiles(role) 
WHERE role IN ('CMA_REGULATOR', 'CMA_ADMIN');

COMMENT ON COLUMN profiles.employee_id IS 'Employee ID for CMA regulators and staff';
COMMENT ON COLUMN profiles.department IS 'Department for CMA regulators (e.g., Listing & Compliance, Market Supervision)';
