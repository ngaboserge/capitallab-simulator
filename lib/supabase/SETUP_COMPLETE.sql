-- ============================================
-- CAPITALLAB COMPLETE DATABASE SETUP
-- Run this in your Supabase SQL Editor
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. PROFILES TABLE (extends auth.users)
-- ============================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL CHECK (role IN (
    'ISSUER_CEO',
    'ISSUER_CFO', 
    'ISSUER_SECRETARY',
    'ISSUER_LEGAL_ADVISOR',
    'IB_ADVISOR',
    'CMA_REGULATOR',
    'CMA_ADMIN',
    'SHORA_EXCHANGE_USER'
  )),
  company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
  phone TEXT,
  avatar_url TEXT,
  is_ib_advisor BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 2. COMPANIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  legal_name TEXT NOT NULL,
  trading_name TEXT,
  registration_number TEXT UNIQUE,
  tax_id TEXT,
  incorporation_date DATE,
  country TEXT DEFAULT 'Rwanda',
  address JSONB,
  contact_info JSONB,
  industry TEXT,
  website TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 3. IPO APPLICATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS ipo_applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  application_number TEXT UNIQUE,
  status TEXT NOT NULL DEFAULT 'DRAFT' CHECK (status IN (
    'DRAFT',
    'SUBMITTED',
    'UNDER_REVIEW',
    'QUERY_ISSUED',
    'APPROVED',
    'REJECTED',
    'WITHDRAWN'
  )),
  current_phase TEXT DEFAULT 'DATA_COLLECTION' CHECK (current_phase IN (
    'DATA_COLLECTION',
    'IB_REVIEW',
    'CMA_REVIEW',
    'APPROVED',
    'REJECTED'
  )),
  completion_percentage INTEGER DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
  target_amount DECIMAL(15, 2),
  share_price DECIMAL(10, 2),
  shares_offered INTEGER,
  assigned_ib_advisor UUID REFERENCES profiles(id) ON DELETE SET NULL,
  assigned_cma_officer UUID REFERENCES profiles(id) ON DELETE SET NULL,
  submitted_at TIMESTAMPTZ,
  approved_at TIMESTAMPTZ,
  rejected_at TIMESTAMPTZ,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 4. APPLICATION SECTIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS application_sections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_id UUID NOT NULL REFERENCES ipo_applications(id) ON DELETE CASCADE,
  section_number INTEGER NOT NULL,
  section_title TEXT NOT NULL,
  assigned_role TEXT,
  status TEXT DEFAULT 'NOT_STARTED' CHECK (status IN (
    'NOT_STARTED',
    'IN_PROGRESS',
    'COMPLETED',
    'UNDER_REVIEW',
    'APPROVED',
    'NEEDS_REVISION'
  )),
  data JSONB DEFAULT '{}',
  completion_percentage INTEGER DEFAULT 0,
  last_edited_by UUID REFERENCES profiles(id),
  last_edited_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(application_id, section_number)
);

