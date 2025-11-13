-- CapitalLab Extension Schema
-- Extends existing mysql-schema.sql with institutional capital markets features

-- =====================================================
-- INSTITUTIONAL ROLES & USER MANAGEMENT
-- =====================================================

-- Institutional user roles
CREATE TABLE institutional_roles (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  role_name ENUM('issuer', 'ib_advisor', 'broker', 'investor', 'regulator', 'listing_desk', 'csd_operator', 'admin') NOT NULL,
  role_display_name VARCHAR(100) NOT NULL,
  description TEXT,
  hierarchy_level INTEGER NOT NULL, -- 1=highest (CMA), 7=lowest (Issuer)
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Institutional users (extends existing user system)
CREATE TABLE institutional_users (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id TEXT NOT NULL, -- Links to existing user system
  role_id VARCHAR(36) NOT NULL,
  institution_name VARCHAR(200),
  license_number VARCHAR(50),
  contact_email VARCHAR(100),
  contact_phone VARCHAR(20),
  is_active BOOLEAN DEFAULT true,
  approved_by VARCHAR(36),
  approved_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (role_id) REFERENCES institutional_roles(id),
  UNIQUE KEY unique_user_role (user_id, role_id)
);

-- Role permissions matrix
CREATE TABLE role_permissions (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  role_id VARCHAR(36) NOT NULL,
  permission_name VARCHAR(100) NOT NULL,
  permission_description TEXT,
  is_granted BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (role_id) REFERENCES institutional_roles(id),
  UNIQUE KEY unique_role_permission (role_id, permission_name)
);

-- =====================================================
-- CAPITAL RAISE PROCESS
-- =====================================================

-- Capital raise intents (Issuer submissions)
CREATE TABLE capital_raise_intents (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  issuer_user_id TEXT NOT NULL,
  company_name VARCHAR(200) NOT NULL,
  instrument_type ENUM('equity', 'bond', 'note', 'sukuk') NOT NULL,
  target_amount DECIMAL(15,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'RWF',
  purpose TEXT NOT NULL,
  timeline_months INTEGER,
  status ENUM('submitted', 'ib_assigned', 'in_due_diligence', 'filed', 'approved', 'rejected', 'listed') DEFAULT 'submitted',
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- IB-Issuer assignments
CREATE TABLE ib_assignments (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  capital_raise_id VARCHAR(36) NOT NULL,
  ib_user_id TEXT NOT NULL,
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  assignment_type ENUM('auto', 'manual', 'requested') DEFAULT 'auto',
  status ENUM('active', 'completed', 'terminated') DEFAULT 'active',
  FOREIGN KEY (capital_raise_id) REFERENCES capital_raise_intents(id) ON DELETE CASCADE,
  UNIQUE KEY unique_assignment (capital_raise_id, ib_user_id)
);

-- Due diligence requests
CREATE TABLE due_diligence_requests (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  capital_raise_id VARCHAR(36) NOT NULL,
  ib_user_id TEXT NOT NULL,
  request_type ENUM('kyc', 'financials', 'projections', 'risk_assessment', 'legal_docs', 'other') NOT NULL,
  request_title VARCHAR(200) NOT NULL,
  request_description TEXT,
  required_documents JSON, -- Array of required document types
  status ENUM('pending', 'submitted', 'approved', 'rejected') DEFAULT 'pending',
  requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  submitted_at TIMESTAMP NULL,
  reviewed_at TIMESTAMP NULL,
  FOREIGN KEY (capital_raise_id) REFERENCES capital_raise_intents(id) ON DELETE CASCADE
);

-- Document uploads (responses to due diligence)
CREATE TABLE document_uploads (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  due_diligence_id VARCHAR(36) NOT NULL,
  uploaded_by TEXT NOT NULL,
  document_name VARCHAR(200) NOT NULL,
  document_type VARCHAR(100),
  file_path VARCHAR(500),
  file_size INTEGER,
  mime_type VARCHAR(100),
  document_hash VARCHAR(64), -- SHA-256 hash for integrity
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (due_diligence_id) REFERENCES due_diligence_requests(id) ON DELETE CASCADE
);

-- Prospectus filings
CREATE TABLE prospectus_filings (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  capital_raise_id VARCHAR(36) NOT NULL,
  ib_user_id TEXT NOT NULL,
  filing_data JSON NOT NULL, -- Structured prospectus data
  version INTEGER DEFAULT 1,
  status ENUM('draft', 'submitted', 'under_review', 'approved', 'rejected') DEFAULT 'draft',
  submitted_at TIMESTAMP NULL,
  reviewed_at TIMESTAMP NULL,
  reviewer_comments TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (capital_raise_id) REFERENCES capital_raise_intents(id) ON DELETE CASCADE
);

-- =====================================================
-- REGULATORY & LISTING LAYER
-- =====================================================

-- Regulatory reviews (CMA simulation)
CREATE TABLE regulatory_reviews (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  prospectus_filing_id VARCHAR(36) NOT NULL,
  reviewer_user_id TEXT NOT NULL,
  review_status ENUM('pending', 'in_progress', 'approved', 'rejected', 'requires_amendment') DEFAULT 'pending',
  review_comments TEXT,
  compliance_issues JSON, -- Array of compliance issues found
  rule_references JSON, -- CMA rule codes referenced
  reviewed_at TIMESTAMP NULL,
  decision_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (prospectus_filing_id) REFERENCES prospectus_filings(id) ON DELETE CASCADE
);

-- Virtual ISIN registry
CREATE TABLE virtual_isins (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  isin_code VARCHAR(20) NOT NULL UNIQUE, -- e.g., RWA-SME-2025-001
  capital_raise_id VARCHAR(36) NOT NULL,
  instrument_name VARCHAR(200) NOT NULL,
  instrument_type ENUM('equity', 'bond', 'note', 'sukuk') NOT NULL,
  issuer_name VARCHAR(200) NOT NULL,
  face_value DECIMAL(10,2),
  authorized_units BIGINT NOT NULL,
  currency VARCHAR(3) DEFAULT 'RWF',
  issue_date DATE,
  maturity_date DATE NULL,
  coupon_rate DECIMAL(5,4) NULL,
  coupon_frequency ENUM('annual', 'semi_annual', 'quarterly', 'monthly') NULL,
  day_count_convention VARCHAR(20) NULL,
  status ENUM('created', 'listed', 'suspended', 'delisted') DEFAULT 'created',
  created_by TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (capital_raise_id) REFERENCES capital_raise_intents(id) ON DELETE CASCADE
);

-- Listing approvals
CREATE TABLE listing_approvals (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  virtual_isin_id VARCHAR(36) NOT NULL,
  listing_desk_user_id TEXT NOT NULL,
  approval_status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  listing_date DATE,
  trading_start_date DATE,
  approval_comments TEXT,
  listing_fees DECIMAL(10,2) DEFAULT 0,
  approved_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (virtual_isin_id) REFERENCES virtual_isins(id) ON DELETE CASCADE
);

-- =====================================================
-- VIRTUAL CSD & SETTLEMENT
-- =====================================================

-- Virtual CSD registry (master instrument registry)
CREATE TABLE virtual_csd_registry (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  isin_code VARCHAR(20) NOT NULL UNIQUE,
  virtual_isin_id VARCHAR(36) NOT NULL,
  total_issued_units BIGINT NOT NULL,
  outstanding_units BIGINT NOT NULL,
  registry_status ENUM('active', 'suspended', 'matured', 'redeemed') DEFAULT 'active',
  last_corporate_action_date DATE NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (virtual_isin_id) REFERENCES virtual_isins(id) ON DELETE CASCADE
);

-- Broker-investor relationships
CREATE TABLE broker_investor_links (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  broker_user_id TEXT NOT NULL,
  investor_user_id TEXT NOT NULL,
  activation_status ENUM('pending', 'active', 'suspended', 'terminated') DEFAULT 'pending',
  kyc_status ENUM('pending', 'completed', 'rejected') DEFAULT 'pending',
  activation_date TIMESTAMP NULL,
  termination_date TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_broker_investor (broker_user_id, investor_user_id)
);

-- Sub-accounts (investor holdings under brokers)
CREATE TABLE sub_accounts (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  broker_investor_link_id VARCHAR(36) NOT NULL,
  isin_code VARCHAR(20) NOT NULL,
  units_held BIGINT DEFAULT 0,
  average_cost_per_unit DECIMAL(10,4) DEFAULT 0,
  total_cost_basis DECIMAL(15,2) DEFAULT 0,
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (broker_investor_link_id) REFERENCES broker_investor_links(id) ON DELETE CASCADE,
  UNIQUE KEY unique_subaccount (broker_investor_link_id, isin_code)
);

-- Enhanced trades table for institutional trading
CREATE TABLE institutional_trades (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  trade_reference VARCHAR(50) NOT NULL UNIQUE,
  isin_code VARCHAR(20) NOT NULL,
  trade_type ENUM('buy', 'sell') NOT NULL,
  quantity BIGINT NOT NULL,
  price DECIMAL(10,4) NOT NULL,
  total_value DECIMAL(15,2) NOT NULL,
  order_type ENUM('limit') DEFAULT 'limit', -- Only limit orders allowed
  buyer_broker_user_id TEXT NOT NULL,
  seller_broker_user_id TEXT NOT NULL,
  buyer_investor_user_id TEXT NOT NULL,
  seller_investor_user_id TEXT NOT NULL,
  trade_status ENUM('matched', 'settling', 'settled', 'failed') DEFAULT 'matched',
  matched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  settled_at TIMESTAMP NULL,
  settlement_reference VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Settlement transactions (DVP simulation)
CREATE TABLE settlement_transactions (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  trade_id VARCHAR(36) NOT NULL,
  settlement_type ENUM('dvp', 'corporate_action', 'allocation') DEFAULT 'dvp',
  debit_subaccount_id VARCHAR(36),
  credit_subaccount_id VARCHAR(36),
  units_transferred BIGINT NOT NULL,
  cash_amount DECIMAL(15,2) NOT NULL,
  settlement_status ENUM('pending', 'completed', 'failed') DEFAULT 'pending',
  settlement_date DATE NOT NULL,
  value_date DATE NOT NULL,
  processed_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (trade_id) REFERENCES institutional_trades(id) ON DELETE CASCADE,
  FOREIGN KEY (debit_subaccount_id) REFERENCES sub_accounts(id),
  FOREIGN KEY (credit_subaccount_id) REFERENCES sub_accounts(id)
);

-- =====================================================
-- CORPORATE ACTIONS
-- =====================================================

-- Corporate actions engine
CREATE TABLE corporate_actions (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  isin_code VARCHAR(20) NOT NULL,
  action_type ENUM('coupon', 'dividend', 'redemption', 'rights_issue', 'bonus_issue') NOT NULL,
  announcement_date DATE NOT NULL,
  record_date DATE NOT NULL,
  payment_date DATE NOT NULL,
  rate_or_amount DECIMAL(10,4), -- Coupon rate or dividend amount
  currency VARCHAR(3) DEFAULT 'RWF',
  status ENUM('announced', 'processed', 'completed') DEFAULT 'announced',
  description TEXT,
  created_by TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  processed_at TIMESTAMP NULL
);

-- Corporate action entitlements
CREATE TABLE corporate_action_entitlements (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  corporate_action_id VARCHAR(36) NOT NULL,
  sub_account_id VARCHAR(36) NOT NULL,
  entitled_units BIGINT NOT NULL,
  entitlement_amount DECIMAL(15,2) NOT NULL,
  status ENUM('calculated', 'paid', 'failed') DEFAULT 'calculated',
  paid_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (corporate_action_id) REFERENCES corporate_actions(id) ON DELETE CASCADE,
  FOREIGN KEY (sub_account_id) REFERENCES sub_accounts(id) ON DELETE CASCADE
);

-- =====================================================
-- EDUCATIONAL ARTIFACTS & AUDIT
-- =====================================================

-- Generated documents (PDFs and certificates)
CREATE TABLE generated_documents (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  document_type ENUM('isin_certificate', 'listing_notice', 'contract_note', 'holding_statement', 'prospectus', 'regulatory_notice') NOT NULL,
  reference_id VARCHAR(36) NOT NULL, -- Links to relevant record
  document_title VARCHAR(200) NOT NULL,
  file_path VARCHAR(500),
  document_hash VARCHAR(64), -- SHA-256 hash
  watermark_text VARCHAR(200) DEFAULT 'EDUCATION SIMULATION – NO REAL MONEY / NO REGULATORY EFFECT',
  generated_for_user_id TEXT,
  generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NULL
);

-- Comprehensive audit trail
CREATE TABLE audit_trail (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id TEXT NOT NULL,
  user_role VARCHAR(50) NOT NULL,
  action_type VARCHAR(100) NOT NULL,
  action_description TEXT NOT NULL,
  reference_table VARCHAR(100),
  reference_id VARCHAR(36),
  ip_address VARCHAR(45),
  user_agent TEXT,
  session_id VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user_id (user_id),
  INDEX idx_action_type (action_type),
  INDEX idx_created_at (created_at)
);

-- Rule engine violations log
CREATE TABLE rule_violations (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id TEXT NOT NULL,
  violation_type ENUM('tick_size', 'price_band', 'circuit_breaker', 'order_type', 'access_control', 'settlement') NOT NULL,
  violation_code VARCHAR(50) NOT NULL,
  violation_message TEXT NOT NULL,
  attempted_action TEXT,
  reference_data JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_violation_type (violation_type),
  INDEX idx_user_id (user_id)
);

-- =====================================================
-- INITIAL DATA SETUP
-- =====================================================

-- Insert institutional roles
INSERT INTO institutional_roles (role_name, role_display_name, description, hierarchy_level) VALUES
('regulator', 'CMA Regulator', 'Capital Markets Authority regulatory observer role', 1),
('listing_desk', 'SHORA Exchange Listing Desk', 'SHORA Exchange listing approval authority', 2),
('csd_operator', 'CSD Operator', 'Central Securities Depository system operator', 3),
('ib_advisor', 'Investment Bank Advisor', 'Licensed investment banking advisor', 4),
('broker', 'Licensed Broker', 'Licensed broker/dealer member', 5),
('investor', 'Investor', 'Individual or institutional investor', 6),
('issuer', 'Issuer', 'Company or entity seeking to raise capital', 7),
('admin', 'System Administrator', 'Platform administrator', 0);

-- Insert basic role permissions
INSERT INTO role_permissions (role_id, permission_name, permission_description) 
SELECT id, 'submit_capital_raise_intent', 'Can submit capital raise intentions' 
FROM institutional_roles WHERE role_name = 'issuer';

INSERT INTO role_permissions (role_id, permission_name, permission_description) 
SELECT id, 'manage_due_diligence', 'Can manage due diligence process' 
FROM institutional_roles WHERE role_name = 'ib_advisor';

INSERT INTO role_permissions (role_id, permission_name, permission_description) 
SELECT id, 'create_prospectus', 'Can create and file prospectus documents' 
FROM institutional_roles WHERE role_name = 'ib_advisor';

INSERT INTO role_permissions (role_id, permission_name, permission_description) 
SELECT id, 'review_filings', 'Can review regulatory filings' 
FROM institutional_roles WHERE role_name = 'regulator';

INSERT INTO role_permissions (role_id, permission_name, permission_description) 
SELECT id, 'approve_listings', 'Can approve instrument listings' 
FROM institutional_roles WHERE role_name = 'listing_desk';

INSERT INTO role_permissions (role_id, permission_name, permission_description) 
SELECT id, 'activate_investors', 'Can activate investor accounts' 
FROM institutional_roles WHERE role_name = 'broker';

INSERT INTO role_permissions (role_id, permission_name, permission_description) 
SELECT id, 'execute_trades', 'Can execute trades on behalf of investors' 
FROM institutional_roles WHERE role_name = 'broker';

INSERT INTO role_permissions (role_id, permission_name, permission_description) 
SELECT id, 'place_orders', 'Can place trading orders (via broker)' 
FROM institutional_roles WHERE role_name = 'investor';