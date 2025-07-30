

// src/pages/corporate/CompanyDashboard.jsx - Fixed to handle PGRST116 error
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/auth/useAuth";
import { useCorporate } from "@/hooks/corporate/useCorporate";
import { Link, useNavigate } from "react-router-dom";
import { Settings, Plus, Users, BookOpen, AlertCircle, Building2 } from "lucide-react";

const CompanyDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const { 
    organization, 
    role, 
    loading: corporateLoading, 
    error: corporateError, 
    hasPermission,
    isCorporateUser,
    initialized 
  } = useCorporate();
  
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState({
    totalEmployees: 0,
    activeEnrollments: 0,
    completedCourses: 0,
    pendingInvitations: 0,
  });
  const [dataLoading, setDataLoading] = useState(false);
  const [dataError, setDataError] = useState(null);

  // Determine overall loading state
  const isLoading = authLoading || corporateLoading || !initialized;

  // Load dashboard data after organization is available
  useEffect(() => {
    if (organization && !corporateLoading) {
      fetchDashboardData();
    } else if (!corporateLoading && !organization) {
      // User has no organization, reset dashboard data
      setDashboardData({
        totalEmployees: 0,
        activeEnrollments: 0,
        completedCourses: 0,
        pendingInvitations: 0,
      });
    }
  }, [organization, corporateLoading]);

  const fetchDashboardData = async () => {
    if (!organization?.id) return;

    setDataLoading(true);
    setDataError(null);

    try {
      // TODO: Replace with actual API calls to your database
      // For now, simulate loading with timeout
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setDashboardData({
        totalEmployees: 25,
        activeEnrollments: 48,
        completedCourses: 156,
        pendingInvitations: 3,
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setDataError("Failed to load dashboard data");
    } finally {
      setDataLoading(false);
    }
  };

  // Handle creating a new organization
  const handleCreateOrganization = () => {
    navigate('/company/setup');
  };

  // Handle joining an organization
  const handleJoinOrganization = () => {
    navigate('/company/join');
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // Auth error state
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Authentication Required</h2>
          <p className="text-gray-600 mb-4">Please log in to access your dashboard.</p>
          <Link 
            to="/login" 
            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  // Corporate error state (but not PGRST116)
  if (corporateError && corporateError.code !== 'PGRST116') {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center mb-4">
            <AlertCircle className="h-6 w-6 text-red-600 mr-3" />
            <h3 className="text-lg font-medium text-red-800">
              Error Loading Dashboard
            </h3>
          </div>
          <p className="text-red-700 mb-4">
            {corporateError.message || 'Failed to load organization data'}
          </p>
          <div className="flex space-x-4">
            <button
              onClick={() => window.location.reload()}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
            >
              Retry
            </button>
            <Link
              to="/dashboard"
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
            >
              Go to Personal Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // No organization state (PGRST116 or user not part of organization)
  if (!isCorporateUser || !organization) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="text-center py-12">
          <Building2 className="h-16 w-16 text-gray-400 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            No Organization Found
          </h2>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            You're not currently part of any organization. Create a new organization 
            for your company or join an existing one.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleCreateOrganization}
              className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-dark flex items-center justify-center"
            >
              <Plus className="h-5 w-5 mr-2" />
              Create Organization
            </button>
            <button
              onClick={handleJoinOrganization}
              className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 flex items-center justify-center"
            >
              <Users className="h-5 w-5 mr-2" />
              Join Organization
            </button>
          </div>

          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-medium text-blue-800 mb-2">Need Help?</h3>
            <p className="text-sm text-blue-700">
              Contact your IT administrator or company admin to get added to your organization,
              or create a new organization if you're setting up for the first time.
            </p>
          </div>

          {/* Temporary debug info */}
          <div className="mt-8 p-4 bg-gray-50 rounded-lg text-left">
            <h4 className="font-medium text-gray-700 mb-2">Debug Info</h4>
            <div className="text-xs text-gray-600 space-y-1">
              <p><strong>User:</strong> {user?.email || "undefined"}</p>
              <p><strong>Corporate User:</strong> {isCorporateUser.toString()}</p>
              <p><strong>Organization:</strong> {organization?.name || "none"}</p>
              <p><strong>Role:</strong> {role || "none"}</p>
              <p><strong>Corporate Loading:</strong> {corporateLoading.toString()}</p>
              <p><strong>Initialized:</strong> {initialized.toString()}</p>
              <p><strong>Error Code:</strong> {corporateError?.code || "none"}</p>
              <p><strong>Error Type:</strong> {corporateError?.type || "none"}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Success state - user has organization
  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {organization.name}
            </h1>
            <p className="text-gray-600 mt-2">
              Welcome back, {user?.email}! You are {role === 'admin' ? 'an' : 'a'} {role} of this organization.
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              organization.subscription_status === 'active'
                ? 'bg-green-100 text-green-800'
                : organization.subscription_status === 'trial'
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-red-100 text-red-800'
            }`}>
              {organization.subscription_status?.charAt(0).toUpperCase() + organization.subscription_status?.slice(1)}
            </span>
          </div>
        </div>
      </div>

      {/* Data loading error */}
      {dataError && (
        <div className="mb-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-yellow-400 mr-2" />
              <span className="text-yellow-800">{dataError}</span>
              <button
                onClick={fetchDashboardData}
                className="ml-auto text-yellow-600 hover:text-yellow-800 underline"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-md">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Employees</p>
              <p className="text-2xl font-semibold text-gray-900">
                {dataLoading ? "..." : dashboardData?.totalEmployees || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-md">
              <BookOpen className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Enrollments</p>
              <p className="text-2xl font-semibold text-gray-900">
                {dataLoading ? "..." : dashboardData?.activeEnrollments || 0}
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
                {dataLoading ? "..." : dashboardData?.completedCourses || 0}
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
                {dataLoading ? "..." : dashboardData.pendingInvitations || 0}
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
            {hasPermission("invite_employees") && (
              <Link 
                to="/company/employees" 
                className="w-full block p-3 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
              >
                <div className="flex items-center">
                  <Plus className="h-5 w-5 text-blue-600 mr-3" />
                  <span className="font-medium text-blue-700">Invite Employees</span>
                </div>
              </Link>
            )}

            {hasPermission("view_reports") && (
              <Link 
                to="/company/reports" 
                className="w-full block p-3 bg-green-50 hover:bg-green-100 rounded-md transition-colors"
              >
                <div className="flex items-center">
                  <svg className="h-5 w-5 text-green-600 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <span className="font-medium text-green-700">View Reports</span>
                </div>
              </Link>
            )}

            <Link 
              to="/courses" 
              className="w-full block p-3 bg-purple-50 hover:bg-purple-100 rounded-md transition-colors"
            >
              <div className="flex items-center">
                <BookOpen className="h-5 w-5 text-purple-600 mr-3" />
                <span className="font-medium text-purple-700">Browse Courses</span>
              </div>
            </Link>

            <Link 
              to="/company/settings" 
              className="w-full block p-3 bg-gray-50 hover:bg-gray-100 rounded-md transition-colors"
            >
              <div className="flex items-center">
                <Settings className="h-5 w-5 text-gray-600 mr-3" />
                <span className="font-medium text-gray-700">Organization Settings</span>
              </div>
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {dataLoading ? (
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
              </div>
            ) : (
              <>
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
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyDashboard;