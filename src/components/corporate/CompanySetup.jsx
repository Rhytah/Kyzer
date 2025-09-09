// src/components/corporate/CompanySetup.jsx
import { useState } from 'react'
import { useCorporateStore } from '@/store/corporateStore'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import { Building2, AlertCircle, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'

export default function CompanySetup() {
  const { createCompany, loading } = useCorporateStore()
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    domain: '',
    max_employees: 50,
    email: ''
  })
  const [errors, setErrors] = useState({})

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Basic validation
    const newErrors = {}
    if (!formData.name) newErrors.name = 'Organization name is required'
    if (!formData.domain) newErrors.domain = 'Domain is required'
    if (!formData.email) newErrors.email = 'Email is required'
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    try {
      await createCompany(formData)
      setShowForm(false)
      setFormData({ name: '', domain: '', max_employees: 50, email: '' })
      setErrors({})
      toast.success('Organization created successfully!')
    } catch (error) {
      setErrors({ submit: error.message })
      toast.error('Failed to create organization: ' + error.message)
    }
  }

  if (showForm) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <Building2 className="w-6 h-6 text-primary-default" />
          <h3 className="text-lg font-semibold text-text-dark">Create Your Organization</h3>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-dark mb-2">
              Organization Name *
            </label>
            <input
              type="text"
              required
              className="w-full p-3 border border-background-dark rounded-lg focus:ring-2 focus:ring-primary-default focus:border-primary-default"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter your organization name"
            />
            {errors.name && (
              <p className="text-error-default text-sm mt-1">{errors.name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-text-dark mb-2">
              Domain *
            </label>
            <input
              type="text"
              required
              className="w-full p-3 border border-background-dark rounded-lg focus:ring-2 focus:ring-primary-default focus:border-primary-default"
              value={formData.domain}
              onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
              placeholder="company.com"
            />
            {errors.domain && (
              <p className="text-error-default text-sm mt-1">{errors.domain}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-dark mb-2">
                Email *
              </label>
              <input
                type="email"
                required
                className="w-full p-3 border border-background-dark rounded-lg focus:ring-2 focus:ring-primary-default focus:border-primary-default"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="contact@organization.com"
              />
              {errors.email && (
                <p className="text-error-default text-sm mt-1">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-text-dark mb-2">
                Max Employees
              </label>
              <input
                type="number"
                min="1"
                className="w-full p-3 border border-background-dark rounded-lg focus:ring-2 focus:ring-primary-default focus:border-primary-default"
                value={formData.max_employees}
                onChange={(e) => setFormData({ ...formData, max_employees: parseInt(e.target.value) || 50 })}
                placeholder="50"
              />
            </div>
          </div>

          {errors.submit && (
            <div className="p-3 bg-error-light border border-error-default rounded-lg">
              <p className="text-error-default text-sm">{errors.submit}</p>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Button 
              variant="ghost" 
              onClick={() => setShowForm(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Organization'}
            </Button>
          </div>
        </form>
      </Card>
    )
  }

  return (
    <Card className="p-6">
      <div className="text-center">
        <AlertCircle className="w-12 h-12 text-warning-default mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-text-dark mb-2">
          No Organization Associated
        </h3>
        <p className="text-text-light mb-6">
          You need to be associated with an organization to manage employees and send invitations.
        </p>
        
        <div className="space-y-3">
          <Button onClick={() => setShowForm(true)}>
            <Building2 className="w-4 h-4 mr-2" />
            Create New Organization
          </Button>
          
          <p className="text-sm text-text-light">
            Or contact your administrator to be added to an existing organization.
          </p>
        </div>
      </div>
    </Card>
  )
}
