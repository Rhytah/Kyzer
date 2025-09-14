// src/components/course/LessonCurationForm.jsx
import { useState, useEffect, useRef } from 'react';
import { useCourseStore } from '@/store/courseStore';
import { useAuth } from '@/hooks/auth/useAuth';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { useToast } from '@/components/ui';
import SlideEditor from './SlideEditor';
import {
  uploadFile,
  getFileUrl,
  STORAGE_BUCKETS,
  validateFileType,
  validateFileSize
} from '@/lib/supabase';
import { 
  Plus, 
  Trash2, 
  GripVertical, 
  Eye, 
  Save,
  Upload,
  FileText,
  Image,
  Video,
  File,
  Music
} from 'lucide-react';

export default function LessonCurationForm({ 
  presentation = null, 
  lessonId, 
  onSuccess, 
  onCancel 
}) {
  const { user } = useAuth();
  const { success, error: showError } = useToast();
  
  // Store selectors
  const createPresentation = useCourseStore(state => state.actions.createPresentation);
  const updatePresentation = useCourseStore(state => state.actions.updatePresentation);
  const createSlide = useCourseStore(state => state.actions.createSlide);
  const updateSlide = useCourseStore(state => state.actions.updateSlide);
  const deleteSlide = useCourseStore(state => state.actions.deleteSlide);
  const reorderSlides = useCourseStore(state => state.actions.reorderSlides);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    estimated_duration: ''
  });

  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isEditing] = useState(!!presentation);
  const [isUploading, setIsUploading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [draggedSlide, setDraggedSlide] = useState(null);

  // Initialize form with presentation data if editing
  useEffect(() => {
    if (presentation) {
      console.log('Loading presentation for editing:', {
        presentationId: presentation.id,
        title: presentation.title,
        slidesCount: presentation.slides?.length || 0,
        slides: presentation.slides
      });
      
      setFormData({
        title: presentation.title || '',
        description: presentation.description || '',
        estimated_duration: presentation.estimated_duration || ''
      });
      
      // Mark existing slides as not new and ensure proper structure
      const existingSlides = (presentation.slides || []).map(slide => ({
        ...slide,
        isNew: false, // Mark as existing slide
        metadata: slide.metadata || {},
        content_format: slide.content_format || 'plaintext',
        duration_seconds: slide.duration_seconds || 30,
        is_required: slide.is_required !== undefined ? slide.is_required : true
      }));
      
      console.log('Processed slides for editing:', existingSlides);
      setSlides(existingSlides);
    }
  }, [presentation]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const addSlide = () => {
    const newSlide = {
      id: `temp_${Date.now()}`,
      slide_number: slides.length + 1,
      content_type: 'text',
      title: '',
      content_url: '',
      content_text: '',
      content_format: 'plaintext',
      duration_seconds: 30,
      metadata: {},
      is_required: true,
      isNew: true
    };
    setSlides(prev => [...prev, newSlide]);
  };

  const updateSlideData = (slideId, updates) => {
    setSlides(prev => prev.map(slide => 
      slide.id === slideId ? { ...slide, ...updates } : slide
    ));
  };

  const removeSlide = (slideId) => {
    setSlides(prev => {
      const filtered = prev.filter(slide => slide.id !== slideId);
      // Renumber slides after removal
      return filtered.map((slide, index) => ({
        ...slide,
        slide_number: index + 1
      }));
    });
  };

  const handleDragStart = (e, slideId) => {
    setDraggedSlide(slideId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, targetSlideId) => {
    e.preventDefault();
    if (!draggedSlide || draggedSlide === targetSlideId) return;

    const draggedIndex = slides.findIndex(slide => slide.id === draggedSlide);
    const targetIndex = slides.findIndex(slide => slide.id === targetSlideId);
    
    if (draggedIndex === -1 || targetIndex === -1) return;

    const newSlides = [...slides];
    const [draggedSlideData] = newSlides.splice(draggedIndex, 1);
    newSlides.splice(targetIndex, 0, draggedSlideData);

    // Renumber slides
    const renumberedSlides = newSlides.map((slide, index) => ({
      ...slide,
      slide_number: index + 1
    }));

    setSlides(renumberedSlides);
    setDraggedSlide(null);
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      setError('Presentation title is required');
      return false;
    }
    if (slides.length === 0) {
      setError('At least one slide is required');
      return false;
    }
    
    // Validate each slide
    for (const slide of slides) {
      if (!slide.title.trim()) {
        setError(`Slide ${slide.slide_number} title is required`);
        return false;
      }
      if (slide.content_type === 'text' && !slide.content_text.trim()) {
        setError(`Slide ${slide.slide_number} content is required`);
        return false;
      }
      if (['video', 'image', 'pdf', 'audio', 'document'].includes(slide.content_type) && !slide.content_url.trim()) {
        setError(`Slide ${slide.slide_number} file is required`);
        return false;
      }
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) return;

    setLoading(true);

    try {
      let presentationData;
      
      if (isEditing) {
        presentationData = await updatePresentation(presentation.id, {
          title: formData.title,
          description: formData.description,
          estimated_duration: formData.estimated_duration ? parseInt(formData.estimated_duration) : null
        });
      } else {
        presentationData = await createPresentation({
          lesson_id: lessonId,
          title: formData.title,
          description: formData.description,
          estimated_duration: formData.estimated_duration ? parseInt(formData.estimated_duration) : null,
          created_by: user.id
        });
      }

      if (presentationData.error) {
        setError(presentationData.error);
        showError(presentationData.error);
        return;
      }

      // Handle slides
      const presentationId = presentationData.data.id;
      
      // Separate new slides from existing slides
      const newSlides = slides.filter(slide => slide.isNew);
      const existingSlides = slides.filter(slide => !slide.isNew);
      
      console.log('Processing slides:', {
        totalSlides: slides.length,
        newSlides: newSlides.length,
        existingSlides: existingSlides.length,
        newSlideIds: newSlides.map(s => s.id),
        existingSlideIds: existingSlides.map(s => s.id)
      });
      
      // Get all current slides from the database to identify deleted ones
      let slidesToDelete = [];
      if (isEditing && presentation?.slides) {
        const currentSlideIds = existingSlides.map(slide => slide.id);
        slidesToDelete = presentation.slides.filter(dbSlide => !currentSlideIds.includes(dbSlide.id));
        console.log('Slides to delete:', slidesToDelete.map(s => s.id));
      }

      // Delete slides that were removed
      for (const slide of slidesToDelete) {
        await deleteSlide(slide.id);
      }

      // Update existing slides
      for (const slide of existingSlides) {
        const slideData = {
          slide_number: slide.slide_number,
          content_type: slide.content_type,
          title: slide.title,
          content_url: slide.content_url,
          content_text: slide.content_text,
          content_format: slide.content_format,
          duration_seconds: slide.duration_seconds,
          metadata: slide.metadata,
          is_required: slide.is_required
        };

        await updateSlide(slide.id, slideData);
      }

      // Create new slides
      for (const slide of newSlides) {
        const slideData = {
          presentation_id: presentationId,
          slide_number: slide.slide_number,
          content_type: slide.content_type,
          title: slide.title,
          content_url: slide.content_url,
          content_text: slide.content_text,
          content_format: slide.content_format,
          duration_seconds: slide.duration_seconds,
          metadata: slide.metadata,
          is_required: slide.is_required
        };

        await createSlide(slideData);
      }

      const message = isEditing 
        ? `Presentation "${formData.title}" updated successfully!` 
        : `Presentation "${formData.title}" created successfully!`;
      
      success(message);
      onSuccess(presentationData.data);
    } catch (error) {
      setError(error.message || 'An unexpected error occurred');
      showError(error.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getContentTypeIcon = (contentType) => {
    switch (contentType) {
      case 'video': return <Video className="w-4 h-4" />;
      case 'image': return <Image className="w-4 h-4" />;
      case 'pdf': return <File className="w-4 h-4" />;
      case 'audio': return <Music className="w-4 h-4" />;
      case 'document': return <FileText className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  return (
    <Card className="max-w-6xl mx-auto">
      <div className="p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          {isEditing ? 'Edit Presentation' : 'Create New Presentation'}
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
                Presentation Title *
              </label>
              <Input
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Enter presentation title"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Enter presentation description"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estimated Duration (minutes)
              </label>
              <Input
                name="estimated_duration"
                type="number"
                value={formData.estimated_duration}
                onChange={handleInputChange}
                placeholder="e.g., 30"
                min="1"
              />
            </div>
          </div>

          {/* Slides Management */}
          <div className="border-t pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Slides ({slides.length})
              </h3>
              <Button
                type="button"
                onClick={addSlide}
                variant="outline"
                size="sm"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Slide
              </Button>
            </div>

            {slides.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No slides yet. Click "Add Slide" to get started.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {slides.map((slide, index) => (
                  <div
                    key={slide.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, slide.id)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, slide.id)}
                    className={`border rounded-lg p-4 bg-white hover:shadow-md transition-shadow ${
                      draggedSlide === slide.id ? 'opacity-50' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <GripVertical className="w-4 h-4 text-gray-400 cursor-move" />
                        <span className="text-sm font-medium text-gray-600">
                          Slide {slide.slide_number}
                        </span>
                        <div className="flex items-center gap-1 text-gray-500">
                          {getContentTypeIcon(slide.content_type)}
                          <span className="text-xs capitalize">{slide.content_type}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeSlide(slide.id)}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </div>

                    <SlideEditor
                      slide={slide}
                      onUpdate={(updates) => updateSlideData(slide.id, updates)}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-4 pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || isUploading}
            >
              {loading ? (
                <LoadingSpinner size="sm" className="mr-2" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              {isEditing ? 'Update Presentation' : 'Create Presentation'}
            </Button>
          </div>
        </form>
      </div>
    </Card>
  );
}
