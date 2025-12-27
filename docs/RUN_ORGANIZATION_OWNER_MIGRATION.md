# Organization Owner Role Migration Guide

## Overview
This migration updates all existing organization creators in the database to have the `organization_owner` role. This is necessary because the organization owner role was recently added, and existing organizations may have their creators with older roles (like `corporate_admin` or `admin`).

## What This Migration Does

1. **Identifies all organizations** with a `created_by` field
2. **Updates existing memberships**: Changes the role of creators from their current role to `organization_owner`
3. **Creates missing memberships**: If a creator doesn't have a membership record, it creates one with the `organization_owner` role
4. **Skips already correct records**: Organizations where the creator already has the `organization_owner` role are skipped
5. **Provides verification tools**: Creates views and functions to verify the migration results

## Running the Migration

### Option 1: Using Supabase Dashboard (Recommended)

1. Open your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Open the file `migrations/update_organization_creators_to_owner.sql`
4. Copy the entire contents
5. Paste into the SQL Editor
6. Click **Run** to execute

### Option 2: Using Supabase CLI

```bash
# Make sure you're in the project root directory
cd /path/to/Kyzer

# Run the migration
supabase db push migrations/update_organization_creators_to_owner.sql
```

### Option 3: Using psql

```bash
# Connect to your Supabase database
psql "postgresql://postgres:[YOUR-PASSWORD]@[YOUR-PROJECT-REF].supabase.co:5432/postgres"

# Run the migration
\i migrations/update_organization_creators_to_owner.sql
```

## Verifying the Migration

### Method 1: Check Migration Status Function

After running the migration, execute this query in the SQL Editor:

```sql
SELECT * FROM check_organization_owner_migration();
```

This will return:
- `total_organizations`: Total number of organizations
- `organizations_with_creators`: Organizations that have a creator
- `creators_with_owner_role`: Creators that now have the owner role
- `creators_with_other_role`: Creators that still have other roles (should be 0)
- `creators_missing_membership`: Creators without membership records (should be 0)
- `migration_complete`: Whether the migration is complete (should be `true`)

### Method 2: View Organization Creator Roles

```sql
SELECT * FROM organization_creator_roles;
```

This view shows:
- Organization ID and name
- Creator user ID
- Current creator role
- Status check (✓ Correct, ✗ Missing Membership, or ⚠ Needs Update)

### Method 3: Manual Verification Query

```sql
-- Check for any organizations where creator doesn't have owner role
SELECT 
    o.id,
    o.name,
    o.created_by,
    om.role as current_role,
    CASE 
        WHEN om.role = 'organization_owner' THEN 'OK'
        WHEN om.id IS NULL THEN 'MISSING MEMBERSHIP'
        ELSE 'NEEDS UPDATE'
    END as status
FROM organizations o
LEFT JOIN organization_members om 
    ON om.user_id = o.created_by 
    AND om.organization_id = o.id
WHERE o.created_by IS NOT NULL
  AND (om.id IS NULL OR om.role != 'organization_owner')
ORDER BY o.created_at DESC;
```

This should return 0 rows if the migration was successful.

## Expected Output

When you run the migration, you should see output like:

```
NOTICE: Updated organization "Acme Corp" (ID: abc-123): Creator xyz-789 role changed from corporate_admin to organization_owner
NOTICE: Created membership for organization "Tech Inc" (ID: def-456): Creator uvw-012 added as organization_owner
NOTICE: Skipped organization "Startup Co" (ID: ghi-789): Creator rst-345 already has organization_owner role
NOTICE: === Migration Summary ===
NOTICE: Organizations processed: 15
NOTICE: Memberships updated: 10
NOTICE: Memberships created: 2
NOTICE: Records skipped (already correct): 3
NOTICE: Errors encountered: 0
```

## Troubleshooting

### Issue: Migration shows errors

If you see errors in the migration output:

1. **Check for invalid user IDs**: Some organizations might have `created_by` pointing to non-existent users
   ```sql
   SELECT o.id, o.name, o.created_by
   FROM organizations o
   LEFT JOIN auth.users u ON u.id = o.created_by
   WHERE o.created_by IS NOT NULL AND u.id IS NULL;
   ```

2. **Check for duplicate memberships**: If there are multiple membership records for the same user-organization pair
   ```sql
   SELECT user_id, organization_id, COUNT(*) as count
   FROM organization_members
   GROUP BY user_id, organization_id
   HAVING COUNT(*) > 1;
   ```

### Issue: Some creators still don't have owner role

If the verification shows some creators still don't have the owner role:

1. Check if those organizations have a `created_by` field set
2. Verify the user IDs are valid
3. Check for any RLS (Row Level Security) policies that might be blocking updates

### Issue: Migration takes too long

If you have a large number of organizations, the migration might take some time. You can:

1. Run it during off-peak hours
2. Monitor the progress through the NOTICE messages
3. Consider running it in batches if needed

## Rollback (If Needed)

If you need to rollback this migration, you can run:

```sql
-- Revert creators back to corporate_admin role (or their previous role)
-- Note: This is a destructive operation and should only be done if necessary

UPDATE organization_members om
SET role = 'corporate_admin'
FROM organizations o
WHERE om.user_id = o.created_by
  AND om.organization_id = o.id
  AND om.role = 'organization_owner'
  AND o.created_by IS NOT NULL;

-- Drop the verification objects
DROP VIEW IF EXISTS organization_creator_roles;
DROP FUNCTION IF EXISTS check_organization_owner_migration();
```

## Post-Migration Checklist

- [ ] Migration completed without errors
- [ ] Verification function shows `migration_complete = true`
- [ ] All organizations have creators with `organization_owner` role
- [ ] No missing memberships for creators
- [ ] Application still works correctly
- [ ] Test creating a new organization to ensure it gets owner role correctly

## Notes

- This migration is **idempotent**: You can run it multiple times safely
- It only updates records that need updating
- It creates missing membership records if needed
- It preserves existing data (status, joined_at, etc.)
- The migration uses transactions, so if it fails partway through, you can safely re-run it

## Support

If you encounter any issues, check:
1. Supabase logs for detailed error messages
2. The verification queries above
3. Database constraints and RLS policies
