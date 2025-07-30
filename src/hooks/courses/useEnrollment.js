// import { useState } from 'react';
// import toast from 'react-hot-toast';

// export const useEnrollment = () => {
//   const [enrollingCourses, setEnrollingCourses] = useState(new Set());
//   const [enrollments, setEnrollments] = useState([]);
//   const [loading, setLoading] = useState(false);
//  const enrollInCourse = async (courseId) => {
//     try {
//       setEnrollingCourses(prev => new Set([...prev, courseId]));
//       await new Promise(resolve => setTimeout(resolve, 1000));
//       toast.success('Successfully enrolled!');
//       return { success: true };
//     } catch (error) {
//       toast.error('Failed to enroll');
//       return { success: false };
//     } finally {
//       setEnrollingCourses(prev => {
//         const newSet = new Set(prev);
//         newSet.delete(courseId);
//         return newSet;
//       });
//     }
//   };
// const getStats = async (userId) => {
//   try {
//     setLoading(true);
//     const response = await fetch(`/api/users/${userId}/stats`);
    
//     // First check if the response is OK (status 200-299)
//     if (!response.ok) {
//       const errorData = await response.text(); // Get the response as text first
//       throw new Error(`Server error: ${response.status} - ${errorData}`);
//     }

//     // Check content type to ensure it's JSON
//     const contentType = response.headers.get('content-type');
//     if (!contentType || !contentType.includes('application/json')) {
//       const text = await response.text();
//       throw new Error(`Expected JSON but got: ${text.substring(0, 100)}...`);
//     }

//     return await response.json();
//   } catch (error) {
//     console.error('Error fetching stats:', error);
//     throw error; // Re-throw so the caller can handle it
//   } finally {
//     setLoading(false);
//   }
// };

//   const isEnrolling = (courseId) => enrollingCourses.has(courseId);

//   return {   enrollInCourse, 
//     isEnrolling, 
//     getStats,
//     enrollments,
//     loading  };
// };


// src/hooks/courses/useEnrollment.js
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/auth/useAuth';
import toast from 'react-hot-toast';

export const useEnrollment = () => {
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState([]);
  const [stats, setStats] = useState({
    totalEnrolled: 0,
    completed: 0,
    inProgress: 0,
    averageProgress: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch user enrollments and stats
  const loadUserStats = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      setError(null);

      // Fetch enrollments with course details
      const { data: enrollmentsData, error: enrollmentsError } = await supabase
        .from('enrollments')
        .select(`
          *,
          courses (
            id,
            title,
            description,
            difficulty_level,
            thumbnail_url
          )
        `)
        .eq('user_id', user.id)
        .eq('status', 'active');

      if (enrollmentsError) throw enrollmentsError;

      setEnrollments(enrollmentsData || []);

      // Calculate stats
      const totalEnrolled = enrollmentsData?.length || 0;
      const completed = enrollmentsData?.filter(e => e.progress_percentage >= 100).length || 0;
      const inProgress = enrollmentsData?.filter(e => e.progress_percentage > 0 && e.progress_percentage < 100).length || 0;
      
      const totalProgress = enrollmentsData?.reduce((sum, e) => sum + (e.progress_percentage || 0), 0) || 0;
      const averageProgress = totalEnrolled > 0 ? Math.round(totalProgress / totalEnrolled) : 0;

      setStats({
        totalEnrolled,
        completed,
        inProgress,
        averageProgress
      });

    } catch (err) {
      console.error('Error loading user stats:', err);
      setError(err.message);
      toast.error('Failed to load enrollment data');
    } finally {
      setLoading(false);
    }
  };

  // Enroll in a course
  const enrollInCourse = async (courseId) => {
    if (!user?.id) {
      toast.error('Please log in to enroll in courses');
      return false;
    }

    try {
      // Check if already enrolled
      const { data: existing } = await supabase
        .from('enrollments')
        .select('id')
        .eq('user_id', user.id)
        .eq('course_id', courseId)
        .eq('status', 'active')
        .single();

      if (existing) {
        toast.error('Already enrolled in this course');
        return false;
      }

      // Create enrollment
      const { data, error } = await supabase
        .from('enrollments')
        .insert({
          user_id: user.id,
          course_id: courseId,
          enrolled_at: new Date().toISOString(),
          status: 'active',
          progress_percentage: 0
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Successfully enrolled in course!');
      loadUserStats(); // Refresh data
      return true;

    } catch (err) {
      console.error('Error enrolling in course:', err);
      toast.error('Failed to enroll in course');
      return false;
    }
  };

  // Update progress for a course
  const updateProgress = async (courseId, progressPercentage) => {
    if (!user?.id) return false;

    try {
      const { error } = await supabase
        .from('enrollments')
        .update({ 
          progress_percentage: progressPercentage,
          last_accessed: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .eq('course_id', courseId);

      if (error) throw error;

      // Refresh stats if significantly changed
      if (progressPercentage % 10 === 0) {
        loadUserStats();
      }

      return true;

    } catch (err) {
      console.error('Error updating progress:', err);
      return false;
    }
  };

  // Get enrollment for specific course
  const getCourseEnrollment = (courseId) => {
    return enrollments.find(e => e.course_id === courseId);
  };

  // Check if user is enrolled in course
  const isEnrolled = (courseId) => {
    return enrollments.some(e => e.course_id === courseId);
  };

  useEffect(() => {
    loadUserStats();
  }, [user?.id]);

  return {
    enrollments,
    stats,
    loading,
    error,
    enrollInCourse,
    updateProgress,
    getCourseEnrollment,
    isEnrolled,
    refetch: loadUserStats
  };
};