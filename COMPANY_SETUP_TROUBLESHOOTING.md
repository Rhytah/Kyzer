# Company Setup Troubleshooting Guide

## Issue: "No current company" Error

This error occurs when a user tries to send invitations but doesn't have a company associated with their account.

### Root Causes

1. **User not associated with any company**
2. **Company data not loaded properly**
3. **Database connection issues**
4. **User authentication problems**

### Solutions

#### 1. Check Company Association

**Step 1:** Verify if the user has a company
```javascript
// In browser console
const store = useCorporateStore.getState()
console.log('Current company:', store.currentCompany)
```

**Step 2:** Check database directly
```sql
-- Run in Supabase SQL editor
SELECT 
  cm.*,
  c.name as company_name
FROM company_members cm
JOIN companies c ON cm.company_id = c.id
WHERE cm.user_id = 'your-user-id'
AND cm.status = 'active';
```

#### 2. Manual Company Association

If the user should be associated with a company:

```sql
-- Associate user with existing company
INSERT INTO company_members (
  company_id,
  user_id,
  role,
  status,
  joined_at
) VALUES (
  'company-uuid',
  'user-uuid',
  'corporate_admin',
  'active',
  NOW()
);
```

#### 3. Create New Company

If the user needs to create a company:

1. **Use the CompanySetup component** (automatically shown when no company)
2. **Or use the API directly:**

```javascript
// In browser console
const store = useCorporateStore.getState()
await store.createCompany({
  name: 'Your Company Name',
  domain: 'yourcompany.com',
  industry: 'technology',
  sizeCategory: 'small'
})
```

#### 4. Fix Database Issues

**Check if companies table exists:**
```sql
SELECT * FROM companies LIMIT 1;
```

**Check if company_members table exists:**
```sql
SELECT * FROM company_members LIMIT 1;
```

**Check RLS policies:**
```sql
SELECT * FROM pg_policies WHERE tablename = 'companies';
SELECT * FROM pg_policies WHERE tablename = 'company_members';
```

#### 5. Debug Authentication

**Check user authentication:**
```javascript
// In browser console
const { data: { user } } = await supabase.auth.getUser()
console.log('User:', user)
```

**Check user profile:**
```sql
SELECT * FROM profiles WHERE id = 'user-id';
```

### Prevention

#### 1. Proper User Onboarding

Ensure new users go through proper onboarding:

```javascript
// After user signs up
const handleUserSignup = async (userData) => {
  // Create user profile
  await createUserProfile(userData)
  
  // If corporate user, create or associate with company
  if (userData.userType === 'corporate') {
    await createOrAssociateCompany(userData)
  }
}
```

#### 2. Company Validation

Add company validation to all corporate features:

```javascript
const useCorporateFeature = () => {
  const { currentCompany, fetchCurrentCompany } = useCorporateStore()
  
  useEffect(() => {
    if (!currentCompany) {
      fetchCurrentCompany()
    }
  }, [])
  
  return { currentCompany, isReady: !!currentCompany }
}
```

#### 3. Error Boundaries

Wrap corporate components with error boundaries:

```javascript
const CorporateErrorBoundary = ({ children }) => {
  const { currentCompany } = useCorporateStore()
  
  if (!currentCompany) {
    return <CompanySetup />
  }
  
  return children
}
```

### Testing

#### 1. Test Company Creation

```javascript
// Test company creation
const testCompanyCreation = async () => {
  try {
    const result = await createCompany({
      name: 'Test Company',
      domain: 'test.com',
      industry: 'technology',
      sizeCategory: 'small'
    })
    console.log('Company created:', result)
  } catch (error) {
    console.error('Error:', error)
  }
}
```

#### 2. Test Company Fetching

```javascript
// Test company fetching
const testCompanyFetch = async () => {
  try {
    await fetchCurrentCompany()
    const { currentCompany } = useCorporateStore.getState()
    console.log('Current company:', currentCompany)
  } catch (error) {
    console.error('Error:', error)
  }
}
```

#### 3. Test User Association

```javascript
// Test user association
const testUserAssociation = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    console.error('No authenticated user')
    return
  }
  
  const { data: memberships } = await supabase
    .from('company_members')
    .select('*, companies(*)')
    .eq('user_id', user.id)
    .eq('status', 'active')
  
  console.log('User memberships:', memberships)
}
```

### Common Scenarios

#### Scenario 1: New User, No Company
**Solution:** Show CompanySetup component, allow user to create company

#### Scenario 2: Existing User, Company Not Loaded
**Solution:** Call fetchCurrentCompany() on component mount

#### Scenario 3: User Should Be in Company, But Not Associated
**Solution:** Manually associate user with company via database

#### Scenario 4: User in Multiple Companies
**Solution:** Implement company switching functionality

#### Scenario 5: Company Deleted/Inactive
**Solution:** Show appropriate error message, allow company recreation

### Database Queries

#### Check User's Company Status
```sql
SELECT 
  u.email,
  c.name as company_name,
  cm.role,
  cm.status,
  cm.joined_at
FROM auth.users u
LEFT JOIN company_members cm ON u.id = cm.user_id
LEFT JOIN companies c ON cm.company_id = c.id
WHERE u.email = 'user@example.com';
```

#### Find Orphaned Users
```sql
SELECT 
  u.email,
  u.created_at
FROM auth.users u
LEFT JOIN company_members cm ON u.id = cm.user_id
WHERE cm.user_id IS NULL
AND u.email_confirmed_at IS NOT NULL;
```

#### Check Company Members
```sql
SELECT 
  c.name as company_name,
  COUNT(cm.id) as member_count,
  COUNT(CASE WHEN cm.status = 'active' THEN 1 END) as active_members
FROM companies c
LEFT JOIN company_members cm ON c.id = cm.company_id
GROUP BY c.id, c.name
ORDER BY member_count DESC;
```

### UI Improvements

#### 1. Company Status Indicator
```javascript
const CompanyStatus = () => {
  const { currentCompany } = useCorporateStore()
  
  if (!currentCompany) {
    return (
      <div className="bg-warning-light border border-warning-default rounded-lg p-3">
        <p className="text-warning-default text-sm">
          ⚠ No company associated. Some features may be limited.
        </p>
      </div>
    )
  }
  
  return (
    <div className="bg-success-light border border-success-default rounded-lg p-3">
      <p className="text-success-default text-sm">
        ✓ Company: {currentCompany.name}
      </p>
    </div>
  )
}
```

#### 2. Company Setup CTA
```javascript
const CompanySetupCTA = () => {
  const { currentCompany } = useCorporateStore()
  
  if (currentCompany) return null
  
  return (
    <div className="text-center py-8">
      <Building2 className="w-12 h-12 text-text-muted mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-text-dark mb-2">
        Set Up Your Company
      </h3>
      <p className="text-text-light mb-4">
        Create your company to start managing employees and sending invitations.
      </p>
      <Button onClick={() => setShowCompanySetup(true)}>
        <Building2 className="w-4 h-4 mr-2" />
        Create Company
      </Button>
    </div>
  )
}
```

### Monitoring

#### 1. Track Company Association Errors
```javascript
// Add to error tracking
const trackCompanyError = (error, context) => {
  console.error('Company error:', error, context)
  // Send to analytics/monitoring service
}
```

#### 2. Monitor Company Creation Success
```javascript
// Track successful company creation
const trackCompanyCreation = (companyData) => {
  console.log('Company created successfully:', companyData)
  // Send to analytics
}
```

This troubleshooting guide should help resolve the "No current company" error and prevent it from occurring in the future.
