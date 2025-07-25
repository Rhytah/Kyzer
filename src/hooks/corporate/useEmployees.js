// src/hooks/corporate/useEmployees.js
import { useState, useEffect } from 'react'
import { useCorporateStore } from '@/store/corporateStore'

export function useEmployees() {
  const {
    employees,
    invitations,
    fetchEmployees,
    fetchInvitations,
    inviteEmployee,
    updateEmployeeRole,
    removeEmployee,
    resendInvitation,
    deleteInvitation,
    loading,
    error
  } = useCorporateStore()

  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    fetchEmployees()
    fetchInvitations()
  }, [])

  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = 
      employee.users?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.users?.user_metadata?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesRole = roleFilter === 'all' || employee.role === roleFilter
    const matchesStatus = statusFilter === 'all' || employee.status === statusFilter
    
    return matchesSearch && matchesRole && matchesStatus
  })

  const getEmployeeStats = () => {
    const total = employees.length
    const active = employees.filter(emp => emp.status === 'active').length
    const pending = employees.filter(emp => emp.status === 'pending').length
    const admins = employees.filter(emp => emp.role === 'admin').length
    const managers = employees.filter(emp => emp.role === 'manager').length
    
    return { total, active, pending, admins, managers }
  }

  const getPendingInvitations = () => {
    return invitations?.filter(inv => 
      !inv.used_at && new Date(inv.expires_at) > new Date()
    ) || []
  }

  const getExpiredInvitations = () => {
    return invitations?.filter(inv => 
      !inv.used_at && new Date(inv.expires_at) <= new Date()
    ) || []
  }

  return {
    employees: filteredEmployees,
    allEmployees: employees,
    invitations,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    roleFilter,
    setRoleFilter,
    statusFilter,
    setStatusFilter,
    getEmployeeStats,
    getPendingInvitations,
    getExpiredInvitations,
    inviteEmployee,
    updateEmployeeRole,
    removeEmployee,
    resendInvitation,
    deleteInvitation,
    refresh: () => {
      fetchEmployees()
      fetchInvitations()
    }
  }
}

