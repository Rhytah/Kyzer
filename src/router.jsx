// // import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
// // import { useAuth } from '@hooks/auth/useAuth';

// // // Layouts
// // import Layout from '@components/layout/Layout';
// // import AuthLayout from '@components/layout/AuthLayout';
// // import PublicLayout from '@components/layout/PublicLayout';
// // import CorporateLayout from '@components/layout/CorporateLayout';

// // // Auth Pages
// // import Login from '@pages/auth/Login';
// // import Signup from '@pages/auth/Signup';
// // import ResetPassword from '@pages/auth/ResetPassword';
// // import VerifyEmail from '@pages/auth/VerifyEmail';

// // // Public Pages
// // import Home from '@pages/public/Home';
// // import About from '@pages/public/About';
// // import Pricing from '@pages/public/Pricing';
// // import Contact from '@pages/public/Contact';

// // // Dashboard Pages
// // import Dashboard from '@pages/dashboard/Dashboard';
// // import Profile from '@pages/dashboard/Profile';
// // import Settings from '@pages/dashboard/Settings';

// // // Course Pages
// // import CourseCatalog from '@pages/courses/CourseCatalog';
// // import CourseDetail from '@pages/courses/CourseDetail';
// // import LessonView from '@pages/courses/LessonView';
// // import MyCourses from '@pages/courses/MyCourses';
// // import CourseCompletion from '@pages/courses/CourseCompletion';

// // // Corporate Pages
// // import CompanyDashboard from '@pages/corporate/CompanyDashboard';
// // import EmployeeManagement from '@pages/corporate/EmployeeManagement';
// // import Reports from '@pages/corporate/Reports';
// // import CompanySettings from '@pages/corporate/CompanySettings';

// // // Other Pages
// // import Progress from '@pages/dashboard/Progress';
// // import Certificates from '@pages/dashboard/Certificates';
// // import NotFound from '@components/common/NotFound';

// // // Route Guards
// // import ProtectedRoute from '@components/auth/ProtectedRoute';
// // import CorporateRoute from '@components/auth/CorporateRoute';

// // const router = createBrowserRouter([
// //   // Public Routes
// //   {
// //     path: '/',
// //     element: <PublicLayout />,
// //     children: [
// //       { index: true, element: <Home /> },
// //       { path: 'about', element: <About /> },
// //       { path: 'pricing', element: <Pricing /> },
// //       { path: 'contact', element: <Contact /> },
// //     ],
// //   },

// //   // Auth Routes
// //   {
// //     path: '/auth',
// //     element: <AuthLayout />,
// //     children: [
// //       { path: 'login', element: <Login /> },
// //       { path: 'signup', element: <Signup /> },
// //       { path: 'reset-password', element: <ResetPassword /> },
// //       { path: 'verify-email', element: <VerifyEmail /> },
// //       { index: true, element: <Navigate to="/auth/login" replace /> },
// //     ],
// //   },

// //   // Protected Individual User Routes
// //   {
// //     path: '/app',
// //     element: (
// //       <ProtectedRoute>
// //         <Layout />
// //       </ProtectedRoute>
// //     ),
// //     children: [
// //       // Dashboard
// //       { index: true, element: <Navigate to="/app/dashboard" replace /> },
// //       { path: 'dashboard', element: <Dashboard /> },
      
// //       // Courses
// //       {
// //         path: 'courses',
// //         children: [
// //           { index: true, element: <MyCourses /> },
// //           { path: 'catalog', element: <CourseCatalog /> },
// //           { path: ':courseId', element: <CourseDetail /> },
// //           { path: ':courseId/lesson/:lessonId', element: <LessonView /> },
// //           { path: ':courseId/completion', element: <CourseCompletion /> },
// //         ],
// //       },

// //       // Progress & Learning
// //       { path: 'progress', element: <Progress /> },
// //       { path: 'certificates', element: <Certificates /> },

// //       // User Management
// //       { path: 'profile', element: <Profile /> },
// //       { path: 'settings', element: <Settings /> },
// //     ],
// //   },

