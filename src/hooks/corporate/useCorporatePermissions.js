// // src/hooks/corporate/useCorporatePermissions.js
// import { useMemo } from 'react'
// import { useAuthStore } from '@/store/authStore'
// import { useCorporateStore } from '@/store/corporateStore'
// import { useEmployees } from '../../store/corporateStore'

// export function useCorporatePermissions() {
//   const { user } = useAuthStore()
//   const { currentCompany, employees } = useCorporateStore()
// console.log('useCorporatePermissions', { user, currentCompany, employees }, useEmployees())
//   const userRole = useMemo(() => {
//     if (!currentCompany || !user) return null;
    
//     // Check if user is company admin
//     if (currentCompany.admin_user_id === user.id) {
//       return 'admin'
//     }
    
//     // Check user's role in company_employees
//     const employeeRecord = employees.find(emp => emp.user_id === user.id)
//     return employeeRecord?.role || null
//   }, [currentCompany, user, employees])

//   const permissions = useMemo(() => {
//     if (!userRole) return {}
    
//     const basePermissions = {
//       canViewDashboard: true,
//       canViewReports: true,
//       canViewEmployees: true,
//       canInviteEmployees: false,
//       canManageEmployees: false,
//       canAssignCourses: false,
//       canManageCompany: false,
//       canViewBilling: false,
//       canDeleteCompany: false,
//       canManagePermissions: false
//     }

//     switch (userRole) {
//       case 'admin':
//         return {
//           ...basePermissions,
//           canInviteEmployees: true,
//           canManageEmployees: true,
//           canAssignCourses: true,
//           canManageCompany: true,
//           canViewBilling: true,
//           canDeleteCompany: true,
//           canManagePermissions: true
//         }
      
//       case 'manager':
//         return {
//           ...basePermissions,
//           canInviteEmployees: true,
//           canManageEmployees: true,
//           canAssignCourses: true
//         }
      
//       case 'employee':
//         return basePermissions
      
//       default:
//         return {}
//     }
//   }, [userRole])

//   const hasPermission = (permission) => {
//     return permissions[permission] || false
//   }

//   const requirePermission = (permission) => {
//     if (!hasPermission(permission)) {
//       throw new Error(`Access denied: Missing permission '${permission}'`)
//     }
//   }

//   return {
//     userRole,
//     permissions,
//     hasPermission,
//     requirePermission,
//     isAdmin: userRole === 'admin',
//     isManager: userRole === 'manager',
//     isEmployee: userRole === 'employee',
//     canManage: ['admin', 'manager'].includes(userRole)
//   }
// }


// src/hooks/corporate/useCorporatePermissions.js
import { useMemo } from 'react'
import { useAuthStore } from '@/store/authStore'
import { useCorporateStore } from '@/store/corporateStore'

// Subscription limits configuration
const SUBSCRIPTION_LIMITS = {
  trial: {
    maxEmployees: 50,
    features: ['basic_course_assignments', 'progress_tracking', 'email_support'],
    restrictions: ['limited_reporting', 'no_custom_branding']
  },
  annual: {
    maxEmployees: 200,
    features: ['all_course_features', 'advanced_reporting', 'custom_branding', 'bulk_management'],
    restrictions: []
  },
  enterprise: {
    maxEmployees: 1000,
    features: ['unlimited_employees', 'custom_integrations', 'dedicated_support', 'advanced_analytics'],
    restrictions: []
  }
}

