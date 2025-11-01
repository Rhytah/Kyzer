// import React, { useEffect, useRef, useState, useCallback } from 'react';
// import { Download } from 'lucide-react';
// import { useAuth } from '@/hooks/auth/useAuth';
// import { useCourseStore } from '@/store/courseStore';
// import { supabase } from '@/lib/supabase';
// import { SCORMPackageParser } from '@/lib/scormParser';

// const ScormPlayer = ({ 
//   scormUrl, 
//   lessonId, 
//   courseId, 
//   onProgress, 
//   onComplete,
//   onError,
//   width = '100%',
//   height = '600px'
// }) => {
//   const { user } = useAuth();
//   const { actions } = useCourseStore();
//   const iframeRef = useRef(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const [scormData, setScormData] = useState(null);
//   const [error, setError] = useState(null);
//   const [progress, setProgress] = useState(0);
//   const [status, setStatus] = useState('not_attempted');
//   const [scormContentUrl, setScormContentUrl] = useState(null);
//   const [extractionError, setExtractionError] = useState(null);
//   const [scormHtmlContent, setScormHtmlContent] = useState(null);
//   const [useDirectDisplay, setUseDirectDisplay] = useState(false);
//   const [loadingStep, setLoadingStep] = useState('');

//   // Test SCORM URL accessibility
//   const testScormUrl = useCallback(async (url) => {
//     try {
//       const response = await fetch(url, { 
//         method: 'HEAD',
//         mode: 'cors',
//         credentials: 'omit'
//       });
//       return {
//         accessible: response.ok,
//         status: response.status,
//         statusText: response.statusText,
//         contentType: response.headers.get('content-type'),
//         contentLength: response.headers.get('content-length')
//       };
//     } catch (error) {
//       return {
//         accessible: false,
//         error: error.message
//       };
//     }
//   }, []);

//   // Process SCORM package and create content URL
//   const processScormPackage = useCallback(async () => {
//     if (!scormUrl) return;

//     try {
//       setIsLoading(true);
//       setExtractionError(null);
//       setLoadingStep('Testing URL accessibility...');

//       // First test if the URL is accessible
//       const urlTest = await testScormUrl(scormUrl);
      
//       if (!urlTest.accessible) {
//         throw new Error(`SCORM package is not accessible: ${urlTest.error || `HTTP ${urlTest.status} ${urlTest.statusText}`}`);
//       }

//       setLoadingStep('Downloading SCORM package...');

//       // The scormUrl should now be a public URL from Supabase storage
//       // We need to extract the ZIP file and create a proper SCORM viewer
//       await extractAndDisplayScorm(scormUrl);
      
//     } catch (error) {
//       setExtractionError('Failed to process SCORM package: ' + error.message);
//       setIsLoading(false);
//       setLoadingStep('');
//     }
//   }, [scormUrl, testScormUrl]);

//   // Extract and display SCORM package from ZIP file
//   const extractAndDisplayScorm = useCallback(async (zipUrl) => {
//     try {
//       // Extracting SCORM package from URL
      
//       setLoadingStep('Downloading SCORM package...');
      
//       // Download the ZIP file with timeout
//       const controller = new AbortController();
//       const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
      
//       const response = await fetch(zipUrl, { 
//         signal: controller.signal,
//         mode: 'cors',
//         credentials: 'omit'
//       });
      
//       clearTimeout(timeoutId);
      
//       if (!response.ok) {
//         throw new Error(`Failed to download SCORM package: ${response.status} ${response.statusText}`);
//       }
      
//       const zipBlob = await response.blob();
//       // Downloaded ZIP file successfully
      
//       if (zipBlob.size === 0) {
//         throw new Error('Downloaded ZIP file is empty');
//       }
      
//       setLoadingStep('Parsing SCORM manifest...');
      
//       // Use the proper SCORM parser to find the correct entry point
//       const parser = new SCORMPackageParser(zipBlob);
//       const parseResult = await parser.parse();
      
//       if (!parseResult.isValid) {
//         throw new Error(`Invalid SCORM package: ${parseResult.error}`);
//       }
      
//       // SCORM package parsed successfully
      
//       // Get the correct entry point from the manifest
//       const entryPoint = parseResult.packageData.launchUrl;
//       if (!entryPoint) {
//         throw new Error('No launch URL found in SCORM manifest');
//       }
      
//       // Found launch URL from manifest
      
