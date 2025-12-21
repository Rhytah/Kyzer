import { useState, useEffect } from "react";
import {
  UserPlus,
  Search,
  Filter,
  Download,
  Mail,
  MoreVertical,
  Edit,
  Trash2,
  Award,
  BookOpen,
  Clock,
  CheckCircle,
  XCircle,
  Users,
  Upload,
  Shield,
  ShieldCheck,
  Crown,
  RefreshCw,
  AlertCircle,
  GraduationCap,
  UserCog
} from "lucide-react";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Modal from "../../components/ui/Modal";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import CompanySetup from "../../components/corporate/CompanySetup";
import DatabaseDebug from "../../components/corporate/DatabaseDebug";
import toast from "react-hot-toast";
import { useCorporateStore, useEmployees, useCurrentCompany, useDepartments, useInvitations } from "../../store/corporateStore";

const EmployeeManagement = () => {
  const currentCompany = useCurrentCompany()
  const employees = useEmployees()
  const departments = useDepartments()
  const invitations = useInvitations()
  
  // Debug: Log invitations changes
  useEffect(() => {
    console.log("Invitations updated in component:", invitations?.length || 0, "invitations");
  }, [invitations]);
  const { 
    fetchEmployees,
    fetchInvitations,
    fetchDepartments,
    fetchCurrentCompany,
    inviteEmployee,
    updateEmployeeRole,
    removeEmployee,
    resendInvitation,
    deleteInvitation,
    createDepartment,
    updateDepartment,
    deleteDepartment,
    loading,
    error 
  } = useCorporateStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRole, setFilterRole] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterDepartment, setFilterDepartment] = useState('all')
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [selectedEmployees, setSelectedEmployees] = useState(new Set())
  const [selectedInvitations, setSelectedInvitations] = useState([])
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [invitationToDelete, setInvitationToDelete] = useState(null)
  const [activeView, setActiveView] = useState('employees') // 'employees', 'invitations', or 'departments'
  const [inviteForm, setInviteForm] = useState({
    email: '',
    role: 'learner',
    departmentId: '',
    customMessage: ''
  })
  const [showDepartmentModal, setShowDepartmentModal] = useState(false)
  const [editingDepartment, setEditingDepartment] = useState(null)
  const [departmentForm, setDepartmentForm] = useState({
    name: '',
    description: '',
    manager_id: ''
  })
  const [errors, setErrors] = useState({})
  useEffect(() => {
    const loadData = async () => {
      try {
        // Ensure we have a current company first
        await fetchCurrentCompany()
        // Then fetch other data
        await Promise.all([
          fetchEmployees(),
          fetchInvitations(),
          fetchDepartments()
        ])
      } catch (error) {
        console.error('Failed to load data:', error)
      }
    }
    
    loadData()
  }, [])
  // Filter employees based on search and filters
  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = searchTerm === '' || 
                         employee.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.job_title?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesRole = filterRole === 'all' || employee.role === filterRole
    const matchesStatus = filterStatus === 'all' || employee.status === filterStatus
    const matchesDepartment = filterDepartment === 'all' || employee.department_id === filterDepartment
    
    return matchesSearch && matchesRole && matchesStatus && matchesDepartment
  })

  // Filter invitations based on search and filters
  const filteredInvitations = invitations.filter(invitation => {
    const matchesSearch = searchTerm === '' || 
                         invitation.email?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesRole = filterRole === 'all' || invitation.role === filterRole
    const matchesStatus = filterStatus === 'all' || invitation.status === filterStatus
    const matchesDepartment = filterDepartment === 'all' || invitation.department_id === filterDepartment
    
    return matchesSearch && matchesRole && matchesStatus && matchesDepartment
  })

  // Filter departments based on search
  const filteredDepartments = departments.filter(department => {
    const matchesSearch = searchTerm === '' || 
                         department.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         department.description?.toLowerCase().includes(searchTerm.toLowerCase())
    
    return matchesSearch
  })

  // Get current filtered data based on active view
  const currentData = activeView === 'employees' ? filteredEmployees : 
                     activeView === 'invitations' ? filteredInvitations : 
                     filteredDepartments
  const handleInviteEmployee = async (e) => {
    e.preventDefault()
    
    // Basic validation
    const newErrors = {}
    if (!inviteForm.email) newErrors.email = 'Email is required'
    if (!inviteForm.email.includes('@')) newErrors.email = 'Valid email is required'
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    try {
      // Check if we have a current company
      if (!currentCompany) {
        setErrors({ submit: 'No company found. Please ensure you are associated with a company before inviting users.' })
        return
      }

      await inviteEmployee(
        inviteForm.email,
        inviteForm.role,
        inviteForm.departmentId || null,
        inviteForm.customMessage || null
      )
      setInviteForm({ email: '', role: 'learner', departmentId: '', customMessage: '' })
      setErrors({})
      setShowInviteModal(false)
      toast.success('Invitation sent successfully!')
    } catch (error) {
      setErrors({ submit: error.message })
      toast.error('Failed to send invitation: ' + error.message)
    }
  }

  const handleSelectEmployee = (employeeId) => {
    const newSelected = new Set(selectedEmployees);
    if (newSelected.has(employeeId)) {
      newSelected.delete(employeeId);
    } else {
      newSelected.add(employeeId);
    }
    setSelectedEmployees(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedEmployees.size === filteredEmployees.length) {
      setSelectedEmployees(new Set());
    } else {
      setSelectedEmployees(new Set(filteredEmployees.map((emp) => emp.id)));
    }
  };

  // Enhanced invitation delete functionality
  const handleDeleteInvitation = async (invitationId) => {
    try {
      await deleteInvitation(invitationId)
      setSelectedInvitations(prev => prev.filter(id => id !== invitationId))
    } catch (error) {
      console.error('Failed to delete invitation:', error)
    }
  }

  const handleBulkDeleteInvitations = async () => {
    try {
      for (const invitationId of selectedInvitations) {
        await deleteInvitation(invitationId)
      }
      setSelectedInvitations([])
    } catch (error) {
      console.error('Failed to bulk delete invitations:', error)
    }
  }

  const confirmDeleteInvitation = (invitation) => {
    setInvitationToDelete(invitation)
    setShowDeleteConfirm(true)
  }

  const executeDeleteInvitation = async () => {
    if (invitationToDelete) {
      await handleDeleteInvitation(invitationToDelete.id)
      setShowDeleteConfirm(false)
      setInvitationToDelete(null)
    }
  }

  const toggleInvitationSelection = (invitationId) => {
    setSelectedInvitations(prev => 
      prev.includes(invitationId) 
        ? prev.filter(id => id !== invitationId)
        : [...prev, invitationId]
    )
  }

  const selectAllInvitations = () => {
    setSelectedInvitations(filteredInvitations.map(inv => inv.id))
  }

  const clearInvitationSelection = () => {
    setSelectedInvitations([])
  }

  // Department management functions
  const handleCreateDepartment = async (e) => {
    e.preventDefault()
    
    const newErrors = {}
    if (!departmentForm.name.trim()) newErrors.name = 'Department name is required'
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    try {
      // Ensure manager_id is a valid UUID or null
      let managerId = departmentForm.manager_id || null
      if (managerId && !managerId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
        // If manager_id is not a valid UUID, find the employee by display name
        const selectedEmployee = employees.find(emp => {
          const displayName = emp.full_name || 
            `${emp.first_name || ''} ${emp.last_name || ''}`.trim() || 
            emp.email || 'Unknown User'
          const roleDisplay = emp.role?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
          return `${displayName} - ${roleDisplay}` === managerId
        })
        managerId = selectedEmployee?.id || null
      }
      
      await createDepartment({
        name: departmentForm.name.trim(),
        description: departmentForm.description.trim() || null,
        manager_id: managerId
      })
      setDepartmentForm({ name: '', description: '', manager_id: '' })
      setErrors({})
      setShowDepartmentModal(false)
      setEditingDepartment(null)
    } catch (error) {
      setErrors({ submit: error.message })
    }
  }

  const handleEditDepartment = (department) => {
    setEditingDepartment(department)
    setDepartmentForm({
      name: department.name,
      description: department.description || '',
      manager_id: department.manager_id || ''
    })
    setShowDepartmentModal(true)
  }

  const handleUpdateDepartment = async (e) => {
    e.preventDefault()
    
    const newErrors = {}
    if (!departmentForm.name.trim()) newErrors.name = 'Department name is required'
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    try {
      // Ensure manager_id is a valid UUID or null
      let managerId = departmentForm.manager_id || null
      if (managerId && !managerId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
        // If manager_id is not a valid UUID, find the employee by display name
        const selectedEmployee = employees.find(emp => {
          const displayName = emp.full_name || 
            `${emp.first_name || ''} ${emp.last_name || ''}`.trim() || 
            emp.email || 'Unknown User'
          const roleDisplay = emp.role?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
          return `${displayName} - ${roleDisplay}` === managerId
        })
        managerId = selectedEmployee?.id || null
      }
      
      await updateDepartment(editingDepartment.id, {
        name: departmentForm.name.trim(),
        description: departmentForm.description.trim() || null,
        manager_id: managerId
      })
      setDepartmentForm({ name: '', description: '', manager_id: '' })
      setErrors({})
      setShowDepartmentModal(false)
      setEditingDepartment(null)
    } catch (error) {
      setErrors({ submit: error.message })
    }
  }

  const handleDeleteDepartment = async (departmentId) => {
    if (window.confirm('Are you sure you want to delete this department? This action cannot be undone.')) {
      try {
        await deleteDepartment(departmentId)
      } catch (error) {
        // Error is handled by the store and shown via toast
      }
    }
  }

  const handleCloseDepartmentModal = () => {
    setDepartmentForm({ name: '', description: '', manager_id: '' })
    setErrors({})
    setShowDepartmentModal(false)
    setEditingDepartment(null)
  }

  const getRoleIcon = (role) => {
    switch (role) {
      case 'corporate_admin': return UserCog
      case 'instructor': return BookOpen
      case 'system_admin': return Settings
      case 'learner': return GraduationCap
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

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
          <LoadingSpinner size="lg" />
      </div>
    )
  }

  // Show company setup if no company is associated
  if (!currentCompany) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-text-dark mb-2">Employee Management</h2>
          <p className="text-text-light">Set up your company to start managing employees</p>
        </div>
        <CompanySetup />
        <DatabaseDebug />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-semibold text-text-dark">Employee Management</h2>
          <p className="text-text-light">
            {activeView === 'employees' 
              ? `Manage your team of ${employees.length} employees`
              : activeView === 'invitations'
              ? `Manage ${invitations.length} pending invitations`
              : `Manage ${departments.length} departments`
            }
          </p>
          {currentCompany ? (
            <p className="text-sm text-success-default mt-1">
              ✓ Company: {currentCompany.name}
            </p>
          ) : (
            <p className="text-sm text-error-default mt-1">
              ⚠ No company associated. Please contact support.
            </p>
          )}
        </div>
        
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost"
            onClick={() => fetchCurrentCompany()}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          {activeView === 'employees' && (
            <Button 
              onClick={() => setShowInviteModal(true)}
              disabled={!currentCompany}
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Invite Employee
            </Button>
          )}
          {activeView === 'departments' && (
            <Button 
              onClick={() => setShowDepartmentModal(true)}
              disabled={!currentCompany}
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Create Department
            </Button>
          )}
        </div>
      </div>

      {/* View Toggle */}
      <div className="flex bg-background-light rounded-lg p-1 w-fit">
        <button
          onClick={() => setActiveView('employees')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeView === 'employees'
              ? 'bg-white text-text-dark shadow-sm'
              : 'text-text-light hover:text-text-dark'
          }`}
        >
          <Users className="w-4 h-4 inline mr-2" />
          Employees ({employees.length})
        </button>
        <button
          onClick={() => setActiveView('invitations')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeView === 'invitations'
              ? 'bg-white text-text-dark shadow-sm'
              : 'text-text-light hover:text-text-dark'
          }`}
        >
          <Mail className="w-4 h-4 inline mr-2" />
          Invitations ({invitations.length})
        </button>
        <button
          onClick={() => setActiveView('departments')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeView === 'departments'
              ? 'bg-white text-text-dark shadow-sm'
              : 'text-text-light hover:text-text-dark'
          }`}
        >
          <Shield className="w-4 h-4 inline mr-2" />
          Departments ({departments.length})
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {activeView === 'employees' ? (
          <>
            <Card key="total-employees" className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-text-light">Total Employees</p>
                  <p className="text-2xl font-bold text-text-dark">{employees.length}</p>
                </div>
                <Users className="w-8 h-8 text-primary-default" />
              </div>
            </Card>
            
            <Card key="active-employees" className="p-4">
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
            
            <Card key="pending-employees" className="p-4">
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
            
            <Card key="admin-employees" className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-text-light">Admins</p>
                  <p className="text-2xl font-bold text-text-medium">
                    {employees.filter(e => e.role === 'corporate_admin').length}
                  </p>
                </div>
                <Shield className="w-8 h-8 text-text-medium" />
              </div>
            </Card>
          </>
        ) : activeView === 'invitations' ? (
          <>
          
            
            <Card key="total-invitations" className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-text-light">Total Invitations</p>
                  <p className="text-2xl font-bold text-text-dark">{invitations.length}</p>
                </div>
                <Mail className="w-8 h-8 text-primary-default" />
              </div>
            </Card>
            
            <Card key="pending-invitations" className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-text-light">Pending</p>
                  <p className="text-2xl font-bold text-warning-default">
                    {invitations.filter(inv => inv.status === 'pending').length}
                  </p>
                </div>
                <Clock className="w-8 h-8 text-warning-default" />
              </div>
            </Card>
            
            <Card key="accepted-invitations" className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-text-light">Accepted</p>
                  <p className="text-2xl font-bold text-success-default">
                    {invitations.filter(inv => inv.status === 'accepted').length}
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-success-default" />
              </div>
            </Card>
            
            <Card key="expired-invitations" className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-text-light">Expired</p>
                  <p className="text-2xl font-bold text-error-default">
                    {invitations.filter(inv => new Date(inv.expires_at) < new Date()).length}
                  </p>
                </div>
                <XCircle className="w-8 h-8 text-error-default" />
              </div>
            </Card>

           
          </>
        ) : activeView === 'departments' ? (
          <>
            <Card key="total-departments" className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-text-light">Total Departments</p>
                  <p className="text-2xl font-bold text-text-dark">{departments.length}</p>
                </div>
                <Shield className="w-8 h-8 text-primary-default" />
              </div>
            </Card>
            
            <Card key="departments-with-managers" className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-text-light">With Managers</p>
                  <p className="text-2xl font-bold text-success-default">
                    {departments.filter(dept => dept.manager_id).length}
                  </p>
                </div>
                <UserCog className="w-8 h-8 text-success-default" />
              </div>
            </Card>
            
            <Card key="departments-with-employees" className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-text-light">With Employees</p>
                  <p className="text-2xl font-bold text-warning-default">
                    {departments.filter(dept => 
                      employees.some(emp => emp.department_id === dept.id)
                    ).length}
                  </p>
                </div>
                <Users className="w-8 h-8 text-warning-default" />
              </div>
            </Card>
            
            <Card key="empty-departments" className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-text-light">Empty Departments</p>
                  <p className="text-2xl font-bold text-text-medium">
                    {departments.filter(dept => 
                      !employees.some(emp => emp.department_id === dept.id)
                    ).length}
                  </p>
                </div>
                <AlertCircle className="w-8 h-8 text-text-medium" />
              </div>
            </Card>
          </>
        ) : null}
      </div>

      {/* Filters and Search */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="text"
              placeholder={
                activeView === 'employees' ? "Search employees..." : 
                activeView === 'invitations' ? "Search invitations..." :
                "Search departments..."
              }
              className="w-full pl-10 pr-4 py-2 border border-background-dark rounded-lg focus:ring-2 focus:ring-primary-default focus:border-primary-default"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Role Filter - only show for employees and invitations */}
          {activeView !== 'departments' && (
            <select
              className="px-3 py-2 border border-background-dark rounded-lg focus:ring-2 focus:ring-primary-default focus:border-primary-default"
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
            >
              <option value="all">All Roles</option>
              <option value="learner">Learner (Individual)</option>
              <option value="corporate_admin">Corporate Admin</option>
              <option value="instructor">Instructor (Optional)</option>
              <option value="system_admin">System Admin</option>
            </select>
          )}

          {/* Status Filter - only show for employees and invitations */}
          {activeView !== 'departments' && (
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
          )}

          {/* Department Filter - only show for employees and invitations */}
          {activeView !== 'departments' && (
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
          )}
        </div>
      </Card>
 {/* Bulk Actions for Invitations */}
 {selectedInvitations.length > 0 && (
              <Card className="p-4 bg-blue-50 border-blue-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-blue-800 font-medium">
                      {selectedInvitations.length} invitation(s) selected
                    </span>
                    <Button 
                      variant="outline" 
                      onClick={clearInvitationSelection}
                      size="sm"
                    >
                      Clear Selection
                    </Button>
                  </div>
                  <Button 
                    variant="destructive" 
                    onClick={handleBulkDeleteInvitations}
                    size="sm"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Selected
                  </Button>
                </div>
              </Card>
            )}
      {/* Data List */}
      <Card>
        <div className="overflow-x-auto" style={{ position: 'relative' }}>
          <table className="w-full">
            <thead>
              <tr className="border-b border-background-dark">
                {activeView === 'employees' ? (
                  <>
                    <th className="text-left py-3 px-4 font-medium text-text-dark">Employee</th>
                    <th className="text-left py-3 px-4 font-medium text-text-dark">Role</th>
                    <th className="text-left py-3 px-4 font-medium text-text-dark">Department</th>
                    <th className="text-left py-3 px-4 font-medium text-text-dark">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-text-dark">Joined</th>
                    <th className="text-right py-3 px-4 font-medium text-text-dark">Actions</th>
                  </>
                ) : activeView === 'invitations' ? (
                  <>
                    <th className="text-left py-3 px-4 font-medium text-text-dark">
                      <input
                        type="checkbox"
                        checked={selectedInvitations.length === filteredInvitations.length && filteredInvitations.length > 0}
                        onChange={selectedInvitations.length === filteredInvitations.length ? clearInvitationSelection : selectAllInvitations}
                        className="rounded border-background-dark"
                      />
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-text-dark">Email</th>
                    <th className="text-left py-3 px-4 font-medium text-text-dark">Role</th>
                    <th className="text-left py-3 px-4 font-medium text-text-dark">Department</th>
                    <th className="text-left py-3 px-4 font-medium text-text-dark">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-text-dark">Invited</th>
                    <th className="text-right py-3 px-4 font-medium text-text-dark">Actions</th>
                  </>
                ) : (
                  <>
                    <th className="text-left py-3 px-4 font-medium text-text-dark">Department</th>
                    <th className="text-left py-3 px-4 font-medium text-text-dark">Description</th>
                    <th className="text-left py-3 px-4 font-medium text-text-dark">Manager</th>
                    <th className="text-left py-3 px-4 font-medium text-text-dark">Employees</th>
                    <th className="text-left py-3 px-4 font-medium text-text-dark">Created</th>
                    <th className="text-right py-3 px-4 font-medium text-text-dark">Actions</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-8">
                    <LoadingSpinner />
                    </td>
                </tr>
              ) : currentData.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-text-light">
                    {activeView === 'employees' 
                      ? 'No employees found matching your criteria'
                      : activeView === 'invitations'
                      ? 'No invitations found matching your criteria'
                      : 'No departments found matching your criteria'
                    }
                    </td>
                  </tr>
              ) : activeView === 'employees' ? (
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
              ) : activeView === 'invitations' ? (
                filteredInvitations.map((invitation) => (
                  <InvitationRow 
                    key={invitation.id} 
                    invitation={invitation}
                    departments={departments}
                    isSelected={selectedInvitations.includes(invitation.id)}
                    onToggleSelection={toggleInvitationSelection}
                    onResend={resendInvitation}
                    onDelete={confirmDeleteInvitation}
                    getRoleIcon={getRoleIcon}
                  />
                ))
              ) : (
                filteredDepartments.map((department) => (
                  <DepartmentRow 
                    key={department.id} 
                    department={department}
                    employees={employees}
                    onEdit={handleEditDepartment}
                    onDelete={handleDeleteDepartment}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Invite Employee Modal */}
      <InviteEmployeeModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        onSubmit={handleInviteEmployee}
        departments={departments}
        loading={loading}
        formData={inviteForm}
        setFormData={setInviteForm}
        errors={errors}
      />

      {/* Department Modal */}
      <DepartmentModal
        isOpen={showDepartmentModal}
        onClose={handleCloseDepartmentModal}
        onSubmit={editingDepartment ? handleUpdateDepartment : handleCreateDepartment}
        departments={departments}
        employees={employees}
        loading={loading}
        formData={departmentForm}
        setFormData={setDepartmentForm}
        errors={errors}
        editingDepartment={editingDepartment}
      />

      {/* Delete Confirmation Modal */}
      <Modal 
        isOpen={showDeleteConfirm} 
        onClose={() => setShowDeleteConfirm(false)} 
        title="Delete Invitation"
        size="sm"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-error-light rounded-full flex items-center justify-center">
              <Trash2 className="w-6 h-6 text-error-default" />
            </div>
            <div>
              <h3 className="font-semibold text-text-dark">Delete Invitation</h3>
              <p className="text-text-light text-sm">
                This action cannot be undone.
              </p>
            </div>
          </div>
          
          {invitationToDelete && (
            <div className="bg-background-light rounded-lg p-4">
              <p className="text-sm text-text-dark">
                <strong>Email:</strong> {invitationToDelete.email}
              </p>
              <p className="text-sm text-text-dark">
                <strong>Role:</strong> {invitationToDelete.role}
              </p>
              <p className="text-sm text-text-dark">
                <strong>Status:</strong> {invitationToDelete.status}
              </p>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Button 
              variant="ghost" 
              onClick={() => setShowDeleteConfirm(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={executeDeleteInvitation}
              disabled={loading}
            >
              {loading ? 'Deleting...' : 'Delete Invitation'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

// Invitation Row Component
function InvitationRow({ invitation, departments, isSelected, onToggleSelection, onResend, onDelete, getRoleIcon }) {
  const [showActions, setShowActions] = useState(false)

  const RoleIcon = getRoleIcon(invitation.role)

  const handleResend = async () => {
    try {
      await onResend(invitation.id)
      setShowActions(false)
    } catch (error) {
      console.error('Failed to resend invitation:', error)
    }
  }

  const handleDelete = async () => {
    try {
      await onDelete(invitation)
      setShowActions(false)
    } catch (error) {
      console.error('Failed to delete invitation:', error)
    }
  }

  const isExpired = new Date(invitation.expires_at) < new Date()
  const isUsed = invitation.used_at

  return (
    <tr className={`border-b border-background-light hover:bg-background-light ${isSelected ? 'bg-primary-light/10' : ''}`}>
      <td className="py-3 px-4">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onToggleSelection(invitation.id)}
          className="rounded border-background-dark"
        />
      </td>
      <td className="py-3 px-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary-light rounded-full flex items-center justify-center">
            <Mail className="w-4 h-4 text-primary-default" />
          </div>
          <div>
            <p className="font-medium text-text-dark">{invitation.email}</p>
            <p className="text-sm text-text-light">
              {invitation.custom_message ? `"${invitation.custom_message}"` : 'No message'}
            </p>
          </div>
        </div>
      </td>
      
      <td className="py-3 px-4">
        <div className="flex items-center gap-2">
          <RoleIcon className="w-4 h-4 text-text-medium" />
          <span className="capitalize text-text-dark">{invitation.role}</span>
        </div>
      </td>
      
      <td className="py-3 px-4">
        <span className="text-text-light">
          {departments.find(dept => dept.id === invitation.department_id)?.name || 'No department'}
        </span>
      </td>
      
      <td className="py-3 px-4">
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
          isUsed 
            ? 'text-success-default bg-success-light'
            : isExpired
            ? 'text-error-default bg-error-light'
            : 'text-warning-default bg-warning-light'
        }`}>
          {isUsed ? 'Accepted' : isExpired ? 'Expired' : 'Pending'}
        </span>
      </td>
      
      <td className="py-3 px-4 text-text-light">
        {invitation.invited_at ? new Date(invitation.invited_at).toLocaleDateString() : '-'}
      </td>
      
      <td className="py-3 px-4 text-right">
        <div className="relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowActions(!showActions)}
            disabled={isUsed}
          >
            <MoreVertical className="w-4 h-4" />
          </Button>
          
          {showActions && !isUsed && (
            <div className="absolute right-0 top-8 w-48 bg-white border border-background-dark rounded-lg shadow-lg z-10">
              <button
                onClick={handleResend}
                className="w-full text-left px-4 py-2 hover:bg-background-light flex items-center gap-2"
              >
                <Mail className="w-4 h-4" />
                Resend Invitation
              </button>
              <button
                onClick={handleDelete}
                className="w-full text-left px-4 py-2 hover:bg-background-light text-error-default flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete Invitation
              </button>
            </div>
          )}
        </div>
      </td>
    </tr>
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
      // Validate employee ID before updating
      if (!employee.id || employee.id === 'undefined') {
        console.error('Invalid employee ID');
        return;
      }
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
              <option value="learner">Learner (Individual)</option>
              <option value="corporate_admin">Corporate Admin</option>
              <option value="instructor">Instructor (Optional)</option>
              <option value="system_admin">System Admin</option>
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
      
      <td className="py-3 px-4 text-right">
        <div className="relative" style={{ zIndex: showActions ? 1000 : 'auto' }}>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowActions(!showActions)}
          >
            <MoreVertical className="w-4 h-4" />
          </Button>
          
          {showActions && (
            <div className="absolute right-0 top-8 w-48 bg-white border border-background-dark rounded-lg shadow-xl z-[9999]">
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

// Invite Employee Modal Component
function InviteEmployeeModal({ isOpen, onClose, onSubmit, departments, loading, formData, setFormData, errors }) {
  const handleSubmit = async (e) => {
    e.preventDefault()
    await onSubmit(e)
  }

  const handleClose = () => {
    setFormData({ email: '', role: 'learner', departmentId: '', customMessage: '' })
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-dark mb-2">
              Role
            </label>
            <select
              className="w-full p-3 border border-background-dark rounded-lg focus:ring-2 focus:ring-primary-default focus:border-primary-default"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            >
              <option value="learner">Learner (Individual)</option>
              <option value="corporate_admin">Corporate Admin</option>
              <option value="instructor">Instructor (Optional)</option>
            </select>
              </div>

              <div>
            <label className="block text-sm font-medium text-text-dark mb-2">
              Department
            </label>
                <select
              className="w-full p-3 border border-background-dark rounded-lg focus:ring-2 focus:ring-primary-default focus:border-primary-default"
              value={formData.departmentId}
              onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
            >
              <option value="">No department</option>
              {departments.map(dept => (
                <option key={dept.id} value={dept.id}>{dept.name}</option>
                  ))}
                </select>
              </div>
            </div>

        <div>
          <label className="block text-sm font-medium text-text-dark mb-2">
            Custom Message (Optional)
          </label>
          <textarea
            className="w-full p-3 border border-background-dark rounded-lg focus:ring-2 focus:ring-primary-default focus:border-primary-default"
            rows="3"
            value={formData.customMessage}
            onChange={(e) => setFormData({ ...formData, customMessage: e.target.value })}
            placeholder="Add a personal message to the invitation..."
          />
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

// Department Row Component
function DepartmentRow({ department, employees, onEdit, onDelete }) {
  const [showActions, setShowActions] = useState(false)
  
  const departmentEmployees = employees.filter(emp => emp.department_id === department.id)
  const manager = employees.find(emp => emp.id === department.manager_id)

  return (
    <tr className="border-b border-background-light hover:bg-background-light">
      <td className="py-3 px-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary-light rounded-full flex items-center justify-center">
            <Shield className="w-4 h-4 text-primary-default" />
          </div>
          <div>
            <p className="font-medium text-text-dark">{department.name}</p>
            <p className="text-sm text-text-light">
              {departmentEmployees.length} employee{departmentEmployees.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </td>
      
      <td className="py-3 px-4">
        <p className="text-text-light text-sm">
          {department.description || 'No description'}
        </p>
      </td>
      
      <td className="py-3 px-4">
        {manager ? (
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-success-light rounded-full flex items-center justify-center">
              <span className="text-success-default text-xs font-medium">
                {(manager.first_name?.[0] || manager.email?.[0] || 'M').toUpperCase()}
              </span>
            </div>
            <span className="text-text-dark text-sm">
              {manager.full_name || `${manager.first_name || ''} ${manager.last_name || ''}`.trim() || 'Unknown'}
            </span>
          </div>
        ) : (
          <span className="text-text-light text-sm">No manager assigned</span>
        )}
      </td>
      
      <td className="py-3 px-4">
        <span className="text-text-dark font-medium">
          {departmentEmployees.length}
        </span>
      </td>
      
      <td className="py-3 px-4 text-text-light">
        {department.created_at ? new Date(department.created_at).toLocaleDateString() : '-'}
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
                  onEdit(department)
                  setShowActions(false)
                }}
                className="w-full text-left px-4 py-2 hover:bg-background-light flex items-center gap-2"
              >
                <Edit className="w-4 h-4" />
                Edit Department
              </button>
              <button
                onClick={() => {
                  onDelete(department.id)
                  setShowActions(false)
                }}
                className="w-full text-left px-4 py-2 hover:bg-background-light text-error-default flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete Department
              </button>
            </div>
          )}
        </div>
      </td>
    </tr>
  )
}

// Department Modal Component
function DepartmentModal({ isOpen, onClose, onSubmit, departments, employees, loading, formData, setFormData, errors, editingDepartment }) {
  const handleSubmit = async (e) => {
    e.preventDefault()
    await onSubmit(e)
  }

  const handleClose = () => {
    setFormData({ name: '', description: '', manager_id: '' })
    onClose()
  }

  // Get all active organization members who can be managers
  const potentialManagers = employees.filter(emp => 
    emp.status === 'active'
  )

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={handleClose} 
      title={editingDepartment ? "Edit Department" : "Create Department"}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-text-dark mb-2">
            Department Name *
          </label>
          <input
            type="text"
            required
            className="w-full p-3 border border-background-dark rounded-lg focus:ring-2 focus:ring-primary-default focus:border-primary-default"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., Engineering, Marketing, Sales"
          />
          {errors.name && (
            <p className="text-error-default text-sm mt-1">{errors.name}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-text-dark mb-2">
            Description
          </label>
          <textarea
            className="w-full p-3 border border-background-dark rounded-lg focus:ring-2 focus:ring-primary-default focus:border-primary-default"
            rows="3"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Describe the department's purpose and responsibilities..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text-dark mb-2">
            Department Manager
          </label>
          <select
            className="w-full p-3 border border-background-dark rounded-lg focus:ring-2 focus:ring-primary-default focus:border-primary-default"
            value={formData.manager_id}
            onChange={(e) => setFormData({ ...formData, manager_id: e.target.value })}
          >
            <option value="">No manager assigned</option>
            {potentialManagers.map(emp => {
              const displayName = emp.full_name || 
                `${emp.first_name || ''} ${emp.last_name || ''}`.trim() || 
                emp.email || 'Unknown User'
              const roleDisplay = emp.role?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
              return (
                <option key={emp.id} value={emp.id}>
                  {displayName} - {roleDisplay}
                </option>
              )
            })}
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
            {loading ? 'Saving...' : editingDepartment ? 'Update Department' : 'Create Department'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export default EmployeeManagement;
