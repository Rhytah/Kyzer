import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '@hooks/auth/useAuth';

const AuthLayout = () => {
  const { isAuthenticated } = useAuth();

  // Redirect authenticated users
  if (isAuthenticated) {
    return <Navigate to="/app/dashboard" replace />;
  }

  return (

      <div className="flex-1 flex items-center justify-center">
        <div className="w-full">
          <Outlet />
        </div>
      </div>
  );
};

export default AuthLayout;
