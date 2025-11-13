-- CMA Backend Integration - Row Level Security Policies
-- These policies enforce role-based access control for the simplified authentication system

-- ============================================================================
-- HELPER FUNCTIONS FOR RLS POLICIES
-- ============================================================================

-- Function to get current user's role
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT AS $$
    SELECT role FROM profiles WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER;

-- Function to get current user's company_id
CREATE OR REPLACE FUNCTION get_user_company_id()
RETURNS UUID AS $$
    SELECT company_id FROM profiles WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER;

-- Function to check if user is CMA staff
CREATE OR REPLACE FUNCTION is_cma_staff()
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() 
        AND role IN ('CMA_REGULATOR', 'CMA_ADMIN')
    );
$$ LANGUAGE SQL SECURITY DEFINER;

-- Function to check if user is IB Advisor
CREATE OR REPLACE FUNCTION is_ib_advisor()
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() 
        AND role = 'IB_ADVISOR'
    );
$$ LANGUAGE SQL SECURITY DEFINER;

-- Function to check if user is Issuer
CREATE OR REPLACE FUNCTION is_issuer()
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() 
        AND role = 'ISSUER'
    );
$$ LANGUAGE SQL SECURITY DEFINER;

-- ============================================================================
-- PROFILES TABLE POLICIES
-- ============================================================================

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
    ON profiles FOR SELECT
    USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- System can insert profiles (during signup)
CREATE POLICY "System can insert profiles"
    ON profiles FOR INSERT
    WITH CHECK (true);

-- CMA Admin can view all profiles
CREATE POLICY "CMA Admin can view all profiles"
    ON profiles FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role = 'CMA_ADMIN'
        )
    );

-- ============================================================================
-- COMPANIES TABLE POLICIES
-- ============================================================================

-- Issuers can view their own company
CREATE POLICY "Issuers can view own company"
    ON companies FOR SELECT
    USING (
        id IN (
            SELECT company_id FROM profiles WHERE id = auth.uid()
        )
    );

-- Issuers can update their own company
CREATE POLICY "Issuers can update own company"
    ON companies FOR UPDATE
    USING (
        id IN (
            SELECT company_id FROM profiles WHERE id = auth.uid()
        )
    )
    WITH CHECK (
        id IN (
            SELECT company_id FROM profiles WHERE id = auth.uid()
        )
    );

-- System can insert companies (during issuer signup)
CREATE POLICY "System can insert companies"
    ON companies FOR INSERT
    WITH CHECK (true);

-- IB Advisors can view companies for assigned applications
CREATE POLICY "IB Advisors can view assigned companies"
    ON companies FOR SELECT
    USING (
        is_ib_advisor() AND
        id IN (
            SELECT company_id FROM ipo_applications 
            WHERE assigned_ib_advisor = auth.uid()
        )
    );

-- CMA can view companies for submitted applications
CREATE POLICY "CMA can view submitted companies"
    ON companies FOR SELECT
    USING (
        is_cma_staff() AND
        id IN (
            SELECT company_id FROM ipo_applications 
            WHERE status IN ('UNDER_REVIEW', 'CMA_REVIEW', 'QUERY_ISSUED', 'APPROVED', 'REJECTED')
        )
    );

-- ============================================================================
-- IPO APPLICATIONS TABLE POLICIES
-- ============================================================================

-- Issuers can view their own applications
CREATE POLICY "Issuers can view own applications"
    ON ipo_applications FOR SELECT
    USING (
        is_issuer() AND
        company_id = get_user_company_id()
    );

-- Issuers can create applications for their company
CREATE POLICY "Issuers can create applications"
    ON ipo_applications FOR INSERT
    WITH CHECK (
        is_issuer() AND
        company_id = get_user_company_id()
    );

-- Issuers can update their own applications (only in DRAFT or IN_PROGRESS status)
CREATE POLICY "Issuers can update own applications"
    ON ipo_applications FOR UPDATE
    USING (
        is_issuer() AND
        company_id = get_user_company_id() AND
        status IN ('DRAFT', 'IN_PROGRESS', 'QUERY_TO_ISSUER')
    )
    WITH CHECK (
        is_issuer() AND
        company_id = get_user_company_id()
    );

