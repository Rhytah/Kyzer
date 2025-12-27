-- Migration v2: Update Organization Creators to Organization Owner Role (Improved)
-- Purpose: ETL to update all existing organization creators with the organization_owner role
-- Date: 2025-01-XX
-- 
-- This is an improved version that handles edge cases better

-- Step 1: Update existing memberships where creator role is not organization_owner
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

-- Step 2: Create missing memberships for creators who don't have one
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
    'organization_owner',
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
  );

-- Step 3: Show summary of what was updated
DO $$
DECLARE
    updated_count INTEGER;
    created_count INTEGER;
    total_orgs INTEGER;
    correct_count INTEGER;
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
      AND om.role = 'organization_owner';
    
    -- Count what was updated (this is approximate since we already ran UPDATE)
    SELECT COUNT(*) INTO updated_count
    FROM organizations o
    INNER JOIN organization_members om 
        ON om.user_id = o.created_by 
        AND om.organization_id = o.id
    WHERE o.created_by IS NOT NULL
      AND om.role = 'organization_owner';
    
    RAISE NOTICE '=== Migration Summary ===';
    RAISE NOTICE 'Total organizations with creators: %', total_orgs;
    RAISE NOTICE 'Creators with organization_owner role: %', correct_count;
    RAISE NOTICE 'Migration complete: %', (correct_count = total_orgs);
END $$;

-- Step 4: Verify results - this query should return 0 rows if migration is successful
SELECT 
    o.id as organization_id,
    o.name as organization_name,
    o.created_by as creator_user_id,
    om.role as creator_role,
    om.status as creator_status,
    CASE 
        WHEN om.role = 'organization_owner' THEN '✓ Correct'
        WHEN om.role IS NULL THEN '✗ Missing Membership'
        ELSE '⚠ Needs Update'
    END as status_check
FROM organizations o
LEFT JOIN organization_members om 
    ON om.user_id = o.created_by 
    AND om.organization_id = o.id
WHERE o.created_by IS NOT NULL
  AND (om.id IS NULL OR om.role != 'organization_owner')
ORDER BY o.created_at DESC;
