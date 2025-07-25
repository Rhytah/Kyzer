// // src/store/corporateStore.js
// import { create } from 'zustand'
// import { supabase } from '@/lib/supabase'

// export const useCorporateStore = create((set, get) => ({
//   // State
//   currentCompany: null,
//   employees: [],
//   departments: [],
//   invitations: [],
//   courseAssignments: [],
//   companyStats: null,
//   loading: false,
//   error: null,

//   // Actions
//   setLoading: (loading) => set({ loading }),
//   setError: (error) => set({ error }),
//   clearError: () => set({ error: null }),

//   // Company Management
//   fetchCurrentCompany: async () => {
//     try {
//       set({ loading: true, error: null })
      
//       const { data: { user } } = await supabase.auth.getUser()
//       if (!user) throw new Error('Not authenticated')
//       // Check if user is admin of a company
//       const { data: adminCompany, error: adminError } = await supabase
//         .from('companies')
//         .select('*')
//         .eq('admin_user_id', user?.id)
//         .single()
//         console.log(data, 'Current User in Corporate Store')

//         console.log(adminCompany, 'Current User in Corporate Store')

//       if (adminCompany) {
//         set({ currentCompany: adminCompany })
//         return adminCompany
//       }

//       // Check if user is employee of a company
//       const { data: employeeRecord, error: empError } = await supabase
//         .from('company_employees')
//         .select(`
//           *,
//           companies (*)
//         `)
//         .eq('user_id', user.id)
//         .eq('status', 'active')
//         .single()

//       if (employeeRecord?.companies) {
//         set({ currentCompany: employeeRecord.companies })
//         return employeeRecord.companies
//       }

//       set({ currentCompany: null })
//       return null
//     } catch (error) {
//       set({ error: error.message })
//       return null
//     } finally {
//       set({ loading: false })
//     }
//   },
  

//   createCompany: async (companyData) => {
//     try {
//       set({ loading: true, error: null })
      
//       const { data: { user } } = await supabase.auth.getUser()
//       if (!user) throw new Error('Not authenticated')

//       const { data, error } = await supabase
//         .from('companies')
//         .insert({
//           ...companyData,
//           admin_user_id: user.id,
//           subscription_status: 'trial',
//           subscription_expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days trial
//         })
//         .select()
//         .single()

//       if (error) throw error

//       set({ currentCompany: data })
//       return data
//     } catch (error) {
//       set({ error: error.message })
//       throw error
//     } finally {
//       set({ loading: false })
//     }
//   },

//   updateCompany: async (updates) => {
//     try {
//       set({ loading: true, error: null })
      
//       const { currentCompany } = get()
//       if (!currentCompany) throw new Error('No company selected')

//       const { data, error } = await supabase
//         .from('companies')
//         .update({
//           ...updates,
//           updated_at: new Date().toISOString()
//         })
//         .eq('id', currentCompany.id)
//         .select()
//         .single()

//       if (error) throw error

//       set({ currentCompany: data })
//       return data
//     } catch (error) {
//       set({ error: error.message })
//       throw error
//     } finally {
//       set({ loading: false })
//     }
//   },

//   // Employee Management
//   fetchEmployees: async () => {
//     try {
//       set({ loading: true, error: null })
      
//       const { currentCompany } = get()
//       if (!currentCompany) throw new Error('No company selected')

//       const { data, error } = await supabase
//         .from('company_employees')
//         .select(`
//           *,
//           users:user_id (
//             id,
//             email,
//             user_metadata
//           ),
//           invited_by_user:invited_by (
//             email,
//             user_metadata
//           )
//         `)
//         .eq('company_id', currentCompany.id)
//         .order('joined_at', { ascending: false })

//       if (error) throw error

//       set({ employees: data || [] })
//       return data
//     } catch (error) {
//       set({ error: error.message })
//       return []
//     } finally {
//       set({ loading: false })
//     }
//   },

