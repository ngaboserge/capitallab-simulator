-- Row Level Security Policies for CMA Issuer Application System
-- These policies ensure proper access control for multi-role collaboration

-- PROFILES TABLE POLICIES
-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- CMA staff can view all profiles
CREATE POLICY "CMA staff can view all profiles" ON profiles
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role LIKE 'CMA_%')
    );

-- IB Advisors can view issuer profiles for their assigned applications
CREATE POLICY "IB Advisors can view assigned issuer profiles" ON profiles
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'IB_ADVISOR') AND
        EXISTS (
            SELECT 1 FROM ipo_applications ia
            WHERE ia.assigned_ib_advisor = auth.uid()
            AND ia.company_id = profiles.company_id
        )
    );

-- COMPANIES TABLE POLICIES
-- Issuer team members can view their own company
CREATE POLICY "Issuer team can view own company" ON companies
    FOR SELECT USING (
        id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
    );

-- CMA staff can view all companies
CREATE POLICY "CMA staff can view all companies" ON companies
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role LIKE 'CMA_%')
    );

-- IB Advisors can view companies for their assigned applications
CREATE POLICY "IB Advisors can view assigned companies" ON companies
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'IB_ADVISOR') AND
        EXISTS (
            SELECT 1 FROM ipo_applications ia
            WHERE ia.assigned_ib_advisor = auth.uid()
            AND ia.company_id = companies.id
        )
    );

-- IPO APPLICATIONS TABLE POLICIES
-- Issuer team members can view their company's applications
CREATE POLICY "Issuer team can view own applications" ON ipo_applications
    FOR SELECT USING (
        company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
    );

-- Issuer team members can update their company's applications (if in draft)
CREATE POLICY "Issuer team can update draft applications" ON ipo_applications
    FOR UPDATE USING (
        company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
        AND status = 'DRAFT'
    );

-- IB Advisors can view and update assigned applications
CREATE POLICY "IB Advisors can access assigned applications" ON ipo_applications
    FOR ALL USING (assigned_ib_advisor = auth.uid());

-- CMA staff can view all applications
CREATE POLICY "CMA staff can view all applications" ON ipo_applications
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role LIKE 'CMA_%')
    );

-- CMA officers can update assigned applications
CREATE POLICY "CMA officers can update assigned applications" ON ipo_applications
    FOR UPDATE USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role LIKE 'CMA_%') AND
        (assigned_cma_officer = auth.uid() OR 
         EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'CMA_ADMIN'))
    );

-- APPLICATION SECTIONS TABLE POLICIES
-- Issuer team members can view sections for their applications
CREATE POLICY "Issuer team can view own application sections" ON application_sections
    FOR SELECT USING (
        is_issuer_team_member(auth.uid(), application_id)
    );

-- Issuer team members can update sections assigned to their role
CREATE POLICY "Issuer team can update assigned sections" ON application_sections
    FOR UPDATE USING (
        is_issuer_team_member(auth.uid(), application_id) AND
        assigned_role = get_user_role(auth.uid())
    );

-- IB Advisors can view sections for assigned applications
CREATE POLICY "IB Advisors can view assigned application sections" ON application_sections
    FOR SELECT USING (
        get_user_role(auth.uid()) = 'IB_ADVISOR' AND
        EXISTS (
            SELECT 1 FROM ipo_applications ia
            WHERE ia.id = application_sections.application_id
            AND ia.assigned_ib_advisor = auth.uid()
        )
    );

-- CMA staff can view all sections
CREATE POLICY "CMA staff can view all sections" ON application_sections
    FOR SELECT USING (is_cma_staff(auth.uid()));

-- CMA staff can update section status (for reviews)
CREATE POLICY "CMA staff can update section status" ON application_sections
    FOR UPDATE USING (
        is_cma_staff(auth.uid()) AND
        EXISTS (
            SELECT 1 FROM ipo_applications ia
            WHERE ia.id = application_sections.application_id
            AND (ia.assigned_cma_officer = auth.uid() OR get_user_role(auth.uid()) = 'CMA_ADMIN')
        )
    );

-- DOCUMENTS TABLE POLICIES
-- Users can view documents for applications they have access to
CREATE POLICY "Users can view accessible documents" ON documents
    FOR SELECT USING (
        -- Issuer team members can see their application documents
        is_issuer_team_member(auth.uid(), application_id) OR
        -- IB Advisors can see documents for assigned applications
        (get_user_role(auth.uid()) = 'IB_ADVISOR' AND EXISTS (
            SELECT 1 FROM ipo_applications ia
            WHERE ia.id = documents.application_id AND ia.assigned_ib_advisor = auth.uid()
        )) OR
        -- CMA staff can see all documents
        is_cma_staff(auth.uid())
    );

-- Users can upload documents for applications they have access to
CREATE POLICY "Users can upload documents" ON documents
    FOR INSERT WITH CHECK (
        -- Issuer team members can upload to their applications
        is_issuer_team_member(auth.uid(), application_id) OR
        -- IB Advisors can upload to assigned applications
        (get_user_role(auth.uid()) = 'IB_ADVISOR' AND EXISTS (
            SELECT 1 FROM ipo_applications ia
            WHERE ia.id = documents.application_id AND ia.assigned_ib_advisor = auth.uid()
        )) OR
        -- CMA staff can upload documents
        is_cma_staff(auth.uid())
    );

