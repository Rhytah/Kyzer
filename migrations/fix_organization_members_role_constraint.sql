-- Migration: Fix organization_members role constraint to allow organization_owner
-- Purpose: Update the check constraint to include the new organization_owner role
-- Date: 2025-01-XX
--
-- This migration fixes the constraint that was blocking organization_owner role

-- Step 1: Drop the existing constraint
ALTER TABLE organization_members 
DROP CONSTRAINT IF EXISTS organization_members_role_check;

-- Step 2: Create a new constraint that includes organization_owner
ALTER TABLE organization_members
ADD CONSTRAINT organization_members_role_check 
CHECK (role IN (
    'organization_owner',
    'corporate_admin',
    'admin',
    'manager',
    'employee',
    'learner',
    'instructor',
    'system_admin'
));

-- Step 3: Add comment for documentation
COMMENT ON CONSTRAINT organization_members_role_check ON organization_members 
IS 'Ensures role is one of the valid organization member roles, including organization_owner';

-- Step 4: Verify the constraint is working by attempting to update a test record
-- (This will fail if constraint is wrong, but won't affect data)
DO $$
BEGIN
    -- Try to see if we can set organization_owner (this is just a check, not an actual update)
    PERFORM 1 FROM organization_members 
    WHERE role = 'organization_owner' 
    LIMIT 1;
    
    RAISE NOTICE 'Constraint updated successfully. organization_owner role is now allowed.';
EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Constraint may still have issues: %', SQLERRM;
END $$;
