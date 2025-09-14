-- Database Schema for Lesson Curation/Presentation System
-- This allows creating presentations with multiple content types arranged as slides

-- 1. Create lesson_presentations table
CREATE TABLE IF NOT EXISTS lesson_presentations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    total_slides INTEGER DEFAULT 0,
    estimated_duration INTEGER, -- in minutes
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create presentation_slides table for individual slides/content items
CREATE TABLE IF NOT EXISTS presentation_slides (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    presentation_id UUID NOT NULL REFERENCES lesson_presentations(id) ON DELETE CASCADE,
    slide_number INTEGER NOT NULL,
    content_type VARCHAR(50) NOT NULL, -- 'video', 'image', 'pdf', 'text', 'audio', 'document'
    title VARCHAR(255),
    content_url TEXT, -- URL to uploaded file or external URL
    content_text TEXT, -- For text content
    content_format VARCHAR(20) DEFAULT 'plaintext', -- 'plaintext', 'markdown', 'html'
    duration_seconds INTEGER, -- Duration for this slide in seconds
    metadata JSONB, -- Additional metadata like video dimensions, file size, etc.
    is_required BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_lesson_presentations_lesson_id ON lesson_presentations(lesson_id);
CREATE INDEX IF NOT EXISTS idx_lesson_presentations_created_by ON lesson_presentations(created_by);
CREATE INDEX IF NOT EXISTS idx_presentation_slides_presentation_id ON presentation_slides(presentation_id);
CREATE INDEX IF NOT EXISTS idx_presentation_slides_slide_number ON presentation_slides(presentation_id, slide_number);
CREATE INDEX IF NOT EXISTS idx_presentation_slides_content_type ON presentation_slides(content_type);

-- 4. Add unique constraint to prevent duplicate slide numbers within the same presentation
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'unique_presentation_slide_number'
    ) THEN
        ALTER TABLE presentation_slides ADD CONSTRAINT unique_presentation_slide_number 
            UNIQUE (presentation_id, slide_number);
    END IF;
END $$;

-- 5. Create triggers for automatic updated_at timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for lesson_presentations
DROP TRIGGER IF EXISTS update_lesson_presentations_updated_at ON lesson_presentations;
CREATE TRIGGER update_lesson_presentations_updated_at
    BEFORE UPDATE ON lesson_presentations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger for presentation_slides
DROP TRIGGER IF EXISTS update_presentation_slides_updated_at ON presentation_slides;
CREATE TRIGGER update_presentation_slides_updated_at
    BEFORE UPDATE ON presentation_slides
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 6. Add RLS (Row Level Security) policies
ALTER TABLE lesson_presentations ENABLE ROW LEVEL SECURITY;
ALTER TABLE presentation_slides ENABLE ROW LEVEL SECURITY;

-- RLS policy for lesson_presentations - users can only access presentations for courses they're enrolled in or created
CREATE POLICY "Users can view presentations for enrolled courses" ON lesson_presentations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM lessons l
            JOIN course_enrollments ce ON l.course_id = ce.course_id
            WHERE l.id = lesson_presentations.lesson_id
            AND ce.user_id = auth.uid()
        )
        OR created_by = auth.uid()
    );

CREATE POLICY "Users can create presentations for their courses" ON lesson_presentations
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM lessons l
            JOIN course_enrollments ce ON l.course_id = ce.course_id
            WHERE l.id = lesson_id
            AND ce.user_id = auth.uid()
        )
        OR created_by = auth.uid()
    );

CREATE POLICY "Users can update their own presentations" ON lesson_presentations
    FOR UPDATE USING (created_by = auth.uid());

CREATE POLICY "Users can delete their own presentations" ON lesson_presentations
    FOR DELETE USING (created_by = auth.uid());

-- RLS policy for presentation_slides - users can access slides for presentations they can view
CREATE POLICY "Users can view slides for accessible presentations" ON presentation_slides
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM lesson_presentations lp
            JOIN lessons l ON lp.lesson_id = l.id
            JOIN course_enrollments ce ON l.course_id = ce.course_id
            WHERE lp.id = presentation_slides.presentation_id
            AND ce.user_id = auth.uid()
        )
        OR EXISTS (
            SELECT 1 FROM lesson_presentations lp
            WHERE lp.id = presentation_slides.presentation_id
            AND lp.created_by = auth.uid()
        )
    );

CREATE POLICY "Users can create slides for their presentations" ON presentation_slides
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM lesson_presentations lp
            WHERE lp.id = presentation_id
            AND lp.created_by = auth.uid()
        )
    );

CREATE POLICY "Users can update slides for their presentations" ON presentation_slides
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM lesson_presentations lp
            WHERE lp.id = presentation_id
            AND lp.created_by = auth.uid()
        )
    );

CREATE POLICY "Users can delete slides for their presentations" ON presentation_slides
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM lesson_presentations lp
            WHERE lp.id = presentation_id
            AND lp.created_by = auth.uid()
        )
    );

-- 7. Add comments for documentation
COMMENT ON TABLE lesson_presentations IS 'Stores curated lesson presentations with multiple content types';
COMMENT ON TABLE presentation_slides IS 'Individual slides/content items within a presentation';
COMMENT ON COLUMN presentation_slides.content_type IS 'Type of content: video, image, pdf, text, audio, document';
COMMENT ON COLUMN presentation_slides.metadata IS 'JSON metadata for content-specific information';
COMMENT ON COLUMN presentation_slides.duration_seconds IS 'Duration of this slide in seconds (for progress tracking)';

-- 8. Create a function to automatically update total_slides count
CREATE OR REPLACE FUNCTION update_presentation_slide_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        UPDATE lesson_presentations 
        SET total_slides = (
            SELECT COUNT(*) FROM presentation_slides 
            WHERE presentation_id = NEW.presentation_id
        )
        WHERE id = NEW.presentation_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE lesson_presentations 
        SET total_slides = (
            SELECT COUNT(*) FROM presentation_slides 
            WHERE presentation_id = OLD.presentation_id
        )
        WHERE id = OLD.presentation_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update slide count
DROP TRIGGER IF EXISTS update_slide_count_trigger ON presentation_slides;
CREATE TRIGGER update_slide_count_trigger
    AFTER INSERT OR UPDATE OR DELETE ON presentation_slides
    FOR EACH ROW
    EXECUTE FUNCTION update_presentation_slide_count();
