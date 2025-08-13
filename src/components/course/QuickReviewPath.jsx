import { useState, useEffect } from 'react';
import { Zap, Clock, CheckCircle, BookOpen, Target, ChevronRight, ChevronDown, AlertCircle } from 'lucide-react';
import { useCourseStore } from '@/store/courseStore';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

export default function QuickReviewPath({ courseId, chapterId, onComplete, onExit }) {
  const { actions } = useCourseStore();
  const [currentStep, setCurrentStep] = useState(0);
  const [expandedSections, setExpandedSections] = useState(new Set());
  const [completedSteps, setCompletedSteps] = useState(new Set());
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [timeSpent, setTimeSpent] = useState(0);

  const [quickReviewData, setQuickReviewData] = useState({
    keyConcepts: [],
    summary: '',
    practiceQuestions: [],
    estimatedTime: 0
  });

  useEffect(() => {
    if (courseId && chapterId) {
      generateQuickReviewData();
    }
  }, [courseId, chapterId]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeSpent(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const generateQuickReviewData = () => {
    // Mock data - in real app, this would come from the database
    const mockData = {
      keyConcepts: [
        {
          id: 1,
          title: 'React Hooks Fundamentals',
          description: 'Understanding useState, useEffect, and custom hooks',
          importance: 'high',
          estimatedTime: 5,
          topics: ['State management', 'Side effects', 'Custom hooks']
        },
        {
          id: 2,
          title: 'Component Lifecycle',
          description: 'How components mount, update, and unmount',
          importance: 'medium',
          estimatedTime: 3,
          topics: ['Mounting', 'Updating', 'Unmounting', 'useEffect dependencies']
        },
        {
          id: 3,
          title: 'Performance Optimization',
          description: 'Techniques to improve React app performance',
          importance: 'medium',
          estimatedTime: 4,
          topics: ['Memoization', 'Code splitting', 'Lazy loading']
        }
      ],
      summary: 'This chapter covers essential React concepts for building modern web applications. Focus on understanding hooks, component lifecycle, and performance optimization techniques.',
      practiceQuestions: [
        {
          id: 1,
          question: 'What is the difference between useState and useEffect?',
          answer: 'useState manages component state, while useEffect handles side effects and lifecycle events.',
          type: 'concept-check'
        },
        {
          id: 2,
          question: 'When should you use useCallback?',
          answer: 'Use useCallback when you want to memoize functions to prevent unnecessary re-renders of child components.',
          type: 'concept-check'
        }
      ],
      estimatedTime: 12
    };

    setQuickReviewData(mockData);
  };

  const toggleSection = (sectionId) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const markStepComplete = (stepId) => {
    const newCompleted = new Set(completedSteps);
    newCompleted.add(stepId);
    setCompletedSteps(newCompleted);
  };

  const handleNextStep = () => {
    if (currentStep < quickReviewData.keyConcepts.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleCompleteReview = () => {
    setShowConfirmation(true);
  };

  const confirmComplete = async () => {
    try {
      // Mark chapter as completed via quick review
      await actions.updateLessonProgress(
        'current-user-id', // Replace with actual user ID
        `quick-review-${chapterId}`,
        courseId,
        true
      );

      if (onComplete) {
        onComplete({
          timeSpent,
          stepsCompleted: completedSteps.size,
          totalSteps: quickReviewData.keyConcepts.length
        });
      }
    } catch (error) {
      console.error('Error completing quick review:', error);
    }
  };

  const getImportanceColor = (importance) => {
    switch (importance) {
      case 'high':
        return 'text-red-600 bg-red-100';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100';
      case 'low':
        return 'text-green-600 bg-green-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };



  const renderProgressBar = () => {
    const progress = (completedSteps.size / quickReviewData.keyConcepts.length) * 100;
    return (
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className="bg-blue-500 h-2 rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
    );
  };

  const renderKeyConcept = (concept, index) => {
    const isCurrent = index === currentStep;
    const isCompleted = completedSteps.has(concept.id);
    const isExpanded = expandedSections.has(concept.id);

    return (
      <div 
        key={concept.id}
        className={`border rounded-lg transition-all duration-200 ${
          isCurrent 
            ? 'border-blue-300 bg-blue-50' 
            : isCompleted 
            ? 'border-green-200 bg-green-50'
            : 'border-gray-200 hover:border-gray-300'
        }`}
      >
        <div 
          className="p-4 cursor-pointer"
          onClick={() => toggleSection(concept.id)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                isCompleted ? 'bg-green-500' : 'bg-gray-300'
              }`}>
                {isCompleted ? (
                  <CheckCircle className="w-5 h-5 text-white" />
                ) : (
                  <span className="text-sm font-medium text-gray-600">{index + 1}</span>
                )}
              </div>
              <div>
                <h3 className="font-medium text-gray-900">{concept.title}</h3>
                <p className="text-sm text-gray-600">{concept.description}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getImportanceColor(concept.importance)}`}>
                {concept.importance}
              </span>
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <Clock className="w-4 h-4" />
                {concept.estimatedTime}m
              </div>
              {isExpanded ? (
                <ChevronDown className="w-5 h-5 text-gray-500" />
              ) : (
                <ChevronRight className="w-5 h-5 text-gray-500" />
              )}
            </div>
          </div>
        </div>

        {isExpanded && (
          <div className="px-4 pb-4">
            <div className="space-y-3">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Key Topics:</h4>
                <div className="flex flex-wrap gap-2">
                  {concept.topics.map((topic, topicIndex) => (
                    <span 
                      key={topicIndex}
                      className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </div>

              {isCurrent && !isCompleted && (
                <div className="flex items-center gap-3 pt-3 border-t border-gray-200">
                  <Button
                    onClick={() => markStepComplete(concept.id)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Mark as Reviewed
                  </Button>
                  <span className="text-sm text-gray-600">
                    Take your time to review this concept
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderConfirmationModal = () => {
    if (!showConfirmation) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Zap className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Complete Quick Review?</h3>
            <p className="text-gray-600 mb-6">
              You've completed {completedSteps.size} of {quickReviewData.keyConcepts.length} key concepts. 
              This will mark the chapter as completed.
            </p>
            
            <div className="space-y-3 text-sm text-gray-600 mb-6">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-500" />
                <span>Time spent: {Math.floor(timeSpent / 60)}m {timeSpent % 60}s</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Concepts reviewed: {completedSteps.size}</span>
              </div>
            </div>
            
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowConfirmation(false)}
                className="flex-1"
              >
                Continue Review
              </Button>
              <Button
                onClick={confirmComplete}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                Complete Review
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (!quickReviewData.keyConcepts.length) {
    return <div className="text-center py-8">Loading quick review...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-6 mb-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <Zap className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Quick Review Path</h1>
            <p className="text-gray-600">Focus on key concepts and skip detailed explanations</p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Progress: {completedSteps.size} of {quickReviewData.keyConcepts.length} concepts</span>
            <span className="text-gray-600">Estimated time: {quickReviewData.estimatedTime} minutes</span>
          </div>
          {renderProgressBar()}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <Card className="p-6">
            <div className="space-y-4">
              {quickReviewData.keyConcepts.map((concept, index) => 
                renderKeyConcept(concept, index)
              )}
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
              <Button
                onClick={handlePreviousStep}
                disabled={currentStep === 0}
                variant="outline"
              >
                Previous
              </Button>
              
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600">
                  Step {currentStep + 1} of {quickReviewData.keyConcepts.length}
                </span>
                
                {completedSteps.size === quickReviewData.keyConcepts.length ? (
                  <Button onClick={handleCompleteReview} className="bg-green-600 hover:bg-green-700">
                    Complete Review
                  </Button>
                ) : (
                  <Button
                    onClick={handleNextStep}
                    disabled={currentStep === quickReviewData.keyConcepts.length - 1}
                  >
                    Next
                  </Button>
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <Card className="p-4">
            <h3 className="font-medium text-gray-900 mb-4">Quick Review Summary</h3>
            
            <div className="space-y-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Chapter Overview</h4>
                <p className="text-sm text-blue-800">{quickReviewData.summary}</p>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">Practice Questions</h4>
                {quickReviewData.practiceQuestions.map((question, index) => (
                  <div key={question.id} className="p-3 bg-gray-50 rounded-lg">
                    <h5 className="font-medium text-gray-900 text-sm mb-2">
                      Q{index + 1}: {question.question}
                    </h5>
                    <p className="text-sm text-gray-600">{question.answer}</p>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-gray-200">
                <Button onClick={onExit} variant="outline" className="w-full">
                  Exit Quick Review
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {renderConfirmationModal()}
    </div>
  );
} 