// // // import React from "react";
// // // import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
// // // import Layout from "./components/layout/Layout";

// // // // Test Page Component
// // // function TestPage() {
// // //   return (
// // //     <div className="p-6">
// // //       <h1 className="text-2xl font-bold text-text-dark mb-4">🎉 Success!</h1>
// // //       <p className="text-text-muted mb-4">
// // //         If you see this, all errors are fixed and your app is working!
// // //       </p>
// // //       <div className="bg-green-50 border border-green-200 rounded-lg p-4">
// // //         <h3 className="text-green-800 font-medium">✅ Fixed Issues:</h3>
// // //         <ul className="text-green-700 text-sm mt-2 space-y-1">
// // //           <li>• Vite React plugin preamble error</li>
// // //           <li>• Missing dependencies</li>
// // //           <li>• Router configuration</li>
// // //           <li>• Import path aliases</li>
// // //         </ul>
// // //       </div>
// // //     </div>
// // //   );
// // // }

// // // // Dashboard Component
// // // function Dashboard() {
// // //   return (
// // //     <div className="p-6">
// // //       <h1 className="text-2xl font-bold text-text-dark mb-4">Dashboard</h1>
// // //       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
// // //         <div className="bg-white p-6 rounded-lg border border-border shadow-sm">
// // //           <h3 className="text-lg font-semibold text-text-dark">Courses</h3>
// // //           <p className="text-3xl font-bold text-primary mt-2">12</p>
// // //           <p className="text-text-muted text-sm">Enrolled courses</p>
// // //         </div>
// // //         <div className="bg-white p-6 rounded-lg border border-border shadow-sm">
// // //           <h3 className="text-lg font-semibold text-text-dark">Progress</h3>
// // //           <p className="text-3xl font-bold text-green-600 mt-2">75%</p>
// // //           <p className="text-text-muted text-sm">Average completion</p>
// // //         </div>
// // //         <div className="bg-white p-6 rounded-lg border border-border shadow-sm">
// // //           <h3 className="text-lg font-semibold text-text-dark">Certificates</h3>
// // //           <p className="text-3xl font-bold text-blue-600 mt-2">8</p>
// // //           <p className="text-text-muted text-sm">Earned certificates</p>
// // //         </div>
// // //       </div>
// // //     </div>
// // //   );
// // // }

// // // // Courses Page
// // // function Courses() {
// // //   return (
// // //     <div className="p-6">
// // //       <h1 className="text-2xl font-bold text-text-dark mb-4">My Courses</h1>
// // //       <div className="bg-white rounded-lg border border-border shadow-sm p-6">
// // //         <p className="text-text-muted">Your enrolled courses will appear here.</p>
// // //       </div>
// // //     </div>
// // //   );
// // // }

// // // // Main App Component
// // // function App() {
// // //   return (
// // //     <BrowserRouter>
// // //       <Routes>
// // //         {/* Routes with Layout */}
// // //         <Route path="/" element={<Layout />}>
// // //           <Route index element={<Navigate to="/dashboard" replace />} />
// // //           <Route path="dashboard" element={<Dashboard />} />
// // //           <Route path="courses" element={<Courses />} />
// // //           <Route path="test" element={<TestPage />} />
          
// // //           {/* Placeholder routes */}
// // //           <Route path="catalog" element={<div className="p-6">Course Catalog</div>} />
// // //           <Route path="progress" element={<div className="p-6">Progress Page</div>} />
// // //           <Route path="certificates" element={<div className="p-6">Certificates</div>} />
// // //           <Route path="settings" element={<div className="p-6">Settings</div>} />
// // //         </Route>
        
// // //         {/* Catch all route */}
// // //         <Route path="*" element={<Navigate to="/dashboard" />} />
// // //       </Routes>
// // //     </BrowserRouter>
// // //   );
// // // }

// // // export default App;


// // // src/App.jsx
// // import React from 'react'
// // import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
// // import { Toaster } from 'react-hot-toast'

