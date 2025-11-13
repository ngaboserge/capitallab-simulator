-- Supabase Storage Setup for CMA Issuer Application System
-- Run this in your Supabase SQL Editor after setting up the main database

-- Create storage bucket for documents
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'cma-documents',
  'cma-documents',
  true,
  52428800, -- 50MB limit
  ARRAY[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'image/jpeg',
    'image/png',
    'image/gif'
  ]
) ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for storage bucket
CREATE POLICY "Users can upload documents for their applications" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'cma-documents' AND
  auth.uid()::text = (storage.foldername(name))[1] OR
  EXISTS (
    SELECT 1 FROM ipo_applications ia
    JOIN profiles p ON p.company_id = ia.company_id
    WHERE p.id = auth.uid()
    AND ia.id::text = (storage.foldername(name))[1]
  )
);

CREATE POLICY "Users can view documents for their applications" ON storage.objects
FOR SELECT USING (
  bucket_id = 'cma-documents' AND (
    auth.uid()::text = (storage.foldername(name))[1] OR
    EXISTS (
      SELECT 1 FROM ipo_applications ia
      JOIN profiles p ON p.company_id = ia.company_id
      WHERE p.id = auth.uid()
      AND ia.id::text = (storage.foldername(name))[1]
    )
  )
);

CREATE POLICY "Users can delete documents for their applications" ON storage.objects
FOR DELETE USING (
  bucket_id = 'cma-documents' AND (
    auth.uid()::text = (storage.foldername(name))[1] OR
    EXISTS (
      SELECT 1 FROM ipo_applications ia
      JOIN profiles p ON p.company_id = ia.company_id
      WHERE p.id = auth.uid()
      AND ia.id::text = (storage.foldername(name))[1]
    )
  )
);

-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;