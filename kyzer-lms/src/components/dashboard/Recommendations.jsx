// src/components/dashboard/Recommendations.jsx
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Star, Clock, Users, ArrowRight, Sparkles } from 'lucide-react'

export default function Recommendations({ 
  userId, 
  courses = [], 
  loading = false, 
  limit = 3 
}) {
  const [recommendations, setRecommendations] = useState([])
  const [recommendationsLoading, setRecommendationsLoading] = useState(true)

  useEffect(() => {
    if (userId && courses.length > 0) {
      generateRecommendations()
    }
  }, [userId, courses])

  const generateRecommendations = async () => {
    try {
      setRecommendationsLoading(true)
      
      // Mock recommendation logic - replace with actual algorithm
      const mockRecommendations = [
        {
          id: 'react-advanced',
          title: 'Advanced React Patterns',
          description: 'Master advanced React concepts including hooks, context, and performance optimization.',
          thumbnail_url: '/course-placeholder.jpg',
          rating: 4.8,
          students: 1240,
          duration: '8 hours',
          difficulty: 'intermediate',
          category: 'Frontend Development',
          reason: 'Based on your React course progress'
        },
        {
          id: 'node-backend',
          title: 'Node.js Backend Development',
          description: 'Build robust backend applications with Node.js, Express, and MongoDB.',
          thumbnail_url: '/course-placeholder.jpg',
          rating: 4.6,
          students: 980,
          duration: '12 hours',
          difficulty: 'intermediate',
          category: 'Backend Development',
          reason: 'Popular among JavaScript learners'
        },
        {
          id: 'typescript-essentials',
          title: 'TypeScript Essentials',
          description: 'Add type safety to your JavaScript projects with TypeScript.',
          thumbnail_url: '/course-placeholder.jpg',
          rating: 4.7,
          students: 756,
          duration: '6 hours',
          difficulty: 'beginner',
          category: 'Programming Languages',
          reason: 'Recommended for React developers'
        }
      ]

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300))
      
      setRecommendations(mockRecommendations.slice(0, limit))
    } catch (error) {
      console.error('Error generating recommendations:', error)
    } finally {
      setRecommendationsLoading(false)
    }
  }

  if (loading || recommendationsLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, index) => (
          <div key={index} className="bg-white rounded-xl border border-background-dark p-4">
            <div className="animate-pulse">
              <div className="flex space-x-3">
                <div className="w-16 h-12 bg-background-medium rounded-lg"></div>
                <div className="flex-1 space-y-2">
                  <div className="w-3/4 h-3 bg-background-medium rounded"></div>
                  <div className="w-1/2 h-2 bg-background-medium rounded"></div>
                  <div className="w-1/4 h-2 bg-background-medium rounded"></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (!recommendations || recommendations.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-background-dark p-6">
        <div className="text-center py-4">
          <Sparkles className="w-8 h-8 text-text-light mx-auto mb-2" />
          <p className="text-sm text-text-light">No recommendations yet</p>
          <p className="text-xs text-text-muted mt-1">
            Complete a course to get personalized recommendations
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {recommendations.map((course) => (
        <div 
          key={course.id}
          className="bg-white rounded-xl border border-background-dark p-4 hover:shadow-md transition-shadow duration-200"
        >
          <div className="flex space-x-3">
            {/* Course Thumbnail */}
            <div className="flex-shrink-0">
              <img
                src={course.thumbnail_url || '/course-placeholder.jpg'}
                alt={course.title}
                className="w-16 h-12 object-cover rounded-lg bg-background-medium"
              />
            </div>

            {/* Course Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-sm font-semibold text-text-dark line-clamp-1">
                  {course.title}
                </h3>
                <Link
                  to={`/courses/${course.id}`}
                  className="flex-shrink-0 p-1 text-text-light hover:text-primary transition-colors"
                >
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              <p className="text-xs text-text-light line-clamp-2 mb-2">
                {course.description}
              </p>

              {/* Course Meta */}
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-3 text-text-muted">
                  {course.rating && (
                    <div className="flex items-center space-x-1">
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      <span>{course.rating}</span>
                    </div>
                  )}
                  {course.students && (
                    <div className="flex items-center space-x-1">
                      <Users className="w-3 h-3" />
                      <span>{course.students.toLocaleString()}</span>
                    </div>
                  )}
                  {course.duration && (
                    <div className="flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>{course.duration}</span>
                    </div>
                  )}
                </div>

                {course.difficulty && (
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    course.difficulty === 'beginner' 
                      ? 'bg-green-100 text-green-700'
                      : course.difficulty === 'intermediate'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-red-100 text-red-700'
                  }`}>
                    {course.difficulty}
                  </span>
                )}
              </div>

              {/* Recommendation Reason */}
              {course.reason && (
                <div className="mt-2 flex items-center space-x-1">
                  <Sparkles className="w-3 h-3 text-purple-500" />
                  <span className="text-xs text-purple-600 font-medium">
                    {course.reason}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Quick Action */}
          <div className="mt-3 pt-3 border-t border-background-medium">
            <Link
              to={`/courses/${course.id}`}
              className="inline-flex items-center text-xs font-medium text-primary hover:text-primary-dark transition-colors"
            >
              View Course
              <ArrowRight className="w-3 h-3 ml-1" />
            </Link>
          </div>
        </div>
      ))}

      {/* View More */}
      <div className="text-center pt-2">
        <Link
          to="/courses?recommended=true"
          className="text-xs text-text-light hover:text-primary transition-colors"
        >
          View all recommendations
        </Link>
      </div>
    </div>
  )
}