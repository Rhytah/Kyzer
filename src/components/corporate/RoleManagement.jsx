// src/components/corporate/RoleManagement.jsx
import { useState, useEffect } from 'react'
import { 
  Shield, 
  ShieldCheck, 
  Crown, 
  Users, 
  Settings, 
  BarChart3,
  BookOpen,
  UserPlus,
  Trash2,
  Edit,
  Plus,
  Save,
  X,
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff,
  GraduationCap,
  UserCog
} from 'lucide-react'
import { useCorporateStore, useEmployees } from '@/store/corporateStore'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Modal from '@/components/ui/Modal'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

export default function RoleManagement() {
  const employees = useEmployees()
  const { 
    fetchEmployees,
    updateEmployeeRole,
    bulkUpdateEmployeeRoles,
    loading,
    error
  } = useCorporateStore()

  const [roles, setRoles] = useState([
    {
      id: 'learner',
      name: 'Learner (Individual)',
      description: 'View/enroll in courses, take assessments, and download certificates',
      color: 'text-blue-600',
      icon: GraduationCap,
      type: 'individual',
      permissions: {
        // Course Access
        canViewCourses: true,
        canEnrollInCourses: true,
        canTakeAssessments: true,
        canDownloadCertificates: true,
        canViewOwnProgress: true,
        
        // Learning Features
        canAccessLearningPath: true,
        canViewCourseContent: true,
        canSubmitAssignments: true,
        canViewGrades: true,
        
        // Profile Management
        canEditOwnProfile: true,
        canUpdateOwnSettings: true,
        
        // No Administrative Access
        canInviteUsers: false,
        canManageUsers: false,
        canCreateCourses: false,
        canManageCourses: false,
        canViewReports: false,
        canManageCompany: false
      }
    },
    {
      id: 'corporate_admin',
      name: 'Corporate Admin',
      description: 'Add/manage users, assign courses, view dashboards/reports, download certificates',
      color: 'text-purple-600',
      icon: UserCog,
      type: 'corporate',
      permissions: {
        // User Management
        canInviteUsers: true,
        canManageUsers: true,
        canDeleteUsers: true,
        canAssignRoles: true,
        canBulkManageUsers: true,
        
        // Department Management
        canCreateDepartments: true,
        canEditDepartments: true,
        canDeleteDepartments: true,
        canAssignDepartmentManagers: true,
        
        // Course Management
        canAssignCourses: true,
        canViewAllProgress: true,
        canDownloadCertificates: true,
        canManageCourseAssignments: true,
        
        // Reports & Analytics
        canViewReports: true,
        canGenerateReports: true,
        canExportData: true,
        canViewAnalytics: true,
        canViewDashboards: true,
        
        // Company Settings
        canManageCompanySettings: true,
        canManageBilling: true,
        canManageIntegrations: true,
        canManagePermissions: true,
        
        // Learning Access
        canViewCourses: true,
        canEnrollInCourses: true,
        canTakeAssessments: true,
        
        // No Course Creation
        canCreateCourses: false,
        canEditCourses: false,
        canDeleteCourses: false
      }
    },
    {
      id: 'instructor',
      name: 'Instructor (Optional)',
      description: 'Create/edit courses, add content, and assessments',
      color: 'text-green-600',
      icon: BookOpen,
      type: 'instructor',
      permissions: {
        // Course Creation & Management
        canCreateCourses: true,
        canEditCourses: true,
        canDeleteOwnCourses: true,
        canAddCourseContent: true,
        canCreateAssessments: true,
        canEditAssessments: true,
        canDeleteAssessments: true,
        
        // Content Management
        canUploadContent: true,
        canManageMedia: true,
        canCreateLessons: true,
        canEditLessons: true,
        canDeleteLessons: true,
        
        // Assessment Management
        canCreateQuizzes: true,
        canEditQuizzes: true,
        canDeleteQuizzes: true,
        canGradeSubmissions: true,
        canViewStudentProgress: true,
        
        // Learning Access
        canViewCourses: true,
        canEnrollInCourses: true,
        canTakeAssessments: true,
        canDownloadCertificates: true,
        
        // Profile Management
        canEditOwnProfile: true,
        canUpdateOwnSettings: true,
        
        // No Administrative Access
        canInviteUsers: false,
        canManageUsers: false,
        canViewReports: false,
        canManageCompany: false
      }
    },
    {
      id: 'system_admin',
      name: 'System Admin',
      description: 'Manage platform settings, approve organizations, and provide user support',
      color: 'text-red-600',
      icon: Settings,
      type: 'system',
      permissions: {
        // Platform Management
        canManagePlatformSettings: true,
        canApproveOrganizations: true,
        canManageSystemUsers: true,
        canProvideUserSupport: true,
        
        // Organization Management
        canCreateOrganizations: true,
        canEditOrganizations: true,
        canDeleteOrganizations: true,
        canSuspendOrganizations: true,
        canViewAllOrganizations: true,
        
        // User Management
        canManageAllUsers: true,
        canViewAllUserData: true,
        canResetUserPasswords: true,
        canSuspendUsers: true,
        canDeleteUsers: true,
        
        // System Reports
        canViewSystemReports: true,
        canGenerateSystemAnalytics: true,
        canExportSystemData: true,
        canViewAuditLogs: true,
        
        // Course Management
        canManageAllCourses: true,
        canApproveCourses: true,
        canSuspendCourses: true,
        canViewAllCourseData: true,
        
        // System Access
        canAccessSystemAdminPanel: true,
        canManageSystemSettings: true,
        canManageIntegrations: true,
        canManageSystemPermissions: true,
        
        // Support Features
        canViewSupportTickets: true,
        canManageSupportTickets: true,
        canAccessUserSupport: true
      }
    }
  ])

  const [showEditModal, setShowEditModal] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedRole, setSelectedRole] = useState(null)
  const [editingPermissions, setEditingPermissions] = useState({})
  const [bulkRoleUpdates, setBulkRoleUpdates] = useState([])
  const [showBulkModal, setShowBulkModal] = useState(false)

  useEffect(() => {
    fetchEmployees()
  }, [])

  const handleEditRole = (role) => {
    setSelectedRole(role)
    setEditingPermissions({ ...role.permissions })
    setShowEditModal(true)
  }

  const handleCreateRole = () => {
    setSelectedRole(null)
    setEditingPermissions({})
    setShowCreateModal(true)
  }

  const handleSaveRole = async () => {
    try {
      // In a real implementation, you would save the role to the database
      // For now, we'll just update the local state
      if (selectedRole) {
        const updatedRoles = roles.map(role => 
          role.id === selectedRole.id 
            ? { ...role, permissions: editingPermissions }
            : role
        )
        setRoles(updatedRoles)
      } else {
        // Create new role
        const newRole = {
          id: `custom_${Date.now()}`,
          name: 'Custom Role',
          description: 'Custom role with specific permissions',
          color: 'text-purple-600',
          icon: Shield,
          permissions: editingPermissions
        }
        setRoles([...roles, newRole])
      }
      
      setShowEditModal(false)
      setShowCreateModal(false)
      setSelectedRole(null)
    } catch (error) {
      // Error handling
    }
  }

  const handleBulkRoleUpdate = async () => {
    try {
      await bulkUpdateEmployeeRoles(bulkRoleUpdates)
      setBulkRoleUpdates([])
      setShowBulkModal(false)
    } catch (error) {
      // Error handling
    }
  }

  const handlePermissionChange = (permission, value) => {
    setEditingPermissions(prev => ({
      ...prev,
      [permission]: value
    }))
  }

  const getRoleIcon = (roleId) => {
    const role = roles.find(r => r.id === roleId)
    return role?.icon || Users
  }

  const getRoleColor = (roleId) => {
    const role = roles.find(r => r.id === roleId)
    return role?.color || 'text-gray-600'
  }

  const getEmployeesByRole = (roleId) => {
    return employees.filter(emp => emp.role === roleId)
  }

  const permissionCategories = [
    {
      title: 'Learning & Course Access',
      permissions: [
        { key: 'canViewCourses', label: 'View Courses', description: 'Can browse and view available courses' },
        { key: 'canEnrollInCourses', label: 'Enroll in Courses', description: 'Can enroll in courses' },
        { key: 'canTakeAssessments', label: 'Take Assessments', description: 'Can take quizzes and assessments' },
        { key: 'canDownloadCertificates', label: 'Download Certificates', description: 'Can download completion certificates' },
        { key: 'canViewOwnProgress', label: 'View Own Progress', description: 'Can view personal learning progress' },
        { key: 'canAccessLearningPath', label: 'Access Learning Path', description: 'Can access personalized learning paths' },
        { key: 'canViewCourseContent', label: 'View Course Content', description: 'Can access course materials and content' },
        { key: 'canSubmitAssignments', label: 'Submit Assignments', description: 'Can submit course assignments' },
        { key: 'canViewGrades', label: 'View Grades', description: 'Can view grades and feedback' }
      ]
    },
    {
      title: 'Course Creation & Management',
      permissions: [
        { key: 'canCreateCourses', label: 'Create Courses', description: 'Can create new courses' },
        { key: 'canEditCourses', label: 'Edit Courses', description: 'Can modify course content and settings' },
        { key: 'canDeleteOwnCourses', label: 'Delete Own Courses', description: 'Can delete courses they created' },
        { key: 'canAddCourseContent', label: 'Add Course Content', description: 'Can add lessons and materials to courses' },
        { key: 'canCreateAssessments', label: 'Create Assessments', description: 'Can create quizzes and assessments' },
        { key: 'canEditAssessments', label: 'Edit Assessments', description: 'Can modify assessments' },
        { key: 'canDeleteAssessments', label: 'Delete Assessments', description: 'Can remove assessments' },
        { key: 'canGradeSubmissions', label: 'Grade Submissions', description: 'Can grade student submissions' },
        { key: 'canViewStudentProgress', label: 'View Student Progress', description: 'Can view student learning progress' }
      ]
    },
    {
      title: 'User Management',
      permissions: [
        { key: 'canInviteUsers', label: 'Invite Users', description: 'Can send invitations to new users' },
        { key: 'canManageUsers', label: 'Manage Users', description: 'Can edit user profiles and settings' },
        { key: 'canDeleteUsers', label: 'Delete Users', description: 'Can remove users from the organization' },
        { key: 'canAssignRoles', label: 'Assign Roles', description: 'Can change user roles and permissions' },
        { key: 'canBulkManageUsers', label: 'Bulk User Operations', description: 'Can perform bulk operations on users' },
        { key: 'canManageAllUsers', label: 'Manage All Users', description: 'Can manage users across all organizations' },
        { key: 'canViewAllUserData', label: 'View All User Data', description: 'Can view data for all users' },
        { key: 'canResetUserPasswords', label: 'Reset User Passwords', description: 'Can reset user passwords' },
        { key: 'canSuspendUsers', label: 'Suspend Users', description: 'Can suspend user accounts' }
      ]
    },
    {
      title: 'Department Management',
      permissions: [
        { key: 'canCreateDepartments', label: 'Create Departments', description: 'Can create new departments' },
        { key: 'canEditDepartments', label: 'Edit Departments', description: 'Can modify department settings' },
        { key: 'canDeleteDepartments', label: 'Delete Departments', description: 'Can remove departments' },
        { key: 'canAssignDepartmentManagers', label: 'Assign Managers', description: 'Can assign department managers' }
      ]
    },
    {
      title: 'Course Assignment & Progress',
      permissions: [
        { key: 'canAssignCourses', label: 'Assign Courses', description: 'Can assign courses to users' },
        { key: 'canViewAllProgress', label: 'View All Progress', description: 'Can view progress of all users' },
        { key: 'canManageCourseAssignments', label: 'Manage Course Assignments', description: 'Can manage course assignments' }
      ]
    },
    {
      title: 'Reports & Analytics',
      permissions: [
        { key: 'canViewReports', label: 'View Reports', description: 'Can access reporting features' },
        { key: 'canGenerateReports', label: 'Generate Reports', description: 'Can create custom reports' },
        { key: 'canExportData', label: 'Export Data', description: 'Can export data and reports' },
        { key: 'canViewAnalytics', label: 'View Analytics', description: 'Can access advanced analytics' },
        { key: 'canViewDashboards', label: 'View Dashboards', description: 'Can access dashboard views' },
        { key: 'canViewSystemReports', label: 'View System Reports', description: 'Can access system-wide reports' },
        { key: 'canGenerateSystemAnalytics', label: 'Generate System Analytics', description: 'Can create system analytics' }
      ]
    },
    {
      title: 'Organization & Company Settings',
      permissions: [
        { key: 'canManageCompanySettings', label: 'Manage Company Settings', description: 'Can modify company settings' },
        { key: 'canManageBilling', label: 'Manage Billing', description: 'Can access billing and subscription settings' },
        { key: 'canManageIntegrations', label: 'Manage Integrations', description: 'Can configure third-party integrations' },
        { key: 'canManagePermissions', label: 'Manage Permissions', description: 'Can modify role permissions' },
        { key: 'canCreateOrganizations', label: 'Create Organizations', description: 'Can create new organizations' },
        { key: 'canEditOrganizations', label: 'Edit Organizations', description: 'Can modify organization settings' },
        { key: 'canApproveOrganizations', label: 'Approve Organizations', description: 'Can approve new organizations' }
      ]
    },
    {
      title: 'System Administration',
      permissions: [
        { key: 'canAccessAdminPanel', label: 'Access Admin Panel', description: 'Can access administrative features' },
        { key: 'canManageSystemSettings', label: 'Manage System Settings', description: 'Can modify system-wide settings' },
        { key: 'canViewAuditLogs', label: 'View Audit Logs', description: 'Can access audit and activity logs' },
        { key: 'canManagePlatformSettings', label: 'Manage Platform Settings', description: 'Can modify platform configuration' },
        { key: 'canManageSystemUsers', label: 'Manage System Users', description: 'Can manage system-level users' },
        { key: 'canProvideUserSupport', label: 'Provide User Support', description: 'Can provide user support' },
        { key: 'canAccessSystemAdminPanel', label: 'Access System Admin Panel', description: 'Can access system admin features' }
      ]
    },
    {
      title: 'Support & Content Management',
      permissions: [
        { key: 'canUploadContent', label: 'Upload Content', description: 'Can upload course content and media' },
        { key: 'canManageMedia', label: 'Manage Media', description: 'Can manage uploaded media files' },
        { key: 'canCreateLessons', label: 'Create Lessons', description: 'Can create course lessons' },
        { key: 'canEditLessons', label: 'Edit Lessons', description: 'Can modify course lessons' },
        { key: 'canDeleteLessons', label: 'Delete Lessons', description: 'Can remove course lessons' },
        { key: 'canViewSupportTickets', label: 'View Support Tickets', description: 'Can view support tickets' },
        { key: 'canManageSupportTickets', label: 'Manage Support Tickets', description: 'Can manage support tickets' },
        { key: 'canAccessUserSupport', label: 'Access User Support', description: 'Can access user support tools' }
      ]
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-semibold text-text-dark">Role Management</h2>
          <p className="text-text-light">
            Manage user roles and permissions for your organization
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => setShowBulkModal(true)}
          >
            <Users className="w-4 h-4 mr-2" />
            Bulk Assign
          </Button>
          <Button onClick={handleCreateRole}>
            <Plus className="w-4 h-4 mr-2" />
            Create Role
          </Button>
        </div>
      </div>

      {/* Role Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {roles.map((role) => {
          const Icon = role.icon
          const employeeCount = getEmployeesByRole(role.id).length
          
          return (
            <Card key={role.id} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg bg-gray-100`}>
                    <Icon className={`w-6 h-6 ${role.color}`} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-text-dark">{role.name}</h3>
                    <p className="text-sm text-text-light">{role.description}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEditRole(role)}
                >
                  <Edit className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-light">Users with this role:</span>
                  <span className="font-medium text-text-dark">{employeeCount}</span>
                </div>
                
                <div className="space-y-2">
                  <div className="text-sm text-text-light">Key Permissions:</div>
                  <div className="flex flex-wrap gap-1">
                    {Object.entries(role.permissions)
                      .filter(([_, value]) => value)
                      .slice(0, 3)
                      .map(([key, _]) => (
                        <span
                          key={key}
                          className="px-2 py-1 bg-primary-light text-primary-default text-xs rounded"
                        >
                          {key.replace('can', '').replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                      ))}
                    {Object.values(role.permissions).filter(Boolean).length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                        +{Object.values(role.permissions).filter(Boolean).length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      {/* Role Details Table */}
      <Card>
        <div className="p-6 border-b border-background-dark">
          <h3 className="text-lg font-semibold text-text-dark">Role Details</h3>
          <p className="text-text-light">Detailed view of all roles and their permissions</p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-background-dark">
                <th className="text-left py-3 px-4 font-medium text-text-dark">Role</th>
                <th className="text-left py-3 px-4 font-medium text-text-dark">Users</th>
                <th className="text-left py-3 px-4 font-medium text-text-dark">Permissions</th>
                <th className="text-right py-3 px-4 font-medium text-text-dark">Actions</th>
              </tr>
            </thead>
            <tbody>
              {roles.map((role) => {
                const Icon = role.icon
                const employeeCount = getEmployeesByRole(role.id).length
                const permissionCount = Object.values(role.permissions).filter(Boolean).length
                
                return (
                  <tr key={role.id} className="border-b border-background-light hover:bg-background-light">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <Icon className={`w-5 h-5 ${role.color}`} />
                        <div>
                          <p className="font-medium text-text-dark">{role.name}</p>
                          <p className="text-sm text-text-light">{role.description}</p>
                        </div>
                      </div>
                    </td>
                    
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-text-medium" />
                        <span className="text-text-dark">{employeeCount}</span>
                      </div>
                    </td>
                    
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-text-medium" />
                        <span className="text-text-dark">{permissionCount} permissions</span>
                      </div>
                    </td>
                    
                    <td className="py-3 px-4 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditRole(role)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Edit Role Modal */}
      <EditRoleModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false)
          setSelectedRole(null)
        }}
        role={selectedRole}
        permissions={editingPermissions}
        onPermissionChange={handlePermissionChange}
        onSave={handleSaveRole}
        loading={loading}
      />

      {/* Create Role Modal */}
      <CreateRoleModal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false)
          setSelectedRole(null)
        }}
        permissions={editingPermissions}
        onPermissionChange={handlePermissionChange}
        onSave={handleSaveRole}
        loading={loading}
      />

      {/* Bulk Role Assignment Modal */}
      <BulkRoleAssignmentModal
        isOpen={showBulkModal}
        onClose={() => {
          setShowBulkModal(false)
          setBulkRoleUpdates([])
        }}
        employees={employees}
        roles={roles}
        onUpdate={handleBulkRoleUpdate}
        loading={loading}
      />
    </div>
  )
}

