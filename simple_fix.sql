-- Simple fix: Add missing columns to content_items table
-- Run this in your Supabase SQL editor

-- Add script column for podcast episodes
ALTER TABLE content_items 
ADD COLUMN IF NOT EXISTS script TEXT;

-- Add topics column for podcast episodes  
ALTER TABLE content_items 
ADD COLUMN IF NOT EXISTS topics TEXT;

-- Add custom_duration column for podcast episodes
ALTER TABLE content_items 
ADD COLUMN IF NOT EXISTS custom_duration TEXT;

-- Update existing podcast episodes with sample data
UPDATE content_items 
SET 
    script = 'Welcome to our podcast! Today we''re discussing...',
    topics = 'Introduction, Main discussion points, Q&A session'
WHERE niche = 'podcaster' 
AND (script IS NULL OR topics IS NULL);

-- Verify the columns were added
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'content_items' 
AND column_name IN ('script', 'topics', 'custom_duration')
ORDER BY column_name; 