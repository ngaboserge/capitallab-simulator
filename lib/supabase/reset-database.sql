-- Reset Database Script for CMA Issuer Application System
-- Run this if you need to start fresh or if you get "already exists" errors

-- Drop all policies first
DROP POLICY IF EXISTS "Users can manage own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view own company" ON companies;
DROP POLICY IF EXISTS "Users can update own company" ON companies;
DROP POLICY IF EXISTS "Users can view own applications" ON ipo_applications;
DROP POLICY IF EXISTS "Users can create applications" ON ipo_applications;
DROP POLICY IF EXISTS "Users can update own applications" ON ipo_applications;
DROP POLICY IF EXISTS "Users can view own sections" ON application_sections;
DROP POLICY IF EXISTS "Users can update own sections" ON application_sections;
DROP POLICY IF EXISTS "Users can manage team assignments" ON team_assignments;
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
DROP POLICY IF EXISTS "System can create notifications" ON notifications;

-- Drop all tables in reverse dependency order
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS comments CASCADE;
DROP TABLE IF EXISTS documents CASCADE;
DROP TABLE IF EXISTS team_assignments CASCADE;
DROP TABLE IF EXISTS application_sections CASCADE;
DROP TABLE IF EXISTS ipo_applications CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
DROP TABLE IF EXISTS companies CASCADE;

-- Drop functions
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- Now you can run the schema-simple.sql file fresh