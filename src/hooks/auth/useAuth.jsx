// src/hooks/auth/useAuth.jsx - UPDATED with Email Validation & Enhanced Error Handling
import { useState, useEffect, createContext, useContext, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";

const AuthContext = createContext();

// Helper function to get the correct redirect URL for current environment
const getAuthRedirectURL = (path = '/auth/callback') => {
  const baseURL = import.meta.env.VITE_APP_URL || window.location.origin;
  return `${baseURL}${path}`;
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);

  // Safe error handler
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

  // Load user profile
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
        .select(`
          *,
          organization:organization_id(
            id,
            name,
            slug,
            subscription_status,
            max_employees
          )
        `)
        .eq('id', userId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Profile loading error:', error);
        setProfile(null);
      } else {
        console.log('Profile loaded:', data?.email || 'No profile');
        setProfile(data);
      }
    } catch (error) {
      console.error('Profile loading failed:', error);
      setProfile(null);
    } finally {
      setProfileLoading(false);
    }
  }, []);

  // Auth initialization
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        console.log('🔵 Initializing auth...');
        
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (!mounted) return;

        if (error) {
          console.error("🔴 Session error:", error);
        }
        
        console.log('🟢 Session loaded:', session?.user?.email || 'No user');
        
        setSession(session);
        setUser(session?.user || null);
        setLoading(false);
        
        if (session?.user) {
          loadUserProfile(session.user.id);
        }

      } catch (error) {
        console.error("🔴 Auth initialization error:", error);
        if (mounted) {
          setUser(null);
          setSession(null);
          setLoading(false);
        }
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🟡 Auth state changed:', event, session?.user?.email || 'No user');
        
        if (!mounted) return;

        setSession(session);
        setUser(session?.user || null);
        
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
  }, []);

  // Login function
  const login = useCallback(async (email, password) => {
    
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
                console.log('🔵 Login started for:', data);

      return { data };
      
    } catch (error) {
      console.error('🔴 Login exception:', error);
      const handledError = handleError(error, 'login');
      return { error: handledError };
    }
  }, [handleError]);
 // ✅ ENHANCED: Create user profile with better account_type handling
  const createUserProfile = useCallback(async (user, userData = {}) => {
    try {
      console.log('🔵 Creating user profile for:', user.id);
      console.log('🔍 UserData received:', userData);
      console.log('🔍 User metadata:', user.user_metadata);

      // ✅ CRITICAL: Proper account_type resolution
      const accountType = userData.account_type || user.user_metadata?.account_type || 'individual';
      console.log('🔍 Resolved account_type:', accountType);

      const profileData = {
        id: user.id, // ✅ CRITICAL: This must be the auth user ID
        email: user.email,
        first_name: userData.first_name || user.user_metadata?.first_name || '',
        last_name: userData.last_name || user.user_metadata?.last_name || '',
        account_type: accountType, // ✅ Use resolved account type
        job_title: userData.job_title || user.user_metadata?.job_title || '',
        company_name: userData.company_name || user.user_metadata?.company_name || '',
        role: accountType === 'corporate' ? 'admin' : 'learner', // ✅ Set role based on account type
        status: 'active',
        auth_user_id: user.id // ✅ CRITICAL: Explicit auth user reference
      };

      console.log('🔍 Profile data to be inserted:', JSON.stringify(profileData, null, 2));
      console.log('🔍 Final account_type in profile:', profileData.account_type);
      console.log('🔍 Final role in profile:', profileData.role);

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .insert([profileData])
        .select()
        .single();

      if (profileError) {
        console.error('🔴 Profile creation error:', profileError);
        throw profileError;
      }

      console.log('🟢 Profile created successfully:', profile);
      console.log('🔍 Created profile account_type:', profile.account_type);

      // Handle corporate organization creation if needed
      if (profileData.account_type === 'corporate') {
        console.log('🏢 Creating organization for corporate account...');
        await createOrganizationForUser(user.id, {
          ...userData,
          ...user.user_metadata,
          email: user.email
        });
      }

      return profile;

    } catch (error) {
      console.error('🔴 Profile creation failed:', error);
      throw error;
    }
  }, []);

