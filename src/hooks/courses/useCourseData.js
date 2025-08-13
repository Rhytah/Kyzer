// src/hooks/courses/useCourseData.js
import { useState, useEffect, useCallback } from 'react';
import { useCourseStore } from '@/store/courseStore';
import { useAuth } from '@/hooks/auth/useAuth';

/**
 * Custom hook that ensures proper subscription to course store
 * and handles data fetching with better error handling
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
  
  // Local state for additional tracking
  const [isInitialized, setIsInitialized] = useState(false);
  const [lastFetchTime, setLastFetchTime] = useState(null);
  
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

  // Refresh function with caching
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
      return { success: false, error: error.message };
    }
  }, [user?.id, fetchEnrolledCourses, fetchCertificates, lastFetchTime]);

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
    error,
    isInitialized,
    lastFetchTime,
    
    // Actions
    refresh,
    
    // Computed values for convenience
    hasData: (enrolledCourses?.length || 0) > 0 || (certificates?.length || 0) > 0,
    isEmpty: !enrolledCourses?.length && !certificates?.length,
    isLoading: loading?.enrollments || loading?.courses || !isInitialized,
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