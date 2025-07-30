// src/lib/errorHandler.js - Comprehensive Supabase error handler

export class SupabaseError extends Error {
  constructor(error, context = '') {
    super(error.message);
    this.name = 'SupabaseError';
    this.code = error.code;
    this.details = error.details;
    this.hint = error.hint;
    this.context = context;
  }
}

// Main error handler function
export const handleSupabaseError = (error, context = '') => {
  if (!error) return null;

  console.error(`Supabase Error in ${context}:`, error);

  // Handle PGRST116 - "JSON object requested, multiple (or no) rows returned"
  if (error.code === 'PGRST116') {
    return {
      type: 'NOT_FOUND',
      message: getNotFoundMessage(context),
      originalError: error,
      code: 'PGRST116'
    };
  }

  // Handle other common Supabase errors
  switch (error.code) {
    case 'PGRST301':
      return {
        type: 'PERMISSION_DENIED',
        message: 'You do not have permission to perform this action.',
        originalError: error
      };

    case '23505': // Unique constraint violation
      return {
        type: 'DUPLICATE_ERROR',
        message: getDuplicateErrorMessage(error.details || error.message),
        originalError: error
      };

    case '23503': // Foreign key constraint violation
      return {
        type: 'REFERENCE_ERROR',
        message: 'Cannot perform this action due to related data constraints.',
        originalError: error
      };

    case '42501': // Insufficient privilege
      return {
        type: 'PERMISSION_DENIED',
        message: 'Insufficient permissions to access this resource.',
        originalError: error
      };

    case 'PGRST204': // No rows returned
      return {
        type: 'NOT_FOUND',
        message: getNotFoundMessage(context),
        originalError: error
      };

    default:
      return {
        type: 'UNKNOWN_ERROR',
        message: error.message || 'An unexpected error occurred.',
        originalError: error
      };
  }
};

// Generate context-specific not found messages
const getNotFoundMessage = (context) => {
  const contextMessages = {
    'user_profile': 'User profile not found. Please complete your profile setup.',
    'organization': 'Organization not found. Please check if you have access.',
    'course': 'Course not found or you do not have access to view it.',
    'enrollment': 'Enrollment record not found.',
    'quiz': 'Quiz not found or is not available.',
    'certificate': 'Certificate not found or has not been generated yet.',
    'lesson': 'Lesson not found or is not available.',
    'default': 'The requested resource was not found.'
  };

  return contextMessages[context] || contextMessages.default;
};

// Generate duplicate error messages
const getDuplicateErrorMessage = (details) => {
  if (details?.includes('email')) {
    return 'An account with this email address already exists.';
  }
  if (details?.includes('slug')) {
    return 'This name is already taken. Please choose a different one.';
  }
  return 'This record already exists. Please check your input.';
};

// Safe query wrapper that handles .single() errors
export const safeQuery = async (queryPromise, context = '', options = {}) => {
  const { 
    throwOnNotFound = false, 
    returnNull = true,
    defaultValue = null 
  } = options;

  try {
    const { data, error } = await queryPromise;

    if (error) {
      const handledError = handleSupabaseError(error, context);
      
      // For PGRST116 (not found), decide whether to throw or return null
      if (error.code === 'PGRST116') {
        if (throwOnNotFound) {
          throw new SupabaseError(error, context);
        }
        return { data: returnNull ? null : defaultValue, error: handledError };
      }

      // For other errors, always return the error
      return { data: null, error: handledError };
    }

    return { data, error: null };
  } catch (err) {
    // Handle any other errors (network, etc.)
    return {
      data: null,
      error: {
        type: 'NETWORK_ERROR',
        message: 'Failed to connect to the database. Please try again.',
        originalError: err
      }
    };
  }
};

// Specific helper for profile queries
export const getUserProfile = async (userId, supabase) => {
  return safeQuery(
    supabase
      .from('profiles')
      .select('*')
      .eq('auth_user_id', userId)
      .single(),
    'user_profile',
    { throwOnNotFound: false }
  );
};

// Specific helper for organization queries
export const getUserOrganization = async (userId, supabase) => {
  return safeQuery(
    supabase
      .from('profiles')
      .select(`
        *,
        organization:organization_id (
          id,
          name,
          slug,
          subscription_status,
          max_employees
        )
      `)
      .eq('auth_user_id', userId)
      .single(),
    'organization',
    { throwOnNotFound: false }
  );
};

// React hook for handling Supabase errors with toast notifications
export const useSupabaseError = () => {
  const showError = (error, context = '') => {
    const handledError = handleSupabaseError(error, context);
    
    // You can customize this based on your toast library
    if (typeof toast !== 'undefined') {
      toast.error(handledError.message);
    } else {
      console.error('Error:', handledError.message);
    }
    
    return handledError;
  };

  const handleAsyncError = async (asyncOperation, context = '') => {
    try {
      const result = await asyncOperation();
      return { data: result, error: null };
    } catch (error) {
      const handledError = showError(error, context);
      return { data: null, error: handledError };
    }
  };

  return { showError, handleAsyncError };
};