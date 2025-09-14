# Role Permissions Guide

This document outlines the four user roles in the Kyzer platform and their specific permissions and capabilities.

## Role Overview

### 1. Learner (Individual)
**Icon:** 🎓 GraduationCap  
**Type:** Individual  
**Color:** Blue  
**Description:** View/enroll in courses, take assessments, and download certificates

#### Permissions:
- **Learning & Course Access:**
  - ✅ View Courses
  - ✅ Enroll in Courses
  - ✅ Take Assessments
  - ✅ Download Certificates
  - ✅ View Own Progress
  - ✅ Access Learning Path
  - ✅ View Course Content
  - ✅ Submit Assignments
  - ✅ View Grades

- **Profile Management:**
  - ✅ Edit Own Profile
  - ✅ Update Own Settings

- **Restrictions:**
  - ❌ Cannot invite users
  - ❌ Cannot manage other users
  - ❌ Cannot create courses
  - ❌ Cannot view reports
  - ❌ Cannot manage company settings

---

### 2. Corporate Admin
**Icon:** ⚙️ UserCog  
**Type:** Corporate  
**Color:** Purple  
**Description:** Add/manage users, assign courses, view dashboards/reports, download certificates

#### Permissions:
- **User Management:**
  - ✅ Invite Users
  - ✅ Manage Users
  - ✅ Delete Users
  - ✅ Assign Roles
  - ✅ Bulk User Operations

- **Department Management:**
  - ✅ Create Departments
  - ✅ Edit Departments
  - ✅ Delete Departments
  - ✅ Assign Department Managers

- **Course Assignment & Progress:**
  - ✅ Assign Courses
  - ✅ View All Progress
  - ✅ Download Certificates
  - ✅ Manage Course Assignments

- **Reports & Analytics:**
  - ✅ View Reports
  - ✅ Generate Reports
  - ✅ Export Data
  - ✅ View Analytics
  - ✅ View Dashboards

- **Company Settings:**
  - ✅ Manage Company Settings
  - ✅ Manage Billing
  - ✅ Manage Integrations
  - ✅ Manage Permissions

- **Learning Access:**
  - ✅ View Courses
  - ✅ Enroll in Courses
  - ✅ Take Assessments

- **Restrictions:**
  - ❌ Cannot create courses
  - ❌ Cannot edit courses
  - ❌ Cannot delete courses

---

### 3. Instructor (Optional)
**Icon:** 📚 BookOpen  
**Type:** Instructor  
**Color:** Green  
**Description:** Create/edit courses, add content, and assessments

#### Permissions:
- **Course Creation & Management:**
  - ✅ Create Courses
  - ✅ Edit Courses
  - ✅ Delete Own Courses
  - ✅ Add Course Content
  - ✅ Create Assessments
  - ✅ Edit Assessments
  - ✅ Delete Assessments
  - ✅ Grade Submissions
  - ✅ View Student Progress

- **Content Management:**
  - ✅ Upload Content
  - ✅ Manage Media
  - ✅ Create Lessons
  - ✅ Edit Lessons
  - ✅ Delete Lessons

- **Learning Access:**
  - ✅ View Courses
  - ✅ Enroll in Courses
  - ✅ Take Assessments
  - ✅ Download Certificates

- **Profile Management:**
  - ✅ Edit Own Profile
  - ✅ Update Own Settings

- **Restrictions:**
  - ❌ Cannot invite users
  - ❌ Cannot manage other users
  - ❌ Cannot view company reports
  - ❌ Cannot manage company settings

---

### 4. System Admin
**Icon:** ⚙️ Settings  
**Type:** System  
**Color:** Red  
**Description:** Manage platform settings, approve organizations, and provide user support

#### Permissions:
- **Platform Management:**
  - ✅ Manage Platform Settings
  - ✅ Approve Organizations
  - ✅ Manage System Users
  - ✅ Provide User Support

- **Organization Management:**
  - ✅ Create Organizations
  - ✅ Edit Organizations
  - ✅ Delete Organizations
  - ✅ Suspend Organizations
  - ✅ View All Organizations

