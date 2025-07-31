import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, Search, Bell } from 'lucide-react';
import { useAuth } from '@hooks/auth/useAuth';
import kyzerLogo from "../../assets/images/Kyzerlogo.png";
import UserMenu from './UserMenu';

const Header = ({ onMenuClick }) => {
  const [showSearch, setShowSearch] = useState(false);
  const { isCorporateUser } = useAuth();

  // Determine home route based on user type
  const homeRoute = '/';

  return (
    <header className="bg-white border-b border-border shadow-sm sticky top-0 z-30">
      <div className="px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left Section */}
          <div className="flex items-center space-x-4">
            {/* Mobile Menu Button */}
            <button
              onClick={onMenuClick}
              className="lg:hidden p-2 rounded-lg text-text-medium hover:text-text-dark hover:bg-background-light transition-colors"
            >
              <Menu size={20} />
            </button>

            {/* Logo */}
            <Link to={homeRoute} className="flex items-center space-x-2">
              <img src={kyzerLogo} alt="Kyzer Logo" className="h-8" />
            </Link>
          </div>

          {/* Center - Search (Desktop) */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-text-muted" />
              <input
                type="text"
                placeholder="Search courses, lessons..."
                className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary bg-background-light"
              />
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-2">
            {/* Mobile Search Toggle */}
            <button
              onClick={() => setShowSearch(!showSearch)}
              className="md:hidden p-2 rounded-lg text-text-medium hover:text-text-dark hover:bg-background-light transition-colors"
            >
              <Search size={20} />
            </button>

            {/* Notifications */}
            <button className="p-2 rounded-lg text-text-medium hover:text-text-dark hover:bg-background-light transition-colors relative">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {/* User Menu */}
            <UserMenu />
          </div>
        </div>

        {/* Mobile Search Bar */}
        {showSearch && (
          <div className="md:hidden mt-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-text-muted" />
              <input
                type="text"
                placeholder="Search courses, lessons..."
                className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary bg-background-light"
                autoFocus
              />
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