//       setLoadingStep('Extracting content files...');
      
//       // Use JSZip to extract the specific file
//       const JSZip = (await import('jszip')).default;
//       const zip = new JSZip();
//       const zipContent = await zip.loadAsync(zipBlob);
      
//       // Get the entry point content
//       const entryFile = zipContent.files[entryPoint];
//       if (!entryFile) {
//         throw new Error(`Entry point file not found: ${entryPoint}`);
//       }
      
//       const content = await entryFile.async('text');
//       // Extracted content successfully
      
//       // Check if the content is a placeholder or not implemented
//       if (content.includes('Not implemented yet') || content.includes('placeholder') || content.length < 100) {
//         // SCORM content appears to be a placeholder or not fully implemented
//         setLoadingStep('Content appears to be a placeholder...');
//       }
      
//       setLoadingStep('Preparing content for display...');
      
//       // Check if content is a placeholder
//       const isPlaceholder = content.includes('Not implemented yet') || content.includes('placeholder') || content.length < 100;
      
//       // Create a complete HTML page with the SCORM content
//       // We need to handle relative paths and assets
//       const htmlContent = `
//         <!DOCTYPE html>
//         <html>
//         <head>
//           <meta charset="utf-8">
//           <title>SCORM Content</title>
//           <style>
//             body { 
//               margin: 0; 
//               padding: 0; 
//               font-family: Arial, sans-serif;
//               background: white;
//             }
//             .scorm-container {
//               width: 100%;
//               min-height: 100vh;
//               border: none;
//               background: white;
//             }
//             .scorm-content {
//               padding: 0;
//               width: 100%;
//             }
//             .scorm-header {
//               background: #007bff;
//               color: white;
//               padding: 10px 20px;
//               margin-bottom: 0;
//               display: flex;
//               justify-content: space-between;
//               align-items: center;
//             }
//             .scorm-header h1 {
//               margin: 0;
//               font-size: 1.2rem;
//             }
//             .scorm-header p {
//               margin: 0;
//               opacity: 0.9;
//               font-size: 0.9rem;
//             }
//             .download-link {
//               display: inline-block;
//               background: #28a745;
//               color: white;
//               padding: 6px 12px;
//               text-decoration: none;
//               border-radius: 4px;
//               font-size: 0.8rem;
//             }
//             .download-link:hover {
//               background: #218838;
//             }
//             .placeholder-notice {
//               background: #fff3cd;
//               border: 1px solid #ffeaa7;
//               color: #856404;
//               padding: 10px 20px;
//               margin: 0;
//               font-size: 0.9rem;
//             }
//             .placeholder-notice h3 {
//               margin: 0 0 5px 0;
//               color: #856404;
//               font-size: 1rem;
//             }
//             #scorm-main-content {
//               background: white;
//               padding: 20px;
//               min-height: 400px;
//             }
//           </style>
//         </head>
//         <body>
//           <div class="scorm-container">
//             <div class="scorm-content">
//               <div class="scorm-header">
//                 <div>
//                   <h1>SCORM Package Content</h1>
//                   <p>Content extracted from uploaded SCORM package</p>
//                 </div>
//                 <a href="${zipUrl}" class="download-link" download>
//                   Download Original Package
//                 </a>
//               </div>
//               ${isPlaceholder ? `
//                 <div class="placeholder-notice">
//                   <h3>⚠️ Content Notice</h3>
//                   <p>This SCORM package appears to contain placeholder content that is not fully implemented. The package structure is valid, but the actual learning content may not be available.</p>
//                 </div>
//               ` : ''}
//               <div id="scorm-main-content">
//                 ${content}
//               </div>
//             </div>
//           </div>
//         </body>
//         </html>
//       `;
      
//       const blob = new Blob([htmlContent], { type: 'text/html' });
//       const contentUrl = URL.createObjectURL(blob);
      
//       // Created SCORM content URL
      
//       setScormContentUrl(contentUrl);
//       setScormHtmlContent(htmlContent); // Store HTML content for direct display fallback
//       setIsLoading(false);
//       setLoadingStep('');
      
//     } catch (error) {
//       let errorMessage = 'Failed to extract SCORM package: ';
      