// Edit Role Modal Component
function EditRoleModal({ isOpen, onClose, role, permissions, onPermissionChange, onSave, loading }) {
  if (!role) return null

  const permissionCategories = [
    {
      title: 'User Management',
      permissions: [
        { key: 'canInviteUsers', label: 'Invite Users' },
        { key: 'canManageUsers', label: 'Manage Users' },
        { key: 'canDeleteUsers', label: 'Delete Users' },
        { key: 'canAssignRoles', label: 'Assign Roles' },
        { key: 'canBulkManageUsers', label: 'Bulk User Operations' }
      ]
    },
    {
      title: 'Department Management',
      permissions: [
        { key: 'canCreateDepartments', label: 'Create Departments' },
        { key: 'canEditDepartments', label: 'Edit Departments' },
        { key: 'canDeleteDepartments', label: 'Delete Departments' },
        { key: 'canAssignDepartmentManagers', label: 'Assign Managers' }
      ]
    },
    {
      title: 'Course Management',
      permissions: [
        { key: 'canCreateCourses', label: 'Create Courses' },
        { key: 'canEditCourses', label: 'Edit Courses' },
        { key: 'canDeleteCourses', label: 'Delete Courses' },
        { key: 'canAssignCourses', label: 'Assign Courses' },
        { key: 'canViewAllProgress', label: 'View All Progress' }
      ]
    },
    {
      title: 'Reports & Analytics',
      permissions: [
        { key: 'canViewReports', label: 'View Reports' },
        { key: 'canGenerateReports', label: 'Generate Reports' },
        { key: 'canExportData', label: 'Export Data' },
        { key: 'canViewAnalytics', label: 'View Analytics' }
      ]
    },
    {
      title: 'Company Settings',
      permissions: [
        { key: 'canManageCompanySettings', label: 'Manage Company Settings' },
        { key: 'canManageBilling', label: 'Manage Billing' },
        { key: 'canManageIntegrations', label: 'Manage Integrations' },
        { key: 'canManagePermissions', label: 'Manage Permissions' }
      ]
    },
    {
      title: 'System Access',
      permissions: [
        { key: 'canAccessAdminPanel', label: 'Access Admin Panel' },
        { key: 'canManageSystemSettings', label: 'Manage System Settings' },
        { key: 'canViewAuditLogs', label: 'View Audit Logs' }
      ]
    }
  ]

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Edit ${role.name} Role`} size="lg">
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-dark mb-2">
              Role Name
            </label>
            <input
              type="text"
              className="w-full p-3 border border-background-dark rounded-lg focus:ring-2 focus:ring-primary-default focus:border-primary-default"
              value={role.name}
              readOnly
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-dark mb-2">
              Description
            </label>
            <input
              type="text"
              className="w-full p-3 border border-background-dark rounded-lg focus:ring-2 focus:ring-primary-default focus:border-primary-default"
              value={role.description}
              readOnly
            />
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="font-medium text-text-dark">Permissions</h4>
          {permissionCategories.map((category) => (
            <div key={category.title} className="space-y-3">
              <h5 className="font-medium text-text-dark border-b border-background-dark pb-2">
                {category.title}
              </h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {category.permissions.map((permission) => (
                  <label key={permission.key} className="flex items-center gap-3 p-3 border border-background-dark rounded-lg hover:bg-background-light">
                    <input
                      type="checkbox"
                      checked={permissions[permission.key] || false}
                      onChange={(e) => onPermissionChange(permission.key, e.target.checked)}
                      className="w-4 h-4 text-primary-default focus:ring-primary-default border-background-dark rounded"
                    />
                    <div>
                      <span className="text-sm font-medium text-text-dark">{permission.label}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={onSave} disabled={loading}>
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}

// Create Role Modal Component
function CreateRoleModal({ isOpen, onClose, permissions, onPermissionChange, onSave, loading }) {
  const [roleName, setRoleName] = useState('')
  const [roleDescription, setRoleDescription] = useState('')

  const handleSave = () => {
    if (!roleName.trim()) return
    onSave()
  }

  const handleClose = () => {
    setRoleName('')
    setRoleDescription('')
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Create Custom Role" size="lg">
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-dark mb-2">
              Role Name *
            </label>
            <input
              type="text"
              className="w-full p-3 border border-background-dark rounded-lg focus:ring-2 focus:ring-primary-default focus:border-primary-default"
              value={roleName}
              onChange={(e) => setRoleName(e.target.value)}
              placeholder="e.g., Content Manager, HR Admin"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-dark mb-2">
              Description
            </label>
            <input
              type="text"
              className="w-full p-3 border border-background-dark rounded-lg focus:ring-2 focus:ring-primary-default focus:border-primary-default"
              value={roleDescription}
              onChange={(e) => setRoleDescription(e.target.value)}
              placeholder="Brief description of this role's purpose"
            />
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="font-medium text-text-dark">Permissions</h4>
          <div className="text-sm text-text-light mb-4">
            Select the permissions that users with this role should have.
          </div>
          
          {/* Permission categories would be rendered here similar to EditRoleModal */}
          <div className="p-4 bg-background-light rounded-lg">
            <p className="text-sm text-text-light">
              Permission configuration interface would be implemented here.
              This would be similar to the EditRoleModal but for creating new roles.
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button variant="ghost" onClick={handleClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={loading || !roleName.trim()}
          >
            {loading ? 'Creating...' : 'Create Role'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}

// Bulk Role Assignment Modal Component
function BulkRoleAssignmentModal({ isOpen, onClose, employees, roles, onUpdate, loading }) {
  const [selectedEmployees, setSelectedEmployees] = useState([])
  const [selectedRole, setSelectedRole] = useState('')

  const handleEmployeeSelect = (employeeId, checked) => {
    if (checked) {
      setSelectedEmployees([...selectedEmployees, employeeId])
    } else {
      setSelectedEmployees(selectedEmployees.filter(id => id !== employeeId))
    }
  }

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedEmployees(employees.map(emp => emp.id))
    } else {
      setSelectedEmployees([])
    }
  }

  const handleUpdate = () => {
    if (!selectedRole || selectedEmployees.length === 0) return
    
    const updates = selectedEmployees.map(employeeId => ({
      employeeId,
      role: selectedRole
    }))
    
    onUpdate(updates)
  }

  const handleClose = () => {
    setSelectedEmployees([])
    setSelectedRole('')
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Bulk Role Assignment" size="lg">
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-text-dark mb-2">
            Select Role
          </label>
          <select
            className="w-full p-3 border border-background-dark rounded-lg focus:ring-2 focus:ring-primary-default focus:border-primary-default"
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
          >
            <option value="">Choose a role...</option>
            {roles.map(role => (
              <option key={role.id} value={role.id}>{role.name}</option>
            ))}
          </select>
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium text-text-dark">Select Employees</h4>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={selectedEmployees.length === employees.length && employees.length > 0}
                onChange={(e) => handleSelectAll(e.target.checked)}
                className="w-4 h-4 text-primary-default focus:ring-primary-default border-background-dark rounded"
              />
              <span className="text-sm text-text-dark">Select All</span>
            </label>
          </div>
          
          <div className="max-h-60 overflow-y-auto space-y-2">
            {employees.map((employee) => (
              <label key={employee.id} className="flex items-center gap-3 p-3 border border-background-dark rounded-lg hover:bg-background-light">
                <input
                  type="checkbox"
                  checked={selectedEmployees.includes(employee.id)}
                  onChange={(e) => handleEmployeeSelect(employee.id, e.target.checked)}
                  className="w-4 h-4 text-primary-default focus:ring-primary-default border-background-dark rounded"
                />
                <div className="flex-1">
                  <p className="font-medium text-text-dark">
                    {employee.users?.user_metadata?.full_name || employee.users?.email || 'Unknown'}
                  </p>
                  <p className="text-sm text-text-light">
                    {employee.users?.email} • Current role: {employee.role}
                  </p>
                </div>
              </label>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button variant="ghost" onClick={handleClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleUpdate}
            disabled={loading || !selectedRole || selectedEmployees.length === 0}
          >
            {loading ? 'Updating...' : `Update ${selectedEmployees.length} Employees`}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
