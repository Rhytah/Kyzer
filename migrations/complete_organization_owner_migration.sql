-- Complete Migration: Fix Constraint + Update All Organization Creators
-- Purpose: Complete solution to update organization creators to owner role
-- Date: 2025-01-XX
--
-- This script does both:
-- 1. Fixes the role constraint to allow owner
-- 2. Updates all creators to have owner role

-- ============================================
-- STEP 1: Fix the role constraint
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
-- STEP 2: Update existing memberships
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
-- STEP 3: Create missing memberships
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
-- STEP 4: Verification
-- ============================================

-- Show summary
DO $$
DECLARE
    total_orgs INTEGER;
    correct_count INTEGER;
    needs_update INTEGER;
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
    
    RAISE NOTICE '=== Migration Complete ===';
    RAISE NOTICE 'Total organizations with creators: %', total_orgs;
    RAISE NOTICE 'Creators with owner role: %', correct_count;
    RAISE NOTICE 'Still needs update: %', needs_update;
    RAISE NOTICE 'Migration success: %', (needs_update = 0);
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
