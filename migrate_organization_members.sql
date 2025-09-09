-- Migration script to improve organization_members schema
-- This script safely migrates from the current schema to the improved one

-- Step 1: Create a backup of existing data
CREATE TABLE IF NOT EXISTS organization_members_backup AS 
SELECT * FROM organization_members;

-- Step 2: Check for data inconsistencies before migration
DO $$
DECLARE
  orphaned_members INTEGER;
  duplicate_memberships INTEGER;
BEGIN
  -- Check for members with invalid profile references
  SELECT COUNT(*) INTO orphaned_members
  FROM organization_members om
  LEFT JOIN profiles p ON om.profile_id = p.id
  WHERE om.profile_id IS NOT NULL AND p.id IS NULL;
  
  IF orphaned_members > 0 THEN
    RAISE NOTICE 'Found % members with invalid profile references', orphaned_members;
  END IF;
  
  -- Check for duplicate memberships
  SELECT COUNT(*) INTO duplicate_memberships
  FROM (
    SELECT organization_id, profile_id, COUNT(*)
    FROM organization_members
    WHERE profile_id IS NOT NULL
    GROUP BY organization_id, profile_id
    HAVING COUNT(*) > 1
  ) duplicates;
  
  IF duplicate_memberships > 0 THEN
    RAISE NOTICE 'Found % duplicate memberships', duplicate_memberships;
  END IF;
END $$;

-- Step 3: Handle members with user_id but no profile_id
-- Create profiles for users who don't have them
INSERT INTO profiles (id, email, first_name, last_name, auth_user_id, created_at)
SELECT 
  om.user_id,
  COALESCE(au.email, 'user_' || om.user_id || '@example.com'),
  'Unknown',
  'User',
  om.user_id,
  om.created_at
FROM organization_members om
LEFT JOIN auth.users au ON om.user_id = au.id
WHERE om.profile_id IS NULL 
  AND om.user_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM profiles p WHERE p.auth_user_id = om.user_id
  );

-- Step 4: Update organization_members to use profile_id where missing
UPDATE organization_members 
SET profile_id = (
  SELECT id FROM profiles p WHERE p.auth_user_id = organization_members.user_id
)
WHERE profile_id IS NULL AND user_id IS NOT NULL;

-- Step 5: Remove duplicate memberships (keep the most recent one)
DELETE FROM organization_members 
WHERE id IN (
  SELECT id FROM (
    SELECT id, 
           ROW_NUMBER() OVER (
             PARTITION BY organization_id, profile_id 
             ORDER BY created_at DESC
           ) as rn
    FROM organization_members
    WHERE profile_id IS NOT NULL
  ) ranked
  WHERE rn > 1
);

-- Step 6: Update role values to match the new schema
UPDATE organization_members 
SET role = CASE 
  WHEN role = 'admin' THEN 'corporate_admin'
  WHEN role = 'manager' THEN 'manager'
  WHEN role = 'member' THEN 'learner'
  ELSE role
END
WHERE role IN ('admin', 'manager', 'member');

-- Step 7: Update profiles role values to match
UPDATE profiles 
SET role = CASE 
  WHEN role = 'admin' THEN 'corporate_admin'
  WHEN role = 'manager' THEN 'manager'
  WHEN role = 'member' THEN 'learner'
  ELSE role
END
WHERE role IN ('admin', 'manager', 'member');

-- Step 8: Now we can safely drop and recreate the table
-- First, drop the old table
DROP TABLE IF EXISTS organization_members CASCADE;

-- Step 9: Create the new improved table
CREATE TABLE public.organization_members (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL,
  profile_id UUID NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'learner',
  status VARCHAR(50) NOT NULL DEFAULT 'active',
  permissions JSONB DEFAULT '{}',
  invited_by UUID REFERENCES profiles(id),
  invited_at TIMESTAMP WITH TIME ZONE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
  removed_at TIMESTAMP WITH TIME ZONE,
  
  CONSTRAINT organization_members_pkey PRIMARY KEY (id),
  CONSTRAINT organization_members_organization_profile_key UNIQUE (organization_id, profile_id),
  CONSTRAINT organization_members_organization_id_fkey 
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
  CONSTRAINT organization_members_profile_id_fkey 
    FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE,
  CONSTRAINT organization_members_invited_by_fkey 
    FOREIGN KEY (invited_by) REFERENCES profiles(id),
  CONSTRAINT organization_members_department_id_fkey 
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL,
  
  CONSTRAINT organization_members_status_check CHECK (
    status IN ('active', 'inactive', 'pending', 'suspended')
  ),
  CONSTRAINT organization_members_role_check CHECK (
    role IN ('corporate_admin', 'system_admin', 'instructor', 'learner', 'manager')
  )
);