-- IB Advisors can view assigned applications
CREATE POLICY "IB Advisors can view assigned applications"
    ON ipo_applications FOR SELECT
    USING (
        is_ib_advisor() AND
        (assigned_ib_advisor = auth.uid() OR status IN ('SUBMITTED', 'IB_REVIEW'))
    );

-- IB Advisors can update assigned applications
CREATE POLICY "IB Advisors can update assigned applications"
    ON ipo_applications FOR UPDATE
    USING (
        is_ib_advisor() AND
        assigned_ib_advisor = auth.uid() AND
        status IN ('SUBMITTED', 'IB_REVIEW', 'QUERY_TO_ISSUER')
    )
    WITH CHECK (
        is_ib_advisor() AND
        assigned_ib_advisor = auth.uid()
    );

-- CMA can view submitted applications
CREATE POLICY "CMA can view submitted applications"
    ON ipo_applications FOR SELECT
    USING (
        is_cma_staff() AND
        status IN ('UNDER_REVIEW', 'CMA_REVIEW', 'QUERY_ISSUED', 'APPROVED', 'REJECTED')
    );

-- CMA can update applications under review
CREATE POLICY "CMA can update applications under review"
    ON ipo_applications FOR UPDATE
    USING (
        is_cma_staff() AND
        (assigned_cma_officer = auth.uid() OR assigned_cma_officer IS NULL) AND
        status IN ('UNDER_REVIEW', 'CMA_REVIEW', 'QUERY_ISSUED')
    )
    WITH CHECK (
        is_cma_staff()
    );

-- ============================================================================
-- APPLICATION SECTIONS TABLE POLICIES
-- ============================================================================

-- Issuers can view sections for their applications
CREATE POLICY "Issuers can view own sections"
    ON application_sections FOR SELECT
    USING (
        is_issuer() AND
        application_id IN (
            SELECT id FROM ipo_applications 
            WHERE company_id = get_user_company_id()
        )
    );

-- Issuers can insert sections for their applications
CREATE POLICY "Issuers can insert sections"
    ON application_sections FOR INSERT
    WITH CHECK (
        is_issuer() AND
        application_id IN (
            SELECT id FROM ipo_applications 
            WHERE company_id = get_user_company_id()
        )
    );

-- Issuers can update sections for their applications (only in editable states)
CREATE POLICY "Issuers can update own sections"
    ON application_sections FOR UPDATE
    USING (
        is_issuer() AND
        application_id IN (
            SELECT id FROM ipo_applications 
            WHERE company_id = get_user_company_id()
            AND status IN ('DRAFT', 'IN_PROGRESS', 'QUERY_TO_ISSUER')
        )
    )
    WITH CHECK (
        is_issuer() AND
        application_id IN (
            SELECT id FROM ipo_applications 
            WHERE company_id = get_user_company_id()
        )
    );

-- IB Advisors can view sections for assigned applications
CREATE POLICY "IB Advisors can view assigned sections"
    ON application_sections FOR SELECT
    USING (
        is_ib_advisor() AND
        application_id IN (
            SELECT id FROM ipo_applications 
            WHERE assigned_ib_advisor = auth.uid()
        )
    );

-- CMA can view sections for submitted applications
CREATE POLICY "CMA can view submitted sections"
    ON application_sections FOR SELECT
    USING (
        is_cma_staff() AND
        application_id IN (
            SELECT id FROM ipo_applications 
            WHERE status IN ('UNDER_REVIEW', 'CMA_REVIEW', 'QUERY_ISSUED', 'APPROVED', 'REJECTED')
        )
    );

-- CMA can update sections during review
CREATE POLICY "CMA can update sections during review"
    ON application_sections FOR UPDATE
    USING (
        is_cma_staff() AND
        application_id IN (
            SELECT id FROM ipo_applications 
            WHERE assigned_cma_officer = auth.uid()
            AND status IN ('CMA_REVIEW', 'QUERY_ISSUED')
        )
    )
    WITH CHECK (
        is_cma_staff()
    );

