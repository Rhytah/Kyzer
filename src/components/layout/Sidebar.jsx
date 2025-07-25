// // import { useState } from 'react';
// // import { Link, useLocation } from 'react-router-dom';
// // import { ChevronDown, ChevronRight } from 'lucide-react';
// // import { useAuth } from '@hooks/auth/useAuth';
// // import { individualNavigation, corporateNavigation } from '@/config/navigation';
// // import clsx from 'clsx';

// // export default function Sidebar({ isOpen, setIsOpen }) {
// //   const location = useLocation();
// //   const { user, userType } = useAuth();
// //   const [expandedItems, setExpandedItems] = useState(new Set());

// //   const navigation = userType === 'corporate' ? corporateNavigation : individualNavigation;

// //   const toggleExpanded = (itemName) => {
// //     const newExpanded = new Set(expandedItems);
// //     if (newExpanded.has(itemName)) {
// //       newExpanded.delete(itemName);
// //     } else {
// //       newExpanded.add(itemName);
// //     }
// //     setExpandedItems(newExpanded);
// //   };

// //   const isActive = (href) => {
// //     if (href === '/app' || href === '/corporate') {
// //       return location.pathname === href;
// //     }
// //     return location.pathname.startsWith(href);
// //   };

// //   const isChildActive = (children) => {
// //     return children?.some(child => location.pathname.startsWith(child.href));
// //   };

// //   return (
// //     <div className={clsx(
// //       'bg-white border-r border-gray-200 flex flex-col',
// //       'lg:w-64 lg:fixed lg:inset-y-0',
// //       isOpen ? 'fixed inset-0 z-50' : 'hidden lg:flex'
// //     )}>
// //       {/* Mobile header */}
// //       <div className="lg:hidden flex items-center justify-between p-4 border-b">
// //         <h2 className="text-lg font-semibold text-gray-900">Navigation</h2>
// //         <button
// //           onClick={() => setIsOpen(false)}
// //           className="p-2 rounded-md text-gray-500 hover:text-gray-600"
// //         >
// //           <X className="h-5 w-5" />
// //         </button>
// //       </div>

// //       {/* Logo */}
// //       <div className="hidden lg:flex items-center h-16 px-6 border-b">
// //         <Link to={userType === 'corporate' ? '/corporate' : '/app'} className="flex items-center">
// //           <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
// //             <span className="text-white font-bold text-sm">K</span>
// //           </div>
// //           <span className="ml-3 text-lg font-semibold text-gray-900">Kyzer LMS</span>
// //         </Link>
// //       </div>

// //       {/* Navigation */}
// //       <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
// //         {navigation.map((item) => (
// //           <div key={item.name}>
// //             <div className="group">
// //               {item.children ? (
// //                 <button
// //                   onClick={() => toggleExpanded(item.name)}
// //                   className={clsx(
// //                     'w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-colors',
// //                     isActive(item.href) || isChildActive(item.children)
// //                       ? 'bg-primary-light text-primary-dark'
// //                       : 'text-text-medium hover:bg-background-light'
// //                   )}
// //                 >
// //                   <div className="flex items-center">
// //                     <item.icon className="h-5 w-5 mr-3" />
// //                     {item.name}
// //                   </div>
// //                   {expandedItems.has(item.name) ? (
// //                     <ChevronDown className="h-4 w-4" />
// //                   ) : (
// //                     <ChevronRight className="h-4 w-4" />
// //                   )}
// //                 </button>
// //               ) : (
// //                 <Link
// //                   to={item.href}
// //                   onClick={() => setIsOpen(false)}
// //                   className={clsx(
// //                     'flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors',
// //                     isActive(item.href)
// //                       ? 'bg-primary-light text-primary-dark'
// //                       : 'text-text-medium hover:bg-background-light'
// //                   )}
// //                 >
// //                   <item.icon className="h-5 w-5 mr-3" />
// //                   {item.name}
// //                 </Link>
// //               )}
// //             </div>

