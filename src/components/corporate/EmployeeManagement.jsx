// src/components/corporate/EmployeeManagement.jsx
import { useState, useEffect, useRef } from 'react'
import { 
  Users, 
  UserPlus, 
  Mail, 
  MoreVertical, 
  Search, 
  Filter,
  Shield,
  ShieldCheck,
  Crown,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
  Trash2,
  Edit,
  Eye,
  EyeOff
} from 'lucide-react'
import { useCorporateStore, useEmployees, useCurrentCompany, useDepartments, useInvitations } from '@/store/corporateStore'
import { useCorporatePermissions } from '@/hooks/corporate/useCorporatePermissions'
import { useAuthStore } from '@/store/authStore'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Modal from '@/components/ui/Modal'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import toast from 'react-hot-toast'

export default function EmployeeManagement() {
  const currentCompany = useCurrentCompany()
  const employees = useEmployees()
  const departments = useDepartments()
  const invitations = useInvitations()
  const { 
    fetchEmployees,
    fetchInvitations,
    fetchDepartments,
    inviteEmployee,
    createUserDirect,
    updateEmployeeRole,
    removeEmployee,
    resendInvitation,
    deleteInvitation,
    loading,
    error
  } = useCorporateStore()

  const [showInviteModal, setShowInviteModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRole, setFilterRole] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterDepartment, setFilterDepartment] = useState('all')

  useEffect(() => {
    fetchEmployees()
    fetchInvitations()
    fetchDepartments()
  }, [])

  // Filter employees based on search and filters
  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = employee.users?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.users?.user_metadata?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesRole = filterRole === 'all' || employee.role === filterRole
    const matchesStatus = filterStatus === 'all' || employee.status === filterStatus
    const matchesDepartment = filterDepartment === 'all' || employee.department_id === filterDepartment
    
    return matchesSearch && matchesRole && matchesStatus && matchesDepartment
  })

  const getRoleIcon = (role) => {
    switch (role) {
      case 'owner': return Crown
      case 'corporate_admin': return UserCog
      case 'instructor': return BookOpen
      case 'system_admin': return Settings
      case 'learner': return GraduationCap
      case 'admin': return Crown
      case 'manager': return ShieldCheck
      default: return Users
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-success-default bg-success-light'
      case 'pending': return 'text-warning-default bg-warning-light'
      case 'inactive': return 'text-text-muted bg-background-medium'
      default: return 'text-text-muted bg-background-medium'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-semibold text-text-dark">Employee Management</h2>
          <p className="text-text-light">
            Manage your team of {employees.length}/{currentCompany?.employee_limit || 200} employees
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button onClick={() => setShowInviteModal(true)}>
            <UserPlus className="w-4 h-4 mr-2" />
            Add Team Member
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-light">Total Employees</p>
              <p className="text-2xl font-bold text-text-dark">{employees.length}</p>
            </div>
            <Users className="w-8 h-8 text-primary-default" />
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-light">Active</p>
              <p className="text-2xl font-bold text-success-default">
                {employees.filter(e => e.status === 'active').length}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-success-default" />
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-light">Pending</p>
              <p className="text-2xl font-bold text-warning-default">
                {employees.filter(e => e.status === 'pending').length}
              </p>
            </div>
            <Clock className="w-8 h-8 text-warning-default" />
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-light">Invitations</p>
              <p className="text-2xl font-bold text-text-medium">
                {invitations?.filter(inv => !inv.used_at && new Date(inv.expires_at) > new Date()).length || 0}
              </p>
            </div>
            <Mail className="w-8 h-8 text-text-medium" />
          </div>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="text"
              placeholder="Search employees..."
              className="w-full pl-10 pr-4 py-2 border border-background-dark rounded-lg focus:ring-2 focus:ring-primary-default focus:border-primary-default"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Role Filter */}
          <select
            className="px-3 py-2 border border-background-dark rounded-lg focus:ring-2 focus:ring-primary-default focus:border-primary-default"
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
          >
            <option key="all" value="all">All Roles</option>
            <option key="admin" value="admin">Admin</option>
            <option key="manager" value="manager">Manager</option>
            <option key="employee" value="employee">Employee</option>
          </select>

          {/* Status Filter */}
          <select
            className="px-3 py-2 border border-background-dark rounded-lg focus:ring-2 focus:ring-primary-default focus:border-primary-default"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option key="all" value="all">All Status</option>
            <option key="active" value="active">Active</option>
            <option key="pending" value="pending">Pending</option>
            <option key="inactive" value="inactive">Inactive</option>
          </select>

          {/* Department Filter */}
          <select
            className="px-3 py-2 border border-background-dark rounded-lg focus:ring-2 focus:ring-primary-default focus:border-primary-default"
            value={filterDepartment}
            onChange={(e) => setFilterDepartment(e.target.value)}
          >
            <option value="all">All Departments</option>
            {departments.map(dept => (
              <option key={dept.id} value={dept.id}>{dept.name}</option>
            ))}
          </select>
        </div>
      </Card>

      {/* Employee List */}
      <Card>
        <div className="overflow-x-auto" style={{ position: 'relative' }}>
          <table className="w-full">
            <thead>
              <tr className="border-b border-background-dark">
                <th className="text-left py-3 px-4 font-medium text-text-dark">Employee</th>
                <th className="text-left py-3 px-4 font-medium text-text-dark">Role</th>
                <th className="text-left py-3 px-4 font-medium text-text-dark">Department</th>
                <th className="text-left py-3 px-4 font-medium text-text-dark">Status</th>
                <th className="text-left py-3 px-4 font-medium text-text-dark">Joined</th>
                <th className="text-left py-3 px-4 font-medium text-text-dark">Invited By</th>
                <th className="text-right py-3 px-4 font-medium text-text-dark">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-8">
                    <LoadingSpinner />
                  </td>
                </tr>
              ) : filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-text-light">
                    No employees found matching your criteria
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((employee) => (
                  <EmployeeRow 
                    key={employee.id} 
                    employee={employee}
                    departments={departments}
                    onUpdateRole={updateEmployeeRole}
                    onRemove={removeEmployee}
                    getRoleIcon={getRoleIcon}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Pending Invitations */}
      {invitations && invitations.length > 0 && (
        <Card>
          <div className="p-4 border-b border-background-dark">
            <h3 className="text-lg font-semibold text-text-dark">Pending Invitations</h3>
          </div>
          <div className="divide-y divide-background-dark">
            {invitations.map((invitation) => (
              <InvitationRow
                key={invitation.id}
                invitation={invitation}
                onResend={resendInvitation}
                onDelete={deleteInvitation}
              />
            ))}
          </div>
        </Card>
      )}

      {/* Unified Invite/Add User Modal */}
      <InviteEmployeeModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        onInvite={inviteEmployee}
        onCreate={createUserDirect}
        departments={departments}
        loading={loading}
      />
    </div>
  )
}

