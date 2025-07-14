// import { Link, useLocation, useParams } from 'react-router-dom';
// import { ChevronRight, Home } from 'lucide-react';
// import { getBreadcrumbs } from '@/config/navigation';

// export default function Breadcrumbs() {
//   const location = useLocation();
//   const params = useParams();
  
//   const breadcrumbs = getBreadcrumbs(location.pathname, params);

//   if (breadcrumbs.length <= 1) return null;

//   return (
//     <nav className="flex items-center space-x-1 text-sm text-gray-500 mb-6" aria-label="Breadcrumb">
//       <Home className="h-4 w-4" />
//       {breadcrumbs.map((breadcrumb, index) => (
//         <div key={breadcrumb.href || index} className="flex items-center">
//           {index > 0 && <ChevronRight className="h-4 w-4 mx-1" />}
//           {breadcrumb.href && !breadcrumb.isLast ? (
//             <Link
//               to={breadcrumb.href}
//               className="hover:text-gray-700 transition-colors"
//             >
//               {breadcrumb.label}
//             </Link>
//           ) : (
//             <span className={breadcrumb.isLast ? 'text-gray-900 font-medium' : ''}>
//               {breadcrumb.label}
//             </span>
//           )}
//         </div>
//       ))}
//     </nav>
//   );
// }

import React from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { useAuth } from '@hooks/auth/useAuth';
import { getBreadcrumbs } from '@/config/navigation';

const Breadcrumbs = () => {
  const location = useLocation();
  const params = useParams();
  const { user } = useAuth();
   const isCorporateUser = user?.user_metadata?.account_type === 'corporate';

  // Get breadcrumbs using the config function
  const breadcrumbs = getBreadcrumbs(location.pathname, params);

  // Don't show breadcrumbs on dashboard or if only one item
  const isDashboard = location.pathname === '/app/dashboard' || location.pathname === '/corporate/dashboard';
  if (isDashboard || breadcrumbs.length <= 1) return null;

  return (
    <nav className="flex items-center space-x-1 text-sm text-text-muted mb-6" aria-label="Breadcrumb">
      {breadcrumbs.map((breadcrumb, index) => (
        <div key={breadcrumb.href || index} className="flex items-center">
          {index > 0 && <ChevronRight size={14} className="mx-2" />}
          
          {breadcrumb.href && !breadcrumb.isLast ? (
            <Link
              to={breadcrumb.href}
              className="flex items-center hover:text-text-medium transition-colors"
            >
              {index === 0 && <Home size={14} className="mr-1" />}
              {breadcrumb.label}
            </Link>
          ) : (
            <span className={`flex items-center ${breadcrumb.isLast ? 'text-text-dark font-medium' : ''}`}>
              {index === 0 && <Home size={14} className="mr-1" />}
              {breadcrumb.label}
            </span>
          )}
        </div>
      ))}
    </nav>
  );
};

export default Breadcrumbs;