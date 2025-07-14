// import { useState } from 'react';
// import { Link, useLocation } from 'react-router-dom';
// import { ChevronDown, ChevronRight } from 'lucide-react';
// import { useAuth } from '@hooks/auth/useAuth';
// import { individualNavigation, corporateNavigation } from '@/config/navigation';
// import clsx from 'clsx';

// export default function Sidebar({ isOpen, setIsOpen }) {
//   const location = useLocation();
//   const { user, userType } = useAuth();
//   const [expandedItems, setExpandedItems] = useState(new Set());

//   const navigation = userType === 'corporate' ? corporateNavigation : individualNavigation;

//   const toggleExpanded = (itemName) => {
//     const newExpanded = new Set(expandedItems);
//     if (newExpanded.has(itemName)) {
//       newExpanded.delete(itemName);
//     } else {
//       newExpanded.add(itemName);
//     }
//     setExpandedItems(newExpanded);
//   };

//   const isActive = (href) => {
//     if (href === '/app' || href === '/corporate') {
//       return location.pathname === href;
//     }
//     return location.pathname.startsWith(href);
//   };

//   const isChildActive = (children) => {
//     return children?.some(child => location.pathname.startsWith(child.href));
//   };

//   return (
//     <div className={clsx(
//       'bg-white border-r border-gray-200 flex flex-col',
//       'lg:w-64 lg:fixed lg:inset-y-0',
//       isOpen ? 'fixed inset-0 z-50' : 'hidden lg:flex'
//     )}>
//       {/* Mobile header */}
//       <div className="lg:hidden flex items-center justify-between p-4 border-b">
//         <h2 className="text-lg font-semibold text-gray-900">Navigation</h2>
//         <button
//           onClick={() => setIsOpen(false)}
//           className="p-2 rounded-md text-gray-500 hover:text-gray-600"
//         >
//           <X className="h-5 w-5" />
//         </button>
//       </div>

//       {/* Logo */}
//       <div className="hidden lg:flex items-center h-16 px-6 border-b">
//         <Link to={userType === 'corporate' ? '/corporate' : '/app'} className="flex items-center">
//           <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
//             <span className="text-white font-bold text-sm">K</span>
//           </div>
//           <span className="ml-3 text-lg font-semibold text-gray-900">Kyzer LMS</span>
//         </Link>
//       </div>

//       {/* Navigation */}
//       <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
//         {navigation.map((item) => (
//           <div key={item.name}>
//             <div className="group">
//               {item.children ? (
//                 <button
//                   onClick={() => toggleExpanded(item.name)}
//                   className={clsx(
//                     'w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-colors',
//                     isActive(item.href) || isChildActive(item.children)
//                       ? 'bg-primary-light text-primary-dark'
//                       : 'text-text-medium hover:bg-background-light'
//                   )}
//                 >
//                   <div className="flex items-center">
//                     <item.icon className="h-5 w-5 mr-3" />
//                     {item.name}
//                   </div>
//                   {expandedItems.has(item.name) ? (
//                     <ChevronDown className="h-4 w-4" />
//                   ) : (
//                     <ChevronRight className="h-4 w-4" />
//                   )}
//                 </button>
//               ) : (
//                 <Link
//                   to={item.href}
//                   onClick={() => setIsOpen(false)}
//                   className={clsx(
//                     'flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors',
//                     isActive(item.href)
//                       ? 'bg-primary-light text-primary-dark'
//                       : 'text-text-medium hover:bg-background-light'
//                   )}
//                 >
//                   <item.icon className="h-5 w-5 mr-3" />
//                   {item.name}
//                 </Link>
//               )}
//             </div>

//             {/* Submenu */}
//             {item.children && expandedItems.has(item.name) && (
//               <div className="ml-6 mt-1 space-y-1">
//                 {item.children.map((child) => (
//                   <Link
//                     key={child.name}
//                     to={child.href}
//                     onClick={() => setIsOpen(false)}
//                     className={clsx(
//                       'block px-3 py-2 text-sm rounded-lg transition-colors',
//                       isActive(child.href)
//                         ? 'bg-primary-light text-primary-dark font-medium'
//                         : 'text-text-light hover:bg-background-light hover:text-text-medium'
//                     )}
//                   >
//                     {child.name}
//                   </Link>
//                 ))}
//               </div>
//             )}
//           </div>
//         ))}
//       </nav>

