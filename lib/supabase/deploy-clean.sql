-- CMA Backend Integration - Clean Deployment
-- This version safely handles existing tables and storage setup

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- CORE TABLES (with DROP IF EXISTS for clean deployment)
-- ============================================================================

-- Drop existing tables in correct order (respecting foreign keys)
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS cma_reviews CASCADE;
DROP TABLE IF EXISTS comments CASCADE;
DROP TABLE IF EXISTS documents CASCADE;
DROP TABLE IF EXISTS application_sections CASCADE;
DROP TABLE IF EXISTS ipo_applications CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
DROP TABLE IF EXISTS companies CASCADE;

-- Companies Table
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
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Profiles Table (extends Supabase auth.users)
CREATE TABLE profiles (
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
CREATE TABLE ipo_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE NOT NULL,
  application_number TEXT UNIQUE,
  status TEXT DEFAULT 'DRAFT' CHECK (status IN (
    'DRAFT',
    'IN_PROGRESS',
    'SUBMITTED',
    'IB_REVIEW',
    'QUERY_TO_ISSUER',
    'UNDER_REVIEW',
    'CMA_REVIEW',
    'QUERY_ISSUED',
    'APPROVED',
    'REJECTED',
    'WITHDRAWN'
  )),
  current_phase TEXT DEFAULT 'DATA_COLLECTION' CHECK (current_phase IN (
    'DATA_COLLECTION',
    'IB_REVIEW',
    'CMA_SUBMISSION',
    'CMA_REVIEW',
    'COMPLETED'
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
CREATE TABLE application_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID REFERENCES ipo_applications(id) ON DELETE CASCADE NOT NULL,
  section_number INTEGER NOT NULL CHECK (section_number >= 1 AND section_number <= 10),
  section_title TEXT NOT NULL,
  status TEXT DEFAULT 'NOT_STARTED' CHECK (status IN (
    'NOT_STARTED',
    'IN_PROGRESS',
    'COMPLETED',
    'UNDER_REVIEW',
    'APPROVED',
    'REJECTED'
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
CREATE TABLE documents (
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
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID REFERENCES ipo_applications(id) ON DELETE CASCADE NOT NULL,
  section_id UUID REFERENCES application_sections(id) ON DELETE SET NULL,
  document_id UUID REFERENCES documents(id) ON DELETE SET NULL,
  author_id UUID REFERENCES profiles(id) ON DELETE SET NULL NOT NULL,
  content TEXT NOT NULL,
  comment_type TEXT DEFAULT 'GENERAL' CHECK (comment_type IN (
    'GENERAL',
    'QUERY',
    'FEEDBACK',
    'APPROVAL',
    'REJECTION'
  )),
  is_internal BOOLEAN DEFAULT FALSE,
  is_resolved BOOLEAN DEFAULT FALSE,
  priority TEXT DEFAULT 'MEDIUM' CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH')),
  parent_comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- CMA Reviews Table
CREATE TABLE cma_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID REFERENCES ipo_applications(id) ON DELETE CASCADE NOT NULL,
  reviewer_id UUID REFERENCES profiles(id) ON DELETE SET NULL NOT NULL,
  review_type TEXT CHECK (review_type IN (
    'INITIAL_REVIEW',
    'DETAILED_REVIEW',
    'QUERY_RESPONSE',
    'FINAL_REVIEW'
  )) NOT NULL,
  status TEXT DEFAULT 'IN_PROGRESS' CHECK (status IN (
    'PENDING',
    'IN_PROGRESS',
    'COMPLETED',
    'ON_HOLD'
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
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN (
    'APPLICATION_SUBMITTED',
    'APPLICATION_ASSIGNED',
    'COMMENT_ADDED',
    'STATUS_CHANGED',
    'QUERY_ISSUED',
    'DECISION_MADE',
    'INFO',
    'WARNING',
    'ERROR',
    'SUCCESS'
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
CREATE TABLE audit_logs (
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

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX idx_profiles_company_id ON profiles(company_id);
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_username ON profiles(username);
CREATE INDEX idx_profiles_email ON profiles(email);

CREATE INDEX idx_ipo_applications_company_id ON ipo_applications(company_id);
CREATE INDEX idx_ipo_applications_status ON ipo_applications(status);
CREATE INDEX idx_ipo_applications_current_phase ON ipo_applications(current_phase);
CREATE INDEX idx_ipo_applications_assigned_ib ON ipo_applications(assigned_ib_advisor);
CREATE INDEX idx_ipo_applications_assigned_cma ON ipo_applications(assigned_cma_officer);
CREATE INDEX idx_ipo_applications_application_number ON ipo_applications(application_number);

CREATE INDEX idx_application_sections_application_id ON application_sections(application_id);
CREATE INDEX idx_application_sections_status ON application_sections(status);
CREATE INDEX idx_application_sections_section_number ON application_sections(section_number);

CREATE INDEX idx_documents_application_id ON documents(application_id);
CREATE INDEX idx_documents_section_id ON documents(section_id);
CREATE INDEX idx_documents_uploaded_by ON documents(uploaded_by);
CREATE INDEX idx_documents_category ON documents(category);

CREATE INDEX idx_comments_application_id ON comments(application_id);
CREATE INDEX idx_comments_section_id ON comments(section_id);
CREATE INDEX idx_comments_author_id ON comments(author_id);
CREATE INDEX idx_comments_is_internal ON comments(is_internal);
CREATE INDEX idx_comments_parent_comment_id ON comments(parent_comment_id);

CREATE INDEX idx_cma_reviews_application_id ON cma_reviews(application_id);
CREATE INDEX idx_cma_reviews_reviewer_id ON cma_reviews(reviewer_id);
CREATE INDEX idx_cma_reviews_status ON cma_reviews(status);

CREATE INDEX idx_notifications_recipient_id ON notifications(recipient_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_application_id ON notifications(application_id);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);

CREATE INDEX idx_audit_logs_table_record ON audit_logs(table_name, record_id);
CREATE INDEX idx_audit_logs_changed_by ON audit_logs(changed_by);
CREATE INDEX idx_audit_logs_application_id ON audit_logs(application_id);
CREATE INDEX idx_audit_logs_changed_at ON audit_logs(changed_at DESC);

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

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
    new_app_number TEXT;
BEGIN
    IF NEW.application_number IS NULL THEN
        year_str := TO_CHAR(NOW(), 'YYYY');
        
        SELECT COALESCE(MAX(
            CAST(SUBSTRING(application_number FROM 'CMA-IPO-' || year_str || '-(\d+)') AS INTEGER)
        ), 0) + 1
        INTO next_num
        FROM ipo_applications
        WHERE application_number LIKE 'CMA-IPO-' || year_str || '-%';
        
        new_app_number := 'CMA-IPO-' || year_str || '-' || LPAD(next_num::TEXT, 4, '0');
        NEW.application_number := new_app_number;
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE OR REPLACE FUNCTION calculate_application_completion()
RETURNS TRIGGER AS $$
DECLARE
    total_sections INTEGER;
    completed_sections INTEGER;
    completion_pct INTEGER;
BEGIN
    SELECT 
        COUNT(*),
        COUNT(*) FILTER (WHERE status = 'COMPLETED')
    INTO total_sections, completed_sections
    FROM application_sections
    WHERE application_id = NEW.application_id;
    
    IF total_sections > 0 THEN
        completion_pct := (completed_sections * 100) / total_sections;
    ELSE
        completion_pct := 0;
    END IF;
    
    UPDATE ipo_applications
    SET completion_percentage = completion_pct
    WHERE id = NEW.application_id;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE OR REPLACE FUNCTION create_audit_log()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO audit_logs (table_name, record_id, action, new_values, changed_by)
        VALUES (TG_TABLE_NAME, NEW.id, 'INSERT', to_jsonb(NEW), auth.uid());
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO audit_logs (table_name, record_id, action, old_values, new_values, changed_by)
        VALUES (TG_TABLE_NAME, NEW.id, 'UPDATE', to_jsonb(OLD), to_jsonb(NEW), auth.uid());
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO audit_logs (table_name, record_id, action, old_values, changed_by)
        VALUES (TG_TABLE_NAME, OLD.id, 'DELETE', to_jsonb(OLD), auth.uid());
        RETURN OLD;
    END IF;
END;
$$ language 'plpgsql';

-- ============================================================================
-- TRIGGERS
-- ============================================================================

CREATE TRIGGER update_companies_updated_at 
    BEFORE UPDATE ON companies 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at 
    BEFORE UPDATE ON profiles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ipo_applications_updated_at 
    BEFORE UPDATE ON ipo_applications 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_application_sections_updated_at 
    BEFORE UPDATE ON application_sections 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comments_updated_at 
    BEFORE UPDATE ON comments 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER generate_application_number_trigger 
    BEFORE INSERT ON ipo_applications 
    FOR EACH ROW EXECUTE FUNCTION generate_application_number();

CREATE TRIGGER calculate_completion_trigger
    AFTER INSERT OR UPDATE ON application_sections
    FOR EACH ROW EXECUTE FUNCTION calculate_application_completion();

CREATE TRIGGER audit_ipo_applications
    AFTER INSERT OR UPDATE OR DELETE ON ipo_applications
    FOR EACH ROW EXECUTE FUNCTION create_audit_log();

CREATE TRIGGER audit_application_sections
    AFTER INSERT OR UPDATE OR DELETE ON application_sections
    FOR EACH ROW EXECUTE FUNCTION create_audit_log();

CREATE TRIGGER audit_cma_reviews
    AFTER INSERT OR UPDATE OR DELETE ON cma_reviews
    FOR EACH ROW EXECUTE FUNCTION create_audit_log();

-- ============================================================================
-- ENABLE RLS
-- ============================================================================

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
-- RLS HELPER FUNCTIONS
-- ============================================================================

CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT AS $$
    SELECT role FROM profiles WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_user_company_id()
RETURNS UUID AS $$
    SELECT company_id FROM profiles WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_cma_staff()
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() 
        AND role IN ('CMA_REGULATOR', 'CMA_ADMIN')
    );
$$ LANGUAGE SQL SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_ib_advisor()
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() 
        AND role = 'IB_ADVISOR'
    );
$$ LANGUAGE SQL SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_issuer()
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() 
        AND role = 'ISSUER'
    );
$$ LANGUAGE SQL SECURITY DEFINER;

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

-- PROFILES
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "Service role can insert profiles" ON profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "CMA Admin can view all profiles" ON profiles FOR SELECT USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'CMA_ADMIN'));

-- COMPANIES
CREATE POLICY "Issuers can view own company" ON companies FOR SELECT USING (id IN (SELECT company_id FROM profiles WHERE id = auth.uid()));
CREATE POLICY "Issuers can update own company" ON companies FOR UPDATE USING (id IN (SELECT company_id FROM profiles WHERE id = auth.uid())) WITH CHECK (id IN (SELECT company_id FROM profiles WHERE id = auth.uid()));
CREATE POLICY "Service role can insert companies" ON companies FOR INSERT WITH CHECK (true);
CREATE POLICY "IB Advisors can view assigned companies" ON companies FOR SELECT USING (is_ib_advisor() AND id IN (SELECT company_id FROM ipo_applications WHERE assigned_ib_advisor = auth.uid()));
CREATE POLICY "CMA can view submitted companies" ON companies FOR SELECT USING (is_cma_staff() AND id IN (SELECT company_id FROM ipo_applications WHERE status IN ('UNDER_REVIEW', 'CMA_REVIEW', 'QUERY_ISSUED', 'APPROVED', 'REJECTED')));

-- IPO APPLICATIONS
CREATE POLICY "Issuers can view own applications" ON ipo_applications FOR SELECT USING (is_issuer() AND company_id = get_user_company_id());
CREATE POLICY "Issuers can create applications" ON ipo_applications FOR INSERT WITH CHECK (is_issuer() AND company_id = get_user_company_id());
CREATE POLICY "Issuers can update own applications" ON ipo_applications FOR UPDATE USING (is_issuer() AND company_id = get_user_company_id() AND status IN ('DRAFT', 'IN_PROGRESS', 'QUERY_TO_ISSUER')) WITH CHECK (is_issuer() AND company_id = get_user_company_id());
CREATE POLICY "IB Advisors can view assigned applications" ON ipo_applications FOR SELECT USING (is_ib_advisor() AND (assigned_ib_advisor = auth.uid() OR status IN ('SUBMITTED', 'IB_REVIEW')));
CREATE POLICY "IB Advisors can update assigned applications" ON ipo_applications FOR UPDATE USING (is_ib_advisor() AND assigned_ib_advisor = auth.uid() AND status IN ('SUBMITTED', 'IB_REVIEW', 'QUERY_TO_ISSUER')) WITH CHECK (is_ib_advisor() AND assigned_ib_advisor = auth.uid());
CREATE POLICY "CMA can view submitted applications" ON ipo_applications FOR SELECT USING (is_cma_staff() AND status IN ('UNDER_REVIEW', 'CMA_REVIEW', 'QUERY_ISSUED', 'APPROVED', 'REJECTED'));
CREATE POLICY "CMA can update applications under review" ON ipo_applications FOR UPDATE USING (is_cma_staff() AND (assigned_cma_officer = auth.uid() OR assigned_cma_officer IS NULL) AND status IN ('UNDER_REVIEW', 'CMA_REVIEW', 'QUERY_ISSUED')) WITH CHECK (is_cma_staff());

-- APPLICATION SECTIONS
CREATE POLICY "Issuers can view own sections" ON application_sections FOR SELECT USING (is_issuer() AND application_id IN (SELECT id FROM ipo_applications WHERE company_id = get_user_company_id()));
CREATE POLICY "Issuers can insert sections" ON application_sections FOR INSERT WITH CHECK (is_issuer() AND application_id IN (SELECT id FROM ipo_applications WHERE company_id = get_user_company_id()));
CREATE POLICY "Issuers can update own sections" ON application_sections FOR UPDATE USING (is_issuer() AND application_id IN (SELECT id FROM ipo_applications WHERE company_id = get_user_company_id() AND status IN ('DRAFT', 'IN_PROGRESS', 'QUERY_TO_ISSUER'))) WITH CHECK (is_issuer() AND application_id IN (SELECT id FROM ipo_applications WHERE company_id = get_user_company_id()));
CREATE POLICY "IB Advisors can view assigned sections" ON application_sections FOR SELECT USING (is_ib_advisor() AND application_id IN (SELECT id FROM ipo_applications WHERE assigned_ib_advisor = auth.uid()));
CREATE POLICY "CMA can view submitted sections" ON application_sections FOR SELECT USING (is_cma_staff() AND application_id IN (SELECT id FROM ipo_applications WHERE status IN ('UNDER_REVIEW', 'CMA_REVIEW', 'QUERY_ISSUED', 'APPROVED', 'REJECTED')));

-- DOCUMENTS
CREATE POLICY "Issuers can view own documents" ON documents FOR SELECT USING (is_issuer() AND application_id IN (SELECT id FROM ipo_applications WHERE company_id = get_user_company_id()));
CREATE POLICY "Issuers can upload documents" ON documents FOR INSERT WITH CHECK (is_issuer() AND application_id IN (SELECT id FROM ipo_applications WHERE company_id = get_user_company_id()));
CREATE POLICY "IB Advisors can view assigned documents" ON documents FOR SELECT USING (is_ib_advisor() AND application_id IN (SELECT id FROM ipo_applications WHERE assigned_ib_advisor = auth.uid()));
CREATE POLICY "CMA can view submitted documents" ON documents FOR SELECT USING (is_cma_staff() AND application_id IN (SELECT id FROM ipo_applications WHERE status IN ('UNDER_REVIEW', 'CMA_REVIEW', 'QUERY_ISSUED', 'APPROVED', 'REJECTED')));

-- COMMENTS
CREATE POLICY "Users can view accessible comments" ON comments FOR SELECT USING ((is_issuer() AND NOT is_internal AND application_id IN (SELECT id FROM ipo_applications WHERE company_id = get_user_company_id())) OR (is_ib_advisor() AND NOT is_internal AND application_id IN (SELECT id FROM ipo_applications WHERE assigned_ib_advisor = auth.uid())) OR (is_cma_staff() AND application_id IN (SELECT id FROM ipo_applications WHERE status IN ('UNDER_REVIEW', 'CMA_REVIEW', 'QUERY_ISSUED', 'APPROVED', 'REJECTED'))));
CREATE POLICY "Users can add comments" ON comments FOR INSERT WITH CHECK ((is_issuer() AND application_id IN (SELECT id FROM ipo_applications WHERE company_id = get_user_company_id())) OR (is_ib_advisor() AND application_id IN (SELECT id FROM ipo_applications WHERE assigned_ib_advisor = auth.uid())) OR (is_cma_staff() AND application_id IN (SELECT id FROM ipo_applications WHERE status IN ('UNDER_REVIEW', 'CMA_REVIEW', 'QUERY_ISSUED', 'APPROVED', 'REJECTED'))));

-- CMA REVIEWS
CREATE POLICY "CMA can view reviews" ON cma_reviews FOR SELECT USING (is_cma_staff());
CREATE POLICY "CMA can create reviews" ON cma_reviews FOR INSERT WITH CHECK (is_cma_staff() AND reviewer_id = auth.uid());

-- NOTIFICATIONS
CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (recipient_id = auth.uid());
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE USING (recipient_id = auth.uid()) WITH CHECK (recipient_id = auth.uid());
CREATE POLICY "Service role can create notifications" ON notifications FOR INSERT WITH CHECK (true);

-- AUDIT LOGS
CREATE POLICY "CMA Admin can view audit logs" ON audit_logs FOR SELECT USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'CMA_ADMIN'));
CREATE POLICY "Service role can insert audit logs" ON audit_logs FOR INSERT WITH CHECK (true);
