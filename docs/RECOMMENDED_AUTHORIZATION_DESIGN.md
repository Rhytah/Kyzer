# Recommended Authorization Design for Kyzer LMS

## 🎯 Hybrid Role + Permission Override System

### Core Principle
**Roles define default permissions, with optional per-user overrides for flexibility.**

## Database Schema Design

### Keep Current Role Tables
```sql
-- Keep existing
user_profiles (role: system_admin, instructor, etc.)
organization_members (role: admin, manager, member)
```

### Add Permission Overrides Table
```sql
CREATE TABLE user_permission_overrides (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    permission VARCHAR(50) NOT NULL,
    granted BOOLEAN NOT NULL, -- true = grant, false = deny
    granted_by UUID REFERENCES auth.users(id),
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE, -- optional expiration
    reason TEXT, -- why this override was granted

    UNIQUE(user_id, permission)
);
```

## Permission System Implementation

### 1. Define Core Permissions
```javascript
const PERMISSIONS = {
  // Course Management
  MANAGE_COURSES: 'manage_courses',
  CREATE_COURSES: 'create_courses',
  DELETE_COURSES: 'delete_courses',

  // Certificate Management
  MANAGE_CERTIFICATE_TEMPLATES: 'manage_certificate_templates',

  // Corporate Management
  INVITE_EMPLOYEES: 'invite_employees',
  MANAGE_EMPLOYEES: 'manage_employees',
  VIEW_REPORTS: 'view_reports',

  // Content Management
  MANAGE_PRESENTATIONS: 'manage_presentations',
  MANAGE_QUIZZES: 'manage_quizzes'
};
```

### 2. Role-Based Default Permissions
```javascript
const ROLE_PERMISSIONS = {
  system_admin: [
    'manage_courses',
    'create_courses',
    'delete_courses',
    'manage_certificate_templates',
    'manage_presentations',
    'manage_quizzes'
  ],

  instructor: [
    'manage_courses',
    'create_courses',
    'manage_certificate_templates',
    'manage_presentations',
    'manage_quizzes'
  ],

  // Corporate roles
  admin: [
    'invite_employees',
    'manage_employees',
    'view_reports'
  ],

  manager: [
    'invite_employees',
    'view_reports'
  ],

  member: []
};
```

### 3. Permission Check Function
```javascript
const hasPermission = async (userId, permission) => {
  // Get user role
  const userRole = await getUserRole(userId);

  // Check role-based default
  const rolePermissions = ROLE_PERMISSIONS[userRole] || [];
  const hasRolePermission = rolePermissions.includes(permission);

  // Check for overrides
  const override = await getPermissionOverride(userId, permission);

  if (override) {
    // Override exists - check if not expired
    if (!override.expires_at || new Date() < new Date(override.expires_at)) {
      return override.granted;
    }
  }

  return hasRolePermission;
};
```

## Benefits of This Approach

### ✅ Advantages
1. **Simplicity**: Most users work with simple roles
2. **Flexibility**: Can grant exceptions when needed
3. **Auditability**: Track who granted what permissions and why
4. **Scalability**: Easy to add new permissions without new roles
5. **Security**: Can temporarily revoke permissions
6. **Backward Compatibility**: Works with your existing role system

### 🎯 Real-World Examples

#### Example 1: Temporary Course Creator
```javascript
// Grant a member temporary course creation rights
await grantPermissionOverride(
  userId: 'user123',
  permission: 'create_courses',
  granted: true,
  expires_at: '2024-12-31',
  reason: 'Temporary content creator for Q4 training'
);
```

#### Example 2: Restricted Instructor
```javascript
// Remove delete permission from a specific instructor
await grantPermissionOverride(
  userId: 'instructor456',
  permission: 'delete_courses',
  granted: false,
  reason: 'New instructor - no delete access yet'
);
```

## Implementation Strategy

### Phase 1: Keep Current System (No Breaking Changes)
- Continue using role-based checks
- Add permission override table
- Implement hybrid permission function

### Phase 2: Gradual Migration
- Replace critical permission checks with hybrid function
- Start with certificate templates, course management
- Add admin UI for managing overrides

### Phase 3: Full Implementation
- All features use hybrid permission system
- Admin dashboard for permission management
- Audit logs for permission changes

## Code Examples

### React Hook
```javascript
const usePermissions = () => {
  const { user } = useAuth();

  const hasPermission = useCallback(async (permission) => {
    if (!user) return false;
    return await checkUserPermission(user.id, permission);
  }, [user]);

  const canManageCourses = useMemo(() =>
    hasPermission(PERMISSIONS.MANAGE_COURSES), [hasPermission]
  );

  return { hasPermission, canManageCourses };
};
```

### Component Usage
```javascript
const CertificateTemplates = () => {
  const { hasPermission } = usePermissions();
  const [canManageTemplates, setCanManageTemplates] = useState(false);

  useEffect(() => {
    hasPermission(PERMISSIONS.MANAGE_CERTIFICATE_TEMPLATES)
      .then(setCanManageTemplates);
  }, [hasPermission]);

  if (!canManageTemplates) {
    return <AccessDenied />;
  }

  return <TemplateManagement />;
};
```

## Alternative: Simple Role Extension

If you prefer to keep it simpler, just extend your current role system:

### Option A: More Granular Roles
```javascript
const roles = [
  'system_admin',
  'instructor_full',      // Can create, edit, delete courses
  'instructor_limited',   // Can create, edit courses (no delete)
  'content_creator',      // Can create presentations, quizzes
  'corporate_admin',
  'corporate_manager'
];
```

### Option B: Role + Scope System
```javascript
const userRole = {
  role: 'instructor',
  scopes: ['courses:create', 'courses:edit', 'templates:manage']
};
```

## Recommendation Summary

For your LMS, I recommend **starting with the hybrid approach** because:

1. **No breaking changes** to existing code
2. **Gradual adoption** - implement where needed
3. **Future-proof** - can handle complex requirements
4. **Enterprise-ready** - supports compliance and audit needs
5. **User-friendly** - admins can grant exceptions easily

The certificate template feature would be perfect for testing this system!