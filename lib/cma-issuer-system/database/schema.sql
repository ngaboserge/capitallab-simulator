-- CMA Issuer Application System Database Schema

-- Companies table
CREATE TABLE companies (
    id VARCHAR(36) PRIMARY KEY,
    legal_name VARCHAR(255) NOT NULL,
    trading_name VARCHAR(255),
    registration_number VARCHAR(50) UNIQUE NOT NULL,
    incorporation_date DATE NOT NULL,
    company_type ENUM('PUBLIC_LIMITED') NOT NULL DEFAULT 'PUBLIC_LIMITED',
    registered_address_street VARCHAR(255) NOT NULL,
    registered_address_city VARCHAR(100) NOT NULL,
    registered_address_province VARCHAR(100) NOT NULL,
    registered_address_postal_code VARCHAR(20),
    registered_address_country VARCHAR(100) NOT NULL DEFAULT 'Rwanda',
    contact_email VARCHAR(255) NOT NULL,
    contact_phone VARCHAR(50) NOT NULL,
    contact_fax VARCHAR(50),
    contact_website VARCHAR(255),
    status ENUM('ACTIVE', 'INACTIVE', 'SUSPENDED') NOT NULL DEFAULT 'ACTIVE',
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_modified TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_registration_number (registration_number),
    INDEX idx_legal_name (legal_name),
    INDEX idx_status (status)
);

-- Users table
CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role ENUM('ISSUER', 'CMA_OFFICER', 'ADMIN') NOT NULL,
    company_id VARCHAR(36),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    last_login TIMESTAMP NULL,
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    permissions JSON,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE SET NULL,
    INDEX idx_email (email),
    INDEX idx_role (role),
    INDEX idx_company_id (company_id)
);

-- Applications table - main application data
CREATE TABLE applications (
    id VARCHAR(36) PRIMARY KEY,
    company_id VARCHAR(36) NOT NULL,
    status ENUM('DRAFT', 'SUBMITTED', 'IN_REVIEW', 'QUERY_ISSUED', 'QUERY_RESPONDED', 'APPROVED', 'REJECTED', 'WITHDRAWN') NOT NULL DEFAULT 'DRAFT',
    submission_date TIMESTAMP NULL,
    last_modified TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    current_section INT NOT NULL DEFAULT 1,
    completion_percentage DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    
    -- Section 1: Company Identity
    company_legal_name VARCHAR(255),
    company_trading_name VARCHAR(255),
    company_type ENUM('PUBLIC_LIMITED'),
    incorporation_date DATE,
    registration_number VARCHAR(50),
    registered_address JSON,
    contact_info JSON,
    
    -- Section 2: Capitalization
    authorized_share_capital DECIMAL(15,2),
    paid_up_share_capital DECIMAL(15,2),
    net_assets_before_offer DECIMAL(15,2),
    audit_period_end DATE,
    going_concern_confirmation BOOLEAN,
    
    -- Section 3: Share Ownership
    total_issued_shares BIGINT,
    shares_to_public BIGINT,
    public_shareholding_percentage DECIMAL(5,2),
    expected_shareholders INT,
    free_transferability BOOLEAN,
    
    -- Section 4: Governance
    directors JSON,
    senior_management JSON,
    independent_director_appointed BOOLEAN,
    fit_and_proper_confirmation BOOLEAN,
    
    -- Section 5: Legal Compliance
    ongoing_litigation TEXT,
    material_litigation_confirmation BOOLEAN,
    
    -- Section 6: Offer Details
    offer_type ENUM('EQUITY', 'DEBT', 'HYBRID'),
    total_amount_to_raise DECIMAL(15,2),
    number_of_securities BIGINT,
    price_per_security DECIMAL(10,2),
    use_of_proceeds TEXT,
    offer_timetable TEXT,
    
    -- Section 7: Prospectus
    material_information_disclosed BOOLEAN,
    forecast_assumptions_reasonable BOOLEAN,
    
    -- Section 8: Publication
    cma_submission_date TIMESTAMP,
    
    -- Section 9: Post-Approval (minimal data, mostly documents)
    
    -- Section 10: Declarations
    authorized_officer JSON,
    investment_adviser JSON,
    
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    INDEX idx_company_id (company_id),
    INDEX idx_status (status),
    INDEX idx_submission_date (submission_date),
    INDEX idx_last_modified (last_modified)
);-- Document
s table - file metadata and relationships
CREATE TABLE documents (
    id VARCHAR(36) PRIMARY KEY,
    application_id VARCHAR(36) NOT NULL,
    filename VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    size BIGINT NOT NULL,
    upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    uploaded_by VARCHAR(36) NOT NULL,
    category VARCHAR(100) NOT NULL,
    description TEXT,
    url VARCHAR(500) NOT NULL,
    checksum VARCHAR(64) NOT NULL,
    version INT NOT NULL DEFAULT 1,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    section_id INT,
    field_id VARCHAR(100),
    FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE,
    FOREIGN KEY (uploaded_by) REFERENCES users(id),
    INDEX idx_application_id (application_id),
    INDEX idx_category (category),
    INDEX idx_section_id (section_id),
    INDEX idx_upload_date (upload_date),
    INDEX idx_uploaded_by (uploaded_by)
);

