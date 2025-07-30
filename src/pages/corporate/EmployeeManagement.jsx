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
} from "lucide-react";
import Button from "../../components/ui/Button";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import toast from "react-hot-toast";
import useCorporateStore from "../../store/corporateStore";

const EmployeeManagement = () => {
  // const [employees, setEmployees] = useState([]);
  // const [loading, setLoading] = useState(true);
  // const [searchTerm, setSearchTerm] = useState("");
  // const [departmentFilter, setDepartmentFilter] = useState("all");
  // const [statusFilter, setStatusFilter] = useState("all");
  // const [showInviteModal, setShowInviteModal] = useState(false);
  // const [selectedEmployees, setSelectedEmployees] = useState(new Set());
  // const [inviteForm, setInviteForm] = useState({
  //   emails: "",
  //   department: "",
  //   role: "learner",
  // });

  const departments = [
    "Engineering",
    "Marketing",
    "Sales",
    "Operations",
    "HR",
    "Finance",
    "Design",
    "IT",
  ];

  const statuses = [
    { id: "all", name: "All Employees" },
    { id: "active", name: "Active" },
    { id: "inactive", name: "Inactive" },
    { id: "pending", name: "Pending Invitation" },
  ];
  // Get store methods
  const { 
    employees,
    fetchEmployees,
    loading,
    error 
  } = useCorporateStore();
const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedEmployees, setSelectedEmployees] = useState(new Set());
  const [inviteForm, setInviteForm] = useState({
    emails: "",
    department: "",
    role: "learner",
  });
  // useEffect(() => {
  //   const loadEmployees = async () => {
  //     // Simulate API call
  //     await new Promise((resolve) => setTimeout(resolve, 1000));

  //     setEmployees([
  //       {
  //         id: 1,
  //         name: "Sarah Johnson",
  //         email: "sarah.johnson@company.com",
  //         department: "Engineering",
  //         role: "Developer",
  //         status: "active",
  //         joinDate: "2023-06-15",
  //         lastActive: "2024-01-20",
  //         coursesCompleted: 8,
  //         coursesInProgress: 2,
  //         totalHours: 45,
  //         certificates: 6,
  //         avatar: "/avatar-placeholder.jpg",
  //       },
  //       {
  //         id: 2,
  //         name: "Mike Chen",
  //         email: "mike.chen@company.com",
  //         department: "Marketing",
  //         role: "Marketing Manager",
  //         status: "active",
  //         joinDate: "2023-03-22",
  //         lastActive: "2024-01-19",
  //         coursesCompleted: 6,
  //         coursesInProgress: 1,
  //         totalHours: 38,
  //         certificates: 4,
  //         avatar: "/avatar-placeholder.jpg",
  //       },
  //       {
  //         id: 3,
  //         name: "Emily Rodriguez",
  //         email: "emily.rodriguez@company.com",
  //         department: "Operations",
  //         role: "Operations Lead",
  //         status: "active",
  //         joinDate: "2023-08-10",
  //         lastActive: "2024-01-18",
  //         coursesCompleted: 7,
  //         coursesInProgress: 3,
  //         totalHours: 42,
  //         certificates: 5,
  //         avatar: "/avatar-placeholder.jpg",
  //       },
  //       {
  //         id: 4,
  //         name: "David Kim",
  //         email: "david.kim@company.com",
  //         department: "Engineering",
  //         role: "Senior Developer",
  //         status: "active",
  //         joinDate: "2023-01-05",
  //         lastActive: "2024-01-17",
  //         coursesCompleted: 12,
  //         coursesInProgress: 1,
  //         totalHours: 67,
  //         certificates: 9,
  //         avatar: "/avatar-placeholder.jpg",
  //       },
  //       {
  //         id: 5,
  //         name: "Lisa Park",
  //         email: "lisa.park@company.com",
  //         department: "Design",
  //         role: "UX Designer",
  //         status: "pending",
  //         joinDate: null,
  //         lastActive: null,
  //         coursesCompleted: 0,
  //         coursesInProgress: 0,
  //         totalHours: 0,
  //         certificates: 0,
  //         avatar: "/avatar-placeholder.jpg",
  //       },
  //       {
  //         id: 6,
  //         name: "John Smith",
  //         email: "john.smith@company.com",
  //         department: "Sales",
  //         role: "Sales Rep",
  //         status: "inactive",
  //         joinDate: "2023-05-12",
  //         lastActive: "2023-12-15",
  //         coursesCompleted: 3,
  //         coursesInProgress: 0,
  //         totalHours: 18,
  //         certificates: 2,
  //         avatar: "/avatar-placeholder.jpg",
  //       },
  //     ]);

  //     setLoading(false);
  //   };

  //   loadEmployees();
  // }, []);
 useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);
  const filteredEmployees = employees.filter((employee) => {
    const matchesSearch =
      employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.department.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDepartment =
      departmentFilter === "all" || employee.department === departmentFilter;
    const matchesStatus =
      statusFilter === "all" || employee.status === statusFilter;

    return matchesSearch && matchesDepartment && matchesStatus;
  });

  const handleInviteEmployees = async () => {
    const emails = inviteForm.emails
      .split("\n")
      .filter((email) => email.trim());

    if (emails.length === 0) {
      toast.error("Please enter at least one email address");
      return;
    }

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Add new pending employees
      const newEmployees = emails.map((email, index) => ({
        id: Date.now() + index,
        name: email
          .split("@")[0]
          .replace(/[._]/g, " ")
          .replace(/\b\w/g, (l) => l.toUpperCase()),
        email: email.trim(),
        department: inviteForm.department,
        role: "Employee",
        status: "pending",
        joinDate: null,
        lastActive: null,
        coursesCompleted: 0,
        coursesInProgress: 0,
        totalHours: 0,
        certificates: 0,
        avatar: "/avatar-placeholder.jpg",
      }));

      setEmployees((prev) => [...prev, ...newEmployees]);
      setShowInviteModal(false);
      setInviteForm({ emails: "", department: "", role: "learner" });
      toast.success(`Invited ${emails.length} employee(s) successfully!`);
    } catch (error) {
      toast.error("Failed to send invitations");
    }
  };

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

  const getStatusBadge = (status) => {
    const badges = {
      active: { color: "bg-green-100 text-green-700", text: "Active" },
      inactive: { color: "bg-red-100 text-red-700", text: "Inactive" },
      pending: { color: "bg-yellow-100 text-yellow-700", text: "Pending" },
    };
    return badges[status] || badges.active;
  };

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
      <div className="container py-8">
        <div className="flex items-center justify-center min-h-96">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-text-dark mb-2">
            Employee Management
          </h1>
          <p className="text-text-medium">
            Manage your team members and track their learning progress
          </p>
        </div>
        <div className="flex items-center space-x-3 mt-4 lg:mt-0">
          <Button variant="secondary">
            <Upload className="h-4 w-4 mr-2" />
            Import CSV
          </Button>
          <Button onClick={() => setShowInviteModal(true)}>
            <UserPlus className="h-4 w-4 mr-2" />
            Invite Employees
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="card">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <p className="text-2xl font-bold text-text-dark">
                {employees.length}
              </p>
              <p className="text-sm text-text-medium">Total Employees</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-green-600 mr-3" />
            <div>
              <p className="text-2xl font-bold text-text-dark">
                {employees.filter((emp) => emp.status === "active").length}
              </p>
              <p className="text-sm text-text-medium">Active</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-yellow-600 mr-3" />
            <div>
              <p className="text-2xl font-bold text-text-dark">
                {employees.filter((emp) => emp.status === "pending").length}
              </p>
              <p className="text-sm text-text-medium">Pending</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center">
            <Award className="h-8 w-8 text-purple-600 mr-3" />
            <div>
              <p className="text-2xl font-bold text-text-dark">
                {employees.reduce((sum, emp) => sum + emp.certificates, 0)}
              </p>
              <p className="text-sm text-text-medium">Total Certificates</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-light h-4 w-4" />
            <input
              type="text"
              placeholder="Search employees..."
              className="input pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="input w-auto min-w-40"
          >
            <option value="all">All Departments</option>
            {departments.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input w-auto min-w-32"
          >
            {statuses.map((status) => (
              <option key={status.id} value={status.id}>
                {status.name}
              </option>
            ))}
          </select>

          <Button variant="secondary">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>

        {selectedEmployees.size > 0 && (
          <div className="mt-4 flex items-center justify-between bg-primary-light rounded-lg p-3">
            <span className="text-sm font-medium text-primary">
              {selectedEmployees.size} employee(s) selected
            </span>
            <div className="flex items-center space-x-2">
              <Button size="sm" variant="secondary">
                <BookOpen className="h-4 w-4 mr-1" />
                Assign Course
              </Button>
              <Button size="sm" variant="secondary">
                <Mail className="h-4 w-4 mr-1" />
                Send Message
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Employee Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-background-light">
              <tr>
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={
                      selectedEmployees.size === filteredEmployees.length &&
                      filteredEmployees.length > 0
                    }
                    onChange={handleSelectAll}
                    className="rounded border-gray-300"
                  />
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-text-dark">
                  Employee
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-text-dark">
                  Department
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-text-dark">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-text-dark">
                  Progress
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-text-dark">
                  Last Active
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-text-dark">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-background-dark">
              {filteredEmployees.map((employee) => {
                const statusBadge = getStatusBadge(employee.status);
                return (
                  <tr key={employee.id} className="hover:bg-background-light">
                    <td className="px-4 py-4">
                      <input
                        type="checkbox"
                        checked={selectedEmployees.has(employee.id)}
                        onChange={() => handleSelectEmployee(employee.id)}
                        className="rounded border-gray-300"
                      />
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center">
                        <img
                          src={employee.avatar}
                          alt={employee.name}
                          className="w-10 h-10 rounded-full mr-3"
                        />
                        <div>
                          <div className="font-medium text-text-dark">
                            {employee.name}
                          </div>
                          <div className="text-sm text-text-medium">
                            {employee.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm">
                        <div className="font-medium text-text-dark">
                          {employee.department}
                        </div>
                        <div className="text-text-medium">{employee.role}</div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${statusBadge.color}`}
                      >
                        {statusBadge.text}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      {employee.status === "pending" ? (
                        <span className="text-text-light text-sm">
                          Invitation sent
                        </span>
                      ) : (
                        <div className="text-sm">
                          <div className="font-medium text-text-dark">
                            {employee.coursesCompleted} completed
                          </div>
                          <div className="text-text-medium">
                            {employee.totalHours}h • {employee.certificates}{" "}
                            certs
                          </div>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-4 text-sm text-text-medium">
                      {formatDate(employee.lastActive)}
                    </td>
                    <td className="px-4 py-4">
                      <button className="text-text-light hover:text-text-dark">
                        <MoreVertical className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredEmployees.length === 0 && (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-text-light mx-auto mb-4" />
            <h3 className="text-lg font-medium text-text-dark mb-2">
              No employees found
            </h3>
            <p className="text-text-medium">
              Try adjusting your search or filter criteria
            </p>
          </div>
        )}
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-text-dark mb-4">
              Invite Employees
            </h3>

            <div className="space-y-4">
              <div>
                <label className="label">Email Addresses</label>
                <textarea
                  value={inviteForm.emails}
                  onChange={(e) =>
                    setInviteForm((prev) => ({
                      ...prev,
                      emails: e.target.value,
                    }))
                  }
                  placeholder="Enter email addresses (one per line)"
                  className="input h-32 resize-none"
                  rows={5}
                />
                <p className="text-xs text-text-light mt-1">
                  Enter one email address per line
                </p>
              </div>

              <div>
                <label className="label">Department</label>
                <select
                  value={inviteForm.department}
                  onChange={(e) =>
                    setInviteForm((prev) => ({
                      ...prev,
                      department: e.target.value,
                    }))
                  }
                  className="input"
                  required
                >
                  <option value="">Select department</option>
                  {departments.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <Button variant="ghost" onClick={() => setShowInviteModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleInviteEmployees}>
                <Mail className="h-4 w-4 mr-2" />
                Send Invitations
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeManagement;
