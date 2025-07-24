-- Migration script to fix users table schema for payment verification
-- Run this script to add missing fields to existing databases

-- Add missing columns if they don't exist
DO $$ 
BEGIN
    -- Add primary_niche column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'primary_niche') THEN
        ALTER TABLE users ADD COLUMN primary_niche TEXT DEFAULT 'creator';
    END IF;

    -- Add niches column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'niches') THEN
        ALTER TABLE users ADD COLUMN niches TEXT[] DEFAULT '{}';
    END IF;

    -- Add onboarding_completed column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'onboarding_completed') THEN
        ALTER TABLE users ADD COLUMN onboarding_completed BOOLEAN DEFAULT FALSE;
    END IF;

    -- Add subscription_status column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'subscription_status') THEN
        ALTER TABLE users ADD COLUMN subscription_status TEXT DEFAULT 'free';
    END IF;

    -- Add subscription_tier column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'subscription_tier') THEN
        ALTER TABLE users ADD COLUMN subscription_tier TEXT DEFAULT 'basic';
    END IF;

    -- Add stripe_customer_id column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'stripe_customer_id') THEN
        ALTER TABLE users ADD COLUMN stripe_customer_id TEXT;
    END IF;

    -- Migrate data from old 'niche' column to 'primary_niche' if needed
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'niche') THEN
        UPDATE users SET primary_niche = niche WHERE primary_niche IS NULL OR primary_niche = 'creator';
        -- Don't drop the old column yet to avoid breaking existing code
    END IF;
END $$;

-- Create indexes for new columns
CREATE INDEX IF NOT EXISTS idx_users_primary_niche ON users(primary_niche);
CREATE INDEX IF NOT EXISTS idx_users_onboarding_completed ON users(onboarding_completed);
CREATE INDEX IF NOT EXISTS idx_users_subscription_status ON users(subscription_status);

-- Update existing users to have proper default values
UPDATE users SET 
    primary_niche = COALESCE(primary_niche, 'creator'),
    niches = COALESCE(niches, '{}'),
    onboarding_completed = COALESCE(onboarding_completed, FALSE),
    subscription_status = COALESCE(subscription_status, 'free'),
    subscription_tier = COALESCE(subscription_tier, 'basic')
WHERE primary_niche IS NULL 
   OR niches IS NULL 
   OR onboarding_completed IS NULL 
   OR subscription_status IS NULL 
   OR subscription_tier IS NULL; 