// // // Import components
// // import Layout from './components/layout/Layout'
// // import Login from './pages/auth/Login'
// // import Signup from './pages/auth/Signup'
// // import Dashboard from './pages/dashboard/Dashboard'
// // import Profile from './pages/dashboard/Profile'
// // import Settings from './pages/dashboard/Settings'
// // import CourseCatalog from './pages/courses/CourseCatalog'
// // import MyCourses from './pages/courses/MyCourses'
// // import Home from './pages/public/Home'

// // // Import hooks
// // import { useAuth } from './hooks/auth/useAuth'

// // // Protected Route Component
// // function ProtectedRoute({ children }) {
// //   const { isAuthenticated, loading } = useAuth()
  
// //   if (loading) {
// //     return (
// //       <div className="min-h-screen bg-background-light flex items-center justify-center">
// //         <div className="text-center">
// //           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
// //           <p className="text-text-light">Loading...</p>
// //         </div>
// //       </div>
// //     )
// //   }
  
// //   return isAuthenticated ? children : <Navigate to="/login" replace />
// // }

// // // Public Route Component
// // function PublicRoute({ children }) {
// //   const { isAuthenticated, loading } = useAuth()
  
// //   if (loading) {
// //     return (
// //       <div className="min-h-screen bg-background-light flex items-center justify-center">
// //         <div className="text-center">
// //           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
// //           <p className="text-text-light">Loading...</p>
// //         </div>
// //       </div>
// //     )
// //   }
  
// //   return !isAuthenticated ? children : <Navigate to="/dashboard" replace />
// // }

// // function App() {
// //   return (
// //     <Router>
// //       <div className="App">
// //         <Routes>
// //           {/* Public Routes */}
// //           <Route path="/" element={<Home />} />
          
// //           {/* Auth Routes */}
// //           <Route 
// //             path="/login" 
// //             element={
// //               <PublicRoute>
// //                 <Login />
// //               </PublicRoute>
// //             } 
// //           />
// //           <Route 
// //             path="/signup" 
// //             element={
// //               <PublicRoute>
// //                 <Signup />
// //               </PublicRoute>
// //             } 
// //           />
          
// //           {/* Protected Routes */}
// //           <Route
// //             path="/dashboard"
// //             element={
// //               <ProtectedRoute>
// //                 <Layout>
// //                   <Dashboard />
// //                 </Layout>
// //               </ProtectedRoute>
// //             }
// //           />
// //           <Route
// //             path="/profile"
// //             element={
// //               <ProtectedRoute>
// //                 <Layout>
// //                   <Profile />
// //                 </Layout>
// //               </ProtectedRoute>
// //             }
// //           />
// //           <Route
// //             path="/settings"
// //             element={
// //               <ProtectedRoute>
// //                 <Layout>
// //                   <Settings />
// //                 </Layout>
// //               </ProtectedRoute>
// //             }
// //           />
// //           <Route
// //             path="/courses"
// //             element={
// //               <ProtectedRoute>
// //                 <Layout>
// //                   <CourseCatalog />
// //                 </Layout>
// //               </ProtectedRoute>
// //             }
// //           />
// //           <Route
// //             path="/my-courses"
// //             element={
// //               <ProtectedRoute>
// //                 <Layout>
// //                   <MyCourses />
// //                 </Layout>
// //               </ProtectedRoute>
// //             }
// //           />
          
// //           {/* Catch all route */}
// //           <Route path="*" element={<Navigate to="/" replace />} />
// //         </Routes>
        
// //         {/* Toast Notifications */}
// //         <Toaster
// //           position="top-right"
// //           toastOptions={{
// //             duration: 4000,
// //             style: {
// //               background: '#374151',
// //               color: '#fff',
// //             },
// //           }}
// //         />
// //       </div>
// //     </Router>
// //   )
// // }

// // export default App

// import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// import { Toaster } from 'react-hot-toast';

