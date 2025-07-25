// src/hooks/corporate/useOrganization.js
import { useState, useEffect } from 'react'
import { useCorporateStore } from '@/store/corporateStore'

export function useOrganization() {
  const {
    currentCompany,
    fetchCurrentCompany,
    createCompany,
    updateCompany,
    loading,
    error
  } = useCorporateStore()

  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    if (!initialized) {
      fetchCurrentCompany()
      setInitialized(true)
    }
  }, [initialized, fetchCurrentCompany])

  const isCompanyAdmin = () => {
    // You'd get the current user ID from auth store
    return currentCompany?.admin_user_id === 'current_user_id'
  }

  const getSubscriptionStatus = () => {
    if (!currentCompany) return null
    
    const now = new Date()
    const expiresAt = new Date(currentCompany.subscription_expires_at)
    
    return {
      status: currentCompany.subscription_status,
      isExpired: expiresAt < now,
      daysUntilExpiry: Math.ceil((expiresAt - now) / (1000 * 60 * 60 * 24)),
      isActive: currentCompany.subscription_status === 'active',
      isTrial: currentCompany.subscription_status === 'trial'
    }
  }

  const getEmployeeUtilization = () => {
    if (!currentCompany) return null
    
    // This would come from actual employee count
    const activeEmployees = 45 // Mock data
    const limit = currentCompany.employee_limit
    
    return {
      current: activeEmployees,
      limit,
      percentage: Math.round((activeEmployees / limit) * 100),
      available: limit - activeEmployees,
      isNearLimit: (activeEmployees / limit) > 0.8
    }
  }

  return {
    company: currentCompany,
    loading,
    error,
    isCompanyAdmin,
    getSubscriptionStatus,
    getEmployeeUtilization,
    createCompany,
    updateCompany,
    refresh: () => fetchCurrentCompany()
  }
}

