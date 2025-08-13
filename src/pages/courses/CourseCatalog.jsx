// src/pages/courses/CourseCatalog.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCourseStore } from "@/store/courseStore";
import { useAuth } from "@/hooks/auth/useAuth";
import { Search, Filter, Grid, List, Star, Clock, Users, BookOpen, Play } from "lucide-react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { EnrollmentButton } from "../../components/course";

const CourseCatalog = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { 
    courses, 
    enrolledCourses, 
    loading, 
    error
  } = useCourseStore();
  
  const fetchCourses = useCourseStore(state => state.actions.fetchCourses);
  const enrollInCourse = useCourseStore(state => state.actions.enrollInCourse);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedLevel, setSelectedLevel] = useState("all");
  const [sortBy, setSortBy] = useState("popular");
  const [viewMode, setViewMode] = useState("grid"); // 'grid' or 'list'

  const categories = [
    "all",
    "Technology",
    "Business", 
    "Design",
    "Marketing",
    "Finance",
  ];
  const levels = ["all", "Beginner", "Intermediate", "Advanced"];

  useEffect(() => {
    // Fetch real courses from the store
    fetchCourses();
  }, []); // Remove fetchCourses dependency to prevent infinite loop

  // Check if user is enrolled in a course
  const isEnrolled = (courseId) => {
    return enrolledCourses?.some(course => course.course_id === courseId || course.id === courseId);
  };

  // Handle course enrollment
  const handleEnroll = async (courseId) => {
    if (!user) {
      navigate('/auth/login');
      return;
    }

    try {
      await enrollInCourse(user.id, courseId);
      // Refresh courses to update enrollment status
      fetchCourses();
    } catch (error) {
      // Handle enrollment error silently or show user-friendly message
    }
  };



  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      course.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || course.category === selectedCategory;
    const matchesLevel = selectedLevel === "all" || course.difficulty_level === selectedLevel;
    
    return matchesSearch && matchesCategory && matchesLevel;
  });

  const sortedCourses = [...filteredCourses].sort((a, b) => {
    switch (sortBy) {
      case "popular":
        return b.students - a.students;
      case "rating":
        return b.rating - a.rating;
      case "price-low":
        return a.price - b.price;
      case "price-high":
        return b.price - a.price;
      case "newest":
        return b.id - a.id; // Mock newest
      default:
        return 0;
    }
  });

  const CourseCard = ({ course }) => (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 group">
      <div className="relative">
        <div className="w-full h-48 bg-background-medium flex items-center justify-center">
          <BookOpen className="w-16 h-16 text-text-muted" />
        </div>
        {course.featured && (
          <div className="absolute top-3 left-3 bg-warning-default text-white px-2 py-1 rounded-full text-xs font-medium">
            Featured
          </div>
        )}
        {isEnrolled(course.id) && (
          <div className="absolute top-3 right-3 bg-success-default text-white px-2 py-1 rounded-full text-xs font-medium">
            Enrolled
          </div>
        )}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
          <Button
            className="opacity-0 group-hover:opacity-100 transition-opacity"
            size="sm"
          >
            <Play className="w-4 h-4 mr-2" />
            Preview
          </Button>
        </div>
      </div>

      <div className="p-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs bg-primary-light text-primary-default px-2 py-1 rounded-full">
            {course.category}
          </span>
          <span className="text-xs text-text-muted">{course.difficulty_level}</span>
        </div>

        <h3 className="text-lg font-semibold text-text-dark mb-2 line-clamp-2">
          {course.title}
        </h3>

        <p className="text-text-light text-sm mb-4 line-clamp-2">
          {course.description}
        </p>

        <div className="flex items-center gap-2 mb-4 text-sm text-text-muted">
          <Clock className="w-4 h-4" />
          <span>
            {Math.floor(course.duration / 60)}h {course.duration % 60}m
          </span>
          <Users className="w-4 h-4 ml-2" />
          <span>{course.students.toLocaleString()}</span>
        </div>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-warning-default text-warning-default" />
            <span className="text-sm font-medium">{course.rating}</span>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-text-dark">
              ${course.price}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-1 mb-4">
          {course.tags.slice(0, 3).map((tag, index) => (
            <span
              key={index}
              className="text-xs bg-background-light text-text-medium px-2 py-1 rounded"
            >
              {tag}
            </span>
          ))}
        </div>

        <Button
          className="w-full"
          variant={isEnrolled(course.id) ? "secondary" : "default"}
          onClick={() => handleEnroll(course.id)}
        >
          {isEnrolled(course.id) ? "Continue Learning" : "Enroll Now"}
        </Button>
      </div>
    </Card>
  );

  const CourseListItem = ({ course }) => (
    <Card className="p-6 hover:shadow-md transition-shadow">
      <div className="flex gap-6">
        <div className="w-48 h-32 bg-background-medium rounded-lg flex items-center justify-center flex-shrink-0">
          <BookOpen className="w-12 h-12 text-text-muted" />
        </div>

        <div className="flex-1">
          <div className="flex items-start justify-between mb-3">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs bg-primary-light text-primary-default px-2 py-1 rounded-full">
                  {course.category}
                </span>
                <span className="text-xs text-text-muted">{course.difficulty_level}</span>
                {course.featured && (
                  <span className="text-xs bg-warning-light text-warning-default px-2 py-1 rounded-full">
                    Featured
                  </span>
                )}
              </div>
              <h3 className="text-xl font-semibold text-text-dark mb-2">
                {course.title}
              </h3>
              <p className="text-text-light mb-3">{course.description}</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-text-dark">
                ${course.price}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6 mb-3 text-sm text-text-muted">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>
                {Math.floor(course.duration / 60)}h {course.duration % 60}m
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>{course.students.toLocaleString()} students</span>
            </div>
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-warning-default text-warning-default" />
              <span>{course.rating}</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex flex-wrap gap-1">
              {course.tags.map((tag, index) => (
                <span
                  key={index}
                  className="text-xs bg-background-light text-text-medium px-2 py-1 rounded"
                >
                  {tag}
                </span>
              ))}
            </div>

            <Button variant={isEnrolled(course.id) ? "secondary" : "default"} onClick={() => handleEnroll(course.id)}>
              {isEnrolled(course.id) ? "Continue Learning" : "Enroll Now"}
            </Button>
            <EnrollmentButton courseId={course.id} />
          </div>
        </div>
      </div>
    </Card>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text-dark">Course Catalog</h1>
          <p className="text-text-light mt-1">
            Discover courses to advance your skills and career
          </p>
        </div>

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
        </div>
      </div>

      {/* Filters */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="text"
              placeholder="Search courses..."
              className="w-full pl-10 pr-4 py-2 border border-background-dark rounded-lg focus:ring-2 focus:ring-primary-default focus:border-primary-default"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Category Filter */}
          <select
            className="px-3 py-2 border border-background-dark rounded-lg focus:ring-2 focus:ring-primary-default focus:border-primary-default"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category === "all" ? "All Categories" : category}
              </option>
            ))}
          </select>

          {/* Level Filter */}
          <select
            className="px-3 py-2 border border-background-dark rounded-lg focus:ring-2 focus:ring-primary-default focus:border-primary-default"
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
          >
            {levels.map((level) => (
              <option key={level} value={level}>
                {level === "all" ? "All Levels" : level}
              </option>
            ))}
          </select>

          {/* Sort */}
          <select
            className="px-3 py-2 border border-background-dark rounded-lg focus:ring-2 focus:ring-primary-default focus:border-primary-default"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="popular">Most Popular</option>
            <option value="rating">Highest Rated</option>
            <option value="newest">Newest</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
          </select>
        </div>
      </Card>

      {/* Results Header */}
      <div className="flex items-center justify-between">
        <p className="text-text-light">
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
          <BookOpen className="w-16 h-16 text-text-muted mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-text-dark mb-2">
            No courses found
          </h3>
          <p className="text-text-light mb-4">
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
}

export default CourseCatalog;
