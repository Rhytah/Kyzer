import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  BookOpen,
  Clock,
  Play,
  CheckCircle,
  Award,
  Calendar,
  Filter,
  Search,
  BarChart3,
  Target,
} from "lucide-react";
import Button from "../../components/ui/Button";
import LoadingSpinner from "../../components/ui/LoadingSpinner";

const MyCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const statusOptions = [
    { id: "all", name: "All Courses" },
    { id: "in-progress", name: "In Progress" },
    { id: "completed", name: "Completed" },
    { id: "not-started", name: "Not Started" },
  ];

  useEffect(() => {
    const loadMyCourses = async () => {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setCourses([
        {
          id: 1,
          title: "Complete React Developer Course",
          instructor: "John Smith",
          thumbnail: "/course-placeholder.jpg",
          progress: 75,
          totalLessons: 120,
          completedLessons: 90,
          totalDuration: 40,
          timeSpent: 30,
          enrolledDate: "2024-01-15",
          lastAccessed: "2024-01-20",
          nextLesson: {
            id: 91,
            title: "Advanced Hooks Patterns",
            duration: 25,
          },
          status: "in-progress",
          certificate: null,
        },
        {
          id: 2,
          title: "JavaScript Fundamentals",
          instructor: "Sarah Johnson",
          thumbnail: "/course-placeholder.jpg",
          progress: 100,
          totalLessons: 80,
          completedLessons: 80,
          totalDuration: 25,
          timeSpent: 25,
          enrolledDate: "2023-12-01",
          lastAccessed: "2024-01-10",
          completedDate: "2024-01-10",
          status: "completed",
          certificate: {
            id: "cert-001",
            url: "/certificates/js-fundamentals.pdf",
          },
        },
        {
          id: 3,
          title: "CSS Grid and Flexbox",
          instructor: "Mike Chen",
          thumbnail: "/course-placeholder.jpg",
          progress: 30,
          totalLessons: 60,
          completedLessons: 18,
          totalDuration: 20,
          timeSpent: 6,
          enrolledDate: "2024-01-18",
          lastAccessed: "2024-01-19",
          nextLesson: {
            id: 19,
            title: "Grid Template Areas",
            duration: 15,
          },
          status: "in-progress",
        },
        {
          id: 4,
          title: "Node.js Backend Development",
          instructor: "Alex Rodriguez",
          thumbnail: "/course-placeholder.jpg",
          progress: 0,
          totalLessons: 100,
          completedLessons: 0,
          totalDuration: 45,
          timeSpent: 0,
          enrolledDate: "2024-01-22",
          lastAccessed: null,
          nextLesson: {
            id: 1,
            title: "Introduction to Node.js",
            duration: 20,
          },
          status: "not-started",
        },
      ]);

      setLoading(false);
    };

    loadMyCourses();
  }, []);

  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.instructor.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || course.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    const badges = {
      "in-progress": {
        color: "bg-blue-100 text-blue-700",
        text: "In Progress",
      },
      completed: { color: "bg-green-100 text-green-700", text: "Completed" },
      "not-started": {
        color: "bg-gray-100 text-gray-700",
        text: "Not Started",
      },
    };

    return badges[status] || badges["not-started"];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const calculateTimeRemaining = (timeSpent, totalDuration) => {
    const remaining = totalDuration - timeSpent;
    return remaining > 0 ? remaining : 0;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-dark mb-2">My Courses</h1>
        <p className="text-text-medium">
          Continue your learning journey and track your progress
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="card text-center">
          <div className="text-2xl font-bold text-primary mb-1">
            {courses.length}
          </div>
          <div className="text-sm text-text-medium">Total Courses</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-blue-600 mb-1">
            {courses.filter((c) => c.status === "in-progress").length}
          </div>
          <div className="text-sm text-text-medium">In Progress</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-green-600 mb-1">
            {courses.filter((c) => c.status === "completed").length}
          </div>
          <div className="text-sm text-text-medium">Completed</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-yellow-600 mb-1">
            {courses.reduce((total, course) => total + course.timeSpent, 0)}h
          </div>
          <div className="text-sm text-text-medium">Total Hours</div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-light h-4 w-4" />
          <input
            type="text"
            placeholder="Search your courses..."
            className="input pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="input w-auto min-w-40"
        >
          {statusOptions.map((option) => (
            <option key={option.id} value={option.id}>
              {option.name}
            </option>
          ))}
        </select>
      </div>

      {/* Course List */}
      <div className="space-y-6">
        {filteredCourses.map((course) => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>

      {/* No Courses */}
      {filteredCourses.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="h-12 w-12 text-text-light mx-auto mb-4" />
          <h3 className="text-lg font-medium text-text-dark mb-2">
            {courses.length === 0
              ? "You haven't enrolled in any courses yet"
              : "No courses match your filters"}
          </h3>
          <p className="text-text-medium mb-6">
            {courses.length === 0
              ? "Explore our course catalog to start learning something new"
              : "Try adjusting your search or filter criteria"}
          </p>
          {courses.length === 0 && (
            <Link to="/courses">
              <Button>
                <BookOpen className="h-4 w-4 mr-2" />
                Browse Courses
              </Button>
            </Link>
          )}
        </div>
      )}
    </div>
  );
};

