-- Create positive_feedback table
CREATE TABLE IF NOT EXISTS positive_feedback (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL,
    user_email TEXT,
    user_name TEXT,
    primary_niche TEXT,
    subscription_tier TEXT,
    selected_options TEXT[],
    other_feedback TEXT,
    favorite_feature TEXT,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_positive_feedback_user_id ON positive_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_positive_feedback_submitted_at ON positive_feedback(submitted_at);
CREATE INDEX IF NOT EXISTS idx_positive_feedback_niche ON positive_feedback(primary_niche);

-- Enable Row Level Security (RLS)
ALTER TABLE positive_feedback ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Allow users to insert their own feedback
CREATE POLICY "Users can insert their own positive feedback" ON positive_feedback
    FOR INSERT WITH CHECK (auth.uid()::text = user_id);

-- Allow users to view their own feedback
CREATE POLICY "Users can view their own positive feedback" ON positive_feedback
    FOR SELECT USING (auth.uid()::text = user_id);

-- Allow admins to view all feedback (you may need to adjust this based on your admin role setup)
CREATE POLICY "Admins can view all positive feedback" ON positive_feedback
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid()::text 
            AND users.is_admin = true
        )
    ); 