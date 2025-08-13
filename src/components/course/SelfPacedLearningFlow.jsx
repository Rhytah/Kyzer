import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Play, Pause, CheckCircle, Clock, BookOpen, Target, Zap, RefreshCw, SkipForward } from 'lucide-react';
import { useCourseStore } from '@/store/courseStore';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

export default function SelfPacedLearningFlow({ courseId, initialLessonId = null, userType = 'first-time' }) {
  const { currentCourse, currentLesson, courseProgress, actions } = useCourseStore();
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [learningPath, setLearningPath] = useState([]);
  const [isPaused, setIsPaused] = useState(false);
  const [lessonStartTime, setLessonStartTime] = useState(null);
  const [showQuickReview, setShowQuickReview] = useState(false);
  const [adaptiveSuggestions, setAdaptiveSuggestions] = useState([]);

  useEffect(() => {
    if (currentCourse && currentCourse.modules) {
      generateLearningPath();
    }
  }, [currentCourse]);

  useEffect(() => {
    if (initialLessonId && learningPath.length > 0) {
      const lessonIndex = learningPath.findIndex(lesson => lesson.id === initialLessonId);
      if (lessonIndex !== -1) {
        setCurrentLessonIndex(lessonIndex);
      }
    }
  }, [initialLessonId, learningPath]);

  useEffect(() => {
    if (currentLesson) {
      startLessonTimer();
      generateAdaptiveSuggestions();
    }
  }, [currentLesson]);

  const generateLearningPath = () => {
    if (!currentCourse?.modules) return;

    const path = [];
    
    currentCourse.modules.forEach(module => {
      module.chapters?.forEach(chapter => {
        // Add test-out option if available
        if (chapter.testOutAvailable && userType === 'refresher') {
          path.push({
            ...chapter,
            id: `test-out-${chapter.id}`,
            type: 'test-out',
            title: `Test Out: ${chapter.title}`,
            isTestOut: true,
          });
        }
        
        // Add lessons based on learner type
        chapter.lessons?.forEach(lesson => {
          if (lesson.learnerTypes?.includes(userType) || !lesson.learnerTypes) {
            path.push({
              ...lesson,
              moduleId: module.id,
              chapterId: chapter.id,
            });
          }
        });
      });
    });

    setLearningPath(path);
  };

  const startLessonTimer = () => {
    setLessonStartTime(Date.now());
    setIsPaused(false);
  };

  const pauseLesson = () => {
    setIsPaused(true);
  };

  const resumeLesson = () => {
    setIsPaused(false);
  };

  const generateAdaptiveSuggestions = () => {
    if (!currentLesson || !courseProgress[courseId]) return;

    const suggestions = [];
    const currentProgress = courseProgress[courseId][currentLesson.id];

    // Suggest review if struggling
    if (currentProgress?.score && currentProgress.score < 70) {
      suggestions.push({
        type: 'review',
        title: 'Review Previous Concepts',
        description: 'Your recent performance suggests reviewing foundational concepts might help.',
        action: () => navigateToPreviousLesson(),
        icon: RefreshCw,
        priority: 'high'
      });
    }

    // Suggest practice if needed
    if (currentProgress?.attempts && currentProgress.attempts > 2) {
      suggestions.push({
        type: 'practice',
        title: 'Additional Practice',
        description: 'Consider extra practice exercises to reinforce your understanding.',
        action: () => showPracticeExercises(),
        icon: Target,
        priority: 'medium'
      });
    }

    // Suggest quick review for refresher learners
    if (userType === 'refresher' && currentLesson.quickReviewAvailable) {
      suggestions.push({
        type: 'quick-review',
        title: 'Quick Review Path',
        description: 'Skip detailed explanations and focus on key concepts.',
        action: () => setShowQuickReview(true),
        icon: SkipForward,
        priority: 'low'
      });
    }

    setAdaptiveSuggestions(suggestions);
  };

  const navigateToPreviousLesson = () => {
    if (currentLessonIndex > 0) {
      setCurrentLessonIndex(currentLessonIndex - 1);
    }
  };

  const navigateToNextLesson = () => {
    if (currentLessonIndex < learningPath.length - 1) {
      setCurrentLessonIndex(currentLessonIndex + 1);
    }
  };

  const navigateToLesson = (lessonIndex) => {
    if (lessonIndex >= 0 && lessonIndex < learningPath.length) {
      setCurrentLessonIndex(lessonIndex);
    }
  };

  const markLessonComplete = async () => {
    if (!currentLesson || !courseId) return;

    const lessonDuration = lessonStartTime ? Math.floor((Date.now() - lessonStartTime) / 1000 / 60) : 0;
    
    try {
      await actions.updateLessonProgress(
        'current-user-id', // Replace with actual user ID
        currentLesson.id,
        courseId,
        true
      );

      // Auto-advance to next lesson after a short delay
      setTimeout(() => {
        if (currentLessonIndex < learningPath.length - 1) {
          navigateToNextLesson();
        }
      }, 2000);
    } catch (error) {
      console.error('Error marking lesson complete:', error);
    }
  };

  const skipLesson = () => {
    if (currentLesson?.isTestOut) {
      // For test-out lessons, mark as completed and move to next
      markLessonComplete();
    } else {
      // For regular lessons, just move to next
      navigateToNextLesson();
    }
  };

  const showPracticeExercises = () => {
    // Implementation for showing practice exercises
    console.log('Showing practice exercises for:', currentLesson.title);
  };

  const getLessonProgress = (lessonId) => {
    if (!courseProgress[courseId] || !courseProgress[courseId][lessonId]) {
      return { completed: false, score: null, attempts: 0 };
    }
    return courseProgress[courseId][lessonId];
  };

  const getCurrentLesson = () => {
    return learningPath[currentLessonIndex] || null;
  };

  const getLessonTypeIcon = (lesson) => {
    switch (lesson.type) {
      case 'video':
        return <Play className="w-5 h-5 text-blue-500" />;
      case 'reading':
        return <BookOpen className="w-5 h-5 text-green-500" />;
      case 'quiz':
        return <Target className="w-5 h-5 text-purple-500" />;
      case 'project':
        return <Zap className="w-5 h-5 text-orange-500" />;
      case 'test-out':
        return <RefreshCw className="w-5 h-5 text-yellow-500" />;
      default:
        return <Play className="w-5 h-5 text-gray-500" />;
    }
  };

  const renderLessonContent = () => {
    const lesson = getCurrentLesson();
    if (!lesson) return null;

    if (lesson.isTestOut) {
      return (
        <div className="text-center py-12">
          <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <RefreshCw className="w-10 h-10 text-yellow-600" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Test Out: {lesson.title}</h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            This assessment will test your knowledge of the concepts covered in this chapter. 
            If you pass with 80% or higher, you'll receive credit for this section.
          </p>
          <div className="flex gap-4 justify-center">
            <Button onClick={skipLesson} variant="outline">
              Skip Test
            </Button>
            <Button onClick={() => console.log('Start test')} className="bg-yellow-500 hover:bg-yellow-600">
              Start Assessment
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">{lesson.title}</h2>
            <p className="text-gray-600">{lesson.description}</p>
          </div>
          <div className="flex items-center gap-2">
            {getLessonTypeIcon(lesson)}
            <span className="text-sm text-gray-500 capitalize">{lesson.type}</span>
          </div>
        </div>

        {/* Lesson Content Placeholder */}
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            {getLessonTypeIcon(lesson)}
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Lesson Content</h3>
          <p className="text-gray-600 mb-4">
            {lesson.type === 'video' && 'Video content would be displayed here'}
            {lesson.type === 'reading' && 'Reading material would be displayed here'}
            {lesson.type === 'quiz' && 'Quiz questions would be displayed here'}
            {lesson.type === 'project' && 'Project instructions would be displayed here'}
          </p>
          
          {lesson.quickReviewAvailable && showQuickReview && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
              <h4 className="font-medium text-yellow-800 mb-2">Quick Review Mode</h4>
              <p className="text-sm text-yellow-700">
                Focus on key concepts and skip detailed explanations.
              </p>
            </div>
          )}
        </div>

        {/* Adaptive Suggestions */}
        {adaptiveSuggestions.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">Learning Suggestions</h4>
            {adaptiveSuggestions.map((suggestion, index) => (
              <div 
                key={index}
                className={`p-3 rounded-lg border ${
                  suggestion.priority === 'high' ? 'border-red-200 bg-red-50' :
                  suggestion.priority === 'medium' ? 'border-yellow-200 bg-yellow-50' :
                  'border-blue-200 bg-blue-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <suggestion.icon className={`w-5 h-5 ${
                    suggestion.priority === 'high' ? 'text-red-600' :
                    suggestion.priority === 'medium' ? 'text-yellow-600' :
                    'text-blue-600'
                  }`} />
                  <div className="flex-1">
                    <h5 className="font-medium text-gray-900">{suggestion.title}</h5>
                    <p className="text-sm text-gray-600">{suggestion.description}</p>
                  </div>
                  <Button
                    onClick={suggestion.action}
                    variant="outline"
                    size="sm"
                  >
                    {suggestion.type === 'review' ? 'Review' :
                     suggestion.type === 'practice' ? 'Practice' :
                     suggestion.type === 'quick-review' ? 'Enable' : 'Action'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderProgressBar = () => {
    const progress = ((currentLessonIndex + 1) / learningPath.length) * 100;
    return (
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className="bg-blue-500 h-2 rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
    );
  };

  if (!currentCourse || learningPath.length === 0) {
    return <div className="text-center py-8">Loading learning path...</div>;
  }

  const lessonProgress = getLessonProgress(getCurrentLesson()?.id);

  return (
    <div className="max-w-6xl mx-auto">
      {/* Progress Header */}
      <div className="bg-white border-b border-gray-200 p-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">{currentCourse.title}</h1>
            <p className="text-sm text-gray-600">
              Lesson {currentLessonIndex + 1} of {learningPath.length}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-sm text-gray-600">Learner Type</div>
              <div className="font-medium text-gray-900 capitalize">{userType}</div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600">Progress</div>
              <div className="font-medium text-gray-900">{Math.round(((currentLessonIndex + 1) / learningPath.length) * 100)}%</div>
            </div>
          </div>
        </div>
        {renderProgressBar()}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-3">
          <Card className="p-6">
            {renderLessonContent()}
            
            {/* Lesson Actions */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
              <div className="flex items-center gap-3">
                <Button
                  onClick={navigateToPreviousLesson}
                  disabled={currentLessonIndex === 0}
                  variant="outline"
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Previous
                </Button>
                
                {isPaused ? (
                  <Button onClick={resumeLesson} className="bg-green-600 hover:bg-green-700">
                    <Play className="w-4 h-4 mr-2" />
                    Resume
                  </Button>
                ) : (
                  <Button onClick={pauseLesson} variant="outline">
                    <Pause className="w-4 h-4 mr-2" />
                    Pause
                  </Button>
                )}
              </div>
              
              <div className="flex items-center gap-3">
                {lessonProgress.completed ? (
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-medium">Completed</span>
                  </div>
                ) : (
                  <>
                    <Button onClick={skipLesson} variant="outline">
                      Skip
                    </Button>
                    <Button onClick={markLessonComplete} className="bg-blue-600 hover:bg-blue-700">
                      Mark Complete
                    </Button>
                  </>
                )}
                
                <Button
                  onClick={navigateToNextLesson}
                  disabled={currentLessonIndex === learningPath.length - 1}
                  variant="outline"
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <Card className="p-4">
            <h3 className="font-medium text-gray-900 mb-4">Learning Path</h3>
            <div className="space-y-2">
              {learningPath.map((lesson, index) => (
                <div
                  key={lesson.id}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    index === currentLessonIndex
                      ? 'bg-blue-100 border border-blue-200'
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => navigateToLesson(index)}
                >
                  <div className="flex items-center gap-3">
                    {getLessonTypeIcon(lesson)}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 truncate">
                        {lesson.title}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Clock className="w-3 h-3" />
                        {lesson.duration || 0}m
                      </div>
                    </div>
                    {getLessonProgress(lesson.id).completed && (
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
} 