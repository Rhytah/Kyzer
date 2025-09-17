import React, { useState, useCallback, useRef, useEffect } from 'react';
import { 
  Upload, 
  FileText, 
  Image as ImageIcon, 
  Settings, 
  Download,
  Eye,
  Trash2,
  RotateCw,
  Grid3X3
} from 'lucide-react';
import { useToast } from '@/components/ui';
import { processPdfToImages, cleanupImageUrls } from '../../utils/pdfSplitter';
import { fixMalformedSplitData, isSplitDataMalformed } from '../../utils/fixSplitData';
import ImageArrangement from './ImageArrangement';

const PDFSplitter = ({ 
  onImagesReady, 
  onCancel,
  initialPdfFile = null,
  initialSplitData = null,
  courseId,
  className = ''
}) => {
  const { success, error: showError } = useToast();
  const fileInputRef = useRef(null);
  
  const [pdfFile, setPdfFile] = useState(initialPdfFile);
  
  // Fix malformed image URLs in existing split data
  const fixImageUrls = useCallback((splitData) => {
    if (!splitData || !splitData.images) return [];
    
    // Check if the data is malformed
    if (isSplitDataMalformed(splitData)) {
      console.warn('Found malformed split data, attempting to fix...');
      const fixedData = fixMalformedSplitData(splitData, courseId);
      return fixedData.images;
    }
    
    return splitData.images || [];
  }, [courseId]);
  
  const [images, setImages] = useState(() => fixImageUrls(initialSplitData));
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(initialSplitData ? 'arrange' : 'upload'); // upload, arrange, ready
  const [selectedFormat] = useState('slideshow'); // Always slideshow
  const [formatSettings] = useState({}); // No settings needed for slideshow
  const [previewImage, setPreviewImage] = useState(null);

  // Debug logging for initialization
  console.log('PDFSplitter initialized with:', {
    hasInitialPdfFile: !!initialPdfFile,
    hasInitialSplitData: !!initialSplitData,
    initialStep: initialSplitData ? 'arrange' : 'upload',
    imagesCount: images.length
  });

  const handleFileSelect = useCallback(async (file) => {
    if (!file) return;
    
    if (file.type !== 'application/pdf') {
      showError('Please select a PDF file');
      return;
    }

    if (file.size > 100 * 1024 * 1024) { // 100MB limit
      showError('PDF file is too large (max 100MB)');
      return;
    }

    setPdfFile(file);
    setIsProcessing(true);
    setCurrentStep('processing');
    setProcessingProgress(0);

    try {
      console.log('Starting PDF processing for file:', file.name);
      
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProcessingProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      console.log('Calling processPdfToImages with courseId:', courseId);
      const processedImages = await processPdfToImages(file, courseId, {
        scale: 2.0,
        format: 'image/jpeg',
        quality: 0.8
      });
      
      console.log('PDF processing completed, images:', processedImages.length);
      console.log('First image data:', processedImages[0]);

      clearInterval(progressInterval);
      setProcessingProgress(100);
      
      // If we're editing and adding pages, append to existing images
      if (initialSplitData && images.length > 0) {
        const newImages = [...images, ...processedImages];
        setImages(newImages);
        success(`Successfully added ${processedImages.length} pages to existing split`);
      } else {
        setImages(processedImages);
        success(`Successfully processed ${processedImages.length} pages from PDF`);
      }
      
      setCurrentStep('arrange');
      
    } catch (error) {
      console.error('PDF processing failed:', error);
      showError(`Failed to process PDF: ${error.message}`);
      setIsProcessing(false);
      setCurrentStep('upload');
    } finally {
      setIsProcessing(false);
    }
  }, [courseId, showError, success, images, initialSplitData]);

  // Auto-process initial PDF file if provided (only for new splits, not editing)
  useEffect(() => {
    if (initialPdfFile && !initialSplitData && currentStep === 'upload' && images.length === 0) {
      console.log('Auto-processing initial PDF file for new split');
      handleFileSelect(initialPdfFile);
    }
  }, [initialPdfFile, initialSplitData, currentStep, handleFileSelect, images.length]);

  // Cleanup blob URLs on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      images.forEach(img => {
        if (img.imageUrl && img.imageUrl.startsWith('blob:')) {
          URL.revokeObjectURL(img.imageUrl);
        }
      });
    };
  }, []);

  const handleImagesChange = useCallback((newImages) => {
    setImages(newImages);
  }, []);

  const handleFormatChange = useCallback((format) => {
    setSelectedFormat(format);
  }, []);

  const handleSettingsChange = useCallback((settings) => {
    setFormatSettings(settings);
  }, []);

  const handlePreview = useCallback((image) => {
    setPreviewImage(image);
  }, []);

  const handleFinish = useCallback(() => {
    if (images.length === 0) {
      showError('No images to save');
      return;
    }

    const result = {
      images,
      format: selectedFormat,
      settings: formatSettings,
      originalPdf: pdfFile
    };

    onImagesReady(result);
  }, [images, selectedFormat, formatSettings, pdfFile, onImagesReady, showError]);

  const handleReset = useCallback(() => {
    cleanupImageUrls(images);
    setImages([]);
    setPdfFile(null);
    setCurrentStep(initialSplitData ? 'arrange' : 'upload');
    setProcessingProgress(0);
    setPreviewImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [images, initialSplitData]);

  const handleBack = useCallback(() => {
    switch (currentStep) {
      case 'arrange':
        if (initialSplitData) {
          // When editing, don't reset, just go back to the lesson form
          onCancel();
        } else {
          setCurrentStep('upload');
          handleReset();
        }
        break;
      case 'format':
        setCurrentStep('arrange');
        break;
      case 'ready':
        setCurrentStep('arrange');
        break;
      default:
        break;
    }
  }, [currentStep, handleReset, initialSplitData, onCancel]);

  const handleNext = useCallback(() => {
    switch (currentStep) {
      case 'arrange':
        setCurrentStep('ready');
        break;
      default:
        break;
    }
  }, [currentStep]);

  const renderUploadStep = () => (
    <div className="text-center py-12">
      <div className="max-w-md mx-auto">
        <div className="mb-6">
          <FileText className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Upload PDF Document
          </h3>
          <p className="text-sm text-gray-600">
            Upload a PDF file to split into individual pages that you can rearrange and format.
          </p>
        </div>

        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 hover:border-gray-400 transition-colors">
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,application/pdf"
            onChange={(e) => {
              if (e.target.files[0]) {
                setPdfFile(e.target.files[0]);
              }
            }}
            className="hidden"
          />
          
          {pdfFile ? (
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-3">
                <FileText className="w-8 h-8 text-blue-500" />
                <div className="text-left">
                  <p className="font-medium text-gray-900">{pdfFile.name}</p>
                  <p className="text-sm text-gray-500">
                    {(pdfFile.size / 1024 / 1024).toFixed(1)} MB
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => handleFileSelect(pdfFile)}
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Start Splitting PDF
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  Choose Different File
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-col items-center gap-4 w-full"
            >
              <Upload className="w-8 h-8 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  PDF files up to 100MB
                </p>
              </div>
            </button>
          )}
        </div>
      </div>
    </div>
  );

  const renderProcessingStep = () => (
    <div className="text-center py-12">
      <div className="max-w-md mx-auto">
        <div className="mb-6">
          <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
            <Settings className="w-8 h-8 text-blue-500 animate-spin" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Processing PDF
          </h3>
          <p className="text-sm text-gray-600">
            Converting pages to images...
          </p>
        </div>

        <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
          <div 
            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${processingProgress}%` }}
          ></div>
        </div>
        
        <p className="text-sm text-gray-500">
          {processingProgress}% complete
        </p>
      </div>
    </div>
  );

  const renderArrangeStep = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900">
            Arrange Pages
          </h3>
          <p className="text-sm text-gray-600">
            Drag and drop to reorder pages, or remove unwanted pages.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {initialSplitData && (
            <button
              onClick={() => setCurrentStep('upload')}
              className="px-3 py-2 bg-green-500 text-white text-sm rounded-md hover:bg-green-600 transition-colors"
              title="Add more pages"
            >
              Add Pages
            </button>
          )}
          <button
            onClick={() => setPreviewImage(null)}
            className="p-2 text-gray-400 hover:text-gray-600"
            title="Close preview"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>
      </div>

      <ImageArrangement
        images={images}
        onImagesChange={handleImagesChange}
        onPreview={handlePreview}
      />
    </div>
  );


  const renderReadyStep = () => (
    <div className="text-center py-12">
      <div className="max-w-md mx-auto">
        <div className="mb-6">
          <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
            <Grid3X3 className="w-8 h-8 text-green-500" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Ready to Save
          </h3>
          <p className="text-sm text-gray-600">
            Your PDF has been split into {images.length} pages and configured as a slideshow.
          </p>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h4 className="font-medium text-gray-900 mb-2">Summary</h4>
          <div className="text-sm text-gray-600 space-y-1">
            <p><strong>Pages:</strong> {images.length}</p>
            <p><strong>Format:</strong> Slideshow</p>
            <p><strong>Original:</strong> {pdfFile?.name}</p>
          </div>
        </div>

        <div className="flex gap-3 justify-center">
          <button
            onClick={handleFinish}
            className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            Save Configuration
          </button>
        </div>
      </div>
    </div>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 'upload':
        return renderUploadStep();
      case 'processing':
        return renderProcessingStep();
      case 'arrange':
        return renderArrangeStep();
      case 'ready':
        return renderReadyStep();
      default:
        return renderUploadStep();
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            {initialSplitData ? 'Edit PDF Split' : 'PDF Splitter & Arranger'}
          </h2>
          <p className="text-sm text-gray-600">
            {initialSplitData 
              ? 'Edit the arrangement and format of your split PDF pages'
              : 'Convert PDF pages to images and arrange them in multiple formats'
            }
          </p>
        </div>
        
        <button
          onClick={onCancel}
          className="p-2 text-gray-400 hover:text-gray-600"
          title="Cancel"
        >
          ×
        </button>
      </div>

      {/* Progress indicator */}
      {currentStep !== 'upload' && (
        <div className="flex items-center justify-center space-x-4">
          {(initialSplitData ? ['arrange', 'format', 'ready'] : ['upload', 'processing', 'arrange', 'format', 'ready']).map((step, index) => (
            <div key={step} className="flex items-center">
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                ${currentStep === step 
                  ? 'bg-blue-500 text-white' 
                  : index < (initialSplitData ? ['arrange', 'format', 'ready'] : ['upload', 'processing', 'arrange', 'format', 'ready']).indexOf(currentStep)
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-500'
                }
              `}>
                {index + 1}
              </div>
              <span className={`
                ml-2 text-sm font-medium
                ${currentStep === step ? 'text-blue-600' : 'text-gray-500'}
              `}>
                {step.charAt(0).toUpperCase() + step.slice(1)}
              </span>
              {index < (initialSplitData ? 2 : 4) && (
                <div className={`
                  w-8 h-0.5 mx-2
                  ${index < (initialSplitData ? ['arrange', 'format', 'ready'] : ['upload', 'processing', 'arrange', 'format', 'ready']).indexOf(currentStep)
                    ? 'bg-green-500' 
                    : 'bg-gray-200'
                  }
                `} />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Content */}
      <div className="min-h-[400px]">
        {renderStepContent()}
      </div>

      {/* Navigation */}
      {currentStep !== 'upload' && currentStep !== 'processing' && (
        <div className="flex items-center justify-between pt-6 border-t">
          <button
            onClick={handleBack}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            {currentStep === 'arrange' && initialSplitData ? 'Cancel' : 'Back'}
          </button>
          
          <div className="flex gap-3">
            {currentStep !== 'ready' && (
              <button
                onClick={handleNext}
                disabled={images.length === 0}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            )}
          </div>
        </div>
      )}

      {/* Image preview modal */}
      {previewImage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-medium">
                Page {previewImage.pageNumber}
              </h3>
              <button
                onClick={() => setPreviewImage(null)}
                className="p-2 hover:bg-gray-100 rounded-md"
              >
                ×
              </button>
            </div>
            <div className="p-4 overflow-auto max-h-[calc(90vh-80px)]">
              <img
                src={previewImage.imageUrl}
                alt={`Page ${previewImage.pageNumber}`}
                className="max-w-full h-auto mx-auto"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PDFSplitter;
