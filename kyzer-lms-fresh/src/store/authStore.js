import { create } from "zustand";
import { persist } from "zustand/middleware";
import { supabase } from "../lib/supabase";

export const useAuthStore = create(
    persist(
        (set, get) => ({
            user: null,
            profile: null,
            loading: false,
            initialized: false, // Add this missing property

            // Actions
            setUser: async(user) => {
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
                } else {
                    // Clear profile when user is null
                    set({ profile: null });
                }

                set({ loading: false });
            },

            // ADD MISSING FUNCTIONS
            setLoading: (loading) => set({ loading }),

            setInitialized: (initialized) => set({ initialized }),

            setProfile: (profile) => set({ profile }),

            clearAuth: () => set({
                user: null,
                profile: null,
                loading: false,
                initialized: false
            }),

            // Update profile data
            updateProfile: async(updates) => {
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

            // Check permissions - FIXED: removed optional chaining
            hasPermission: (permission) => {
                const { profile } = get();
                if (!profile) return false;

                const permissions = {
                    admin: ["org_admin", "admin"],
                    org_admin: ["org_admin"],
                    learner: ["learner", "org_admin", "admin"],
                };

                const permissionArray = permissions[permission];
                return permissionArray ? permissionArray.includes(profile.role) : false;
            },

            // Organization helpers - FIXED: removed optional chaining
            isOrgAdmin: () => {
                const { profile } = get();
                return profile && profile.role === "org_admin";
            },

            isSameOrganization: (userId) => {
                const { profile } = get();
                // Implementation would check if userId belongs to same org
                return profile && profile.organization_id !== null;
            },

            // ADD THESE HELPER FUNCTIONS for useAuth compatibility
            isAuthenticated: () => !!get().user,

            isEmailVerified: () => {
                const { user } = get();
                return user && user.email_confirmed_at != null;
            },

            isCorporateUser: () => {
                const { profile } = get();
                return profile && profile.account_type === 'corporate';
            },

            isIndividualUser: () => {
                const { profile } = get();
                return profile && profile.account_type === 'individual';
            },

            hasRole: (role) => {
                const { profile } = get();
                return profile && profile.role === role;
            },
        }), {
            name: "kyzer-auth-storage",
            partialize: (state) => ({
                user: state.user,
                profile: state.profile,
                initialized: state.initialized, // Add this to persist
            }),
        },
    ),
);