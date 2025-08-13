// src/components/course/CourseForm.jsx
import { useState, useEffect } from 'react';
import { useCourseStore } from '@/store/courseStore';
import { useAuth } from '@/hooks/auth/useAuth';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function CourseForm({ course = null, onSuccess, onCancel }) {
  const { user } = useAuth();
  // Store selectors - individual to prevent infinite loops
  const createCourse = useCourseStore(state => state.actions.createCourse);
  const updateCourse = useCourseStore(state => state.actions.updateCourse);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category_id: '',
    duration_minutes: '',
    difficulty_level: '',
    prerequisites: '',
    learning_objectives: '',
    thumbnail_url: '',
    slug: '',
    is_public: false
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isEditing] = useState(!!course);

  // Initialize form with course data if editing
  useEffect(() => {
    if (course) {
      setFormData({
        title: course.title || '',
        description: course.description || '',
        category_id: course.category_id || '',
        duration_minutes: course.duration_minutes || '',
        difficulty_level: course.difficulty_level || '',
        prerequisites: Array.isArray(course.prerequisites) ? 
          course.prerequisites.join('\n') : 
          course.prerequisites || '',
        learning_objectives: Array.isArray(course.learning_objectives) ? 
          course.learning_objectives.join('\n') : 
          course.learning_objectives || '',
        thumbnail_url: course.thumbnail_url || '',
        slug: course.slug || '',
        is_public: course.is_public || false
      });
    }
  }, [course]);

  // Fetch categories from database
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const generateSlug = (title) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleTitleChange = (e) => {
    const title = e.target.value;
    setFormData(prev => ({
      ...prev,
      title,
      slug: generateSlug(title)
    }));
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      setError('Course title is required');
      return false;
    }
    if (!formData.description.trim()) {
      setError('Course description is required');
      return false;
    }
    if (!formData.slug.trim()) {
      setError('Course slug is required');
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
      const courseData = {
        ...formData,
        duration_minutes: formData.duration_minutes ? parseInt(formData.duration_minutes) : null,
        category_id: formData.category_id || null,
        // Convert text fields to arrays if they're expected as arrays by the database
        learning_objectives: formData.learning_objectives ? 
          formData.learning_objectives.split('\n').filter(obj => obj.trim()) : 
          [],
        prerequisites: formData.prerequisites ? 
          formData.prerequisites.split('\n').filter(obj => obj.trim()) : 
          []
      };

      let result;
      if (isEditing) {
        result = await updateCourse(course.id, courseData);
      } else {
        result = await createCourse(courseData, user.id);
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

  const difficultyLevels = ['Beginner', 'Intermediate', 'Advanced'];
  
  // Store selectors - individual to prevent infinite loops
  const categories = useCourseStore(state => state.categories);
  const loadingCategories = useCourseStore(state => state.loading.categories);
  const fetchCategories = useCourseStore(state => state.actions.fetchCategories);

  return (
    <Card className="max-w-4xl mx-auto">
      <div className="p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          {isEditing ? 'Edit Course' : 'Create New Course'}
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
                Course Title *
              </label>
              <Input
                name="title"
                value={formData.title}
                onChange={handleTitleChange}
                placeholder="Enter course title"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Describe what students will learn in this course"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category (Optional)
              </label>
              {loadingCategories ? (
                <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50">
                  <span className="text-gray-500">Loading categories...</span>
                </div>
              ) : categories.length > 0 ? (
                <select
                  name="category_id"
                  value={formData.category_id}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select a category (optional)</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50">
                  <span className="text-gray-500">No categories available</span>
                  <p className="text-xs text-gray-400 mt-1">
                    <a 
                      href="/app/courses/categories" 
                      className="text-blue-600 hover:text-blue-700 underline"
                    >
                      Create categories here
                    </a>
                  </p>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Difficulty Level
              </label>
              <select
                name="difficulty_level"
                value={formData.difficulty_level}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select difficulty</option>
                {difficultyLevels.map(level => (
                  <option key={level} value={level}>
                    {level}
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
                placeholder="e.g., 120"
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Course Slug *
              </label>
              <Input
                name="slug"
                value={formData.slug}
                onChange={handleInputChange}
                placeholder="course-slug"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                This will be used in the course URL
              </p>
            </div>
          </div>

          {/* Additional Information */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prerequisites (One per line)
              </label>
              <textarea
                name="prerequisites"
                value={formData.prerequisites}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="What should students know before taking this course?&#10;Enter each prerequisite on a new line"
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter each prerequisite on a separate line
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Learning Objectives (One per line)
              </label>
              <textarea
                name="learning_objectives"
                value={formData.learning_objectives}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="What will students be able to do after completing this course?&#10;Enter each objective on a new line"
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter each learning objective on a separate line
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Thumbnail URL
              </label>
              <Input
                name="thumbnail_url"
                value={formData.thumbnail_url}
                onChange={handleInputChange}
                placeholder="https://example.com/image.jpg"
                type="url"
              />
            </div>

            <div className="flex items-center">
              <input
                name="is_public"
                type="checkbox"
                checked={formData.is_public}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-700">
                Make this course publicly visible (even when not published)
              </label>
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
                isEditing ? 'Update Course' : 'Create Course'
              )}
            </Button>
          </div>
        </form>
      </div>
    </Card>
  );
} 