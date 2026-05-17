import React from 'react';
import { Outlet } from 'react-router-dom';
import PublicNav from './PublicNav';

const PublicLayout = () => {
  return (
    <div className="min-h-screen min-w-0 max-w-full overflow-x-hidden bg-background-light">
      <PublicNav />
      <main className="w-full min-w-0 max-w-full" style={{ width: '-webkit-fill-available' }}>
        <Outlet />
      </main>
      {/* You can add a footer here if needed */}
    </div>
  );
};

export default PublicLayout;