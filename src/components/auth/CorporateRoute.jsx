// src/components/auth/CorporateRoute.jsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Building2, AlertCircle, Shield, Crown } from 'lucide-react';

import { useCorporate } from '@/hooks/corporate/useCorporate';
import { LoadingSpinner, Button } from '@/components/ui';
import { CORPORATE_PERMISSIONS, SUBSCRIPTION_LIMITS } from '@/config/corporateRoutes';

/**
 * Corporate Route wrapper component that handles:
 * - Authentication verification
 * - Organization membership verification  
 * - Permission-based access control
 * - Subscription-based feature access
 * - Employee limit checking
 */
const CorporateRoute = ({ 
  children,
  requiredPermission = null,
  requiredFeature = null,
  requiresEmployeeSlots = false,
  fallbackPath = '/corporate/dashboard',
  showUpgradePrompt = true
}) => {
  const location = useLocation();
  
  const {
    organization,
    userRole,
    isAdmin,
    isManager,
    loading,
    error,
    hasPermission,
    isFeatureEnabled,
    isTrialExpired,
    isSubscriptionActive,
    canAddMoreEmployees,
    remainingEmployeeSlots,
    redirectToCreate
  } = useCorporate();

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-light">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-text-medium">Loading organization...</p>
        </div>
      </div>
    );
  }

  // Handle organization loading errors
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-light">
        <div className="max-w-md mx-auto text-center">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <AlertCircle className="w-16 h-16 text-error-default mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-text-dark mb-2">
              Organization Error
            </h2>
            <p className="text-text-medium mb-6">
              {error}
            </p>
            <div className="space-y-3">
              <Button onClick={() => window.location.reload()}>
                Try Again
              </Button>
              <Button variant="secondary" onClick={redirectToCreate}>
                Create Organization
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Redirect to create organization if none exists
  if (!organization) {
    return <Navigate to="/corporate/create" state={{ from: location }} replace />;
  }

  // Check subscription status
  if (!isSubscriptionActive || isTrialExpired) {
    if (showUpgradePrompt) {
      return (
        <SubscriptionExpiredPrompt
          organization={organization}
          isTrialExpired={isTrialExpired}
          onContinue={() => {
            // Allow limited access to certain routes even with expired subscription
            const allowedPaths = ['/corporate/dashboard', '/corporate/settings'];
            if (allowedPaths.includes(location.pathname)) {
              return children;
            }
            return <Navigate to="/corporate/dashboard" replace />;
          }}
        />
      );
    } else {
      // Redirect to dashboard with warning
      return <Navigate to="/corporate/dashboard" state={{ subscriptionWarning: true }} replace />;
    }
  }

  // Check permission requirements
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return (
      <PermissionDeniedPrompt
        requiredPermission={requiredPermission}
        userRole={userRole}
        organization={organization}
        fallbackPath={fallbackPath}
      />
    );
  }

  // Check feature requirements
  if (requiredFeature && !isFeatureEnabled(requiredFeature)) {
    return (
      <FeatureUnavailablePrompt
        requiredFeature={requiredFeature}
        organization={organization}
        fallbackPath={fallbackPath}
      />
    );
  }

  // Check employee slot requirements
  if (requiresEmployeeSlots && !canAddMoreEmployees) {
    return (
      <EmployeeLimitPrompt
        organization={organization}
        remainingSlots={remainingEmployeeSlots}
        fallbackPath={fallbackPath}
      />
    );
  }

  // Show warning for low employee slots
  if (requiresEmployeeSlots && remainingEmployeeSlots <= 5 && remainingEmployeeSlots > 0) {
    return (
      <div className="space-y-4">
        <div className="bg-warning-light border border-warning-default rounded-lg p-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-warning-default" />
            <span className="text-sm font-medium text-warning-default">
              {remainingEmployeeSlots} employee slots remaining
            </span>
          </div>
          <p className="text-sm text-warning-default mt-1">
            Consider upgrading your plan to add more employees.
          </p>
        </div>
        {children}
      </div>
    );
  }

  // Render protected content
  return children;
};

