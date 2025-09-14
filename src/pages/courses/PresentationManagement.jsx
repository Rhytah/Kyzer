// src/pages/courses/PresentationManagement.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCourseStore } from '@/store/courseStore';
import { useAuth } from '@/hooks/auth/useAuth';
import { useToast } from '@/components/ui';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import LessonCurationForm from '@/components/course/LessonCurationForm';
import PresentationViewer from '@/components/course/PresentationViewer';
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  ArrowLeft,
  Settings,
  FileText,
  Image,
  Video,
  File,
  Music
} from 'lucide-react';

export default function PresentationManagement() {
  const { courseId, lessonId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { success, error: showError } = useToast();
  
  const [lesson, setLesson] = useState(null);
  const [presentation, setPresentation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showViewer, setShowViewer] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const fetchLesson = useCourseStore(state => state.actions.fetchLesson);
  const fetchPresentationByLesson = useCourseStore(state => state.actions.fetchPresentationByLesson);
  const deletePresentation = useCourseStore(state => state.actions.deletePresentation);
  const testPresentationTables = useCourseStore(state => state.actions.testPresentationTables);

  useEffect(() => {
    const loadData = async () => {
      if (!lessonId) {
        showError('No lesson ID provided');
        return;
      }
      
      try {
        setLoading(true);
        
        // Fetch lesson details
        const lessonResult = await fetchLesson(lessonId);
        if (lessonResult.error) {
          showError('Failed to load lesson: ' + lessonResult.error);
          setLoading(false);
          return;
        }
        
        if (!lessonResult.data) {
          showError('Lesson not found');
          setLoading(false);
          return;
        }
        
        setLesson(lessonResult.data);

        // Fetch presentation if it exists
        const presentationResult = await fetchPresentationByLesson(lessonId);
        if (presentationResult.error) {
          // Don't show error for missing presentation, it's optional
          console.log('No presentation found for lesson:', lessonId);
        } else if (presentationResult.data) {
          setPresentation(presentationResult.data);
        }
      } catch (err) {
        showError('Failed to load data: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [lessonId, fetchLesson, fetchPresentationByLesson, showError]);

  const handleCreatePresentation = () => {
    setShowForm(true);
  };

  const handleEditPresentation = () => {
    setShowForm(true);
  };

  const handleDeletePresentation = async () => {
    if (!presentation) return;
    
    if (!window.confirm('Are you sure you want to delete this presentation? This action cannot be undone.')) {
      return;
    }

    try {
      const result = await deletePresentation(presentation.id);
      if (result.error) {
        showError('Failed to delete presentation: ' + result.error);
        return;
      }
      
      setPresentation(null);
      success('Presentation deleted successfully');
    } catch (err) {
      showError('Failed to delete presentation: ' + err.message);
    }
  };

  const handleFormSuccess = (newPresentation) => {
    setPresentation(newPresentation);
    setShowForm(false);
    success('Presentation saved successfully');
  };

  const handleFormCancel = () => {
    setShowForm(false);
  };

  const handleViewPresentation = () => {
    setShowViewer(true);
  };

  const handleCloseViewer = () => {
    setShowViewer(false);
    setIsFullscreen(false);
  };

  const handleToggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const getContentTypeIcon = (contentType) => {
    switch (contentType) {
      case 'video': return <Video className="w-4 h-4" />;
      case 'image': return <Image className="w-4 h-4" />;
      case 'pdf': return <File className="w-4 h-4" />;
      case 'audio': return <Music className="w-4 h-4" />;
      case 'document': return <FileText className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  if (!lesson) {
    const handleTestDatabase = async () => {
      const result = await testPresentationTables();
      if (result.success) {
        success('Database tables are working correctly!');
      } else {
        showError(`Database issue: ${result.error}`);
      }
    };

    return (
      <div className="text-center text-gray-500 p-8">
        <div className="text-gray-500 text-lg mb-2">Lesson not found</div>
        <div className="text-sm text-gray-400 mb-4">
          Course ID: {courseId}<br />
          Lesson ID: {lessonId}
        </div>
        <div className="space-y-2">
          <Button onClick={() => navigate(-1)}>Go Back</Button>
          <Button 
            variant="outline" 
            onClick={handleTestDatabase}
            className="ml-2"
          >
            Test Database
          </Button>
        </div>
        <div className="mt-4 text-xs text-gray-400">
          If the lesson exists but you're seeing this error, the database tables might not be set up. 
          Run the <code>lesson_curation_schema.sql</code> script in your Supabase SQL editor.
        </div>
      </div>
    );
  }

  if (lesson.content_type !== 'presentation') {
    return (
      <div className="text-center text-gray-500 p-8">
        <div className="text-gray-500 text-lg mb-2">This lesson is not a presentation</div>
        <p className="text-sm mb-4">Only lessons with content type "Presentation" can be managed here.</p>
        <Button onClick={() => navigate(-1)}>Go Back</Button>
      </div>
    );
  }

  if (showForm) {
    return (
      <div className="max-w-8xl mx-auto p-6">
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={handleFormCancel}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Management
          </Button>
        </div>
        <LessonCurationForm
          presentation={presentation}
          lessonId={lessonId}
          onSuccess={handleFormSuccess}
          onCancel={handleFormCancel}
        />
      </div>
    );
  }

  if (showViewer && presentation) {
    return (
      <div className={`${isFullscreen ? 'fixed inset-0 z-50 bg-white' : 'max-w-8xl mx-auto p-6'}`}>
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={handleCloseViewer}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Management
          </Button>
        </div>
        <PresentationViewer
          presentation={presentation}
          isFullscreen={isFullscreen}
          onToggleFullscreen={handleToggleFullscreen}
          onPresentationComplete={() => {
            success('Presentation completed!');
          }}
        />
      </div>
    );
  }

  return (
    <div className="max-w-8xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <Button
          variant="outline"
          onClick={() => navigate(-1)}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Course
        </Button>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{lesson.title}</h1>
            <p className="text-gray-600">Presentation Management</p>
          </div>
          
          <div className="flex items-center gap-3">
            {presentation ? (
              <>
                <Button
                  onClick={handleViewPresentation}
                  variant="outline"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View Presentation
                </Button>
                <Button
                  onClick={handleEditPresentation}
                  variant="outline"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
                <Button
                  onClick={handleDeletePresentation}
                  variant="outline"
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </>
            ) : (
              <Button onClick={handleCreatePresentation}>
                <Plus className="w-4 h-4 mr-2" />
                Create Presentation
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      {presentation ? (
        <div className="space-y-6">
          {/* Presentation Info */}
          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  {presentation.title}
                </h2>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Settings className="w-4 h-4" />
                  <span>{presentation.total_slides} slides</span>
                  {presentation.estimated_duration && (
                    <>
                      <span>•</span>
                      <span>{presentation.estimated_duration} min</span>
                    </>
                  )}
                </div>
              </div>
              
              {presentation.description && (
                <p className="text-gray-600 mb-4">{presentation.description}</p>
              )}

              <div className="flex items-center gap-4">
                <Button onClick={handleViewPresentation}>
                  <Eye className="w-4 h-4 mr-2" />
                  View Presentation
                </Button>
                <Button onClick={handleEditPresentation} variant="outline">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Presentation
                </Button>
              </div>
            </div>
          </Card>

          {/* Slides Overview */}
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Slides Overview</h3>
              
              {presentation.slides && presentation.slides.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {presentation.slides.map((slide, index) => (
                    <div
                      key={slide.id}
                      className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                          {slide.slide_number}
                        </div>
                        <div className="flex items-center gap-1 text-gray-500">
                          {getContentTypeIcon(slide.content_type)}
                          <span className="text-xs capitalize">{slide.content_type}</span>
                        </div>
                      </div>
                      
                      <h4 className="font-medium text-gray-900 mb-1">
                        {slide.title}
                      </h4>
                      
                      {slide.duration_seconds && (
                        <p className="text-xs text-gray-500">
                          {slide.duration_seconds}s
                        </p>
                      )}
                      
                      {slide.is_required && (
                        <span className="inline-block mt-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                          Required
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No slides yet. Click "Edit Presentation" to add slides.</p>
                </div>
              )}
            </div>
          </Card>
        </div>
      ) : (
        <Card>
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Settings className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No Presentation Created
            </h3>
            <p className="text-gray-600 mb-6">
              This lesson is set up for presentations but doesn't have one yet. Create a presentation to start adding and arranging content.
            </p>
            <Button onClick={handleCreatePresentation}>
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Presentation
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
