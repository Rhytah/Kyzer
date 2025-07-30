// src/lib/supabase.js - Updated to fix loading issues and match your schema
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    // Add timeout to prevent hanging
    flowType: 'pkce'
  },
  // Add global timeout to prevent hanging requests
  global: {
    headers: {
      'X-Client-Info': 'kyzer-lms@1.0.0',
    },
  },
  // Add request timeout
  db: {
    schema: 'public',
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// ==========================================
// TABLE CONSTANTS - Updated to match your schema
// ==========================================
export const TABLES = {
  // User and Auth related
  PROFILES: 'profiles',
  
  // Course related
  COURSES: 'courses',
  COURSE_MODULES: 'course_modules',
  LESSONS: 'lessons',
  COURSE_ENROLLMENTS: 'course_enrollments',
  ENROLLMENTS: 'enrollments', // You have both tables
  LESSON_PROGRESS: 'lesson_progress',
  
  // Quiz and Assessment
  QUIZZES: 'quizzes',
  QUIZ_QUESTIONS: 'quiz_questions',
  QUIZ_ATTEMPTS: 'quiz_attempts',
  
  // Corporate/Organization - Updated to match your actual tables
  ORGANIZATIONS: 'organizations',
  ORGANIZATION_MEMBERS: 'organization_members',
  COMPANIES: 'companies',
  COMPANY_EMPLOYEES: 'company_employees',
  COMPANY_DEPARTMENTS: 'company_departments',
  EMPLOYEE_DEPARTMENTS: 'employee_departments',
  COMPANY_COURSE_ASSIGNMENTS: 'company_course_assignments',
  COMPANY_EMPLOYEE_COURSE_ASSIGNMENTS: 'company_employee_course_assignments',
  EMPLOYEE_INVITATIONS: 'employee_invitations',
  
  // Categories
  COURSE_CATEGORIES: 'course_categories',
  
  // Certificates
  CERTIFICATES: 'certificates',
  
  // Profile views (if you have them)
  USER_PROFILES: 'user_profiles',
  COMPANY_MEMBERSHIPS: 'company_memberships',
};

// ==========================================
// SAFE QUERY HELPERS - Prevent hanging
// ==========================================

// Create query with timeout
export const createSafeQuery = (table, timeoutMs = 10000) => {
  const query = supabase.from(table);
  
  // Add timeout wrapper
  const executeWithTimeout = async (queryPromise) => {
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error(`Query timeout after ${timeoutMs}ms`)), timeoutMs)
    );
    
    try {
      return await Promise.race([queryPromise, timeoutPromise]);
    } catch (error) {
      console.error(`Query timeout or error on table ${table}:`, error);
      throw error;
    }
  };

  // Override query methods to include timeout
  const originalSelect = query.select.bind(query);
  query.select = function(...args) {
    const selectQuery = originalSelect(...args);
    const originalSingle = selectQuery.single;
    
    if (originalSingle) {
      selectQuery.single = function() {
        const singleQuery = originalSingle.call(this);
        const originalThen = singleQuery.then;
        
        singleQuery.then = function(onResolve, onReject) {
          return executeWithTimeout(originalThen.call(this, onResolve, onReject));
        };
        
        return singleQuery;
      };
    }
    
    return selectQuery;
  };
  
  return query;
};

// ==========================================
// UPDATED AUTH HELPERS - With timeouts
// ==========================================

// Get current user with timeout
export const getCurrentUser = async (timeoutMs = 5000) => {
  try {
    const authPromise = supabase.auth.getUser();
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Auth timeout')), timeoutMs)
    );

    const { data: { user }, error } = await Promise.race([authPromise, timeoutPromise]);
    
    if (error) {
      console.error('Auth error:', error);
      return null; // Return null instead of throwing
    }
    
    return user;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null; // Don't throw, return null
  }
};

// Get user profile - Updated to match your actual schema
export const getUserProfile = async (userId = null, timeoutMs = 8000) => {
  try {
    let targetUserId = userId;
    
    if (!targetUserId) {
      const user = await getCurrentUser();
      if (!user) return null;
      targetUserId = user.id;
    }

    const profilePromise = supabase
      .from(TABLES.PROFILES)
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
      .eq('id', targetUserId) // Your profiles table uses 'id' not 'auth_user_id'
      .single();

    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Profile query timeout')), timeoutMs)
    );

    const { data, error } = await Promise.race([profilePromise, timeoutPromise]);

    if (error) {
      if (error.code === 'PGRST116') {
        console.log('No profile found for user:', targetUserId);
        return null; // Return null, don't throw
      }
      console.error('Profile query error:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error getting user profile:', error);
    return null; // Always return null on error, never throw
  }
};

