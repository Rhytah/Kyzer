-- QUICK FIX: Update the 4 organizations shown in the query results
-- Run this directly in Supabase SQL Editor to fix the immediate issue

-- Update the specific organizations that need fixing
UPDATE organization_members
SET 
    role = 'organization_owner',
    updated_at = NOW()
WHERE (user_id, organization_id) IN (
    -- Rainforest Alliance
    ('5780fe13-f411-411f-b128-7db10c600e86', '07d4b084-d57e-4c37-b737-c5ed87fa724e'),
    -- Myself
    ('4ab51640-01d3-4a1c-951a-ec9e96ee2a1e', '2f5235ac-30e1-457a-86d6-35f2243bd053'),
    -- Infosec Village
    ('cbadbd63-5077-4627-bdeb-d95c2c0b57e6', '89986937-f295-4851-9ea2-741196e94a25'),
    -- Ace in the hole
    ('76f67097-c0b9-45cc-82c1-a29e68e25e24', '00381b25-82f6-4a63-972d-25b1a1a36176')
)
AND role != 'organization_owner';

-- Verify the fix
SELECT 
    o.id as organization_id,
    o.name as organization_name,
    o.created_by as creator_user_id,
    om.role as creator_role,
    om.status as creator_status,
    CASE 
        WHEN om.role = 'organization_owner' THEN '✓ Fixed'
        WHEN om.role IS NULL THEN '✗ Missing Membership'
        ELSE '⚠ Still Needs Update'
    END as status_check
FROM organizations o
INNER JOIN organization_members om 
    ON om.user_id = o.created_by 
    AND om.organization_id = o.id
WHERE o.id IN (
    '07d4b084-d57e-4c37-b737-c5ed87fa724e',
    '2f5235ac-30e1-457a-86d6-35f2243bd053',
    '89986937-f295-4851-9ea2-741196e94a25',
    '00381b25-82f6-4a63-972d-25b1a1a36176'
)
ORDER BY o.name;
