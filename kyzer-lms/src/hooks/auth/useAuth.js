// src/hooks/auth/useAuth.js
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'

export function useAuth() {
  const { user, setUser, setLoading, loading } = useAuthStore()
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        setLoading(true)
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Error getting session:', error)
        } else if (session?.user) {
          // Get user profile data
          const profile = await getUserProfile(session.user.id)
          setUser({
            ...session.user,
            profile
          })
        }
      } catch (error) {
        console.error('Error initializing auth:', error)
      } finally {
        setLoading(false)
        setInitialized(true)
      }
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email)
        
        if (session?.user) {
          // Get user profile data
          const profile = await getUserProfile(session.user.id)
          setUser({
            ...session.user,
            profile
          })
        } else {
          setUser(null)
        }
        
        setLoading(false)
      }
    )

    return () => {
      subscription?.unsubscribe()
    }
  }, [setUser, setLoading])

  // Get user profile from database
  const getUserProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 = not found
        console.error('Error fetching profile:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Error fetching profile:', error)
      return null
    }
  }

  // Login function
  const login = async (email, password) => {
    try {
      setLoading(true)
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        return { error }
      }

      return { data }
    } catch (error) {
      console.error('Login error:', error)
      return { error }
    } finally {
      setLoading(false)
    }
  }

  // Signup function
  const signup = async ({ email, password, options }) => {
    try {
      setLoading(true)
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options
      })

      if (error) {
        return { error }
      }

      // If user was created, also create their profile
      if (data.user && !data.user.identities?.length === 0) {
        // User already exists
        return { 
          error: { 
            message: 'An account with this email already exists. Please sign in instead.' 
          } 
        }
      }

      return { data }
    } catch (error) {
      console.error('Signup error:', error)
      return { error }
    } finally {
      setLoading(false)
    }
  }

  // Logout function
  const logout = async () => {
    try {
      setLoading(true)
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        console.error('Logout error:', error)
        return { error }
      }

      setUser(null)
      return { success: true }
    } catch (error) {
      console.error('Logout error:', error)
      return { error }
    } finally {
      setLoading(false)
    }
  }

  // Reset password function
  const resetPassword = async (email) => {
    try {
      setLoading(true)
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      })

      if (error) {
        return { error }
      }

      return { data }
    } catch (error) {
      console.error('Reset password error:', error)
      return { error }
    } finally {
      setLoading(false)
    }
  }

  // Update password function
  const updatePassword = async (newPassword) => {
    try {
      setLoading(true)
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (error) {
        return { error }
      }

      return { data }
    } catch (error) {
      console.error('Update password error:', error)
      return { error }
    } finally {
      setLoading(false)
    }
  }

  // Resend email verification
  const resendVerification = async (email) => {
    try {
      setLoading(true)
      const { data, error } = await supabase.auth.resend({
        type: 'signup',
        email
      })

      if (error) {
        return { error }
      }

      return { data }
    } catch (error) {
      console.error('Resend verification error:', error)
      return { error }
    } finally {
      setLoading(false)
    }
  }

  // Check if user has specific role
  const hasRole = (role) => {
    return user?.profile?.role === role
  }

  // Check if user has permission
  const hasPermission = (permission) => {
    const userRole = user?.profile?.role
    const permissions = {
      admin: ['all'],
      corporate_admin: ['manage_employees', 'view_reports', 'assign_courses'],
      user: ['view_courses', 'take_courses']
    }

    return permissions[userRole]?.includes(permission) || permissions[userRole]?.includes('all')
  }

  return {
    // State
    user,
    loading,
    initialized,
    
    // Auth methods
    login,
    signup,
    logout,
    resetPassword,
    updatePassword,
    resendVerification,
    
    // Utility methods
    hasRole,
    hasPermission,
    
    // Computed properties
    isAuthenticated: !!user,
    isEmailVerified: user?.email_confirmed_at != null,
    isCorporateUser: user?.profile?.account_type === 'corporate',
    isIndividualUser: user?.profile?.account_type === 'individual'
  }
}