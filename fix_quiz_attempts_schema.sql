-- Fix quiz_attempts table schema
-- Run this in your Supabase SQL editor to fix the missing user_id column

-- First, let's check if the quiz_attempts table exists and what columns it has
-- (This is just for reference - you can run this to see the current structure)
-- SELECT column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'quiz_attempts' 
-- ORDER BY ordinal_position;

-- Add the missing user_id column to quiz_attempts table
ALTER TABLE quiz_attempts 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES profiles(id) ON DELETE CASCADE;

-- Add an index for better query performance
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_id ON quiz_attempts(user_id);

-- Add an index for quiz_id as well (commonly used in queries)
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_quiz_id ON quiz_attempts(quiz_id);

-- Add a composite index for user and quiz queries
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_quiz ON quiz_attempts(user_id, quiz_id);

-- If you need to update existing records with user_id, you might need to:
-- 1. First check if there are any existing records without user_id
-- SELECT COUNT(*) FROM quiz_attempts WHERE user_id IS NULL;

-- 2. If there are existing records, you'll need to determine how to populate user_id
-- This depends on your application logic. You might need to:
-- - Link them to a specific user
-- - Delete them if they're orphaned
-- - Or handle them according to your business logic

-- Example: If you want to set all existing quiz_attempts to a specific user (replace with actual user ID)
-- UPDATE quiz_attempts 
-- SET user_id = 'your-user-id-here' 
-- WHERE user_id IS NULL;

-- Verify the column was added successfully
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'quiz_attempts' 
AND column_name = 'user_id';
