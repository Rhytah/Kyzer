// // src/components/auth/CorporateGuard.jsx
// import { useEffect, useState } from 'react'
// import { Navigate, useLocation } from 'react-router-dom'
// import { Building2, UserPlus, AlertCircle, Clock } from 'lucide-react'
// import { useOrganization } from '@/hooks/corporate/useOrganization'
// import { useCorporatePermissions } from '@/hooks/corporate/useCorporatePermissions'
// import { useAuthStore } from '@/store/authStore'
// import LoadingSpinner from '@/components/ui/LoadingSpinner'
// import Card from '@/components/ui/Card'
// import Button from '@/components/ui/Button'

// export default function CorporateGuard({ children, requirePermission = null }) {
//   const { user } = useAuthStore()
//   const { company, loading: companyLoading } = useOrganization()
//   const { hasPermission, userRole, permissions } = useCorporatePermissions()
//   const location = useLocation()
  
//   const [checkingAccess, setCheckingAccess] = useState(true)

//   useEffect(() => {
//     // Give time for corporate data to load
//     const timer = setTimeout(() => {
//       setCheckingAccess(false)
//     }, 2000)

//     return () => clearTimeout(timer)
//   }, [])

//   // Show loading while checking access or company data is loading
//   if (checkingAccess || companyLoading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-background-light">
//         <div className="text-center">
//           <LoadingSpinner size="lg" />
//           <p className="text-text-light mt-4">Checking company access...</p>
//         </div>
//       </div>
//     )
//   }

//   // No company association - show setup or invitation needed
//   if (!company) {
//     return <CompanyAccessNeeded />
//   }

//   // Check specific permission if required
//   if (requirePermission && !hasPermission(requirePermission)) {
//     return <InsufficientPermissions requiredPermission={requirePermission} userRole={userRole} />
//   }

//   // Company subscription check
//   const subscriptionStatus = company.subscription_status
//   if (subscriptionStatus === 'expired') {
//     return <SubscriptionExpired company={company} />
//   }

//   // All checks passed - render children
//   return children
// }

// // Component shown when user has no company association
// function CompanyAccessNeeded() {
//   const location = useLocation()
  
//   return (
//     <div className="min-h-screen flex items-center justify-center bg-background-light px-4">
//       <Card className="max-w-2xl w-full">
//         <div className="p-8 text-center">
//           <Building2 className="w-16 h-16 text-text-muted mx-auto mb-6" />
          
//           <h1 className="text-2xl font-bold text-text-dark mb-4">
//             Corporate Access Required
//           </h1>
          
//           <p className="text-text-light mb-6">
//             You need to be part of a company to access this area. You can either create 
//             a new company account or join an existing one through an invitation.
//           </p>

//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
//             {/* Create Company Option */}
//             <div className="p-6 border border-background-dark rounded-lg hover:bg-background-light transition-colors">
//               <Building2 className="w-8 h-8 text-primary-default mx-auto mb-4" />
//               <h3 className="font-semibold text-text-dark mb-2">Create Company</h3>
//               <p className="text-sm text-text-light mb-4">
//                 Start your own corporate learning platform and invite your team members.
//               </p>
//               <Button className="w-full">
//                 Create Company Account
//               </Button>
//             </div>

//             {/* Join Company Option */}
//             <div className="p-6 border border-background-dark rounded-lg hover:bg-background-light transition-colors">
//               <UserPlus className="w-8 h-8 text-success-default mx-auto mb-4" />
//               <h3 className="font-semibold text-text-dark mb-2">Join Company</h3>
//               <p className="text-sm text-text-light mb-4">
//                 Have an invitation? Use it to join your company's learning platform.
//               </p>
//               <Button variant="secondary" className="w-full">
//                 Enter Invitation Code
//               </Button>
//             </div>
//           </div>

//           <div className="text-center">
//             <Button
//               variant="ghost"
//               onClick={() => window.history.back()}
//             >
//               ← Go Back
//             </Button>
//           </div>
//         </div>
//       </Card>
//     </div>
//   )
// }

// // Component shown when user lacks required permissions
// function InsufficientPermissions({ requiredPermission, userRole }) {
//   const permissionLabels = {
//     canInviteEmployees: 'invite employees',
//     canManageEmployees: 'manage employees',
//     canAssignCourses: 'assign courses',
//     canManageCompany: 'manage company settings',
//     canViewBilling: 'view billing information',
//     canDeleteCompany: 'delete company',
//     canManagePermissions: 'manage permissions'
//   }

