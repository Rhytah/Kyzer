// src/components/ui/ComponentExamples.jsx
// This file demonstrates how to use the new reusable components
import React, { useState } from 'react';
import {
  FormContainer,
  FormSection,
  FormField,
  ContentTypeIcon,
  StatusBadge,
  ActionButton,
  EmptyState,
  Button
} from './index';

const ComponentExamples = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    contentType: 'text',
    status: 'draft'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold text-gray-900">Reusable Components Examples</h1>

      {/* Form Container Example */}
      <FormContainer
        title="Example Form"
        description="This demonstrates the FormContainer component with sections and fields"
        onSubmit={handleSubmit}
        onCancel={() => console.log('Cancelled')}
        submitText="Save Changes"
        maxWidth="max-w-2xl"
      >
        <FormSection title="Basic Information" description="Enter the basic details">
          <FormField
            label="Title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            placeholder="Enter title"
            required
            helperText="This will be displayed as the main title"
          />
          
          <FormField
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Enter description"
            type="textarea"
            helperText="Provide a detailed description"
          />
        </FormSection>

        <FormSection title="Content Settings" collapsible>
          <FormField
            label="Content Type"
            name="contentType"
            value={formData.contentType}
            onChange={handleInputChange}
            type="select"
            helperText="Select the type of content"
          >
            <option value="text">Text</option>
            <option value="image">Image</option>
            <option value="video">Video</option>
            <option value="quiz">Quiz</option>
          </FormField>
        </FormSection>
      </FormContainer>

      {/* Content Type Icons */}
      <div className="bg-white rounded-lg p-6 border">
        <h2 className="text-xl font-semibold mb-4">Content Type Icons</h2>
        <div className="grid grid-cols-4 gap-4">
          {['text', 'image', 'video', 'audio', 'pdf', 'document', 'quiz'].map(type => (
            <div key={type} className="flex flex-col items-center p-4 border rounded-lg">
              <ContentTypeIcon type={type} size={32} className="mb-2" />
              <span className="text-sm font-medium capitalize">{type}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Status Badges */}
      <div className="bg-white rounded-lg p-6 border">
        <h2 className="text-xl font-semibold mb-4">Status Badges</h2>
        <div className="flex flex-wrap gap-3">
          {['success', 'error', 'warning', 'info', 'pending', 'active', 'inactive', 'draft'].map(status => (
            <StatusBadge key={status} status={status} />
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="bg-white rounded-lg p-6 border">
        <h2 className="text-xl font-semibold mb-4">Action Buttons</h2>
        <div className="flex flex-wrap gap-3">
          {['add', 'edit', 'delete', 'save', 'cancel', 'upload', 'download', 'view', 'settings'].map(action => (
            <ActionButton key={action} action={action} />
          ))}
        </div>
      </div>

      {/* Empty States */}
      <div className="bg-white rounded-lg p-6 border">
        <h2 className="text-xl font-semibold mb-4">Empty States</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <EmptyState
            icon="file"
            title="No files found"
            description="Upload your first file to get started"
            actionText="Upload File"
            action={() => console.log('Upload clicked')}
          />
          <EmptyState
            icon="search"
            title="No results found"
            description="Try adjusting your search criteria"
            actionText="Clear Search"
            action={() => console.log('Clear search clicked')}
          />
        </div>
      </div>
    </div>
  );
};

export default ComponentExamples;
