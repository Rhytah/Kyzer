import { create } from "zustand";
import { persist } from "zustand/middleware";
import { supabase } from "../lib/supabase";

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      profile: null,
      loading: false,

      // Actions
      setUser: async (user) => {
        set({ user, loading: true });

        // Fetch user profile when user is set
        if (user) {
          try {
            const { data: profile, error } = await supabase
              .from("profiles")
              .select(
                `
                *,
                organization:organizations(*)
              `,
              )
              .eq("id", user.id)
              .single();

            if (error && error.code !== "PGRST116") {
              // Ignore "not found" errors
              console.error("Error fetching profile:", error);
            } else {
              set({ profile });
            }
          } catch (error) {
            console.error("Profile fetch error:", error);
          }
        }

        set({ loading: false });
      },

      setProfile: (profile) => set({ profile }),

      clearAuth: () => set({ user: null, profile: null }),

      // Update profile data
      updateProfile: async (updates) => {
        const { user } = get();
        if (!user) return { error: "No user found" };

        set({ loading: true });

        try {
          const { data, error } = await supabase
            .from("profiles")
            .update(updates)
            .eq("id", user.id)
            .select()
            .single();

          if (error) throw error;

          set({ profile: data, loading: false });
          return { data, error: null };
        } catch (error) {
          set({ loading: false });
          return { data: null, error };
        }
      },

      // Check permissions
      hasPermission: (permission) => {
        const { profile } = get();
        if (!profile) return false;

        const permissions = {
          admin: ["org_admin", "admin"],
          org_admin: ["org_admin"],
          learner: ["learner", "org_admin", "admin"],
        };

        return permissions[permission]?.includes(profile.role) || false;
      },

      // Organization helpers
      isOrgAdmin: () => {
        const { profile } = get();
        return profile?.role === "org_admin";
      },

      isSameOrganization: (userId) => {
        const { profile } = get();
        // Implementation would check if userId belongs to same org
        return profile?.organization_id !== null;
      },
    }),
    {
      name: "kyzer-auth-storage",
      partialize: (state) => ({
        user: state.user,
        profile: state.profile,
      }),
    },
  ),
);
