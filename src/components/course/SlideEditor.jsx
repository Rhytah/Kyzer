// src/components/course/SlideEditor.jsx
import { useState, useRef, useEffect } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useToast } from '@/components/ui';
import {
  uploadFile,
  getFileUrl,
  STORAGE_BUCKETS,
  validateFileType,
  validateFileSize
} from '@/lib/supabase';
import {
  Upload,
  Link,
  FileText,
  Image,
  Video,
  File,
  Music,
  Eye,
  X,
  Clock
} from 'lucide-react';

const CONTENT_TYPES = [
  { value: 'text', label: 'Text Content', icon: FileText },
  { value: 'image', label: 'Image', icon: Image },
  { value: 'video', label: 'Video', icon: Video },
  { value: 'pdf', label: 'PDF Document', icon: File },
  { value: 'audio', label: 'Audio', icon: Music },
  { value: 'document', label: 'Document', icon: File }
];

const TEXT_FORMATS = [
  { value: 'plaintext', label: 'Plain Text' },
  { value: 'markdown', label: 'Markdown' },
  { value: 'html', label: 'HTML' }
];

const FILE_TYPE_VALIDATION = {
  image: {
    types: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
    maxSize: 10, // MB
    message: 'Supported formats: JPEG, PNG, GIF, WebP, SVG (max 10MB)'
  },
  video: {
    types: ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'],
    maxSize: 500, // MB
    message: 'Supported formats: MP4, WebM, OGG, MOV (max 500MB)'
  },
  pdf: {
    types: ['application/pdf'],
    maxSize: 50, // MB
    message: 'PDF files only (max 50MB)'
  },
  audio: {
    types: ['audio/mp3', 'audio/wav', 'audio/ogg', 'audio/mpeg'],
    maxSize: 100, // MB
    message: 'Supported formats: MP3, WAV, OGG (max 100MB)'
  },
  document: {
    types: [
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'text/plain'
    ],
    maxSize: 25, // MB
    message: 'Supported formats: DOC, DOCX, PPT, PPTX, TXT (max 25MB)'
  }
};

