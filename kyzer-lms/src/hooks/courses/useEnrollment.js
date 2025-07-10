// src/hooks/courses/useEnrollment.js
import { useState, useEffect } from "react";
import { db } from "@/lib/supabase";
import { useAuth } from "@/hooks/auth/useAuth";
import toast from "react-hot-toast";

export function useEnrollment() {
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user?.id) {
      loadUserEnrollments();
    }
  }, [user?.id]);

  const loadUserEnrollments = async () => {
    try {
      setLoading(true);
      setError(null);

      // Mock enrollment data - replace with actual Supabase call
      const mockEnrollments = [
        {
          id: "enrollment-1",
          user_id: user.id,
          course_id: "react-intro",
          progress: 65,
          enrolled_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          last_accessed: new Date(Date.now() - 2 * 60 * 60 * 1000),
          completed_at: null,
          courses: {
            id: "react-intro",
            title: "Introduction to React",
            description:
              "Learn the fundamentals of React including components, props, state, and event handling.",
            thumbnail_url: "/course-placeholder.jpg",
            duration: "8 hours",
            difficulty: "beginner",
          },
        },
        {
          id: "enrollment-2",
          user_id: user.id,
          course_id: "js-advanced",
          progress: 30,
          enrolled_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
          last_accessed: new Date(Date.now() - 24 * 60 * 60 * 1000),
          completed_at: null,
          courses: {
            id: "js-advanced",
            title: "Advanced JavaScript Concepts",
            description:
              "Master advanced JavaScript topics including closures, prototypes, async/await, and ES6+ features.",
            thumbnail_url: "/course-placeholder.jpg",
            duration: "12 hours",
            difficulty: "advanced",
          },
        },
        {
          id: "enrollment-3",
          user_id: user.id,
          course_id: "css-grid-flexbox",
          progress: 100,
          enrolled_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          last_accessed: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          completed_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          courses: {
            id: "css-grid-flexbox",
            title: "CSS Grid and Flexbox Mastery",
            description:
              "Create beautiful, responsive layouts with CSS Grid and Flexbox.",
            thumbnail_url: "/course-placeholder.jpg",
            duration: "6 hours",
            difficulty: "intermediate",
          },
        },
      ];

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 200));

      setEnrollments(mockEnrollments);
    } catch (err) {
      console.error("Error loading enrollments:", err);
      setError("Failed to load enrolled courses");
      toast.error("Failed to load enrolled courses");
    } finally {
      setLoading(false);
    }
  };

  const enrollInCourse = async (courseId) => {
    try {
      if (!user?.id) {
        toast.error("Please login to enroll in courses");
        return { error: "Not authenticated" };
      }

      // Check if already enrolled
      const existingEnrollment = enrollments.find(
        (e) => e.course_id === courseId,
      );
      if (existingEnrollment) {
        toast.error("You are already enrolled in this course");
        return { error: "Already enrolled" };
      }

      const enrollmentData = {
        user_id: user.id,
        course_id: courseId,
        enrolled_at: new Date().toISOString(),
        progress: 0,
      };

      // Mock enrollment creation - replace with actual Supabase call
      const newEnrollment = {
        id: `enrollment-${Date.now()}`,
        ...enrollmentData,
        courses: {
          id: courseId,
          title: "New Course", // This would come from the course data
          description: "Course description...",
          thumbnail_url: "/course-placeholder.jpg",
          duration: "8 hours",
          difficulty: "beginner",
        },
      };

      setEnrollments((prev) => [newEnrollment, ...prev]);
      toast.success("Successfully enrolled in course!");

      return { data: newEnrollment };
    } catch (err) {
      console.error("Error enrolling in course:", err);
      toast.error("Failed to enroll in course");
      return { error: err.message };
    }
  };

  const updateProgress = async (courseId, progress) => {
    try {
      const enrollmentIndex = enrollments.findIndex(
        (e) => e.course_id === courseId,
      );
      if (enrollmentIndex === -1) {
        return { error: "Enrollment not found" };
      }

      // Update progress locally
      const updatedEnrollments = [...enrollments];
      updatedEnrollments[enrollmentIndex] = {
        ...updatedEnrollments[enrollmentIndex],
        progress: Math.min(Math.max(progress, 0), 100),
        last_accessed: new Date().toISOString(),
        ...(progress >= 100 &&
          !updatedEnrollments[enrollmentIndex].completed_at && {
            completed_at: new Date().toISOString(),
          }),
      };

      setEnrollments(updatedEnrollments);

      // If course completed, show celebration
      if (progress >= 100 && !enrollments[enrollmentIndex].completed_at) {
        toast.success("🎉 Congratulations! Course completed!");
      }

      return { data: updatedEnrollments[enrollmentIndex] };
    } catch (err) {
      console.error("Error updating progress:", err);
      return { error: err.message };
    }
  };

  const getEnrollmentByCourse = (courseId) => {
    return enrollments.find((e) => e.course_id === courseId);
  };

  const isEnrolledInCourse = (courseId) => {
    return enrollments.some((e) => e.course_id === courseId);
  };

  const getStats = async (userId) => {
    try {
      // Calculate user statistics
      const enrolledCourses = enrollments.length;
      const completedCourses = enrollments.filter((e) => e.completed_at).length;
      const inProgressCourses = enrollments.filter(
        (e) => e.progress > 0 && !e.completed_at,
      ).length;

      // Mock learning hours calculation
      const learningHours = completedCourses * 8 + inProgressCourses * 4;

      // Mock certificates (equal to completed courses for now)
      const certificates = completedCourses;

      // Mock progress data for chart
      const progressData = {
        labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        learningHours: [2, 1.5, 3, 0, 2.5, 4, 1],
        coursesCompleted: [0, 0, 1, 0, 0, 1, 0],
        totalHours: 14,
        avgDaily: 2,
        trend: "+12%",
      };

      return {
        enrolledCourses,
        completedCourses,
        inProgressCourses,
        learningHours,
        certificates,
        progressData,
        courseTrend: { direction: "up", value: "+2 this week" },
        completionTrend: { direction: "up", value: "+1 this week" },
        hoursTrend: { direction: "up", value: "+3h this week" },
        certificateTrend: { direction: "up", value: "+1 this week" },
        hasCompletedCourse: completedCourses > 0,
        upcomingDeadlines: [], // Mock empty for now
        recentAchievements:
          completedCourses > 0
            ? [
                {
                  title: "Course Completed",
                  date: "Yesterday",
                },
              ]
            : [],
      };
    } catch (err) {
      console.error("Error getting stats:", err);
      return null;
    }
  };

  const getRecentActivity = async (userId, limit = 5) => {
    try {
      // Generate recent activity from enrollments
      const activities = [];

      enrollments.forEach((enrollment) => {
        if (enrollment.completed_at) {
          activities.push({
            type: "course_completed",
            title: `Completed "${enrollment.courses.title}"`,
            timestamp: new Date(enrollment.completed_at),
            metadata: { courseId: enrollment.course_id },
          });
        }

        if (enrollment.progress > 0 && !enrollment.completed_at) {
          activities.push({
            type: "course_progress",
            title: `Progress in "${enrollment.courses.title}"`,
            timestamp: new Date(enrollment.last_accessed),
            metadata: {
              courseId: enrollment.course_id,
              progress: enrollment.progress,
            },
          });
        }
      });

      return activities
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, limit);
    } catch (err) {
      console.error("Error getting recent activity:", err);
      return [];
    }
  };

  return {
    // State
    enrollments,
    loading,
    error,

    // Actions
    enrollInCourse,
    updateProgress,
    loadUserEnrollments,

    // Queries
    getEnrollmentByCourse,
    isEnrolledInCourse,
    getStats,
    getRecentActivity,

    // Computed values
    enrolledCoursesCount: enrollments.length,
    completedCoursesCount: enrollments.filter((e) => e.completed_at).length,
    inProgressCoursesCount: enrollments.filter(
      (e) => e.progress > 0 && !e.completed_at,
    ).length,

    // Get courses by status
    getInProgressCourses: () =>
      enrollments.filter((e) => e.progress > 0 && !e.completed_at),
    getCompletedCourses: () => enrollments.filter((e) => e.completed_at),
    getRecentlyAccessedCourses: () =>
      enrollments
        .sort((a, b) => new Date(b.last_accessed) - new Date(a.last_accessed))
        .slice(0, 3),
  };
}
