-- Migration: Update Organization Creators to Organization Owner Role
-- Purpose: ETL to update all existing organization creators with the organization_owner role
-- Date: 2025-01-XX
-- 
-- This migration identifies all organizations and updates the role of their creators
-- in the organization_members table to 'organization_owner'

-- Step 1: Create a temporary function to safely update creator roles
-- This ensures we only update records that need updating and handle edge cases

DO $$
DECLARE
    org_record RECORD;
    member_record RECORD;
    updated_count INTEGER := 0;
    created_count INTEGER := 0;
    skipped_count INTEGER := 0;
    error_count INTEGER := 0;
BEGIN
    -- Loop through all organizations that have a creator
    FOR org_record IN 
        SELECT 
            id as org_id,
            created_by,
            name as org_name
        FROM organizations
        WHERE created_by IS NOT NULL
    LOOP
        BEGIN
            -- Check if the creator has a membership record for this organization
            SELECT id, role, status
            INTO member_record
            FROM organization_members
            WHERE user_id = org_record.created_by
              AND organization_id = org_record.org_id
            LIMIT 1;

            IF FOUND THEN
                -- Membership exists - update if role is not already organization_owner
                IF member_record.role != 'organization_owner' THEN
                    UPDATE organization_members
                    SET 
                        role = 'organization_owner',
                        updated_at = NOW()
                    WHERE id = member_record.id;
                    
                    updated_count := updated_count + 1;
                    
                    RAISE NOTICE 'Updated organization "%" (ID: %): Creator % role changed from % to organization_owner',
                        org_record.org_name, org_record.org_id, org_record.created_by, member_record.role;
                ELSE
                    skipped_count := skipped_count + 1;
                    RAISE NOTICE 'Skipped organization "%" (ID: %): Creator % already has organization_owner role',
                        org_record.org_name, org_record.org_id, org_record.created_by;
                END IF;
            ELSE
                -- Membership doesn't exist - create it
                INSERT INTO organization_members (
                    user_id,
                    organization_id,
                    role,
                    status,
                    joined_at,
                    created_at,
                    updated_at
                )
                VALUES (
                    org_record.created_by,
                    org_record.org_id,
                    'organization_owner',
                    'active',
                    COALESCE(
                        (SELECT created_at FROM organizations WHERE id = org_record.org_id),
                        NOW()
                    ),
                    NOW(),
                    NOW()
                );
                
                created_count := created_count + 1;
                
                RAISE NOTICE 'Created membership for organization "%" (ID: %): Creator % added as organization_owner',
                    org_record.org_name, org_record.org_id, org_record.created_by;
            END IF;
            
        EXCEPTION WHEN OTHERS THEN
            error_count := error_count + 1;
            RAISE WARNING 'Error processing organization "%" (ID: %): %',
                org_record.org_name, org_record.org_id, SQLERRM;
        END;
    END LOOP;

    -- Summary
    RAISE NOTICE '=== Migration Summary ===';
    RAISE NOTICE 'Organizations processed: %', (SELECT COUNT(*) FROM organizations WHERE created_by IS NOT NULL);
    RAISE NOTICE 'Memberships updated: %', updated_count;
    RAISE NOTICE 'Memberships created: %', created_count;
    RAISE NOTICE 'Records skipped (already correct): %', skipped_count;
    RAISE NOTICE 'Errors encountered: %', error_count;
END $$;

-- Step 2: Verify the migration results
-- This query shows all organizations and their creator's current role

CREATE OR REPLACE VIEW organization_creator_roles AS
SELECT 
    o.id as organization_id,
    o.name as organization_name,
    o.created_by as creator_user_id,
    om.role as creator_role,
    om.status as creator_status,
    om.joined_at as creator_joined_at,
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
ORDER BY o.created_at DESC;

-- Step 3: Create a function to check migration status
CREATE OR REPLACE FUNCTION check_organization_owner_migration()
RETURNS TABLE(
    total_organizations BIGINT,
    organizations_with_creators BIGINT,
    creators_with_owner_role BIGINT,
    creators_with_other_role BIGINT,
    creators_missing_membership BIGINT,
    migration_complete BOOLEAN
) 
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        (SELECT COUNT(*) FROM organizations) as total_organizations,
        (SELECT COUNT(*) FROM organizations WHERE created_by IS NOT NULL) as organizations_with_creators,
        (
            SELECT COUNT(*)
            FROM organizations o
            INNER JOIN organization_members om 
                ON om.user_id = o.created_by 
                AND om.organization_id = o.id
            WHERE o.created_by IS NOT NULL
              AND om.role = 'organization_owner'
        ) as creators_with_owner_role,
        (
            SELECT COUNT(*)
            FROM organizations o
            INNER JOIN organization_members om 
                ON om.user_id = o.created_by 
                AND om.organization_id = o.id
            WHERE o.created_by IS NOT NULL
              AND om.role != 'organization_owner'
        ) as creators_with_other_role,
        (
            SELECT COUNT(*)
            FROM organizations o
            LEFT JOIN organization_members om 
                ON om.user_id = o.created_by 
                AND om.organization_id = o.id
            WHERE o.created_by IS NOT NULL
              AND om.id IS NULL
        ) as creators_missing_membership,
        (
            SELECT COUNT(*) = 0
            FROM organizations o
            LEFT JOIN organization_members om 
                ON om.user_id = o.created_by 
                AND om.organization_id = o.id
            WHERE o.created_by IS NOT NULL
              AND (om.id IS NULL OR om.role != 'organization_owner')
        ) as migration_complete;
END;
$$;

-- Step 4: Add comments for documentation
COMMENT ON VIEW organization_creator_roles IS 'View showing all organizations and their creator roles. Use to verify migration results.';
COMMENT ON FUNCTION check_organization_owner_migration() IS 'Function to check the status of the organization owner migration. Returns counts and completion status.';

-- Step 5: Grant necessary permissions
GRANT SELECT ON organization_creator_roles TO authenticated;
GRANT EXECUTE ON FUNCTION check_organization_owner_migration() TO authenticated;