// // Import layouts
// import Layout from './components/layout/Layout';
// import AuthLayout from './components/layout/AuthLayout';
// import PublicLayout from './components/layout/PublicLayout';

// // Import pages
// import Login from './pages/auth/Login';
// import Signup from './pages/auth/SignUp';
// import Dashboard from './pages/dashboard/Dashboard';
// import Profile from './pages/dashboard/Profile';
// import Settings from './pages/dashboard/Settings';
// import CourseCatalog from './pages/courses/CourseCatalog';
// import MyCourses from './pages/courses/MyCourses';
// import Home from './pages/public/Home';
// import About from './pages/public/About';
// import Pricing from './pages/public/Pricing';
// import Contact from './pages/public/Contact';
// import { AuthProvider } from '@/hooks/auth/useAuth';
// // Import hooks and components
// import { useAuth } from './hooks/auth/useAuth';
// import CorporateLayout from './components/layout/CorporateLayout';

// // Protected Route Component
// function ProtectedRoute({ children }) {
//   const { isAuthenticated, loading } = useAuth();
//   // In your root component
// useEffect(() => {
//   const initialize = async () => {
//     await authStore.initialize();
//     await corporateStore.initialize();
//   };
//   initialize();
// }, []);
//   if (loading) {
//     return (
//       <div className="min-h-screen bg-background-light flex items-center justify-center">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
//           <p className="text-text-light">Loading...</p>
//         </div>
//       </div>
//     );
//   }
  
//   return isAuthenticated ? children : <Navigate to="/auth/login" replace />;
// }

// // Public Route Component  
// function PublicRoute({ children }) {
//   const { isAuthenticated, loading } = useAuth();
  
//   if (loading) {
//     return (
//       <div className="min-h-screen bg-background-light flex items-center justify-center">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
//           <p className="text-text-light">Loading...</p>
//         </div>
//       </div>
//     );
//   }
  
//   return !isAuthenticated ? children : <Navigate to="/app/dashboard" replace />;
// }

// function App() {
//   return (
//     //  <AuthProvider>
//     // <Router>
//     //   <div className="App">
//     //     <Routes>
//     //       {/* Public Routes */}
//     //       <Route path="/" element={<PublicLayout />}>
//     //         <Route index element={<Home />} />
//     //       </Route>

//     //       {/* Auth Routes */}
//     //       <Route path="/auth" element={<AuthLayout />}>
//     //         <Route path="login" element={
//     //           <PublicRoute>
//     //             <Login />
//     //           </PublicRoute>
//     //         } />
//     //         <Route path="signup" element={
//     //           <PublicRoute>
//     //             <Signup />
//     //           </PublicRoute>
//     //         } />
//     //         <Route index element={<Navigate to="/auth/login" replace />} />
//     //       </Route>

//     //       {/* Protected App Routes */}
//     //       <Route path="/app" element={
//     //         <ProtectedRoute>
//     //           <Layout />
//     //         </ProtectedRoute>
//     //       }>
//     //         <Route index element={<Navigate to="/app/dashboard" replace />} />
//     //         <Route path="dashboard" element={<Dashboard />} />
//     //         <Route path="profile" element={<Profile />} />
//     //         <Route path="settings" element={<Settings />} />
            
//     //         {/* Course Routes */}
//     //         <Route path="courses" element={<MyCourses />} />
//     //         <Route path="courses/catalog" element={<CourseCatalog />} />
            
//     //         {/* Add more nested routes as needed */}
//     //         <Route path="progress" element={<div className="p-6">Progress Page</div>} />
//     //         <Route path="certificates" element={<div className="p-6">Certificates</div>} />
//     //       </Route>

//     //       {/* Redirect old routes to new structure */}
//     //       <Route path="/dashboard" element={<Navigate to="/app/dashboard" replace />} />
//     //       <Route path="/profile" element={<Navigate to="/app/profile" replace />} />
//     //       <Route path="/settings" element={<Navigate to="/app/settings" replace />} />
//     //       <Route path="/courses" element={<Navigate to="/app/courses" replace />} />
//     //       <Route path="/login" element={<Navigate to="/auth/login" replace />} />
//     //       <Route path="/signup" element={<Navigate to="/auth/signup" replace />} />
//     //       <Route path="/settings" element={<Navigate to="/app/settings" replace />} />

