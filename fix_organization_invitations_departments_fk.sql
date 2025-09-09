-- Fix foreign key relationship between organization_invitations and departments
-- This script ensures the foreign key constraint is properly created and recognized

-- First, ensure departments table exists
CREATE TABLE IF NOT EXISTS departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  manager_id UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ensure organization_invitations table exists with proper foreign key
CREATE TABLE IF NOT EXISTS organization_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'learner',
  department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
  invited_by UUID REFERENCES profiles(id),
  custom_message TEXT,
  status VARCHAR(20) DEFAULT 'pending',
  invited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Drop and recreate the foreign key constraint to ensure it's properly recognized
ALTER TABLE organization_invitations 
DROP CONSTRAINT IF EXISTS organization_invitations_department_id_fkey;

ALTER TABLE organization_invitations 
ADD CONSTRAINT organization_invitations_department_id_fkey 
FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_organization_invitations_department_id ON organization_invitations(department_id);
CREATE INDEX IF NOT EXISTS idx_departments_organization_id ON departments(organization_id);

-- Refresh PostgREST schema cache (this is a comment - actual refresh needs to be done via Supabase dashboard or API)
-- To refresh the schema cache, you can:
-- 1. Go to Supabase Dashboard > Settings > API > Refresh Schema
-- 2. Or restart your Supabase project
-- 3. Or call the PostgREST reload API endpoint

-- Verify the foreign key relationship exists
SELECT 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_name='organization_invitations'
    AND kcu.column_name='department_id';