// //   // Corporate Routes
// //   {
// //     path: '/corporate',
// //     element: (
// //       <CorporateRoute>
// //         <CorporateLayout />
// //       </CorporateRoute>
// //     ),
// //     children: [
// //       { index: true, element: <Navigate to="/corporate/dashboard" replace /> },
// //       { path: 'dashboard', element: <CompanyDashboard /> },
// //       { path: 'employees', element: <EmployeeManagement /> },
// //       { path: 'reports', element: <Reports /> },
// //       { path: 'settings', element: <CompanySettings /> },
// //     ],
// //   },

// //   // Catch-all route
// //   { path: '*', element: <NotFound /> },
// // ]);

// // export default function AppRouter() {
// //   return <RouterProvider router={router} />;
// // }

// // src/router.jsx
// import { createBrowserRouter, Navigate } from 'react-router-dom'
// import Layout from '@/components/layout/Layout'
// import ProtectedRoute from '@/components/auth/ProtectedRoute'
// import CorporateGuard from '@/components/auth/CorporateGuard'

// // Public Pages
// import Home from '@/pages/public/Home'
// import About from '@/pages/public/About'
// import Pricing from '@/pages/public/Pricing'
// import Contact from '@/pages/public/Contact'

// // Auth Pages
// import Login from '@/pages/auth/Login'
// import Signup from '@/pages/auth/Signup'
// import ResetPassword from '@/pages/auth/ResetPassword'
// import VerifyEmail from '@/pages/auth/VerifyEmail'

// // Dashboard Pages
// import Dashboard from '@/pages/dashboard/Dashboard'
// import Profile from '@/pages/dashboard/Profile'
// import Settings from '@/pages/dashboard/Settings'

// // Course Pages
// import CourseCatalog from '@/pages/courses/CourseCatalog'
// import CourseDetail from '@/pages/courses/CourseDetail'
// import LessonView from '@/pages/courses/LessonView'
// import MyCourses from '@/pages/courses/MyCourses'
// import CourseCompletion from '@/pages/courses/CourseCompletion'

// // Corporate Pages
// import CompanyDashboard from '@/pages/corporate/CompanyDashboard'
// import EmployeeManagement from '@/pages/corporate/EmployeeManagement'
// import Reports from '@/pages/corporate/Reports'
// import CompanySettings from '@/pages/corporate/CompanySettings'
// import AcceptInvitation from '@/pages/corporate/AcceptInvitation'

// // Error Pages
// import NotFound from '@/components/common/NotFound'
// import ErrorBoundary from '@/components/common/ErrorBoundary'

// export const router = createBrowserRouter([
//   {
//     path: '/',
//     element: <Layout />,
//     errorElement: <ErrorBoundary />,
//     children: [
//       // Public Routes
//       {
//         index: true,
//         element: <Home />
//       },
//       {
//         path: 'about',
//         element: <About />
//       },
//       {
//         path: 'pricing',
//         element: <Pricing />
//       },
//       {
//         path: 'contact',
//         element: <Contact />
//       },

//       // Auth Routes (redirect if already logged in)
//       {
//         path: 'login',
//         element: <Login />
//       },
//       {
//         path: 'signup',
//         element: <Signup />
//       },
//       {
//         path: 'reset-password',
//         element: <ResetPassword />
//       },
//       {
//         path: 'verify-email',
//         element: <VerifyEmail />
//       },

//       // Accept invitation (special route that can be accessed without company membership)
//       {
//         path: 'accept-invitation',
//         element: (
//           <ProtectedRoute>
//             <AcceptInvitation />
//           </ProtectedRoute>
//         )
//       },

//       // Protected Individual User Routes
//       {
//         path: 'dashboard',
//         element: (
//           <ProtectedRoute>
//             <Dashboard />
//           </ProtectedRoute>
//         )
//       },
//       {
//         path: 'profile',
//         element: (
//           <ProtectedRoute>
//             <Profile />
//           </ProtectedRoute>
//         )
//       },
//       {
//         path: 'settings',
//         element: (
//           <ProtectedRoute>
//             <Settings />
//           </ProtectedRoute>
//         )
//       },