//     //       {/* Catch all route */}
//     //       <Route path="*" element={<Navigate to="/" replace />} />
//     //     </Routes>
        
//     //     {/* Toast Notifications */}
//     //     <Toaster
//     //       position="top-right"
//     //       toastOptions={{
//     //         duration: 4000,
//     //         style: {
//     //           background: '#374151',
//     //           color: '#fff',
//     //         },
//     //       }}
//     //     />
//     //   </div>
//     // </Router>
//     //   </AuthProvider>
//      <AuthProvider>
//       <Router>
//         <div className="App">
//           <Routes>
//             {/* Public Routes */}
//             <Route path="/" element={<PublicLayout />}>
//               <Route index element={<Home />} />
//               <Route path="about" element={<About />} />
//               <Route path="pricing" element={<Pricing />} />
//               <Route path="contact" element={<Contact />} />
//             </Route>

//             {/* Auth Routes */}
//             <Route path="/auth" element={<AuthLayout />}>
//               <Route path="login" element={
//                 <PublicRoute>
//                   <Login />
//                 </PublicRoute>
//               } />
//               <Route path="signup" element={
//                 <PublicRoute>
//                   <Signup />
//                 </PublicRoute>
//               } />
//               <Route index element={<Navigate to="/auth/login" replace />} />
//             </Route>

//             {/* Protected Individual User Routes */}
//             <Route path="/app" element={
//               <ProtectedRoute>
//                 <Layout />
//               </ProtectedRoute>
//             }>
//               <Route index element={<Navigate to="/app/dashboard" replace />} />
//               <Route path="dashboard" element={<Dashboard />} />
//               <Route path="profile" element={<Profile />} />
//               <Route path="settings" element={<Settings />} />
              
//               {/* Course Routes */}
//               <Route path="courses" element={<MyCourses />} />
//               <Route path="courses/catalog" element={<CourseCatalog />} />
//             </Route>

//             {/* Corporate Routes */}
//             <Route path="/company" element={
//               <ProtectedRoute>
//                 <CorporateLayout>
//                   <Layout /> {/* Or a specific CorporateLayout component */}
//                 </CorporateLayout>
//               </ProtectedRoute>
//             }>
//               <Route index element={<Navigate to="/company/dashboard" replace />} />
//               <Route path="dashboard" element={<CompanyDashboard />} />
//               <Route path="employees" element={<EmployeeManagement />} />
//               <Route path="reports" element={<Reports />} />
//               <Route path="settings" element={<CompanySettings />} />
//             </Route>

//             {/* Redirect old routes */}
//             <Route path="/dashboard" element={<Navigate to="/app/dashboard" replace />} />
//             <Route path="/profile" element={<Navigate to="/app/profile" replace />} />
//             <Route path="/settings" element={<Navigate to="/app/settings" replace />} />
//             <Route path="/courses" element={<Navigate to="/app/courses" replace />} />
//             <Route path="/login" element={<Navigate to="/auth/login" replace />} />
//             <Route path="/signup" element={<Navigate to="/auth/signup" replace />} />

//             {/* Catch all route */}
//             <Route path="*" element={<Navigate to="/" replace />} />
//           </Routes>
          
//           <Toaster position="top-right" />
//         </div>
//       </Router>
//     </AuthProvider>

//   );
// }

