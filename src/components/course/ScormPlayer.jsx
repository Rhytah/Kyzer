
import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { Download, RefreshCw, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { useAuth } from '@/hooks/auth/useAuth';
import { useCourseStore } from '@/store/courseStore';
import { supabase } from '@/lib/supabase';
import { SCORMPackageParser } from '@/lib/scormParser';

/**
 * Production-Ready SCORM Player with Supabase Public Storage
 */
const ScormPlayer = ({ 
  scormUrl, 
  lessonId, 
  courseId, 
  onProgress, 
  onComplete,
  onError,
  width = '100%',
  height = '600px',
  autoSave = true,
  autoSaveInterval = 30000
}) => {
  const { user } = useAuth();
  const { actions } = useCourseStore();
  const iframeRef = useRef(null);
  const autoSaveTimerRef = useRef(null);
  const scormApiRef = useRef(null);
  const mountedRef = useRef(true);
  const sessionStartTimeRef = useRef(new Date());
  const isInitializedRef = useRef(false);
  
  // State management
  const [isLoading, setIsLoading] = useState(true);
  const [scormData, setScormData] = useState({});
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('not_attempted');
  const [scormContentUrl, setScormContentUrl] = useState(null);
  const [loadingStep, setLoadingStep] = useState('');
  const [scormVersion, setScormVersion] = useState(null);
  const [packageMetadata, setPackageMetadata] = useState(null);
  const [lastSaveTime, setLastSaveTime] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [loadingStartTime, setLoadingStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);

  /**
   * Get properly formatted Supabase public URL
   * Handles both full URLs and storage paths
   */
  // const getPublicUrl = useCallback((urlOrPath) => {
  //   if (!urlOrPath) return null;

  //   console.log('Processing URL/path:', urlOrPath);

  //   // If it's already a complete URL, use it
  //   if (urlOrPath.startsWith('http://') || urlOrPath.startsWith('https://')) {
  //     console.log('Already a full URL');
  //     return urlOrPath;
  //   }

  //   // Extract the file path from various formats
  //   let filePath = urlOrPath;

  //   // Remove 'lessons/scorm/' or 'course-content/' prefixes if present
  //   filePath = filePath.replace(/^course-content\//, '');
  //   filePath = filePath.replace(/^lessons\/scorm\//, 'lessons/scorm/');

  //   // Ensure the path starts with 'lessons/scorm/'
  //   if (!filePath.startsWith('lessons/scorm/') && !filePath.startsWith('lessons/')) {
  //     filePath = 'lessons/scorm/' + filePath;
  //   }

  //   console.log('Resolved file path:', filePath);

  //   // Use Supabase's getPublicUrl method
  //   const { data } = supabase.storage
  //     .from('course-content')
  //     .getPublicUrl(filePath);

  //   console.log('Generated public URL:', data.publicUrl);

  //   return data.publicUrl;
  // }, []);
/**
 * Get properly formatted Supabase public URL with exact path matching
 */
/**
 * Get properly formatted Supabase public URL with exact path matching
 */
const getPublicUrl = useCallback((urlOrPath) => {
  if (!urlOrPath) return null;

  // If it's already a complete Supabase URL, extract the exact path
  if (urlOrPath.includes('supabase.co/storage/v1/object/public/')) {
    // Extract the exact path after '/public/'
    const fullPath = urlOrPath.split('/object/public/')[1];
    
    // The path already includes the bucket name, so we need to split it
    const parts = fullPath.split('/');
    const bucketName = parts[0]; // This should be 'course-content'
    const filePath = parts.slice(1).join('/'); // This is the actual file path
    
    // Use the exact path to generate URL
    const { data } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);

    return data.publicUrl;
  }

  // If it's already a complete URL (but not Supabase), use it
  if (urlOrPath.startsWith('http://') || urlOrPath.startsWith('https://')) {
    return urlOrPath;
  }

  // For storage paths, use them exactly as provided
  const { data } = supabase.storage
    .from('course-content')
    .getPublicUrl(urlOrPath);

  return data.publicUrl;
}, []);
  /**
   * Download SCORM package with proper error handling
   */
  // const downloadScormPackage = useCallback(async (url) => {
  //   try {
  //     console.log('Downloading from URL:', url);

  //     const response = await fetch(url, {
  //       method: 'GET',
  //       headers: {
  //         'Accept': 'application/zip, application/octet-stream, */*',
  //       },
  //       mode: 'cors',
  //       credentials: 'omit'
  //     });

  //     console.log('Download response:', {
  //       ok: response.ok,
  //       status: response.status,
  //       statusText: response.statusText,
  //       contentType: response.headers.get('content-type'),
  //       contentLength: response.headers.get('content-length')
  //     });

  //     if (!response.ok) {
  //       throw new Error(`Download failed: HTTP ${response.status} ${response.statusText}`);
  //     }

  //     const blob = await response.blob();
  //     console.log('Downloaded blob size:', blob.size, 'bytes');

  //     if (blob.size === 0) {
  //       throw new Error('Downloaded file is empty (0 bytes)');
  //     }

  //     return blob;
  //   } catch (error) {
  //     console.error('Download error:', error);
  //     throw error;
  //   }
  // }, []);
/**
 * Download SCORM package with enhanced error handling
 */
const downloadScormPackage = useCallback(async (url) => {
  try {
    // First, try a simple fetch with minimal headers
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': '*/*',
        'Cache-Control': 'no-cache'
      },
      // Important: Supabase may require specific CORS handling
      mode: 'cors',
      credentials: 'omit'
    });

    if (!response.ok) {
      // Get detailed error message
      let errorBody = '';
      try {
        errorBody = await response.text();
      } catch (e) {
        errorBody = 'Could not read error response';
      }
      
      throw new Error(`HTTP ${response.status}: ${response.statusText}. Details: ${errorBody}`);
    }

    const blob = await response.blob();

    if (blob.size === 0) {
      throw new Error('Downloaded file is empty (0 bytes)');
    }

    // Verify it's a ZIP file (Supabase might return JSON errors as successful responses)
    if (blob.type && !blob.type.includes('application/zip') && !blob.type.includes('application/octet-stream')) {
      // Try to read as text to see if it's an error message
      const text = await blob.text();
      if (text.includes('error') || text.includes('message')) {
        throw new Error(`Server returned error: ${text.substring(0, 200)}`);
      }
    }

    return blob;
  } catch (error) {
    throw error;
  }
}, []);
  /**
   * Calculate session time in ISO 8601 duration format
   */
  const calculateSessionTime = useCallback(() => {
    const duration = Math.floor((new Date() - sessionStartTimeRef.current) / 1000);
    const hours = Math.floor(duration / 3600);
    const minutes = Math.floor((duration % 3600) / 60);
    const seconds = duration % 60;
    return `PT${hours}H${minutes}M${seconds}S`;
  }, []);

  /**
   * Update lesson progress with retry logic
   */
  const updateLessonProgress = useCallback(async (metadata = {}, retryCount = 0) => {
    if (!mountedRef.current || !user?.id || !lessonId || !courseId) return false;

    try {
      setIsSaving(true);
      
      const currentData = {
        ...scormData,
        ...metadata,
        session_time: calculateSessionTime(),
        last_updated: new Date().toISOString()
      };

      await actions.updateLessonProgress(
        user.id,
        lessonId,
        courseId,
        status === 'completed' || status === 'passed',
        currentData
      );

      if (mountedRef.current) {
        setLastSaveTime(new Date());
        setIsSaving(false);
      }
      
      return true;
    } catch (error) {
      // Error updating lesson progress
      
      if (retryCount < 3 && mountedRef.current) {
        await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
        return updateLessonProgress(metadata, retryCount + 1);
      }
      
      if (mountedRef.current) {
        setIsSaving(false);
      }
      return false;
    }
  }, [user?.id, lessonId, courseId, status, scormData, actions, calculateSessionTime]);

  /**
   * Handle lesson completion
   */
  const handleCompletion = useCallback(async () => {
    if (!mountedRef.current || !user?.id || !lessonId || !courseId) return;

    try {
      await actions.updateLessonProgress(
        user.id,
        lessonId,
        courseId,
        true,
        {
          ...scormData,
          completed_at: new Date().toISOString(),
          final_score: progress,
          final_status: status,
          total_time: calculateSessionTime()
        }
      );

      await actions.calculateCourseProgress(user.id, courseId);

      if (onComplete) {
        onComplete({
          lessonId,
          courseId,
          score: progress,
          status,
          scormData,
          completionTime: new Date()
        });
      }
    } catch (error) {
      // Error completing lesson
      if (onError) onError(error);
    }
  }, [user?.id, lessonId, courseId, progress, status, scormData, actions, onComplete, onError, calculateSessionTime]);

  /**
   * Create SCORM API wrapper
   */
  const createScormAPI = useCallback(() => {
    if (!user?.id) return null;

    const scorm12API = {
      LMSInitialize: () => {
        if (mountedRef.current) setStatus('incomplete');
        return 'true';
      },
      LMSFinish: () => {
        updateLessonProgress({ finished: true });
        return 'true';
      },
      LMSGetValue: (element) => String(scormData[element] || ''),
      LMSSetValue: (element, value) => {
        if (!mountedRef.current) return 'true';
        setScormData(prev => ({ ...prev, [element]: value }));
        if (element === 'cmi.core.lesson_status') {
          setStatus(value);
          if (value === 'completed' || value === 'passed') handleCompletion();
        }
        if (element === 'cmi.core.score.raw') {
          const score = Math.min(100, Math.max(0, parseFloat(value) || 0));
          setProgress(score);
          if (onProgress) onProgress(score);
        }
        return 'true';
      },
      LMSCommit: () => {
        updateLessonProgress();
        return 'true';
      },
      LMSGetLastError: () => '0',
      LMSGetErrorString: () => 'No error',
      LMSGetDiagnostic: () => 'No diagnostic'
    };

    const scorm2004API = {
      Initialize: () => {
        if (mountedRef.current) setStatus('incomplete');
        return 'true';
      },
      Terminate: () => {
        updateLessonProgress({ terminated: true });
        return 'true';
      },
      GetValue: (element) => String(scormData[element] || ''),
      SetValue: (element, value) => {
        if (!mountedRef.current) return 'true';
        setScormData(prev => ({ ...prev, [element]: value }));
        if (element === 'cmi.completion_status') {
          setStatus(value);
          if (value === 'completed') handleCompletion();
        }
        if (element === 'cmi.success_status' && value === 'passed') {
          setStatus('passed');
          handleCompletion();
        }
        if (element === 'cmi.progress_measure') {
          const progressValue = Math.round((parseFloat(value) || 0) * 100);
          setProgress(progressValue);
          if (onProgress) onProgress(progressValue);
        }
        if (element === 'cmi.score.raw' || element === 'cmi.score.scaled') {
          const score = parseFloat(value) || 0;
          const percentage = element === 'cmi.score.scaled' ? Math.round(score * 100) : score;
          setProgress(Math.min(100, Math.max(0, percentage)));
          if (onProgress) onProgress(percentage);
        }
        return 'true';
      },
      Commit: () => {
        updateLessonProgress();
        return 'true';
      },
      GetLastError: () => '0',
      GetErrorString: () => 'No error',
      GetDiagnostic: () => 'No diagnostic'
    };

    return { scorm12API, scorm2004API };
  }, [scormData, user?.id, onProgress, handleCompletion, updateLessonProgress]);

  /**
   * Extract and display SCORM package
   */
//   const extractAndDisplayScorm = useCallback(async (publicUrl) => {
//     if (!mountedRef.current) return;

//     try {
//       setLoadingStep('Downloading SCORM package...');
      
//       const zipBlob = await downloadScormPackage(publicUrl);
      
//       if (!mountedRef.current) return;
      
//       console.log(`Package downloaded: ${(zipBlob.size / 1024).toFixed(2)} KB`);
      
//       setLoadingStep('Parsing SCORM manifest...');
      
//       const parser = new SCORMPackageParser(zipBlob);
//       const parseResult = await parser.parse();
      
//       if (!parseResult.isValid) {
//         throw new Error(`Invalid SCORM package: ${parseResult.error || 'Unknown error'}`);
//       }
      
//       console.log('SCORM parsed:', parseResult);
      
//       if (!mountedRef.current) return;
      
//       setScormVersion(parseResult.version);
//       setPackageMetadata(parseResult.packageData);
      
//       const entryPoint = parseResult.packageData?.launchUrl;
//       if (!entryPoint) {
//         throw new Error('No launch URL found in manifest');
//       }
      
//       setLoadingStep('Extracting content...');
      
//       const JSZip = (await import('jszip')).default;
//       const zip = new JSZip();
//       const zipContent = await zip.loadAsync(zipBlob);
      
//       const entryFile = zipContent.files[entryPoint];
//       if (!entryFile) {
//         throw new Error(`Entry file not found: ${entryPoint}`);
//       }
      
//       const content = await entryFile.async('text');
      
//       if (!mountedRef.current) return;
      
//       const isPlaceholder = content.length < 100 || 
//                            content.includes('Not implemented') || 
//                            content.includes('placeholder');
      
//       const htmlContent = `<!DOCTYPE html>
// <html>
// <head>
//   <meta charset="utf-8">
//   <meta name="viewport" content="width=device-width, initial-scale=1.0">
//   <title>${parseResult.packageData?.title || 'SCORM Content'}</title>
//   <style>
//     * { box-sizing: border-box; margin: 0; padding: 0; }
//     body { 
//       font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
//       background: #fff;
//     }
//     .scorm-header {
//       background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
//       color: white;
//       padding: 20px 24px;
//       box-shadow: 0 2px 8px rgba(0,0,0,0.1);
//     }
//     .scorm-header h1 { font-size: 1.5rem; margin-bottom: 4px; }
//     .scorm-header p { opacity: 0.9; font-size: 0.9rem; }
//     .content { padding: 24px; min-height: 400px; }
//     ${isPlaceholder ? `
//     .placeholder {
//       background: #fff3cd;
//       border-left: 4px solid #ffc107;
//       padding: 16px 24px;
//       margin: 16px;
//       border-radius: 4px;
//       color: #856404;
//     }
//     ` : ''}
//   </style>
// </head>
// <body>
//   <div class="scorm-header">
//     <h1>${parseResult.packageData?.title || 'SCORM Package'}</h1>
//     <p>${parseResult.packageData?.description || 'Interactive learning content'}</p>
//   </div>
//   ${isPlaceholder ? '<div class="placeholder">⚠️ This package contains placeholder content.</div>' : ''}
//   <div class="content">${content}</div>
// </body>
// </html>`;
      
//       const blob = new Blob([htmlContent], { type: 'text/html' });
//       const contentUrl = URL.createObjectURL(blob);
      
//       if (mountedRef.current) {
//         setScormContentUrl(contentUrl);
//         setIsLoading(false);
//         setLoadingStep('');
//       } else {
//         URL.revokeObjectURL(contentUrl);
//       }
      
//     } catch (error) {
//       if (!mountedRef.current) return;
      
//       console.error('Extraction error:', error);
      
//       let errorMessage = 'Failed to load SCORM package: ';
//       if (error.message.includes('HTTP 400')) {
//         errorMessage += 'File path is invalid. Check the URL in your database.';
//       } else if (error.message.includes('HTTP 404')) {
//         errorMessage += 'File not found. The package may have been deleted.';
//       } else if (error.message.includes('HTTP 403')) {
//         errorMessage += 'Access denied. Check storage bucket permissions.';
//       } else if (error.message.includes('empty')) {
//         errorMessage += 'Downloaded file is empty or corrupted.';
//       } else {
//         errorMessage += error.message;
//       }
      
//       setError(errorMessage);
//       setIsLoading(false);
//       setLoadingStep('');
//       if (onError) onError(error);
//     }
//   }, [downloadScormPackage, onError]);
  /**
   * Process SCORM package
   */
  // const processScormPackage = useCallback(async () => {
  //   if (!scormUrl || !mountedRef.current) return;

  //   try {
  //     setIsLoading(true);
  //     setError(null);
  //     setLoadingStep('Preparing download...');

  //     console.log('=== SCORM Processing Started ===');
  //     console.log('Input URL:', scormUrl);

  //     // Get the properly formatted public URL
  //     const publicUrl = getPublicUrl(scormUrl);
  //     console.log('Public URL:', publicUrl);

  //     if (!publicUrl) {
  //       throw new Error('Could not generate valid URL from path');
  //     }

  //     await extractAndDisplayScorm(publicUrl);
      
  //   } catch (error) {
  //     if (!mountedRef.current) return;
      
  //     console.error('Processing error:', error);
  //     setError(error.message);
  //     setIsLoading(false);
  //     setLoadingStep('');
  //     if (onError) onError(error);
  //   }
  // }, [scormUrl, getPublicUrl, extractAndDisplayScorm, onError]);
/**
 * Process SCORM package with exact path matching
 */
/**
 * Process SCORM package with exact path matching
 */
const processScormPackage = useCallback(async () => {
  if (!scormUrl || !mountedRef.current) return;

  let zipBlobSize = 0;
  let currentStep = 'Starting...';

  const timeoutId = setTimeout(() => {
    if (mountedRef.current) {
      setError(`SCORM package loading timed out after 3 minutes. Current step: ${currentStep}. ${zipBlobSize > 0 ? `Package size: ${(zipBlobSize / 1024 / 1024).toFixed(2)} MB. ` : ''}The package may be too large or the connection is slow. Please try again or contact support.`);
      setIsLoading(false);
      setLoadingStep('');
      if (onError) onError(new Error('Loading timeout'));
    }
  }, 180000); // 3 minute timeout (increased from 2 minutes)

  try {
    setIsLoading(true);
    setError(null);
    setLoadingStartTime(Date.now());
    setElapsedTime(0);
    setLoadingStep('Preparing download...');

    // Get the properly formatted public URL
    const publicUrl = getPublicUrl(scormUrl);

    if (!publicUrl) {
      clearTimeout(timeoutId);
      throw new Error('Could not generate valid URL from path');
    }

    // Extract the exact storage path for direct download
    let storagePath = scormUrl;
    
    // Handle public URLs: /storage/v1/object/public/course-content/path/to/file
    if (scormUrl.includes('supabase.co/storage/v1/object/public/')) {
      const fullPath = scormUrl.split('/object/public/')[1];
      const parts = fullPath.split('/');
      // Remove the bucket name to get just the file path
      storagePath = parts.slice(1).join('/');
    } 
    // Handle authenticated URLs: /storage/v1/object/course-content/path/to/file
    else if (scormUrl.includes('supabase.co/storage/v1/object/')) {
      const fullPath = scormUrl.split('/object/')[1];
      const parts = fullPath.split('/');
      // If first part is the bucket name, remove it
      if (parts[0] === 'course-content') {
        storagePath = parts.slice(1).join('/');
      } else {
        // If no bucket name, use the full path
        storagePath = fullPath;
      }
    }
    // Fallback: try regex extraction for any Supabase URL format
    else if (scormUrl.startsWith('http://') || scormUrl.startsWith('https://')) {
      const urlMatch = scormUrl.match(/\/storage\/v1\/object\/(?:public\/)?([^?#]+)/);
      if (urlMatch) {
        const extractedPath = urlMatch[1];
        const pathParts = extractedPath.split('/');
        // If first part is the bucket name, remove it
        if (pathParts[0] === 'course-content') {
          storagePath = pathParts.slice(1).join('/');
        } else {
          storagePath = extractedPath;
        }
      }
    }

    // Try direct Supabase download first with exact path
    setLoadingStep('Downloading SCORM package...');
    
    let zipBlob;
    try {
      const downloadPromise = supabase.storage
        .from('course-content')
        .download(storagePath);

      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Download timeout after 60 seconds')), 60000)
      );

      const { data, error } = await Promise.race([downloadPromise, timeoutPromise]);

      if (error) {
        // Provide more specific error messages for common errors
        const errorMessage = error.message || error.toString();
        const statusCode = error.statusCode || error.status || (errorMessage.includes('400') ? 400 : null);
        
        if (statusCode === 400 || errorMessage.includes('400') || errorMessage.includes('Bad Request')) {
          // Try to list files in the directory to help diagnose the issue
          const pathParts = storagePath.split('/');
          const directory = pathParts.slice(0, -1).join('/');
          const fileName = pathParts[pathParts.length - 1];
          
          let directoryInfo = '';
          try {
            const { data: files, error: listError } = await supabase.storage
              .from('course-content')
              .list(directory, { limit: 10 });
            
            if (!listError && files && files.length > 0) {
              const fileNames = files.map(f => f.name).join(', ');
              directoryInfo = ` Files found in directory: ${fileNames}.`;
            }
          } catch (listErr) {
            // Ignore listing errors, just use the main error
          }
          
          throw new Error(
            `SCORM package file not found at path: ${storagePath}. ` +
            `The file "${fileName}" may have been moved, deleted, or the path is incorrect.${directoryInfo} ` +
            `Please verify the file exists in Supabase storage bucket "course-content" at path "${storagePath}". ` +
            `If the file was recently uploaded, it may have a timestamp suffix in the filename.`
          );
        }
        
        if (statusCode === 404 || errorMessage.includes('404') || errorMessage.includes('Not Found')) {
          throw new Error(
            `SCORM package file not found at path: ${storagePath}. ` +
            `Please verify the file exists in Supabase storage.`
          );
        }
        
        throw new Error(`Failed to download SCORM package: ${errorMessage}`);
      }

      if (!data) {
        throw new Error('No data received from Supabase storage');
      }
      
      zipBlob = data;
      zipBlobSize = zipBlob.size;
      currentStep = 'Download complete';
      setLoadingStep(`Downloaded ${(zipBlob.size / 1024 / 1024).toFixed(2)} MB`);
    } catch (supabaseError) {
      // If Supabase download fails, try public URL fetch
      currentStep = 'Trying alternative download method...';
      setLoadingStep('Trying alternative download method...');
      
      try {
        const downloadPromise = downloadScormPackage(publicUrl);
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Download timeout after 60 seconds')), 60000)
        );
        zipBlob = await Promise.race([downloadPromise, timeoutPromise]);
        zipBlobSize = zipBlob.size;
        currentStep = 'Download complete';
        setLoadingStep(`Downloaded ${(zipBlob.size / 1024 / 1024).toFixed(2)} MB`);
      } catch (fetchError) {
        // Both methods failed - provide comprehensive error message
        const errorMessage = supabaseError.message || supabaseError.toString();
        const fetchErrorMessage = fetchError.message || fetchError.toString();
        throw new Error(
          `Failed to download SCORM package. ` +
          `Storage error: ${errorMessage}. ` +
          `Public URL error: ${fetchErrorMessage}. ` +
          `Please verify the file exists at: ${storagePath}`
        );
      }
    }

    if (!mountedRef.current) {
      clearTimeout(timeoutId);
      return;
    }

    // Small delay to ensure UI updates
    await new Promise(resolve => setTimeout(resolve, 100));

    if (!mountedRef.current) {
      clearTimeout(timeoutId);
      return;
    }

    // Update loading step before parsing
    currentStep = 'Parsing SCORM manifest...';
    setLoadingStep('Parsing SCORM manifest...');
    
    // Force a UI update
    await new Promise(resolve => setTimeout(resolve, 50));
    
    if (!mountedRef.current) {
      clearTimeout(timeoutId);
      return;
    }
    
    let parseResult;
    try {
      // Add timeout for parsing to prevent indefinite hanging
      const parsePromise = (async () => {
        const parser = new SCORMPackageParser(zipBlob);
        return await parser.parse();
      })();
      
      const parseTimeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Parsing timeout after 30 seconds. The SCORM package may be corrupted or too complex.')), 30000)
      );
      
      parseResult = await Promise.race([parsePromise, parseTimeoutPromise]);
      
      // Update step after successful parsing
      currentStep = 'Manifest parsed successfully';
      setLoadingStep('Manifest parsed, extracting content...');
    } catch (parseError) {
      throw new Error(`Failed to parse SCORM manifest: ${parseError.message || 'Unknown parsing error'}`);
    }
    
    if (!parseResult || !parseResult.isValid) {
      throw new Error(`Invalid SCORM package: ${parseResult?.error || 'Unknown error'}`);
    }
    
    if (!mountedRef.current) {
      clearTimeout(timeoutId);
      return;
    }
    
    setScormVersion(parseResult.version);
    setPackageMetadata(parseResult.packageData);
    
    const entryPoint = parseResult.packageData?.launchUrl;
    if (!entryPoint) {
      clearTimeout(timeoutId);
      throw new Error('No launch URL found in manifest');
    }
    
    currentStep = 'Extracting content...';
    setLoadingStep('Extracting content from ZIP...');
    
    // Force UI update
    await new Promise(resolve => setTimeout(resolve, 50));
    
    if (!mountedRef.current) {
      clearTimeout(timeoutId);
      return;
    }
    
    // Add timeout for ZIP loading
    const zipLoadPromise = (async () => {
      const JSZip = (await import('jszip')).default;
      const zip = new JSZip();
      return await zip.loadAsync(zipBlob);
    })();
    
    const zipLoadTimeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('ZIP extraction timeout after 30 seconds')), 30000)
    );
    
    const zipContent = await Promise.race([zipLoadPromise, zipLoadTimeoutPromise]);
    
    const entryFile = zipContent.files[entryPoint];
    if (!entryFile) {
      throw new Error(`Entry file not found: ${entryPoint}`);
    }
    
    // Get the directory of the entry point
    const entryDir = entryPoint.substring(0, entryPoint.lastIndexOf('/') + 1);
    
    // Extract entry file content first to find referenced assets
    const entryContent = await entryFile.async('text');
    
    if (!mountedRef.current) {
      clearTimeout(timeoutId);
      return;
    }
    
    // Extract only necessary files (entry file and assets referenced in HTML)
    // This is much faster than extracting all files
    const fileMap = {};
    const blobUrlsToCleanup = [];
    
    // Find referenced files in the HTML (CSS, JS, images, etc.)
    const assetPatterns = [
      /href=["']([^"']+\.(css|ico))["']/gi,
      /src=["']([^"']+\.(js|jpg|jpeg|png|gif|svg|webp|mp4|mp3|wav|ogg))["']/gi,
      /url\(["']?([^"')]+)["']?\)/gi,
      /background=["']([^"']+)["']/gi
    ];
    
    const referencedFiles = new Set();
    assetPatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(entryContent)) !== null) {
        const filePath = match[1] || match[0];
        if (filePath && !filePath.startsWith('http') && !filePath.startsWith('data:')) {
          // Resolve relative paths
          let resolved = filePath;
          if (filePath.startsWith('./')) {
            resolved = entryDir + filePath.substring(2);
          } else if (filePath.startsWith('../')) {
            const pathParts = entryDir.split('/').filter(p => p);
            pathParts.pop();
            resolved = pathParts.join('/') + '/' + filePath.substring(3);
          } else if (!filePath.startsWith('/')) {
            resolved = entryDir + filePath;
          } else {
            resolved = filePath.substring(1);
          }
          resolved = resolved.replace(/\/+/g, '/').replace(/^\/+/, '');
          referencedFiles.add(resolved);
        }
      }
    });
    
    // Also include files in the same directory as entry point
    Object.keys(zipContent.files).forEach(path => {
      if (path.startsWith(entryDir) && !zipContent.files[path].dir) {
        const relativePath = path.replace(entryDir, '');
        if (relativePath && !relativePath.includes('/')) {
          referencedFiles.add(path);
        }
      }
    });
    
    // Extract only referenced files and common asset types
    // Use parallel extraction for better performance
    currentStep = `Extracting ${referencedFiles.size} files...`;
    setLoadingStep(`Extracting ${referencedFiles.size} files...`);
    
    const totalFiles = referencedFiles.size;
    const extractionPromises = [];
    
    for (const relativePath of referencedFiles) {
      const file = zipContent.files[relativePath];
      if (!file || file.dir) continue;
      
      const extractionPromise = (async () => {
        try {
          let blob;
          const fileExtension = relativePath.split('.').pop()?.toLowerCase() || '';
          
          if (['css', 'js', 'html', 'htm', 'xml', 'json', 'txt'].includes(fileExtension)) {
            const text = await file.async('text');
            const mimeType = fileExtension === 'css' ? 'text/css' :
                            fileExtension === 'js' ? 'application/javascript' :
                            fileExtension === 'html' || fileExtension === 'htm' ? 'text/html' :
                            fileExtension === 'xml' ? 'application/xml' :
                            fileExtension === 'json' ? 'application/json' : 'text/plain';
            blob = new Blob([text], { type: mimeType });
          } else {
            blob = await file.async('blob');
          }
          
          const blobUrl = URL.createObjectURL(blob);
          return { path: relativePath, url: blobUrl };
        } catch (err) {
          // Skip files that can't be extracted
          return null;
        }
      })();
      
      extractionPromises.push(extractionPromise);
    }
    
    // Extract files in parallel with progress updates
    let completedCount = 0;
    const progressInterval = setInterval(() => {
      if (mountedRef.current && completedCount < totalFiles) {
        currentStep = `Extracting files... (${completedCount}/${totalFiles})`;
        setLoadingStep(`Extracting files... (${completedCount}/${totalFiles})`);
      }
    }, 500);
    
    try {
      const results = await Promise.all(extractionPromises);
      
      if (!mountedRef.current) {
        clearTimeout(timeoutId);
        clearInterval(progressInterval);
        return;
      }
      
      results.forEach(result => {
        if (result) {
          fileMap[result.path] = result.url;
          blobUrlsToCleanup.push(result.url);
        }
      });
      
      completedCount = totalFiles;
    } finally {
      clearInterval(progressInterval);
    }
    
    // Also extract the entry file itself
    const entryBlob = new Blob([entryContent], { type: 'text/html' });
    const entryBlobUrl = URL.createObjectURL(entryBlob);
    fileMap[entryPoint] = entryBlobUrl;
    blobUrlsToCleanup.push(entryBlobUrl);
    
    // Rewrite HTML content to use absolute blob URLs for assets
    let processedContent = entryContent;
    
    // Simple regex-based replacement for common asset references
    // Replace relative paths in src, href, and url() references
    processedContent = processedContent.replace(
      /(src|href|url\(['"]?)(\.\/|\.\.\/)?([^'")\s]+)(['"]?\)?)/gi,
      (match, prefix, relPath, filePath, suffix) => {
        // Skip if already absolute URL
        if (filePath.startsWith('http://') || filePath.startsWith('https://') || filePath.startsWith('data:')) {
          return match;
        }
        
        // Resolve relative path
        let resolvedPath = filePath;
        if (relPath) {
          const pathParts = entryDir.split('/').filter(p => p);
          if (relPath === '../') {
            pathParts.pop();
          }
          resolvedPath = pathParts.join('/') + '/' + filePath;
        } else if (!filePath.startsWith('/')) {
          resolvedPath = entryDir + filePath;
        }
        
        // Normalize path
        resolvedPath = resolvedPath.replace(/\/+/g, '/').replace(/^\/+/, '');
        
        // Replace with blob URL if available
        if (fileMap[resolvedPath]) {
          return prefix + fileMap[resolvedPath] + suffix;
        }
        
        return match;
      }
    );
    
    // Create HTML with file map for dynamic loading
    const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${parseResult.packageData?.title || 'SCORM Content'}</title>
  <script>
    // File map for accessing extracted files
    window.__scormFileMap = ${JSON.stringify(fileMap)};
    window.__scormBaseDir = '${entryDir}';
    
    // Helper to resolve file paths
    window.__scormResolvePath = function(path) {
      if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
        return path;
      }
      const baseDir = window.__scormBaseDir;
      let resolved = path.startsWith('/') ? path.substring(1) : baseDir + path;
      resolved = resolved.replace(/\\/\\.\\//g, '/').replace(/\\/\\.\\.\\//g, '/');
      return window.__scormFileMap[resolved] || path;
    };
    
    // Override fetch to serve from blob URLs
    const originalFetch = window.fetch;
    window.fetch = function(url, options) {
      if (typeof url === 'string' && !url.startsWith('http') && !url.startsWith('data:')) {
        const resolved = window.__scormResolvePath(url);
        if (resolved !== url && resolved.startsWith('blob:')) {
          return originalFetch(resolved, options);
        }
      }
      return originalFetch(url, options);
    };
    
    // Fix asset URLs after DOM loads
    document.addEventListener('DOMContentLoaded', function() {
      const fixUrls = function() {
        document.querySelectorAll('img[src], link[href], script[src], source[src]').forEach(el => {
          const attr = el.hasAttribute('src') ? 'src' : 'href';
          const url = el.getAttribute(attr);
          if (url && !url.startsWith('http') && !url.startsWith('data:') && !url.startsWith('blob:')) {
            const resolved = window.__scormResolvePath(url);
            if (resolved !== url) {
              el.setAttribute(attr, resolved);
            }
          }
        });
      };
      fixUrls();
      setTimeout(fixUrls, 100);
      setTimeout(fixUrls, 500);
    });
  </script>
