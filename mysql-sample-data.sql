-- Sample Data for CapitalLab Trading Platform
-- This file contains demo data for testing and demonstration

-- Insert sample users
INSERT IGNORE INTO users (id, username, email, balance, xp, level, role, achievements, created_at) VALUES
(1, 'admin', 'admin@capitallab.com', 100000.00, 1000, 10, 'admin', '["first_trade", "trader_10", "level_5"]', NOW()),
(2, 'john_trader', 'john@example.com', 15000.00, 250, 3, 'student', '["first_trade"]', NOW()),
(3, 'sarah_investor', 'sarah@example.com', 12500.00, 180, 2, 'student', '["first_trade"]', NOW()),
(4, 'mike_analyst', 'mike@example.com', 18000.00, 420, 5, 'professional', '["first_trade", "trader_10", "level_5"]', NOW()),
(5, 'emma_educator', 'emma@example.com', 25000.00, 800, 8, 'educator', '["first_trade", "trader_10", "level_5", "profitable_week"]', NOW()),
(6, 'david_broker', 'david@example.com', 22000.00, 350, 4, 'professional', '["first_trade", "trader_10"]', NOW()),
(7, 'lisa_regulator', 'lisa@example.com', 30000.00, 600, 6, 'professional', '["first_trade", "trader_10", "level_5"]', NOW()),
(8, 'alex_issuer', 'alex@example.com', 20000.00, 300, 3, 'professional', '["first_trade", "trader_10"]', NOW());

-- Insert sample teams
INSERT IGNORE INTO teams (id, name, description, team_type, created_by, balance, xp, level, created_at) VALUES
(1, 'Alpha Traders', 'Aggressive growth trading team', 'trading', 2, 75000.00, 500, 5, NOW()),
(2, 'Beta Investment Bank', 'Investment banking simulation team', 'investment_bank', 4, 100000.00, 800, 8, NOW()),
(3, 'Gamma Brokers', 'Brokerage operations team', 'broker', 6, 60000.00, 300, 3, NOW()),
(4, 'Delta Corporate', 'Corporate treasury team', 'corporate', 5, 150000.00, 1200, 12, NOW());

-- Insert team members
INSERT IGNORE INTO team_members (team_id, user_id, role, joined_at) VALUES
(1, 2, 'leader', NOW()),
(1, 3, 'member', NOW()),
(1, 4, 'analyst', NOW()),
(2, 4, 'leader', NOW()),
(2, 5, 'member', NOW()),
(2, 6, 'trader', NOW()),
(3, 6, 'leader', NOW()),
(3, 7, 'member', NOW()),
(4, 5, 'leader', NOW()),
(4, 8, 'member', NOW());

-- Insert sample trades
INSERT IGNORE INTO trades (user_id, symbol, type, quantity, price, total_value, created_at) VALUES
(2, 'AAPL', 'buy', 10, 175.43, 1754.30, DATE_SUB(NOW(), INTERVAL 5 DAY)),
(2, 'GOOGL', 'buy', 2, 2847.63, 5695.26, DATE_SUB(NOW(), INTERVAL 4 DAY)),
(2, 'AAPL', 'sell', 5, 178.20, 891.00, DATE_SUB(NOW(), INTERVAL 3 DAY)),
(3, 'MSFT', 'buy', 15, 378.85, 5682.75, DATE_SUB(NOW(), INTERVAL 6 DAY)),
(3, 'TSLA', 'buy', 8, 248.42, 1987.36, DATE_SUB(NOW(), INTERVAL 2 DAY)),
(4, 'NVDA', 'buy', 5, 875.28, 4376.40, DATE_SUB(NOW(), INTERVAL 7 DAY)),
(4, 'META', 'buy', 12, 485.73, 5828.76, DATE_SUB(NOW(), INTERVAL 1 DAY)),
(6, 'AMZN', 'buy', 3, 3342.88, 10028.64, DATE_SUB(NOW(), INTERVAL 8 DAY)),
(6, 'NFLX', 'buy', 7, 542.18, 3795.26, DATE_SUB(NOW(), INTERVAL 3 DAY)),
(8, 'JPM', 'buy', 25, 168.45, 4211.25, DATE_SUB(NOW(), INTERVAL 5 DAY));

-- Insert sample team trades
INSERT IGNORE INTO team_trades (team_id, user_id, symbol, type, quantity, price, total_value, created_at) VALUES
(1, 2, 'AAPL', 'buy', 50, 175.43, 8771.50, DATE_SUB(NOW(), INTERVAL 4 DAY)),
(1, 3, 'GOOGL', 'buy', 10, 2847.63, 28476.30, DATE_SUB(NOW(), INTERVAL 3 DAY)),
(1, 4, 'MSFT', 'buy', 30, 378.85, 11365.50, DATE_SUB(NOW(), INTERVAL 2 DAY)),
(2, 4, 'NVDA', 'buy', 20, 875.28, 17505.60, DATE_SUB(NOW(), INTERVAL 6 DAY)),
(2, 5, 'META', 'buy', 25, 485.73, 12143.25, DATE_SUB(NOW(), INTERVAL 1 DAY)),
(3, 6, 'AMZN', 'buy', 8, 3342.88, 26743.04, DATE_SUB(NOW(), INTERVAL 5 DAY)),
(4, 5, 'JPM', 'buy', 100, 168.45, 16845.00, DATE_SUB(NOW(), INTERVAL 7 DAY));