-- ============================================
-- 5. DOCUMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_id UUID NOT NULL REFERENCES ipo_applications(id) ON DELETE CASCADE,
  section_id UUID REFERENCES application_sections(id) ON DELETE SET NULL,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  storage_path TEXT NOT NULL,
  document_type TEXT,
  uploaded_by UUID NOT NULL REFERENCES profiles(id),
  status TEXT DEFAULT 'PENDING' CHECK (status IN (
    'PENDING',
    'APPROVED',
    'REJECTED',
    'NEEDS_REVISION'
  )),
  reviewed_by UUID REFERENCES profiles(id),
  reviewed_at TIMESTAMPTZ,
  review_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 6. FEEDBACK TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS application_feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_id UUID NOT NULL REFERENCES ipo_applications(id) ON DELETE CASCADE,
  section_id UUID REFERENCES application_sections(id) ON DELETE SET NULL,
  category TEXT NOT NULL CHECK (category IN (
    'MISSING_INFO',
    'INCORRECT_DATA',
    'CLARIFICATION_NEEDED',
    'DOCUMENT_ISSUE',
    'COMPLIANCE_ISSUE',
    'OTHER'
  )),
  issue TEXT NOT NULL,
  priority TEXT DEFAULT 'MEDIUM' CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
  status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'IN_PROGRESS', 'RESOLVED', 'DISMISSED')),
  created_by UUID NOT NULL REFERENCES profiles(id),
  issuer_response TEXT,
  ib_response TEXT,
  resolved_by UUID REFERENCES profiles(id),
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 7. COMMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_id UUID NOT NULL REFERENCES ipo_applications(id) ON DELETE CASCADE,
  section_id UUID REFERENCES application_sections(id) ON DELETE SET NULL,
  author_id UUID NOT NULL REFERENCES profiles(id),
  content TEXT NOT NULL,
  is_internal BOOLEAN DEFAULT FALSE,
  parent_comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 8. NOTIFICATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recipient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN (
    'APPLICATION_SUBMITTED',
    'IB_ASSIGNED',
    'CMA_ASSIGNED',
    'QUERY_ISSUED',
    'COMMENT_ADDED',
    'STATUS_CHANGED',
    'DOCUMENT_UPLOADED',
    'APPROVAL',
    'REJECTION'
  )),
  application_id UUID REFERENCES ipo_applications(id) ON DELETE CASCADE,
  priority TEXT DEFAULT 'MEDIUM' CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH')),
  read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 9. ACTIVITY LOG TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS activity_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_id UUID REFERENCES ipo_applications(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id),
  action TEXT NOT NULL,
  details JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 10. CREATE INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_profiles_company ON profiles(company_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_applications_company ON ipo_applications(company_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON ipo_applications(status);
CREATE INDEX IF NOT EXISTS idx_applications_ib ON ipo_applications(assigned_ib_advisor);
CREATE INDEX IF NOT EXISTS idx_applications_cma ON ipo_applications(assigned_cma_officer);
CREATE INDEX IF NOT EXISTS idx_sections_application ON application_sections(application_id);
CREATE INDEX IF NOT EXISTS idx_documents_application ON documents(application_id);
CREATE INDEX IF NOT EXISTS idx_feedback_application ON application_feedback(application_id);
CREATE INDEX IF NOT EXISTS idx_comments_application ON comments(application_id);
CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON notifications(recipient_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_activity_application ON activity_log(application_id);

-- ============================================
-- 11. CREATE TRIGGERS FOR UPDATED_AT
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_applications_updated_at BEFORE UPDATE ON ipo_applications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sections_updated_at BEFORE UPDATE ON application_sections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_feedback_updated_at BEFORE UPDATE ON application_feedback
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 12. AUTO-CREATE PROFILE ON USER SIGNUP
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'ISSUER_CEO')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 13. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE ipo_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE application_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE application_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can read all profiles, update only their own
CREATE POLICY "Users can view all profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Companies: Users can view their own company
CREATE POLICY "Users can view own company" ON companies FOR SELECT 
  USING (id IN (SELECT company_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can update own company" ON companies FOR UPDATE
  USING (id IN (SELECT company_id FROM profiles WHERE id = auth.uid()));

-- Applications: Role-based access
CREATE POLICY "Issuers view own applications" ON ipo_applications FOR SELECT
  USING (
    company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
    OR assigned_ib_advisor = auth.uid()
    OR assigned_cma_officer = auth.uid()
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('CMA_ADMIN', 'CMA_REGULATOR'))
  );

CREATE POLICY "Issuers create applications" ON ipo_applications FOR INSERT
  WITH CHECK (company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Authorized users update applications" ON ipo_applications FOR UPDATE
  USING (
    company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
    OR assigned_ib_advisor = auth.uid()
    OR assigned_cma_officer = auth.uid()
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('CMA_ADMIN'))
  );

-- Sections: Same as applications
CREATE POLICY "Users view accessible sections" ON application_sections FOR SELECT
  USING (
    application_id IN (
      SELECT id FROM ipo_applications WHERE
        company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
        OR assigned_ib_advisor = auth.uid()
        OR assigned_cma_officer = auth.uid()
        OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('CMA_ADMIN', 'CMA_REGULATOR'))
    )
  );

CREATE POLICY "Users update accessible sections" ON application_sections FOR UPDATE
  USING (
    application_id IN (
      SELECT id FROM ipo_applications WHERE
        company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
        OR assigned_ib_advisor = auth.uid()
    )
  );

-- Documents: Users can view/upload documents for their applications
CREATE POLICY "Users view accessible documents" ON documents FOR SELECT
  USING (
    application_id IN (
      SELECT id FROM ipo_applications WHERE
        company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
        OR assigned_ib_advisor = auth.uid()
        OR assigned_cma_officer = auth.uid()
        OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('CMA_ADMIN', 'CMA_REGULATOR'))
    )
  );

CREATE POLICY "Users upload documents" ON documents FOR INSERT
  WITH CHECK (
    application_id IN (
      SELECT id FROM ipo_applications WHERE
        company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
        OR assigned_ib_advisor = auth.uid()
    )
  );

-- Feedback: IB Advisors create, Issuers respond
CREATE POLICY "Users view feedback" ON application_feedback FOR SELECT
  USING (
    application_id IN (
      SELECT id FROM ipo_applications WHERE
        company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
        OR assigned_ib_advisor = auth.uid()
        OR assigned_cma_officer = auth.uid()
    )
  );

CREATE POLICY "IB Advisors create feedback" ON application_feedback FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'IB_ADVISOR')
  );

