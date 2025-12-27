-- Migration: Add timing and review tracking to lesson progress
-- Purpose: Track time spent on videos/PDFs and enforce minimum review time before progression
-- Date: 2025-01-XX

-- Add timing tracking columns to lesson_progress table
ALTER TABLE lesson_progress
ADD COLUMN IF NOT EXISTS time_spent_seconds INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS minimum_time_required INTEGER DEFAULT NULL,
ADD COLUMN IF NOT EXISTS review_completed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS last_activity_at TIMESTAMP DEFAULT NOW();

-- Add comment for documentation
COMMENT ON COLUMN lesson_progress.time_spent_seconds IS 'Total time spent on the lesson in seconds';
COMMENT ON COLUMN lesson_progress.minimum_time_required IS 'Minimum time required to complete the lesson (in seconds). NULL means no minimum.';
COMMENT ON COLUMN lesson_progress.review_completed IS 'Whether the material has been reviewed for the minimum required time';
COMMENT ON COLUMN lesson_progress.last_activity_at IS 'Last time the user interacted with the lesson';

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_lesson_progress_time_tracking
ON lesson_progress(user_id, lesson_id, review_completed);

-- Update existing records
UPDATE lesson_progress
SET time_spent_seconds = COALESCE((metadata->>'timeSpent')::INTEGER, 0),
    review_completed = COALESCE(completed, FALSE),
    last_activity_at = COALESCE(updated_at, NOW())
WHERE time_spent_seconds = 0 OR review_completed = FALSE;
