-- User Management Database Schema
-- Run this script to create the required tables for the user management system

-- Create departments table FIRST (needed for foreign key reference)
CREATE TABLE IF NOT EXISTS departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  manager_id UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create organization_invitations table AFTER departments
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

-- Add missing columns to organization_members table
ALTER TABLE organization_members 
ADD COLUMN IF NOT EXISTS department_id UUID REFERENCES departments(id),
ADD COLUMN IF NOT EXISTS invited_by UUID REFERENCES profiles(id),
ADD COLUMN IF NOT EXISTS invited_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS joined_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS removed_at TIMESTAMP WITH TIME ZONE;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_organization_invitations_organization_id ON organization_invitations(organization_id);
CREATE INDEX IF NOT EXISTS idx_organization_invitations_email ON organization_invitations(email);
CREATE INDEX IF NOT EXISTS idx_organization_invitations_status ON organization_invitations(status);
CREATE INDEX IF NOT EXISTS idx_departments_organization_id ON departments(organization_id);
CREATE INDEX IF NOT EXISTS idx_organization_members_department_id ON organization_members(department_id);

-- Add RLS policies for security
ALTER TABLE organization_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;

-- RLS policies for organization_invitations
CREATE POLICY "Users can view invitations for their organization" ON organization_invitations
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM organization_members 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY "Users can create invitations for their organization" ON organization_invitations
  FOR INSERT WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM organization_members 
      WHERE user_id = auth.uid() AND status = 'active' AND role IN ('corporate_admin', 'system_admin')
    )
  );

CREATE POLICY "Users can update invitations for their organization" ON organization_invitations
  FOR UPDATE USING (
    organization_id IN (
      SELECT organization_id FROM organization_members 
      WHERE user_id = auth.uid() AND status = 'active' AND role IN ('corporate_admin', 'system_admin')
    )
  );

CREATE POLICY "Users can delete invitations for their organization" ON organization_invitations
  FOR DELETE USING (
    organization_id IN (
      SELECT organization_id FROM organization_members 
      WHERE user_id = auth.uid() AND status = 'active' AND role IN ('corporate_admin', 'system_admin')
    )
  );

-- RLS policies for departments
CREATE POLICY "Users can view departments for their organization" ON departments
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM organization_members 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY "Users can create departments for their organization" ON departments
  FOR INSERT WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM organization_members 
      WHERE user_id = auth.uid() AND status = 'active' AND role IN ('corporate_admin', 'system_admin')
    )
  );

CREATE POLICY "Users can update departments for their organization" ON departments
  FOR UPDATE USING (
    organization_id IN (
      SELECT organization_id FROM organization_members 
      WHERE user_id = auth.uid() AND status = 'active' AND role IN ('corporate_admin', 'system_admin')
    )
  );

CREATE POLICY "Users can delete departments for their organization" ON departments
  FOR DELETE USING (
    organization_id IN (
      SELECT organization_id FROM organization_members 
      WHERE user_id = auth.uid() AND status = 'active' AND role IN ('corporate_admin', 'system_admin')
    )
  );