// Employee Row Component
function EmployeeRow({ employee, departments, onUpdateRole, onRemove, getRoleIcon }) {
  const [showActions, setShowActions] = useState(false)
  const [showRoleEdit, setShowRoleEdit] = useState(false)
  const [newRole, setNewRole] = useState(employee.role)
  const actionsRef = useRef(null)
  const buttonRef = useRef(null)
  const { user } = useAuthStore()
  const { canManageEmployees, userRole } = useCorporatePermissions()

  const RoleIcon = getRoleIcon(employee.role)
  
  // Check if current user can change roles
  // Allow owner, corporate_admin, admin, manager, or system_admin to change roles
  // But prevent changing the owner's role
  const canChangeRole = canManageEmployees && userRole && [
    'owner',
    'corporate_admin', 
    'admin', 
    'manager',
    'system_admin'
  ].includes(userRole)
  
  // Check if this employee is the organization owner
  const isOrganizationOwner = employee.role === 'owner'
  
  // Check if this is the current user
  const isCurrentUser = user?.id && (employee.user_id === user.id || employee.id === user.id)

  const handleRoleUpdate = async () => {
    try {
      // Check permissions
      if (!canChangeRole) {
        toast.error('You do not have permission to change roles')
        return
      }
      
      // Prevent changing organization owner's role
      if (isOrganizationOwner) {
        toast.error('Cannot change the organization owner\'s role. The owner role is permanent.')
        setShowRoleEdit(false)
        return
      }
      
      // Prevent users from changing their own role (security measure)
      if (isCurrentUser) {
        const confirm = window.confirm(
          'You are about to change your own role. This may affect your access to the platform. Are you sure you want to continue?'
        )
        if (!confirm) {
          setShowRoleEdit(false)
          return
        }
      }
      
      // Validate employee ID before updating
      if (!employee.id || employee.id === 'undefined') {
        console.error('Invalid employee ID');
        return;
      }
      await onUpdateRole(employee.id, newRole)
      setShowRoleEdit(false)
      toast.success('Role updated successfully')
    } catch (error) {
      console.error('Failed to update role:', error)
      toast.error('Failed to update role: ' + (error.message || 'Unknown error'))
    }
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (actionsRef.current && !actionsRef.current.contains(event.target) && 
          buttonRef.current && !buttonRef.current.contains(event.target)) {
        setShowActions(false)
      }
    }

    if (showActions) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showActions])

  return (
    <tr className="border-b border-background-light hover:bg-background-light">
      <td className="py-3 px-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary-light rounded-full flex items-center justify-center">
            {employee.avatar_url ? (
              <img 
                src={employee.avatar_url} 
                alt={employee.full_name || employee.first_name || 'User'}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <span className="text-primary-default font-medium">
                {(employee.first_name?.[0] || employee.email?.[0] || 'U').toUpperCase()}
              </span>
            )}
          </div>
          <div>
            <p className="font-medium text-text-dark">
              {employee.full_name || `${employee.first_name || ''} ${employee.last_name || ''}`.trim() || 'Unknown User'}
            </p>
            <p className="text-sm text-text-light">{employee.email || 'No email'}</p>
          </div>
        </div>
      </td>
      
      <td className="py-3 px-4">
        {showRoleEdit ? (
          <div className="flex items-center gap-2">
            <select
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
              className="px-2 py-1 border border-background-dark rounded text-sm"
            >
              <option value="employee">Employee</option>
              <option value="manager">Manager</option>
              <option value="admin">Admin</option>
            </select>
            <Button size="sm" onClick={handleRoleUpdate}>Save</Button>
            <Button variant="ghost" size="sm" onClick={() => setShowRoleEdit(false)}>
              Cancel
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            {isOrganizationOwner ? (
              <Crown className="w-4 h-4 text-yellow-600" />
            ) : (
              <RoleIcon className="w-4 h-4 text-text-medium" />
            )}
            <span className="capitalize text-text-dark">
              {isOrganizationOwner ? 'Owner' : employee.role}
            </span>
          </div>
        )}
      </td>
      
      <td className="py-3 px-4">
        <span className="text-text-light">
          {departments.find(dept => dept.id === employee.department_id)?.name || 'No department'}
        </span>
      </td>
      
      <td className="py-3 px-4">
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(employee.status)}`}>
          {employee.status}
        </span>
      </td>
      
      <td className="py-3 px-4 text-text-light">
        {employee.joined_at ? new Date(employee.joined_at).toLocaleDateString() : '-'}
      </td>
      
      <td className="py-3 px-4 text-text-light">
        {employee.invited_by_user?.email || '-'}
      </td>
      
      <td className="py-3 px-4 text-right">
        <div className="relative">
          <Button
            ref={buttonRef}
            variant="ghost"
            size="sm"
            onClick={() => setShowActions(!showActions)}
          >
            <MoreVertical className="w-4 h-4" />
          </Button>
          
          {showActions && (
            <div 
              ref={actionsRef}
              className="absolute right-0 top-8 w-48 bg-white border border-background-dark rounded-lg shadow-xl z-[9999]"
              style={{ position: 'absolute' }}
            >
              {canChangeRole && !isOrganizationOwner && (
                <button
                  onClick={() => {
                    setShowRoleEdit(true)
                    setShowActions(false)
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-background-light flex items-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Change Role
                </button>
              )}
              {isOrganizationOwner && (
                <div className="px-4 py-2 text-xs text-text-light border-b border-background-light">
                  <Crown className="w-3 h-3 inline mr-1" />
                  Organization Owner
                </div>
              )}
              {canManageEmployees && !isCurrentUser && !isOrganizationOwner && (
                <button
                  onClick={() => {
                    onRemove(employee.id)
                    setShowActions(false)
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-background-light text-error-default flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Remove Employee
                </button>
              )}
              {!canChangeRole && !canManageEmployees && (
                <div className="px-4 py-2 text-xs text-text-light">
                  No actions available
                </div>
              )}
            </div>
          )}
        </div>
      </td>
    </tr>
  )
}

// Invitation Row Component
function InvitationRow({ invitation, onResend, onDelete }) {
  const isExpired = new Date(invitation.expires_at) < new Date()
  const isUsed = !!invitation.used_at

  return (
    <div className="p-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-warning-light rounded-full flex items-center justify-center">
          <Mail className="w-4 h-4 text-warning-default" />
        </div>
        <div>
          <p className="font-medium text-text-dark">{invitation.email}</p>
          <p className="text-sm text-text-light">
            Role: {invitation.role} • 
            Expires: {new Date(invitation.expires_at).toLocaleDateString()}
            {isExpired && <span className="text-error-default ml-2">(Expired)</span>}
            {isUsed && <span className="text-success-default ml-2">(Used)</span>}
          </p>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        {!isUsed && (
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onResend(invitation.id)}
            >
              <RefreshCw className="w-4 h-4 mr-1" />
              Resend
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(invitation.id)}
              className="text-error-default hover:text-error-default"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </>
        )}
      </div>
    </div>
  )
}

// Unified Invite/Add User Modal Component with Tabs
function InviteEmployeeModal({ isOpen, onClose, onInvite, onCreate, departments, loading }) {
  const [activeTab, setActiveTab] = useState('invite') // 'invite' or 'direct'
  const { fetchEmployees } = useCorporateStore()
  
  // Invite form state
  const [inviteFormData, setInviteFormData] = useState({
    email: '',
    role: 'employee'
  })
  const [inviteErrors, setInviteErrors] = useState({})
  
  // Direct create form state
  const [directFormData, setDirectFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    role: 'employee',
    departmentId: ''
  })
  const [directErrors, setDirectErrors] = useState({})
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const handleInviteSubmit = async (e) => {
    e.preventDefault()
    
    const newErrors = {}
    if (!inviteFormData.email) newErrors.email = 'Email is required'
    if (!inviteFormData.email.includes('@')) newErrors.email = 'Valid email is required'
    
    if (Object.keys(newErrors).length > 0) {
      setInviteErrors(newErrors)
      return
    }

    try {
      await onInvite(inviteFormData.email, inviteFormData.role)
      setInviteFormData({ email: '', role: 'employee' })
      setInviteErrors({})
      onClose()
    } catch (error) {
      setInviteErrors({ submit: error.message })
    }
  }

  const handleDirectSubmit = async (e) => {
    e.preventDefault()
    
    const newErrors = {}
    if (!directFormData.email) newErrors.email = 'Email is required'
    if (!directFormData.email.includes('@')) newErrors.email = 'Valid email is required'
    
    if (directFormData.password) {
      if (directFormData.password.length < 6) {
        newErrors.password = 'Password must be at least 6 characters'
      } else if (directFormData.password !== directFormData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match'
      }
    }
    
    if (!directFormData.firstName) newErrors.firstName = 'First name is required'
    
    if (Object.keys(newErrors).length > 0) {
      setDirectErrors(newErrors)
      return
    }

    try {
      await onCreate({
        email: directFormData.email,
        password: directFormData.password || undefined,
        firstName: directFormData.firstName,
        lastName: directFormData.lastName,
        role: directFormData.role,
        departmentId: directFormData.departmentId || null
      })
      await fetchEmployees()
      setDirectFormData({ 
        email: '', 
        password: '', 
        confirmPassword: '',
        firstName: '', 
        lastName: '',
        role: 'employee',
        departmentId: ''
      })
      setDirectErrors({})
      onClose()
    } catch (error) {
      setDirectErrors({ submit: error.message })
    }
  }

  const handleClose = () => {
    setInviteFormData({ email: '', role: 'employee' })
    setInviteErrors({})
    setDirectFormData({ 
      email: '', 
      password: '', 
      confirmPassword: '',
      firstName: '', 
      lastName: '',
      role: 'employee',
      departmentId: ''
    })
    setDirectErrors({})
    setActiveTab('invite')
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Add Team Member">
      {/* Tab Switcher */}
      <div className="flex border-b border-background-dark mb-6">
        <button
          type="button"
          onClick={() => setActiveTab('invite')}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
            activeTab === 'invite'
              ? 'border-primary-default text-primary-default'
              : 'border-transparent text-text-light hover:text-text-dark'
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <Mail className="w-4 h-4" />
            <span>Invite by Email</span>
          </div>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('direct')}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
            activeTab === 'direct'
              ? 'border-primary-default text-primary-default'
              : 'border-transparent text-text-light hover:text-text-dark'
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <UserPlus className="w-4 h-4" />
            <span>Add User Directly</span>
          </div>
        </button>
      </div>

      {/* Invite Tab Content */}
      {activeTab === 'invite' && (
        <form onSubmit={handleInviteSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-dark mb-2">
              Email Address *
            </label>
            <input
              type="email"
              required
              className="w-full p-3 border border-background-dark rounded-lg focus:ring-2 focus:ring-primary-default focus:border-primary-default"
              value={inviteFormData.email}
              onChange={(e) => setInviteFormData({ ...inviteFormData, email: e.target.value })}
              placeholder="employee@company.com"
            />
            {inviteErrors.email && (
              <p className="text-error-default text-sm mt-1">{inviteErrors.email}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-text-dark mb-2">
              Role
            </label>
            <select
              className="w-full p-3 border border-background-dark rounded-lg focus:ring-2 focus:ring-primary-default focus:border-primary-default"
              value={inviteFormData.role}
              onChange={(e) => setInviteFormData({ ...inviteFormData, role: e.target.value })}
            >
              <option value="employee">Employee</option>
              <option value="manager">Manager</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {inviteErrors.submit && (
            <div className="p-3 bg-error-light border border-error-default rounded-lg">
              <p className="text-error-default text-sm">{inviteErrors.submit}</p>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="ghost" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Sending...' : 'Send Invitation'}
            </Button>
          </div>
        </form>
      )}

      {/* Direct Add Tab Content */}
      {activeTab === 'direct' && (
        <form onSubmit={handleDirectSubmit} className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> If the user doesn't exist, a new account will be created with the password you set. If the user already exists (but isn't in this organization), they will be added to your organization and their existing password will remain unchanged.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-dark mb-2">
                First Name *
              </label>
              <input
                type="text"
                required
                className="w-full p-3 border border-background-dark rounded-lg focus:ring-2 focus:ring-primary-default focus:border-primary-default"
                value={directFormData.firstName}
                onChange={(e) => setDirectFormData({ ...directFormData, firstName: e.target.value })}
                placeholder="John"
              />
              {directErrors.firstName && (
                <p className="text-error-default text-sm mt-1">{directErrors.firstName}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-text-dark mb-2">
                Last Name
              </label>
              <input
                type="text"
                className="w-full p-3 border border-background-dark rounded-lg focus:ring-2 focus:ring-primary-default focus:border-primary-default"
                value={directFormData.lastName}
                onChange={(e) => setDirectFormData({ ...directFormData, lastName: e.target.value })}
                placeholder="Doe"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-dark mb-2">
              Email Address *
            </label>
            <input
              type="email"
              required
              className="w-full p-3 border border-background-dark rounded-lg focus:ring-2 focus:ring-primary-default focus:border-primary-default"
              value={directFormData.email}
              onChange={(e) => setDirectFormData({ ...directFormData, email: e.target.value })}
              placeholder="employee@company.com"
            />
            {directErrors.email && (
              <p className="text-error-default text-sm mt-1">{directErrors.email}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-text-dark mb-2">
              Password {directFormData.password ? '*' : '(Optional - only for new users)'}
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                className="w-full p-3 border border-background-dark rounded-lg focus:ring-2 focus:ring-primary-default focus:border-primary-default pr-10"
                value={directFormData.password}
                onChange={(e) => setDirectFormData({ ...directFormData, password: e.target.value })}
                placeholder="Set a password for new users (min 6 characters)"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-light hover:text-text-dark"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-xs text-text-light mt-1">
              Leave blank if user already exists - their existing password will be preserved
            </p>
            {directErrors.password && (
              <p className="text-error-default text-sm mt-1">{directErrors.password}</p>
            )}
          </div>

          {directFormData.password && (
            <div>
              <label className="block text-sm font-medium text-text-dark mb-2">
                Confirm Password *
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  className="w-full p-3 border border-background-dark rounded-lg focus:ring-2 focus:ring-primary-default focus:border-primary-default pr-10"
                  value={directFormData.confirmPassword}
                  onChange={(e) => setDirectFormData({ ...directFormData, confirmPassword: e.target.value })}
                  placeholder="Confirm password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-light hover:text-text-dark"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {directErrors.confirmPassword && (
                <p className="text-error-default text-sm mt-1">{directErrors.confirmPassword}</p>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-dark mb-2">
                Role
              </label>
              <select
                className="w-full p-3 border border-background-dark rounded-lg focus:ring-2 focus:ring-primary-default focus:border-primary-default"
                value={directFormData.role}
                onChange={(e) => setDirectFormData({ ...directFormData, role: e.target.value })}
              >
                <option value="employee">Employee</option>
                <option value="manager">Manager</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-dark mb-2">
                Department
              </label>
              <select
                className="w-full p-3 border border-background-dark rounded-lg focus:ring-2 focus:ring-primary-default focus:border-primary-default"
                value={directFormData.departmentId}
                onChange={(e) => setDirectFormData({ ...directFormData, departmentId: e.target.value })}
              >
                <option value="">No Department</option>
                {departments?.map(dept => (
                  <option key={dept.id} value={dept.id}>{dept.name}</option>
                ))}
              </select>
            </div>
          </div>

          {directErrors.submit && (
            <div className="p-3 bg-error-light border border-error-default rounded-lg">
              <p className="text-error-default text-sm">{directErrors.submit}</p>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="ghost" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create User'}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  )
}

function getStatusColor(status) {
  switch (status) {
    case 'active': return 'text-success-default bg-success-light'
    case 'pending': return 'text-warning-default bg-warning-light'
    case 'inactive': return 'text-text-muted bg-background-medium'
    default: return 'text-text-muted bg-background-medium'
  }
}