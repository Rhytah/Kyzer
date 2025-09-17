import { useState, useCallback } from 'react';
import { processPdfToImages, cleanupImageUrls } from '../../utils/pdfSplitter';
import { useToast } from '@/components/ui';

export const usePdfSplitter = (courseId) => {
  const { success, error: showError } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [splitData, setSplitData] = useState(null);

  const processPdf = useCallback(async (pdfFile, options = {}) => {
    if (!pdfFile || !courseId) {
      showError('Missing PDF file or course ID');
      return null;
    }

    setIsProcessing(true);
    setProcessingProgress(0);

    try {
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

      const processedImages = await processPdfToImages(pdfFile, courseId, {
        scale: options.scale || 2.0,
        format: options.format || 'image/jpeg',
        quality: options.quality || 0.8,
        ...options
      });

      clearInterval(progressInterval);
      setProcessingProgress(100);

      const result = {
        images: processedImages,
        originalPdf: pdfFile,
        processedAt: new Date().toISOString(),
        options
      };

      setSplitData(result);
      success(`Successfully processed ${processedImages.length} pages from PDF`);
      
      return result;
    } catch (error) {
      showError(`Failed to process PDF: ${error.message}`);
      return null;
    } finally {
      setIsProcessing(false);
      setProcessingProgress(0);
    }
  }, [courseId, showError, success]);

  const updateImageArrangement = useCallback((newImages) => {
    if (!splitData) return;
    
    const updatedData = {
      ...splitData,
      images: newImages.map((image, index) => ({
        ...image,
        currentOrder: index + 1,
        pageNumber: index + 1
      }))
    };
    
    setSplitData(updatedData);
  }, [splitData]);

  const updateFormatSettings = useCallback((format, settings) => {
    if (!splitData) return;
    
    const updatedData = {
      ...splitData,
      format,
      settings
    };
    
    setSplitData(updatedData);
  }, [splitData]);

  const reset = useCallback(() => {
    if (splitData && splitData.images) {
      cleanupImageUrls(splitData.images);
    }
    setSplitData(null);
    setProcessingProgress(0);
    setIsProcessing(false);
  }, [splitData]);

  const getImageUrls = useCallback(() => {
    if (!splitData || !splitData.images) return [];
    return splitData.images.map(image => image.imageUrl);
  }, [splitData]);

  const getImageCount = useCallback(() => {
    return splitData?.images?.length || 0;
  }, [splitData]);

  const getFormatInfo = useCallback(() => {
    if (!splitData) return null;
    return {
      format: splitData.format,
      settings: splitData.settings
    };
  }, [splitData]);

  return {
    // State
    isProcessing,
    processingProgress,
    splitData,
    
    // Actions
    processPdf,
    updateImageArrangement,
    updateFormatSettings,
    reset,
    
    // Getters
    getImageUrls,
    getImageCount,
    getFormatInfo
  };
};

export default usePdfSplitter;
