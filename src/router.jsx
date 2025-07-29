// // src/router.jsx - Fixed version
// import { createBrowserRouter, Navigate } from "react-router-dom";
// import Layout from "@/components/layout/Layout";
// import ProtectedRoute from "@/components/auth/ProtectedRoute";
// import CorporateGuard from "@/components/auth/CorporateGuard";

// // Public Pages
// import Home from "@/pages/public/Home";
// import About from "@/pages/public/About";
// import Pricing from "@/pages/public/Pricing";
// import Contact from "@/pages/public/Contact";

// // Auth Pages
// import Login from "@/pages/auth/Login";
// import Signup from "@/pages/auth/SignUp";
// import ResetPassword from "@/pages/auth/ResetPassword";
// import VerifyEmail from "@/pages/auth/VerifyEmail";
// import ForgotPassword from "@/pages/auth/ForgotPassword";

// // Dashboard Pages
// import Dashboard from "@/pages/dashboard/Dashboard";
// import Profile from "@/pages/dashboard/Profile";
// import Settings from "@/pages/dashboard/Settings";

// // Course Pages
// import CourseCatalog from "@/pages/courses/CourseCatalog";
// import CourseDetail from "@/pages/courses/CourseDetail";
// import LessonView from "@/pages/courses/LessonView";
// import MyCourses from "@/pages/courses/MyCourses";
// import CourseCompletion from "@/pages/courses/CourseCompletion";

// // Corporate Pages
// import CompanyDashboard from "@/pages/corporate/CompanyDashboard";
// import EmployeeManagement from "@/pages/corporate/EmployeeManagement";
// import Reports from "@/pages/corporate/Reports";
// import CompanySettings from "@/pages/corporate/CompanySettings";
// import AcceptInvitation from "@/pages/corporate/AcceptInvitation";

// // Error Pages
// import NotFound from "@/components/common/NotFound";
// import ErrorBoundary from "@/components/common/ErrorBoundary";

// export const router = createBrowserRouter([
//   {
//     path: "/",
//     element: <Layout />,
//     errorElement: <ErrorBoundary />,
//     children: [
//       // Public Routes
//       {
//         index: true,
//         element: <Home />,
//       },
//       {
//         path: "about",
//         element: <About />,
//       },
//       {
//         path: "pricing",
//         element: <Pricing />,
//       },
//       {
//         path: "contact",
//         element: <Contact />,
//       },

//       // Auth Routes
//       {
//         path: "login",
//         element: <Login />,
//       },
//       {
//         path: "signup",
//         element: <Signup />,
//       },
//       {
//         path: "reset-password",
//         element: <ResetPassword />,
//       },
//       {
//         path: "/forgot-password",
//         element: <ForgotPassword />,
//       },
//       {
//         path: "verify-email",
//         element: <VerifyEmail />,
//       },

//       // Accept invitation (special route)
//       {
//         path: "accept-invitation",
//         element: (
//           <ProtectedRoute>
//             <AcceptInvitation />
//           </ProtectedRoute>
//         ),
//       },

//       // Protected Individual User Routes
//       {
//         path: "dashboard",
//         element: (
//           <ProtectedRoute>
//             <Dashboard />
//           </ProtectedRoute>
//         ),
//       },
//       {
//         path: "profile",
//         element: (
//           <ProtectedRoute>
//             <Profile />
//           </ProtectedRoute>
//         ),
//       },
//       {
//         path: "settings",
//         element: (
//           <ProtectedRoute>
//             <Settings />
//           </ProtectedRoute>
//         ),
//       },

