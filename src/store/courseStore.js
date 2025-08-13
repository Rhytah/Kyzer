// src/store/courseStore.js
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { supabase, TABLES } from '@/lib/supabase';

const useCourseStore = create(
  subscribeWithSelector((set, get) => ({
    // State
    courses: [],
    enrolledCourses: [],
    currentCourse: null,
    currentLesson: null,
    courseProgress: {},
    quizAttempts: {},
    certificates: [],
    loading: {
      courses: false,
      enrollments: false,
      progress: false,
      quiz: false,
    },
    error: null,

    // Actions
    actions: {
      // Fetch all courses
      fetchCourses: async (filters = {}) => {
        set((state) => ({
          loading: { ...state.loading, courses: true },
          error: null,
        }));

        try {
          let query = supabase
            .from(TABLES.COURSES)
            .select(`
              *,
              lessons:${TABLES.LESSONS}(id, title, order_index),
              enrollments:${TABLES.COURSE_ENROLLMENTS}(id, user_id)
            `)
            .eq('is_published', true)
            .order('created_at', { ascending: false });

          // Apply filters
          if (filters.category) {
            query = query.eq('category', filters.category);
          }
          if (filters.difficulty) {
            query = query.eq('difficulty_level', filters.difficulty);
          }
          if (filters.search) {
            query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
          }

          const { data, error } = await query;
          if (error) throw error;

          set((state) => ({
            courses: data || [],
            loading: { ...state.loading, courses: false },
          }));

          return { data, error: null };
        } catch (error) {
          set((state) => ({
            error: error.message,
            loading: { ...state.loading, courses: false },
          }));
          return { data: null, error };
        }
      },

      // Fetch user's enrolled courses - SIMPLIFIED VERSION
      fetchEnrolledCourses: async (userId) => {
        set((state) => ({
          loading: { ...state.loading, enrollments: true },
          error: null,
        }));

        try {
          // Use a single query with join to get both enrollment and course data
          const { data: enrolledCoursesData, error } = await supabase
            .from(TABLES.COURSE_ENROLLMENTS)
            .select(`
              id,
              enrolled_at,
              completed_at,
              progress_percentage,
              status,
              last_accessed,
              course:${TABLES.COURSES} (
                id,
                title,
                description,
                thumbnail_url,
                duration_minutes,
                difficulty_level,
                category_id,
                is_published,
                created_at
              )
            `)
            .eq('user_id', userId)
            .order('enrolled_at', { ascending: false });

          if (error) throw error;

          if (!enrolledCoursesData || enrolledCoursesData.length === 0) {
            set((state) => ({
              enrolledCourses: [],
              loading: { ...state.loading, enrollments: false },
            }));
            return { data: [], error: null };
          }

          // Transform the data to match expected format
          const enrolledCourses = enrolledCoursesData
            .filter(enrollment => enrollment.course) // Filter out enrollments with null courses
            .map(enrollment => ({
              // Course data
              ...enrollment.course,
              // Enrollment data
              enrollment_id: enrollment.id,
              enrolled_at: enrollment.enrolled_at,
              completed_at: enrollment.completed_at,
              progress_percentage: enrollment.progress_percentage || 0,
              status: enrollment.status || 'active',
              last_accessed: enrollment.last_accessed,
            }));

          set((state) => ({
            enrolledCourses,
            loading: { ...state.loading, enrollments: false },
          }));

          return { data: enrolledCourses, error: null };
        } catch (error) {
          set((state) => ({
            error: error.message,
            enrolledCourses: [], // Ensure we set empty array on error
            loading: { ...state.loading, enrollments: false },
          }));
          return { data: [], error };
        }
      },

      // Enroll in a course
      enrollInCourse: async (userId, courseId) => {
        try {
          // Check if already enrolled
          const { data: existingEnrollment } = await supabase
            .from(TABLES.COURSE_ENROLLMENTS)
            .select('id')
            .eq('course_id', courseId)
            .eq('user_id', userId)
            .single();

          if (existingEnrollment) {
            return { data: existingEnrollment, error: null };
          }

          // Create new enrollment
          const { data, error } = await supabase
            .from(TABLES.COURSE_ENROLLMENTS)
            .insert({
              course_id: courseId,
              user_id: userId,
              enrolled_at: new Date().toISOString(),
              status: 'pending',
              progress_percentage: 0,
              last_accessed: new Date().toISOString(),
            })
            .select()
            .single();

          if (error) throw error;

          // Note: Don't refresh here to avoid circular dependency
          // The component will refresh when needed

          return { data, error: null };
        } catch (error) {
          return { data: null, error };
        }
      },

      // Update lesson progress
      updateLessonProgress: async (userId, lessonId, courseId, completed = true, metadata = {}) => {
        try {
          const { data, error } = await supabase
            .from(TABLES.LESSON_PROGRESS)
            .upsert({
              user_id: userId,
              lesson_id: lessonId,
              course_id: courseId,
              completed,
              completed_at: completed ? new Date().toISOString() : null,
              metadata: metadata,
            })
            .select()
            .single();

          if (error) throw error;

          // Update local progress state
          set((state) => ({
            courseProgress: {
              ...state.courseProgress,
              [courseId]: {
                ...state.courseProgress[courseId],
                [lessonId]: { 
                  completed, 
                  completed_at: data.completed_at,
                  metadata: metadata,
                },
              },
            },
          }));

          // Calculate and update overall course progress
          await get().actions.calculateCourseProgress(userId, courseId);

          return { data, error: null };
        } catch (error) {
          return { data: null, error };
        }
      },

      // Calculate course progress percentage
      calculateCourseProgress: async (userId, courseId) => {
        try {
          // Get total lessons in course
          const { data: lessons, error: lessonsError } = await supabase
            .from(TABLES.LESSONS)
            .select('id')
            .eq('course_id', courseId);

          if (lessonsError) throw lessonsError;

          // Get completed lessons
          const { data: completedProgress, error: progressError } = await supabase
            .from(TABLES.LESSON_PROGRESS)
            .select('lesson_id')
            .eq('user_id', userId)
            .eq('course_id', courseId)
            .eq('completed', true);

          if (progressError) throw progressError;

          const totalLessons = lessons?.length || 0;
          const completedLessons = completedProgress?.length || 0;
          const progressPercentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

          // Update enrollment record
          const { error: updateError } = await supabase
            .from(TABLES.COURSE_ENROLLMENTS)
            .update({
              progress_percentage: progressPercentage,
              completed_at: progressPercentage === 100 ? new Date().toISOString() : null,
              last_accessed: new Date().toISOString(),
            })
            .eq('user_id', userId)
            .eq('course_id', courseId);

          if (updateError) throw updateError;

          // Update local state
          set((state) => ({
            enrolledCourses: state.enrolledCourses.map(course =>
              course.id === courseId
                ? { ...course, progress_percentage: progressPercentage }
                : course
            ),
          }));

          return progressPercentage;
        } catch (error) {
          return 0;
        }
      },

      // Fetch course progress for a user
      fetchCourseProgress: async (userId, courseId) => {
        set((state) => ({
          loading: { ...state.loading, progress: true },
          error: null,
        }));

        try {
          const { data, error } = await supabase
            .from(TABLES.LESSON_PROGRESS)
            .select('*')
            .eq('user_id', userId)
            .eq('course_id', courseId);

          if (error) throw error;

          const progressMap = {};
          data?.forEach(progress => {
            progressMap[progress.lesson_id] = {
              completed: progress.completed,
              completed_at: progress.completed_at,
              metadata: progress.metadata,
            };
          });

          set((state) => ({
            courseProgress: {
              ...state.courseProgress,
              [courseId]: progressMap,
            },
            loading: { ...state.loading, progress: false },
          }));

          return { data: progressMap, error: null };
        } catch (error) {
          set((state) => ({
            error: error.message,
            loading: { ...state.loading, progress: false },
          }));
          return { data: null, error };
        }
      },

      // Submit quiz attempt
      submitQuizAttempt: async (userId, quizId, answers, score) => {
        set((state) => ({
          loading: { ...state.loading, quiz: true },
          error: null,
        }));

        try {
          const { data, error } = await supabase
            .from(TABLES.QUIZ_ATTEMPTS)
            .insert({
              user_id: userId,
              quiz_id: quizId,
              answers,
              score,
              completed_at: new Date().toISOString(),
            })
            .select()
            .single();

          if (error) throw error;

          // Update local quiz attempts
          set((state) => ({
            quizAttempts: {
              ...state.quizAttempts,
              [quizId]: [...(state.quizAttempts[quizId] || []), data],
            },
            loading: { ...state.loading, quiz: false },
          }));

          return { data, error: null };
        } catch (error) {
          set((state) => ({
            error: error.message,
            loading: { ...state.loading, quiz: false },
          }));
          return { data: null, error };
        }
      },

      // Fetch user certificates
      fetchCertificates: async (userId) => {
        try {
          const { data, error } = await supabase
            .from(TABLES.CERTIFICATES)
            .select(`
              *,
              course:${TABLES.COURSES}(id, title, description)
            `)
            .eq('user_id', userId)
            .order('issued_at', { ascending: false });

          if (error) throw error;

          set({ certificates: data || [] });
          return { data: data || [], error: null };
        } catch (error) {
          set({ certificates: [] });
          return { data: [], error };
        }
      },

      // Set current course
      setCurrentCourse: (course) => {
        set({ currentCourse: course });
      },

      // Set current lesson
      setCurrentLesson: (lesson) => {
        set({ currentLesson: lesson });
      },

      // Clear course data
      clearCourseData: () => {
        set({
          courses: [],
          enrolledCourses: [],
          currentCourse: null,
          currentLesson: null,
          courseProgress: {},
          quizAttempts: {},
          certificates: [],
          error: null,
        });
      },

      // Corporate: Assign course to employees
      assignCourseToEmployees: async (courseId, employeeIds, assignedBy) => {
        try {
          const assignments = employeeIds.map(employeeId => ({
            course_id: courseId,
            user_id: employeeId,
            assigned_by: assignedBy,
            enrolled_at: new Date().toISOString(),
            status: 'assigned',
            progress_percentage: 0,
          }));

          const { data, error } = await supabase
            .from(TABLES.COURSE_ENROLLMENTS)
            .upsert(assignments, { onConflict: 'course_id,user_id' })
            .select();

          if (error) throw error;

          return { data, error: null };
        } catch (error) {
          return { data: null, error };
        }
      },

      // Corporate: Get team progress
      fetchTeamProgress: async (organizationId) => {
        try {
          const { data, error } = await supabase
            .from(TABLES.COURSE_ENROLLMENTS)
            .select(`
              *,
              user:profiles(id, full_name, email),
              course:${TABLES.COURSES}(id, title, category)
            `)
            .eq('organization_id', organizationId)
            .order('enrolled_at', { ascending: false });

          if (error) throw error;

          return { data, error: null };
        } catch (error) {
          return { data: null, error };
        }
      },
    },

    // Computed values (using getters)
    get isLoading() {
      const { loading } = get();
      return Object.values(loading).some(Boolean);
    },

    get completedCourses() {
      return get().enrolledCourses.filter(course => course.progress_percentage === 100);
    },

    get inProgressCourses() {
      return get().enrolledCourses.filter(course => 
        course.progress_percentage > 0 && course.progress_percentage < 100
      );
    },

    get notStartedCourses() {
      return get().enrolledCourses.filter(course => course.progress_percentage === 0);
    },
  }))
);

export { useCourseStore };