- **User Management:**
  - ✅ Manage All Users
  - ✅ View All User Data
  - ✅ Reset User Passwords
  - ✅ Suspend Users
  - ✅ Delete Users

- **System Reports:**
  - ✅ View System Reports
  - ✅ Generate System Analytics
  - ✅ Export System Data
  - ✅ View Audit Logs

- **Course Management:**
  - ✅ Manage All Courses
  - ✅ Approve Courses
  - ✅ Suspend Courses
  - ✅ View All Course Data

- **System Access:**
  - ✅ Access System Admin Panel
  - ✅ Manage System Settings
  - ✅ Manage Integrations
  - ✅ Manage System Permissions

- **Support Features:**
  - ✅ View Support Tickets
  - ✅ Manage Support Tickets
  - ✅ Access User Support

---

## Permission Categories

### Learning & Course Access
- View Courses
- Enroll in Courses
- Take Assessments
- Download Certificates
- View Own Progress
- Access Learning Path
- View Course Content
- Submit Assignments
- View Grades

### Course Creation & Management
- Create Courses
- Edit Courses
- Delete Own Courses
- Add Course Content
- Create Assessments
- Edit Assessments
- Delete Assessments
- Grade Submissions
- View Student Progress

### User Management
- Invite Users
- Manage Users
- Delete Users
- Assign Roles
- Bulk User Operations
- Manage All Users
- View All User Data
- Reset User Passwords
- Suspend Users

### Department Management
- Create Departments
- Edit Departments
- Delete Departments
- Assign Department Managers

### Course Assignment & Progress
- Assign Courses
- View All Progress
- Manage Course Assignments

### Reports & Analytics
- View Reports
- Generate Reports
- Export Data
- View Analytics
- View Dashboards
- View System Reports
- Generate System Analytics

### Organization & Company Settings
- Manage Company Settings
- Manage Billing
- Manage Integrations
- Manage Permissions
- Create Organizations
- Edit Organizations
- Approve Organizations

### System Administration
- Access Admin Panel
- Manage System Settings
- View Audit Logs
- Manage Platform Settings
- Manage System Users
- Provide User Support
- Access System Admin Panel

### Support & Content Management
- Upload Content
- Manage Media
- Create Lessons
- Edit Lessons
- Delete Lessons
- View Support Tickets
- Manage Support Tickets
- Access User Support

---

## Role Assignment Rules

### Corporate Context
- **Learner:** Default role for individual users
- **Corporate Admin:** Can be assigned by existing Corporate Admins
- **Instructor:** Can be assigned by Corporate Admins or System Admins

### System Context
- **System Admin:** Can only be assigned by other System Admins
- **System Admin:** Has access to all organizations and users

### Role Hierarchy
1. **System Admin** - Highest level, platform-wide access
2. **Corporate Admin** - Organization-level administrative access
3. **Instructor** - Course creation and content management
4. **Learner** - Basic learning access

---

## Implementation Notes

### Database Schema
- Roles are stored in the `company_members` table
- Permissions are defined in the application code
- Role changes are logged for audit purposes

### Security Considerations
- All role changes require appropriate permissions
- System Admin roles should be carefully managed
- Regular audit of role assignments is recommended

### UI/UX Considerations
- Role icons and colors are consistent across the platform
- Permission-based UI elements are shown/hidden based on user role
- Clear role descriptions help users understand their capabilities

---

## Migration from Old Roles

If migrating from a previous role system:

1. **Admin** → **Corporate Admin**
2. **Manager** → **Corporate Admin** (with reduced permissions)
3. **Employee** → **Learner**
4. **Instructor** → **Instructor** (no change)
5. **System Admin** → **System Admin** (no change)

### Permission Mapping
- Old "Admin" permissions map to "Corporate Admin"
- Old "Manager" permissions are subset of "Corporate Admin"
- Old "Employee" permissions map to "Learner"
- New "Instructor" role provides course creation capabilities
- "System Admin" maintains highest level access
