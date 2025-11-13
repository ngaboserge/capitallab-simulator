-- Team Management Database Schema for Collaborative CapitalLab
-- Building Rwanda's Wall Street through University Collaboration

-- Teams table
CREATE TABLE teams (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    university VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    max_members INT NOT NULL DEFAULT 10,
    focus_areas JSON, -- Array of focus area strings
    is_public BOOLEAN DEFAULT TRUE,
    expected_duration VARCHAR(50),
    target_sector VARCHAR(100),
    status ENUM('forming', 'active', 'completed', 'paused') DEFAULT 'forming',
    invite_code VARCHAR(20) UNIQUE,
    created_by VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_university (university),
    INDEX idx_status (status),
    INDEX idx_invite_code (invite_code),
    INDEX idx_created_by (created_by)
);

-- Team members table
CREATE TABLE team_members (
    id VARCHAR(50) PRIMARY KEY,
    team_id VARCHAR(50) NOT NULL,
    user_id VARCHAR(50) NOT NULL,
    role ENUM('issuer', 'ib_advisor', 'regulator', 'listing_desk', 'broker', 'investor', 'csd_operator', 'admin') NOT NULL,
    permissions JSON, -- Role-based permissions object
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    performance_score DECIMAL(5,2) DEFAULT 0.00,
    
    FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
    UNIQUE KEY unique_team_user (team_id, user_id),
    INDEX idx_team_id (team_id),
    INDEX idx_user_id (user_id),
    INDEX idx_role (role)
);

-- Deals table (companies being taken through the process)
CREATE TABLE deals (
    id VARCHAR(50) PRIMARY KEY,
    team_id VARCHAR(50) NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    sector VARCHAR(100) NOT NULL,
    capital_target BIGINT NOT NULL, -- Amount in RWF
    description TEXT,
    current_step INT DEFAULT 1,
    total_steps INT DEFAULT 7,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    estimated_completion TIMESTAMP,
    actual_completion TIMESTAMP NULL,
    status ENUM('active', 'completed', 'paused', 'cancelled') DEFAULT 'active',
    
    FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
    INDEX idx_team_id (team_id),
    INDEX idx_status (status),
    INDEX idx_sector (sector)
);

-- Workflow progress tracking
CREATE TABLE workflow_steps (
    id VARCHAR(50) PRIMARY KEY,
    deal_id VARCHAR(50) NOT NULL,
    step_number INT NOT NULL,
    step_name VARCHAR(255) NOT NULL,
    assigned_role ENUM('issuer', 'ib_advisor', 'regulator', 'listing_desk', 'broker', 'investor', 'csd_operator') NOT NULL,
    assigned_to VARCHAR(50), -- user_id
    status ENUM('pending', 'in_progress', 'completed', 'blocked', 'rejected') DEFAULT 'pending',
    started_at TIMESTAMP NULL,
    completed_at TIMESTAMP NULL,
    due_date TIMESTAMP NULL,
    priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
    notes TEXT,
    
    FOREIGN KEY (deal_id) REFERENCES deals(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_to) REFERENCES team_members(user_id),
    INDEX idx_deal_id (deal_id),
    INDEX idx_assigned_to (assigned_to),
    INDEX idx_status (status),
    INDEX idx_step_number (step_number)
);

-- Documents and files
CREATE TABLE deal_documents (
    id VARCHAR(50) PRIMARY KEY,
    deal_id VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    type ENUM('prospectus', 'financial_statement', 'regulatory_filing', 'due_diligence', 'presentation', 'other') NOT NULL,
    file_path VARCHAR(500),
    file_size BIGINT,
    mime_type VARCHAR(100),
    created_by VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_modified TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    status ENUM('draft', 'review', 'approved', 'rejected') DEFAULT 'draft',
    version INT DEFAULT 1,
    
    FOREIGN KEY (deal_id) REFERENCES deals(id) ON DELETE CASCADE,
    INDEX idx_deal_id (deal_id),
    INDEX idx_created_by (created_by),
    INDEX idx_type (type),
    INDEX idx_status (status)
);

-- Document reviews and approvals
CREATE TABLE document_reviews (
    id VARCHAR(50) PRIMARY KEY,
    document_id VARCHAR(50) NOT NULL,
    reviewer_id VARCHAR(50) NOT NULL,
    reviewer_role ENUM('issuer', 'ib_advisor', 'regulator', 'listing_desk', 'broker', 'investor', 'csd_operator') NOT NULL,
    status ENUM('pending', 'approved', 'rejected', 'needs_revision') DEFAULT 'pending',
    comments TEXT,
    reviewed_at TIMESTAMP NULL,
    
    FOREIGN KEY (document_id) REFERENCES deal_documents(id) ON DELETE CASCADE,
    INDEX idx_document_id (document_id),
    INDEX idx_reviewer_id (reviewer_id),
    INDEX idx_status (status)
);

