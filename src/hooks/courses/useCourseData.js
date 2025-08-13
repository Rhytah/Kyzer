// src/hooks/courses/useCourseData.js
import { useState, useEffect, useCallback } from 'react';
import { useCourseStore } from '@/store/courseStore';
import { useAuth } from '@/hooks/auth/useAuth';

/**
 * Enhanced custom hook that provides comprehensive course data management
 * with proper error handling and caching
 */
export function useCourseData() {
  const { user } = useAuth();
  
  // Subscribe to store state with individual selectors for better reactivity
  const enrolledCourses = useCourseStore(state => state.enrolledCourses);
  const certificates = useCourseStore(state => state.certificates);
  const loading = useCourseStore(state => state.loading);
  const error = useCourseStore(state => state.error);
  
  // Get store actions
  const fetchEnrolledCourses = useCourseStore(state => state.actions.fetchEnrolledCourses);
  const fetchCertificates = useCourseStore(state => state.actions.fetchCertificates);
  const fetchCourses = useCourseStore(state => state.actions.fetchCourses);
  const enrollInCourse = useCourseStore(state => state.actions.enrollInCourse);
  const updateLessonProgress = useCourseStore(state => state.actions.updateLessonProgress);
  const calculateCourseProgress = useCourseStore(state => state.actions.calculateCourseProgress);
  
  // Local state for additional tracking
  const [isInitialized, setIsInitialized] = useState(false);
  const [lastFetchTime, setLastFetchTime] = useState(null);
  const [localError, setLocalError] = useState(null);
  
  // Computed values
  const stats = useCourseStore(state => {
    const courses = state.enrolledCourses || [];
    const certs = state.certificates || [];
    
    const completed = courses.filter(course => course.progress_percentage === 100);
    const inProgress = courses.filter(course => 
      course.progress_percentage > 0 && course.progress_percentage < 100
    );
    const notStarted = courses.filter(course => course.progress_percentage === 0);
    
    const totalHours = courses.reduce((sum, course) => {
      return sum + (course.duration || 0);
    }, 0) / 60;
    
    return {
      totalCourses: courses.length,
      completedCourses: completed.length,
      inProgressCourses: inProgress.length,
      notStartedCourses: notStarted.length,
      totalHours: Math.round(totalHours),
      certificates: certs.length,
      completionRate: courses.length > 0 ? Math.round((completed.length / courses.length) * 100) : 0
    };
  });

  // Enhanced refresh function with better error handling
  const refresh = useCallback(async (force = false) => {
    if (!user?.id) {
      return { success: false, error: 'No user ID' };
    }

    // Check if we should skip refresh (unless forced)
    const now = Date.now();
    const fiveMinutesAgo = now - (5 * 60 * 1000);
    
    if (!force && lastFetchTime && lastFetchTime > fiveMinutesAgo) {
      return { success: true, error: null };
    }

    try {
      setLocalError(null);
      
      const [enrollmentsResult, certificatesResult] = await Promise.all([
        fetchEnrolledCourses(user.id),
        fetchCertificates(user.id)
      ]);
      
      setLastFetchTime(now);
      setIsInitialized(true);
      
      return { 
        success: true, 
        error: null,
        data: {
          enrollments: enrollmentsResult?.data || [],
          certificates: certificatesResult?.data || []
        }
      };
    } catch (error) {
      const errorMessage = error.message || 'Failed to refresh course data';
      setLocalError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, [user?.id, fetchEnrolledCourses, fetchCertificates, lastFetchTime]);

  // Enhanced enrollment function
  const enroll = useCallback(async (courseId) => {
    if (!user?.id) {
      return { success: false, error: 'No user ID' };
    }

    try {
      setLocalError(null);
      const result = await enrollInCourse(user.id, courseId);
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      // Refresh data to show new enrollment
      await refresh(true);
      
      return { success: true, error: null, data: result.data };
    } catch (error) {
      const errorMessage = error.message || 'Failed to enroll in course';
      setLocalError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, [user?.id, enrollInCourse, refresh]);

  // Enhanced progress update function
  const updateProgress = useCallback(async (lessonId, courseId, completed = true, metadata = {}) => {
    if (!user?.id) {
      return { success: false, error: 'No user ID' };
    }

    try {
      setLocalError(null);
      const result = await updateLessonProgress(user.id, lessonId, courseId, completed, metadata);
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      // Refresh data to show updated progress
      await refresh(true);
      
      return { success: true, error: null, data: result.data };
    } catch (error) {
      const errorMessage = error.message || 'Failed to update progress';
      setLocalError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, [user?.id, updateLessonProgress, refresh]);

  // Fetch all available courses (for catalog)
  const fetchAllCourses = useCallback(async (filters = {}) => {
    try {
      setLocalError(null);
      const result = await fetchCourses(filters);
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      return { success: true, error: null, data: result.data };
    } catch (error) {
      const errorMessage = error.message || 'Failed to fetch courses';
      setLocalError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, [fetchCourses]);

  // Initial data load
  useEffect(() => {
    if (user?.id && !isInitialized) {
      refresh();
    }
  }, [user?.id, isInitialized, refresh]);

  return {
    // Data
    enrolledCourses: enrolledCourses || [],
    certificates: certificates || [],
    stats,
    
    // State
    loading,
    error: error || localError,
    isInitialized,
    lastFetchTime,
    
    // Actions
    refresh,
    enroll,
    updateProgress,
    fetchAllCourses,
    
    // Computed values for convenience
    hasData: (enrolledCourses?.length || 0) > 0 || (certificates?.length || 0) > 0,
    isEmpty: !enrolledCourses?.length && !certificates?.length,
    isLoading: loading?.enrollments || loading?.courses || !isInitialized,
    
    // Helper functions
    getCourseById: (courseId) => enrolledCourses?.find(course => course.id === courseId),
    isEnrolledInCourse: (courseId) => enrolledCourses?.some(course => course.id === courseId),
    getCourseProgress: (courseId) => {
      const course = enrolledCourses?.find(c => c.id === courseId);
      return course?.progress_percentage || 0;
    }
  };
}

// Alternative hook for just enrollments if needed
export function useEnrolledCourses() {
  const { user } = useAuth();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const fetchEnrolledCourses = useCourseStore(state => state.actions.fetchEnrolledCourses);
  
  const loadData = useCallback(async () => {
    if (!user?.id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await fetchEnrolledCourses(user.id);
      
      if (result?.error) {
        throw new Error(result.error);
      }
      
      setData(result?.data || []);
    } catch (err) {
      setError(err.message);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [user?.id, fetchEnrolledCourses]);
  
  useEffect(() => {
    loadData();
  }, [loadData]);
  
  return {
    enrolledCourses: data,
    loading,
    error,
    reload: loadData
  };
}