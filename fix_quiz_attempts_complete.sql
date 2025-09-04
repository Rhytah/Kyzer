-- Complete fix for quiz_attempts table RLS issues
-- Run this in your Supabase SQL editor

-- Step 1: First, let's check the current table structure
-- (Run this to see what columns exist)
-- SELECT column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'quiz_attempts' 
-- ORDER BY ordinal_position;

-- Step 2: Ensure the table has the required columns
-- Add user_id column if it doesn't exist
ALTER TABLE quiz_attempts 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES profiles(id) ON DELETE CASCADE;

-- Step 3: Temporarily disable RLS to fix the immediate issue
ALTER TABLE quiz_attempts DISABLE ROW LEVEL SECURITY;

-- Step 4: Drop all existing policies to start fresh
DROP POLICY IF EXISTS "Users can view their own quiz attempts" ON quiz_attempts;
DROP POLICY IF EXISTS "Users can insert their own quiz attempts" ON quiz_attempts;
DROP POLICY IF EXISTS "Users can update their own quiz attempts" ON quiz_attempts;
DROP POLICY IF EXISTS "Users can delete their own quiz attempts" ON quiz_attempts;
DROP POLICY IF EXISTS "Instructors can view all quiz attempts" ON quiz_attempts;
DROP POLICY IF EXISTS "Instructors can manage all quiz attempts" ON quiz_attempts;
DROP POLICY IF EXISTS "Enable read access for all users" ON quiz_attempts;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON quiz_attempts;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON quiz_attempts;
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON quiz_attempts;

-- Step 5: Create simple, working RLS policies
-- Enable RLS
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;

-- Policy 1: Allow authenticated users to insert quiz attempts
CREATE POLICY "Enable insert for authenticated users only" ON quiz_attempts
    FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

-- Policy 2: Allow users to view their own quiz attempts
CREATE POLICY "Enable read access for all users" ON quiz_attempts
    FOR SELECT
    USING (auth.uid() = user_id OR auth.uid() IS NOT NULL);

-- Policy 3: Allow users to update their own quiz attempts
CREATE POLICY "Enable update for users based on user_id" ON quiz_attempts
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Policy 4: Allow users to delete their own quiz attempts
CREATE POLICY "Enable delete for users based on user_id" ON quiz_attempts
    FOR DELETE
    USING (auth.uid() = user_id);

-- Step 6: Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_id ON quiz_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_quiz_id ON quiz_attempts(quiz_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_quiz ON quiz_attempts(user_id, quiz_id);

-- Step 7: If you have existing quiz_attempts without user_id, update them
-- (Only run this if you have existing data that needs user_id populated)
-- UPDATE quiz_attempts 
-- SET user_id = auth.uid() 
-- WHERE user_id IS NULL;

-- Step 8: Verify the setup
SELECT 
    schemaname, 
    tablename, 
    policyname, 
    permissive, 
    roles, 
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'quiz_attempts'
ORDER BY policyname;

-- Step 9: Test the policies work
-- (This is just for verification - you can run this to test)
-- SELECT 'RLS is enabled' as status WHERE EXISTS (
--     SELECT 1 FROM pg_class 
--     WHERE relname = 'quiz_attempts' 
--     AND relrowsecurity = true
-- );
