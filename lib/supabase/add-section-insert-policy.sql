-- Add INSERT policy for application_sections if it doesn't exist
-- This allows users to create sections for their own applications

DO $$ 
BEGIN
    -- Drop existing policy if it exists
    DROP POLICY IF EXISTS "Users can insert own sections" ON application_sections;
    
    -- Create new policy
    CREATE POLICY "Users can insert own sections" ON application_sections 
    FOR INSERT 
    WITH CHECK (
        application_id IN (
            SELECT ia.id FROM ipo_applications ia
            JOIN profiles p ON p.company_id = ia.company_id
            WHERE p.id = auth.uid()
        )
    );
END $$;
