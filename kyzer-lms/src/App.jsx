// import { Routes, Route, Navigate } from 'react-router-dom'
// import { useAuth } from './hooks/auth/useAuth'
// import Layout from './components/layout/Layout'
// import ErrorBoundary from './components/common/ErrorBoundary'

// // Auth pages
// import Login from './pages/auth/Login'
// import Signup from './pages/auth/Signup'
// import ResetPassword from './pages/auth/ResetPassword'

// // Protected pages
// import Dashboard from './pages/dashboard/Dashboard'
// import Profile from './pages/dashboard/Profile'
// import CourseCatalog from './pages/courses/CourseCatalog'
// import MyCourses from './pages/courses/MyCourses'

// // Public pages
// import Home from './pages/public/Home'

// // Components
// import ProtectedRoute from './components/auth/ProtectedRoute'
// import LoadingSpinner from './components/ui/LoadingSpinner'

// function App() {
//   const { loading, isAuthenticated } = useAuth()

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-background-light flex items-center justify-center">
//         <LoadingSpinner size="lg" />
//       </div>
//     )
//   }

//   return (
//     <ErrorBoundary>
//       <Routes>
//         {/* Public routes */}
//         <Route path="/" element={<Home />} />
        
//         {/* Auth routes - redirect if already authenticated */}
//         <Route 
//           path="/auth/login" 
//           element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />} 
//         />
//         <Route 
//           path="/auth/signup" 
//           element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Signup />} 
//         />
//         <Route 
//           path="/auth/reset-password" 
//           element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <ResetPassword />} 
//         />

//         {/* Protected routes with layout */}
//         <Route path="/" element={<Layout />}>
//           <Route 
//             path="dashboard" 
//             element={
//               <ProtectedRoute>
//                 <Dashboard />
//               </ProtectedRoute>
//             } 
//           />
//           <Route 
//             path="profile" 
//             element={
//               <ProtectedRoute>
//                 <Profile />
//               </ProtectedRoute>
//             } 
//           />
//           <Route 
//             path="courses" 
//             element={
//               <ProtectedRoute>
//                 <CourseCatalog />
//               </ProtectedRoute>
//             } 
//           />
//           <Route 
//             path="my-courses" 
//             element={
//               <ProtectedRoute>
//                 <MyCourses />
//               </ProtectedRoute>
//             } 
//           />
//         </Route>

//         {/* Catch all route */}
//         <Route path="*" element={<Navigate to="/" replace />} />
//       </Routes>
//     </ErrorBoundary>
//   )
// }

// export default App;

// src/App.jsx
import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'

// Import components
import Layout from './components/layout/Layout'
import Login from './pages/auth/Login'
import Signup from './pages/auth/Signup'
import Dashboard from './pages/dashboard/Dashboard'
import Profile from './pages/dashboard/Profile'
import Settings from './pages/dashboard/Settings'
import CourseCatalog from './pages/courses/CourseCatalog'
import MyCourses from './pages/courses/MyCourses'
import Home from './pages/public/Home'

// Import hooks
import { useAuth } from './hooks/auth/useAuth'

// Protected Route Component
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()
  
  if (loading) {
    return (
      <div className="min-h-screen bg-background-light flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-text-light">Loading...</p>
        </div>
      </div>
    )
  }
  
  return isAuthenticated ? children : <Navigate to="/login" replace />
}

// Public Route Component
function PublicRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()
  
  if (loading) {
    return (
      <div className="min-h-screen bg-background-light flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-text-light">Loading...</p>
        </div>
      </div>
    )
  }
  
  return !isAuthenticated ? children : <Navigate to="/dashboard" replace />
}

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          
          {/* Auth Routes */}
          <Route 
            path="/login" 
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            } 
          />
          <Route 
            path="/signup" 
            element={
              <PublicRoute>
                <Signup />
              </PublicRoute>
            } 
          />
          
          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Layout>
                  <Profile />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Layout>
                  <Settings />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/courses"
            element={
              <ProtectedRoute>
                <Layout>
                  <CourseCatalog />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-courses"
            element={
              <ProtectedRoute>
                <Layout>
                  <MyCourses />
                </Layout>
              </ProtectedRoute>
            }
          />
          
          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        
        {/* Toast Notifications */}
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
      </div>
    </Router>
  )
}

export default App;