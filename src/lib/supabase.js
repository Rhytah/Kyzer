// // src/lib/supabase.js
// import { createClient } from "@supabase/supabase-js";

// const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
// const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// // Create Supabase client
// export const supabase = createClient(supabaseUrl || "", supabaseAnonKey || "", {
//   auth: {
//     autoRefreshToken: true,
//     persistSession: true,
//     detectSessionInUrl: true,
//     flowType: "pkce",
//   },
//   db: {
//     schema: "public",
//   },
//   global: {
//     headers: {
//       "X-Client-Info": "kyzer-lms@1.0.0",
//     },
//   },
// });

// export default supabase;

// // Database helper functions
// export const db = {
//   // Profiles
//   profiles: {
//     async create(profile) {
//       const { data, error } = await supabase
//         .from("profiles")
//         .insert(profile)
//         .select()
//         .single();

//       if (error) throw error;
//       return data;
//     },

//     async getById(id) {
//       const { data, error } = await supabase
//         .from("profiles")
//         .select("*")
//         .eq("id", id)
//         .single();

//       if (error && error.code !== "PGRST116") throw error;
//       return data;
//     },

//     async update(id, updates) {
//       const { data, error } = await supabase
//         .from("profiles")
//         .update(updates)
//         .eq("id", id)
//         .select()
//         .single();

//       if (error) throw error;
//       return data;
//     },
//   },

//   // Organizations (for corporate accounts)
//   organizations: {
//     async create(organization) {
//       const { data, error } = await supabase
//         .from("organizations")
//         .insert(organization)
//         .select()
//         .single();

//       if (error) throw error;
//       return data;
//     },

//     async getById(id) {
//       const { data, error } = await supabase
//         .from("organizations")
//         .select("*")
//         .eq("id", id)
//         .single();

//       if (error && error.code !== "PGRST116") throw error;
//       return data;
//     },

//     async getByOwnerId(ownerId) {
//       const { data, error } = await supabase
//         .from("organizations")
//         .select("*")
//         .eq("owner_id", ownerId)
//         .single();

//       if (error && error.code !== "PGRST116") throw error;
//       return data;
//     },
//   },

//   // Courses
//   courses: {
//     async getAll(filters = {}) {
//       let query = supabase
//         .from("courses")
//         .select(
//           `
//           *,
//           categories(name),
//           course_enrollments(id, user_id, progress, completed_at)
//         `,
//         )
//         .eq("published", true);

//       if (filters.category) {
//         query = query.eq("category_id", filters.category);
//       }

//       if (filters.search) {
//         query = query.or(
//           `title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`,
//         );
//       }

//       const { data, error } = await query.order("created_at", {
//         ascending: false,
//       });

//       if (error) throw error;
//       return data;
//     },

//     async getById(id) {
//       const { data, error } = await supabase
//         .from("courses")
//         .select(
//           `
//           *,
//           categories(name),
//           course_modules(
//             id,
//             title,
//             description,
//             order_index,
//             lessons(
//               id,
//               title,
//               type,
//               content_url,
//               duration,
//               order_index
//             )
//           )
//         `,
//         )
//         .eq("id", id)
//         .single();

//       if (error) throw error;
//       return data;
//     },
//   },

//   // Enrollments
//   enrollments: {
//     async create(enrollment) {
//       const { data, error } = await supabase
//         .from("course_enrollments")
//         .insert(enrollment)
//         .select()
//         .single();

//       if (error) throw error;
//       return data;
//     },

//     async getUserEnrollments(userId) {
//       const { data, error } = await supabase
//         .from("course_enrollments")
//         .select(
//           `
//           *,
//           courses(
//             id,
//             title,
//             description,
//             thumbnail_url,
//             duration,
//             difficulty
//           )
//         `,
//         )
//         .eq("user_id", userId)
//         .order("enrolled_at", { ascending: false });

//       if (error) throw error;
//       return data;
//     },

//     async getByUserAndCourse(userId, courseId) {
//       const { data, error } = await supabase
//         .from("course_enrollments")
//         .select("*")
//         .eq("user_id", userId)
//         .eq("course_id", courseId)
//         .single();

//       if (error && error.code !== "PGRST116") throw error;
//       return data;
//     },
//   },
// };

// // Storage helpers
// export const storage = {
//   async uploadFile(bucket, path, file) {
//     const { data, error } = await supabase.storage
//       .from(bucket)
//       .upload(path, file);

//     if (error) throw error;
//     return data;
//   },

//   async getPublicUrl(bucket, path) {
//     const { data } = supabase.storage.from(bucket).getPublicUrl(path);

//     return data.publicUrl;
//   },

//   async deleteFile(bucket, path) {
//     const { error } = await supabase.storage.from(bucket).remove([path]);

//     if (error) throw error;
//   },
// };

// // Real-time helpers
// export const realtime = {
//   subscribeToTable(table, callback, filter = null) {
//     const subscription = supabase
//       .channel(`public:${table}`)
//       .on(
//         "postgres_changes",
//         {
//           event: "*",
//           schema: "public",
//           table: table,
//           ...(filter && { filter }),
//         },
//         callback,
//       )
//       .subscribe();

//     return subscription;
//   },

//   unsubscribe(subscription) {
//     if (subscription) {
//       supabase.removeChannel(subscription);
//     }
//   },
// };

// src/lib/supabase.js
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
    detectSessionInUrl: true
  }
});

