// App.jsx - Refactored with no loading blocks and clean routing structure
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

// Layout Components
import PublicLayout from '@/components/layout/PublicLayout';
import DashboardLayout from '@/components/layout/DashboardLayout';
import CorporateLayout from '@/components/layout/CorporateLayout';
import FullPageLoader from '@/components/ui/FullPageLoader';

// Guards
import CorporateGuard from '@/components/auth/CorporateGuard';
import AdminGuard from './components/auth/AdminGuard';

// Hooks
import { AuthProvider } from '@/hooks/auth/useAuth';
import { useAuth } from '@/hooks/auth/useAuth';

// ===========================================
// ROUTE WRAPPER COMPONENTS
// ===========================================

// Protected Route - requires authentication
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

// Public Route - shows forms immediately, redirects authenticated users
function PublicRoute({ children, redirectTo = "/app/dashboard" }) {
  const { isAuthenticated, isLoading } = useAuth();
  
  // Only redirect if we're certain user is authenticated (no loading block!)
  if (!isLoading && isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }
  
  // Always show login/signup forms immediately, even while auth is loading
  return children;
}

// Guest Route - accessible to everyone, no redirects
function GuestRoute({ children }) {
  const { isLoading } = useAuth();
  
  if (isLoading) {
    return <FullPageLoader />;
  }
  
  return children;
}

// Root redirect component
function RootRedirect() {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return <FullPageLoader />;
  }
  
  // Redirect based on auth status
  return isAuthenticated 
    ? <Navigate to="/app/dashboard" replace />
    : <Navigate to="/" replace />;
}

// ===========================================
// MAIN APP COMPONENT
// ===========================================

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* ===== PUBLIC MARKETING ROUTES ===== */}
          <Route path="/" element={<PublicLayout />}>
            <Route index element={<Home />} />
            <Route path="about" element={<About />} />
            <Route path="pricing" element={<Pricing />} />
            <Route path="contact" element={<Contact />} />
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
            <Route path="courses/:courseId" element={<CourseDetail />} />
            <Route path="courses/:courseId/lesson/:lessonId" element={<LessonView />} />
            <Route path="courses/:courseId/completion" element={<CourseCompletion />} />
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
          <Route path="/login" element={<Navigate to="/auth/login" replace />} />
          <Route path="/signup" element={<Navigate to="/auth/signup" replace />} />
          <Route path="/dashboard" element={<Navigate to="/app/dashboard" replace />} />
          <Route path="/profile" element={<Navigate to="/app/profile" replace />} />
          <Route path="/settings" element={<Navigate to="/app/settings" replace />} />
          <Route path="/courses" element={<Navigate to="/app/courses" replace />} />

          {/* ===== ROOT REDIRECT ===== */}
          <Route path="/root" element={<RootRedirect />} />

          {/* ===== 404 CATCH ALL ===== */}
          <Route path="*" element={<NotFound />} />
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
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#059669',
                secondary: '#fff',
              },
            },
            error: {
              duration: 5000,
              iconTheme: {
                primary: '#DC2626',
                secondary: '#fff',
              },
            },
          }}
        />
      </Router>
    </AuthProvider>
  );
}

export default App;