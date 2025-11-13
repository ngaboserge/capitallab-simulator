-- Feedback System Schema
-- Enables IB Advisor to Issuer communication

-- Application Feedback Table
CREATE TABLE IF NOT EXISTS application_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID REFERENCES ipo_applications(id) ON DELETE CASCADE NOT NULL,
  section_id UUID REFERENCES application_sections(id) ON DELETE SET NULL,
  category TEXT NOT NULL,
  issue TEXT NOT NULL,
  priority TEXT DEFAULT 'MEDIUM' CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH')),
  status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'IN_PROGRESS', 'RESOLVED')),
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  resolved_at TIMESTAMP WITH TIME ZONE,
  issuer_response TEXT,
  ib_response TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Feedback Comments Table (for threaded discussions)
CREATE TABLE IF NOT EXISTS feedback_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feedback_id UUID REFERENCES application_feedback(id) ON DELETE CASCADE NOT NULL,
  author_id UUID REFERENCES profiles(id) ON DELETE SET NULL NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_feedback_application_id ON application_feedback(application_id);
CREATE INDEX IF NOT EXISTS idx_feedback_status ON application_feedback(status);
CREATE INDEX IF NOT EXISTS idx_feedback_created_by ON application_feedback(created_by);
CREATE INDEX IF NOT EXISTS idx_feedback_comments_feedback_id ON feedback_comments(feedback_id);
CREATE INDEX IF NOT EXISTS idx_feedback_comments_author_id ON feedback_comments(author_id);

-- Trigger for updated_at
CREATE TRIGGER update_feedback_updated_at 
    BEFORE UPDATE ON application_feedback 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies
ALTER TABLE application_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback_comments ENABLE ROW LEVEL SECURITY;

-- IB Advisors can create and view feedback for their applications
CREATE POLICY "IB Advisors can manage feedback" ON application_feedback
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM ipo_applications
      WHERE ipo_applications.id = application_feedback.application_id
      AND ipo_applications.assigned_ib_advisor = auth.uid()
    )
  );

-- Issuers can view and respond to feedback for their applications
CREATE POLICY "Issuers can view and respond to feedback" ON application_feedback
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM ipo_applications
      JOIN profiles ON profiles.company_id = ipo_applications.company_id
      WHERE ipo_applications.id = application_feedback.application_id
      AND profiles.id = auth.uid()
    )
  );

-- CMA can view all feedback
CREATE POLICY "CMA can view all feedback" ON application_feedback
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('CMA_REGULATOR', 'CMA_ADMIN')
    )
  );

-- Feedback comments policies
CREATE POLICY "Users can view feedback comments" ON feedback_comments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM application_feedback
      JOIN ipo_applications ON ipo_applications.id = application_feedback.application_id
      WHERE application_feedback.id = feedback_comments.feedback_id
      AND (
        ipo_applications.assigned_ib_advisor = auth.uid()
        OR EXISTS (
          SELECT 1 FROM profiles
          WHERE profiles.id = auth.uid()
          AND profiles.company_id = ipo_applications.company_id
        )
        OR EXISTS (
          SELECT 1 FROM profiles
          WHERE profiles.id = auth.uid()
          AND profiles.role IN ('CMA_REGULATOR', 'CMA_ADMIN')
        )
      )
    )
  );

CREATE POLICY "Users can create feedback comments" ON feedback_comments
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM application_feedback
      JOIN ipo_applications ON ipo_applications.id = application_feedback.application_id
      WHERE application_feedback.id = feedback_comments.feedback_id
      AND (
        ipo_applications.assigned_ib_advisor = auth.uid()
        OR EXISTS (
          SELECT 1 FROM profiles
          WHERE profiles.id = auth.uid()
          AND profiles.company_id = ipo_applications.company_id
        )
      )
    )
  );
