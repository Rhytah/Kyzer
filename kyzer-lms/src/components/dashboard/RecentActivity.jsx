// src/components/dashboard/RecentActivity.jsx
import { useState, useEffect } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { 
  BookOpen, 
  CheckCircle, 
  Award, 
  Play, 
  MessageSquare,
  UserPlus,
  Activity
} from 'lucide-react'

const activityIcons = {
  course_started: Play,
  course_completed: CheckCircle,
  lesson_completed: BookOpen,
  certificate_earned: Award,
  comment_added: MessageSquare,
  user_invited: UserPlus,
  quiz_completed: CheckCircle
}

const activityColors = {
  course_started: 'bg-blue-100 text-blue-600',
  course_completed: 'bg-green-100 text-green-600',
  lesson_completed: 'bg-purple-100 text-purple-600',
  certificate_earned: 'bg-yellow-100 text-yellow-600',
  comment_added: 'bg-gray-100 text-gray-600',
  user_invited: 'bg-indigo-100 text-indigo-600',
  quiz_completed: 'bg-emerald-100 text-emerald-600'
}

export default function RecentActivity({ userId, limit = 5 }) {
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (userId) {
      loadRecentActivity()
    }
  }, [userId])

  const loadRecentActivity = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Mock data for now - replace with actual API call
      const mockActivities = [
        {
          id: 1,
          type: 'course_started',
          title: 'Started "Introduction to React"',
          description: 'Began learning React fundamentals',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
          metadata: {
            courseId: 'react-intro',
            courseName: 'Introduction to React'
          }
        },
        {
          id: 2,
          type: 'lesson_completed',
          title: 'Completed "Components and Props"',
          description: 'Lesson 3 of Introduction to React',
          timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
          metadata: {
            courseId: 'react-intro',
            lessonName: 'Components and Props'
          }
        },
        {
          id: 3,
          type: 'quiz_completed',
          title: 'Passed JavaScript Basics Quiz',
          description: 'Scored 85% on the final assessment',
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
          metadata: {
            score: 85,
            courseId: 'js-basics'
          }
        },
        {
          id: 4,
          type: 'course_completed',
          title: 'Completed "HTML & CSS Fundamentals"',
          description: 'Earned certificate for completing all modules',
          timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
          metadata: {
            courseId: 'html-css-fundamentals',
            certificateId: 'cert-123'
          }
        },
        {
          id: 5,
          type: 'certificate_earned',
          title: 'Certificate Earned',
          description: 'HTML & CSS Fundamentals completion certificate',
          timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
          metadata: {
            certificateId: 'cert-123',
            courseName: 'HTML & CSS Fundamentals'
          }
        }
      ]

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500))
      
      setActivities(mockActivities.slice(0, limit))
    } catch (err) {
      console.error('Error loading recent activity:', err)
      setError('Failed to load recent activity')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-background-dark p-6">
        <div className="space-y-4">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="flex space-x-3">
                <div className="w-8 h-8 bg-background-medium rounded-lg"></div>
                <div className="flex-1 space-y-2">
                  <div className="w-3/4 h-4 bg-background-medium rounded"></div>
                  <div className="w-1/2 h-3 bg-background-medium rounded"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl border border-background-dark p-6">
        <div className="text-center py-4">
          <Activity className="w-8 h-8 text-red-400 mx-auto mb-2" />
          <p className="text-sm text-red-600">{error}</p>
          <button
            onClick={loadRecentActivity}
            className="text-xs text-primary hover:text-primary-dark mt-2 transition-colors"
          >
            Try again
          </button>
        </div>
      </div>
    )
  }

  if (!activities || activities.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-background-dark p-6">
        <div className="text-center py-4">
          <Activity className="w-8 h-8 text-text-light mx-auto mb-2" />
          <p className="text-sm text-text-light">No recent activity</p>
          <p className="text-xs text-text-muted mt-1">
            Start learning to see your activity here
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-background-dark p-6">
      <div className="space-y-4">
        {activities.map((activity) => {
          const IconComponent = activityIcons[activity.type] || Activity
          const colorClass = activityColors[activity.type] || 'bg-gray-100 text-gray-600'
          
          return (
            <div key={activity.id} className="flex space-x-3">
              <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${colorClass}`}>
                <IconComponent className="w-4 h-4" />
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text-dark line-clamp-1">
                  {activity.title}
                </p>
                <p className="text-xs text-text-light line-clamp-2 mt-1">
                  {activity.description}
                </p>
                <p className="text-xs text-text-muted mt-1">
                  {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                </p>
              </div>
            </div>
          )
        })}
      </div>
      
      {activities.length >= limit && (
        <div className="mt-4 pt-4 border-t border-background-medium">
          <button className="text-xs text-primary hover:text-primary-dark font-medium transition-colors">
            View all activity
          </button>
        </div>
      )}
    </div>
  )
}