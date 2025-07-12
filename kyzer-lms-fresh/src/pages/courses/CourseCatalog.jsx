// src/pages/courses/CourseCatalog.jsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useCourses } from "@/hooks/courses/useCourses";
import { useEnrollment } from "@/hooks/courses/useEnrollment";
import {
  Search,
  Filter,
  Star,
  Clock,
  Users,
  BookOpen,
  Play,
  CheckCircle,
  Grid,
  List,
} from "lucide-react";

export default function CourseCatalog() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState("");
  const [showFreeOnly, setShowFreeOnly] = useState(false);
  const [viewMode, setViewMode] = useState("grid");

  const { courses, loading, searchCourses } = useCourses({
    search: searchTerm,
    category: selectedCategory,
    difficulty: selectedDifficulty,
    free: showFreeOnly,
  });

  const { isEnrolledInCourse } = useEnrollment();

  const categories = [
    "Frontend Development",
    "Backend Development",
    "JavaScript",
    "CSS & Styling",
    "Data Science",
  ];

  const difficulties = ["beginner", "intermediate", "advanced"];

  const handleSearch = (term) => {
    setSearchTerm(term);
    searchCourses(term);
  };

  const CourseCard = ({ course }) => {
    const isEnrolled = isEnrolledInCourse(course.id);

    return (
      <div className="bg-white rounded-xl border border-background-dark overflow-hidden hover:shadow-lg transition-shadow duration-200">
        {/* Course Image */}
        <div className="relative h-48 bg-background-medium">
          <img
            src={course.thumbnail_url || "/course-placeholder.jpg"}
            alt={course.title}
            className="w-full h-full object-cover"
          />
          {course.price === 0 && (
            <span className="absolute top-3 left-3 px-2 py-1 bg-green-500 text-white text-xs font-medium rounded-full">
              Free
            </span>
          )}
          {isEnrolled && (
            <span className="absolute top-3 right-3 px-2 py-1 bg-blue-500 text-white text-xs font-medium rounded-full">
              Enrolled
            </span>
          )}
        </div>

        {/* Course Content */}
        <div className="p-6">
          <div className="mb-3">
            <span className="text-xs text-primary font-medium">
              {course.categories?.name}
            </span>
          </div>

          <h3 className="text-lg font-semibold text-text-dark mb-2 line-clamp-2">
            {course.title}
          </h3>

          <p className="text-sm text-text-light mb-4 line-clamp-3">
            {course.description}
          </p>

          {/* Course Meta */}
          <div className="flex items-center justify-between text-xs text-text-muted mb-4">
            <div className="flex items-center space-x-4">
              {course.rating && (
                <div className="flex items-center space-x-1">
                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  <span>{course.rating}</span>
                </div>
              )}
              {course.students && (
                <div className="flex items-center space-x-1">
                  <Users className="w-3 h-3" />
                  <span>{course.students.toLocaleString()}</span>
                </div>
              )}
              {course.duration && (
                <div className="flex items-center space-x-1">
                  <Clock className="w-3 h-3" />
                  <span>{course.duration}</span>
                </div>
              )}
            </div>

            {course.difficulty && (
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

          {/* Price and Action */}
          <div className="flex items-center justify-between">
            <div>
              {course.price === 0 ? (
                <span className="text-lg font-bold text-green-600">Free</span>
              ) : (
                <span className="text-lg font-bold text-text-dark">
                  ${course.price}
                </span>
              )}
            </div>

            <Link
              to={`/courses/${course.id}`}
              className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isEnrolled
                  ? "bg-green-100 text-green-700 hover:bg-green-200"
                  : "bg-primary text-white hover:bg-primary-dark"
              }`}
            >
              {isEnrolled ? (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Continue
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  {course.price === 0 ? "Start Free" : "Enroll Now"}
                </>
              )}
            </Link>
          </div>
        </div>
      </div>
    );
  };

  const CourseListItem = ({ course }) => {
    const isEnrolled = isEnrolledInCourse(course.id);

    return (
      <div className="bg-white rounded-xl border border-background-dark p-6 hover:shadow-md transition-shadow duration-200">
        <div className="flex items-start space-x-6">
          {/* Course Image */}
          <div className="relative w-24 h-18 bg-background-medium rounded-lg overflow-hidden flex-shrink-0">
            <img
              src={course.thumbnail_url || "/course-placeholder.jpg"}
              alt={course.title}
              className="w-full h-full object-cover"
            />
            {course.price === 0 && (
              <span className="absolute top-1 left-1 px-1 py-0.5 bg-green-500 text-white text-xs font-medium rounded">
                Free
              </span>
            )}
          </div>

          {/* Course Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="mb-1">
                  <span className="text-xs text-primary font-medium">
                    {course.categories?.name}
                  </span>
                </div>

                <h3 className="text-lg font-semibold text-text-dark mb-2">
                  {course.title}
                </h3>

                <p className="text-sm text-text-light mb-3 line-clamp-2">
                  {course.description}
                </p>

                {/* Course Meta */}
                <div className="flex items-center space-x-4 text-xs text-text-muted">
                  {course.rating && (
                    <div className="flex items-center space-x-1">
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      <span>{course.rating}</span>
                    </div>
                  )}
                  {course.students && (
                    <div className="flex items-center space-x-1">
                      <Users className="w-3 h-3" />
                      <span>{course.students.toLocaleString()}</span>
                    </div>
                  )}
                  {course.duration && (
                    <div className="flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>{course.duration}</span>
                    </div>
                  )}
                  {course.difficulty && (
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
              </div>

              {/* Price and Action */}
              <div className="text-right ml-6">
                <div className="mb-3">
                  {course.price === 0 ? (
                    <span className="text-lg font-bold text-green-600">
                      Free
                    </span>
                  ) : (
                    <span className="text-lg font-bold text-text-dark">
                      ${course.price}
                    </span>
                  )}
                </div>

                <Link
                  to={`/courses/${course.id}`}
                  className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isEnrolled
                      ? "bg-green-100 text-green-700 hover:bg-green-200"
                      : "bg-primary text-white hover:bg-primary-dark"
                  }`}
                >
                  {isEnrolled ? (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Continue
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      {course.price === 0 ? "Start Free" : "Enroll Now"}
                    </>
                  )}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-dark mb-2">
            Course Catalog
          </h1>
          <p className="text-text-light">
            Discover courses designed to help you master new skills and advance
            your career
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl border border-background-dark p-6 mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-light" />
                <input
                  type="text"
                  placeholder="Search courses..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-background-dark rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-3 border border-background-dark rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* Difficulty Filter */}
            <div>
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="w-full px-3 py-3 border border-background-dark rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                <option value="">All Levels</option>
                {difficulties.map((difficulty) => (
                  <option key={difficulty} value={difficulty}>
                    {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Additional Filters */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-background-medium">
            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={showFreeOnly}
                  onChange={(e) => setShowFreeOnly(e.target.checked)}
                  className="rounded border-background-dark focus:ring-primary/20"
                />
                <span className="text-sm text-text-medium">
                  Free courses only
                </span>
              </label>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === "grid"
                    ? "bg-primary text-white"
                    : "bg-background-medium text-text-light hover:bg-background-dark"
                }`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === "list"
                    ? "bg-primary text-white"
                    : "bg-background-medium text-text-light hover:bg-background-dark"
                }`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-text-medium">
            {loading ? "Loading courses..." : `${courses.length} courses found`}
          </p>
        </div>

        {/* Course Grid/List */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <div
                key={index}
                className="bg-white rounded-xl border border-background-dark overflow-hidden"
              >
                <div className="h-48 bg-background-medium animate-pulse"></div>
                <div className="p-6 space-y-4">
                  <div className="h-4 bg-background-medium rounded animate-pulse"></div>
                  <div className="h-6 bg-background-medium rounded animate-pulse"></div>
                  <div className="h-16 bg-background-medium rounded animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-text-light mx-auto mb-4" />
            <h3 className="text-lg font-medium text-text-dark mb-2">
              No courses found
            </h3>
            <p className="text-text-light">
              Try adjusting your search criteria or browse all courses
            </p>
          </div>
        ) : (
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                : "space-y-4"
            }
          >
            {courses.map((course) =>
              viewMode === "grid" ? (
                <CourseCard key={course.id} course={course} />
              ) : (
                <CourseListItem key={course.id} course={course} />
              ),
            )}
          </div>
        )}
      </div>
    </div>
  );
}
