-- Content Items Table for Creator CRM Platform
-- This table supports all content types: creator content, coach programs, podcast episodes, freelancer projects

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create the content_items table
CREATE TABLE IF NOT EXISTS content_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    stage TEXT NOT NULL DEFAULT 'planning',
    niche TEXT NOT NULL DEFAULT 'creator',
    
    -- Common fields
    type TEXT,
    platform TEXT,
    brand TEXT,
    post_date TIMESTAMP WITH TIME ZONE,
    hashtags TEXT[] DEFAULT '{}',
    hook TEXT,
    notes TEXT,
    
    -- Analytics fields
    views INTEGER DEFAULT 0,
    likes INTEGER DEFAULT 0,
    comments INTEGER DEFAULT 0,
    shares INTEGER DEFAULT 0,
    saves INTEGER DEFAULT 0,
    engagement_rate DECIMAL(5,2),
    revenue DECIMAL(10,2) DEFAULT 0,
    
    -- Coach-specific fields
    program_type TEXT,
    custom_program_type TEXT,
    length TEXT,
    price DECIMAL(10,2),
    enrolled INTEGER DEFAULT 0,
    milestones INTEGER DEFAULT 0,
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    enrollment_deadline TIMESTAMP WITH TIME ZONE,
    client_progress TEXT,
    hosting_platform TEXT,
    
    -- Podcast-specific fields
    guest TEXT,
    sponsor TEXT,
    duration TEXT,
    
    -- Freelancer-specific fields
    client TEXT,
    deadline TIMESTAMP WITH TIME ZONE,
    budget DECIMAL(10,2),
    deliverables TEXT[] DEFAULT '{}',
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_content_items_user_id ON content_items(user_id);
CREATE INDEX IF NOT EXISTS idx_content_items_niche ON content_items(niche);
CREATE INDEX IF NOT EXISTS idx_content_items_stage ON content_items(stage);
CREATE INDEX IF NOT EXISTS idx_content_items_type ON content_items(type);
CREATE INDEX IF NOT EXISTS idx_content_items_platform ON content_items(platform);
CREATE INDEX IF NOT EXISTS idx_content_items_post_date ON content_items(post_date);
CREATE INDEX IF NOT EXISTS idx_content_items_start_date ON content_items(start_date);
CREATE INDEX IF NOT EXISTS idx_content_items_end_date ON content_items(end_date);
CREATE INDEX IF NOT EXISTS idx_content_items_deadline ON content_items(deadline);

-- Enable Row Level Security
ALTER TABLE content_items ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own content items" ON content_items
    FOR SELECT USING (user_id = auth.jwt() ->> 'sub');

CREATE POLICY "Users can insert their own content items" ON content_items
    FOR INSERT WITH CHECK (user_id = auth.jwt() ->> 'sub');

CREATE POLICY "Users can update their own content items" ON content_items
    FOR UPDATE USING (user_id = auth.jwt() ->> 'sub');

CREATE POLICY "Users can delete their own content items" ON content_items
    FOR DELETE USING (user_id = auth.jwt() ->> 'sub');

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_content_items_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_content_items_updated_at
    BEFORE UPDATE ON content_items
    FOR EACH ROW
    EXECUTE FUNCTION update_content_items_updated_at();

-- Insert sample data for testing
INSERT INTO content_items (
    user_id, title, description, stage, niche, type, platform, brand, 
    views, likes, comments, revenue, program_type, price, enrolled,
    guest, sponsor, duration, client, budget, deliverables
) VALUES
    -- Creator content items
    ('demo_user_001', 'Summer Vibes Reel', 'Showcasing summer workout gear', 'Posted', 'creator', 'reel', 'instagram', 'Nike', 15000, 1200, 89, 450, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
    ('demo_user_001', 'Morning Routine Vlog', 'My complete morning routine for productivity', 'Scheduled', 'creator', 'long-form', 'youtube', NULL, 0, 0, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
    ('demo_user_001', 'TikTok Dance Challenge', 'Participating in the latest dance trend', 'Editing', 'creator', 'short', 'tiktok', NULL, 0, 0, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
    
    -- Coach program items
    ('demo_user_001', 'Business Mastery Program', '12-week intensive business coaching program', 'Active', 'coach', 'course', 'kajabi', NULL, 0, 0, 0, 22931, 'Group', 997, 23, NULL, NULL, NULL, NULL, NULL, NULL),
    ('demo_user_001', 'Life Balance Workshop', 'One-day intensive workshop on work-life balance', 'Draft', 'coach', 'workshop', 'zoom', NULL, 0, 0, 0, 0, 'Workshop', 197, 0, NULL, NULL, NULL, NULL, NULL, NULL),
    
    -- Podcaster episode items
    ('demo_user_001', 'Ep. 45: Building a Successful Business from Scratch', 'Interview with serial entrepreneur Sarah Johnson about her journey from startup to $10M company', 'Publishing', 'podcaster', 'episode', 'spotify', NULL, 8500, 0, 0, 1200, NULL, NULL, NULL, 'Sarah Johnson', 'Squarespace', '52:30', NULL, NULL, NULL),
    ('demo_user_001', 'Ep. 46: The Future of AI in Business', 'Deep dive into how artificial intelligence is transforming business operations', 'Recording', 'podcaster', 'episode', 'apple-podcasts', NULL, 0, 0, 0, 0, NULL, NULL, NULL, 'Dr. Michael Chen', 'Audible', '45:00', NULL, NULL, NULL),
    
    -- Freelancer project items
    ('demo_user_001', 'E-commerce Website Redesign', 'Complete redesign of client''s e-commerce platform', 'Execution', 'freelancer', 'project', 'web', NULL, 0, 0, 0, 8500, NULL, NULL, NULL, NULL, NULL, NULL, 'TechStart Inc.', 8500, ARRAY['Website', 'Mobile App', 'Admin Panel']),
    ('demo_user_001', 'Brand Identity Package', 'Complete brand identity including logo, colors, and guidelines', 'Proposal', 'freelancer', 'project', 'design', NULL, 0, 0, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, 'Green Foods Co.', 2500, ARRAY['Logo', 'Brand Guidelines', 'Marketing Materials'])
ON CONFLICT DO NOTHING; 