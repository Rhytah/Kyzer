// src/hooks/corporate/useCorporate.js - Fixed to properly detect corporate accounts
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
  const [lastLoadedUserId, setLastLoadedUserId] = useState(null);

  // 🔥 NEW: Check if user is corporate based on metadata
  const isCorporateFromMetadata = useCallback(() => {
    return user?.user_metadata?.account_type === 'corporate';
  }, [user?.user_metadata?.account_type]);

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

  // 🔥 NEW: Create organization record for corporate users without one
  const ensureOrganizationExists = useCallback(async () => {
    if (!user?.id || !isCorporateFromMetadata()) {
      return null;
    }

    const companyName = user.user_metadata?.company_name;
    if (!companyName) {
      console.warn('Corporate user missing company_name in metadata');
      return null;
    }

    try {
      // First, check if organization already exists
      const { data: existingOrg, error: existingOrgError } = await supabase
        .from('organizations')
        .select('id, name, slug')
        .eq('name', companyName)
        .maybeSingle();

      if (existingOrgError) {
        console.error('Error checking existing organization:', existingOrgError);
        return null;
      }

      if (existingOrg) {
        return existingOrg;
      }

      // Create new organization
      const orgSlug = companyName.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      const orgData = {
        name: companyName,
        slug: orgSlug,
        email: user.email,
        max_employees: parseInt(user.user_metadata?.employee_count?.split('-')[1]) || 50,
        subscription_status: 'active',
        subscription_end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year from now
        created_by: user.id
      };

      const { data: newOrg, error: createOrgError } = await supabase
        .from('organizations')
        .insert([orgData])
        .select()
        .single();

      if (createOrgError) {
        console.error('Error creating organization:', createOrgError);
        return null;
      }

      return newOrg;

    } catch (error) {
      console.error('Error in ensureOrganizationExists:', error);
      return null;
    }
  }, [user, isCorporateFromMetadata]);

  // 🔥 NEW: Ensure user is member of their organization
  const ensureMembershipExists = useCallback(async (organizationId) => {
    if (!user?.id || !organizationId) {
      return null;
    }

    try {
      // Check if membership already exists
      const { data: existingMembership, error: membershipError } = await supabase
        .from('organization_members')
        .select('id, role, status')
        .eq('user_id', user.id)
        .eq('organization_id', organizationId)
        .maybeSingle();

      if (membershipError) {
        console.error('Error checking existing membership:', membershipError);
        return null;
      }

      if (existingMembership) {
        return existingMembership;
      }

      // Create new membership - determine role from metadata
      const userRole = user.user_metadata?.role || 'admin'; // Default first user to admin
      
      const membershipData = {
        user_id: user.id,
        organization_id: organizationId,
        role: userRole,
        status: 'active',
        joined_at: new Date().toISOString()
      };

      const { data: newMembership, error: createMembershipError } = await supabase
        .from('organization_members')
        .insert([membershipData])
        .select()
        .single();

      if (createMembershipError) {
        console.error('Error creating membership:', createMembershipError);
        return null;
      }

      return newMembership;

    } catch (error) {
      console.error('Error in ensureMembershipExists:', error);
      return null;
    }
  }, [user?.id]); // Only depend on user ID, not entire user object

  // Updated corporate data loading with auto-creation
  const loadCorporateData = useCallback(async () => {
    if (!user?.id) {
      setOrganization(null);
      setPermissions(getDefaultPermissions('member'));
      setRole(null);
      setError(null);
      setLoading(false);
      setInitialized(true);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // First, try to load existing membership
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
        .maybeSingle();


      if (membershipError) {
        console.error("Error loading corporate data:", membershipError);
        setError({
          type: 'CORPORATE_DATA_ERROR',
          message: `Failed to load organization data: ${membershipError.message}`,
          code: membershipError.code,
          originalError: membershipError
        });
      }

      if (membershipData && membershipData.organization) {
        // User has existing membership - use it
        setOrganization(membershipData.organization);
        setRole(membershipData.role);
        
        const defaultPermissions = getDefaultPermissions(membershipData.role);
        const customPermissions = membershipData.permissions || {};
        
        setPermissions({
          ...defaultPermissions,
          ...customPermissions
        });
        setError(null);

      } else if (isCorporateFromMetadata()) {
        // 🔥 NEW: Corporate user without organization - create it
        
        const org = await ensureOrganizationExists();
        if (org) {
          const membership = await ensureMembershipExists(org.id);
          if (membership) {
            // Load the full organization data
            const { data: fullOrgData, error: fullOrgError } = await supabase
              .from('organizations')
              .select('*')
              .eq('id', org.id)
              .single();

            if (!fullOrgError && fullOrgData) {
              setOrganization(fullOrgData);
              setRole(membership.role);
              setPermissions(getDefaultPermissions(membership.role));
              setError(null);
            } else {
              console.error('Error loading full organization data:', fullOrgError);
              setError({
                type: 'ORG_LOAD_ERROR',
                message: 'Failed to load organization after creation'
              });
            }
          } else {
            setError({
              type: 'MEMBERSHIP_CREATE_ERROR',
              message: 'Failed to create organization membership'
            });
          }
        } else {
          setError({
            type: 'ORG_CREATE_ERROR',
            message: 'Failed to create organization'
          });
        }

        // Set safe defaults if creation failed
        if (!organization) {
          setOrganization(null);
          setPermissions(getDefaultPermissions('member'));
          setRole(null);
        }

      } else {
        // Regular individual user
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
  }, [user?.id, isCorporateFromMetadata, getDefaultPermissions, ensureOrganizationExists, ensureMembershipExists]);

  // Initialize corporate data when user changes
  useEffect(() => {
    let mounted = true;
    
    // Emergency timeout to prevent infinite loading
    const emergencyTimeout = setTimeout(() => {
      if (mounted && loading && !initialized) {
        console.warn('Corporate data loading timeout - this is normal for users without organizations');
        setLoading(false);
        setInitialized(true);
        // Don't set error for timeout - it's normal for users without organizations
      }
    }, 10000); // Reduced to 10 seconds

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
          setLastLoadedUserId(null);
        } else if (user?.id) {
          // Only load if user has an ID and we haven't already loaded for this user
          const currentUserId = user.id;
          
          if (currentUserId !== lastLoadedUserId) {
            await loadCorporateData();
            setLastLoadedUserId(currentUserId);
          }
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
  }, [user?.id]); // Only depend on user ID, not the entire user object

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
    
    // 🔥 UPDATED: Now checks BOTH metadata AND organization membership
    isCorporateUser: isCorporateFromMetadata() || Boolean(organization),
    isAdmin: isAdmin(),
    isManagerOrAdmin: isManagerOrAdmin(),
    isMember: isMember(),
    
    // 🔥 NEW: Expose company info from metadata for corporate users without orgs
    companyName: user?.user_metadata?.company_name,
    employeeCount: user?.user_metadata?.employee_count,
    
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