-- Insert sample watchlists
INSERT IGNORE INTO watchlists (user_id, symbol, added_at) VALUES
(2, 'AAPL', NOW()),
(2, 'GOOGL', NOW()),
(2, 'MSFT', NOW()),
(3, 'TSLA', NOW()),
(3, 'NVDA', NOW()),
(4, 'META', NOW()),
(4, 'AMZN', NOW()),
(6, 'NFLX', NOW()),
(8, 'JPM', NOW());

-- Insert sample CapitalLab roles
INSERT IGNORE INTO capitallab_roles (user_id, role_type, progress, completed, started_at) VALUES
(4, 'investor', 100, TRUE, DATE_SUB(NOW(), INTERVAL 10 DAY)),
(4, 'broker', 75, FALSE, DATE_SUB(NOW(), INTERVAL 8 DAY)),
(6, 'broker', 100, TRUE, DATE_SUB(NOW(), INTERVAL 15 DAY)),
(6, 'ib_advisor', 60, FALSE, DATE_SUB(NOW(), INTERVAL 5 DAY)),
(7, 'regulator', 100, TRUE, DATE_SUB(NOW(), INTERVAL 20 DAY)),
(7, 'listing_desk', 40, FALSE, DATE_SUB(NOW(), INTERVAL 3 DAY)),
(8, 'issuer', 90, FALSE, DATE_SUB(NOW(), INTERVAL 12 DAY)),
(8, 'investor', 100, TRUE, DATE_SUB(NOW(), INTERVAL 25 DAY));

-- Insert sample workflows
INSERT IGNORE INTO workflows (user_id, workflow_type, status, progress, data, created_at) VALUES
(8, 'capital_raise', 'in_progress', 60, '{"company_name": "TechCorp Rwanda", "amount": 5000000, "purpose": "Expansion"}', DATE_SUB(NOW(), INTERVAL 5 DAY)),
(4, 'investor_onboarding', 'completed', 100, '{"broker_id": 6, "risk_profile": "moderate"}', DATE_SUB(NOW(), INTERVAL 10 DAY)),
(6, 'broker_activation', 'completed', 100, '{"license_number": "BRK001", "clients": [4, 3]}', DATE_SUB(NOW(), INTERVAL 15 DAY));

-- Insert sample notifications
INSERT IGNORE INTO notifications (user_id, type, title, message, read_status, created_at) VALUES
(2, 'trade', 'Trade Executed', 'BUY 10 AAPL at $175.43', FALSE, DATE_SUB(NOW(), INTERVAL 1 HOUR)),
(2, 'achievement', 'Achievement Unlocked!', 'You earned "First Trade" and gained 50 XP!', FALSE, DATE_SUB(NOW(), INTERVAL 2 HOUR)),
(3, 'level_up', 'Level Up!', 'Congratulations! You reached level 2!', TRUE, DATE_SUB(NOW(), INTERVAL 1 DAY)),
(4, 'team_invite', 'Team Invitation', 'john_trader invited you to join "Alpha Traders"', TRUE, DATE_SUB(NOW(), INTERVAL 2 DAY)),
(6, 'market_alert', 'Market Alert', 'NVDA reached $875.28', FALSE, DATE_SUB(NOW(), INTERVAL 3 HOUR)),
(8, 'workflow', 'Workflow Update', 'Your capital raise application is under review', FALSE, DATE_SUB(NOW(), INTERVAL 4 HOUR));

-- Insert sample activity logs
INSERT IGNORE INTO activity_logs (user_id, team_id, activity_type, description, created_at) VALUES
(2, NULL, 'trade', 'Executed BUY order for 10 AAPL shares', DATE_SUB(NOW(), INTERVAL 1 HOUR)),
(2, NULL, 'achievement_earned', 'Earned achievement: First Trade', DATE_SUB(NOW(), INTERVAL 2 HOUR)),
(3, NULL, 'level_up', 'Reached level 2', DATE_SUB(NOW(), INTERVAL 1 DAY)),
(4, 1, 'team_join', 'Joined team Alpha Traders as analyst', DATE_SUB(NOW(), INTERVAL 2 DAY)),
(5, 2, 'team_trade', 'Executed team trade: BUY 25 META', DATE_SUB(NOW(), INTERVAL 1 DAY)),
(6, NULL, 'capitallab_progress', 'Completed Broker role in CapitalLab', DATE_SUB(NOW(), INTERVAL 3 DAY)),
(7, NULL, 'capitallab_progress', 'Started Listing Desk role', DATE_SUB(NOW(), INTERVAL 3 DAY)),
(8, NULL, 'workflow_started', 'Started capital raise workflow', DATE_SUB(NOW(), INTERVAL 5 DAY));

