// src/hooks/corporate/useCorporateInvitations.js
import { useState } from 'react'
import { useCorporateStore } from '@/store/corporateStore'

export function useCorporateInvitations() {
  const {
    invitations,
    fetchInvitations,
    inviteEmployee,
    resendInvitation,
    deleteInvitation,
    acceptInvitation,
    loading,
    error
  } = useCorporateStore()

  const [bulkInviteData, setBulkInviteData] = useState([])

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const inviteSingleEmployee = async (email, role = 'employee') => {
    if (!validateEmail(email)) {
      throw new Error('Invalid email address')
    }
    
    return await inviteEmployee(email, role)
  }

  const inviteBulkEmployees = async (emailList, defaultRole = 'employee') => {
    const validEmails = emailList.filter(item => {
      const email = typeof item === 'string' ? item : item.email
      return validateEmail(email)
    })

    const results = []
    for (const emailItem of validEmails) {
      try {
        const email = typeof emailItem === 'string' ? emailItem : emailItem.email
        const role = typeof emailItem === 'string' ? defaultRole : (emailItem.role || defaultRole)
        
        const result = await inviteEmployee(email, role)
        results.push({ email, success: true, result })
      } catch (error) {
        results.push({ email: emailItem, success: false, error: error.message })
      }
    }

    return results
  }

  const parseCSVEmails = (csvContent) => {
    const lines = csvContent.split('\n').filter(line => line.trim())
    const emails = []
    
    for (const line of lines) {
      const parts = line.split(',').map(part => part.trim().replace(/"/g, ''))
      if (parts.length >= 1 && validateEmail(parts[0])) {
        emails.push({
          email: parts[0],
          role: parts[1] || 'employee',
          name: parts[2] || ''
        })
      }
    }
    
    return emails
  }

  const getPendingInvitations = () => {
    const now = new Date()
    return invitations?.filter(inv => 
      !inv.used_at && new Date(inv.expires_at) > now
    ) || []
  }

  const getExpiredInvitations = () => {
    const now = new Date()
    return invitations?.filter(inv => 
      !inv.used_at && new Date(inv.expires_at) <= now
    ) || []
  }

  const getUsedInvitations = () => {
    return invitations?.filter(inv => inv.used_at) || []
  }

  const resendAllExpired = async () => {
    const expired = getExpiredInvitations()
    const results = []
    
    for (const invitation of expired) {
      try {
        await resendInvitation(invitation.id)
        results.push({ invitation, success: true })
      } catch (error) {
        results.push({ invitation, success: false, error: error.message })
      }
    }
    
    return results
  }

  const cleanupExpiredInvitations = async () => {
    const expired = getExpiredInvitations()
    const results = []
    
    for (const invitation of expired) {
      try {
        await deleteInvitation(invitation.id)
        results.push({ invitation, success: true })
      } catch (error) {
        results.push({ invitation, success: false, error: error.message })
      }
    }
    
    return results
  }

  return {
    invitations,
    loading,
    error,
    bulkInviteData,
    setBulkInviteData,
    validateEmail,
    inviteSingleEmployee,
    inviteBulkEmployees,
    parseCSVEmails,
    getPendingInvitations,
    getExpiredInvitations,
    getUsedInvitations,
    resendInvitation,
    deleteInvitation,
    acceptInvitation,
    resendAllExpired,
    cleanupExpiredInvitations,
    refresh: fetchInvitations
  }
}