//       // Course Routes
//       {
//         path: 'courses',
//         children: [
//           {
//             index: true,
//             element: (
//               <ProtectedRoute>
//                 <CourseCatalog />
//               </ProtectedRoute>
//             )
//           },
//           {
//             path: 'my-courses',
//             element: (
//               <ProtectedRoute>
//                 <MyCourses />
//               </ProtectedRoute>
//             )
//           },
//           {
//             path: ':courseId',
//             element: (
//               <ProtectedRoute>
//                 <CourseDetail />
//               </ProtectedRoute>
//             )
//           },
//           {
//             path: ':courseId/lesson/:lessonId',
//             element: (
//               <ProtectedRoute>
//                 <LessonView />
//               </ProtectedRoute>
//             )
//           },
//           {
//             path: ':courseId/completion',
//             element: (
//               <ProtectedRoute>
//                 <CourseCompletion />
//               </ProtectedRoute>
//             )
//           }
//         ]
//       },

//       // Corporate Routes (require company membership)
//       {
//         path: 'company',
//         element: (
//           <ProtectedRoute>
//             <CorporateGuard>
//               <Navigate to="/company/dashboard" replace />
//             </CorporateGuard>
//           </ProtectedRoute>
//         )
//       },
//       {
//         path: 'company/dashboard',
//         element: (
//           <ProtectedRoute>
//             <CorporateGuard>
//               <CompanyDashboard />
//             </CorporateGuard>
//           </ProtectedRoute>
//         )
//       },
//       {
//         path: 'company/employees',
//         element: (
//           <ProtectedRoute>
//             <CorporateGuard requirePermission="canViewEmployees">
//               <EmployeeManagement />
//             </CorporateGuard>
//           </ProtectedRoute>
//         )
//       },
//       {
//         path: 'company/reports',
//         element: (
//           <ProtectedRoute>
//             <CorporateGuard requirePermission="canViewReports">
//               <Reports />
//             </CorporateGuard>
//           </ProtectedRoute>
//         )
//       },
//       {
//         path: 'company/settings',
//         element: (
//           <ProtectedRoute>
//             <CorporateGuard requirePermission="canManageCompany">
//               <CompanySettings />
//             </CorporateGuard>
//           </ProtectedRoute>
//         )
//       },

//       // Catch-all route
//       {
//         path: '*',
//         element: <NotFound />
//       }
//     ]
//   }
// ])

// // Route configuration for navigation components
// export const navigationRoutes = {
//   public: [
//     { path: '/', label: 'Home' },
//     { path: '/about', label: 'About' },
//     { path: '/pricing', label: 'Pricing' },
//     { path: '/contact', label: 'Contact' }
//   ],
  
//   authenticated: [
//     { path: '/dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
//     { path: '/courses', label: 'Courses', icon: 'BookOpen' },
//     { path: '/courses/my-courses', label: 'My Courses', icon: 'User' }
//   ],
  
//   corporate: [
//     { path: '/company/dashboard', label: 'Company Dashboard', icon: 'Building2' },
//     { path: '/company/employees', label: 'Employees', icon: 'Users', permission: 'canViewEmployees' },
//     { path: '/company/reports', label: 'Reports', icon: 'BarChart3', permission: 'canViewReports' },
//     { path: '/company/settings', label: 'Settings', icon: 'Settings', permission: 'canManageCompany' }
//   ],
  
//   user: [
//     { path: '/profile', label: 'Profile', icon: 'User' },
//     { path: '/settings', label: 'Settings', icon: 'Settings' }
//   ]
// }

// // Helper function to check if user has access to a route
// export const hasRouteAccess = (route, permissions = {}) => {
//   console.log(route, permissions, 'Checking route access');
//   if (!route.permission) return true
//   return permissions[route.permission] || false
// }

// // Helper function to get available routes based on user permissions
// export const getAvailableRoutes = (routeGroup, permissions = {}) => {
//   return navigationRoutes[routeGroup]?.filter(route => 
//     hasRouteAccess(route, permissions)
//   ) || []
// }

