import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { 
  Award, 
  Download, 
  Share2, 
  Star,
  BookOpen,
  TrendingUp,
  Target,
  Clock,
  Users,
  ArrowRight,
  CheckCircle,
  Trophy,
  Sparkles
} from 'lucide-react'
import Button from '../../components/ui/Button'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import { useAuthStore } from '../../store/authStore'
import toast from 'react-hot-toast'

const CourseCompletion = () => {
  const { courseId } = useParams()
  const { profile } = useAuthStore()
  const [course, setCourse] = useState(null)
  const [loading, setLoading] = useState(true)
  const [certificateLoading, setCertificateLoading] = useState(false)
  const [recommendations, setRecommendations] = useState([])
  const [stats, setStats] = useState(null)

  useEffect(() => {
    const loadCompletionData = async () => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setCourse({
        id: courseId,
        title: 'Complete React Developer Course',
        instructor: 'John Smith',
        thumbnail: '/course-placeholder.jpg',
        completedDate: new Date().toISOString(),
        totalDuration: 40,
        totalLessons: 120,
        certificate: {
          id: 'cert-001',
          url: '/certificates/react-completion.pdf',
          issued: new Date().toISOString()
        },
        skills: ['React', 'Redux', 'TypeScript', 'JavaScript', 'JSX', 'Hooks']
      })

      setStats({
        timeSpent: 38.5,
        quizzesPassed: 15,
        projectsCompleted: 5,
        averageScore: 87
      })

      setRecommendations([
        {
          id: 'next-1',
          title: 'Advanced React Patterns',
          instructor: 'John Smith',
          duration: 25,
          rating: 4.8,
          thumbnail: '/course-placeholder.jpg',
          price: 79.99
        },
        {
          id: 'next-2',
          title: 'Node.js Backend Development',
          instructor: 'Sarah Johnson',
          duration: 35,
          rating: 4.7,
          thumbnail: '/course-placeholder.jpg',
          price: 89.99
        },
        {
          id: 'next-3',
          title: 'Full Stack React & Node.js',
          instructor: 'Mike Chen',
          duration: 60,
          rating: 4.9,
          thumbnail: '/course-placeholder.jpg',
          price: 149.99
        }
      ])

      setLoading(false)
    }

    loadCompletionData()
  }, [courseId])

  const downloadCertificate = async () => {
    setCertificateLoading(true)
    try {
      // Simulate certificate generation/download
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // In real app, this would trigger a download
      const link = document.createElement('a')
      link.href = course.certificate.url
      link.download = `${course.title.replace(/\s+/g, '_')}_Certificate.pdf`
      link.click()
      
      toast.success('Certificate downloaded successfully!')
    } catch (error) {
      toast.error('Failed to download certificate')
    } finally {
      setCertificateLoading(false)
    }
  }

  const shareCertificate = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: `I just completed ${course.title}!`,
          text: `Check out my certificate for completing ${course.title} on Kyzer LMS`,
          url: window.location.href
        })
      } else {
        // Fallback - copy to clipboard
        await navigator.clipboard.writeText(window.location.href)
        toast.success('Certificate link copied to clipboard!')
      }
    } catch (error) {
      toast.error('Failed to share certificate')
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background-light flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-light via-background-light to-background-medium">
      <div className="container py-12">
        {/* Celebration Header */}
        <div className="text-center mb-12">
          <div className="relative inline-block mb-6">
            <Trophy className="h-20 w-20 text-yellow-500 mx-auto" />
            <Sparkles className="h-8 w-8 text-yellow-400 absolute -top-2 -right-2 animate-pulse" />
            <Sparkles className="h-6 w-6 text-yellow-400 absolute -bottom-1 -left-2 animate-pulse" />
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-text-dark mb-4">
            Congratulations! 🎉
          </h1>
          <p className="text-xl text-text-medium mb-2">
            You've successfully completed
          </p>
          <h2 className="text-2xl md:text-3xl font-bold text-primary mb-4">
            {course.title}
          </h2>
          <p className="text-text-medium">
            Completed on {formatDate(course.completedDate)}
          </p>
        </div>

        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Certificate Section */}
          <div className="lg:col-span-2">
            <div className="card mb-8">
              <div className="text-center">
                <Award className="h-16 w-16 text-primary mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-text-dark mb-2">
                  Your Certificate is Ready!
                </h3>
                <p className="text-text-medium mb-6">
                  Share your achievement with the world and add it to your LinkedIn profile.
                </p>

                {/* Certificate Preview */}
                <div className="bg-gradient-to-br from-primary to-primary-dark p-8 rounded-lg text-white mb-6 max-w-md mx-auto">
                  <div className="text-center">
                    <Award className="h-12 w-12 mx-auto mb-4" />
                    <h4 className="text-lg font-bold mb-2">Certificate of Completion</h4>
                    <p className="text-sm opacity-90 mb-4">This certifies that</p>
                    <p className="text-xl font-bold mb-2">
                      {profile?.first_name} {profile?.last_name}
                    </p>
                    <p className="text-sm opacity-90 mb-4">has successfully completed</p>
                    <p className="font-semibold mb-4">{course.title}</p>
                    <div className="flex justify-between text-xs opacity-75">
                      <span>{formatDate(course.certificate.issued)}</span>
                      <span>Kyzer LMS</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button 
                    onClick={downloadCertificate}
                    loading={certificateLoading}
                    size="lg"
                  >
                    <Download className="h-5 w-5 mr-2" />
                    Download Certificate
                  </Button>
                  <Button 
                    variant="secondary" 
                    onClick={shareCertificate}
                    size="lg"
                  >
                    <Share2 className="h-5 w-5 mr-2" />
                    Share Achievement
                  </Button>
                </div>
              </div>
            </div>

            {/* Course Stats */}
            <div className="card">
              <h3 className="text-xl font-bold text-text-dark mb-6">Your Learning Journey</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Clock className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="text-2xl font-bold text-text-dark">{stats.timeSpent}h</div>
                  <div className="text-sm text-text-medium">Time Spent</div>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                  <div className="text-2xl font-bold text-text-dark">{course.totalLessons}</div>
                  <div className="text-sm text-text-medium">Lessons Completed</div>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Target className="h-8 w-8 text-purple-600" />
                  </div>
                  <div className="text-2xl font-bold text-text-dark">{stats.quizzesPassed}</div>
                  <div className="text-sm text-text-medium">Quizzes Passed</div>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Star className="h-8 w-8 text-yellow-600" />
                  </div>
                  <div className="text-2xl font-bold text-text-dark">{stats.averageScore}%</div>
                  <div className="text-sm text-text-medium">Average Score</div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Skills Earned */}
            <div className="card">
              <h3 className="text-lg font-semibold text-text-dark mb-4">
                Skills You've Mastered
              </h3>
              <div className="flex flex-wrap gap-2">
                {course.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-primary-light text-primary rounded-full text-sm font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Course Rating */}
            <div className="card">
              <h3 className="text-lg font-semibold text-text-dark mb-4">
                Rate This Course
              </h3>
              <p className="text-text-medium text-sm mb-4">
                Help other learners by sharing your experience
              </p>
              <div className="flex justify-center space-x-2 mb-4">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button key={rating} className="p-1">
                    <Star className="h-6 w-6 text-gray-300 hover:text-yellow-400 transition-colors" />
                  </button>
                ))}
              </div>
              <Button variant="secondary" size="sm" className="w-full">
                Write a Review
              </Button>
            </div>

            {/* Continue Learning */}
            <div className="card">
              <h3 className="text-lg font-semibold text-text-dark mb-4">
                Continue Learning
              </h3>
              <div className="space-y-4">
                <Link to="/my-courses" className="block">
                  <Button variant="secondary" className="w-full justify-start">
                    <BookOpen className="h-4 w-4 mr-2" />
                    View All My Courses
                  </Button>
                </Link>
                <Link to="/courses" className="block">
                  <Button variant="ghost" className="w-full justify-start">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Explore More Courses
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Recommended Courses */}
        <div className="mt-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-text-dark mb-4">
              Continue Your Learning Journey
            </h2>
            <p className="text-xl text-text-medium">
              Build on your React skills with these recommended courses
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {recommendations.map((recommendation) => (
              <div key={recommendation.id} className="card course-card">
                <img
                  src={recommendation.thumbnail}
                  alt={recommendation.title}
                  className="w-full h-40 object-cover rounded-lg mb-4"
                />
                
                <h3 className="text-lg font-semibold text-text-dark mb-2">
                  {recommendation.title}
                </h3>
                
                <p className="text-text-medium text-sm mb-3">
                  by {recommendation.instructor}
                </p>
                
                <div className="flex items-center justify-between text-xs text-text-light mb-4">
                  <div className="flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    {recommendation.duration}h
                  </div>
                  <div className="flex items-center">
                    <Star className="h-3 w-3 mr-1 fill-yellow-400 text-yellow-400" />
                    {recommendation.rating}
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="text-xl font-bold text-text-dark">
                    ${recommendation.price}
                  </div>
                  <Button size="sm">
                    Enroll Now
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-16 text-center">
          <div className="card max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-text-dark mb-4">
              Ready for Your Next Challenge?
            </h3>
            <p className="text-text-medium mb-6">
              Keep the momentum going! Explore our full catalog of courses and continue building your skills.
            </p>
            <Link to="/courses">
              <Button size="lg">
                <BookOpen className="h-5 w-5 mr-2" />
                Browse All Courses
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CourseCompletion