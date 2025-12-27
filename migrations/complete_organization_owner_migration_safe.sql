-- Complete Migration: Fix Constraint + Update All Organization Creators (Safe Version)
-- Purpose: Complete solution to update organization creators to owner role
-- Date: 2025-01-XX
--
-- This script safely handles existing data before applying constraints

-- ============================================
-- STEP 0: Check existing roles in the table
-- ============================================

-- First, let's see what roles currently exist
DO $$
DECLARE
    role_list TEXT;
BEGIN
    SELECT string_agg(DISTINCT role, ', ' ORDER BY role) INTO role_list
    FROM organization_members
    WHERE role IS NOT NULL;
    
    RAISE NOTICE 'Existing roles in organization_members: %', COALESCE(role_list, 'None');
END $$;

-- ============================================
-- STEP 1: Update any invalid roles first
-- ============================================

-- Update any roles that might not be in our allowed list
-- Map common variations to valid roles
UPDATE organization_members
SET role = CASE
    WHEN role IN ('organization_owner', 'org_owner') THEN 'owner'
    WHEN role IN ('corporate_admin', 'corp_admin', 'company_admin') THEN 'corporate_admin'
    WHEN role IN ('system_admin', 'sys_admin', 'super_admin') THEN 'system_admin'
    WHEN role IN ('employee', 'staff', 'member') THEN 'employee'
    WHEN role IN ('learner', 'student', 'trainee') THEN 'learner'
    WHEN role IN ('instructor', 'teacher', 'trainer') THEN 'instructor'
    WHEN role IN ('manager', 'supervisor', 'lead') THEN 'manager'
    WHEN role IN ('admin', 'administrator') THEN 'admin'
    ELSE 'learner' -- Default fallback for unknown roles
END
WHERE role NOT IN (
    'owner',
    'corporate_admin',
    'admin',
    'manager',
    'employee',
    'learner',
    'instructor',
    'system_admin'
);

-- ============================================
-- STEP 2: Fix the role constraint
-- ============================================

-- Drop the existing constraint
ALTER TABLE organization_members 
DROP CONSTRAINT IF EXISTS organization_members_role_check;

-- Create a new constraint that includes owner
ALTER TABLE organization_members
ADD CONSTRAINT organization_members_role_check 
CHECK (role IN (
    'owner',
    'corporate_admin',
    'admin',
    'manager',
    'employee',
    'learner',
    'instructor',
    'system_admin'
));

-- ============================================
-- STEP 3: Update organization creators to owner role
-- ============================================

UPDATE organization_members om
SET 
    role = 'owner',
    updated_at = NOW()
FROM organizations o
WHERE om.user_id = o.created_by
  AND om.organization_id = o.id
  AND o.created_by IS NOT NULL
  AND om.role != 'owner'
  AND om.role IS NOT NULL;

-- ============================================
-- STEP 4: Create missing memberships
-- ============================================

INSERT INTO organization_members (
    user_id,
    organization_id,
    role,
    status,
    joined_at,
    created_at,
    updated_at
)
SELECT 
    o.created_by,
    o.id,
    'owner',
    'active',
    COALESCE(o.created_at, NOW()),
    NOW(),
    NOW()
FROM organizations o
WHERE o.created_by IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 
      FROM organization_members om 
      WHERE om.user_id = o.created_by 
        AND om.organization_id = o.id
  )
ON CONFLICT DO NOTHING;

-- ============================================
-- STEP 5: Verification
-- ============================================

-- Show summary
DO $$
DECLARE
    total_orgs INTEGER;
    correct_count INTEGER;
    needs_update INTEGER;
    invalid_roles INTEGER;
BEGIN
    -- Count organizations with creators
    SELECT COUNT(*) INTO total_orgs
    FROM organizations
    WHERE created_by IS NOT NULL;
    
    -- Count creators with owner role
    SELECT COUNT(*) INTO correct_count
    FROM organizations o
    INNER JOIN organization_members om 
        ON om.user_id = o.created_by 
        AND om.organization_id = o.id
    WHERE o.created_by IS NOT NULL
      AND om.role = 'owner';
    
    -- Count what still needs update
    SELECT COUNT(*) INTO needs_update
    FROM organizations o
    LEFT JOIN organization_members om 
        ON om.user_id = o.created_by 
        AND om.organization_id = o.id
    WHERE o.created_by IS NOT NULL
      AND (om.id IS NULL OR om.role != 'owner');
    
    -- Check for any invalid roles that might still exist
    SELECT COUNT(*) INTO invalid_roles
    FROM organization_members
    WHERE role NOT IN (
        'owner',
        'corporate_admin',
        'admin',
        'manager',
        'employee',
        'learner',
        'instructor',
        'system_admin'
    );
    
    RAISE NOTICE '=== Migration Complete ===';
    RAISE NOTICE 'Total organizations with creators: %', total_orgs;
    RAISE NOTICE 'Creators with owner role: %', correct_count;
    RAISE NOTICE 'Still needs update: %', needs_update;
    RAISE NOTICE 'Invalid roles found: %', invalid_roles;
    RAISE NOTICE 'Migration success: %', (needs_update = 0 AND invalid_roles = 0);
END $$;

-- Show any remaining issues
SELECT 
    o.id as organization_id,
    o.name as organization_name,
    o.created_by as creator_user_id,
    om.role as creator_role,
    om.status as creator_status,
    CASE 
        WHEN om.role = 'owner' THEN '✓ Correct'
        WHEN om.role IS NULL THEN '✗ Missing Membership'
        ELSE '⚠ Needs Update'
    END as status_check
FROM organizations o
LEFT JOIN organization_members om 
    ON om.user_id = o.created_by 
    AND om.organization_id = o.id
WHERE o.created_by IS NOT NULL
  AND (om.id IS NULL OR om.role != 'owner')
ORDER BY o.created_at DESC;

-- Show any invalid roles that might still exist
SELECT DISTINCT role, COUNT(*) as count
FROM organization_members
WHERE role NOT IN (
    'owner',
    'corporate_admin',
    'admin',
    'manager',
    'employee',
    'learner',
    'instructor',
    'system_admin'
)
GROUP BY role
ORDER BY count DESC;
