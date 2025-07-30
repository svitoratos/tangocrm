-- Create cancellation_feedback table
CREATE TABLE IF NOT EXISTS cancellation_feedback (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL,
    reason TEXT NOT NULL,
    custom_reason TEXT,
    improvement_suggestion TEXT,
    would_comeback TEXT,
    subscription_end_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_cancellation_feedback_user_id ON cancellation_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_cancellation_feedback_reason ON cancellation_feedback(reason);
CREATE INDEX IF NOT EXISTS idx_cancellation_feedback_created_at ON cancellation_feedback(created_at);

-- Add Row Level Security (RLS)
ALTER TABLE cancellation_feedback ENABLE ROW LEVEL SECURITY;

-- Create policy for users to only see their own feedback (optional)
CREATE POLICY "Users can view own cancellation feedback" ON cancellation_feedback
    FOR SELECT USING (auth.uid()::text = user_id);

-- Create policy for service role to manage all feedback
CREATE POLICY "Service role can manage all cancellation feedback" ON cancellation_feedback
    FOR ALL USING (auth.role() = 'service_role');

-- Add helpful comments
COMMENT ON TABLE cancellation_feedback IS 'Stores user feedback when they cancel their subscription';
COMMENT ON COLUMN cancellation_feedback.reason IS 'Primary cancellation reason (predefined options)';
COMMENT ON COLUMN cancellation_feedback.custom_reason IS 'Custom reason when "other" is selected';
COMMENT ON COLUMN cancellation_feedback.improvement_suggestion IS 'User suggestions for improvement';
COMMENT ON COLUMN cancellation_feedback.would_comeback IS 'Whether user would consider coming back (yes/no/not-sure)';
COMMENT ON COLUMN cancellation_feedback.subscription_end_date IS 'When the subscription will actually end';