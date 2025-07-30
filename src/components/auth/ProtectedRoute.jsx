// import { Navigate, useLocation } from "react-router-dom";
// import { useAuth } from "../../hooks/auth/useAuth";
// import LoadingSpinner from "../ui/LoadingSpinner";

// const ProtectedRoute = ({ children, requiredRole = null }) => {
//   const { isAuthenticated, loading, profile } = useAuth();
//   const location = useLocation();

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-background-light flex items-center justify-center">
//         <LoadingSpinner size="lg" />
//       </div>
//     );
//   }

//   if (!isAuthenticated) {
//     // Redirect to login with return url
//     return <Navigate to="/login" state={{ from: location }} replace />;
//   }

//   // Check role-based access
//   if (requiredRole && profile?.role !== requiredRole) {
//     return <Navigate to="/dashboard" replace />;
//   }

//   return children;
// };

// export default ProtectedRoute;
// src/components/auth/ProtectedRoute.jsx
import { Navigate, useLocation, Outlet } from "react-router-dom";
import { useAuth } from "@/hooks/auth/useAuth";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Not authenticated - redirect to login with return path
  if (!user) {
    return (
      <Navigate 
        to="/login" 
        state={{ from: location.pathname }} 
        replace 
      />
    );
  }

  // User is authenticated - render children or outlet for nested routes
  return children || <Outlet />;
};

export default ProtectedRoute;