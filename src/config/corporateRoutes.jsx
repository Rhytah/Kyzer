// // src/config/corporateRoutes.js
// import React from 'react';
// import { Routes, Route, Navigate } from 'react-router-dom';
// import { 
//   Building2, 
//   Users, 
//   BookOpen, 
//   BarChart3, 
//   Settings, 
//   Plus,
//   Mail
// } from 'lucide-react';

// // Corporate Pages
// import CompanyDashboard from '@/pages/corporate/CompanyDashboard';
// import CreateOrganization from '@/pages/corporate/CreateOrganization';
// import CompanySettings from '@/pages/corporate/CompanySettings';
// import Reports from '@/pages/corporate/Reports';
// import EmployeeManagement from '@/pages/corporate/EmployeeManagement';
// import CourseAssignment from '@/components/corporate/CourseAssignment';
// import AcceptInvitation from '@/pages/corporate/AcceptInvitation';

// // Layouts and Guards
// import CorporateLayout from '@/components/layout/CorporateLayout';
// import CorporateGuard from '@/components/auth/CorporateGuard';
// import AdminGuard from '@/components/auth/AdminGuard';

// // Corporate navigation configuration
// export const corporateNavItems = [
//   {
//     id: 'dashboard',
//     label: 'Dashboard',
//     icon: Building2,
//     path: '/corporate/dashboard',
//     permission: null // Available to all corporate users
//   },
//   {
//     id: 'employees',
//     label: 'Employees',
//     icon: Users,
//     path: '/corporate/employees',
//     permission: 'invite_employees'
//   },
//   {
//     id: 'courses',
//     label: 'Course Assignment',
//     icon: BookOpen,
//     path: '/corporate/courses',
//     permission: 'assign_courses'
//   },
//   {
//     id: 'reports',
//     label: 'Reports',
//     icon: BarChart3,
//     path: '/corporate/reports',
//     permission: 'view_reports'
//   },
//   {
//     id: 'settings',
//     label: 'Settings',
//     icon: Settings,
//     path: '/corporate/settings',
//     permission: 'manage_settings'
//   }
// ];

// // Corporate routes component
// export const CorporateRoutes = () => {
//   return (
//     <Routes>
//       {/* Public corporate routes */}
//       <Route path="/create" element={<CreateOrganization />} />
//       <Route path="/invite/:token" element={<AcceptInvitation />} />
      
//       {/* Protected corporate routes */}
//       <Route element={<CorporateGuard />}>
//         <Route element={<CorporateLayout />}>
//           <Route path="/dashboard" element={<CompanyDashboard />} />
          
//           {/* Employee Management - Requires manager+ permissions */}
//           <Route element={<AdminGuard requiredPermission="invite_employees" />}>
//             <Route path="/employees" element={<EmployeeManagement />} />
//           </Route>
          
//           {/* Course Assignment - Requires manager+ permissions */}
//           <Route element={<AdminGuard requiredPermission="assign_courses" />}>
//             <Route path="/courses" element={<CourseAssignment />} />
//           </Route>
          
//           {/* Reports - Requires manager+ permissions */}
//           <Route element={<AdminGuard requiredPermission="view_reports" />}>
//             <Route path="/reports" element={<Reports />} />
//           </Route>
          
//           {/* Settings - Requires admin permissions */}
//           <Route element={<AdminGuard requiredPermission="manage_settings" />}>
//             <Route path="/settings" element={<CompanySettings />} />
//           </Route>
          
//           {/* Default redirect */}
//           <Route path="/" element={<Navigate to="/corporate/dashboard" replace />} />
//           <Route path="*" element={<Navigate to="/corporate/dashboard" replace />} />
//         </Route>
//       </Route>
//     </Routes>
//   );
// };

import { Routes, Route, Navigate } from 'react-router-dom';
import { 
  Building2, 
  Users, 
  BookOpen, 
  BarChart3, 
  Settings, 
  Plus,
  Mail
} from 'lucide-react';

// Corporate Pages
import CompanyDashboard from '@/pages/corporate/CompanyDashboard';
// import CreateOrganization from '@/pages/corporate/CreateOrganization';
import CompanySettings from '@/pages/corporate/CompanySettings';
import Reports from '@/pages/corporate/Reports';
import EmployeeManagement from '@/pages/corporate/EmployeeManagement';
// import CourseAssignment from '@/components/corporate/CourseAssignment';
import AcceptInvitation from '@/pages/corporate/AcceptInvitation';

// Layouts and Guards
import CorporateLayout from '@/components/layout/CorporateLayout';
import CorporateGuard from '@/components/auth/CorporateGuard';
// import AdminGuard from '@/components/auth/AdminGuard';

// Corporate navigation configuration
export const corporateNavItems = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: Building2,
    path: '/corporate/dashboard',
    permission: null
  },
  {
    id: 'employees',
    label: 'Employees',
    icon: Users,
    path: '/corporate/employees',
    permission: 'invite_employees'
  },
  {
    id: 'courses',
    label: 'Course Assignment',
    icon: BookOpen,
    path: '/corporate/courses',
    permission: 'assign_courses'
  },
  {
    id: 'reports',
    label: 'Reports',
    icon: BarChart3,
    path: '/corporate/reports',
    permission: 'view_reports'
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: Settings,
    path: '/corporate/settings',
    permission: 'manage_settings'
  }
];

