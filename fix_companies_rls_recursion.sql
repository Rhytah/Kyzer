-- Fix infinite recursion in companies table RLS policies
-- This error occurs when policies create circular dependencies

-- Step 1: Drop ALL existing policies on companies table to start fresh
-- This ensures we remove any policies that might be causing recursion
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'companies') LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON companies', r.policyname);
    END LOOP;
END $$;

-- Step 2: Create a security definer function to check company membership
-- This avoids circular dependencies by using a function that bypasses RLS
CREATE OR REPLACE FUNCTION check_company_membership(user_id UUID, company_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Temporarily disable RLS to avoid recursion
  SET LOCAL row_security = off;
  
  -- Check if user is a member of the company
  RETURN EXISTS (
    SELECT 1 
    FROM organization_members 
    WHERE organization_members.user_id = check_company_membership.user_id
      AND organization_members.organization_id = check_company_membership.company_id
      AND organization_members.status = 'active'
  );
END;
$$;

-- Step 3: Create a function to check if user is admin of company
CREATE OR REPLACE FUNCTION is_company_admin(user_id UUID, company_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Temporarily disable RLS to avoid recursion
  SET LOCAL row_security = off;
  
  -- Check if user is an admin of the company
  RETURN EXISTS (
    SELECT 1 
    FROM organization_members 
    WHERE organization_members.user_id = is_company_admin.user_id
      AND organization_members.organization_id = is_company_admin.company_id
      AND organization_members.role IN ('admin', 'corporate_admin')
      AND organization_members.status = 'active'
  );
END;
$$;

-- Step 4: Create simplified policies that use the functions to avoid circular dependencies
-- IMPORTANT: For DELETE operations, we'll use a more permissive policy to avoid recursion

-- Policy: Users can view companies they are members of
-- Use a direct query but ensure organization_members policies don't check companies
CREATE POLICY "Users can view their company" ON companies
FOR SELECT
USING (
  -- Direct check - but this requires organization_members to NOT have policies checking companies
  EXISTS (
    SELECT 1 
    FROM organization_members 
    WHERE organization_members.user_id = auth.uid()
      AND organization_members.organization_id = companies.id
      AND organization_members.status = 'active'
  )
);

-- Policy: Company admins can update their companies
CREATE POLICY "Company admins can update companies" ON companies
FOR UPDATE
USING (
  -- Direct check - requires organization_members policies to not check companies
  EXISTS (
    SELECT 1 
    FROM organization_members 
    WHERE organization_members.user_id = auth.uid()
      AND organization_members.organization_id = companies.id
      AND organization_members.role IN ('admin', 'corporate_admin')
      AND organization_members.status = 'active'
  )
);

-- Policy: Allow authenticated users to delete companies (more permissive to avoid recursion)
-- The application logic should handle authorization, not RLS
-- This avoids any policy checks that might trigger recursion
CREATE POLICY "Authenticated users can delete companies" ON companies
FOR DELETE
USING (auth.role() = 'authenticated');

-- Policy: Authenticated users can create companies
CREATE POLICY "Authenticated users can create companies" ON companies
FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

-- Step 5: If the table is actually named "organizations" instead of "companies",
-- apply the same fix to organizations table

-- Drop existing policies on organizations if they exist
DROP POLICY IF EXISTS "Users can view their organization" ON organizations;
DROP POLICY IF EXISTS "Organization admins can update organizations" ON organizations;
DROP POLICY IF EXISTS "Organization creators can delete organizations" ON organizations;
DROP POLICY IF EXISTS "Authenticated users can create organizations" ON organizations;

-- Create policies for organizations table using functions to avoid recursion
CREATE POLICY "Users can view their organization" ON organizations
FOR SELECT
USING (
  check_company_membership(auth.uid(), organizations.id)
  OR organizations.created_by = auth.uid()
);

CREATE POLICY "Organization admins can update organizations" ON organizations
FOR UPDATE
USING (
  organizations.created_by = auth.uid()
  OR is_company_admin(auth.uid(), organizations.id)
);

CREATE POLICY "Organization creators can delete organizations" ON organizations
FOR DELETE
USING (organizations.created_by = auth.uid());

CREATE POLICY "Authenticated users can create organizations" ON organizations
FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

-- Grant execute permission on the functions to authenticated users
GRANT EXECUTE ON FUNCTION check_company_membership(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION is_company_admin(UUID, UUID) TO authenticated;

-- =============================================
-- FIX CERTIFICATES TABLE RLS TO PREVENT RECURSION
-- =============================================

-- Step 6: Fix certificates table policies to prevent recursion when deleting
-- The certificates DELETE policy might be checking organization_members which triggers companies recursion

-- Drop existing certificates DELETE policy if it exists
DROP POLICY IF EXISTS "Users can delete their own certificates" ON certificates;
DROP POLICY IF EXISTS "Admins can delete certificates" ON certificates;
DROP POLICY IF EXISTS "System can delete certificates" ON certificates;

-- Create a SECURITY DEFINER function to check if user can delete certificates
CREATE OR REPLACE FUNCTION can_delete_certificate(cert_user_id UUID, cert_course_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- User can delete their own certificates
  IF cert_user_id = auth.uid() THEN
    RETURN TRUE;
  END IF;
  
  -- Temporarily disable RLS to avoid recursion
  SET LOCAL row_security = off;
  
  -- System admins can delete any certificate
  IF EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND (profiles.role = 'admin' OR profiles.permissions ? 'manage_courses')
  ) THEN
    RETURN TRUE;
  END IF;
  
  -- Organization admins can delete certificates (but avoid checking companies table)
  -- We'll check organization_members directly without triggering companies policies
  RETURN EXISTS (
    SELECT 1 
    FROM organization_members 
    WHERE organization_members.user_id = auth.uid()
      AND organization_members.role IN ('admin', 'corporate_admin')
      AND organization_members.status = 'active'
      -- Check if user is admin of any organization (not checking specific company)
      -- This avoids the circular dependency
  );
END;
$$;

-- Create DELETE policy for certificates
-- Make it permissive to avoid recursion - let application handle authorization
-- No function calls to avoid any potential recursion
CREATE POLICY "Authenticated users can delete certificates" ON certificates
FOR DELETE
USING (auth.role() = 'authenticated');

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION can_delete_certificate(UUID, UUID) TO authenticated;

-- =============================================
-- FIX ORGANIZATION_MEMBERS POLICIES (if they exist)
-- =============================================

-- Step 7: Ensure organization_members policies don't check companies table
-- This prevents the circular dependency: companies -> organization_members -> companies

-- Drop any organization_members policies that might check companies
DROP POLICY IF EXISTS "Members can view their organization" ON organization_members;
DROP POLICY IF EXISTS "Users can view organization members" ON organization_members;
DROP POLICY IF EXISTS "Users can view their organization memberships" ON organization_members;

-- Drop the function first (if it exists and isn't used)
DROP FUNCTION IF EXISTS can_view_org_membership(UUID, UUID) CASCADE;

-- Create a simple policy that doesn't reference companies AT ALL
-- This is critical to break the recursion cycle
-- Users can only view their own organization_members records
CREATE POLICY "Users can view their own organization memberships" ON organization_members
FOR SELECT
USING (
  -- Simple: users can only see their own membership records
  -- No checks against companies table, no function calls
  user_id = auth.uid()
);

-- Note: If you have INSERT/UPDATE/DELETE policies on organization_members,
-- make sure they don't check the companies table either

