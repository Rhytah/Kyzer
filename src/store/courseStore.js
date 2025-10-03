// src/store/courseStore.js
import { create } from 'zustand';
import { supabase, TABLES, safeQuery, getUserProfile } from '@/lib/supabase';
import { DEFAULT_CERTIFICATE_SVG } from '@/utils/certificateUtils';

const useCourseStore = create((set, get) => ({
  // State
  courses: [],
  enrolledCourses: [],
  currentCourse: null,
  currentLesson: null,
  courseProgress: {},
  quizAttempts: {},
  certificates: [],
  certificateTemplates: [],
  categories: [],
  courseModules: {}, // New: Store modules by course ID
  loading: {
    courses: false,
    enrollments: false,
    progress: false,
    quiz: false,
    quizzes: false,
    quizQuestions: false,
    categories: false,
    modules: false, // New: Loading state for modules
  },
  error: null,

  // Actions
  actions: {
    // Quiz Management: Fetch quizzes for a course
    fetchQuizzes: async (courseId) => {
      set((state) => ({ loading: { ...state.loading, quizzes: true }, error: null }));
      try {
        const { data, error } = await supabase
          .from(TABLES.QUIZZES)
          .select('*')
          .eq('course_id', courseId)
          .order('created_at', { ascending: false });
        if (error) throw error;
        set((state) => ({ loading: { ...state.loading, quizzes: false } }));
        return { data: data || [], error: null };
      } catch (error) {
        set((state) => ({ loading: { ...state.loading, quizzes: false }, error: error.message }));
        return { data: [], error };
      }
    },

    // Quiz Management: Create quiz
    createQuiz: async (quizData, courseId, createdBy) => {
      try {
        // Determine user_id from auth if not provided
        let userId = createdBy;
        if (!userId) {
          const { data: authData } = await supabase.auth.getUser();
          userId = authData?.user?.id || null;
        }
        const { data, error } = await supabase
          .from(TABLES.QUIZZES)
          .insert({
            title: quizData.title,
            description: quizData.description ?? null,
            pass_threshold: quizData.pass_threshold ?? 70,
            time_limit_minutes: quizData.time_limit_minutes ?? null,
            lesson_id: quizData.lesson_id ?? null,
            course_id: courseId,
            user_id: userId, // matches schema
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .select()
          .single();
        if (error) throw error;
        return { data, error: null };
      } catch (error) {
        return { data: null, error: error.message };
      }
    },

    // Quiz Management: Update quiz
    updateQuiz: async (quizId, updates) => {
      try {
        const { data, error } = await supabase
          .from(TABLES.QUIZZES)
          .update({ ...updates, updated_at: new Date().toISOString() })
          .eq('id', quizId)
          .select()
          .single();
        if (error) throw error;
        return { data, error: null };
      } catch (error) {
        return { data: null, error: error.message };
      }
    },

    // Quiz Management: Delete quiz
    deleteQuiz: async (quizId) => {
      try {
        const { error } = await supabase.from(TABLES.QUIZZES).delete().eq('id', quizId);
        if (error) throw error;
        return { success: true, error: null };
      } catch (error) {
        return { success: false, error: error.message };
      }
    },

    // Quiz Questions: Fetch
    fetchQuizQuestions: async (quizId) => {
      set((state) => ({ loading: { ...state.loading, quizQuestions: true }, error: null }));
      try {
        const { data, error } = await supabase
          .from(TABLES.QUIZ_QUESTIONS)
          .select('*')
          .eq('quiz_id', quizId)
          .order('order_index', { ascending: true });
        if (error) throw error;
        set((state) => ({ loading: { ...state.loading, quizQuestions: false } }));
        return { data: data || [], error: null };
      } catch (error) {
        set((state) => ({ loading: { ...state.loading, quizQuestions: false }, error: error.message }));
        return { data: [], error };
      }
    },

    // Fetch single quiz by ID
    fetchQuiz: async (quizId) => {
      try {
        const { data, error } = await supabase
          .from(TABLES.QUIZZES)
          .select('*')
          .eq('id', quizId)
          .single();
        if (error) throw error;
        return { data: data || null, error: null };
      } catch (error) {
        return { data: null, error: error.message };
      }
    },

    // Quiz Questions: Upsert a list (create/update with order)
    upsertQuizQuestions: async (quizId, questions) => {
      try {
        if (!Array.isArray(questions)) return { data: [], error: 'Invalid questions array' };
        const mapToDbType = (t) => {
          if (t === 'single') return 'multiple_choice';
          if (t === 'multiple') return 'multiple_select';
          if (t === 'true_false') return 'true_false';
          if (t === 'short') return 'short_answer';
          return t || 'multiple_choice';
        };
        const payload = questions.map((q, idx) => ({
          quiz_id: quizId,
          question_type: mapToDbType(q.question_type),
          question_text: q.question_text,           // map app -> DB
          options: q.options || null,
          correct_answer: q.correct_answer,
          order_index: q.order_index ?? idx + 1,
          updated_at: new Date().toISOString(),
        }));
        // Replace-all strategy to avoid requiring a unique index
        const del = await supabase.from(TABLES.QUIZ_QUESTIONS).delete().eq('quiz_id', quizId);
        if (del.error) throw del.error;
        const { data, error } = await supabase
          .from(TABLES.QUIZ_QUESTIONS)
          .insert(payload)
          .select();
        if (error) throw error;
        return { data: data || [], error: null };
      } catch (error) {
        return { data: [], error: error.message };
      }
    },

    // Quiz Questions: Delete
    deleteQuizQuestion: async (questionId) => {
      try {
        const { error } = await supabase.from(TABLES.QUIZ_QUESTIONS).delete().eq('id', questionId);
        if (error) throw error;
        return { success: true, error: null };
      } catch (error) {
        return { success: false, error: error.message };
      }
    },

    // Fetch quizzes linked to a lesson
    fetchQuizzesByLesson: async (lessonId) => {
      try {
        const { data, error } = await supabase
          .from(TABLES.QUIZZES)
          .select('*')
          .eq('lesson_id', lessonId)
          .order('created_at', { ascending: false });
        if (error) throw error;
        return { data: data || [], error: null };
      } catch (error) {
        return { data: [], error: error.message };
      }
    },
    // Fetch all courses
    fetchCourses: async (filters = {}, userId = null) => {
      set((state) => ({
        loading: { ...state.loading, courses: true },
        error: null,
      }));

      try {
        let query = supabase
          .from(TABLES.COURSES)
          .select(`
            *,
            category:${TABLES.COURSE_CATEGORIES}(id, name, color),
            creator:${TABLES.PROFILES}(id, first_name, last_name, email),
            enrollments:${TABLES.COURSE_ENROLLMENTS}(
              id, 
              user_id, 
              progress_percentage, 
              status, 
              enrolled_at, 
              completed_at,
              last_accessed
            )
          `)
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

        // Transform data to include user enrollment status and progress
        let transformedCourses = data || [];
        if (userId && data) {
          transformedCourses = data.map(course => {
            const userEnrollment = course.enrollments?.find(enrollment => enrollment.user_id === userId);
            return {
              ...course,
              isEnrolled: !!userEnrollment,
              enrollment_id: userEnrollment?.id,
              progress_percentage: userEnrollment?.progress_percentage || 0,
              enrollment_status: userEnrollment?.status || null,
              enrolled_at: userEnrollment?.enrolled_at,
              completed_at: userEnrollment?.completed_at,
              last_accessed: userEnrollment?.last_accessed,
              canContinue: userEnrollment && userEnrollment.progress_percentage < 100
            };
          });
        }

        set((state) => ({
          courses: transformedCourses,
          loading: { ...state.loading, courses: false },
        }));

        return { data: transformedCourses, error: null };
      } catch (error) {
        set((state) => ({
          error: error.message,
          loading: { ...state.loading, courses: false },
        }));
        return { data: null, error };
      }
    },

    // Fetch user's enrolled courses
    fetchEnrolledCourses: async (userId) => {
      set((state) => ({
        loading: { ...state.loading, enrollments: true },
        error: null,
      }));

      try {
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
          .filter(enrollment => enrollment.course)
          .map(enrollment => ({
            ...enrollment.course,
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
          enrolledCourses: [],
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
          }, { onConflict: 'user_id,lesson_id,course_id' })
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
        // Validate parameters
        if (!userId || !courseId) {
          console.warn('calculateCourseProgress: Missing userId or courseId', { userId, courseId });
          return 0;
        }

        // Get total lessons in course
        const { data: lessons, error: lessonsError } = await supabase
          .from(TABLES.LESSONS)
          .select('id')
          .eq('course_id', courseId);

        if (lessonsError) {
          console.error('Error fetching lessons for progress calculation:', lessonsError);
          return 0;
        }

        // Get completed lessons
        const { data: completedProgress, error: progressError } = await supabase
          .from(TABLES.LESSON_PROGRESS)
          .select('lesson_id')
          .eq('user_id', userId)
          .eq('course_id', courseId)
          .eq('completed', true);

        if (progressError) {
          console.error('Error fetching lesson progress for calculation:', progressError);
          return 0;
        }

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

        if (updateError) {
          console.error('Error updating enrollment progress:', updateError);
          // Don't throw, just return the calculated percentage
        }

        // If course is completed (100%), ensure certificate exists
        if (progressPercentage === 100) {
          const { data: existingCert } = await get().actions.getCertificateForCourse(userId, courseId);
          if (!existingCert) {
            // Get default certificate template and generate certificate
            const { data: templates } = await get().actions.fetchCertificateTemplates();
            const defaultTemplate = templates?.find(t => t.is_default) || templates?.[0];

            if (defaultTemplate) {
              await get().actions.generateCertificateFromTemplate(userId, courseId, defaultTemplate.id);
            } else {
              // Fallback to basic certificate creation if no template exists
              await get().actions.createCertificate(userId, courseId);
            }
          }
        }

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
        console.error('Exception in calculateCourseProgress:', error);
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
        // Validate parameters
        if (!userId || !courseId) {
          console.warn('fetchCourseProgress: Missing userId or courseId', { userId, courseId });
          return { data: {}, error: null };
        }

        const { data, error } = await supabase
          .from(TABLES.LESSON_PROGRESS)
          .select('*')
          .eq('user_id', userId)
          .eq('course_id', courseId);

        if (error) {
          console.error('Error fetching lesson progress:', error);
          // Return empty progress instead of throwing
          return { data: {}, error: null };
        }

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
        console.error('Exception in fetchCourseProgress:', error);
        set((state) => ({
          error: error.message,
          loading: { ...state.loading, progress: false },
        }));
        // Return empty progress instead of null
        return { data: {}, error: null };
      }
    },

    // Submit quiz attempt
    submitQuizAttempt: async (userId, quizId, answers, score, maxScore = null) => {
      set((state) => ({
        loading: { ...state.loading, quiz: true },
        error: null,
      }));

      try {
        // Get quiz details to determine pass threshold
        const { data: quizData, error: quizError } = await supabase
          .from(TABLES.QUIZZES)
          .select('pass_threshold, lesson_id, course_id')
          .eq('id', quizId)
          .single();

        if (quizError) throw quizError;

        // Calculate if quiz was passed
        const percentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
        const passThreshold = quizData.pass_threshold || 70;
        const passed = percentage >= passThreshold;
        

        // Insert quiz attempt with completion status
        const { data, error } = await supabase
          .from(TABLES.QUIZ_ATTEMPTS)
          .insert({
            user_id: userId,
            quiz_id: quizId,
            answers,
            score,
            max_score: maxScore,
            percentage: percentage,
            passed: passed,
            completed_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (error) throw error;

        // If quiz was passed, mark lesson as completed
        if (passed && quizData.lesson_id && quizData.course_id) {
          await get().actions.updateLessonProgress(
            userId, 
            quizData.lesson_id, 
            quizData.course_id, 
            true, 
            { 
              completed_via: 'quiz',
              quiz_id: quizId,
              quiz_score: score,
              quiz_percentage: percentage,
              completed_at: new Date().toISOString()
            }
          );
        }

        // Update local quiz attempts
        set((state) => ({
          quizAttempts: {
            ...state.quizAttempts,
            [quizId]: [...(state.quizAttempts[quizId] || []), data],
          },
          loading: { ...state.loading, quiz: false },
        }));

        return { data: { ...data, passed, percentage }, error: null };
      } catch (error) {
        set((state) => ({
          error: error.message,
          loading: { ...state.loading, quiz: false },
        }));
        return { data: null, error };
      }
    },

    // Fetch quiz attempts for a user and quiz
    fetchQuizAttempts: async (userId, quizId) => {
      try {
        const { data, error } = await supabase
          .from(TABLES.QUIZ_ATTEMPTS)
          .select('*')
          .eq('user_id', userId)
          .eq('quiz_id', quizId)
          .order('completed_at', { ascending: false });

        if (error) throw error;
        return { data: data || [], error: null };
      } catch (error) {
        return { data: [], error };
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

    // Get a certificate for a user and course (if any)
    getCertificateForCourse: async (userId, courseId) => {
      try {
        const { data, error } = await supabase
          .from(TABLES.CERTIFICATES)
          .select('*')
          .eq('user_id', userId)
          .eq('course_id', courseId)
          .limit(1);

        if (error) throw error;
        const certificate = Array.isArray(data) && data.length > 0 ? data[0] : null;
        return { data: certificate, error: null };
      } catch (error) {
        return { data: null, error };
      }
    },

    // Create a certificate record upon completion
    createCertificate: async (userId, courseId) => {
      try {
        // Get user and course data to populate certificate_data
        const [userProfile, courseData] = await Promise.all([
          getUserProfile(userId),
          supabase.from(TABLES.COURSES).select('*').eq('id', courseId).single()
        ]);

        const certificateData = {
          user_name: userProfile ? `${userProfile.first_name} ${userProfile.last_name}` : 'Student',
          course_title: courseData?.data?.title || 'Course',
          completion_date: new Date().toLocaleDateString(),
          issue_date: new Date().toLocaleDateString(),
          certificate_id: `CERT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
          instructor_name: courseData?.data?.instructor || 'Kyzer LMS',
          organization_name: userProfile?.organization?.name || 'Kyzer LMS'
        };

        const { data, error } = await supabase
          .from(TABLES.CERTIFICATES)
          .insert({
            user_id: userId,
            course_id: courseId,
            issued_at: new Date().toISOString(),
            certificate_data: certificateData
          })
          .select()
          .single();

        if (error) throw error;

        // Refresh local certificates cache (best effort)
        const { data: updated } = await get().actions.fetchCertificates(userId);
        set({ certificates: updated || [] });

        return { data, error: null };
      } catch (error) {
        return { data: null, error };
      }
    },

    // Certificate Templates Management
    fetchCertificateTemplates: async () => {
      try {
        const { data, error } = await safeQuery(
          supabase
            .from(TABLES.CERTIFICATE_TEMPLATES)
            .select('*')
            .order('created_at', { ascending: false }),
          'fetchCertificateTemplates'
        );

        if (error) throw error;

        const templates = data || [];
        set({ certificateTemplates: templates });
        return { data: templates, error: null };
      } catch (error) {
        console.error('Error fetching certificate templates:', error);
        set({ certificateTemplates: [] });
        return { data: [], error };
      }
    },

    createCertificateTemplate: async (templateData) => {
      try {
        const { data, error } = await supabase
          .from(TABLES.CERTIFICATE_TEMPLATES)
          .insert({
            name: templateData.name,
            description: templateData.description,
            template_url: templateData.template_url,
            placeholders: templateData.placeholders || {},
            is_default: templateData.is_default || false,
            created_by: templateData.created_by,
            created_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (error) throw error;

        // Refresh templates
        const { data: updated } = await get().actions.fetchCertificateTemplates();
        set({ certificateTemplates: updated || [] });

        return { data, error: null };
      } catch (error) {
        return { data: null, error };
      }
    },

    updateCertificateTemplate: async (templateId, updates) => {
      try {
        const { data, error } = await supabase
          .from(TABLES.CERTIFICATE_TEMPLATES)
          .update({
            ...updates,
            updated_at: new Date().toISOString(),
          })
          .eq('id', templateId)
          .select()
          .single();

        if (error) throw error;

        // Refresh templates
        const { data: updated } = await get().actions.fetchCertificateTemplates();
        set({ certificateTemplates: updated || [] });

        return { data, error: null };
      } catch (error) {
        return { data: null, error };
      }
    },

    deleteCertificateTemplate: async (templateId) => {
      try {
        const { error } = await supabase
          .from(TABLES.CERTIFICATE_TEMPLATES)
          .delete()
          .eq('id', templateId);

        if (error) throw error;

        // Refresh templates
        const { data: updated } = await get().actions.fetchCertificateTemplates();
        set({ certificateTemplates: updated || [] });

        return { error: null };
      } catch (error) {
        return { error };
      }
    },

    // Generate certificate from template
    generateCertificateFromTemplate: async (userId, courseId, templateId) => {
      try {
        // Get user and course data
        const [userProfile, courseData, templateData] = await Promise.all([
          getUserProfile(userId),
          supabase.from(TABLES.COURSES).select('*').eq('id', courseId).single(),
          supabase.from(TABLES.CERTIFICATE_TEMPLATES).select('*').eq('id', templateId).single()
        ]);

        if (userProfile && courseData.data && templateData.data) {
          const certificateData = {
            user_id: userId,
            course_id: courseId,
            template_id: templateId,
            issued_at: new Date().toISOString(),
            certificate_data: {
              user_name: `${userProfile.first_name} ${userProfile.last_name}`,
              course_title: courseData.data.title,
              completion_date: new Date().toLocaleDateString(),
              instructor_name: courseData.data.instructor || 'Kyzer LMS',
              issue_date: new Date().toLocaleDateString(),
              certificate_id: `CERT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
              organization_name: userProfile.organization?.name || 'Kyzer LMS',
            }
          };

          const { data, error } = await supabase
            .from(TABLES.CERTIFICATES)
            .insert(certificateData)
            .select()
            .single();

          if (error) throw error;

          // Refresh certificates
          const { data: updated } = await get().actions.fetchCertificates(userId);
          set({ certificates: updated || [] });

          return { data, error: null };
        } else {
          throw new Error('Missing required data for certificate generation');
        }
      } catch (error) {
        return { data: null, error };
      }
    },

    // Generate certificate preview/download with filled placeholders
    generateCertificatePreview: async (certificateId) => {
      try {
        // Get certificate with template data
        const { data: certificate, error } = await supabase
          .from(TABLES.CERTIFICATES)
          .select(`
            *,
            template:${TABLES.CERTIFICATE_TEMPLATES}(*),
            course:${TABLES.COURSES}(*)
          `)
          .eq('id', certificateId)
          .single();

        if (error) throw error;

        // Use default template if no template is associated
        if (!certificate.template) {
          certificate.template = {
            template_url: DEFAULT_CERTIFICATE_SVG,
            placeholders: {
              '{{user_name}}': true,
              '{{course_title}}': true,
              '{{completion_date}}': true,
              '{{certificate_id}}': true,
              '{{instructor_name}}': true,
              '{{organization_name}}': true
            }
          };
        }

        // Create a canvas to overlay text on the template image
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.crossOrigin = 'anonymous';

          // Set a timeout for image loading
          const timeout = setTimeout(() => {
            reject(new Error('Certificate template image failed to load (timeout)'));
          }, 10000);

          img.onload = () => {
            clearTimeout(timeout);
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            canvas.width = img.width;
            canvas.height = img.height;

            // Draw the template image
            ctx.drawImage(img, 0, 0);

            // Add text overlays for placeholders
            const placeholderData = certificate.certificate_data;
            const placeholders = certificate.template.placeholders || {};

            // Set font styles
            ctx.fillStyle = '#000000';
            ctx.textAlign = 'center';
            ctx.font = 'bold 24px Arial';

            // Calculate positions based on image size (these would be configurable)
            const centerX = canvas.width / 2;
            const positions = {
              '{{user_name}}': { x: centerX, y: canvas.height * 0.45 },
              '{{course_title}}': { x: centerX, y: canvas.height * 0.55 },
              '{{completion_date}}': { x: centerX * 1.5, y: canvas.height * 0.75 },
              '{{certificate_id}}': { x: centerX * 0.5, y: canvas.height * 0.75 },
              '{{instructor_name}}': { x: centerX, y: canvas.height * 0.65 },
              '{{organization_name}}': { x: centerX, y: canvas.height * 0.25 },
            };

            // Fill in the placeholders
            Object.keys(placeholders).forEach(placeholder => {
              const position = positions[placeholder];
              const value = placeholderData[placeholder.replace(/[{}]/g, '')];

              if (position && value) {
                ctx.fillText(value, position.x, position.y);
              }
            });

            // Convert to blob for download
            canvas.toBlob((blob) => {
              resolve({
                blob,
                url: URL.createObjectURL(blob),
                filename: `certificate-${certificate.certificate_data.certificate_id}.png`
              });
            }, 'image/png');
          };

          img.onerror = (error) => {
            clearTimeout(timeout);
            console.error('Certificate template image load error:', error);
            reject(new Error('Failed to load certificate template image'));
          };

          // Handle different types of image URLs
          const templateUrl = certificate.template.template_url;
          if (templateUrl.startsWith('data:')) {
            // Data URL - should load directly
            img.src = templateUrl;
          } else if (templateUrl.startsWith('http')) {
            // External URL - might have CORS issues
            img.src = templateUrl;
          } else {
            // Relative or Supabase storage URL
            img.src = templateUrl;
          }
        });
      } catch (error) {
        throw error;
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

    // Course Management: Create new course
    createCourse: async (courseData, createdBy) => {
      try {
        // Enforce unique course title (case-insensitive)
        if (courseData?.title) {
          const { data: existing } = await supabase
            .from(TABLES.COURSES)
            .select('id')
            .ilike('title', courseData.title)
            .limit(1);
          if (existing && existing.length > 0) {
            return { data: null, error: 'A course with this title already exists' };
          }
        }

        const { data, error } = await supabase
          .from(TABLES.COURSES)
          .insert({
            ...courseData,
            created_by: createdBy,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            is_published: false,
            status: 'draft'
          })
          .select()
          .single();

        if (error) throw error;

        // Don't refresh here to prevent infinite loops
        // The store will update automatically

        return { data, error: null };
      } catch (error) {
        return { data: null, error: error.message };
      }
    },

    // Course Management: Update course
    updateCourse: async (courseId, updates) => {
      try {
        // Enforce unique course title on update (case-insensitive)
        if (updates?.title) {
          const { data: existing } = await supabase
            .from(TABLES.COURSES)
            .select('id')
            .ilike('title', updates.title)
            .neq('id', courseId)
            .limit(1);
          if (existing && existing.length > 0) {
            return { data: null, error: 'A course with this title already exists' };
          }
        }

        const { data, error } = await supabase
          .from(TABLES.COURSES)
          .update({
            ...updates,
            updated_at: new Date().toISOString()
          })
          .eq('id', courseId)
          .select()
          .single();

        if (error) throw error;

        // Don't refresh here to prevent infinite loops
        // The store will update automatically

        return { data, error: null };
      } catch (error) {
        return { data: null, error: error.message };
      }
    },

    // Course Management: Delete course
    deleteCourse: async (courseId) => {
      try {
        const { error } = await supabase
          .from(TABLES.COURSES)
          .delete()
          .eq('id', courseId);

        if (error) throw error;

        // Don't refresh here to prevent infinite loops
        // The store will update automatically

        return { success: true, error: null };
      } catch (error) {
        return { success: false, error: error.message };
      }
    },

    // Course Management: Publish/Unpublish course
    toggleCoursePublish: async (courseId, isPublished) => {
      try {
        const { data, error } = await supabase
          .from(TABLES.COURSES)
          .update({
            is_published: isPublished,
            status: isPublished ? 'published' : 'draft',
            updated_at: new Date().toISOString()
          })
          .eq('id', courseId)
          .select()
          .single();

        if (error) throw error;

        // Don't refresh here to prevent infinite loops
        // The store will update automatically

        return { data, error: null };
      } catch (error) {
        return { data: null, error: error.message };
      }
    },

    // Lesson Management: Create lesson
    createLesson: async (lessonData, courseId, createdBy) => {
      try {
        // Enforce unique lesson title within the course when module is not specified
        if (lessonData?.title && !lessonData?.module_id) {
          const { data: existing } = await supabase
            .from(TABLES.LESSONS)
            .select('id')
            .eq('course_id', courseId)
            .is('module_id', null)
            .ilike('title', lessonData.title)
            .limit(1);
          if (existing && existing.length > 0) {
            return { data: null, error: 'A lesson with this title already exists in this course' };
          }
        }

        // Get current lesson count for order_index
        const { data: existingLessons } = await supabase
          .from(TABLES.LESSONS)
          .select('order_index')
          .eq('course_id', courseId)
          .order('order_index', { ascending: false })
          .limit(1);

        const nextOrderIndex = existingLessons && existingLessons.length > 0 
          ? existingLessons[0].order_index + 1 
          : 1;

        const { data, error } = await supabase
          .from(TABLES.LESSONS)
          .insert({
            ...lessonData,
            course_id: courseId,
            created_by: createdBy,
            order_index: nextOrderIndex,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single();

        if (error) throw error;

        return { data, error: null };
      } catch (error) {
        return { data: null, error: error.message };
      }
    },

    // Lesson Management: Update lesson
    updateLesson: async (lessonId, updates) => {
      try {
        // Enforce unique lesson title within its module (or course if unassigned)
        if (updates?.title) {
          const { data: current } = await supabase
            .from(TABLES.LESSONS)
            .select('course_id,module_id')
            .eq('id', lessonId)
            .single();

          if (current?.course_id !== undefined) {
            let query = supabase
              .from(TABLES.LESSONS)
              .select('id')
              .eq('course_id', current.course_id)
              .ilike('title', updates.title)
              .neq('id', lessonId)
              .limit(1);

            if (current.module_id) {
              query = query.eq('module_id', current.module_id);
            } else {
              query = query.is('module_id', null);
            }

            const { data: existing } = await query;
            if (existing && existing.length > 0) {
              return { data: null, error: 'A lesson with this title already exists in this module/course' };
            }
          }
        }

        const { data, error } = await supabase
          .from(TABLES.LESSONS)
          .update({
            ...updates,
            updated_at: new Date().toISOString()
          })
          .eq('id', lessonId)
          .select()
          .single();

        if (error) throw error;

        return { data, error: null };
      } catch (error) {
        return { data: null, error: error.message };
      }
    },

    // Lesson Management: Delete lesson
    deleteLesson: async (lessonId) => {
      try {
        const { error } = await supabase
          .from(TABLES.LESSONS)
          .delete()
          .eq('id', lessonId);

        if (error) throw error;

        return { success: true, error: null };
      } catch (error) {
        return { success: false, error: error.message };
      }
    },

    // Lesson Management: Reorder lessons
    reorderLessons: async (courseId, lessonOrder) => {
      try {
        const updates = lessonOrder.map((lessonId, index) => ({
          id: lessonId,
          order_index: index + 1
        }));

        const { error } = await supabase
          .from(TABLES.LESSONS)
          .upsert(updates, { onConflict: 'id' });

        if (error) throw error;

        return { success: true, error: null };
      } catch (error) {
        return { success: false, error: error.message };
      }
    },

    // Lesson Management: Get lessons for a course
    fetchCourseLessons: async (courseId) => {
      try {
        const { data, error } = await supabase
          .from(TABLES.LESSONS)
          .select('*')
          .eq('course_id', courseId)
          .order('order_index', { ascending: true });

        if (error) throw error;

        return { data: data || [], error: null };
      } catch (error) {
        return { data: [], error: error.message };
      }
    },

    // Lightweight counts for modules and lessons per course
    getCourseCounts: async (courseId) => {
      try {
        const [{ count: modulesCount }, { count: lessonsCount }] = await Promise.all([
          supabase
            .from(TABLES.COURSE_MODULES)
            .select('id', { count: 'exact', head: true })
            .eq('course_id', courseId),
          supabase
            .from(TABLES.LESSONS)
            .select('id', { count: 'exact', head: true })
            .eq('course_id', courseId),
        ]);

        return { data: { modules: modulesCount || 0, lessons: lessonsCount || 0 }, error: null };
      } catch (error) {
        return { data: { modules: 0, lessons: 0 }, error: error.message };
      }
    },

    // Category Management: Fetch all categories
    fetchCategories: async () => {
      set((state) => ({
        loading: { ...state.loading, categories: true },
        error: null,
      }));

      try {
        const { data, error } = await supabase
          .from(TABLES.COURSE_CATEGORIES)
          .select('*')
          .order('name', { ascending: true });

        if (error) throw error;

        set((state) => ({
          categories: data || [],
          loading: { ...state.loading, categories: false },
        }));

        return { data: data || [], error: null };
      } catch (error) {
        set((state) => ({
          error: error.message,
          loading: { ...state.loading, categories: false },
        }));
        return { data: [], error: error.message };
      }
    },

    // Category Management: Create new category
    createCategory: async (categoryData, createdBy) => {
      try {
        const { data, error } = await supabase
          .from(TABLES.COURSE_CATEGORIES)
          .insert({
            ...categoryData,
            created_by: createdBy,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single();

        if (error) throw error;

        return { data, error: null };
      } catch (error) {
        return { data: null, error: error.message };
      }
    },

    // Category Management: Update category
    updateCategory: async (categoryId, updates) => {
      try {
        const { data, error } = await supabase
          .from(TABLES.COURSE_CATEGORIES)
          .update({
            ...updates,
            updated_at: new Date().toISOString()
          })
          .eq('id', categoryId)
          .select()
          .single();

        if (error) throw error;

        return { data, error: null };
      } catch (error) {
        return { data: null, error: error.message };
      }
    },

    // Category Management: Delete category
    deleteCategory: async (categoryId) => {
      try {
        const { error } = await supabase
          .from(TABLES.COURSE_CATEGORIES)
          .delete()
          .eq('id', categoryId);

        if (error) throw error;

        return { success: true, error: null };
      } catch (error) {
        return { success: false, error: error.message };
      }
    },

    // Module Management: Fetch modules for a course
    fetchCourseModules: async (courseId) => {
      set((state) => ({
        loading: { ...state.loading, modules: true },
        error: null,
      }));

      try {
        const { data, error } = await supabase
          .from(TABLES.COURSE_MODULES)
          .select('*')
          .eq('course_id', courseId)
          .order('order_index', { ascending: true });

        if (error) throw error;

        // Update local state
        set((state) => ({
          courseModules: {
            ...state.courseModules,
            [courseId]: data || []
          },
          loading: { ...state.loading, modules: false },
        }));

        return { data: data || [], error: null };
      } catch (error) {
        set((state) => ({
          error: error.message,
          loading: { ...state.loading, modules: false },
        }));
        return { data: [], error: error.message };
      }
    },

    // Module Management: Create new module
    createModule: async (moduleData, courseId, createdBy) => {
      try {
        // Enforce unique module title within a course (case-insensitive)
        if (moduleData?.title) {
          const { data: existing } = await supabase
            .from(TABLES.COURSE_MODULES)
            .select('id')
            .eq('course_id', courseId)
            .ilike('title', moduleData.title)
            .limit(1);
          if (existing && existing.length > 0) {
            return { data: null, error: 'A module with this title already exists in this course' };
          }
        }

        // Get current module count for order_index
        const { data: existingModules } = await supabase
          .from(TABLES.COURSE_MODULES)
          .select('order_index')
          .eq('course_id', courseId)
          .order('order_index', { ascending: false })
          .limit(1);

        const nextOrderIndex = existingModules && existingModules.length > 0 
          ? existingModules[0].order_index + 1 
          : 1;

        const { data, error } = await supabase
          .from(TABLES.COURSE_MODULES)
          .insert({
            ...moduleData,
            course_id: courseId,
            created_by: createdBy,
            order_index: nextOrderIndex,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single();

        if (error) throw error;

        // Update local state
        const currentModules = get().courseModules[courseId] || [];
        set((state) => ({
          courseModules: {
            ...state.courseModules,
            [courseId]: [...currentModules, data]
          }
        }));

        return { data, error: null };
      } catch (error) {
        return { data: null, error: error.message };
      }
    },

    // Module Management: Update module
    updateModule: async (moduleId, updates) => {
      try {
        // Enforce unique module title within a course on update (case-insensitive)
        if (updates?.title) {
          const { data: current } = await supabase
            .from(TABLES.COURSE_MODULES)
            .select('course_id')
            .eq('id', moduleId)
            .single();

          if (current?.course_id) {
            const { data: existing } = await supabase
              .from(TABLES.COURSE_MODULES)
              .select('id')
              .eq('course_id', current.course_id)
              .ilike('title', updates.title)
              .neq('id', moduleId)
              .limit(1);
            if (existing && existing.length > 0) {
              return { data: null, error: 'A module with this title already exists in this course' };
            }
          }
        }

        const { data, error } = await supabase
          .from(TABLES.COURSE_MODULES)
          .update({
            ...updates,
            updated_at: new Date().toISOString()
          })
          .eq('id', moduleId)
          .select()
          .single();

        if (error) throw error;

        // Update local state
        set((state) => ({
          courseModules: Object.keys(state.courseModules).reduce((acc, courseId) => {
            acc[courseId] = state.courseModules[courseId].map(module =>
              module.id === moduleId ? { ...module, ...updates } : module
            );
            return acc;
          }, {})
        }));

        return { data, error: null };
      } catch (error) {
        return { data: null, error: error.message };
      }
    },

    // Module Management: Delete module
    deleteModule: async (moduleId, courseId) => {
      try {
        const { error } = await supabase
          .from(TABLES.COURSE_MODULES)
          .delete()
          .eq('id', moduleId);

        if (error) throw error;

        // Update local state
        set((state) => ({
          courseModules: {
            ...state.courseModules,
            [courseId]: state.courseModules[courseId]?.filter(module => module.id !== moduleId) || []
          }
        }));

        return { success: true, error: null };
      } catch (error) {
        return { success: false, error: error.message };
      }
    },

    // Module Management: Reorder modules
    reorderModules: async (courseId, moduleOrder) => {
      try {
        const updates = moduleOrder.map((moduleId, index) => ({
          id: moduleId,
          order_index: index + 1
        }));

        const { error } = await supabase
          .from(TABLES.COURSE_MODULES)
          .upsert(updates, { onConflict: 'id' });

        if (error) throw error;

        // Update local state
        set((state) => ({
          courseModules: {
            ...state.courseModules,
            [courseId]: state.courseModules[courseId]?.map(module => {
              const update = updates.find(u => u.id === module.id);
              return update ? { ...module, order_index: update.order_index } : module;
            }).sort((a, b) => a.order_index - b.order_index) || []
          }
        }));

        return { success: true, error: null };
      } catch (error) {
        return { success: false, error: error.message };
      }
    },

    // Enhanced Lesson Management: Create lesson with module support
    createLesson: async (lessonData, courseId, moduleId, createdBy) => {
      try {
        // Enforce unique lesson title within the module (or course if moduleId is null)
        if (lessonData?.title) {
          let query = supabase
            .from(TABLES.LESSONS)
            .select('id')
            .eq('course_id', courseId)
            .ilike('title', lessonData.title)
            .limit(1);

          if (moduleId) {
            query = query.eq('module_id', moduleId);
          } else {
            query = query.is('module_id', null);
          }

          const { data: existing } = await query;
          if (existing && existing.length > 0) {
            return { data: null, error: 'A lesson with this title already exists in this module/course' };
          }
        }

        // Get current lesson count for order_index within the module
        const { data: existingLessons } = await supabase
          .from(TABLES.LESSONS)
          .select('order_index')
          .eq('course_id', courseId)
          .eq('module_id', moduleId)
          .order('order_index', { ascending: false })
          .limit(1);

        const nextOrderIndex = existingLessons && existingLessons.length > 0 
          ? existingLessons[0].order_index + 1 
          : 1;

        const { data, error } = await supabase
          .from(TABLES.LESSONS)
          .insert({
            ...lessonData,
            course_id: courseId,
            module_id: moduleId,
            created_by: createdBy,
            order_index: nextOrderIndex,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single();

        if (error) throw error;

        return { data, error: null };
      } catch (error) {
        return { data: null, error: error.message };
      }
    },

    // Enhanced Lesson Management: Get lessons for a course with module grouping
    fetchCourseLessons: async (courseId) => {
      try {
        const { data, error } = await supabase
          .from(TABLES.LESSONS)
          .select(`
            *,
            module:${TABLES.COURSE_MODULES}(id, title, order_index)
          `)
          .eq('course_id', courseId)
          .order('order_index', { ascending: true });

        if (error) throw error;

        // Group lessons by module and sort by module order
        const groupedLessons = {};
        data?.forEach(lesson => {
          const moduleId = lesson.module?.id || 'unassigned';
          if (!groupedLessons[moduleId]) {
            groupedLessons[moduleId] = {
              module: lesson.module || { id: 'unassigned', title: 'Unassigned Lessons', order_index: 999 },
              lessons: []
            };
          }
          groupedLessons[moduleId].lessons.push(lesson);
        });

        // Sort modules by order_index and lessons within each module
        const sortedGroupedLessons = {};
        Object.keys(groupedLessons)
          .sort((a, b) => {
            const moduleA = groupedLessons[a].module;
            const moduleB = groupedLessons[b].module;
            return (moduleA.order_index || 999) - (moduleB.order_index || 999);
          })
          .forEach(moduleId => {
            const moduleData = groupedLessons[moduleId];
            // Sort lessons within the module by their order_index
            moduleData.lessons.sort((a, b) => (a.order_index || 0) - (b.order_index || 0));
            sortedGroupedLessons[moduleId] = moduleData;
          });

        return { data: sortedGroupedLessons, error: null };
      } catch (error) {
        return { data: {}, error: error.message };
      }
    },

    // Title uniqueness helpers
    isCourseTitleUnique: async (title, excludeId = null) => {
      try {
        let query = supabase
          .from(TABLES.COURSES)
          .select('id')
          .ilike('title', title)
          .limit(1);
        if (excludeId) query = query.neq('id', excludeId);
        const { data } = await query;
        return !data || data.length === 0;
      } catch (error) {
        return false;
      }
    },

    isModuleTitleUnique: async (courseId, title, excludeId = null) => {
      try {
        let query = supabase
          .from(TABLES.COURSE_MODULES)
          .select('id')
          .eq('course_id', courseId)
          .ilike('title', title)
          .limit(1);
        if (excludeId) query = query.neq('id', excludeId);
        const { data } = await query;
        return !data || data.length === 0;
      } catch (error) {
        return false;
      }
    },

    isLessonTitleUnique: async (courseId, moduleId, title, excludeId = null) => {
      try {
        let query = supabase
          .from(TABLES.LESSONS)
          .select('id')
          .eq('course_id', courseId)
          .ilike('title', title)
          .limit(1);
        if (moduleId) {
          query = query.eq('module_id', moduleId);
        } else {
          query = query.is('module_id', null);
        }
        if (excludeId) query = query.neq('id', excludeId);
        const { data } = await query;
        return !data || data.length === 0;
      } catch (error) {
        return false;
      }
    },

    // Lesson Management: Fetch single lesson
    fetchLesson: async (lessonId) => {
      try {
        const { data, error } = await supabase
          .from(TABLES.LESSONS)
          .select('*')
          .eq('id', lessonId)
          .single();
        if (error) throw error;
        return { data, error: null };
      } catch (error) {
        return { data: null, error: error.message };
      }
    },

    // Presentation Management Functions
    createPresentation: async (presentationData) => {
      try {
        const { data, error } = await supabase
          .from(TABLES.LESSON_PRESENTATIONS)
          .insert({
            ...presentationData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single();
        if (error) throw error;
        return { data, error: null };
      } catch (error) {
        return { data: null, error: error.message };
      }
    },

    updatePresentation: async (presentationId, updates) => {
      try {
        const { data, error } = await supabase
          .from(TABLES.LESSON_PRESENTATIONS)
          .update({ ...updates, updated_at: new Date().toISOString() })
          .eq('id', presentationId)
          .select()
          .single();
        if (error) throw error;
        return { data, error: null };
      } catch (error) {
        return { data: null, error: error.message };
      }
    },

    deletePresentation: async (presentationId) => {
      try {
        const { error } = await supabase
          .from(TABLES.LESSON_PRESENTATIONS)
          .delete()
          .eq('id', presentationId);
        if (error) throw error;
        return { success: true, error: null };
      } catch (error) {
        return { success: false, error: error.message };
      }
    },

    fetchPresentation: async (presentationId) => {
      try {
        const { data, error } = await supabase
          .from(TABLES.LESSON_PRESENTATIONS)
          .select(`
            *,
            slides:${TABLES.PRESENTATION_SLIDES}(*)
          `)
          .eq('id', presentationId)
          .single();
        if (error) throw error;
        return { data, error: null };
      } catch (error) {
        return { data: null, error: error.message };
      }
    },

    fetchPresentationByLesson: async (lessonId) => {
      try {
        const { data, error } = await supabase
          .from(TABLES.LESSON_PRESENTATIONS)
          .select(`
            *,
            slides:${TABLES.PRESENTATION_SLIDES}(*)
          `)
          .eq('lesson_id', lessonId)
          .single();
        if (error) throw error;
        return { data, error: null };
      } catch (error) {
        return { data: null, error: error.message };
      }
    },

    createSlide: async (slideData) => {
      try {
        const { data, error } = await supabase
          .from(TABLES.PRESENTATION_SLIDES)
          .insert({
            ...slideData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single();
        if (error) throw error;
        return { data, error: null };
      } catch (error) {
        return { data: null, error: error.message };
      }
    },

    updateSlide: async (slideId, updates) => {
      try {
        const { data, error } = await supabase
          .from(TABLES.PRESENTATION_SLIDES)
          .update({ ...updates, updated_at: new Date().toISOString() })
          .eq('id', slideId)
          .select()
          .single();
        if (error) throw error;
        return { data, error: null };
      } catch (error) {
        return { data: null, error: error.message };
      }
    },

    deleteSlide: async (slideId) => {
      try {
        const { error } = await supabase
          .from(TABLES.PRESENTATION_SLIDES)
          .delete()
          .eq('id', slideId);
        if (error) throw error;
        return { success: true, error: null };
      } catch (error) {
        return { success: false, error: error.message };
      }
    },

    reorderSlides: async (presentationId, slideIds) => {
      try {
        // Use a more efficient approach to avoid conflicts
        // First, set all slide numbers to temporary values to avoid unique constraint conflicts
        const tempUpdates = slideIds.map((slideId, index) => ({
          id: slideId,
          slide_number: -(index + 1) // Use negative numbers temporarily
        }));

        // Update all slides to temporary numbers first
        for (const update of tempUpdates) {
          const { error } = await supabase
            .from(TABLES.PRESENTATION_SLIDES)
            .update({ slide_number: update.slide_number })
            .eq('id', update.id);
          if (error) throw error;
        }

        // Now update to final numbers
        const finalUpdates = slideIds.map((slideId, index) => ({
          id: slideId,
          slide_number: index + 1
        }));

        for (const update of finalUpdates) {
          const { error } = await supabase
            .from(TABLES.PRESENTATION_SLIDES)
            .update({ slide_number: update.slide_number })
            .eq('id', update.id);
          if (error) throw error;
        }

        return { success: true, error: null };
      } catch (error) {
        return { success: false, error: error.message };
      }
    },

    // ==========================================
    // PRESENTATION PROGRESS TRACKING
    // ==========================================

    // Track slide completion and time spent
    updateSlideProgress: async (userId, slideId, presentationId, lessonId, courseId, metadata = {}) => {
      try {
        const progressData = {
          user_id: userId,
          slide_id: slideId,
          presentation_id: presentationId,
          lesson_id: lessonId,
          course_id: courseId,
          viewed_at: new Date().toISOString(),
          time_spent_seconds: metadata.timeSpent || 0,
          completed: metadata.completed || true,
          metadata: {
            ...metadata,
            slide_order: metadata.slideOrder,
            quiz_scores: metadata.quizScores || {},
            interactions: metadata.interactions || {}
          },
        };

        const { data, error } = await supabase
          .from(TABLES.SLIDE_PROGRESS)
          .upsert(progressData, {
            onConflict: 'user_id,slide_id',
            ignoreDuplicates: false
          })
          .select()
          .single();

        if (error) throw error;

        // Update overall presentation progress
        await get().actions.calculatePresentationProgress(userId, presentationId, lessonId, courseId);

        return { data, error: null };
      } catch (error) {
        console.error('Error updating slide progress:', error);
        return { data: null, error: error.message };
      }
    },

    // Calculate and update presentation progress
    calculatePresentationProgress: async (userId, presentationId, lessonId, courseId) => {
      try {
        // Get total slides in presentation
        const { data: allSlides, error: slidesError } = await supabase
          .from(TABLES.PRESENTATION_SLIDES)
          .select('id')
          .eq('presentation_id', presentationId)
          .order('slide_number', { ascending: true });

        if (slidesError) throw slidesError;

        // Get completed slides
        const { data: completedSlides, error: progressError } = await supabase
          .from(TABLES.SLIDE_PROGRESS)
          .select('slide_id, time_spent_seconds, metadata')
          .eq('user_id', userId)
          .eq('presentation_id', presentationId)
          .eq('completed', true);

        if (progressError) throw progressError;

        const totalSlides = allSlides?.length || 0;
        const completedCount = completedSlides?.length || 0;
        const progressPercentage = totalSlides > 0 ? Math.round((completedCount / totalSlides) * 100) : 0;

        // Calculate total time spent
        const totalTimeSpent = completedSlides?.reduce((sum, slide) =>
          sum + (slide.time_spent_seconds || 0), 0) || 0;

        // Aggregate quiz scores if any
        const quizScores = {};
        completedSlides?.forEach(slide => {
          if (slide.metadata?.quizScores) {
            Object.assign(quizScores, slide.metadata.quizScores);
          }
        });

        // Update or create presentation progress record
        const progressData = {
          user_id: userId,
          presentation_id: presentationId,
          lesson_id: lessonId,
          course_id: courseId,
          progress_percentage: progressPercentage,
          completed_slides: completedCount,
          total_slides: totalSlides,
          total_time_spent_seconds: totalTimeSpent,
          completed: progressPercentage === 100,
          completed_at: progressPercentage === 100 ? new Date().toISOString() : null,
          last_accessed: new Date().toISOString(),
          metadata: {
            quiz_scores: quizScores,
            last_slide_viewed: completedSlides?.length > 0 ?
              completedSlides[completedSlides.length - 1].slide_id : null,
          },
        };

        const { data, error } = await supabase
          .from(TABLES.PRESENTATION_PROGRESS)
          .upsert(progressData, {
            onConflict: 'user_id,presentation_id',
            ignoreDuplicates: false
          })
          .select()
          .single();

        if (error) throw error;

        // If presentation is completed, update lesson progress
        if (progressPercentage === 100) {
          await get().actions.updateLessonProgress(
            userId,
            lessonId,
            courseId,
            true,
            {
              completed_via: 'presentation',
              presentation_id: presentationId,
              slides_completed: completedCount,
              total_time_spent: totalTimeSpent,
              quiz_scores: quizScores,
              completed_at: new Date().toISOString()
            }
          );
        }

        return { data, error: null };
      } catch (error) {
        console.error('Error calculating presentation progress:', error);
        return { data: null, error: error.message };
      }
    },

    // Fetch presentation progress for a user
    fetchPresentationProgress: async (userId, presentationId) => {
      try {
        const { data, error } = await supabase
          .from(TABLES.PRESENTATION_PROGRESS)
          .select('*')
          .eq('user_id', userId)
          .eq('presentation_id', presentationId)
          .single();

        if (error && error.code !== 'PGRST116') throw error;
        return { data: data || null, error: null };
      } catch (error) {
        return { data: null, error: error.message };
      }
    },

    // Fetch slide progress for a presentation
    fetchSlideProgress: async (userId, presentationId) => {
      try {
        const { data, error } = await supabase
          .from(TABLES.SLIDE_PROGRESS)
          .select('*')
          .eq('user_id', userId)
          .eq('presentation_id', presentationId)
          .order('viewed_at', { ascending: true });

        if (error) throw error;
        return { data: data || [], error: null };
      } catch (error) {
        return { data: [], error: error.message };
      }
    },

    // Track quiz completion within presentations
    submitPresentationQuizAttempt: async (userId, quizId, slideId, presentationId, answers, score, maxScore = null) => {
      try {
        // Submit the quiz attempt using existing function
        const quizResult = await get().actions.submitQuizAttempt(userId, quizId, answers, score, maxScore);

        if (quizResult.error) throw new Error(quizResult.error);

        // Update slide progress with quiz data
        const metadata = {
          completed: true,
          quizScores: {
            [quizId]: {
              score,
              maxScore,
              percentage: quizResult.data.percentage,
              passed: quizResult.data.passed,
              completed_at: new Date().toISOString()
            }
          },
          interactions: {
            quiz_completed: true,
            quiz_id: quizId
          }
        };

        // Get slide info for better tracking
        const { data: slideData } = await supabase
          .from(TABLES.PRESENTATION_SLIDES)
          .select('slide_number, presentation_id, lesson_id')
          .eq('id', slideId)
          .single();

        await get().actions.updateSlideProgress(
          userId,
          slideId,
          presentationId,
          slideData?.lesson_id,
          slideData?.course_id, // We'll need to get this from lesson or presentation
          {
            ...metadata,
            slideOrder: slideData?.slide_number
          }
        );

        return { data: quizResult.data, error: null };
      } catch (error) {
        console.error('Error submitting presentation quiz attempt:', error);
        return { data: null, error: error.message };
      }
    },

    // Get detailed progress analytics for presentations
    getPresentationAnalytics: async (userId, courseId = null) => {
      try {
        let query = supabase
          .from(TABLES.PRESENTATION_PROGRESS)
          .select(`
            *,
            presentation:${TABLES.LESSON_PRESENTATIONS}(id, title, lesson_id),
            lesson:${TABLES.LESSONS}(id, title, course_id)
          `)
          .eq('user_id', userId);

        if (courseId) {
          query = query.eq('course_id', courseId);
        }

        const { data, error } = await query.order('last_accessed', { ascending: false });

        if (error) throw error;

        // Calculate summary statistics
        const analytics = {
          total_presentations: data?.length || 0,
          completed_presentations: data?.filter(p => p.completed).length || 0,
          total_slides_viewed: data?.reduce((sum, p) => sum + (p.completed_slides || 0), 0) || 0,
          total_time_spent: data?.reduce((sum, p) => sum + (p.total_time_spent_seconds || 0), 0) || 0,
          average_completion_rate: data?.length > 0 ?
            data.reduce((sum, p) => sum + (p.progress_percentage || 0), 0) / data.length : 0,
          presentations: data || []
        };

        return { data: analytics, error: null };
      } catch (error) {
        console.error('Error getting presentation analytics:', error);
        return { data: null, error: error.message };
      }
    },

    // Debug function to test database connection and tables
    testPresentationTables: async () => {
      try {
        // Test if lesson_presentations table exists
        const { data: presentations, error: presError } = await supabase
          .from(TABLES.LESSON_PRESENTATIONS)
          .select('id')
          .limit(1);
        
        if (presError) {
          return { 
            success: false, 
            error: `lesson_presentations table error: ${presError.message}`,
            tables: { lesson_presentations: false, presentation_slides: false }
          };
        }

        // Test if presentation_slides table exists
        const { data: slides, error: slidesError } = await supabase
          .from(TABLES.PRESENTATION_SLIDES)
          .select('id')
          .limit(1);
        
        if (slidesError) {
          return { 
            success: false, 
            error: `presentation_slides table error: ${slidesError.message}`,
            tables: { lesson_presentations: true, presentation_slides: false }
          };
        }

        return { 
          success: true, 
          error: null,
          tables: { lesson_presentations: true, presentation_slides: true }
        };
      } catch (error) {
        return { 
          success: false, 
          error: error.message,
          tables: { lesson_presentations: false, presentation_slides: false }
        };
      }
    },
  },
}));

export { useCourseStore }; 