-- Add position column to profiles table for Shora Exchange and other roles

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS position VARCHAR(255);

COMMENT ON COLUMN profiles.position IS 'Job position/title for the user (e.g., Exchange Operator, Listing Manager)';