//   inviteEmployee: async (email, role = 'employee') => {
//     try {
//       set({ loading: true, error: null })
      
//       const { currentCompany } = get()
//       const { data: { user } } = await supabase.auth.getUser()
      
//       if (!currentCompany || !user) throw new Error('Missing requirements')

//       // Check employee limit
//       const { employees } = get()
//       if (employees.length >= currentCompany.employee_limit) {
//         throw new Error(`Employee limit reached (${currentCompany.employee_limit})`)
//       }

//       // Generate invitation token
//       const token = crypto.randomUUID()
//       const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

//       const { data, error } = await supabase
//         .from('employee_invitations')
//         .insert({
//           company_id: currentCompany.id,
//           email,
//           token,
//           role,
//           invited_by: user.id,
//           expires_at: expiresAt.toISOString()
//         })
//         .select()
//         .single()

//       if (error) throw error

//       // Send invitation email (you'll need to implement this)
//       await get().sendInvitationEmail(email, token)

//       // Refresh invitations
//       await get().fetchInvitations()
      
//       return data
//     } catch (error) {
//       set({ error: error.message })
//       throw error
//     } finally {
//       set({ loading: false })
//     }
//   },

//   acceptInvitation: async (token) => {
//     try {
//       set({ loading: true, error: null })
      
//       const { data: { user } } = await supabase.auth.getUser()
//       if (!user) throw new Error('Not authenticated')

//       // Verify invitation token
//       const { data: invitation, error: invError } = await supabase
//         .from('employee_invitations')
//         .select('*')
//         .eq('token', token)
//         .eq('email', user.email)
//         .is('used_at', null)
//         .gt('expires_at', new Date().toISOString())
//         .single()

//       if (invError || !invitation) {
//         throw new Error('Invalid or expired invitation')
//       }

//       // Create employee record
//       const { error: empError } = await supabase
//         .from('company_employees')
//         .insert({
//           company_id: invitation.company_id,
//           user_id: user.id,
//           role: invitation.role,
//           status: 'active',
//           invited_by: invitation.invited_by,
//           invited_at: invitation.created_at,
//           joined_at: new Date().toISOString()
//         })

//       if (empError) throw empError

//       // Mark invitation as used
//       await supabase
//         .from('employee_invitations')
//         .update({ used_at: new Date().toISOString() })
//         .eq('id', invitation.id)

//       // Refresh company data
//       await get().fetchCurrentCompany()
      
//       return true
//     } catch (error) {
//       set({ error: error.message })
//       throw error
//     } finally {
//       set({ loading: false })
//     }
//   },

//   updateEmployeeRole: async (employeeId, role) => {
//     try {
//       set({ loading: true, error: null })

//       const { data, error } = await supabase
//         .from('company_employees')
//         .update({ role })
//         .eq('id', employeeId)
//         .select()
//         .single()

//       if (error) throw error

//       // Update local state
//       const { employees } = get()
//       const updatedEmployees = employees.map(emp => 
//         emp.id === employeeId ? { ...emp, role } : emp
//       )
//       set({ employees: updatedEmployees })

//       return data
//     } catch (error) {
//       set({ error: error.message })
//       throw error
//     } finally {
//       set({ loading: false })
//     }
//   },

//   removeEmployee: async (employeeId) => {
//     try {
//       set({ loading: true, error: null })

//       const { error } = await supabase
//         .from('company_employees')
//         .delete()
//         .eq('id', employeeId)

//       if (error) throw error

//       // Update local state
//       const { employees } = get()
//       set({ employees: employees.filter(emp => emp.id !== employeeId) })

//       return true
//     } catch (error) {
//       set({ error: error.message })
//       throw error
//     } finally {
//       set({ loading: false })
//     }
//   },

//   // Department Management
//   fetchDepartments: async () => {
//     try {
//       const { currentCompany } = get()
//       if (!currentCompany) return []

