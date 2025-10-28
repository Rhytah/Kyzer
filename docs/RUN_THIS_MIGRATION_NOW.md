# 🚨 RUN THIS MIGRATION NOW

## The Error You're Seeing
```
Could not find the 'content_blocks' column of 'lessons' in the schema cache
```

## Why It's Happening
The editor is trying to save to a database column that doesn't exist yet.

## 🔧 How to Fix It (Takes 30 seconds)

### Option 1: Supabase Dashboard (EASIEST)

1. Go to your Supabase project: https://supabase.com/dashboard
2. Click on your project
3. Go to **SQL Editor** (left sidebar)
4. Click **"+ New query"**
5. Copy and paste this SQL:

```sql
-- Add content_blocks column to lessons table
ALTER TABLE lessons
ADD COLUMN IF NOT EXISTS content_blocks JSONB DEFAULT '[]'::jsonb;

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_lessons_content_blocks
ON lessons USING GIN (content_blocks);

-- Add constraint to ensure it's always an array
ALTER TABLE lessons
ADD CONSTRAINT content_blocks_is_array
CHECK (jsonb_typeof(content_blocks) = 'array');

-- Initialize existing lessons with empty array
UPDATE lessons
SET content_blocks = '[]'::jsonb
WHERE content_blocks IS NULL;
```

6. Click **"Run"** (or press Ctrl+Enter)
7. You should see "Success. No rows returned"

### Option 2: Supabase CLI

If you have Supabase CLI installed:

```bash
cd /Users/ritanamono/Desktop/byase/Kyzer
supabase db push migrations/add_content_blocks_to_lessons.sql
```

## ✅ Verify It Worked

Run this query in SQL Editor:

```sql
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'lessons'
AND column_name = 'content_blocks';
```

**Expected result:**
```
column_name     | data_type | column_default
content_blocks  | jsonb     | '[]'::jsonb
```

## 🎉 Done!

Now refresh your browser and try the editor again. It should work!

---

**Still having issues?** The migration SQL is also in:
- `migrations/add_content_blocks_to_lessons.sql`
- Or see `EDITOR_QUICK_FIX.md`
