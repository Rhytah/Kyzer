-- Migration: Add resources column to lessons and courses tables
-- Purpose: Enable adding links and attachments to lessons and courses
-- Date: 2025-01-XX

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

-- Example resources structure:
-- [
--   {
--     "id": "resource_123_abc",
--     "type": "link", // "link" | "file" | "attachment"
--     "title": "Additional Reading Material",
--     "url": "https://example.com/article",
--     "file_path": null, // For uploaded files
--     "file_name": null, // For uploaded files
--     "file_size": null, // In bytes
--     "description": "Optional description",
--     "created_at": "2025-01-XXT10:00:00.000Z"
--   }
-- ]