// //             {/* Submenu */}
// //             {item.children && expandedItems.has(item.name) && (
// //               <div className="ml-6 mt-1 space-y-1">
// //                 {item.children.map((child) => (
// //                   <Link
// //                     key={child.name}
// //                     to={child.href}
// //                     onClick={() => setIsOpen(false)}
// //                     className={clsx(
// //                       'block px-3 py-2 text-sm rounded-lg transition-colors',
// //                       isActive(child.href)
// //                         ? 'bg-primary-light text-primary-dark font-medium'
// //                         : 'text-text-light hover:bg-background-light hover:text-text-medium'
// //                     )}
// //                   >
// //                     {child.name}
// //                   </Link>
// //                 ))}
// //               </div>
// //             )}
// //           </div>
// //         ))}
// //       </nav>

// //       {/* User info */}
// //       <div className="p-4 border-t">
// //         <div className="flex items-center">
// //           <div className="h-8 w-8 bg-primary rounded-full flex items-center justify-center">
// //             <span className="text-white text-sm font-medium">
// //               {user?.user_metadata?.first_name?.[0] || user?.email?.[0]?.toUpperCase()}
// //             </span>
// //           </div>
// //           <div className="ml-3 flex-1 min-w-0">
// //             <p className="text-sm font-medium text-gray-900 truncate">
// //               {user?.user_metadata?.first_name || 'User'}
// //             </p>
// //             <p className="text-xs text-gray-500 truncate">
// //               {userType === 'corporate' ? 'Corporate Account' : 'Individual Account'}
// //             </p>
// //           </div>
// //         </div>
// //       </div>
// //     </div>
// //   );
// // }

// // import { Link, useLocation } from 'react-router-dom';
// // import { X } from 'lucide-react';
// // import { useAuth } from '@hooks/auth/useAuth';
// // import { individualNavigation, corporateNavigation } from '@/config/navigation';
// // import kyzerLogo from "../../assets/images/Kyzerlogo.png";

// // const Sidebar = ({ mobile = false, onClose }) => {
// //   const location = useLocation();
// //   const { user } = useAuth();
// //    const isCorporateUser = user?.user_metadata?.account_type === 'corporate';

// //   const isIndividualUser = user?.user_metadata?.account_type === 'individual';
// //   // Get navigation based on user type
// //   const navigation = isCorporateUser ? corporateNavigation : individualNavigation;
// //   const homeRoute = isCorporateUser ? '/corporate/dashboard' : '/app/dashboard';

// //   const isActive = (path) => {
// //     if (path === '/app' || path === '/corporate') {
// //       return location.pathname === path + '/dashboard';
// //     }
// //     return location.pathname === path || location.pathname.startsWith(path + '/');
// //   };

// //   const sidebarClasses = mobile 
// //     ? "w-64 bg-white h-full flex flex-col shadow-xl"
// //     : "hidden lg:block w-64 bg-white border-r border-border min-h-screen fixed left-0 top-16 z-20";

// //   return (
// //     <nav className={sidebarClasses}>
// //       {/* Mobile Header */}
// //       {mobile && (
// //         <div className="flex items-center justify-between p-4 border-b border-border">
// //           <Link to={homeRoute} className="flex items-center space-x-2" onClick={onClose}>
// //             <img src={kyzerLogo} alt="Kyzer Logo" className="h-6" />
// //           </Link>
// //           <button
// //             onClick={onClose}
// //             className="p-2 rounded-lg text-text-medium hover:text-text-dark hover:bg-background-light transition-colors"
// //           >
// //             <X size={20} />
// //           </button>
// //         </div>
// //       )}

// //       {/* Navigation Links */}
// //       <div className="flex-1 p-4 space-y-2 overflow-y-auto">
// //         {navigation.map((item) => {
// //           const Icon = item.icon;
// //           const active = isActive(item.href);
          
// //           return (
// //             <Link
// //               key={item.name}
// //               to={item.href}
// //               onClick={mobile ? onClose : undefined}
// //               className={`
// //                 flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200 group
// //                 ${active
// //                   ? 'bg-primary text-white shadow-sm' 
// //                   : 'text-text-medium hover:text-text-dark hover:bg-background-light'
// //                 }
// //               `}
// //             >
// //               <Icon 
// //                 size={20} 
// //                 className={`mr-3 transition-transform group-hover:scale-110 ${
// //                   active ? 'text-white' : ''
// //                 }`} 
// //               />
// //               {item.name}
// //               {active && (
// //                 <div className="ml-auto w-2 h-2 bg-white rounded-full opacity-75"></div>
// //               )}
// //             </Link>
// //           );
// //         })}
// //       </div>