// Subscription Expired Prompt Component
const SubscriptionExpiredPrompt = ({ organization, isTrialExpired, onContinue }) => {
  const getSubscriptionMessage = () => {
    if (isTrialExpired) {
      return {
        title: 'Free Trial Expired',
        message: 'Your free trial has ended. Upgrade to continue using all features.',
        actionText: 'Upgrade Now'
      };
    }
    
    return {
      title: 'Subscription Inactive',
      message: 'Your subscription is currently inactive. Please contact support or upgrade your plan.',
      actionText: 'Contact Support'
    };
  };

  const { title, message, actionText } = getSubscriptionMessage();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background-light">
      <div className="max-w-md mx-auto text-center">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <AlertCircle className="w-16 h-16 text-warning-default mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-text-dark mb-2">
            {title}
          </h2>
          <p className="text-text-medium mb-6">
            {message}
          </p>
          
          {/* Subscription Details */}
          <div className="bg-background-light p-4 rounded-lg mb-6">
            <h3 className="font-medium text-text-dark mb-2">Current Plan</h3>
            <p className="text-sm text-text-medium capitalize">
              {organization?.subscription_type || 'Unknown'}
            </p>
            {organization?.subscription_end_date && (
              <p className="text-xs text-text-muted mt-1">
                Expired: {new Date(organization.subscription_end_date).toLocaleDateString()}
              </p>
            )}
          </div>
          
          <div className="space-y-3">
            <Button className="w-full">
              {actionText}
            </Button>
            <Button variant="secondary" className="w-full" onClick={onContinue}>
              Continue with Limited Access
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Permission Denied Prompt Component
const PermissionDeniedPrompt = ({ requiredPermission, userRole, organization, fallbackPath }) => {
  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin':
        return <Crown className="w-4 h-4 text-error-default" />;
      case 'manager':
        return <Shield className="w-4 h-4 text-warning-default" />;
      default:
        return <Shield className="w-4 h-4 text-text-medium" />;
    }
  };

  const getRequiredRoles = (permission) => {
    const roles = [];
    Object.entries(CORPORATE_PERMISSIONS).forEach(([role, permissions]) => {
      if (permissions.includes(permission)) {
        roles.push(role);
      }
    });
    return roles;
  };

  const requiredRoles = getRequiredRoles(requiredPermission);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background-light">
      <div className="max-w-md mx-auto text-center">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <AlertCircle className="w-16 h-16 text-error-default mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-text-dark mb-2">
            Access Denied
          </h2>
          <p className="text-text-medium mb-6">
            You don't have permission to access this feature.
          </p>
          
          {/* Permission Details */}
          <div className="bg-background-light p-4 rounded-lg mb-6 text-left">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-text-medium">Your Role:</span>
              <div className="flex items-center gap-2">
                {getRoleIcon(userRole)}
                <span className="text-sm font-medium text-text-dark capitalize">
                  {userRole}
                </span>
              </div>
            </div>
            
            <div className="flex items-start justify-between">
              <span className="text-sm text-text-medium">Required:</span>
              <div className="text-right">
                {requiredRoles.map((role, index) => (
                  <div key={role} className="flex items-center gap-2 justify-end">
                    {getRoleIcon(role)}
                    <span className="text-sm font-medium text-text-dark capitalize">
                      {role}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            
            {requiredPermission && (
              <div className="mt-2 pt-2 border-t border-background-dark">
                <span className="text-xs text-text-muted">
                  Permission: <code className="bg-background-medium px-1 rounded">
                    {requiredPermission}
                  </code>
                </span>
              </div>
            )}
          </div>
          
          <div className="space-y-3">
            <Button onClick={() => window.history.back()} variant="secondary" className="w-full">
              Go Back
            </Button>
            <p className="text-xs text-text-muted">
              Contact your organization admin at {organization?.name} to request access.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Feature Unavailable Prompt Component
const FeatureUnavailablePrompt = ({ requiredFeature, organization, fallbackPath }) => {
  const currentLimits = SUBSCRIPTION_LIMITS[organization?.subscription_type];
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-background-light">
      <div className="max-w-md mx-auto text-center">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <Building2 className="w-16 h-16 text-text-muted mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-text-dark mb-2">
            Feature Not Available
          </h2>
          <p className="text-text-medium mb-6">
            This feature is not available in your current plan.
          </p>
          
          {/* Plan Details */}
          <div className="bg-background-light p-4 rounded-lg mb-6">
            <h3 className="font-medium text-text-dark mb-2">Current Plan</h3>
            <p className="text-sm text-text-medium capitalize mb-2">
              {organization?.subscription_type || 'Unknown'}
            </p>
            
            {currentLimits && (
              <div className="text-xs text-text-muted space-y-1">
                <p>Max Employees: {currentLimits.maxEmployees}</p>
                <p>Features: {currentLimits.features.length} included</p>
              </div>
            )}
            
            <div className="mt-2 pt-2 border-t border-background-dark">
              <span className="text-xs text-text-muted">
                Required Feature: <code className="bg-background-medium px-1 rounded">
                  {requiredFeature}
                </code>
              </span>
            </div>
          </div>
          
          <div className="space-y-3">
            <Button className="w-full">
              Upgrade Plan
            </Button>
            <Button 
              variant="secondary" 
              className="w-full"
              onClick={() => window.history.back()}
            >
              Go Back
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Employee Limit Prompt Component
const EmployeeLimitPrompt = ({ organization, remainingSlots, fallbackPath }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background-light">
      <div className="max-w-md mx-auto text-center">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <AlertCircle className="w-16 h-16 text-warning-default mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-text-dark mb-2">
            Employee Limit Reached
          </h2>
          <p className="text-text-medium mb-6">
            You've reached the maximum number of employees for your current plan.
          </p>
          
          {/* Usage Details */}
          <div className="bg-background-light p-4 rounded-lg mb-6">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-text-medium">Current Usage:</span>
              <span className="font-medium text-text-dark">
                {organization?.current_employee_count || 0} / {organization?.max_employees || 0}
              </span>
            </div>
            <div className="w-full bg-background-medium rounded-full h-2">
              <div
                className="bg-warning-default h-2 rounded-full"
                style={{
                  width: `${Math.min(
                    ((organization?.current_employee_count || 0) / (organization?.max_employees || 1)) * 100,
                    100
                  )}%`
                }}
              />
            </div>
          </div>
          
          <div className="space-y-3">
            <Button className="w-full">
              Upgrade Plan
            </Button>
            <Button 
              variant="secondary" 
              className="w-full"
              onClick={() => window.history.back()}
            >
              Manage Employees
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Higher-order component for easy route wrapping
export const withCorporateRoute = (Component, options = {}) => {
  return (props) => (
    <CorporateRoute {...options}>
      <Component {...props} />
    </CorporateRoute>
  );
};

// Predefined route wrappers for common scenarios
export const AdminRoute = ({ children, ...props }) => (
  <CorporateRoute requiredPermission="admin" {...props}>
    {children}
  </CorporateRoute>
);

export const ManagerRoute = ({ children, ...props }) => (
  <CorporateRoute requiredPermission="invite_employees" {...props}>
    {children}
  </CorporateRoute>
);

export const EmployeeManagementRoute = ({ children, ...props }) => (
  <CorporateRoute 
    requiredPermission="invite_employees" 
    requiresEmployeeSlots={true}
    {...props}
  >
    {children}
  </CorporateRoute>
);

export const CourseAssignmentRoute = ({ children, ...props }) => (
  <CorporateRoute requiredPermission="assign_courses" {...props}>
    {children}
  </CorporateRoute>
);

export const ReportsRoute = ({ children, ...props }) => (
  <CorporateRoute requiredPermission="view_reports" {...props}>
    {children}
  </CorporateRoute>
);

export const SettingsRoute = ({ children, ...props }) => (
  <CorporateRoute requiredPermission="manage_settings" {...props}>
    {children}
  </CorporateRoute>
);

export default CorporateRoute;