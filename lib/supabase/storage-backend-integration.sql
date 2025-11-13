-- CMA Backend Integration - Supabase Storage Configuration
-- This file contains SQL commands to set up storage buckets and policies

-- ============================================================================
-- STORAGE BUCKET CREATION
-- ============================================================================

-- Create the 'applications' storage bucket for document uploads
-- This bucket will store all application-related documents
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'applications',
  'applications',
  false, -- Not publicly accessible
  52428800, -- 50MB file size limit (50 * 1024 * 1024 bytes)
  ARRAY[
    -- Document formats
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    -- Image formats
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    -- Text formats
    'text/plain',
    'text/csv',
    -- Archive formats
    'application/zip',
    'application/x-rar-compressed'
  ]
)
ON CONFLICT (id) DO UPDATE SET
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- ============================================================================
-- STORAGE RLS POLICIES
-- ============================================================================

-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- UPLOAD POLICIES
-- ============================================================================

-- Issuers can upload documents to their own application folders
CREATE POLICY "Issuers can upload to own applications"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'applications' AND
  -- Check if the user is an issuer
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'ISSUER'
  ) AND
  -- Extract application_id from path: applications/{application_id}/section-{number}/{filename}
  -- Check if the application belongs to the user's company
  (string_to_array(name, '/'))[2]::uuid IN (
    SELECT ia.id::text::uuid
    FROM ipo_applications ia
    JOIN profiles p ON p.company_id = ia.company_id
    WHERE p.id = auth.uid()
  )
);

-- IB Advisors can upload documents to assigned application folders
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

-- CMA can upload documents to applications under review
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

-- Issuers can view/download documents from their own applications
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

-- IB Advisors can view/download documents from assigned applications
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

-- CMA can view/download documents from submitted applications
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

-- Issuers can update their own uploaded documents (only in editable states)
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

-- Issuers can delete their own uploaded documents (only in editable states)
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

-- CMA Admin can delete any document (for administrative purposes)
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
-- STORAGE FOLDER STRUCTURE
-- ============================================================================

/*
The storage bucket follows this folder structure:

applications/
  {application_id}/                    -- UUID of the IPO application
    section-1/                         -- Company Identity
      {document_id}_{filename}
    section-2/                         -- Share Ownership
      {document_id}_{filename}
    section-3/                         -- Capitalization
      {document_id}_{filename}
    section-4/                         -- Governance
      {document_id}_{filename}
    section-5/                         -- Compliance
      {document_id}_{filename}
    section-6/                         -- Offer Details
      {document_id}_{filename}
    section-7/                         -- Prospectus
      {document_id}_{filename}
    section-8/                         -- Publication
      {document_id}_{filename}
    section-9/                         -- Undertakings
      {document_id}_{filename}
    section-10/                        -- Declarations
      {document_id}_{filename}

Example path:
applications/550e8400-e29b-41d4-a716-446655440000/section-1/123e4567-e89b-12d3-a456-426614174000_certificate.pdf

This structure:
- Organizes documents by application
- Groups documents by section (1-10)
- Uses document_id prefix for uniqueness
- Preserves original filename for user reference
*/

-- ============================================================================
-- HELPER FUNCTIONS FOR STORAGE OPERATIONS
-- ============================================================================

-- Function to generate storage path for a document
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

-- Function to extract application_id from storage path
CREATE OR REPLACE FUNCTION extract_application_id_from_path(p_path TEXT)
RETURNS UUID AS $$
BEGIN
  RETURN (string_to_array(p_path, '/'))[2]::uuid;
EXCEPTION
  WHEN OTHERS THEN
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Function to extract section_number from storage path
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

-- ============================================================================
-- STORAGE CONFIGURATION NOTES
-- ============================================================================

/*
MIME Type Restrictions:
- PDF documents (most common for official documents)
- Microsoft Office documents (Word, Excel, PowerPoint)
- Images (JPEG, PNG, GIF, WebP)
- Text files (TXT, CSV)
- Archives (ZIP, RAR)

File Size Limit:
- 50MB per file (configurable)
- Can be increased for specific use cases

Security Features:
- Row Level Security (RLS) enforced on all operations
- Role-based access control
- Application-specific folder isolation
- No public access (all files require authentication)

Best Practices:
1. Always use the generate_storage_path() function to create paths
2. Store document metadata in the documents table
3. Use signed URLs for temporary download access
4. Implement virus scanning before allowing downloads
5. Regular cleanup of orphaned files (files without database records)
*/
