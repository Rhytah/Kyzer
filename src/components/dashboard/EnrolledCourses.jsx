// src/components/dashboard/EnrolledCourses.jsx
import { Link } from "react-router-dom";
import { Play, Clock, BookOpen, CheckCircle } from "lucide-react";

export  function EnrolledCourses({
  enrollments = [],
  loading = false,
  showAll = false,
  limit = null,
}) {
  const displayedCourses =
    showAll || !limit ? enrollments : enrollments.slice(0, limit);

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, index) => (
          <div
            key={index}
            className="bg-white rounded-xl border border-background-dark p-6"
          >
            <div className="animate-pulse">
              <div className="flex space-x-4">
                <div className="w-20 h-16 bg-background-medium rounded-lg"></div>
                <div className="flex-1 space-y-2">
                  <div className="w-3/4 h-4 bg-background-medium rounded"></div>
                  <div className="w-1/2 h-3 bg-background-medium rounded"></div>
                  <div className="w-1/4 h-3 bg-background-medium rounded"></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!enrollments || enrollments.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-background-dark p-8 text-center">
        <BookOpen className="w-12 h-12 text-text-light mx-auto mb-4" />
        <h3 className="text-lg font-medium text-text-dark mb-2">
          No enrolled courses yet
        </h3>
        <p className="text-text-light mb-6">
          Start your learning journey by enrolling in your first course.
        </p>
        <Link
          to="/app/courses"
          className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
        >
          Browse Courses
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {displayedCourses.map((enrollment) => {
        const course = enrollment.courses || enrollment.course;
        const progress = enrollment.progress || 0;
        const isCompleted = enrollment.completed_at || progress >= 100;

        return (
          <div
            key={enrollment.id}
            className="bg-white rounded-xl border border-background-dark p-6 hover:shadow-md transition-shadow duration-200"
          >
            <div className="flex items-start space-x-4">
              {/* Course Thumbnail */}
              <div className="relative flex-shrink-0">
                <img
                  src={course?.thumbnail_url || "/course-placeholder.jpg"}
                  alt={course?.title}
                  className="w-20 h-16 object-cover rounded-lg bg-background-medium"
                />
                {isCompleted && (
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>

              {/* Course Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-text-dark mb-1 line-clamp-1">
                      {course?.title}
                    </h3>
                    <p className="text-xs text-text-light mb-3 line-clamp-2">
                      {course?.description}
                    </p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-3">
                  <div className="flex items-center justify-between text-xs text-text-light mb-1">
                    <span>Progress</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <div className="w-full bg-background-medium rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        isCompleted
                          ? "bg-green-500"
                          : progress > 0
                            ? "bg-primary"
                            : "bg-background-dark"
                      }`}
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    ></div>
                  </div>
                </div>

                {/* Course Meta & Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-xs text-text-light">
                    {course?.duration && (
                      <div className="flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>{course.duration}</span>
                      </div>
                    )}
                    {course?.difficulty && (
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          course.difficulty === "beginner"
                            ? "bg-green-100 text-green-700"
                            : course.difficulty === "intermediate"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-red-100 text-red-700"
                        }`}
                      >
                        {course.difficulty}
                      </span>
                    )}
                  </div>

                  <Link
                    to={`/courses/${course?.id}/${isCompleted ? "completed" : "continue"}`}
                    className={`inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                      isCompleted
                        ? "bg-green-100 text-green-700 hover:bg-green-200"
                        : "bg-primary text-white hover:bg-primary-dark"
                    }`}
                  >
                    {isCompleted ? (
                      <>
                        <CheckCircle className="w-3 h-3 mr-1" />
                        View Certificate
                      </>
                    ) : (
                      <>
                        <Play className="w-3 h-3 mr-1" />
                        {progress > 0 ? "Continue" : "Start"}
                      </>
                    )}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {/* Show More Link */}
      {!showAll && enrollments.length > (limit || 3) && (
        <div className="text-center pt-4">
          <Link
            to="/my-courses"
            className="text-sm text-primary hover:text-primary-dark font-medium transition-colors"
          >
            View all {enrollments.length} enrolled courses
          </Link>
        </div>
      )}
    </div>
  );
}

export default EnrolledCourses;