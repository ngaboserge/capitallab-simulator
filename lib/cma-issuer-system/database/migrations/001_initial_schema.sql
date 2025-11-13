-- Migration: 001_initial_schema
-- Description: Initial database schema for CMA Issuer Application System
-- Created: 2025-01-01

-- Enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- Set character set and collation
SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Source the main schema file
SOURCE schema.sql;

-- Create triggers for audit trail
DELIMITER $$

-- Trigger for applications table
CREATE TRIGGER applications_audit_insert 
AFTER INSERT ON applications
FOR EACH ROW
BEGIN
    INSERT INTO audit_trail (
        id, entity_type, entity_id, action, description, 
        user_id, timestamp, new_value
    ) VALUES (
        UUID(), 'APPLICATION', NEW.id, 'CREATE', 
        CONCAT('Application created for company: ', NEW.company_id),
        @current_user_id, NOW(), JSON_OBJECT(
            'status', NEW.status,
            'company_id', NEW.company_id,
            'current_section', NEW.current_section
        )
    );
END$$

CREATE TRIGGER applications_audit_update 
AFTER UPDATE ON applications
FOR EACH ROW
BEGIN
    INSERT INTO audit_trail (
        id, entity_type, entity_id, action, description, 
        user_id, timestamp, old_value, new_value
    ) VALUES (
        UUID(), 'APPLICATION', NEW.id, 'UPDATE', 
        CONCAT('Application updated: ', NEW.id),
        @current_user_id, NOW(), 
        JSON_OBJECT(
            'status', OLD.status,
            'current_section', OLD.current_section,
            'completion_percentage', OLD.completion_percentage
        ),
        JSON_OBJECT(
            'status', NEW.status,
            'current_section', NEW.current_section,
            'completion_percentage', NEW.completion_percentage
        )
    );
END$$

-- Trigger for documents table
CREATE TRIGGER documents_audit_insert 
AFTER INSERT ON documents
FOR EACH ROW
BEGIN
    INSERT INTO audit_trail (
        id, entity_type, entity_id, action, description, 
        user_id, timestamp, new_value
    ) VALUES (
        UUID(), 'DOCUMENT', NEW.id, 'UPLOAD', 
        CONCAT('Document uploaded: ', NEW.original_name),
        NEW.uploaded_by, NOW(), JSON_OBJECT(
            'filename', NEW.filename,
            'category', NEW.category,
            'size', NEW.size,
            'application_id', NEW.application_id
        )
    );
END$$

-- Trigger for cma_reviews table
CREATE TRIGGER cma_reviews_audit_update 
AFTER UPDATE ON cma_reviews
FOR EACH ROW
BEGIN
    INSERT INTO audit_trail (
        id, entity_type, entity_id, action, description, 
        user_id, timestamp, old_value, new_value
    ) VALUES (
        UUID(), 'REVIEW', NEW.id, 'STATUS_CHANGE', 
        CONCAT('Review status changed from ', OLD.status, ' to ', NEW.status),
        NEW.reviewer_id, NOW(), 
        JSON_OBJECT('status', OLD.status, 'compliance_score', OLD.compliance_score),
        JSON_OBJECT('status', NEW.status, 'compliance_score', NEW.compliance_score)
    );
END$$

DELIMITER ;

-- Insert default validation rules
INSERT INTO validation_rules (id, rule_code, rule_name, section_id, field_id, rule_type, rule_expression, error_message, severity) VALUES
(UUID(), 'REQ_COMPANY_NAME', 'Company Legal Name Required', 1, 'company_legal_name', 'REQUIRED', 'NOT NULL AND LENGTH > 0', 'Company legal name is required', 'CRITICAL'),
(UUID(), 'REQ_REGISTRATION_NUMBER', 'Registration Number Required', 1, 'registration_number', 'REQUIRED', 'NOT NULL AND LENGTH > 0', 'Company registration number is required', 'CRITICAL'),
(UUID(), 'MIN_AUTHORIZED_CAPITAL', 'Minimum Authorized Capital', 2, 'authorized_share_capital', 'RANGE', '>= 500000000', 'Authorized share capital must be at least RWF 500,000,000', 'CRITICAL'),
(UUID(), 'MIN_NET_ASSETS', 'Minimum Net Assets', 2, 'net_assets_before_offer', 'RANGE', '>= 1000000000', 'Net assets before offer must be at least RWF 1,000,000,000', 'CRITICAL'),
(UUID(), 'MIN_PUBLIC_SHAREHOLDING', 'Minimum Public Shareholding', 3, 'public_shareholding_percentage', 'RANGE', '>= 25', 'Public shareholding must be at least 25%', 'CRITICAL'),
(UUID(), 'MIN_SHAREHOLDERS', 'Minimum Shareholders', 3, 'expected_shareholders', 'RANGE', '>= 1000', 'Must have at least 1,000 shareholders post-offer', 'CRITICAL'),
(UUID(), 'REQ_INDEPENDENT_DIRECTOR', 'Independent Director Required', 4, 'independent_director_appointed', 'REQUIRED', '= TRUE', 'At least one independent director must be appointed', 'HIGH'),
(UUID(), 'REQ_FIT_PROPER', 'Fit and Proper Confirmation', 4, 'fit_and_proper_confirmation', 'REQUIRED', '= TRUE', 'Fit and proper declarations must be confirmed', 'HIGH');

-- Create initial admin user (password should be changed on first login)
INSERT INTO users (id, email, first_name, last_name, role, is_active, permissions) VALUES
(UUID(), 'admin@cma.gov.rw', 'System', 'Administrator', 'ADMIN', TRUE, '["MANAGE_USERS", "MANAGE_APPLICATIONS", "MANAGE_REVIEWS", "SYSTEM_CONFIG"]');

-- Migration completed successfully
INSERT INTO audit_trail (id, entity_type, entity_id, action, description, timestamp) VALUES
(UUID(), 'SYSTEM', 'MIGRATION', 'SCHEMA_INIT', 'Initial database schema created successfully', NOW());