// //       {/* User Info (Mobile) */}
// //       {mobile && (
// //         <div className="p-4 border-t border-border">
// //           <div className="flex items-center space-x-3">
// //             <div className="w-10 h-10 bg-background-medium rounded-full flex items-center justify-center">
// //               <span className="text-text-medium text-sm font-medium">
// //                 {user?.user_metadata?.first_name?.[0] || user?.email?.[0]?.toUpperCase() || 'U'}
// //               </span>
// //             </div>
// //             <div className="flex-1 min-w-0">
// //               <p className="text-sm font-medium text-text-dark truncate">
// //                 {user?.user_metadata?.first_name || 'User'}
// //               </p>
// //               <p className="text-xs text-text-muted truncate">
// //                 {isCorporateUser ? 'Corporate Account' : 'Individual Account'}
// //               </p>
// //             </div>
// //           </div>
// //         </div>
// //       )}
// //     </nav>
// //   );
// // };

// // export default Sidebar;

// import { Link, useLocation } from 'react-router-dom';
// import { 
//   Home, 
//   BookOpen, 
//   User, 
//   Building2, 
//   Users, 
//   BarChart, 
//   Settings,
//   LogOut,
//   GraduationCap,
//   Award,
//   Calendar,
//   X
// } from 'lucide-react';
// import { useAuthStore } from '@/store/authStore';
// import { useOrganization } from '@/hooks/corporate/useOrganization';
// import kyzerLogo from "../../assets/images/Kyzerlogo.png";

// // Navigation configurations
// const individualNavigation = [
//   { name: 'Dashboard', href: '/app/dashboard', icon: Home },
//   { name: 'Browse Courses', href: '/app/courses', icon: BookOpen },
//   { name: 'My Learning', href: '/app/my-courses', icon: GraduationCap },
//   { name: 'Certificates', href: '/app/certificates', icon: Award },
//   { name: 'Calendar', href: '/app/calendar', icon: Calendar },
//   { name: 'Profile', href: '/app/profile', icon: User }
// ];

// const corporateNavigation = [
//   { name: 'Dashboard', href: '/app/dashboard', icon: Home },
//   { name: 'Browse Courses', href: '/app/courses', icon: BookOpen },
//   { name: 'My Learning', href: '/app/my-courses', icon: GraduationCap },
//   { name: 'Profile', href: '/app/profile', icon: User }
// ];

// export const Sidebar = ({ mobile = false, onClose }) => {
//   const location = useLocation();
//   const { user, logout } = useAuthStore();
//   const { company } = useOrganization();

//   // Determine user type from metadata
//   const isCorporateUser = user?.user_metadata?.account_type === 'corporate';
//   const isIndividualUser = user?.user_metadata?.account_type === 'individual';
  
//   // Get navigation based on user type
//   const navigation = isCorporateUser ? corporateNavigation : individualNavigation;
//   const homeRoute = isCorporateUser ? '/corporate/dashboard' : '/app/dashboard';

//   const isActive = (path) => {
//     if (path === '/app' || path === '/corporate') {
//       return location.pathname === path + '/dashboard';
//     }
//     return location.pathname === path || location.pathname.startsWith(path + '/');
//   };

//   const sidebarClasses = mobile 
//     ? "w-64 bg-white h-full flex flex-col shadow-xl"
//     : "hidden lg:block w-64 bg-white border-r border-background-medium min-h-screen fixed left-0 top-16 z-20";

//   const NavItem = ({ to, icon: Icon, label, badge = null, onClick }) => (
//     <Link
//       to={to}
//       onClick={onClick}
//       className={`flex items-center px-4 py-3 rounded-lg transition-all duration-200 group ${
//         isActive(to)
//           ? 'bg-primary text-white shadow-sm'
//           : 'text-text-medium hover:bg-background-light hover:text-text-dark'
//       }`}
//     >
//       <Icon 
//         className={`h-5 w-5 mr-3 transition-transform group-hover:scale-110 ${
//           isActive(to) ? 'text-white' : ''
//         }`} 
//       />
//       <span>{label}</span>
//       {badge && (
//         <span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full">
//           {badge}
//         </span>
//       )}
//       {isActive(to) && (
//         <div className="ml-auto w-2 h-2 bg-white rounded-full opacity-75"></div>
//       )}
//     </Link>
//   );

