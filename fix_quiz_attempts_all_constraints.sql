-- Fix all NOT NULL constraint issues in quiz_attempts table
-- Run this in your Supabase SQL editor

-- Step 1: Check the current structure and constraints
-- (Run this to see current table structure)
-- SELECT column_name, data_type, is_nullable, column_default
-- FROM information_schema.columns 
-- WHERE table_name = 'quiz_attempts' 
-- ORDER BY ordinal_position;

-- Step 2: Check current constraints
-- SELECT conname, contype, pg_get_constraintdef(oid) as definition
-- FROM pg_constraint 
-- WHERE conrelid = 'quiz_attempts'::regclass;

-- Step 3: Fix all NOT NULL constraints by making columns nullable or adding defaults

-- Fix max_score column
ALTER TABLE quiz_attempts 
ALTER COLUMN max_score DROP NOT NULL;

-- Fix passed column - make it nullable
ALTER TABLE quiz_attempts 
ALTER COLUMN passed DROP NOT NULL;

-- Fix score column if it exists and has NOT NULL constraint
ALTER TABLE quiz_attempts 
ALTER COLUMN score DROP NOT NULL;

-- Fix percentage column if it exists and has NOT NULL constraint
ALTER TABLE quiz_attempts 
ALTER COLUMN percentage DROP NOT NULL;

-- Fix time_spent column if it exists and has NOT NULL constraint
ALTER TABLE quiz_attempts 
ALTER COLUMN time_spent DROP NOT NULL;

-- Step 4: Add default values for better data handling
-- Set default values for columns that should have them

-- Set default for max_score (0 means no maximum)
ALTER TABLE quiz_attempts 
ALTER COLUMN max_score SET DEFAULT 0;

-- Set default for score (0 means no score yet)
ALTER TABLE quiz_attempts 
ALTER COLUMN score SET DEFAULT 0;

-- Set default for time_spent (0 means no time recorded yet)
ALTER TABLE quiz_attempts 
ALTER COLUMN time_spent SET DEFAULT 0;

-- Set default for passed (false means not passed yet)
ALTER TABLE quiz_attempts 
ALTER COLUMN passed SET DEFAULT false;

-- Step 5: Add check constraints for data integrity
-- Ensure max_score is positive when not null
ALTER TABLE quiz_attempts 
ADD CONSTRAINT IF NOT EXISTS check_max_score_positive 
CHECK (max_score IS NULL OR max_score >= 0);

-- Ensure score is non-negative when not null
ALTER TABLE quiz_attempts 
ADD CONSTRAINT IF NOT EXISTS check_score_non_negative 
CHECK (score IS NULL OR score >= 0);

-- Ensure time_spent is non-negative when not null
ALTER TABLE quiz_attempts 
ADD CONSTRAINT IF NOT EXISTS check_time_spent_non_negative 
CHECK (time_spent IS NULL OR time_spent >= 0);

-- Ensure percentage is between 0 and 100 when not null
ALTER TABLE quiz_attempts 
ADD CONSTRAINT IF NOT EXISTS check_percentage_range 
CHECK (percentage IS NULL OR (percentage >= 0 AND percentage <= 100));

-- Step 6: Update existing NULL values with defaults (optional)
-- Only run these if you want to populate existing NULL values

-- UPDATE quiz_attempts 
-- SET max_score = 0 
-- WHERE max_score IS NULL;

-- UPDATE quiz_attempts 
-- SET score = 0 
-- WHERE score IS NULL;

-- UPDATE quiz_attempts 
-- SET time_spent = 0 
-- WHERE time_spent IS NULL;

-- UPDATE quiz_attempts 
-- SET passed = false 
-- WHERE passed IS NULL;

-- Step 7: Add computed columns for better data handling (optional)
-- These will automatically calculate values based on other columns

-- Add computed percentage column
ALTER TABLE quiz_attempts 
ADD COLUMN IF NOT EXISTS calculated_percentage DECIMAL(5,2) GENERATED ALWAYS AS (
    CASE 
        WHEN max_score > 0 AND score IS NOT NULL THEN (score / max_score) * 100 
        ELSE NULL 
    END
) STORED;

-- Add computed passed status
ALTER TABLE quiz_attempts 
ADD COLUMN IF NOT EXISTS calculated_passed BOOLEAN GENERATED ALWAYS AS (
    CASE 
        WHEN max_score > 0 AND score IS NOT NULL THEN score >= (max_score * 0.6)  -- 60% passing grade
        ELSE NULL 
    END
) STORED;

-- Step 8: Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_id ON quiz_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_quiz_id ON quiz_attempts(quiz_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_score ON quiz_attempts(score);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_passed ON quiz_attempts(passed);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_calculated_passed ON quiz_attempts(calculated_passed);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_quiz ON quiz_attempts(user_id, quiz_id);

-- Step 9: Verify the changes
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'quiz_attempts' 
ORDER BY ordinal_position;

-- Step 10: Check constraints
SELECT conname, contype, pg_get_constraintdef(oid) as definition
FROM pg_constraint 
WHERE conrelid = 'quiz_attempts'::regclass
ORDER BY conname;

-- Step 11: Test insert (this should work now)
-- INSERT INTO quiz_attempts (user_id, quiz_id, score, max_score, passed, time_spent)
-- VALUES (auth.uid(), 'your-quiz-id', 85, 100, true, 300);
