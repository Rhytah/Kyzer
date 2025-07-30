// src/hooks/corporate/useCorporate.js
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/auth/useAuth";
import { supabase } from "@/lib/supabase";

export const useCorporate = () => {
  const { user } = useAuth();
  const [organization, setOrganization] = useState(null);
  const [permissions, setPermissions] = useState({});
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setOrganization(null);
      setPermissions({});
      setRole(null);
      setLoading(false);
      return;
    }

    loadCorporateData();
  }, [user]);

  const loadCorporateData = async () => {
    try {
      setLoading(true);
      
      // Load organization membership data
      const { data: membershipData, error } = await supabase
        .from('organization_members')
        .select(`
          role,
          permissions,
          organization:organizations(*)
        `)
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error("Error loading corporate data:", error);
        return;
      }

      if (membershipData) {
        setOrganization(membershipData.organization);
        setRole(membershipData.role);
        
        // Set default permissions based on role
        const defaultPermissions = getDefaultPermissions(membershipData.role);
        const customPermissions = membershipData.permissions || {};
        
        setPermissions({
          ...defaultPermissions,
          ...customPermissions
        });
      } else {
        // User is not part of any organization
        setOrganization(null);
        setPermissions({});
        setRole(null);
      }
    } catch (error) {
      console.error("Error in loadCorporateData:", error);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get default permissions based on role
  const getDefaultPermissions = (userRole) => {
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
        view_all_progress: true
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
        view_all_progress: true
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
        view_all_progress: false
      }
    };

    return rolePermissions[userRole] || rolePermissions['member'];
  };

  // Helper function to check if user has a specific permission
  const hasPermission = (permission) => {
    return permissions[permission] || false;
  };

  // Helper function to check if user is admin
  const isAdmin = () => {
    return role === 'admin';
  };

  // Helper function to check if user is manager or admin
  const isManagerOrAdmin = () => {
    return role === 'admin' || role === 'manager';
  };

  return {
    organization,
    permissions,
    role,
    loading,
    hasPermission,
    isAdmin,
    isManagerOrAdmin,
    isCorporateUser: !!organization,
    refreshCorporateData: loadCorporateData
  };
};