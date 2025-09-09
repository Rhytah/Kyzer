// src/components/corporate/EmployeeManagement.jsx
import { useState, useEffect } from 'react'
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
  Edit
} from 'lucide-react'
import { useCorporateStore, useEmployees, useCurrentCompany, useDepartments, useInvitations } from '@/store/corporateStore'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Modal from '@/components/ui/Modal'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

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
      case 'admin': return Crown
      case 'manager': return ShieldCheck
      default: return Shield
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
        
        <Button onClick={() => setShowInviteModal(true)}>
          <UserPlus className="w-4 h-4 mr-2" />
          Invite Employee
        </Button>
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
            <option value="all">All Roles</option>
            <option value="admin">Admin</option>
            <option value="manager">Manager</option>
            <option value="employee">Employee</option>
          </select>

          {/* Status Filter */}
          <select
            className="px-3 py-2 border border-background-dark rounded-lg focus:ring-2 focus:ring-primary-default focus:border-primary-default"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="inactive">Inactive</option>
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
        <div className="overflow-x-auto">
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

      {/* Invite Employee Modal */}
      <InviteEmployeeModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        onInvite={inviteEmployee}
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

  const RoleIcon = getRoleIcon(employee.role)

  const handleRoleUpdate = async () => {
    try {
      await onUpdateRole(employee.id, newRole)
      setShowRoleEdit(false)
    } catch (error) {
      console.error('Failed to update role:', error)
    }
  }

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
            <RoleIcon className="w-4 h-4 text-text-medium" />
            <span className="capitalize text-text-dark">{employee.role}</span>
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
            variant="ghost"
            size="sm"
            onClick={() => setShowActions(!showActions)}
          >
            <MoreVertical className="w-4 h-4" />
          </Button>
          
          {showActions && (
            <div className="absolute right-0 top-8 w-48 bg-white border border-background-dark rounded-lg shadow-lg z-10">
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

// Invite Employee Modal Component
function InviteEmployeeModal({ isOpen, onClose, onInvite, loading }) {
  const [formData, setFormData] = useState({
    email: '',
    role: 'employee'
  })
  const [errors, setErrors] = useState({})

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Basic validation
    const newErrors = {}
    if (!formData.email) newErrors.email = 'Email is required'
    if (!formData.email.includes('@')) newErrors.email = 'Valid email is required'
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    try {
      await onInvite(formData.email, formData.role)
      setFormData({ email: '', role: 'employee' })
      setErrors({})
      onClose()
    } catch (error) {
      setErrors({ submit: error.message })
    }
  }

  const handleClose = () => {
    setFormData({ email: '', role: 'employee' })
    setErrors({})
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Invite Employee">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-text-dark mb-2">
            Email Address *
          </label>
          <input
            type="email"
            required
            className="w-full p-3 border border-background-dark rounded-lg focus:ring-2 focus:ring-primary-default focus:border-primary-default"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="employee@company.com"
          />
          {errors.email && (
            <p className="text-error-default text-sm mt-1">{errors.email}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-text-dark mb-2">
            Role
          </label>
          <select
            className="w-full p-3 border border-background-dark rounded-lg focus:ring-2 focus:ring-primary-default focus:border-primary-default"
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
          >
            <option value="employee">Employee</option>
            <option value="manager">Manager</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        {errors.submit && (
          <div className="p-3 bg-error-light border border-error-default rounded-lg">
            <p className="text-error-default text-sm">{errors.submit}</p>
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