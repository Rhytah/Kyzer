-- Simple fix for missing quiz_attempts columns
-- Run this in your Supabase SQL editor

-- Add the missing columns
ALTER TABLE quiz_attempts ADD COLUMN IF NOT EXISTS max_score INTEGER;
ALTER TABLE quiz_attempts ADD COLUMN IF NOT EXISTS percentage DECIMAL(5,2);
ALTER TABLE quiz_attempts ADD COLUMN IF NOT EXISTS passed BOOLEAN;
ALTER TABLE quiz_attempts ADD COLUMN IF NOT EXISTS time_spent INTEGER;

-- Make them nullable
ALTER TABLE quiz_attempts ALTER COLUMN max_score DROP NOT NULL;
ALTER TABLE quiz_attempts ALTER COLUMN percentage DROP NOT NULL;
ALTER TABLE quiz_attempts ALTER COLUMN passed DROP NOT NULL;
ALTER TABLE quiz_attempts ALTER COLUMN time_spent DROP NOT NULL;

-- Set defaults
ALTER TABLE quiz_attempts ALTER COLUMN max_score SET DEFAULT 0;
ALTER TABLE quiz_attempts ALTER COLUMN percentage SET DEFAULT 0;
ALTER TABLE quiz_attempts ALTER COLUMN passed SET DEFAULT false;
ALTER TABLE quiz_attempts ALTER COLUMN time_spent SET DEFAULT 0;

-- Verify columns exist
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'quiz_attempts' 
ORDER BY ordinal_position;
