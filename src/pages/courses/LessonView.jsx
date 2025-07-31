// src/pages/courses/LessonView.jsx
import { useState, useEffect } from 'react'
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
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

export default function LessonView() {
  const { courseId, lessonId } = useParams()
  const navigate = useNavigate()
  
  const [lesson, setLesson] = useState(null)
  const [course, setCourse] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [showNotes, setShowNotes] = useState(false)
  const [notes, setNotes] = useState('')
  const [isCompleted, setIsCompleted] = useState(false)
  const [playbackSpeed, setPlaybackSpeed] = useState(1)

  // Mock lesson data
  const mockLesson = {
    id: lessonId,
    title: 'Introduction to React Hooks',
    description: 'Learn the fundamentals of React Hooks and how they revolutionized React development.',
    type: 'video', // 'video', 'text', 'quiz', 'assignment'
    duration: 1800, // seconds for video
    videoUrl: '/api/placeholder/video.mp4',
    transcript: `Welcome to this lesson on React Hooks. In this video, we'll explore the fundamental concepts of React Hooks and understand how they've changed the way we write React components.

React Hooks were introduced in React 16.8 as a way to use state and other React features in functional components. Before hooks, you could only use state in class components.

The most commonly used hooks are:
1. useState - for managing component state
2. useEffect - for side effects and lifecycle events
3. useContext - for consuming context
4. useReducer - for complex state management

Let's start by looking at the useState hook...`,
    resources: [
      {
        id: 1,
        title: 'React Hooks Cheat Sheet',
        type: 'pdf',
        url: '/resources/react-hooks-cheat-sheet.pdf',
        size: '2.5 MB'
      },
      {
        id: 2,
        title: 'Code Examples',
        type: 'zip',
        url: '/resources/hooks-examples.zip',
        size: '1.2 MB'
      }
    ],
    completed: false,
    moduleId: '2',
    moduleTitle: 'Advanced React Concepts',
    position: 3,
    totalLessons: 12
  }

  const mockCourse = {
    id: courseId,
    title: 'Complete React Development Bootcamp',
    instructor: 'Sarah Chen',
    lessons: [
      { id: '1-1', title: 'What is React?', duration: 900, completed: true },
      { id: '1-2', title: 'Setting up Development Environment', duration: 1500, completed: true },
      { id: '2-1', title: 'React Hooks Deep Dive', duration: 2400, completed: true },
      { id: '2-2', title: 'useEffect and Side Effects', duration: 2100, completed: true },
      { id: '2-3', title: 'Introduction to React Hooks', duration: 1800, completed: false, current: true },
      { id: '2-4', title: 'Custom Hooks', duration: 1800, completed: false },
      { id: '3-1', title: 'Context API', duration: 1500, completed: false }
    ]
  }

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setLesson(mockLesson)
      setCourse(mockCourse)
      setIsCompleted(mockLesson.completed)
      setLoading(false)
    }, 1000)
  }, [courseId, lessonId])

  useEffect(() => {
    // Auto-save progress every 30 seconds
    const interval = setInterval(() => {
      if (currentTime > 0) {
        saveProgress()
      }
    }, 30000)

    return () => clearInterval(interval)
  }, [currentTime])

  const saveProgress = () => {
    // Save progress to backend
  }

  const markAsCompleted = () => {
    setIsCompleted(true)
    saveProgress()
    // Show completion animation or notification
  }

  const goToNextLesson = () => {
    const currentIndex = course.lessons.findIndex(l => l.id === lessonId)
    const nextLesson = course.lessons[currentIndex + 1]
    if (nextLesson) {
      navigate(`/courses/${courseId}/lesson/${nextLesson.id}`)
    } else {
      navigate(`/courses/${courseId}/completion`)
    }
  }

  const goToPreviousLesson = () => {
    const currentIndex = course.lessons.findIndex(l => l.id === lessonId)
    const prevLesson = course.lessons[currentIndex - 1]
    if (prevLesson) {
      navigate(`/courses/${courseId}/lesson/${prevLesson.id}`)
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

  const VideoPlayer = () => (
    <div className="relative bg-black rounded-lg overflow-hidden">
      <div className="aspect-video bg-gray-900 flex items-center justify-center">
        <div className="text-white text-center">
          <Play className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p className="text-gray-400">Video Player Placeholder</p>
          <p className="text-sm text-gray-500 mt-2">{lesson.title}</p>
        </div>
      </div>
      
      {/* Video Controls */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
        {/* Progress Bar */}
        <div className="mb-4">
          <div className="w-full bg-white/20 rounded-full h-1 cursor-pointer">
            <div 
              className="bg-primary-default h-1 rounded-full"
              style={{ width: `${(currentTime / duration) * 100}%` }}
            ></div>
          </div>
        </div>
        
        {/* Controls */}
        <div className="flex items-center justify-between text-white">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsPlaying(!isPlaying)}
              className="text-white hover:text-white hover:bg-white/20"
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:text-white hover:bg-white/20"
            >
              <SkipBack className="w-4 h-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:text-white hover:bg-white/20"
            >
              <SkipForward className="w-4 h-4" />
            </Button>
            
            <div className="flex items-center gap-2">
              <Volume2 className="w-4 h-4" />
              <div className="w-16 bg-white/20 rounded-full h-1">
                <div className="bg-white h-1 rounded-full w-3/4"></div>
              </div>
            </div>
            
            <span className="text-sm">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <select
              value={playbackSpeed}
              onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
              className="bg-white/20 text-white text-sm rounded px-2 py-1 border-none"
            >
              <option value={0.5}>0.5x</option>
              <option value={0.75}>0.75x</option>
              <option value={1}>1x</option>
              <option value={1.25}>1.25x</option>
              <option value={1.5}>1.5x</option>
              <option value={2}>2x</option>
            </select>
            
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:text-white hover:bg-white/20"
            >
              <Settings className="w-4 h-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:text-white hover:bg-white/20"
            >
              <Maximize className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )

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
        <Button onClick={() => navigate(`/courses/${courseId}`)}>
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
            onClick={() => navigate(`/courses/${courseId}`)}
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

        {/* Lesson Info */}
        <Card className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-text-dark mb-2">{lesson.title}</h1>
              <p className="text-text-light">{lesson.description}</p>
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
              <span>{formatTime(lesson.duration)}</span>
            </div>
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              <span>Lesson {lesson.position} of {lesson.totalLessons}</span>
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
              <h3 className="text-lg font-semibold text-text-dark mb-4">Lesson Transcript</h3>
              <div className="prose max-w-none text-text-medium">
                {lesson.transcript.split('\n\n').map((paragraph, index) => (
                  <p key={index} className="mb-4">{paragraph}</p>
                ))}
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
        {lesson.resources && lesson.resources.length > 0 && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-text-dark mb-4">Lesson Resources</h3>
            <div className="space-y-3">
              {lesson.resources.map((resource) => (
                <div key={resource.id} className="flex items-center justify-between p-3 border border-background-dark rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-text-muted" />
                    <div>
                      <h4 className="font-medium text-text-dark">{resource.title}</h4>
                      <p className="text-sm text-text-light">{resource.type.toUpperCase()} • {resource.size}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            variant="secondary"
            onClick={goToPreviousLesson}
            disabled={course.lessons.findIndex(l => l.id === lessonId) === 0}
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
              <span className="font-medium">65%</span>
            </div>
            <div className="w-full bg-background-medium rounded-full h-2">
              <div className="bg-primary-default h-2 rounded-full" style={{ width: '65%' }}></div>
            </div>
          </div>
          <p className="text-sm text-text-light">
            29 of 45 lessons completed
          </p>
        </Card>

        {/* Lesson List */}
        <Card className="p-6">
          <h3 className="font-semibold text-text-dark mb-4">Course Content</h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {course.lessons.map((courseLesson, index) => (
              <button
                key={courseLesson.id}
                onClick={() => navigate(`/courses/${courseId}/lesson/${courseLesson.id}`)}
                className={`w-full text-left p-3 rounded-lg transition-colors ${
                  courseLesson.id === lessonId
                    ? 'bg-primary-light text-primary-default'
                    : 'hover:bg-background-light'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0">
                    {courseLesson.completed ? (
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
                    <p className="text-xs text-text-light">{formatTime(courseLesson.duration)}</p>
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