// Fixed signup function - replace the one in your useAuth.jsx
const signup = useCallback(async (userData) => {
  try {
    console.log('🔵 Starting signup process...', {
      email: userData.email,
      account_type: userData.options?.data?.account_type
    });

    const redirectURL = getAuthRedirectURL('/auth/callback');
    console.log('📧 Email verification will redirect to:', redirectURL);

    const signupData = {
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
          employee_count: userData.options?.data?.employee_count || '',
        }
      }
    };

    console.log('🔍 Final signup data:', JSON.stringify(signupData, null, 2));
    console.log('🔍 Account type being sent:', signupData.options.data.account_type);

    const { data: authData, error: authError } = await supabase.auth.signUp(signupData);

    if (authError) {
      console.error('🔴 Auth signup error:', authError);
      
      // ✅ FIXED: Proper error handling
      const errorMessage = authError.message?.toLowerCase() || '';
      const errorCode = authError.code || '';

      // Check for duplicate email errors
      if (
        errorMessage.includes('already registered') ||
        errorMessage.includes('already been registered') ||
        errorMessage.includes('user already registered') ||
        errorMessage.includes('email address not authorized') ||
        errorMessage.includes('email not confirmed') ||
        errorCode === 'email_address_already_registered' ||
        errorCode === 'user_already_registered' ||
        errorCode === 'signup_disabled'
      ) {
        return { 
          error: {
            type: 'EMAIL_ALREADY_EXISTS',
            message: 'This email address is already registered. Please sign in instead or use a different email.',
            code: 'EMAIL_DUPLICATE'
          }
        };
      }

      // Check for rate limiting
      if (
        errorMessage.includes('rate') || 
        errorMessage.includes('limit') ||
        errorMessage.includes('quota') ||
        errorMessage.includes('too many requests') ||
        errorCode === 'over_email_send_rate_limit'
      ) {
        return { 
          error: {
            type: 'RATE_LIMITED',
            message: 'Too many signup attempts. Please wait 1 hour or contact support.',
            code: 'RATE_LIMITED'
          }
        };
      }

      // Check for invalid email format
      if (
        errorMessage.includes('invalid email') ||
        errorMessage.includes('email format') ||
        errorCode === 'invalid_email'
      ) {
        return { 
          error: {
            type: 'INVALID_EMAIL',
            message: 'Please enter a valid email address.',
            code: 'INVALID_EMAIL'
          }
        };
      }

      // Check for weak password
      if (
        errorMessage.includes('password') ||
        errorMessage.includes('weak') ||
        errorCode === 'weak_password'
      ) {
        return { 
          error: {
            type: 'WEAK_PASSWORD',
            message: 'Password is too weak. Please choose a stronger password.',
            code: 'WEAK_PASSWORD'
          }
        };
      }

      // Generic error handling
      const handledError = handleError(authError, 'signup');
      return { error: handledError };
    }

    console.log('🟢 Auth user created:', {
      id: authData.user?.id,
      email: authData.user?.email,
      user_metadata: authData.user?.user_metadata,
      emailConfirmed: authData.user?.email_confirmed_at !== null,
      needsConfirmation: authData.user && !authData.user.email_confirmed_at
    });

    // ✅ DEBUG: Verify user metadata contains account_type
    console.log('🔍 User metadata from Supabase:', authData.user?.user_metadata);
    console.log('🔍 Account type in user metadata:', authData.user?.user_metadata?.account_type);

    // 🚀 Create profile immediately if email is confirmed (instant confirmation)
    if (authData.user && authData.user.email_confirmed_at) {
      console.log('🔵 Email confirmed instantly, creating profile...');
      
      try {
        const profile = await createUserProfile(authData.user, signupData.options.data);
        console.log('🟢 Profile created during signup:', profile);
        
        return { 
          data: authData,
          profile: profile,
          message: 'Account created and profile set up successfully!'
        };
      } catch (profileError) {
        console.error('🔴 Profile creation during signup failed:', profileError);
        // Continue with signup success even if profile creation fails
        // Profile will be created later in auth callback
      }
    }

    return { 
      data: authData,
      message: 'Account created! Please check your email to verify your account.'
    };

  } catch (error) {
    console.error('🔴 Signup error:', error);
    const handledError = handleError(error, 'signup');
    return { error: handledError };
  }
}, [handleError, createUserProfile]);
 
  // Organization creation helper
  const createOrganizationForUser = async (userId, userData) => {
    try {
      console.log('🏢 Creating organization for user:', userId);

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
        subscription_status: 'trial'
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

      console.log('🟢 Organization created successfully:', orgResult.id);
      return orgResult;

    } catch (error) {
      console.error('🔴 Organization creation error:', error);
      // Don't throw - let signup succeed even if org creation fails
    }
  };

  // ✅ NEW: Email checking function
  const checkEmailExists = useCallback(async (email) => {
    try {
      // Try to use the database function first
      const { data, error } = await supabase.rpc('check_email_exists', { 
        email_to_check: email 
      });

      if (error) {
        console.error('Email check error:', error);
        
        // If function doesn't exist, return graceful fallback
        if (error.message?.includes('function') || error.code === '42883') {
          console.warn('check_email_exists function not found - email checking disabled');
          return { exists: false, functionMissing: true };
        }
        
        return { error: 'Failed to check email availability' };
      }

      return { exists: data === true };
    } catch (error) {
      console.error('Email availability check failed:', error);
      return { error: 'Failed to check email availability' };
    }
  }, []);

  // Password reset function
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

  // Resend verification email
  const resendVerification = useCallback(async (email) => {
    try {
      const redirectURL = getAuthRedirectURL('/auth/callback');
      
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: redirectURL
        }
      });
      
      if (error) {
        const handledError = handleError(error, 'resend-verification');
        return { error: handledError };
      }
      
      return { success: true };
    } catch (error) {
      const handledError = handleError(error, 'resend-verification');
      return { error: handledError };
    }
  }, [handleError]);

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
    loading,
    profileLoading,
    isAuthenticated: !!user,
    hasProfile: !!profile,
    login,
    signup,
    signOut,
    resetPassword,
    refreshUser,
    loadUserProfile,
    resendVerification,
    createUserProfile,
    checkEmailExists, // ✅ NEW: Email checking function
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