// // src/hooks/auth/useAuth.jsx - Clean authentication hook
// import { useState, useEffect, createContext, useContext } from "react";
// import { supabase } from "@/lib/supabase";

// const AuthContext = createContext();

// export function AuthProvider({ children }) {
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [session, setSession] = useState(null);

//   useEffect(() => {
//     let mounted = true;

//     // Get initial session
//     const getInitialSession = async () => {
//       try {
//         const { data: { session }, error } = await supabase.auth.getSession();
        
//         if (mounted) {
//           if (error) {
//             console.error("Session error:", error);
//           }
          
//           setSession(session);
//           setUser(session?.user || null);
//           setLoading(false);
//         }
//       } catch (error) {
//         console.error("Auth initialization error:", error);
//         if (mounted) {
//           setLoading(false);
//         }
//       }
//     };

//     getInitialSession();

//     // Listen for auth changes
//     const { data: { subscription } } = supabase.auth.onAuthStateChange(
//       async (event, session) => {
//         if (mounted) {
//           setSession(session);
//           setUser(session?.user || null);
//           setLoading(false);
//         }
//       }
//     );

//     return () => {
//       mounted = false;
//       subscription.unsubscribe();
//     };
//   }, []);

//   // Login function
//   const login = async (email, password) => {
//     try {
//       const { data, error } = await supabase.auth.signInWithPassword({
//         email,
//         password,
//       });

//       if (error) {
//         return { error };
//       }

//       return { data };
//     } catch (error) {
//       return { error };
//     }
//   };

//   // // Signup function
//   // const signup = async (email, password) => {
//   //   try {
//   //     const { data, error } = await supabase.auth.signUp({
//   //       email,
//   //       password,
//   //     });

//   //     if (error) {
//   //       return { error };
//   //     }

//   //     return { data };
//   //   } catch (error) {
//   //     return { error };
//   //   }
//   // };
// // src/hooks/auth/useAuth.jsx - Update the signup function
// const signup = async (userData) => {
//   try {
//     const { data, error } = await supabase.auth.signUp({
//       email: userData.email,
//       password: userData.password,
//       options: userData.options // This includes the additional user metadata
//     });

//     if (error) {
//       return { error };
//     }

//     return { data };
//   } catch (error) {
//     return { error };
//   }
// };
//   // Sign out function
//   const signOut = async () => {
//     try {
//       const { error } = await supabase.auth.signOut();
      
//       if (error) {
//         return { error };
//       }

//       return { success: true };
//     } catch (error) {
//       return { error };
//     }
//   };

//   // Refresh user function
//   const refreshUser = async () => {
//     try {
//       const { data: { user: currentUser }, error } = await supabase.auth.getUser();
      
//       if (error) {
//         console.error("Refresh user error:", error);
//         return;
//       }

//       setUser(currentUser);
//     } catch (error) {
//       console.error("Refresh error:", error);
//     }
//   };

//   const value = {
//     user,
//     session,
//     loading,
//     isAuthenticated: !!user,
//     login,
//     signup,
//     signOut,
//     refreshUser,
//   };

//   return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
// }

// export function useAuth() {
//   const context = useContext(AuthContext);
//   if (!context) {
//     throw new Error("useAuth must be used within an AuthProvider");
//   }
//   return context;
// }