// ==========================================
// TABLE CONSTANTS
// ==========================================
export const TABLES = {
  // User and Auth related
  USERS: 'auth.users',
  PROFILES: 'profiles',
  
  // Course related
  COURSES: 'courses',
  COURSE_MODULES: 'course_modules',
  COURSE_LESSONS: 'course_lessons',
  ENROLLMENTS: 'enrollments',
  LESSON_PROGRESS: 'lesson_progress',
  COURSE_COMPLETIONS: 'course_completions',
  
  // Quiz and Assessment
  QUIZZES: 'quizzes',
  QUIZ_QUESTIONS: 'quiz_questions',
  QUIZ_ATTEMPTS: 'quiz_attempts',
  QUIZ_ANSWERS: 'quiz_answers',
  
  // Corporate/Organization
  ORGANIZATIONS: 'organizations',
  ORGANIZATION_MEMBERSHIPS: 'organization_memberships',
  ORGANIZATION_INVITATIONS: 'organization_invitations',
  ORGANIZATION_SETTINGS: 'organization_settings',
  COURSE_ASSIGNMENTS: 'course_assignments',
  EMPLOYEE_COURSE_PROGRESS: 'employee_course_progress',
  ORGANIZATION_REPORTS: 'organization_reports',
  
  // Content and Media
  COURSE_CONTENT: 'course_content',
  MEDIA_FILES: 'media_files',
  
  // Certificates
  CERTIFICATES: 'certificates',
  CERTIFICATE_TEMPLATES: 'certificate_templates',
  
  // System
  NOTIFICATIONS: 'notifications',
  ACTIVITY_LOGS: 'activity_logs'
};

// ==========================================
// STORAGE BUCKETS
// ==========================================
export const STORAGE_BUCKETS = {
  COURSE_CONTENT: 'course-content',
  AVATARS: 'avatars',
  CERTIFICATES: 'certificates',
  ORGANIZATION_LOGOS: 'organization-logos',
  COURSE_THUMBNAILS: 'course-thumbnails'
};

// ==========================================
// QUERY HELPERS
// ==========================================

// Base query builder with error handling
export const createQuery = (table) => {
  return supabase.from(table);
};

// Get current user
export const getCurrentUser = async () => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  } catch (error) {
    console.error('Error getting current user:', error);
    throw error;
  }
};

// Get user profile with organization info
export const getUserProfile = async () => {
  try {
    const user = await getCurrentUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from(TABLES.PROFILES)
      .select(`
        *,
        organization_membership:organization_memberships(
          role,
          status,
          department,
          job_title,
          organization:organizations(*)
        )
      `)
      .eq('id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    
    return { ...user, profile: data };
  } catch (error) {
    console.error('Error getting user profile:', error);
    throw error;
  }
};

// ==========================================
// REAL-TIME SUBSCRIPTIONS
// ==========================================

// Subscribe to organization changes
export const subscribeToOrganization = (organizationId, callback) => {
  const channel = supabase
    .channel(`organization-${organizationId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: TABLES.ORGANIZATIONS,
        filter: `id=eq.${organizationId}`
      },
      callback
    )
    .subscribe();

  return channel;
};

// Subscribe to employee changes
export const subscribeToEmployees = (organizationId, callback) => {
  const channel = supabase
    .channel(`employees-${organizationId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: TABLES.ORGANIZATION_MEMBERSHIPS,
        filter: `organization_id=eq.${organizationId}`
      },
      callback
    )
    .subscribe();

  return channel;
};

// Subscribe to course progress
export const subscribeToCourseProgress = (userId, callback) => {
  const channel = supabase
    .channel(`progress-${userId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: TABLES.LESSON_PROGRESS,
        filter: `user_id=eq.${userId}`
      },
      callback
    )
    .subscribe();

  return channel;
};

// ==========================================
// FILE UPLOAD HELPERS
// ==========================================

// Upload file to storage
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

// Get public URL for file
export const getFileUrl = (bucket, path) => {
  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(path);
  
  return data.publicUrl;
};

// Delete file from storage
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
// PAGINATION HELPERS
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
// ERROR HANDLING HELPERS
// ==========================================

export const isAuthError = (error) => {
  return error?.message?.includes('JWT') || 
         error?.message?.includes('auth') ||
         error?.code === 'PGRST301';
};

export const isPermissionError = (error) => {
  return error?.code === 'PGRST106' || 
         error?.message?.includes('permission');
};

export const handleSupabaseError = (error, context = '') => {
  console.error(`Supabase error ${context}:`, error);
  
  if (isAuthError(error)) {
    return 'Authentication required. Please log in again.';
  }
  
  if (isPermissionError(error)) {
    return 'You do not have permission to perform this action.';
  }
  
  if (error?.code === 'PGRST116') {
    return 'No data found.';
  }
  
  if (error?.code === '23505') {
    return 'This record already exists.';
  }
  
  if (error?.code === '23503') {
    return 'Cannot delete this record as it is being used elsewhere.';
  }
  
  return error?.message || 'An unexpected error occurred.';
};

// ==========================================
// VALIDATION HELPERS
// ==========================================

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
// AUTH HELPERS
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

// ==========================================
// DATABASE FUNCTIONS
// ==========================================

// Call a database function
export const callFunction = async (functionName, args = {}) => {
  try {
    const { data, error } = await supabase.rpc(functionName, args);
    if (error) throw error;
    return data;
  } catch (error) {
    console.error(`Error calling function ${functionName}:`, error);
    throw error;
  }
};

// Check if organization can add more employees
export const canAddEmployee = async (organizationId) => {
  return callFunction('can_add_employee', { org_id: organizationId });
};

// Export default client
export default supabase;