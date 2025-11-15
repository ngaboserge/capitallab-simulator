-- Create shora_listings table for approved IPO applications
CREATE TABLE IF NOT EXISTS shora_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  application_id UUID NOT NULL REFERENCES ipo_applications(id) ON DELETE CASCADE,
  
  -- Listing Information
  ticker_symbol VARCHAR(10) NOT NULL UNIQUE,
  company_name VARCHAR(255) NOT NULL,
  listing_status VARCHAR(50) NOT NULL DEFAULT 'PENDING_LISTING',
  listing_date TIMESTAMPTZ,
  
  -- Offering Details
  shares_offered BIGINT,
  offer_price DECIMAL(15, 2),
  total_value DECIMAL(20, 2),
  
  -- Market Data (updated after listing)
  current_price DECIMAL(15, 2),
  market_cap DECIMAL(20, 2),
  shares_outstanding BIGINT,
  
  -- Trading Status
  trading_status VARCHAR(50) DEFAULT 'NOT_LISTED', -- NOT_LISTED, ACTIVE, SUSPENDED, DELISTED
  last_trade_date TIMESTAMPTZ,
  
  -- Approval Information
  approved_by UUID REFERENCES profiles(id),
  approved_at TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create application_activity_log table for audit trail
CREATE TABLE IF NOT EXISTS application_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES ipo_applications(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id),
  action VARCHAR(100) NOT NULL,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_shora_listings_company ON shora_listings(company_id);
CREATE INDEX IF NOT EXISTS idx_shora_listings_application ON shora_listings(application_id);
CREATE INDEX IF NOT EXISTS idx_shora_listings_ticker ON shora_listings(ticker_symbol);
CREATE INDEX IF NOT EXISTS idx_shora_listings_status ON shora_listings(listing_status);
CREATE INDEX IF NOT EXISTS idx_activity_log_application ON application_activity_log(application_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_user ON application_activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_action ON application_activity_log(action);

-- Add new columns to ipo_applications if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'ipo_applications' 
                 AND column_name = 'cma_approval_comments') THEN
    ALTER TABLE ipo_applications ADD COLUMN cma_approval_comments TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'ipo_applications' 
                 AND column_name = 'cma_rejection_comments') THEN
    ALTER TABLE ipo_applications ADD COLUMN cma_rejection_comments TEXT;
  END IF;
END $$;

-- RLS Policies for shora_listings
ALTER TABLE shora_listings ENABLE ROW LEVEL SECURITY;

-- CMA regulators can view and manage all listings
CREATE POLICY "CMA regulators can manage listings"
  ON shora_listings
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('CMA_REGULATOR', 'CMA_ADMIN')
    )
  );

-- Companies can view their own listings
CREATE POLICY "Companies can view their listings"
  ON shora_listings
  FOR SELECT
  TO authenticated
  USING (
    company_id IN (
      SELECT company_id FROM profiles
      WHERE profiles.id = auth.uid()
    )
  );

-- Public can view active listings (for market data)
CREATE POLICY "Public can view active listings"
  ON shora_listings
  FOR SELECT
  TO authenticated
  USING (listing_status = 'ACTIVE' OR trading_status = 'ACTIVE');

-- RLS Policies for application_activity_log
ALTER TABLE application_activity_log ENABLE ROW LEVEL SECURITY;

-- CMA regulators can view all activity logs
CREATE POLICY "CMA regulators can view activity logs"
  ON application_activity_log
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('CMA_REGULATOR', 'CMA_ADMIN')
    )
  );

-- Users can view logs for their own applications
CREATE POLICY "Users can view their application logs"
  ON application_activity_log
  FOR SELECT
  TO authenticated
  USING (
    application_id IN (
      SELECT id FROM ipo_applications
      WHERE company_id IN (
        SELECT company_id FROM profiles
        WHERE profiles.id = auth.uid()
      )
    )
  );

-- Insert policy for activity logs (all authenticated users can create logs)
CREATE POLICY "Authenticated users can create activity logs"
  ON application_activity_log
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Update trigger for shora_listings
CREATE OR REPLACE FUNCTION update_shora_listings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_shora_listings_updated_at
  BEFORE UPDATE ON shora_listings
  FOR EACH ROW
  EXECUTE FUNCTION update_shora_listings_updated_at();

COMMENT ON TABLE shora_listings IS 'Stores approved IPO applications that are listed or pending listing on Shora Exchange';
COMMENT ON TABLE application_activity_log IS 'Audit trail for all actions performed on IPO applications';
