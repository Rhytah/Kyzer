import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '@/hooks/auth/useAuth';
import Header from './Header';
import Sidebar from './Sidebar';
import MobileNav from './MobileNav';
import Breadcrumbs from './Breadcrumbs';
import { useToast, ToastContainer } from '@/components/ui';

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [desktopSidebarCollapsed, setDesktopSidebarCollapsed] = useState(false);
  const { user } = useAuth();
  const { toasts, removeToast } = useToast();
  const isCorporateUser = user?.user_metadata?.account_type === 'corporate';
  const currentUser = user?.user_metadata;
  const toggleDesktopSidebar = () => {
    setDesktopSidebarCollapsed(!desktopSidebarCollapsed);
  };

  const toggleMobileSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
   const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background-light">
      {/* Header */}
     {user && <Header 
        onMenuClick={toggleMobileSidebar} 
        showMenuButton={!!user}
      />
}
      <div className="flex">
        {/* Desktop Sidebar - only visible when signed in */}
        {user && (
          <div className={`hidden lg:block transition-all duration-300 ease-in-out 
            ${desktopSidebarCollapsed ? 'w-20' : 'w-64'}`}>
            <Sidebar 
              collapsed={desktopSidebarCollapsed}
              isCorporateRoute={isCorporateUser} 
              company={user?.user_metadata?.company_name}
              onToggleCollapse={toggleDesktopSidebar}
              currentUser={currentUser}
            />
          </div>
        )}

        {/* Mobile Sidebar Overlay */}
        {user && sidebarOpen && (
          <>
            <div 
              className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
              onClick={() => setSidebarOpen(false)}
            />
            <div className="lg:hidden fixed left-0 top-0 h-full w-64 bg-background-white z-50">
              <Sidebar 
                mobile 
                onClose={() => setSidebarOpen(false)} 
                isCorporateRoute={isCorporateUser} 
                company={user?.user_metadata?.company_name} 
                currentUser={currentUser}
              />
            </div>
          </>
        )}

        {/* Main Content */}
        <main className={`flex-1 transition-all duration-300 ease-in-out  mr-4 mt-6 ${
          desktopSidebarCollapsed ? 'ml-2' : 'ml-2'
        }`}>
          <div className="pb-10 lg:pb-6">
            <Breadcrumbs />
            <Outlet />
          </div>
        </main>
      </div>

      {/* Mobile Navigation */}
      {user && <MobileNav />}
      
      {/* Toast Container */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
};