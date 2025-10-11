// App.jsx - FIXED: Route components moved inside AuthProvider context
import { BrowserRouter as Router, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Pages
import Home from './pages/public/Home';
import About from './pages/public/About';
import Pricing from './pages/public/Pricing';
import Contact from './pages/public/Contact';
import ThemeDemo from './pages/public/ThemeDemo';
import Login from './pages/auth/Login';
import Signup from './pages/auth/SignUp';
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
import CourseLearning from './pages/courses/CourseLearning';
import Progress from './pages/dashboard/Progress';
import Certificates from './pages/dashboard/Certificates';
import CompanyDashboard from '@/pages/corporate/CompanyDashboard';
import EmployeeManagement from '@/pages/corporate/EmployeeManagement';
import Reports from '@/pages/corporate/Reports';
import CompanySettings from '@/pages/corporate/CompanySettings';
import AcceptInvitation from '@/pages/corporate/AcceptInvitation';
import NotFound from '@/components/common/NotFound';
import CourseEditor from '@/components/editor/CourseEditor';
import CourseEditorTest from '@/components/editor/CourseEditor.test';

// Layout Components
import PublicLayout from '@/components/layout/PublicLayout';
import DashboardLayout from '@/components/layout/DashboardLayout';
import CorporateLayout from '@/components/layout/CorporateLayout';
import FullPageLoader from '@/components/ui/FullPageLoader';

// Guards
import CorporateGuard from '@/components/auth/CorporateGuard';
import AdminGuard from './components/auth/AdminGuard';

// Legacy Redirect Components
function LegacyCourseRedirect() {
  const { courseId } = useParams();
  return <Navigate to={`/app/courses/${courseId}`} replace />;
}

function LegacyLearningRedirect() {
  const { courseId } = useParams();
  return <Navigate to={`/app/courses/${courseId}`} replace />;
}

function LegacyLessonRedirect() {
  const { courseId, lessonId } = useParams();
  return <Navigate to={`/app/courses/${courseId}/lesson/${lessonId}`} replace />;
}

function LegacyCompletionRedirect() {
  const { courseId } = useParams();
  return <Navigate to={`/app/courses/${courseId}/completion`} replace />;
}

// Hooks
import { AuthProvider, useAuth } from '@/hooks/auth/useAuth';
import { ThemeProvider } from '@/contexts/ThemeContext';

// ===========================================
// MAIN APP COMPONENT
// ===========================================

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <AppRoutes />
          
          {/* Toast Notifications */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: 'var(--color-primary)',
                color: 'var(--color-background-white)',
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: 'var(--color-success)',
                  secondary: 'var(--color-background-white)',
                },
              },
              error: {
                duration: 5000,
                iconTheme: {
                  primary: 'var(--color-error)',
                  secondary: 'var(--color-background-white)',
                },
              },
            }}
          />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

// ===========================================
// ROUTES COMPONENT - Now inside AuthProvider context
// ===========================================

