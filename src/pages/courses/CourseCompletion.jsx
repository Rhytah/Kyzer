


// src/pages/courses/CourseCompletion.jsx
import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { 
  Award, 
  Download, 
  Share2, 
  Star,
  Clock,
  BookOpen,

  ArrowRight,
  CheckCircle,
  Trophy,
  Target,
  Calendar
} from 'lucide-react'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { useCourseStore } from '@/store/courseStore'
import { useAuth } from '@/hooks/auth/useAuth'
import CertificatePreviewModal from '@/components/course/CertificatePreviewModal'

export default function CourseCompletion() {
  const { courseId } = useParams()
  const { user } = useAuth()
  const courses = useCourseStore(state => state.courses)
  const actions = useCourseStore(state => state.actions)
  const certificates = useCourseStore(state => state.certificates)
  const [course, setCourse] = useState(null)
  const [completionData, setCompletionData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showConfetti, setShowConfetti] = useState(false)
  const [rating, setRating] = useState(0)
  const [review, setReview] = useState('')
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [recommendedCourses, setRecommendedCourses] = useState([])
  const [showCertificateModal, setShowCertificateModal] = useState(false)

  // Mock completion data
  const mockCompletionData = {
    completedAt: new Date().toISOString(),
    totalTimeSpent: 1650, // minutes
    finalScore: 92,
    lessonsCompleted: 45,
    totalLessons: 45,
    quizzesPassed: 8,
    totalQuizzes: 8,
    projectsCompleted: 3,
    certificate: {
      id: 'cert-react-001',
      downloadUrl: '/certificates/react-completion.pdf',
      shareUrl: 'https://kyzer.com/certificates/cert-react-001'
    },
    badges: [
      { id: 1, name: 'React Master', icon: '⚛️', description: 'Completed all React lessons' },
      { id: 2, name: 'Project Builder', icon: '🏗️', description: 'Built 3+ projects' },
      { id: 3, name: 'Quick Learner', icon: '⚡', description: 'Completed course in record time' }
    ],
    skills: [
      { name: 'React Development', level: 'Advanced' },
      { name: 'JavaScript ES6+', level: 'Advanced' },
      { name: 'State Management', level: 'Intermediate' },
      { name: 'Testing', level: 'Intermediate' }
    ]
  }

  const mockCourse = {
    id: courseId,
    title: 'Complete React Development Bootcamp',
    instructor: 'Sarah Chen',
    category: 'Technology',
    level: 'Intermediate',
    rating: 4.8,
    students: 12500,
    description: 'Master React from basics to advanced concepts including hooks, context, and testing.'
  }

  // recommendedCourses are computed from actual courses
  useEffect(() => {
    const loadData = async () => {
      try {
        // Ensure course is available
        let found = courses.find(c => c.id === courseId)
        if (!found) {
          const { data } = await actions.fetchCourses()
          found = (data || []).find(c => c.id === courseId) || null
        }
        setCourse(found)

        if (!user?.id || !courseId) {
          setCompletionData(null)
          setLoading(false)
          return
        }

        // Fetch lessons, progress, and quiz data
        const [{ data: groupedLessons }, { data: progressMap }, { data: courseQuizzes }] = await Promise.all([
          actions.fetchCourseLessons(courseId),
          actions.fetchCourseProgress(user.id, courseId),
          actions.fetchQuizzes(courseId),
        ])

        // Flatten lessons for counts
        let totalLessons = 0
        if (groupedLessons && typeof groupedLessons === 'object') {
          Object.values(groupedLessons).forEach(moduleData => {
            if (moduleData && Array.isArray(moduleData.lessons)) totalLessons += moduleData.lessons.length
          })
        }

        // Compute completion stats from progress
        const progressValues = progressMap ? Object.values(progressMap) : []
        const completedItems = progressValues.filter(p => p.completed)
        const lessonsCompleted = completedItems.length
        const totalTimeSpent = progressValues.reduce((sum, p) => sum + (p?.metadata?.timeSpent || 0), 0)
        const latestCompletedAt = completedItems.reduce((latest, p) => {
          const ct = p?.completed_at ? new Date(p.completed_at).getTime() : 0
          return ct > latest ? ct : latest
        }, 0)

        // Calculate quiz completion stats
        let quizzesPassed = 0
        let totalQuizzes = 0
        if (courseQuizzes && courseQuizzes.length > 0) {
          totalQuizzes = courseQuizzes.length
          
          // Fetch quiz attempts for all quizzes
          const quizAttemptsPromises = courseQuizzes.map(quiz => 
            actions.fetchQuizAttempts(user.id, quiz.id)
          )
          
          try {
            const quizAttemptsResults = await Promise.all(quizAttemptsPromises)
            
            courseQuizzes.forEach((quiz, index) => {
              const attempts = quizAttemptsResults[index]?.data || []
              if (attempts.length > 0) {
                // Find the most recent attempt
                const latestAttempt = attempts.sort((a, b) => 
                  new Date(b.completed_at) - new Date(a.completed_at)
                )[0]
                
                if (latestAttempt.passed) {
                  quizzesPassed++
                }
              }
            })
          } catch (error) {
            console.warn('Error fetching quiz attempts:', error)
          }
        }

        const computed = {
          completedAt: latestCompletedAt ? new Date(latestCompletedAt).toISOString() : null,
          totalTimeSpent,
          finalScore: null,
          lessonsCompleted,
          totalLessons,
          quizzesPassed,
          totalQuizzes,
          quizCompletionPercentage: totalQuizzes > 0 ? Math.round((quizzesPassed / totalQuizzes) * 100) : 0,
          projectsCompleted: null,
          certificate: null,
          badges: [],
          skills: [],
        }

        setCompletionData(computed)
        setLoading(false)

        // Show confetti only if all lessons are completed
        if (totalLessons > 0 && lessonsCompleted === totalLessons) {
          setShowConfetti(true)
          setTimeout(() => setShowConfetti(false), 3000)
          // Ensure certificate exists
          const { data: existingCert } = await actions.getCertificateForCourse(user.id, courseId)
          if (!existingCert) {
            // Get default certificate template and generate certificate
            const { data: templates } = await actions.fetchCertificateTemplates();
            const defaultTemplate = templates?.find(t => t.is_default) || templates?.[0];

            if (defaultTemplate) {
              await actions.generateCertificateFromTemplate(user.id, courseId, defaultTemplate.id);
            } else {
              // Fallback to basic certificate creation if no template exists
              await actions.createCertificate(user.id, courseId);
            }
          }
        }
        // Compute recommended courses from actual data (prefer same category)
        try {
          let allCourses = courses
          if (!allCourses || allCourses.length === 0) {
            const { data: fetched } = await actions.fetchCourses()
            allCourses = fetched || []
          }
          const others = (allCourses || []).filter(c => c.id !== courseId)
          let rec = others
          const foundCategoryId = found?.category?.id
          if (foundCategoryId) {
            const sameCat = others.filter(c => c.category?.id === foundCategoryId)
            if (sameCat.length > 0) rec = sameCat
          }
          setRecommendedCourses(rec.slice(0, 3))
        } catch {}
      } catch {
        setLoading(false)
      }
    }
    loadData()
  }, [courseId, user?.id, courses, actions])

  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
  }

  const handleDownloadCertificate = async () => {
    try {
      // Get the user's certificate for this course
      const { data: userCertificate } = await actions.getCertificateForCourse(user.id, courseId);

      if (userCertificate) {
        // Generate and download the certificate with filled placeholders
        const generateCertificatePreview = actions.generateCertificatePreview;
        const { blob, filename } = await generateCertificatePreview(userCertificate.id);

        // Create download link
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } else {
        console.error('No certificate found for this course');
      }
    } catch (error) {
      console.error('Error downloading certificate:', error);
      // Fallback to mock download
      window.open(completionData.certificate.downloadUrl, '_blank');
    }
  }

  const handleShareCertificate = () => {
    if (navigator.share) {
      navigator.share({
        title: `I completed ${course.title}!`,
        text: `I just completed "${course.title}" on Kyzer LMS and earned my certificate!`,
        url: completionData.certificate.shareUrl
      })
    } else {
      // Fallback to copying link
      navigator.clipboard.writeText(completionData.certificate.shareUrl)
      // Show toast notification
    }
  }

  const submitReview = async () => {
    if (rating === 0) return
    
    // Submit review to backend
    setShowReviewForm(false)
    
    // Show success message
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="max-w-8xl mx-auto space-y-8">
      {/* Confetti Animation */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-transparent">
            {/* Simple confetti simulation */}
            {[...Array(50)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 bg-primary-default rounded-full animate-bounce"
                style={{
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${2 + Math.random() * 2}s`
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Certificate Section */}
      <Card className="p-8">
        <div className="text-center mb-6" >
          <Trophy className="w-16 h-16 text-warning-default mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-text-dark mb-2">Congratulations!</h2>
          <p className="text-text-light">
            Download your certificate and share your achievement with the world.
          </p>
          
        </div>

        <div 
          className="max-w-md mx-auto rounded-lg p-8 mb-6 certificate-container"
          style={{
            background: 'linear-gradient(135deg, rgba(var(--color-primary-rgb), 0.5) 27%, rgba(var(--color-primary-dark-rgb), 0.3) 50%)',
            color: 'var(--color-text-dark)'
          }}
        >
          <div className="text-center">
            <Award className="w-12 h-12 mx-auto mb-4 certificate-icon" />
            <h3 className="text-xl font-bold mb-2 certificate-title">Certificate of Completion</h3>
            <p className="certificate-subtitle mb-4">This certifies that</p>
            <p className="text-2xl font-bold mb-4 certificate-name">{user?.user_metadata?.first_name + ' ' + user?.user_metadata?.last_name || 'Student'}</p>
            <p className="certificate-subtitle mb-2">has successfully completed</p>
            <p className="font-semibold mb-4 certificate-course">{course.title}</p>
            {completionData.completedAt && (
              <p className="text-sm certificate-date">
                Completed on {new Date(completionData.completedAt).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button onClick={() => setShowCertificateModal(true)} size="lg">
            <Award className="w-5 h-5 mr-2" />
            View Certificate
          </Button>
          <Button variant="secondary" onClick={handleShareCertificate} size="lg">
            <Share2 className="w-5 h-5 mr-2" />
            Share Certificate
          </Button>
        </div>
      </Card>

      {/* Achievement Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Badges Earned */}
        <Card className="p-6">
          <h3 className="text-xl font-semibold text-text-dark mb-4">Badges Earned</h3>
          <div className="space-y-4">
            {Array.isArray(completionData.badges) && completionData.badges.map((badge) => (
              <div key={badge.id} className="flex items-center gap-4 p-3 bg-background-light rounded-lg">
                <div className="text-3xl">{badge.icon}</div>
                <div>
                  <h4 className="font-semibold text-text-dark">{badge.name}</h4>
                  <p className="text-sm text-text-light">{badge.description}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Skills Acquired */}
        <Card className="p-6">
          <h3 className="text-xl font-semibold text-text-dark mb-4">Skills Acquired</h3>
          <div className="space-y-3">
            {Array.isArray(completionData.skills) && completionData.skills.map((skill, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-text-dark">{skill.name}</span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  skill.level === 'Advanced' ? 'bg-success-light text-success-default' :
                  skill.level === 'Intermediate' ? 'bg-warning-light text-warning-default' :
                  'bg-primary-light text-primary-default'
                }`}>
                  {skill.level}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Course Statistics */}
      <Card className="p-6">
        <h3 className="text-xl font-semibold text-text-dark mb-6">Your Learning Journey</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-success-light rounded-full flex items-center justify-center mx-auto mb-3">
              <CheckCircle className="w-8 h-8 text-success-default" />
            </div>
            <div className="text-2xl font-bold text-text-dark">{completionData.lessonsCompleted}</div>
            <div className="text-sm text-text-light">Lessons Completed</div>
          </div>
          
          {completionData.totalQuizzes > 0 && (
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-light rounded-full flex items-center justify-center mx-auto mb-3">
                <Target className="w-8 h-8 text-primary-default" />
              </div>
              <div className="text-2xl font-bold text-text-dark">{completionData.quizzesPassed}/{completionData.totalQuizzes}</div>
              <div className="text-sm text-text-light">Quizzes Passed</div>
            </div>
          )}
          
          <div className="text-center">
            <div className="w-16 h-16 bg-warning-light rounded-full flex items-center justify-center mx-auto mb-3">
              <BookOpen className="w-8 h-8 text-warning-default" />
            </div>
            <div className="text-2xl font-bold text-text-dark">{completionData.projectsCompleted}</div>
            <div className="text-sm text-text-light">Projects Built</div>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-error-light rounded-full flex items-center justify-center mx-auto mb-3">
              <Clock className="w-8 h-8 text-error-default" />
            </div>
            <div className="text-2xl font-bold text-text-dark">{formatTime(completionData.totalTimeSpent)}</div>
            <div className="text-sm text-text-light">Time Invested</div>
          </div>
        </div>
      </Card>

      {/* Course Review */}
      <Card className="p-6">
        <h3 className="text-xl font-semibold text-text-dark mb-4">Rate This Course</h3>
        {!showReviewForm ? (
          <div className="text-center">
            <p className="text-text-light mb-4">
              Help other students by sharing your experience with this course.
            </p>
            <Button onClick={() => setShowReviewForm(true)}>
              <Star className="w-4 h-4 mr-2" />
              Leave a Review
            </Button>
          </div>
        ) : (
          <div className="max-w-md mx-auto">
            <div className="mb-4">
              <label className="block text-sm font-medium text-text-dark mb-2">
                Your Rating
              </label>
              <div className="flex justify-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className="transition-colors"
                  >
                    <Star 
                      className={`w-8 h-8 ${
                        star <= rating 
                          ? 'fill-warning-default text-warning-default' 
                          : 'text-background-dark hover:text-warning-default'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-text-dark mb-2">
                Your Review (Optional)
              </label>
              <textarea
                className="w-full p-3 border border-background-dark rounded-lg focus:ring-2 focus:ring-primary-default focus:border-primary-default"
                rows={4}
                placeholder="Share your thoughts about this course..."
                value={review}
                onChange={(e) => setReview(e.target.value)}
              />
            </div>
            
            <div className="flex gap-3">
              <Button onClick={submitReview} disabled={rating === 0}>
                Submit Review
              </Button>
              <Button variant="ghost" onClick={() => setShowReviewForm(false)}>
                Cancel
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Recommended Courses */}
      <Card className="p-6">
        <h3 className="text-xl font-semibold text-text-dark mb-6">Continue Your Learning Journey</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {recommendedCourses.map((c) => (
            <div key={c.id} className="border border-background-dark rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="w-full h-32 bg-background-medium rounded-lg flex items-center justify-center mb-4">
                <BookOpen className="w-8 h-8 text-text-muted" />
              </div>
              <h4 className="font-semibold text-text-dark mb-2">{c.title}</h4>
              <p className="text-sm text-text-light mb-3">{c.category?.name || 'Course'}</p>
              <div className="flex items-center gap-4 text-xs text-text-muted mb-4">
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{(c.duration_minutes || 0)} min</span>
                </div>
              </div>
              <Link to={`/app/courses/${c.id}`}>
                <Button variant="secondary" size="sm" className="w-full">
                  View Course
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </Card>

      {/* Navigation */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link to="/courses/my-courses">
          <Button variant="secondary" size="lg">
            View My Courses
          </Button>
        </Link>
        <Link to="/courses">
          <Button size="lg">
            Browse More Courses
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </Link>
      </div>

      {/* Certificate Preview Modal */}
      <CertificatePreviewModal
        courseId={courseId}
        courseName={course?.title || 'Course'}
        userId={user?.id}
        isOpen={showCertificateModal}
        onClose={() => setShowCertificateModal(false)}
      />
    </div>
  )
}