-- CMA Issuer Application System - Supabase Schema
-- This schema supports multi-role collaboration between Issuers, IB Advisors, and CMA Regulators

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Companies (Issuers) - Must be created first due to foreign key references
CREATE TABLE companies (
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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Users and Authentication (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT CHECK (role IN ('ISSUER_CEO', 'ISSUER_CFO', 'ISSUER_SECRETARY', 'ISSUER_LEGAL', 'IB_ADVISOR', 'CMA_REGULATOR', 'CMA_ADMIN')) NOT NULL,
  company_id UUID REFERENCES companies(id),
  avatar_url TEXT,
  phone TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- IPO Applications
CREATE TABLE ipo_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) NOT NULL,
  application_number TEXT UNIQUE,
  status TEXT DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'QUERY_ISSUED', 'APPROVED', 'REJECTED', 'WITHDRAWN')),
  submission_date TIMESTAMP WITH TIME ZONE,
  target_amount DECIMAL(15,2),
  securities_count BIGINT,
  price_per_security DECIMAL(10,2),
  current_phase TEXT DEFAULT 'TEAM_SETUP' CHECK (current_phase IN ('TEAM_SETUP', 'DATA_COLLECTION', 'IB_REVIEW', 'CMA_SUBMISSION', 'CMA_REVIEW', 'APPROVED', 'REJECTED')),
  completion_percentage INTEGER DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
  assigned_ib_advisor UUID REFERENCES profiles(id),
  assigned_cma_officer UUID REFERENCES profiles(id),
  priority TEXT DEFAULT 'MEDIUM' CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'URGENT')),
  expected_listing_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Application Sections (10 CMA sections)
CREATE TABLE application_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID REFERENCES ipo_applications(id) NOT NULL,
  section_number INTEGER NOT NULL CHECK (section_number >= 1 AND section_number <= 10),
  section_title TEXT NOT NULL,
  assigned_role TEXT NOT NULL CHECK (assigned_role IN ('ISSUER_CEO', 'ISSUER_CFO', 'ISSUER_SECRETARY', 'ISSUER_LEGAL')),
  status TEXT DEFAULT 'NOT_STARTED' CHECK (status IN ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED')),
  data JSONB DEFAULT '{}',
  validation_errors JSONB DEFAULT '[]',
  completion_percentage INTEGER DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
  estimated_time_minutes INTEGER,
  actual_time_minutes INTEGER,
  completed_by UUID REFERENCES profiles(id),
  completed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES profiles(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(application_id, section_number)
);

-- Document Storage Metadata
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID REFERENCES ipo_applications(id) NOT NULL,
  section_id UUID REFERENCES application_sections(id),
  filename TEXT NOT NULL,
  original_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT,
  mime_type TEXT,
  category TEXT NOT NULL,
  description TEXT,
  version INTEGER DEFAULT 1,
  checksum TEXT,
  uploaded_by UUID REFERENCES profiles(id) NOT NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE,
  is_confidential BOOLEAN DEFAULT FALSE,
  expiry_date TIMESTAMP WITH TIME ZONE
);

-- Comments and Collaboration
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID REFERENCES ipo_applications(id) NOT NULL,
  section_id UUID REFERENCES application_sections(id),
  document_id UUID REFERENCES documents(id),
  author_id UUID REFERENCES profiles(id) NOT NULL,
  content TEXT NOT NULL,
  comment_type TEXT DEFAULT 'GENERAL' CHECK (comment_type IN ('GENERAL', 'QUERY', 'FEEDBACK', 'APPROVAL', 'REJECTION')),
  is_internal BOOLEAN DEFAULT FALSE,
  is_resolved BOOLEAN DEFAULT FALSE,
  priority TEXT DEFAULT 'MEDIUM' CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH')),
  parent_comment_id UUID REFERENCES comments(id),
  attachments JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- CMA Reviews and Assessments
CREATE TABLE cma_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID REFERENCES ipo_applications(id) NOT NULL,
  reviewer_id UUID REFERENCES profiles(id) NOT NULL,
  review_type TEXT CHECK (review_type IN ('INITIAL_REVIEW', 'DETAILED_REVIEW', 'QUERY_RESPONSE', 'FINAL_REVIEW')) NOT NULL,
  status TEXT DEFAULT 'IN_PROGRESS' CHECK (status IN ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'ON_HOLD')),
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

