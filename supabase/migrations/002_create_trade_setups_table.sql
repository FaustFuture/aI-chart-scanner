-- Create trade_setups table to store structured trade setup data
CREATE TABLE IF NOT EXISTS trade_setups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    user_name TEXT,
    analysis TEXT NOT NULL,
    trade_setup JSONB NOT NULL,
    quality_score NUMERIC(3,1),
    direction TEXT,
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE trade_setups IS 'Stores trade setup data with analysis for each generated setup';
COMMENT ON COLUMN trade_setups.analysis IS 'Full markdown analysis text from image analysis';
COMMENT ON COLUMN trade_setups.trade_setup IS 'Structured trade setup JSON data (direction, entry, stop loss, TPs, etc.)';
COMMENT ON COLUMN trade_setups.quality_score IS 'Quality score from 1-10 for the trade setup';
COMMENT ON COLUMN trade_setups.direction IS 'Trade direction: BUY, SELL, or NO SETUP AVAILABLE';
COMMENT ON COLUMN trade_setups.user_name IS 'User name from Whop (name or username)';

