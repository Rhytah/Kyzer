-- Migration: Add content_blocks column to lessons table
-- Purpose: Enable the Course Editor to store rich content blocks
-- Date: 2025-10-08

-- Add content_blocks column to store editor block data
ALTER TABLE lessons
ADD COLUMN IF NOT EXISTS content_blocks JSONB DEFAULT '[]'::jsonb;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_lessons_content_blocks
ON lessons USING GIN (content_blocks);

-- Add comment for documentation
COMMENT ON COLUMN lessons.content_blocks IS 'JSONB array storing rich content blocks from the course editor. Each block contains type, data, position, and size information.';

-- Optional: Add constraint to ensure it's always an array
ALTER TABLE lessons
ADD CONSTRAINT content_blocks_is_array
CHECK (jsonb_typeof(content_blocks) = 'array');

-- Update existing lessons to have empty array if null
UPDATE lessons
SET content_blocks = '[]'::jsonb
WHERE content_blocks IS NULL;

-- Example content_blocks structure:
-- [
--   {
--     "id": "block_123_abc",
--     "type": "text",
--     "data": { "content": "<p>Hello</p>", "fontSize": 16 },
--     "position": { "x": 0, "y": 0 },
--     "size": { "width": 800, "height": 400 },
--     "createdAt": "2025-10-08T10:00:00.000Z",
--     "updatedAt": "2025-10-08T10:00:00.000Z"
--   }
-- ]
