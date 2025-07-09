// src/pages/dashboard/Dashboard.jsx
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/hooks/auth/useAuth'
import { useCourses } from '@/hooks/courses/useCourses'
import { useEnrollment } from '@/hooks/courses/useEnrollment'
// import StatsCard from '@/components/dashboard/StatsCard'
// import RecentActivity from '@/components/dashboard/RecentActivity'
// import EnrolledCourses from '@/components/dashboard/EnrolledCourses'
// import Recommendations from '@/components/dashboard/Recommendations'
// import ProgressChart from '@/components/dashboard/ProgressChart'
import { 
  BookOpen, 
  Clock, 
  Trophy, 
  TrendingUp, 
  Users, 
  Calendar,
  ArrowRight,
  Target,
  Award,
  BarChart3,
  Play,
  Plus
} from 'lucide-react'

export default function Dashboard() {
  const { user, isCorporateUser } = useAuth()
  const { enrollments, loading: enrollmentsLoading, getStats } = useEnrollment()
  const { courses, loading: coursesLoading } = useCourses()
  const [stats, setStats] = useState(null)
  const [greeting, setGreeting] = useState('')

  useEffect(() => {
    // Set greeting based on time of day
    const hour = new Date().getHours()
    if (hour < 12) setGreeting('Good morning')
    else if (hour < 17) setGreeting('Good afternoon')
    else setGreeting('Good evening')

    // Load user stats
    if (user) {
      loadUserStats()
    }
  }, [user])

  const loadUserStats = async () => {
    try {
      const userStats = await getStats(user.id)
      setStats(userStats)
    } catch (error) {
      console.error('Error loading stats:', error)
    }
  }

  const userName = user?.profile?.first_name || user?.email?.split('@')[0] || 'there'

  const quickActions = [
    {
      title: 'Browse Courses',
      description: 'Explore our course catalog',
      icon: BookOpen,
      href: '/courses',
      color: 'bg-blue-500'
    },
    {
      title: 'Continue Learning',
      description: 'Pick up where you left off',
      icon: Play,
      href: '/my-courses',
      color: 'bg-green-500'
    },
    {
      title: 'View Certificates',
      description: 'See your achievements',
      icon: Award,
      href: '/certificates',
      color: 'bg-purple-500'
    }
  ]

  if (isCorporateUser) {
    quickActions.push({
      title: 'Team Analytics',
      description: 'View team progress',
      icon: BarChart3,
      href: '/corporate/analytics',
      color: 'bg-orange-500'
    })
  }

  return (
    <div className="min-h-screen bg-background-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-text-dark">
                {greeting}, {userName}! 👋
              </h1>
              <p className="text-text-light mt-1">
                {isCorporateUser 
                  ? "Here's your team's learning progress" 
                  : "Ready to continue your learning journey?"
                }
              </p>
            </div>
            <div className="hidden sm:flex items-center space-x-3">
              <Link
                to="/courses"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                Find Courses
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Enrolled Courses"
            value={stats?.enrolledCourses || 0}
            icon={BookOpen}
            color="blue"
            trend={stats?.courseTrend}
          />
          <StatsCard
            title="Completed Courses"
            value={stats?.completedCourses || 0}
            icon={Trophy}
            color="green"
            trend={stats?.completionTrend}
          />
          <StatsCard
            title="Learning Hours"
            value={`${stats?.learningHours || 0}h`}
            icon={Clock}
            color="purple"
            trend={stats?.hoursTrend}
          />
          <StatsCard
            title="Certificates Earned"
            value={stats?.certificates || 0}
            icon={Award}
            color="orange"
            trend={stats?.certificateTrend}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Quick Actions */}
            <div>
              <h2 className="text-lg font-semibold text-text-dark mb-4">Quick Actions</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {quickActions.map((action, index) => (
                  <Link
                    key={index}
                    to={action.href}
                    className="group relative bg-white rounded-xl border border-background-dark p-6 hover:shadow-md transition-all duration-200 hover:-translate-y-1"
                  >
                    <div className="flex items-start space-x-4">
                      <div className={`${action.color} rounded-lg p-3 text-white group-hover:scale-110 transition-transform`}>
                        <action.icon className="w-6 h-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-text-dark group-hover:text-primary transition-colors">
                          {action.title}
                        </h3>
                        <p className="text-xs text-text-light mt-1">
                          {action.description}
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-text-light group-hover:text-primary group-hover:translate-x-1 transition-all absolute top-6 right-6" />
                  </Link>
                ))}
              </div>
            </div>

            {/* Enrolled Courses */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-text-dark">Continue Learning</h2>
                <Link 
                  to="/my-courses"
                  className="text-sm text-primary hover:text-primary-dark font-medium transition-colors"
                >
                  View all courses
                </Link>
              </div>
              <EnrolledCourses 
                enrollments={enrollments} 
                loading={enrollmentsLoading}
                showAll={false}
                limit={3}
              />
            </div>

            {/* Progress Chart */}
            {stats && (
              <div>
                <h2 className="text-lg font-semibold text-text-dark mb-6">Learning Progress</h2>
                <div className="bg-white rounded-xl border border-background-dark p-6">
                  <ProgressChart data={stats.progressData} />
                </div>
              </div>
            )}

            {/* Corporate Team Overview */}
            {isCorporateUser && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-text-dark">Team Overview</h2>
                  <Link 
                    to="/corporate/team"
                    className="text-sm text-primary hover:text-primary-dark font-medium transition-colors"
                  >
                    Manage team
                  </Link>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-white rounded-xl border border-background-dark p-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Users className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-text-light">Total Employees</p>
                        <p className="text-xl font-bold text-text-dark">{stats?.totalEmployees || 0}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-xl border border-background-dark p-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <Target className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm text-text-light">Active Learners</p>
                        <p className="text-xl font-bold text-text-dark">{stats?.activeLearners || 0}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-xl border border-background-dark p-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <TrendingUp className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm text-text-light">Avg. Progress</p>
                        <p className="text-xl font-bold text-text-dark">{stats?.avgProgress || 0}%</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Sidebar Content */}
          <div className="space-y-8">
            {/* Recent Activity */}
            <div>
              <h2 className="text-lg font-semibold text-text-dark mb-6">Recent Activity</h2>
              <RecentActivity userId={user?.id} />
            </div>

            {/* Upcoming Deadlines */}
            <div>
              <h2 className="text-lg font-semibold text-text-dark mb-6">Upcoming Deadlines</h2>
              <div className="bg-white rounded-xl border border-background-dark p-6">
                <div className="space-y-4">
                  {stats?.upcomingDeadlines?.length > 0 ? (
                    stats.upcomingDeadlines.map((deadline, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-text-dark">{deadline.title}</p>
                          <p className="text-xs text-text-light">{deadline.dueDate}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4">
                      <Calendar className="w-8 h-8 text-text-light mx-auto mb-2" />
                      <p className="text-sm text-text-light">No upcoming deadlines</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Course Recommendations */}
            <div>
              <h2 className="text-lg font-semibold text-text-dark mb-6">Recommended for You</h2>
              <Recommendations 
                userId={user?.id}
                courses={courses}
                loading={coursesLoading}
              />
            </div>

            {/* Achievement Highlights */}
            <div>
              <h2 className="text-lg font-semibold text-text-dark mb-6">Recent Achievements</h2>
              <div className="bg-white rounded-xl border border-background-dark p-6">
                <div className="space-y-4">
                  {stats?.recentAchievements?.length > 0 ? (
                    stats.recentAchievements.map((achievement, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                          <Trophy className="w-4 h-4 text-yellow-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-text-dark">{achievement.title}</p>
                          <p className="text-xs text-text-light">{achievement.date}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4">
                      <Trophy className="w-8 h-8 text-text-light mx-auto mb-2" />
                      <p className="text-sm text-text-light">Complete your first course to earn achievements!</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Welcome Message for New Users */}
        {!stats?.hasCompletedCourse && (
          <div className="mt-12 bg-gradient-to-r from-primary to-primary-dark rounded-xl p-8 text-white">
            <div className="max-w-3xl">
              <h3 className="text-xl font-bold mb-2">Welcome to Kyzer LMS! 🎉</h3>
              <p className="text-blue-100 mb-6">
                You're all set to start your learning journey. Browse our courses, enroll in the ones that interest you, 
                and track your progress as you build new skills.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/courses"
                  className="inline-flex items-center px-6 py-3 bg-white text-primary rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  <BookOpen className="w-5 h-5 mr-2" />
                  Explore Courses
                </Link>
                <Link
                  to="/help"
                  className="inline-flex items-center px-6 py-3 border border-white/20 text-white rounded-lg font-medium hover:bg-white/10 transition-colors"
                >
                  Need help getting started?
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}