//       {/* User info */}
//       <div className="p-4 border-t">
//         <div className="flex items-center">
//           <div className="h-8 w-8 bg-primary rounded-full flex items-center justify-center">
//             <span className="text-white text-sm font-medium">
//               {user?.user_metadata?.first_name?.[0] || user?.email?.[0]?.toUpperCase()}
//             </span>
//           </div>
//           <div className="ml-3 flex-1 min-w-0">
//             <p className="text-sm font-medium text-gray-900 truncate">
//               {user?.user_metadata?.first_name || 'User'}
//             </p>
//             <p className="text-xs text-gray-500 truncate">
//               {userType === 'corporate' ? 'Corporate Account' : 'Individual Account'}
//             </p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { X } from 'lucide-react';
import { useAuth } from '@hooks/auth/useAuth';
import { individualNavigation, corporateNavigation } from '@/config/navigation';
import kyzerLogo from "../../assets/images/Kyzerlogo.png";

const Sidebar = ({ mobile = false, onClose }) => {
  const location = useLocation();
  const { user } = useAuth();
   const isCorporateUser = user?.user_metadata?.account_type === 'corporate';

  const isIndividualUser = user?.user_metadata?.account_type === 'individual';
  // Get navigation based on user type
  const navigation = isCorporateUser ? corporateNavigation : individualNavigation;
  const homeRoute = isCorporateUser ? '/corporate/dashboard' : '/app/dashboard';

  const isActive = (path) => {
    if (path === '/app' || path === '/corporate') {
      return location.pathname === path + '/dashboard';
    }
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const sidebarClasses = mobile 
    ? "w-64 bg-white h-full flex flex-col shadow-xl"
    : "hidden lg:block w-64 bg-white border-r border-border min-h-screen fixed left-0 top-16 z-20";

  return (
    <nav className={sidebarClasses}>
      {/* Mobile Header */}
      {mobile && (
        <div className="flex items-center justify-between p-4 border-b border-border">
          <Link to={homeRoute} className="flex items-center space-x-2" onClick={onClose}>
            <img src={kyzerLogo} alt="Kyzer Logo" className="h-6" />
          </Link>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-text-medium hover:text-text-dark hover:bg-background-light transition-colors"
          >
            <X size={20} />
          </button>
        </div>
      )}

      {/* Navigation Links */}
      <div className="flex-1 p-4 space-y-2 overflow-y-auto">
        {navigation.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          
          return (
            <Link
              key={item.name}
              to={item.href}
              onClick={mobile ? onClose : undefined}
              className={`
                flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200 group
                ${active
                  ? 'bg-primary text-white shadow-sm' 
                  : 'text-text-medium hover:text-text-dark hover:bg-background-light'
                }
              `}
            >
              <Icon 
                size={20} 
                className={`mr-3 transition-transform group-hover:scale-110 ${
                  active ? 'text-white' : ''
                }`} 
              />
              {item.name}
              {active && (
                <div className="ml-auto w-2 h-2 bg-white rounded-full opacity-75"></div>
              )}
            </Link>
          );
        })}
      </div>

      {/* User Info (Mobile) */}
      {mobile && (
        <div className="p-4 border-t border-border">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-background-medium rounded-full flex items-center justify-center">
              <span className="text-text-medium text-sm font-medium">
                {user?.user_metadata?.first_name?.[0] || user?.email?.[0]?.toUpperCase() || 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-text-dark truncate">
                {user?.user_metadata?.first_name || 'User'}
              </p>
              <p className="text-xs text-text-muted truncate">
                {isCorporateUser ? 'Corporate Account' : 'Individual Account'}
              </p>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Sidebar;