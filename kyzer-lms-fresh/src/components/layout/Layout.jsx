import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Home, BookOpen, Award, BarChart3, Settings } from 'lucide-react';

const Layout = () => {
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'My Courses', href: '/courses', icon: BookOpen },
    { name: 'Progress', href: '/progress', icon: BarChart3 },
    { name: 'Certificates', href: '/certificates', icon: Award },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-background-light">
      {/* Header */}
      <header className="bg-white border-b border-border shadow-sm">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to="/dashboard" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
                <span className="text-white font-bold text-sm">K</span>
              </div>
              <span className="text-xl font-semibold text-text-dark">Kyzer LMS</span>
            </Link>
            
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-background-medium rounded-full flex items-center justify-center">
                <span className="text-text-medium text-sm">U</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <nav className="hidden lg:block w-64 bg-white border-r border-border min-h-screen">
          <div className="p-4 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`
                    flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors
                    ${isActive(item.href)
                      ? 'bg-primary text-white' 
                      : 'text-text-medium hover:text-text-dark hover:bg-background-light'
                    }
                  `}
                >
                  <Icon size={20} className="mr-3" />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1">
          <Outlet />
        </main>
      </div>

      {/* Mobile Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-border">
        <div className="flex justify-around py-2">
          {navigation.slice(0, 4).map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`
                  flex flex-col items-center justify-center px-3 py-2 min-w-0 flex-1
                  ${isActive(item.href) ? 'text-primary' : 'text-text-muted'}
                `}
              >
                <Icon size={20} className="mb-1" />
                <span className="text-xs">{item.name}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default Layout;