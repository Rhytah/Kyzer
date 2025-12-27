// src/pages/courses/LessonView.jsx
import { useState, useEffect, useCallback, useRef, useMemo, memo } from 'react'
import ReactPlayer from 'react-player'
import { useParams, useNavigate, useLocation, useSearchParams } from 'react-router-dom'
import { 
  Play, 
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  Maximize,
  CheckCircle,
  FileText,
  Download,
  MessageCircle,
  BookOpen,
  Clock,
  ChevronLeft,
  ChevronRight,
  Settings,
  RotateCcw,
  PanelLeftClose,
  PanelLeftOpen,
  Award,
  ExternalLink,
  File
} from 'lucide-react'
import { ScormPlayer } from '@/components/course'
import PresentationViewer from '@/components/course/PresentationViewer'
import CertificatePreviewModal from '@/components/course/CertificatePreviewModal'
import { useCourseStore } from '@/store/courseStore'
import { useAuth } from '@/hooks/auth/useAuth'
import { 
  Button, 
  Card, 
  LoadingSpinner, 
  useToast,
  ActionButton,
  StatusBadge,
  ContentTypeIcon,
  Modal
} from '@/components/ui'

// Custom hook for intersection observer (lazy loading)
const useIntersectionObserver = (options = {}) => {
  const [isIntersecting, setIsIntersecting] = useState(false)
  const [hasIntersected, setHasIntersected] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting)
      if (entry.isIntersecting && !hasIntersected) {
        setHasIntersected(true)
      }
    }, options)

    observer.observe(element)
    return () => observer.disconnect()
  }, [options, hasIntersected])

  return [ref, isIntersecting, hasIntersected]
}

