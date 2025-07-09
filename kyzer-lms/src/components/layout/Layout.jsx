// src/components/layout/Layout.jsx
import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/auth/useAuth'
import { Menu, X, Home, BookOpen, User, Settings, LogOut } from 'lucide-react'

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'My Courses', href: '/my-courses', icon: BookOpen },
    { name: 'Browse Courses', href: '/courses', icon: BookOpen },
    { name: 'Profile', href: '/profile', icon: User },
    { name: 'Settings', href: '/settings', icon: Settings },
  ]

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const isCurrentPage = (href) => location.pathname === href

  return (
    <div className="min-h-screen bg-background-light">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div 
            className="fixed inset-0 bg-black bg-opacity-25" 
            onClick={() => setSidebarOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-xl">
            {/* Mobile Header */}
            <div className="flex items-center justify-between h-16 px-4 border-b border-background-dark">
              <span className="text-lg font-bold text-text-dark">Kyzer LMS</span>
              <button onClick={() => setSidebarOpen(false)}>
                <X className="w-6 h-6 text-text-light" />
              </button>
            </div>
            
            {/* Mobile Navigation */}
            <nav className="mt-4 px-4">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center space-x-3 px-3 py-2 mb-2 rounded-lg text-sm font-medium transition-colors ${
                    isCurrentPage(item.href)
                      ? 'bg-primary text-white'
                      : 'text-text-medium hover:bg-background-medium'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </Link>
              ))}
            </nav>
            
            {/* Mobile User Section */}
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-background-dark">
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-text-medium hover:bg-background-medium rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:w-64 lg:block">
        <div className="flex flex-col h-full bg-white border-r border-background-dark">
          {/* Desktop Header */}
          <div className="flex items-center h-16 px-4 border-b border-background-dark">
            <span className="text-lg font-bold text-text-dark">Kyzer LMS</span>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="flex-1 mt-4 px-4">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center space-x-3 px-3 py-2 mb-2 rounded-lg text-sm font-medium transition-colors ${
                  isCurrentPage(item.href)
                    ? 'bg-primary text-white'
                    : 'text-text-medium hover:bg-background-medium'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.name}</span>
              </Link>
            ))}
          </nav>
          
          {/* Desktop User Section */}
          <div className="p-4 border-t border-background-dark">
            <div className="mb-3">
              <p className="text-sm font-medium text-text-dark truncate">
                {user?.email?.split('@')[0] || 'User'}
              </p>
              <p className="text-xs text-text-light truncate">
                {user?.email || 'user@example.com'}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-text-medium hover:bg-background-medium rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign out</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="lg:pl-64">
        {/* Top Bar */}
        <div className="sticky top-0 z-40">
          <div className="flex items-center justify-between h-16 px-4 bg-white border-b border-background-dark lg:px-8">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-text-light hover:text-text-dark"
            >
              <Menu className="w-6 h-6" />
            </button>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-text-medium">
                Welcome back!
              </span>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <main>
          {children}
        </main>
      </div>
    </div>
  )
}