-- Improved Organization Members Schema
-- This schema optimizes the relationship between organization_members and profiles
-- for easier querying and better data consistency

-- First, let's fix the organization_members table
DROP TABLE IF EXISTS organization_members CASCADE;

CREATE TABLE public.organization_members (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL,
  profile_id UUID NOT NULL, -- Primary reference to profiles table
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
  
  -- Primary key
  CONSTRAINT organization_members_pkey PRIMARY KEY (id),
  
  -- Unique constraint to prevent duplicate memberships
  CONSTRAINT organization_members_organization_profile_key UNIQUE (organization_id, profile_id),
  
  -- Foreign key constraints
  CONSTRAINT organization_members_organization_id_fkey 
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
  CONSTRAINT organization_members_profile_id_fkey 
    FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE,
  CONSTRAINT organization_members_invited_by_fkey 
    FOREIGN KEY (invited_by) REFERENCES profiles(id),
  CONSTRAINT organization_members_department_id_fkey 
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL,
  
  -- Check constraints for valid values
  CONSTRAINT organization_members_status_check CHECK (
    status IN ('active', 'inactive', 'pending', 'suspended')
  ),
  CONSTRAINT organization_members_role_check CHECK (
    role IN ('corporate_admin', 'system_admin', 'instructor', 'learner', 'manager')
  )
);

-- Create indexes for better performance
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

-- Update the profiles table to ensure consistency
ALTER TABLE profiles 
  DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE profiles 
  ADD CONSTRAINT profiles_role_check CHECK (
    role IN ('corporate_admin', 'system_admin', 'instructor', 'learner', 'manager')
  );

-- Create a view for easy member queries with profile data
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
  
  -- Profile information
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
  
  -- Department information
  d.name as department_name,
  d.description as department_description,
  
  -- Inviter information
  inviter.first_name as inviter_first_name,
  inviter.last_name as inviter_last_name,
  inviter.email as inviter_email
  
FROM organization_members om
LEFT JOIN profiles p ON om.profile_id = p.id
LEFT JOIN departments d ON om.department_id = d.id
LEFT JOIN profiles inviter ON om.invited_by = inviter.id
WHERE p.deleted_at IS NULL; -- Exclude deleted profiles

-- Create a function to get organization members with profiles
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

-- Create a function to add a member to an organization
CREATE OR REPLACE FUNCTION add_organization_member(
  org_id UUID,
  profile_id UUID,
  member_role VARCHAR DEFAULT 'learner',
  dept_id UUID DEFAULT NULL,
  inviter_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  membership_id UUID;
BEGIN
  -- Check if profile exists and is not deleted
  IF NOT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = profile_id AND deleted_at IS NULL
  ) THEN
    RAISE EXCEPTION 'Profile not found or deleted';
  END IF;
  
  -- Check if organization exists
  IF NOT EXISTS (
    SELECT 1 FROM organizations WHERE id = org_id
  ) THEN
    RAISE EXCEPTION 'Organization not found';
  END IF;
  
  -- Insert membership
  INSERT INTO organization_members (
    organization_id, 
    profile_id, 
    role, 
    department_id, 
    invited_by
  ) VALUES (
    org_id, 
    profile_id, 
    member_role, 
    dept_id, 
    inviter_id
  ) RETURNING id INTO membership_id;
  
  RETURN membership_id;
END;
$$ LANGUAGE plpgsql;

-- Create RLS policies for security
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;

-- Policy for viewing members
CREATE POLICY "Users can view members of their organization" ON organization_members
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM organization_members 
      WHERE profile_id = (
        SELECT id FROM profiles WHERE auth_user_id = auth.uid()
      ) AND status = 'active'
    )
  );

-- Policy for managing members (admin only)
CREATE POLICY "Admins can manage members" ON organization_members
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id FROM organization_members 
      WHERE profile_id = (
        SELECT id FROM profiles WHERE auth_user_id = auth.uid()
      ) AND status = 'active' AND role IN ('corporate_admin', 'system_admin')
    )
  );

-- Grant necessary permissions
GRANT SELECT ON organization_members_with_profiles TO authenticated;
GRANT EXECUTE ON FUNCTION get_organization_members(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION add_organization_member(UUID, UUID, VARCHAR, UUID, UUID) TO authenticated;
