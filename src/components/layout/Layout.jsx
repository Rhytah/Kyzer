// // import React from 'react';
// // import { Outlet, Link, useLocation } from 'react-router-dom';
// // import { Home, BookOpen, Award, BarChart3, Settings } from 'lucide-react';
// // import kyzerLogo from "../../assets/images/Kyzerlogo.png";

// // const Layout = () => {
// //   const location = useLocation();

// //   const navigation = [
// //     { name: 'Dashboard', href: '/dashboard', icon: Home },
// //     { name: 'My Courses', href: '/courses', icon: BookOpen },
// //     { name: 'Progress', href: '/progress', icon: BarChart3 },
// //     { name: 'Certificates', href: '/certificates', icon: Award },
// //     { name: 'Profile', href: '/profile', icon: Settings },
// //     { name: 'Settings', href: '/settings', icon: Settings },
// //   ];

// //   const isActive = (path) => location.pathname === path;

// //   return (
// //     <div className="min-h-screen bg-background-light">
// //       {/* Header */}
// //       <header className="bg-white border-b border-border shadow-sm">
// //         <div className="px-6 py-4">
// //           <div className="flex items-center justify-between">
// //             <Link to="/dashboard" className="flex items-center space-x-2">
// //               <div className="flex justify-center mb-6">
// //               <img src={kyzerLogo} alt="Kyzer Logo" className="h-8 ml-2" />
// //             </div>
// //             </Link>
            
// //             <div className="flex items-center space-x-4">
// //               <div className="w-8 h-8 bg-background-medium rounded-full flex items-center justify-center">
// //                 <span className="text-text-medium text-sm">U</span>
// //               </div>
// //             </div>
// //           </div>
// //         </div>
// //       </header>

// //       <div className="flex">
// //         {/* Sidebar */}
// //         <nav className="hidden lg:block w-64 bg-white border-r border-border min-h-screen">
// //           <div className="p-4 space-y-2">
// //             {navigation.map((item) => {
// //               const Icon = item.icon;
// //               return (
// //                 <Link
// //                   key={item.name}
// //                   to={item.href}
// //                   className={`
// //                     flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors
// //                     ${isActive(item.href)
// //                       ? 'bg-primary text-white' 
// //                       : 'text-text-medium hover:text-text-dark hover:bg-background-light'
// //                     }
// //                   `}
// //                 >
// //                   <Icon size={20} className="mr-3" />
// //                   {item.name}
// //                 </Link>
// //               );
// //             })}
// //           </div>
// //         </nav>

// //         {/* Main Content */}
// //         <main className="flex-1">
// //           <Outlet />
// //         </main>
// //       </div>

// //       {/* Mobile Navigation */}
// //       <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-border">
// //         <div className="flex justify-around py-2">
// //           {navigation.slice(0, 4).map((item) => {
// //             const Icon = item.icon;
// //             return (
// //               <Link
// //                 key={item.name}
// //                 to={item.href}
// //                 className={`
// //                   flex flex-col items-center justify-center px-3 py-2 min-w-0 flex-1
// //                   ${isActive(item.href) ? 'text-primary' : 'text-text-muted'}
// //                 `}
// //               >
// //                 <Icon size={20} className="mb-1" />
// //                 <span className="text-xs">{item.name}</span>
// //               </Link>
// //             );
// //           })}
// //         </div>
// //       </nav>
// //     </div>
// //   );
// // };

// // export default Layout;

// import React, { useState } from 'react';
// import { Outlet } from 'react-router-dom';
// import { useAuth } from '@hooks/auth/useAuth';
// import Header from './Header';
// import Sidebar from './Sidebar';
// import MobileNav from './MobileNav';
// import Breadcrumbs from './Breadcrumbs';

// export default function Layout() {
//   const [sidebarOpen, setSidebarOpen] = useState(false);
//   const { user } = useAuth();
//     const isCorporateUser = user?.user_metadata?.account_type === 'corporate';

//   const isIndividualUser = user?.user_metadata?.account_type === 'individual';
//   console.log(user?.metadata, 'Current User in Layout');
//   return (
//     <div className="min-h-screen bg-background-light">
//       {/* Header */}
//       <Header onMenuClick={() => setSidebarOpen(true)} />

//       <div className="flex">
//         {/* Desktop Sidebar */}
//         <Sidebar isCorporateRoute={user?.user_metadata} company={user?.user_metadata?.company_name}/>

//         {/* Mobile Sidebar Overlay */}
//         {sidebarOpen && (
//           <>
//             <div 
//               className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
//               onClick={() => setSidebarOpen(false)}
//             />
//             <div className="lg:hidden fixed left-0 top-0 h-full w-64 bg-white z-50 transform transition-transform duration-300">
//               <Sidebar mobile onClose={() => setSidebarOpen(false)} isCorporateRoute={user?.user_metadata} company={user?.user_metadata?.company_name} />
//             </div>
//           </>
//         )}

