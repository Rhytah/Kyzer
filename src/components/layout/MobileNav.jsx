// import { Link, useLocation } from 'react-router-dom';
// import { useAuth } from '@hooks/auth/useAuth';
// import { individualNavigation, corporateNavigation } from '@/config/navigation';
// import clsx from 'clsx';

// export default function MobileNav() {
//   const location = useLocation();
//   const { userType } = useAuth();
  
//   const navigation = userType === 'corporate' ? corporateNavigation : individualNavigation;
//   const mainNavItems = navigation.slice(0, 4); // Show only first 4 items

//   const isActive = (href) => {
//     if (href === '/app' || href === '/corporate') {
//       return location.pathname === href;
//     }
//     return location.pathname.startsWith(href);
//   };

//   return (
//     <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
//       <div className="grid grid-cols-4 py-2">
//         {mainNavItems.map((item) => (
//           <Link
//             key={item.name}
//             to={item.href}
//             className={clsx(
//               'flex flex-col items-center justify-center py-2 px-1 text-xs font-medium transition-colors',
//               isActive(item.href)
//                 ? 'text-primary'
//                 : 'text-gray-500 hover:text-gray-700'
//             )}
//           >
//             <item.icon className={clsx(
//               'h-5 w-5 mb-1',
//               isActive(item.href) ? 'text-primary' : 'text-gray-400'
//             )} />
//             <span className="truncate">{item.name}</span>
//           </Link>
//         ))}
//       </div>
//     </div>
//   );
// }

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@hooks/auth/useAuth';
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
    if (path === '/app' || path === '/corporate') {
      return location.pathname === path + '/dashboard';
    }
    return location.pathname === path || location.pathname.startsWith(path + '/');
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