</head>
<body>
  ${processedContent}
</body>
</html>`;
    
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const contentUrl = URL.createObjectURL(blob);
    
    // Store blob URLs for cleanup
    clearTimeout(timeoutId);
    
    if (mountedRef.current) {
      setScormContentUrl(contentUrl);
    setIsLoading(false);
    setLoadingStep('');
    
      // Store blob URLs for cleanup on unmount
      if (!window.__scormBlobUrls) {
        window.__scormBlobUrls = [];
      }
      window.__scormBlobUrls.push(...blobUrlsToCleanup);
    } else {
      URL.revokeObjectURL(contentUrl);
      blobUrlsToCleanup.forEach(url => URL.revokeObjectURL(url));
    }
    
  } catch (error) {
    clearTimeout(timeoutId);
    if (!mountedRef.current) return;
    
    let errorMessage = error.message || error.toString() || 'Failed to load SCORM package: Unknown error occurred.';
    
    // If the error message already contains detailed information, use it as-is
    // Otherwise, add context
    if (!errorMessage.includes('SCORM package') && !errorMessage.includes('Failed to download')) {
      errorMessage = `Failed to load SCORM package: ${errorMessage}`;
    }
    
    setError(errorMessage);
    setIsLoading(false);
    setLoadingStep('');
    if (onError) onError(error);
  }
}, [scormUrl, getPublicUrl, downloadScormPackage, onError]);
  /**
   * Initialize
   */
  useEffect(() => {
    if (!isInitializedRef.current && scormUrl) {
      isInitializedRef.current = true;
      processScormPackage();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scormUrl]);

  /**
   * Auto-save
   */
  useEffect(() => {
    if (!autoSave || !mountedRef.current) return;

    autoSaveTimerRef.current = setInterval(() => {
      if (mountedRef.current && status !== 'not_attempted' && !isSaving) {
        updateLessonProgress({ auto_saved: true });
      }
    }, autoSaveInterval);

    return () => {
      if (autoSaveTimerRef.current) {
        clearInterval(autoSaveTimerRef.current);
        autoSaveTimerRef.current = null;
      }
    };
  }, [autoSave, autoSaveInterval, status, isSaving]);

  /**
   * Initialize SCORM API
   */
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe || !scormContentUrl || !mountedRef.current) return;

    const handleLoad = () => {
      if (!mountedRef.current) return;

      try {
        const apis = createScormAPI();
        scormApiRef.current = apis;
        
        if (apis && iframe.contentWindow) {
          try {
            iframe.contentWindow.API = apis.scorm12API;
            iframe.contentWindow.API_1484_11 = apis.scorm2004API;
            
            if (scormVersion === '2004') {
              apis.scorm2004API.Initialize('');
            } else {
              apis.scorm12API.LMSInitialize('');
            }
          } catch (e) {
            // Cross-origin blocked (expected)
          }
        }
      } catch (error) {
        // API init error
      }
    };

    iframe.addEventListener('load', handleLoad);
    return () => iframe.removeEventListener('load', handleLoad);
  }, [scormContentUrl, scormVersion]);

  /**
   * Cleanup
   */
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (autoSaveTimerRef.current) clearInterval(autoSaveTimerRef.current);
      
      try {
        const apis = scormApiRef.current;
        if (apis) {
          if (scormVersion === '2004') {
            apis.scorm2004API.Terminate('');
          } else {
            apis.scorm12API.LMSFinish('');
          }
        }
      } catch (e) {}
      
      if (scormContentUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(scormContentUrl);
      }
      
      // Cleanup all SCORM blob URLs
      if (window.__scormBlobUrls) {
        window.__scormBlobUrls.forEach(url => {
          try {
            URL.revokeObjectURL(url);
          } catch (e) {
            // Ignore errors during cleanup
          }
        });
        window.__scormBlobUrls = [];
      }
    };
  }, [scormContentUrl, scormVersion]);

  const handleManualSave = useCallback(async () => {
    await updateLessonProgress({ manual_save: true });
  }, []);

  const handleRetry = useCallback(() => {
    setError(null);
    isInitializedRef.current = false;
    processScormPackage();
  }, []);

  const statusDisplay = useMemo(() => {
    const map = {
      'not_attempted': { text: 'Not Started', color: 'text-gray-600', icon: Clock },
      'incomplete': { text: 'In Progress', color: 'text-blue-600', icon: Clock },
      'completed': { text: 'Completed', color: 'text-green-600', icon: CheckCircle },
      'passed': { text: 'Passed', color: 'text-green-600', icon: CheckCircle },
      'failed': { text: 'Failed', color: 'text-red-600', icon: AlertTriangle }
    };
    return map[status] || map['not_attempted'];
  }, [status]);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px] bg-red-50 border border-red-200 rounded-lg p-8">
        <div className="text-center max-w-2xl">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-red-800 mb-3">SCORM Loading Error</h3>
          <p className="text-red-600 mb-4 text-sm">{error}</p>
          
          <div className="bg-red-100 border border-red-300 rounded-lg p-4 mb-6 text-left">
            <p className="text-xs font-semibold text-red-800 mb-2">🔍 Troubleshooting Steps:</p>
            <ol className="text-xs text-red-700 space-y-1 list-decimal list-inside">
              <li>Check if the file exists in Supabase Storage: <code className="bg-red-200 px-1 rounded">course-content</code> bucket</li>
              <li>Verify the file path matches exactly (case-sensitive)</li>
              <li>Ensure file path starts with <code className="bg-red-200 px-1 rounded">lessons/scorm/</code></li>
              <li>Check browser console for detailed error logs</li>
              <li>Try re-uploading the SCORM package</li>
            </ol>
            <div className="mt-3 p-2 bg-red-200 rounded text-xs">
              <strong>Expected path format:</strong><br/>
              <code>lessons/scorm/[uuid]/filename.zip</code>
            </div>
          </div>
          
          <button
            onClick={handleRetry}
            className="inline-flex items-center px-6 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry Loading
          </button>
        </div>
      </div>
    );
  }

  // Update elapsed time while loading
  useEffect(() => {
    if (!isLoading || !loadingStartTime) return;
    
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - loadingStartTime) / 1000);
      setElapsedTime(elapsed);
    }, 1000);
    
    return () => clearInterval(interval);
  }, [isLoading, loadingStartTime]);

  if (isLoading) {
    const minutes = Math.floor(elapsedTime / 60);
    const seconds = elapsedTime % 60;
    const timeDisplay = minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
    
    return (
      <div className="flex items-center justify-center min-h-[400px] bg-gray-50 border border-gray-200 rounded-lg p-8">
        <div className="text-center max-w-md">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 border-4 border-blue-200 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
          </div>
          <p className="text-lg font-medium text-gray-700 mb-2">Loading SCORM content...</p>
          {loadingStep && (
            <p className="text-sm text-gray-600 mb-2">{loadingStep}</p>
          )}
          <p className="text-xs text-gray-500 mt-4">
            Elapsed time: {timeDisplay}
            {elapsedTime > 60 && (
              <span className="block mt-1 text-orange-600">
                This is taking longer than usual. Large packages may take 2-3 minutes.
              </span>
            )}
          </p>
          {elapsedTime > 120 && (
            <button
              onClick={() => {
                setError('Loading cancelled by user');
                setIsLoading(false);
                setLoadingStep('');
                if (onError) onError(new Error('Loading cancelled'));
              }}
              className="mt-4 px-4 py-2 text-sm text-red-600 hover:text-red-700 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
            >
              Cancel Loading
            </button>
          )}
        </div>
      </div>
    );
  }

  const StatusIcon = statusDisplay.icon;

  return (
    <div className="scorm-player-container space-y-4">
      {scormContentUrl && (
        <div className="relative rounded-lg overflow-hidden border border-gray-200 shadow-sm">
          <iframe
            ref={iframeRef}
            src={scormContentUrl}
            width={width}
            height={height}
            className="w-full"
            title="SCORM Content"
            allow="fullscreen"
            sandbox="allow-scripts allow-forms allow-popups allow-downloads allow-same-origin"
            style={{ minHeight: '500px' }}
          />
        </div>
      )}
      
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <StatusIcon className={`w-5 h-5 ${statusDisplay.color}`} />
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Status</p>
              <p className={`font-medium ${statusDisplay.color}`}>{statusDisplay.text}</p>
            </div>
          </div>
          
          {progress > 0 && (
            <div className="flex items-center gap-2">
              <div className="w-32 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-sm font-medium text-gray-700">{progress}%</span>
            </div>
          )}
          
          {lastSaveTime && (
            <div className="text-xs text-gray-500">
              Saved: {lastSaveTime.toLocaleTimeString()}
            </div>
          )}
        </div>
        
        <button
          onClick={handleManualSave}
          disabled={isSaving}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {isSaving ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              Saving...
            </>
          ) : (
            <>
              <Download className="w-4 h-4 mr-2" />
              Save
            </>
          )}
        </button>
      </div>
      
      {packageMetadata && (
        <div className="p-4 bg-white rounded-lg border border-gray-200">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Package Info</h4>
          <div className="grid grid-cols-2 gap-3 text-sm">
            {packageMetadata.title && (
              <div>
                <span className="text-gray-500">Title:</span>
                <span className="ml-2 font-medium">{packageMetadata.title}</span>
              </div>
            )}
            {scormVersion && (
              <div>
                <span className="text-gray-500">Version:</span>
                <span className="ml-2 font-medium">{scormVersion}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ScormPlayer;