//       if (error.name === 'AbortError') {
//         errorMessage += 'Request timed out. Please check your internet connection and try again.';
//       } else if (error.message.includes('Failed to download')) {
//         errorMessage += `Download failed: ${error.message}`;
//       } else if (error.message.includes('Invalid SCORM package')) {
//         errorMessage += `Invalid package format: ${error.message}`;
//       } else if (error.message.includes('No launch URL found')) {
//         errorMessage += 'SCORM package is missing required manifest information.';
//       } else if (error.message.includes('Entry point file not found')) {
//         errorMessage += 'SCORM package structure is invalid.';
//       } else {
//         errorMessage += error.message;
//       }
      
//       setExtractionError(errorMessage);
//       setIsLoading(false);
//       setLoadingStep('');
//     }
//   }, []);

//   // Process SCORM package when component mounts or scormUrl changes
//   useEffect(() => {
//     processScormPackage();
//   }, [processScormPackage]);

//   // Update lesson progress in database
//   const updateLessonProgress = useCallback(async (metadata = {}) => {
//     if (!user?.id || !lessonId || !courseId) return;

//     try {
//       const currentData = {
//         ...scormData,
//         ...metadata,
//         last_updated: new Date().toISOString()
//       };

//       await actions.updateLessonProgress(
//         user.id,
//         lessonId,
//         courseId,
//         status === 'completed' || status === 'passed',
//         currentData
//       );
//     } catch (error) {
//       // Error updating lesson progress
//     }
//   }, [user?.id, lessonId, courseId, status, scormData, actions]);

//   // Handle lesson completion
//   const handleCompletion = useCallback(async () => {
//     if (!user?.id || !lessonId || !courseId) return;

//     try {
//       // Mark lesson as completed
//       await actions.updateLessonProgress(
//         user.id,
//         lessonId,
//         courseId,
//         true,
//         {
//           ...scormData,
//           completed_at: new Date().toISOString(),
//           final_score: progress,
//           final_status: status
//         }
//       );

//       // Calculate overall course progress
//       await actions.calculateCourseProgress(user.id, courseId);

//       // Notify parent component
//       onComplete?.({
//         lessonId,
//         courseId,
//         score: progress,
//         status,
//         scormData
//       });
//     } catch (error) {
//       // Error completing lesson
//       onError?.(error);
//     }
//   }, [user?.id, lessonId, courseId, progress, status, scormData, actions, onComplete, onError]);

//   // SCORM API wrapper for iframe communication
//   const createScormAPI = useCallback(() => {
//     if (!iframeRef.current || !user?.id) return null;

//     const scormAPI = {
//       // SCORM 1.2 API
//       LMSInitialize: () => {
//       // SCORM: LMSInitialize called
//         return 'true';
//       },

//       LMSFinish: () => {
//         // SCORM: LMSFinish called
//         return 'true';
//       },

//       LMSGetValue: (element) => {
//         const value = scormData?.[element] || '';
//         // SCORM: LMSGetValue called
//         return value;
//       },

//       LMSSetValue: (element, value) => {
//         // SCORM: LMSSetValue called
        
//         // Update local SCORM data
//         setScormData(prev => ({
//           ...prev,
//           [element]: value
//         }));

//         // Handle specific SCORM elements for progress tracking
//         if (element === 'cmi.core.lesson_status') {
//           setStatus(value);
//           if (value === 'completed' || value === 'passed') {
//             handleCompletion();
//           }
//         }

//         // Handle SCORM 1.2 score elements
//         if (element === 'cmi.core.score.raw') {
//           const score = parseInt(value) || 0;
//           setProgress(score);
//           onProgress?.(score);
//         }

//         // Handle SCORM 1.2 time tracking
//         if (element === 'cmi.core.total_time') {
//           updateLessonProgress({ timeSpent: value });
//         }

//         // Handle SCORM 2004 progress elements
//         if (element === 'cmi.progress_measure') {
//           const progressValue = parseFloat(value) || 0;
//           setProgress(Math.round(progressValue * 100));
//           onProgress?.(Math.round(progressValue * 100));
//         }

//         // Handle SCORM 2004 completion status
//         if (element === 'cmi.completion_status') {
//           setStatus(value);
//           if (value === 'completed') {
//             handleCompletion();
//           }
//         }

//         // Handle SCORM 2004 success status
//         if (element === 'cmi.success_status') {
//           if (value === 'passed') {
//             setStatus('passed');
//             handleCompletion();
//           }
//         }

