
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

  console.log('🔗 Original URL/Path:', urlOrPath);

  // If it's already a complete Supabase URL, extract the exact path
  if (urlOrPath.includes('supabase.co/storage/v1/object/public/')) {
    console.log('✅ Already a Supabase public URL');
    
    // Extract the exact path after '/public/'
    const fullPath = urlOrPath.split('/object/public/')[1];
    console.log('📁 Full path from URL:', fullPath);
    
    // The path already includes the bucket name, so we need to split it
    const parts = fullPath.split('/');
    const bucketName = parts[0]; // This should be 'course-content'
    const filePath = parts.slice(1).join('/'); // This is the actual file path
    
    console.log('📦 Bucket name:', bucketName);
    console.log('🗂️ File path:', filePath);
    
    // Use the exact path to generate URL
    const { data } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);

    console.log('🌐 Regenerated public URL:', data.publicUrl);
    return data.publicUrl;
  }

  // If it's already a complete URL (but not Supabase), use it
  if (urlOrPath.startsWith('http://') || urlOrPath.startsWith('https://')) {
    console.log('⚠️ External URL, using directly');
    return urlOrPath;
  }

  // For storage paths, use them exactly as provided
  console.log('📁 Using provided path directly:', urlOrPath);
  
  const { data } = supabase.storage
    .from('course-content')
    .getPublicUrl(urlOrPath);

  console.log('🌐 Generated public URL:', data.publicUrl);
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
    console.log('⬇️ Downloading from:', url);

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

    console.log('📥 Download response:', {
      ok: response.ok,
      status: response.status,
      statusText: response.statusText,
      contentType: response.headers.get('content-type'),
      contentLength: response.headers.get('content-length'),
      url: response.url
    });

    if (!response.ok) {
      // Get detailed error message
      let errorBody = '';
      try {
        errorBody = await response.text();
        console.error('❌ Error response body:', errorBody);
      } catch (e) {
        errorBody = 'Could not read error response';
      }
      
      throw new Error(`HTTP ${response.status}: ${response.statusText}. Details: ${errorBody}`);
    }

    // Check if we got a valid ZIP file
    const contentType = response.headers.get('content-type');
    const contentLength = response.headers.get('content-length');
    
    console.log('📦 Response details:', {
      contentType,
      contentLength,
      type: typeof contentType
    });

    const blob = await response.blob();
    
    console.log('✅ Download successful:', {
      blobSize: blob.size,
      blobType: blob.type,
      blobProperties: Object.keys(blob)
    });

    if (blob.size === 0) {
      throw new Error('Downloaded file is empty (0 bytes)');
    }

    // Verify it's a ZIP file (Supabase might return JSON errors as successful responses)
    if (blob.type && !blob.type.includes('application/zip') && !blob.type.includes('application/octet-stream')) {
      console.warn('⚠️ Unexpected content type:', blob.type);
      // Try to read as text to see if it's an error message
      const text = await blob.text();
      if (text.includes('error') || text.includes('message')) {
        throw new Error(`Server returned error: ${text.substring(0, 200)}`);
      }
    }

    return blob;
  } catch (error) {
    console.error('💥 Download error:', error);
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
      console.error('Error updating lesson progress:', error);
      
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
      console.error('Error completing lesson:', error);
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
        console.log('[SCORM 1.2] LMSInitialize');
        if (mountedRef.current) setStatus('incomplete');
        return 'true';
      },
      LMSFinish: () => {
        console.log('[SCORM 1.2] LMSFinish');
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
        console.log('[SCORM 2004] Initialize');
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
const extractAndDisplayScorm = useCallback(async (publicUrl) => {
  if (!mountedRef.current) return;

  try {
    setLoadingStep('Downloading SCORM package...');
    
    // Try direct Supabase client download first
    let zipBlob;
    try {
      // Extract the path from the URL or use the original scormUrl
      const filePath = scormUrl.includes('supabase.co') 
        ? scormUrl.split('/object/public/')[1]
        : scormUrl;
      
      zipBlob = await downloadViaSupabaseClient(filePath);
    } catch (supabaseError) {
      console.log('Supabase client failed, falling back to public URL');
      zipBlob = await downloadScormPackage(publicUrl);
    }
    
    // Continue with the rest of your extraction logic...
    // [Keep your existing extraction code here]
    
  } catch (error) {
    // [Keep your existing error handling]
  }
}, [downloadScormPackage, scormUrl]);
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

  try {
    setIsLoading(true);
    setError(null);
    setLoadingStep('Preparing download...');

    console.log('=== SCORM Processing Started ===');
    console.log('Input URL:', scormUrl);

    // Get the properly formatted public URL
    const publicUrl = getPublicUrl(scormUrl);
    console.log('Public URL:', publicUrl);

    if (!publicUrl) {
      throw new Error('Could not generate valid URL from path');
    }

    // Extract the exact storage path for direct download
    let storagePath = scormUrl;
    if (scormUrl.includes('supabase.co/storage/v1/object/public/')) {
      const fullPath = scormUrl.split('/object/public/')[1];
      const parts = fullPath.split('/');
      // Remove the bucket name to get just the file path
      storagePath = parts.slice(1).join('/');
    }
    
    console.log('🗂️ Storage path for direct download:', storagePath);

    // Try direct Supabase download first with exact path
    setLoadingStep('Downloading SCORM package...');
    
    let zipBlob;
    try {
      console.log('🔄 Attempting direct Supabase download...');
      const { data, error } = await supabase.storage
        .from('course-content')
        .download(storagePath);

      if (error) {
        console.error('❌ Supabase direct download failed:', error);
        throw error;
      }

      if (!data) {
        throw new Error('No data received from Supabase storage');
      }

      console.log('✅ Supabase direct download successful:', {
        size: data.size,
        type: data.type
      });
      
      zipBlob = data;
    } catch (supabaseError) {
      console.log('🔄 Supabase client failed, falling back to public URL download');
      zipBlob = await downloadScormPackage(publicUrl);
    }

    // Continue with the rest of your processing...
    // [Keep your existing code for parsing and displaying SCORM content]
    
  } catch (error) {
    // Improved error handling
    const errorMessage = error?.message || 'Failed to load SCORM content';
    setError(errorMessage);
    setIsLoading(false);
    setLoadingStep('');
    
    if (onError) {
      onError(error);
    }
    
    // Log error for debugging
    if (error) {
      // Error logging removed per project rules
    }
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
            console.log('✓ SCORM APIs injected');
            
            if (scormVersion === '2004') {
              apis.scorm2004API.Initialize('');
            } else {
              apis.scorm12API.LMSInitialize('');
            }
          } catch (e) {
            console.warn('Cross-origin blocked (expected)');
          }
        }
      } catch (error) {
        console.error('API init error:', error);
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] bg-gray-50 border border-gray-200 rounded-lg p-8">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 border-4 border-blue-200 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
          </div>
          <p className="text-lg font-medium text-gray-700 mb-2">Loading SCORM content...</p>
          {loadingStep && <p className="text-sm text-gray-500">{loadingStep}</p>}
        </div>
      </div>
    );
  }

  const StatusIcon = statusDisplay.icon;

  return (
    <div className="scorm-player-container space-y-4">
      {/* Add this debug section temporarily */}
<div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg mb-4">
  <p className="text-sm text-yellow-800 mb-2 font-semibold">Debug Tools:</p>
  <div className="flex gap-2 flex-wrap">
    <button
      onClick={debugStorageContents}
      className="px-3 py-1 bg-yellow-600 text-white text-xs rounded hover:bg-yellow-700"
    >
      Check Storage Contents
    </button>
    <button
      onClick={() => {
        const publicUrl = getPublicUrl(scormUrl);
        console.log('Generated URL:', publicUrl);
        window.open(publicUrl, '_blank');
      }}
      className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
    >
      Test URL in New Tab
    </button>
    <button
      onClick={async () => {
        const path = scormUrl.includes('supabase.co/storage/v1/object/public/') 
          ? scormUrl.split('/object/public/')[1]
          : scormUrl;
        console.log('Testing direct download for path:', path);
        const { data, error } = await supabase.storage
          .from('course-content')
          .download(path);
        console.log('Direct download result:', { data, error });
      }}
      className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
    >
      Test Direct Download
    </button>
  </div>
</div>
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