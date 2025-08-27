-- Database Setup for Course Modules
-- Run this in your Supabase SQL editor

-- 1. Create the course_modules table
CREATE TABLE IF NOT EXISTS course_modules (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    learning_objectives TEXT,
    estimated_duration INTEGER, -- in minutes
    is_required BOOLEAN DEFAULT true,
    order_index INTEGER NOT NULL DEFAULT 1,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Add module_id column to lessons table if it doesn't exist
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS module_id UUID REFERENCES course_modules(id) ON DELETE CASCADE;

-- 3. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_course_modules_course_id ON course_modules(course_id);
CREATE INDEX IF NOT EXISTS idx_course_modules_order ON course_modules(course_id, order_index);
CREATE INDEX IF NOT EXISTS idx_lessons_module_id ON lessons(module_id);
CREATE INDEX IF NOT EXISTS idx_lessons_course_module_order ON lessons(course_id, module_id, order_index);

-- 4. Add unique constraint to prevent duplicate order_index within the same course
ALTER TABLE course_modules ADD CONSTRAINT IF NOT EXISTS unique_course_module_order 
    UNIQUE (course_id, order_index);

-- 5. Create a function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 6. Create trigger for course_modules table
DROP TRIGGER IF EXISTS update_course_modules_updated_at ON course_modules;
CREATE TRIGGER update_course_modules_updated_at
    BEFORE UPDATE ON course_modules
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 7. Insert some sample data (optional)
-- INSERT INTO course_modules (course_id, title, description, learning_objectives, estimated_duration, order_index)
-- VALUES 
--     ('your-course-id-here', 'Introduction', 'Get started with the basics', 'Understand the fundamentals\nLearn key concepts', 60, 1),
--     ('your-course-id-here', 'Core Concepts', 'Dive deeper into the subject', 'Master core principles\nApply basic techniques', 90, 2),
--     ('your-course-id-here', 'Advanced Topics', 'Explore advanced concepts', 'Handle complex scenarios\nSolve real-world problems', 120, 3);

-- 8. Update existing lessons to assign them to a default module (if needed)
-- UPDATE lessons 
-- SET module_id = (
--     SELECT id FROM course_modules 
--     WHERE course_id = lessons.course_id 
--     ORDER BY order_index 
--     LIMIT 1
-- )
-- WHERE module_id IS NULL AND course_id IN (SELECT id FROM courses);

-- Note: Replace 'your-course-id-here' with actual course IDs from your database
-- Run the UPDATE statement only if you want to assign existing lessons to modules 