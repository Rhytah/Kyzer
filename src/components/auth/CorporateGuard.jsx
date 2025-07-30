// src/components/auth/CorporateGuard.jsx
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/auth/useAuth";
import { useCorporate } from "@/hooks/corporate/useCorporate";

const CorporateGuard = ({ children, redirectTo = "/app/dashboard" }) => {
  const { user, loading } = useAuth();
  const { organization, loading: corpLoading } = useCorporate();

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

  // User is not part of a corporate account
  if (!organization) {
    return <Navigate to={redirectTo} replace />;
  }

  // User has corporate access - render children
  return children;
};

export default CorporateGuard;