-- ============================================================================
-- DOCUMENTS TABLE POLICIES
-- ============================================================================

-- Issuers can view documents for their applications
CREATE POLICY "Issuers can view own documents"
    ON documents FOR SELECT
    USING (
        is_issuer() AND
        application_id IN (
            SELECT id FROM ipo_applications 
            WHERE company_id = get_user_company_id()
        )
    );

-- Issuers can upload documents to their applications
CREATE POLICY "Issuers can upload documents"
    ON documents FOR INSERT
    WITH CHECK (
        is_issuer() AND
        application_id IN (
            SELECT id FROM ipo_applications 
            WHERE company_id = get_user_company_id()
        )
    );

-- Issuers can delete their own documents (only in editable states)
CREATE POLICY "Issuers can delete own documents"
    ON documents FOR DELETE
    USING (
        is_issuer() AND
        uploaded_by = auth.uid() AND
        application_id IN (
            SELECT id FROM ipo_applications 
            WHERE company_id = get_user_company_id()
            AND status IN ('DRAFT', 'IN_PROGRESS', 'QUERY_TO_ISSUER')
        )
    );

-- IB Advisors can view documents for assigned applications
CREATE POLICY "IB Advisors can view assigned documents"
    ON documents FOR SELECT
    USING (
        is_ib_advisor() AND
        application_id IN (
            SELECT id FROM ipo_applications 
            WHERE assigned_ib_advisor = auth.uid()
        )
    );

-- CMA can view documents for submitted applications
CREATE POLICY "CMA can view submitted documents"
    ON documents FOR SELECT
    USING (
        is_cma_staff() AND
        application_id IN (
            SELECT id FROM ipo_applications 
            WHERE status IN ('UNDER_REVIEW', 'CMA_REVIEW', 'QUERY_ISSUED', 'APPROVED', 'REJECTED')
        )
    );

-- ============================================================================
-- COMMENTS TABLE POLICIES
-- ============================================================================

-- Users can view comments for applications they have access to
CREATE POLICY "Users can view accessible comments"
    ON comments FOR SELECT
    USING (
        -- Issuers can see non-internal comments on their applications
        (is_issuer() AND 
         NOT is_internal AND
         application_id IN (
            SELECT id FROM ipo_applications 
            WHERE company_id = get_user_company_id()
         ))
        OR
        -- IB Advisors can see non-internal comments on assigned applications
        (is_ib_advisor() AND 
         NOT is_internal AND
         application_id IN (
            SELECT id FROM ipo_applications 
            WHERE assigned_ib_advisor = auth.uid()
         ))
        OR
        -- CMA can see all comments (including internal) on submitted applications
        (is_cma_staff() AND
         application_id IN (
            SELECT id FROM ipo_applications 
            WHERE status IN ('UNDER_REVIEW', 'CMA_REVIEW', 'QUERY_ISSUED', 'APPROVED', 'REJECTED')
         ))
    );

-- Users can add comments to applications they have access to
CREATE POLICY "Users can add comments"
    ON comments FOR INSERT
    WITH CHECK (
        -- Issuers can comment on their applications
        (is_issuer() AND 
         application_id IN (
            SELECT id FROM ipo_applications 
            WHERE company_id = get_user_company_id()
         ))
        OR
        -- IB Advisors can comment on assigned applications
        (is_ib_advisor() AND 
         application_id IN (
            SELECT id FROM ipo_applications 
            WHERE assigned_ib_advisor = auth.uid()
         ))
        OR
        -- CMA can comment on submitted applications
        (is_cma_staff() AND
         application_id IN (
            SELECT id FROM ipo_applications 
            WHERE status IN ('UNDER_REVIEW', 'CMA_REVIEW', 'QUERY_ISSUED', 'APPROVED', 'REJECTED')
         ))
    );