//       // Course Routes
//       {
//         path: "courses",
//         children: [
//           {
//             index: true,
//             element: (
//               <ProtectedRoute>
//                 <CourseCatalog />
//               </ProtectedRoute>
//             ),
//           },
//           {
//             path: "my-courses",
//             element: (
//               <ProtectedRoute>
//                 <MyCourses />
//               </ProtectedRoute>
//             ),
//           },
//           {
//             path: ":courseId",
//             element: (
//               <ProtectedRoute>
//                 <CourseDetail />
//               </ProtectedRoute>
//             ),
//           },
//           {
//             path: ":courseId/lesson/:lessonId",
//             element: (
//               <ProtectedRoute>
//                 <LessonView />
//               </ProtectedRoute>
//             ),
//           },
//           {
//             path: ":courseId/completion",
//             element: (
//               <ProtectedRoute>
//                 <CourseCompletion />
//               </ProtectedRoute>
//             ),
//           },
//         ],
//       },

//  // Corporate Routes - Final Fixed Version
// {
//   path: "company",
//   element: (
//     <ProtectedRoute>
//       <CorporateGuard redirectTo="/company/dashboard" />
//     </ProtectedRoute>
//   ),
//   children: [
//     {
//       index: true,
//       element: <Navigate to="dashboard" replace />,
//     },
//     {
//       path: "dashboard",
//       element: <CompanyDashboard />,
//     },
//     {
//       path: "employees",
//       element: (
//         <CorporateGuard requirePermission="canViewEmployees">
//           <EmployeeManagement />
//         </CorporateGuard>
//       ),
//     },
//     {
//       path: "reports",
//       element: (
//         <CorporateGuard requirePermission="canViewReports">
//           <Reports />
//         </CorporateGuard>
//       ),
//     },
//     {
//       path: "settings",
//       element: (
//         <CorporateGuard requirePermission="canManageCompany">
//           <CompanySettings />
//         </CorporateGuard>
//       ),
//     },
//   ],
// },
//       // Catch-all route
//       {
//         path: "*",
//         element: <NotFound />,
//       },
//     ],
//   },
// ]);

// // Route configuration for navigation components
// export const navigationRoutes = {
//   public: [
//     { path: "/", label: "Home" },
//     { path: "/about", label: "About" },
//     { path: "/pricing", label: "Pricing" },
//     { path: "/contact", label: "Contact" },
//   ],

//   authenticated: [
//     { path: "/dashboard", label: "Dashboard", icon: "LayoutDashboard" },
//     { path: "/courses", label: "Courses", icon: "BookOpen" },
//     { path: "/courses/my-courses", label: "My Courses", icon: "User" },
//   ],

//   corporate: [
//     {
//       path: "/company/dashboard",
//       label: "Company Dashboard",
//       icon: "Building2",
//     },
//     {
//       path: "/company/employees",
//       label: "Employees",
//       icon: "Users",
//       permission: "canViewEmployees",
//     },
//     {
//       path: "/company/reports",
//       label: "Reports",
//       icon: "BarChart3",
//       permission: "canViewReports",
//     },
//     {
//       path: "/company/settings",
//       label: "Settings",
//       icon: "Settings",
//       permission: "canManageCompany",
//     },
//   ],

//   user: [
//     { path: "/profile", label: "Profile", icon: "User" },
//     { path: "/settings", label: "Settings", icon: "Settings" },
//   ],
// };

// // Helper function to check if user has access to a route
// export const hasRouteAccess = (route, permissions = {}) => {
//   if (!route.permission) return true;
//   return permissions[route.permission] || false;
// };

// // Helper function to get available routes based on user permissions
// export const getAvailableRoutes = (routeGroup, permissions = {}) => {
//   return (
//     navigationRoutes[routeGroup]?.filter((route) =>
//       hasRouteAccess(route, permissions)
//     ) || []
//   );
// };

// // Route breadcrumb configuration
// export const breadcrumbConfig = {
//   "/dashboard": [{ label: "Dashboard" }],
//   "/courses": [{ label: "Courses" }],
//   "/courses/my-courses": [
//     { label: "Courses", path: "/courses" },
//     { label: "My Courses" },
//   ],
//   "/company/dashboard": [
//     { label: "Company", path: "/company/dashboard" },
//     { label: "Dashboard" },
//   ],
//   "/company/employees": [
//     { label: "Company", path: "/company/dashboard" },
//     { label: "Employees" },
//   ],
//   "/company/reports": [
//     { label: "Company", path: "/company/dashboard" },
//     { label: "Reports" },
//   ],
//   "/company/settings": [
//     { label: "Company", path: "/company/dashboard" },
//     { label: "Settings" },
//   ],
// };

