# 🚨 RUN TIMING TRACKING MIGRATION

## The Error You're Seeing
```
Could not find the 'minimum_time_required' column of 'lesson_progress' in the schema cache
```

## Why It's Happening
The timing tracking feature requires database columns that haven't been created yet.

## 🔧 How to Fix It (Takes 30 seconds)

### Option 1: Supabase Dashboard (EASIEST)

1. Go to your Supabase project: https://supabase.com/dashboard
2. Click on your project
3. Go to **SQL Editor** (left sidebar)
4. Click **"+ New query"**
5. Copy and paste this SQL:

```sql
-- Migration: Add timing and review tracking to lesson progress
-- Purpose: Track time spent on videos/PDFs and enforce minimum review time before progression

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
```

6. Click **"Run"** (or press Ctrl+Enter / Cmd+Enter)
7. You should see "Success. No rows returned" or similar success message

### Option 2: Supabase CLI

If you have Supabase CLI installed:

```bash
cd /Users/ritanamono/Desktop/byase/Kyzer

# Run the migration
supabase db push migrations/add_lesson_timing_tracking.sql
```

## ✅ Verify It Worked

Run this query in SQL Editor:

```sql
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'lesson_progress'
AND column_name IN ('time_spent_seconds', 'minimum_time_required', 'review_completed', 'last_activity_at')
ORDER BY column_name;
```

**Expected result:**
```
column_name              | data_type | column_default
-------------------------|-----------|------------------
last_activity_at         | timestamp | now()
minimum_time_required    | integer   | NULL
review_completed         | boolean   | false
time_spent_seconds      | integer   | 0
```

## 🎉 Done!

Now refresh your browser and the timing tracking feature will work for both videos and PDFs!

## What This Enables

- ✅ Time tracking for videos and PDFs
- ✅ Minimum time requirement (80% of lesson duration)
- ✅ Blocks progression until minimum time is met
- ✅ Disables "Next Lesson" and "Mark Complete" buttons until requirement is met
- ✅ Shows time remaining indicator
- ✅ Prevents navigation to future lessons from sidebar

---

**Still having issues?** The migration SQL is also in:
- `migrations/add_lesson_timing_tracking.sql`
