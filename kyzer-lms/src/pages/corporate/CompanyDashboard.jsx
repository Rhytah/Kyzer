import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  Users, 
  BookOpen, 
  Award, 
  TrendingUp,
  Clock,
  Target,
  AlertCircle,
  Plus,
  BarChart3,
  UserPlus,
  Settings,
  Download,
  Calendar,
  CheckCircle,
  XCircle
} from 'lucide-react'
import Button from '../../components/ui/Button'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import { useAuthStore } from '../../store/authStore'

const CompanyDashboard = () => {
  const { profile } = useAuthStore()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState(null)
  const [recentActivity, setRecentActivity] = useState([])
  const [topPerformers, setTopPerformers] = useState([])
  const [departmentStats, setDepartmentStats] = useState([])
  const [upcomingDeadlines, setUpcomingDeadlines] = useState([])

  useEffect(() => {
    const loadDashboardData = async () => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setStats({
        totalEmployees: 156,
        activeEmployees: 142,
        totalCourses: 24,
        averageCompletion: 78,
        hoursLearned: 2847,
        certificatesEarned: 89,
        departmentCount: 8,
        complianceRate: 94
      })

      setRecentActivity([
        {
          id: 1,
          type: 'completion',
          user: 'Sarah Johnson',
          action: 'completed',
          course: 'Data Security Fundamentals',
          timestamp: '2 hours ago',
          department: 'IT'
        },
        {
          id: 2,
          type: 'enrollment',
          user: 'Mike Chen',
          action: 'enrolled in',
          course: 'Leadership Skills',
          timestamp: '4 hours ago',
          department: 'Marketing'
        },
        {
          id: 3,
          type: 'certificate',
          user: 'Emily Rodriguez',
          action: 'earned certificate for',
          course: 'Project Management',
          timestamp: '1 day ago',
          department: 'Operations'
        },
        {
          id: 4,
          type: 'completion',
          user: 'David Kim',
          action: 'completed',
          course: 'React Development',
          timestamp: '1 day ago',
          department: 'Engineering'
        },
        {
          id: 5,
          type: 'enrollment',
          user: 'Lisa Park',
          action: 'enrolled in',
          course: 'UI/UX Design',
          timestamp: '2 days ago',
          department: 'Design'
        }
      ])

      setTopPerformers([
        {
          id: 1,
          name: 'Sarah Johnson',
          department: 'IT',
          completedCourses: 8,
          hoursLearned: 45,
          certificates: 6,
          avatar: '/avatar-placeholder.jpg'
        },
        {
          id: 2,
          name: 'Mike Chen',
          department: 'Marketing',
          completedCourses: 6,
          hoursLearned: 38,
          certificates: 4,
          avatar: '/avatar-placeholder.jpg'
        },
        {
          id: 3,
          name: 'Emily Rodriguez',
          department: 'Operations',
          completedCourses: 7,
          hoursLearned: 42,
          certificates: 5,
          avatar: '/avatar-placeholder.jpg'
        }
      ])

      setDepartmentStats([
        { name: 'Engineering', employees: 45, completion: 85, color: 'bg-blue-500' },
        { name: 'Marketing', employees: 28, completion: 72, color: 'bg-green-500' },
        { name: 'Sales', employees: 32, completion: 68, color: 'bg-purple-500' },
        { name: 'Operations', employees: 25, completion: 90, color: 'bg-yellow-500' },
        { name: 'HR', employees: 12, completion: 95, color: 'bg-pink-500' },
        { name: 'Finance', employees: 14, completion: 82, color: 'bg-indigo-500' }
      ])

      setUpcomingDeadlines([
        {
          id: 1,
          course: 'Data Security Training',
          deadline: '2024-02-15',
          assignedCount: 45,
          completedCount: 38,
          priority: 'high'
        },
        {
          id: 2,
          course: 'Compliance & Ethics',
          deadline: '2024-02-20',
          assignedCount: 156,
          completedCount: 124,
          priority: 'medium'
        },
        {
          id: 3,
          course: 'Safety Protocols',
          deadline: '2024-02-28',
          assignedCount: 89,
          completedCount: 67,
          priority: 'medium'
        }
      ])

      setLoading(false)
    }

    loadDashboardData()
  }, [])

  const getActivityIcon = (type) => {
    switch (type) {
      case 'completion':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'enrollment':
        return <BookOpen className="h-4 w-4 text-blue-600" />
      case 'certificate':
        return <Award className="h-4 w-4 text-yellow-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-400" />
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'text-red-600 bg-red-100'
      case 'medium':
        return 'text-yellow-600 bg-yellow-100'
      case 'low':
        return 'text-green-600 bg-green-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-center min-h-96">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-text-dark">
            {profile?.organization?.name} Dashboard
          </h1>
          <p className="text-text-medium mt-2">
            Track your team's learning progress and performance
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Link to="/corporate/employees">
            <Button variant="secondary">
              <UserPlus className="h-4 w-4 mr-2" />
              Manage Employees
            </Button>
          </Link>
          <Link to="/corporate/reports">
            <Button>
              <BarChart3 className="h-4 w-4 mr-2" />
              View Reports
            </Button>
          </Link>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-text-medium">Active Employees</p>
              <p className="text-2xl font-semibold text-text-dark">
                {stats.activeEmployees}/{stats.totalEmployees}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <Target className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-text-medium">Avg. Completion</p>
              <p className="text-2xl font-semibold text-text-dark">
                {stats.averageCompletion}%
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Clock className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-text-medium">Hours Learned</p>
              <p className="text-2xl font-semibold text-text-dark">
                {stats.hoursLearned.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Award className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-text-medium">Certificates</p>
              <p className="text-2xl font-semibold text-text-dark">
                {stats.certificatesEarned}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Department Performance */}
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-text-dark">
                Department Performance
              </h2>
              <Link to="/corporate/reports" className="text-primary hover:text-primary-dark text-sm font-medium">
                View detailed report
              </Link>
            </div>
            
            <div className="space-y-4">
              {departmentStats.map((dept, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center flex-1">
                    <div className={`w-3 h-3 rounded-full ${dept.color} mr-3`} />
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-medium text-text-dark">{dept.name}</span>
                        <span className="text-sm text-text-medium">
                          {dept.completion}% • {dept.employees} employees
                        </span>
                      </div>
                      <div className="progress-bar">
                        <div 
                          className="progress-fill" 
                          style={{ width: `${dept.completion}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-text-dark">
                Recent Activity
              </h2>
              <Link to="/corporate/reports" className="text-primary hover:text-primary-dark text-sm font-medium">
                View all activity
              </Link>
            </div>
            
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3 p-3 hover:bg-background-light rounded-lg transition-colors">
                  <div className="mt-1">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-text-dark">
                      <span className="font-medium">{activity.user}</span>
                      {' '}{activity.action}{' '}
                      <span className="font-medium">{activity.course}</span>
                    </p>
                    <div className="flex items-center mt-1 text-xs text-text-light">
                      <span>{activity.department}</span>
                      <span className="mx-2">•</span>
                      <span>{activity.timestamp}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="card">
            <h3 className="text-lg font-semibold text-text-dark mb-4">
              Quick Actions
            </h3>
            <div className="space-y-3">
              <Link to="/corporate/employees">
                <Button variant="secondary" size="sm" className="w-full justify-start">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Invite Employees
                </Button>
              </Link>
              <Link to="/courses">
                <Button variant="ghost" size="sm" className="w-full justify-start">
                  <Plus className="h-4 w-4 mr-2" />
                  Assign Courses
                </Button>
              </Link>
              <Link to="/corporate/reports">
                <Button variant="ghost" size="sm" className="w-full justify-start">
                  <Download className="h-4 w-4 mr-2" />
                  Export Report
                </Button>
              </Link>
              <Link to="/corporate/settings">
                <Button variant="ghost" size="sm" className="w-full justify-start">
                  <Settings className="h-4 w-4 mr-2" />
                  Company Settings
                </Button>
              </Link>
            </div>
          </div>

          {/* Upcoming Deadlines */}
          <div className="card">
            <h3 className="text-lg font-semibold text-text-dark mb-4">
              Upcoming Deadlines
            </h3>
            <div className="space-y-3">
              {upcomingDeadlines.map((deadline) => (
                <div key={deadline.id} className="border border-background-dark rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-text-dark text-sm">
                      {deadline.course}
                    </h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(deadline.priority)}`}>
                      {deadline.priority}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-text-medium mb-2">
                    <span className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      Due {formatDate(deadline.deadline)}
                    </span>
                    <span>
                      {deadline.completedCount}/{deadline.assignedCount} completed
                    </span>
                  </div>
                  <div className="progress-bar h-1">
                    <div 
                      className="progress-fill" 
                      style={{ width: `${(deadline.completedCount / deadline.assignedCount) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Performers */}
          <div className="card">
            <h3 className="text-lg font-semibold text-text-dark mb-4">
              Top Performers
            </h3>
            <div className="space-y-3">
              {topPerformers.map((performer, index) => (
                <div key={performer.id} className="flex items-center space-x-3">
                  <div className="relative">
                    <img
                      src={performer.avatar}
                      alt={performer.name}
                      className="w-10 h-10 rounded-full"
                    />
                    <div className={`absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                      index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : 'bg-yellow-600'
                    }`}>
                      {index + 1}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-text-dark text-sm">
                      {performer.name}
                    </p>
                    <p className="text-xs text-text-medium">
                      {performer.department}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-text-dark">
                      {performer.certificates} certs
                    </p>
                    <p className="text-xs text-text-medium">
                      {performer.hoursLearned}h
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Compliance Alert */}
          <div className="card border-l-4 border-l-yellow-500">
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-text-dark text-sm mb-1">
                  Compliance Alert
                </h4>
                <p className="text-xs text-text-medium mb-3">
                  7 employees haven't completed mandatory security training
                </p>
                <Button size="sm" variant="secondary">
                  View Details
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CompanyDashboard