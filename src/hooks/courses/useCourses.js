import { useState, useEffect } from 'react';
import { useCourseStore } from '@/store/courseStore';
import { useAuth } from '@/hooks/auth/useAuth';

/**
 * Hook to fetch and manage courses from the database
 * Replaces mock data with real Supabase queries via courseStore
 */
export const useCourses = (filters = {}) => {
  const { user } = useAuth();
  const courses = useCourseStore(state => state.courses);
  const loading = useCourseStore(state => state.loading);
  const error = useCourseStore(state => state.error);
  const fetchCourses = useCourseStore(state => state.actions.fetchCourses);
  const fetchEnrolledCourses = useCourseStore(state => state.actions.fetchEnrolledCourses);

  const [localLoading, setLocalLoading] = useState(true);

  useEffect(() => {
    const loadCourses = async () => {
      try {
        setLocalLoading(true);

        // Fetch courses based on filters
        if (filters.enrolled && user?.id) {
          // Fetch only enrolled courses for this user
          await fetchEnrolledCourses(user.id);
        } else {
          // Fetch all published courses (or filtered)
          await fetchCourses(filters, user?.id);
        }
      } catch (err) {
        console.error('Error loading courses:', err);
      } finally {
        setLocalLoading(false);
      }
    };

    loadCourses();
  }, [filters.enrolled, filters.category, filters.search, user?.id, fetchCourses, fetchEnrolledCourses]);

  return {
    courses,
    loading: loading || localLoading,
    error
  };
};
