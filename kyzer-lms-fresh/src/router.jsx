import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { useAuth } from '@hooks/auth/useAuth';

// Layouts
import Layout from '@components/layout/Layout';
import AuthLayout from '@components/layout/AuthLayout';
import PublicLayout from '@components/layout/PublicLayout';
import CorporateLayout from '@components/layout/CorporateLayout';

// Auth Pages
import Login from '@pages/auth/Login';
import Signup from '@pages/auth/Signup';
import ResetPassword from '@pages/auth/ResetPassword';
import VerifyEmail from '@pages/auth/VerifyEmail';

// Public Pages
import Home from '@pages/public/Home';
import About from '@pages/public/About';
import Pricing from '@pages/public/Pricing';
import Contact from '@pages/public/Contact';

// Dashboard Pages
import Dashboard from '@pages/dashboard/Dashboard';
import Profile from '@pages/dashboard/Profile';
import Settings from '@pages/dashboard/Settings';

// Course Pages
import CourseCatalog from '@pages/courses/CourseCatalog';
import CourseDetail from '@pages/courses/CourseDetail';
import LessonView from '@pages/courses/LessonView';
import MyCourses from '@pages/courses/MyCourses';
import CourseCompletion from '@pages/courses/CourseCompletion';

// Corporate Pages
import CompanyDashboard from '@pages/corporate/CompanyDashboard';
import EmployeeManagement from '@pages/corporate/EmployeeManagement';
import Reports from '@pages/corporate/Reports';
import CompanySettings from '@pages/corporate/CompanySettings';

// Other Pages
import Progress from '@pages/dashboard/Progress';
import Certificates from '@pages/dashboard/Certificates';
import NotFound from '@components/common/NotFound';

// Route Guards
import ProtectedRoute from '@components/auth/ProtectedRoute';
import CorporateRoute from '@components/auth/CorporateRoute';

const router = createBrowserRouter([
  // Public Routes
  {
    path: '/',
    element: <PublicLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'about', element: <About /> },
      { path: 'pricing', element: <Pricing /> },
      { path: 'contact', element: <Contact /> },
    ],
  },

  // Auth Routes
  {
    path: '/auth',
    element: <AuthLayout />,
    children: [
      { path: 'login', element: <Login /> },
      { path: 'signup', element: <Signup /> },
      { path: 'reset-password', element: <ResetPassword /> },
      { path: 'verify-email', element: <VerifyEmail /> },
      { index: true, element: <Navigate to="/auth/login" replace /> },
    ],
  },

  // Protected Individual User Routes
  {
    path: '/app',
    element: (
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ),
    children: [
      // Dashboard
      { index: true, element: <Navigate to="/app/dashboard" replace /> },
      { path: 'dashboard', element: <Dashboard /> },
      
      // Courses
      {
        path: 'courses',
        children: [
          { index: true, element: <MyCourses /> },
          { path: 'catalog', element: <CourseCatalog /> },
          { path: ':courseId', element: <CourseDetail /> },
          { path: ':courseId/lesson/:lessonId', element: <LessonView /> },
          { path: ':courseId/completion', element: <CourseCompletion /> },
        ],
      },

      // Progress & Learning
      { path: 'progress', element: <Progress /> },
      { path: 'certificates', element: <Certificates /> },

      // User Management
      { path: 'profile', element: <Profile /> },
      { path: 'settings', element: <Settings /> },
    ],
  },

  // Corporate Routes
  {
    path: '/corporate',
    element: (
      <CorporateRoute>
        <CorporateLayout />
      </CorporateRoute>
    ),
    children: [
      { index: true, element: <Navigate to="/corporate/dashboard" replace /> },
      { path: 'dashboard', element: <CompanyDashboard /> },
      { path: 'employees', element: <EmployeeManagement /> },
      { path: 'reports', element: <Reports /> },
      { path: 'settings', element: <CompanySettings /> },
    ],
  },

  // Catch-all route
  { path: '*', element: <NotFound /> },
]);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}