-- COMMENTS TABLE POLICIES
-- Users can view comments for applications they have access to
CREATE POLICY "Users can view accessible comments" ON comments
    FOR SELECT USING (
        -- Issuer team members can see comments on their applications
        is_issuer_team_member(auth.uid(), application_id) OR
        -- IB Advisors can see comments on assigned applications
        (get_user_role(auth.uid()) = 'IB_ADVISOR' AND EXISTS (
            SELECT 1 FROM ipo_applications ia
            WHERE ia.id = comments.application_id AND ia.assigned_ib_advisor = auth.uid()
        )) OR
        -- CMA staff can see all comments (including internal ones)
        is_cma_staff(auth.uid()) OR
        -- Users can see their own comments
        author_id = auth.uid()
    );

-- Users can create comments on applications they have access to
CREATE POLICY "Users can create comments" ON comments
    FOR INSERT WITH CHECK (
        author_id = auth.uid() AND (
            is_issuer_team_member(auth.uid(), application_id) OR
            (get_user_role(auth.uid()) = 'IB_ADVISOR' AND EXISTS (
                SELECT 1 FROM ipo_applications ia
                WHERE ia.id = comments.application_id AND ia.assigned_ib_advisor = auth.uid()
            )) OR
            is_cma_staff(auth.uid())
        )
    );

-- CMA REVIEWS TABLE POLICIES
-- CMA staff can view all reviews
CREATE POLICY "CMA staff can view reviews" ON cma_reviews
    FOR SELECT USING (is_cma_staff(auth.uid()));

-- CMA officers can create and update their own reviews
CREATE POLICY "CMA officers can manage own reviews" ON cma_reviews
    FOR ALL USING (
        is_cma_staff(auth.uid()) AND
        (reviewer_id = auth.uid() OR get_user_role(auth.uid()) = 'CMA_ADMIN')
    );

-- IB Advisors can view reviews for their assigned applications
CREATE POLICY "IB Advisors can view assigned reviews" ON cma_reviews
    FOR SELECT USING (
        get_user_role(auth.uid()) = 'IB_ADVISOR' AND
        EXISTS (
            SELECT 1 FROM ipo_applications ia
            WHERE ia.id = cma_reviews.application_id AND ia.assigned_ib_advisor = auth.uid()
        )
    );

-- QUERY LETTERS TABLE POLICIES
-- Similar access patterns as CMA reviews
CREATE POLICY "CMA staff can manage query letters" ON query_letters
    FOR ALL USING (is_cma_staff(auth.uid()));

-- Issuer team can view query letters for their applications
CREATE POLICY "Issuer team can view own query letters" ON query_letters
    FOR SELECT USING (
        is_issuer_team_member(auth.uid(), application_id)
    );

-- IB Advisors can view query letters for assigned applications
CREATE POLICY "IB Advisors can view assigned query letters" ON query_letters
    FOR SELECT USING (
        get_user_role(auth.uid()) = 'IB_ADVISOR' AND
        EXISTS (
            SELECT 1 FROM ipo_applications ia
            WHERE ia.id = query_letters.application_id AND ia.assigned_ib_advisor = auth.uid()
        )
    );

-- NOTIFICATIONS TABLE POLICIES
-- Users can view their own notifications
CREATE POLICY "Users can view own notifications" ON notifications
    FOR SELECT USING (recipient_id = auth.uid());

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications" ON notifications
    FOR UPDATE USING (recipient_id = auth.uid());

-- System can create notifications for any user
CREATE POLICY "System can create notifications" ON notifications
    FOR INSERT WITH CHECK (true);

-- AUDIT LOGS TABLE POLICIES
-- CMA Admin can view all audit logs
CREATE POLICY "CMA Admin can view audit logs" ON audit_logs
    FOR SELECT USING (get_user_role(auth.uid()) = 'CMA_ADMIN');

-- Users can view audit logs for their own actions
CREATE POLICY "Users can view own audit logs" ON audit_logs
    FOR SELECT USING (changed_by = auth.uid());

-- TEAM ASSIGNMENTS TABLE POLICIES
-- Issuer team members can view assignments for their applications
CREATE POLICY "Issuer team can view own assignments" ON team_assignments
    FOR SELECT USING (
        is_issuer_team_member(auth.uid(), application_id) OR
        user_id = auth.uid()
    );

-- Issuer CEOs can manage team assignments for their applications
CREATE POLICY "Issuer CEOs can manage team assignments" ON team_assignments
    FOR ALL USING (
        get_user_role(auth.uid()) = 'ISSUER_CEO' AND
        EXISTS (
            SELECT 1 FROM ipo_applications ia
            JOIN profiles p ON p.company_id = ia.company_id
            WHERE ia.id = team_assignments.application_id
            AND p.id = auth.uid()
        )
    );

-- CMA staff can view all team assignments
CREATE POLICY "CMA staff can view team assignments" ON team_assignments
    FOR SELECT USING (is_cma_staff(auth.uid()));

-- IB Advisors can view team assignments for assigned applications
CREATE POLICY "IB Advisors can view assigned team assignments" ON team_assignments
    FOR SELECT USING (
        get_user_role(auth.uid()) = 'IB_ADVISOR' AND
        EXISTS (
            SELECT 1 FROM ipo_applications ia
            WHERE ia.id = team_assignments.application_id AND ia.assigned_ib_advisor = auth.uid()
        )
    );