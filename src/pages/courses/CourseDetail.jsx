// src/pages/courses/CourseDetail.jsx
import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useCourseStore } from '@/store/courseStore'
import { useAuth } from '@/hooks/auth/useAuth'
import { 
  Play, 
  Clock, 
  Users, 
  Star, 
  Award,
  BookOpen,
  CheckCircle,
  Download,
  Share2,
  Heart,
  ChevronDown,
  ChevronRight,
  Globe,
  Smartphone,
  Layers
} from 'lucide-react'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

export default function CourseDetail() {
  const { courseId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  // Store selectors - individual to prevent infinite loops
  const courses = useCourseStore(state => state.courses);
  const enrolledCourses = useCourseStore(state => state.enrolledCourses);
  const courseProgress = useCourseStore(state => state.courseProgress);
  const loading = useCourseStore(state => state.loading);
  const error = useCourseStore(state => state.error);
  const fetchCourses = useCourseStore(state => state.actions.fetchCourses);
  const enrollInCourse = useCourseStore(state => state.actions.enrollInCourse);
  const fetchCourseLessons = useCourseStore(state => state.actions.fetchCourseLessons);
  const fetchCourseModules = useCourseStore(state => state.actions.fetchCourseModules);
  const fetchCourseProgress = useCourseStore(state => state.actions.fetchCourseProgress);
  const fetchEnrolledCourses = useCourseStore(state => state.actions.fetchEnrolledCourses);
  
  const [activeTab, setActiveTab] = useState('overview')
  const [expandedModule, setExpandedModule] = useState(null)
  const [lessons, setLessons] = useState([])
  const [modules, setModules] = useState([])
  const [courseStructure, setCourseStructure] = useState({})

  // Function to fetch lessons for the course
  const loadCourseLessons = async () => {
    if (courseId) {
      try {
        const [lessonsResult, modulesResult] = await Promise.all([
          fetchCourseLessons(courseId),
          fetchCourseModules(courseId)
        ]);
        
        if (lessonsResult.data) {
          setLessons(Object.values(lessonsResult.data).flatMap(moduleData => moduleData.lessons || []));
          setCourseStructure(lessonsResult.data);
        }
        
        if (modulesResult.data) {
          setModules(modulesResult.data);
        }
      } catch (error) {
        // Handle error silently or set error state if needed
      }
    }
  }

  // Mock course data - in real app, this would come from your database
  const mockCourse = {
    id: courseId,
    title: 'Complete React Development Bootcamp',
    subtitle: 'Master React from basics to advanced concepts including hooks, context, and testing',
    description: `This comprehensive React course will take you from beginner to advanced developer. You'll learn modern React concepts, best practices, and build real-world projects that you can add to your portfolio.

    The course covers everything from basic components to advanced patterns like render props, higher-order components, and custom hooks. You'll also learn about testing, performance optimization, and deployment strategies.`,
    category: 'Technology',
    level: 'Intermediate',
    duration: 1800, // total minutes
    price: 99,
    originalPrice: 149,
    rating: 4.8,
    totalRatings: 2156,
    students: 12500,
    language: 'English',
    lastUpdated: '2024-01-15',
    instructor: {
      name: 'Sarah Chen',
      title: 'Senior Frontend Developer at Google',
      bio: 'Sarah has 8+ years of experience in frontend development and has taught over 50,000 students.',
      avatar: '👩‍💻',
      rating: 4.9,
      students: 15000,
      courses: 12
    },
    features: [
      '25+ hours of on-demand video',
      '50+ coding exercises',
      '10 real-world projects',
      'Lifetime access',
      'Certificate of completion',
      'Money-back guarantee',
      'Mobile and TV access',
      'Community support'
    ],
    requirements: [
      'Basic HTML and CSS knowledge',
      'JavaScript fundamentals (ES6+)',
      'A computer with internet access',
      'Code editor (VS Code recommended)'
    ],
    outcomes: [
      'Build modern React applications from scratch',
      'Master React hooks and context API',
      'Implement state management with Redux',
      'Write unit and integration tests',
      'Deploy applications to production',
      'Optimize React apps for performance'
    ],
    curriculum: [
      {
        id: 1,
        title: 'Getting Started with React',
        duration: 180,
        lessons: 8,
        lectures: [
          { id: '1-1', title: 'What is React?', duration: 15, type: 'video', free: true },
          { id: '1-2', title: 'Setting up Development Environment', duration: 25, type: 'video', free: true },
          { id: '1-3', title: 'Your First React Component', duration: 20, type: 'video', free: false },
          { id: '1-4', title: 'JSX Fundamentals', duration: 30, type: 'video', free: false },
          { id: '1-5', title: 'Props and Component Communication', duration: 35, type: 'video', free: false },
          { id: '1-6', title: 'Handling Events', duration: 25, type: 'video', free: false },
          { id: '1-7', title: 'State Management Basics', duration: 30, type: 'video', free: false },
          { id: '1-8', title: 'Project: Todo List App', duration: 45, type: 'project', free: false }
        ]
      },
      {
        id: 2,
        title: 'Advanced React Concepts',
        duration: 240,
        lessons: 12,
        lectures: [
          { id: '2-1', title: 'React Hooks Deep Dive', duration: 40, type: 'video', free: false },
          { id: '2-2', title: 'useEffect and Side Effects', duration: 35, type: 'video', free: false },
          { id: '2-3', title: 'Custom Hooks', duration: 30, type: 'video', free: false },
          { id: '2-4', title: 'Context API', duration: 25, type: 'video', free: false },
          { id: '2-5', title: 'Error Boundaries', duration: 20, type: 'video', free: false },
          // ... more lectures
        ]
      },
      {
        id: 3,
        title: 'State Management with Redux',
        duration: 200,
        lessons: 10,
        lectures: [
          { id: '3-1', title: 'Introduction to Redux', duration: 25, type: 'video', free: false },
          { id: '3-2', title: 'Actions and Reducers', duration: 30, type: 'video', free: false },
          // ... more lectures
        ]
      }
    ],
    reviews: [
      {
        id: 1,
        user: 'John Doe',
        avatar: '👨‍💼',
        rating: 5,
        date: '2024-01-10',
        comment: 'Excellent course! Very comprehensive and well-structured. Sarah explains complex concepts in a simple way.'
      },
      {
        id: 2,
        user: 'Jane Smith',
        avatar: '👩‍🎓',
        rating: 5,
        date: '2024-01-08',
        comment: 'The projects in this course are amazing. I built a real portfolio that helped me land my dream job!'
      },
      {
        id: 3,
        user: 'Mike Johnson',
        avatar: '👨‍💻',
        rating: 4,
        date: '2024-01-05',
        comment: 'Great content overall. The instructor is knowledgeable and the examples are practical.'
      }
    ]
  }

  // Get the current course from the store
  const course = courses?.find(c => c.id === courseId) || mockCourse
  
  // Check if user is enrolled
  const isEnrolled = enrolledCourses?.some(enrollment => 
    enrollment.course_id === courseId || enrollment.id === courseId
  )

  // Fetch lessons when component mounts
  useEffect(() => {
    loadCourseLessons()
  }, [courseId])

  // Load per-user progress map for this course
  useEffect(() => {
    if (user?.id && courseId) {
      fetchCourseProgress(user.id, courseId)
    }
  }, [user?.id, courseId, fetchCourseProgress])

  // Keep enrollment with progress_percentage fresh for accurate UI
  useEffect(() => {
    if (user?.id) {
      fetchEnrolledCourses(user.id)
    }
  }, [user?.id, fetchEnrolledCourses])

  useEffect(() => {
    // Fetch courses if not already loaded
    if (!courses || courses.length === 0) {
      if (user?.id) {
        fetchCourses({}, user.id)
      } else {
        fetchCourses()
      }
    }
  }, [courses, fetchCourses, user?.id])

  // Handle course enrollment
  const handleEnroll = async () => {
    if (!user) {
      navigate('/auth/login')
      return
    }

    try {
      await enrollInCourse(user.id, courseId)
      // The store will automatically refresh enrolled courses
    } catch (error) {
      // Handle error silently or set error state if needed
    }
  }

  const toggleModule = (moduleId) => {
    setExpandedModule(expandedModule === moduleId ? null : moduleId)
  }

  const getProgressPercentage = () => {
    if (course?.progress_percentage !== undefined && course?.progress_percentage !== null) {
      return course.progress_percentage
    }
    const progressMap = courseProgress?.[courseId]
    if (!progressMap || lessons.length === 0) return 0
    const completedCount = Object.values(progressMap).filter(p => p.completed).length
    return Math.round((completedCount / lessons.length) * 100)
  }

  const getNextLessonId = () => {
    if (!lessons || lessons.length === 0) return null
    const progressMap = courseProgress?.[courseId] || {}
    const next = lessons.find(l => !progressMap[l.id]?.completed)
    return next ? next.id : lessons[0].id
  }

  const getTotalDurationMinutes = () => {
    const sumFromLessons = lessons && lessons.length > 0
      ? lessons.reduce((total, l) => total + (l?.duration_minutes || 0), 0)
      : 0
    if (sumFromLessons > 0) return sumFromLessons
    return (course?.duration_minutes || course?.duration || 0) || 0
  }

  const formatDuration = (totalMinutes) => {
    const minutes = Math.max(0, Math.floor(totalMinutes || 0))
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0 && mins > 0) return `${hours}h ${mins}m`
    if (hours > 0) return `${hours}h`
    return `${mins}m`
  }

  if (loading.courses) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!course) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-text-dark mb-4">Course Not Found</h2>
        <p className="text-text-light mb-6">The course you're looking for doesn't exist.</p>
        <Link to="/app/courses">
          <Button>Browse All Courses</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Hero Section with Cover Image */}
      <div className="relative text-white rounded-lg overflow-hidden">
        {course.thumbnail_url ? (
          <>
            <img
              src={course.thumbnail_url}
              alt={`${course.title} cover`}
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/30" />
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-r from-primary-dark to-primary-default" />
        )}
        <div className="relative p-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <span className="bg-white/20 text-white px-3 py-1 rounded-full text-sm">
                {course.category?.name || 'General'}
              </span>
              <span className="text-white/80 text-sm">{course.level || course.difficulty_level || 'Beginner'}</span>
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold mb-4">{course.title}</h1>
            <p className="text-xl text-white/90 mb-6">{course.subtitle || course.description?.substring(0, 100) + '...'}</p>
            
            <div className="flex flex-wrap items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="font-medium">{course.rating || '4.5'}</span>
                <span className="text-white/80">({(course.totalRatings || 0).toLocaleString()} ratings)</span>
              </div>

              {/* Enrollment progress bar */}
              {isEnrolled && (
                <div className="mt-2 text-left">
                  <div className="flex items-center justify-between text-sm text-text-muted mb-1">
                    <span>Progress</span>
                    <span>{getProgressPercentage()}%</span>
                  </div>
                  <div className="w-full bg-background-medium rounded-full h-2">
                    <div
                      className="h-2 rounded-full bg-primary-default"
                      style={{ width: `${getProgressPercentage()}%` }}
                    ></div>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>{(course.students || 0).toLocaleString()} students</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{formatDuration(getTotalDurationMinutes())}</span>
              </div>
              {/* Modules and Lessons counts */}
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4" />
                <span>{modules?.length || 0} modules</span>
              </div>
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                <span>{lessons?.length || 0} lessons</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4" />
                <span>{course.language || 'English'}</span>
              </div>
            </div>
          </div>

          {/* Enrollment Card */}
          <div className="lg:col-span-1">
            <Card className="p-6 bg-white text-text-dark">
              <div className="text-center mb-8">
              
                
                <div className="flex items-center justify-center gap-2 mb-2">
                  <span className="text-3xl font-bold">${course.price || 'Free'}</span>
                  {course.originalPrice && (
                    <span className="text-lg text-text-muted line-through">${course.originalPrice}</span>
                  )}
                </div>
                
                {course.originalPrice && (
                  <span className="text-success-default font-medium">
                    {Math.round(((course.originalPrice - (course.price || 0)) / course.originalPrice) * 100)}% off
                  </span>
                )}
              </div>

              {isEnrolled ? (
                (() => {
                  const progressPct = getProgressPercentage();
                  const hasStarted = progressPct > 0 || !!course?.last_accessed;
                  const nextLessonId = getNextLessonId();
                  return (
                    <div className="space-y-3">
                      {hasStarted ? (
                        nextLessonId && (
                          <Link to={`/app/courses/${courseId}/lesson/${nextLessonId}`}>
                            <Button className="w-full" size="lg">
                              <BookOpen className="w-4 h-4 mr-2" />
                              Continue ({progressPct}%)
                            </Button>
                          </Link>
                        )
                      ) : (
                        <Link to={`/app/courses/${courseId}/learning`}>
                          <Button className="w-full" size="lg">
                            <Play className="w-5 h-5 mr-2" />
                            Start Learning
                          </Button>
                        </Link>
                      )}
                      <div className="text-center text-sm text-success-default">
                        ✓ You're enrolled in this course
                      </div>
                    </div>
                  );
                })()
              ) : (
                <div className="space-y-3">
                  <Button className="w-full" size="lg" onClick={handleEnroll}>
                    Enroll Now
                  </Button>
                  <Button variant="ghost" className="w-full">
                    <Heart className="w-4 h-4 mr-2" />
                    Add to Wishlist
                  </Button>
                </div>
              )}

              <div className="mt-6 space-y-2 text-sm text-text-medium">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-success-default" />
                  <span>30-day money-back guarantee</span>
                </div>
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-success-default" />
                  <span>Mobile and TV access</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-success-default" />
                  <span>Certificate of completion</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-background-dark">
        <nav className="flex space-x-8">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'curriculum', label: 'Curriculum' },
            { id: 'instructor', label: 'Instructor' },
            { id: 'reviews', label: 'Reviews' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-primary-default text-primary-default'
                  : 'border-transparent text-text-light hover:text-text-medium'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Description */}
              <Card className="p-6">
                <h2 className="text-2xl font-bold text-text-dark mb-4">About This Course</h2>
                <div className="prose max-w-none text-text-medium">
                  {course.description ? (
                    course.description.split('\n\n').map((paragraph, index) => (
                      <p key={index} className="mb-4">{paragraph}</p>
                    ))
                  ) : (
                    <p>No description available for this course.</p>
                  )}
                </div>
              </Card>

              {/* What You'll Learn */}
              <Card className="p-6">
                <h2 className="text-2xl font-bold text-text-dark mb-4">What You'll Learn</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {course.outcomes ? (
                    course.outcomes.map((outcome, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-success-default flex-shrink-0 mt-0.5" />
                        <span className="text-text-dark">{outcome}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-text-medium">Learning objectives not specified for this course.</p>
                  )}
                </div>
              </Card>

              {/* Requirements */}
              <Card className="p-6">
                <h2 className="text-2xl font-bold text-text-dark mb-4">Requirements</h2>
                <ul className="space-y-2">
                  {course.requirements ? (
                    course.requirements.map((requirement, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-text-muted rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-text-medium">{requirement}</span>
                      </li>
                    ))
                  ) : (
                    <p className="text-text-medium">No specific requirements listed for this course.</p>
                  )}
                </ul>
              </Card>
            </div>
          )}

          {activeTab === 'curriculum' && (
            <Card className="p-6">
              <h2 className="text-2xl font-bold text-text-dark mb-6">Course Curriculum</h2>
              <div className="space-y-4">
                {modules && modules.length > 0 ? (
                  modules.map((module) => (
                    <div key={module.id} className="border border-background-dark rounded-lg">
                      <button
                        onClick={() => setExpandedModule(expandedModule === module.id ? null : module.id)}
                        className="w-full flex items-center justify-between p-4 hover:bg-background-light transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          {expandedModule === module.id ? (
                            <ChevronDown className="w-5 h-5 text-text-medium" />
                          ) : (
                            <ChevronRight className="w-5 h-5 text-text-medium" />
                          )}
                          <div className="text-left">
                            <h3 className="font-semibold text-text-dark">{module.title}</h3>
                            <p className="text-sm text-text-light">
                              {(() => {
                                const lessonList = courseStructure[module.id]?.lessons || [];
                                const lessonCount = lessonList.length;
                                const totalMins = lessonList.reduce((sum, l) => sum + (l?.duration_minutes || 0), 0);
                                return `${lessonCount} lessons • ${totalMins} min`;
                              })()}
                            </p>
                          </div>
                        </div>
                      </button>

                      {expandedModule === module.id && (
                        <div className="border-t border-background-dark">
                          {courseStructure[module.id]?.lessons?.map((lesson, index) => (
                            <div key={lesson.id} className="flex items-center justify-between p-4 hover:bg-background-light">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-background-medium rounded flex items-center justify-center">
                                  {lesson.content_type === 'video' ? (
                                    <Play className="w-4 h-4 text-text-muted" />
                                  ) : (
                                    <BookOpen className="w-4 h-4 text-text-muted" />
                                  )}
                                </div>
                                <div>
                                  <h4 className="font-medium text-text-dark">{lesson.title}</h4>
                                  <p className="text-sm text-text-light">{lesson.duration_minutes || 0} min</p>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                {isEnrolled && (
                                  <Link to={`/app/courses/${courseId}/lesson/${lesson.id}`}>
                                    <Button size="sm" variant="ghost">
                                      <Play className="w-4 h-4" />
                                    </Button>
                                  </Link>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                ) : lessons && lessons.length > 0 ? (
                  // Fallback: show lessons without modules if no modules exist
                  <div className="space-y-2">
                    {lessons.map((lesson) => (
                      <div key={lesson.id} className="flex items-center justify-between p-4 border border-background-dark rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-background-medium rounded flex items-center justify-center">
                            {lesson.content_type === 'video' ? (
                              <Play className="w-4 h-4 text-text-muted" />
                            ) : (
                              <BookOpen className="w-4 h-4 text-text-muted" />
                            )}
                          </div>
                          <div>
                            <h4 className="font-medium text-text-dark">{lesson.title}</h4>
                            <p className="text-sm text-text-light">{lesson.duration_minutes || 0} min</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {isEnrolled && (
                            <Link to={`/app/courses/${courseId}/lesson/${lesson.id}`}>
                              <Button size="sm" variant="ghost">
                                <Play className="w-4 h-4" />
                              </Button>
                            </Link>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-text-medium">No curriculum available for this course.</p>
                )}
              </div>
            </Card>
          )}

          {activeTab === 'instructor' && (
            <Card className="p-6">
              <h2 className="text-2xl font-bold text-text-dark mb-6">Instructor</h2>
              {course.instructor ? (
                <div className="flex items-start gap-6">
                  <div className="text-6xl">{course.instructor.avatar}</div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-text-dark mb-2">{course.instructor.name}</h3>
                    <p className="text-text-medium mb-4">{course.instructor.title}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-text-dark">{course.instructor.rating}</div>
                        <div className="text-sm text-text-light">Instructor Rating</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-text-dark">{course.instructor.students.toLocaleString()}</div>
                        <div className="text-sm text-text-light">Students</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-text-dark">{course.instructor.courses}</div>
                        <div className="text-sm text-text-light">Courses</div>
                      </div>
                    </div>
                    
                    <p className="text-text-medium">{course.instructor.bio}</p>
                  </div>
                </div>
              ) : (
                <p className="text-text-medium">No instructor information available for this course.</p>
              )}
            </Card>
          )}

          {activeTab === 'reviews' && (
            <Card className="p-6">
              <h2 className="text-2xl font-bold text-text-dark mb-6">Student Reviews</h2>
              
              {course.reviews ? (
                <>
                  <div className="mb-8">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="text-4xl font-bold text-text-dark">{course.rating || '4.5'}</div>
                      <div>
                        <div className="flex items-center gap-1 mb-1">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="w-5 h-5 fill-warning-default text-warning-default" />
                          ))}
                        </div>
                        <p className="text-text-light">Based on {(course.totalRatings || 0).toLocaleString()} reviews</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {course.reviews.map((review) => (
                      <div key={review.id} className="border-b border-background-light pb-6 last:border-b-0">
                        <div className="flex items-start gap-4">
                          <div className="text-3xl">{review.avatar}</div>
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="font-medium text-text-dark">{review.user}</h4>
                              <div className="flex items-center gap-1">
                                {[...Array(review.rating)].map((_, i) => (
                                  <Star key={i} className="w-4 h-4 fill-warning-default text-warning-default" />
                                ))}
                              </div>
                              <span className="text-sm text-text-light">{new Date(review.date).toLocaleDateString()}</span>
                            </div>
                            <p className="text-text-medium">{review.comment}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <p className="text-text-medium">No reviews available for this course yet.</p>
              )}
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Course Features */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-text-dark mb-4">This course includes:</h3>
            <div className="space-y-3">
              {course.features ? (
                course.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle className="w-4 h-4 text-success-default flex-shrink-0" />
                    <span className="text-text-dark text-sm">{feature}</span>
                  </div>
                ))
              ) : (
                <p className="text-text-medium text-sm">Course features not specified.</p>
              )}
            </div>
          </Card>

          {/* Share Course */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-text-dark mb-4">Share this course</h3>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" className="flex-1">
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
              <Button variant="ghost" size="sm" className="flex-1">
                <Download className="w-4 h-4 mr-2" />
                Save
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}