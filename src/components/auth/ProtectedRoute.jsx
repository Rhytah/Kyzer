// src/components/auth/ProtectedRoute.jsx - SAFE VERSION
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/hooks/auth/useAuth';
import FullPageLoader from '@/components/ui/FullPageLoader';

export default function ProtectedRoute({ children, redirectTo = "/login" }) {
  // ✅ useAuth is called INSIDE the component function
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <FullPageLoader />;
  }
  
  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  return children || <Outlet />;
}
