-- Create a function that automatically recalculates application completion percentage
-- whenever a section is updated

CREATE OR REPLACE FUNCTION recalculate_application_completion()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the application's completion percentage based on completed sections
  UPDATE ipo_applications
  SET 
    completion_percentage = (
      SELECT ROUND(
        (COUNT(*) FILTER (WHERE status = 'COMPLETED')::DECIMAL / COUNT(*)::DECIMAL) * 100
      )
      FROM application_sections
      WHERE application_id = NEW.application_id
    ),
    updated_at = NOW()
  WHERE id = NEW.application_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS trigger_recalculate_completion ON application_sections;

-- Create trigger that fires after any section insert or update
CREATE TRIGGER trigger_recalculate_completion
AFTER INSERT OR UPDATE ON application_sections
FOR EACH ROW
EXECUTE FUNCTION recalculate_application_completion();

-- Run initial calculation for all existing applications
UPDATE ipo_applications
SET completion_percentage = (
  SELECT COALESCE(
    ROUND(
      (COUNT(*) FILTER (WHERE status = 'COMPLETED')::DECIMAL / NULLIF(COUNT(*), 0)::DECIMAL) * 100
    ),
    0
  )
  FROM application_sections
  WHERE application_id = ipo_applications.id
);

-- Verify the trigger was created
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_name = 'trigger_recalculate_completion';
