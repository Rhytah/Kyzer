import { Navigate, useLocation } from 'react-router-dom';
import { useCorporatePermissions } from '@/store/corporateStore';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { toast } from 'react-hot-toast';

export default function AdminGuard({ 
  children, 
  requirePermission = null,
  redirectTo = '/corporate/dashboard'
}) {
  const location = useLocation();
  const { permissions, isLoading } = useCorporatePermissions();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // If no specific permission required, just check for admin access
  if (!requirePermission) {
    if (permissions?.isAdmin) {
      return children;
    }
    toast.error('Admin access required');
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Check specific permission
  if (permissions?.[requirePermission] !== true) {
    toast.error(`You need "${requirePermission}" permission`);
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  return children;
}