//         {/* Main Content */}
//         <main className="flex-1 lg:ml-64">
//           <div className="p-6 pb-20 lg:pb-6">
//             <Breadcrumbs />
//             <Outlet />
//           </div>
//         </main>
//       </div>

//       {/* Mobile Navigation */}
//       <MobileNav />
//     </div>
//   );
// };

// import React, { useState } from 'react';
// import { Outlet } from 'react-router-dom';
// import { useAuth } from '@hooks/auth/useAuth';
// import Header from './Header';
// import Sidebar from './Sidebar';
// import MobileNav from './MobileNav';
// import Breadcrumbs from './Breadcrumbs';

// export default function Layout() {
//   const [sidebarOpen, setSidebarOpen] = useState(false);
//   const { user } = useAuth();
//   const isCorporateUser = user?.user_metadata?.account_type === 'corporate';
//   const isIndividualUser = user?.user_metadata?.account_type === 'individual';

//   return (
//     <div className="min-h-screen bg-background-light">
//       {/* Header - always visible */}
//       <Header 
//         onMenuClick={() => setSidebarOpen(true)} 
//         showMenuButton={!!user} // Only show menu button when signed in
//       />

//       <div className="flex">
//         {/* Desktop Sidebar - only visible when signed in */}
//         {user && (
//           <Sidebar 
//             isCorporateRoute={isCorporateUser} 
//             company={user?.user_metadata?.company_name}
//           />
//         )}

//         {/* Mobile Sidebar Overlay - only visible when signed in and open */}
//         {user && sidebarOpen && (
//           <>
//             <div 
//               className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
//               onClick={() => setSidebarOpen(false)}
//             />
//             <div className="lg:hidden fixed left-0 top-0 h-full w-64 bg-white z-50 transform transition-transform duration-300">
//               <Sidebar 
//                 mobile 
//                 onClose={() => setSidebarOpen(false)} 
//                 isCorporateRoute={isCorporateUser} 
//                 company={user?.user_metadata?.company_name} 
//               />
//             </div>
//           </>
//         )}

//         {/* Main Content */}
//         <main className={`flex-1 ${user ? 'lg:ml-64' : ''}`}>
//           <div className="p-6 pb-20 lg:pb-6">
//             <Breadcrumbs />
//             <Outlet />
//           </div>
//         </main>
//       </div>

//       {/* Mobile Navigation - only visible when signed in */}
//       {user && <MobileNav />}
//     </div>
//   );
// };

import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '@hooks/auth/useAuth';
import Header from './Header';
import Sidebar from './Sidebar';
import MobileNav from './MobileNav';
import Breadcrumbs from './Breadcrumbs';

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [desktopSidebarCollapsed, setDesktopSidebarCollapsed] = useState(false);
  const { user } = useAuth();
  const isCorporateUser = user?.user_metadata?.account_type === 'corporate';

  const toggleDesktopSidebar = () => {
    setDesktopSidebarCollapsed(!desktopSidebarCollapsed);
  };

  const toggleMobileSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
   const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background-light">
      {/* Header */}
      <Header 
        onMenuClick={toggleMobileSidebar} 
        showMenuButton={!!user}
        onDesktopToggleClick={toggleDesktopSidebar}
        isDesktopSidebarCollapsed={desktopSidebarCollapsed}
      />

      <div className="flex">
        {/* Desktop Sidebar - only visible when signed in */}
        {user && (
          <div className={`hidden lg:block transition-all duration-300 ease-in-out 
            ${desktopSidebarCollapsed ? 'w-20' : 'w-64'}`}>
            <Sidebar 
              collapsed={desktopSidebarCollapsed}
              isCorporateRoute={isCorporateUser} 
              company={user?.user_metadata?.company_name}
              onToggleCollapse={toggleDesktopSidebar}
            />
          </div>
        )}

        {/* Mobile Sidebar Overlay */}
        {user && sidebarOpen && (
          <>
            <div 
              className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
              onClick={() => setSidebarOpen(false)}
            />
            <div className="lg:hidden fixed left-0 top-0 h-full w-64 bg-white z-50">
              <Sidebar 
                mobile 
                onClose={() => setSidebarOpen(false)} 
                isCorporateRoute={isCorporateUser} 
                company={user?.user_metadata?.company_name} 
              />
            </div>
          </>
        )}

        {/* Main Content */}
        <main className={`flex-1 transition-all duration-300 ease-in-out`}>
          <div className="p-6 pb-20 lg:pb-6">
            <Breadcrumbs />
            <Outlet />
          </div>
        </main>
      </div>

      {/* Mobile Navigation */}
      {user && <MobileNav />}
    </div>
  );
};