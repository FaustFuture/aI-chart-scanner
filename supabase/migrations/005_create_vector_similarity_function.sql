-- Create a function for vector similarity search with quality filtering
-- This function can be used for proper RAG similarity matching
-- Note: This requires the knowledge table to have embeddings and proper indexes

CREATE OR REPLACE FUNCTION match_knowledge_with_quality(
    query_embedding vector(1536),
    match_threshold float DEFAULT 0.75,
    match_count int DEFAULT 5,
    min_quality_score numeric DEFAULT 7,
    filter_company_id text DEFAULT NULL
)
RETURNS TABLE (
    trade_setup_id uuid,
    direction text,
    entry_price text,
    quality_score numeric,
    risk_reward_ratio text,
    order_type text,
    similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        k.trade_setup_id,
        ts.direction,
        ts.trade_setup->>'entryPrice' as entry_price,
        ts.quality_score,
        ts.trade_setup->>'riskRewardRatio' as risk_reward_ratio,
        ts.trade_setup->>'orderType' as order_type,
        1 - (k.embedding <=> query_embedding) as similarity
    FROM knowledge k
    INNER JOIN trade_setups ts ON k.trade_setup_id = ts.id
    WHERE k.embedding IS NOT NULL
        AND ts.quality_score >= min_quality_score
        AND (1 - (k.embedding <=> query_embedding)) >= match_threshold
        AND (filter_company_id IS NULL OR k.company_id = filter_company_id)
    ORDER BY k.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;

COMMENT ON FUNCTION match_knowledge_with_quality IS 'Vector similarity search function for RAG with quality filtering';

