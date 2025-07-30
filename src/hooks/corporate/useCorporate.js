// src/hooks/corporate/useCorporate.js - Fixed to prevent PGRST116 error
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/auth/useAuth";
import { supabase } from "@/lib/supabase";

export const useCorporate = () => {
  const { user } = useAuth();
  const [organization, setOrganization] = useState(null);
  const [permissions, setPermissions] = useState({});
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [initialized, setInitialized] = useState(false);

  // Helper function to get default permissions based on role
  const getDefaultPermissions = useCallback((userRole) => {
    const rolePermissions = {
      'admin': {
        invite_employees: true,
        manage_employees: true,
        view_reports: true,
        generate_reports: true,
        manage_settings: true,
        manage_billing: true,
        manage_integrations: true,
        assign_courses: true,
        view_all_progress: true,
        manage_departments: true,
        view_analytics: true
      },
      'manager': {
        invite_employees: true,
        manage_employees: false,
        view_reports: true,
        generate_reports: false,
        manage_settings: false,
        manage_billing: false,
        manage_integrations: false,
        assign_courses: true,
        view_all_progress: true,
        manage_departments: false,
        view_analytics: false
      },
      'member': {
        invite_employees: false,
        manage_employees: false,
        view_reports: false,
        generate_reports: false,
        manage_settings: false,
        manage_billing: false,
        manage_integrations: false,
        assign_courses: false,
        view_all_progress: false,
        manage_departments: false,
        view_analytics: false
      }
    };

    return rolePermissions[userRole] || rolePermissions['member'];
  }, []);

  // Safe corporate data loading - FIXES PGRST116 ISSUE
  const loadCorporateData = useCallback(async () => {
    if (!user?.id) {
      console.log('No user ID, setting defaults');
      setOrganization(null);
      setPermissions(getDefaultPermissions('member'));
      setRole(null);
      setError(null);
      setLoading(false);
      setInitialized(true);
      return;
    }

    try {
      console.log('Loading corporate data for user:', user.id);
      setLoading(true);
      setError(null);

      // CRITICAL FIX: Use maybeSingle() instead of single() to prevent PGRST116
      const { data: membershipData, error: membershipError } = await supabase
        .from('organization_members')
        .select(`
          role,
          permissions,
          status,
          joined_at,
          organization:organization_id(
            id,
            name,
            slug,
            email,
            max_employees,
            subscription_status,
            subscription_end_date
          )
        `)
        .eq('user_id', user.id)
        .eq('status', 'active')
        .maybeSingle(); // ✅ This prevents PGRST116 - returns null instead of error

      console.log('Corporate query result:', { membershipData, membershipError });

      if (membershipError) {
        // Should not get PGRST116 with maybeSingle(), but handle other errors
        console.error("Error loading corporate data:", membershipError);
        setError({
          type: 'CORPORATE_DATA_ERROR',
          message: `Failed to load organization data: ${membershipError.message}`,
          code: membershipError.code,
          originalError: membershipError
        });
        setOrganization(null);
        setPermissions(getDefaultPermissions('member'));
        setRole(null);
      } else if (membershipData && membershipData.organization) {
        // User is part of an organization
        console.log('User is part of organization:', membershipData.organization.name);
        setOrganization(membershipData.organization);
        setRole(membershipData.role);
        
        // Set permissions (custom overrides default)
        const defaultPermissions = getDefaultPermissions(membershipData.role);
        const customPermissions = membershipData.permissions || {};
        
        setPermissions({
          ...defaultPermissions,
          ...customPermissions
        });
        setError(null);
      } else {
        // User is not part of any organization - this is NORMAL, not an error
        console.log('User is not part of any organization');
        setOrganization(null);
        setPermissions(getDefaultPermissions('member'));
        setRole(null);
        setError(null);
      }

    } catch (error) {
      console.error("Unexpected error in loadCorporateData:", error);
      
      setError({
        type: 'UNKNOWN_ERROR',
        message: `Unexpected error: ${error.message}`,
        originalError: error
      });
      
      // Set safe defaults
      setOrganization(null);
      setPermissions(getDefaultPermissions('member'));
      setRole(null);
    } finally {
      setLoading(false);
      setInitialized(true);
    }
  }, [user?.id, getDefaultPermissions]);

  // Initialize corporate data when user changes
  useEffect(() => {
    let mounted = true;
    
    // Emergency timeout to prevent infinite loading
    const emergencyTimeout = setTimeout(() => {
      if (mounted && loading && !initialized) {
        console.warn('EMERGENCY: Corporate data loading timeout');
        setLoading(false);
        setInitialized(true);
        setError({
          type: 'TIMEOUT',
          message: 'Loading organization data timed out'
        });
      }
    }, 10000); // 10 seconds

    const initializeCorporateData = async () => {
      if (!mounted) return;

      try {
        if (user === null) {
          // User is explicitly null (logged out)
          setOrganization(null);
          setPermissions(getDefaultPermissions('member'));
          setRole(null);
          setError(null);
          setLoading(false);
          setInitialized(true);
        } else if (user) {
          // User exists, load corporate data
          await loadCorporateData();
        }
        // If user is undefined, we're still loading auth, so wait
      } catch (error) {
        console.error('Error in initializeCorporateData:', error);
        if (mounted) {
          setError({
            type: 'INITIALIZATION_ERROR',
            message: 'Failed to initialize corporate data'
          });
          setLoading(false);
          setInitialized(true);
        }
      }
    };

    initializeCorporateData();

    return () => {
      mounted = false;
      clearTimeout(emergencyTimeout);
    };
  }, [user, loadCorporateData, getDefaultPermissions]);

  // Helper functions - memoized to prevent re-renders
  const hasPermission = useCallback((permission) => {
    return Boolean(permissions[permission]);
  }, [permissions]);

  const isAdmin = useCallback(() => {
    return role === 'admin';
  }, [role]);

  const isManagerOrAdmin = useCallback(() => {
    return role === 'admin' || role === 'manager';
  }, [role]);

  const isMember = useCallback(() => {
    return role === 'member';
  }, [role]);

  // Get organization employees (for admins/managers)
  const getOrganizationEmployees = useCallback(async () => {
    if (!organization?.id || !isManagerOrAdmin()) {
      return { data: null, error: { message: 'No permission to view employees' } };
    }

    try {
      const { data, error } = await supabase
        .from('organization_members')
        .select(`
          *,
          profile:user_id(
            id,
            first_name,
            last_name,
            job_title,
            avatar_url,
            email
          )
        `)
        .eq('organization_id', organization.id)
        .eq('status', 'active')
        .order('joined_at', { ascending: false });

      if (error) {
        console.error('Error loading employees:', error);
        return { data: null, error };
      }

      return { data, error: null };
    } catch (error) {
      console.error('Error in getOrganizationEmployees:', error);
      return { data: null, error };
    }
  }, [organization?.id, isManagerOrAdmin]);

  // Invite employee (for admins/managers with permission)
  const inviteEmployee = useCallback(async (email, role = 'member', additionalData = {}) => {
    if (!organization?.id || !hasPermission('invite_employees')) {
      return { data: null, error: { message: 'No permission to invite employees' } };
    }

    try {
      const inviteData = {
        organization_id: organization.id,
        email: email,
        role: role,
        invited_by: user.id,
        invited_at: new Date().toISOString(),
        status: 'pending',
        ...additionalData
      };

      const { data, error } = await supabase
        .from('employee_invitations')
        .insert([inviteData])
        .select()
        .single();

      if (error) {
        console.error('Error inviting employee:', error);
        return { data: null, error };
      }

      return { data, error: null };
    } catch (error) {
      console.error('Error in inviteEmployee:', error);
      return { data: null, error };
    }
  }, [organization?.id, hasPermission, user?.id]);

  return {
    // State
    organization,
    permissions,
    role,
    loading,
    error,
    initialized,
    
    // Computed properties
    isCorporateUser: Boolean(organization),
    isAdmin: isAdmin(),
    isManagerOrAdmin: isManagerOrAdmin(),
    isMember: isMember(),
    
    // Functions
    hasPermission,
    refreshCorporateData: loadCorporateData,
    getOrganizationEmployees,
    inviteEmployee,
    
    // Permission shortcuts for easy access
    canInviteEmployees: hasPermission('invite_employees'),
    canManageEmployees: hasPermission('manage_employees'),
    canViewReports: hasPermission('view_reports'),
    canGenerateReports: hasPermission('generate_reports'),
    canManageSettings: hasPermission('manage_settings'),
    canAssignCourses: hasPermission('assign_courses'),
    canViewAllProgress: hasPermission('view_all_progress'),
  };
};