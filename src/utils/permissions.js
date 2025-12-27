// src/utils/permissions.js
// Permission Utility Functions for RBAC

import { PERMISSIONS, ROLES, ROLE_PERMISSIONS } from '@/constants/permissions';

/**
 * Check if a user has a specific permission
 * @param {Object} user - User object with role and permissions
 * @param {string} permission - Permission to check (use PERMISSIONS constants)
 * @returns {boolean}
 */
export const hasPermission = (user, permission) => {
  if (!user) return false;

  // System admins have all permissions
  if (user.role === ROLES.SYSTEM_ADMIN || user.role === 'admin') {
    return true;
  }

  // Check role-based permissions
  const rolePermissions = ROLE_PERMISSIONS[user.role] || [];
  if (rolePermissions.includes(permission)) {
    return true;
  }

  // Check custom permission overrides (from organization_members.permissions)
  if (user.permissions && Array.isArray(user.permissions)) {
    return user.permissions.includes(permission);
  }

  // Check if permissions is an object with boolean values
  if (user.permissions && typeof user.permissions === 'object') {
    return user.permissions[permission] === true;
  }

  return false;
};

/**
 * Check if a user has ALL of the specified permissions
 * @param {Object} user - User object
 * @param {Array<string>} permissions - Array of permissions to check
 * @returns {boolean}
 */
export const hasAllPermissions = (user, permissions) => {
  if (!user || !permissions || !Array.isArray(permissions)) return false;
  return permissions.every(permission => hasPermission(user, permission));
};

/**
 * Check if a user has ANY of the specified permissions
 * @param {Object} user - User object
 * @param {Array<string>} permissions - Array of permissions to check
 * @returns {boolean}
 */
export const hasAnyPermission = (user, permissions) => {
  if (!user || !permissions || !Array.isArray(permissions)) return false;
  return permissions.some(permission => hasPermission(user, permission));
};

/**
 * Check if a user has a specific role
 * @param {Object} user - User object
 * @param {string} role - Role to check (use ROLES constants)
 * @returns {boolean}
 */
export const hasRole = (user, role) => {
  if (!user || !role) return false;
  return user.role === role;
};

/**
 * Check if a user has ANY of the specified roles
 * @param {Object} user - User object
 * @param {Array<string>} roles - Array of roles to check
 * @returns {boolean}
 */
export const hasAnyRole = (user, roles) => {
  if (!user || !roles || !Array.isArray(roles)) return false;
  return roles.includes(user.role);
};

/**
 * Check if user is a corporate user (has organization affiliation)
 * @param {Object} user - User object
 * @returns {boolean}
 */
export const isCorporateUser = (user) => {
  if (!user) return false;
  return user.account_type === 'corporate' || !!user.organization_id;
};

/**
 * Check if user is an admin (corporate or system)
 * @param {Object} user - User object
 * @returns {boolean}
 */
export const isAdmin = (user) => {
  return hasAnyRole(user, [
    ROLES.SYSTEM_ADMIN,
    ROLES.CORPORATE_ADMIN,
    ROLES.ADMIN,
  ]);
};

/**
 * Check if user is a system administrator
 * @param {Object} user - User object
 * @returns {boolean}
 */
export const isSystemAdmin = (user) => {
  return hasRole(user, ROLES.SYSTEM_ADMIN);
};

/**
 * Check if user is an instructor
 * @param {Object} user - User object
 * @returns {boolean}
 */
export const isInstructor = (user) => {
  return hasRole(user, ROLES.INSTRUCTOR);
};

/**
 * Check if user can manage courses
 * @param {Object} user - User object
 * @returns {boolean}
 */
export const canManageCourses = (user) => {
  return hasAnyPermission(user, [
    PERMISSIONS.MANAGE_COURSES,
    PERMISSIONS.CREATE_COURSES,
    PERMISSIONS.EDIT_COURSES,
  ]);
};

/**
 * Check if user can manage a specific course (ownership check)
 * @param {Object} user - User object
 * @param {Object} course - Course object with created_by field
 * @returns {boolean}
 */
export const canManageThisCourse = (user, course) => {
  if (!user || !course) return false;

  // System admins can manage any course
  if (isSystemAdmin(user)) return true;

  // Course creator can manage their own course
  if (course.created_by === user.id) return true;

  // Check if user has general course management permission
  return hasPermission(user, PERMISSIONS.MANAGE_COURSES);
};

/**
 * Check if user can manage users/employees
 * @param {Object} user - User object
 * @returns {boolean}
 */
export const canManageUsers = (user) => {
  return hasAnyPermission(user, [
    PERMISSIONS.MANAGE_USERS,
    PERMISSIONS.INVITE_USERS,
  ]);
};

/**
 * Check if user can view reports
 * @param {Object} user - User object
 * @returns {boolean}
 */
export const canViewReports = (user) => {
  return hasPermission(user, PERMISSIONS.VIEW_REPORTS);
};

/**
 * Get all permissions for a user
 * @param {Object} user - User object
 * @returns {Array<string>} - Array of permission strings
 */
export const getUserPermissions = (user) => {
  if (!user) return [];

  // System admins have all permissions
  if (isSystemAdmin(user)) {
    return Object.values(PERMISSIONS);
  }

  // Get role-based permissions
  const rolePermissions = ROLE_PERMISSIONS[user.role] || [];

  // Merge with custom permissions
  let customPermissions = [];
  if (user.permissions) {
    if (Array.isArray(user.permissions)) {
      customPermissions = user.permissions;
    } else if (typeof user.permissions === 'object') {
      customPermissions = Object.keys(user.permissions).filter(
        key => user.permissions[key] === true
      );
    }
  }

  // Combine and deduplicate
  return [...new Set([...rolePermissions, ...customPermissions])];
};