export function useCorporatePermissions() {
  const { user } = useAuthStore()
  const { currentCompany, employees } = useCorporateStore()

  // Enhanced user role detection
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

  // Enhanced permissions with subscription awareness
  const permissions = useMemo(() => {
    if (!userRole || !currentCompany) return {}
    
    const subscriptionLimits = SUBSCRIPTION_LIMITS[currentCompany.subscription_type] || SUBSCRIPTION_LIMITS.trial
    const isSubscriptionActive = currentCompany.is_active && 
      (!currentCompany.subscription_end_date || new Date() < new Date(currentCompany.subscription_end_date))
    
    const basePermissions = {
      // View permissions (available to all)
      canViewDashboard: true,
      canViewReports: true,
      canViewEmployees: true,
      
      // Action permissions (role-based)
      canInviteEmployees: false,
      canManageEmployees: false,
      canAssignCourses: false,
      canManageCompany: false,
      canViewBilling: false,
      canDeleteCompany: false,
      canManagePermissions: false,
      
      // Feature permissions (subscription-based)
      canUseAdvancedReporting: false,
      canCustomizeBranding: false,
      canBulkManageEmployees: false,
      canAccessAnalytics: false,
      canUseIntegrations: false
    }

    // Apply role-based permissions
    let rolePermissions = { ...basePermissions }
    
    switch (userRole) {
      case 'admin':
        rolePermissions = {
          ...rolePermissions,
          canInviteEmployees: true,
          canManageEmployees: true,
          canAssignCourses: true,
          canManageCompany: true,
          canViewBilling: true,
          canDeleteCompany: true,
          canManagePermissions: true
        }
        break
      
      case 'manager':
        rolePermissions = {
          ...rolePermissions,
          canInviteEmployees: true,
          canManageEmployees: true,
          canAssignCourses: true
        }
        break
      
      case 'employee':
        // Keep base permissions only
        break
    }

    // Apply subscription-based feature permissions
    if (isSubscriptionActive) {
      if (subscriptionLimits.features.includes('advanced_reporting')) {
        rolePermissions.canUseAdvancedReporting = true
      }
      if (subscriptionLimits.features.includes('custom_branding')) {
        rolePermissions.canCustomizeBranding = true
      }
      if (subscriptionLimits.features.includes('bulk_management')) {
        rolePermissions.canBulkManageEmployees = true
      }
      if (subscriptionLimits.features.includes('advanced_analytics')) {
        rolePermissions.canAccessAnalytics = true
      }
      if (subscriptionLimits.features.includes('custom_integrations')) {
        rolePermissions.canUseIntegrations = true
      }
    }

    return rolePermissions
  }, [userRole, currentCompany])

  // Subscription status checks
  const subscriptionStatus = useMemo(() => {
    if (!currentCompany) return null

    const isTrialExpired = currentCompany.subscription_type === 'trial' && 
      currentCompany.subscription_end_date && 
      new Date() > new Date(currentCompany.subscription_end_date)

    const isSubscriptionActive = currentCompany.is_active && 
      (!currentCompany.subscription_end_date || new Date() < new Date(currentCompany.subscription_end_date))

    const subscriptionLimits = SUBSCRIPTION_LIMITS[currentCompany.subscription_type] || SUBSCRIPTION_LIMITS.trial
    const currentEmployeeCount = employees.filter(emp => emp.status === 'active').length
    const canAddMoreEmployees = currentEmployeeCount < subscriptionLimits.maxEmployees
    const remainingEmployeeSlots = Math.max(0, subscriptionLimits.maxEmployees - currentEmployeeCount)

    return {
      type: currentCompany.subscription_type,
      isActive: isSubscriptionActive,
      isTrialExpired,
      endDate: currentCompany.subscription_end_date,
      limits: subscriptionLimits,
      currentEmployeeCount,
      maxEmployees: subscriptionLimits.maxEmployees,
      canAddMoreEmployees,
      remainingEmployeeSlots
    }
  }, [currentCompany, employees])

  // Enhanced permission checking
  const hasPermission = (permission) => {
    return permissions[permission] || false
  }

  // Feature availability checking
  const isFeatureAvailable = (feature) => {
    if (!subscriptionStatus?.isActive) return false
    return subscriptionStatus.limits.features.includes(feature)
  }

  // Employee limit checking
  const canPerformEmployeeAction = () => {
    return subscriptionStatus?.canAddMoreEmployees || false
  }

  // Permission requirement with detailed error
  const requirePermission = (permission) => {
    if (!hasPermission(permission)) {
      const errorDetails = {
        permission,
        userRole,
        subscriptionType: subscriptionStatus?.type,
        isSubscriptionActive: subscriptionStatus?.isActive
      }
      throw new Error(`Access denied: ${JSON.stringify(errorDetails)}`)
    }
  }

  // Enhanced role checks
  const roleChecks = useMemo(() => ({
    isAdmin: userRole === 'admin',
    isManager: userRole === 'manager',
    isEmployee: userRole === 'employee',
    canManage: ['admin', 'manager'].includes(userRole),
    hasAnyRole: Boolean(userRole)
  }), [userRole])

  return {
    // Role information
    userRole,
    ...roleChecks,
    
    // Permissions
    permissions,
    hasPermission,
    requirePermission,
    
    // Subscription management
    subscriptionStatus,
    isFeatureAvailable,
    canPerformEmployeeAction,
    
    // Company information
    company: currentCompany,
    
    // Quick access helpers
    canInviteEmployees: hasPermission('canInviteEmployees') && canPerformEmployeeAction(),
    canManageEmployees: hasPermission('canManageEmployees'),
    canAssignCourses: hasPermission('canAssignCourses'),
    canViewAdvancedReports: hasPermission('canUseAdvancedReporting'),
    canCustomizeBranding: hasPermission('canCustomizeBranding'),
    
    // Warning flags
    shouldShowEmployeeLimitWarning: subscriptionStatus?.remainingEmployeeSlots <= 5,
    shouldShowUpgradePrompt: !subscriptionStatus?.isActive || subscriptionStatus?.isTrialExpired,
    shouldShowTrialExpiring: subscriptionStatus?.type === 'trial' && 
      subscriptionStatus?.endDate && 
      new Date(subscriptionStatus.endDate) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
  }
}

