import { useState, useEffect } from "react";
import {
  Download,
  Calendar,
  Filter,
  TrendingUp,
  Users,
  BookOpen,
  Clock,
  Award,
  Target,
  BarChart3,
  PieChart,
  LineChart,
  Eye,
  FileText,
} from "lucide-react";
import Button from "../../components/ui/Button";
import LoadingSpinner from "../../components/ui/LoadingSpinner";

const Reports = () => {
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState("overview");
  const [dateRange, setDateRange] = useState("last30days");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [reportData, setReportData] = useState(null);

  const reportTypes = [
    { id: "overview", name: "Learning Overview", icon: BarChart3 },
    { id: "progress", name: "Progress Report", icon: TrendingUp },
    { id: "completion", name: "Completion Report", icon: Target },
    { id: "engagement", name: "Engagement Analytics", icon: Eye },
    { id: "compliance", name: "Compliance Report", icon: FileText },
    { id: "performance", name: "Performance Analytics", icon: Award },
  ];

  const dateRanges = [
    { id: "last7days", name: "Last 7 Days" },
    { id: "last30days", name: "Last 30 Days" },
    { id: "last90days", name: "Last 90 Days" },
    { id: "last6months", name: "Last 6 Months" },
    { id: "lastyear", name: "Last Year" },
    { id: "custom", name: "Custom Range" },
  ];

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

  useEffect(() => {
    const loadReportData = async () => {
      setLoading(true);
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mock data based on selected report type
      const mockData = {
        overview: {
          totalEmployees: 156,
          activeEmployees: 142,
          coursesCompleted: 489,
          totalHours: 2847,
          certificates: 89,
          averageCompletion: 78,
          departmentStats: [
            {
              name: "Engineering",
              employees: 45,
              completed: 189,
              hours: 1124,
              completion: 85,
            },
            {
              name: "Marketing",
              employees: 28,
              completed: 98,
              hours: 567,
              completion: 72,
            },
            {
              name: "Sales",
              employees: 32,
              completed: 87,
              hours: 423,
              completion: 68,
            },
            {
              name: "Operations",
              employees: 25,
              completed: 67,
              hours: 398,
              completion: 90,
            },
            {
              name: "HR",
              employees: 12,
              completed: 28,
              hours: 189,
              completion: 95,
            },
            {
              name: "Finance",
              employees: 14,
              completed: 20,
              hours: 146,
              completion: 82,
            },
          ],
          monthlyProgress: [
            { month: "Jul", completions: 45, hours: 234 },
            { month: "Aug", completions: 52, hours: 289 },
            { month: "Sep", completions: 67, hours: 345 },
            { month: "Oct", completions: 73, hours: 401 },
            { month: "Nov", completions: 89, hours: 478 },
            { month: "Dec", completions: 94, hours: 512 },
            { month: "Jan", completions: 69, hours: 388 },
          ],
        },
        progress: {
          inProgress: 234,
          completed: 489,
          notStarted: 127,
          overdue: 23,
          progressByWeek: [
            { week: "Week 1", started: 23, completed: 18 },
            { week: "Week 2", started: 29, completed: 22 },
            { week: "Week 3", started: 31, completed: 25 },
            { week: "Week 4", started: 27, completed: 21 },
          ],
          topPerformers: [
            {
              name: "Sarah Johnson",
              department: "Engineering",
              completed: 12,
              hours: 67,
            },
            {
              name: "Mike Chen",
              department: "Marketing",
              completed: 9,
              hours: 52,
            },
            {
              name: "Emily Rodriguez",
              department: "Operations",
              completed: 11,
              hours: 58,
            },
          ],
        },
        completion: {
          totalAssignments: 850,
          completed: 489,
          completionRate: 57.5,
          averageTimeToComplete: 14.2,
          completionTrends: [
            {
              course: "Data Security Training",
              assigned: 156,
              completed: 148,
              rate: 94.9,
            },
            {
              course: "Compliance & Ethics",
              assigned: 156,
              completed: 142,
              rate: 91.0,
            },
            {
              course: "Safety Protocols",
              assigned: 134,
              completed: 118,
              rate: 88.1,
            },
            {
              course: "Leadership Skills",
              assigned: 89,
              completed: 67,
              rate: 75.3,
            },
            {
              course: "Project Management",
              assigned: 67,
              completed: 45,
              rate: 67.2,
            },
          ],
        },
      };

      setReportData(mockData[selectedReport] || mockData.overview);
      setLoading(false);
    };

    loadReportData();
  }, [selectedReport, dateRange, selectedDepartment]);

  const exportReport = async (format) => {
    try {
      // Simulate export
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // In real app, this would trigger actual download
      const filename = `${selectedReport}_report_${new Date().toISOString().split("T")[0]}.${format}`;
      console.log(`Exporting ${filename}`);

      // Create a mock download
      const element = document.createElement("a");
      element.href =
        "data:text/plain;charset=utf-8," +
        encodeURIComponent("Mock report data");
      element.download = filename;
      element.click();
    } catch (error) {
      console.error("Export failed:", error);
    }
  };

  const renderOverviewReport = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="card text-center">
          <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-text-dark">
            {reportData.totalEmployees}
          </div>
          <div className="text-sm text-text-medium">Total Employees</div>
        </div>
        <div className="card text-center">
          <Target className="h-8 w-8 text-green-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-text-dark">
            {reportData.coursesCompleted}
          </div>
          <div className="text-sm text-text-medium">Courses Completed</div>
        </div>
        <div className="card text-center">
          <Clock className="h-8 w-8 text-purple-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-text-dark">
            {reportData.totalHours.toLocaleString()}
          </div>
          <div className="text-sm text-text-medium">Total Hours</div>
        </div>
        <div className="card text-center">
          <Award className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-text-dark">
            {reportData.certificates}
          </div>
          <div className="text-sm text-text-medium">Certificates</div>
        </div>
        <div className="card text-center">
          <TrendingUp className="h-8 w-8 text-primary mx-auto mb-2" />
          <div className="text-2xl font-bold text-text-dark">
            {reportData.averageCompletion}%
          </div>
          <div className="text-sm text-text-medium">Avg. Completion</div>
        </div>
        <div className="card text-center">
          <BookOpen className="h-8 w-8 text-indigo-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-text-dark">
            {reportData.activeEmployees}
          </div>
          <div className="text-sm text-text-medium">Active Learners</div>
        </div>
      </div>

      {/* Department Performance */}
      <div className="card">
        <h3 className="text-lg font-semibold text-text-dark mb-4">
          Department Performance
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-background-dark">
                <th className="text-left py-2">Department</th>
                <th className="text-left py-2">Employees</th>
                <th className="text-left py-2">Completed</th>
                <th className="text-left py-2">Hours</th>
                <th className="text-left py-2">Completion Rate</th>
              </tr>
            </thead>
            <tbody>
              {reportData.departmentStats.map((dept, index) => (
                <tr key={index} className="border-b border-background-light">
                  <td className="py-3 font-medium text-text-dark">
                    {dept.name}
                  </td>
                  <td className="py-3 text-text-medium">{dept.employees}</td>
                  <td className="py-3 text-text-medium">{dept.completed}</td>
                  <td className="py-3 text-text-medium">{dept.hours}</td>
                  <td className="py-3">
                    <div className="flex items-center">
                      <div className="progress-bar w-20 mr-2">
                        <div
                          className="progress-fill"
                          style={{ width: `${dept.completion}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">
                        {dept.completion}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Monthly Progress Chart */}
      <div className="card">
        <h3 className="text-lg font-semibold text-text-dark mb-4">
          Monthly Learning Progress
        </h3>
        <div className="h-64 flex items-end justify-between space-x-2 border-b border-background-dark">
          {reportData.monthlyProgress.map((month, index) => (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div className="w-full max-w-12 space-y-1">
                <div
                  className="bg-primary rounded-t"
                  style={{
                    height: `${(month.completions / Math.max(...reportData.monthlyProgress.map((m) => m.completions))) * 200}px`,
                    minHeight: "4px",
                  }}
                />
                <div
                  className="bg-primary-light rounded-t"
                  style={{
                    height: `${(month.hours / Math.max(...reportData.monthlyProgress.map((m) => m.hours))) * 100}px`,
                    minHeight: "2px",
                  }}
                />
              </div>
              <div className="text-xs text-text-medium mt-2">{month.month}</div>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-center space-x-6 mt-4 text-sm">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-primary rounded mr-2" />
            <span>Completions</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-primary-light rounded mr-2" />
            <span>Hours</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderProgressReport = () => (
    <div className="space-y-6">
      {/* Progress Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card text-center">
          <div className="text-2xl font-bold text-blue-600">
            {reportData.inProgress}
          </div>
          <div className="text-sm text-text-medium">In Progress</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-green-600">
            {reportData.completed}
          </div>
          <div className="text-sm text-text-medium">Completed</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-gray-600">
            {reportData.notStarted}
          </div>
          <div className="text-sm text-text-medium">Not Started</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-red-600">
            {reportData.overdue}
          </div>
          <div className="text-sm text-text-medium">Overdue</div>
        </div>
      </div>

      {/* Weekly Progress */}
      <div className="card">
        <h3 className="text-lg font-semibold text-text-dark mb-4">
          Weekly Progress Trends
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-background-dark">
                <th className="text-left py-2">Week</th>
                <th className="text-left py-2">Courses Started</th>
                <th className="text-left py-2">Courses Completed</th>
                <th className="text-left py-2">Completion Rate</th>
              </tr>
            </thead>
            <tbody>
              {reportData.progressByWeek.map((week, index) => (
                <tr key={index} className="border-b border-background-light">
                  <td className="py-3 font-medium">{week.week}</td>
                  <td className="py-3">{week.started}</td>
                  <td className="py-3">{week.completed}</td>
                  <td className="py-3">
                    <span className="text-green-600 font-medium">
                      {Math.round((week.completed / week.started) * 100)}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top Performers */}
      <div className="card">
        <h3 className="text-lg font-semibold text-text-dark mb-4">
          Top Performers
        </h3>
        <div className="space-y-3">
          {reportData.topPerformers.map((performer, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-background-light rounded-lg"
            >
              <div>
                <div className="font-medium text-text-dark">
                  {performer.name}
                </div>
                <div className="text-sm text-text-medium">
                  {performer.department}
                </div>
              </div>
              <div className="text-right">
                <div className="font-medium text-text-dark">
                  {performer.completed} courses
                </div>
                <div className="text-sm text-text-medium">
                  {performer.hours} hours
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderCompletionReport = () => (
    <div className="space-y-6">
      {/* Completion Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card text-center">
          <div className="text-2xl font-bold text-text-dark">
            {reportData.totalAssignments}
          </div>
          <div className="text-sm text-text-medium">Total Assignments</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-green-600">
            {reportData.completed}
          </div>
          <div className="text-sm text-text-medium">Completed</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-primary">
            {reportData.completionRate}%
          </div>
          <div className="text-sm text-text-medium">Completion Rate</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-text-dark">
            {reportData.averageTimeToComplete}
          </div>
          <div className="text-sm text-text-medium">Avg. Days to Complete</div>
        </div>
      </div>

      {/* Course Completion Rates */}
      <div className="card">
        <h3 className="text-lg font-semibold text-text-dark mb-4">
          Course Completion Rates
        </h3>
        <div className="space-y-4">
          {reportData.completionTrends.map((course, index) => (
            <div
              key={index}
              className="border border-background-dark rounded-lg p-4"
            >
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-medium text-text-dark">{course.course}</h4>
                <span className="text-sm font-medium text-primary">
                  {course.rate}%
                </span>
              </div>
              <div className="flex justify-between text-sm text-text-medium mb-2">
                <span>
                  {course.completed} of {course.assigned} completed
                </span>
                <span>{course.assigned - course.completed} remaining</span>
              </div>
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${course.rate}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderReport = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      );
    }

    switch (selectedReport) {
      case "progress":
        return renderProgressReport();
      case "completion":
        return renderCompletionReport();
      case "overview":
      default:
        return renderOverviewReport();
    }
  };

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-text-dark mb-2">
            Learning Reports
          </h1>
          <p className="text-text-medium">
            Analyze your team's learning progress and performance
          </p>
        </div>
        <div className="flex items-center space-x-3 mt-4 lg:mt-0">
          <Button variant="secondary" onClick={() => exportReport("pdf")}>
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
          <Button variant="secondary" onClick={() => exportReport("csv")}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="card">
            <h3 className="font-semibold text-text-dark mb-4">Report Type</h3>
            <div className="space-y-2">
              {reportTypes.map((report) => {
                const Icon = report.icon;
                return (
                  <button
                    key={report.id}
                    onClick={() => setSelectedReport(report.id)}
                    className={`w-full flex items-center px-3 py-2 rounded-lg text-left transition-colors ${
                      selectedReport === report.id
                        ? "bg-primary text-white"
                        : "text-text-medium hover:bg-background-light"
                    }`}
                  >
                    <Icon className="h-4 w-4 mr-3" />
                    <span className="text-sm">{report.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Filters */}
          <div className="card mt-6">
            <h3 className="font-semibold text-text-dark mb-4">Filters</h3>
            <div className="space-y-4">
              <div>
                <label className="label">Date Range</label>
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="input"
                >
                  {dateRanges.map((range) => (
                    <option key={range.id} value={range.id}>
                      {range.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">Department</label>
                <select
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  className="input"
                >
                  <option value="all">All Departments</option>
                  {departments.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-text-dark">
                  {reportTypes.find((r) => r.id === selectedReport)?.name}
                </h2>
                <p className="text-sm text-text-medium">
                  {dateRanges.find((r) => r.id === dateRange)?.name}
                  {selectedDepartment !== "all" &&
                    ` • ${selectedDepartment} Department`}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  More Filters
                </Button>
                <Button variant="ghost" size="sm">
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule
                </Button>
              </div>
            </div>

            {renderReport()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
