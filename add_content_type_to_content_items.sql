-- Add content_type column to content_items table
-- This migration adds the missing content_type column that's needed for task functionality

DO $$ 
BEGIN
    -- Check if content_type column exists in content_items table
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'content_items' AND column_name = 'content_type') THEN
        -- Add the content_type column
        ALTER TABLE content_items ADD COLUMN content_type TEXT NOT NULL DEFAULT 'post';
        
        -- Create index for content_type if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_content_items_content_type') THEN
            CREATE INDEX idx_content_items_content_type ON content_items(content_type);
        END IF;
        
        RAISE NOTICE 'Added content_type column to content_items table';
    ELSE
        RAISE NOTICE 'content_type column already exists in content_items table';
    END IF;
END $$; 