-- Validation Results table - compliance tracking
CREATE TABLE validation_results (
    id VARCHAR(36) PRIMARY KEY,
    application_id VARCHAR(36) NOT NULL,
    section_id INT NOT NULL,
    field_id VARCHAR(100),
    rule_id VARCHAR(100) NOT NULL,
    status ENUM('PASS', 'FAIL', 'WARNING') NOT NULL,
    message TEXT NOT NULL,
    severity ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL') NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    validated_by VARCHAR(36),
    FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE,
    FOREIGN KEY (validated_by) REFERENCES users(id),
    INDEX idx_application_id (application_id),
    INDEX idx_section_id (section_id),
    INDEX idx_status (status),
    INDEX idx_severity (severity),
    INDEX idx_timestamp (timestamp)
);

-- CMA Reviews table - regulatory workflow
CREATE TABLE cma_reviews (
    id VARCHAR(36) PRIMARY KEY,
    application_id VARCHAR(36) NOT NULL,
    reviewer_id VARCHAR(36) NOT NULL,
    reviewer_name VARCHAR(255) NOT NULL,
    status ENUM('PENDING', 'IN_REVIEW', 'QUERY_ISSUED', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    compliance_score DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    risk_rating ENUM('LOW', 'MEDIUM', 'HIGH') NOT NULL DEFAULT 'MEDIUM',
    assigned_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    review_start_date TIMESTAMP NULL,
    review_completed_date TIMESTAMP NULL,
    FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewer_id) REFERENCES users(id),
    INDEX idx_application_id (application_id),
    INDEX idx_reviewer_id (reviewer_id),
    INDEX idx_status (status),
    INDEX idx_assigned_date (assigned_date)
);

-- CMA Comments table - internal notes and comments
CREATE TABLE cma_comments (
    id VARCHAR(36) PRIMARY KEY,
    review_id VARCHAR(36) NOT NULL,
    commenter_id VARCHAR(36) NOT NULL,
    commenter_name VARCHAR(255) NOT NULL,
    section_id INT,
    field_id VARCHAR(100),
    comment TEXT NOT NULL,
    is_internal BOOLEAN NOT NULL DEFAULT TRUE,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    parent_comment_id VARCHAR(36),
    FOREIGN KEY (review_id) REFERENCES cma_reviews(id) ON DELETE CASCADE,
    FOREIGN KEY (commenter_id) REFERENCES users(id),
    FOREIGN KEY (parent_comment_id) REFERENCES cma_comments(id),
    INDEX idx_review_id (review_id),
    INDEX idx_commenter_id (commenter_id),
    INDEX idx_timestamp (timestamp),
    INDEX idx_section_id (section_id)
);