//       const { data, error } = await supabase
//         .from('company_departments')
//         .select(`
//           *,
//           manager:manager_id (
//             email,
//             user_metadata
//           ),
//           employee_count:employee_departments(count)
//         `)
//         .eq('company_id', currentCompany.id)

//       if (error) throw error

//       set({ departments: data || [] })
//       return data
//     } catch (error) {
//       set({ error: error.message })
//       return []
//     }
//   },

//   createDepartment: async (departmentData) => {
//     try {
//       set({ loading: true, error: null })
      
//       const { currentCompany } = get()
//       if (!currentCompany) throw new Error('No company selected')

//       const { data, error } = await supabase
//         .from('company_departments')
//         .insert({
//           ...departmentData,
//           company_id: currentCompany.id
//         })
//         .select()
//         .single()

//       if (error) throw error

//       await get().fetchDepartments()
//       return data
//     } catch (error) {
//       set({ error: error.message })
//       throw error
//     } finally {
//       set({ loading: false })
//     }
//   },

//   // Course Assignment Management
//   fetchCourseAssignments: async () => {
//     try {
//       const { currentCompany } = get()
//       if (!currentCompany) return []

//       const { data, error } = await supabase
//         .from('company_course_assignments')
//         .select(`
//           *,
//           courses (*),
//           assigned_by_user:assigned_by (
//             email,
//             user_metadata
//           )
//         `)
//         .eq('company_id', currentCompany.id)
//         .order('assigned_at', { ascending: false })

//       if (error) throw error

//       set({ courseAssignments: data || [] })
//       return data
//     } catch (error) {
//       set({ error: error.message })
//       return []
//     }
//   },

//   assignCourseToCompany: async (courseId, options = {}) => {
//     try {
//       set({ loading: true, error: null })
      
//       const { currentCompany } = get()
//       const { data: { user } } = await supabase.auth.getUser()
      
//       if (!currentCompany || !user) throw new Error('Missing requirements')

//       const { data, error } = await supabase
//         .from('company_course_assignments')
//         .insert({
//           company_id: currentCompany.id,
//           course_id: courseId,
//           assigned_by: user.id,
//           due_date: options.dueDate,
//           is_mandatory: options.isMandatory || false
//         })
//         .select()
//         .single()

//       if (error) throw error

//       await get().fetchCourseAssignments()
//       return data
//     } catch (error) {
//       set({ error: error.message })
//       throw error
//     } finally {
//       set({ loading: false })
//     }
//   },

//   // Analytics & Reporting
//   fetchCompanyStats: async () => {
//     try {
//       const { currentCompany } = get()
//       if (!currentCompany) return null

//       // Get employee stats
//       const { count: totalEmployees } = await supabase
//         .from('company_employees')
//         .select('*', { count: 'exact', head: true })
//         .eq('company_id', currentCompany.id)
//         .eq('status', 'active')

//       const { count: pendingInvites } = await supabase
//         .from('employee_invitations')
//         .select('*', { count: 'exact', head: true })
//         .eq('company_id', currentCompany.id)
//         .is('used_at', null)
//         .gt('expires_at', new Date().toISOString())

//       // Get course completion stats
//       const { data: completionStats } = await supabase
//         .from('enrollments')
//         .select(`
//           completion_status,
//           user_id,
//           company_employees!inner(company_id)
//         `)
//         .eq('company_employees.company_id', currentCompany.id)

//       const completed = completionStats?.filter(s => s.completion_status === 'completed').length || 0
//       const inProgress = completionStats?.filter(s => s.completion_status === 'in_progress').length || 0

//       const stats = {
//         totalEmployees: totalEmployees || 0,
//         employeeLimit: currentCompany.employee_limit,
//         pendingInvites: pendingInvites || 0,
//         coursesCompleted: completed,
//         coursesInProgress: inProgress,
//         utilizationRate: totalEmployees > 0 ? Math.round((totalEmployees / currentCompany.employee_limit) * 100) : 0
//       }

//       set({ companyStats: stats })
//       return stats
//     } catch (error) {
//       set({ error: error.message })
//       return null
//     }
//   },

