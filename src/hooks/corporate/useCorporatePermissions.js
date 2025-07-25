// src/hooks/corporate/useCorporatePermissions.js
import { useMemo } from 'react'
import { useAuthStore } from '@/store/authStore'
import { useCorporateStore } from '@/store/corporateStore'

export function useCorporatePermissions() {
  const { user } = useAuthStore()
  const { currentCompany, employees } = useCorporateStore()

  const userRole = useMemo(() => {
    if (!currentCompany || !user) return null
    
    // Check if user is company admin
    if (currentCompany.admin_user_id === user.id) {
      return 'admin'
    }
    
    // Check user's role in company_employees
    const employeeRecord = employees.find(emp => emp.user_id === user.id)
    return employeeRecord?.role || null
  }, [currentCompany, user, employees])

  const permissions = useMemo(() => {
    if (!userRole) return {}
    
    const basePermissions = {
      canViewDashboard: true,
      canViewReports: true,
      canViewEmployees: true,
      canInviteEmployees: false,
      canManageEmployees: false,
      canAssignCourses: false,
      canManageCompany: false,
      canViewBilling: false,
      canDeleteCompany: false,
      canManagePermissions: false
    }

    switch (userRole) {
      case 'admin':
        return {
          ...basePermissions,
          canInviteEmployees: true,
          canManageEmployees: true,
          canAssignCourses: true,
          canManageCompany: true,
          canViewBilling: true,
          canDeleteCompany: true,
          canManagePermissions: true
        }
      
      case 'manager':
        return {
          ...basePermissions,
          canInviteEmployees: true,
          canManageEmployees: true,
          canAssignCourses: true
        }
      
      case 'employee':
        return basePermissions
      
      default:
        return {}
    }
  }, [userRole])

  const hasPermission = (permission) => {
    return permissions[permission] || false
  }

  const requirePermission = (permission) => {
    if (!hasPermission(permission)) {
      throw new Error(`Access denied: Missing permission '${permission}'`)
    }
  }

  return {
    userRole,
    permissions,
    hasPermission,
    requirePermission,
    isAdmin: userRole === 'admin',
    isManager: userRole === 'manager',
    isEmployee: userRole === 'employee',
    canManage: ['admin', 'manager'].includes(userRole)
  }
}

