-- Create feedback table to store user feedback on trade setups
CREATE TABLE IF NOT EXISTS feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trade_setup_id UUID REFERENCES trade_setups(id) ON DELETE CASCADE,
    company_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    user_name TEXT,
    feedback_text TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_feedback_trade_setup_id ON feedback(trade_setup_id);
CREATE INDEX IF NOT EXISTS idx_feedback_company_id ON feedback(company_id);
CREATE INDEX IF NOT EXISTS idx_feedback_user_id ON feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON feedback(created_at DESC);

COMMENT ON TABLE feedback IS 'Stores user feedback on generated trade setups';
COMMENT ON COLUMN feedback.trade_setup_id IS 'Reference to the trade setup this feedback is for';
COMMENT ON COLUMN feedback.feedback_text IS 'User feedback text about the trade setup';
COMMENT ON COLUMN feedback.user_name IS 'User name from Whop (name or username)';

