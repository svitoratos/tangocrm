-- Migration: Add niche column to calendar_events table
-- Run this script in your Supabase SQL editor to add the missing column

-- Add niche column to calendar_events table
ALTER TABLE calendar_events 
ADD COLUMN IF NOT EXISTS niche TEXT NOT NULL DEFAULT 'creator';

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_calendar_events_niche ON calendar_events(niche);

-- Update existing records to have a default niche value
UPDATE calendar_events 
SET niche = 'creator' 
WHERE niche IS NULL; 