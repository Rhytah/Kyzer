// src/hooks/auth/useAuth.jsx - FIXED to prevent infinite loading on login
import { useState, useEffect, createContext, useContext, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";

const AuthContext = createContext();

// Helper function to get the correct redirect URL for current environment
const getAuthRedirectURL = (path = '/auth/callback') => {
  // For development
  if (import.meta.env.DEV) {
    return `http://localhost:${window.location.port || 5173}${path}`;
  }
  
  // For production/staging - use environment variable or current origin
  const baseURL = import.meta.env.VITE_APP_URL || window.location.origin;
  return `${baseURL}${path}`;
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Auth loading
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false); // Separate profile loading

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

  // Load user profile - NON-BLOCKING and separate from auth loading
  const loadUserProfile = useCallback(async (userId) => {
    if (!userId) {
      setProfile(null);
      return;
    }

    console.log('Loading profile for user:', userId);
    setProfileLoading(true);

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle(); // Use maybeSingle to prevent PGRST116

      if (error && error.code !== 'PGRST116') {
        console.error('Profile loading error:', error);
        setProfile(null);
      } else {
        setProfile(data);
      }
    } catch (error) {
      console.error('Profile loading failed:', error);
      setProfile(null);
    } finally {
      setProfileLoading(false);
    }
  }, []);

  // SIMPLIFIED auth initialization - CRITICAL FIX
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        console.log('🔵 Initializing auth...');
        
        // Get current session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (!mounted) return;

        if (error) {
          console.error("🔴 Session error:", error);
        }
        
        console.log('🟢 Session loaded:', session?.user?.email || 'No user');
        
        // Set auth state immediately
        setSession(session);
        setUser(session?.user || null);
        setLoading(false); // CRITICAL: Always set loading to false here
        
        // Load profile in background (non-blocking)
        if (session?.user) {
          loadUserProfile(session.user.id);
        }

      } catch (error) {
        console.error("🔴 Auth initialization error:", error);
        if (mounted) {
          setUser(null);
          setSession(null);
          setLoading(false); // CRITICAL: Always set loading to false
        }
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🟡 Auth state changed:', event, session?.user?.email || 'No user');
        
        if (!mounted) return;

        setSession(session);
        setUser(session?.user || null);
        
        // Load profile for new user (non-blocking)
        if (session?.user) {
          loadUserProfile(session.user.id);
        } else {
          setProfile(null);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []); // Empty dependency - only run once

  // FIXED login function - proper loading management
  const login = useCallback(async (email, password) => {
    console.log('🔵 Login started for:', email);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('🔴 Login error:', error);
        const handledError = handleError(error, 'login');
        return { error: handledError };
      }

      console.log('🟢 Login successful:', data.user?.email);
      
      // The auth state change listener will handle updating user/session
      // Don't manually set loading states here
      
      return { data };
      
    } catch (error) {
      console.error('🔴 Login exception:', error);
      const handledError = handleError(error, 'login');
      return { error: handledError };
    }
  }, [handleError]);

  // Signup function with proper email redirect configuration
  const signup = useCallback(async (userData) => {
    try {
      console.log('🔵 Starting signup process...');

      const redirectURL = getAuthRedirectURL('/auth/callback?type=signup');
      console.log('📧 Email verification will redirect to:', redirectURL);

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          emailRedirectTo: redirectURL,
          data: {
            first_name: userData.options?.data?.first_name || '',
            last_name: userData.options?.data?.last_name || '',
            account_type: userData.options?.data?.account_type || 'individual',
            job_title: userData.options?.data?.job_title || '',
            company_name: userData.options?.data?.company_name || '',
          }
        }
      });

      if (authError) {
        const handledError = handleError(authError, 'signup');
        return { error: handledError };
      }

      console.log('🟢 Auth user created:', authData.user?.id);

      // Create profile if user needs email confirmation
      if (authData.user && authData.user.email_confirmed_at === null) {
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

          const { error: profileError } = await supabase
            .from('profiles')
            .insert([profileData]);

          if (profileError) {
            console.error('🔴 Profile creation error:', profileError);
          } else {
            console.log('🟢 Profile created successfully');
          }

          // Handle corporate organization creation (non-blocking)
          if (userData.options?.data?.account_type === 'corporate') {
            createOrganizationAsync(authData.user.id, userData.options.data)
              .catch(error => console.error('🔴 Organization creation failed:', error));
          }

        } catch (profileError) {
          console.error('🔴 Profile creation failed:', profileError);
        }
      }

      return { data: authData };

    } catch (error) {
      console.error('🔴 Signup error:', error);
      const handledError = handleError(error, 'signup');
      return { error: handledError };
    }
  }, [handleError]);

  // Password reset function with environment-aware redirect
  const resetPassword = useCallback(async (email) => {
    try {
      const redirectURL = getAuthRedirectURL('/auth/callback?type=recovery');
      console.log('🔑 Password reset will redirect to:', redirectURL);
      
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectURL
      });
      
      if (error) {
        const handledError = handleError(error, 'password-reset');
        return { error: handledError };
      }
      
      return { data };
    } catch (error) {
      const handledError = handleError(error, 'password-reset');
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

      console.log('🏢 Organization created successfully');
    } catch (error) {
      console.error('🔴 Organization creation error:', error);
    }
  };

  // Sign out function
  const signOut = useCallback(async () => {
    try {
      console.log('🔵 Signing out...');
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('🔴 Signout error:', error);
        const handledError = handleError(error, 'signout');
        return { error: handledError };
      }

      // Clear state - auth state change listener will also clear these
      setProfile(null);
      
      console.log('🟢 Signed out successfully');
      return { success: true };
    } catch (error) {
      console.error('🔴 Signout exception:', error);
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
    loading, // Auth loading only
    profileLoading, // Separate profile loading
    isAuthenticated: !!user,
    hasProfile: !!profile,
    login,
    signup,
    signOut,
    resetPassword,
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