-- Migration: Create course_reviews table
-- Purpose: Store user reviews and ratings for courses
-- Date: 2025-01-XX

-- Create course_reviews table
CREATE TABLE IF NOT EXISTS course_reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure one review per user per course
  UNIQUE(course_id, user_id)
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_course_reviews_course_id ON course_reviews(course_id);
CREATE INDEX IF NOT EXISTS idx_course_reviews_user_id ON course_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_course_reviews_rating ON course_reviews(rating);
CREATE INDEX IF NOT EXISTS idx_course_reviews_created_at ON course_reviews(created_at DESC);

-- Add comments for documentation
COMMENT ON TABLE course_reviews IS 'User reviews and ratings for courses';
COMMENT ON COLUMN course_reviews.rating IS 'Rating from 1 to 5 stars';
COMMENT ON COLUMN course_reviews.comment IS 'Optional text review from the user';

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_course_reviews_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_course_reviews_updated_at
  BEFORE UPDATE ON course_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_course_reviews_updated_at();

-- Enable Row Level Security
ALTER TABLE course_reviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can view all reviews
CREATE POLICY "Anyone can view course reviews"
  ON course_reviews
  FOR SELECT
  USING (true);

-- Users can create their own reviews
CREATE POLICY "Users can create their own reviews"
  ON course_reviews
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own reviews
CREATE POLICY "Users can update their own reviews"
  ON course_reviews
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own reviews
CREATE POLICY "Users can delete their own reviews"
  ON course_reviews
  FOR DELETE
  USING (auth.uid() = user_id);

