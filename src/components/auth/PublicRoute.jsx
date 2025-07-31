// src/components/auth/PublicRoute.jsx - BONUS: For auth pages
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/hooks/auth/useAuth';

export default function PublicRoute({ 
  children, 
  redirectTo = "/app/dashboard" 
}) {
  // ✅ useAuth is called INSIDE the component function
  const { isAuthenticated, loading } = useAuth();
  
  // Only redirect if we're certain user is authenticated
  if (!loading && isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }
  
  // Always show login/signup forms immediately
  return children || <Outlet />;
}