-- CMA Decisions table - final decisions
CREATE TABLE cma_decisions (
    id VARCHAR(36) PRIMARY KEY,
    review_id VARCHAR(36) NOT NULL,
    decision_type ENUM('APPROVED', 'REJECTED', 'QUERY_ISSUED') NOT NULL,
    decision_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    decision_by VARCHAR(36) NOT NULL,
    decision_reason TEXT NOT NULL,
    conditions JSON,
    valid_until DATE,
    FOREIGN KEY (review_id) REFERENCES cma_reviews(id) ON DELETE CASCADE,
    FOREIGN KEY (decision_by) REFERENCES users(id),
    INDEX idx_review_id (review_id),
    INDEX idx_decision_type (decision_type),
    INDEX idx_decision_date (decision_date)
);

-- Query Letters table - CMA queries to issuers
CREATE TABLE query_letters (
    id VARCHAR(36) PRIMARY KEY,
    review_id VARCHAR(36) NOT NULL,
    letter_number VARCHAR(50) NOT NULL UNIQUE,
    issue_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    due_date TIMESTAMP NOT NULL,
    status ENUM('ISSUED', 'RESPONDED', 'OVERDUE') NOT NULL DEFAULT 'ISSUED',
    issued_by VARCHAR(36) NOT NULL,
    responded_date TIMESTAMP NULL,
    FOREIGN KEY (review_id) REFERENCES cma_reviews(id) ON DELETE CASCADE,
    FOREIGN KEY (issued_by) REFERENCES users(id),
    INDEX idx_review_id (review_id),
    INDEX idx_letter_number (letter_number),
    INDEX idx_status (status),
    INDEX idx_due_date (due_date)
);

-- Queries table - individual queries within query letters
CREATE TABLE queries (
    id VARCHAR(36) PRIMARY KEY,
    query_letter_id VARCHAR(36) NOT NULL,
    section_id INT NOT NULL,
    field_id VARCHAR(100),
    query_text TEXT NOT NULL,
    response_text TEXT,
    is_resolved BOOLEAN NOT NULL DEFAULT FALSE,
    priority ENUM('LOW', 'MEDIUM', 'HIGH') NOT NULL DEFAULT 'MEDIUM',
    FOREIGN KEY (query_letter_id) REFERENCES query_letters(id) ON DELETE CASCADE,
    INDEX idx_query_letter_id (query_letter_id),
    INDEX idx_section_id (section_id),
    INDEX idx_is_resolved (is_resolved),
    INDEX idx_priority (priority)
);

-- Approval Letters table - formal approval documents
CREATE TABLE approval_letters (
    id VARCHAR(36) PRIMARY KEY,
    review_id VARCHAR(36) NOT NULL,
    letter_number VARCHAR(50) NOT NULL UNIQUE,
    issue_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    approved_by VARCHAR(36) NOT NULL,
    conditions JSON,
    validity_period INT NOT NULL DEFAULT 365,
    document_id VARCHAR(36),
    FOREIGN KEY (review_id) REFERENCES cma_reviews(id) ON DELETE CASCADE,
    FOREIGN KEY (approved_by) REFERENCES users(id),
    FOREIGN KEY (document_id) REFERENCES documents(id),
    INDEX idx_review_id (review_id),
    INDEX idx_letter_number (letter_number),
    INDEX idx_issue_date (issue_date)
);-
- Audit Trail table - comprehensive system logging
CREATE TABLE audit_trail (
    id VARCHAR(36) PRIMARY KEY,
    entity_type ENUM('APPLICATION', 'DOCUMENT', 'REVIEW', 'USER', 'SYSTEM') NOT NULL,
    entity_id VARCHAR(36) NOT NULL,
    action VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    user_id VARCHAR(36),
    user_name VARCHAR(255),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45),
    user_agent TEXT,
    old_value JSON,
    new_value JSON,
    metadata JSON,
    FOREIGN KEY (user_id) REFERENCES users(id),
    INDEX idx_entity_type (entity_type),
    INDEX idx_entity_id (entity_id),
    INDEX idx_action (action),
    INDEX idx_timestamp (timestamp),
    INDEX idx_user_id (user_id)
);

-- Notifications table - system notifications
CREATE TABLE notifications (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    type ENUM('INFO', 'WARNING', 'ERROR', 'SUCCESS') NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expiry_date TIMESTAMP NULL,
    action_url VARCHAR(500),
    metadata JSON,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_type (type),
    INDEX idx_is_read (is_read),
    INDEX idx_created_date (created_date)
);

