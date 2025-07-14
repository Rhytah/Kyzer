import React from 'react';
import { Outlet } from 'react-router-dom';

const PublicLayout = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* You can add a public header here if needed */}
      <main>
        <Outlet />
      </main>
      {/* You can add a footer here if needed */}
    </div>
  );
};

export default PublicLayout;