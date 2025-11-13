-- CMA Issuer Application System - Simple Schema
-- Run this SQL in your Supabase SQL Editor

-- Step 1: Create Companies table first (no dependencies)
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  legal_name TEXT NOT NULL,
  trading_name TEXT,
  registration_number TEXT UNIQUE,
  incorporation_date DATE,
  business_description TEXT,
  registered_address JSONB,
  contact_info JSONB,
  status TEXT DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'SUSPENDED')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 2: Create Profiles table (references companies)
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

-- Step 3: Create IPO Applications table
CREATE TABLE ipo_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) NOT NULL,
  application_number TEXT UNIQUE,
  status TEXT DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'QUERY_ISSUED', 'APPROVED', 'REJECTED', 'WITHDRAWN')),
  submission_date TIMESTAMP WITH TIME ZONE,
  target_amount DECIMAL(15,2),
  securities_count BIGINT,
  price_per_security DECIMAL(10,2),
  current_phase TEXT DEFAULT 'TEAM_SETUP',
  completion_percentage INTEGER DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
  assigned_ib_advisor UUID REFERENCES profiles(id),
  assigned_cma_officer UUID REFERENCES profiles(id),
  priority TEXT DEFAULT 'MEDIUM' CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'URGENT')),
  expected_listing_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 4: Create Application Sections table
CREATE TABLE application_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID REFERENCES ipo_applications(id) NOT NULL,
  section_number INTEGER NOT NULL CHECK (section_number >= 1 AND section_number <= 10),
  section_title TEXT NOT NULL,
  assigned_role TEXT NOT NULL,
  status TEXT DEFAULT 'NOT_STARTED' CHECK (status IN ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED')),
  data JSONB DEFAULT '{}',
  validation_errors JSONB DEFAULT '[]',
  completion_percentage INTEGER DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
  completed_by UUID REFERENCES profiles(id),
  completed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES profiles(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(application_id, section_number)
);

-- Step 5: Create Team Assignments table
CREATE TABLE team_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID REFERENCES ipo_applications(id) NOT NULL,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  role TEXT NOT NULL,
  assigned_sections INTEGER[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  assigned_by UUID REFERENCES profiles(id),
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(application_id, user_id, role)
);

-- Step 6: Create Documents table
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
  uploaded_by UUID REFERENCES profiles(id) NOT NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE
);

-- Step 7: Create Comments table
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID REFERENCES ipo_applications(id) NOT NULL,
  section_id UUID REFERENCES application_sections(id),
  author_id UUID REFERENCES profiles(id) NOT NULL,
  content TEXT NOT NULL,
  is_internal BOOLEAN DEFAULT FALSE,
  parent_comment_id UUID REFERENCES comments(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 8: Create Notifications table
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id UUID REFERENCES profiles(id) NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL,
  application_id UUID REFERENCES ipo_applications(id),
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 9: Create indexes for performance
CREATE INDEX idx_profiles_company_id ON profiles(company_id);
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_ipo_applications_company_id ON ipo_applications(company_id);
CREATE INDEX idx_ipo_applications_status ON ipo_applications(status);
CREATE INDEX idx_application_sections_application_id ON application_sections(application_id);
CREATE INDEX idx_team_assignments_application_id ON team_assignments(application_id);
CREATE INDEX idx_documents_application_id ON documents(application_id);
CREATE INDEX idx_comments_application_id ON comments(application_id);
CREATE INDEX idx_notifications_recipient_id ON notifications(recipient_id);

-- Step 10: Create automatic timestamp update function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Step 11: Create triggers for updated_at
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ipo_applications_updated_at BEFORE UPDATE ON ipo_applications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_application_sections_updated_at BEFORE UPDATE ON application_sections FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Step 12: Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE ipo_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE application_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_assignments ENABLE ROW LEVEL SECURITY;

-- Step 13: Create Basic RLS Policies
-- PROFILES: Users can manage their own profile
CREATE POLICY "Users can manage own profile" ON profiles FOR ALL USING (auth.uid() = id);

-- COMPANIES: Users can view/update their own company
CREATE POLICY "Users can view own company" ON companies FOR SELECT USING (
    id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
);
CREATE POLICY "Users can update own company" ON companies FOR UPDATE USING (
    id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
);

-- IPO APPLICATIONS: Users can manage applications for their company
CREATE POLICY "Users can view own applications" ON ipo_applications FOR SELECT USING (
    company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
);
CREATE POLICY "Users can create applications" ON ipo_applications FOR INSERT WITH CHECK (
    company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
);
CREATE POLICY "Users can update own applications" ON ipo_applications FOR UPDATE USING (
    company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
);

-- APPLICATION SECTIONS: Users can manage sections for their applications
CREATE POLICY "Users can view own sections" ON application_sections FOR SELECT USING (
    application_id IN (
        SELECT ia.id FROM ipo_applications ia
        JOIN profiles p ON p.company_id = ia.company_id
        WHERE p.id = auth.uid()
    )
);
CREATE POLICY "Users can update own sections" ON application_sections FOR UPDATE USING (
    application_id IN (
        SELECT ia.id FROM ipo_applications ia
        JOIN profiles p ON p.company_id = ia.company_id
        WHERE p.id = auth.uid()
    )
);

-- TEAM ASSIGNMENTS: Users can manage team assignments for their applications
CREATE POLICY "Users can manage team assignments" ON team_assignments FOR ALL USING (
    application_id IN (
        SELECT ia.id FROM ipo_applications ia
        JOIN profiles p ON p.company_id = ia.company_id
        WHERE p.id = auth.uid()
    ) OR user_id = auth.uid()
);

-- NOTIFICATIONS: Users can view their own notifications
CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (recipient_id = auth.uid());
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE USING (recipient_id = auth.uid());
CREATE POLICY "System can create notifications" ON notifications FOR INSERT WITH CHECK (true);