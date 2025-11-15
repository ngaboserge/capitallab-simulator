-- Create IPO applications and sections for companies that don't have them yet
-- This is a one-time migration for existing companies

DO $$
DECLARE
    company_record RECORD;
    new_application_id UUID;
    section_titles TEXT[] := ARRAY[
        'Company Identity & Legal Form',
        'Capitalization & Financial Strength',
        'Share Ownership & Distribution',
        'Governance & Management',
        'Legal & Regulatory Compliance',
        'Offer Details (IPO Information)',
        'Prospectus & Disclosure Checklist',
        'Publication & Advertisement',
        'Post-Approval Undertakings',
        'Declarations & Contacts'
    ];
    section_roles TEXT[] := ARRAY['CEO', 'CFO', 'CEO', 'CEO', 'LEGAL_ADVISOR', 'CFO', 'SECRETARY', 'SECRETARY', 'CEO', 'CEO'];
    i INTEGER;
BEGIN
    -- Loop through all companies that don't have an IPO application
    FOR company_record IN 
        SELECT c.id, c.legal_name
        FROM companies c
        LEFT JOIN ipo_applications ia ON ia.company_id = c.id
        WHERE ia.id IS NULL
    LOOP
        RAISE NOTICE 'Creating application for company: % (%)', company_record.legal_name, company_record.id;
        
        -- Create IPO application
        INSERT INTO ipo_applications (
            company_id,
            status,
            completion_percentage
        ) VALUES (
            company_record.id,
            'DRAFT',
            0
        ) RETURNING id INTO new_application_id;
        
        RAISE NOTICE 'Created application: %', new_application_id;
        
        -- Create all 10 sections
        FOR i IN 1..10 LOOP
            INSERT INTO application_sections (
                application_id,
                section_number,
                section_title,
                assigned_role,
                status,
                data,
                completion_percentage
            ) VALUES (
                new_application_id,
                i,
                section_titles[i],
                section_roles[i],
                'NOT_STARTED',
                '{}'::jsonb,
                0
            );
        END LOOP;
        
        RAISE NOTICE 'Created 10 sections for application: %', new_application_id;
    END LOOP;
    
    RAISE NOTICE 'Migration complete!';
END $$;
