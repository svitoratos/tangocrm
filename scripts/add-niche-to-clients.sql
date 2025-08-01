-- Migration: Add niche field to clients table
-- This script adds niche isolation to the clients table

-- Add niche column to clients table
ALTER TABLE clients ADD COLUMN IF NOT EXISTS niche TEXT NOT NULL DEFAULT 'creator';

-- Create index for better performance on niche queries
CREATE INDEX IF NOT EXISTS idx_clients_niche ON clients(niche);

-- Create composite index for user_id + niche queries
CREATE INDEX IF NOT EXISTS idx_clients_user_niche ON clients(user_id, niche);

-- Update existing clients to have a default niche
-- This ensures all existing clients are assigned to the 'creator' niche
UPDATE clients SET niche = 'creator' WHERE niche IS NULL OR niche = '';

-- Add constraint to ensure niche is not empty
ALTER TABLE clients ADD CONSTRAINT clients_niche_not_empty CHECK (niche != '');

-- Add constraint to ensure niche is one of the valid values
ALTER TABLE clients ADD CONSTRAINT clients_niche_valid CHECK (niche IN ('creator', 'coach', 'podcaster', 'freelancer'));

-- Verify the migration
SELECT 
    niche,
    COUNT(*) as client_count
FROM clients 
GROUP BY niche 
ORDER BY niche; 