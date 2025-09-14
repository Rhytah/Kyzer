// src/store/corporateStore.js
import { create } from "zustand";
import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";

// Email service helper function using Supabase Edge Function
const sendInvitationEmail = async (email, data) => {
  try {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase configuration missing');
    }

    // Try to get session, but don't fail if no auth
    const { data: { session } } = await supabase.auth.getSession();
    const authHeader = session ? `Bearer ${session.access_token}` : supabaseKey;

    const response = await fetch(`${supabaseUrl}/functions/v1/send-invitation-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
        'apikey': supabaseKey
      },
      body: JSON.stringify({ email, data })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(errorData.error || `HTTP ${response.status}: Failed to send invitation email`);
    }

    const result = await response.json();
    
    // Show user-friendly message based on result
    if (result.fallback || result.message?.includes('manual sending')) {
      console.log('📧 Email invitation details logged for manual sending:', {
        to: email,
        subject: `Invitation to Join ${data.companyName}`,
        invitationLink: data.invitationLink,
        companyName: data.companyName,
        inviterName: data.inviterName,
        role: data.role
      });
    }
    
    return result;
  } catch (error) {
    // Check if it's a network/fetch error (Edge Function not deployed)
    if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
      console.warn('Edge Function not deployed yet. Using fallback method.');
      
      // Log invitation details for manual sending
      console.log('📧 EMAIL INVITATION (Manual Send Required):');
      console.log('==========================================');
      console.log(`To: ${email}`);
      console.log(`Subject: Invitation to Join ${data.companyName}`);
      console.log(`Invitation Link: ${data.invitationLink}`);
      console.log(`Company: ${data.companyName}`);
      console.log(`Inviter: ${data.inviterName}`);
      console.log(`Role: ${data.role}`);
      if (data.customMessage) {
        console.log(`Custom Message: ${data.customMessage}`);
      }
      console.log('==========================================');
      
      // Return success with fallback info instead of throwing
      return {
        success: true,
        message: 'Invitation created - email details logged for manual sending',
        fallback: true,
        emailData: {
          to: email,
          subject: `Invitation to Join ${data.companyName}`,
          companyName: data.companyName,
          inviterName: data.inviterName,
          role: data.role,
          customMessage: data.customMessage,
          invitationLink: data.invitationLink
        }
      };
    }
    
    console.error('Error sending invitation email:', error);
    throw error;
  }
};

export const useCorporateStore = create((set, get) => ({
  // State
  currentCompany: null,
  employees: [],
  courseAssignments: [],
  companyStats: null,
  permissions: null,
  loading: false,
  error: null,
  invitations: [],
  departments: [],

  // Actions
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),

  // Sync cached members data
  syncCachedMembers: async () => {
    try {
      const { currentCompany } = get();
      if (!currentCompany) return;

      set({ loading: true });

      // Call the RPC function to refresh cached members
      const { data, error } = await supabase.rpc('refresh_organization_members_cache', {
        org_id: currentCompany.id
      });

      if (error) throw error;

      // Refresh the employees data
      await get().fetchEmployees();
      await get().fetchCompanyStats();

      set({ loading: false });
      return data;
    } catch (error) {
      console.error("Error syncing cached members:", error);
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // Fetch current user's company
  fetchCurrentCompany: async () => {
    try {
      set({ loading: true, error: null });

      // Add timeout for auth check
      const authPromise = supabase.auth.getUser();
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Auth check timeout')), 5000)
      );
      
      const { data: { user } } = await Promise.race([authPromise, timeoutPromise]);
      if (!user) throw new Error("User not authenticated");

      // First check if user is directly associated with an organization
      const orgQuery = supabase
        .from("organization_members")
        .select(
          `
          organization_id,
          role,
          permissions,
          organizations!inner (
            id,
            name,
            domain,
            max_employees,
            subscription_status,
            subscription_end_date,
            created_at,
            updated_at,
            slug,
            email,
            created_by
          )
        `
        )
        .eq("user_id", user.id)
        .eq("status", "active")
        .single();
      
      const orgTimeout = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Organization query timeout')), 10000)
      );
      
      const { data: userOrganization, error: userError } = await Promise.race([orgQuery, orgTimeout]);

      if (userError && userError.code !== "PGRST116") {
        throw userError;
      }

      if (userOrganization) {
        set({
          currentCompany: userOrganization.organizations,
          permissions: userOrganization.permissions || {},
          loading: false,
        });
        return userOrganization.organizations;
      }

      // If no direct organization association, user doesn't have an organization
      set({ currentCompany: null, permissions: null, loading: false });
      return null;
    } catch (error) {
      console.error("Error fetching current company:", error);
      set({ error: error.message, loading: false });
      return null;
    }
  },

  // Fetch company statistics using cached data
  fetchCompanyStats: async () => {
    try {
      const { currentCompany } = get();
      if (!currentCompany) return null;

      set({ loading: true });

      // Get organization with cached members data
      const { data: orgData, error: orgError } = await supabase
        .from("organizations")
        .select("members, member_count")
        .eq("id", currentCompany.id)
        .single();

      if (orgError) throw orgError;

      const members = orgData.members || [];
      const totalEmployees = orgData.member_count || members.length;

      // Get course completion stats
      const { data: completionStats } = await supabase
        .from("course_enrollments")
        .select("status")
        .eq("organization_id", currentCompany.id);

      const coursesCompleted =
        completionStats?.filter((c) => c.status === "completed").length || 0;
      const coursesInProgress =
        completionStats?.filter((c) => c.status === "in_progress").length || 0;

      // Calculate utilization rate (employees with at least one course)
      const { data: activeUsers } = await supabase
        .from("course_enrollments")
        .select("user_id")
        .eq("organization_id", currentCompany.id);

      const uniqueActiveUsers = new Set(activeUsers?.map((u) => u.user_id))
        .size;
      const utilizationRate =
        totalEmployees > 0
          ? Math.round((uniqueActiveUsers / totalEmployees) * 100)
          : 0;

      // Calculate role-based stats from cached data
      const roleStats = members.reduce((acc, member) => {
        const role = member.role || 'learner';
        acc[role] = (acc[role] || 0) + 1;
        return acc;
      }, {});

      const stats = {
        totalEmployees: totalEmployees || 0,
        employeeLimit: 200, // Default limit
        coursesCompleted,
        coursesInProgress,
        utilizationRate,
        roleStats,
        adminCount: roleStats.corporate_admin || 0,
        managerCount: roleStats.manager || 0,
        learnerCount: roleStats.learner || 0,
      };

      set({ companyStats: stats, loading: false });
      return stats;
    } catch (error) {
      console.error("Error fetching company stats:", error);
      set({ error: error.message, loading: false });
      return null;
    }
  },

  // Fetch company employees using cached data
  fetchEmployees: async () => {
    try {
      const { currentCompany } = get();
      if (!currentCompany) return [];

      set({ loading: true });

      // Get organization with cached members data
      const { data: orgData, error: orgError } = await supabase
        .from("organizations")
        .select("members, member_count, updated_at")
        .eq("id", currentCompany.id)
        .single();

      if (orgError) throw orgError;

      const members = orgData.members || [];
      
      // Transform cached data to match expected format
      const employees = members.map(member => ({
        id: member.id,
        user_id: member.profile_id,
        role: member.role,
        status: member.status,
        invited_at: member.invited_at,
        joined_at: member.joined_at,
        department_id: member.department_id,
        // Additional cached data
        email: member.email,
        first_name: member.first_name,
        last_name: member.last_name,
        full_name: member.full_name,
        avatar_url: member.avatar_url,
        department_name: member.department_name,
        job_title: member.job_title,
        permissions: member.permissions
      }));

      set({ employees, loading: false });
      return employees;
    } catch (error) {
      console.error("Error fetching employees:", error);
      set({ error: error.message, loading: false });
      return [];
    }
  },

  // Fetch course assignments
  fetchCourseAssignments: async () => {
    try {
      const { currentCompany } = get();
      if (!currentCompany) return [];

      set({ loading: true });

      const { data: assignments, error } = await supabase
        .from("course_assignments")
        .select(
          `
          id,
          course_id,
          assigned_by,
          assigned_at,
          due_date,
          status,
          courses!inner (
            id,
            title,
            description,
            duration_hours
          )
        `
        )
        .eq("organization_id", currentCompany.id)
        .order("assigned_at", { ascending: false });

      if (error) throw error;

      set({ courseAssignments: assignments || [], loading: false });
      return assignments || [];
    } catch (error) {
      console.error("Error fetching course assignments:", error);
      set({ error: error.message, loading: false });
      return [];
    }
  },

  // Fetch user permissions for current company
  fetchPermissions: async () => {
    try {
      const { currentCompany } = get();
      if (!currentCompany) return null;

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { data: memberData, error } = await supabase
        .from("organization_members")
        .select("role, permissions")
        .eq("organization_id", currentCompany.id)
        .eq("user_id", user.id)
        .single();

      if (error) throw error;

      // Define role-based permissions
      const rolePermissions = {
        owner: {
          canViewEmployees: true,
          canManageEmployees: true,
          canViewReports: true,
          canManageCompany: true,
          canAssignCourses: true,
          canCreateCourses: true,
          canManageCourses: true,
        },
        admin: {
          canViewEmployees: true,
          canManageEmployees: true,
          canViewReports: true,
          canManageCompany: false,
          canAssignCourses: true,
          canCreateCourses: false,
          canManageCourses: true,
        },
        manager: {
          canViewEmployees: true,
          canManageEmployees: false,
          canViewReports: true,
          canManageCompany: false,
          canAssignCourses: true,
          canCreateCourses: false,
          canManageCourses: false,
        },
        employee: {
          canViewEmployees: false,
          canManageEmployees: false,
          canViewReports: false,
          canManageCompany: false,
          canAssignCourses: false,
          canCreateCourses: false,
          canManageCourses: false,
        },
      };

      // Merge role permissions with custom permissions
      const permissions = {
        ...(rolePermissions[memberData.role] || rolePermissions.employee),
        ...(memberData.permissions || {}),
      };

      set({ permissions });
      return permissions;
    } catch (error) {
      console.error("Error fetching permissions:", error);
      set({ error: error.message });
      return null;
    }
  },

  // Create a new company
  createCompany: async (companyData) => {
    try {
      set({ loading: true, error: null });

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      // Create organization
      const { data: organization, error: organizationError } = await supabase
        .from("organizations")
        .insert({
          name: companyData.name,
          domain: companyData.domain,
          max_employees: companyData.max_employees || 50,
          subscription_status: "trial",
          subscription_end_date: new Date(
            Date.now() + 30 * 24 * 60 * 60 * 1000
          ).toISOString(), // 30 days trial
          slug: companyData.name.toLowerCase().replace(/\s+/g, '-'),
          email: companyData.email || '',
          created_by: user.id,
        })
        .select()
        .single();

      if (organizationError) throw organizationError;

      // Add user as organization owner
      const { error: memberError } = await supabase
        .from("organization_members")
        .insert({
          organization_id: organization.id,
          user_id: user.id,
          role: "corporate_admin",
          status: "active",
          joined_at: new Date().toISOString(),
        });

      if (memberError) throw memberError;

      set({ currentCompany: organization, loading: false });
      toast.success("Organization created successfully!");

      return organization;
    } catch (error) {
      console.error("Error creating company:", error);
      set({ error: error.message, loading: false });
      toast.error("Failed to create company: " + error.message);
      throw error;
    }
  },

  // Invite employee to company
  inviteEmployee: async (email, role = "learner", departmentId = null, customMessage = null) => {
    try {
      set({ loading: true, error: null });

      // Ensure we have a current company
      let { currentCompany } = get();
      if (!currentCompany) {
        await get().fetchCurrentCompany();
        currentCompany = get().currentCompany;
        if (!currentCompany) {
          throw new Error("No current company. Please ensure you're associated with a company.");
        }
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      // Check if user already exists
      const { data: existingUser } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", email)
        .single();

      // Check if user is already a member
      if (existingUser) {
        const { data: existingMember } = await supabase
          .from("organization_members")
          .select("id, status")
          .eq("organization_id", currentCompany.id)
          .eq("user_id", existingUser.id)
          .single();

        if (existingMember) {
          if (existingMember.status === "active") {
            throw new Error("User is already a member of this company");
          } else if (existingMember.status === "pending") {
            throw new Error("User already has a pending invitation");
          }
        }
      }

      // Create invitation
      const { data: invitation, error } = await supabase
        .from("organization_invitations")
        .insert({
          organization_id: currentCompany.id,
          email,
          role,
          department_id: departmentId,
          invited_by: user.id,
          custom_message: customMessage,
          expires_at: new Date(
            Date.now() + 7 * 24 * 60 * 60 * 1000
          ).toISOString(), // 7 days
          status: "pending"
        })
        .select()
        .single();

      if (error) throw error;

      // Send invitation email
      const emailResult = await sendInvitationEmail(email, {
        companyName: currentCompany.name,
        inviterName: user.user_metadata?.full_name || user.email,
        role,
        customMessage,
        invitationLink: `${import.meta.env.VITE_APP_URL || window.location.origin}/auth/accept-invitation?token=${invitation.id}`
      });

      set({ loading: false });
      
      if (emailResult.fallback) {
        toast.success(`Invitation created for ${email}! Check console for email details to send manually.`);
      } else {
        toast.success(`Invitation sent to ${email}`);
      }

      return invitation;
    } catch (error) {
      console.error("Error inviting employee:", error);
      set({ error: error.message, loading: false });
      toast.error("Failed to send invitation: " + error.message);
      throw error;
    }
  },

  // Bulk invite employees
  bulkInviteEmployees: async (invitations) => {
    try {
      const { currentCompany } = get();
      if (!currentCompany) throw new Error("No current company");

      set({ loading: true, error: null });

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const invitationData = invitations.map(invitation => ({
        organization_id: currentCompany.id,
        email: invitation.email,
        role: invitation.role || "employee",
        department_id: invitation.departmentId || null,
        invited_by: user.id,
        custom_message: invitation.customMessage || null,
        expires_at: new Date(
          Date.now() + 7 * 24 * 60 * 60 * 1000
        ).toISOString(),
        status: "pending"
      }));

      const { data: createdInvitations, error } = await supabase
        .from("organization_invitations")
        .insert(invitationData)
        .select();

      if (error) throw error;

      // Send bulk invitation emails
      let emailFallbackCount = 0;
      for (const invitation of createdInvitations) {
        const emailResult = await sendInvitationEmail(invitation.email, {
          companyName: currentCompany.name,
          inviterName: user.user_metadata?.full_name || user.email,
          role: invitation.role,
          customMessage: invitation.custom_message,
          invitationLink: `${import.meta.env.VITE_APP_URL || window.location.origin}/auth/accept-invitation?token=${invitation.id}`
        });
        
        if (emailResult.fallback) {
          emailFallbackCount++;
        }
      }

      set({ loading: false });
      
      if (emailFallbackCount > 0) {
        toast.success(`${createdInvitations.length} invitations created! ${emailFallbackCount} emails need manual sending (check console).`);
      } else {
        toast.success(`${createdInvitations.length} invitations sent successfully`);
      }

      return createdInvitations;
    } catch (error) {
      console.error("Error bulk inviting employees:", error);
      set({ error: error.message, loading: false });
      toast.error("Failed to send invitations: " + error.message);
      throw error;
    }
  },

  // Fetch pending invitations
  fetchInvitations: async () => {
    try {
      const { currentCompany } = get();
      if (!currentCompany) return [];

      console.log("Fetching invitations for organization:", currentCompany.id);
      
      const { data: invitations, error } = await supabase
        .from("organization_invitations")
        .select(`
          id,
          email,
          role,
          status,
          invited_at,
          expires_at,
          used_at,
          custom_message,
          departments (
            id,
            name
          ),
          invited_by
        `)
        .eq("organization_id", currentCompany.id)
        .order("invited_at", { ascending: false });
        
      console.log("Database query result:", { invitations: invitations?.length || 0, error });
      
      if (invitations && invitations.length > 0) {
        console.log("Current invitations in DB:", invitations.map(inv => ({ id: inv.id, email: inv.email })));
      }

      if (error) throw error;

      console.log("Fetched invitations:", invitations?.length || 0, "invitations");
      if (invitations && invitations.length > 0) {
        console.log("Sample invitation:", invitations[0]);
      }
      
      // Update state with new invitations
      set({ invitations: invitations || [] });
      console.log("State updated with invitations:", invitations?.length || 0);
      
      return invitations || [];
    } catch (error) {
      console.error("Error fetching invitations:", error);
      set({ error: error.message });
      return [];
    }
  },

  // Resend invitation
  resendInvitation: async (invitationId) => {
    try {
      const { currentCompany } = get();
      if (!currentCompany) throw new Error("No current company");

      set({ loading: true, error: null });

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      // Get invitation details
      const { data: invitation, error: fetchError } = await supabase
        .from("organization_invitations")
        .select("*")
        .eq("id", invitationId)
        .single();

      if (fetchError) throw fetchError;

      // Update expiration date
      const { error: updateError } = await supabase
        .from("organization_invitations")
        .update({
          expires_at: new Date(
            Date.now() + 7 * 24 * 60 * 60 * 1000
          ).toISOString(),
          status: "pending"
        })
        .eq("id", invitationId);

      if (updateError) throw updateError;

      // Resend email
      await sendInvitationEmail(invitation.email, {
        companyName: currentCompany.name,
        inviterName: user.user_metadata?.full_name || user.email,
        role: invitation.role,
        customMessage: invitation.custom_message,
        invitationLink: `${import.meta.env.VITE_APP_URL || window.location.origin}/auth/accept-invitation?token=${invitationId}`
      });

      set({ loading: false });
      toast.success("Invitation resent successfully");

      return true;
    } catch (error) {
      console.error("Error resending invitation:", error);
      set({ error: error.message, loading: false });
      toast.error("Failed to resend invitation: " + error.message);
      throw error;
    }
  },

  // Delete invitation
  deleteInvitation: async (invitationId) => {
    try {
      const { currentCompany } = get();
      if (!currentCompany) throw new Error("No current company");

      set({ loading: true, error: null });

      // First verify the invitation exists and belongs to current organization
      const { data: existingInvitation, error: checkError } = await supabase
        .from("organization_invitations")
        .select("id, email, organization_id")
        .eq("id", invitationId)
        .eq("organization_id", currentCompany.id)
        .single();

      if (checkError) {
        throw new Error("Invitation not found or access denied");
      }

      // Attempt to delete the invitation (simplified for no-auth environment)
      const { data: deleteResult, error: deleteError } = await supabase
        .from("organization_invitations")
        .delete()
        .eq("id", invitationId)
        .select();

      if (deleteError) {
        // If RLS is blocking, try without organization filter
        if (deleteError.message.includes('policy') || deleteError.message.includes('permission')) {
          const { data: retryResult, error: retryError } = await supabase
            .from("organization_invitations")
            .delete()
            .eq("id", invitationId)
            .select();
            
          if (retryError) {
            throw new Error(`Delete failed: ${retryError.message}`);
          }
          
          // Verify deletion was successful
          if (!retryResult || retryResult.length === 0) {
            const { data: stillExists } = await supabase
              .from("organization_invitations")
              .select("id")
              .eq("id", invitationId)
              .single();
              
            if (stillExists) {
              throw new Error("Delete operation failed. The invitation may not exist or you may not have permission to delete it.");
            }
          }
        } else {
          throw new Error(`Delete failed: ${deleteError.message}`);
        }
      } else {
        // Verify deletion was successful
        if (!deleteResult || deleteResult.length === 0) {
          const { data: stillExists } = await supabase
            .from("organization_invitations")
            .select("id")
            .eq("id", invitationId)
            .single();
            
          if (stillExists) {
            throw new Error("Delete operation failed. The invitation may not exist or you may not have permission to delete it.");
          }
        }
      }

      // Refresh the invitations list
      await get().fetchInvitations();

      set({ loading: false });
      toast.success("Invitation deleted successfully");
      return true;

    } catch (error) {
      set({ error: error.message, loading: false });
      toast.error(`Failed to delete invitation: ${error.message}`);
      throw error;
    }
  },

  // Update employee role
  updateEmployeeRole: async (employeeId, newRole) => {
    try {
      const { currentCompany } = get();
      if (!currentCompany) throw new Error("No current company");

      set({ loading: true, error: null });

      const { error } = await supabase
        .from("organization_members")
        .update({ 
          role: newRole,
          updated_at: new Date().toISOString()
        })
        .eq("id", employeeId)
        .eq("organization_id", currentCompany.id);

      if (error) throw error;

      // Sync cached data (triggers will handle this, but we'll refresh to be sure)
      await get().syncCachedMembers();

      set({ loading: false });
      toast.success("Employee role updated successfully");

      return true;
    } catch (error) {
      console.error("Error updating employee role:", error);
      set({ error: error.message, loading: false });
      toast.error("Failed to update employee role: " + error.message);
      throw error;
    }
  },

  // Remove employee from company
  removeEmployee: async (employeeId) => {
    try {
      const { currentCompany } = get();
      if (!currentCompany) throw new Error("No current company");

      set({ loading: true, error: null });

      const { error } = await supabase
        .from("organization_members")
        .update({ 
          status: "inactive",
          removed_at: new Date().toISOString()
        })
        .eq("id", employeeId)
        .eq("organization_id", currentCompany.id);

      if (error) throw error;

      // Sync cached data (triggers will handle this, but we'll refresh to be sure)
      await get().syncCachedMembers();

      set({ loading: false });
      toast.success("Employee removed successfully");

      return true;
    } catch (error) {
      console.error("Error removing employee:", error);
      set({ error: error.message, loading: false });
      toast.error("Failed to remove employee: " + error.message);
      throw error;
    }
  },

  // Department Management
  fetchDepartments: async () => {
    try {
      const { currentCompany } = get();
      if (!currentCompany) return [];

      const { data: departments, error } = await supabase
        .from("departments")
        .select(`
          id,
          name,
          description,
          manager_id,
          created_at,
          updated_at
        `)
        .eq("organization_id", currentCompany.id)
        .order("name", { ascending: true });

      if (error) throw error;

      set({ departments: departments || [] });
      return departments || [];
    } catch (error) {
      console.error("Error fetching departments:", error);
      set({ error: error.message });
      return [];
    }
  },

  createDepartment: async (departmentData) => {
    try {
      const { currentCompany } = get();
      if (!currentCompany) throw new Error("No current company");

      set({ loading: true, error: null });

      const { data: department, error } = await supabase
        .from("departments")
        .insert({
          ...departmentData,
          organization_id: currentCompany.id
        })
        .select()
        .single();

      if (error) throw error;

      // Refresh departments list
      await get().fetchDepartments();

      set({ loading: false });
      toast.success("Department created successfully");

      return department;
    } catch (error) {
      console.error("Error creating department:", error);
      set({ error: error.message, loading: false });
      toast.error("Failed to create department: " + error.message);
      throw error;
    }
  },

  updateDepartment: async (departmentId, updates) => {
    try {
      const { currentCompany } = get();
      if (!currentCompany) throw new Error("No current company");

      set({ loading: true, error: null });

      const { error } = await supabase
        .from("departments")
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq("id", departmentId)
        .eq("organization_id", currentCompany.id);

      if (error) throw error;

      // Refresh departments list
      await get().fetchDepartments();

      set({ loading: false });
      toast.success("Department updated successfully");

      return true;
    } catch (error) {
      console.error("Error updating department:", error);
      set({ error: error.message, loading: false });
      toast.error("Failed to update department: " + error.message);
      throw error;
    }
  },

  deleteDepartment: async (departmentId) => {
    try {
      const { currentCompany } = get();
      if (!currentCompany) throw new Error("No current company");

      set({ loading: true, error: null });

      // Check if department has employees
      const { data: employees } = await supabase
        .from("organization_members")
        .select("id")
        .eq("department_id", departmentId)
        .eq("status", "active");

      if (employees && employees.length > 0) {
        throw new Error("Cannot delete department with active employees. Please reassign employees first.");
      }

      const { error } = await supabase
        .from("departments")
        .delete()
        .eq("id", departmentId)
        .eq("organization_id", currentCompany.id);

      if (error) throw error;

      // Refresh departments list
      await get().fetchDepartments();

      set({ loading: false });
      toast.success("Department deleted successfully");

      return true;
    } catch (error) {
      console.error("Error deleting department:", error);
      set({ error: error.message, loading: false });
      toast.error("Failed to delete department: " + error.message);
      throw error;
    }
  },

  // Bulk operations
  bulkUpdateEmployeeRoles: async (updates) => {
    try {
      const { currentCompany } = get();
      if (!currentCompany) throw new Error("No current company");

      set({ loading: true, error: null });

      const updatePromises = updates.map(update =>
        supabase
          .from("organization_members")
          .update({ 
            role: update.role,
            updated_at: new Date().toISOString()
          })
          .eq("id", update.employeeId)
          .eq("organization_id", currentCompany.id)
      );

      const results = await Promise.all(updatePromises);
      
      // Check for errors
      const errors = results.filter(result => result.error);
      if (errors.length > 0) {
        throw new Error(`Failed to update ${errors.length} employees`);
      }

      // Sync cached data
      await get().syncCachedMembers();

      set({ loading: false });
      toast.success(`${updates.length} employee roles updated successfully`);

      return true;
    } catch (error) {
      console.error("Error bulk updating employee roles:", error);
      set({ error: error.message, loading: false });
      toast.error("Failed to update employee roles: " + error.message);
      throw error;
    }
  },

  // Helper functions for cached data
  searchEmployees: (searchTerm, filters = {}) => {
    const { employees } = get();
    
    return employees.filter(employee => {
      const matchesSearch = !searchTerm || 
        employee.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.job_title?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesRole = !filters.role || employee.role === filters.role;
      const matchesDepartment = !filters.department_id || employee.department_id === filters.department_id;
      const matchesStatus = !filters.status || employee.status === filters.status;

      return matchesSearch && matchesRole && matchesDepartment && matchesStatus;
    });
  },

  getEmployeesByRole: () => {
    const { employees } = get();
    
    return employees.reduce((acc, employee) => {
      const role = employee.role || 'learner';
      if (!acc[role]) acc[role] = [];
      acc[role].push(employee);
      return acc;
    }, {});
  },

  getEmployeeStats: () => {
    const { employees } = get();
    
    const roleStats = employees.reduce((acc, employee) => {
      const role = employee.role || 'learner';
      acc[role] = (acc[role] || 0) + 1;
      return acc;
    }, {});

    return {
      total: employees.length,
      byRole: roleStats,
      activeCount: employees.filter(e => e.status === 'active').length,
      adminCount: roleStats.corporate_admin || 0,
      managerCount: roleStats.manager || 0,
      learnerCount: roleStats.learner || 0
    };
  },

  // Clear all corporate data (for logout)
  clearCorporateData: () => {
    set({
      currentCompany: null,
      employees: [],
      courseAssignments: [],
      companyStats: null,
      permissions: null,
      loading: false,
      error: null,
      invitations: [],
      departments: [],
    });
  },
}));

// Custom hooks for easier component usage
// export const useCurrentCompany = () => {
//   const currentCompany = useCorporateStore((state) => state.currentCompany);
//   const fetchCurrentCompany = useCorporateStore(
//     (state) => state.fetchCurrentCompany
//   );

//   return currentCompany;
// };

// export const useCompanyStats = () => {
//   return useCorporateStore((state) => state.companyStats);
// };

// export const useCorporatePermissions = () => {
//   const permissions = useCorporateStore((state) => state.permissions);
//   const fetchPermissions = useCorporateStore((state) => state.fetchPermissions);

//   return { permissions: permissions || {}, fetchPermissions };
// };

// // Selector helpers
// export const useEmployees = () => useCorporateStore((state) => state.employees);
// export const useDepartments = () =>
//   useCorporateStore((state) => state.departments);
// export const useCorporateLoading = () =>
//   useCorporateStore((state) => state.loading);
// export const useCorporateError = () =>
//   useCorporateStore((state) => state.error);
// export default {
//   useCorporateStore,
//   useCurrentCompany,
//   useCompanyStats,
//   useCorporatePermissions,
//   useEmployees,
//   useDepartments,
//   useCorporateLoading,
//   useCorporateError,
// };

// At the end of corporateStore.js, replace the current exports with:

// Main store hook
// export const useCorporateStore = () => useCorporateStore;

// Selector hooks
export const useCurrentCompany = () =>
  useCorporateStore((state) => state.currentCompany);

export const useCompanyStats = () =>
  useCorporateStore((state) => state.companyStats);

export const useCorporatePermissions = () => ({
  permissions: useCorporateStore((state) => state.permissions),
  fetchPermissions: useCorporateStore((state) => state.fetchPermissions),
});

export const useEmployees = () => useCorporateStore((state) => state.employees);

export const useDepartments = () =>
  useCorporateStore((state) => state.departments);

export const useInvitations = () =>
  useCorporateStore((state) => state.invitations);

export const useCorporateLoading = () =>
  useCorporateStore((state) => state.loading);

export const useCorporateError = () =>
  useCorporateStore((state) => state.error);

// New cached data functions
export const useSyncCachedMembers = () =>
  useCorporateStore((state) => state.syncCachedMembers);

export const useSearchEmployees = () =>
  useCorporateStore((state) => state.searchEmployees);

export const useGetEmployeesByRole = () =>
  useCorporateStore((state) => state.getEmployeesByRole);

export const useGetEmployeeStats = () =>
  useCorporateStore((state) => state.getEmployeeStats);

// Default export
export default useCorporateStore;
