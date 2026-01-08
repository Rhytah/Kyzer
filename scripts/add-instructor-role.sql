-- Add instructor role to user
-- Replace 'your-email@example.com' with your actual email

-- First, update the user's metadata to set role as 'instructor'
UPDATE auth.users
SET raw_user_meta_data = raw_user_meta_data || '{"role": "instructor"}'::jsonb
WHERE email = 'your-email@example.com';

-- Verify the update
SELECT id, email, 
       raw_user_meta_data->>'role' as role,
       raw_user_meta_data->>'account_type' as account_type
FROM auth.users
WHERE email = 'your-email@example.com';
