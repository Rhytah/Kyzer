// src/pages/courses/LessonView.jsx
import { useState, useEffect, useCallback, useRef } from 'react'
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
  
} from 'lucide-react'
import { ScormPlayer } from '@/components/course'
import { useCourseStore } from '@/store/courseStore'
import { useAuth } from '@/hooks/auth/useAuth'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { useToast } from '@/components/ui'
 

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
  // Quiz state
  const [quiz, setQuiz] = useState(null)
  const [quizQuestions, setQuizQuestions] = useState([])
  const [quizStarted, setQuizStarted] = useState(false)
  const [quizAnswers, setQuizAnswers] = useState({})
  const [quizTimeLeftSec, setQuizTimeLeftSec] = useState(null)
  const quizTimerRef = useRef(null)
  const quizBlockRef = useRef(null)
  const [quizzesByLesson, setQuizzesByLesson] = useState({})
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
                // order quizzes by created_at ascending so they appear stable
                const sorted = [...courseQuizzes].sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
                sorted.forEach(q => {
                  if (!q.lesson_id) return;
                  if (!map[q.lesson_id]) map[q.lesson_id] = [];
                  map[q.lesson_id].push(q);
                })
                setQuizzesByLesson(map)
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

  // If URL contains #quiz, scroll to quiz section once quiz is loaded
  useEffect(() => {
    if (location.hash === '#quiz' && quiz && quizQuestions.length > 0 && quizBlockRef.current) {
      quizBlockRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [location.hash, quiz, quizQuestions])

  // Manage quiz timer
  useEffect(() => {
    if (!quizStarted) return
    if (!quiz || !quiz.time_limit_minutes || quiz.time_limit_minutes <= 0) return
    if (quizTimeLeftSec === null) return
    if (quizTimeLeftSec <= 0) {
      // Auto submit on time up
      handleSubmitQuiz()
      return
    }
    quizTimerRef.current = setTimeout(() => setQuizTimeLeftSec((s) => (s !== null ? s - 1 : s)), 1000)
    return () => {
      if (quizTimerRef.current) clearTimeout(quizTimerRef.current)
    }
  }, [quizStarted, quiz, quizTimeLeftSec])

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

  const quizLocked = !!(lesson?.is_required && !isCompleted)

  const startQuiz = () => {
    if (quizLocked) {
      showError('Complete this required lesson to unlock the quiz')
      return
    }
    setQuizStarted(true)
    setQuizAnswers({})
    if (quiz?.time_limit_minutes && quiz.time_limit_minutes > 0) {
      setQuizTimeLeftSec(quiz.time_limit_minutes * 60)
    } else {
      setQuizTimeLeftSec(null)
    }
  }

  const setAnswer = (qIndex, value) => {
    setQuizAnswers((prev) => ({ ...prev, [qIndex]: value }))
  }

  const handleSubmitQuiz = useCallback(async () => {
    // Calculate score
    let score = 0
    const max = quizQuestions.length
    quizQuestions.forEach((q, idx) => {
      const type = q.question_type
      const correct = q.correct_answer
      const ans = quizAnswers[idx]
      if (type === 'multiple_choice') {
        if (typeof ans === 'number' && ans === correct) score += 1
      } else if (type === 'multiple_select') {
        const aSet = new Set(Array.isArray(ans) ? ans : [])
        const cSet = new Set(Array.isArray(correct) ? correct : [])
        if (aSet.size === cSet.size && [...aSet].every(v => cSet.has(v))) score += 1
      } else if (type === 'true_false') {
        if (typeof ans === 'boolean' && ans === !!correct) score += 1
      } else if (type === 'short_answer') {
        if ((ans || '').toString().trim().toLowerCase() === ((correct || '').toString().trim().toLowerCase())) score += 1
      }
    })
    try {
      if (user?.id && quiz?.id) {
        await actions.submitQuizAttempt(user.id, quiz.id, quizAnswers, score)
      }
      success(`Quiz submitted. Score ${score}/${max}`)
    } catch (_) {
      showError('Failed to submit quiz')
    } finally {
      setQuizStarted(false)
      setQuizTimeLeftSec(null)
    }
  }, [user?.id, quiz?.id, quizQuestions, quizAnswers, actions, success, showError])

  // (Removed unused getMimeTypeFromUrl)

  // Helper function to check if URL is a YouTube URL
  const isYouTubeUrl = (url) => {
    if (!url) return false;
    return url.includes('youtube.com') || url.includes('youtu.be');
  };

  // Helper function to extract YouTube video ID
  const getYouTubeVideoId = (url) => {
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
  };

  const VideoPlayer = () => {
    if (lesson.content_type !== 'video') {
      // Handle text rendering with stored format marker
      if (lesson.content_type === 'text') {
        const parseStoredText = (raw) => {
          if (!raw) return { format: 'plaintext', text: '' };
          const match = raw.match(/^<!--content_format:(markdown|html|plaintext)-->([\s\S]*)/);
          if (match) {
            return { format: match[1], text: match[2] };
          }
          return { format: 'plaintext', text: raw };
        };
        const escapeHtml = (unsafe) => unsafe
          .replaceAll('&', '&amp;')
          .replaceAll('<', '&lt;')
          .replaceAll('>', '&gt;')
          .replaceAll('"', '&quot;')
          .replaceAll('\'', '&#039;');
        const renderMarkdownToHtml = (md) => {
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
        };

        const parsed = parseStoredText(lesson.content_text);
        const html = parsed.format === 'markdown'
          ? renderMarkdownToHtml(parsed.text)
          : parsed.format === 'html'
            ? parsed.text
            : `<p>${escapeHtml(parsed.text).replace(/\n/g, '<br/>')}<\/p>`;

      return (
          <div className="bg-gray-50 rounded-lg p-6">
            <div
              className="prose max-w-none text-text-medium"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          </div>
        );
      }
      // Handle PDF rendering
      if (lesson.content_type === 'pdf') {
        const pdfUrl = lesson.content_url;
        return (
          <div className="bg-gray-50 rounded-lg p-4">
            {pdfUrl ? (
              <div className="border rounded-lg overflow-hidden">
                <div className="relative">
                  <iframe
                    src={pdfUrl}
                    title="PDF Document"
                    className="w-full h-[70vh]"
                    loading="lazy"
                    onLoad={() => setPdfLoading(false)}
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
                <Button variant="secondary" onClick={() => window.open(pdfUrl, '_blank')}>
                  Open in new tab
                </Button>
            </div>
          )}
          </div>
        );
      }
      // Handle PPT rendering
      if (lesson.content_type === 'ppt') {
        const pptUrl = lesson.content_url;
        return (
          <div className="bg-gray-50 rounded-lg p-4">
            {pptUrl ? (
              <div className="border rounded-lg overflow-hidden">
                <div className="relative">
                  {(() => {
                    const isGoogleSlides = /docs\.google\.com\/presentation\/d\/[a-zA-Z0-9_-]+/i.test(pptUrl);
                    
                    if (isGoogleSlides) {
                      // Convert Google Slides edit URL to embed URL
                      const presentationId = pptUrl.match(/\/d\/([a-zA-Z0-9_-]+)/)?.[1];
                      const embedUrl = presentationId 
                        ? `https://docs.google.com/presentation/d/${presentationId}/embed`
                        : pptUrl;
                      
                      return (
                        <iframe
                          src={embedUrl}
                          title="Google Slides Presentation"
                          className="w-full h-[70vh]"
                          loading="lazy"
                          onLoad={() => setPptLoading(false)}
                          frameBorder="0"
                          allowFullScreen
                        />
                      );
                    } else {
                      return (
                        <iframe
                          src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(pptUrl)}`}
                          title="PowerPoint Presentation"
                          className="w-full h-[70vh]"
                          loading="lazy"
                          onLoad={() => setPptLoading(false)}
                          frameBorder="0"
                        />
                      );
                    }
                  })()}
                  {pptLoading && (
                    <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-600"></div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500 p-8">No presentation available.</div>
            )}
            {pptUrl && (
              <div className="mt-3 flex justify-end">
                <Button variant="secondary" onClick={() => window.open(pptUrl, '_blank')}>
                  Open in new tab
                </Button>
              </div>
            )}
          </div>
        );
      }

      // Fallback placeholder for other non-video content types
      return (
        <div className="bg-gray-100 rounded-lg p-8 text-center">
          <div className="text-gray-500 text-lg mb-4">Content Placeholder</div>
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
          <div className="relative w-full" style={{ paddingTop: '56.25%' }}>
            <iframe
              src={embedUrl}
              title="YouTube video player"
              className="absolute top-0 left-0 w-full h-full rounded-lg"
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
      <div className="relative">
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
  };

  // Video Error Display Component
  const VideoErrorDisplay = () => {
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
  };

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
        <Button onClick={() => navigate(`/app/courses/${courseId}`)}>
          Back to Course
        </Button>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Main Content */}
      <div className="lg:col-span-3 space-y-6">
        {/* Breadcrumb */}
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

        {/* Video Error Display */}
        <VideoErrorDisplay />
   

        {/* Lesson Info */}
        <Card className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-text-dark mb-2">{lesson.title}</h1>
              {/* Render formatted content preview (respect stored format marker) */}
              {(() => {
                const parseStoredText = (raw) => {
                  if (!raw) return { format: 'plaintext', text: '' };
                  const match = raw.match(/^<!--content_format:(markdown|html|plaintext)-->([\s\S]*)/);
                  if (match) {
                    return { format: match[1], text: match[2] };
                  }
                  return { format: 'plaintext', text: raw };
                };
                const escapeHtml = (unsafe) => unsafe
                  .replaceAll('&', '&amp;')
                  .replaceAll('<', '&lt;')
                  .replaceAll('>', '&gt;')
                  .replaceAll('"', '&quot;')
                  .replaceAll('\'', '&#039;');
                const renderMarkdownToHtml = (md) => {
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
                };
                const raw = lesson.content_text || lesson.description || '';
                if (!raw) {
                  return <p className="text-text-light">No description available</p>;
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
              })()}
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
        <Card className="p-6">
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
                {lesson.content_text ? (
                  lesson.content_text.split('\n\n').map((paragraph, index) => (
                    <p key={index} className="mb-4">{paragraph}</p>
                  ))
                ) : (
                  <p className="text-text-muted">No content available for this lesson.</p>
                )}
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
        </Card>

        {/* Quiz block (below the lesson content) */}
        {quiz && quizQuestions.length > 0 && (
          <div ref={quizBlockRef}>
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-text-dark">Quiz: {quiz.title}</h3>
                {quiz?.time_limit_minutes ? (
                  <span className="text-sm text-text-muted">Time limit: {quiz.time_limit_minutes} min</span>
                ) : null}
              </div>
              {!quizStarted ? (
                <div className="space-y-3">
                  {quizLocked && (
                    <div className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded p-3">
                      Complete this required lesson to unlock the quiz.
                    </div>
                  )}
                  <p className="text-text-light">Pass threshold: {quiz.pass_threshold ?? 70}%</p>
                  <Button onClick={startQuiz} disabled={quizLocked}>Start Quiz</Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {quiz?.time_limit_minutes ? (
                    <div className="text-sm text-text-muted">Time left: {formatTime(quizTimeLeftSec || 0)}</div>
                  ) : null}
                  {quizQuestions.map((q, idx) => (
                    <div key={idx} className="border rounded p-4">
                      <div className="font-medium mb-2">{idx + 1}. {q.question_text}</div>
                      {q.question_type === 'multiple_choice' && (
                        <div className="space-y-2">
                          {(q.options || []).map((opt, oi) => (
                            <label key={oi} className="flex items-center gap-2">
                              <input type="radio" name={`q-${idx}`} checked={quizAnswers[idx] === oi} onChange={() => setAnswer(idx, oi)} />
                              <span>{opt}</span>
                            </label>
                          ))}
                        </div>
                      )}
                      {q.question_type === 'multiple_select' && (
                        <div className="space-y-2">
                          {(q.options || []).map((opt, oi) => (
                            <label key={oi} className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={Array.isArray(quizAnswers[idx]) ? quizAnswers[idx].includes(oi) : false}
                                onChange={(e) => {
                                  const prev = new Set(Array.isArray(quizAnswers[idx]) ? quizAnswers[idx] : [])
                                  if (e.target.checked) prev.add(oi); else prev.delete(oi)
                                  setAnswer(idx, Array.from(prev))
                                }}
                              />
                              <span>{opt}</span>
                            </label>
                          ))}
                        </div>
                      )}
                      {q.question_type === 'true_false' && (
                        <div className="flex gap-4">
                          <label className="flex items-center gap-2">
                            <input type="radio" name={`q-${idx}`} checked={quizAnswers[idx] === true} onChange={() => setAnswer(idx, true)} />
                            <span>True</span>
                          </label>
                          <label className="flex items-center gap-2">
                            <input type="radio" name={`q-${idx}`} checked={quizAnswers[idx] === false} onChange={() => setAnswer(idx, false)} />
                            <span>False</span>
                          </label>
                        </div>
                      )}
                      {q.question_type === 'short_answer' && (
                        <input
                          type="text"
                          className="w-full px-3 py-2 border rounded"
                          value={(quizAnswers[idx] || '').toString()}
                          onChange={(e) => setAnswer(idx, e.target.value)}
                          placeholder="Your answer"
                        />
                      )}
                    </div>
                  ))}
                  <div className="flex justify-end">
                    <Button onClick={handleSubmitQuiz}>Submit Quiz</Button>
                  </div>
                </div>
              )}
            </Card>
          </div>
        )}

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
          <Button
            variant="secondary"
            onClick={goToPreviousLesson}
            disabled={lessons.findIndex(l => l.id === lessonId) === 0}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Previous Lesson
          </Button>
          
          <Button onClick={goToNextLesson}>
            Next Lesson
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        {/* Course Progress */}
        <Card className="p-6">
          <h3 className="font-semibold text-text-dark mb-4">Course Progress</h3>
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-text-medium">Overall Progress</span>
              <span className="font-medium">
                {course && courseProgress[courseId] ? 
                  Math.round((Object.values(courseProgress[courseId]).filter(p => p.completed).length / lessons.length) * 100) : 0
                }%
              </span>
            </div>
            <div className="w-full bg-background-medium rounded-full h-2">
              <div 
                className="bg-primary-default h-2 rounded-full" 
                style={{ 
                  width: `${course && courseProgress[courseId] ? 
                    (Object.values(courseProgress[courseId]).filter(p => p.completed).length / lessons.length) * 100 : 0
                  }%` 
                }}
              ></div>
            </div>
          </div>
          <p className="text-sm text-text-light">
            {course && courseProgress[courseId] ? 
              `${Object.values(courseProgress[courseId]).filter(p => p.completed).length} of ${lessons.length} lessons completed` :
              `0 of ${lessons.length} lessons completed`
            }
          </p>
        </Card>

        {/* Lesson List */}
        <Card className="p-6">
          <h3 className="font-semibold text-text-dark mb-4">Course Content</h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {lessons.map((courseLesson, index) => (
              <div key={courseLesson.id}>
                <button
                  onClick={() => navigate(`/app/courses/${courseId}/lesson/${courseLesson.id}`)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    courseLesson.id === lessonId
                      ? 'bg-primary-light text-primary-default'
                      : 'hover:bg-background-light'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0">
                      {courseProgress[courseId]?.[courseLesson.id]?.completed ? (
                        <CheckCircle className="w-5 h-5 text-success-default" />
                      ) : courseLesson.id === lessonId ? (
                        <Play className="w-5 h-5 text-primary-default" />
                      ) : (
                        <div className="w-5 h-5 rounded-full border border-background-dark flex items-center justify-center">
                          <span className="text-xs">{index + 1}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm truncate">{courseLesson.title}</h4>
                      <p className="text-xs text-text-light">{formatTime(courseLesson.duration_minutes * 60 || 0)}</p>
                    </div>
                  </div>
                </button>
                {Array.isArray(quizzesByLesson[courseLesson.id]) && quizzesByLesson[courseLesson.id].length > 0 && (
                  <div className="pl-10 py-1 space-y-1">
                    {quizzesByLesson[courseLesson.id].map((qz, qi) => (
                      <button
                        key={`${courseLesson.id}-${qz.id}`}
                        onClick={() => {
                          if (courseLesson.id === lessonId) {
                            if (quizBlockRef.current) {
                              quizBlockRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
                            }
                          } else {
                            navigate(`/app/courses/${courseId}/lesson/${courseLesson.id}#quiz`)
                          }
                        }}
                        className="w-full text-left text-xs text-text-medium hover:text-primary-default"
                      >
                        • Quiz{quizzesByLesson[courseLesson.id].length > 1 ? ` ${qi + 1}` : ''}: {qz.title}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
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
    </div>
  )
}