//   // Invitations Management
//   fetchInvitations: async () => {
//     try {
//       const { currentCompany } = get()
//       if (!currentCompany) return []

//       const { data, error } = await supabase
//         .from('employee_invitations')
//         .select(`
//           *,
//           invited_by_user:invited_by (
//             email,
//             user_metadata
//           )
//         `)
//         .eq('company_id', currentCompany.id)
//         .order('created_at', { ascending: false })

//       if (error) throw error

//       set({ invitations: data || [] })
//       return data
//     } catch (error) {
//       set({ error: error.message })
//       return []
//     }
//   },

//   resendInvitation: async (invitationId) => {
//     try {
//       set({ loading: true, error: null })

//       const { invitations } = get()
//       const invitation = invitations.find(inv => inv.id === invitationId)
      
//       if (!invitation) throw new Error('Invitation not found')

//       // Extend expiration
//       const newExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      
//       await supabase
//         .from('employee_invitations')
//         .update({ expires_at: newExpiresAt.toISOString() })
//         .eq('id', invitationId)

//       // Send email again
//       await get().sendInvitationEmail(invitation.email, invitation.token)

//       await get().fetchInvitations()
//       return true
//     } catch (error) {
//       set({ error: error.message })
//       throw error
//     } finally {
//       set({ loading: false })
//     }
//   },

//   deleteInvitation: async (invitationId) => {
//     try {
//       const { error } = await supabase
//         .from('employee_invitations')
//         .delete()
//         .eq('id', invitationId)

//       if (error) throw error

//       const { invitations } = get()
//       set({ invitations: invitations.filter(inv => inv.id !== invitationId) })
      
//       return true
//     } catch (error) {
//       set({ error: error.message })
//       throw error
//     }
//   },

//   // Helper function for sending invitation emails
//   sendInvitationEmail: async (email, token) => {
//     // This would integrate with your email service
//     // For now, just log the invitation URL
//     const inviteUrl = `${window.location.origin}/accept-invitation?token=${token}`
//     console.log(`Send invitation to ${email}: ${inviteUrl}`)
    
//     // TODO: Implement actual email sending via Supabase Edge Functions or external service
//     return true
//   },

//   // Utility functions
//   isCompanyAdmin: () => {
//     const { currentCompany } = get()
//     return currentCompany?.admin_user_id === 'current_user_id' // You'll need to get current user ID
//   },

//   getEmployeeRole: (userId) => {
//     const { employees } = get()
//     const employee = employees.find(emp => emp.user_id === userId)
//     return employee?.role || null
//   },

//   canManageEmployees: (userRole) => {
//     return ['admin', 'manager'].includes(userRole)
//   }
// }))

// // Selector helpers
// export const useCurrentCompany = () => useCorporateStore(state => state.currentCompany)
// export const useEmployees = () => useCorporateStore(state => state.employees)
// export const useDepartments = () => useCorporateStore(state => state.departments)
// export const useCompanyStats = () => useCorporateStore(state => state.companyStats)
// export const useCorporateLoading = () => useCorporateStore(state => state.loading)
// export const useCorporateError = () => useCorporateStore(state => state.error)


// src/store/corporateStore.js
import { create } from 'zustand'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