//   const permissionLabel = permissionLabels[requiredPermission] || requiredPermission

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-background-light px-4">
//       <Card className="max-w-md w-full">
//         <div className="p-8 text-center">
//           <AlertCircle className="w-16 h-16 text-warning-default mx-auto mb-6" />
          
//           <h1 className="text-2xl font-bold text-text-dark mb-4">
//             Access Denied
//           </h1>
          
//           <p className="text-text-light mb-6">
//             Your current role (<span className="font-medium capitalize">{userRole}</span>) doesn't have 
//             permission to {permissionLabel}.
//           </p>

//           <div className="p-4 bg-warning-light border border-warning-default rounded-lg mb-6">
//             <p className="text-sm text-warning-default">
//               Contact your company administrator to request the necessary permissions.
//             </p>
//           </div>

//           <div className="space-y-3">
//             <Button
//               variant="ghost"
//               onClick={() => window.history.back()}
//               className="w-full"
//             >
//               ← Go Back
//             </Button>
            
//             <Button
//               variant="secondary"
//               onClick={() => window.location.href = '/company/dashboard'}
//               className="w-full"
//             >
//               Company Dashboard
//             </Button>
//           </div>
//         </div>
//       </Card>
//     </div>
//   )
// }

// // Component shown when company subscription has expired
// function SubscriptionExpired({ company }) {
//   const daysExpired = Math.floor(
//     (new Date() - new Date(company.subscription_expires_at)) / (1000 * 60 * 60 * 24)
//   )

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-background-light px-4">
//       <Card className="max-w-md w-full">
//         <div className="p-8 text-center">
//           <Clock className="w-16 h-16 text-error-default mx-auto mb-6" />
          
//           <h1 className="text-2xl font-bold text-text-dark mb-4">
//             Subscription Expired
//           </h1>
          
//           <p className="text-text-light mb-6">
//             Your company's subscription expired {daysExpired} day{daysExpired !== 1 ? 's' : ''} ago. 
//             Please renew your subscription to continue accessing corporate features.
//           </p>

//           <div className="p-4 bg-error-light border border-error-default rounded-lg mb-6">
//             <p className="text-sm text-error-default">
//               <strong>Limited Access:</strong> You can only view existing data. 
//               No new courses can be assigned or completed until subscription is renewed.
//             </p>
//           </div>

//           <div className="space-y-3">
//             <Button className="w-full">
//               Renew Subscription
//             </Button>
            
//             <Button
//               variant="secondary"
//               onClick={() => window.location.href = '/company/settings'}
//               className="w-full"
//             >
//               Company Settings
//             </Button>
            
//             <Button
//               variant="ghost"
//               onClick={() => window.location.href = '/dashboard'}
//               className="w-full"
//             >
//               Personal Dashboard
//             </Button>
//           </div>
//         </div>
//       </Card>
//     </div>
//   )
// }

// // Permission-based route wrapper for specific features
// export function RequirePermission({ permission, fallback = null, children }) {
//   const { hasPermission } = useCorporatePermissions()
  
//   if (!hasPermission(permission)) {
//     if (fallback) return fallback
    
//     return (
//       <div className="p-6 text-center">
//         <AlertCircle className="w-12 h-12 text-warning-default mx-auto mb-4" />
//         <h3 className="text-lg font-semibold text-text-dark mb-2">Permission Required</h3>
//         <p className="text-text-light">
//           You don't have permission to access this feature.
//         </p>
//       </div>
//     )
//   }
  
//   return children
// }

// // Role-based component wrapper
// export function RequireRole({ role, fallback = null, children }) {
//   const { userRole } = useCorporatePermissions()
  
//   const allowedRoles = Array.isArray(role) ? role : [role]
  
//   if (!allowedRoles.includes(userRole)) {
//     if (fallback) return fallback
    
//     return (
//       <div className="p-6 text-center">
//         <AlertCircle className="w-12 h-12 text-warning-default mx-auto mb-4" />
//         <h3 className="text-lg font-semibold text-text-dark mb-2">Role Required</h3>
//         <p className="text-text-light">
//           This feature is only available to {allowedRoles.join(' or ')} users.
//         </p>
//       </div>
//     )
//   }
  
//   return children
// }

// src/components/auth/CorporateGuard.jsx
import { useEffect } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { useCorporateStore } from '@/store/corporateStore'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { Building2, UserPlus, AlertCircle } from 'lucide-react'

