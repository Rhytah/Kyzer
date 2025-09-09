// src/pages/corporate/UserManagement.jsx
import { useEffect } from 'react'
import { useCorporateStore } from '@/store/corporateStore'
import UserManagementDashboard from '@/components/corporate/UserManagementDashboard'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

export default function UserManagement() {
  const { 
    fetchCurrentCompany, 
    loading, 
    error 
  } = useCorporateStore()

  useEffect(() => {
    fetchCurrentCompany()
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-text-dark mb-2">Error Loading User Management</h2>
          <p className="text-text-light mb-4">{error}</p>
          <button 
            onClick={() => fetchCurrentCompany()}
            className="px-4 py-2 bg-primary-default text-white rounded-lg hover:bg-primary-dark"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return <UserManagementDashboard />
}
