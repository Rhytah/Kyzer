// src/store/corporateStore.js
import { create } from "zustand";
import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";

export const useCorporateStore = create((set, get) => ({
  // State
  currentCompany: null,
  employees: [],
  courseAssignments: [],
  companyStats: null,
  permissions: null,
  loading: false,
  error: null,

  // Actions
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),

  // Fetch current user's company
  fetchCurrentCompany: async () => {
    try {
      set({ loading: true, error: null });

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      // First check if user is directly associated with a company
      const { data: userCompany, error: userError } = await supabase
        .from("company_members")
        .select(
          `
          company_id,
          role,
          permissions,
          companies!inner (
            id,
            name,
            domain,
            industry,
            size_category,
            subscription_status,
            subscription_expires_at,
            logo_url,
            created_at
          )
        `
        )
        .eq("user_id", user.id)
        .eq("status", "active")
        .single();

      if (userError && userError.code !== "PGRST116") {
        throw userError;
      }

      if (userCompany) {
        set({
          currentCompany: userCompany.companies,
          permissions: userCompany.permissions || {},
          loading: false,
        });
        return userCompany.companies;
      }

      // If no direct company association, user doesn't have a company
      set({ currentCompany: null, permissions: null, loading: false });
      return null;
    } catch (error) {
      console.error("Error fetching current company:", error);
      set({ error: error.message, loading: false });
      return null;
    }
  },

  // Fetch company statistics
  fetchCompanyStats: async () => {
    try {
      const { currentCompany } = get();
      if (!currentCompany) return null;

      set({ loading: true });

      // Get employee count
      const { count: totalEmployees } = await supabase
        .from("company_members")
        .select("*", { count: "exact", head: true })
        .eq("company_id", currentCompany.id)
        .eq("status", "active");

      // Get course completion stats
      const { data: completionStats } = await supabase
        .from("course_enrollments")
        .select("status")
        .eq("company_id", currentCompany.id);

      const coursesCompleted =
        completionStats?.filter((c) => c.status === "completed").length || 0;
      const coursesInProgress =
        completionStats?.filter((c) => c.status === "in_progress").length || 0;

      // Calculate utilization rate (employees with at least one course)
      const { data: activeUsers } = await supabase
        .from("course_enrollments")
        .select("user_id")
        .eq("company_id", currentCompany.id);

      const uniqueActiveUsers = new Set(activeUsers?.map((u) => u.user_id))
        .size;
      const utilizationRate =
        totalEmployees > 0
          ? Math.round((uniqueActiveUsers / totalEmployees) * 100)
          : 0;

      const stats = {
        totalEmployees: totalEmployees || 0,
        employeeLimit: 200, // Default limit
        coursesCompleted,
        coursesInProgress,
        utilizationRate,
      };

      set({ companyStats: stats, loading: false });
      return stats;
    } catch (error) {
      console.error("Error fetching company stats:", error);
      set({ error: error.message, loading: false });
      return null;
    }
  },

  // Fetch company employees
  fetchEmployees: async () => {
    try {
      const { currentCompany } = get();
      if (!currentCompany) return [];

      set({ loading: true });

      const { data: employees, error } = await supabase
        .from("company_members")
        .select(
          `
          id,
          user_id,
          role,
          status,
          invited_at,
          joined_at,
          profiles!inner (
            id,
            email,
            full_name,
            avatar_url
          )
        `
        )
        .eq("company_id", currentCompany.id)
        .order("joined_at", { ascending: false });

      if (error) throw error;

      set({ employees: employees || [], loading: false });
      return employees || [];
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
        .eq("company_id", currentCompany.id)
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
        .from("company_members")
        .select("role, permissions")
        .eq("company_id", currentCompany.id)
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
        },
        admin: {
          canViewEmployees: true,
          canManageEmployees: true,
          canViewReports: true,
          canManageCompany: false,
          canAssignCourses: true,
          canCreateCourses: false,
        },
        manager: {
          canViewEmployees: true,
          canManageEmployees: false,
          canViewReports: true,
          canManageCompany: false,
          canAssignCourses: true,
          canCreateCourses: false,
        },
        employee: {
          canViewEmployees: false,
          canManageEmployees: false,
          canViewReports: false,
          canManageCompany: false,
          canAssignCourses: false,
          canCreateCourses: false,
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

      // Create company
      const { data: company, error: companyError } = await supabase
        .from("companies")
        .insert({
          ...companyData,
          owner_id: user.id,
          subscription_status: "trial",
          subscription_expires_at: new Date(
            Date.now() + 30 * 24 * 60 * 60 * 1000
          ).toISOString(), // 30 days trial
        })
        .select()
        .single();

      if (companyError) throw companyError;

      // Add user as company owner
      const { error: memberError } = await supabase
        .from("company_members")
        .insert({
          company_id: company.id,
          user_id: user.id,
          role: "owner",
          status: "active",
          joined_at: new Date().toISOString(),
        });

      if (memberError) throw memberError;

      set({ currentCompany: company, loading: false });
      toast.success("Company created successfully!");

      return company;
    } catch (error) {
      console.error("Error creating company:", error);
      set({ error: error.message, loading: false });
      toast.error("Failed to create company: " + error.message);
      throw error;
    }
  },

  // Invite employee to company
  inviteEmployee: async (email, role = "employee") => {
    try {
      const { currentCompany } = get();
      if (!currentCompany) throw new Error("No current company");

      set({ loading: true, error: null });

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      // Create invitation
      const { data: invitation, error } = await supabase
        .from("company_invitations")
        .insert({
          company_id: currentCompany.id,
          email,
          role,
          invited_by: user.id,
          expires_at: new Date(
            Date.now() + 7 * 24 * 60 * 60 * 1000
          ).toISOString(), // 7 days
        })
        .select()
        .single();

      if (error) throw error;

      set({ loading: false });
      toast.success(`Invitation sent to ${email}`);

      return invitation;
    } catch (error) {
      console.error("Error inviting employee:", error);
      set({ error: error.message, loading: false });
      toast.error("Failed to send invitation: " + error.message);
      throw error;
    }
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

export const useCorporateLoading = () =>
  useCorporateStore((state) => state.loading);

export const useCorporateError = () =>
  useCorporateStore((state) => state.error);

// Default export
export default useCorporateStore;
