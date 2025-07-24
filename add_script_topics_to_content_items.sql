-- Migration: Add script and topics columns to content_items table
-- This migration adds the missing podcast-specific fields that are needed for the script tab functionality

-- Add script column for podcast episodes
ALTER TABLE content_items 
ADD COLUMN IF NOT EXISTS script TEXT;

-- Add topics column for podcast episodes  
ALTER TABLE content_items 
ADD COLUMN IF NOT EXISTS topics TEXT;

-- Add custom_duration column for podcast episodes (also missing)
ALTER TABLE content_items 
ADD COLUMN IF NOT EXISTS custom_duration TEXT;

-- Add comment to document the purpose of these columns
COMMENT ON COLUMN content_items.script IS 'Script content for podcast episodes';
COMMENT ON COLUMN content_items.topics IS 'Topics and discussion points for podcast episodes';
COMMENT ON COLUMN content_items.custom_duration IS 'Custom duration for podcast episodes when duration is set to custom';

-- Update existing podcast episodes to have some sample data for testing
UPDATE content_items 
SET 
    script = 'Welcome to our podcast! Today we''re discussing...',
    topics = 'Introduction, Main discussion points, Q&A session',
    custom_duration = NULL
WHERE niche = 'podcaster' 
AND (script IS NULL OR topics IS NULL);

-- Verify the migration
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'content_items' 
AND column_name IN ('script', 'topics', 'custom_duration')
ORDER BY column_name; 