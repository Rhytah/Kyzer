
// src/components/layout/Sidebar.jsx - Improved version for better corporate support
import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  BookOpen,
  User,
  Settings,
  Building2,
  Users,
  BarChart3,
  ChevronDown,
  ChevronRight,
  X,
  Award,
  TrendingUp,
  Loader
} from "lucide-react";
import { useAuth } from "@/hooks/auth/useAuth";
import { useCorporate } from "@/hooks/corporate/useCorporate";
import kyzerLogo from "../../assets/images/Kyzerlogo.png";

export default function Sidebar({ mobile = false, onClose }) {
  const { user } = useAuth();
  const { 
    organization, 
    isCorporateUser, 
    hasPermission, 
    role,
    loading: corporateLoading,
    companyName, // NEW: Fallback company name from metadata
    error: corporateError
  } = useCorporate();
  
  const location = useLocation();
  const [corporateExpanded, setCorporateExpanded] = useState(
    location.pathname.startsWith('/company')
  );

  // Define navigation items
  const personalNavigation = [
    { 
      path: "/app/dashboard", 
      label: "Dashboard", 
      icon: LayoutDashboard 
    },
    { 
      path: "/app/courses", 
      label: "My Courses", 
      icon: BookOpen 
    },
    { 
      path: "/app/courses/catalog", 
      label: "Browse Courses", 
      icon: BookOpen 
    },
    { 
      path: "/app/progress", 
      label: "Progress", 
      icon: TrendingUp 
    },
    { 
      path: "/app/certificates", 
      label: "Certificates", 
      icon: Award 
    },
    { 
      path: "/app/profile", 
      label: "Profile", 
      icon: User 
    },
    { 
      path: "/app/settings", 
      label: "Settings", 
      icon: Settings 
    }
  ];

  // Corporate navigation - only show if user has permissions
  const corporateNavigation = [
    { 
      path: "/company/dashboard", 
      label: "Company Dashboard", 
      icon: Building2,
      permission: null // Always visible to corporate users
    },
    { 
      path: "/company/employees", 
      label: "Employees", 
      icon: Users,
      permission: "invite_employees"
    },
    { 
      path: "/company/reports", 
      label: "Reports", 
      icon: BarChart3,
      permission: "view_reports"
    },
    { 
      path: "/company/settings", 
      label: "Settings", 
      icon: Settings,
      permission: "manage_settings"
    }
  ];

  // Filter corporate navigation based on permissions
  const availableCorporateNavigation = corporateNavigation.filter(item => {
    if (!item.permission) return true; // Always show items without permission requirements
    return hasPermission(item.permission);
  });

  // NEW: Determine display states
  const shouldShowCorporateSection = isCorporateUser;
  const shouldShowSetupPrompt = isCorporateUser && !organization && !corporateLoading;
  const shouldShowCorporateNav = isCorporateUser && (organization || corporateLoading);
  
  // NEW: Get display company name (organization name or fallback to metadata)
  const displayCompanyName = organization?.name || companyName || 'Your Company';

  const NavItem = ({ route, onClick }) => {
    const Icon = route.icon;
    const isActive = location.pathname === route.path || 
                    location.pathname.startsWith(route.path + '/');
    
    return (
      <NavLink
        to={route.path}
        onClick={onClick}
        className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
          isActive
            ? "bg-primary text-white"
            : "text-text-medium hover:bg-background-light hover:text-text-dark"
        }`}
      >
        <Icon className="w-5 h-5" />
        <span className="font-medium">{route.label}</span>
        {isActive && (
          <div className="ml-auto w-2 h-2 bg-white rounded-full opacity-75"></div>
        )}
      </NavLink>
    );
  };

  const sidebarClasses = mobile
    ? "w-64 bg-white h-full flex flex-col shadow-xl"
    : "hidden lg:block w-64 bg-white border-r border-border min-h-screen fixed left-0 top-16 z-20";

  if (corporateLoading) {
    return (
      <nav className={sidebarClasses}>
        <div className="p-4">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className={sidebarClasses}>
      {/* Mobile Header */}
      {mobile && (
        <div className="flex items-center justify-between p-4 border-b border-border">
          <NavLink
            to="/app/dashboard"
            className="flex items-center space-x-2"
            onClick={onClose}
          >
            <img src={kyzerLogo} alt="Kyzer Logo" className="h-6" />
            <span className="font-semibold">Kyzer LMS</span>
          </NavLink>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-text-medium hover:text-text-dark hover:bg-background-light transition-colors"
          >
            <X size={20} />
          </button>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-6">
        {/* Corporate Section */}
        {shouldShowCorporateSection && (
          <div className="p-4">
            <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">
              Corporate Learning
            </h3>

            {/* IMPROVED: Show corporate navigation even during loading */}
            {shouldShowCorporateNav && (
              <>
                <button
                  onClick={() => setCorporateExpanded(!corporateExpanded)}
                  className="flex items-center justify-between w-full mb-3 text-left"
                  disabled={corporateLoading}
                >
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-primary" />
                    <h3 className="text-lg font-semibold text-text-dark">
                      {displayCompanyName}
                    </h3>
                    {corporateLoading && (
                      <Loader className="w-4 h-4 text-primary animate-spin" />
                    )}
                  </div>
                  {corporateExpanded ? (
                    <ChevronDown className="w-4 h-4 text-text-muted" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-text-muted" />
                  )}
                </button>

                {corporateExpanded && (
                  <nav className="space-y-1 mb-6">
                    {corporateLoading ? (
                      // Show loading state for navigation items
                      <div className="space-y-2">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="animate-pulse">
                            <div className="h-8 bg-gray-200 rounded"></div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      availableCorporateNavigation.map((route) => (
                        <NavItem 
                          key={route.path} 
                          route={route} 
                          onClick={mobile ? onClose : undefined}
                        />
                      ))
                    )}
                  </nav>
                )}

                {/* Organization info */}
                <div className="mt-4 p-3 bg-background-dark rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-primary rounded flex items-center justify-center">
                      <Building2 className="w-3 h-3 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-m font-medium text-text-dark truncate">
                        {displayCompanyName}
                      </p>
                      <p className="text-sky-800 text-xs truncate">
                        {role || 'Manager'} • {organization?.subscription_status || 'Active'}
                        {corporateLoading && ' • Setting up...'}
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* IMPROVED: Setup prompt only when truly needed */}
            {shouldShowSetupPrompt && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Building2 className="w-4 h-4 text-yellow-600" />
                  <h3 className="text-sm font-semibold text-yellow-800">
                    {corporateError ? 'Setup Error' : 'Completing Setup'}
                  </h3>
                </div>
                <p className="text-xs text-yellow-700 mb-3">
                  {corporateError 
                    ? 'There was an issue setting up your organization. Please try again.'
                    : 'Your corporate account is being set up. This may take a moment.'}
                </p>
                <NavLink
                  to="/company/dashboard"
                  onClick={mobile ? onClose : undefined}
                  className="block w-full text-center bg-yellow-600 text-white text-xs py-2 px-3 rounded hover:bg-yellow-700 transition-colors"
                >
                  {corporateError ? 'Retry Setup' : 'Continue to Dashboard'}
                </NavLink>
              </div>
            )}
          </div>
        )}

        {/* Personal Navigation */}
        <div className="p-4">
          <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">
            Personal Learning
          </h3>
          <nav className="space-y-1">
            {personalNavigation.map((route) => (
              <NavItem 
                key={route.path} 
                route={route} 
                onClick={mobile ? onClose : undefined}
              />
            ))}
          </nav>
        </div>
      </div>

      {/* User Info */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-medium">
              {user?.user_metadata?.first_name?.[0] || 
               user?.email?.[0]?.toUpperCase() || 
               'U'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-text-dark truncate">
              {user?.user_metadata?.first_name || 
               user?.email?.split('@')[0] || 
               'User'}
            </p>
            <p className="text-xs text-text-muted truncate">
              {isCorporateUser 
                ? `${role || 'Manager'} at ${displayCompanyName}` 
                : 'Individual Account'}
            </p>
          </div>
        </div>
      </div>
    </nav>
  );
}