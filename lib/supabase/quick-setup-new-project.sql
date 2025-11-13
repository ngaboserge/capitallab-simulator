-- Quick Setup for New Supabase Project
-- Run this in Supabase SQL Editor

-- 1. Create storage bucket for applications
INSERT INTO storage.buckets (id, name, public)
VALUES ('applications', 'applications', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Drop existing policies if any
DROP POLICY IF EXISTS "Allow public uploads to test-uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow public access to test-uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow all uploads for testing" ON storage.objects;
DROP POLICY IF EXISTS "Allow all access for testing" ON storage.objects;

-- 3. Set up permissive storage policies for testing
CREATE POLICY "Allow all uploads for testing"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'applications');

CREATE POLICY "Allow all access for testing"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'applications');

CREATE POLICY "Allow all updates for testing"
ON storage.objects FOR UPDATE
TO public
USING (bucket_id = 'applications');

CREATE POLICY "Allow all deletes for testing"
ON storage.objects FOR DELETE
TO public
USING (bucket_id = 'applications');

-- Done! Your storage is ready for testing
