-- Storage RLS Policies - Run this AFTER creating the 'applications' bucket in Dashboard
-- This adds all the role-based access policies for file uploads/downloads

-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- UPLOAD POLICIES
-- ============================================================================

CREATE POLICY "Issuers can upload to own applications"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'applications' AND
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'ISSUER'
  ) AND
  (string_to_array(name, '/'))[2]::uuid IN (
    SELECT ia.id::text::uuid
    FROM ipo_applications ia
    JOIN profiles p ON p.company_id = ia.company_id
    WHERE p.id = auth.uid()
  )
);

CREATE POLICY "IB Advisors can upload to assigned applications"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'applications' AND
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'IB_ADVISOR'
  ) AND
  (string_to_array(name, '/'))[2]::uuid IN (
    SELECT id::text::uuid
    FROM ipo_applications
    WHERE assigned_ib_advisor = auth.uid()
  )
);

CREATE POLICY "CMA can upload to applications under review"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'applications' AND
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role IN ('CMA_REGULATOR', 'CMA_ADMIN')
  ) AND
  (string_to_array(name, '/'))[2]::uuid IN (
    SELECT id::text::uuid
    FROM ipo_applications
    WHERE status IN ('UNDER_REVIEW', 'CMA_REVIEW', 'QUERY_ISSUED')
  )
);

-- ============================================================================
-- SELECT/DOWNLOAD POLICIES
-- ============================================================================

CREATE POLICY "Issuers can view own application documents"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'applications' AND
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'ISSUER'
  ) AND
  (string_to_array(name, '/'))[2]::uuid IN (
    SELECT ia.id::text::uuid
    FROM ipo_applications ia
    JOIN profiles p ON p.company_id = ia.company_id
    WHERE p.id = auth.uid()
  )
);

CREATE POLICY "IB Advisors can view assigned application documents"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'applications' AND
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'IB_ADVISOR'
  ) AND
  (string_to_array(name, '/'))[2]::uuid IN (
    SELECT id::text::uuid
    FROM ipo_applications
    WHERE assigned_ib_advisor = auth.uid()
  )
);

CREATE POLICY "CMA can view submitted application documents"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'applications' AND
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role IN ('CMA_REGULATOR', 'CMA_ADMIN')
  ) AND
  (string_to_array(name, '/'))[2]::uuid IN (
    SELECT id::text::uuid
    FROM ipo_applications
    WHERE status IN ('UNDER_REVIEW', 'CMA_REVIEW', 'QUERY_ISSUED', 'APPROVED', 'REJECTED')
  )
);

-- ============================================================================
-- UPDATE POLICIES
-- ============================================================================

CREATE POLICY "Issuers can update own documents"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'applications' AND
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'ISSUER'
  ) AND
  (string_to_array(name, '/'))[2]::uuid IN (
    SELECT ia.id::text::uuid
    FROM ipo_applications ia
    JOIN profiles p ON p.company_id = ia.company_id
    WHERE p.id = auth.uid()
    AND ia.status IN ('DRAFT', 'IN_PROGRESS', 'QUERY_TO_ISSUER')
  )
)
WITH CHECK (
  bucket_id = 'applications' AND
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'ISSUER'
  )
);

-- ============================================================================
-- DELETE POLICIES
-- ============================================================================

CREATE POLICY "Issuers can delete own documents"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'applications' AND
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'ISSUER'
  ) AND
  (string_to_array(name, '/'))[2]::uuid IN (
    SELECT ia.id::text::uuid
    FROM ipo_applications ia
    JOIN profiles p ON p.company_id = ia.company_id
    WHERE p.id = auth.uid()
    AND ia.status IN ('DRAFT', 'IN_PROGRESS', 'QUERY_TO_ISSUER')
  )
);

CREATE POLICY "CMA Admin can delete any document"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'applications' AND
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'CMA_ADMIN'
  )
);

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

CREATE OR REPLACE FUNCTION generate_storage_path(
  p_application_id UUID,
  p_section_number INTEGER,
  p_document_id UUID,
  p_filename TEXT
)
RETURNS TEXT AS $$
BEGIN
  RETURN format(
    'applications/%s/section-%s/%s_%s',
    p_application_id,
    p_section_number,
    p_document_id,
    p_filename
  );
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION extract_application_id_from_path(p_path TEXT)
RETURNS UUID AS $$
BEGIN
  RETURN (string_to_array(p_path, '/'))[2]::uuid;
EXCEPTION
  WHEN OTHERS THEN
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION extract_section_number_from_path(p_path TEXT)
RETURNS INTEGER AS $$
DECLARE
  section_part TEXT;
BEGIN
  section_part := (string_to_array(p_path, '/'))[3];
  RETURN REPLACE(section_part, 'section-', '')::integer;
EXCEPTION
  WHEN OTHERS THEN
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Verify setup
SELECT 'Storage policies and helper functions created successfully!' as message;
