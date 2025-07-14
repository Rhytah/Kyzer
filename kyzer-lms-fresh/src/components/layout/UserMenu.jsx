import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Settings, LogOut, ChevronDown, Building } from 'lucide-react';
import { useAuth } from '@hooks/auth/useAuth';

const UserMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();
  const { user, logout } = useAuth();
   const isCorporateUser = user?.user_metadata?.account_type === 'corporate';

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/auth/login');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsOpen(false);
    }
  };

  // Determine routes based on user type
  const profileRoute = isCorporateUser ? '/corporate/settings' : '/app/profile';
  const settingsRoute = isCorporateUser ? '/corporate/settings' : '/app/settings';

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 p-2 rounded-lg text-text-medium hover:text-text-dark hover:bg-background-light transition-colors"
      >
        <div className="w-8 h-8 bg-background-medium rounded-full flex items-center justify-center">
          <span className="text-text-medium text-sm font-medium">
            {user?.user_metadata?.first_name?.[0] || user?.email?.[0]?.toUpperCase() || 'U'}
          </span>
        </div>
        <ChevronDown 
          size={16} 
          className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-border z-50">
          <div className="py-2">
            {/* User Info */}
            <div className="px-4 py-3 border-b border-border">
              <p className="text-sm font-medium text-text-dark">
                {user?.user_metadata?.first_name || user?.email?.split('@')[0] || 'User'}
              </p>
              <p className="text-xs text-text-muted truncate">
                {user?.email}
              </p>
              {isCorporateUser && (
                <div className="flex items-center mt-1">
                  <Building size={12} className="mr-1 text-primary" />
                  <span className="text-xs text-primary font-medium">Corporate Account</span>
                </div>
              )}
            </div>

            {/* Menu Items */}
            <Link
              to={profileRoute}
              className="flex items-center px-4 py-2 text-sm text-text-medium hover:text-text-dark hover:bg-background-light transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <User size={16} className="mr-3" />
              Profile
            </Link>

            <Link
              to={settingsRoute}
              className="flex items-center px-4 py-2 text-sm text-text-medium hover:text-text-dark hover:bg-background-light transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <Settings size={16} className="mr-3" />
              Settings
            </Link>

            {/* Switch Account Type (if applicable) */}
            {isCorporateUser && (
              <Link
                to="/app/dashboard"
                className="flex items-center px-4 py-2 text-sm text-text-medium hover:text-text-dark hover:bg-background-light transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <User size={16} className="mr-3" />
                Personal Dashboard
              </Link>
            )}

            <hr className="my-1 border-border" />

            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors"
            >
              <LogOut size={16} className="mr-3" />
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserMenu;
