// src/hooks/courses/useCoursePermissions.js
import { useMemo } from 'react';
import { useAuth } from '@/hooks/auth/useAuth';
import { useCorporate } from '@/hooks/corporate/useCorporate';

export function useCoursePermissions() {
  const { user, loading: authLoading } = useAuth();
  const { 
    role, 
    isCorporateUser, 
    permissions,
    loading: corporateLoading 
  } = useCorporate();

  const coursePermissions = useMemo(() => {
    if (authLoading || corporateLoading || !user) {
      return {
        canManageCourses: false,
        canCreateCourses: false,
        canEditCourses: false,
        canDeleteCourses: false,
        canViewCourseManagement: false,
        loading: true
      };
    }

    // System admins have all permissions
    if (role === 'system_admin') {
      return {
        canManageCourses: true,
        canCreateCourses: true,
        canEditCourses: true,
        canDeleteCourses: true,
        canViewCourseManagement: true,
        loading: false
      };
    }

    // Corporate admins can manage courses
    if (isCorporateUser && role === 'admin') {
      return {
        canManageCourses: true,
        canCreateCourses: false, // Corporate admins assign courses, don't create them
        canEditCourses: false,
        canDeleteCourses: false,
        canViewCourseManagement: true,
        loading: false
      };
    }

    // Instructors can manage courses
    if (role === 'instructor') {
      return {
        canManageCourses: true,
        canCreateCourses: true,
        canEditCourses: true,
        canDeleteCourses: true,
        canViewCourseManagement: true,
        loading: false
      };
    }

    // Check specific permissions from corporate store
    if (permissions) {
      return {
        canManageCourses: permissions.canManageCourses || false,
        canCreateCourses: permissions.canCreateCourses || false,
        canEditCourses: permissions.canEditCourses || false,
        canDeleteCourses: permissions.canDeleteCourses || false,
        canViewCourseManagement: permissions.canManageCourses || false,
        loading: false
      };
    }

    // Default: no permissions
    return {
      canManageCourses: false,
      canCreateCourses: false,
      canEditCourses: false,
      canDeleteCourses: false,
      canViewCourseManagement: false,
      loading: false
    };
  }, [user, role, isCorporateUser, permissions, authLoading, corporateLoading]);

  return coursePermissions;
}
