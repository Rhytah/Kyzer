import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';

const PublicLayout = () => {
  return (
    <div className="min-h-screen bg-background-light">
      <Header onMenuClick={() => {}} />
      <main>
        <Outlet />
      </main>
      {/* You can add a footer here if needed */}
    </div>
  );
};

export default PublicLayout;