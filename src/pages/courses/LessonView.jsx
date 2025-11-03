// src/pages/courses/LessonView.jsx
import { useState, useEffect, useCallback, useRef, useMemo, memo } from 'react'
import ReactPlayer from 'react-player'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
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
  Award
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
  ContentTypeIcon
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

export default function LessonView() {
  const { courseId, lessonId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const location = useLocation()
  
  // Store selectors - individual to prevent infinite loops
  const courses = useCourseStore(state => state.courses)
  const courseProgress = useCourseStore(state => state.courseProgress)
  const actions = useCourseStore(state => state.actions)
  
  const [lesson, setLesson] = useState(null)
  const [course, setCourse] = useState(null)
  const [lessons, setLessons] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentTime, setCurrentTime] = useState(0)
  const [isCompleted, setIsCompleted] = useState(false)
  const [showNotes, setShowNotes] = useState(false)
  const [notes, setNotes] = useState('')
  const [videoLoading, setVideoLoading] = useState(false)
  const [videoError, setVideoError] = useState(null)
  const [isCompleting, setIsCompleting] = useState(false)
  const [pdfLoading, setPdfLoading] = useState(false)
  const [pptLoading, setPptLoading] = useState(false)
  const [haltVideo, setHaltVideo] = useState(false)
  const [playerKey, setPlayerKey] = useState(0)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [quizzesByLesson, setQuizzesByLesson] = useState({})
  const [quizCompletionStatus, setQuizCompletionStatus] = useState({})
  const [quiz, setQuiz] = useState(null)
  const [quizQuestions, setQuizQuestions] = useState([])
  const [showCertificateModal, setShowCertificateModal] = useState(false)
  const { success, error: showError } = useToast()

  // Player refs
  const playerRef = useRef(null)
  const videoReadyRef = useRef(false)
  const videoTimeoutRef = useRef(null)

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
            errorMessage: 'Video loading timeout - taking too long to load',
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

  // Effect to track PDF loading state when URL changes
  useEffect(() => {
    if (lesson?.content_type === 'pdf' && lesson?.content_url) {
      setPdfLoading(true)
    } else {
      setPdfLoading(false)
    }
  }, [lesson?.content_type, lesson?.content_url])

  // Effect to track PPT loading state when URL changes
  useEffect(() => {
    if (lesson?.content_type === 'ppt' && lesson?.content_url) {
      setPptLoading(true)
    } else {
      setPptLoading(false)
    }
  }, [lesson?.content_type, lesson?.content_url])

  // Function to save progress (supports completion override to avoid downgrades)
  const saveProgress = useCallback(async (time = currentTime, completedOverride = null) => {
    if (user?.id && lesson && course) {
      try {
        const completedFlag = completedOverride !== null ? completedOverride : isCompleted;
        await actions.updateLessonProgress(
          user.id,
          lesson.id,
          course.id,
          completedFlag,
          { 
            timeSpent: time,
            lastAccessed: new Date().toISOString()
          }
        )
      } catch (_) {
        // Handle error silently or set error state if needed
      }
    }
  }, [user?.id, lesson, course, isCompleted, currentTime, actions])

  // ReactPlayer onProgress will update time; no separate handler needed

  // Load course and lesson data from store
  useEffect(() => {
    const loadCourseData = async () => {
      try {
        // Fetch courses if not already loaded
        if (courses.length === 0) {
          if (user?.id) {
            await actions.fetchCourses({}, user.id)
          } else {
            await actions.fetchCourses()
          }
        }
        
        // Find the current course
        const foundCourse = courses.find(c => c.id === courseId)
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
            
            setLessons(flatLessons)

            // Fetch quizzes for the whole course to build lesson->quizzes map
            try {
              const { data: courseQuizzes } = await actions.fetchQuizzes(courseId)
              if (courseQuizzes && Array.isArray(courseQuizzes)) {
                const map = {};
                // Sort quizzes by order_index first, then by created_at
                const sorted = [...courseQuizzes].sort((a, b) => {
                  if (a.order_index !== null && b.order_index !== null) {
                    return a.order_index - b.order_index;
                  }
                  if (a.order_index !== null) return -1;
                  if (b.order_index !== null) return 1;
                  return new Date(a.created_at) - new Date(b.created_at);
                });

                // Filter to only include quizzes that have questions
                const quizzesWithQuestions = [];
                for (const quiz of sorted) {
                  if (!quiz.lesson_id) continue;

                  // Check if quiz has questions
                  try {
                    const { data: questions } = await actions.fetchQuizQuestions(quiz.id);
                    if (questions && questions.length > 0) {
                      quizzesWithQuestions.push({
                        ...quiz,
                        question_count: questions.length
                      });
                    }
                  } catch (error) {
                    // Could not fetch questions for quiz
                    // Skip this quiz if we can't fetch its questions
                  }
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
              } else {
                setQuizzesByLesson({})
              }
            } catch (_) {
              setQuizzesByLesson({})
            }
            // Find the current lesson
            const foundLesson = flatLessons.find(l => l.id === lessonId)
            if (foundLesson) {
              setLesson(foundLesson)
              actions.setCurrentLesson(foundLesson)
              
              // Check if lesson is completed
              if (user?.id) {
                const { data: progress } = await actions.fetchCourseProgress(user.id, courseId)
                const lessonProgress = progress?.[lessonId]
                setIsCompleted(lessonProgress?.completed || false)
              }
              // Load quiz linked to this lesson
              try {
                const { data: quizzes } = await actions.fetchQuizzesByLesson(foundLesson.id)
                if (quizzes && quizzes.length > 0) {
                  setQuiz(quizzes[0])
                  const { data: qs } = await actions.fetchQuizQuestions(quizzes[0].id)
                  setQuizQuestions(qs || [])
                } else {
                  setQuiz(null)
                  setQuizQuestions([])
                }
              } catch (_) {
                setQuiz(null)
                setQuizQuestions([])
              }
            }
          }
        }
        setLoading(false)
      } catch (_) {
        // Handle error silently or set error state if needed
        setLoading(false)
      }
    }

    if (courseId && lessonId) {
      loadCourseData()
    }
  }, [courseId, lessonId, courses, actions, user?.id])



  useEffect(() => {
    // Auto-save progress every 30 seconds
    const interval = setInterval(() => {
      if (currentTime > 0 && lesson && course) {
        saveProgress(currentTime)
      }
    }, 30000)

    return () => clearInterval(interval)
  }, [saveProgress, lesson, course, currentTime])

  const markAsCompleted = async () => {
    if (user?.id && lesson && course) {
      try {
        setIsCompleting(true)
        const timeSpent = currentTime;
        await actions.updateLessonProgress(
          user.id,
          lesson.id,
          course.id,
          true,
          { 
            timeSpent: timeSpent,
            completedAt: new Date().toISOString()
          }
        )
        setIsCompleted(true)
        // Ensure we do not downgrade completion on immediate autosave
        await saveProgress(timeSpent, true)
        success('Lesson marked as complete')
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
        showError('Failed to mark lesson complete')
      } finally {
        setIsCompleting(false)
      }
    }
  }

  

  const goToNextLesson = async () => {
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
          const nextLesson = flatLessons[currentIndex + 1]
          if (nextLesson) {
            navigate(`/app/courses/${courseId}/lesson/${nextLesson.id}`)
          } else {
            navigate(`/app/courses/${courseId}/completion`)
          }
        }
      } catch (error) {
        // Handle error silently or set error state if needed
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
      return data && data.length > 0 && data.some(attempt => attempt.completed);
    } catch (error) {
      console.error('Error checking quiz completion:', error);
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

  const courseProgressData = useMemo(() => {
    const progressPercentage = course && courseProgress[courseId] ? 
      Math.round((Object.values(courseProgress[courseId]).filter(p => p.completed).length / lessons.length) * 100) : 0;
    
    return {
      percentage: progressPercentage,
      completedCount: course && courseProgress[courseId] ? 
        Object.values(courseProgress[courseId]).filter(p => p.completed).length : 0,
      totalCount: lessons.length
    };
  }, [course, courseProgress, courseId, lessons.length]);

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

  // Memoized PDF Viewer component
  const PDFViewer = memo(({ pdfUrl, onLoad }) => {
    return (
      <div className="bg-gray-50 rounded-lg p-4">
        {pdfUrl ? (
          <div className="w-full aspect-video bg-gray-50 rounded-lg overflow-hidden">
            <div className="relative w-full h-full">
              <LazyIframe
                src={`${pdfUrl}#toolbar=1&navpanes=1&scrollbar=1&view=FitH`}
                title="PDF Document"
                className="w-full h-full"
                onLoad={onLoad}
                frameBorder="0"
              />
              {pdfLoading && (
                <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-600"></div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center text-gray-500 p-8">No PDF available.</div>
        )}
        {pdfUrl && (
          <div className="mt-3 flex justify-end">
            <ActionButton action="view" variant="secondary" onClick={() => window.open(pdfUrl, '_blank')}>
              Open in new tab
            </ActionButton>
          </div>
        )}
      </div>
    );
  });

  PDFViewer.displayName = 'PDFViewer';

  // Memoized PPT Viewer component
  const PPTViewer = memo(({ pptUrl, onLoad }) => {
    const [error, setError] = useState(null);
    
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

    const handleIframeLoad = () => {
      setError(null);
      if (onLoad) onLoad();
    };

    const handleIframeError = () => {
      setError('Failed to load PowerPoint presentation. The file may not be publicly accessible or the URL is invalid.');
      if (onLoad) onLoad();
    };

    return (
      <div className="bg-gray-50 rounded-lg p-4">
        {pptUrl ? (
          <>
            <div className="w-full aspect-video bg-gray-50 rounded-lg overflow-hidden">
              <div className="relative w-full h-full">
                {error ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-red-50 border border-red-200 rounded">
                    <div className="text-center p-6">
                      <div className="text-red-500 text-lg mb-2">⚠️ Loading Error</div>
                      <p className="text-sm text-red-600 mb-4">{error}</p>
                      <div className="text-xs text-gray-600 space-y-1">
                        <p>• Ensure the PowerPoint file is publicly accessible</p>
                        <p>• Check that the file URL is correct</p>
                        <p>• Verify the file exists in Supabase storage</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <LazyIframe
                    src={embedUrl}
                    title={isGoogleSlides ? "Google Slides Presentation" : "PowerPoint Presentation"}
                    className="w-full h-full"
                    onLoad={handleIframeLoad}
                    onError={handleIframeError}
                    frameBorder="0"
                    allowFullScreen={isGoogleSlides}
                  />
                )}
                {pptLoading && !error && (
                  <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-600"></div>
                  </div>
                )}
              </div>
            </div>
            <div className="mt-3 flex justify-between items-center">
              <div className="text-xs text-gray-500">
                {isGoogleSlides ? 'Google Slides' : 'Microsoft Office Online Viewer'}
              </div>
              <ActionButton action="view" variant="secondary" onClick={() => window.open(pptUrl, '_blank')}>
                Open in new tab
              </ActionButton>
            </div>
          </>
        ) : (
          <div className="text-center text-gray-500 p-8">No presentation available.</div>
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
  const ImageViewer = memo(({ imageUrl }) => {
    return (
      <div className="bg-gray-50 rounded-lg p-4">
        {imageUrl ? (
          <div className="w-full aspect-video bg-gray-50 rounded-lg overflow-hidden">
            <div className="w-full h-full flex items-center justify-center p-4">
              <img
                src={imageUrl}
                alt="Lesson Image"
                className="max-w-full max-h-full object-contain rounded-lg shadow-sm"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'block';
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
        ) : (
          <div className="text-center text-gray-500 p-8">No image available.</div>
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
        return <PDFViewer pdfUrl={lesson.content_url} onLoad={() => setPdfLoading(false)} />;
      }
      // Handle PPT rendering
      if (lesson.content_type === 'ppt') {
        return <PPTViewer pptUrl={lesson.content_url} onLoad={() => setPptLoading(false)} />;
      }
      // Handle image rendering
      if (lesson.content_type === 'image') {
        return <ImageViewer imageUrl={lesson.content_url} />;
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
          <div className="text-gray-500 text-lg mb-4">Content Placeholder</div>
          <p className="text-sm text-gray-400">Content type: {lesson.content_type || 'unknown'}</p>
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
            <div className="text-sm text-gray-500 break-all">Current URL: {lesson.content_url}</div>
            {lesson.content_url?.toLowerCase().endsWith('.mov') && (
              <div className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded p-3 mt-3 text-left">
                This appears to be a .mov file. Web playback for MOV is unreliable across browsers/CDNs.
                Please convert to MP4 (H.264 + AAC) before upload for best compatibility.
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
              errorMessage: 'Playback error',
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
            // Throttle saves to ~30s cadence
            if (lesson && course && t > 0 && t % 30 < 1) {
              saveProgress(t);
            }
          }}
          onEnded={() => {
            if (!isCompleted) {
              markAsCompleted();
            }
          }}
        />
        {videoLoading && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
            <div className="text-white text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
              <div>Loading video...</div>
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
        return 'Video loading timeout - taking too long to load';
      }
      
      switch (videoError.errorCode) {
        case 1:
          return 'Video loading was aborted';
        case 2:
          return 'Network error occurred while loading video';
        case 3:
          return 'Video decoding failed';
        case 4:
          return 'Video format not supported';
        default:
          return videoError.errorMessage || 'Unknown video error occurred';
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
            <h3 className="text-lg font-semibold text-red-800 mb-2">Video Loading Error</h3>
            <p className="text-red-700 mb-3">{getErrorMessage()}</p>
            <div className="text-sm text-red-600 mb-4">
              <p><strong>URL:</strong> {videoError.src}</p>
              <p><strong>Error Code:</strong> {videoError.errorCode}</p>
              {videoError.errorMessage && (
                <p><strong>Details:</strong> {videoError.errorMessage}</p>
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
        <p className="text-text-light mb-6">The lesson you're looking for doesn't exist.</p>
        <ActionButton action="previous" onClick={() => navigate(`/app/courses/${courseId}`)}>
          Back to Course
        </ActionButton>
      </div>
    )
  }

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
              onComplete={(completionData) => {
                // Handle SCORM completion
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
              {!isCompleted ? (
                <Button onClick={markAsCompleted} disabled={isCompleting}>
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
        {lesson.content_url && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-text-dark mb-4">Lesson Resources</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 border border-background-dark rounded-lg">
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
                  onClick={() => window.open(lesson.content_url, '_blank')}
                >
                  <Download className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Navigation */}
        <div className="flex justify-between">
          <ActionButton
            action="previous"
            onClick={goToPreviousLesson}
            disabled={lessons.findIndex(l => l.id === lessonId) === 0}
            variant="secondary"
          >
            Previous Lesson
          </ActionButton>
          
          <ActionButton action="next" onClick={goToNextLesson}>
            Next Lesson
          </ActionButton>
        </div>
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
              
              return combinedItems.map((item) => {
                if (item.type === 'lesson') {
                  const courseLesson = item.data;
                  const isCurrentLesson = courseLesson.id === lessonId;
                  return (
                    <button
                      key={courseLesson.id}
                      onClick={() => navigate(`/app/courses/${courseId}/lesson/${courseLesson.id}`)}
                      className={`w-full text-left p-3 rounded-lg transition-colors ${
                        isCurrentLesson
                          ? 'bg-primary-light text-primary-default'
                          : 'hover:bg-background-light'
                      }`}
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
                } else {
                  // Quiz item
                  const qz = item.data;
                  const isCompleted = quizCompletionStatus[qz.id] || false;
                  const isCurrentQuiz = lessonId === item.lessonId && quiz?.id === qz.id;
                  
                  return (
                    <button
                      key={`quiz-${qz.id}`}
                      onClick={() => {
                        navigate(`/app/courses/${courseId}/quiz/${qz.id}`);
                      }}
                      className={`w-full text-left p-3 rounded-lg transition-colors ${
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
                            <div className="w-5 h-5 rounded-full border border-background-dark flex items-center justify-center">
                              <span className="text-xs">{item.index + 1}</span>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm truncate">
                            <span className="text-primary-default">Quiz:</span> {qz.title}
                          </h4>
                          <p className="text-xs text-text-light">
                            {qz.time_limit_minutes ? `${qz.time_limit_minutes} min` : 'No time limit'} • {qz.question_count || 0} questions
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                }
              });
            })()}
          </div>
        </Card>

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