// export default App;
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Pages
import Home from './pages/public/Home';
import About from './pages/public/About';
import Pricing from './pages/public/Pricing';
import Contact from './pages/public/Contact';
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import Dashboard from './pages/dashboard/Dashboard';
import Profile from './pages/dashboard/Profile';
import Settings from './pages/dashboard/Settings';
import CourseCatalog from './pages/courses/CourseCatalog';
import MyCourses from './pages/courses/MyCourses';
import CourseDetail from './pages/courses/CourseDetail';
import LessonView from './pages/courses/LessonView';
import CourseCompletion from './pages/courses/CourseCompletion';
import CompanyDashboard from '@/pages/corporate/CompanyDashboard';
import EmployeeManagement from '@/pages/corporate/EmployeeManagement';
import Reports from '@/pages/corporate/Reports';
import AcceptInvitation from '@/pages/corporate/AcceptInvitation';
import NotFound from '@/components/common/NotFound';

// Components
import Layout from '@/components/layout/Layout';
import CorporateLayout from '@/components/layout/CorporateLayout';
import FullPageLoader from '@/components/ui/FullPageLoader';
import CorporateGuard from '@/components/auth/CorporateGuard';
import AdminGuard from './components/auth/AdminGuard';

// Hooks
import { AuthProvider } from '@/hooks/auth/useAuth';
import { useAuth } from '@/hooks/auth/useAuth';

function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return <FullPageLoader />;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function PublicRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return <FullPageLoader />;
  }
  
  return !isAuthenticated ? children : <Navigate to="/app/dashboard" replace />;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Layout publicLayout />}>
            <Route index element={<Home />} />
            <Route path="about" element={<About />} />
            <Route path="pricing" element={<Pricing />} />
            <Route path="contact" element={<Contact />} />
          </Route>

          {/* Auth Routes */}
          <Route path="/auth" element={<Layout authLayout />}>
            <Route path="login" element={<PublicRoute><Login /></PublicRoute>} />
            <Route path="signup" element={<PublicRoute><Signup /></PublicRoute>} />
            <Route path="forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
            <Route path="reset-password" element={<PublicRoute><ResetPassword /></PublicRoute>} />
            <Route index element={<Navigate to="/auth/login" replace />} />
          </Route>

          {/* Individual User Routes */}
          <Route path="/app" element={<ProtectedRoute><Layout userLayout /></ProtectedRoute>}>
            <Route index element={<Navigate to="/app/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="profile" element={<Profile />} />
            <Route path="settings" element={<Settings />} />
            
            <Route path="courses">
              <Route index element={<MyCourses />} />
              <Route path="catalog" element={<CourseCatalog />} />
              <Route path=":courseId" element={<CourseDetail />} />
              <Route path=":courseId/lesson/:lessonId" element={<LessonView />} />
              <Route path=":courseId/completion" element={<CourseCompletion />} />
            </Route>
          </Route>

          {/* Corporate Routes */}
          <Route path="/corporate" element={
            <ProtectedRoute>
              <CorporateGuard>
                <Layout corporateLayout />
              </CorporateGuard>
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="/company/dashboard" replace />} />
            <Route path="dashboard" element={<CompanyDashboard />} />
            
            <Route path="employees">
              <Route index element={
                <AdminGuard requirePermission="invite_employees">
                  <EmployeeManagement />
                </AdminGuard>
              } />
            </Route>
            
            <Route path="reports">
              <Route index element={
                <AdminGuard requirePermission="view_reports">
                  <Reports />
                </AdminGuard>
              } />
            </Route>
          </Route>

          {/* Special Routes */}
          <Route path="/accept-invitation" element={<ProtectedRoute><AcceptInvitation /></ProtectedRoute>} />

          {/* Redirect old routes */}
          <Route path="/dashboard" element={<Navigate to="/app/dashboard" replace />} />
          <Route path="/profile" element={<Navigate to="/app/profile" replace />} />
          <Route path="/settings" element={<Navigate to="/app/settings" replace />} />
          <Route path="/courses" element={<Navigate to="/app/courses" replace />} />
          <Route path="/login" element={<Navigate to="/auth/login" replace />} />
          <Route path="/signup" element={<Navigate to="/auth/signup" replace />} />

          {/* Catch all route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#374151',
              color: '#fff',
            },
          }}
        />
      </Router>
    </AuthProvider>
  );
}

export default App;