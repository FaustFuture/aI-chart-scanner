-- Create indexes for efficient querying

-- Indexes for trade_setups table
CREATE INDEX IF NOT EXISTS idx_trade_setups_company ON trade_setups(company_id);
CREATE INDEX IF NOT EXISTS idx_trade_setups_user ON trade_setups(user_id);
CREATE INDEX IF NOT EXISTS idx_trade_setups_quality ON trade_setups(quality_score);
CREATE INDEX IF NOT EXISTS idx_trade_setups_created ON trade_setups(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_trade_setups_direction ON trade_setups(direction);

-- Indexes for knowledge table
CREATE INDEX IF NOT EXISTS idx_knowledge_company ON knowledge(company_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_trade_setup ON knowledge(trade_setup_id);

-- Vector similarity index for knowledge table (ivfflat for cosine similarity)
-- Note: This index should be created after some data is inserted for optimal performance
-- CREATE INDEX IF NOT EXISTS idx_knowledge_embedding ON knowledge 
--   USING ivfflat (embedding vector_cosine_ops) 
--   WITH (lists = 100);

COMMENT ON INDEX idx_knowledge_company IS 'Index for filtering knowledge by company';
COMMENT ON INDEX idx_knowledge_trade_setup IS 'Index for joining knowledge with trade_setups';

