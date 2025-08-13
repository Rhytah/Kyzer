// src/pages/courses/CourseCatalog.jsx
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useCourseStore } from "@/store/courseStore";
import { useAuth } from "@/hooks/auth/useAuth";
import { 
  Search, 
  Filter, 
  Grid, 
  List, 
  Star, 
  Clock, 
  Users, 
  BookOpen, 
  Play, 
  Settings,
  TrendingUp,
  Award
} from "lucide-react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

const CourseCatalog = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
    // Store selectors - memoized to prevent infinite loops
  const courses = useCourseStore(state => state.courses);
  const enrolledCourses = useCourseStore(state => state.enrolledCourses);
  const loading = useCourseStore(state => state.loading);
  const error = useCourseStore(state => state.error);
  
  const fetchCourses = useCourseStore(state => state.actions.fetchCourses);
  const enrollInCourse = useCourseStore(state => state.actions.enrollInCourse);

  // Local state
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedLevel, setSelectedLevel] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState("grid");

  // Categories and levels
  // Store selectors - individual to prevent infinite loops
  const storeCategories = useCourseStore(state => state.categories);
  const loadingCategories = useCourseStore(state => state.loading.categories);
  const fetchCategories = useCourseStore(state => state.actions.fetchCategories);
  
  // Fetch categories on mount
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);
  
  // Build categories array with "All Categories" option
  const categories = [
    { id: "all", name: "All Categories", color: "bg-gray-100 text-gray-700" },
    ...(storeCategories?.map(cat => ({
      id: cat.id,
      name: cat.name,
      color: `bg-[${cat.color}]20 text-[${cat.color}]`
    })) || [])
  ];

  const levels = [
    { id: "all", name: "All Levels", color: "bg-gray-100 text-gray-700" },
    { id: "beginner", name: "Beginner", color: "bg-green-100 text-green-700" },
    { id: "intermediate", name: "Intermediate", color: "bg-yellow-100 text-yellow-700" },
    { id: "advanced", name: "Advanced", color: "bg-red-100 text-red-700" },
  ];

  const sortOptions = [
    { id: "newest", name: "Newest First", icon: TrendingUp },
    { id: "popular", name: "Most Popular", icon: Users },
    { id: "rating", name: "Highest Rated", icon: Star },
    { id: "duration", name: "Shortest First", icon: Clock },
  ];

  // Fetch courses on mount
  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  // Check if user is enrolled in a course
  const isEnrolled = (courseId) => {
    return enrolledCourses?.some(course => 
      course.course_id === courseId || course.id === courseId
    );
  };

  // Handle course enrollment
  const handleEnroll = async (courseId) => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      await enrollInCourse(user.id, courseId);
      // Don't refresh here to prevent infinite loops
      // The store will update automatically
    } catch (error) {
      console.error('Enrollment failed:', error);
    }
  };

  // Filter and sort courses
  const filteredCourses = courses?.filter((course) => {
    const matchesSearch = course.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Category filtering with real categories
    const matchesCategory = selectedCategory === "all" || 
                           course.category_id === selectedCategory;
    
    const matchesLevel = selectedLevel === "all" || 
                        course.difficulty_level?.toLowerCase() === selectedLevel.toLowerCase();
    
    return matchesSearch && matchesCategory && matchesLevel;
  }) || [];

  const sortedCourses = [...filteredCourses].sort((a, b) => {
    switch (sortBy) {
      case "newest":
        return new Date(b.created_at) - new Date(a.created_at);
      case "popular":
        return (b.students || 0) - (a.students || 0);
      case "rating":
        return (b.rating || 0) - (a.rating || 0);
      case "duration":
        return (a.duration_minutes || 0) - (b.duration_minutes || 0);
      default:
        return 0;
    }
  });

  // Course card component
  const CourseCard = ({ course }) => (
    <Card className="group hover:shadow-lg transition-all duration-300 overflow-hidden">
      {/* Course Image */}
      <div className="relative h-48 bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <BookOpen className="w-16 h-16 text-indigo-400" />
        
        {/* Status Badges */}
        {course.is_published && (
          <div className="absolute top-3 left-3 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
            Published
          </div>
        )}
        
        {isEnrolled(course.id) && (
          <div className="absolute top-3 right-3 bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-medium">
            Enrolled
          </div>
        )}

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
          <Button
            className="opacity-0 group-hover:opacity-100 transition-opacity"
            size="sm"
            onClick={() => navigate(`/app/courses/${course.id}`)}
          >
            <Play className="w-4 h-4 mr-2" />
            View Course
          </Button>
        </div>
      </div>

      {/* Course Content */}
      <div className="p-6">
        {/* Category and Level */}
        <div className="flex items-center gap-2 mb-3">
          {course.category_id && (
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
              {course.category_id}
            </span>
          )}
          {course.difficulty_level && (
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
              {course.difficulty_level}
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
          {course.title}
        </h3>

        {/* Description */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {course.description}
        </p>

        {/* Course Stats */}
        <div className="flex items-center gap-4 mb-4 text-sm text-gray-500">
          {course.duration_minutes && (
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{Math.floor(course.duration_minutes / 60)}h {course.duration_minutes % 60}m</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <BookOpen className="w-4 h-4" />
            <span>{course.lessons?.length || 0} lessons</span>
          </div>
        </div>

        {/* Action Button */}
        <Button
          className="w-full"
          variant={isEnrolled(course.id) ? "secondary" : "default"}
          onClick={() => handleEnroll(course.id)}
        >
          {isEnrolled(course.id) ? (
            <>
              <Award className="w-4 h-4 mr-2" />
              Continue Learning
            </>
          ) : (
            <>
              <BookOpen className="w-4 h-4 mr-2" />
              Enroll Now
            </>
          )}
        </Button>
      </div>
    </Card>
  );

  // Course list item component
  const CourseListItem = ({ course }) => (
    <Card className="p-6 hover:shadow-md transition-shadow">
      <div className="flex gap-6">
        {/* Course Image */}
        <div className="w-48 h-32 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
          <BookOpen className="w-12 h-12 text-indigo-400" />
        </div>

        {/* Course Details */}
        <div className="flex-1">
          <div className="flex items-start justify-between mb-3">
            <div>
              {/* Badges */}
              <div className="flex items-center gap-2 mb-2">
                {course.category_id && (
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                    {course.category_id}
                  </span>
                )}
                {course.difficulty_level && (
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                    {course.difficulty_level}
                  </span>
                )}
                {course.is_published && (
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                    Published
                  </span>
                )}
              </div>

              {/* Title and Description */}
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {course.title}
              </h3>
              <p className="text-gray-600 mb-3 line-clamp-2">
                {course.description}
              </p>
            </div>
          </div>

          {/* Course Stats */}
          <div className="flex items-center gap-6 mb-4 text-sm text-gray-500">
            {course.duration_minutes && (
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{Math.floor(course.duration_minutes / 60)}h {course.duration_minutes % 60}m</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <BookOpen className="w-4 h-4" />
              <span>{course.lessons?.length || 0} lessons</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>{course.enrollments?.length || 0} students</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/app/courses/${course.id}`)}
              >
                <Play className="w-4 h-4 mr-2" />
                Preview
              </Button>
            </div>

            <Button
              variant={isEnrolled(course.id) ? "secondary" : "default"}
              onClick={() => handleEnroll(course.id)}
            >
              {isEnrolled(course.id) ? (
                <>
                  <Award className="w-4 h-4 mr-2" />
                  Continue Learning
                </>
              ) : (
                <>
                  <BookOpen className="w-4 h-4 mr-2" />
                  Enroll Now
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );

  // Loading state
  if (loading.courses) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <Card className="p-8 text-center">
        <div className="text-red-500 mb-4">
          <BookOpen className="w-16 h-16 mx-auto" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Error Loading Courses
        </h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <Button onClick={() => fetchCourses()}>
          Try Again
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Course Catalog</h1>
          <p className="text-gray-600 mt-1">
            Discover courses to advance your skills and career
          </p>
        </div>

        {/* View Controls */}
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === "grid" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("grid")}
          >
            <Grid className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("list")}
          >
            <List className="w-4 h-4" />
          </Button>
          
          {/* Course Management Button */}
          {user && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate('/app/courses/management')}
            >
              <Settings className="w-4 h-4 mr-2" />
              Manage Courses
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search courses..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Category Filter */}
          <select
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>

          {/* Level Filter */}
          <select
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
          >
            {levels.map((level) => (
              <option key={level.id} value={level.id}>
                {level.name}
              </option>
            ))}
          </select>

          {/* Sort */}
          <select
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            {sortOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.name}
              </option>
            ))}
          </select>
        </div>
      </Card>

      {/* Results Header */}
      <div className="flex items-center justify-between">
        <p className="text-gray-600">
          Showing {sortedCourses.length} of {courses.length} courses
        </p>

        {filteredCourses.length !== courses.length && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSearchTerm("");
              setSelectedCategory("all");
              setSelectedLevel("all");
            }}
          >
            Clear Filters
          </Button>
        )}
      </div>

      {/* Course Grid/List */}
      {sortedCourses.length === 0 ? (
        <Card className="p-12 text-center">
          <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No courses found
          </h3>
          <p className="text-gray-600 mb-4">
            Try adjusting your search criteria or browse all courses
          </p>
          <Button
            onClick={() => {
              setSearchTerm("");
              setSelectedCategory("all");
              setSelectedLevel("all");
            }}
          >
            View All Courses
          </Button>
        </Card>
      ) : (
        <div
          className={
            viewMode === "grid"
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              : "space-y-4"
          }
        >
          {sortedCourses.map((course) =>
            viewMode === "grid" ? (
              <CourseCard key={course.id} course={course} />
            ) : (
              <CourseListItem key={course.id} course={course} />
            )
          )}
        </div>
      )}

      {/* Load More */}
      {sortedCourses.length > 0 && (
        <div className="text-center py-8">
          <Button variant="secondary" size="lg">
            Load More Courses
          </Button>
        </div>
      )}
    </div>
  );
};

export default CourseCatalog;
