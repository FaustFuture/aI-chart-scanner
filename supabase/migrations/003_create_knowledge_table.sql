-- Create knowledge table to store vector embeddings for semantic search
CREATE TABLE IF NOT EXISTS knowledge (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trade_setup_id UUID REFERENCES trade_setups(id) ON DELETE CASCADE,
    company_id TEXT NOT NULL,
    content TEXT NOT NULL,
    embedding vector(1536),
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE knowledge IS 'Stores vector embeddings for semantic search and RAG training';
COMMENT ON COLUMN knowledge.content IS 'Combined text: analysis + trade setup summary for embedding';
COMMENT ON COLUMN knowledge.embedding IS 'Vector embedding from OpenAI text-embedding-3-small (1536 dimensions)';
COMMENT ON COLUMN knowledge.metadata IS 'Additional context (direction, quality_score, etc.) for filtering';

