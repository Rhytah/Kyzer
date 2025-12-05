// src/hooks/courses/useRecentActivity.js
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/auth/useAuth';

export const useRecentActivity = () => {
  const { user } = useAuth();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const formatTimeAgo = (dateString) => {
    if (!dateString) return 'Recently';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    return date.toLocaleDateString();
  };

  useEffect(() => {
    const fetchRecentActivity = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Fetch recent enrollments
        const { data: enrollments, error: enrollmentsError } = await supabase
          .from('course_enrollments')
          .select(`
            id,
            enrolled_at,
            completed_at,
            progress_percentage,
            course:courses (
              id,
              title
            )
          `)
          .eq('user_id', user.id)
          .order('enrolled_at', { ascending: false })
          .limit(10);

        if (enrollmentsError) throw enrollmentsError;

        // Fetch recent lesson completions (if lesson_progress table exists)
        let lessonCompletions = [];
        try {
          const { data: lessons, error: lessonsError } = await supabase
            .from('lesson_progress')
            .select(`
              id,
              completed_at,
              lesson:lessons (
                id,
                title,
                course_id
              ),
              course:courses (
                id,
                title
              )
            `)
            .eq('user_id', user.id)
            .eq('completed', true)
            .not('completed_at', 'is', null)
            .order('completed_at', { ascending: false })
            .limit(10);

          if (!lessonsError && lessons) {
            lessonCompletions = lessons;
          }
        } catch (err) {
          // Table might not exist, skip lesson completions
        }

        // Fetch recent certificates (if certificates table exists)
        let certificates = [];
        try {
          const { data: certs, error: certsError } = await supabase
            .from('certificates')
            .select(`
              id,
              issued_at,
              course:courses (
                id,
                title
              )
            `)
            .eq('user_id', user.id)
            .order('issued_at', { ascending: false })
            .limit(10);

          if (!certsError && certs) {
            certificates = certs;
          }
        } catch (err) {
          // Table might not exist, skip certificates
        }

        // Transform all data into activity items
        const activityItems = [];

        // Add enrollments as "course_started"
        enrollments?.forEach(enrollment => {
          if (enrollment.course) {
            activityItems.push({
              id: `enrollment-${enrollment.id}`,
              type: 'course_started',
              description: `Started course: ${enrollment.course.title}`,
              timeAgo: formatTimeAgo(enrollment.enrolled_at),
              timestamp: enrollment.enrolled_at,
              course: enrollment.course
            });
          }
        });

        // Add course completions
        enrollments?.forEach(enrollment => {
          if (enrollment.completed_at && enrollment.course) {
            activityItems.push({
              id: `completion-${enrollment.id}`,
              type: 'course_completed',
              description: `Completed course: ${enrollment.course.title}`,
              timeAgo: formatTimeAgo(enrollment.completed_at),
              timestamp: enrollment.completed_at,
              course: enrollment.course
            });
          }
        });

        // Add lesson completions
        lessonCompletions?.forEach(lesson => {
          if (lesson.lesson && lesson.course) {
            activityItems.push({
              id: `lesson-${lesson.id}`,
              type: 'lesson_completed',
              description: `Completed lesson: ${lesson.lesson.title}`,
              timeAgo: formatTimeAgo(lesson.completed_at),
              timestamp: lesson.completed_at,
              course: lesson.course
            });
          }
        });

        // Add certificates
        certificates?.forEach(cert => {
          if (cert.course) {
            activityItems.push({
              id: `cert-${cert.id}`,
              type: 'certificate_earned',
              description: `Earned certificate for: ${cert.course.title}`,
              timeAgo: formatTimeAgo(cert.issued_at),
              timestamp: cert.issued_at,
              course: cert.course
            });
          }
        });

        // Sort by timestamp (most recent first)
        activityItems.sort((a, b) => {
          const timeA = new Date(a.timestamp).getTime();
          const timeB = new Date(b.timestamp).getTime();
          return timeB - timeA;
        });

        // Don't limit - return all activities for the Activity page
        setActivities(activityItems);

      } catch (err) {
        setError(err.message);
        setActivities([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentActivity();
  }, [user?.id]);

  return {
    activities,
    loading,
    error
  };
};