// Course Card Component
const CourseCard = ({ course }) => {
  const statusBadge = getStatusBadge(course.status);
  const timeRemaining = calculateTimeRemaining(
    course.timeSpent,
    course.totalDuration,
  );

  return (
    <div className="card course-card">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Course Image */}
        <div className="lg:w-48 flex-shrink-0">
          <img
            src={course.thumbnail}
            alt={course.title}
            className="w-full h-32 lg:h-28 object-cover rounded-lg"
          />
        </div>

        {/* Course Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="text-xl font-semibold text-text-dark mb-1">
                {course.title}
              </h3>
              <p className="text-text-medium text-sm">by {course.instructor}</p>
            </div>
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${statusBadge.color}`}
            >
              {statusBadge.text}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-text-medium">Progress</span>
              <span className="text-sm font-medium text-text-dark">
                {course.progress}%
              </span>
            </div>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${course.progress}%` }}
              />
            </div>
            <div className="flex items-center justify-between mt-1 text-xs text-text-light">
              <span>
                {course.completedLessons} of {course.totalLessons} lessons
              </span>
              <span>
                {course.timeSpent}h of {course.totalDuration}h
              </span>
            </div>
          </div>

          {/* Course Stats */}
          <div className="flex flex-wrap gap-4 text-sm text-text-light mb-4">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              Enrolled {formatDate(course.enrolledDate)}
            </div>
            {course.lastAccessed && (
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                Last accessed {formatDate(course.lastAccessed)}
              </div>
            )}
            {course.completedDate && (
              <div className="flex items-center text-green-600">
                <CheckCircle className="h-4 w-4 mr-1" />
                Completed {formatDate(course.completedDate)}
              </div>
            )}
          </div>

          {/* Next Lesson or Actions */}
          {course.status === "not-started" && (
            <div className="bg-background-light rounded-lg p-4 mb-4">
              <h4 className="font-medium text-text-dark mb-1">
                Ready to start?
              </h4>
              <p className="text-sm text-text-medium">
                Begin with: {course.nextLesson.title}
              </p>
            </div>
          )}

          {course.status === "in-progress" && course.nextLesson && (
            <div className="bg-blue-50 rounded-lg p-4 mb-4">
              <h4 className="font-medium text-text-dark mb-1">Next lesson</h4>
              <p className="text-sm text-text-medium">
                {course.nextLesson.title} • {course.nextLesson.duration} min
              </p>
              {timeRemaining > 0 && (
                <p className="text-xs text-blue-600 mt-1">
                  ~{timeRemaining}h remaining
                </p>
              )}
            </div>
          )}

          {course.status === "completed" && course.certificate && (
            <div className="bg-green-50 rounded-lg p-4 mb-4">
              <div className="flex items-center">
                <Award className="h-5 w-5 text-green-600 mr-2" />
                <div>
                  <h4 className="font-medium text-green-900">
                    Course completed!
                  </h4>
                  <p className="text-sm text-green-700">
                    Certificate available for download
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="lg:w-40 flex-shrink-0 flex flex-col gap-2">
          {course.status === "completed" ? (
            <>
              <Button size="sm" variant="secondary">
                <BarChart3 className="h-4 w-4 mr-2" />
                View Stats
              </Button>
              {course.certificate && (
                <Button size="sm">
                  <Award className="h-4 w-4 mr-2" />
                  Certificate
                </Button>
              )}
            </>
          ) : (
            <>
              <Button size="sm">
                <Play className="h-4 w-4 mr-2" />
                {course.status === "not-started" ? "Start Course" : "Continue"}
              </Button>
              <Button size="sm" variant="secondary">
                <Target className="h-4 w-4 mr-2" />
                View Details
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// Helper function (moved outside component)
const getStatusBadge = (status) => {
  const badges = {
    "in-progress": { color: "bg-blue-100 text-blue-700", text: "In Progress" },
    completed: { color: "bg-green-100 text-green-700", text: "Completed" },
    "not-started": { color: "bg-gray-100 text-gray-700", text: "Not Started" },
  };

  return badges[status] || badges["not-started"];
};

// Helper function (moved outside component)
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

// Helper function (moved outside component)
const calculateTimeRemaining = (timeSpent, totalDuration) => {
  const remaining = totalDuration - timeSpent;
  return remaining > 0 ? remaining : 0;
};

export default MyCourses;