// src/hooks/auth/useAuth.jsx - Fixed loading issues
import { useState, useEffect, createContext, useContext, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [initialized, setInitialized] = useState(false);

  // Safe error handler that doesn't cause infinite loops
  const handleError = useCallback((error, context = '') => {
    console.error(`Error in ${context}:`, error);
    
    if (error?.code === 'PGRST116') {
      return {
        type: 'NOT_FOUND',
        message: 'Resource not found',
        code: 'PGRST116'
      };
    }
    
    return {
      type: 'ERROR',
      message: error?.message || 'An error occurred',
      code: error?.code
    };
  }, []);

  // Load user profile with timeout and proper error handling
  const loadUserProfile = useCallback(async (userId) => {
    if (!userId) {
      setProfile(null);
      return;
    }

    try {
      // Add timeout to prevent hanging
      const profilePromise = supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Profile loading timeout')), 10000)
      );

      const { data, error } = await Promise.race([profilePromise, timeoutPromise]);

      if (error) {
        if (error.code === 'PGRST116') {
          // No profile found - this is normal for new users
          console.log('No profile found for user:', userId);
          setProfile(null);
        } else {
          console.error('Profile loading error:', error);
          setProfile(null);
        }
      } else {
        setProfile(data);
      }
    } catch (error) {
      console.error('Profile loading failed:', error);
      setProfile(null);
    }
  }, []);

  // Initialize auth state
  useEffect(() => {
    let mounted = true;
    let timeoutId;

    const initializeAuth = async () => {
      try {
        console.log('Initializing auth...');
        
        // Set timeout to prevent infinite loading
        timeoutId = setTimeout(() => {
          if (mounted) {
            console.warn('Auth initialization timeout');
            setLoading(false);
            setInitialized(true);
          }
        }, 15000);

        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (!mounted) return;

        if (error) {
          console.error("Session error:", error);
        }
        
        setSession(session);
        setUser(session?.user || null);
        
        // Load profile if user exists
        if (session?.user) {
          await loadUserProfile(session.user.id);
        } else {
          setProfile(null);
        }
        
        setLoading(false);
        setInitialized(true);
        clearTimeout(timeoutId);

      } catch (error) {
        console.error("Auth initialization error:", error);
        if (mounted) {
          setLoading(false);
          setInitialized(true);
          clearTimeout(timeoutId);
        }
      }
    };

    initializeAuth();

    return () => {
      mounted = false;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []); // Empty dependency array - only run once

  // Listen for auth changes (separate from initialization)
  useEffect(() => {
    if (!initialized) return;

    let mounted = true;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);
        
        if (!mounted) return;

        setSession(session);
        setUser(session?.user || null);
        
        if (session?.user) {
          // Only load profile if it's a different user or we don't have one
          if (!profile || profile.id !== session.user.id) {
            await loadUserProfile(session.user.id);
          }
        } else {
          setProfile(null);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [initialized, loadUserProfile, profile]);

  // Login function
  const login = useCallback(async (email, password) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        const handledError = handleError(error, 'login');
        return { error: handledError };
      }

      // Don't manually set loading to false here - let the auth state change handle it
      return { data };
    } catch (error) {
      setLoading(false);
      const handledError = handleError(error, 'login');
      return { error: handledError };
    }
  }, [handleError]);

  // Simplified signup function that prevents hanging
  const signup = useCallback(async (userData) => {
    try {
      console.log('Starting signup process...');
      setLoading(true);

      // Step 1: Create auth user (simple, no metadata to avoid trigger issues)
      const authPromise = supabase.auth.signUp({
        email: userData.email,
        password: userData.password
      });

      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Signup timeout')), 30000)
      );

      const { data: authData, error: authError } = await Promise.race([
        authPromise, 
        timeoutPromise
      ]);

      if (authError) {
        setLoading(false);
        const handledError = handleError(authError, 'signup');
        return { error: handledError };
      }

      console.log('Auth user created:', authData.user?.id);

      // Step 2: Create profile manually (with timeout)
      if (authData.user && authData.user.email_confirmed_at === null) {
        // User needs email confirmation, create profile anyway
        try {
          const profileData = {
            id: authData.user.id,
            email: userData.email,
            first_name: userData.options?.data?.first_name || '',
            last_name: userData.options?.data?.last_name || '',
            account_type: userData.options?.data?.account_type || 'individual',
            job_title: userData.options?.data?.job_title || '',
            company_name: userData.options?.data?.company_name || '',
            role: userData.options?.data?.account_type === 'corporate' ? 'admin' : 'learner',
            status: 'active'
          };

          const profilePromise = supabase
            .from('profiles')
            .insert([profileData])
            .select()
            .single();

          const profileTimeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Profile creation timeout')), 10000)
          );

          const { data: profileResult, error: profileError } = await Promise.race([
            profilePromise,
            profileTimeoutPromise
          ]);

          if (profileError) {
            console.error('Profile creation error:', profileError);
            // Don't fail signup for profile issues - user can complete later
          } else {
            console.log('Profile created successfully');
          }

          // Handle corporate organization creation (non-blocking)
          if (userData.options?.data?.account_type === 'corporate') {
            createOrganizationAsync(authData.user.id, userData.options.data)
              .catch(error => console.error('Organization creation failed:', error));
          }

        } catch (profileError) {
          console.error('Profile creation failed:', profileError);
          // Don't fail signup for profile creation issues
        }
      }

      setLoading(false);
      return { data: authData };

    } catch (error) {
      console.error('Signup error:', error);
      setLoading(false);
      const handledError = handleError(error, 'signup');
      return { error: handledError };
    }
  }, [handleError]);

  // Non-blocking organization creation
  const createOrganizationAsync = async (userId, userData) => {
    try {
      const companyName = userData.company_name || 'Unnamed Company';
      const slug = companyName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '') + '-' + Date.now();

      const orgData = {
        name: companyName,
        slug: slug,
        email: userData.email,
        max_employees: userData.employee_count === '1-10' ? 10 :
                     userData.employee_count === '11-50' ? 50 :
                     userData.employee_count === '51-200' ? 200 : 10,
        subscription_status: 'active'
      };

      const { data: orgResult, error: orgError } = await supabase
        .from('organizations')
        .insert([orgData])
        .select()
        .single();

      if (orgError) {
        throw orgError;
      }

      // Update profile with organization reference
      await supabase
        .from('profiles')
        .update({ 
          organization_id: orgResult.id,
          company_id: orgResult.id 
        })
        .eq('id', userId);

      // Add user as organization admin
      await supabase
        .from('organization_members')
        .insert([{
          organization_id: orgResult.id,
          user_id: userId,
          role: 'admin',
          status: 'active',
          joined_at: new Date().toISOString()
        }]);

      console.log('Organization created successfully');
    } catch (error) {
      console.error('Organization creation error:', error);
    }
  };

  // Sign out function
  const signOut = useCallback(async () => {
    try {
      setLoading(true);
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        const handledError = handleError(error, 'signout');
        setLoading(false);
        return { error: handledError };
      }

      // Clear state
      setProfile(null);
      setUser(null);
      setSession(null);
      setLoading(false);
      
      return { success: true };
    } catch (error) {
      setLoading(false);
      const handledError = handleError(error, 'signout');
      return { error: handledError };
    }
  }, [handleError]);

  // Refresh user profile
  const refreshUser = useCallback(async () => {
    if (!user?.id) return;
    await loadUserProfile(user.id);
  }, [user?.id, loadUserProfile]);

  const value = {
    user,
    session,
    profile,
    loading,
    initialized,
    isAuthenticated: !!user,
    hasProfile: !!profile,
    login,
    signup,
    signOut,
    refreshUser,
    loadUserProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}