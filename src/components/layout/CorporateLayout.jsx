import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import Breadcrumbs from './Breadcrumbs';

const CorporateLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
