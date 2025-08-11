-- Update stevenvitoratos@getbondlyapp.com with the correct Stripe customer ID
-- Run this AFTER running the fix-steven-bondly-customer.js script

-- 1. First, check the current state
SELECT 
    id,
    email,
    stripe_customer_id,
    subscription_status,
    niches,
    created_at,
    updated_at
FROM users 
WHERE email = 'stevenvitoratos@getbondlyapp.com';

-- 2. Update the user with the primary customer ID
UPDATE users 
SET 
    stripe_customer_id = 'cus_SqfAdXr9XcUmF9', -- ← Primary customer ID from analysis
    updated_at = NOW()
WHERE email = 'stevenvitoratos@getbondlyapp.com';

-- 3. Verify the update
SELECT 
    id,
    email,
    stripe_customer_id,
    subscription_status,
    niches,
    created_at,
    updated_at
FROM users 
WHERE email = 'stevenvitoratos@getbondlyapp.com';

-- 4. Check for any other users with the same email (should be none)
SELECT 
    id,
    email,
    stripe_customer_id,
    subscription_status
FROM users 
WHERE email LIKE '%bondlyapp%';

-- 5. Check for any orphaned customer IDs in the database
SELECT 
    stripe_customer_id,
    COUNT(*) as user_count
FROM users 
WHERE stripe_customer_id IS NOT NULL
GROUP BY stripe_customer_id
HAVING COUNT(*) > 1;