export default function SlideEditor({ slide, onUpdate }) {
  const { success, error: showError } = useToast();
  const fileInputRef = useRef(null);
  
  const [isUploading, setIsUploading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [localSlide, setLocalSlide] = useState(slide);

  useEffect(() => {
    setLocalSlide(slide);
  }, [slide]);

  const handleInputChange = (field, value) => {
    const updatedSlide = { ...localSlide, [field]: value };
    setLocalSlide(updatedSlide);
    onUpdate(updatedSlide);
  };

  const handleFileUpload = async (file) => {
    if (!file) return;

    const contentType = localSlide.content_type;
    const validation = FILE_TYPE_VALIDATION[contentType];
    
    if (!validation) {
      showError('Invalid content type for file upload');
      return;
    }

    if (!validateFileType(file, validation.types)) {
      showError(validation.message);
      return;
    }

    if (!validateFileSize(file, validation.maxSize)) {
      showError(`File too large. ${validation.message}`);
      return;
    }

    setIsUploading(true);
    
    try {
      const subdir = `presentations/${contentType}s`;
      const fileName = file.name || `upload_${Date.now()}`;
      const fullPath = `${subdir}/${fileName}`;
      
      console.log('Uploading file:', {
        bucket: STORAGE_BUCKETS.COURSE_CONTENT,
        path: fullPath,
        fileName: fileName,
        contentType: file.type
      });
      
      const uploadResult = await uploadFile(STORAGE_BUCKETS.COURSE_CONTENT, fullPath, file);
      const publicUrl = getFileUrl(STORAGE_BUCKETS.COURSE_CONTENT, uploadResult.path);
      
      console.log('Upload successful:', { uploadResult, publicUrl });
      
      handleInputChange('content_url', publicUrl);
      success('File uploaded successfully!');
    } catch (error) {
      console.error('Upload error details:', error);
      if (error.message.includes('bucket')) {
        showError('Storage bucket not found. Please run the storage setup SQL in Supabase.');
      } else if (error.message.includes('Duplicate')) {
        showError('File already exists. Please choose a different file or try again.');
      } else if (error.message.includes('Invalid key')) {
        showError('Invalid file path. Please try again with a different file.');
      } else {
        showError('Failed to upload file: ' + error.message);
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleUrlChange = (url) => {
    handleInputChange('content_url', url);
  };

  const handleTextChange = (text) => {
    handleInputChange('content_text', text);
  };

  const handleFormatChange = (format) => {
    handleInputChange('content_format', format);
  };

  const handleDurationChange = (seconds) => {
    handleInputChange('duration_seconds', parseInt(seconds) || 0);
  };

  const handleRequiredChange = (required) => {
    handleInputChange('is_required', required);
  };

  const getContentTypeIcon = (contentType) => {
    const type = CONTENT_TYPES.find(t => t.value === contentType);
    return type ? <type.icon className="w-4 h-4" /> : <FileText className="w-4 h-4" />;
  };

  const renderContentInput = () => {
    const contentType = localSlide.content_type;
    
    switch (contentType) {
      case 'text':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Content Format
              </label>
              <select
                value={localSlide.content_format}
                onChange={(e) => handleFormatChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {TEXT_FORMATS.map(format => (
                  <option key={format.value} value={format.value}>
                    {format.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Content Text *
              </label>
              <textarea
                value={localSlide.content_text}
                onChange={(e) => handleTextChange(e.target.value)}
                placeholder="Enter slide content..."
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
          </div>
        );

      case 'image':
      case 'video':
      case 'pdf':
      case 'audio':
      case 'document':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload File
              </label>
              <div className="flex items-center gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {isUploading ? 'Uploading...' : 'Choose File'}
                </Button>
                <span className="text-sm text-gray-500">
                  {FILE_TYPE_VALIDATION[contentType]?.message}
                </span>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept={FILE_TYPE_VALIDATION[contentType]?.types.join(',')}
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Or External URL
              </label>
              <div className="flex items-center gap-2">
                <Link className="w-4 h-4 text-gray-400" />
                <Input
                  value={localSlide.content_url}
                  onChange={(e) => handleUrlChange(e.target.value)}
                  placeholder="Enter external URL..."
                  className="flex-1"
                />
              </div>
            </div>

            {localSlide.content_url && (
              <div className="mt-4">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPreview(!showPreview)}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  {showPreview ? 'Hide Preview' : 'Show Preview'}
                </Button>
              </div>
            )}
          </div>
        );

      default:
        return (
          <div className="text-gray-500 text-center py-4">
            Select a content type to configure this slide
          </div>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Slide Header */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Slide Title *
          </label>
          <Input
            value={localSlide.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            placeholder="Enter slide title..."
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Content Type
          </label>
          <select
            value={localSlide.content_type}
            onChange={(e) => handleInputChange('content_type', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {CONTENT_TYPES.map(type => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Content Configuration */}
      <div className="border rounded-lg p-4 bg-gray-50">
        <div className="flex items-center gap-2 mb-3">
          {getContentTypeIcon(localSlide.content_type)}
          <span className="font-medium text-gray-700">
            {CONTENT_TYPES.find(t => t.value === localSlide.content_type)?.label}
          </span>
        </div>
        {renderContentInput()}
      </div>

      {/* Slide Settings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Duration (seconds)
          </label>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-400" />
            <Input
              type="number"
              value={localSlide.duration_seconds}
              onChange={(e) => handleDurationChange(e.target.value)}
              placeholder="30"
              min="0"
              className="flex-1"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={localSlide.is_required}
              onChange={(e) => handleRequiredChange(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-gray-700">
              Required slide
            </span>
          </label>
        </div>
      </div>

      {/* Preview */}
      {showPreview && localSlide.content_url && (
        <div className="border rounded-lg p-4 bg-white">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-gray-700">Preview</h4>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowPreview(false)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="max-h-64 overflow-auto">
            {localSlide.content_type === 'image' && (
              <img
                src={localSlide.content_url}
                alt="Preview"
                className="max-w-full h-auto rounded"
                onError={() => showError('Failed to load image preview')}
              />
            )}
            {localSlide.content_type === 'video' && (
              <video
                src={localSlide.content_url}
                controls
                className="max-w-full h-auto rounded"
                onError={() => showError('Failed to load video preview')}
              />
            )}
            {localSlide.content_type === 'pdf' && (
              <iframe
                src={localSlide.content_url}
                className="w-full h-64 rounded"
                title="PDF Preview"
                onError={() => showError('Failed to load PDF preview')}
              />
            )}
            {localSlide.content_type === 'audio' && (
              <audio
                src={localSlide.content_url}
                controls
                className="w-full"
                onError={() => showError('Failed to load audio preview')}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
