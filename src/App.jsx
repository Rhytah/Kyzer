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
          <Route path="/company" element={
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