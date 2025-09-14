// src/components/corporate/CompanySettings.jsx
import { useState, useEffect } from 'react'
import { 
  Building2, 
  Users, 
  CreditCard, 
  Shield, 
  Bell,
  Mail,
  Globe,
  Upload,
  Save,
  AlertCircle,
  CheckCircle,
  Settings,
  Trash2
} from 'lucide-react'
import { useCorporateStore, useCurrentCompany } from '@/store/corporateStore'
import { useAuthStore } from '@/store/authStore'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Modal from '@/components/ui/Modal'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

export default function CompanySettings() {
  const currentCompany = useCurrentCompany()
  const { user } = useAuthStore()
  const { updateCompany, loading, error } = useCorporateStore()
  
  const [activeTab, setActiveTab] = useState('general')
  const [hasChanges, setHasChanges] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const isAdmin = currentCompany?.admin_user_id === user?.id

  const tabs = [
    { id: 'general', label: 'General', icon: Building2 },
    { id: 'billing', label: 'Billing & Plans', icon: CreditCard },
    { id: 'permissions', label: 'Permissions', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'integrations', label: 'Integrations', icon: Globe },
    { id: 'advanced', label: 'Advanced', icon: Settings }
  ]

  // Filter tabs based on user permissions
  const availableTabs = tabs.filter(tab => {
    if (!isAdmin && ['billing', 'permissions', 'advanced'].includes(tab.id)) {
      return false
    }
    return true
  })

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
          <h2 className="text-xl font-semibold text-text-dark">Company Settings</h2>
          <p className="text-text-light">
            Manage your company profile and preferences
          </p>
        </div>
        
        {hasChanges && (
          <div className="flex items-center gap-3">
            <span className="text-sm text-warning-default">You have unsaved changes</span>
            <Button size="sm">
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </div>
        )}
      </div>

      {/* Permission Notice */}
      {!isAdmin && (
        <Card className="p-4 bg-warning-light border-warning-default">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-warning-default" />
            <div>
              <h3 className="font-medium text-warning-default">Limited Access</h3>
              <p className="text-sm text-text-medium">
                You can only view and edit general settings. Contact your company admin for full access.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Error Display */}
      {error && (
        <Card className="p-4 bg-error-light border-error-default">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-error-default" />
            <p className="text-error-default">{error}</p>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Settings Navigation */}
        <div className="lg:col-span-1">
          <Card className="p-4">
            <nav className="space-y-1">
              {availableTabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors
                      ${activeTab === tab.id
                        ? 'bg-primary-light text-primary-default'
                        : 'text-text-medium hover:bg-background-light hover:text-text-dark'
                      }
                    `}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                )
              })}
            </nav>
          </Card>
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-3">
          {activeTab === 'general' && <GeneralSettings company={currentCompany} onUpdate={updateCompany} isAdmin={isAdmin} onChanges={setHasChanges} />}
          {activeTab === 'billing' && <BillingSettings company={currentCompany} />}
          {activeTab === 'permissions' && <PermissionsSettings company={currentCompany} />}
          {activeTab === 'notifications' && <NotificationSettings company={currentCompany} />}
          {activeTab === 'integrations' && <IntegrationsSettings company={currentCompany} />}
          {activeTab === 'advanced' && <AdvancedSettings company={currentCompany} onDelete={() => setShowDeleteModal(true)} />}
        </div>
      </div>

      {/* Delete Company Modal */}
      <DeleteCompanyModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        company={currentCompany}
      />
    </div>
  )
}

// General Settings Component
function GeneralSettings({ company, onUpdate, isAdmin, onChanges }) {
  const [formData, setFormData] = useState({
    name: company.name || '',
    domain: company.domain || '',
    industry: company.industry || '',
    size_category: company.size_category || '',
    billing_email: company.billing_email || '',
    logo_url: company.logo_url || ''
  })
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    const hasChanges = Object.keys(formData).some(key => formData[key] !== (company[key] || ''))
    onChanges(hasChanges)
  }, [formData, company, onChanges])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await onUpdate(formData)
      onChanges(false)
    } catch (error) {
      console.error('Failed to update company:', error)
    }
  }

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setUploading(true)
    try {
      // Here you would upload to Supabase Storage or another service
      // For now, just simulate the upload
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const logoUrl = URL.createObjectURL(file) // Temporary for demo
      setFormData({ ...formData, logo_url: logoUrl })
    } catch (error) {
      console.error('Logo upload failed:', error)
    } finally {
      setUploading(false)
    }
  }

  return (
    <Card>
      <div className="p-6 border-b border-background-dark">
        <h3 className="text-lg font-semibold text-text-dark">General Information</h3>
        <p className="text-text-light mt-1">Basic company information and branding</p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Company Logo */}
        <div>
          <label className="block text-sm font-medium text-text-dark mb-3">Company Logo</label>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-background-medium rounded-lg flex items-center justify-center overflow-hidden">
              {formData.logo_url ? (
                <img 
                  src={formData.logo_url} 
                  alt="Company logo" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <Building2 className="w-8 h-8 text-text-muted" />
              )}
            </div>
            
            <div>
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="hidden"
                id="logo-upload"
                disabled={!isAdmin}
              />
              <label
                htmlFor="logo-upload"
                className={`inline-flex items-center px-4 py-2 border border-background-dark rounded-lg cursor-pointer hover:bg-background-light ${
                  !isAdmin ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <Upload className="w-4 h-4 mr-2" />
                {uploading ? 'Uploading...' : 'Upload Logo'}
              </label>
              <p className="text-xs text-text-light mt-1">PNG, JPG up to 2MB</p>
            </div>
          </div>
        </div>

        {/* Company Name */}
        <div>
          <label className="block text-sm font-medium text-text-dark mb-2">
            Company Name *
          </label>
          <input
            type="text"
            required
            disabled={!isAdmin}
            className="w-full p-3 border border-background-dark rounded-lg focus:ring-2 focus:ring-primary-default focus:border-primary-default disabled:bg-background-light disabled:text-text-muted"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>

        {/* Company Domain */}
        <div>
          <label className="block text-sm font-medium text-text-dark mb-2">
            Company Domain
          </label>
          <input
            type="text"
            disabled={!isAdmin}
            className="w-full p-3 border border-background-dark rounded-lg focus:ring-2 focus:ring-primary-default focus:border-primary-default disabled:bg-background-light disabled:text-text-muted"
            value={formData.domain}
            onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
            placeholder="example.com"
          />
          <p className="text-xs text-text-light mt-1">
            Used for automatic employee email matching
          </p>
        </div>

        {/* Industry and Size */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-dark mb-2">
              Industry
            </label>
            <select
              disabled={!isAdmin}
              className="w-full p-3 border border-background-dark rounded-lg focus:ring-2 focus:ring-primary-default focus:border-primary-default disabled:bg-background-light disabled:text-text-muted"
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
              <option value="consulting">Consulting</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-dark mb-2">
              Company Size
            </label>
            <select
              disabled={!isAdmin}
              className="w-full p-3 border border-background-dark rounded-lg focus:ring-2 focus:ring-primary-default focus:border-primary-default disabled:bg-background-light disabled:text-text-muted"
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

        {/* Billing Email */}
        <div>
          <label className="block text-sm font-medium text-text-dark mb-2">
            Billing Email *
          </label>
          <input
            type="email"
            required
            disabled={!isAdmin}
            className="w-full p-3 border border-background-dark rounded-lg focus:ring-2 focus:ring-primary-default focus:border-primary-default disabled:bg-background-light disabled:text-text-muted"
            value={formData.billing_email}
            onChange={(e) => setFormData({ ...formData, billing_email: e.target.value })}
          />
        </div>

        {isAdmin && (
          <div className="flex justify-end">
            <Button type="submit">
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </div>
        )}
      </form>
    </Card>
  )
}

// Billing Settings Component
function BillingSettings({ company }) {
  const subscriptionStatus = {
    trial: { label: 'Trial', color: 'bg-warning-light text-warning-default', icon: AlertCircle },
    active: { label: 'Active', color: 'bg-success-light text-success-default', icon: CheckCircle },
    expired: { label: 'Expired', color: 'bg-error-light text-error-default', icon: AlertCircle }
  }

  const currentStatus = subscriptionStatus[company.subscription_status] || subscriptionStatus.trial

  return (
    <div className="space-y-6">
      {/* Current Plan */}
      <Card>
        <div className="p-6 border-b border-background-dark">
          <h3 className="text-lg font-semibold text-text-dark">Current Plan</h3>
        </div>
        
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${currentStatus.color}`}>
                <currentStatus.icon className="w-4 h-4 mr-2" />
                {currentStatus.label}
              </div>
              <div>
                <h4 className="font-semibold text-text-dark">Corporate Plan</h4>
                <p className="text-text-light">Up to {company.employee_limit} employees</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-text-dark">$99</p>
              <p className="text-text-light">per month</p>
            </div>
          </div>

          {company.subscription_expires_at && (
            <div className="p-4 bg-background-light rounded-lg">
              <p className="text-sm text-text-medium">
                {company.subscription_status === 'trial' ? 'Trial expires' : 'Next billing'}: {' '}
                <span className="font-medium">
                  {new Date(company.subscription_expires_at).toLocaleDateString()}
                </span>
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Plan Features */}
      <Card>
        <div className="p-6 border-b border-background-dark">
          <h3 className="text-lg font-semibold text-text-dark">Plan Features</h3>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              'Up to 200 employees',
              'Unlimited courses',
              'Progress tracking & reporting',
              'Certificate generation',
              'Admin dashboard',
              'Email support',
              'SSO integration',
              'Custom branding'
            ].map((feature, index) => (
              <div key={`feature-${feature.name || index}`} className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-success-default" />
                <span className="text-text-dark">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Billing Actions */}
      <Card>
        <div className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <Button className="flex-1">
              <CreditCard className="w-4 h-4 mr-2" />
              Update Payment Method
            </Button>
            <Button variant="secondary" className="flex-1">
              <Mail className="w-4 h-4 mr-2" />
              Download Invoices
            </Button>
            {company.subscription_status === 'trial' && (
              <Button variant="primary" className="flex-1">
                Upgrade Now
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  )
}

// Permissions Settings Component
function PermissionsSettings({ company }) {
  const [permissions, setPermissions] = useState({
    allowSelfEnrollment: true,
    requireManagerApproval: false,
    allowCourseRequests: true,
    enableDepartments: false,
    allowDownloadCertificates: true
  })

  return (
    <Card>
      <div className="p-6 border-b border-background-dark">
        <h3 className="text-lg font-semibold text-text-dark">Permission Settings</h3>
        <p className="text-text-light mt-1">Control what employees can do in the system</p>
      </div>

      <div className="p-6 space-y-6">
        {Object.entries({
          allowSelfEnrollment: {
            title: 'Allow Self-Enrollment',
            description: 'Employees can enroll in available courses without approval'
          },
          requireManagerApproval: {
            title: 'Require Manager Approval',
            description: 'Course enrollments must be approved by managers'
          },
          allowCourseRequests: {
            title: 'Allow Course Requests',
            description: 'Employees can request new courses be added'
          },
          enableDepartments: {
            title: 'Enable Departments',
            description: 'Organize employees into departments for better management'
          },
          allowDownloadCertificates: {
            title: 'Allow Certificate Downloads',
            description: 'Employees can download their completion certificates'
          }
        }).map(([key, setting]) => (
          <div key={key} className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-text-dark">{setting.title}</h4>
              <p className="text-sm text-text-light">{setting.description}</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={permissions[key]}
                onChange={(e) => setPermissions({ ...permissions, [key]: e.target.checked })}
              />
              <div className="w-11 h-6 bg-background-medium peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-default"></div>
            </label>
          </div>
        ))}

        <div className="pt-4">
          <Button>
            <Save className="w-4 h-4 mr-2" />
            Save Permissions
          </Button>
        </div>
      </div>
    </Card>
  )
}

// Notification Settings Component
function NotificationSettings() {
  const [notifications, setNotifications] = useState({
    courseCompletions: true,
    newEnrollments: true,
    overdueCourses: true,
    weeklyReports: false,
    systemUpdates: true
  })

  return (
    <Card>
      <div className="p-6 border-b border-background-dark">
        <h3 className="text-lg font-semibold text-text-dark">Notification Preferences</h3>
        <p className="text-text-light mt-1">Choose what notifications you want to receive</p>
      </div>

      <div className="p-6 space-y-6">
        {Object.entries({
          courseCompletions: {
            title: 'Course Completions',
            description: 'Get notified when employees complete courses'
          },
          newEnrollments: {
            title: 'New Enrollments',
            description: 'Get notified when employees enroll in courses'
          },
          overdueCourses: {
            title: 'Overdue Courses',
            description: 'Get notified about overdue course assignments'
          },
          weeklyReports: {
            title: 'Weekly Reports',
            description: 'Receive weekly progress summaries via email'
          },
          systemUpdates: {
            title: 'System Updates',
            description: 'Get notified about platform updates and maintenance'
          }
        }).map(([key, setting]) => (
          <div key={key} className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-text-dark">{setting.title}</h4>
              <p className="text-sm text-text-light">{setting.description}</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={notifications[key]}
                onChange={(e) => setNotifications({ ...notifications, [key]: e.target.checked })}
              />
              <div className="w-11 h-6 bg-background-medium peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-default"></div>
            </label>
          </div>
        ))}

        <div className="pt-4">
          <Button>
            <Save className="w-4 h-4 mr-2" />
            Save Notifications
          </Button>
        </div>
      </div>
    </Card>
  )
}

// Integrations Settings Component
function IntegrationsSettings() {
  const integrations = [
    {
      name: 'Slack',
      description: 'Send course notifications to Slack channels',
      enabled: false,
      icon: '💬'
    },
    {
      name: 'Microsoft Teams',
      description: 'Integrate with Teams for notifications and collaboration',
      enabled: false,
      icon: '👥'
    },
    {
      name: 'Google Workspace',
      description: 'Single sign-on with Google accounts',
      enabled: true,
      icon: '🔐'
    },
    {
      name: 'Zapier',
      description: 'Connect with thousands of apps via Zapier',
      enabled: false,
      icon: '⚡'
    }
  ]

  return (
    <Card>
      <div className="p-6 border-b border-background-dark">
        <h3 className="text-lg font-semibold text-text-dark">Integrations</h3>
        <p className="text-text-light mt-1">Connect with your favorite tools and services</p>
      </div>

      <div className="divide-y divide-background-dark">
        {integrations.map((integration, index) => (
          <div key={`integration-${integration.name || index}`} className="p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-background-light rounded-lg flex items-center justify-center text-2xl">
                {integration.icon}
              </div>
              <div>
                <h4 className="font-medium text-text-dark">{integration.name}</h4>
                <p className="text-sm text-text-light">{integration.description}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {integration.enabled ? (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-success-light text-success-default">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Connected
                </span>
              ) : (
                <Button size="sm">Connect</Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}

// Advanced Settings Component
function AdvancedSettings({ company, onDelete }) {
  return (
    <div className="space-y-6">
      {/* Data Export */}
      <Card>
        <div className="p-6 border-b border-background-dark">
          <h3 className="text-lg font-semibold text-text-dark">Data Export</h3>
          <p className="text-text-light mt-1">Export your company data</p>
        </div>
        
        <div className="p-6">
          <div className="space-y-4">
            <Button variant="secondary" className="w-full">
              Export Employee Data
            </Button>
            <Button variant="secondary" className="w-full">
              Export Course Progress
            </Button>
            <Button variant="secondary" className="w-full">
              Export All Company Data
            </Button>
          </div>
        </div>
      </Card>

      {/* Danger Zone */}
      <Card className="border-error-default">
        <div className="p-6 border-b border-error-default bg-error-light">
          <h3 className="text-lg font-semibold text-error-default">Danger Zone</h3>
          <p className="text-error-default mt-1">Irreversible and destructive actions</p>
        </div>
        
        <div className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-text-dark">Delete Company Account</h4>
                <p className="text-sm text-text-light">
                  Permanently delete your company account and all associated data
                </p>
              </div>
              <Button
                variant="ghost"
                onClick={onDelete}
                className="text-error-default hover:text-error-default hover:bg-error-light"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}

// Delete Company Modal
function DeleteCompanyModal({ isOpen, onClose, company }) {
  const [confirmText, setConfirmText] = useState('')
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    if (confirmText !== company.name) return

    setDeleting(true)
    try {
      // Implementation for deleting company
      await new Promise(resolve => setTimeout(resolve, 2000))
      // Redirect to home or signup
    } catch (error) {
      console.error('Failed to delete company:', error)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Delete Company Account">
      <div className="space-y-4">
        <div className="p-4 bg-error-light border border-error-default rounded-lg">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-error-default" />
            <div>
              <h3 className="font-medium text-error-default">This action cannot be undone</h3>
              <p className="text-sm text-error-default">
                This will permanently delete your company account, all employee data, and course progress.
              </p>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-text-dark mb-2">
            Type <span className="font-mono bg-background-medium px-1 rounded">{company.name}</span> to confirm:
          </label>
          <input
            type="text"
            className="w-full p-3 border border-background-dark rounded-lg focus:ring-2 focus:ring-error-default focus:border-error-default"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="Company name"
          />
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            disabled={confirmText !== company.name || deleting}
            className="bg-error-default hover:bg-error-default text-white"
          >
            {deleting ? 'Deleting...' : 'Delete Company'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}