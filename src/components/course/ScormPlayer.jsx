import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useAuth } from '@/hooks/auth/useAuth';
import { useCourseStore } from '@/store/courseStore';

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
          // Inject SCORM API into iframe
          const iframeWindow = iframe.contentWindow;
          
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
      if (iframeRef.current?.contentWindow?.API?.LMSFinish) {
        try {
          iframeRef.current.contentWindow.API.LMSFinish();
        } catch (error) {
          console.warn('Error finalizing SCORM session:', error);
        }
      }
    };
  }, []);

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 bg-red-50 border border-red-200 rounded-lg">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h3 className="text-lg font-medium text-red-800 mb-2">SCORM Loading Error</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Retry
          </button>
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
            <p className="text-gray-600">Loading SCORM content...</p>
          </div>
        </div>
      )}
      
      <iframe
        ref={iframeRef}
        src={scormUrl}
        width={width}
        height={height}
        className="border border-gray-200 rounded-lg shadow-sm"
        title="SCORM Content"
        allow="fullscreen"
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-downloads"
        style={{ display: isLoading ? 'none' : 'block' }}
      />
      
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