//   return (
//     <nav className={sidebarClasses}>
//       {/* Mobile Header */}
//       {mobile && (
//         <div className="flex items-center justify-between p-4 border-b border-background-medium">
//           <Link to={homeRoute} className="flex items-center space-x-2" onClick={onClose}>
//             <img src={kyzerLogo} alt="Kyzer Logo" className="h-6" />
//           </Link>
//           <button
//             onClick={onClose}
//             className="p-2 rounded-lg text-text-medium hover:text-text-dark hover:bg-background-light transition-colors"
//           >
//             <X size={20} />
//           </button>
//         </div>
//       )}

//       {/* Logo (Desktop) */}
//       {!mobile && (
//         <div className="p-6 border-b border-background-medium">
//           <Link to={homeRoute} className="flex items-center space-x-2">
//             <img src={kyzerLogo} alt="Kyzer Logo" className="h-8" />
//             <h1 className="text-xl font-bold text-text-dark">Kyzer LMS</h1>
//           </Link>
//           {company && isCorporateUser && (
//             <p className="text-sm text-text-light mt-1">{company.name}</p>
//           )}
//         </div>
//       )}

//       {/* Navigation Links */}
//       <div className="flex-1 p-4 space-y-2 overflow-y-auto">
//         {/* Personal/Individual Navigation */}
//         <div className="mb-6">
//           <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">
//             {isCorporateUser ? 'Personal' : 'Learning'}
//           </h3>
//           {navigation.map((item) => (
//             <NavItem
//               key={item.name}
//               to={item.href}
//               icon={item.icon}
//               label={item.name}
//               onClick={mobile ? onClose : undefined}
//             />
//           ))}
//         </div>

//         {/* Corporate Navigation (only for corporate users) */}
//         {isCorporateUser && (
//           <>
//             {company ? (
//               <div className="mb-6">
//                 <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">
//                   Company
//                 </h3>
//                 <NavItem 
//                   to="/corporate" 
//                   icon={Building2} 
//                   label="Overview" 
//                   onClick={mobile ? onClose : undefined}
//                 />
//                 <NavItem 
//                   to="/corporate/employees" 
//                   icon={Users} 
//                   label="Employees" 
//                   onClick={mobile ? onClose : undefined}
//                 />
//                 <NavItem 
//                   to="/corporate/reports" 
//                   icon={BarChart} 
//                   label="Reports" 
//                   onClick={mobile ? onClose : undefined}
//                 />
//                 <NavItem 
//                   to="/corporate/settings" 
//                   icon={Settings} 
//                   label="Settings" 
//                   onClick={mobile ? onClose : undefined}
//                 />
//               </div>
//             ) : (
//               <div className="mb-6">
//                 <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">
//                   Company
//                 </h3>
//                 <Link
//                   to="/corporate"
//                   onClick={mobile ? onClose : undefined}
//                   className="flex items-center px-4 py-3 rounded-lg border-2 border-dashed border-background-dark text-text-light hover:border-primary hover:text-primary transition-colors"
//                 >
//                   <Building2 className="h-5 w-5 mr-3" />
//                   <span>Set up Company</span>
//                 </Link>
//               </div>
//             )}
//           </>
//         )}
//       </div>

//       {/* User Section */}
//       <div className="p-4 border-t border-background-medium">
//         <div className="flex items-center mb-3">
//           <div className="h-8 w-8 bg-primary rounded-full flex items-center justify-center text-white text-sm font-medium">
//             {user?.user_metadata?.first_name?.[0] || 
//              user?.user_metadata?.full_name?.[0] || 
//              user?.email?.[0]?.toUpperCase() || 'U'}
//           </div>
//           <div className="ml-3 flex-1 min-w-0">
//             <p className="text-sm font-medium text-text-dark truncate">
//               {user?.user_metadata?.first_name || 
//                user?.user_metadata?.full_name || 
//                'User'}
//             </p>
//             <p className="text-xs text-text-light truncate">
//               {isCorporateUser 
//                 ? (company ? `${company.name}` : 'Corporate Account')
//                 : 'Individual Account'
//               }
//             </p>
//           </div>
//         </div>
//         <button
//           onClick={() => {
//             logout();
//             if (mobile && onClose) onClose();
//           }}
//           className="flex items-center w-full px-4 py-2 text-sm text-text-light hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
//         >
//           <LogOut className="h-4 w-4 mr-3" />
//           Sign out
//         </button>
//       </div>
//     </nav>
//   );
// };
// export default Sidebar;
// export { individualNavigation, corporateNavigation };

