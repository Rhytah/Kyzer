-- Certificate Templates Schema for Supabase (FIXED VERSION)
-- This works with your existing database structure

-- Create certificate_templates table
CREATE TABLE IF NOT EXISTS certificate_templates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    template_url TEXT NOT NULL, -- URL to the certificate template image
    placeholders JSONB DEFAULT '{}', -- Key-value pairs of placeholders and their descriptions
    is_default BOOLEAN DEFAULT false,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add template_id and certificate_data columns to existing certificates table
ALTER TABLE certificates
ADD COLUMN IF NOT EXISTS template_id UUID REFERENCES certificate_templates(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS certificate_data JSONB DEFAULT '{}'; -- Store generated data like user_name, course_title, etc.

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_certificate_templates_is_default ON certificate_templates(is_default);
CREATE INDEX IF NOT EXISTS idx_certificate_templates_created_by ON certificate_templates(created_by);
CREATE INDEX IF NOT EXISTS idx_certificates_template_id ON certificates(template_id);

-- Create RLS policies for certificate_templates
ALTER TABLE certificate_templates ENABLE ROW LEVEL SECURITY;

-- Policy: System admins and instructors can manage templates
CREATE POLICY "Admins and instructors can manage certificate templates" ON certificate_templates
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM user_profiles
        WHERE user_profiles.id = auth.uid()
        AND user_profiles.role IN ('system_admin', 'instructor')
    )
    OR EXISTS (
        SELECT 1 FROM organization_members
        WHERE organization_members.user_id = auth.uid()
        AND organization_members.role = 'admin'
    )
    OR certificate_templates.created_by = auth.uid()
);

-- Policy: All authenticated users can view templates (for certificate generation)
CREATE POLICY "Authenticated users can view certificate templates" ON certificate_templates
FOR SELECT USING (auth.role() = 'authenticated');

-- Update certificates RLS to handle template_id
-- First drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own certificates" ON certificates;
DROP POLICY IF EXISTS "Users can manage their own certificates" ON certificates;
DROP POLICY IF EXISTS "System can create certificates" ON certificates;

-- Recreate with template support
CREATE POLICY "Users can view their own certificates" ON certificates
FOR SELECT USING (
    user_id = auth.uid()
    OR EXISTS (
        SELECT 1 FROM user_profiles
        WHERE user_profiles.id = auth.uid()
        AND user_profiles.role IN ('system_admin', 'instructor')
    )
    OR EXISTS (
        SELECT 1 FROM organization_members
        WHERE organization_members.user_id = auth.uid()
        AND organization_members.role = 'admin'
    )
);

CREATE POLICY "System can create certificates" ON certificates
FOR INSERT WITH CHECK (
    auth.role() = 'authenticated'
);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_certificate_templates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_certificate_templates_updated_at ON certificate_templates;
CREATE TRIGGER update_certificate_templates_updated_at
    BEFORE UPDATE ON certificate_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_certificate_templates_updated_at();

-- =============================================
-- STORAGE BUCKET SETUP AND POLICIES
-- =============================================

-- Create certificates storage bucket (if it doesn't exist)
INSERT INTO storage.buckets (id, name, public)
VALUES ('certificates', 'certificates', true)
ON CONFLICT (id) DO NOTHING;

-- Drop existing storage policies if they exist
DROP POLICY IF EXISTS "Authenticated users can upload certificate templates" ON storage.objects;
DROP POLICY IF EXISTS "Public read access to certificate templates" ON storage.objects;
DROP POLICY IF EXISTS "Users can update certificate templates" ON storage.objects;
DROP POLICY IF EXISTS "Manage courses users can delete certificate templates" ON storage.objects;

-- Policy: Allow authenticated users to upload files to certificates bucket
CREATE POLICY "Authenticated users can upload certificate templates" ON storage.objects
FOR INSERT WITH CHECK (
    bucket_id = 'certificates'
    AND auth.role() = 'authenticated'
);

-- Policy: Allow public read access to certificate templates
CREATE POLICY "Public read access to certificate templates" ON storage.objects
FOR SELECT USING (
    bucket_id = 'certificates'
);

-- Policy: Allow users to update their own uploaded templates
CREATE POLICY "Users can update certificate templates" ON storage.objects
FOR UPDATE USING (
    bucket_id = 'certificates'
    AND auth.role() = 'authenticated'
);

-- Policy: Allow admins and instructors to delete templates
CREATE POLICY "Admins can delete certificate templates" ON storage.objects
FOR DELETE USING (
    bucket_id = 'certificates'
    AND (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE user_profiles.id = auth.uid()
            AND user_profiles.role IN ('system_admin', 'instructor')
        )
        OR EXISTS (
            SELECT 1 FROM organization_members
            WHERE organization_members.user_id = auth.uid()
            AND organization_members.role = 'admin'
        )
    )
);

-- Insert a default certificate template (optional)
INSERT INTO certificate_templates (name, description, template_url, placeholders, is_default, created_by)
VALUES (
    'Default Certificate Template',
    'A simple, elegant certificate template for course completion',
    'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjhmOWZhIiBzdHJva2U9IiNkZWUyZTYiIHN0cm9rZS13aWR0aD0iMiIvPgogIDx0ZXh0IHg9IjUwJSIgeT0iMzAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMzYiIGZvbnQtd2VpZ2h0PSJib2xkIiBmaWxsPSIjMzc0MTUxIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5DZXJ0aWZpY2F0ZSBvZiBDb21wbGV0aW9uPC90ZXh0PgogIDx0ZXh0IHg9IjUwJSIgeT0iNDUlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiM2Yjc0ODAiIHRleHQtYW5jaG9yPSJtaWRkbGUiPnt7dXNlcl9uYW1lfX08L3RleHQ+CiAgPHRleHQgeD0iNTAlIiB5PSI1NSUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIyMCIgZmlsbD0iIzZiNzQ4MCIgdGV4dC1hbmNob3I9Im1pZGRsZSI+e3tjb3Vyc2VfdGl0bGV9fTwvdGV4dD4KICA8dGV4dCB4PSI4MCUiIHk9Ijc1JSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE0IiBmaWxsPSIjOWNhM2FmIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj57e2NvbXBsZXRpb25fZGF0ZX19PC90ZXh0PgogIDx0ZXh0IHg9IjIwJSIgeT0iNzUlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5Y2EzYWYiIHRleHQtYW5jaG9yPSJtaWRkbGUiPnt7Y2VydGlmaWNhdGVfaWR9fTwvdGV4dD4KPC9zdmc+',
    '{
        "{{user_name}}": "Full name of the certificate recipient",
        "{{course_title}}": "Title of the completed course",
        "{{completion_date}}": "Date when the course was completed",
        "{{certificate_id}}": "Unique certificate identifier",
        "{{instructor_name}}": "Name of the course instructor",
        "{{organization_name}}": "Name of the organization"
    }',
    true,
    NULL
) ON CONFLICT DO NOTHING;

-- Grant necessary permissions
GRANT ALL ON certificate_templates TO authenticated;
GRANT ALL ON certificates TO authenticated;