-- Team communications
CREATE TABLE team_messages (
    id VARCHAR(50) PRIMARY KEY,
    team_id VARCHAR(50) NOT NULL,
    sender_id VARCHAR(50) NOT NULL,
    message TEXT NOT NULL,
    message_type ENUM('general', 'announcement', 'workflow', 'document', 'system') DEFAULT 'general',
    related_deal_id VARCHAR(50) NULL,
    related_document_id VARCHAR(50) NULL,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_read JSON, -- Object mapping user_id to read status
    
    FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
    FOREIGN KEY (related_deal_id) REFERENCES deals(id) ON DELETE SET NULL,
    FOREIGN KEY (related_document_id) REFERENCES deal_documents(id) ON DELETE SET NULL,
    INDEX idx_team_id (team_id),
    INDEX idx_sender_id (sender_id),
    INDEX idx_sent_at (sent_at)
);

-- Cross-team investments (teams investing in other teams' companies)
CREATE TABLE cross_team_investments (
    id VARCHAR(50) PRIMARY KEY,
    investor_team_id VARCHAR(50) NOT NULL,
    target_deal_id VARCHAR(50) NOT NULL,
    amount BIGINT NOT NULL, -- Investment amount in RWF
    shares_acquired BIGINT,
    investment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    current_value BIGINT, -- Current market value
    status ENUM('active', 'sold', 'cancelled') DEFAULT 'active',
    
    FOREIGN KEY (investor_team_id) REFERENCES teams(id) ON DELETE CASCADE,
    FOREIGN KEY (target_deal_id) REFERENCES deals(id) ON DELETE CASCADE,
    INDEX idx_investor_team (investor_team_id),
    INDEX idx_target_deal (target_deal_id),
    INDEX idx_investment_date (investment_date)
);

-- Listed companies (completed deals that become tradeable)
CREATE TABLE listed_companies (
    id VARCHAR(50) PRIMARY KEY,
    deal_id VARCHAR(50) NOT NULL,
    team_id VARCHAR(50) NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    ticker_symbol VARCHAR(10) UNIQUE,
    sector VARCHAR(100) NOT NULL,
    shares_issued BIGINT NOT NULL,
    initial_price DECIMAL(10,2) NOT NULL,
    current_price DECIMAL(10,2) NOT NULL,
    market_cap BIGINT GENERATED ALWAYS AS (shares_issued * current_price) STORED,
    listing_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    performance_1d DECIMAL(5,2) DEFAULT 0.00,
    performance_7d DECIMAL(5,2) DEFAULT 0.00,
    performance_30d DECIMAL(5,2) DEFAULT 0.00,
    trading_volume_24h BIGINT DEFAULT 0,
    status ENUM('active', 'suspended', 'delisted') DEFAULT 'active',
    
    FOREIGN KEY (deal_id) REFERENCES deals(id),
    FOREIGN KEY (team_id) REFERENCES teams(id),
    UNIQUE KEY unique_ticker (ticker_symbol),
    INDEX idx_team_id (team_id),
    INDEX idx_sector (sector),
    INDEX idx_listing_date (listing_date),
    INDEX idx_market_cap (market_cap)
);

-- Trading transactions between teams
CREATE TABLE trading_transactions (
    id VARCHAR(50) PRIMARY KEY,
    company_id VARCHAR(50) NOT NULL,
    buyer_team_id VARCHAR(50) NOT NULL,
    seller_team_id VARCHAR(50) NULL, -- NULL for IPO purchases
    shares BIGINT NOT NULL,
    price_per_share DECIMAL(10,2) NOT NULL,
    total_amount BIGINT GENERATED ALWAYS AS (shares * price_per_share) STORED,
    transaction_type ENUM('buy', 'sell', 'ipo') NOT NULL,
    transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('pending', 'completed', 'cancelled') DEFAULT 'completed',
    
    FOREIGN KEY (company_id) REFERENCES listed_companies(id),
    FOREIGN KEY (buyer_team_id) REFERENCES teams(id),
    FOREIGN KEY (seller_team_id) REFERENCES teams(id),
    INDEX idx_company_id (company_id),
    INDEX idx_buyer_team (buyer_team_id),
    INDEX idx_seller_team (seller_team_id),
    INDEX idx_transaction_date (transaction_date)
);

-- Team performance metrics
CREATE TABLE team_metrics (
    id VARCHAR(50) PRIMARY KEY,
    team_id VARCHAR(50) NOT NULL,
    metric_date DATE NOT NULL,
    overall_score DECIMAL(5,2) DEFAULT 0.00,
    collaboration_score DECIMAL(5,2) DEFAULT 0.00,
    process_efficiency DECIMAL(5,2) DEFAULT 0.00,
    document_quality DECIMAL(5,2) DEFAULT 0.00,
    time_to_completion DECIMAL(8,2), -- Days
    peer_review_score DECIMAL(5,2) DEFAULT 0.00,
    market_performance DECIMAL(5,2) DEFAULT 0.00,
    ranking_overall INT,
    ranking_university INT,
    ranking_sector INT,
    
    FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
    UNIQUE KEY unique_team_date (team_id, metric_date),
    INDEX idx_team_id (team_id),
    INDEX idx_metric_date (metric_date),
    INDEX idx_overall_score (overall_score)
);

-- Individual member performance
CREATE TABLE member_performance (
    id VARCHAR(50) PRIMARY KEY,
    team_member_id VARCHAR(50) NOT NULL,
    metric_date DATE NOT NULL,
    role_performance DECIMAL(5,2) DEFAULT 0.00,
    collaboration_rating DECIMAL(5,2) DEFAULT 0.00,
    document_contributions INT DEFAULT 0,
    peer_review_score DECIMAL(5,2) DEFAULT 0.00,
    responsiveness DECIMAL(5,2) DEFAULT 0.00,
    leadership_score DECIMAL(5,2) DEFAULT 0.00,
    
    FOREIGN KEY (team_member_id) REFERENCES team_members(id) ON DELETE CASCADE,
    UNIQUE KEY unique_member_date (team_member_id, metric_date),
    INDEX idx_team_member_id (team_member_id),
    INDEX idx_metric_date (metric_date)
);

-- University statistics
CREATE TABLE university_stats (
    id VARCHAR(50) PRIMARY KEY,
    university_name VARCHAR(255) NOT NULL,
    stat_date DATE NOT NULL,
    active_teams INT DEFAULT 0,
    completed_deals INT DEFAULT 0,
    total_capital_raised BIGINT DEFAULT 0,
    average_performance DECIMAL(5,2) DEFAULT 0.00,
    students_participating INT DEFAULT 0,
    companies_listed INT DEFAULT 0,
    
    UNIQUE KEY unique_university_date (university_name, stat_date),
    INDEX idx_university_name (university_name),
    INDEX idx_stat_date (stat_date)
);

-- System-wide market data
CREATE TABLE market_overview (
    id VARCHAR(50) PRIMARY KEY,
    date DATE NOT NULL,
    total_teams INT DEFAULT 0,
    active_deals INT DEFAULT 0,
    completed_deals INT DEFAULT 0,
    total_capital_raised BIGINT DEFAULT 0,
    total_students INT DEFAULT 0,
    participating_universities INT DEFAULT 0,
    average_team_performance DECIMAL(5,2) DEFAULT 0.00,
    market_growth_rate DECIMAL(5,2) DEFAULT 0.00,
    companies_listed INT DEFAULT 0,
    total_market_cap BIGINT DEFAULT 0,
    daily_trading_volume BIGINT DEFAULT 0,
    
    UNIQUE KEY unique_date (date),
    INDEX idx_date (date)
);

-- Notifications and alerts
CREATE TABLE notifications (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    team_id VARCHAR(50) NULL,
    type ENUM('workflow', 'document', 'approval', 'message', 'system', 'achievement') NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    related_id VARCHAR(50) NULL, -- ID of related object (deal, document, etc.)
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP NULL,
    
    FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_team_id (team_id),
    INDEX idx_type (type),
    INDEX idx_is_read (is_read),
    INDEX idx_created_at (created_at)
);

-- Achievements and badges
CREATE TABLE achievements (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    badge_icon VARCHAR(255),
    category ENUM('collaboration', 'performance', 'completion', 'innovation', 'leadership') NOT NULL,
    criteria JSON, -- Achievement criteria
    points INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User achievements
CREATE TABLE user_achievements (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    achievement_id VARCHAR(50) NOT NULL,
    team_id VARCHAR(50) NULL,
    earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (achievement_id) REFERENCES achievements(id),
    FOREIGN KEY (team_id) REFERENCES teams(id),
    UNIQUE KEY unique_user_achievement (user_id, achievement_id),
    INDEX idx_user_id (user_id),
    INDEX idx_achievement_id (achievement_id),
    INDEX idx_earned_at (earned_at)
);

-- Insert default workflow steps template
INSERT INTO workflow_steps (id, deal_id, step_number, step_name, assigned_role, status) VALUES
('default_step_1', 'TEMPLATE', 1, 'Capital Raise Intent Submission', 'issuer', 'pending'),
('default_step_2', 'TEMPLATE', 2, 'Deal Structuring & Advisory', 'ib_advisor', 'pending'),
('default_step_3', 'TEMPLATE', 3, 'Regulatory Review & Approval', 'regulator', 'pending'),
('default_step_4', 'TEMPLATE', 4, 'Exchange Listing Approval', 'listing_desk', 'pending'),
('default_step_5', 'TEMPLATE', 5, 'Broker Market Access Setup', 'broker', 'pending'),
('default_step_6', 'TEMPLATE', 6, 'Investor Capital Deployment', 'investor', 'pending'),
('default_step_7', 'TEMPLATE', 7, 'Settlement & Registry', 'csd_operator', 'pending');

-- Insert default achievements
INSERT INTO achievements (id, name, description, category, points) VALUES
('ach_first_team', 'Team Founder', 'Created your first team', 'leadership', 100),
('ach_first_deal', 'Deal Maker', 'Completed your first capital raising process', 'completion', 200),
('ach_collaborator', 'Team Player', 'Maintained 90%+ collaboration score for 30 days', 'collaboration', 150),
('ach_speed_demon', 'Speed Demon', 'Completed a deal in under 60 days', 'performance', 250),
('ach_perfectionist', 'Perfectionist', 'Achieved 95%+ overall team performance', 'performance', 300),
('ach_market_maker', 'Market Maker', 'Your team\'s company reached 1B RWF market cap', 'completion', 500),
('ach_cross_investor', 'Cross Investor', 'Invested in 5 different teams\' companies', 'collaboration', 200),
('ach_mentor', 'Mentor', 'Helped 3 teams complete their deals', 'leadership', 400);

-- Create indexes for better performance
CREATE INDEX idx_teams_search ON teams(name, university, target_sector);
CREATE INDEX idx_deals_active ON deals(status, current_step);
CREATE INDEX idx_workflow_pending ON workflow_steps(status, due_date);
CREATE INDEX idx_documents_recent ON deal_documents(created_at DESC);
CREATE INDEX idx_messages_unread ON team_messages(team_id, sent_at DESC);
CREATE INDEX idx_investments_performance ON cross_team_investments(investment_date, current_value);
CREATE INDEX idx_companies_performance ON listed_companies(performance_1d, performance_7d, performance_30d);
CREATE INDEX idx_trading_volume ON trading_transactions(transaction_date, total_amount);

-- Views for common queries
CREATE VIEW team_summary AS
SELECT 
    t.id,
    t.name,
    t.university,
    t.status,
    COUNT(tm.id) as member_count,
    t.max_members,
    d.company_name as current_deal,
    d.current_step,
    d.total_steps,
    COALESCE(metrics.overall_score, 0) as performance_score,
    t.created_at
FROM teams t
LEFT JOIN team_members tm ON t.id = tm.team_id AND tm.is_active = TRUE
LEFT JOIN deals d ON t.id = d.team_id AND d.status = 'active'
LEFT JOIN team_metrics metrics ON t.id = metrics.team_id AND metrics.metric_date = CURDATE()
GROUP BY t.id;

CREATE VIEW university_leaderboard AS
SELECT 
    university_name,
    active_teams,
    completed_deals,
    total_capital_raised,
    average_performance,
    students_participating,
    companies_listed,
    RANK() OVER (ORDER BY average_performance DESC) as performance_rank,
    RANK() OVER (ORDER BY total_capital_raised DESC) as capital_rank
FROM university_stats 
WHERE stat_date = CURDATE();

CREATE VIEW market_dashboard AS
SELECT 
    date,
    total_teams,
    active_deals,
    completed_deals,
    total_capital_raised,
    total_students,
    participating_universities,
    average_team_performance,
    market_growth_rate,
    companies_listed,
    total_market_cap,
    daily_trading_volume
FROM market_overview 
WHERE date = CURDATE();