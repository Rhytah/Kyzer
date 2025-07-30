
// src/pages/corporate/CompanyDashboard.jsx - Fixed version
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/auth/useAuth';
import { useCorporate } from '@/hooks/corporate/useCorporate';
import { Link } from 'react-router-dom';
import { Settings } from 'lucide-react';

const CompanyDashboard = () => {
  const { user } = useAuth();
  const { organization, role, loading, error, hasPermission } = useCorporate();
  const [dashboardData, setDashboardData] = useState({
    totalEmployees: 0,
    activeEnrollments: 0,
    completedCourses: 0,
    pendingInvitations: 0
  });
  const [dataLoading, setDataLoading] = useState(false);

  // Load dashboard data after organization is available
  useEffect(() => {
    if (organization && !loading) {
      fetchDashboardData();
    }
  }, [organization, loading]);

  const fetchDashboardData = async () => {
    setDataLoading(true);
    try {
      // For now, just set some mock data
      // Later, you'll replace this with actual API calls
      setDashboardData({
        totalEmployees: 25,
        activeEnrollments: 48,
        completedCourses: 156,
        pendingInvitations: 3
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setDataLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <h3 className="text-lg font-medium text-red-800">Error Loading Dashboard</h3>
          <p className="text-red-600 mt-2">{error}</p>
        </div>
      </div>
    );
  }

  if (!organization) {
    return (
      <div className="p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <h3 className="text-lg font-medium text-yellow-800">No Organization Found</h3>
          <p className="text-yellow-600 mt-2">You are not part of any organization.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{organization.name}</h1>
        <p className="text-gray-600 mt-2">
          Welcome back, {user?.email}! You are an {role} of this organization.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-md">
              <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Employees</p>
              <p className="text-2xl font-semibold text-gray-900">
                {dataLoading ? '...' : dashboardData.totalEmployees}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-md">
              <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Enrollments</p>
              <p className="text-2xl font-semibold text-gray-900">
                {dataLoading ? '...' : dashboardData.activeEnrollments}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-md">
              <svg className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Completed Courses</p>
              <p className="text-2xl font-semibold text-gray-900">
                {dataLoading ? '...' : dashboardData.completedCourses}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-md">
              <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending Invitations</p>
              <p className="text-2xl font-semibold text-gray-900">
                {dataLoading ? '...' : dashboardData.pendingInvitations}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            {hasPermission('invite_employees') && (
              <button className="w-full text-left p-3 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors">
                                                                    <Link to="/company/employees" className=" text-blue-600 hover:underline">

                <div className="flex items-center">
                  <svg className="h-5 w-5 text-blue-600 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span className="font-medium">Invite Employees</span>
                </div>
                </Link>
              </button>
            )}
            
            {hasPermission('view_reports') && (
              <button className="w-full text-left p-3 bg-green-50 hover:bg-green-100 rounded-md transition-colors">
                                                    <Link to="/company/reports" className=" text-blue-600 hover:underline">

                <div className="flex items-center">

                  <svg className="h-5 w-5 text-green-600 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <span className="font-medium">View Reports</span>
                </div>                  </Link>

              </button>
            )}

            <button className="w-full text-left p-3 bg-purple-50 hover:bg-purple-100 rounded-md transition-colors">
              <div className="flex items-center">
                <svg className="h-5 w-5 text-purple-600 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <span className="font-medium">Browse Courses</span>
              </div>
            </button>
          </div>
           <button className="w-full text-left p-3 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors">
                                                                    <Link to="/company/settings" className=" text-blue-600 hover:underline">

                <div className="flex items-center">
                 

                  <Settings className='h-5 w-5'/>
                  <span className="font-medium">Manage Company</span>
                </div>
                </Link>
              </button>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            <div className="flex items-center p-3 bg-gray-50 rounded-md">
              <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">New employee joined</p>
                <p className="text-xs text-gray-500">2 hours ago</p>
              </div>
            </div>
            <div className="flex items-center p-3 bg-gray-50 rounded-md">
              <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">Course completion: React Basics</p>
                <p className="text-xs text-gray-500">1 day ago</p>
              </div>
            </div>
            <div className="flex items-center p-3 bg-gray-50 rounded-md">
              <div className="w-2 h-2 bg-purple-400 rounded-full mr-3"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">Monthly report generated</p>
                <p className="text-xs text-gray-500">3 days ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Debug Info (temporary) */}
      <div className="bg-gray-50 rounded-lg p-4 mt-8">
        <h4 className="font-medium text-gray-700 mb-2">Debug Info</h4>
        <div className="text-xs text-gray-600 space-y-1">
          <p><strong>User:</strong> {user?.email || 'undefined'}</p>
          <p><strong>Organization:</strong> {organization?.name || 'undefined'}</p>
          <p><strong>Role:</strong> {role || 'undefined'}</p>
          <p><strong>Loading:</strong> {loading.toString()}</p>
          <p><strong>Error:</strong> {error || 'none'}</p>
        </div>
      </div>
    </div>
  );
};

export default CompanyDashboard;