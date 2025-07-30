import React, { useRef, useState } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import Breadcrumbs from './Breadcrumbs';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import useCorporate from '@/hooks/corporate/useCorporate';
const CorporateLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isLoading, isCorporateUser } = useCorporate();
  // In CorporateLayout
const previousPath = useRef(location.pathname);

useEffect(() => {
  if (location.pathname === previousPath.current) {
    console.error('Redirect loop detected at', location.pathname);
    return <Navigate to="/error" state={{ error: 'Redirect loop' }} replace />;
  }
  previousPath.current = location.pathname;
}, [location]);
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

    if (!isCorporateUser) {
    return <Navigate to="/app/dashboard" replace />;
  }
  return (
    <div className="min-h-screen bg-background-light">
      {/* Corporate indicator */}
      <div className="bg-primary-dark text-white text-center py-1 text-sm font-medium">
        Corporate Account
      </div>

      {/* Header */}
      <Header onMenuClick={() => setSidebarOpen(true)} />

      <div className="flex">
        {/* Desktop Sidebar */}
        <Sidebar />

        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <>
            <div 
              className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
              onClick={() => setSidebarOpen(false)}
            />
            <div className="lg:hidden fixed left-0 top-0 h-full w-64 bg-white z-50 transform transition-transform duration-300">
              <Sidebar mobile onClose={() => setSidebarOpen(false)} />
            </div>
          </>
        )}

        {/* Main Content */}
        <main className="flex-1 lg:ml-64">
          <div className="p-6 pb-20 lg:pb-6">
            <Breadcrumbs />
            <Outlet />
          </div>
        </main>
      </div>

      {/* No mobile navigation for corporate - they use the sidebar */}
    </div>
  );
};

export default CorporateLayout;