-- Query Letters and Responses
CREATE TABLE query_letters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID REFERENCES ipo_applications(id) NOT NULL,
  review_id UUID REFERENCES cma_reviews(id),
  letter_number TEXT UNIQUE NOT NULL,
  query_type TEXT DEFAULT 'INFORMATION_REQUEST' CHECK (query_type IN ('INFORMATION_REQUEST', 'CLARIFICATION', 'ADDITIONAL_DOCUMENTS', 'COMPLIANCE_ISSUE')),
  status TEXT DEFAULT 'ISSUED' CHECK (status IN ('DRAFT', 'ISSUED', 'RESPONDED', 'OVERDUE', 'RESOLVED')),
  issued_by UUID REFERENCES profiles(id) NOT NULL,
  issued_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  due_date TIMESTAMP WITH TIME ZONE NOT NULL,
  response_date TIMESTAMP WITH TIME ZONE,
  queries JSONB NOT NULL DEFAULT '[]',
  responses JSONB DEFAULT '[]',
  is_final BOOLEAN DEFAULT FALSE
);

-- Notifications System
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id UUID REFERENCES profiles(id) NOT NULL,
  sender_id UUID REFERENCES profiles(id),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  notification_type TEXT NOT NULL CHECK (notification_type IN ('INFO', 'WARNING', 'ERROR', 'SUCCESS', 'REMINDER', 'ASSIGNMENT', 'APPROVAL', 'QUERY')),
  application_id UUID REFERENCES ipo_applications(id),
  section_id UUID REFERENCES application_sections(id),
  priority TEXT DEFAULT 'MEDIUM' CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'URGENT')),
  is_read BOOLEAN DEFAULT FALSE,
  is_email_sent BOOLEAN DEFAULT FALSE,
  action_url TEXT,
  metadata JSONB DEFAULT '{}',
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Audit Trail
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name TEXT NOT NULL,
  record_id UUID NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
  old_values JSONB,
  new_values JSONB,
  changed_by UUID REFERENCES profiles(id),
  changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT,
  application_id UUID REFERENCES ipo_applications(id)
);

-- Team Assignments (for issuer teams)
CREATE TABLE team_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID REFERENCES ipo_applications(id) NOT NULL,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('ISSUER_CEO', 'ISSUER_CFO', 'ISSUER_SECRETARY', 'ISSUER_LEGAL')),
  assigned_sections INTEGER[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  assigned_by UUID REFERENCES profiles(id),
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(application_id, user_id, role)
);

-- Indexes for performance
CREATE INDEX idx_profiles_company_id ON profiles(company_id);
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_ipo_applications_company_id ON ipo_applications(company_id);
CREATE INDEX idx_ipo_applications_status ON ipo_applications(status);
CREATE INDEX idx_ipo_applications_assigned_ib ON ipo_applications(assigned_ib_advisor);
CREATE INDEX idx_ipo_applications_assigned_cma ON ipo_applications(assigned_cma_officer);
CREATE INDEX idx_application_sections_application_id ON application_sections(application_id);
CREATE INDEX idx_application_sections_status ON application_sections(status);
CREATE INDEX idx_documents_application_id ON documents(application_id);
CREATE INDEX idx_documents_section_id ON documents(section_id);
CREATE INDEX idx_comments_application_id ON comments(application_id);
CREATE INDEX idx_comments_author_id ON comments(author_id);
CREATE INDEX idx_notifications_recipient_id ON notifications(recipient_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_audit_logs_table_record ON audit_logs(table_name, record_id);

-- Functions for automatic timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ipo_applications_updated_at BEFORE UPDATE ON ipo_applications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_application_sections_updated_at BEFORE UPDATE ON application_sections FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to generate application numbers
CREATE OR REPLACE FUNCTION generate_application_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.application_number IS NULL THEN
        NEW.application_number := 'CMA-IPO-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(NEXTVAL('application_number_seq')::TEXT, 4, '0');
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Sequence for application numbers
CREATE SEQUENCE application_number_seq START 1;

-- Trigger for application number generation
CREATE TRIGGER generate_application_number_trigger 
    BEFORE INSERT ON ipo_applications 
    FOR EACH ROW EXECUTE FUNCTION generate_application_number();

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE ipo_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE application_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE cma_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE query_letters ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_assignments ENABLE ROW LEVEL SECURITY;