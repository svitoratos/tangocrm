
-- Migration: Add niche column to clients table
-- Run this in your Supabase SQL editor

-- Step 1: Add the niche column
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS niche TEXT NOT NULL DEFAULT 'creator';

-- Step 2: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_clients_niche ON public.clients(niche);
CREATE INDEX IF NOT EXISTS idx_clients_user_niche ON public.clients(user_id, niche);

-- Step 3: Update existing clients to have the default niche
UPDATE public.clients SET niche = 'creator' WHERE niche IS NULL OR niche = '';

-- Step 4: Add constraints
ALTER TABLE public.clients ADD CONSTRAINT IF NOT EXISTS clients_niche_not_empty CHECK (niche != '');
ALTER TABLE public.clients ADD CONSTRAINT IF NOT EXISTS clients_niche_valid CHECK (niche IN ('creator', 'coach', 'podcaster', 'freelancer'));

-- Step 5: Verify the migration
SELECT 
    niche,
    COUNT(*) as client_count
FROM public.clients 
GROUP BY niche 
ORDER BY niche;
      