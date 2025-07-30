// src/components/auth/AdminGuard.jsx
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/auth/useAuth";
import { useCorporate } from "@/hooks/corporate/useCorporate";

const AdminGuard = ({ children, requirePermission, fallbackComponent = null }) => {
  const { user, loading } = useAuth();
  const { permissions, loading: corpLoading } = useCorporate();

  // Show loading spinner while checking auth
  if (loading || corpLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Not logged in - redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check if user has the required permission
  if (requirePermission && !permissions?.[requirePermission]) {
    // Show fallback component or access denied message
    if (fallbackComponent) {
      return fallbackComponent;
    }
    
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  // User has required permissions - render children
  return children;
};

export default AdminGuard;