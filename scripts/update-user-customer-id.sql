-- Update user with correct Stripe customer ID after fixing duplicates
-- Run this AFTER using the duplicate customer fixer or script

-- First, check current state
SELECT 
  id,
  email,
  stripe_customer_id,
  stripe_subscription_id,
  subscription_status,
  created_at,
  updated_at
FROM users 
WHERE email = 'stevenvitoratos@gmail.com';

-- Update with the correct customer ID (replace 'cus_xxx' with actual ID)
-- This should be the primary customer ID after merging duplicates
UPDATE users 
SET 
  stripe_customer_id = 'cus_xxx', -- Replace with actual primary customer ID
  updated_at = NOW()
WHERE email = 'stevenvitoratos@gmail.com';

-- Verify the update
SELECT 
  id,
  email,
  stripe_customer_id,
  stripe_subscription_id,
  subscription_status,
  created_at,
  updated_at
FROM users 
WHERE email = 'stevenvitoratos@gmail.com';

-- Optional: Update subscription ID if it changed during the merge
-- UPDATE users 
-- SET 
--   stripe_subscription_id = 'sub_xxx', -- Replace with actual subscription ID
--   updated_at = NOW()
-- WHERE email = 'stevenvitoratos@gmail.com';

-- Check for any other users with potential duplicate customer issues
SELECT 
  email,
  stripe_customer_id,
  COUNT(*) as customer_count
FROM users 
WHERE stripe_customer_id IS NOT NULL
GROUP BY email, stripe_customer_id
HAVING COUNT(*) > 1;

-- Check for users with multiple customer IDs in the same email
SELECT 
  email,
  COUNT(DISTINCT stripe_customer_id) as unique_customers
FROM users 
WHERE stripe_customer_id IS NOT NULL
GROUP BY email
HAVING COUNT(DISTINCT stripe_customer_id) > 1;
