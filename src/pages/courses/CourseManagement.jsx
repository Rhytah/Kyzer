// src/pages/courses/CourseManagement.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCourseStore } from '@/store/courseStore';
import { useAuth } from '@/hooks/auth/useAuth';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff, 
  BookOpen, 
  Play,
  Settings,
  Users,
  Clock,
  Star
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import CourseForm from '@/components/course/CourseForm';
import LessonForm from '@/components/course/LessonForm';
import { useToast } from '@/components/ui';

export default function CourseManagement() {
  const { user } = useAuth();
  const { success, error: showError, warning } = useToast();
  
  // Store selectors - individual to prevent infinite loops
  const courses = useCourseStore(state => state.courses);
  const loading = useCourseStore(state => state.loading);
  const error = useCourseStore(state => state.error);
  
  const fetchCourses = useCourseStore(state => state.actions.fetchCourses);
  const deleteCourse = useCourseStore(state => state.actions.deleteCourse);
  const toggleCoursePublish = useCourseStore(state => state.actions.toggleCoursePublish);
  const fetchCourseLessons = useCourseStore(state => state.actions.fetchCourseLessons);

  const [showCourseForm, setShowCourseForm] = useState(false);
  const [showLessonForm, setShowLessonForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [editingLesson, setEditingLesson] = useState(null);
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [courseLessons, setCourseLessons] = useState({});

  useEffect(() => {
    fetchCourses();
  }, []); // Empty dependency array to run only once

  const handleCourseSuccess = (courseData) => {
    setShowCourseForm(false);
    setEditingCourse(null);
    // Don't call fetchCourses here to prevent infinite loops
    // The store will update automatically
  };

  const handleLessonSuccess = (lessonData) => {
    setShowLessonForm(false);
    setEditingLesson(null);
    if (selectedCourseId) {
      loadCourseLessons(selectedCourseId);
    }
  };

  const handleEditCourse = (course) => {
    setEditingCourse(course);
    setShowCourseForm(true);
  };

  const handleDeleteCourse = async (courseId) => {
    if (window.confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
      const result = await deleteCourse(courseId);
      if (result.success) {
        success('Course deleted successfully!');
        // Don't call fetchCourses here to prevent infinite loops
        // The store will update automatically
      } else {
        showError(result.error || 'Failed to delete course');
      }
    }
  };

  const handleTogglePublish = async (courseId, currentStatus) => {
    const isPublished = currentStatus === 'published';
    const result = await toggleCoursePublish(courseId, !isPublished);
    if (result.data) {
      const message = isPublished 
        ? 'Course unpublished successfully!' 
        : 'Course published successfully!';
      success(message);
      // Don't call fetchCourses here to prevent infinite loops
      // The store will update automatically
    } else {
      showError(result.error || 'Failed to update course status');
    }
  };

  const handleAddLesson = (courseId) => {
    setSelectedCourseId(courseId);
    setShowLessonForm(true);
  };

  const handleEditLesson = (lesson, courseId) => {
    setEditingLesson(lesson);
    setSelectedCourseId(courseId);
    setShowLessonForm(true);
  };

  const loadCourseLessons = async (courseId) => {
    const result = await fetchCourseLessons(courseId);
    if (result.data) {
      setCourseLessons(prev => ({
        ...prev,
        [courseId]: result.data
      }));
    }
  };

  const toggleLessonsView = (courseId) => {
    if (courseLessons[courseId]) {
      setCourseLessons(prev => {
        const newState = { ...prev };
        delete newState[courseId];
        return newState;
      });
    } else {
      loadCourseLessons(courseId);
    }
  };

  if (loading.courses) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Course Management</h1>
          <p className="text-gray-600 mt-1">
            Create and manage your courses
          </p>
        </div>
        <div className="flex gap-3">
          <Link to="/app/courses/categories">
            <Button variant="secondary">
              <Settings className="w-4 h-4 mr-2" />
              Manage Categories
            </Button>
          </Link>
          <Button onClick={() => setShowCourseForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Course
          </Button>
        </div>
      </div>

      {/* Course Form Modal */}
      {showCourseForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <CourseForm
              course={editingCourse}
              onSuccess={handleCourseSuccess}
              onCancel={() => {
                setShowCourseForm(false);
                setEditingCourse(null);
              }}
            />
          </div>
        </div>
      )}

      {/* Lesson Form Modal */}
      {showLessonForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <LessonForm
              lesson={editingLesson}
              courseId={selectedCourseId}
              onSuccess={handleLessonSuccess}
              onCancel={() => {
                setShowLessonForm(false);
                setEditingLesson(null);
                setSelectedCourseId(null);
              }}
            />
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <Card className="p-4 bg-red-50 border border-red-200">
          <p className="text-red-600">{error}</p>
        </Card>
      )}

      {/* Courses List */}
      <div className="space-y-4">
        {courses.length === 0 ? (
          <Card className="p-12 text-center">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No courses yet
            </h3>
            <p className="text-gray-600 mb-4">
              Create your first course to get started
            </p>
            <Button onClick={() => setShowCourseForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Course
            </Button>
          </Card>
        ) : (
          courses.map(course => (
            <Card key={course.id} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-semibold text-gray-900">
                      {course.title}
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      course.status === 'published' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {course.status}
                    </span>
                    {course.is_published && (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                        Published
                      </span>
                    )}
                  </div>
                  
                  <p className="text-gray-600 mb-3">{course.description}</p>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{course.duration_minutes || 0} min</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <BookOpen className="w-4 h-4" />
                      <span>{courseLessons[course.id]?.length || 0} lessons</span>
                    </div>
                    {course.category_id && (
                      <span className="px-2 py-1 bg-gray-100 rounded">
                        {course.category_id}
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2 ml-4">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => toggleLessonsView(course.id)}
                  >
                    {courseLessons[course.id] ? 'Hide' : 'Show'} Lessons
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleTogglePublish(course.id, course.status)}
                  >
                    {course.status === 'published' ? (
                      <>
                        <EyeOff className="w-4 h-4 mr-1" />
                        Unpublish
                      </>
                    ) : (
                      <>
                        <Eye className="w-4 h-4 mr-1" />
                        Publish
                      </>
                    )}
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleEditCourse(course)}
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleAddLesson(course.id)}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Lesson
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteCourse(course.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Lessons Section */}
              {courseLessons[course.id] && (
                <div className="border-t border-gray-200 pt-4 mt-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-900">Lessons</h4>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleAddLesson(course.id)}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Lesson
                    </Button>
                  </div>
                  
                  <div className="space-y-2">
                    {courseLessons[course.id].map(lesson => (
                      <div
                        key={lesson.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium text-gray-500">
                            {lesson.order_index}.
                          </span>
                          <div>
                            <h5 className="font-medium text-gray-900">
                              {lesson.title}
                            </h5>
                            <p className="text-sm text-gray-500">
                              {lesson.lesson_type} • {lesson.duration_minutes || 0} min
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditLesson(lesson, course.id)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  );
} 