-- Step 10: Restore data from backup
INSERT INTO organization_members (
  id, organization_id, profile_id, role, status, permissions,
  invited_by, invited_at, joined_at, created_at, updated_at,
  department_id, removed_at
)
SELECT 
  id, organization_id, profile_id, role, status, permissions,
  invited_by, invited_at, joined_at, created_at, updated_at,
  department_id, removed_at
FROM organization_members_backup
WHERE profile_id IS NOT NULL;

-- Step 11: Create indexes
CREATE INDEX IF NOT EXISTS idx_organization_members_organization_id 
  ON organization_members(organization_id);
CREATE INDEX IF NOT EXISTS idx_organization_members_profile_id 
  ON organization_members(profile_id);
CREATE INDEX IF NOT EXISTS idx_organization_members_department_id 
  ON organization_members(department_id);
CREATE INDEX IF NOT EXISTS idx_organization_members_status 
  ON organization_members(status);
CREATE INDEX IF NOT EXISTS idx_organization_members_role 
  ON organization_members(role);
CREATE INDEX IF NOT EXISTS idx_organization_members_invited_by 
  ON organization_members(invited_by);

-- Step 12: Create the view and functions (from the improved schema)
CREATE OR REPLACE VIEW organization_members_with_profiles AS
SELECT 
  om.id as membership_id,
  om.organization_id,
  om.role as membership_role,
  om.status as membership_status,
  om.permissions,
  om.invited_by,
  om.invited_at,
  om.joined_at,
  om.created_at as membership_created_at,
  om.updated_at as membership_updated_at,
  om.department_id,
  om.removed_at,
  
  p.id as profile_id,
  p.email,
  p.first_name,
  p.last_name,
  p.role as profile_role,
  p.avatar_url,
  p.bio,
  p.location,
  p.website,
  p.job_title,
  p.company_name,
  p.account_type,
  p.status as profile_status,
  p.deleted_at,
  
  d.name as department_name,
  d.description as department_description,
  
  inviter.first_name as inviter_first_name,
  inviter.last_name as inviter_last_name,
  inviter.email as inviter_email
  
FROM organization_members om
LEFT JOIN profiles p ON om.profile_id = p.id
LEFT JOIN departments d ON om.department_id = d.id
LEFT JOIN profiles inviter ON om.invited_by = inviter.id
WHERE p.deleted_at IS NULL;

-- Step 13: Create helper functions
CREATE OR REPLACE FUNCTION get_organization_members(org_id UUID)
RETURNS TABLE (
  membership_id UUID,
  profile_id UUID,
  email VARCHAR,
  first_name VARCHAR,
  last_name VARCHAR,
  full_name TEXT,
  role VARCHAR,
  status VARCHAR,
  department_name VARCHAR,
  joined_at TIMESTAMP WITH TIME ZONE,
  avatar_url TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    om.id,
    p.id,
    p.email,
    p.first_name,
    p.last_name,
    CONCAT(p.first_name, ' ', p.last_name) as full_name,
    om.role,
    om.status,
    d.name,
    om.joined_at,
    p.avatar_url
  FROM organization_members om
  JOIN profiles p ON om.profile_id = p.id
  LEFT JOIN departments d ON om.department_id = d.id
  WHERE om.organization_id = org_id
    AND om.status = 'active'
    AND p.deleted_at IS NULL
  ORDER BY p.first_name, p.last_name;
END;
$$ LANGUAGE plpgsql;

-- Step 14: Set up RLS policies
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view members of their organization" ON organization_members
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM organization_members 
      WHERE profile_id = (
        SELECT id FROM profiles WHERE auth_user_id = auth.uid()
      ) AND status = 'active'
    )
  );

CREATE POLICY "Admins can manage members" ON organization_members
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id FROM organization_members 
      WHERE profile_id = (
        SELECT id FROM profiles WHERE auth_user_id = auth.uid()
      ) AND status = 'active' AND role IN ('corporate_admin', 'system_admin')
    )
  );

-- Step 15: Clean up backup table (optional - comment out if you want to keep it)
-- DROP TABLE organization_members_backup;

-- Step 16: Verify the migration
DO $$
DECLARE
  member_count INTEGER;
  view_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO member_count FROM organization_members;
  SELECT COUNT(*) INTO view_count FROM organization_members_with_profiles;
  
  RAISE NOTICE 'Migration completed successfully!';
  RAISE NOTICE 'Organization members: %', member_count;
  RAISE NOTICE 'Members with profiles view: %', view_count;
END $$;
