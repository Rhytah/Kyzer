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
        .from('course_enrollments')
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
        .eq('user_id', user.id);

      if (enrollmentsError) throw enrollmentsError;

      setEnrollments(enrollmentsData || []);
      console.log("enrollmentsData", enrollmentsData);
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
        .from('course_enrollments')
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
        .from('course_enrollments')
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
        .from('course_enrollments')
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
  console.log(stats);
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