// // Helper function to get breadcrumbs for current route
// export const getBreadcrumbs = (pathname) => {
//   return breadcrumbConfig[pathname] || [];
// };


import { createBrowserRouter, Navigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import CorporateGuard from "@/components/auth/CorporateGuard";
import AdminGuard from "@/components/auth/AdminGuard";

// Public Pages
import Home from "@/pages/public/Home";
import About from "@/pages/public/About";
import Pricing from "@/pages/public/Pricing";
import Contact from "@/pages/public/Contact";

// Auth Pages
import Login from "@/pages/auth/Login";
import Signup from "@/pages/auth/SignUp";
import ResetPassword from "@/pages/auth/ResetPassword";
import VerifyEmail from "@/pages/auth/VerifyEmail";
import ForgotPassword from "@/pages/auth/ForgotPassword";

// Individual User Pages
import Dashboard from "@/pages/dashboard/Dashboard";
import Profile from "@/pages/dashboard/Profile";
import Settings from "@/pages/dashboard/Settings";
import CourseCatalog from "@/pages/courses/CourseCatalog";
import CourseDetail from "@/pages/courses/CourseDetail";
import LessonView from "@/pages/courses/LessonView";
import MyCourses from "@/pages/courses/MyCourses";
import CourseCompletion from "@/pages/courses/CourseCompletion";

// Corporate Pages
import CompanyDashboard from "@/pages/corporate/CompanyDashboard";
import EmployeeManagement from "@/pages/corporate/EmployeeManagement";
// import EmployeeInvite from "@/pages/corporate/EmployeeInvite";
// import EmployeeGroups from "@/pages/corporate/EmployeeGroups";
import Reports from "@/pages/corporate/Reports";
// import ProgressReports from "@/pages/corporate/ProgressReports";
// import CompletionReports from "@/pages/corporate/CompletionReports";
// import CustomReports from "@/pages/corporate/CustomReports";
import CompanySettings from "@/pages/corporate/CompanySettings";
// import CompanyProfileSettings from "@/pages/corporate/CompanyProfileSettings";
// import BillingSettings from "@/pages/corporate/BillingSettings";
// import IntegrationSettings from "@/pages/corporate/IntegrationSettings";
import AcceptInvitation from "@/pages/corporate/AcceptInvitation";

// Error Pages
import NotFound from "@/components/common/NotFound";
import ErrorBoundary from "@/components/common/ErrorBoundary";
import { 
  individualNavigation ,
  corporateNavigation ,
  quickActions,
  getBreadcrumbs
} from '@/config/navigation';


export const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    errorElement: <ErrorBoundary />,
    children: [
      // Public Routes
      { index: true, element: <Home /> },
      { path: "about", element: <About /> },
      { path: "pricing", element: <Pricing /> },
      { path: "contact", element: <Contact /> },

      // Auth Routes
      { path: "login", element: <Login /> },
      { path: "signup", element: <Signup /> },
      { path: "reset-password", element: <ResetPassword /> },
      { path: "forgot-password", element: <ForgotPassword /> },
      { path: "verify-email", element: <VerifyEmail /> },

      // Accept invitation (special route)
      {
        path: "accept-invitation",
        element: (
          <ProtectedRoute>
            <AcceptInvitation />
          </ProtectedRoute>
        )
      },

      // Individual User Routes
      {
        path: "app",
        element: <ProtectedRoute />,
        children: [
          { index: true, element: <Navigate to="dashboard" replace /> },
          { path: "dashboard", element: <Dashboard /> },
          { path: "profile", element: <Profile /> },
          { path: "settings", element: <Settings /> },
          {
            path: "courses",
            children: [
              { index: true, element: <MyCourses /> },
              { path: "catalog", element: <CourseCatalog /> },
              { path: ":courseId", element: <CourseDetail /> },
              { path: ":courseId/lesson/:lessonId", element: <LessonView /> },
              { path: ":courseId/completion", element: <CourseCompletion /> }
            ]
          },
          { path: "progress", element: <div>Progress Page</div> },
          { path: "certificates", element: <div>Certificates</div> }
        ]
      },

      // Corporate Routes
      {
        path: "company",
        element: (
          <ProtectedRoute>
            <CorporateGuard />
          </ProtectedRoute>
        ),
        children: [
          { index: true, element: <Navigate to="dashboard" replace /> },
          { path: "dashboard", element: <CompanyDashboard /> },
          {
            path: "employees",
            children: [
              { 
                index: true, 
                element: (
                  <AdminGuard requirePermission="invite_employees">
                    <EmployeeManagement />
                  </AdminGuard>
                ) 
              },
              // { 
              //   path: "invite", 
              //   element: (
              //     <AdminGuard requirePermission="invite_employees">
              //       <EmployeeInvite />
              //     </AdminGuard>
              //   ) 
              // },
              // { 
              //   path: "groups", 
              //   element: (
              //     <AdminGuard requirePermission="manage_employees">
              //       <EmployeeGroups />
              //     </AdminGuard>
              //   ) 
              // }
            ]
          },
          {
            path: "reports",
            children: [
              { 
                index: true, 
                element: (
                  <AdminGuard requirePermission="view_reports">
                    <Reports />
                  </AdminGuard>
                ) 
              },
              // { 
              //   path: "progress", 
              //   element: (
              //     <AdminGuard requirePermission="view_reports">
              //       <ProgressReports />
              //     </AdminGuard>
              //   ) 
              // },
              // { 
              //   path: "completion", 
              //   element: (
              //     <AdminGuard requirePermission="view_reports">
              //       <CompletionReports />
              //     </AdminGuard>
              //   ) 
              // },
              // { 
              //   path: "custom", 
              //   element: (
              //     <AdminGuard requirePermission="generate_reports">
              //       <CustomReports />
              //     </AdminGuard>
              //   ) 
              // }
            ]
          },
          {
            path: "settings",
            children: [
              { 
                index: true, 
                element: (
                  <AdminGuard requirePermission="manage_settings">
                    <CompanySettings />
                  </AdminGuard>
                ) 
              },
              // { 
              //   path: "profile", 
              //   element: (
              //     <AdminGuard requirePermission="manage_settings">
              //       <CompanyProfileSettings />
              //     </AdminGuard>
              //   ) 
              // },
              // { 
              //   path: "billing", 
              //   element: (
              //     <AdminGuard requirePermission="manage_billing">
              //       <BillingSettings />
              //     </AdminGuard>
              //   ) 
              // },
              // { 
              //   path: "integrations", 
              //   element: (
              //     <AdminGuard requirePermission="manage_integrations">
              //       <IntegrationSettings />
              //     </AdminGuard>
              //   ) 
              // }
            ]
          }
        ]
      },

      // Catch-all route
      { path: "*", element: <NotFound /> }
    ]
  }
]);
// export const getAvailableRoutes = (routeGroup, permissions = {}) => {
//   const allRoutes = {
//     individual: individualNavigation,
//     corporate: corporateNavigation,
//     // ... other route groups
//   };
//     return allRoutes[routeGroup]?.filter(route => {
//     if (!route.permission) return true;
//     return permissions[route.permission] || false;
//   }) || [];
// };
// At the end of router.jsx
export const navigationRoutes = {
  individual: individualNavigation,
  corporate: corporateNavigation,
  // ... other groups
};

const getAvailableRoutes = (routeGroup, permissions = {}) => {
  return navigationRoutes[routeGroup]?.filter(route => {
    if (!route.permission) return true;
    return permissions[route.permission] || false;
  }) || [];
};

// Then export everything you need
export { 
  individualNavigation, 
  corporateNavigation, 
  quickActions, 
  getBreadcrumbs,
  getAvailableRoutes 
};
// Export your navigation configuration
// export * from '@/config/navigation';