# 🔐 RBAC Implementation Guide for Kyzer LMS

## Overview

This guide provides complete documentation for implementing Role-Based Access Control (RBAC) in the Kyzer LMS. The RBAC system is now centralized, consistent, and easy to use throughout the application.

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [Architecture](#architecture)
3. [Using Permissions](#using-permissions)
4. [Role Definitions](#role-definitions)
5. [Implementation Patterns](#implementation-patterns)
6. [Examples](#examples)
7. [Best Practices](#best-practices)
8. [Debugging](#debugging)
9. [Migration Guide](#migration-guide)

---

## Quick Start

### 1. Import the necessary utilities

```javascript
import { PERMISSIONS, ROLES } from '@/constants/permissions';
import { hasPermission, canManageThisCourse } from '@/utils/permissions';
import { useAuth } from '@/hooks/auth/useAuth';
```

### 2. Check permissions in your component

```javascript
function MyComponent() {
  const { user } = useAuth();

  // Check a single permission
  const canEdit = hasPermission(user, PERMISSIONS.EDIT_COURSES);

  // Check course ownership
  const canManage = canManageThisCourse(user, course);

  return (
    <div>
      {canEdit && <Button>Edit Course</Button>}
      {canManage && <Button>Delete Course</Button>}
    </div>
  );
}
```

### 3. That's it!

No more hardcoded permission strings or inconsistent checks.

---

## Architecture

### File Structure

```
src/
├── constants/
│   └── permissions.js          # All permission and role constants
├── utils/
│   └── permissions.js          # Permission checking utilities
├── hooks/
│   └── auth/
│       └── useAuth.jsx         # Authentication hook
└── components/
    └── auth/
        ├── ProtectedRoute.jsx  # Basic auth guard
        ├── AdminGuard.jsx      # Permission-based guard
        └── CorporateGuard.jsx  # Organization guard
```

### Core Components

1. **Constants** (`src/constants/permissions.js`)
   - `PERMISSIONS` - All permission constants
   - `ROLES` - All role constants
   - `ROLE_PERMISSIONS` - Mapping of roles to permissions
   - `PERMISSION_CATEGORIES` - Grouped permissions for UI

2. **Utilities** (`src/utils/permissions.js`)
   - `hasPermission()` - Check single permission
   - `hasAllPermissions()` - Check multiple (AND logic)
   - `hasAnyPermission()` - Check multiple (OR logic)
   - `canManageThisCourse()` - Course-specific check
   - `getUserPermissions()` - Get all user permissions
   - `canPerformAction()` - Action-based check
   - More helpers...

3. **Hooks** (`src/hooks/auth/useAuth.jsx`)
   - `useAuth()` - Get current user and auth status
   - Returns: `{ user, profile, isAuthenticated }`

---

## Using Permissions

### Available Permission Constants

Always use constants instead of strings:

```javascript
// ✅ GOOD
hasPermission(user, PERMISSIONS.EDIT_COURSES)

// ❌ BAD
hasPermission(user, 'edit_courses')
```

### All Available Permissions

```javascript
// User Management
PERMISSIONS.INVITE_USERS
PERMISSIONS.MANAGE_USERS
PERMISSIONS.DELETE_USERS
PERMISSIONS.ASSIGN_ROLES

// Course Management
PERMISSIONS.CREATE_COURSES
PERMISSIONS.EDIT_COURSES
PERMISSIONS.DELETE_COURSES
PERMISSIONS.PUBLISH_COURSES
PERMISSIONS.MANAGE_COURSES

// Content Management
PERMISSIONS.ADD_LESSONS
PERMISSIONS.EDIT_LESSONS
PERMISSIONS.DELETE_LESSONS
PERMISSIONS.ADD_MODULES
PERMISSIONS.MANAGE_RESOURCES

// Reports & Analytics
PERMISSIONS.VIEW_REPORTS
PERMISSIONS.GENERATE_REPORTS
PERMISSIONS.VIEW_ANALYTICS

// Company Management
PERMISSIONS.MANAGE_COMPANY_SETTINGS
PERMISSIONS.MANAGE_BILLING

// And more... (see src/constants/permissions.js)
```

---

## Role Definitions

### The 4 Core Roles

#### 1. Learner (`ROLES.LEARNER`)
**Purpose:** Individual learning accounts

**Permissions:**
- View and enroll in courses
- Take assessments
- Download certificates
- View own progress
- Edit own profile

**Use Case:** Self-directed learners, students

#### 2. Corporate Admin (`ROLES.CORPORATE_ADMIN`)
**Purpose:** Organization administrators

**Permissions:**
- All learner permissions
- Invite and manage users
- Manage departments
- Assign courses
- View reports and analytics
- Manage company settings

**Use Case:** HR managers, training coordinators

#### 3. Instructor (`ROLES.INSTRUCTOR`)
**Purpose:** Course creators and educators

**Permissions:**
- Create and manage courses
- Add/edit/delete lessons, modules, quizzes
- Manage resources
- Grade submissions
- View student progress

**Use Case:** Teachers, content creators, subject matter experts

#### 4. System Admin (`ROLES.SYSTEM_ADMIN`)
**Purpose:** Platform administrators

**Permissions:**
- ALL permissions (superuser)
- Manage all organizations
- Manage platform settings
- Full system access

**Use Case:** Platform operators, technical administrators

---

## Implementation Patterns

### Pattern 1: Simple Permission Check

```javascript
import { hasPermission } from '@/utils/permissions';
import { PERMISSIONS } from '@/constants/permissions';
import { useAuth } from '@/hooks/auth/useAuth';

function CourseActions() {
  const { user } = useAuth();

  const canEdit = hasPermission(user, PERMISSIONS.EDIT_COURSES);

  return (
    <>
      {canEdit && (
        <Button onClick={handleEdit}>
          Edit Course
        </Button>
      )}
    </>
  );
}
```

### Pattern 2: Multiple Permission Check

```javascript
import { hasAllPermissions, hasAnyPermission } from '@/utils/permissions';

function AdminPanel() {
  const { user } = useAuth();

  // Require ALL permissions (AND logic)
  const canManageEverything = hasAllPermissions(user, [
    PERMISSIONS.MANAGE_USERS,
    PERMISSIONS.MANAGE_COMPANY_SETTINGS,
    PERMISSIONS.VIEW_REPORTS,
  ]);

  // Require ANY permission (OR logic)
  const canViewReports = hasAnyPermission(user, [
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.VIEW_ANALYTICS,
  ]);

  return (
    <>
      {canManageEverything && <FullAdminPanel />}
      {canViewReports && <ReportsSection />}
    </>
  );
}
```

### Pattern 3: Resource Ownership Check

```javascript
import { canManageThisCourse } from '@/utils/permissions';

function CourseCard({ course }) {
  const { user } = useAuth();

  // Checks both ownership AND permissions
  const canManage = canManageThisCourse(user, course);

  return (
    <>
      {canManage && (
        <>
          <Button onClick={() => handleEdit(course)}>Edit</Button>
          <Button onClick={() => handleDelete(course)}>Delete</Button>
        </>
      )}
    </>
  );
}
```

### Pattern 4: Action-Based Check

```javascript
import { canPerformAction } from '@/utils/permissions';

function handleAction(action, resource) {
  const { user } = useAuth();

  if (!canPerformAction(user, 'edit_course', resource)) {
    showError('You do not have permission to edit this course');
    return;
  }

  // Proceed with action
  editCourse(resource);
}
```

### Pattern 5: Route Protection

```javascript
import { AdminGuard } from '@/components/auth/AdminGuard';
import { PERMISSIONS } from '@/constants/permissions';

function Routes() {
  return (
    <Route
      path="/courses/manage"
      element={
        <AdminGuard requirePermission={PERMISSIONS.MANAGE_COURSES}>
          <CourseManagement />
        </AdminGuard>
      }
    />
  );
}
```

### Pattern 6: Inline Permission Check (for complex logic)

```javascript
function CourseManagement() {
  const { user } = useAuth();

  return (
    <div>
      {courses.map(course => {
        // Compute permissions per item
        const canManage = canManageThisCourse(user, course);
        const canPublish = hasPermission(user, PERMISSIONS.PUBLISH_COURSES);
        const canDelete = hasPermission(user, PERMISSIONS.DELETE_COURSES);

        return (
          <CourseCard key={course.id}>
            {canManage && (
              <>
                {canPublish && <PublishButton />}
                {canDelete && <DeleteButton />}
              </>
            )}
          </CourseCard>
        );
      })}
    </div>
  );
}
```

---

## Examples

### Example 1: Course Management Page

```javascript
// src/pages/courses/CourseManagement.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/auth/useAuth';
import { PERMISSIONS } from '@/constants/permissions';
import { hasPermission, canManageThisCourse } from '@/utils/permissions';

export default function CourseManagement() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);

  return (
    <div>
      {courses.map(course => {
        const canManage = canManageThisCourse(user, course);
        const canPublish = hasPermission(user, PERMISSIONS.PUBLISH_COURSES);
        const canEdit = hasPermission(user, PERMISSIONS.EDIT_COURSES);
        const canDelete = hasPermission(user, PERMISSIONS.DELETE_COURSES);
        const canManageResources = hasPermission(user, PERMISSIONS.MANAGE_RESOURCES);

        return (
          <div key={course.id}>
            <h3>{course.title}</h3>

            {canManage && (
              <div className="actions">
                {canPublish && (
                  <button onClick={() => togglePublish(course.id)}>
                    {course.is_published ? 'Unpublish' : 'Publish'}
                  </button>
                )}

                {canEdit && (
                  <button onClick={() => editCourse(course.id)}>
                    Edit
                  </button>
                )}

                {canManageResources && (
                  <button onClick={() => manageResources(course.id)}>
                    Resources
                  </button>
                )}

                {canDelete && (
                  <button onClick={() => deleteCourse(course.id)}>
                    Delete
                  </button>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
```

### Example 2: User Management Component

```javascript
import { hasPermission } from '@/utils/permissions';
import { PERMISSIONS } from '@/constants/permissions';

function UserManagement() {
  const { user } = useAuth();

  const canInvite = hasPermission(user, PERMISSIONS.INVITE_USERS);
  const canManage = hasPermission(user, PERMISSIONS.MANAGE_USERS);
  const canDelete = hasPermission(user, PERMISSIONS.DELETE_USERS);
  const canAssignRoles = hasPermission(user, PERMISSIONS.ASSIGN_ROLES);

  return (
    <div>
      <h2>User Management</h2>

      {canInvite && (
        <button onClick={handleInviteUser}>
          Invite User
        </button>
      )}

      <table>
        {users.map(targetUser => (
          <tr key={targetUser.id}>
            <td>{targetUser.name}</td>
            <td>
              {canAssignRoles && (
                <select onChange={(e) => changeRole(targetUser.id, e.target.value)}>
                  <option value="learner">Learner</option>
                  <option value="instructor">Instructor</option>
                  <option value="corporate_admin">Admin</option>
                </select>
              )}
            </td>
            <td>
              {canManage && (
                <button onClick={() => editUser(targetUser.id)}>Edit</button>
              )}
              {canDelete && (
                <button onClick={() => deleteUser(targetUser.id)}>Delete</button>
              )}
            </td>
          </tr>
        ))}
      </table>
    </div>
  );
}
```

---

## Best Practices

### ✅ DO's

1. **Always use constants**
   ```javascript
   // ✅ GOOD
   hasPermission(user, PERMISSIONS.EDIT_COURSES)

   // ❌ BAD
   hasPermission(user, 'edit_courses')
   ```

2. **Check permissions in the UI**
   ```javascript
   {hasPermission(user, PERMISSIONS.DELETE_USERS) && (
     <DeleteButton />
   )}
   ```

3. **Also check on the server**
   - UI checks improve UX
   - Server checks ensure security
   - Use RLS policies in Supabase

4. **Use descriptive variable names**
   ```javascript
   const canEditThisCourse = canManageThisCourse(user, course);
   const canPublish = hasPermission(user, PERMISSIONS.PUBLISH_COURSES);
   ```

5. **Compute permissions once per render**
   ```javascript
   // ✅ Compute once
   const canEdit = hasPermission(user, PERMISSIONS.EDIT_COURSES);

   return (
     <>
       {canEdit && <Button>Edit</Button>}
       {canEdit && <Button>Duplicate</Button>}
     </>
   );
   ```

### ❌ DON'Ts

1. **Don't hardcode role checks**
   ```javascript
   // ❌ BAD
   if (user.role === 'admin' || user.role === 'instructor') { }

   // ✅ GOOD
   if (hasAnyRole(user, [ROLES.CORPORATE_ADMIN, ROLES.INSTRUCTOR])) { }
   ```

2. **Don't check permissions multiple times**
   ```javascript
   // ❌ BAD (checks 3 times)
   return (
     <>
       {hasPermission(user, PERMISSIONS.EDIT_COURSES) && <Button>Edit</Button>}
       {hasPermission(user, PERMISSIONS.EDIT_COURSES) && <Button>Copy</Button>}
       {hasPermission(user, PERMISSIONS.EDIT_COURSES) && <Button>Delete</Button>}
     </>
   );

   // ✅ GOOD (checks once)
   const canEdit = hasPermission(user, PERMISSIONS.EDIT_COURSES);
   return (
     <>
       {canEdit && <Button>Edit</Button>}
       {canEdit && <Button>Copy</Button>}
       {canEdit && <Button>Delete</Button>}
     </>
   );
   ```

3. **Don't skip server-side checks**
   ```javascript
   // ❌ BAD (only UI check)
   function deleteCourse(id) {
     // No permission check!
     api.delete(`/courses/${id}`);
   }

   // ✅ GOOD (UI + server check)
   function deleteCourse(id) {
     if (!hasPermission(user, PERMISSIONS.DELETE_COURSES)) {
       showError('Permission denied');
       return;
     }
     // Server will also check via RLS
     api.delete(`/courses/${id}`);
   }
   ```

---

## Debugging

### Debug User Permissions

```javascript
import { debugUserPermissions } from '@/utils/permissions';

// In browser console or component
debugUserPermissions(user);

// Output:
// 🔐 Permissions for user@example.com
// Role: instructor
// Account Type: individual
// Organization: null
//
// Permissions:
//   ✓ view_courses
//   ✓ create_courses
//   ✓ edit_courses
//   ✓ delete_courses
//   ✓ add_lessons
//   ...
// Total: 15 permissions
```

### Debug Specific Permission

```javascript
import { hasPermissionDebug } from '@/utils/permissions';

hasPermissionDebug(user, PERMISSIONS.EDIT_COURSES, true);

// Output:
// 🔐 Permission Check: edit_courses
//    User: user@example.com
//    Role: instructor
//    Result: ✅ GRANTED
```

### Check All User Permissions

```javascript
import { getUserPermissions } from '@/utils/permissions';

const permissions = getUserPermissions(user);
console.log('User has these permissions:', permissions);
```

---

## Migration Guide

### Migrating Existing Code

#### Before (Old Way)

```javascript
// Hardcoded role check
if (user.role === 'admin' || user.role === 'instructor') {
  showEditButton();
}

// Hardcoded string
if (user.permissions?.includes('edit_courses')) {
  showEditButton();
}

// Creator check only
if (course.created_by === user.id) {
  showDeleteButton();
}
```

#### After (New Way)

```javascript
import { PERMISSIONS } from '@/constants/permissions';
import { hasPermission, canManageThisCourse } from '@/utils/permissions';

// Use permission constants
if (hasPermission(user, PERMISSIONS.EDIT_COURSES)) {
  showEditButton();
}

// Use resource-specific check
if (canManageThisCourse(user, course)) {
  showDeleteButton();
}
```

### Step-by-Step Migration

1. **Replace hardcoded strings with constants**
   - Find: `'edit_courses'`
   - Replace: `PERMISSIONS.EDIT_COURSES`

2. **Replace role checks with permission checks**
   - Find: `user.role === 'admin'`
   - Replace: `isAdmin(user)` or check specific permission

3. **Use helper functions for complex logic**
   - Replace: `course.created_by === user.id`
   - With: `canManageThisCourse(user, course)`

4. **Update imports**
   ```javascript
   import { PERMISSIONS } from '@/constants/permissions';
   import { hasPermission, canManageThisCourse } from '@/utils/permissions';
   import { useAuth } from '@/hooks/auth/useAuth';
   ```

---

## Testing Permissions

### Manual Testing Checklist

- [ ] Test as Learner role
- [ ] Test as Instructor role
- [ ] Test as Corporate Admin role
- [ ] Test as System Admin role
- [ ] Test course creator vs non-creator
- [ ] Test organization member vs non-member
- [ ] Test permission overrides (if implemented)

### Permission Matrix

| Action | Learner | Instructor | Corp Admin | System Admin |
|--------|---------|------------|------------|--------------|
| View Courses | ✅ | ✅ | ✅ | ✅ |
| Enroll in Courses | ✅ | ✅ | ✅ | ✅ |
| Create Courses | ❌ | ✅ | ❌ | ✅ |
| Edit Own Course | ❌ | ✅ | ❌ | ✅ |
| Edit Any Course | ❌ | ❌ | ❌ | ✅ |
| Delete Own Course | ❌ | ✅ | ❌ | ✅ |
| Delete Any Course | ❌ | ❌ | ❌ | ✅ |
| Invite Users | ❌ | ❌ | ✅ | ✅ |
| Manage Users | ❌ | ❌ | ✅ | ✅ |
| View Reports | ❌ | ✅* | ✅ | ✅ |
| Manage Settings | ❌ | ❌ | ✅ | ✅ |

*Instructors can view reports for their own courses

---

## Common Issues

### Issue 1: Permission Denied Despite Having Role

**Problem:** User has the right role but permission check fails

**Solution:** Check that role permissions are defined in `ROLE_PERMISSIONS`

```javascript
// In src/constants/permissions.js
export const ROLE_PERMISSIONS = {
  [ROLES.INSTRUCTOR]: [
    PERMISSIONS.CREATE_COURSES,
    PERMISSIONS.EDIT_COURSES,
    // ... add missing permission here
  ],
};
```

### Issue 2: User is undefined

**Problem:** `hasPermission(user, ...)` returns false because user is null

**Solution:** Check authentication status first

```javascript
const { user, isAuthenticated } = useAuth();

if (!isAuthenticated || !user) {
  return <LoginPrompt />;
}

const canEdit = hasPermission(user, PERMISSIONS.EDIT_COURSES);
```

### Issue 3: Custom Permissions Not Working

**Problem:** User has custom permissions in `organization_members.permissions` but check fails

**Solution:** Ensure custom permissions are stored correctly in database

```sql
-- Check custom permissions
SELECT user_id, permissions
FROM organization_members
WHERE user_id = 'user-id';

-- Format should be:
-- Array: ['edit_courses', 'manage_users']
-- OR Object: {"edit_courses": true, "manage_users": true}
```

---

## Next Steps

1. **Review the constants file:** [src/constants/permissions.js](../src/constants/permissions.js)
2. **Check utility functions:** [src/utils/permissions.js](../src/utils/permissions.js)
3. **See implementation example:** [src/pages/courses/CourseManagement.jsx](../src/pages/courses/CourseManagement.jsx)
4. **Read role documentation:** [ROLE_PERMISSIONS_GUIDE.md](./ROLE_PERMISSIONS_GUIDE.md)

---

## Support

For questions or issues:
1. Check this guide first
2. Review the code examples
3. Use the debugging utilities
4. Check existing implementations in the codebase

---

**Last Updated:** December 2024
**Version:** 1.0.0
