# Corporate User Management System

A comprehensive user management system for corporate accounts with advanced features for team organization, role management, and user invitations.

## Features

### 🎯 Core Functionality
- **User Invitations**: Send email invitations with custom messages and role assignments
- **Role Management**: Granular permission system with custom role creation
- **Department Management**: Organize users into departments with managers
- **Bulk Operations**: Import/export users, bulk role assignments, and bulk invitations
- **Activity Tracking**: Monitor user activities and system changes

### 👥 User Management
- **Employee Directory**: View, search, and filter all employees
- **Role Assignment**: Assign and modify user roles with specific permissions
- **Department Assignment**: Organize users into departments
- **Status Management**: Track active, pending, and inactive users
- **Profile Management**: View and edit user profiles

### 🏢 Department Management
- **Department Creation**: Create and manage departments
- **Manager Assignment**: Assign department managers
- **Employee Organization**: Group employees by department
- **Department Analytics**: Track department performance and course completion

### 🔐 Role & Permissions
- **Predefined Roles**: Admin, Manager, Employee with appropriate permissions
- **Custom Roles**: Create custom roles with specific permission sets
- **Granular Permissions**: Fine-grained control over user capabilities
- **Permission Categories**:
  - User Management
  - Department Management
  - Course Management
  - Reports & Analytics
  - Company Settings
  - System Access

### 📧 Invitation System
- **Single Invitations**: Invite individual users with custom messages
- **Bulk Invitations**: Upload CSV files for bulk user invitations
- **Email Templates**: Professional invitation emails
- **Invitation Tracking**: Monitor pending, accepted, and expired invitations
- **Resend Capability**: Resend expired invitations

## Components

### Core Components

#### `UserManagementDashboard.jsx`
Main dashboard component that provides an overview of all user management features.

**Features:**
- Overview statistics
- Department performance metrics
- Recent activity feed
- Quick action buttons
- Tabbed navigation

#### `EmployeeManagement.jsx`
Enhanced employee management with department filtering and advanced features.

**Features:**
- Employee directory with search and filters
- Role and department assignment
- Bulk operations
- Status management
- Department filtering

#### `DepartmentManagement.jsx`
Complete department management system.

**Features:**
- Create, edit, and delete departments
- Manager assignment
- Employee count tracking
- Department analytics

#### `UserInvitation.jsx`
Comprehensive invitation system.

**Features:**
- Single user invitations
- Bulk CSV upload
- Custom invitation messages
- Invitation tracking and management
- Resend functionality

#### `RoleManagement.jsx`
Advanced role and permission management.

**Features:**
- Predefined role templates
- Custom role creation
- Granular permission control
- Bulk role assignment
- Permission categories

### Store Integration

#### Enhanced `corporateStore.js`
Extended Zustand store with new user management functions.

**New Functions:**
- `inviteEmployee()` - Send single invitations
- `bulkInviteEmployees()` - Send bulk invitations
- `fetchInvitations()` - Get pending invitations
- `resendInvitation()` - Resend expired invitations
- `deleteInvitation()` - Remove invitations
- `updateEmployeeRole()` - Change user roles
- `removeEmployee()` - Remove users
- `fetchDepartments()` - Get departments
- `createDepartment()` - Create departments
- `updateDepartment()` - Update departments
- `deleteDepartment()` - Delete departments
- `bulkUpdateEmployeeRoles()` - Bulk role updates

## Database Schema

### Required Tables