// Corporate routes component
export const CorporateRoutes = () => {
  return (
    <Routes>
      {/* Public corporate routes */}
      {/* <Route path="/corporate/create" element={<CreateOrganization />} /> */}
      <Route path="/corporate/invite/:token" element={<AcceptInvitation />} />
      
      {/* Protected corporate routes */}
      <Route element={<CorporateGuard />}>
        <Route element={<CorporateLayout />}>
          <Route path="/corporate/dashboard" element={<CompanyDashboard />} />
          
          {/* Employee Management */}
          {/* <Route 
            path="/corporate/employees" 
            element={
              <AdminGuard requiredPermission="invite_employees">
                <EmployeeManagement />
              </AdminGuard>
            } 
          /> */}
          
          {/* Course Assignment */}
          {/* <Route 
            path="/corporate/courses" 
            element={
              <AdminGuard requiredPermission="assign_courses">
                <CourseAssignment />
              </AdminGuard>
            } 
          /> */}
          
          {/* Reports */}
          <Route 
            path="/corporate/reports" 
            element={
              <AdminGuard requiredPermission="view_reports">
                <Reports />
              </AdminGuard>
            } 
          />
          
          {/* Settings */}
          <Route 
            path="/corporate/settings" 
            element={
              <AdminGuard requiredPermission="manage_settings">
                <CompanySettings />
              </AdminGuard>
            } 
          />
          
          {/* Default redirects */}
          <Route 
            path="/corporate" 
            element={<Navigate to="/corporate/dashboard" replace />} 
          />
          <Route 
            path="/corporate/*" 
            element={<Navigate to="/corporate/dashboard" replace />} 
          />
        </Route>
      </Route>
    </Routes>
  );
};


// Quick actions configuration for dashboard
export const corporateQuickActions = [
  {
    id: 'invite_employees',
    title: 'Invite Employees',
    description: 'Add new team members',
    icon: Mail,
    action: 'openInviteModal',
    permission: 'invite_employees',
    color: 'blue'
  },
  {
    id: 'assign_courses',
    title: 'Assign Courses',
    description: 'Assign training to teams',
    icon: BookOpen,
    action: 'navigateTo',
    path: '/corporate/courses',
    permission: 'assign_courses',
    color: 'green'
  },
  {
    id: 'view_reports',
    title: 'View Reports',
    description: 'Track progress and analytics',
    icon: BarChart3,
    action: 'navigateTo',
    path: '/corporate/reports',
    permission: 'view_reports',
    color: 'purple'
  },
  {
    id: 'manage_employees',
    title: 'Manage Employees',
    description: 'View and update employee info',
    icon: Users,
    action: 'navigateTo',
    path: '/corporate/employees',
    permission: 'invite_employees',
    color: 'orange'
  }
];

// Permission definitions
export const CORPORATE_PERMISSIONS = {
  admin: [
    'invite_employees',
    'assign_courses',
    'view_reports',
    'manage_settings',
    'remove_employees',
    'update_organization'
  ],
  manager: [
    'invite_employees',
    'assign_courses',
    'view_reports'
  ],
  employee: []
};

// Helper function to check if user has permission
export const hasPermission = (userRole, permission) => {
  if (!userRole || !permission) return false;
  return CORPORATE_PERMISSIONS[userRole]?.includes(permission) || false;
};

// Organization subscription limits
export const SUBSCRIPTION_LIMITS = {
  trial: {
    maxEmployees: 50,
    features: [
      'basic_course_assignments',
      'progress_tracking',
      'email_support'
    ],
    restrictions: [
      'limited_reporting',
      'no_custom_branding',
      'basic_notifications'
    ]
  },
  annual: {
    maxEmployees: 200,
    features: [
      'all_course_features',
      'advanced_reporting',
      'priority_support',
      'custom_branding',
      'bulk_employee_management',
      'department_management'
    ],
    restrictions: []
  },
  enterprise: {
    maxEmployees: 1000,
    features: [
      'unlimited_employees',
      'custom_integrations',
      'dedicated_support',
      'on_premise_deployment',
      'advanced_analytics',
      'custom_development',
      'sso_integration'
    ],
    restrictions: []
  }
};

// Corporate feature flags
export const CORPORATE_FEATURES = {
  EMPLOYEE_INVITATIONS: 'employee_invitations',
  BULK_COURSE_ASSIGNMENT: 'bulk_course_assignment',
  DEPARTMENT_MANAGEMENT: 'department_management',
  ADVANCED_REPORTING: 'advanced_reporting',
  CUSTOM_BRANDING: 'custom_branding',
  EMAIL_NOTIFICATIONS: 'email_notifications',
  PROGRESS_TRACKING: 'progress_tracking',
  CERTIFICATE_MANAGEMENT: 'certificate_management'
};

// Check if feature is available for subscription
export const isFeatureAvailable = (subscriptionType, feature) => {
  const limits = SUBSCRIPTION_LIMITS[subscriptionType];
  if (!limits) return false;
  
  // Check if feature is explicitly listed
  const featureMap = {
    [CORPORATE_FEATURES.EMPLOYEE_INVITATIONS]: true, // Available in all plans
    [CORPORATE_FEATURES.BULK_COURSE_ASSIGNMENT]: subscriptionType !== 'trial',
    [CORPORATE_FEATURES.DEPARTMENT_MANAGEMENT]: subscriptionType !== 'trial',
    [CORPORATE_FEATURES.ADVANCED_REPORTING]: subscriptionType !== 'trial',
    [CORPORATE_FEATURES.CUSTOM_BRANDING]: subscriptionType !== 'trial',
    [CORPORATE_FEATURES.EMAIL_NOTIFICATIONS]: true,
    [CORPORATE_FEATURES.PROGRESS_TRACKING]: true,
    [CORPORATE_FEATURES.CERTIFICATE_MANAGEMENT]: true
  };
  
  return featureMap[feature] || false;
};

export default CorporateRoutes;