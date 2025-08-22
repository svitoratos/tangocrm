-- Add niche column to journal_entries table to match opportunities structure
ALTER TABLE journal_entries ADD COLUMN IF NOT EXISTS niche TEXT;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_journal_entries_niche ON journal_entries(niche);

-- Update existing entries to have niche based on tags (if any exist)
UPDATE journal_entries 
SET niche = 
  CASE 
    WHEN tags @> '["creator"]' THEN 'creator'
    WHEN tags @> '["creators"]' THEN 'creator'
    WHEN tags @> '["podcaster"]' THEN 'podcaster'
    WHEN tags @> '["podcasters"]' THEN 'podcaster'
    WHEN tags @> '["coach"]' THEN 'coach'
    WHEN tags @> '["coaches"]' THEN 'coach'
    WHEN tags @> '["freelancer"]' THEN 'freelancer'
    WHEN tags @> '["freelancers"]' THEN 'freelancer'
    ELSE 'creator'  -- default fallback
  END
WHERE niche IS NULL;