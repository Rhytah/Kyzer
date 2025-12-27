# 🚨 RUN RESOURCES MIGRATION

## The Error You Might See
```
column "resources" of relation "lessons" does not exist
column "resources" of relation "courses" does not exist
```

## Why Run This Migration
This enables the **Resources feature** that allows you to:
- Add external links to lessons and courses
- Upload PDF files, documents, and other materials
- Provide supplementary materials to learners
- Display resources at the end of courses

## 🔧 How to Run the Migration (Takes 30 seconds)

### Option 1: Supabase Dashboard (EASIEST)

1. Go to your Supabase project: https://supabase.com/dashboard
2. Click on your project
3. Go to **SQL Editor** (left sidebar)
4. Click **"+ New query"**
5. Copy and paste this SQL:

```sql
-- Migration: Add resources column to lessons and courses tables
-- Purpose: Enable adding links and attachments to lessons and courses

-- Add resources column to lessons table
ALTER TABLE lessons
ADD COLUMN IF NOT EXISTS resources JSONB DEFAULT '[]'::jsonb;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_lessons_resources
ON lessons USING GIN (resources);

-- Add comment for documentation
COMMENT ON COLUMN lessons.resources IS 'JSONB array storing resources (links, files, attachments) for the lesson. Each resource contains type, title, url, and optional file_path.';

-- Add resources column to courses table
ALTER TABLE courses
ADD COLUMN IF NOT EXISTS resources JSONB DEFAULT '[]'::jsonb;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_courses_resources
ON courses USING GIN (resources);

-- Add comment for documentation
COMMENT ON COLUMN courses.resources IS 'JSONB array storing resources (links, files, attachments) for the course. Displayed as a log list at the end of the course.';

-- Update existing records to have empty array if null
UPDATE lessons
SET resources = '[]'::jsonb
WHERE resources IS NULL;

UPDATE courses
SET resources = '[]'::jsonb
WHERE resources IS NULL;
```

6. Click **"Run"** (or press Ctrl+Enter / Cmd+Enter)
7. You should see "Success. No rows returned" or similar success message

### Option 2: Supabase CLI

If you have Supabase CLI installed:

```bash
cd /Users/ritanamono/Desktop/byase/Kyzer

# Run the migration
supabase db push migrations/add_resources_to_lessons_and_courses.sql
```

## ✅ Verify It Worked

Run this query in SQL Editor:

```sql
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name IN ('lessons', 'courses')
AND column_name = 'resources'
ORDER BY table_name, column_name;
```

**Expected result:**
```
table_name | column_name | data_type | column_default
-----------|-------------|-----------|------------------
courses    | resources   | jsonb     | '[]'::jsonb
lessons    | resources   | jsonb     | '[]'::jsonb
```

## 🎉 Done!

Now refresh your browser and you'll see the **Resources section** in:
- Course creation/editing forms
- Lesson creation/editing forms

## What This Enables

✅ **Add External Links** - Articles, documentation, YouTube videos, etc.
✅ **Upload Files** - PDFs, documents, images, videos
✅ **Organize Resources** - Title, description, type indicator
✅ **File Size Display** - Shows file sizes automatically
✅ **Easy Management** - Add, remove, and organize resources
✅ **Learner Access** - Resources displayed on lesson view and course detail pages

## Where to Find the Feature

### For Instructors/Admins:
1. **Adding Resources to a Course:**
   - Go to Course Management → Create/Edit Course
   - Scroll down to the **blue highlighted "Course Resources" section**
   - Click "Add Resource" button

2. **Adding Resources to a Lesson:**
   - Go to Course Management → Expand Course → Add/Edit Lesson
   - Scroll down to the **blue highlighted "Lesson Resources" section**
   - Click "Add Resource" button

### For Learners:
- **Lesson Resources:** Displayed in the lesson view page
- **Course Resources:** Available in the "Resources" tab on course detail page

---

**Still having issues?** The migration SQL is also in:
- `migrations/add_resources_to_lessons_and_courses.sql`
