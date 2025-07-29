// src/pages/corporate/CompanyDashboard.jsx
import { useEffect, useState } from 'react'
import { 
  Users, 
  BookOpen, 
  Award, 
  TrendingUp, 
  Calendar,
  UserPlus,
  Building2,
  BarChart3,
  Settings,
  AlertCircle
} from 'lucide-react'
import { useCorporateStore, useCurrentCompany, useCompanyStats } from '@/store/corporateStore'
import { useAuthStore } from '@/store/authStore'
import StatsCard from '@/components/dashboard/StatsCard'
import RecentActivity from '@/components/dashboard/RecentActivity'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'

export default function CompanyDashboard() {
  const { user } = useAuthStore()
  const currentCompany = useCurrentCompany()
  const companyStats = useCompanyStats()
  console.log(currentCompany, 'Current Company in Dashboard')
  const [initialized, setInitialized] = useState(false);
  const [tabInitialized, setTabInitialized] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const initialize = async () => {
      try {
        await fetchCurrentCompany();
        await fetchCompanyStats();
        setInitialized(true);
        
        // Load tab-specific data only when tab changes
        if (activeTab === 'employees') await fetchEmployees();
        if (activeTab === 'courses') await fetchCourseAssignments();
        
        setTabInitialized(true);
      } catch (err) {
        console.error("Initialization failed:", err);
      }
    };

    initialize();
  }, [activeTab]); // Re-run when tab changes

  if (!initialized || !currentCompany) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <LoadingSpinner size="lg" />
        <p className="ml-3">Loading company data...</p>
      </div>
    );
  }

  if (!tabInitialized) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <LoadingSpinner size="lg" />
        <p className="ml-3">Loading {activeTab} data...</p>
      </div>
    );
  }


  const { 
    fetchCurrentCompany,
    fetchCompanyStats,
    fetchEmployees,
    fetchCourseAssignments,
    loading,
    error 
  } = useCorporateStore()


  // useEffect(() => {
  //   initializeDashboard()
  // }, [])
  // const initializeDashboard = async () => {
  //   await fetchCurrentCompany()
  //   await fetchCompanyStats()
  //   await fetchEmployees()
  //   await fetchCourseAssignments()
  // }

  if (loading && !currentCompany) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!currentCompany) {
    return <CompanySetup />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-dark">
            {currentCompany.name} Dashboard
          </h1>
          <p className="text-text-light mt-1">
            Manage your corporate learning platform
          </p>
        </div>
        
        <div className="flex gap-3">
          <Button 
            variant="secondary" 
            size="sm"
            onClick={() => setActiveTab('settings')}
          >
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
          <Button 
            size="sm"
            onClick={() => setActiveTab('employees')}
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Invite Employees
          </Button>
        </div>
      </div>

      {/* Subscription Status Alert */}
      {currentCompany.subscription_status === 'trial' && (
        <Card className="bg-warning-light border-warning-default">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-warning-default" />
            <div>
              <h3 className="font-medium text-warning-default">Trial Account</h3>
              <p className="text-sm text-text-medium">
                Your trial expires on {new Date(currentCompany.subscription_expires_at).toLocaleDateString()}. 
                <button className="ml-2 text-warning-default underline hover:no-underline">
                  Upgrade now
                </button>
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Error Display */}
      {error && (
        <Card className="bg-error-light border-error-default">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-error-default" />
            <p className="text-error-default">{error}</p>
          </div>
        </Card>
      )}

      {/* Key Metrics */}
      {companyStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Total Employees"
            value={`${companyStats.totalEmployees}/${companyStats.employeeLimit}`}
            icon={Users}
            trend={companyStats.totalEmployees > 0 ? '+' + companyStats.totalEmployees : undefined}
            color="primary"
          />
          
          <StatsCard
            title="Course Completions"
            value={companyStats.coursesCompleted}
            icon={Award}
            trend={companyStats.coursesCompleted > 0 ? '+' + companyStats.coursesCompleted : undefined}
            color="success"
          />
          
          <StatsCard
            title="In Progress"
            value={companyStats.coursesInProgress}
            icon={BookOpen}
            color="warning"
          />
          
          <StatsCard
            title="Utilization Rate"
            value={`${companyStats.utilizationRate}%`}
            icon={TrendingUp}
            color={companyStats.utilizationRate > 80 ? 'success' : 'primary'}
          />
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="border-b border-background-dark">
        <nav className="flex space-x-8">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'employees', label: 'Employees', icon: Users },
            { id: 'courses', label: 'Courses', icon: BookOpen },
            { id: 'reports', label: 'Reports', icon: TrendingUp },
            { id: 'settings', label: 'Settings', icon: Settings }
          ].map((tab) => {
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
      <div className="mt-6">
        {activeTab === 'overview' && <OverviewTab />}
        {activeTab === 'employees' && <EmployeesTab />}
        {activeTab === 'courses' && <CoursesTab />}
        {activeTab === 'reports' && <ReportsTab />}
        {activeTab === 'settings' && <SettingsTab />}
      </div>
    </div>
  )
}

// Overview Tab Component
function OverviewTab() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Recent Activity */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-text-dark">Recent Activity</h2>
          <Button variant="ghost" size="sm">View All</Button>
        </div>
        <RecentActivity />
      </Card>

      {/* Quick Actions */}
      <Card>
        <h2 className="text-lg font-semibold text-text-dark mb-4">Quick Actions</h2>
        <div className="space-y-3">
          <QuickActionButton
            icon={UserPlus}
            title="Invite Employees"
            description="Add new team members to your company"
            onClick={() => console.log('Invite employees')}
          />
          <QuickActionButton
            icon={BookOpen}
            title="Assign Courses"
            description="Assign mandatory courses to employees"
            onClick={() => console.log('Assign courses')}
          />
          <QuickActionButton
            icon={BarChart3}
            title="View Reports"
            description="Check learning progress and completion rates"
            onClick={() => console.log('View reports')}
          />
        </div>
      </Card>

      {/* Learning Progress Overview */}
      <Card className="lg:col-span-2">
        <h2 className="text-lg font-semibold text-text-dark mb-4">Learning Progress Overview</h2>
        <LearningProgressChart />
      </Card>
    </div>
  )
}

