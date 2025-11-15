-- Recalculate completion percentage for the application based on completed sections

UPDATE ipo_applications
SET completion_percentage = (
  SELECT ROUND(
    (COUNT(*) FILTER (WHERE status = 'COMPLETED')::DECIMAL / COUNT(*)::DECIMAL) * 100
  )
  FROM application_sections
  WHERE application_id = 'b7463e3a-fc67-490a-b78b-f8094a2256f3'
),
updated_at = NOW()
WHERE id = 'b7463e3a-fc67-490a-b78b-f8094a2256f3';

-- Verify the update
SELECT 
  id,
  company_id,
  status,
  completion_percentage,
  (SELECT COUNT(*) FROM application_sections WHERE application_id = id AND status = 'COMPLETED') as completed_sections,
  (SELECT COUNT(*) FROM application_sections WHERE application_id = id) as total_sections
FROM ipo_applications
WHERE id = 'b7463e3a-fc67-490a-b78b-f8094a2256f3';
