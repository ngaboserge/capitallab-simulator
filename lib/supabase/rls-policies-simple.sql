-- Simplified Row Level Security Policies for CMA Issuer Application System
-- These policies ensure basic access control for multi-role collaboration

-- PROFILES TABLE POLICIES
-- Users can view and update their own profile
CREATE POLICY "Users can manage own profile" ON profiles
    FOR ALL USING (auth.uid() = id);

-- COMPANIES TABLE POLICIES  
-- Users can view their own company
CREATE POLICY "Users can view own company" ON companies
    FOR SELECT USING (
        id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
    );

-- Users can update their own company
CREATE POLICY "Users can update own company" ON companies
    FOR UPDATE USING (
        id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
    );

-- IPO APPLICATIONS TABLE POLICIES
-- Users can view applications for their company
CREATE POLICY "Users can view own applications" ON ipo_applications
    FOR SELECT USING (
        company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
    );

-- Users can create applications for their company
CREATE POLICY "Users can create applications" ON ipo_applications
    FOR INSERT WITH CHECK (
        company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
    );

-- Users can update applications for their company
CREATE POLICY "Users can update own applications" ON ipo_applications
    FOR UPDATE USING (
        company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
    );

-- APPLICATION SECTIONS TABLE POLICIES
-- Users can view sections for their applications
CREATE POLICY "Users can view own sections" ON application_sections
    FOR SELECT USING (
        application_id IN (
            SELECT ia.id FROM ipo_applications ia
            JOIN profiles p ON p.company_id = ia.company_id
            WHERE p.id = auth.uid()
        )
    );

-- Users can update sections for their applications
CREATE POLICY "Users can update own sections" ON application_sections
    FOR UPDATE USING (
        application_id IN (
            SELECT ia.id FROM ipo_applications ia
            JOIN profiles p ON p.company_id = ia.company_id
            WHERE p.id = auth.uid()
        )
    );

-- DOCUMENTS TABLE POLICIES
-- Users can view documents for their applications
CREATE POLICY "Users can view own documents" ON documents
    FOR SELECT USING (
        application_id IN (
            SELECT ia.id FROM ipo_applications ia
            JOIN profiles p ON p.company_id = ia.company_id
            WHERE p.id = auth.uid()
        )
    );

-- Users can upload documents for their applications
CREATE POLICY "Users can upload documents" ON documents
    FOR INSERT WITH CHECK (
        application_id IN (
            SELECT ia.id FROM ipo_applications ia
            JOIN profiles p ON p.company_id = ia.company_id
            WHERE p.id = auth.uid()
        ) AND uploaded_by = auth.uid()
    );

-- COMMENTS TABLE POLICIES
-- Users can view comments on their applications
CREATE POLICY "Users can view own comments" ON comments
    FOR SELECT USING (
        application_id IN (
            SELECT ia.id FROM ipo_applications ia
            JOIN profiles p ON p.company_id = ia.company_id
            WHERE p.id = auth.uid()
        ) OR author_id = auth.uid()
    );

-- Users can create comments on their applications
CREATE POLICY "Users can create comments" ON comments
    FOR INSERT WITH CHECK (
        application_id IN (
            SELECT ia.id FROM ipo_applications ia
            JOIN profiles p ON p.company_id = ia.company_id
            WHERE p.id = auth.uid()
        ) AND author_id = auth.uid()
    );

-- NOTIFICATIONS TABLE POLICIES
-- Users can view their own notifications
CREATE POLICY "Users can view own notifications" ON notifications
    FOR SELECT USING (recipient_id = auth.uid());

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications" ON notifications
    FOR UPDATE USING (recipient_id = auth.uid());

-- System can create notifications
CREATE POLICY "System can create notifications" ON notifications
    FOR INSERT WITH CHECK (true);

-- TEAM ASSIGNMENTS TABLE POLICIES
-- Users can view team assignments for their applications
CREATE POLICY "Users can view own team assignments" ON team_assignments
    FOR SELECT USING (
        application_id IN (
            SELECT ia.id FROM ipo_applications ia
            JOIN profiles p ON p.company_id = ia.company_id
            WHERE p.id = auth.uid()
        ) OR user_id = auth.uid()
    );

-- Users can create team assignments for their applications
CREATE POLICY "Users can create team assignments" ON team_assignments
    FOR INSERT WITH CHECK (
        application_id IN (
            SELECT ia.id FROM ipo_applications ia
            JOIN profiles p ON p.company_id = ia.company_id
            WHERE p.id = auth.uid()
        )
    );

-- Users can update team assignments for their applications
CREATE POLICY "Users can update team assignments" ON team_assignments
    FOR UPDATE USING (
        application_id IN (
            SELECT ia.id FROM ipo_applications ia
            JOIN profiles p ON p.company_id = ia.company_id
            WHERE p.id = auth.uid()
        )
    );