-- Update market data with more realistic values
UPDATE market_data SET 
  price = ROUND(price * (0.95 + RAND() * 0.1), 2),
  change_amount = ROUND((RAND() - 0.5) * 20, 2),
  change_percent = ROUND((RAND() - 0.5) * 5, 2),
  updated_at = NOW()
WHERE symbol IN ('AAPL', 'GOOGL', 'MSFT', 'AMZN', 'TSLA', 'NVDA', 'META', 'NFLX', 'JPM');

-- Insert additional sample market data for more stocks
INSERT IGNORE INTO market_data (symbol, price, change_amount, change_percent, volume, market_cap) VALUES
('BRK.B', 365.42, 2.15, 0.59, 3500000, 800000000000),
('V', 245.67, -1.23, -0.50, 8000000, 550000000000),
('JNJ', 162.34, 0.87, 0.54, 12000000, 430000000000),
('WMT', 158.92, 1.45, 0.92, 15000000, 440000000000),
('PG', 145.78, -0.65, -0.44, 6000000, 350000000000),
('UNH', 512.89, 3.21, 0.63, 4500000, 480000000000),
('HD', 334.56, -2.11, -0.63, 7500000, 350000000000),
('MA', 398.23, 1.87, 0.47, 5500000, 390000000000),
('BAC', 32.45, 0.23, 0.71, 45000000, 270000000000),
('DIS', 112.67, -1.34, -1.17, 18000000, 210000000000);

-- Create some sample documents for CapitalLab workflows
INSERT IGNORE INTO documents (user_id, workflow_id, document_type, filename, status, created_at) VALUES
(8, 1, 'prospectus', 'TechCorp_Prospectus_Draft.pdf', 'draft', DATE_SUB(NOW(), INTERVAL 3 DAY)),
(8, 1, 'financial_statements', 'TechCorp_Financials_2023.pdf', 'submitted', DATE_SUB(NOW(), INTERVAL 2 DAY)),
(4, 2, 'kyc_document', 'Investor_KYC_Form.pdf', 'approved', DATE_SUB(NOW(), INTERVAL 8 DAY)),
(6, 3, 'broker_license', 'Broker_License_Certificate.pdf', 'approved', DATE_SUB(NOW(), INTERVAL 12 DAY));

-- Add some leaderboard entries (these would typically be calculated dynamically)
INSERT IGNORE INTO leaderboards (user_id, category, score, rank_position, period, created_at) VALUES
(5, 'individual_xp', 800, 1, 'all_time', NOW()),
(4, 'individual_xp', 420, 2, 'all_time', NOW()),
(6, 'individual_xp', 350, 3, 'all_time', NOW()),
(8, 'individual_xp', 300, 4, 'all_time', NOW()),
(2, 'individual_xp', 250, 5, 'all_time', NOW()),
(4, 'individual_portfolio', 18000.00, 1, 'all_time', NOW()),
(5, 'individual_portfolio', 25000.00, 2, 'all_time', NOW()),
(6, 'individual_portfolio', 22000.00, 3, 'all_time', NOW());

-- Insert team leaderboard entries
INSERT IGNORE INTO leaderboards (team_id, category, score, rank_position, period, created_at) VALUES
(4, 'team_xp', 1200, 1, 'all_time', NOW()),
(2, 'team_xp', 800, 2, 'all_time', NOW()),
(1, 'team_xp', 500, 3, 'all_time', NOW()),
(3, 'team_xp', 300, 4, 'all_time', NOW()),
(4, 'team_portfolio', 150000.00, 1, 'all_time', NOW()),
(2, 'team_portfolio', 100000.00, 2, 'all_time', NOW()),
(1, 'team_portfolio', 75000.00, 3, 'all_time', NOW()),
(3, 'team_portfolio', 60000.00, 4, 'all_time', NOW());

-- Update user last login times
UPDATE users SET last_login = DATE_SUB(NOW(), INTERVAL FLOOR(RAND() * 24) HOUR) WHERE id IN (2, 3, 4, 5, 6, 7, 8);

-- Add some variety to user achievements
UPDATE users SET achievements = '["first_trade", "trader_10", "level_5", "profitable_week"]' WHERE id = 4;
UPDATE users SET achievements = '["first_trade", "trader_10", "level_5", "profitable_week", "portfolio_10k"]' WHERE id = 5;
UPDATE users SET achievements = '["first_trade", "trader_10"]' WHERE id IN (6, 8);
UPDATE users SET achievements = '["first_trade", "trader_10", "level_5"]' WHERE id = 7;

-- Final message
SELECT 'Sample data inserted successfully! You can now test the platform with demo users and data.' as message;