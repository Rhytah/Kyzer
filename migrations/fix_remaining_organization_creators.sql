-- Quick Fix: Update Remaining Organization Creators to Owner Role
-- Purpose: Fix any organizations where creators still have 'admin' or other roles instead of 'organization_owner'
-- Date: 2025-01-XX
-- 
-- This is a targeted fix for organizations that may have been missed or created before the migration

-- Update all organization creators to have organization_owner role
UPDATE organization_members om
SET 
    role = 'organization_owner',
    updated_at = NOW()
FROM organizations o
WHERE om.user_id = o.created_by
  AND om.organization_id = o.id
  AND o.created_by IS NOT NULL
  AND om.role != 'organization_owner'
  AND om.role IS NOT NULL;

-- Verify the update
SELECT 
    o.id as organization_id,
    o.name as organization_name,
    o.created_by as creator_user_id,
    om.role as creator_role,
    om.status as creator_status,
    CASE 
        WHEN om.role = 'organization_owner' THEN '✓ Updated'
        WHEN om.role IS NULL THEN '✗ Missing Membership'
        ELSE '⚠ Still Needs Update'
    END as status_check
FROM organizations o
LEFT JOIN organization_members om 
    ON om.user_id = o.created_by 
    AND om.organization_id = o.id
WHERE o.created_by IS NOT NULL
  AND (om.id IS NULL OR om.role != 'organization_owner')
ORDER BY o.created_at DESC;