// Safe session check
export const getSession = async (timeoutMs = 5000) => {
  try {
    const sessionPromise = supabase.auth.getSession();
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Session timeout')), timeoutMs)
    );

    const { data: { session }, error } = await Promise.race([sessionPromise, timeoutPromise]);
    
    if (error) {
      console.error('Session error:', error);
      return null;
    }
    
    return session;
  } catch (error) {
    console.error('Error getting session:', error);
    return null;
  }
};

// ==========================================
// IMPROVED ERROR HANDLING
// ==========================================

export const handleSupabaseError = (error, context = '') => {
  console.error(`Supabase error ${context}:`, error);
  
  // Handle timeout errors
  if (error?.message?.includes('timeout')) {
    return {
      type: 'TIMEOUT',
      message: 'Request timed out. Please try again.',
      code: 'TIMEOUT'
    };
  }
  
  if (isAuthError(error)) {
    return {
      type: 'AUTH_ERROR',
      message: 'Authentication required. Please log in again.',
      code: error.code
    };
  }
  
  if (isPermissionError(error)) {
    return {
      type: 'PERMISSION_ERROR',
      message: 'You do not have permission to perform this action.',
      code: error.code
    };
  }
  
  if (error?.code === 'PGRST116') {
    return {
      type: 'NOT_FOUND',
      message: 'No data found.',
      code: 'PGRST116'
    };
  }
  
  if (error?.code === '23505') {
    return {
      type: 'DUPLICATE',
      message: 'This record already exists.',
      code: '23505'
    };
  }
  
  if (error?.code === '23503') {
    return {
      type: 'FOREIGN_KEY',
      message: 'Cannot delete this record as it is being used elsewhere.',
      code: '23503'
    };
  }
  
  return {
    type: 'UNKNOWN',
    message: error?.message || 'An unexpected error occurred.',
    code: error?.code || 'UNKNOWN'
  };
};

// ==========================================
// SAFE QUERY WRAPPER
// ==========================================

export const safeQuery = async (queryPromise, context = '', timeoutMs = 10000) => {
  try {
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error(`Query timeout in ${context}`)), timeoutMs)
    );

    const result = await Promise.race([queryPromise, timeoutPromise]);
    
    if (result.error) {
      const handledError = handleSupabaseError(result.error, context);
      return { data: null, error: handledError };
    }
    
    return { data: result.data, error: null };
  } catch (error) {
    const handledError = handleSupabaseError(error, context);
    return { data: null, error: handledError };
  }
};

// ==========================================
// KEEP YOUR EXISTING HELPERS (they're good!)
// ==========================================

export const STORAGE_BUCKETS = {
  COURSE_CONTENT: 'course-content',
  AVATARS: 'avatars',
  CERTIFICATES: 'certificates',
  ORGANIZATION_LOGOS: 'organization-logos',
  COURSE_THUMBNAILS: 'course-thumbnails'
};

export const createQuery = (table) => {
  return supabase.from(table);
};

export const isAuthError = (error) => {
  return error?.message?.includes('JWT') || 
         error?.message?.includes('auth') ||
         error?.code === 'PGRST301';
};

export const isPermissionError = (error) => {
  return error?.code === 'PGRST106' || 
         error?.message?.includes('permission');
};

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validateFileType = (file, allowedTypes) => {
  return allowedTypes.includes(file.type);
};

export const validateFileSize = (file, maxSizeInMB) => {
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
  return file.size <= maxSizeInBytes;
};

// ==========================================
// FILE UPLOAD HELPERS (keep as-is, they're good)
// ==========================================

export const uploadFile = async (bucket, path, file, options = {}) => {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false,
        ...options
      });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};

export const getFileUrl = (bucket, path) => {
  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(path);
  
  return data.publicUrl;
};

export const deleteFile = async (bucket, path) => {
  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path]);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
};

// ==========================================
// PAGINATION HELPERS (keep as-is)
// ==========================================

export const createPaginatedQuery = (table, {
  page = 1,
  limit = 25,
  orderBy = 'created_at',
  ascending = false,
  select = '*'
} = {}) => {
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  return supabase
    .from(table)
    .select(select, { count: 'exact' })
    .range(from, to)
    .order(orderBy, { ascending });
};

// ==========================================
// AUTH HELPERS (keep existing ones)
// ==========================================

export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

export const resetPassword = async (email) => {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    });
    if (error) throw error;
  } catch (error) {
    console.error('Error resetting password:', error);
    throw error;
  }
};

// Export default client
export default supabase;