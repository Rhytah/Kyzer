// src/components/course/SlideEditor.jsx
import { useState, useRef, useEffect } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useToast } from '@/components/ui';
import PDFSplitter from './PDFSplitter';
import { fixLessonSplitData } from '../../utils/fixExistingSplitData';
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
  Clock,
  Grid3X3
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

export default function SlideEditor({ slide, onUpdate, courseId }) {
  const { success, error: showError } = useToast();
  const fileInputRef = useRef(null);
  
  const [isUploading, setIsUploading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [localSlide, setLocalSlide] = useState(slide);
  const [pdfSourceType, setPdfSourceType] = useState('upload'); // 'upload' | 'external' | 'split'
  const [showPdfSplitter, setShowPdfSplitter] = useState(false);
  const [pdfSplitData, setPdfSplitData] = useState(null);
  const [existingPdfFile, setExistingPdfFile] = useState(null);

  useEffect(() => {
    setLocalSlide(slide);
    
    // Check if this slide has PDF content and determine source type
    if (slide.content_type === 'pdf') {
      // First check if it has split data
      if (slide.content_text) {
        try {
          const splitData = JSON.parse(slide.content_text);
          if (splitData.images && Array.isArray(splitData.images)) {
            setPdfSourceType('split');
            setPdfSplitData(splitData);
            return;
          }
        } catch (error) {
          // Not valid JSON, continue to check other options
        }
      }
      
      // Check if it has a content URL
      if (slide.content_url) {
        // Check if it's an uploaded PDF (Supabase storage URL) or external URL
        if (slide.content_url.includes('supabase') || slide.content_url.includes('storage.googleapis.com')) {
          // This is an uploaded PDF - can be split
          setPdfSourceType('upload');
          setExistingPdfFile(slide.content_url); // Store the URL to fetch the file
        } else {
          // This is an external PDF URL - cannot be split
          setPdfSourceType('external');
        }
        setPdfSplitData(null);
      } else {
        // Default to upload if no content
        setPdfSourceType('upload');
        setPdfSplitData(null);
        setExistingPdfFile(null);
      }
    }
  }, [slide]);

  const handleInputChange = (field, value) => {
    const updatedSlide = { ...localSlide, [field]: value };
    setLocalSlide(updatedSlide);
    onUpdate(updatedSlide);
  };

  const handlePdfSplitterSuccess = (splitData) => {
    console.log('SlideEditor PDF Splitter Success - Split Data:', splitData);
    setPdfSplitData(splitData);
    setShowPdfSplitter(false);
    
    // Update content type to presentation but don't store split data in content_text
    const updatedSlide = {
      ...localSlide,
      content_type: 'presentation', // Change content type to presentation after splitting
      content_text: '', // Clear content_text - split data is stored separately
      content_url: '' // Clear URL since we're using split data
    };
    
    console.log('SlideEditor Updated slide:', updatedSlide);
    setLocalSlide(updatedSlide);
    onUpdate(updatedSlide);
    success(`PDF successfully split into ${splitData.images.length} pages! Slide updated.`);
  };

  const handlePdfSplitterCancel = () => {
    setShowPdfSplitter(false);
  };

  const handleFixSplitData = async () => {
    try {
      console.log('Attempting to fix split data for lesson:', slide.id);
      const wasFixed = await fixLessonSplitData(slide.id);
      
      if (wasFixed) {
        success('Split data has been fixed! The lesson should now display images correctly.');
        // Reload the slide data to reflect the changes
        window.location.reload();
      } else {
        success('No malformed data found to fix.');
      }
    } catch (error) {
      console.error('Failed to fix split data:', error);
      showError('Failed to fix split data: ' + error.message);
    }
  };

  const handleOpenPdfSplitter = async () => {
    try {
      // If we have an existing PDF file URL and no split data, fetch it first
      if (existingPdfFile && typeof existingPdfFile === 'string' && !pdfSplitData) {
        console.log('Fetching existing PDF file for new split');
        const pdfFile = await fetchExistingPdfFile(existingPdfFile);
        if (pdfFile) {
          setExistingPdfFile(pdfFile);
        }
      } else if (pdfSplitData) {
        console.log('Opening splitter for editing existing split');
        // For editing existing splits, we don't need to fetch the PDF file
        setExistingPdfFile(null);
      }
      setShowPdfSplitter(true);
    } catch (error) {
      console.error('Error opening PDF splitter:', error);
      showError('Failed to open PDF splitter');
    }
  };

  const fetchExistingPdfFile = async (url) => {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch PDF');
      
      const blob = await response.blob();
      // Create a file object from the blob
      const fileName = url.split('/').pop() || 'existing.pdf';
      const file = new File([blob], fileName, { type: 'application/pdf' });
      return file;
    } catch (error) {
      console.error('Error fetching existing PDF:', error);
      return null;
    }
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

      case 'pdf':
        return (
          <div className="space-y-4">
            {/* PDF Source Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                PDF Source
              </label>
              <div className="flex items-center gap-4">
                <label className="inline-flex items-center gap-2">
                  <input
                    type="radio"
                    name="pdf_source"
                    value="upload"
                    checked={pdfSourceType === 'upload'}
                    onChange={() => setPdfSourceType('upload')}
                  />
                  <span className="text-sm text-gray-700">Upload File</span>
                </label>
                <label className="inline-flex items-center gap-2">
                  <input
                    type="radio"
                    name="pdf_source"
                    value="external"
                    checked={pdfSourceType === 'external'}
                    onChange={() => setPdfSourceType('external')}
                  />
                  <span className="text-sm text-gray-700">External Link</span>
                </label>
                <label className="inline-flex items-center gap-2">
                  <input
                    type="radio"
                    name="pdf_source"
                    value="split"
                    checked={pdfSourceType === 'split'}
                    onChange={() => setPdfSourceType('split')}
                  />
                  <span className="text-sm text-gray-700">Split to Images</span>
                </label>
              </div>
            </div>

            {/* PDF Splitter Section */}
            {pdfSourceType === 'split' && (
              <div className="border border-gray-200 rounded-lg p-4 bg-white">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">
                      {pdfSplitData ? 'Edit Split PDF' : 'Split PDF to Images'}
                    </h4>
                    <p className="text-xs text-gray-600 mt-1">
                      {pdfSplitData 
                        ? 'Edit the arrangement and format of your split PDF pages'
                        : 'Convert PDF pages to images that can be rearranged and presented in multiple formats'
                      }
                    </p>
                  </div>
                  <div className="flex gap-2">
                  <Button
                    onClick={handleOpenPdfSplitter}
                    variant="outline"
                    size="sm"
                  >
                    <Grid3X3 className="w-4 h-4 mr-1" />
                    {pdfSplitData ? 'Edit Split' : 'Open Splitter'}
                  </Button>
                  {pdfSplitData && (
                    <Button
                      onClick={handleFixSplitData}
                      variant="outline"
                      size="sm"
                      className="text-orange-600 hover:text-orange-700"
                    >
                      <Settings className="w-4 h-4 mr-1" />
                      Fix Data
                    </Button>
                  )}
                    {pdfSplitData && (
                      <Button
                        onClick={() => {
                          setPdfSplitData(null);
                          const updatedSlide = {
                            ...localSlide,
                            content_text: '',
                            content_url: ''
                          };
                          setLocalSlide(updatedSlide);
                          onUpdate(updatedSlide);
                        }}
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        Remove Split
                      </Button>
                    )}
                  </div>
                </div>
                
                {pdfSplitData && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-green-800">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm font-medium">
                        Split PDF Configured
                      </span>
                    </div>
                    <div className="mt-2 text-sm text-green-700 space-y-1">
                      <p><strong>{pdfSplitData.images.length}</strong> pages configured as <strong>{pdfSplitData.format}</strong></p>
                      {pdfSplitData.originalPdf?.name && (
                        <p className="text-xs">Original: {pdfSplitData.originalPdf.name}</p>
                      )}
                      <p className="text-xs">Click "Edit Split" to rearrange pages or change format</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Regular Upload Section */}
            {pdfSourceType === 'upload' && (
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
                      {FILE_TYPE_VALIDATION.pdf?.message}
                    </span>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept={FILE_TYPE_VALIDATION.pdf?.types.join(',')}
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>
                
                {/* Show existing uploaded PDF */}
                {localSlide.content_url && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-blue-800">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm font-medium">
                        Current PDF
                      </span>
                    </div>
                    <div className="mt-2 text-sm text-blue-700">
                      <a
                        href={localSlide.content_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 underline"
                      >
                        View PDF in new tab
                      </a>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* External URL Section */}
            {pdfSourceType === 'external' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    PDF URL
                  </label>
                  <div className="flex items-center gap-4">
                    <Link className="w-4 h-4 text-gray-400" />
                    <Input
                      value={localSlide.content_url}
                      onChange={(e) => handleInputChange('content_url', e.target.value)}
                      placeholder="Enter PDF URL..."
                      className="flex-1"
                    />
                  </div>
                </div>
                
                {/* Show existing PDF */}
                {localSlide.content_url && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-blue-800">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm font-medium">
                        Current PDF
                      </span>
                    </div>
                    <div className="mt-2 text-sm text-blue-700">
                      <a
                        href={localSlide.content_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 underline"
                      >
                        View PDF in new tab
                      </a>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        );

      case 'image':
      case 'video':
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

      {/* PDF Splitter Modal */}
      {showPdfSplitter && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-6xl max-h-[90vh] w-full overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">
                PDF Splitter for Slide
              </h3>
              <button
                onClick={() => setShowPdfSplitter(false)}
                className="p-2 hover:bg-gray-100 rounded-md text-gray-400 hover:text-gray-600"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            <div className="overflow-auto max-h-[calc(90vh-80px)]">
              <PDFSplitter
                onImagesReady={handlePdfSplitterSuccess}
                onCancel={handlePdfSplitterCancel}
                initialSplitData={pdfSplitData}
                initialPdfFile={existingPdfFile}
                courseId={courseId}
                className="p-6"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
