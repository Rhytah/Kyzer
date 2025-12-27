-- Quick Check: See what roles currently exist in organization_members
-- Run this first to understand what data you have

-- Check all distinct roles
SELECT 
    role,
    COUNT(*) as count,
    CASE 
        WHEN role IN ('owner', 'corporate_admin', 'admin', 'manager', 'employee', 'learner', 'instructor', 'system_admin') 
        THEN '✓ Valid'
        ELSE '⚠ Invalid'
    END as status
FROM organization_members
WHERE role IS NOT NULL
GROUP BY role
ORDER BY count DESC;

-- Check for NULL roles
SELECT 
    'NULL' as role,
    COUNT(*) as count,
    '⚠ Invalid' as status
FROM organization_members
WHERE role IS NULL;

-- Check organization creators specifically
SELECT 
    om.role as creator_role,
    COUNT(*) as count,
    CASE 
        WHEN om.role = 'owner' THEN '✓ Correct'
        WHEN om.role IN ('corporate_admin', 'admin', 'manager', 'employee', 'learner', 'instructor', 'system_admin') 
        THEN '⚠ Needs Update'
        ELSE '✗ Invalid'
    END as status
FROM organizations o
INNER JOIN organization_members om 
    ON om.user_id = o.created_by 
    AND om.organization_id = o.id
WHERE o.created_by IS NOT NULL
GROUP BY om.role
ORDER BY count DESC;