function AppRoutes() {
  // ✅ NOW these route components can use useAuth because they're inside AuthProvider

  // Protected Route - requires authentication
  function ProtectedRoute({ children }) {
    const { isAuthenticated, loading } = useAuth(); // ✅ This works now!
    
    if (loading) {
      return <FullPageLoader />;
    }
    
    if (!isAuthenticated) {
      return <Navigate to="/login" replace />;
    }

    return children;
  }

  // Public Route - shows forms immediately, redirects authenticated users
  function PublicRoute({ children, redirectTo = "/app/dashboard" }) {
    const { isAuthenticated, loading } = useAuth(); // ✅ This works now!
    
    // Only redirect if we're certain user is authenticated
    if (!loading && isAuthenticated) {
      return <Navigate to={redirectTo} replace />;
    }
    
    // Always show login/signup forms immediately, even while auth is loading
    return children;
  }

  // Guest Route - accessible to everyone, no redirects
  function GuestRoute({ children }) {
    const { loading } = useAuth(); // ✅ This works now!
    
    if (loading) {
      return <FullPageLoader />;
    }
    
    return children;
  }

  // Root redirect component
  function RootRedirect() {
    const { isAuthenticated, loading } = useAuth(); // ✅ This works now!
    
    if (loading) {
      return <FullPageLoader />;
    }
    
    return isAuthenticated 
      ? <Navigate to="/app/dashboard" replace />
      : <Navigate to="/" replace />;
  }

  return (
    <Routes>
      {/* ===== PUBLIC MARKETING ROUTES ===== */}
      <Route path="/" element={<PublicLayout />}>
        <Route index element={<Home />} />
        <Route path="about" element={<About />} />
        <Route path="pricing" element={<Pricing />} />
        <Route path="contact" element={<Contact />} />
        <Route path="theme-demo" element={<ThemeDemo />} />
      </Route>

      {/* ===== AUTHENTICATION ROUTES ===== */}
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
      <Route 
        path="/forgot-password" 
        element={
          <PublicRoute>
            <ForgotPassword />
          </PublicRoute>
        } 
      />
      <Route 
        path="/reset-password" 
        element={
          <GuestRoute>
            <ResetPassword />
          </GuestRoute>
        } 
      />

      {/* ===== COURSE CONTENT EDITOR (Full Screen - No Layout) ===== */}
      <Route
        path="/app/editor/:courseId"
        element={
          <ProtectedRoute>
            <CourseEditor />
          </ProtectedRoute>
        }
      />

      {/* ===== INDIVIDUAL USER ROUTES ===== */}
      <Route
        path="/app"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        {/* Dashboard Routes */}
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="profile" element={<Profile />} />
        <Route path="settings" element={<Settings />} />
        {/* Course Routes */}
        <Route path="courses" element={<MyCourses />} />
        <Route path="courses/catalog" element={<CourseCatalog />} />
        <Route path="courses/:courseId" element={<CourseDetail />} end />
        <Route path="courses/:courseId/learning" element={<CourseLearning />} />
        <Route path="courses/:courseId/lesson/:lessonId" element={<LessonView />} />
        <Route path="courses/:courseId/completion" element={<CourseCompletion />} />
        
        {/* Additional Routes */}
        <Route path="progress" element={<Progress />} />
        <Route path="certificates" element={<Certificates />} />
      </Route>

      {/* ===== CORPORATE ROUTES ===== */}
      <Route 
        path="/company" 
        element={
          <ProtectedRoute>
            <CorporateGuard>
              <CorporateLayout />
            </CorporateGuard>
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<CompanyDashboard />} />
        
        <Route 
          path="employees" 
          element={
            <AdminGuard requirePermission="invite_employees">
              <EmployeeManagement />
            </AdminGuard>
          } 
        />
        
        <Route 
          path="reports" 
          element={
            <AdminGuard requirePermission="view_reports">
              <Reports />
            </AdminGuard>
          } 
        />
        
        <Route 
          path="settings" 
          element={
            <AdminGuard requirePermission="manage_settings">
              <CompanySettings />
            </AdminGuard>
          } 
        />
      </Route>

      {/* ===== SPECIAL ROUTES ===== */}
      <Route 
        path="/accept-invitation" 
        element={
          <ProtectedRoute>
            <AcceptInvitation />
          </ProtectedRoute>
        } 
      />

      {/* ===== LEGACY REDIRECTS ===== */}
      <Route path="/auth/login" element={<Navigate to="/login" replace />} />
      <Route path="/auth/signup" element={<Navigate to="/signup" replace />} />
      <Route path="/dashboard" element={<Navigate to="/app/dashboard" replace />} />
      <Route path="/profile" element={<Navigate to="/app/profile" replace />} />
      <Route path="/settings" element={<Navigate to="/app/settings" replace />} />
      <Route path="/courses" element={<Navigate to="/app/courses" replace />} />
      
      {/* Legacy course routes with proper parameter handling */}
      <Route path="/courses/:courseId" element={<LegacyCourseRedirect />} />
      <Route path="/courses/:courseId/learning" element={<LegacyLearningRedirect />} />
      <Route path="/courses/:courseId/lesson/:lessonId" element={<LegacyLessonRedirect />} />
      <Route path="/courses/:courseId/completion" element={<LegacyCompletionRedirect />} />
      
      {/* Additional legacy redirects */}
      <Route path="/corporate" element={<Navigate to="/company" replace />} />
      <Route path="/corporate/*" element={<Navigate to="/company" replace />} />
      <Route path="/admin" element={<Navigate to="/company" replace />} />
      <Route path="/admin/*" element={<Navigate to="/company" replace />} />

      {/* ===== ROOT REDIRECT ===== */}
      <Route path="/root" element={<RootRedirect />} />

      {/* ===== 404 CATCH ALL ===== */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;