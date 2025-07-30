-- Create cancellation_feedback table
CREATE TABLE IF NOT EXISTS cancellation_feedback (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL,
    user_email TEXT,
    user_name TEXT,
    primary_niche TEXT,
    subscription_tier TEXT,
    reason TEXT NOT NULL,
    improvement_feedback TEXT,
    return_likelihood TEXT,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_cancellation_feedback_user_id ON cancellation_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_cancellation_feedback_submitted_at ON cancellation_feedback(submitted_at);
CREATE INDEX IF NOT EXISTS idx_cancellation_feedback_reason ON cancellation_feedback(reason);

-- Enable Row Level Security (RLS)
ALTER TABLE cancellation_feedback ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Allow users to insert their own feedback
CREATE POLICY "Users can insert their own cancellation feedback" ON cancellation_feedback
    FOR INSERT WITH CHECK (auth.uid()::text = user_id);

-- Allow admins to view all feedback
CREATE POLICY "Admins can view all cancellation feedback" ON cancellation_feedback
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid()::text 
            AND users.role = 'admin'
        )
    );

-- Allow users to view their own feedback
CREATE POLICY "Users can view their own cancellation feedback" ON cancellation_feedback
    FOR SELECT USING (auth.uid()::text = user_id); 