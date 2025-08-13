// src/components/course/LessonForm.jsx
import { useState, useEffect } from 'react';
import { useCourseStore } from '@/store/courseStore';
import { useAuth } from '@/hooks/auth/useAuth';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function LessonForm({ lesson = null, courseId, onSuccess, onCancel }) {
  const { user } = useAuth();
  // Store selectors - individual to prevent infinite loops
  const createLesson = useCourseStore(state => state.actions.createLesson);
  const updateLesson = useCourseStore(state => state.actions.updateLesson);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    video_url: '',
    duration_minutes: '',
    lesson_type: 'video',
    resources: '',
    quiz_questions: '',
    order_index: 1
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isEditing] = useState(!!lesson);

  // Initialize form with lesson data if editing
  useEffect(() => {
    if (lesson) {
      setFormData({
        title: lesson.title || '',
        content: lesson.content || '',
        video_url: lesson.video_url || '',
        duration_minutes: lesson.duration_minutes || '',
        lesson_type: lesson.lesson_type || 'video',
        resources: Array.isArray(lesson.resources) ? 
          lesson.resources.join('\n') : 
          lesson.resources || '',
        quiz_questions: Array.isArray(lesson.quiz_questions) ? 
          lesson.quiz_questions.join('\n') : 
          lesson.quiz_questions || '',
        order_index: lesson.order_index || 1
      });
    }
  }, [lesson]);

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
    if (!formData.content.trim()) {
      setError('Lesson content is required');
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
        // Convert text fields to arrays if they're expected as arrays by the database
        resources: formData.resources ? 
          formData.resources.split('\n').filter(resource => resource.trim()) : 
          [],
        quiz_questions: formData.quiz_questions ? 
          formData.quiz_questions.split('\n').filter(question => question.trim()) : 
          []
      };

      let result;
      if (isEditing) {
        result = await updateLesson(lesson.id, lessonData);
      } else {
        result = await createLesson(lessonData, courseId, user.id);
      }

      if (result.error) {
        setError(result.error);
        return;
      }

      onSuccess?.(result.data);
    } catch (err) {
      setError(err.message || 'An error occurred');
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
                Lesson Type
              </label>
              <select
                name="lesson_type"
                value={formData.lesson_type}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {lessonTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
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
                Lesson Content *
              </label>
              <textarea
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter the main content of this lesson..."
                required
              />
            </div>

            {formData.lesson_type === 'video' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Video URL
                </label>
                <Input
                  name="video_url"
                  value={formData.video_url}
                  onChange={handleInputChange}
                  placeholder="https://youtube.com/watch?v=..."
                  type="url"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Resources (One per line)
              </label>
              <textarea
                name="resources"
                value={formData.resources}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Links to additional materials, downloads, etc.&#10;Enter each resource on a new line"
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter each resource on a separate line
              </p>
            </div>

            {formData.lesson_type === 'quiz' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quiz Questions (One per line)
                </label>
                <textarea
                  name="quiz_questions"
                  value={formData.quiz_questions}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter quiz questions and answers...&#10;Enter each question on a new line"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enter each quiz question on a separate line
                </p>
              </div>
            )}
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