CREATE POLICY "Users update feedback" ON application_feedback FOR UPDATE
  USING (
    application_id IN (
      SELECT id FROM ipo_applications WHERE
        company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
        OR assigned_ib_advisor = auth.uid()
    )
  );

-- Comments: Users can view/add comments on accessible applications
CREATE POLICY "Users view comments" ON comments FOR SELECT
  USING (
    application_id IN (
      SELECT id FROM ipo_applications WHERE
        company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
        OR assigned_ib_advisor = auth.uid()
        OR assigned_cma_officer = auth.uid()
        OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('CMA_ADMIN', 'CMA_REGULATOR'))
    )
  );

CREATE POLICY "Users add comments" ON comments FOR INSERT
  WITH CHECK (
    application_id IN (
      SELECT id FROM ipo_applications WHERE
        company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
        OR assigned_ib_advisor = auth.uid()
        OR assigned_cma_officer = auth.uid()
    )
  );

-- Notifications: Users see only their own
CREATE POLICY "Users view own notifications" ON notifications FOR SELECT
  USING (recipient_id = auth.uid());

CREATE POLICY "Users update own notifications" ON notifications FOR UPDATE
  USING (recipient_id = auth.uid());

-- Activity Log: Read-only for authorized users
CREATE POLICY "Authorized users view activity" ON activity_log FOR SELECT
  USING (
    user_id = auth.uid()
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('CMA_ADMIN', 'CMA_REGULATOR'))
  );

-- ============================================
-- 14. STORAGE BUCKETS
-- ============================================
-- Run this separately in Storage section or via SQL:
-- INSERT INTO storage.buckets (id, name, public) VALUES ('documents', 'documents', false);

-- Storage policies (run after bucket is created)
-- CREATE POLICY "Users upload to own applications" ON storage.objects FOR INSERT
--   WITH CHECK (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

-- CREATE POLICY "Users view own documents" ON storage.objects FOR SELECT
--   USING (bucket_id = 'documents');

-- ============================================
-- SETUP COMPLETE!
-- ============================================
-- Next steps:
-- 1. Create storage bucket named 'documents' in Supabase Storage
-- 2. Add your Supabase credentials to .env.local
-- 3. Test authentication flow
