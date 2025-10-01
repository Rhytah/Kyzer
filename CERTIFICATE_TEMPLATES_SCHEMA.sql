-- Certificate Templates Schema for Supabase
-- This creates the certificate_templates table and updates the certificates table

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

-- Policy: Users with manage_courses permission can manage templates
CREATE POLICY "Users with manage_courses can manage certificate templates" ON certificate_templates
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND (
            profiles.role = 'admin'
            OR profiles.permissions ? 'manage_courses'
            OR profiles.id = certificate_templates.created_by
        )
    )
);

-- Policy: All authenticated users can view templates (for certificate generation)
CREATE POLICY "Authenticated users can view certificate templates" ON certificate_templates
FOR SELECT USING (auth.role() = 'authenticated');

-- Update certificates RLS to handle template_id
-- First drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own certificates" ON certificates;
DROP POLICY IF EXISTS "Users can manage their own certificates" ON certificates;

-- Recreate with template support
CREATE POLICY "Users can view their own certificates" ON certificates
FOR SELECT USING (
    user_id = auth.uid()
    OR EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND (profiles.role = 'admin' OR profiles.permissions ? 'manage_courses')
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
CREATE TRIGGER update_certificate_templates_updated_at
    BEFORE UPDATE ON certificate_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_certificate_templates_updated_at();

-- Insert a default certificate template (optional)
INSERT INTO certificate_templates (name, description, template_url, placeholders, is_default, created_by)
VALUES (
    'Default Certificate Template',
    'A simple, elegant certificate template for course completion',
    'https://via.placeholder.com/800x600/f8f9fa/343a40?text=Certificate+Template',
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

-- =============================================
-- STORAGE BUCKET SETUP AND POLICIES
-- =============================================

-- Create certificates storage bucket (if it doesn't exist)
-- Note: This needs to be done via Supabase Dashboard or API, not SQL
-- But we'll create the policies for the bucket

-- Storage policies for certificate templates
-- Allow authenticated users to upload certificate templates
INSERT INTO storage.buckets (id, name, public)
VALUES ('certificates', 'certificates', true)
ON CONFLICT (id) DO NOTHING;

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

-- Policy: Allow users with manage_courses to delete templates
CREATE POLICY "Manage courses users can delete certificate templates" ON storage.objects
FOR DELETE USING (
    bucket_id = 'certificates'
    AND EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND (
            profiles.role = 'admin'
            OR profiles.permissions ? 'manage_courses'
        )
    )
);