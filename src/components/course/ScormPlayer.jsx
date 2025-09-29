import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Download } from 'lucide-react';
import { useAuth } from '@/hooks/auth/useAuth';
import { useCourseStore } from '@/store/courseStore';
import { supabase } from '@/lib/supabase';
import { SCORMPackageParser } from '@/lib/scormParser';

const ScormPlayer = ({ 
  scormUrl, 
  lessonId, 
  courseId, 
  onProgress, 
  onComplete,
  onError,
  width = '100%',
  height = '600px'
}) => {
  const { user } = useAuth();
  const { actions } = useCourseStore();
  const iframeRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [scormData, setScormData] = useState(null);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('not_attempted');
  const [scormContentUrl, setScormContentUrl] = useState(null);
  const [extractionError, setExtractionError] = useState(null);
  const [scormHtmlContent, setScormHtmlContent] = useState(null);
  const [useDirectDisplay, setUseDirectDisplay] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');

  // Test SCORM URL accessibility
  const testScormUrl = useCallback(async (url) => {
    try {
      const response = await fetch(url, { 
        method: 'HEAD',
        mode: 'cors',
        credentials: 'omit'
      });
      return {
        accessible: response.ok,
        status: response.status,
        statusText: response.statusText,
        contentType: response.headers.get('content-type'),
        contentLength: response.headers.get('content-length')
      };
    } catch (error) {
      return {
        accessible: false,
        error: error.message
      };
    }
  }, []);

  // Process SCORM package and create content URL
  const processScormPackage = useCallback(async () => {
    if (!scormUrl) return;

    try {
      setIsLoading(true);
      setExtractionError(null);
      setLoadingStep('Testing URL accessibility...');

      // First test if the URL is accessible
      console.log('Testing SCORM URL accessibility...');
      const urlTest = await testScormUrl(scormUrl);
      console.log('URL test result:', urlTest);
      
      if (!urlTest.accessible) {
        throw new Error(`SCORM package is not accessible: ${urlTest.error || `HTTP ${urlTest.status} ${urlTest.statusText}`}`);
      }

      setLoadingStep('Downloading SCORM package...');

      // The scormUrl should now be a public URL from Supabase storage
      // We need to extract the ZIP file and create a proper SCORM viewer
      await extractAndDisplayScorm(scormUrl);
      
    } catch (error) {
      console.error('Error processing SCORM package:', error);
      setExtractionError('Failed to process SCORM package: ' + error.message);
      setIsLoading(false);
      setLoadingStep('');
    }
  }, [scormUrl, testScormUrl]);

  // Extract and display SCORM package from ZIP file
  const extractAndDisplayScorm = useCallback(async (zipUrl) => {
    try {
      console.log('Extracting SCORM package from:', zipUrl);
      
      setLoadingStep('Downloading SCORM package...');
      
      // Download the ZIP file with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
      
      const response = await fetch(zipUrl, { 
        signal: controller.signal,
        mode: 'cors',
        credentials: 'omit'
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`Failed to download SCORM package: ${response.status} ${response.statusText}`);
      }
      
      const zipBlob = await response.blob();
      console.log('Downloaded ZIP file, size:', zipBlob.size);
      
      if (zipBlob.size === 0) {
        throw new Error('Downloaded ZIP file is empty');
      }
      
      setLoadingStep('Parsing SCORM manifest...');
      
      // Use the proper SCORM parser to find the correct entry point
      const parser = new SCORMPackageParser(zipBlob);
      const parseResult = await parser.parse();
      
      if (!parseResult.isValid) {
        throw new Error(`Invalid SCORM package: ${parseResult.error}`);
      }
      
      console.log('SCORM package parsed successfully:', parseResult.packageData);
      
      // Get the correct entry point from the manifest
      const entryPoint = parseResult.packageData.launchUrl;
      if (!entryPoint) {
        throw new Error('No launch URL found in SCORM manifest');
      }
      
      console.log('Found launch URL from manifest:', entryPoint);
      
      setLoadingStep('Extracting content files...');
      
      // Use JSZip to extract the specific file
      const JSZip = (await import('jszip')).default;
      const zip = new JSZip();
      const zipContent = await zip.loadAsync(zipBlob);
      
      // Get the entry point content
      const entryFile = zipContent.files[entryPoint];
      if (!entryFile) {
        throw new Error(`Entry point file not found: ${entryPoint}`);
      }
      
      const content = await entryFile.async('text');
      console.log('Extracted content length:', content.length);
      
      // Check if the content is a placeholder or not implemented
      if (content.includes('Not implemented yet') || content.includes('placeholder') || content.length < 100) {
        console.warn('SCORM content appears to be a placeholder or not fully implemented');
        setLoadingStep('Content appears to be a placeholder...');
      }
      
      setLoadingStep('Preparing content for display...');
      
      // Check if content is a placeholder
      const isPlaceholder = content.includes('Not implemented yet') || content.includes('placeholder') || content.length < 100;
      
      // Create a complete HTML page with the SCORM content
      // We need to handle relative paths and assets
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>SCORM Content</title>
          <style>
            body { 
              margin: 0; 
              padding: 0; 
              font-family: Arial, sans-serif;
              background: #f5f5f5;
            }
            .scorm-container {
              width: 100%;
              height: 100vh;
              border: none;
              background: white;
            }
            .scorm-content {
              padding: 20px;
              max-width: 1200px;
              margin: 0 auto;
            }
            .scorm-header {
              background: #007bff;
              color: white;
              padding: 15px 20px;
              margin: -20px -20px 20px -20px;
              border-radius: 8px 8px 0 0;
            }
            .scorm-header h1 {
              margin: 0;
              font-size: 1.5rem;
            }
            .scorm-header p {
              margin: 5px 0 0 0;
              opacity: 0.9;
            }
            .download-link {
              display: inline-block;
              background: #28a745;
              color: white;
              padding: 8px 16px;
              text-decoration: none;
              border-radius: 4px;
              margin-top: 10px;
            }
            .download-link:hover {
              background: #218838;
            }
            .placeholder-notice {
              background: #fff3cd;
              border: 1px solid #ffeaa7;
              color: #856404;
              padding: 15px;
              border-radius: 8px;
              margin-bottom: 20px;
            }
            .placeholder-notice h3 {
              margin: 0 0 10px 0;
              color: #856404;
            }
          </style>
        </head>
        <body>
          <div class="scorm-container">
            <div class="scorm-content">
              <div class="scorm-header">
                <h1>SCORM Package Content</h1>
                <p>This content has been extracted from the uploaded SCORM package</p>
                <a href="${zipUrl}" class="download-link" download>
                  Download Original Package
                </a>
              </div>
              ${isPlaceholder ? `
                <div class="placeholder-notice">
                  <h3>⚠️ Content Notice</h3>
                  <p>This SCORM package appears to contain placeholder content that is not fully implemented. The package structure is valid, but the actual learning content may not be available.</p>
                </div>
              ` : ''}
              <div id="scorm-main-content">
                ${content}
              </div>
            </div>
          </div>
        </body>
        </html>
      `;
      
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const contentUrl = URL.createObjectURL(blob);
      
      console.log('Created SCORM content URL:', contentUrl);
      console.log('HTML content length:', htmlContent.length);
      console.log('Blob size:', blob.size);
      console.log('Blob type:', blob.type);
      
      setScormContentUrl(contentUrl);
      setScormHtmlContent(htmlContent); // Store HTML content for direct display fallback
      setIsLoading(false);
      setLoadingStep('');
      
    } catch (error) {
      console.error('Error extracting SCORM package:', error);
      
      let errorMessage = 'Failed to extract SCORM package: ';
      
      if (error.name === 'AbortError') {
        errorMessage += 'Request timed out. Please check your internet connection and try again.';
      } else if (error.message.includes('Failed to download')) {
        errorMessage += `Download failed: ${error.message}`;
      } else if (error.message.includes('Invalid SCORM package')) {
        errorMessage += `Invalid package format: ${error.message}`;
      } else if (error.message.includes('No launch URL found')) {
        errorMessage += 'SCORM package is missing required manifest information.';
      } else if (error.message.includes('Entry point file not found')) {
        errorMessage += 'SCORM package structure is invalid.';
      } else {
        errorMessage += error.message;
      }
      
      setExtractionError(errorMessage);
      setIsLoading(false);
      setLoadingStep('');
    }
  }, []);

  // Process SCORM package when component mounts or scormUrl changes
  useEffect(() => {
    processScormPackage();
  }, [processScormPackage]);

  // SCORM API wrapper for iframe communication
  const createScormAPI = useCallback(() => {
    if (!iframeRef.current || !user?.id) return null;

    const scormAPI = {
      // SCORM 1.2 API
      LMSInitialize: () => {
        console.log('SCORM: LMSInitialize called');
        return 'true';
      },

      LMSFinish: () => {
        console.log('SCORM: LMSFinish called');
        return 'true';
      },

      LMSGetValue: (element) => {
        const value = scormData?.[element] || '';
        console.log(`SCORM: LMSGetValue(${element}) = ${value}`);
        return value;
      },

      LMSSetValue: (element, value) => {
        console.log(`SCORM: LMSSetValue(${element}, ${value})`);
        
        // Update local SCORM data
        setScormData(prev => ({
          ...prev,
          [element]: value
        }));

        // Handle specific SCORM elements
        if (element === 'cmi.core.lesson_status') {
          setStatus(value);
          if (value === 'completed' || value === 'passed') {
            handleCompletion();
          }
        }

        if (element === 'cmi.core.score.raw') {
          const score = parseInt(value) || 0;
          setProgress(score);
          onProgress?.(score);
        }

        if (element === 'cmi.core.total_time') {
          // Track time spent
          updateLessonProgress({ timeSpent: value });
        }

        return 'true';
      },

      LMSCommit: () => {
        console.log('SCORM: LMSCommit called');
        // Save progress to database
        updateLessonProgress();
        return 'true';
      },

      LMSGetLastError: () => {
        return '0';
      },

      LMSGetErrorString: (errorCode) => {
        return 'No error';
      },

      LMSGetDiagnostic: (errorCode) => {
        return 'No diagnostic information';
      }
    };

    // SCORM 2004 API (extends 1.2)
    const scorm2004API = {
      ...scormAPI,
      
      // Additional 2004 methods
      Initialize: scormAPI.LMSInitialize,
      Terminate: scormAPI.LMSFinish,
      GetValue: scormAPI.LMSGetValue,
      SetValue: scormAPI.LMSSetValue,
      Commit: scormAPI.LMSCommit,
      GetLastError: scormAPI.LMSGetLastError,
      GetErrorString: scormAPI.LMSGetErrorString,
      GetDiagnostic: scormAPI.LMSGetDiagnostic
    };

    return { scormAPI, scorm2004API };
  }, [scormData, user?.id, onProgress]);

  // Update lesson progress in database
  const updateLessonProgress = useCallback(async (metadata = {}) => {
    if (!user?.id || !lessonId || !courseId) return;

    try {
      const currentData = {
        ...scormData,
        ...metadata,
        last_updated: new Date().toISOString()
      };

      await actions.updateLessonProgress(
        user.id,
        lessonId,
        courseId,
        status === 'completed' || status === 'passed',
        currentData
      );
    } catch (error) {
      console.error('Error updating lesson progress:', error);
    }
  }, [user?.id, lessonId, courseId, status, scormData, actions]);

  // Handle lesson completion
  const handleCompletion = useCallback(async () => {
    if (!user?.id || !lessonId || !courseId) return;

    try {
      // Mark lesson as completed
      await actions.updateLessonProgress(
        user.id,
        lessonId,
        courseId,
        true,
        {
          ...scormData,
          completed_at: new Date().toISOString(),
          final_score: progress,
          final_status: status
        }
      );

      // Calculate overall course progress
      await actions.calculateCourseProgress(user.id, courseId);

      // Notify parent component
      onComplete?.({
        lessonId,
        courseId,
        score: progress,
        status,
        scormData
      });
    } catch (error) {
      console.error('Error completing lesson:', error);
      onError?.(error);
    }
  }, [user?.id, lessonId, courseId, progress, status, scormData, actions, onComplete, onError]);

  // Initialize SCORM API when iframe loads
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const handleLoad = () => {
      setIsLoading(false);
      
      try {
        const { scormAPI, scorm2004API } = createScormAPI();
        
        if (scormAPI) {
          // Inject SCORM API into iframe with proper error handling
          try {
            const iframeWindow = iframe.contentWindow;
            
            if (iframeWindow) {
              // Try SCORM 2004 first, fallback to 1.2
              if (iframeWindow.API_1484_11) {
                iframeWindow.API_1484_11 = scorm2004API;
              } else if (iframeWindow.API) {
                iframeWindow.API = scormAPI;
              } else {
                // Create API object if it doesn't exist
                iframeWindow.API = scormAPI;
                iframeWindow.API_1484_11 = scorm2004API;
              }

              // Initialize SCORM
              if (iframeWindow.API && iframeWindow.API.LMSInitialize) {
                iframeWindow.API.LMSInitialize();
              }
            }
          } catch (crossOriginError) {
            console.warn('Cross-origin access blocked for SCORM API injection:', crossOriginError.message);
            // This is expected for blob URLs, SCORM will work without API injection
          }
        }
      } catch (error) {
        console.error('Error initializing SCORM API:', error);
        setError('Failed to initialize SCORM player');
      }
    };

    const handleError = () => {
      setIsLoading(false);
      setError('Failed to load SCORM content');
      onError?.('Failed to load SCORM content');
    };

    iframe.addEventListener('load', handleLoad);
    iframe.addEventListener('error', handleError);

    return () => {
      iframe.removeEventListener('load', handleLoad);
      iframe.removeEventListener('error', handleError);
    };
  }, [createScormAPI, onError]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Finalize SCORM session
      try {
        if (iframeRef.current?.contentWindow?.API?.LMSFinish) {
          iframeRef.current.contentWindow.API.LMSFinish();
        }
      } catch (error) {
        console.warn('Error finalizing SCORM session (cross-origin blocked):', error.message);
      }
      
      // Clean up blob URL
      if (scormContentUrl && scormContentUrl.startsWith('blob:')) {
        URL.revokeObjectURL(scormContentUrl);
      }
    };
  }, [scormContentUrl]);

  if (error || extractionError) {
    return (
      <div className="flex items-center justify-center h-64 bg-red-50 border border-red-200 rounded-lg">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h3 className="text-lg font-medium text-red-800 mb-2">SCORM Loading Error</h3>
          <p className="text-red-600 mb-4">{error || extractionError}</p>
          <div className="space-x-2 mb-4">
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Retry
            </button>
            {extractionError && (
              <button
                onClick={() => processScormPackage()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Reprocess Package
              </button>
            )}
          </div>
          {scormUrl && (
            <div className="mt-4 p-3 bg-gray-100 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">Alternative: Download the SCORM package directly</p>
              <a
                href={scormUrl}
                download
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <Download className="w-4 h-4 mr-2" />
                Download SCORM Package
              </a>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="scorm-player-container">
      {isLoading && (
        <div className="flex items-center justify-center h-64 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 mb-2">Loading SCORM content...</p>
            {loadingStep && (
              <p className="text-sm text-gray-500">{loadingStep}</p>
            )}
          </div>
        </div>
      )}
      
      {scormContentUrl && (
        <div className="space-y-4">
          {/* Display Toggle */}
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">SCORM Content</h3>
            <div className="flex space-x-2">
              <button
                onClick={() => setUseDirectDisplay(false)}
                className={`px-3 py-1 text-sm rounded ${
                  !useDirectDisplay 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Iframe View
              </button>
              <button
                onClick={() => setUseDirectDisplay(true)}
                className={`px-3 py-1 text-sm rounded ${
                  useDirectDisplay 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Direct View
              </button>
            </div>
          </div>

          {/* Iframe Display */}
          {!useDirectDisplay && (
            <div className="relative">
              <iframe
                ref={iframeRef}
                src={scormContentUrl}
                width={width}
                height={height}
                className="border border-gray-200 rounded-lg shadow-sm"
                title="SCORM Content"
                allow="fullscreen"
                sandbox="allow-scripts allow-forms allow-popups allow-downloads allow-same-origin"
                style={{ 
                  display: isLoading ? 'none' : 'block',
                  minHeight: '500px'
                }}
                onLoad={() => {
                  console.log('SCORM iframe loaded successfully');
                  setIsLoading(false);
                }}
                onError={(e) => {
                  console.error('SCORM iframe error:', e);
                  setError('Failed to load SCORM content in iframe');
                  setIsLoading(false);
                }}
              />
              {isLoading && (
                <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-lg">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                    <p className="text-sm text-gray-600">Loading SCORM content...</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Direct Display */}
          {useDirectDisplay && scormHtmlContent && (
            <div 
              className="border border-gray-200 rounded-lg shadow-sm p-4 bg-white"
              style={{ minHeight: '500px' }}
              dangerouslySetInnerHTML={{ __html: scormHtmlContent }}
            />
          )}
        </div>
      )}
      
      {/* SCORM Status Bar */}
      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center space-x-4">
            <span>Status: <span className="font-medium">{status}</span></span>
            {progress > 0 && (
              <span>Score: <span className="font-medium">{progress}%</span></span>
            )}
          </div>
          <button
            onClick={() => updateLessonProgress()}
            className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
          >
            Save Progress
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScormPlayer;

