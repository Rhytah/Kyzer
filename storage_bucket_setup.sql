-- Storage Bucket Setup for Supabase
-- Run this in your Supabase SQL Editor to create the required storage buckets

-- 1. Create the course-content bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'course-content',
  'course-content',
  true,
  52428800, -- 50MB limit
  ARRAY[
    'image/jpeg',
    'image/png', 
    'image/gif',
    'image/webp',
    'image/svg+xml',
    'video/mp4',
    'video/webm',
    'video/ogg',
    'video/mov',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
    'text/markdown',
    'text/html',
    'audio/mpeg',
    'audio/wav',
    'audio/ogg',
    'application/zip'
  ]
) ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 52428800,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 2. Create storage policies for course-content bucket
-- Policy for authenticated users to upload files
CREATE POLICY "Authenticated users can upload files" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'course-content');

-- Policy for authenticated users to view files
CREATE POLICY "Authenticated users can view files" ON storage.objects
FOR SELECT TO authenticated
USING (bucket_id = 'course-content');

-- Policy for authenticated users to update their own files
CREATE POLICY "Users can update their own files" ON storage.objects
FOR UPDATE TO authenticated
USING (bucket_id = 'course-content' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Policy for authenticated users to delete their own files
CREATE POLICY "Users can delete their own files" ON storage.objects
FOR DELETE TO authenticated
USING (bucket_id = 'course-content' AND auth.uid()::text = (storage.foldername(name))[1]);

-- 3. Create other required buckets if they don't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'certificates',
  'certificates',
  true,
  10485760, -- 10MB limit
  ARRAY['application/pdf', 'image/jpeg', 'image/png']
) ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'organization-logos',
  'organization-logos',
  true,
  2097152, -- 2MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
) ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'course-thumbnails',
  'course-thumbnails',
  true,
  2097152, -- 2MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- 4. Create policies for other buckets
-- Avatars bucket policies
CREATE POLICY "Authenticated users can upload avatars" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'avatars');

CREATE POLICY "Anyone can view avatars" ON storage.objects
FOR SELECT TO anon, authenticated
USING (bucket_id = 'avatars');

-- Certificates bucket policies
CREATE POLICY "Authenticated users can upload certificates" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'certificates');

CREATE POLICY "Authenticated users can view certificates" ON storage.objects
FOR SELECT TO authenticated
USING (bucket_id = 'certificates');

-- Organization logos bucket policies
CREATE POLICY "Authenticated users can upload org logos" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'organization-logos');

CREATE POLICY "Anyone can view org logos" ON storage.objects
FOR SELECT TO anon, authenticated
USING (bucket_id = 'organization-logos');

-- Course thumbnails bucket policies
CREATE POLICY "Authenticated users can upload thumbnails" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'course-thumbnails');

CREATE POLICY "Anyone can view thumbnails" ON storage.objects
FOR SELECT TO anon, authenticated
USING (bucket_id = 'course-thumbnails');