export default function CorporateGuard({ 
  children, 
  requirePermission = null,
  redirectTo = null 
}) {
  const { user } = useAuthStore()
  const { 
    currentCompany, 
    permissions, 
    loading, 
    error,
    fetchCurrentCompany,
    fetchPermissions 
  } = useCorporateStore()
  const location = useLocation()

  useEffect(() => {
    if (user && !currentCompany && !loading) {
      fetchCurrentCompany()
    }
  }, [user, currentCompany, loading, fetchCurrentCompany])

  useEffect(() => {
    if (currentCompany && !permissions && !loading) {
      fetchPermissions()
    }
  }, [currentCompany, permissions, loading, fetchPermissions])

  // Show loading spinner while checking company status
  if (loading && !currentCompany) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  // If this is just a redirect component (no children), handle redirect
  if (!children && redirectTo) {
    if (!currentCompany) {
      return <Navigate to="/dashboard" replace />
    }
    return <Navigate to={redirectTo} replace />
  }

  // User doesn't have a company - show setup or redirect
  if (!currentCompany) {
    // If user is on a company route but has no company, redirect to dashboard
    if (location.pathname.startsWith('/company')) {
      return <Navigate to="/dashboard" state={{ 
        message: 'You need to set up a company account to access corporate features.' 
      }} replace />
    }
    
    return <NoCompanyAccess />
  }

  // Check specific permission if required
  if (requirePermission && permissions && !permissions[requirePermission]) {
    return <InsufficientPermissions permission={requirePermission} />
  }

  // Show error if there's an issue loading company data
  if (error) {
    return <CompanyLoadError error={error} />
  }

  // All checks passed - render children
  return children
}

// Component shown when user doesn't have company access
function NoCompanyAccess() {
  const location = useLocation()
  
  return (
    <div className="max-w-2xl mx-auto mt-12">
      <Card className="text-center">
        <Building2 className="w-16 h-16 text-text-muted mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-text-dark mb-3">
          Corporate Access Required
        </h2>
        <p className="text-text-light mb-6">
          You need to be part of a company account to access this feature.
        </p>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button 
              variant="primary"
              onClick={() => window.location.href = '/company/setup'}
            >
              <Building2 className="w-4 h-4 mr-2" />
              Create Company Account
            </Button>
            
            <Button 
              variant="secondary"
              onClick={() => window.location.href = '/dashboard'}
            >
              Back to Dashboard
            </Button>
          </div>
          
          <div className="pt-4 border-t border-background-dark">
            <p className="text-sm text-text-light mb-2">
              Been invited to join a company?
            </p>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => window.location.href = '/accept-invitation'}
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Accept Invitation
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}

// Component shown when user lacks specific permissions
function InsufficientPermissions({ permission }) {
  const permissionMessages = {
    canViewEmployees: 'view and manage employees',
    canViewReports: 'access company reports',
    canManageCompany: 'manage company settings',
    canAssignCourses: 'assign courses to employees',
    canCreateCourses: 'create and edit courses'
  }

  const message = permissionMessages[permission] || 'access this feature'

  return (
    <div className="max-w-lg mx-auto mt-12">
      <Card className="text-center">
        <AlertCircle className="w-12 h-12 text-warning-default mx-auto mb-4" />
        <h2 className="text-xl font-bold text-text-dark mb-3">
          Access Restricted
        </h2>
        <p className="text-text-light mb-6">
          You don't have permission to {message}. Please contact your company administrator.
        </p>
        
        <div className="space-y-3">
          <Button 
            variant="secondary"
            onClick={() => window.history.back()}
          >
            Go Back
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => window.location.href = '/company/dashboard'}
          >
            Company Dashboard
          </Button>
        </div>
      </Card>
    </div>
  )
}

// Component shown when there's an error loading company data
function CompanyLoadError({ error }) {
  const { fetchCurrentCompany } = useCorporateStore()
  
  return (
    <div className="max-w-lg mx-auto mt-12">
      <Card className="text-center">
        <AlertCircle className="w-12 h-12 text-error-default mx-auto mb-4" />
        <h2 className="text-xl font-bold text-text-dark mb-3">
          Unable to Load Company Data
        </h2>
        <p className="text-text-light mb-6">
          {error || 'There was an error loading your company information.'}
        </p>
        
        <div className="space-y-3">
          <Button 
            variant="primary"
            onClick={() => fetchCurrentCompany()}
          >
            Try Again
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => window.location.href = '/dashboard'}
          >
            Go to Dashboard
          </Button>
        </div>
      </Card>
    </div>
  )
}