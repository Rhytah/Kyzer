import React, { useState, useEffect } from 'react';
import { Card, Button, Input } from '@/components/ui';
import { useToast } from '@/components/ui';
import { useCourseStore } from '@/store/courseStore';
import { useAuth } from '@/hooks/auth/useAuth';

const ModuleForm = ({ 
  courseId, 
  module = null, 
  onSuccess, 
  onCancel 
}) => {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const { actions } = useCourseStore();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    estimated_duration: '',
    is_required: true,
    order_index: 1
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form data if editing existing module
  useEffect(() => {
    if (module) {
      setFormData({
        title: module.title || '',
        description: module.description || '',
        estimated_duration: module.estimated_duration || '',
        is_required: module.is_required !== undefined ? module.is_required : true,
        order_index: module.order_index || 1
      });
    }
  }, [module]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user?.id) {
      showError('You must be logged in to create modules');
      return;
    }

    if (!formData.title.trim()) {
      showError('Module title is required');
      return;
    }

    setIsSubmitting(true);

    try {
      let result;
      
      if (module) {
        // Update existing module
        result = await actions.updateModule(module.id, formData);
      } else {
        // Create new module
        result = await actions.createModule(formData, courseId, user.id);
      }

      if (result.error) {
        throw new Error(result.error);
      }

      showSuccess(
        module 
          ? 'Module updated successfully!' 
          : 'Module created successfully!'
      );
      
      if (onSuccess) {
        onSuccess(result.data);
      }
    } catch (error) {
      showError(error.message || 'Failed to save module');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          {module ? 'Edit Module' : 'Create New Module'}
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          {module 
            ? 'Update the module information below' 
            : 'Add a new module to organize your course content'
          }
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Module Title *
          </label>
          <Input
            id="title"
            name="title"
            type="text"
            value={formData.title}
            onChange={handleInputChange}
            placeholder="e.g., Introduction to JavaScript"
            required
            className="w-full"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Brief description of what this module covers..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>


        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="estimated_duration" className="block text-sm font-medium text-gray-700 mb-1">
              Estimated Duration (minutes)
            </label>
            <Input
              id="estimated_duration"
              name="estimated_duration"
              type="number"
              value={formData.estimated_duration}
              onChange={handleInputChange}
              placeholder="60"
              min="1"
              className="w-full"
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              id="is_required"
              name="is_required"
              type="checkbox"
              checked={formData.is_required}
              onChange={handleInputChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="is_required" className="text-sm font-medium text-gray-700">
              Required Module
            </label>
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="min-w-[100px]"
          >
            {isSubmitting ? 'Saving...' : (module ? 'Update' : 'Create')}
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default ModuleForm; 