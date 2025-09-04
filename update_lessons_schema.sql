-- SQL script to update lessons schema for audio attachment support
-- Run this script against your database to add the audio_attachment_url column

-- Add audio_attachment_url column to lessons table
ALTER TABLE lessons 
ADD COLUMN audio_attachment_url TEXT;

-- Add a comment to document the column purpose
COMMENT ON COLUMN lessons.audio_attachment_url IS 'URL to audio attachment file for supplementary narration or explanation';

-- Optional: Add an index for better query performance if you plan to filter by audio attachments
-- CREATE INDEX idx_lessons_audio_attachment_url ON lessons(audio_attachment_url) WHERE audio_attachment_url IS NOT NULL;

-- Verify the column was added successfully
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'lessons' 
AND column_name = 'audio_attachment_url';
