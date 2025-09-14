// src/components/auth/CourseManagementGuard.jsx
import { Navigate } from 'react-router-dom';
import { useCoursePermissions } from '@/hooks/courses/useCoursePermissions';
import { Loader } from 'lucide-react';

export default function CourseManagementGuard({ children }) {
  const { canViewCourseManagement, loading } = useCoursePermissions();

  // Show loading while checking permissions
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!canViewCourseManagement) {
    // Redirect to dashboard with error message
    return <Navigate to="/app/dashboard" replace />;
  }

  return children;
}
