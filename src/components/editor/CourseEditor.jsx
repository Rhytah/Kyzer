// src/components/editor/CourseEditor.jsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEditor, useAutoSave } from '@/hooks/editor';
import { Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

import EditorToolbar from './EditorToolbar';
import EditorSidebar from './EditorSidebar';
import EditorCanvas from './EditorCanvas';
import RightPanel from './RightPanel';
import BackButton from '@/components/ui/BackButton';

/**
 * Main Course Editor Container
 * ClipChamp-inspired course content editor
 */
const CourseEditor = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const {
    initialize,
    currentCourse,
    loading,
    error,
    editMode,
  } = useEditor();

  const { save, isSaving, hasUnsavedChanges } = useAutoSave();

  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize editor
  useEffect(() => {
    if (!courseId) {
      toast.error('No course ID provided');
      navigate('/app/courses');
      return;
    }

    const initEditor = async () => {
      try {
        const result = await initialize(courseId);

        if (result.error) {
          toast.error('Failed to load course');
          console.error('Editor initialization error:', result.error);
          return;
        }

        setIsInitialized(true);
        toast.success(`Editing: ${result.data.title}`);
      } catch (error) {
        console.error('Editor initialization error:', error);
        toast.error('Failed to initialize editor');
      }
    };

    initEditor();
  }, [courseId, initialize, navigate]);

  // Show loading state
  if (loading.course || !isInitialized) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading course editor...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    const isCourseNotFound = error.includes('not found') || error.includes('PGRST116');
    
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center max-w-md">
          <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg">
            <h3 className="font-bold mb-2">
              {isCourseNotFound ? 'Course Not Found' : 'Error Loading Editor'}
            </h3>
            <p className="mb-2">{error}</p>
            {isCourseNotFound && (
              <div className="text-sm text-red-600 mt-2">
                <p>Course ID: {courseId}</p>
                <p className="mt-1">This course may have been deleted or the URL is incorrect.</p>
              </div>
            )}
          </div>
          <div className="mt-4 space-x-2">
            <BackButton 
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              fallbackPath="/app/courses"
            />
            {isCourseNotFound && (
              <button
                onClick={() => navigate('/app/courses')}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                My Courses
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-light">
      {/* Page Header - Consistent with other pages */}
      <div className="bg-white border-b border-background-dark">
        <div className="max-w-8xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <BackButton 
                fallbackPath="/app/courses"
                className="text-text-medium hover:text-text-dark"
              />
              <div>
                <h1 className="text-xl font-bold text-text-dark">
                  {currentCourse?.title || 'Course Editor'}
                </h1>
                <p className="text-sm text-text-light">
                  {hasUnsavedChanges ? 'Unsaved changes' : 'All changes saved'}
                </p>
              </div>
            </div>

            {/* Editor Toolbar Actions */}
            <EditorToolbar
              currentCourse={currentCourse}
              isSaving={isSaving}
              hasUnsavedChanges={hasUnsavedChanges}
              onSave={save}
              editMode={editMode}
            />
          </div>
        </div>
      </div>

      {/* Main Editor Area */}
      <div className="max-w-8xl mx-auto">
        <div className="flex-1 flex overflow-hidden" style={{ height: 'calc(100vh - 180px)' }}>
        {/* Left Sidebar - Blocks & Media */}
        <EditorSidebar />

        {/* Center Canvas - Content Area */}
        <div className="flex-1 overflow-hidden">
          <EditorCanvas />
        </div>

        {/* Right Panel - Properties & Course Structure Tabs */}
        <RightPanel />
        </div>
      </div>

      {/* Unsaved changes indicator */}
      {hasUnsavedChanges && (
        <div className="fixed bottom-4 right-4 bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
          <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
          <span className="text-sm">Unsaved changes</span>
        </div>
      )}
    </div>
  );
};

export default CourseEditor;