-- Application Sections table - track section completion status
CREATE TABLE application_sections (
    id VARCHAR(36) PRIMARY KEY,
    application_id VARCHAR(36) NOT NULL,
    section_number INT NOT NULL,
    section_name VARCHAR(100) NOT NULL,
    is_completed BOOLEAN NOT NULL DEFAULT FALSE,
    completion_percentage DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    last_modified TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE,
    UNIQUE KEY unique_app_section (application_id, section_number),
    INDEX idx_application_id (application_id),
    INDEX idx_section_number (section_number),
    INDEX idx_is_completed (is_completed)
);

-- Validation Rules table - configurable validation rules
CREATE TABLE validation_rules (
    id VARCHAR(36) PRIMARY KEY,
    rule_code VARCHAR(50) NOT NULL UNIQUE,
    rule_name VARCHAR(255) NOT NULL,
    section_id INT NOT NULL,
    field_id VARCHAR(100),
    rule_type ENUM('REQUIRED', 'FORMAT', 'RANGE', 'CALCULATION', 'BUSINESS_LOGIC') NOT NULL,
    rule_expression TEXT NOT NULL,
    error_message TEXT NOT NULL,
    severity ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL') NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_rule_code (rule_code),
    INDEX idx_section_id (section_id),
    INDEX idx_rule_type (rule_type),
    INDEX idx_is_active (is_active)
);

-- System Configuration table - system settings and parameters
CREATE TABLE system_config (
    id VARCHAR(36) PRIMARY KEY,
    config_key VARCHAR(100) NOT NULL UNIQUE,
    config_value TEXT NOT NULL,
    config_type ENUM('STRING', 'NUMBER', 'BOOLEAN', 'JSON') NOT NULL DEFAULT 'STRING',
    description TEXT,
    is_editable BOOLEAN NOT NULL DEFAULT TRUE,
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_modified TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_config_key (config_key)
);

-- Insert default system configuration
INSERT INTO system_config (id, config_key, config_value, config_type, description) VALUES
(UUID(), 'MIN_AUTHORIZED_CAPITAL', '500000000', 'NUMBER', 'Minimum authorized share capital in RWF'),
(UUID(), 'MIN_NET_ASSETS', '1000000000', 'NUMBER', 'Minimum net assets before offer in RWF'),
(UUID(), 'MIN_PUBLIC_SHAREHOLDING', '25', 'NUMBER', 'Minimum public shareholding percentage'),
(UUID(), 'MIN_SHAREHOLDERS', '1000', 'NUMBER', 'Minimum number of shareholders post-offer'),
(UUID(), 'AUDIT_PERIOD_UNLISTED', '4', 'NUMBER', 'Audit period requirement for unlisted companies (months)'),
(UUID(), 'AUDIT_PERIOD_LISTED', '6', 'NUMBER', 'Audit period requirement for listed companies (months)'),
(UUID(), 'QUERY_RESPONSE_DAYS', '30', 'NUMBER', 'Days allowed for query response'),
(UUID(), 'APPLICATION_VALIDITY_DAYS', '365', 'NUMBER', 'Application validity period in days'),
(UUID(), 'MAX_FILE_SIZE_MB', '50', 'NUMBER', 'Maximum file upload size in MB'),
(UUID(), 'ALLOWED_FILE_TYPES', '["pdf", "doc", "docx", "xls", "xlsx", "jpg", "jpeg", "png"]', 'JSON', 'Allowed file upload types');

-- Create indexes for performance optimization
CREATE INDEX idx_applications_composite ON applications(company_id, status, submission_date);
CREATE INDEX idx_documents_composite ON documents(application_id, category, is_active);
CREATE INDEX idx_validation_results_composite ON validation_results(application_id, status, severity);
CREATE INDEX idx_audit_trail_composite ON audit_trail(entity_type, entity_id, timestamp);
CREATE INDEX idx_notifications_composite ON notifications(user_id, is_read, created_date);