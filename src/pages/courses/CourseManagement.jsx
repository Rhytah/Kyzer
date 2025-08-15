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
  Star,
  ChevronDown,
  ChevronRight,
  FolderOpen,
  FileText
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import CourseForm from '@/components/course/CourseForm';
import LessonForm from '@/components/course/LessonForm';
import ModuleForm from '@/components/course/ModuleForm';
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
  const fetchCourseModules = useCourseStore(state => state.actions.fetchCourseModules);
  const createModule = useCourseStore(state => state.actions.createModule);
  const updateModule = useCourseStore(state => state.actions.updateModule);
  const deleteModule = useCourseStore(state => state.actions.deleteModule);

  const [showCourseForm, setShowCourseForm] = useState(false);
  const [showLessonForm, setShowLessonForm] = useState(false);
  const [showModuleForm, setShowModuleForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [editingLesson, setEditingLesson] = useState(null);
  const [editingModule, setEditingModule] = useState(null);
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [courseLessons, setCourseLessons] = useState({});
  const [courseModules, setCourseModules] = useState({});
  const [expandedModules, setExpandedModules] = useState({});

  useEffect(() => {
    if (user?.id) {
      fetchCourses({}, user.id);
    } else {
      fetchCourses();
    }
  }, [fetchCourses, user?.id]);

  const handleCourseSuccess = (courseData) => {
    setShowCourseForm(false);
    setEditingCourse(null);
  };

  const handleLessonSuccess = (lessonData) => {
    setShowLessonForm(false);
    setEditingLesson(null);
    if (selectedCourseId) {
      loadCourseLessons(selectedCourseId);
    }
  };

  const handleModuleSuccess = (moduleData) => {
    setShowModuleForm(false);
    setEditingModule(null);
    if (selectedCourseId) {
      loadCourseModules(selectedCourseId);
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

  const handleAddModule = (courseId) => {
    setSelectedCourseId(courseId);
    setShowModuleForm(true);
  };

  const handleEditModule = (module, courseId) => {
    setEditingModule(module);
    setSelectedCourseId(courseId);
    setShowModuleForm(true);
  };

  const handleDeleteModule = async (moduleId, courseId) => {
    if (window.confirm('Are you sure you want to delete this module? All lessons in this module will become unassigned.')) {
      const result = await deleteModule(moduleId, courseId);
      if (result.success) {
        success('Module deleted successfully!');
        loadCourseModules(courseId);
        loadCourseLessons(courseId);
      } else {
        showError(result.error || 'Failed to delete module');
      }
    }
  };

  const toggleModuleExpansion = (moduleId) => {
    setExpandedModules(prev => ({
      ...prev,
      [moduleId]: !prev[moduleId]
    }));
  };

  const loadCourseLessons = async (courseId) => {
    const result = await fetchCourseLessons(courseId);
    if (result.data) {
      // Convert grouped lessons to flat array for display
      const flatLessons = [];
      Object.values(result.data).forEach(moduleData => {
        if (moduleData.lessons && Array.isArray(moduleData.lessons)) {
          flatLessons.push(...moduleData.lessons);
        }
      });
      
      // Sort lessons by their order_index
      flatLessons.sort((a, b) => (a.order_index || 0) - (b.order_index || 0));
      
      setCourseLessons(prev => ({
        ...prev,
        [courseId]: flatLessons
      }));
    }
  };

  const loadCourseModules = async (courseId) => {
    const result = await fetchCourseModules(courseId);
    if (result.data) {
      setCourseModules(prev => ({
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
      loadCourseModules(courseId);
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

      {/* Module Form Modal */}
      {showModuleForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <ModuleForm
              module={editingModule}
              courseId={selectedCourseId}
              onSuccess={handleModuleSuccess}
              onCancel={() => {
                setShowModuleForm(false);
                setEditingModule(null);
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
                    <div className="flex items-center gap-1">
                      <FolderOpen className="w-4 h-4" />
                      <span>{courseModules[course.id]?.length || 0} modules</span>
                    </div>
                    {course.category && (
                      <span 
                        className="px-2 py-1 rounded text-xs font-medium"
                        style={{
                          backgroundColor: course.category.color ? `${course.category.color}20` : '#f3f4f6',
                          color: course.category.color || '#374151'
                        }}
                      >
                        {course.category.name}
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
                    {courseLessons[course.id] ? 'Hide' : 'Show'} Structure
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
                    onClick={() => handleAddModule(course.id)}
                  >
                    <FolderOpen className="w-4 h-4 mr-1" />
                    Add Module
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

              {/* Course Structure Section */}
              {(courseModules[course.id] || courseLessons[course.id]) && (
                <div className="border-t border-gray-200 pt-4 mt-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-900">Course Structure</h4>
                    <div className="flex gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleAddModule(course.id)}
                      >
                        <FolderOpen className="w-4 h-4 mr-2" />
                        Add Module
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleAddLesson(course.id)}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Lesson
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    {/* Display Modules with Lessons */}
                    {courseModules[course.id]?.map(module => (
                      <div key={module.id} className="border border-gray-200 rounded-lg">
                        <div 
                          className="flex items-center justify-between p-3 bg-gray-50 cursor-pointer hover:bg-gray-100"
                          onClick={() => toggleModuleExpansion(module.id)}
                        >
                          <div className="flex items-center gap-3">
                            {expandedModules[module.id] ? (
                              <ChevronDown className="w-4 h-4 text-gray-500" />
                            ) : (
                              <ChevronRight className="w-4 h-4 text-gray-500" />
                            )}
                            <FolderOpen className="w-5 h-5 text-blue-600" />
                            <div>
                              <h5 className="font-medium text-gray-900">
                                {module.title}
                              </h5>
                              <p className="text-sm text-gray-500">
                                {module.estimated_duration ? `${module.estimated_duration} min` : 'No duration set'}
                                {module.is_required && ' • Required'}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditModule(module, course.id);
                              }}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteModule(module.id, course.id);
                              }}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        
                        {/* Module Lessons */}
                        {expandedModules[module.id] && (
                          <div className="p-3 bg-white">
                            {courseLessons[course.id]?.filter(lesson => lesson.module_id === module.id).length > 0 ? (
                              <div className="space-y-2">
                                {courseLessons[course.id]
                                  ?.filter(lesson => lesson.module_id === module.id)
                                  .sort((a, b) => (a.order_index || 0) - (b.order_index || 0))
                                  .map(lesson => (
                                    <div
                                      key={lesson.id}
                                      className="flex items-center justify-between p-2 bg-gray-50 rounded border-l-4 border-blue-200"
                                    >
                                      <div className="flex items-center gap-3">
                                        <FileText className="w-4 h-4 text-gray-500" />
                                        <span className="text-sm font-medium text-gray-500">
                                          {lesson.order_index || '?'}.
                                        </span>
                                        <div>
                                          <h6 className="font-medium text-gray-900">
                                            {lesson.title || 'Untitled Lesson'}
                                          </h6>
                                          <p className="text-xs text-gray-500">
                                            {lesson.content_type || lesson.lesson_type || 'Unknown'} • {lesson.duration_minutes || 0} min
                                          </p>
                                        </div>
                                      </div>
                                      
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleEditLesson(lesson, course.id)}
                                      >
                                        <Edit className="w-4 h-4" />
                                      </Button>
                                    </div>
                                  ))}
                              </div>
                            ) : (
                              <p className="text-sm text-gray-500 italic">No lessons in this module yet.</p>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                    
                    {/* Display Unassigned Lessons */}
                    {courseLessons[course.id]?.filter(lesson => !lesson.module_id).length > 0 && (
                      <div className="border border-gray-200 rounded-lg">
                        <div className="p-3 bg-yellow-50 border-l-4 border-yellow-400">
                          <h5 className="font-medium text-gray-900 mb-2">Unassigned Lessons</h5>
                          <div className="space-y-2">
                            {courseLessons[course.id]
                              ?.filter(lesson => !lesson.module_id)
                              .sort((a, b) => (a.order_index || 0) - (b.order_index || 0))
                              .map(lesson => (
                                <div
                                  key={lesson.id}
                                  className="flex items-center justify-between p-2 bg-white rounded border"
                                >
                                  <div className="flex items-center gap-3">
                                    <FileText className="w-4 h-4 text-gray-500" />
                                    <span className="text-sm font-medium text-gray-500">
                                      {lesson.order_index || '?'}.
                                    </span>
                                    <div>
                                      <h6 className="font-medium text-gray-900">
                                        {lesson.title || 'Untitled Lesson'}
                                      </h6>
                                      <p className="text-xs text-gray-500">
                                        {lesson.content_type || lesson.lesson_type || 'Unknown'} • {lesson.duration_minutes || 0} min
                                      </p>
                                    </div>
                                  </div>
                                  
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleEditLesson(lesson, course.id)}
                                  >
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                </div>
                              ))}
                          </div>
                        </div>
                      </div>
                    )}
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
