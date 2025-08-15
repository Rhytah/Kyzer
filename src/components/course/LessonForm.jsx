// src/components/course/LessonForm.jsx
import { useState, useEffect } from 'react';
import { useCourseStore } from '@/store/courseStore';
import { useAuth } from '@/hooks/auth/useAuth';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { useToast } from '@/components/ui';

export default function LessonForm({ lesson = null, courseId, onSuccess, onCancel }) {
  const { user } = useAuth();
  const { success, error: showError } = useToast();
  
  // Store selectors - individual to prevent infinite loops
  const createLesson = useCourseStore(state => state.actions.createLesson);
  const updateLesson = useCourseStore(state => state.actions.updateLesson);
  const fetchCourseModules = useCourseStore(state => state.actions.fetchCourseModules);

  const [formData, setFormData] = useState({
    title: '',
    content_type: 'video',
    content_url: '',
    content_text: '',
    duration_minutes: '',
    order_index: 1,
    is_required: true,
    module_id: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isEditing] = useState(!!lesson);
  const [modules, setModules] = useState([]);
  const [loadingModules, setLoadingModules] = useState(false);

  // Initialize form with lesson data if editing
  useEffect(() => {
    if (lesson) {
      setFormData({
        title: lesson.title || '',
        content_type: lesson.content_type || 'video',
        content_url: lesson.content_url || '',
        content_text: lesson.content_text || '',
        duration_minutes: lesson.duration_minutes || '',
        order_index: lesson.order_index || 1,
        is_required: lesson.is_required !== undefined ? lesson.is_required : true,
        module_id: lesson.module_id || '' // Assuming lesson object has module_id
      });
    }
  }, [lesson]);

  // Fetch modules for the course
  useEffect(() => {
    const loadModules = async () => {
      if (courseId) {
        setLoadingModules(true);
        try {
          const result = await fetchCourseModules(courseId);
          if (result.data) {
            setModules(result.data);
          }
        } catch (error) {
          console.error('Failed to load modules:', error);
        } finally {
          setLoadingModules(false);
        }
      }
    };

    loadModules();
  }, [courseId, fetchCourseModules]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      setError('Lesson title is required');
      return false;
    }
    if (!formData.content_text.trim() && !formData.content_url.trim()) {
      setError('Either lesson content text or content URL is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) return;

    setLoading(true);

    try {
      const lessonData = {
        ...formData,
        duration_minutes: formData.duration_minutes ? parseInt(formData.duration_minutes) : null,
        order_index: formData.order_index ? parseInt(formData.order_index) : 1,
        module_id: formData.module_id || null // Allow null for unassigned lessons
      };

      let result;
      if (isEditing) {
        result = await updateLesson(lesson.id, lessonData);
      } else {
        result = await createLesson(lessonData, courseId, user.id);
      }

      if (result.error) {
        setError(result.error);
        showError(result.error);
        return;
      }

      const message = isEditing 
        ? `Lesson "${result.data.title}" updated successfully!` 
        : `Lesson "${result.data.title}" created successfully!`;
      
      success(message);
      onSuccess(result.data);
    } catch (error) {
      setError(error.message || 'An unexpected error occurred');
      showError(error.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const lessonTypes = [
    { value: 'video', label: 'Video Lesson' },
    { value: 'text', label: 'Text Lesson' },
    { value: 'interactive', label: 'Interactive Lesson' },
    { value: 'quiz', label: 'Quiz/Assessment' },
    { value: 'assignment', label: 'Assignment' }
  ];

  return (
    <Card className="max-w-3xl mx-auto">
      <div className="p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          {isEditing ? 'Edit Lesson' : 'Add New Lesson'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lesson Title *
              </label>
              <Input
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Enter lesson title"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Content Type
              </label>
              <select
                name="content_type"
                value={formData.content_type}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="video">Video</option>
                <option value="text">Text</option>
                <option value="pdf">PDF</option>
                <option value="quiz">Quiz</option>
                <option value="interactive">Interactive</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Module (Optional)
              </label>
              <select
                name="module_id"
                value={formData.module_id}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">No Module (Unassigned)</option>
                {loadingModules ? (
                  <option disabled>Loading modules...</option>
                ) : (
                  modules.map(module => (
                    <option key={module.id} value={module.id}>
                      {module.title}
                    </option>
                  ))
                )}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Select a module to organize this lesson, or leave unassigned
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Duration (minutes)
              </label>
              <Input
                name="duration_minutes"
                type="number"
                value={formData.duration_minutes}
                onChange={handleInputChange}
                placeholder="e.g., 15"
                min="0"
              />
            </div>

            {isEditing && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Order Index
                </label>
                <Input
                  name="order_index"
                  type="number"
                  value={formData.order_index}
                  onChange={handleInputChange}
                  placeholder="1"
                  min="1"
                />
              </div>
            )}
          </div>

          {/* Content */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lesson Content Text
              </label>
              <textarea
                name="content_text"
                value={formData.content_text}
                onChange={handleInputChange}
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter the main content text of this lesson..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Content URL
              </label>
              <Input
                name="content_url"
                value={formData.content_url}
                onChange={handleInputChange}
                placeholder="https://youtube.com/watch?v=... or file URL"
                type="url"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Required Lesson
              </label>
              <div className="flex items-center">
                <input
                  name="is_required"
                  type="checkbox"
                  checked={formData.is_required}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">
                  This lesson is required to complete the course
                </label>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <Button
              type="button"
              variant="secondary"
              onClick={onCancel}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="min-w-[120px]"
            >
              {loading ? (
                <LoadingSpinner size="sm" />
              ) : (
                isEditing ? 'Update Lesson' : 'Add Lesson'
              )}
            </Button>
          </div>
        </form>
      </div>
    </Card>
  );
} 