//         // Handle SCORM 2004 time tracking
//         if (element === 'cmi.session_time') {
//           updateLessonProgress({ sessionTime: value });
//         }

//         // Handle SCORM 2004 score elements
//         if (element === 'cmi.score.raw') {
//           const score = parseInt(value) || 0;
//           setProgress(score);
//           onProgress?.(score);
//         }

//         return 'true';
//       },

//       LMSCommit: () => {
//         // SCORM: LMSCommit called
//         // Save progress to database
//         updateLessonProgress();
//         return 'true';
//       },

//       LMSGetLastError: () => {
//         return '0';
//       },

//       LMSGetErrorString: (errorCode) => {
//         return 'No error';
//       },

//       LMSGetDiagnostic: (errorCode) => {
//         return 'No diagnostic information';
//       }
//     };

//     // SCORM 2004 API (extends 1.2)
//     const scorm2004API = {
//       ...scormAPI,
      
//       // Additional 2004 methods
//       Initialize: scormAPI.LMSInitialize,
//       Terminate: scormAPI.LMSFinish,
//       GetValue: scormAPI.LMSGetValue,
//       SetValue: scormAPI.LMSSetValue,
//       Commit: scormAPI.LMSCommit,
//       GetLastError: scormAPI.LMSGetLastError,
//       GetErrorString: scormAPI.LMSGetErrorString,
//       GetDiagnostic: scormAPI.LMSGetDiagnostic,
      
//       // SCORM 2004 specific methods
//       GetLastErrorString: scormAPI.LMSGetErrorString,
//       GetLastErrorDiagnostic: scormAPI.LMSGetDiagnostic
//     };

//     return { scormAPI, scorm2004API };
//   }, [scormData, user?.id, onProgress, handleCompletion, updateLessonProgress]);

//   // Initialize SCORM API when iframe loads with improved error handling
//   useEffect(() => {
//     const iframe = iframeRef.current;
//     if (!iframe) return;

//     const handleLoad = () => {
//       setIsLoading(false);
      
//       try {
//         const { scormAPI, scorm2004API } = createScormAPI();
        
//         if (scormAPI) {
//           // Inject SCORM API into iframe with improved error handling
//           try {
//             const iframeWindow = iframe.contentWindow;
            
//             if (iframeWindow) {
//               // Inject both SCORM 1.2 and 2004 APIs
//               iframeWindow.API = scormAPI;
//               iframeWindow.API_1484_11 = scorm2004API;

//               // Initialize SCORM - try 2004 first, then 1.2
//               if (iframeWindow.API_1484_11 && iframeWindow.API_1484_11.Initialize) {
//                 iframeWindow.API_1484_11.Initialize();
//               } else if (iframeWindow.API && iframeWindow.API.LMSInitialize) {
//                 iframeWindow.API.LMSInitialize();
//               }
//             }
//           } catch (crossOriginError) {
//             // Cross-origin access blocked for SCORM API injection - this is expected for blob URLs
//             // SCORM will work without API injection, but progress tracking may be limited
//             // This is normal behavior and not an error
//           }
//         }
//       } catch (error) {
//         setError('Failed to initialize SCORM player');
//       }
//     };

//     const handleError = () => {
//       setIsLoading(false);
//       setError('Failed to load SCORM content');
//       onError?.('Failed to load SCORM content');
//     };

//     iframe.addEventListener('load', handleLoad);
//     iframe.addEventListener('error', handleError);

//     return () => {
//       iframe.removeEventListener('load', handleLoad);
//       iframe.removeEventListener('error', handleError);
//     };
//   }, [createScormAPI, onError]);

//   // Cleanup on unmount
//   useEffect(() => {
//     return () => {
//       // Finalize SCORM session
//       try {
//         if (iframeRef.current?.contentWindow?.API?.LMSFinish) {
//           iframeRef.current.contentWindow.API.LMSFinish();
//         }
//       } catch (error) {
//         // Error finalizing SCORM session (cross-origin blocked)
//       }
      
//       // Clean up blob URL
//       if (scormContentUrl && scormContentUrl.startsWith('blob:')) {
//         URL.revokeObjectURL(scormContentUrl);
//       }
//     };
//   }, [scormContentUrl]);

