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
    <div className="min-h-screen bg-background-light flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary relative">
        <div className="flex items-center justify-center w-full">
          <div className="text-white text-center">
            <div className="h-16 w-16 bg-white bg-opacity-20 rounded-xl flex items-center justify-center mx-auto mb-8">
              <span className="text-2xl font-bold">K</span>
            </div>
            <h1 className="text-3xl font-bold mb-4">Kyzer LMS</h1>
            <p className="text-lg opacity-90">
              Empowering learning for individuals and teams
            </p>
          </div>
        </div>
      </div>

      {/* Right side - Auth forms */}
      <div className="flex-1 flex items-center justify-center px-6 lg:px-8">
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
