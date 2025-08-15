// src/components/layout/MobileNav.jsx
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/auth/useAuth';
import { individualNavigation, corporateNavigation } from '@/config/navigation';

const MobileNav = () => {
  const location = useLocation();
  const { user } = useAuth();
   const isCorporateUser = user?.user_metadata?.account_type === 'corporate';

  const isIndividualUser = user?.user_metadata?.account_type === 'individual';
  // Get navigation based on user type and take first 4 items
  const navigation = isCorporateUser ? corporateNavigation : individualNavigation;
  const mobileNavItems = navigation.slice(0, 4);

  const isActive = (path) => {
    if (path === '/app/dashboard' || path === '/company/dashboard') {
      return location.pathname === path || location.pathname.startsWith(path.replace('/dashboard', ''));
    }
    // For other routes, use exact match only to prevent multiple active states
    return location.pathname === path;
  };

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-border shadow-lg z-30">
      <div className="flex justify-around py-1">
        {mobileNavItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`
                flex flex-col items-center justify-center px-2 py-2 min-w-0 flex-1 transition-all duration-200
                ${active 
                  ? 'text-primary' 
                  : 'text-text-muted hover:text-text-medium'
                }
              `}
            >
              <div className={`
                p-1 rounded-lg transition-all duration-200
                ${active ? 'bg-primary/10' : ''}
              `}>
                <Icon 
                  size={20} 
                  className={`mb-1 transition-transform duration-200 ${
                    active ? 'scale-110' : ''
                  }`} 
                />
              </div>
              <span className={`
                text-xs font-medium transition-all duration-200 truncate
                ${active ? 'text-primary' : ''}
              `}>
                {item.name}
              </span>
              {active && (
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary rounded-full"></div>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileNav;