// // Route breadcrumb configuration
// export const breadcrumbConfig = {
//   '/dashboard': [{ label: 'Dashboard' }],
//   '/courses': [{ label: 'Courses' }],
//   '/courses/my-courses': [
//     { label: 'Courses', path: '/courses' },
//     { label: 'My Courses' }
//   ],
//   '/company/dashboard': [
//     { label: 'Company', path: '/company/dashboard' },
//     { label: 'Dashboard' }
//   ],
//   '/company/employees': [
//     { label: 'Company', path: '/company/dashboard' },
//     { label: 'Employees' }
//   ],
//   '/company/reports': [
//     { label: 'Company', path: '/company/dashboard' },
//     { label: 'Reports' }
//   ],
//   '/company/settings': [
//     { label: 'Company', path: '/company/dashboard' },
//     { label: 'Settings' }
//   ]
// }

// // Helper function to get breadcrumbs for current route
// export const getBreadcrumbs = (pathname) => {
//   return breadcrumbConfig[pathname] || []
// }

// src/router.jsx - Fixed version
import { createBrowserRouter, Navigate } from 'react-router-dom'
import Layout from '@/components/layout/Layout'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import CorporateGuard from '@/components/auth/CorporateGuard'

// Public Pages
import Home from '@/pages/public/Home'
import About from '@/pages/public/About'
import Pricing from '@/pages/public/Pricing'
import Contact from '@/pages/public/Contact'

// Auth Pages
import Login from '@/pages/auth/Login'
import Signup from '@/pages/auth/SignUp'
import ResetPassword from '@/pages/auth/ResetPassword'
import VerifyEmail from '@/pages/auth/VerifyEmail'

// Dashboard Pages
import Dashboard from '@/pages/dashboard/Dashboard'
import Profile from '@/pages/dashboard/Profile'
import Settings from '@/pages/dashboard/Settings'

// Course Pages
import CourseCatalog from '@/pages/courses/CourseCatalog'
import CourseDetail from '@/pages/courses/CourseDetail'
import LessonView from '@/pages/courses/LessonView'
import MyCourses from '@/pages/courses/MyCourses'
import CourseCompletion from '@/pages/courses/CourseCompletion'

// Corporate Pages
import CompanyDashboard from '@/pages/corporate/CompanyDashboard'
import EmployeeManagement from '@/pages/corporate/EmployeeManagement'
import Reports from '@/pages/corporate/Reports'
import CompanySettings from '@/pages/corporate/CompanySettings'
import AcceptInvitation from '@/pages/corporate/AcceptInvitation'

