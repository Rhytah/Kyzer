-- Fix Row Level Security (RLS) policies for quiz_attempts table
-- Run this in your Supabase SQL editor

-- First, let's check the current RLS status and policies
-- (This is just for reference - you can run this to see current policies)
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
-- FROM pg_policies 
-- WHERE tablename = 'quiz_attempts';

-- Enable RLS on quiz_attempts table if not already enabled
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view their own quiz attempts" ON quiz_attempts;
DROP POLICY IF EXISTS "Users can insert their own quiz attempts" ON quiz_attempts;
DROP POLICY IF EXISTS "Users can update their own quiz attempts" ON quiz_attempts;
DROP POLICY IF EXISTS "Users can delete their own quiz attempts" ON quiz_attempts;
DROP POLICY IF EXISTS "Instructors can view all quiz attempts" ON quiz_attempts;
DROP POLICY IF EXISTS "Instructors can manage all quiz attempts" ON quiz_attempts;

-- Policy 1: Users can view their own quiz attempts
CREATE POLICY "Users can view their own quiz attempts" ON quiz_attempts
    FOR SELECT
    USING (auth.uid() = user_id);

-- Policy 2: Users can insert their own quiz attempts
CREATE POLICY "Users can insert their own quiz attempts" ON quiz_attempts
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policy 3: Users can update their own quiz attempts (if needed)
CREATE POLICY "Users can update their own quiz attempts" ON quiz_attempts
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Policy 4: Users can delete their own quiz attempts (if needed)
CREATE POLICY "Users can delete their own quiz attempts" ON quiz_attempts
    FOR DELETE
    USING (auth.uid() = user_id);

-- Policy 5: Instructors can view all quiz attempts for their courses
-- This assumes you have a way to determine if a user is an instructor
-- You might need to adjust this based on your user role system
CREATE POLICY "Instructors can view all quiz attempts" ON quiz_attempts
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM courses c
            JOIN lessons l ON c.id = l.course_id
            JOIN quizzes q ON l.id = q.lesson_id
            WHERE q.id = quiz_attempts.quiz_id
            AND c.instructor_id = auth.uid()
        )
    );

-- Policy 6: Instructors can manage all quiz attempts for their courses
CREATE POLICY "Instructors can manage all quiz attempts" ON quiz_attempts
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM courses c
            JOIN lessons l ON c.id = l.course_id
            JOIN quizzes q ON l.id = q.lesson_id
            WHERE q.id = quiz_attempts.quiz_id
            AND c.instructor_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM courses c
            JOIN lessons l ON c.id = l.course_id
            JOIN quizzes q ON l.id = q.lesson_id
            WHERE q.id = quiz_attempts.quiz_id
            AND c.instructor_id = auth.uid()
        )
    );

-- Alternative: If you don't have instructor_id in courses table, 
-- you can use a user_roles table or profiles table with role information
-- Uncomment and modify the following if you have a different role system:

-- CREATE POLICY "Instructors can view all quiz attempts" ON quiz_attempts
--     FOR SELECT
--     USING (
--         EXISTS (
--             SELECT 1 FROM profiles p
--             WHERE p.id = auth.uid()
--             AND p.role = 'instructor'
--         )
--     );

-- CREATE POLICY "Instructors can manage all quiz attempts" ON quiz_attempts
--     FOR ALL
--     USING (
--         EXISTS (
--             SELECT 1 FROM profiles p
--             WHERE p.id = auth.uid()
--             AND p.role = 'instructor'
--         )
--     )
--     WITH CHECK (
--         EXISTS (
--             SELECT 1 FROM profiles p
--             WHERE p.id = auth.uid()
--             AND p.role = 'instructor'
--         )
--     );

-- Verify the policies were created
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies 
WHERE tablename = 'quiz_attempts'
ORDER BY policyname;
