import React, { useState, useEffect } from 'react';
import { Card, Button, Modal } from '@/components/ui';
import { useCourseStore } from '@/store/courseStore';
import { useAuth } from '@/hooks/auth/useAuth';
import { useToast } from '@/components/ui';
import { 
  ChevronDown, 
  ChevronRight, 
  Plus, 
  Edit, 
  Trash2, 
  BookOpen,
  Play,
  Clock,
  Target
} from 'lucide-react';

const CourseStructure = ({ courseId, onRefresh }) => {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const { 
    courseModules, 
    loading, 
    actions 
  } = useCourseStore();
  
  const [expandedModules, setExpandedModules] = useState(new Set());
  const [showModuleForm, setShowModuleForm] = useState(false);
  const [editingModule, setEditingModule] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  const modules = courseModules[courseId] || [];

  useEffect(() => {
    if (courseId) {
      loadCourseStructure();
    }
  }, [courseId]);

  const loadCourseStructure = async () => {
    try {
      await actions.fetchCourseModules(courseId);
      await actions.fetchCourseLessons(courseId);
    } catch (error) {
      showError('Failed to load course structure');
    }
  };

  const toggleModuleExpansion = (moduleId) => {
    const newExpanded = new Set(expandedModules);
    if (newExpanded.has(moduleId)) {
      newExpanded.delete(moduleId);
    } else {
      newExpanded.add(moduleId);
    }
    setExpandedModules(newExpanded);
  };

  const handleCreateModule = () => {
    setEditingModule(null);
    setShowModuleForm(true);
  };

  const handleEditModule = (module) => {
    setEditingModule(module);
    setShowModuleForm(true);
  };

  const handleDeleteModule = async (moduleId) => {
    try {
      const result = await actions.deleteModule(moduleId, courseId);
      if (result.error) {
        throw new Error(result.error);
      }
      
      showSuccess('Module deleted successfully');
      setShowDeleteConfirm(null);
      if (onRefresh) onRefresh();
    } catch (error) {
      showError(error.message || 'Failed to delete module');
    }
  };

  const handleModuleSuccess = () => {
    setShowModuleForm(false);
    setEditingModule(null);
    if (onRefresh) onRefresh();
  };

  const formatDuration = (minutes) => {
    if (!minutes) return 'N/A';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const renderModule = (module) => {
    const isExpanded = expandedModules.has(module.id);
    const hasLessons = module.lessons && module.lessons.length > 0;

    return (
      <div key={module.id} className="border border-gray-200 rounded-lg mb-3">
        <div className="flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors">
          <div className="flex items-center space-x-3 flex-1">
            <button
              onClick={() => toggleModuleExpansion(module.id)}
              className="p-1 hover:bg-gray-200 rounded"
              disabled={!hasLessons}
            >
              {hasLessons ? (
                isExpanded ? (
                  <ChevronDown className="w-4 h-4 text-gray-600" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-gray-600" />
                )
              ) : (
                <div className="w-4 h-4" />
              )}
            </button>
            
            <BookOpen className="w-5 h-5 text-blue-600" />
            
            <div className="flex-1">
              <h4 className="font-medium text-gray-900">{module.title}</h4>
              {module.description && (
                <p className="text-sm text-gray-600 mt-1">{module.description}</p>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <div className="flex items-center space-x-1">
                <Clock className="w-4 h-4" />
                <span>{formatDuration(module.estimated_duration)}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Play className="w-4 h-4" />
                <span>{hasLessons ? module.lessons.length : 0} lessons</span>
              </div>
              {module.is_required && (
                <div className="flex items-center space-x-1">
                  <Target className="w-4 h-4 text-red-500" />
                  <span className="text-red-600">Required</span>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleEditModule(module)}
                className="text-gray-600 hover:text-gray-900"
              >
                <Edit className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDeleteConfirm(module.id)}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Module Content */}
        {isExpanded && hasLessons && (
          <div className="border-t border-gray-200 bg-white">
            <div className="p-4">
              {module.learning_objectives && (
                <div className="mb-4">
                  <h5 className="text-sm font-medium text-gray-700 mb-2">Learning Objectives:</h5>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {module.learning_objectives.split('\n').filter(obj => obj.trim()).map((objective, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <span className="text-blue-500 mt-1">•</span>
                        <span>{objective.trim()}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="space-y-2">
                {module.lessons.map((lesson, index) => (
                  <div key={lesson.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <h6 className="text-sm font-medium text-gray-900">{lesson.title}</h6>
                      {lesson.content_type && (
                        <span className="text-xs text-gray-500 capitalize">
                          {lesson.content_type}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500">
                      {lesson.duration_minutes ? `${lesson.duration_minutes}m` : 'N/A'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  if (loading.modules) {
    return (
      <Card className="p-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-2">Loading course structure...</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Course Structure</h3>
          <p className="text-sm text-gray-600 mt-1">
            Organize your course content into logical modules and lessons
          </p>
        </div>
        
        <Button onClick={handleCreateModule} className="flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>Add Module</span>
        </Button>
      </div>

      {/* Course Structure */}
      <Card className="p-6">
        {modules.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">No modules yet</h4>
            <p className="text-gray-600 mb-4">
              Create your first module to start organizing your course content
            </p>
            <Button onClick={handleCreateModule} variant="outline">
              Create First Module
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {modules.map(renderModule)}
          </div>
        )}
      </Card>

      {/* Module Form Modal */}
      <Modal
        isOpen={showModuleForm}
        onClose={() => setShowModuleForm(false)}
        title={editingModule ? 'Edit Module' : 'Create New Module'}
        size="lg"
      >
        <ModuleForm
          courseId={courseId}
          module={editingModule}
          onSuccess={handleModuleSuccess}
          onCancel={() => setShowModuleForm(false)}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(null)}
        title="Delete Module"
        size="md"
      >
        <div className="p-6">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              <Trash2 className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Delete Module?
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              This action cannot be undone. All lessons in this module will also be deleted.
            </p>
            <div className="flex justify-center space-x-3">
              <Button
                variant="secondary"
                onClick={() => setShowDeleteConfirm(null)}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={() => handleDeleteModule(showDeleteConfirm)}
              >
                Delete Module
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default CourseStructure; 