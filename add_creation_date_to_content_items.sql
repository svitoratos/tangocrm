-- Add creation_date field to content_items table
ALTER TABLE content_items 
ADD COLUMN creation_date TIMESTAMP WITH TIME ZONE;

-- Update existing records to use created_at as creation_date
UPDATE content_items 
SET creation_date = created_at 
WHERE creation_date IS NULL;

-- Make creation_date NOT NULL after populating existing records
ALTER TABLE content_items 
ALTER COLUMN creation_date SET NOT NULL;

-- Add comment to explain the field
COMMENT ON COLUMN content_items.creation_date IS 'User-specified creation date for the content item'; 