import { getFileUrl, STORAGE_BUCKETS } from '../lib/supabase';

/**
 * Fixes malformed split data by reconstructing proper image URLs
 * @param {Object} splitData - The malformed split data
 * @param {string} courseId - The course ID for constructing proper URLs
 * @returns {Object} - Fixed split data with proper image URLs
 */
export function fixMalformedSplitData(splitData, courseId) {
  if (!splitData || !splitData.images || !Array.isArray(splitData.images)) {
    return splitData;
  }

  console.log('Fixing malformed split data for course:', courseId);
  
  const fixedImages = splitData.images.map((image, index) => {
    // If the imageUrl contains [object Object], reconstruct it
    if (image.imageUrl && image.imageUrl.includes('[object Object]')) {
      console.log(`Fixing malformed URL for page ${image.pageNumber}:`, image.imageUrl);
      
      // Construct the proper URL using the uploadedFileName
      if (image.uploadedFileName) {
        const subdir = `lessons/pdf-images/${courseId}`;
        const fileName = image.uploadedFileName;
        const properUrl = getFileUrl(STORAGE_BUCKETS.COURSE_CONTENT, `${subdir}/${fileName}`);
        
        console.log(`Reconstructed URL for page ${image.pageNumber}:`, properUrl);
        
        return {
          ...image,
          imageUrl: properUrl,
          blob: null // Remove empty blob object
        };
      } else {
        console.warn(`No uploadedFileName found for page ${image.pageNumber}, keeping malformed URL`);
        return {
          ...image,
          blob: null // Remove empty blob object
        };
      }
    }
    
    return {
      ...image,
      blob: null // Remove empty blob object for all images
    };
  });

  return {
    ...splitData,
    images: fixedImages
  };
}

/**
 * Checks if split data is malformed
 * @param {Object} splitData - The split data to check
 * @returns {boolean} - True if the data is malformed
 */
export function isSplitDataMalformed(splitData) {
  if (!splitData || !splitData.images || !Array.isArray(splitData.images)) {
    return false;
  }
  
  return splitData.images.some(image => 
    image.imageUrl && image.imageUrl.includes('[object Object]')
  );
}