const useCorporateStore = create((set, get) => ({
  // State
  currentCompany: null,
  employees: [],
  courseAssignments: [],
  companyStats: null,
  permissions: null,
  loading: false,
  error: null,

  // Actions
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),

  // Fetch current user's company
  fetchCurrentCompany: async () => {
    try {
      set({ loading: true, error: null })
      
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      // First check if user is directly associated with a company
      const { data: userCompany, error: userError } = await supabase
        .from('company_members')
        .select(`
          company_id,
          role,
          permissions,
          companies!inner (
            id,
            name,
            domain,
            industry,
            size_category,
            subscription_status,
            subscription_expires_at,
            logo_url,
            created_at
          )
        `)
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single()

      if (userError && userError.code !== 'PGRST116') {
        throw userError
      }

      if (userCompany) {
        set({ 
          currentCompany: userCompany.companies,
          permissions: userCompany.permissions || {},
          loading: false 
        })
        return userCompany.companies
      }

      // If no direct company association, user doesn't have a company
      set({ currentCompany: null, permissions: null, loading: false })
      return null

    } catch (error) {
      console.error('Error fetching current company:', error)
      set({ error: error.message, loading: false })
      return null
    }
  },

  // Fetch company statistics
  fetchCompanyStats: async () => {
    try {
      const { currentCompany } = get()
      if (!currentCompany) return null

      set({ loading: true })

      // Get employee count
      const { count: totalEmployees } = await supabase
        .from('company_members')
        .select('*', { count: 'exact', head: true })
        .eq('company_id', currentCompany.id)
        .eq('status', 'active')

      // Get course completion stats
      const { data: completionStats } = await supabase
        .from('course_enrollments')
        .select('status')
        .eq('company_id', currentCompany.id)

      const coursesCompleted = completionStats?.filter(c => c.status === 'completed').length || 0
      const coursesInProgress = completionStats?.filter(c => c.status === 'in_progress').length || 0

      // Calculate utilization rate (employees with at least one course)
      const { data: activeUsers } = await supabase
        .from('course_enrollments')
        .select('user_id')
        .eq('company_id', currentCompany.id)

      const uniqueActiveUsers = new Set(activeUsers?.map(u => u.user_id)).size
      const utilizationRate = totalEmployees > 0 ? Math.round((uniqueActiveUsers / totalEmployees) * 100) : 0

      const stats = {
        totalEmployees: totalEmployees || 0,
        employeeLimit: 200, // Default limit
        coursesCompleted,
        coursesInProgress,
        utilizationRate
      }

      set({ companyStats: stats, loading: false })
      return stats

    } catch (error) {
      console.error('Error fetching company stats:', error)
      set({ error: error.message, loading: false })
      return null
    }
  },

  // Fetch company employees
  fetchEmployees: async () => {
    try {
      const { currentCompany } = get()
      if (!currentCompany) return []

      set({ loading: true })

      const { data: employees, error } = await supabase
        .from('company_members')
        .select(`
          id,
          user_id,
          role,
          status,
          invited_at,
          joined_at,
          profiles!inner (
            id,
            email,
            full_name,
            avatar_url
          )
        `)
        .eq('company_id', currentCompany.id)
        .order('joined_at', { ascending: false })

      if (error) throw error

      set({ employees: employees || [], loading: false })
      return employees || []

    } catch (error) {
      console.error('Error fetching employees:', error)
      set({ error: error.message, loading: false })
      return []
    }
  },

  // Fetch course assignments
  fetchCourseAssignments: async () => {
    try {
      const { currentCompany } = get()
      if (!currentCompany) return []

      set({ loading: true })

      const { data: assignments, error } = await supabase
        .from('course_assignments')
        .select(`
          id,
          course_id,
          assigned_by,
          assigned_at,
          due_date,
          status,
          courses!inner (
            id,
            title,
            description,
            duration_hours
          )
        `)
        .eq('company_id', currentCompany.id)
        .order('assigned_at', { ascending: false })

      if (error) throw error

      set({ courseAssignments: assignments || [], loading: false })
      return assignments || []

    } catch (error) {
      console.error('Error fetching course assignments:', error)
      set({ error: error.message, loading: false })
      return []
    }
  },

  // Fetch user permissions for current company
  fetchPermissions: async () => {
    try {
      const { currentCompany } = get()
      if (!currentCompany) return null

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { data: memberData, error } = await supabase
        .from('company_members')
        .select('role, permissions')
        .eq('company_id', currentCompany.id)
        .eq('user_id', user.id)
        .single()

      if (error) throw error

      // Define role-based permissions
      const rolePermissions = {
        owner: {
          canViewEmployees: true,
          canManageEmployees: true,
          canViewReports: true,
          canManageCompany: true,
          canAssignCourses: true,
          canCreateCourses: true
        },
        admin: {
          canViewEmployees: true,
          canManageEmployees: true,
          canViewReports: true,
          canManageCompany: false,
          canAssignCourses: true,
          canCreateCourses: false
        },
        manager: {
          canViewEmployees: true,
          canManageEmployees: false,
          canViewReports: true,
          canManageCompany: false,
          canAssignCourses: true,
          canCreateCourses: false
        },
        employee: {
          canViewEmployees: false,
          canManageEmployees: false,
          canViewReports: false,
          canManageCompany: false,
          canAssignCourses: false,
          canCreateCourses: false
        }
      }

      // Merge role permissions with custom permissions
      const permissions = {
        ...rolePermissions[memberData.role] || rolePermissions.employee,
        ...memberData.permissions || {}
      }

      set({ permissions })
      return permissions

    } catch (error) {
      console.error('Error fetching permissions:', error)
      set({ error: error.message })
      return null
    }
  },

  // Create a new company
  createCompany: async (companyData) => {
    try {
      set({ loading: true, error: null })

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      // Create company
      const { data: company, error: companyError } = await supabase
        .from('companies')
        .insert({
          ...companyData,
          owner_id: user.id,
          subscription_status: 'trial',
          subscription_expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days trial
        })
        .select()
        .single()

      if (companyError) throw companyError

      // Add user as company owner
      const { error: memberError } = await supabase
        .from('company_members')
        .insert({
          company_id: company.id,
          user_id: user.id,
          role: 'owner',
          status: 'active',
          joined_at: new Date().toISOString()
        })

      if (memberError) throw memberError

      set({ currentCompany: company, loading: false })
      toast.success('Company created successfully!')
      
      return company

    } catch (error) {
      console.error('Error creating company:', error)
      set({ error: error.message, loading: false })
      toast.error('Failed to create company: ' + error.message)
      throw error
    }
  },

  // Invite employee to company
  inviteEmployee: async (email, role = 'employee') => {
    try {
      const { currentCompany } = get()
      if (!currentCompany) throw new Error('No current company')

      set({ loading: true, error: null })

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      // Create invitation
      const { data: invitation, error } = await supabase
        .from('company_invitations')
        .insert({
          company_id: currentCompany.id,
          email,
          role,
          invited_by: user.id,
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
        })
        .select()
        .single()

      if (error) throw error

      set({ loading: false })
      toast.success(`Invitation sent to ${email}`)
      
      return invitation

    } catch (error) {
      console.error('Error inviting employee:', error)
      set({ error: error.message, loading: false })
      toast.error('Failed to send invitation: ' + error.message)
      throw error
    }
  },

  // Clear all corporate data (for logout)
  clearCorporateData: () => {
    set({
      currentCompany: null,
      employees: [],
      courseAssignments: [],
      companyStats: null,
      permissions: null,
      loading: false,
      error: null
    })
  }
}))

// Custom hooks for easier component usage
export const useCurrentCompany = () => {
  const currentCompany = useCorporateStore(state => state.currentCompany)
  const fetchCurrentCompany = useCorporateStore(state => state.fetchCurrentCompany)
  
  return currentCompany
}

export const useCompanyStats = () => {
  return useCorporateStore(state => state.companyStats)
}

export const useCorporatePermissions = () => {
  const permissions = useCorporateStore(state => state.permissions)
  const fetchPermissions = useCorporateStore(state => state.fetchPermissions)
  
  return { permissions: permissions || {}, fetchPermissions }
}

export { useCorporateStore }

// Selector helpers
export const useEmployees = () => useCorporateStore(state => state.employees)
export const useDepartments = () => useCorporateStore(state => state.departments)
export const useCorporateLoading = () => useCorporateStore(state => state.loading)
export const useCorporateError = () => useCorporateStore(state => state.error)
