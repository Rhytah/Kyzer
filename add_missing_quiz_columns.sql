-- Add missing columns to quiz_attempts table
-- Run this in your Supabase SQL editor

-- Step 1: Add missing columns
ALTER TABLE quiz_attempts 
ADD COLUMN IF NOT EXISTS max_score INTEGER;

ALTER TABLE quiz_attempts 
ADD COLUMN IF NOT EXISTS percentage DECIMAL(5,2);

ALTER TABLE quiz_attempts 
ADD COLUMN IF NOT EXISTS passed BOOLEAN;

ALTER TABLE quiz_attempts 
ADD COLUMN IF NOT EXISTS time_spent INTEGER;

-- Step 2: Make columns nullable (remove NOT NULL constraints if they exist)
ALTER TABLE quiz_attempts 
ALTER COLUMN max_score DROP NOT NULL;

ALTER TABLE quiz_attempts 
ALTER COLUMN percentage DROP NOT NULL;

ALTER TABLE quiz_attempts 
ALTER COLUMN passed DROP NOT NULL;

ALTER TABLE quiz_attempts 
ALTER COLUMN time_spent DROP NOT NULL;

-- Step 3: Add default values
ALTER TABLE quiz_attempts 
ALTER COLUMN max_score SET DEFAULT 0;

ALTER TABLE quiz_attempts 
ALTER COLUMN percentage SET DEFAULT 0;

ALTER TABLE quiz_attempts 
ALTER COLUMN passed SET DEFAULT false;

ALTER TABLE quiz_attempts 
ALTER COLUMN time_spent SET DEFAULT 0;

-- Step 4: Add check constraints for data integrity
ALTER TABLE quiz_attempts 
ADD CONSTRAINT IF NOT EXISTS check_max_score_positive 
CHECK (max_score IS NULL OR max_score >= 0);

ALTER TABLE quiz_attempts 
ADD CONSTRAINT IF NOT EXISTS check_percentage_range 
CHECK (percentage IS NULL OR (percentage >= 0 AND percentage <= 100));

ALTER TABLE quiz_attempts 
ADD CONSTRAINT IF NOT EXISTS check_time_spent_non_negative 
CHECK (time_spent IS NULL OR time_spent >= 0);

-- Step 5: Verify the columns were added
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'quiz_attempts' 
ORDER BY ordinal_position;
