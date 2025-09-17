import * as pdfjsLib from 'pdfjs-dist';
import { getFileUrl, STORAGE_BUCKETS } from '../lib/supabase';

// Configure PDF.js worker - use worker from node_modules
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

/**
 * Converts a PDF file to an array of image URLs
 * @param {File} pdfFile - The PDF file to split
 * @param {Object} options - Configuration options
 * @param {number} options.scale - Scale factor for image quality (default: 2.0)
 * @param {string} options.format - Image format ('image/jpeg' or 'image/png', default: 'image/jpeg')
 * @param {number} options.quality - JPEG quality 0-1 (default: 0.8)
 * @returns {Promise<Array>} Array of objects with {pageNumber, imageUrl, blob}
 */
export async function splitPdfToImages(pdfFile, options = {}) {
  const {
    scale = 2.0,
    format = 'image/jpeg',
    quality = 0.8
  } = options;

  try {
    // Load the PDF document
    const arrayBuffer = await pdfFile.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    
    const images = [];
    
    // Process each page
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      
      // Set up canvas for rendering
      const viewport = page.getViewport({ scale });
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      
      // Render the page to canvas
      const renderContext = {
        canvasContext: context,
        viewport: viewport
      };
      
      await page.render(renderContext).promise;
      
      // Convert canvas to blob
      const blob = await new Promise(resolve => {
        canvas.toBlob(resolve, format, quality);
      });
      
      // Create object URL for preview
      const imageUrl = URL.createObjectURL(blob);
      
      images.push({
        pageNumber: pageNum,
        imageUrl,
        blob,
        originalPageNum: pageNum,
        width: viewport.width,
        height: viewport.height
      });
    }
    
    return images;
  } catch (error) {
    throw new Error(`Failed to split PDF: ${error.message}`);
  }
}

/**
 * Uploads a blob as an image file to Supabase storage
 * @param {Blob} blob - The image blob to upload
 * @param {string} fileName - The filename for the uploaded file
 * @param {string} courseId - The course ID for organizing files
 * @param {number} pageNumber - The page number for the filename
 * @returns {Promise<string>} The public URL of the uploaded image
 */
export async function uploadImageBlob(blob, fileName, courseId, pageNumber) {
  try {
    const { uploadFile } = await import('../lib/supabase');
    
    // Create a file from the blob
    const file = new File([blob], fileName, { type: blob.type });
    
    // Upload to storage
    const subdir = `lessons/pdf-images/${courseId}`;
    const uploadResult = await uploadFile(STORAGE_BUCKETS.COURSE_CONTENT, `${subdir}/page_${pageNumber}_${fileName}`, file);
    
    // Return the public URL (uploadResult is an object with a 'path' property)
    return getFileUrl(STORAGE_BUCKETS.COURSE_CONTENT, uploadResult.path);
  } catch (error) {
    throw new Error(`Failed to upload image: ${error.message}`);
  }
}

/**
 * Processes a PDF file and uploads all pages as images
 * @param {File} pdfFile - The PDF file to process
 * @param {string} courseId - The course ID for organizing files
 * @param {Object} options - Configuration options for PDF splitting
 * @returns {Promise<Array>} Array of uploaded image URLs with metadata
 */
export async function processPdfToImages(pdfFile, courseId, options = {}) {
  try {
    // Split PDF into images
    const images = await splitPdfToImages(pdfFile, options);
    
    // Upload each image
    const uploadedImages = await Promise.all(
      images.map(async (image, index) => {
        const fileName = `${pdfFile.name.replace('.pdf', '')}_page_${image.pageNumber}.jpg`;
        const imageUrl = await uploadImageBlob(image.blob, fileName, courseId, image.pageNumber);
        
        // Clean up the temporary object URL
        URL.revokeObjectURL(image.imageUrl);
        
        return {
          ...image,
          imageUrl,
          uploadedFileName: fileName,
          originalFileName: pdfFile.name
        };
      })
    );
    
    return uploadedImages;
  } catch (error) {
    throw new Error(`Failed to process PDF to images: ${error.message}`);
  }
}

/**
 * Cleans up temporary object URLs
 * @param {Array} images - Array of image objects with imageUrl properties
 */
export function cleanupImageUrls(images) {
  images.forEach(image => {
    if (image.imageUrl && image.imageUrl.startsWith('blob:')) {
      URL.revokeObjectURL(image.imageUrl);
    }
  });
}
