# Invitation System Troubleshooting Guide

## Issue: Send Invite Not Working

If the send invite functionality is not working, follow these troubleshooting steps:

### 1. Check Database Schema

First, ensure the required database tables exist by running the SQL script:

```sql
-- Run this in your Supabase SQL editor
\i user_management_schema.sql
```

Or manually create the tables using the provided schema file.

### 2. Verify Store Functions

The invitation system uses the following store functions:

```javascript
// Check if these functions exist in your corporateStore
const {
  inviteEmployee,
  fetchEmployees,
  fetchDepartments,
  fetchInvitations
} = useCorporateStore()
```

### 3. Check Console for Errors

Open browser developer tools and check for any JavaScript errors:

1. Press F12 to open DevTools
2. Go to Console tab
3. Try sending an invitation
4. Look for any error messages

### 4. Verify User Authentication

Ensure the user is properly authenticated and has a company:

```javascript
// Check if user has a company
const { currentCompany } = useCorporateStore()
console.log('Current company:', currentCompany)
```

### 5. Test with Simple Invitation

Use the test component to verify basic functionality:

```jsx
import InviteTest from '@/components/corporate/InviteTest'

// Add this to your page temporarily
<InviteTest />
```

### 6. Check Network Requests

In DevTools Network tab, verify that the invitation request is being sent:

1. Open Network tab
2. Try sending an invitation
3. Look for POST requests to Supabase
4. Check the request payload and response

### 7. Verify Supabase Configuration

Ensure your Supabase client is properly configured:

```javascript
// Check your supabase.js file
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'your-supabase-url'
const supabaseKey = 'your-supabase-anon-key'

export const supabase = createClient(supabaseUrl, supabaseKey)
```

### 8. Check RLS Policies

Verify that Row Level Security policies allow the operations:

```sql
-- Check if RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('company_invitations', 'departments', 'company_members');

-- Check policies
SELECT * FROM pg_policies WHERE tablename = 'company_invitations';
```

### 9. Common Issues and Solutions

#### Issue: "User not authenticated"
**Solution:** Ensure user is logged in and has a valid session

#### Issue: "No current company"
**Solution:** User needs to be associated with a company first

#### Issue: "Permission denied"
**Solution:** Check RLS policies and user role permissions

#### Issue: "Email already exists"
**Solution:** Check if user is already a member or has pending invitation

#### Issue: "Invalid email format"
**Solution:** Validate email format before sending

### 10. Debug Mode

Enable debug logging by adding this to your component:

```javascript
const handleInviteEmployee = async (e) => {
  e.preventDefault()
  
  console.log('Form data:', inviteForm)
  console.log('Current company:', currentCompany)
  
  try {
    const result = await inviteEmployee(
      inviteForm.email,
      inviteForm.role,
      inviteForm.departmentId || null,
      inviteForm.customMessage || null
    )
    console.log('Invitation result:', result)
  } catch (error) {
    console.error('Invitation error:', error)
  }
}
```

### 11. Step-by-Step Testing

1. **Test Store Connection:**
   ```javascript
   const store = useCorporateStore.getState()
   console.log('Store state:', store)
   ```

2. **Test Company Fetch:**
   ```javascript
   await store.fetchCurrentCompany()
   console.log('Company:', store.currentCompany)
   ```

3. **Test Invitation:**
   ```javascript
   await store.inviteEmployee('test@example.com', 'employee', null, 'Test message')
   ```

### 12. Email Service Integration

The current implementation simulates email sending. To integrate with a real email service:

```javascript
// Replace the sendInvitationEmail function in corporateStore.js
const sendInvitationEmail = async (email, data) => {
  // Example with SendGrid
  const sgMail = require('@sendgrid/mail')
  sgMail.setApiKey(process.env.SENDGRID_API_KEY)
  
  const msg = {
    to: email,
    from: 'noreply@yourcompany.com',
    subject: `Invitation to join ${data.companyName}`,
    html: `
      <h2>You're invited to join ${data.companyName}</h2>
      <p>Role: ${data.role}</p>
      <p>${data.customMessage || ''}</p>
      <a href="${data.invitationLink}">Accept Invitation</a>
    `
  }
  
  await sgMail.send(msg)
}
```

### 13. Environment Variables

Ensure these environment variables are set:

```env
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 14. Component Props

Verify that the InviteEmployeeModal is receiving the correct props:

```javascript
<InviteEmployeeModal
  isOpen={showInviteModal}
  onClose={() => setShowInviteModal(false)}
  onSubmit={handleInviteEmployee}  // This should be the async function
  departments={departments}
  loading={loading}
  formData={inviteForm}
  setFormData={setInviteForm}
  errors={errors}
/>
```

### 15. Form Validation

Check if form validation is preventing submission:

```javascript
const handleInviteEmployee = async (e) => {
  e.preventDefault()
  
  // Check validation
  const newErrors = {}
  if (!inviteForm.email) newErrors.email = 'Email is required'
  if (!inviteForm.email.includes('@')) newErrors.email = 'Valid email is required'
  
  console.log('Validation errors:', newErrors)
  
  if (Object.keys(newErrors).length > 0) {
    setErrors(newErrors)
    return // This might be preventing submission
  }
  
  // Rest of the function...
}
```

If you're still experiencing issues after following these steps, please check:

1. Browser console for specific error messages
2. Network tab for failed requests
3. Supabase logs for server-side errors
4. Database permissions and RLS policies

The most common issue is usually missing database tables or incorrect RLS policies.