#### `company_invitations`
```sql
CREATE TABLE company_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'employee',
  department_id UUID REFERENCES departments(id),
  invited_by UUID REFERENCES profiles(id),
  custom_message TEXT,
  status VARCHAR(20) DEFAULT 'pending',
  invited_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP NOT NULL,
  used_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### `departments`
```sql
CREATE TABLE departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  manager_id UUID REFERENCES profiles(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Enhanced `company_members`
```sql
ALTER TABLE company_members ADD COLUMN department_id UUID REFERENCES departments(id);
ALTER TABLE company_members ADD COLUMN invited_by UUID REFERENCES profiles(id);
ALTER TABLE company_members ADD COLUMN invited_at TIMESTAMP;
ALTER TABLE company_members ADD COLUMN joined_at TIMESTAMP;
ALTER TABLE company_members ADD COLUMN removed_at TIMESTAMP;
```

## Usage

### Basic Setup

1. **Import the dashboard component:**
```jsx
import UserManagementDashboard from '@/components/corporate/UserManagementDashboard'

function CorporatePage() {
  return <UserManagementDashboard />
}
```

2. **Set up the corporate store:**
```jsx
import { useCorporateStore } from '@/store/corporateStore'

const { 
  fetchCurrentCompany,
  inviteEmployee,
  createDepartment 
} = useCorporateStore()
```

### Inviting Users

#### Single Invitation
```jsx
const handleInvite = async () => {
  await inviteEmployee(
    'user@company.com',
    'employee',
    departmentId,
    'Welcome to our team!'
  )
}
```

#### Bulk Invitation
```jsx
const invitations = [
  { email: 'user1@company.com', role: 'employee', departmentId: 'dept-1' },
  { email: 'user2@company.com', role: 'manager', departmentId: 'dept-2' }
]

await bulkInviteEmployees(invitations)
```

### Managing Departments

```jsx
// Create department
await createDepartment({
  name: 'Engineering',
  description: 'Software development team',
  manager_id: 'manager-user-id'
})

// Update department
await updateDepartment(departmentId, {
  name: 'Updated Name',
  manager_id: 'new-manager-id'
})
```

### Role Management

```jsx
// Update user role
await updateEmployeeRole(employeeId, 'manager')

// Bulk role updates
await bulkUpdateEmployeeRoles([
  { employeeId: 'emp-1', role: 'manager' },
  { employeeId: 'emp-2', role: 'employee' }
])
```

## Permissions

### Role Hierarchy

1. **Admin**
   - Full system access
   - Can manage all users and departments
   - Can create and modify roles
   - Access to all reports and analytics

2. **Manager**
   - Can invite and manage team members
   - Can assign courses
   - Can view team reports
   - Limited department management

3. **Employee**
   - Basic access to assigned courses
   - Can view personal progress
   - Limited system access

### Permission Categories

- **User Management**: Invite, manage, delete users
- **Department Management**: Create, edit, delete departments
- **Course Management**: Create, assign, manage courses
- **Reports & Analytics**: View and generate reports
- **Company Settings**: Manage company configuration
- **System Access**: Admin panel and system settings

## Email Integration

The system includes email service integration for invitations:

```javascript
// Email service helper (customize for your email provider)
const sendInvitationEmail = async (email, data) => {
  // Integrate with SendGrid, AWS SES, etc.
  await emailService.send({
    to: email,
    template: 'invitation',
    data: {
      companyName: data.companyName,
      inviterName: data.inviterName,
      role: data.role,
      invitationLink: data.invitationLink
    }
  })
}
```

## Security Features

- **Role-based Access Control**: Granular permission system
- **Invitation Expiration**: Invitations expire after 7 days
- **Email Validation**: Proper email format validation
- **Duplicate Prevention**: Prevents duplicate invitations
- **Audit Logging**: Track all user management activities

## Customization

### Styling
All components use Tailwind CSS classes and can be customized by modifying the class names or extending the theme.

### Permissions
Add new permissions by extending the permission categories in `RoleManagement.jsx`:

```javascript
const permissionCategories = [
  {
    title: 'Custom Category',
    permissions: [
      { key: 'canDoSomething', label: 'Can Do Something' }
    ]
  }
]
```

### Email Templates
Customize invitation emails by modifying the `sendInvitationEmail` function in `corporateStore.js`.

## Future Enhancements

- [ ] Advanced user analytics and reporting
- [ ] Integration with external HR systems
- [ ] Automated onboarding workflows
- [ ] Advanced permission inheritance
- [ ] User activity dashboards
- [ ] Mobile app support
- [ ] API endpoints for external integrations

## Troubleshooting

### Common Issues

1. **Invitations not sending**: Check email service configuration
2. **Permission errors**: Verify user roles and permissions
3. **Department assignment issues**: Ensure department exists and user has permission
4. **Bulk operation failures**: Check CSV format and data validation

### Debug Mode

Enable debug logging by setting:
```javascript
localStorage.setItem('debug', 'user-management')
```

## Support

For issues and questions:
1. Check the component documentation
2. Review the store functions
3. Verify database schema
4. Check console for error messages
