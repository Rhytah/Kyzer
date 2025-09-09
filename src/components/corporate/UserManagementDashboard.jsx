// src/components/corporate/UserManagementDashboard.jsx
import { useState, useEffect } from 'react'
import { 
  Users, 
  UserPlus, 
  Building2, 
  Shield, 
  BarChart3,
  Settings,
  Activity,
  Download,
  Upload,
  RefreshCw,
  Filter,
  Search
} from 'lucide-react'
import { useCorporateStore, useCurrentCompany, useEmployees, useDepartments, useInvitations } from '@/store/corporateStore'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

// Import the management components
import EmployeeManagement from './EmployeeManagement'
import DepartmentManagement from './DepartmentManagement'
import UserInvitation from './UserInvitation'
import RoleManagement from './RoleManagement'

export default function UserManagementDashboard() {
  const currentCompany = useCurrentCompany()
  const employees = useEmployees()
  const departments = useDepartments()
  const invitations = useInvitations()
  const { 
    fetchEmployees,
    fetchDepartments,
    fetchInvitations,
    fetchCompanyStats,
    loading
  } = useCorporateStore()

  const [activeTab, setActiveTab] = useState('overview')
  const [searchTerm, setSearchTerm] = useState('')
  const [dateRange, setDateRange] = useState('30days')

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    await Promise.all([
      fetchEmployees(),
      fetchDepartments(),
      fetchInvitations(),
      fetchCompanyStats()
    ])
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'employees', label: 'Employees', icon: Users },
    { id: 'departments', label: 'Departments', icon: Building2 },
    { id: 'invitations', label: 'Invitations', icon: UserPlus },
    { id: 'roles', label: 'Roles & Permissions', icon: Shield }
  ]

  const getStats = () => {
    const totalEmployees = employees.length
    const activeEmployees = employees.filter(emp => emp.status === 'active').length
    const pendingInvitations = invitations.filter(inv => inv.status === 'pending' && new Date(inv.expires_at) > new Date()).length
    const totalDepartments = departments.length
    const departmentsWithManagers = departments.filter(dept => dept.manager_id).length

    return {
      totalEmployees,
      activeEmployees,
      pendingInvitations,
      totalDepartments,
      departmentsWithManagers,
      inactiveEmployees: totalEmployees - activeEmployees
    }
  }

  const stats = getStats()

  if (!currentCompany) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-dark">User Management</h1>
          <p className="text-text-light">
            Manage your organization's users, departments, and permissions
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={loadDashboardData}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button 
            variant="outline"
            onClick={() => {/* Export functionality */}}
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-background-dark">
        <nav className="flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm
                  ${activeTab === tab.id
                    ? 'border-primary-default text-primary-default'
                    : 'border-transparent text-text-light hover:text-text-medium hover:border-background-dark'
                  }
                `}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === 'overview' && <OverviewTab stats={stats} />}
        {activeTab === 'employees' && <EmployeeManagement />}
        {activeTab === 'departments' && <DepartmentManagement />}
        {activeTab === 'invitations' && <UserInvitation />}
        {activeTab === 'roles' && <RoleManagement />}
      </div>
    </div>
  )
}

// Overview Tab Component
function OverviewTab({ stats }) {
  const [recentActivity, setRecentActivity] = useState([])
  const [departmentStats, setDepartmentStats] = useState([])

  useEffect(() => {
    // Mock data - in a real app, this would come from your API
    setRecentActivity([
      { id: 1, type: 'user_joined', message: 'John Doe joined the Engineering department', time: '2 hours ago' },
      { id: 2, type: 'invitation_sent', message: 'Invitation sent to jane@company.com', time: '4 hours ago' },
      { id: 3, type: 'role_changed', message: 'Sarah Wilson promoted to Manager', time: '1 day ago' },
      { id: 4, type: 'department_created', message: 'New department "Marketing" created', time: '2 days ago' }
    ])

    setDepartmentStats([
      { name: 'Engineering', employees: 25, managers: 2, completion: 85 },
      { name: 'Marketing', employees: 12, managers: 1, completion: 92 },
      { name: 'Sales', employees: 18, managers: 2, completion: 78 },
      { name: 'HR', employees: 8, managers: 1, completion: 95 }
    ])
  }, [])

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-light">Total Employees</p>
              <p className="text-3xl font-bold text-text-dark">{stats.totalEmployees}</p>
              <p className="text-sm text-success-default">
                {stats.activeEmployees} active
              </p>
            </div>
            <div className="p-3 bg-primary-light rounded-lg">
              <Users className="w-6 h-6 text-primary-default" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-light">Departments</p>
              <p className="text-3xl font-bold text-text-dark">{stats.totalDepartments}</p>
              <p className="text-sm text-text-light">
                {stats.departmentsWithManagers} with managers
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Building2 className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-light">Pending Invitations</p>
              <p className="text-3xl font-bold text-text-dark">{stats.pendingInvitations}</p>
              <p className="text-sm text-warning-default">
                Awaiting response
              </p>
            </div>
            <div className="p-3 bg-warning-light rounded-lg">
              <UserPlus className="w-6 h-6 text-warning-default" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-light">Inactive Users</p>
              <p className="text-3xl font-bold text-text-dark">{stats.inactiveEmployees}</p>
              <p className="text-sm text-error-default">
                Need attention
              </p>
            </div>
            <div className="p-3 bg-error-light rounded-lg">
              <Activity className="w-6 h-6 text-error-default" />
            </div>
          </div>
        </Card>
      </div>

      {/* Department Performance */}
      <Card>
        <div className="p-6 border-b border-background-dark">
          <h3 className="text-lg font-semibold text-text-dark">Department Performance</h3>
          <p className="text-text-light">Course completion rates by department</p>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {departmentStats.map((dept, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-text-dark">{dept.name}</span>
                  <span className="text-sm text-text-light">{dept.completion}%</span>
                </div>
                <div className="w-full bg-background-light rounded-full h-2">
                  <div 
                    className="bg-primary-default h-2 rounded-full transition-all duration-300"
                    style={{ width: `${dept.completion}%` }}
                  />
                </div>
                <div className="flex justify-between text-sm text-text-light">
                  <span>{dept.employees} employees</span>
                  <span>{dept.managers} managers</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <div className="p-6 border-b border-background-dark">
            <h3 className="text-lg font-semibold text-text-dark">Recent Activity</h3>
            <p className="text-text-light">Latest user management activities</p>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary-default rounded-full mt-2 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm text-text-dark">{activity.message}</p>
                    <p className="text-xs text-text-light">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6 border-b border-background-dark">
            <h3 className="text-lg font-semibold text-text-dark">Quick Actions</h3>
            <p className="text-text-light">Common user management tasks</p>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              <Button className="w-full justify-start" variant="outline">
                <UserPlus className="w-4 h-4 mr-2" />
                Invite New User
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Building2 className="w-4 h-4 mr-2" />
                Create Department
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Shield className="w-4 h-4 mr-2" />
                Manage Roles
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export User Data
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