// Normalize URL to ensure it has a protocol (for existing data that might not have it)
const normalizeUrl = (url) => {
  if (!url) return url;
  const trimmed = url.trim();
  // If URL doesn't start with http:// or https://, add https://
  if (!trimmed.match(/^https?:\/\//i)) {
    return `https://${trimmed}`;
  }
  return trimmed;
};

// Download file helper function
const downloadFile = (url, filename) => {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename || '';
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export default function LessonView() {
  const { courseId, lessonId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const location = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()
  
  // Store selectors - individual to prevent infinite loops
  const courses = useCourseStore(state => state.courses)
  const enrolledCourses = useCourseStore(state => state.enrolledCourses)
  const courseProgress = useCourseStore(state => state.courseProgress)
  const actions = useCourseStore(state => state.actions)
  const fetchEnrolledCourses = useCourseStore(state => state.actions.fetchEnrolledCourses)
  
  const [lesson, setLesson] = useState(null)
  const [course, setCourse] = useState(null)
  
  // Get course from store as fallback if local state isn't set yet
  const courseFromStore = useMemo(() => {
    if (course) return course
    return courses.find(c => c.id === courseId) || null
  }, [course, courses, courseId])
  
  // Check if user can manage this course (course creator or has permissions)
  const canManageCourse = useMemo(() => {
    if (!user?.id || !courseFromStore) return false
    return courseFromStore.created_by === user.id
  }, [user?.id, courseFromStore])
  const [lessons, setLessons] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentTime, setCurrentTime] = useState(0)
  const [isCompleted, setIsCompleted] = useState(false)
  const [showNotes, setShowNotes] = useState(false)
  const [notes, setNotes] = useState('')
  const [videoLoading, setVideoLoading] = useState(false)
  const [videoError, setVideoError] = useState(null)
  const [isCompleting, setIsCompleting] = useState(false)
  const [haltVideo, setHaltVideo] = useState(false)
  const [playerKey, setPlayerKey] = useState(0)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [quizzesByLesson, setQuizzesByLesson] = useState({})
  const [quizCompletionStatus, setQuizCompletionStatus] = useState({})
  const [quizQuestionsById, setQuizQuestionsById] = useState({})
  const [knowledgeCheckResults, setKnowledgeCheckResults] = useState({})
  const [activeKnowledgeCheckId, setActiveKnowledgeCheckId] = useState(() => searchParams.get('knowledgeCheck'))
  const [showCertificateModal, setShowCertificateModal] = useState(false)
  const [courseFinalAssessment, setCourseFinalAssessment] = useState(null)
  const [finalAssessmentCompleted, setFinalAssessmentCompleted] = useState(false)
  const { success, error: showError } = useToast()
  const knowledgeChecks = useMemo(() => {
    if (!lesson?.id) return [];
    const lessonQuizzes = quizzesByLesson[lesson.id] || [];
    return lessonQuizzes.filter(quizEntry => quizEntry.quiz_type === 'non_graded');
  }, [lesson?.id, quizzesByLesson]);
  const activateKnowledgeCheck = useCallback(
    (quizId) => {
      setActiveKnowledgeCheckId(quizId);
      const nextParams = new URLSearchParams(searchParams);
      if (quizId) {
        nextParams.set('knowledgeCheck', quizId);
      } else {
        nextParams.delete('knowledgeCheck');
      }
      setSearchParams(nextParams, { replace: true });
    },
    [searchParams, setSearchParams]
  );

  const activeKnowledgeCheck = useMemo(
    () => knowledgeChecks.find(quiz => quiz.id === activeKnowledgeCheckId) || null,
    [knowledgeChecks, activeKnowledgeCheckId]
  );

  const firstIncompleteKnowledgeCheck = useMemo(
    () => knowledgeChecks.find(quiz => !quizCompletionStatus[quiz.id]) || null,
    [knowledgeChecks, quizCompletionStatus]
  );

  useEffect(() => {
    if (!knowledgeChecks.length && activeKnowledgeCheckId) {
      setActiveKnowledgeCheckId(null);
    }
  }, [knowledgeChecks.length, activeKnowledgeCheckId]);

  // Calculate course progress data first (needed for isCourseCompleted)
  const courseProgressData = useMemo(() => {
    const totalLessons = lessons.length || 0;
    const progressPercentage = course && courseProgress[courseId] && totalLessons > 0 ? 
      Math.round((Object.values(courseProgress[courseId]).filter(p => p.completed).length / totalLessons) * 100) : 0;
    
    return {
      percentage: progressPercentage,
      completedCount: course && courseProgress[courseId] ? 
        Object.values(courseProgress[courseId]).filter(p => p.completed).length : 0,
      totalCount: totalLessons
    };
  }, [course, courseProgress, courseId, lessons.length]);

  // Check if course is completed (for review mode) - must be defined before goToNextLesson
  const isCourseCompleted = useMemo(() => {
    if (!courseId || !user?.id) return false;
    
    // Check enrollment progress first
    const enrollment = enrolledCourses?.find(e => 
      (e.course_id === courseId || e.id === courseId) && e.progress_percentage >= 100
    );
    
    if (enrollment) return true;
    
    // Fallback: check course progress from lesson completion
    return courseProgressData.percentage >= 100;
  }, [courseId, user?.id, enrolledCourses, courseProgressData.percentage]);

  // Check if minimum time requirement is met for current lesson
  const timeRequirementMet = useMemo(() => {
    if (isCourseCompleted) return true; // Allow navigation in review mode
    if (!user?.id || !lesson || !course) return false;
    
    const progress = courseProgress[course.id]?.[lesson.id];
    if (!progress) return false;
    
    // If no minimum time required, allow progression
    if (!progress.minimum_time_required) return true;
    
    // Check if review is completed (time spent >= minimum required)
    return progress.review_completed === true;
  }, [isCourseCompleted, user?.id, lesson, course, courseProgress, courseId]);

  // Calculate time remaining for display
  const timeRemainingInfo = useMemo(() => {
    if (isCourseCompleted || timeRequirementMet) return null;
    if (!user?.id || !lesson || !course) return null;
    
    const progress = courseProgress[course.id]?.[lesson.id];
    if (!progress || !progress.minimum_time_required) return null;
    
    const timeSpent = progress.time_spent_seconds || 0;
    const timeRequired = progress.minimum_time_required;
    const timeRemaining = Math.max(0, timeRequired - timeSpent);
    const minutesRemaining = Math.ceil(timeRemaining / 60);
    const totalMinutesRequired = Math.ceil(timeRequired / 60);
    
    return {
      timeRemaining,
      minutesRemaining,
      totalMinutesRequired,
      timeSpent,
      timeRequired
    };
  }, [isCourseCompleted, timeRequirementMet, user?.id, lesson, course, courseProgress, courseId]);

  const goToNextLesson = useCallback(async (shouldBypassKnowledgeChecks = false) => {
    // For completed courses, allow free navigation (review mode)
    if (isCourseCompleted) {
      // Skip all restrictions for completed courses
      shouldBypassKnowledgeChecks = true;
    } else {
      // Check if lesson has been reviewed for minimum time (only for incomplete courses)
      if (user?.id && lesson && course) {
        const progress = courseProgress[course.id]?.[lesson.id];
        if (progress && progress.minimum_time_required && !progress.review_completed) {
          const timeRemaining = progress.minimum_time_required - (progress.time_spent_seconds || 0);
          const minutesRemaining = Math.ceil(timeRemaining / 60);
          showError(`Please review this lesson for at least ${Math.ceil(progress.minimum_time_required / 60)} minutes before proceeding. You need ${minutesRemaining} more minute${minutesRemaining !== 1 ? 's' : ''}.`);
          return;
        }
      }
      
      if (!shouldBypassKnowledgeChecks && firstIncompleteKnowledgeCheck) {
        if (firstIncompleteKnowledgeCheck.id !== activeKnowledgeCheckId) {
          activateKnowledgeCheck(firstIncompleteKnowledgeCheck.id);
        }
        showError('Complete the knowledge check before moving on.');
        return;
      }
    }

    if (course && lesson) {
      try {
        const { data: lessonsData } = await actions.fetchCourseLessons(course.id);
        if (lessonsData && Object.keys(lessonsData).length > 0) {
          const flatLessons = [];
          Object.values(lessonsData).forEach(moduleData => {
            if (moduleData.lessons && Array.isArray(moduleData.lessons)) {
              flatLessons.push(...moduleData.lessons);
            }
          });

          flatLessons.sort((a, b) => (a.order_index || 0) - (b.order_index || 0));

          const currentIndex = flatLessons.findIndex(l => l.id === lessonId);
          const nextLesson = flatLessons[currentIndex + 1];
          if (nextLesson) {
            activateKnowledgeCheck(null);
            navigate(`/app/courses/${courseId}/lesson/${nextLesson.id}`);
          } else {
            const allLessonsCompleted = lessons.every(lessonEntry => (
              courseProgress[courseId]?.[lessonEntry.id]?.completed
            ));

            if (!allLessonsCompleted) {
              showError('Keep going! Mark every lesson as completed to finish the course.');
              return;
            }

            activateKnowledgeCheck(null);
            
            // Check if there's a course-level final assessment that hasn't been completed
            if (courseFinalAssessment && !finalAssessmentCompleted) {
              navigate(`/app/courses/${courseId}/quiz/${courseFinalAssessment.id}`);
            } else {
              navigate(`/app/courses/${courseId}/completion`);
            }
          }
        }
      } catch (_) {
        // Ignore navigation errors
      }
    }
  }, [
    firstIncompleteKnowledgeCheck,
    activeKnowledgeCheckId,
    showError,
    course,
    lesson,
    actions,
    lessonId,
    courseId,
    navigate,
    activateKnowledgeCheck,
    lessons,
    courseProgress,
    courseFinalAssessment,
    finalAssessmentCompleted,
    isCourseCompleted
  ]);

  const advanceAfterKnowledgeCheck = useCallback(() => {
    const remaining = knowledgeChecks.filter(quiz => !quizCompletionStatus[quiz.id]);

    if (remaining.length > 0) {
      activateKnowledgeCheck(remaining[0].id);
      return;
    }

    activateKnowledgeCheck(null);
    goToNextLesson(true);
  }, [knowledgeChecks, quizCompletionStatus, activateKnowledgeCheck, goToNextLesson]);

  const handleKnowledgeCheckModalClose = useCallback(() => {
    if (!activeKnowledgeCheckId) {
      return;
    }

    const isCompleted = Boolean(quizCompletionStatus[activeKnowledgeCheckId]);
    if (isCompleted) {
      advanceAfterKnowledgeCheck();
      return;
    }

    activateKnowledgeCheck(null);
  }, [activeKnowledgeCheckId, quizCompletionStatus, advanceAfterKnowledgeCheck, activateKnowledgeCheck]);

  const handleKnowledgeCheckContinue = useCallback(
    (quizId) => {
      const isCompleted = Boolean(quizCompletionStatus[quizId]);
      if (!isCompleted) {
        return;
      }

      advanceAfterKnowledgeCheck();
    },
    [quizCompletionStatus, advanceAfterKnowledgeCheck]
  );

  const knowledgeCheckParam = useMemo(() => searchParams.get('knowledgeCheck'), [searchParams]);

  // Player refs
  const playerRef = useRef(null)
  const videoReadyRef = useRef(false)
  const videoTimeoutRef = useRef(null)

  useEffect(() => {
    if (knowledgeCheckParam === activeKnowledgeCheckId) {
      return;
    }

    if (knowledgeCheckParam) {
      setActiveKnowledgeCheckId(knowledgeCheckParam);
      return;
    }

    if (!knowledgeCheckParam && activeKnowledgeCheckId) {
      setActiveKnowledgeCheckId(null);
    }
  }, [knowledgeCheckParam, activeKnowledgeCheckId])

  // Effect to sync playback position when using ReactPlayer
  useEffect(() => {
    if (playerRef.current && lesson?.content_type === 'video' && currentTime > 0) {
      try {
        playerRef.current.seekTo(currentTime, 'seconds')
      } catch (_) {}
    }
  }, [lesson?.content_type, currentTime])

  // Effect to handle video loading timeout
  useEffect(() => {
    if (lesson?.content_type === 'video' && lesson?.content_url && !isYouTubeUrl(lesson.content_url)) {
      setVideoLoading(true);
      setVideoError(null);
      setHaltVideo(false);
      videoReadyRef.current = false;
      if (videoTimeoutRef.current) {
        clearTimeout(videoTimeoutRef.current);
      }
      videoTimeoutRef.current = setTimeout(() => {
        if (!videoReadyRef.current) {
          setVideoError({
            error: null,
            errorCode: 'TIMEOUT',
            errorMessage: 'Video playback timed out. Please check your connection and try again.',
            networkState: 3,
            readyState: 0,
            src: lesson.content_url
          });
          setVideoLoading(false);
          setHaltVideo(true);
        }
      }, 45000);
      return () => {
        if (videoTimeoutRef.current) {
          clearTimeout(videoTimeoutRef.current);
          videoTimeoutRef.current = null;
        }
      };
    }
  }, [lesson?.content_type, lesson?.content_url]);

  useEffect(() => {
    if (!activeKnowledgeCheckId) return

    if (typeof document === 'undefined') return

    const scrollToKnowledgeCheck = () => {
      const element = document.getElementById(`knowledge-check-${activeKnowledgeCheckId}`)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }

    const timeoutId = setTimeout(scrollToKnowledgeCheck, 150)
    return () => clearTimeout(timeoutId)
  }, [activeKnowledgeCheckId])

  // Track if data has been loaded to prevent infinite loops
  const dataLoadedRef = useRef({ courseId: null, lessonId: null });
  const isLoadingRef = useRef(false);

  // Load course and lesson data from store
  useEffect(() => {
    // Early return if no courseId or lessonId
    if (!courseId || !lessonId) {
      return;
    }

    // Prevent re-fetching if we've already loaded data for this course/lesson
    if (dataLoadedRef.current.courseId === courseId && dataLoadedRef.current.lessonId === lessonId) {
      return;
    }

    // Prevent concurrent loads
    if (isLoadingRef.current) {
      return;
    }

    // Set loading state when courseId or lessonId changes
    // This happens when navigating to a new course/lesson
    setLoading(true);

    const loadCourseData = async () => {
      isLoadingRef.current = true;
      try {
        // Get current courses from store directly to avoid dependency issues
        let coursesToUse = useCourseStore.getState().courses;
        if (coursesToUse.length === 0) {
          if (user?.id) {
            await actions.fetchCourses({}, user.id)
          } else {
            await actions.fetchCourses()
          }
          // Get fresh courses after fetch
          coursesToUse = useCourseStore.getState().courses;
        }
        
        // Find the current course
        const foundCourse = coursesToUse.find(c => c.id === courseId)
        if (foundCourse) {
          setCourse(foundCourse)
          actions.setCurrentCourse(foundCourse)
          
          // Fetch course lessons
          const { data: fetchedLessons } = await actions.fetchCourseLessons(courseId)
          if (fetchedLessons && Object.keys(fetchedLessons).length > 0) {
            // Convert grouped lessons to flat array for navigation
            const flatLessons = [];
            Object.values(fetchedLessons).forEach(moduleData => {
              if (moduleData.lessons && Array.isArray(moduleData.lessons)) {
                flatLessons.push(...moduleData.lessons);
              }
            });
            
            // Sort lessons by their order_index
            flatLessons.sort((a, b) => (a.order_index || 0) - (b.order_index || 0));
            
            setLessons(prevLessons => {
              const isSameLength = prevLessons.length === flatLessons.length;
              const hasSameOrder = isSameLength && prevLessons.every((lessonItem, index) => lessonItem.id === flatLessons[index].id);
              return hasSameOrder ? prevLessons : flatLessons;
            })

            // Fetch quizzes for the whole course to build lesson->quizzes map
            try {
              const { data: courseQuizzes } = await actions.fetchQuizzes(courseId)
              if (courseQuizzes && Array.isArray(courseQuizzes)) {
                const map = {};
                const questionMap = {};
                // Sort quizzes by order_index first, then by created_at
                const sorted = [...courseQuizzes].sort((a, b) => {
                  if (a.order_index !== null && b.order_index !== null) {
                    return a.order_index - b.order_index;
                  }
                  if (a.order_index !== null) return -1;
                  if (b.order_index !== null) return 1;
                  return new Date(a.created_at) - new Date(b.created_at);
                });

                // Separate course-level final assessments from lesson quizzes
                const courseLevelFinalAssessments = [];
                const quizzesWithQuestions = [];
                
                for (const quiz of sorted) {
                  // Check if quiz has questions
                  try {
                    const { data: questions } = await actions.fetchQuizQuestions(quiz.id);
                    if (questions && questions.length > 0) {
                      // Course-level final assessment: graded quiz without lesson_id
                      if (!quiz.lesson_id && quiz.quiz_type === 'graded') {
                        courseLevelFinalAssessments.push({
                          ...quiz,
                          question_count: questions.length
                        });
                        questionMap[quiz.id] = questions;
                      } else if (quiz.lesson_id) {
                        // Lesson-level quiz
                        quizzesWithQuestions.push({
                          ...quiz,
                          question_count: questions.length
                        });
                        questionMap[quiz.id] = questions;
                      }
                    }
                  } catch (error) {
                    // Skip this quiz if we can't fetch its questions
                  }
                }

                // Set the first course-level final assessment (if any)
                if (courseLevelFinalAssessments.length > 0) {
                  setCourseFinalAssessment(courseLevelFinalAssessments[0]);
                  
                  // Check if final assessment is completed
                  if (user?.id) {
                    try {
                      const { data: attempts } = await actions.fetchQuizAttempts(user.id, courseLevelFinalAssessments[0].id);
                      const hasPassedAttempt = attempts && attempts.some(attempt => attempt.passed);
                      setFinalAssessmentCompleted(hasPassedAttempt || false);
                    } catch (error) {
                      setFinalAssessmentCompleted(false);
                    }
                  }
                } else {
                  setCourseFinalAssessment(null);
                  setFinalAssessmentCompleted(false);
                }

                // Build the map with only quizzes that have questions, sorted by order_index
                quizzesWithQuestions.forEach(q => {
                  if (!map[q.lesson_id]) map[q.lesson_id] = [];
                  map[q.lesson_id].push(q);
                });

                // Sort quizzes within each lesson by order_index
                Object.keys(map).forEach(lessonId => {
                  map[lessonId].sort((a, b) => {
                    if (a.order_index !== null && b.order_index !== null) {
                      return a.order_index - b.order_index;
                    }
                    if (a.order_index !== null) return -1;
                    if (b.order_index !== null) return 1;
                    return new Date(a.created_at) - new Date(b.created_at);
                  });
                });

                setQuizzesByLesson(map);
                setQuizQuestionsById(questionMap);
              } else {
                setQuizzesByLesson({})
                setQuizQuestionsById({})
                setCourseFinalAssessment(null)
                setFinalAssessmentCompleted(false)
              }
            } catch (_) {
              setQuizzesByLesson({})
              setQuizQuestionsById({})
              setCourseFinalAssessment(null)
              setFinalAssessmentCompleted(false)
            }
            // Find the current lesson
            const foundLesson = flatLessons.find(l => l.id === lessonId)
            if (foundLesson) {
              setLesson(foundLesson)
              actions.setCurrentLesson(foundLesson)
              
              // Check if lesson is completed and load existing time
              if (user?.id) {
                const { data: progress } = await actions.fetchCourseProgress(user.id, courseId)
                const lessonProgress = progress?.[lessonId]
                setIsCompleted(lessonProgress?.completed || false)
              }
            }
          }
        }
        
        // Mark data as loaded for this course/lesson combination
        dataLoadedRef.current = { courseId, lessonId };
        setLoading(false)
      } catch (_) {
        // Handle error silently or set error state if needed
        setLoading(false)
        // Don't mark as loaded on error - allow retry on next render
      } finally {
        isLoadingRef.current = false;
      }
    }

    if (courseId && lessonId) {
      loadCourseData()
    }
  }, [courseId, lessonId, user?.id])

  // Fetch enrolled courses to check completion status
  useEffect(() => {
    if (user?.id) {
      fetchEnrolledCourses(user.id)
    }
  }, [user?.id, fetchEnrolledCourses])

  const saveProgress = useCallback(async (additionalTime = 0, completedOverride = null) => {
    // Validate all required IDs before making any database calls
    if (!user?.id || !lesson?.id || !course?.id) {
      return; // Silently skip if data not ready
    }
    
    // Additional validation to ensure IDs are not the string "undefined"
    if (user.id === 'undefined' || lesson.id === 'undefined' || course.id === 'undefined') {
      return;
    }
    
    try {
      const completedFlag = completedOverride !== null ? completedOverride : isCompleted;
      // Get current review status before update
      const currentProgress = courseProgress[course.id]?.[lesson.id];
      const wasReviewCompleted = currentProgress?.review_completed || false;
      
      const result = await actions.updateLessonProgress(
        user.id,
        lesson.id,
        course.id,
        completedFlag,
        { 
          timeSpent: additionalTime,
          lastAccessed: new Date().toISOString()
        }
      )
      
      // If review_completed just transitioned from false to true, refresh progress to ensure UI updates
      if (result?.reviewCompleted && !wasReviewCompleted) {
        // Refresh progress to ensure UI reflects the change
        await actions.fetchCourseProgress(user.id, course.id)
      }
    } catch (_) {
      // Handle error silently or set error state if needed
    }
  }, [user?.id, lesson?.id, course?.id, isCompleted, actions, courseProgress, courseId])

  // Track time for all content types (videos, PDFs, text, etc.)
  useEffect(() => {
    if (!lesson || !course || !user?.id) return
    
    let intervalId = null
    let lastSaveTime = Date.now()
    let sessionStart = Date.now()
    
    // For videos, track based on video playback position
    // For other content (PDF, text, etc.), track based on page visibility
    const trackTime = () => {
      if (document.visibilityState === 'visible') {
        const now = Date.now()
        const timeSinceLastSave = Math.floor((now - lastSaveTime) / 1000)
        
        // Save every 30 seconds
        if (timeSinceLastSave >= 30) {
          saveProgress(timeSinceLastSave)
          lastSaveTime = now
        }
      }
    }
    
    // Start tracking immediately
    sessionStart = Date.now()
    lastSaveTime = Date.now()
    
    // Check every 30 seconds
    intervalId = setInterval(trackTime, 30000)
    
    return () => {
      if (intervalId) clearInterval(intervalId)
      // Save any remaining time on unmount
      if (document.visibilityState === 'visible') {
        const finalTime = Math.floor((Date.now() - lastSaveTime) / 1000)
        if (finalTime > 0) {
          saveProgress(finalTime)
        }
      }
    }
  }, [lesson, course, user?.id, saveProgress])

  const markAsCompleted = async () => {
    if (firstIncompleteKnowledgeCheck) {
      activateKnowledgeCheck(firstIncompleteKnowledgeCheck.id);
      showError('Please complete the knowledge check for this lesson before marking it as complete.');
      return;
    }

    if (user?.id && lesson && course) {
      try {
        setIsCompleting(true)
        // Time tracking is handled automatically by the interval
        // Just mark as complete - time will be saved by the tracking interval
        const result = await actions.updateLessonProgress(
          user.id,
          lesson.id,
          course.id,
          true,
          { 
            timeSpent: 0, // Time is accumulated automatically, just pass 0 here
            completedAt: new Date().toISOString()
          }
        )
        
        // Check if completion was blocked due to minimum time requirement
        if (result && !result.canComplete && result.minimumTimeRequired) {
          const timeRemaining = result.minimumTimeRequired - (result.timeSpentSeconds || 0);
          const minutesRemaining = Math.ceil(timeRemaining / 60);
          showError(`Please review the material for at least ${Math.ceil(result.minimumTimeRequired / 60)} minutes before completing. You need ${minutesRemaining} more minute${minutesRemaining !== 1 ? 's' : ''}.`);
          setIsCompleting(false);
          return;
        }
        
        setIsCompleted(true)
        success('Lesson marked as complete!')
        // Navigate to next lesson if available
        const { data: lessonsData } = await actions.fetchCourseLessons(course.id)
        if (lessonsData && Object.keys(lessonsData).length > 0) {
          const flatLessons = [];
          Object.values(lessonsData).forEach(moduleData => {
            if (moduleData.lessons && Array.isArray(moduleData.lessons)) {
              flatLessons.push(...moduleData.lessons);
            }
          });
          flatLessons.sort((a, b) => (a.order_index || 0) - (b.order_index || 0));
          const currentIndex = flatLessons.findIndex(l => l.id === lesson.id)
          const nextLesson = flatLessons[currentIndex + 1]
          if (nextLesson) {
            navigate(`/app/courses/${courseId}/lesson/${nextLesson.id}`)
          }
        }
      } catch (error) {
        showError('Failed to mark lesson as complete. Please try again.')
      } finally {
        setIsCompleting(false)
      }
    }
  }

  

  const goToPreviousLesson = async () => {
    if (course && lesson) {
      try {
        const { data: lessonsData } = await actions.fetchCourseLessons(course.id)
        if (lessonsData && Object.keys(lessonsData).length > 0) {
          // Convert grouped lessons to flat array
          const flatLessons = [];
          Object.values(lessonsData).forEach(moduleData => {
            if (moduleData.lessons && Array.isArray(moduleData.lessons)) {
              flatLessons.push(...moduleData.lessons);
            }
          });
          
          // Sort lessons by their order_index
          flatLessons.sort((a, b) => (a.order_index || 0) - (b.order_index || 0));
          
          const currentIndex = flatLessons.findIndex(l => l.id === lessonId)
          const prevLesson = flatLessons[currentIndex - 1]
          if (prevLesson) {
            navigate(`/app/courses/${courseId}/lesson/${prevLesson.id}`)
          }
        }
      } catch (error) {
        // Handle error silently or set error state if needed
      }
    }
  }

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = Math.floor(seconds % 60)
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  // Helper function to check if URL is a valid video file
  const isValidVideoUrl = (url) => {
    if (!url) return false;
    
    // Check if it's a YouTube URL
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      return false; // YouTube URLs are not direct video files
    }
    
    // Check if it's a valid HTTP/HTTPS URL
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return false;
    }
    
    // Check if it has a video file extension
    const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi', '.mkv'];
    const hasVideoExtension = videoExtensions.some(ext => 
      url.toLowerCase().includes(ext)
    );
    
    return hasVideoExtension;
  };




  // Check if a quiz is completed
  const isQuizCompleted = useCallback(async (quizId) => {
    if (!user?.id || !quizId) return false;
    try {
      const { data } = await actions.fetchQuizAttempts(user.id, quizId);
      return data && data.length > 0 && data.some(attempt => attempt.completed || attempt.completed_at);
    } catch (error) {
      return false;
    }
  }, [user?.id, actions]);

  // Load quiz completion status for all quizzes
  const loadQuizCompletionStatus = useCallback(async () => {
    if (!user?.id || !quizzesByLesson) return

    const status = {}
    for (const [lessonId, quizzes] of Object.entries(quizzesByLesson)) {
      for (const quiz of quizzes) {
        try {
          const completed = await isQuizCompleted(quiz.id)
          status[quiz.id] = completed
        } catch (error) {
          status[quiz.id] = false
        }
      }
    }
    setQuizCompletionStatus(status)
  }, [user?.id, quizzesByLesson, isQuizCompleted])

  // Load quiz completion status when quizzes are loaded
  useEffect(() => {
    if (Object.keys(quizzesByLesson).length > 0) {
      loadQuizCompletionStatus()
    }
  }, [quizzesByLesson, loadQuizCompletionStatus])

  // (Removed unused getMimeTypeFromUrl)

  // Memoized helper functions
  const isYouTubeUrl = useCallback((url) => {
    if (!url) return false;
    return url.includes('youtube.com') || url.includes('youtu.be');
  }, []);

  const getYouTubeVideoId = useCallback((url) => {
    if (!isYouTubeUrl(url)) return null;
    
    // Handle youtu.be format
    if (url.includes('youtu.be/')) {
      return url.split('youtu.be/')[1]?.split('?')[0];
    }
    
    // Handle youtube.com format
    if (url.includes('youtube.com/watch')) {
      const urlParams = new URLSearchParams(url.split('?')[1]);
      return urlParams.get('v');
    }
    
    return null;
  }, [isYouTubeUrl]);

  // Memoized markdown rendering functions
  const escapeHtml = useCallback((unsafe) => {
    return unsafe
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll('\'', '&#039;');
  }, []);

  const renderMarkdownToHtml = useCallback((md) => {
    const escaped = escapeHtml(md);
    let html = escaped;
    html = html.replace(/^######\s?(.*)$/gm, '<h6>$1</h6>')
               .replace(/^#####\s?(.*)$/gm, '<h5>$1</h5>')
               .replace(/^####\s?(.*)$/gm, '<h4>$1</h4>')
               .replace(/^###\s?(.*)$/gm, '<h3>$1</h3>')
               .replace(/^##\s?(.*)$/gm, '<h2>$1</h2>')
               .replace(/^#\s?(.*)$/gm, '<h1>$1</h1>');
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
               .replace(/\*(.*?)\*/g, '<em>$1</em>');
    html = html.replace(/\[(.*?)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1<\/a>');
    html = html.replace(/^(?:-\s.*(?:\n|$))+?/gm, (block) => {
      const items = block.trim().split(/\n/).map(l => l.replace(/^-\s?/, '').trim()).filter(Boolean);
      return items.length ? '<ul>' + items.map(i => `<li>${i}<\/li>`).join('') + '<\/ul>' : block;
    });
    html = html.replace(/^(?:\d+\.\s.*(?:\n|$))+?/gm, (block) => {
      const items = block.trim().split(/\n/).map(l => l.replace(/^\d+\.\s?/, '').trim()).filter(Boolean);
      return items.length ? '<ol>' + items.map(i => `<li>${i}<\/li>`).join('') + '<\/ol>' : block;
    });
    html = html.replace(/\n{2,}/g, '</p><p>');
    html = `<p>${html.replace(/\n/g, '<br/>')}<\/p>`;
    return html;
  }, [escapeHtml]);

  const parseStoredText = useCallback((raw) => {
    if (!raw) return { format: 'plaintext', text: '' };
    const match = raw.match(/^<!--content_format:(markdown|html|plaintext)-->([\s\S]*)/);
    if (match) {
      return { format: match[1], text: match[2] };
    }
    return { format: 'plaintext', text: raw };
  }, []);

  // Memoized values for the main component
  const lessonDescriptionHtml = useMemo(() => {
    // For presentation-type lessons, show the lesson description or content
    if (lesson?.content_type === 'presentation') {
      const description = lesson?.description || lesson?.content_text;
      if (description && !description.startsWith('{')) {
        // If it's not JSON data, show the description
        return <p className="text-text-light">{description}</p>;
      }
      // For presentations with JSON data, show a generic message
      return <p className="text-text-light">This lesson contains a presentation with slides.</p>;
    }
    
    const raw = lesson?.content_text || lesson?.description || '';
    if (!raw) {
      return <p className="text-text-light">No description available</p>;
    }
    
    // Check if content_text contains JSON data (split PDF data)
    if (raw.startsWith('{') && raw.includes('"images"')) {
      return <p className="text-text-light">This lesson contains split PDF content.</p>;
    }
    
    const parsed = parseStoredText(raw);
    const html = parsed.format === 'markdown'
      ? renderMarkdownToHtml(parsed.text)
      : parsed.format === 'html'
        ? parsed.text
        : `<p>${escapeHtml(parsed.text).replace(/\n/g, '<br/>')}<\/p>`;
    return (
      <div
        className="prose max-w-none text-text-light"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  }, [lesson?.content_type, lesson?.content_text, lesson?.description, parseStoredText, renderMarkdownToHtml, escapeHtml]);

  const lessonContentParagraphs = useMemo(() => {
    if (!lesson?.content_text) {
      return <p className="text-text-muted">No content available for this lesson.</p>;
    }
    return lesson.content_text.split('\n\n').map((paragraph, index) => (
      <p key={index} className="mb-4">{paragraph}</p>
    ));
  }, [lesson?.content_text]);


  // Memoized LazyIframe component for performance
  const LazyIframe = memo(({ src, title, className, onLoad, frameBorder, allowFullScreen }) => {
    const [ref, isIntersecting, hasIntersected] = useIntersectionObserver({
      threshold: 0.1,
      rootMargin: '50px'
    });

    return (
      <div ref={ref} className={className}>
        {hasIntersected ? (
          <iframe
            src={src}
            title={title}
            className="w-full h-full"
            loading="lazy"
            onLoad={onLoad}
            frameBorder={frameBorder}
            allowFullScreen={allowFullScreen}
          />
        ) : (
          <div className="w-full h-full bg-gray-100 flex items-center justify-center">
            <div className="text-gray-500">Loading...</div>
          </div>
        )}
      </div>
    );
  });

  LazyIframe.displayName = 'LazyIframe';

  // Memoized PDF Viewer component with navigation and time tracking
  const PDFViewer = memo(({ pdfUrl, onTimeTrack }) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(null);
    const pdfViewStartTime = useRef(null);
    const lastSaveTime = useRef(null);
    const onTimeTrackRef = useRef(onTimeTrack);

    // Update ref when onTimeTrack changes, but don't trigger effect
    useEffect(() => {
      onTimeTrackRef.current = onTimeTrack;
    }, [onTimeTrack]);

    useEffect(() => {
      setIsLoaded(false);
      setCurrentPage(1);
      pdfViewStartTime.current = Date.now();
      lastSaveTime.current = Date.now();
      
      // Track time when PDF is viewed
      const trackPDFTime = () => {
        if (document.visibilityState === 'visible' && pdfViewStartTime.current && lastSaveTime.current && onTimeTrackRef.current) {
          const now = Date.now();
          const timeSinceLastSave = Math.floor((now - lastSaveTime.current) / 1000);
          
          if (timeSinceLastSave >= 30) {
            onTimeTrackRef.current(timeSinceLastSave);
            lastSaveTime.current = now;
          }
        }
      };
      
      const interval = setInterval(trackPDFTime, 30000); // Check every 30 seconds
      
      return () => {
        clearInterval(interval);
        // Save final time on unmount
        if (lastSaveTime.current && document.visibilityState === 'visible' && onTimeTrackRef.current) {
          const finalTime = Math.floor((Date.now() - lastSaveTime.current) / 1000);
          if (finalTime > 0) {
            onTimeTrackRef.current(finalTime);
          }
        }
      };
    }, [pdfUrl]); // Only depend on pdfUrl, not onTimeTrack

    const handleLoad = useCallback(() => {
      setIsLoaded(true);
      pdfViewStartTime.current = Date.now();
      lastSaveTime.current = Date.now();
    }, []);

    const goToNextPage = useCallback(() => {
      if (totalPages === null || currentPage < totalPages) {
        setCurrentPage(prev => prev + 1);
        // Update iframe src to navigate to next page
        const iframe = document.querySelector(`iframe[title="PDF Document"]`);
        if (iframe) {
          iframe.src = `${pdfUrl}#page=${currentPage + 1}`;
        }
      }
    }, [currentPage, totalPages, pdfUrl]);

    const goToPreviousPage = useCallback(() => {
      if (currentPage > 1) {
        setCurrentPage(prev => prev - 1);
        // Update iframe src to navigate to previous page
        const iframe = document.querySelector(`iframe[title="PDF Document"]`);
        if (iframe) {
          iframe.src = `${pdfUrl}#page=${currentPage - 1}`;
        }
      }
    }, [currentPage, pdfUrl]);

    return (
      <div className="bg-gray-50 rounded-lg p-4">
        {pdfUrl ? (
          <>
            <div className="w-full aspect-video bg-gray-50 rounded-lg overflow-hidden">
              <div className="relative w-full h-full">
                <LazyIframe
                  key={pdfUrl}
                  src={`${pdfUrl}#toolbar=1&navpanes=1&scrollbar=1&view=FitH&page=${currentPage}`}
                  title="PDF Document"
                  className={`w-full h-full transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
                  onLoad={handleLoad}
                  frameBorder="0"
                />
                {!isLoaded && (
                  <div className="absolute inset-0 flex items-center justify-center bg-[rgba(6,17,48,0.96)]">
                    <div className="flex flex-col items-center gap-3 text-white">
                      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#FF8F3F]"></div>
                      <p className="text-xs font-medium tracking-wide text-[#FFCB9E] uppercase">Loading document…</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="text-center text-gray-500 p-8">No PDF available.</div>
        )}
      </div>
    );
  });

  PDFViewer.displayName = 'PDFViewer';

  // Memoized PPT Viewer component
  const PPTViewer = memo(({ pptUrl, onLoad }) => {
    const [error, setError] = useState(null);
    const [isLoaded, setIsLoaded] = useState(false);
    
    useEffect(() => {
      setIsLoaded(false);
      setError(null);
    }, [pptUrl]);

    const isGoogleSlides = useMemo(() => {
      return /docs\.google\.com\/presentation\/d\/[a-zA-Z0-9_-]+/i.test(pptUrl);
    }, [pptUrl]);

    const embedUrl = useMemo(() => {
      if (!pptUrl) return null;
      
      if (isGoogleSlides) {
        const presentationId = pptUrl.match(/\/d\/([a-zA-Z0-9_-]+)/)?.[1];
        return presentationId 
          ? `https://docs.google.com/presentation/d/${presentationId}/embed`
          : pptUrl;
      } else {
        // Ensure URL is publicly accessible - Office Online Viewer requires this
        let publicUrl = pptUrl;
        // If it's a Supabase storage path, ensure it's a public URL
        if (pptUrl.includes('supabase.co/storage/v1/object/public/')) {
          publicUrl = pptUrl;
        } else if (pptUrl.includes('supabase.co') && !pptUrl.includes('/public/')) {
          // Try to construct public URL
          const pathMatch = pptUrl.match(/storage\/v1\/object\/[^\/]+\/(.+)/);
          if (pathMatch) {
            publicUrl = pptUrl.replace(/\/storage\/v1\/object\/[^\/]+\//, '/storage/v1/object/public/');
          }
        }
        return `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(publicUrl)}`;
      }
    }, [pptUrl, isGoogleSlides]);

    const handleLoad = useCallback(() => {
      setIsLoaded(true);
      if (typeof onLoad === 'function') {
        onLoad();
      }
    }, [onLoad]);

    return (
      <div className="bg-gray-50 rounded-lg p-4">
        {pptUrl ? (
          <div className="w-full aspect-video bg-gray-100 rounded-lg overflow-hidden">
            <div className="relative w-full h-full">
              {embedUrl ? (
                <iframe
                  key={embedUrl}
                  src={embedUrl}
                  title="Presentation"
                  className={`w-full h-full transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
                  frameBorder="0"
                  allowFullScreen
                  onLoad={handleLoad}
                  onError={() => setError('Unable to load presentation. Please try again later.')}
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-gray-500 text-sm">Preparing preview…</div>
                </div>
              )}
              {(!isLoaded || !embedUrl) && !error && (
                <div className="absolute inset-0 flex items-center justify-center bg-[rgba(6,17,48,0.96)]">
                  <div className="flex flex-col items-center gap-3 text-white">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#FF8F3F]"></div>
                    <p className="text-xs font-medium tracking-wide text-[#FFCB9E] uppercase">Loading presentation…</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center text-gray-500 p-8">No presentation available.</div>
        )}
        {pptUrl && (
          <div className="mt-3 flex justify-end">
            <ActionButton action="view" variant="secondary" onClick={() => window.open(pptUrl, '_blank')}>
              Open in new tab
            </ActionButton>
          </div>
        )}
        {error && (
          <div className="mt-4 text-sm text-error-default">{error}</div>
        )}
      </div>
    );
  });

  PPTViewer.displayName = 'PPTViewer';

  // Memoized Text Content component
  const TextContentViewer = memo(({ contentText }) => {
    const parsed = useMemo(() => parseStoredText(contentText), [contentText, parseStoredText]);
    
    const html = useMemo(() => {
      return parsed.format === 'markdown'
        ? renderMarkdownToHtml(parsed.text)
        : parsed.format === 'html'
          ? parsed.text
          : `<p>${escapeHtml(parsed.text).replace(/\n/g, '<br/>')}<\/p>`;
    }, [parsed, renderMarkdownToHtml, escapeHtml]);

    return (
      <div className="bg-gray-50 rounded-lg p-6">
        <div className="w-full aspect-video bg-gray-50 rounded-lg overflow-hidden">
          <div className="w-full h-full p-4 overflow-y-auto">
            <div
              className="prose max-w-none text-text-medium"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          </div>
        </div>
      </div>
    );
  });

  TextContentViewer.displayName = 'TextContentViewer';

  // Memoized Image Viewer component
  const ImageViewer = memo(({ imageUrl, textContent, audioUrl }) => {
    return (
      <div className="space-y-6">
        {imageUrl ? (
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="w-full bg-gray-50 rounded-lg overflow-hidden">
              <div className="w-full flex items-center justify-center p-4">
                <img
                  src={imageUrl}
                  alt="Lesson Image"
                  className="max-w-full max-h-[600px] object-contain rounded-lg shadow-sm"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    const errorDiv = e.target.nextElementSibling;
                    if (errorDiv) errorDiv.style.display = 'block';
                  }}
                />
                <div 
                  className="hidden text-center text-gray-500"
                  style={{ display: 'none' }}
                >
                  <div className="text-gray-500 text-lg mb-4">Failed to load image</div>
                  <p className="text-sm">The image could not be displayed.</p>
                </div>
              </div>
              <div className="mt-3 flex justify-center">
                <Button variant="secondary" onClick={() => window.open(imageUrl, '_blank')}>
                  Open in new tab
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center text-gray-500 p-8">No image available.</div>
        )}

        {/* Text Content */}
        {textContent && (
          <Card className="p-6">
            <div className="prose max-w-none">
              {lesson.content_format === 'html' ? (
                <div dangerouslySetInnerHTML={{ __html: textContent }} />
              ) : lesson.content_format === 'markdown' ? (
                <div className="whitespace-pre-wrap">{textContent}</div>
              ) : (
                <div className="whitespace-pre-wrap">{textContent}</div>
              )}
            </div>
          </Card>
        )}

        {/* Audio Narration */}
        {audioUrl && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-text-dark mb-4">Audio Narration</h3>
            <AudioPlayer audioUrl={audioUrl} />
          </Card>
        )}
      </div>
    );
  });

  ImageViewer.displayName = 'ImageViewer';

  // Memoized Audio Player component
  const AudioPlayer = memo(({ audioUrl }) => {
    return (
      <div className="bg-gray-50 rounded-lg p-6">
        {audioUrl ? (
          <div className="w-full aspect-video bg-gray-50 rounded-lg overflow-hidden">
            <div className="w-full h-full flex flex-col items-center justify-center p-4">
              <div className="mb-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-blue-600 text-2xl">🎵</span>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Audio Lesson</h3>
                <p className="text-sm text-gray-600">Use the controls below to play the audio content</p>
              </div>
              
              <div className="max-w-md mx-auto mb-4">
                <audio
                  controls
                  className="w-full h-12"
                  preload="metadata"
                  onError={(e) => {
                    console.error('Audio playback error:', e);
                  }}
                >
                  <source src={audioUrl} type="audio/mpeg" />
                  <source src={audioUrl} type="audio/wav" />
                  <source src={audioUrl} type="audio/ogg" />
                  <source src={audioUrl} type="audio/m4a" />
                  <source src={audioUrl} type="audio/aac" />
                  <source src={audioUrl} type="audio/webm" />
                  Your browser does not support the audio element.
                </audio>
              </div>

              <div className="flex justify-center space-x-3 mb-4">
                <Button 
                  variant="secondary" 
                  onClick={() => window.open(audioUrl, '_blank')}
                  className="text-sm"
                >
                  Download Audio
                </Button>
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg max-w-md">
                <p className="text-xs text-blue-700">
                  💡 <strong>Tip:</strong> You can use the built-in controls to play, pause, seek, and adjust volume.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center text-gray-500 p-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-gray-400 text-2xl">🎵</span>
            </div>
            <div className="text-gray-500 text-lg mb-2">No audio available</div>
            <p className="text-sm">The audio content could not be loaded.</p>
          </div>
        )}
      </div>
    );
  });

  AudioPlayer.displayName = 'AudioPlayer';

  // Presentation wrapper component
  const PresentationWrapper = memo(({ lessonId }) => {
    const [presentation, setPresentation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const fetchPresentationByLesson = useCourseStore(state => state.actions.fetchPresentationByLesson);

    useEffect(() => {
      const loadPresentation = async () => {
        try {
          setLoading(true);
          const result = await fetchPresentationByLesson(lessonId);
          if (result.error) {
            setError(result.error);
          } else {
            setPresentation(result.data);
          }
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };

      loadPresentation();
    }, [lessonId, fetchPresentationByLesson]);

    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner />
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center text-gray-500 p-8">
          <div className="text-red-500 text-lg mb-2">Error loading presentation</div>
          <p className="text-sm">{error}</p>
        </div>
      );
    }

    if (!presentation) {
      return (
        <div className="text-center text-gray-500 p-8">
          <div className="text-gray-500 text-lg mb-2">No presentation found</div>
          <p className="text-sm">This lesson doesn't have a presentation yet.</p>
        </div>
      );
    }

    return (
      <PresentationViewer
        presentation={presentation}
        lesson={lesson}
        userId={user?.id}
        onSlideComplete={(slideIndex) => {
          // Handle slide completion if needed
        }}
        onPresentationComplete={() => {
          // Handle presentation completion
          setIsCompleted(true);
        }}
        isCompleted={isCompleted}
        onMarkComplete={markAsCompleted}
        onPreviousLesson={goToPreviousLesson}
        onNextLesson={goToNextLesson}
        hasPreviousLesson={lessons.findIndex(l => l.id === lessonId) > 0}
        hasNextLesson={lessons.findIndex(l => l.id === lessonId) < lessons.length - 1}
      />
    );
  });

  PresentationWrapper.displayName = 'PresentationWrapper';

  const KnowledgeCheckCard = memo(({
    quiz,
    questions,
    onSubmit,
    onRetake,
    isCompleted,
    initialResult,
    isActive,
    variant = 'default',
    onContinue
  }) => {
    const { success, error: showError } = useToast();
    const [answers, setAnswers] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showFeedback, setShowFeedback] = useState(Boolean(initialResult));
    const [result, setResult] = useState(initialResult || null);

    useEffect(() => {
      if (initialResult) {
        setResult(initialResult);
        setShowFeedback(true);
        if (initialResult.answers) {
          setAnswers(initialResult.answers);
        }
      }
    }, [initialResult]);

    const evaluateAnswer = useCallback((question, answer) => {
      if (answer === undefined || answer === null) return false;

      switch (question.question_type) {
        case 'multiple_choice':
          return answer === question.correct_answer;
        case 'multiple_select': {
          const userSet = new Set(Array.isArray(answer) ? answer : []);
          const correctSet = new Set(Array.isArray(question.correct_answer) ? question.correct_answer : []);
          if (userSet.size !== correctSet.size) return false;
          for (const value of userSet) {
            if (!correctSet.has(value)) return false;
          }
          return true;
        }
        case 'true_false':
          return answer === question.correct_answer;
        case 'short_answer': {
          const userText = (answer || '').toString().trim().toLowerCase();
          const correctText = (question.correct_answer || '').toString().trim().toLowerCase();
          return userText.length > 0 && userText === correctText;
        }
        default:
          return false;
      }
    }, []);

    const computeResult = useCallback(() => {
      if (!questions || questions.length === 0) {
        return {
          score: 0,
          maxScore: 0,
          percentage: 0,
          breakdown: [],
        };
      }

      let score = 0;
      const breakdown = questions.map((question, idx) => {
        const answer = answers[question.id];
        const correct = evaluateAnswer(question, answer);
        if (correct) score += 1;
        return {
          questionId: question.id,
          questionIndex: idx,
          isCorrect: correct,
          userAnswer: answer,
          correctAnswer: question.correct_answer,
        };
      });

      const maxScore = questions.length;
      const percentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;

      return {
        score,
        maxScore,
        percentage,
        breakdown,
        answers,
      };
    }, [answers, evaluateAnswer, questions]);

    const handleAnswerChange = useCallback((questionId, value) => {
      setAnswers(prev => ({
        ...prev,
        [questionId]: value,
      }));
    }, []);

    const handleSubmit = async () => {
      if (!questions || questions.length === 0) {
        showError('This knowledge check has no questions.');
        return;
      }

      const unanswered = questions.filter(question => {
        const value = answers[question.id];
        if (Array.isArray(value)) return value.length === 0;
        if (typeof value === 'string') return value.trim().length === 0;
        return value === undefined || value === null;
      });

      if (unanswered.length > 0) {
        showError('Please answer all questions before submitting.');
        return;
      }

      setIsSubmitting(true);
      const summary = computeResult();
      try {
        await onSubmit(quiz, answers, summary);
        setResult(summary);
        setShowFeedback(true);
        success('Knowledge check submitted successfully!');
      } catch (error) {
        showError('Failed to submit knowledge check. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
    };

    const handleRetake = () => {
      setAnswers({});
      setResult(null);
      setShowFeedback(false);
      if (onRetake) {
        onRetake(quiz.id);
      }
    };

    const renderAnswerContent = (question) => {
      const currentAnswer = answers[question.id];
      const feedback = showFeedback ? evaluateAnswer(question, currentAnswer) : null;

      const baseOptionClass = 'flex items-center gap-3 rounded-lg border px-3 py-2 text-sm transition-colors';
      const neutralClasses = 'border-background-dark hover:border-primary-default';
      const correctClasses = 'border-success-default bg-success-superlight text-success-darker';
      const incorrectClasses = 'border-error-default bg-error-superlight text-error-darker';

      const getOptionClass = (isSelected, optionIndex, optionValue) => {
        if (!showFeedback) {
          return `${baseOptionClass} ${isSelected ? 'border-primary-default bg-primary-superlight text-primary-darker' : neutralClasses}`;
        }
        let optionCorrect = false;
        if (question.question_type === 'multiple_select') {
          optionCorrect = Array.isArray(question.correct_answer) && question.correct_answer.includes(optionIndex);
        } else if (question.question_type === 'true_false') {
          optionCorrect = optionValue === question.correct_answer;
        } else {
          optionCorrect = optionIndex === question.correct_answer;
        }
        if (optionCorrect) {
          return `${baseOptionClass} ${correctClasses}`;
        }
        if (isSelected && !optionCorrect) {
          return `${baseOptionClass} ${incorrectClasses}`;
        }
        return `${baseOptionClass} ${neutralClasses}`;
      };

      switch (question.question_type) {
        case 'multiple_choice':
          return (
            <div className="space-y-3">
              {question.options?.map((option, optionIndex) => {
                const isSelected = currentAnswer === optionIndex;
                return (
                  <button
                    key={optionIndex}
                    type="button"
                    className={getOptionClass(isSelected, optionIndex, optionIndex)}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (!showFeedback) {
                        handleAnswerChange(question.id, optionIndex);
                      }
                    }}
                    disabled={showFeedback}
                    aria-pressed={isSelected}
                    style={{ cursor: showFeedback ? 'not-allowed' : 'pointer' }}
                  >
                    <span className="font-medium">{String.fromCharCode(65 + optionIndex)}.</span>
                    <span>{option}</span>
                  </button>
                );
              })}
            </div>
          );
        case 'multiple_select': {
          const selectedAnswers = Array.isArray(currentAnswer) ? currentAnswer : [];
          return (
            <div className="space-y-3">
              {question.options?.map((option, optionIndex) => {
                const isSelected = selectedAnswers.includes(optionIndex);
                return (
                  <button
                    key={optionIndex}
                    type="button"
                    className={getOptionClass(isSelected, optionIndex, optionIndex)}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (showFeedback) return;
                      const updated = new Set(selectedAnswers);
                      if (updated.has(optionIndex)) {
                        updated.delete(optionIndex);
                      } else {
                        updated.add(optionIndex);
                      }
                      handleAnswerChange(question.id, Array.from(updated));
                    }}
                    disabled={showFeedback}
                    aria-pressed={isSelected}
                    style={{ cursor: showFeedback ? 'not-allowed' : 'pointer' }}
                  >
                    <span className="font-medium">{String.fromCharCode(65 + optionIndex)}.</span>
                    <span>{option}</span>
                  </button>
                );
              })}
            </div>
          );
        }
        case 'true_false':
          return (
            <div className="space-y-3">
              {[true, false].map(value => {
                const label = value ? 'True' : 'False';
                const isSelected = currentAnswer === value;
                const optionIndex = value ? 1 : 0;
                return (
                  <button
                    key={label}
                    type="button"
                    className={getOptionClass(isSelected, optionIndex, value)}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (!showFeedback) {
                        handleAnswerChange(question.id, value);
                      }
                    }}
                    disabled={showFeedback}
                    aria-pressed={isSelected}
                    style={{ cursor: showFeedback ? 'not-allowed' : 'pointer' }}
                  >
                    <span>{label}</span>
                  </button>
                );
              })}
            </div>
          );
        case 'short_answer':
          return (
            <div className="space-y-2">
              <textarea
                value={currentAnswer || ''}
                onChange={event => handleAnswerChange(question.id, event.target.value)}
                disabled={showFeedback}
                placeholder="Type your response here..."
                className="w-full rounded-lg border border-background-dark px-3 py-2 text-sm focus:border-primary-default focus:outline-none focus:ring-2 focus:ring-primary-muted disabled:bg-background-light"
                rows={3}
              />
              {showFeedback && (
                <p className={`text-sm font-medium ${feedback ? 'text-success-darker' : 'text-error-darker'}`}>
                  {feedback
                    ? 'Correct!'
                    : `Expected answer: ${question.correct_answer}`}
                </p>
              )}
            </div>
          );
        default:
          return <p className="text-sm text-text-light">Unsupported question type.</p>;
      }
    };

    const containerClassName = [
      'bg-white',
      'p-6',
      'transition-shadow',
      variant === 'modal'
        ? 'rounded-2xl shadow-lg sm:p-10 max-h-[70vh] overflow-y-auto'
        : variant === 'embedded'
          ? 'rounded-xl border border-background-dark shadow-sm'
          : 'rounded-2xl border border-background-dark shadow-sm',
      isActive ? 'ring-2 ring-primary-default shadow-lg' : ''
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div
        id={`knowledge-check-${quiz.id}`}
        className={containerClassName}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-primary-default">
              <span className="inline-flex items-center gap-1 rounded-full bg-primary-superlight px-2 py-1 font-semibold text-primary-darker">
                <CheckCircle className="h-3 w-3" />
                Knowledge Check
              </span>
              {questions?.length ? (
                <span className="text-text-light">
                  {questions.length} {questions.length === 1 ? 'question' : 'questions'}
                </span>
              ) : null}
            </div>
            <h3 className="mt-3 text-lg font-semibold text-text-dark">{quiz.title}</h3>
            {quiz.description && <p className="mt-2 text-sm text-text-light">{quiz.description}</p>}
          </div>

          <div className="flex items-center gap-2">
            {isCompleted ? (
              <StatusBadge status="success" label="Completed" />
            ) : (
              <StatusBadge status="warning" label="In Progress" />
            )}
          </div>
        </div>

        <div className="mt-6 space-y-6">
          {questions && questions.length > 0 ? (
            questions.map((question, index) => {
              const breakdownEntry = result?.breakdown?.find(entry => entry.questionId === question.id);
              const questionFeedback = breakdownEntry ? breakdownEntry.isCorrect : null;
              return (
                <div key={question.id || `${quiz.id}-${index}`} className="space-y-4 rounded-lg border border-background-dark p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-text-dark">
                        {index + 1}. {question.question_text}
                      </p>
                      {showFeedback && questionFeedback !== null && (
                        <p className={`mt-2 text-xs font-medium ${questionFeedback ? 'text-success-darker' : 'text-error-darker'}`}>
                          {questionFeedback
                            ? 'Great job! You got all questions correct.'
                            : 'Review the questions you missed and try again.'}
                        </p>
                      )}
                    </div>
                  </div>
                  {renderAnswerContent(question)}
                </div>
              );
            })
          ) : (
            <div className="rounded-lg border border-dashed border-background-dark p-6 text-center text-sm text-text-light">
              No questions available for this knowledge check.
            </div>
          )}
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {result && showFeedback ? (
            <div className="flex items-center gap-3 text-sm text-text-light">
              <div className="flex items-center gap-1 rounded-full bg-primary-superlight px-3 py-1 font-medium text-primary-darker">
                Score: {result.score}/{result.maxScore}
              </div>
              <span>Accuracy: {result.percentage}%</span>
            </div>
          ) : (
            <p className="text-sm text-text-light">
              Answer all questions to complete this knowledge check.
            </p>
          )}

          <div className="flex flex-col gap-2 sm:flex-row">
            {showFeedback && (
              <>
                <Button variant="ghost" onClick={handleRetake} size="sm">
                  Try Again
                </Button>
                {onContinue && (
                  <Button onClick={onContinue} size="sm">
                    Continue
                  </Button>
                )}
              </>
            )}
            {!showFeedback && (
              <Button onClick={handleSubmit} disabled={isSubmitting} size="sm">
                {isSubmitting
                  ? 'Submitting...'
                  : 'Check Answers'}
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  });

  KnowledgeCheckCard.displayName = 'KnowledgeCheckCard';

  const handleKnowledgeCheckSubmit = useCallback(
    async (quizData, submittedAnswers, summary) => {
      if (!quizData?.id) return;
      const normalizedSummary = (() => {
        const maxScore =
          summary?.maxScore && summary.maxScore > 0
            ? summary.maxScore
            : Math.max(summary?.breakdown?.length || 0, 1);
        return { ...summary, maxScore };
      })();

      if (user?.id) {
        try {
          await actions.submitQuizAttempt(
            user.id,
            quizData.id,
            submittedAnswers,
            normalizedSummary.score,
            normalizedSummary.maxScore
          );
        } catch (_) {
          // Ignore errors for inline checks; user-facing feedback handled in component
        }
      }

      setKnowledgeCheckResults(prev => ({
        ...prev,
        [quizData.id]: { ...normalizedSummary, answers: submittedAnswers },
      }));

      setQuizCompletionStatus(prev => ({
        ...prev,
        [quizData.id]: true,
      }));
    },
    [actions, user?.id]
  );

  const handleKnowledgeCheckReset = useCallback((quizId) => {
    setKnowledgeCheckResults(prev => {
      const { [quizId]: _removed, ...rest } = prev;
      return rest;
    });
    setQuizCompletionStatus(prev => ({
      ...prev,
      [quizId]: false,
    }));
  }, []);

  // Editor Content Viewer - renders content blocks from the editor
  const EditorContentViewer = memo(({ blocks }) => {
    const [currentPageIndex, setCurrentPageIndex] = useState(0);

    // Split blocks into pages based on page_break blocks
    const pages = useMemo(() => {
      if (!blocks || blocks.length === 0) return [];

      const pagesList = [];
      let currentPage = {
        blocks: [],
        backgroundColor: '#ffffff',
        showPageNumber: true,
      };

      blocks.forEach((block) => {
        if (block.type === 'page_break') {
          // Save current page and start new one
          if (currentPage.blocks.length > 0 || pagesList.length === 0) {
            pagesList.push(currentPage);
          }
          currentPage = {
            blocks: [],
            backgroundColor: block.data?.backgroundColor || '#ffffff',
            showPageNumber: block.data?.showPageNumber !== false,
          };
        } else {
          currentPage.blocks.push(block);
        }
      });

      // Add the last page
      if (currentPage.blocks.length > 0 || pagesList.length === 0) {
        pagesList.push(currentPage);
      }

      return pagesList;
    }, [blocks]);

    if (!blocks || blocks.length === 0) {
      return (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <p className="text-gray-500">No content blocks in this lesson yet.</p>
        </div>
      );
    }

    const currentPage = pages[currentPageIndex] || { blocks: [], backgroundColor: '#ffffff', showPageNumber: true };

    const handleNextPage = () => {
      if (currentPageIndex < pages.length - 1) {
        setCurrentPageIndex(currentPageIndex + 1);
      }
    };

    const handlePrevPage = () => {
      if (currentPageIndex > 0) {
        setCurrentPageIndex(currentPageIndex - 1);
      }
    };

    return (
      <div className="space-y-4">
        {/* Page Navigation */}
        {pages.length > 1 && (
          <div className="flex items-center justify-between bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <button
              onClick={handlePrevPage}
              disabled={currentPageIndex === 0}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>
            <span className="text-sm font-medium text-gray-700">
              Page {currentPageIndex + 1} of {pages.length}
            </span>
            <button
              onClick={handleNextPage}
              disabled={currentPageIndex === pages.length - 1}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Page Content */}
        <div 
          className="rounded-lg p-8 shadow-lg min-h-[600px] relative"
          style={{ backgroundColor: currentPage.backgroundColor }}
        >
          <div className="max-w-4xl mx-auto space-y-6">
            {currentPage.blocks.map((block, index) => {
            // Text Block
            if (block.type === 'text') {
              return (
                <div
                  key={block.id || index}
                  className="prose max-w-none"
                  style={{
                    fontSize: `${block.data?.fontSize || 16}px`,
                    fontFamily: block.data?.fontFamily || 'Inter',
                    color: block.data?.color || '#000000',
                    textAlign: block.data?.alignment || 'left',
                  }}
                  dangerouslySetInnerHTML={{ __html: block.data?.content || '<p>Empty text block</p>' }}
                />
              );
            }

            // Heading Block
            if (block.type === 'heading') {
              const HeadingTag = `h${block.data?.level || 2}`;
              return (
                <HeadingTag
                  key={block.id || index}
                  style={{
                    color: block.data?.color || '#000000',
                    textAlign: block.data?.alignment || 'left',
                  }}
                  className="font-bold"
                >
                  {block.data?.text || 'Heading'}
                </HeadingTag>
              );
            }

            // Image Block
            if (block.type === 'image' && block.data?.src) {
              return (
                <figure key={block.id || index} className="my-6">
                  <img
                    src={block.data.src}
                    alt={block.data.alt || ''}
                    style={{
                      width: block.data.width || '100%',
                      height: block.data.height || 'auto',
                      objectFit: block.data.objectFit || 'contain',
                    }}
                    className="rounded-lg"
                  />
                  {block.data.caption && (
                    <figcaption className="text-sm text-gray-600 text-center mt-2">
                      {block.data.caption}
                    </figcaption>
                  )}
                </figure>
              );
            }

            // Video Block
            if (block.type === 'video' && block.data?.src) {
              // YouTube
              if (block.data.type === 'youtube') {
                const videoId = block.data.src.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/)?.[1];
                if (videoId) {
                  return (
                    <div
                      key={block.id || index}
                      className="my-6"
                      style={{
                        width: block.data.width || '100%',
                        height: block.data.height || '400px',
                      }}
                    >
                      <iframe
                        src={`https://www.youtube.com/embed/${videoId}`}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="w-full h-full rounded-lg"
                      />
                    </div>
                  );
                }
              }

              // Vimeo
              if (block.data.type === 'vimeo') {
                const videoId = block.data.src.match(/vimeo\.com\/(\d+)/)?.[1];
                if (videoId) {
                  return (
                    <div
                      key={block.id || index}
                      className="my-6"
                      style={{
                        width: block.data.width || '100%',
                        height: block.data.height || '400px',
                      }}
                    >
                      <iframe
                        src={`https://player.vimeo.com/video/${videoId}`}
                        allow="autoplay; fullscreen; picture-in-picture"
                        allowFullScreen
                        className="w-full h-full rounded-lg"
                      />
                    </div>
                  );
                }
              }

              // HTML5 Video
              return (
                <div key={block.id || index} className="my-6">
                  <video
                    src={block.data.src}
                    controls={block.data.controls !== false}
                    autoPlay={block.data.autoplay}
                    loop={block.data.loop}
                    muted={block.data.muted}
                    style={{
                      width: block.data.width || '100%',
                      height: block.data.height || '400px',
                    }}
                    className="rounded-lg"
                  >
                    Your browser does not support the video tag.
                  </video>
                </div>
              );
            }

            // Embed Block (iframe or HTML)
            if (block.type === 'embed') {
              // Handle iframe embeds
              if (block.data.type === 'iframe' && block.data.src) {
                return (
                  <div key={block.id || index} className="my-6">
                    <div className="relative" style={{ width: block.data.width || '100%', height: block.data.height || '400px' }}>
                      <iframe
                        src={block.data.src}
                        style={{
                          width: '100%',
                          height: '100%',
                        }}
                        className="border border-gray-300 rounded-lg"
                        title={block.data.title || 'Embedded content'}
                        allowFullScreen
                      />
                    </div>
                  </div>
                );
              }

              // Handle HTML embeds
              if (block.data.type === 'html' && block.data.embedCode) {
                return (
                  <div key={block.id || index} className="my-6">
                    <div
                      dangerouslySetInnerHTML={{ __html: block.data.embedCode }}
                      className="rounded-lg overflow-hidden"
                    />
                  </div>
                );
              }

              // Auto-detect and handle src without explicit type
              if (block.data.src && !block.data.type) {
                return (
                  <div key={block.id || index} className="my-6">
                    <div className="relative" style={{ width: block.data.width || '100%', height: block.data.height || '400px' }}>
                      <iframe
                        src={block.data.src}
                        style={{
                          width: '100%',
                          height: '100%',
                        }}
                        className="border border-gray-300 rounded-lg"
                        title={block.data.title || 'Embedded content'}
                        allowFullScreen
                      />
                    </div>
                  </div>
                );
              }
            }

            // Quiz Block
            if (block.type === 'quiz') {
              return (
                <div key={block.id || index} className="my-6">
                  <div className="border border-gray-200 rounded-lg overflow-hidden shadow-md">
                    {/* Quiz header */}
                    <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white px-6 py-4">
                      <div className="flex items-center gap-3">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
                          <path d="M9 11l3 3L22 4"></path>
                          <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
                        </svg>
                        <div>
                          <h3 className="text-lg font-semibold">{block.data?.title || 'Quiz'}</h3>
                          {block.data?.passThreshold && (
                            <p className="text-sm text-primary-100">
                              Pass threshold: {block.data.passThreshold}%
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Quiz content */}
                    <div className="p-6 bg-white">
                      {block.data?.quizId ? (
                        <div className="text-center py-8">
                          <p className="text-gray-600 mb-4">
                            Ready to test your knowledge?
                          </p>
                          <p className="text-sm text-gray-500 mb-6">
                            Quiz ID: <span className="font-mono font-semibold">{block.data.quizId}</span>
                          </p>
                          <button 
                            className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium shadow-sm hover:shadow-md"
                            onClick={() => {
                              // Navigate to quiz view
                              navigate(`/app/courses/${courseId}/quiz/${block.data.quizId}`);
                            }}
                          >
                            Start Quiz
                          </button>
                          {block.data?.allowRetakes && (
                            <p className="text-xs text-gray-500 mt-3">
                              You can retake this quiz multiple times
                            </p>
                          )}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-12 bg-blue-50 rounded-lg">
                          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-12 h-12 text-blue-400 mb-4">
                            <path d="M9 11l3 3L22 4"></path>
                            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
                          </svg>
                          <p className="text-blue-700 text-sm font-medium">No quiz configured</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            }

            // Code Block
            if (block.type === 'code') {
              const theme = block.data?.theme || 'dark';
              const isDark = theme === 'dark';
              
              return (
                <div key={block.id || index} className="my-6">
                  <div className={`rounded-lg overflow-hidden ${isDark ? 'bg-gray-900' : 'bg-gray-100'}`}>
                    {/* Header with language and copy button */}
                    <div className={`flex items-center justify-between px-4 py-2 border-b ${
                      isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-300 bg-gray-200'
                    }`}>
                      <span className={`text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {block.data?.language || 'code'}
                      </span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(block.data?.code || '');
                        }}
                        className={`flex items-center gap-1 px-2 py-1 text-xs rounded transition-colors ${
                          isDark ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                        </svg>
                        Copy
                      </button>
                    </div>

                    {/* Code content */}
                    <pre className={`p-4 overflow-x-auto ${block.data?.lineNumbers ? 'pl-12' : ''} ${
                      isDark ? 'text-gray-100' : 'text-gray-900'
                    }`}>
                      <code 
                        className="text-sm font-mono"
                        style={{
                          fontFamily: 'Monaco, Consolas, "Courier New", monospace',
                          lineHeight: '1.6',
                        }}
                      >
                        {block.data?.code || block.data?.content || '// Empty code block'}
                      </code>
                    </pre>
                  </div>
                </div>
              );
            }

            // Unknown block type
            return (
              <div key={block.id || index} className="p-4 bg-gray-100 rounded border border-gray-300">
                <p className="text-sm text-gray-500">
                  Unsupported block type: {block.type}
                </p>
              </div>
            );
          })}
          </div>

          {/* Page number */}
          {currentPage.showPageNumber && pages.length > 1 && (
            <div className="absolute bottom-4 right-4 text-xs text-gray-400 font-medium">
              {currentPageIndex + 1}
            </div>
          )}
        </div>
      </div>
    );
  });

  EditorContentViewer.displayName = 'EditorContentViewer';

  const VideoPlayer = memo(() => {
    if (lesson.content_type !== 'video') {
      // Handle text rendering with stored format marker
      if (lesson.content_type === 'text') {
        return <TextContentViewer contentText={lesson.content_text} />;
      }
      // Handle PDF rendering
      if (lesson.content_type === 'pdf') {
        return <PDFViewer pdfUrl={lesson.content_url} onTimeTrack={saveProgress} />;
      }
      // Handle PPT rendering
      if (lesson.content_type === 'ppt') {
        return <PPTViewer pptUrl={lesson.content_url} />;
      }
      // Handle image rendering
      if (lesson.content_type === 'image') {
        return (
          <ImageViewer 
            imageUrl={lesson.content_url} 
            textContent={lesson.content_text}
            audioUrl={lesson.audio_attachment_url}
          />
        );
      }

      // Handle presentation rendering
      if (lesson.content_type === 'presentation') {
        return <PresentationWrapper lessonId={lesson.id} />;
      }

      // Handle editor-created content with content_blocks
      if (lesson.content_type === 'editor' && lesson.content_blocks && Array.isArray(lesson.content_blocks)) {
        return <EditorContentViewer blocks={lesson.content_blocks} />;
      }

      // Fallback placeholder for other non-video content types
      return (
        <div className="bg-gray-100 rounded-lg p-8 text-center">
          <div className="text-gray-500 text-lg mb-4">Content not available</div>
          <p className="text-sm text-gray-400">
            Content type: {lesson.content_type || 'Unknown'}
          </p>
        </div>
      );
    }

    // Check if it's a YouTube URL → render iframe embed
    if (isYouTubeUrl(lesson.content_url)) {
      const videoId = getYouTubeVideoId(lesson.content_url);
      if (!videoId) {
        return (
          <div className="bg-gray-100 rounded-lg p-8 text-center">
            <div className="text-gray-500 text-lg mb-4">Invalid YouTube URL</div>
            <div className="bg-white p-6 rounded-lg border break-all">{lesson.content_url}</div>
          </div>
        );
      }
      const embedUrl = `https://www.youtube.com/embed/${videoId}?rel=0`;
      return (
        <div className="w-full">
          <div className="w-full aspect-video bg-gray-50 rounded-lg overflow-hidden">
            <iframe
              src={embedUrl}
              title="YouTube video player"
              className="w-full h-full rounded-lg"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              loading="lazy"
              allowFullScreen
            />
          </div>
        </div>
      );
    }

    // Check if it's a valid direct video URL
    if (!isValidVideoUrl(lesson.content_url)) {
      return (
        <div className="bg-gray-100 rounded-lg p-8 text-center">
          <div className="text-gray-500 text-lg mb-4">
            Invalid Video URL
          </div>
          <div className="bg-white p-6 rounded-lg border">
            <p className="text-gray-700 mb-4">
              The provided URL is not a valid video file. Please provide a direct link to a video file (e.g., .mp4, .webm).
            </p>
            <div className="text-sm text-gray-500 break-all">
              Current URL: {lesson.content_url}
            </div>
            {lesson.content_url?.toLowerCase().endsWith('.mov') && (
              <div className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded p-3 mt-3 text-left">
                This appears to be a .mov file. Web playback for MOV is unreliable across browsers/CDNs. Please convert to MP4 (H.264 + AAC) before upload for best compatibility.
              </div>
            )}
          </div>
        </div>
      );
    }

    // Valid video URL - render ReactPlayer for robust playback
    return (
      <div className="w-full aspect-video bg-gray-50 rounded-lg overflow-hidden relative">
        <ReactPlayer
          key={playerKey}
          ref={playerRef}
          url={haltVideo ? undefined : lesson.content_url}
          controls
          width="100%"
          height="100%"
          playsInline
          config={{ file: { attributes: { preload: 'metadata' } } }}
          onReady={() => {
            videoReadyRef.current = true;
            setVideoLoading(false);
            if (videoTimeoutRef.current) {
              clearTimeout(videoTimeoutRef.current);
              videoTimeoutRef.current = null;
            }
          }}
          onStart={() => {
            videoReadyRef.current = true;
            setVideoLoading(false);
            if (videoTimeoutRef.current) {
              clearTimeout(videoTimeoutRef.current);
              videoTimeoutRef.current = null;
            }
          }}
          onWaiting={() => setVideoLoading(true)}
          onPlaying={() => {
            videoReadyRef.current = true;
            setVideoLoading(false);
            if (videoTimeoutRef.current) {
              clearTimeout(videoTimeoutRef.current);
              videoTimeoutRef.current = null;
            }
          }}
          onError={() => {
            setVideoLoading(false);
            setHaltVideo(true);
            setVideoError({
              error: null,
              errorCode: 'UNKNOWN',
              errorMessage: 'Video playback error occurred. Please try again.',
              src: lesson.content_url
            });
            if (videoTimeoutRef.current) {
              clearTimeout(videoTimeoutRef.current);
              videoTimeoutRef.current = null;
            }
          }}
          onProgress={({ playedSeconds }) => {
            const t = playedSeconds || 0;
            setCurrentTime(t);
          }}
          onEnded={() => {
            if (!isCompleted) {
              markAsCompleted();
            }
          }}
        />
        {videoLoading && (
          <div className="absolute inset-0 rounded-lg flex items-center justify-center bg-[rgba(6,17,48,0.94)]">
            <div className="text-center text-white">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF8F3F] mx-auto mb-4"></div>
              <div className="tracking-wide text-sm uppercase text-[#FFCB9E]">Loading video...</div>
            </div>
          </div>
        )}
      </div>
    );
  });

  VideoPlayer.displayName = 'VideoPlayer';

  // Video Error Display Component
  const VideoErrorDisplay = memo(() => {
    if (!videoError) return null;
    
    const getErrorMessage = () => {
      if (videoError.errorCode === 'TIMEOUT') {
        return 'Video playback timed out. Please check your connection and try again.';
      }
      
      switch (videoError.errorCode) {
        case 1:
          return 'Video playback was aborted.';
        case 2:
          return 'Network error occurred while loading video.';
        case 3:
          return 'Video decoding error occurred.';
        case 4:
          return 'Video format is not supported.';
        default:
          return videoError.errorMessage || 'Unknown video error occurred.';
      }
    };
    
    return (
      <Card className="p-6 bg-red-50 border-red-200">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <Play className="w-5 h-5 text-red-600" />
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-red-800 mb-2">Video Playback Error</h3>
            <p className="text-red-700 mb-3">{getErrorMessage()}</p>
            <div className="text-sm text-red-600 mb-4">
              <p><strong>URL:</strong> {videoError.src}</p>
              <p><strong>Error Code:</strong> {videoError.errorCode}</p>
              {videoError.errorMessage && (
                <p><strong>Message:</strong> {videoError.errorMessage}</p>
              )}
            </div>
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  setVideoError(null);
                  setHaltVideo(false);
                  setVideoLoading(true);
                  setPlayerKey((k) => k + 1);
                }}
              >
                Retry Loading
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => {
                  setHaltVideo(true);
                  setVideoLoading(false);
                }}
              >
                Stop Loading
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => {
                  if (videoError.src) {
                    window.open(videoError.src, '_blank');
                  }
                }}
              >
                Open in New Tab
              </Button>
            </div>
          </div>
        </div>
      </Card>
    );
  });

  VideoErrorDisplay.displayName = 'VideoErrorDisplay';

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!lesson || !course) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-text-dark mb-4">Lesson Not Found</h2>
        <p className="text-text-light mb-6">The lesson you're looking for doesn't exist or has been removed.</p>
        <ActionButton action="previous" onClick={() => navigate(`/app/courses/${courseId}`)}>
          Back to Course
        </ActionButton>
      </div>
    )
  }

  const currentLessonIndex = lessons.findIndex(lessonEntry => lessonEntry.id === lessonId);
  const isLastLesson = currentLessonIndex !== -1 && currentLessonIndex === lessons.length - 1;

  return (
    <div className={`grid grid-cols-1 gap-6 transition-all duration-300 ${
      sidebarCollapsed ? 'lg:grid-cols-1' : 'lg:grid-cols-4'
    }`}>
      {/* Main Content */}
      <div className={`space-y-6 ${sidebarCollapsed ? 'lg:col-span-1' : 'lg:col-span-3'}`}>
        {/* Breadcrumb */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-text-light">
            <button 
              onClick={() => navigate(`/app/courses/${courseId}`)}
              className="hover:text-primary-default"
            >
              {course.title}
            </button>
            <span>/</span>
            <span>{lesson.moduleTitle}</span>
            <span>/</span>
            <span className="text-text-dark">{lesson.title}</span>
            {isCourseCompleted && (
              <>
                <span className="mx-2">•</span>
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                  <BookOpen className="w-3 h-3" />
                  Review Mode
                </span>
              </>
            )}
          </div>
          
          {/* Sidebar Toggle Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="hidden lg:flex items-center gap-2"
          >
            {sidebarCollapsed ? (
              <>
                <PanelLeftOpen className="w-4 h-4" />
                <span className="text-sm">Show Sidebar</span>
              </>
            ) : (
              <>
                <PanelLeftClose className="w-4 h-4" />
                <span className="text-sm">Hide Sidebar</span>
              </>
            )}
          </Button>
        </div>

        {/* Content Player */}
        <Card className="p-0 overflow-hidden">
          {lesson.content_type === 'scorm' ? (
            <ScormPlayer
              scormUrl={lesson.content_url}
              lessonId={lesson.id}
              courseId={courseId}
              onProgress={() => {}}
              onComplete={() => {
                setIsCompleted(true);
              }}
              onError={() => {
                showError('Failed to load SCORM content');
              }}
            />
          ) : (
            <VideoPlayer />
          )}
        </Card>

        {/* Audio Attachment Display */}
        {lesson.audio_attachment_url && (
          <Card className="p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 text-lg">🎵</span>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">Audio Narration</h3>
                <p className="text-sm text-gray-600">Listen to the audio explanation or narration</p>
              </div>
            </div>
            <AudioPlayer audioUrl={lesson.audio_attachment_url} />
          </Card>
        )}

        {/* Navigation */}
        <div className="flex justify-between items-center gap-4">
          <Button
            variant="outline"
            onClick={goToPreviousLesson}
            disabled={lessons.findIndex(l => l.id === lessonId) === 0}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Previous Lesson
          </Button>
          
          {isLastLesson ? (
            <Button onClick={async () => {
              const allLessonsCompleted = lessons.every(lessonEntry => (
                courseProgress[courseId]?.[lessonEntry.id]?.completed
              ));
              
              if (!allLessonsCompleted) {
                showError('Keep going! Mark every lesson as completed to finish the course.');
                return;
              }
              
              // Check if there's a course-level final assessment that hasn't been completed
              if (courseFinalAssessment && !finalAssessmentCompleted) {
                navigate(`/app/courses/${courseId}/quiz/${courseFinalAssessment.id}`);
              } else {
                navigate(`/app/courses/${courseId}/completion`);
              }
            }}>
              {courseFinalAssessment && !finalAssessmentCompleted 
                ? 'Take Final Assessment' 
                : 'Complete Course'}
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button 
              onClick={() => goToNextLesson(false)} 
              disabled={!timeRequirementMet || !!firstIncompleteKnowledgeCheck}
              title={
                !timeRequirementMet && timeRemainingInfo
                  ? `Please review this lesson for at least ${timeRemainingInfo.totalMinutesRequired} minute${timeRemainingInfo.totalMinutesRequired !== 1 ? 's' : ''} before proceeding. You need ${timeRemainingInfo.minutesRemaining} more minute${timeRemainingInfo.minutesRemaining !== 1 ? 's' : ''}.`
                  : firstIncompleteKnowledgeCheck
                  ? 'Complete the knowledge check before moving on.'
                  : 'Continue to next lesson'
              }
            >
              Next Lesson
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>

        {/* Video Error Display */}
        <VideoErrorDisplay />

        {/* Lesson Info */}
        <Card className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-text-dark mb-2">{lesson.title}</h1>
              {/* Render formatted content preview (respect stored format marker) */}
              {lessonDescriptionHtml}
            </div>
            
            <div className="flex items-center gap-2">
              {canManageCourse && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate(`/app/courses/${courseId}/lesson/${lessonId}/presentation`)}
                  className="text-primary-default hover:text-primary-dark"
                  title="Manage Presentation Content"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Button>
              )}
              {!isCompleted ? (
                <Button 
                  onClick={markAsCompleted} 
                  disabled={isCompleting || !timeRequirementMet || !!firstIncompleteKnowledgeCheck}
                  title={
                    !timeRequirementMet && timeRemainingInfo
                      ? `Please review this lesson for at least ${timeRemainingInfo.totalMinutesRequired} minute${timeRemainingInfo.totalMinutesRequired !== 1 ? 's' : ''} before completing. You need ${timeRemainingInfo.minutesRemaining} more minute${timeRemainingInfo.minutesRemaining !== 1 ? 's' : ''}.`
                      : firstIncompleteKnowledgeCheck
                      ? 'Please complete the knowledge check for this lesson before marking it as complete.'
                      : 'Mark this lesson as complete'
                  }
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  {isCompleting ? 'Completing...' : 'Mark Complete'}
                </Button>
              ) : (
                <div className="flex items-center gap-2 text-success-default">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium">Completed</span>
                </div>
              )}
              
            </div>
          </div>

          <div className="flex items-center gap-6 text-sm text-text-muted">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>{formatTime(lesson.duration_minutes * 60 || 0)}</span>
            </div>
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              <span>Lesson {lesson.order_index || 1} of {lessons.length}</span>
            </div>
            {timeRemainingInfo && !timeRequirementMet && (
              <div className="flex items-center gap-2 text-warning-default">
                <Clock className="w-4 h-4" />
                <span>
                  {timeRemainingInfo.minutesRemaining} minute{timeRemainingInfo.minutesRemaining !== 1 ? 's' : ''} remaining
                </span>
              </div>
            )}
          </div>
        </Card>

        {/* Lesson Content Tabs */}
        {/* <Card className="p-6">
          <div className="border-b border-background-dark mb-6">
            <nav className="flex space-x-8">
              {[
                { id: 'transcript', label: 'Transcript' },
                { id: 'notes', label: 'Notes' },
                { id: 'resources', label: 'Resources' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setShowNotes(tab.id === 'notes')}
                  className={`py-3 px-1 border-b-2 font-medium text-sm ${
                    (tab.id === 'notes' && showNotes) || (tab.id === 'transcript' && !showNotes)
                      ? 'border-primary-default text-primary-default'
                      : 'border-transparent text-text-light hover:text-text-medium'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {!showNotes ? (
            // Transcript
            <div>
              <h3 className="text-lg font-semibold text-text-dark mb-4">Lesson Content</h3>
              <div className="prose max-w-none text-text-medium">
                {lessonContentParagraphs}
              </div>
            </div>
          ) : (
            // Notes
            <div>
              <h3 className="text-lg font-semibold text-text-dark mb-4">My Notes</h3>
              <textarea
                className="w-full h-64 p-4 border border-background-dark rounded-lg focus:ring-2 focus:ring-primary-default focus:border-primary-default"
                placeholder="Take notes about this lesson..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
              <div className="mt-4 flex justify-end">
                <Button variant="secondary">Save Notes</Button>
              </div>
            </div>
          )}
        </Card> */}


        {/* Resources */}
        {(lesson.resources && Array.isArray(lesson.resources) && lesson.resources.length > 0) || lesson.content_url ? (
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-text-dark mb-4">Lesson Resources</h3>
            <div className="space-y-3">
              {/* Display resources array if available */}
              {lesson.resources && Array.isArray(lesson.resources) && lesson.resources.length > 0 ? (
                lesson.resources.map((resource) => (
                  resource.type === 'link' ? (
                    <a
                      key={resource.id}
                      href={normalizeUrl(resource.url)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-start p-3 border border-background-dark rounded-lg hover:bg-background-light cursor-pointer no-underline"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <ExternalLink className="w-5 h-5 text-blue-600 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-text-dark truncate">{resource.title}</h4>
                          {resource.description && (
                            <p className="text-sm text-text-light truncate">{resource.description}</p>
                          )}
                        </div>
                      </div>
                    </a>
                  ) : (
                    <div 
                      key={resource.id} 
                      onClick={() => window.open(resource.url, '_blank', 'noopener,noreferrer')}
                      className="flex items-center justify-between p-3 border border-background-dark rounded-lg hover:bg-background-light cursor-pointer"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <File className="w-5 h-5 text-text-muted flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-text-dark truncate">{resource.title}</h4>
                          {resource.description && (
                            <p className="text-sm text-text-light truncate">{resource.description}</p>
                          )}
                          {resource.file_size && (
                            <p className="text-xs text-text-muted">
                              {resource.file_size < 1024 
                                ? `${resource.file_size} B`
                                : resource.file_size < 1024 * 1024
                                ? `${(resource.file_size / 1024).toFixed(2)} KB`
                                : `${(resource.file_size / (1024 * 1024)).toFixed(2)} MB`}
                            </p>
                          )}
                        </div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          downloadFile(resource.url, resource.file_name || resource.title);
                        }}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  )
                ))
              ) : lesson.content_url ? (
                <div 
                  onClick={() => window.open(lesson.content_url, '_blank', 'noopener,noreferrer')}
                  className="flex items-center justify-between p-3 border border-background-dark rounded-lg hover:bg-background-light cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-text-muted" />
                    <div>
                      <h4 className="font-medium text-text-dark">Additional Content</h4>
                      <p className="text-sm text-text-light">External resource</p>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      downloadFile(lesson.content_url, 'additional-content');
                    }}
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              ) : null}
            </div>
          </Card>
        ) : null}

        
      </div>

      {/* Sidebar */}
      {!sidebarCollapsed && (
        <div className="space-y-6">
          {/* Mobile Sidebar Close Button */}
          <div className="lg:hidden flex justify-end mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarCollapsed(true)}
              className="flex items-center gap-2"
            >
              <PanelLeftClose className="w-4 h-4" />
              <span className="text-sm">Hide Sidebar</span>
            </Button>
          </div>
        {/* Course Progress */}
        <Card className="p-6">
          <h3 className="font-semibold text-text-dark mb-4">Course Progress</h3>
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-text-medium">Overall Progress</span>
              <span className="font-medium">{courseProgressData.percentage}%</span>
            </div>
            <div className="w-full bg-background-medium rounded-full h-2">
              <div 
                className="bg-primary-default h-2 rounded-full" 
                style={{ width: `${courseProgressData.percentage}%` }}
              ></div>
            </div>
          </div>
          <p className="text-sm text-text-light">
            {courseProgressData.completedCount} of {courseProgressData.totalCount} lessons completed
          </p>

          {/* View Certificate button when course is 100% complete */}
          {courseProgressData.percentage === 100 && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <Button
                onClick={() => setShowCertificateModal(true)}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
                size="sm"
              >
                <Award className="w-4 h-4 mr-2" />
                View Certificate
              </Button>
            </div>
          )}
        </Card>

        {/* Lesson List */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-text-dark">Course Content</h3>
            <div className="text-sm text-text-light">
              {(() => {
                const completedLessons = lessons.filter(lesson => courseProgress[courseId]?.[lesson.id]?.completed).length;
                const completedQuizzes = Object.values(quizzesByLesson).flat().filter(qz => quizCompletionStatus[qz.id]).length;
                const totalQuizzes = Object.values(quizzesByLesson).flat().length;
                const totalItems = lessons.length + totalQuizzes;
                const completedItems = completedLessons + completedQuizzes;
                return `${completedItems} / ${totalItems} completed`;
              })()}
            </div>
          </div>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {(() => {
              // Create a combined list of lessons and quizzes in order
              const combinedItems = [];
              let itemIndex = 0;
              
              lessons.forEach((courseLesson) => {
                // Add the lesson
                combinedItems.push({
                  type: 'lesson',
                  data: courseLesson,
                  index: itemIndex++
                });
                
                // Add quizzes for this lesson immediately after
                if (Array.isArray(quizzesByLesson[courseLesson.id]) && quizzesByLesson[courseLesson.id].length > 0) {
                  quizzesByLesson[courseLesson.id].forEach((qz, qi) => {
                    combinedItems.push({
                      type: 'quiz',
                      data: qz,
                      lessonId: courseLesson.id,
                      index: itemIndex++
                    });
                  });
                }
              });
              
              // Add course-level final assessment at the end if it exists
              if (courseFinalAssessment) {
                combinedItems.push({
                  type: 'finalAssessment',
                  data: courseFinalAssessment,
                  index: itemIndex++
                });
              }
              
              return combinedItems.map((item) => {
                if (item.type === 'lesson') {
                  const courseLesson = item.data;
                  const isCurrentLesson = courseLesson.id === lessonId;
                  return (
                    <button
                      key={courseLesson.id}
                      onClick={() => {
                        // Prevent navigation to future lessons if current lesson time requirement not met
                        const currentLessonIndex = lessons.findIndex(l => l.id === lessonId);
                        const targetLessonIndex = lessons.findIndex(l => l.id === courseLesson.id);
                        
                        if (!isCourseCompleted && targetLessonIndex > currentLessonIndex && !timeRequirementMet) {
                          if (timeRemainingInfo) {
                            showError(`Please review the current lesson for at least ${timeRemainingInfo.totalMinutesRequired} minute${timeRemainingInfo.totalMinutesRequired !== 1 ? 's' : ''} before proceeding. You need ${timeRemainingInfo.minutesRemaining} more minute${timeRemainingInfo.minutesRemaining !== 1 ? 's' : ''}.`);
                          } else {
                            showError('Please complete the current lesson before proceeding to the next one.');
                          }
                          return;
                        }
                        navigate(`/app/courses/${courseId}/lesson/${courseLesson.id}`);
                      }}
                      disabled={!isCourseCompleted && lessons.findIndex(l => l.id === courseLesson.id) > lessons.findIndex(l => l.id === lessonId) && !timeRequirementMet}
                      className={`w-full text-left p-3 rounded-lg transition-colors ${
                        isCurrentLesson
                          ? 'bg-primary-light text-primary-default'
                          : !isCourseCompleted && lessons.findIndex(l => l.id === courseLesson.id) > lessons.findIndex(l => l.id === lessonId) && !timeRequirementMet
                          ? 'opacity-50 cursor-not-allowed'
                          : 'hover:bg-background-light'
                      }`}
                      title={
                        !isCourseCompleted && lessons.findIndex(l => l.id === courseLesson.id) > lessons.findIndex(l => l.id === lessonId) && !timeRequirementMet && timeRemainingInfo
                          ? `Please review the current lesson for at least ${timeRemainingInfo.totalMinutesRequired} minute${timeRemainingInfo.totalMinutesRequired !== 1 ? 's' : ''} before proceeding. You need ${timeRemainingInfo.minutesRemaining} more minute${timeRemainingInfo.minutesRemaining !== 1 ? 's' : ''}.`
                          : undefined
                      }
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0">
                          {courseProgress[courseId]?.[courseLesson.id]?.completed ? (
                            <CheckCircle className="w-5 h-5 text-success-default" />
                          ) : isCurrentLesson ? (
                            <Play className="w-5 h-5 text-primary-default" />
                          ) : (
                            <div className="w-5 h-5 rounded-full border border-background-dark flex items-center justify-center">
                              <span className="text-xs">{item.index + 1}</span>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm truncate">{courseLesson.title}</h4>
                          <p className="text-xs text-text-light">{formatTime(courseLesson.duration_minutes * 60 || 0)}</p>
                        </div>
                      </div>
                    </button>
                  );
                } else if (item.type === 'quiz') {
                  // Quiz item
                  const qz = item.data;
                  const isKnowledgeCheck = qz.quiz_type === 'non_graded';
                  const isCompleted = quizCompletionStatus[qz.id] || false;
                  const isCurrentQuiz =
                    !isKnowledgeCheck && location.pathname.includes(`/quiz/${qz.id}`);
                  const isActiveKnowledgeCheck =
                    isKnowledgeCheck && lessonId === item.lessonId && activeKnowledgeCheckId === qz.id;

                  const handleQuizClick = () => {
                    if (isKnowledgeCheck) {
                      if (item.lessonId !== lessonId) {
                        navigate(`/app/courses/${courseId}/lesson/${item.lessonId}?knowledgeCheck=${qz.id}`);
                        return;
                      }
                      const nextParams = new URLSearchParams(searchParams);
                      nextParams.set('knowledgeCheck', qz.id);
                      setSearchParams(nextParams, { replace: true });
                      setActiveKnowledgeCheckId(qz.id);
                      if (typeof document !== 'undefined') {
                        const element = document.getElementById(`knowledge-check-${qz.id}`);
                        if (element) {
                          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }
                      }
                      return;
                    }

                    navigate(`/app/courses/${courseId}/quiz/${qz.id}`);
                  };

                  return (
                    <button
                      key={`quiz-${qz.id}`}
                      onClick={handleQuizClick}
                      className={`w-full text-left p-3 rounded-lg transition-colors ${
                        isKnowledgeCheck
                          ? isActiveKnowledgeCheck
                            ? 'bg-primary-light text-primary-default'
                            : 'hover:bg-background-light'
                          : isCurrentQuiz
                            ? 'bg-primary-light text-primary-default'
                            : 'hover:bg-background-light'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0">
                          {isCompleted ? (
                            <CheckCircle className="w-5 h-5 text-success-default" />
                          ) : (isKnowledgeCheck && isActiveKnowledgeCheck) || (!isKnowledgeCheck && isCurrentQuiz) ? (
                            <Play className="w-5 h-5 text-primary-default" />
                          ) : (
                            <div className="w-5 h-5 rounded-full border border-background-dark flex items-center justify-center">
                              <span className="text-xs">{item.index + 1}</span>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm truncate">
                            <span className="text-primary-default">
                              {isKnowledgeCheck ? 'Knowledge Check:' : 'Quiz:'}
                            </span>{' '}
                            {qz.title}
                          </h4>
                          <p className="text-xs text-text-light">
                            {isKnowledgeCheck
                              ? `${qz.question_count || 0} question${(qz.question_count || 0) !== 1 ? 's' : ''}`
                              : `${qz.time_limit_minutes ? `${qz.time_limit_minutes} min` : 'No time limit'} • ${qz.question_count || 0} questions`}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                } else if (item.type === 'finalAssessment') {
                  // Final Assessment item
                  const finalAssessment = item.data;
                  const isCompleted = finalAssessmentCompleted || false;
                  const isCurrentQuiz = location.pathname.includes(`/quiz/${finalAssessment.id}`);

                  return (
                    <button
                      key={`final-assessment-${finalAssessment.id}`}
                      onClick={() => navigate(`/app/courses/${courseId}/quiz/${finalAssessment.id}`)}
                      className={`w-full text-left p-3 rounded-lg transition-colors border-t-2 border-primary-default mt-2 ${
                        isCurrentQuiz
                          ? 'bg-primary-light text-primary-default'
                          : 'hover:bg-background-light'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0">
                          {isCompleted ? (
                            <CheckCircle className="w-5 h-5 text-success-default" />
                          ) : isCurrentQuiz ? (
                            <Play className="w-5 h-5 text-primary-default" />
                          ) : (
                            <div className="w-5 h-5 rounded-full border-2 border-primary-default flex items-center justify-center">
                              <span className="text-xs font-bold">{item.index + 1}</span>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-sm truncate">
                            <span className="text-primary-default">Final Assessment:</span>{' '}
                            {finalAssessment.title}
                          </h4>
                          <p className="text-xs text-text-light">
                            {finalAssessment.time_limit_minutes ? `${finalAssessment.time_limit_minutes} min` : 'No time limit'} • {finalAssessment.question_count || 0} questions
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                }
                return null;
              });
            })()}
          </div>
        </Card>

        {/* Course Resources */}
        {(() => {
          const courseWithResources = courseFromStore || course;
          const resources = courseWithResources?.resources;
          return resources && Array.isArray(resources) && resources.length > 0;
        })() && (
          <Card className="p-6">
            <h3 className="font-semibold text-text-dark mb-4">Course Resources</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {((courseFromStore || course).resources || []).map((resource) => (
                resource.type === 'link' ? (
                  <a
                    key={resource.id}
                    href={normalizeUrl(resource.url)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-start p-2 border border-background-dark rounded-lg hover:bg-background-light transition-colors cursor-pointer no-underline"
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <ExternalLink className="w-4 h-4 text-blue-600 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm text-text-dark truncate">{resource.title}</h4>
                        {resource.description && (
                          <p className="text-xs text-text-light truncate">{resource.description}</p>
                        )}
                      </div>
                    </div>
                  </a>
                ) : (
                  <div
                    key={resource.id}
                    onClick={() => window.open(resource.url, '_blank', 'noopener,noreferrer')}
                    className="flex items-center justify-start p-2 border border-background-dark rounded-lg hover:bg-background-light transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <File className="w-4 h-4 text-text-muted flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm text-text-dark truncate">{resource.title}</h4>
                        {resource.description && (
                          <p className="text-xs text-text-light truncate">{resource.description}</p>
                        )}
                      </div>
                    </div>
                  </div>
                )
              ))}
            </div>
          </Card>
        )}

        {/* Ask Question */}
        <Card className="p-6">
          <h3 className="font-semibold text-text-dark mb-4">Need Help?</h3>
          <p className="text-sm text-text-light mb-4">
            Have questions about this lesson? Get help from the community.
          </p>
          <Button variant="secondary" className="w-full">
            <MessageCircle className="w-4 h-4 mr-2" />
            Ask a Question
          </Button>
        </Card>
        
        </div>
      )}
      
      {/* Floating Sidebar Toggle (when collapsed) */}
      {sidebarCollapsed && (
        <>
          {/* Mobile Floating Button */}
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setSidebarCollapsed(false)}
            className="fixed bottom-6 right-6 z-50 shadow-lg flex items-center gap-2 lg:hidden"
          >
            <PanelLeftOpen className="w-4 h-4" />
            <span className="text-sm">Show Sidebar</span>
          </Button>
          
          {/* Desktop Floating Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarCollapsed(false)}
            className="fixed top-20 right-6 z-50 shadow-lg flex items-center gap-2 hidden lg:flex"
          >
            <PanelLeftOpen className="w-4 h-4" />
            <span className="text-sm">Show Sidebar</span>
          </Button>
        </>
      )}

      <Modal
         isOpen={Boolean(activeKnowledgeCheck)}
         onClose={handleKnowledgeCheckModalClose}
         title={activeKnowledgeCheck ? activeKnowledgeCheck.title || 'Knowledge Check' : 'Knowledge Check'}
         size="default"
         showCloseButton
       >
        {activeKnowledgeCheck && (
          <KnowledgeCheckCard
            quiz={activeKnowledgeCheck}
            questions={quizQuestionsById[activeKnowledgeCheck.id] || []}
            initialResult={knowledgeCheckResults[activeKnowledgeCheck.id]}
            isCompleted={!!quizCompletionStatus[activeKnowledgeCheck.id]}
            onSubmit={handleKnowledgeCheckSubmit}
            onRetake={handleKnowledgeCheckReset}
            isActive
            variant="modal"
            onContinue={() => handleKnowledgeCheckContinue(activeKnowledgeCheck.id)}
          />
        )}
      </Modal>

      {/* Certificate Preview Modal */}
      {showCertificateModal && (
        <CertificatePreviewModal
          courseId={courseId}
          courseName={course?.title}
          userId={user?.id}
          isOpen={showCertificateModal}
          onClose={() => setShowCertificateModal(false)}
        />
      )}
    </div>
  )
}