import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { 
  Building, 
  Users, 
  CreditCard, 
  Shield, 
  Bell,
  Globe,
  Upload,
  Save,
  Edit,
  Trash2,
  Plus,
  X,
  Check,
  AlertTriangle
} from 'lucide-react'
import Button from '../../components/ui/Button'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import { useAuthStore } from '../../store/authStore'
import toast from 'react-hot-toast'

const companySchema = z.object({
  name: z.string().min(2, 'Company name must be at least 2 characters'),
  industry: z.string().min(1, 'Please select an industry'),
  size: z.string().min(1, 'Please select company size'),
  website: z.string().url('Please enter a valid website URL').optional().or(z.literal('')),
  description: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional()
})

const CompanySettings = () => {
  const { profile } = useAuthStore()
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('general')
  const [companyData, setCompanyData] = useState(null)
  const [billingData, setBillingData] = useState(null)
  const [customDomains, setCustomDomains] = useState([])
  const [newDomain, setNewDomain] = useState('')

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty }
  } = useForm({
    resolver: zodResolver(companySchema)
  })

  const tabs = [
    { id: 'general', name: 'General', icon: Building },
    { id: 'billing', name: 'Billing', icon: CreditCard },
    { id: 'users', name: 'User Management', icon: Users },
    { id: 'security', name: 'Security', icon: Shield },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'branding', name: 'Branding', icon: Globe }
  ]

  const industries = [
    'Technology', 'Healthcare', 'Finance', 'Education', 'Manufacturing',
    'Retail', 'Consulting', 'Real Estate', 'Non-profit', 'Other'
  ]

  const companySizes = [
    '1-10 employees', '11-50 employees', '51-200 employees', 
    '201-500 employees', '501-1000 employees', '1000+ employees'
  ]

  useEffect(() => {
    const loadSettings = async () => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const mockCompanyData = {
        name: profile?.organization?.name || 'Acme Corporation',
        industry: 'Technology',
        size: '51-200 employees',
        website: 'https://acme.com',
        description: 'Leading technology company focused on innovation and growth.',
        address: '123 Business St, Suite 100, City, State 12345',
        phone: '+1 (555) 123-4567',
        logo: '/company-logo.png'
      }

      const mockBillingData = {
        plan: 'Corporate Pro',
        price: 2999,
        billingCycle: 'annual',
        nextBilling: '2024-12-15',
        employeeLimit: 200,
        currentEmployees: 156,
        paymentMethod: '**** **** **** 4567',
        billingEmail: 'billing@acme.com'
      }

      setCompanyData(mockCompanyData)
      setBillingData(mockBillingData)
      setCustomDomains(['acme.com', 'acme-corp.com'])
      
      reset(mockCompanyData)
      setLoading(false)
    }

    loadSettings()
  }, [reset, profile])

  const handleSaveGeneral = async (data) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setCompanyData(prev => ({ ...prev, ...data }))
      toast.success('Company settings updated successfully')
    } catch (error) {
      toast.error('Failed to update settings')
    }
  }

  const handleAddDomain = async () => {
    if (!newDomain.trim()) return

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))
      
      setCustomDomains(prev => [...prev, newDomain.trim()])
      setNewDomain('')
      toast.success('Domain added successfully')
    } catch (error) {
      toast.error('Failed to add domain')
    }
  }

  const handleRemoveDomain = async (domain) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))
      
      setCustomDomains(prev => prev.filter(d => d !== domain))
      toast.success('Domain removed successfully')
    } catch (error) {
      toast.error('Failed to remove domain')
    }
  }

  const renderGeneralTab = () => (
    <form onSubmit={handleSubmit(handleSaveGeneral)} className="space-y-6">
      {/* Company Logo */}
      <div>
        <label className="label">Company Logo</label>
        <div className="flex items-center space-x-4">
          <div className="w-20 h-20 bg-background-medium rounded-lg flex items-center justify-center">
            {companyData?.logo ? (
              <img src={companyData.logo} alt="Company logo" className="w-full h-full object-cover rounded-lg" />
            ) : (
              <Building className="h-8 w-8 text-text-light" />
            )}
          </div>
          <div>
            <Button type="button" variant="secondary" size="sm">
              <Upload className="h-4 w-4 mr-2" />
              Upload Logo
            </Button>
            <p className="text-xs text-text-light mt-1">
              Recommended: 200x200px, PNG or JPG
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Company Name */}
        <div>
          <label className="label">Company Name</label>
          <input
            {...register('name')}
            className={`input ${errors.name ? 'input-error' : ''}`}
            placeholder="Enter company name"
          />
          {errors.name && (
            <p className="error-text">{errors.name.message}</p>
          )}
        </div>

        {/* Industry */}
        <div>
          <label className="label">Industry</label>
          <select
            {...register('industry')}
            className={`input ${errors.industry ? 'input-error' : ''}`}
          >
            <option value="">Select industry</option>
            {industries.map(industry => (
              <option key={industry} value={industry}>{industry}</option>
            ))}
          </select>
          {errors.industry && (
            <p className="error-text">{errors.industry.message}</p>
          )}
        </div>

        {/* Company Size */}
        <div>
          <label className="label">Company Size</label>
          <select
            {...register('size')}
            className={`input ${errors.size ? 'input-error' : ''}`}
          >
            <option value="">Select size</option>
            {companySizes.map(size => (
              <option key={size} value={size}>{size}</option>
            ))}
          </select>
          {errors.size && (
            <p className="error-text">{errors.size.message}</p>
          )}
        </div>

        {/* Website */}
        <div>
          <label className="label">Website</label>
          <input
            {...register('website')}
            type="url"
            className={`input ${errors.website ? 'input-error' : ''}`}
            placeholder="https://company.com"
          />
          {errors.website && (
            <p className="error-text">{errors.website.message}</p>
          )}
        </div>

        {/* Phone */}
        <div>
          <label className="label">Phone</label>
          <input
            {...register('phone')}
            type="tel"
            className="input"
            placeholder="+1 (555) 123-4567"
          />
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="label">Description</label>
        <textarea
          {...register('description')}
          rows={4}
          className="input"
          placeholder="Brief description of your company..."
        />
      </div>

      {/* Address */}
      <div>
        <label className="label">Address</label>
        <textarea
          {...register('address')}
          rows={3}
          className="input"
          placeholder="Enter company address..."
        />
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={!isDirty}>
          <Save className="h-4 w-4 mr-2" />
          Save Changes
        </Button>
      </div>
    </form>
  )

  const renderBillingTab = () => (
    <div className="space-y-6">
      {/* Current Plan */}
      <div className="card border-l-4 border-l-primary">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-text-dark">{billingData?.plan}</h3>
            <p className="text-text-medium">
              ${billingData?.price}/year • Up to {billingData?.employeeLimit} employees
            </p>
          </div>
          <Button variant="secondary">
            Change Plan
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-text-medium">Current Usage</p>
            <p className="font-medium text-text-dark">
              {billingData?.currentEmployees} / {billingData?.employeeLimit} employees
            </p>
          </div>
          <div>
            <p className="text-text-medium">Next Billing</p>
            <p className="font-medium text-text-dark">
              {new Date(billingData?.nextBilling).toLocaleDateString()}
            </p>
          </div>
          <div>
            <p className="text-text-medium">Billing Cycle</p>
            <p className="font-medium text-text-dark capitalize">
              {billingData?.billingCycle}
            </p>
          </div>
        </div>
      </div>

      {/* Payment Method */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-text-dark">Payment Method</h3>
          <Button variant="secondary" size="sm">
            <Edit className="h-4 w-4 mr-2" />
            Update
          </Button>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="w-12 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded flex items-center justify-center">
            <CreditCard className="h-4 w-4 text-white" />
          </div>
          <div>
            <p className="font-medium text-text-dark">Credit Card</p>
            <p className="text-sm text-text-medium">{billingData?.paymentMethod}</p>
          </div>
        </div>
      </div>

      {/* Billing Information */}
      <div className="card">
        <h3 className="text-lg font-semibold text-text-dark mb-4">Billing Information</h3>
        
        <div className="space-y-4">
          <div>
            <label className="label">Billing Email</label>
            <input
              type="email"
              defaultValue={billingData?.billingEmail}
              className="input"
              placeholder="billing@company.com"
            />
          </div>
          
          <div>
            <label className="label">Billing Address</label>
            <textarea
              rows={3}
              className="input"
              defaultValue={companyData?.address}
              placeholder="Enter billing address..."
            />
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <Button>
            <Save className="h-4 w-4 mr-2" />
            Update Billing Info
          </Button>
        </div>
      </div>

      {/* Usage Warning */}
      {billingData && billingData.currentEmployees / billingData.employeeLimit > 0.8 && (
        <div className="card border-l-4 border-l-yellow-500">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-text-dark mb-1">
                Approaching Employee Limit
              </h4>
              <p className="text-sm text-text-medium mb-3">
                You're using {billingData.currentEmployees} of {billingData.employeeLimit} employee slots. 
                Consider upgrading your plan to add more team members.
              </p>
              <Button size="sm">
                Upgrade Plan
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )

  const renderSecurityTab = () => (
    <div className="space-y-6">
      {/* Custom Domains */}
      <div className="card">
        <h3 className="text-lg font-semibold text-text-dark mb-4">Custom Email Domains</h3>
        <p className="text-text-medium mb-4">
          Add email domains to automatically assign employees to your organization when they sign up.
        </p>
        
        <div className="space-y-3 mb-4">
          {customDomains.map((domain, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-background-light rounded-lg">
              <div className="flex items-center">
                <Globe className="h-4 w-4 text-primary mr-3" />
                <span className="font-medium text-text-dark">{domain}</span>
                <span className="ml-2 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                  Verified
                </span>
              </div>
              <button
                onClick={() => handleRemoveDomain(domain)}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>

        <div className="flex space-x-2">
          <input
            type="text"
            value={newDomain}
            onChange={(e) => setNewDomain(e.target.value)}
            placeholder="example.com"
            className="input flex-1"
          />
          <Button onClick={handleAddDomain}>
            <Plus className="h-4 w-4 mr-2" />
            Add Domain
          </Button>
        </div>
      </div>

      {/* Security Settings */}
      <div className="card">
        <h3 className="text-lg font-semibold text-text-dark mb-4">Security Settings</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-background-dark rounded-lg">
            <div>
              <h4 className="font-medium text-text-dark">Two-Factor Authentication</h4>
              <p className="text-sm text-text-medium">Require 2FA for all organization members</p>
            </div>
            <label className="flex items-center">
              <input type="checkbox" className="rounded" />
              <span className="ml-2 text-sm">Enable</span>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 border border-background-dark rounded-lg">
            <div>
              <h4 className="font-medium text-text-dark">Single Sign-On (SSO)</h4>
              <p className="text-sm text-text-medium">Enable SAML/OIDC integration</p>
            </div>
            <Button variant="secondary" size="sm">
              Configure
            </Button>
          </div>

          <div className="flex items-center justify-between p-4 border border-background-dark rounded-lg">
            <div>
              <h4 className="font-medium text-text-dark">Session Timeout</h4>
              <p className="text-sm text-text-medium">Automatically log out inactive users</p>
            </div>
            <select className="input w-32">
              <option value="30">30 minutes</option>
              <option value="60">1 hour</option>
              <option value="240">4 hours</option>
              <option value="480">8 hours</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  )

  const renderContent = () => {
    switch (activeTab) {
      case 'general':
        return renderGeneralTab()
      case 'billing':
        return renderBillingTab()
      case 'security':
        return renderSecurityTab()
      case 'users':
        return (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-text-light mx-auto mb-4" />
            <h3 className="text-lg font-medium text-text-dark mb-2">User Management</h3>
            <p className="text-text-medium">Configure user roles, permissions, and access controls.</p>
          </div>
        )
      case 'notifications':
        return (
          <div className="text-center py-12">
            <Bell className="h-12 w-12 text-text-light mx-auto mb-4" />
            <h3 className="text-lg font-medium text-text-dark mb-2">Notification Settings</h3>
            <p className="text-text-medium">Manage email notifications and alerts for your organization.</p>
          </div>
        )
      case 'branding':
        return (
          <div className="text-center py-12">
            <Globe className="h-12 w-12 text-text-light mx-auto mb-4" />
            <h3 className="text-lg font-medium text-text-dark mb-2">Branding & Customization</h3>
            <p className="text-text-medium">Customize the look and feel of your learning platform.</p>
          </div>
        )
      default:
        return null
    }
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-dark mb-2">
          Company Settings
        </h1>
        <p className="text-text-medium">
          Manage your organization's settings and preferences
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="card">
            <nav className="space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center px-3 py-2 rounded-lg text-left transition-colors ${
                      activeTab === tab.id
                        ? 'bg-primary text-white'
                        : 'text-text-medium hover:bg-background-light hover:text-text-dark'
                    }`}
                  >
                    <Icon className="h-4 w-4 mr-3" />
                    <span className="text-sm">{tab.name}</span>
                  </button>
                )
              })}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <div className="card">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-text-dark">
                {tabs.find(tab => tab.id === activeTab)?.name}
              </h2>
            </div>
            
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  )
}

export default CompanySettings