// Error Pages
import NotFound from '@/components/common/NotFound'
import ErrorBoundary from '@/components/common/ErrorBoundary'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    errorElement: <ErrorBoundary />,
    children: [
      // Public Routes
      {
        index: true,
        element: <Home />
      },
      {
        path: 'about',
        element: <About />
      },
      {
        path: 'pricing',
        element: <Pricing />
      },
      {
        path: 'contact',
        element: <Contact />
      },

      // Auth Routes
      {
        path: 'login',
        element: <Login />
      },
      {
        path: 'signup',
        element: <Signup />
      },
      {
        path: 'reset-password',
        element: <ResetPassword />
      },
      {
        path: 'verify-email',
        element: <VerifyEmail />
      },

      // Accept invitation (special route)
      {
        path: 'accept-invitation',
        element: (
          <ProtectedRoute>
            <AcceptInvitation />
          </ProtectedRoute>
        )
      },

      // Protected Individual User Routes
      {
        path: 'dashboard',
        element: (
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        )
      },
      {
        path: 'profile',
        element: (
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        )
      },
      {
        path: 'settings',
        element: (
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        )
      },

      // Course Routes
      {
        path: 'courses',
        children: [
          {
            index: true,
            element: (
              <ProtectedRoute>
                <CourseCatalog />
              </ProtectedRoute>
            )
          },
          {
            path: 'my-courses',
            element: (
              <ProtectedRoute>
                <MyCourses />
              </ProtectedRoute>
            )
          },
          {
            path: ':courseId',
            element: (
              <ProtectedRoute>
                <CourseDetail />
              </ProtectedRoute>
            )
          },
          {
            path: ':courseId/lesson/:lessonId',
            element: (
              <ProtectedRoute>
                <LessonView />
              </ProtectedRoute>
            )
          },
          {
            path: ':courseId/completion',
            element: (
              <ProtectedRoute>
                <CourseCompletion />
              </ProtectedRoute>
            )
          }
        ]
      },

      // Corporate Routes - FIXED VERSION
      {
        path: 'company',
        element: (
          <ProtectedRoute>
            <CorporateGuard redirectTo="/company/dashboard" />
          </ProtectedRoute>
        )
      },
      {
        path: 'company/dashboard',
        element: (
          <ProtectedRoute>
            <CorporateGuard>
              <CompanyDashboard />
            </CorporateGuard>
          </ProtectedRoute>
        )
      },
      {
        path: 'company/employees',
        element: (
          <ProtectedRoute>
            <CorporateGuard requirePermission="canViewEmployees">
              <EmployeeManagement />
            </CorporateGuard>
          </ProtectedRoute>
        )
      },
      {
        path: 'company/reports',
        element: (
          <ProtectedRoute>
            <CorporateGuard requirePermission="canViewReports">
              <Reports />
            </CorporateGuard>
          </ProtectedRoute>
        )
      },
      {
        path: 'company/settings',
        element: (
          <ProtectedRoute>
            <CorporateGuard requirePermission="canManageCompany">
              <CompanySettings />
            </CorporateGuard>
          </ProtectedRoute>
        )
      },

      // Catch-all route
      {
        path: '*',
        element: <NotFound />
      }
    ]
  }
])

// Route configuration for navigation components
export const navigationRoutes = {
  public: [
    { path: '/', label: 'Home' },
    { path: '/about', label: 'About' },
    { path: '/pricing', label: 'Pricing' },
    { path: '/contact', label: 'Contact' }
  ],
  
  authenticated: [
    { path: '/dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
    { path: '/courses', label: 'Courses', icon: 'BookOpen' },
    { path: '/courses/my-courses', label: 'My Courses', icon: 'User' }
  ],
  
  corporate: [
    { path: '/company/dashboard', label: 'Company Dashboard', icon: 'Building2' },
    { path: '/company/employees', label: 'Employees', icon: 'Users', permission: 'canViewEmployees' },
    { path: '/company/reports', label: 'Reports', icon: 'BarChart3', permission: 'canViewReports' },
    { path: '/company/settings', label: 'Settings', icon: 'Settings', permission: 'canManageCompany' }
  ],
  
  user: [
    { path: '/profile', label: 'Profile', icon: 'User' },
    { path: '/settings', label: 'Settings', icon: 'Settings' }
  ]
}

// Helper function to check if user has access to a route
export const hasRouteAccess = (route, permissions = {}) => {
  if (!route.permission) return true
  return permissions[route.permission] || false
}

// Helper function to get available routes based on user permissions
export const getAvailableRoutes = (routeGroup, permissions = {}) => {
  return navigationRoutes[routeGroup]?.filter(route => 
    hasRouteAccess(route, permissions)
  ) || []
}

// Route breadcrumb configuration
export const breadcrumbConfig = {
  '/dashboard': [{ label: 'Dashboard' }],
  '/courses': [{ label: 'Courses' }],
  '/courses/my-courses': [
    { label: 'Courses', path: '/courses' },
    { label: 'My Courses' }
  ],
  '/company/dashboard': [
    { label: 'Company', path: '/company/dashboard' },
    { label: 'Dashboard' }
  ],
  '/company/employees': [
    { label: 'Company', path: '/company/dashboard' },
    { label: 'Employees' }
  ],
  '/company/reports': [
    { label: 'Company', path: '/company/dashboard' },
    { label: 'Reports' }
  ],
  '/company/settings': [
    { label: 'Company', path: '/company/dashboard' },
    { label: 'Settings' }
  ]
}

// Helper function to get breadcrumbs for current route
export const getBreadcrumbs = (pathname) => {
  return breadcrumbConfig[pathname] || []
}