// Employees Tab Component  
function EmployeesTab() {
  return (
    <div>
      <EmployeeManagement />
    </div>
  )
}

// Courses Tab Component
function CoursesTab() {
  return (
    <div>
      <CourseAssignments />
    </div>
  )
}

// Reports Tab Component
function ReportsTab() {
  return (
    <div>
      <CompanyReports />
    </div>
  )
}

// Settings Tab Component
function SettingsTab() {
  return (
    <div>
      <CompanySettings />
    </div>
  )
}

// Helper Components
function QuickActionButton({ icon: Icon, title, description, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 p-3 rounded-lg border border-background-dark hover:bg-background-light transition-colors text-left"
    >
      <div className="p-2 rounded-lg bg-primary-light">
        <Icon className="w-5 h-5 text-primary-default" />
      </div>
      <div>
        <h3 className="font-medium text-text-dark">{title}</h3>
        <p className="text-sm text-text-light">{description}</p>
      </div>
    </button>
  )
}

function LearningProgressChart() {
  // Placeholder for learning progress visualization
  return (
    <div className="h-64 flex items-center justify-center bg-background-light rounded-lg">
      <div className="text-center">
        <BarChart3 className="w-12 h-12 text-text-muted mx-auto mb-3" />
        <p className="text-text-light">Learning progress chart will go here</p>
        <p className="text-sm text-text-muted">Charts integration coming soon</p>
      </div>
    </div>
  )
}

// Company Setup Component for first-time users
function CompanySetup() {
  const { createCompany, loading } = useCorporateStore()
  const [formData, setFormData] = useState({
    name: '',
    domain: '',
    industry: '',
    size_category: '',
    billing_email: ''
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await createCompany(formData)
    } catch (error) {
      console.error('Failed to create company:', error)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <div className="text-center mb-6">
          <Building2 className="w-16 h-16 text-primary-default mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-text-dark">Set Up Your Company</h1>
          <p className="text-text-light">
            Create your corporate account to start managing your team's learning
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-dark mb-2">
              Company Name *
            </label>
            <input
              type="text"
              required
              className="w-full p-3 border border-background-dark rounded-lg focus:ring-2 focus:ring-primary-default focus:border-primary-default"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter your company name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-dark mb-2">
              Company Domain
            </label>
            <input
              type="text"
              className="w-full p-3 border border-background-dark rounded-lg focus:ring-2 focus:ring-primary-default focus:border-primary-default"
              value={formData.domain}
              onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
              placeholder="example.com"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-dark mb-2">
                Industry
              </label>
              <select
                className="w-full p-3 border border-background-dark rounded-lg focus:ring-2 focus:ring-primary-default focus:border-primary-default"
                value={formData.industry}
                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
              >
                <option value="">Select industry</option>
                <option value="technology">Technology</option>
                <option value="healthcare">Healthcare</option>
                <option value="finance">Finance</option>
                <option value="education">Education</option>
                <option value="manufacturing">Manufacturing</option>
                <option value="retail">Retail</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-dark mb-2">
                Company Size
              </label>
              <select
                className="w-full p-3 border border-background-dark rounded-lg focus:ring-2 focus:ring-primary-default focus:border-primary-default"
                value={formData.size_category}
                onChange={(e) => setFormData({ ...formData, size_category: e.target.value })}
              >
                <option value="">Select size</option>
                <option value="1-10">1-10 employees</option>
                <option value="11-50">11-50 employees</option>
                <option value="51-200">51-200 employees</option>
                <option value="200+">200+ employees</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-dark mb-2">
              Billing Email *
            </label>
            <input
              type="email"
              required
              className="w-full p-3 border border-background-dark rounded-lg focus:ring-2 focus:ring-primary-default focus:border-primary-default"
              value={formData.billing_email}
              onChange={(e) => setFormData({ ...formData, billing_email: e.target.value })}
              placeholder="billing@company.com"
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={loading || !formData.name || !formData.billing_email}
          >
            {loading ? 'Creating Company...' : 'Create Company Account'}
          </Button>
        </form>

        <div className="mt-6 p-4 bg-background-light rounded-lg">
          <h3 className="font-medium text-text-dark mb-2">What's included:</h3>
          <ul className="text-sm text-text-light space-y-1">
            <li>• 30-day free trial</li>
            <li>• Up to 200 employees</li>
            <li>• Course assignment and tracking</li>
            <li>• Progress reporting</li>
            <li>• Certificate management</li>
          </ul>
        </div>
      </Card>
    </div>
  )
}

// Import these components (you'll need to create them separately)
import EmployeeManagement from '@/components/corporate/EmployeeManagement'
import CourseAssignments from '@/components/corporate/CourseAssignments'
import CompanyReports from '@/components/corporate/CompanyReports'
import CompanySettings from '@/components/corporate/CompanySettings'