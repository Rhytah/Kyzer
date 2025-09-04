# Database Fix Instructions

## 🚨 Error: Missing Columns in quiz_attempts Table

**Error:** `Could not find the 'percentage' column of 'quiz_attempts' in the schema cache`

## 🔧 Solution: Run Database Schema Update

### Step 1: Go to Supabase Dashboard
1. Open your Supabase project dashboard
2. Navigate to **SQL Editor**

### Step 2: Run the Schema Update
Copy and paste this SQL script into the SQL Editor and click **Run**:

```sql
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
```

### Step 3: Verify Success
After running the script, you should see the new columns in the output:
- `max_score` (INTEGER)
- `percentage` (DECIMAL)
- `passed` (BOOLEAN)
- `time_spent` (INTEGER)

### Step 4: Test the Application
1. Go back to your application at http://localhost:5175/
2. Try taking a quiz
3. The error should be resolved and quiz completion should work

## 📁 Files Created
- `simple_quiz_columns_fix.sql` - The SQL script to run
- `add_missing_quiz_columns.sql` - Alternative comprehensive script

## ✅ Expected Result
After running the SQL script, the quiz functionality will work correctly with:
- Proper score calculation
- Pass/fail determination
- Visual completion feedback
- Database storage of completion status
