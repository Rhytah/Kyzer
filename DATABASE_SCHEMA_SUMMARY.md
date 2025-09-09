# Database Schema Summary

## Updated Table Structure

### Organizations Table
Based on the actual database schema provided:

```sql
CREATE TABLE organizations (
  id UUID PRIMARY KEY,
  name VARCHAR NOT NULL,
  domain VARCHAR NOT NULL,
  max_employees INTEGER,
  subscription_status VARCHAR,
  subscription_end_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE,
  slug TEXT,
  email TEXT,
  created_by UUID
);
```

### Key Changes Made

1. **Table Names Updated:**
   - `companies` → `organizations`
   - `company_members` → `organization_members`
   - `company_invitations` → `organization_invitations`

2. **Column Mappings:**
   - `industry` → removed (not in actual schema)
   - `size_category` → `max_employees` (integer instead of string)
   - `subscription_expires_at` → `subscription_end_date`
   - `logo_url` → removed (not in actual schema)
   - `owner_id` → `created_by`

3. **Data Types Updated:**
   - All timestamps now use `TIMESTAMP WITH TIME ZONE`
   - `max_employees` is INTEGER instead of VARCHAR
   - Added `slug` and `email` fields

## Updated Store Functions

### fetchCurrentCompany()
- Now queries `organization_members` and `organizations` tables
- Returns organization data with correct field names
- Maps `organization_id` to `organization_id`

### createCompany()
- Creates organization with correct schema fields
- Sets `created_by` to current user ID
- Creates organization member with `corporate_admin` role
- Generates slug from organization name

### CompanySetup Component
- Updated form fields to match schema:
  - Organization Name (required)
  - Domain (required)
  - Email (required)
  - Max Employees (optional, defaults to 50)
- Removed industry and size category fields

## SQL Schema File Updates

### organization_invitations table
```sql
CREATE TABLE IF NOT EXISTS organization_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'learner',
  department_id UUID REFERENCES departments(id),
  invited_by UUID REFERENCES profiles(id),
  custom_message TEXT,
  status VARCHAR(20) DEFAULT 'pending',
  invited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### departments table
```sql
CREATE TABLE IF NOT EXISTS departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  manager_id UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## RLS Policies Updated

All RLS policies now reference:
- `organization_members` instead of `company_members`
- `organization_id` instead of `company_id`
- Updated role names: `corporate_admin`, `system_admin` instead of `admin`, `manager`

## Migration Notes

If migrating from old schema:

1. **Rename tables:**
   ```sql
   ALTER TABLE companies RENAME TO organizations;
   ALTER TABLE company_members RENAME TO organization_members;
   ALTER TABLE company_invitations RENAME TO organization_invitations;
   ```

2. **Update column names:**
   ```sql
   ALTER TABLE organizations RENAME COLUMN owner_id TO created_by;
   ALTER TABLE organizations RENAME COLUMN subscription_expires_at TO subscription_end_date;
   ```

3. **Add new columns:**
   ```sql
   ALTER TABLE organizations ADD COLUMN slug TEXT;
   ALTER TABLE organizations ADD COLUMN email TEXT;
   ALTER TABLE organizations ADD COLUMN max_employees INTEGER;
   ```

4. **Update role values:**
   ```sql
   UPDATE organization_members SET role = 'corporate_admin' WHERE role = 'admin';
   UPDATE organization_members SET role = 'learner' WHERE role = 'employee';
   ```

## Testing

To test the updated schema:

1. **Create organization:**
   ```javascript
   await createCompany({
     name: 'Test Organization',
     domain: 'test.com',
     email: 'contact@test.com',
     max_employees: 100
   })
   ```

2. **Check organization data:**
   ```javascript
   const { currentCompany } = useCorporateStore.getState()
   console.log('Organization:', currentCompany)
   ```

3. **Verify database:**
   ```sql
   SELECT * FROM organizations WHERE name = 'Test Organization';
   SELECT * FROM organization_members WHERE organization_id = 'org-id';
   ```

The schema is now aligned with the actual database structure and should work correctly with the invitation system.
