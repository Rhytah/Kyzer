-- Fix max_score NOT NULL constraint issue in quiz_attempts table
-- Run this in your Supabase SQL editor

-- Step 1: Check the current structure of quiz_attempts table
-- (Run this to see current constraints)
-- SELECT column_name, data_type, is_nullable, column_default
-- FROM information_schema.columns 
-- WHERE table_name = 'quiz_attempts' 
-- ORDER BY ordinal_position;

-- Step 2: Check current constraints on the table
-- SELECT conname, contype, confrelid::regclass, confupdtype, confdeltype, confmatchtype
-- FROM pg_constraint 
-- WHERE conrelid = 'quiz_attempts'::regclass;

-- Step 3: Make max_score nullable or add a default value
-- Option A: Make max_score nullable (recommended for flexibility)
ALTER TABLE quiz_attempts 
ALTER COLUMN max_score DROP NOT NULL;

-- Option B: Add a default value instead (uncomment if you prefer this approach)
-- ALTER TABLE quiz_attempts 
-- ALTER COLUMN max_score SET DEFAULT 0;

-- Step 4: If you want to ensure data integrity, add a check constraint
-- This ensures max_score is either NULL or a positive number
ALTER TABLE quiz_attempts 
ADD CONSTRAINT check_max_score_positive 
CHECK (max_score IS NULL OR max_score >= 0);

-- Step 5: Update any existing NULL values to 0 (optional)
-- Only run this if you want to set a default value for existing records
-- UPDATE quiz_attempts 
-- SET max_score = 0 
-- WHERE max_score IS NULL;

-- Step 6: If you want to add other commonly needed columns for quiz attempts
-- (Uncomment these if they don't exist and you need them)

-- ALTER TABLE quiz_attempts 
-- ADD COLUMN IF NOT EXISTS score DECIMAL(5,2) DEFAULT 0;

-- ALTER TABLE quiz_attempts 
-- ADD COLUMN IF NOT EXISTS percentage DECIMAL(5,2) GENERATED ALWAYS AS (
--     CASE 
--         WHEN max_score > 0 THEN (score / max_score) * 100 
--         ELSE 0 
--     END
-- ) STORED;

-- ALTER TABLE quiz_attempts 
-- ADD COLUMN IF NOT EXISTS passed BOOLEAN GENERATED ALWAYS AS (
--     CASE 
--         WHEN max_score > 0 THEN score >= (max_score * 0.6)  -- 60% passing grade
--         ELSE false 
--     END
-- ) STORED;

-- ALTER TABLE quiz_attempts 
-- ADD COLUMN IF NOT EXISTS time_spent INTEGER DEFAULT 0; -- in seconds

-- ALTER TABLE quiz_attempts 
-- ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP WITH TIME ZONE;

-- Step 7: Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_score ON quiz_attempts(score);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_percentage ON quiz_attempts(percentage);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_passed ON quiz_attempts(passed);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_completed_at ON quiz_attempts(completed_at);

-- Step 8: Verify the changes
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'quiz_attempts' 
AND column_name IN ('max_score', 'score', 'percentage', 'passed', 'time_spent', 'completed_at')
ORDER BY column_name;

-- Step 9: Check constraints
SELECT conname, contype, pg_get_constraintdef(oid) as definition
FROM pg_constraint 
WHERE conrelid = 'quiz_attempts'::regclass
AND conname LIKE '%max_score%';