//   if (error || extractionError) {
//     return (
//       <div className="flex items-center justify-center h-64 bg-red-50 border border-red-200 rounded-lg">
//         <div className="text-center">
//           <div className="text-red-500 text-6xl mb-4">⚠️</div>
//           <h3 className="text-lg font-medium text-red-800 mb-2">SCORM Loading Error</h3>
//           <p className="text-red-600 mb-4">{error || extractionError}</p>
//           <div className="space-x-2 mb-4">
//             <button
//               onClick={() => window.location.reload()}
//               className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
//             >
//               Retry
//             </button>
//             {extractionError && (
//               <button
//                 onClick={() => processScormPackage()}
//                 className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
//               >
//                 Reprocess Package
//               </button>
//             )}
//           </div>
//           {scormUrl && (
//             <div className="mt-4 p-3 bg-gray-100 rounded-lg">
//               <p className="text-sm text-gray-600 mb-2">Alternative: Download the SCORM package directly</p>
//               <a
//                 href={scormUrl}
//                 download
//                 className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
//               >
//                 <Download className="w-4 h-4 mr-2" />
//                 Download SCORM Package
//               </a>
//             </div>
//           )}
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="scorm-player-container">
//       {isLoading && (
//         <div className="flex items-center justify-center h-64 bg-gray-50 border border-gray-200 rounded-lg">
//           <div className="text-center">
//             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
//             <p className="text-gray-600 mb-2">Loading SCORM content...</p>
//             {loadingStep && (
//               <p className="text-sm text-gray-500">{loadingStep}</p>
//             )}
//           </div>
//         </div>
//       )}
      
//       {scormContentUrl && (
//         <div className="space-y-4">
//           {/* Display Toggle */}
//           <div className="flex justify-between items-center">
//             <h3 className="text-lg font-medium text-gray-900">SCORM Content</h3>
//             <div className="flex space-x-2">
//               <button
//                 onClick={() => setUseDirectDisplay(false)}
//                 className={`px-3 py-1 text-sm rounded ${
//                   !useDirectDisplay 
//                     ? 'bg-blue-600 text-white' 
//                     : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
//                 }`}
//               >
//                 Iframe View
//               </button>
//               <button
//                 onClick={() => setUseDirectDisplay(true)}
//                 className={`px-3 py-1 text-sm rounded ${
//                   useDirectDisplay 
//                     ? 'bg-blue-600 text-white' 
//                     : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
//                 }`}
//               >
//                 Direct View
//               </button>
//             </div>
//           </div>

//           {/* Iframe Display */}
//           {!useDirectDisplay && (
//             <div className="relative">
//               <iframe
//                 ref={iframeRef}
//                 src={scormContentUrl}
//                 width={width}
//                 height={height}
//                 className="border border-gray-200 rounded-lg shadow-sm"
//                 title="SCORM Content"
//                 allow="fullscreen"
//                 sandbox="allow-scripts allow-forms allow-popups allow-downloads allow-same-origin"
//                 style={{ 
//                   display: isLoading ? 'none' : 'block',
//                   minHeight: '500px'
//                 }}
//                 onLoad={() => {
//                   // SCORM iframe loaded successfully
//                   setIsLoading(false);
//                 }}
//                 onError={(e) => {
//                   setError('Failed to load SCORM content in iframe');
//                   setIsLoading(false);
//                 }}
//               />
//               {isLoading && (
//                 <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-lg">
//                   <div className="text-center">
//                     <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
//                     <p className="text-sm text-gray-600">Loading SCORM content...</p>
//                   </div>
//                 </div>
//               )}
//             </div>
//           )}

//           {/* Direct Display */}
//           {useDirectDisplay && scormHtmlContent && (
//             <div 
//               className="border border-gray-200 rounded-lg shadow-sm p-4 bg-white"
//               style={{ minHeight: '500px' }}
//               dangerouslySetInnerHTML={{ __html: scormHtmlContent }}
//             />
//           )}
//         </div>
//       )}
      
//       {/* SCORM Status Bar */}
//       <div className="mt-4 p-3 bg-gray-50 rounded-lg">
//         <div className="flex items-center justify-between text-sm text-gray-600">
//           <div className="flex items-center space-x-4">
//             <span>Status: <span className="font-medium">{status}</span></span>
//             {progress > 0 && (
//               <span>Score: <span className="font-medium">{progress}%</span></span>
//             )}
//           </div>
//           <button
//             onClick={() => updateLessonProgress()}
//             className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
//           >
//             Save Progress
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ScormPlayer;

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
    // [Keep your existing error handling]
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