-- Users can update their own comments
CREATE POLICY "Users can update own comments"
    ON comments FOR UPDATE
    USING (author_id = auth.uid())
    WITH CHECK (author_id = auth.uid());

-- Users can delete their own comments
CREATE POLICY "Users can delete own comments"
    ON comments FOR DELETE
    USING (author_id = auth.uid());

-- ============================================================================
-- CMA REVIEWS TABLE POLICIES
-- ============================================================================

-- CMA can view all reviews
CREATE POLICY "CMA can view reviews"
    ON cma_reviews FOR SELECT
    USING (is_cma_staff());

-- CMA can create reviews
CREATE POLICY "CMA can create reviews"
    ON cma_reviews FOR INSERT
    WITH CHECK (
        is_cma_staff() AND
        reviewer_id = auth.uid()
    );

-- CMA can update their own reviews
CREATE POLICY "CMA can update own reviews"
    ON cma_reviews FOR UPDATE
    USING (
        is_cma_staff() AND
        reviewer_id = auth.uid()
    )
    WITH CHECK (
        is_cma_staff() AND
        reviewer_id = auth.uid()
    );

-- IB Advisors can view reviews for their assigned applications
CREATE POLICY "IB Advisors can view assigned reviews"
    ON cma_reviews FOR SELECT
    USING (
        is_ib_advisor() AND
        application_id IN (
            SELECT id FROM ipo_applications 
            WHERE assigned_ib_advisor = auth.uid()
        )
    );

-- Issuers can view final reviews for their applications
CREATE POLICY "Issuers can view final reviews"
    ON cma_reviews FOR SELECT
    USING (
        is_issuer() AND
        status = 'COMPLETED' AND
        application_id IN (
            SELECT id FROM ipo_applications 
            WHERE company_id = get_user_company_id()
        )
    );

-- ============================================================================
-- NOTIFICATIONS TABLE POLICIES
-- ============================================================================

-- Users can view their own notifications
CREATE POLICY "Users can view own notifications"
    ON notifications FOR SELECT
    USING (recipient_id = auth.uid());

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications"
    ON notifications FOR UPDATE
    USING (recipient_id = auth.uid())
    WITH CHECK (recipient_id = auth.uid());

-- System can create notifications for any user
CREATE POLICY "System can create notifications"
    ON notifications FOR INSERT
    WITH CHECK (true);

-- Users can delete their own notifications
CREATE POLICY "Users can delete own notifications"
    ON notifications FOR DELETE
    USING (recipient_id = auth.uid());

-- ============================================================================
-- AUDIT LOGS TABLE POLICIES
-- ============================================================================

-- CMA Admin can view all audit logs
CREATE POLICY "CMA Admin can view audit logs"
    ON audit_logs FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role = 'CMA_ADMIN'
        )
    );

-- System can insert audit logs
CREATE POLICY "System can insert audit logs"
    ON audit_logs FOR INSERT
    WITH CHECK (true);

-- Issuers can view audit logs for their applications
CREATE POLICY "Issuers can view own audit logs"
    ON audit_logs FOR SELECT
    USING (
        is_issuer() AND
        application_id IN (
            SELECT id FROM ipo_applications 
            WHERE company_id = get_user_company_id()
        )
    );

-- IB Advisors can view audit logs for assigned applications
CREATE POLICY "IB Advisors can view assigned audit logs"
    ON audit_logs FOR SELECT
    USING (
        is_ib_advisor() AND
        application_id IN (
            SELECT id FROM ipo_applications 
            WHERE assigned_ib_advisor = auth.uid()
        )
    );

-- CMA can view audit logs for submitted applications
CREATE POLICY "CMA can view submitted audit logs"
    ON audit_logs FOR SELECT
    USING (
        is_cma_staff() AND
        (application_id IN (
            SELECT id FROM ipo_applications 
            WHERE status IN ('UNDER_REVIEW', 'CMA_REVIEW', 'QUERY_ISSUED', 'APPROVED', 'REJECTED')
        ) OR application_id IS NULL)
    );
