-- Fix missing user in users table
-- This script updates the existing user to have the correct Clerk user ID

DO $$ 
BEGIN
    -- Check if the Clerk user ID exists in users table
    IF NOT EXISTS (SELECT 1 FROM users WHERE id = 'user_30YUikU1QBqNiZnHHxrb8uUJs6E') THEN
        -- Update the existing user to have the correct Clerk user ID
        UPDATE users 
        SET id = 'user_30YUikU1QBqNiZnHHxrb8uUJs6E'
        WHERE email = 'stevenvitoratos@getbondlyapp.com';
        
        RAISE NOTICE 'Updated existing user to have Clerk user ID user_30YUikU1QBqNiZnHHxrb8uUJs6E';
    ELSE
        RAISE NOTICE 'User user_30YUikU1QBqNiZnHHxrb8uUJs6E already exists in users table';
    END IF;
END $$; 