// // src/hooks/corporate/useCorporatePermissions.js
// import { useMemo } from 'react'
// import { useAuthStore } from '@/store/authStore'
// import { useCorporateStore } from '@/store/corporateStore'
// import { useEmployees } from '../../store/corporateStore'

// export function useCorporatePermissions() {
//   const { user } = useAuthStore()
//   const { currentCompany, employees } = useCorporateStore()
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
import { useMemo, useEffect, useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { useCorporateStore } from '@/store/corporateStore'
import { supabase } from '@/lib/supabase'

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
  const authStore = useAuthStore()
  const { user: storeUser } = authStore
  const { currentCompany, employees } = useCorporateStore()
  const [user, setUser] = useState(storeUser)
  const [userFetched, setUserFetched] = useState(false)
  
  // Try to get user from auth store, or fetch directly from Supabase if not available
  // Only run once on mount, not on every store update
  useEffect(() => {
    // If we already have a user from the store, use it
    if (storeUser?.id) {
      setUser(storeUser)
      setUserFetched(true)
      return
    }
    
    // Only fetch if we haven't fetched yet and don't have a user
    if (userFetched) return
    
    const getUser = async () => {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser()
        if (authUser) {
          setUser(authUser)
          setUserFetched(true)
          // Only update store if user actually changed
          if (authStore.user?.id !== authUser.id && authStore.setUser) {
            authStore.setUser(authUser)
          }
        } else {
          setUserFetched(true)
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error fetching user from Supabase:', error)
        setUserFetched(true)
      }
    }
    
    getUser()
    
    // Listen to auth state changes (only set up once)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUser(prevUser => {
          // Only update if user actually changed
          if (prevUser?.id !== session.user.id) {
            // Only update store if user actually changed
            if (authStore.user?.id !== session.user.id && authStore.setUser) {
              authStore.setUser(session.user)
            }
            return session.user
          }
          return prevUser
        })
      } else {
        setUser(prevUser => {
          if (prevUser) {
            return null
          }
          return prevUser
        })
      }
    })
    
    return () => {
      subscription.unsubscribe()
    }
  }, []) // Empty dependency array - only run once on mount
  
  // Sync with store user changes (but don't trigger profile fetch)
  useEffect(() => {
    if (storeUser?.id && storeUser.id !== user?.id) {
      setUser(storeUser)
    } else if (!storeUser && user) {
      setUser(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storeUser?.id]) // Only depend on user ID, not entire store or local user

  // Enhanced user role detection
  const userRole = useMemo(() => {
    if (!currentCompany || !user) {
      return null
    }
    
    // Priority 1: Check if user is organization owner (creator)
    // This is the most reliable check - if they created the company, they're the owner
    if (currentCompany.created_by === user.id) {
      return 'owner'
    }
    
    // Priority 2: Check user's role in organization_members table
    const employeeRecord = employees.find(emp => emp.user_id === user.id)
    if (employeeRecord?.role === 'owner') {
      return 'owner'
    }
    
    // Priority 3: Check if user is company admin (legacy)
    if (currentCompany.admin_user_id === user.id) {
      return 'admin'
    }
    
    // Return the role from employee record, or null
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
      case 'owner':
        // Organization owner has all permissions, including ability to delete organization
        rolePermissions = {
          ...rolePermissions,
          canInviteEmployees: true,
          canManageEmployees: true,
          canAssignCourses: true,
          canManageCompany: true,
          canViewBilling: true,
          canDeleteCompany: true,
          canManagePermissions: true,
          canTransferOwnership: true, // Only owner can transfer ownership
          canChangeOwnerRole: false // Owner role cannot be changed
        }
        break
      
      case 'admin':
      case 'corporate_admin':
      case 'system_admin':
        rolePermissions = {
          ...rolePermissions,
          canInviteEmployees: true,
          canManageEmployees: true,
          canAssignCourses: true,
          canManageCompany: true,
          canViewBilling: true,
          canDeleteCompany: false, // Only owner can delete
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
      case 'learner':
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

  // Enhanced permission checking (owner bypasses all checks)
  const hasPermission = (permission) => {
    // Owner has all permissions - always return true
    if (userRole === 'owner') {
      return true;
    }
    return permissions[permission] || false
  }

  // Feature availability checking (owner bypasses)
  const isFeatureAvailable = (feature) => {
    // Owner has access to all features regardless of subscription
    if (userRole === 'owner') {
      return true;
    }
    if (!subscriptionStatus?.isActive) return false
    return subscriptionStatus.limits.features.includes(feature)
  }

  // Employee limit checking (owner bypasses)
  const canPerformEmployeeAction = () => {
    // Owner can always add employees regardless of subscription limits
    if (userRole === 'owner') {
      return true;
    }
    return subscriptionStatus?.canAddMoreEmployees || false
  }

  // Permission requirement with detailed error (owner bypasses)
  const requirePermission = (permission) => {
    // Owner bypasses all permission checks
    if (userRole === 'owner') {
      return;
    }
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
    isOwner: userRole === 'owner',
    isAdmin: userRole === 'admin' || userRole === 'corporate_admin',
    isManager: userRole === 'manager',
    isEmployee: userRole === 'employee' || userRole === 'learner',
    canManage: ['owner', 'admin', 'corporate_admin', 'manager'].includes(userRole),
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
    
    // Quick access helpers (owner bypasses all checks)
    canInviteEmployees: (userRole === 'owner') || (hasPermission('canInviteEmployees') && canPerformEmployeeAction()),
    canManageEmployees: (userRole === 'owner') || hasPermission('canManageEmployees'),
    canAssignCourses: (userRole === 'owner') || hasPermission('canAssignCourses'),
    canViewAdvancedReports: (userRole === 'owner') || hasPermission('canUseAdvancedReporting'),
    canCustomizeBranding: (userRole === 'owner') || hasPermission('canCustomizeBranding'),
    
    // Warning flags
    shouldShowEmployeeLimitWarning: subscriptionStatus?.remainingEmployeeSlots <= 5,
    shouldShowUpgradePrompt: !subscriptionStatus?.isActive || subscriptionStatus?.isTrialExpired,
    shouldShowTrialExpiring: subscriptionStatus?.type === 'trial' && 
      subscriptionStatus?.endDate && 
      new Date(subscriptionStatus.endDate) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
  }
}