// src/components/layout/Sidebar.jsx (Updated)
import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { 
  LayoutDashboard, 
  BookOpen, 
  User, 
  Settings,
  Building2,
  Users,
  BarChart3,
  ChevronDown,
  ChevronRight
} from 'lucide-react'
import { navigationRoutes, getAvailableRoutes } from '@/router'
import { useCorporatePermissions } from '@/hooks/corporate/useCorporatePermissions'
import { useAuthStore } from '@/store/authStore'

export default function Sidebar({ isCorporateRoute, company }) {
  const { user } = useAuthStore()
  const { permissions } = useCorporatePermissions()
  const location = useLocation()
  const [corporateExpanded, setCorporateExpanded] = useState(isCorporateRoute)

  const iconMap = {
    LayoutDashboard,
    BookOpen,
    User,
    Settings,
    Building2,
    Users,
    BarChart3
  }
console.log(corporateExpanded, 'Current User in Sidebar');
console.log(user, 'Current User logged in Sidebar');
  const NavItem = ({ route, isNested = false }) => {
    const Icon = iconMap[route.icon] || LayoutDashboard
    
    return (
      <NavLink
        to={route.path}
        className={({ isActive }) =>
          `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
            isNested ? 'ml-4 pl-7' : ''
          } ${
            isActive
              ? 'bg-primary-light text-primary-default border-r-3 border-primary-default'
              : 'text-text-medium hover:bg-background-light hover:text-text-dark'
          }`
        }
      >
        <Icon className="w-5 h-5" />
        <span className="font-medium">{route.label}</span>
      </NavLink>
    )
  }

  const personalRoutes = getAvailableRoutes('authenticated', permissions)
  const corporateRoutes = getAvailableRoutes('corporate', permissions)
  const userRoutes = getAvailableRoutes('user', permissions)

  return (
    <div className="w-64 h-screen bg-white border-r border-background-dark fixed left-0 top-16 overflow-y-auto">
      <div className="p-4">
        {/* Personal Dashboard */}
        <div className="mb-6">
          <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">
            Personal
          </h3>
          <nav className="space-y-1">
            {personalRoutes.map((route) => (
              <NavItem key={route.path} route={route} />
            ))}
          </nav>
        </div>

        {/* Corporate Section - only show if user has company */}
        {!!company && (
          <div className="mb-6">
            <button
              onClick={() => setCorporateExpanded(!corporateExpanded)}
              className="flex items-center justify-between w-full mb-3"
            >
              <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                {company}
              </h3>
              {corporateExpanded ? (
                <ChevronDown className="w-4 h-4 text-text-muted" />
              ) : (
                <ChevronRight className="w-4 h-4 text-text-muted" />
              )}
            </button>
            
            {corporateExpanded && (
              <nav className="space-y-1">
                {corporateRoutes.map((route) => (
                  <NavItem key={route.path} route={route} />
                ))}
              </nav>
            )}
          </div>
        )}

        {/* User Settings */}
        <div>
          <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">
            Account
          </h3>
          <nav className="space-y-1">
            {userRoutes.map((route) => (
              <NavItem key={route.path} route={route} />
            ))}
          </nav>
        </div>
      </div>

      {/* Company Status Footer */}
      {company && (
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-background-dark bg-background-light">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary-light rounded-lg flex items-center justify-center">
              {company.logo_url ? (
                <img 
                  src={company.logo_url} 
                  alt="Company logo" 
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <Building2 className="w-4 h-4 text-primary-default" />
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-text-dark truncate">
                {company.name}
              </p>
              <p className="text-xs text-text-light">
                {company.subscription_status === 'trial' ? 'Trial Account' : 'Active'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
