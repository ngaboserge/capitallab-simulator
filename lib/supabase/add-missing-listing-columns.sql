-- Add missing columns to shora_listings table

-- Add isin_code column if it doesn't exist
ALTER TABLE shora_listings ADD COLUMN IF NOT EXISTS isin_code VARCHAR(20);

-- Add sector column if it doesn't exist
ALTER TABLE shora_listings ADD COLUMN IF NOT EXISTS sector VARCHAR(100);

-- Add market_segment column if it doesn't exist
ALTER TABLE shora_listings ADD COLUMN IF NOT EXISTS market_segment VARCHAR(50) DEFAULT 'MAIN_BOARD';

-- Add any other missing columns that might be needed
ALTER TABLE shora_listings ADD COLUMN IF NOT EXISTS opening_price DECIMAL(15, 2);
ALTER TABLE shora_listings ADD COLUMN IF NOT EXISTS closing_price DECIMAL(15, 2);
ALTER TABLE shora_listings ADD COLUMN IF NOT EXISTS volume BIGINT DEFAULT 0;
ALTER TABLE shora_listings ADD COLUMN IF NOT EXISTS notes TEXT;

COMMENT ON COLUMN shora_listings.isin_code IS 'International Securities Identification Number';
COMMENT ON COLUMN shora_listings.sector IS 'Business sector (Technology, Finance, etc.)';
COMMENT ON COLUMN shora_listings.market_segment IS 'Market segment (MAIN_BOARD, ALTERNATIVE_MARKET, etc.)';