/**
 * Check if a user can perform an action on a resource
 * Useful for more complex permission logic
 * @param {Object} user - User object
 * @param {string} action - Action to perform
 * @param {Object} resource - Resource object (course, user, etc.)
 * @returns {boolean}
 */
export const canPerformAction = (user, action, resource = null) => {
  if (!user || !action) return false;

  // System admins can do anything
  if (isSystemAdmin(user)) return true;

  // Map common actions to permissions
  const actionPermissionMap = {
    // Course actions
    'create_course': PERMISSIONS.CREATE_COURSES,
    'edit_course': PERMISSIONS.EDIT_COURSES,
    'delete_course': PERMISSIONS.DELETE_COURSES,
    'publish_course': PERMISSIONS.PUBLISH_COURSES,
    'add_lesson': PERMISSIONS.ADD_LESSONS,
    'edit_lesson': PERMISSIONS.EDIT_LESSONS,
    'delete_lesson': PERMISSIONS.DELETE_LESSONS,
    'add_module': PERMISSIONS.ADD_MODULES,
    'edit_module': PERMISSIONS.EDIT_MODULES,
    'delete_module': PERMISSIONS.DELETE_MODULES,
    'add_quiz': PERMISSIONS.ADD_QUIZZES,
    'edit_quiz': PERMISSIONS.EDIT_QUIZZES,
    'delete_quiz': PERMISSIONS.DELETE_QUIZZES,
    'manage_resources': PERMISSIONS.MANAGE_RESOURCES,

    // User actions
    'invite_user': PERMISSIONS.INVITE_USERS,
    'manage_user': PERMISSIONS.MANAGE_USERS,
    'delete_user': PERMISSIONS.DELETE_USERS,
    'assign_role': PERMISSIONS.ASSIGN_ROLES,

    // Company actions
    'manage_settings': PERMISSIONS.MANAGE_COMPANY_SETTINGS,
    'view_reports': PERMISSIONS.VIEW_REPORTS,
    'assign_course': PERMISSIONS.ASSIGN_COURSES,
  };

  const permission = actionPermissionMap[action];
  if (!permission) {
    console.warn(`Unknown action: ${action}`);
    return false;
  }

  // Check basic permission
  if (!hasPermission(user, permission)) {
    return false;
  }

  // Additional resource-specific checks
  if (resource) {
    // Course ownership check
    if (resource.created_by && action.includes('course')) {
      return resource.created_by === user.id || isSystemAdmin(user);
    }

    // Organization membership check
    if (resource.organization_id && isCorporateUser(user)) {
      return resource.organization_id === user.organization_id;
    }
  }

  return true;
};

/**
 * Get a human-readable description of a permission
 * @param {string} permission - Permission constant
 * @returns {string}
 */
export const getPermissionDescription = (permission) => {
  const descriptions = {
    [PERMISSIONS.INVITE_USERS]: 'Invite new users to the organization',
    [PERMISSIONS.MANAGE_USERS]: 'Manage user accounts and profiles',
    [PERMISSIONS.DELETE_USERS]: 'Remove users from the organization',
    [PERMISSIONS.CREATE_COURSES]: 'Create new courses',
    [PERMISSIONS.EDIT_COURSES]: 'Edit existing courses',
    [PERMISSIONS.DELETE_COURSES]: 'Delete courses',
    [PERMISSIONS.PUBLISH_COURSES]: 'Publish or unpublish courses',
    [PERMISSIONS.MANAGE_RESOURCES]: 'Manage course resources and attachments',
    [PERMISSIONS.VIEW_REPORTS]: 'View organization reports and analytics',
    [PERMISSIONS.MANAGE_COMPANY_SETTINGS]: 'Manage company settings and configuration',
    [PERMISSIONS.ASSIGN_COURSES]: 'Assign courses to users or departments',
    // Add more descriptions as needed
  };

  return descriptions[permission] || permission;
};

/**
 * Debug helper: Log all permissions for a user
 * @param {Object} user - User object
 */
export const debugUserPermissions = (user) => {
  if (!user) {
    console.log('No user provided');
    return;
  }

  console.group(`🔐 Permissions for ${user.email || user.id}`);
  console.log('Role:', user.role);
  console.log('Account Type:', user.account_type);
  console.log('Organization:', user.organization_id);
  console.log('\nPermissions:');

  const permissions = getUserPermissions(user);
  permissions.forEach(perm => {
    console.log(`  ✓ ${perm}`);
  });

  console.log(`\nTotal: ${permissions.length} permissions`);
  console.groupEnd();
};

/**
 * Check if user has permission with detailed logging (for debugging)
 * @param {Object} user - User object
 * @param {string} permission - Permission to check
 * @param {boolean} verbose - Whether to log details
 * @returns {boolean}
 */
export const hasPermissionDebug = (user, permission, verbose = true) => {
  const result = hasPermission(user, permission);

  if (verbose) {
    console.log(`🔐 Permission Check: ${permission}`);
    console.log(`   User: ${user?.email || 'unknown'}`);
    console.log(`   Role: ${user?.role || 'none'}`);
    console.log(`   Result: ${result ? '✅ GRANTED' : '❌ DENIED'}`);
  }

  return result;
};

// Export all functions as default object as well
export default {
  hasPermission,
  hasAllPermissions,
  hasAnyPermission,
  hasRole,
  hasAnyRole,
  isCorporateUser,
  isAdmin,
  isSystemAdmin,
  isInstructor,
  canManageCourses,
  canManageThisCourse,
  canManageUsers,
  canViewReports,
  getUserPermissions,
  canPerformAction,
  getPermissionDescription,
  debugUserPermissions,
  hasPermissionDebug,
};
