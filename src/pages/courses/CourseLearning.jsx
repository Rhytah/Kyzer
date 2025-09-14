import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  BookOpen, 
  Play, 
  Pause, 
  CheckCircle, 
  Clock, 
  Target, 
  Zap, 
  RefreshCw,
  GraduationCap,
  Eye,
  BarChart3
} from 'lucide-react';
import { useCourseStore } from '@/store/courseStore';
import { useAuth } from '@/hooks/auth/useAuth';
import { 
  CourseStructure, 
  CourseProgress, 
  CoursePreview, 
  SelfPacedLearningFlow, 
  TestOutAssessment, 
  LearnerTypeSelector, 
  QuickReviewPath 
} from '@/components/course';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function CourseLearning() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  // Store selectors - individual to prevent infinite loops
  const currentCourse = useCourseStore(state => state.currentCourse);
  const courses = useCourseStore(state => state.courses);
  const actions = useCourseStore(state => state.actions);
  
  const [activeView, setActiveView] = useState('learning');
  const [userType, setUserType] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showTestOut, setShowTestOut] = useState(false);
  const [showQuickReview, setShowQuickReview] = useState(false);
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadCourseData = async () => {
    try {
      if (user?.id) {
        await actions.fetchCourses({}, user.id);
      } else {
        await actions.fetchCourses();
      }
      const course = courses.find(c => c.id === courseId);
      if (course) {
        actions.setCurrentCourse(course);
        if (user?.id) {
          await actions.fetchCourseProgress(user.id, courseId);
        }
      }
    } catch (error) {
      // Handle error silently or set error state if needed
      setLoading(false);
    }
  };

  useEffect(() => {
    if (courseId && user?.id) {
      loadCourseData();
    }
  }, [courseId, loadCourseData, courses, user?.id]);

  useEffect(() => {
    if (currentCourse) {
      setLoading(false);
    }
  }, [currentCourse]);

  const handleLearnerTypeSelect = (type) => {
    setUserType(type.id);
    setActiveView('learning');
  };

  const handlePreviewCourse = () => {
    setShowPreview(true);
  };

  const handleTestOut = (chapter) => {
    setSelectedChapter(chapter);
    setShowTestOut(true);
  };

  const handleQuickReview = () => {
    setShowQuickReview(true);
  };

  const handleLessonSelect = (lesson) => {
    if (lesson.type === 'test-out') {
      handleTestOut(lesson);
    } else {
      // Navigate to lesson view
      navigate(`/app/courses/${courseId}/lesson/${lesson.id}`);
    }
  };

  const handleTestOutComplete = (results) => {
    setShowTestOut(false);
    // Handle test out completion
  };

  const handleQuickReviewComplete = (results) => {
    setShowQuickReview(false);
    // Handle quick review completion
  };

  const renderNavigationTabs = () => (
    <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-6">
      <button
        onClick={() => setActiveView('learning')}
        className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
          activeView === 'learning'
            ? 'bg-white text-gray-900 shadow-sm'
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        <Play className="w-4 h-4 inline mr-2" />
        Learning
      </button>
      <button
        onClick={() => setActiveView('structure')}
        className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
          activeView === 'structure'
            ? 'bg-white text-gray-900 shadow-sm'
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        <BookOpen className="w-4 h-4 inline mr-2" />
        Course Structure
      </button>
      <button
        onClick={() => setActiveView('progress')}
        className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
          activeView === 'progress'
            ? 'bg-white text-gray-900 shadow-sm'
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        <BarChart3 className="w-4 h-4 inline mr-2" />
        Progress
      </button>
    </div>
  );

  const renderActionButtons = () => (
    <div className="flex flex-wrap gap-3 mb-6">
      <Button onClick={handlePreviewCourse} variant="outline">
        <Eye className="w-4 h-4 mr-2" />
        Preview Course
      </Button>
      
      {userType === 'refresher' && (
        <>
          <Button onClick={handleQuickReview} variant="outline">
            <Zap className="w-4 h-4 mr-2" />
            Quick Review
          </Button>
          <Button onClick={() => setShowTestOut(true)} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Test Out
          </Button>
        </>
      )}
    </div>
  );

  const renderLearnerTypePrompt = () => (
    <Card className="p-8 text-center">
      <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <GraduationCap className="w-10 h-10 text-blue-600" />
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Choose Your Learning Path</h2>
      <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
        To provide you with the best learning experience, please select whether you're a first-time learner 
        or someone looking to refresh your knowledge. This will help us customize your course progression.
      </p>
      <LearnerTypeSelector onSelect={handleLearnerTypeSelect} />
    </Card>
  );

  const renderMainContent = () => {
    if (!userType) {
      return renderLearnerTypePrompt();
    }

    switch (activeView) {
      case 'learning':
        return (
          <SelfPacedLearningFlow 
            courseId={courseId} 
            userType={userType}
          />
        );
      case 'structure':
        return (
          <CourseStructure 
            courseId={courseId}
            onLessonSelect={handleLessonSelect}
            userType={userType}
          />
        );
      case 'progress':
        return (
          <CourseProgress 
            courseId={courseId}
            showDetails={true}
          />
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (!currentCourse) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Course Not Found</h2>
        <p className="text-gray-600 mb-6">The course you're looking for doesn't exist or you don't have access to it.</p>
        <Button onClick={() => navigate('/app/courses')}>
          Back to Courses
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-8xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{currentCourse.title}</h1>
            <p className="text-gray-600">{currentCourse.subtitle}</p>
          </div>
          
          {userType && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Learner Type:</span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                userType === 'first-time' 
                  ? 'bg-blue-100 text-blue-800' 
                  : 'bg-green-100 text-green-800'
              }`}>
                {userType === 'first-time' ? 'First-time' : 'Refresher'}
              </span>
            </div>
          )}
        </div>

        {userType && renderActionButtons()}
        {userType && renderNavigationTabs()}
      </div>

      {/* Main Content */}
      {renderMainContent()}

      {/* Modals */}
      {showPreview && (
        <CoursePreview
          course={currentCourse}
          onClose={() => setShowPreview(false)}
          onEnroll={() => {
            setShowPreview(false);
            // Handle enrollment
          }}
          onTestOut={handleTestOut}
        />
      )}

      {showTestOut && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-8xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Test Out Assessment</h2>
                <Button
                  onClick={() => setShowTestOut(false)}
                  variant="outline"
                >
                  Close
                </Button>
              </div>
              
              <TestOutAssessment
                courseId={courseId}
                chapterId={selectedChapter?.id}
                onComplete={handleTestOutComplete}
                onCancel={() => setShowTestOut(false)}
              />
            </div>
          </div>
        </div>
      )}

      {showQuickReview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Quick Review Path</h2>
                <Button
                  onClick={() => setShowQuickReview(false)}
                  variant="outline"
                >
                  Close
                </Button>
              </div>
              
              <QuickReviewPath
                courseId={courseId}
                chapterId={selectedChapter?.id}
                onComplete={handleQuickReviewComplete}
                onExit={() => setShowQuickReview(false)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 