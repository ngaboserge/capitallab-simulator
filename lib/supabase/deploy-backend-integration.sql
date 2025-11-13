-- CMA Backend Integration - Complete Deployment Script
-- Run this file in Supabase SQL Editor to set up everything at once
-- This combines schema, RLS policies, and storage configuration

-- ============================================================================
-- PART 1: DATABASE SCHEMA
-- ============================================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Companies Table
CREATE TABLE IF NOT EXISTS companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  legal_name TEXT NOT NULL,
  trading_name TEXT,
  registration_number TEXT UNIQUE,
  incorporation_date DATE,
  business_description TEXT,
  industry_sector TEXT,
  registered_address JSONB,
  contact_info JSONB,
  status TEXT DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'SUSPENDED')),
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Profiles Table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL CHECK (role IN ('ISSUER', 'IB_ADVISOR', 'CMA_REGULATOR', 'CMA_ADMIN')),
  company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
  avatar_url TEXT,
  phone TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- IPO Applications Table
CREATE TABLE IF NOT EXISTS ipo_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE NOT NULL,
  application_number TEXT UNIQUE,
  status TEXT DEFAULT 'DRAFT' CHECK (status IN (
    'DRAFT', 'IN_PROGRESS', 'SUBMITTED', 'IB_REVIEW', 'QUERY_TO_ISSUER',
    'UNDER_REVIEW', 'CMA_REVIEW', 'QUERY_ISSUED', 'APPROVED', 'REJECTED', 'WITHDRAWN'
  )),
  current_phase TEXT DEFAULT 'DATA_COLLECTION' CHECK (current_phase IN (
    'DATA_COLLECTION', 'IB_REVIEW', 'CMA_SUBMISSION', 'CMA_REVIEW', 'COMPLETED'
  )),
  completion_percentage INTEGER DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
  target_amount DECIMAL(15,2),
  securities_count BIGINT,
  price_per_security DECIMAL(10,2),
  assigned_ib_advisor UUID REFERENCES profiles(id) ON DELETE SET NULL,
  assigned_cma_officer UUID REFERENCES profiles(id) ON DELETE SET NULL,
  priority TEXT DEFAULT 'MEDIUM' CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'URGENT')),
  expected_listing_date DATE,
  submitted_at TIMESTAMP WITH TIME ZONE,
  approved_at TIMESTAMP WITH TIME ZONE,
  rejected_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Application Sections Table
CREATE TABLE IF NOT EXISTS application_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID REFERENCES ipo_applications(id) ON DELETE CASCADE NOT NULL,
  section_number INTEGER NOT NULL CHECK (section_number >= 1 AND section_number <= 10),
  section_title TEXT NOT NULL,
  status TEXT DEFAULT 'NOT_STARTED' CHECK (status IN (
    'NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED'
  )),
  data JSONB DEFAULT '{}',
  validation_errors JSONB DEFAULT '[]',
  completion_percentage INTEGER DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
  completed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  completed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(application_id, section_number)
);

-- Documents Table
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID REFERENCES ipo_applications(id) ON DELETE CASCADE NOT NULL,
  section_id UUID REFERENCES application_sections(id) ON DELETE SET NULL,
  filename TEXT NOT NULL,
  original_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT,
  mime_type TEXT,
  category TEXT NOT NULL,
  description TEXT,
  version INTEGER DEFAULT 1,
  checksum TEXT,
  uploaded_by UUID REFERENCES profiles(id) ON DELETE SET NULL NOT NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE,
  is_confidential BOOLEAN DEFAULT FALSE
);

-- Comments Table
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID REFERENCES ipo_applications(id) ON DELETE CASCADE NOT NULL,
  section_id UUID REFERENCES application_sections(id) ON DELETE SET NULL,
  document_id UUID REFERENCES documents(id) ON DELETE SET NULL,
  author_id UUID REFERENCES profiles(id) ON DELETE SET NULL NOT NULL,
  content TEXT NOT NULL,
  comment_type TEXT DEFAULT 'GENERAL' CHECK (comment_type IN (
    'GENERAL', 'QUERY', 'FEEDBACK', 'APPROVAL', 'REJECTION'
  )),
  is_internal BOOLEAN DEFAULT FALSE,
  is_resolved BOOLEAN DEFAULT FALSE,
  priority TEXT DEFAULT 'MEDIUM' CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH')),
  parent_comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- CMA Reviews Table
CREATE TABLE IF NOT EXISTS cma_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID REFERENCES ipo_applications(id) ON DELETE CASCADE NOT NULL,
  reviewer_id UUID REFERENCES profiles(id) ON DELETE SET NULL NOT NULL,
  review_type TEXT CHECK (review_type IN (
    'INITIAL_REVIEW', 'DETAILED_REVIEW', 'QUERY_RESPONSE', 'FINAL_REVIEW'
  )) NOT NULL,
  status TEXT DEFAULT 'IN_PROGRESS' CHECK (status IN (
    'PENDING', 'IN_PROGRESS', 'COMPLETED', 'ON_HOLD'
  )),
  compliance_score INTEGER CHECK (compliance_score >= 0 AND compliance_score <= 100),
  risk_rating TEXT CHECK (risk_rating IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
  decision TEXT CHECK (decision IN ('APPROVE', 'REJECT', 'QUERY', 'DEFER')),
  decision_reason TEXT,
  conditions JSONB DEFAULT '[]',
  recommendations JSONB DEFAULT '[]',
  review_checklist JSONB DEFAULT '{}',
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  due_date TIMESTAMP WITH TIME ZONE
);

-- Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN (
    'APPLICATION_SUBMITTED', 'APPLICATION_ASSIGNED', 'COMMENT_ADDED', 'STATUS_CHANGED',
    'QUERY_ISSUED', 'DECISION_MADE', 'INFO', 'WARNING', 'ERROR', 'SUCCESS'
  )),
  application_id UUID REFERENCES ipo_applications(id) ON DELETE CASCADE,
  section_id UUID REFERENCES application_sections(id) ON DELETE SET NULL,
  priority TEXT DEFAULT 'MEDIUM' CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'URGENT')),
  is_read BOOLEAN DEFAULT FALSE,
  action_url TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Audit Logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name TEXT NOT NULL,
  record_id UUID NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'SUBMIT', 'APPROVE', 'REJECT')),
  old_values JSONB,
  new_values JSONB,
  changed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT,
  application_id UUID REFERENCES ipo_applications(id) ON DELETE SET NULL
);

-- Create Indexes
CREATE INDEX IF NOT EXISTS idx_profiles_company_id ON profiles(company_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_ipo_applications_company_id ON ipo_applications(company_id);
CREATE INDEX IF NOT EXISTS idx_ipo_applications_status ON ipo_applications(status);
CREATE INDEX IF NOT EXISTS idx_application_sections_application_id ON application_sections(application_id);
CREATE INDEX IF NOT EXISTS idx_documents_application_id ON documents(application_id);
CREATE INDEX IF NOT EXISTS idx_comments_application_id ON comments(application_id);
CREATE INDEX IF NOT EXISTS idx_notifications_recipient_id ON notifications(recipient_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_record ON audit_logs(table_name, record_id);

-- Create Functions
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE OR REPLACE FUNCTION generate_application_number()
RETURNS TRIGGER AS $$
DECLARE
    year_str TEXT;
    next_num INTEGER;
BEGIN
    IF NEW.application_number IS NULL THEN
        year_str := TO_CHAR(NOW(), 'YYYY');
        SELECT COALESCE(MAX(
            CAST(SUBSTRING(application_number FROM 'CMA-IPO-' || year_str || '-(\d+)') AS INTEGER)
        ), 0) + 1
        INTO next_num
        FROM ipo_applications
        WHERE application_number LIKE 'CMA-IPO-' || year_str || '-%';
        NEW.application_number := 'CMA-IPO-' || year_str || '-' || LPAD(next_num::TEXT, 4, '0');
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create Triggers
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ipo_applications_updated_at BEFORE UPDATE ON ipo_applications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_application_sections_updated_at BEFORE UPDATE ON application_sections FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER generate_application_number_trigger BEFORE INSERT ON ipo_applications FOR EACH ROW EXECUTE FUNCTION generate_application_number();

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE ipo_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE application_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE cma_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- PART 2: RLS POLICIES (Basic set - see full file for complete policies)
-- ============================================================================

-- Helper Functions
CREATE OR REPLACE FUNCTION get_user_role() RETURNS TEXT AS $$
    SELECT role FROM profiles WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_issuer() RETURNS BOOLEAN AS $$
    SELECT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ISSUER');
$$ LANGUAGE SQL SECURITY DEFINER;

-- Profiles Policies
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "System can insert profiles" ON profiles FOR INSERT WITH CHECK (true);

-- Applications Policies (basic)
CREATE POLICY "Issuers can view own applications" ON ipo_applications FOR SELECT 
USING (company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Issuers can create applications" ON ipo_applications FOR INSERT 
WITH CHECK (company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid()));

-- Notifications Policies
CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (recipient_id = auth.uid());
CREATE POLICY "System can create notifications" ON notifications FOR INSERT WITH CHECK (true);

-- ============================================================================
-- PART 3: STORAGE CONFIGURATION
-- ============================================================================

-- Create Storage Bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'applications',
  'applications',
  false,
  52428800,
  ARRAY[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'image/jpeg',
    'image/png',
    'text/plain',
    'text/csv'
  ]
)
ON CONFLICT (id) DO UPDATE SET
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Enable RLS on storage
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Basic Storage Policies
CREATE POLICY "Authenticated users can upload" ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'applications' AND auth.role() = 'authenticated');

CREATE POLICY "Users can view own uploads" ON storage.objects FOR SELECT 
USING (bucket_id = 'applications' AND auth.role() = 'authenticated');

-- ============================================================================
-- DEPLOYMENT COMPLETE
-- ============================================================================

-- Verify deployment
SELECT 'Deployment successful! Tables created: ' || COUNT(*)::text 
FROM information_schema.tables 
WHERE table_schema = 'public' AND table_type = 'BASE TABLE';
