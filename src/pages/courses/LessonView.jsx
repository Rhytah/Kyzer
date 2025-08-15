// src/pages/courses/LessonView.jsx
import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
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
  RotateCcw
} from 'lucide-react'
import { useCourseStore } from '@/store/courseStore'
import { useAuth } from '@/hooks/auth/useAuth'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

export default function LessonView() {
  const { courseId, lessonId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  
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
  const [videoLoadTimeout, setVideoLoadTimeout] = useState(null)
  const [videoError, setVideoError] = useState(null)

  // Ref for video element to prevent AbortError
  const videoRef = useRef(null)

  // Effect to sync video state when video element is available
  useEffect(() => {
    if (videoRef.current && lesson?.content_type === 'video') {
      // Set initial video state
      videoRef.current.currentTime = currentTime;
    }
  }, [lesson?.content_type, currentTime]);

  // Effect to handle video loading timeout
  useEffect(() => {
    if (lesson?.content_type === 'video' && lesson?.content_url && !isYouTubeUrl(lesson.content_url)) {
      // Set loading state
      setVideoLoading(true);
      setVideoError(null);
      
      // Set a shorter timeout to prevent infinite loading (15 seconds)
      const timeout = setTimeout(() => {
        if (videoLoading) {
          setVideoError({
            error: null,
            errorCode: 'TIMEOUT',
            errorMessage: 'Video loading timeout - taking too long to load',
            networkState: 3,
            readyState: 0,
            src: lesson.content_url
          });
          setVideoLoading(false);
          
          // Force stop the video loading
          if (videoRef.current) {
            try {
              videoRef.current.pause();
              videoRef.current.removeAttribute('src');
              videoRef.current.load();
            } catch (error) {
              // Silently handle any errors during force stop
            }
          }
        }
      }, 15000); // Reduced from 30 to 15 seconds
      
      setVideoLoadTimeout(timeout);
      
      return () => {
        if (timeout) {
          clearTimeout(timeout);
        }
      };
    }
  }, [lesson?.content_type, lesson?.content_url, videoLoading]);

  // Function to save progress
  const saveProgress = useCallback(async (time = currentTime) => {
    if (user?.id && lesson && course) {
      try {
        await actions.updateLessonProgress(
          user.id,
          lesson.id,
          course.id,
          isCompleted,
          { 
            timeSpent: time,
            lastAccessed: new Date().toISOString()
          }
        )
      } catch (error) {
        // Handle error silently or set error state if needed
      }
    }
  }, [user?.id, lesson, course, isCompleted, currentTime, actions])

  // Function to handle video time updates for progress tracking
  const handleVideoTimeUpdate = useCallback(() => {
    if (videoRef.current && lesson && course) {
      const newTime = videoRef.current.currentTime;
      setCurrentTime(newTime);
      // Auto-save progress every 30 seconds, but only if we have the necessary data
      if (newTime > 0 && newTime % 30 < 1) {
        saveProgress(newTime);
      }
    }
  }, [saveProgress, lesson, course]);

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
            }
          }
        }
        setLoading(false)
      } catch (error) {
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
      if (videoRef.current && videoRef.current.currentTime > 0 && lesson && course) {
        saveProgress(videoRef.current.currentTime)
      }
    }, 30000)

    return () => clearInterval(interval)
  }, [saveProgress, lesson, course])

  const markAsCompleted = async () => {
    if (user?.id && lesson && course) {
      try {
        const timeSpent = videoRef.current ? videoRef.current.currentTime : currentTime;
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
        saveProgress(timeSpent)
      } catch (error) {
        // Handle error silently or set error state if needed
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
      return (
        <div className="bg-gray-100 rounded-lg p-8 text-center">
          <div className="text-gray-500 text-lg mb-4">
            {lesson.content_type === 'text' ? 'Text Content' : 'Content Placeholder'}
          </div>
          {lesson.content_text && (
            <div className="text-left bg-white p-4 rounded border">
              {lesson.content_text}
            </div>
          )}
        </div>
      );
    }

    // Check if it's a YouTube URL
    if (isYouTubeUrl(lesson.content_url)) {
      const videoId = getYouTubeVideoId(lesson.content_url);
      return (
        <div className="bg-gray-100 rounded-lg p-8 text-center">
          <div className="text-gray-500 text-lg mb-4">
            YouTube Video Detected
          </div>
          <div className="bg-white p-6 rounded-lg border">
            <p className="text-gray-700 mb-4">
              This lesson contains a YouTube video that cannot be played directly in the browser.
            </p>
            <div className="space-y-3">
              <a
                href={lesson.content_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
                Watch on YouTube
              </a>
              {videoId && (
                <div className="text-sm text-gray-500">
                  Video ID: {videoId}
                </div>
              )}
            </div>
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
          </div>
        </div>
      );
    }

    // Valid video URL - render video player
    return (
      <div className="relative">
        <video
          ref={videoRef}
          className="w-full rounded-lg shadow-lg"
          controls
          preload="metadata"
          onLoadStart={() => {
            setVideoLoading(true);
            setVideoError(null);
            if (videoLoadTimeout) {
              clearTimeout(videoLoadTimeout);
            }
          }}
          onCanPlay={() => {
            setVideoLoading(false);
            if (videoLoadTimeout) {
              clearTimeout(videoLoadTimeout);
            }
          }}
          onCanPlayThrough={() => {
            setVideoLoading(false);
            if (videoLoadTimeout) {
              clearTimeout(videoLoadTimeout);
            }
          }}
          onWaiting={() => setVideoLoading(true)}
          onProgress={() => setVideoLoading(false)}
          onError={(e) => {
            setVideoLoading(false);
            setVideoError({
              error: e.target.error,
              errorCode: e.target.error?.code,
              errorMessage: e.target.error?.message,
              networkState: e.target.networkState,
              readyState: e.target.readyState,
              src: lesson.content_url
            });
            if (videoLoadTimeout) {
              clearTimeout(videoLoadTimeout);
            }
          }}
                     onPlay={() => {
             if (videoRef.current) {
               videoRef.current.currentTime = currentTime || 0;
             }
           }}
                     onPause={() => {
             if (videoRef.current && lesson && course) {
               saveProgress(videoRef.current.currentTime);
             }
           }}
          onTimeUpdate={() => {
            if (videoRef.current && lesson && course) {
              handleVideoTimeUpdate();
            }
          }}
        >
          <source src={lesson.content_url} type="video/mp4" />
          <source src={lesson.content_url} type="video/webm" />
          <source src={lesson.content_url} type="video/ogg" />
          Your browser does not support the video tag.
        </video>
        
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
                  if (videoRef.current) {
                    videoRef.current.load();
                  }
                }}
              >
                Retry Loading
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => {
                  if (videoRef.current) {
                    try {
                      videoRef.current.pause();
                      videoRef.current.removeAttribute('src');
                      videoRef.current.load();
                      setVideoLoading(false);
                      setVideoError(null);
                    } catch (error) {
                      // Silently handle any errors during force stop
                    }
                  }
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

        {/* Video Player */}
        <Card className="p-0 overflow-hidden">
          <VideoPlayer />
        </Card>

        {/* Video Error Display */}
        <VideoErrorDisplay />
   

        {/* Lesson Info */}
        <Card className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-text-dark mb-2">{lesson.title}</h1>
              <p className="text-text-light">{lesson.content_text || lesson.description || 'No description available'}</p>
            </div>
            
            <div className="flex items-center gap-2">
              {!isCompleted ? (
                <Button onClick={markAsCompleted}>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Mark Complete
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
              <button
                key={courseLesson.id}
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