import { useState, useEffect } from 'react';
import { Clock, CheckCircle, XCircle, AlertCircle, Target, RefreshCw, Award } from 'lucide-react';
import { useCourseStore } from '@/store/courseStore';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

export default function TestOutAssessment({ 
  courseId, 
  chapterId, 
  onComplete, 
  onCancel,
  passingScore = 80,
  timeLimit = 30 // minutes
}) {
  // Store selectors - individual to prevent infinite loops
  const actions = useCourseStore(state => state.actions);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(timeLimit * 60); // in seconds
  const [isStarted, setIsStarted] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [results, setResults] = useState(null);
  const [showReview, setShowReview] = useState(false);

  useEffect(() => {
    if (isStarted && timeRemaining > 0 && !isCompleted) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            handleTimeUp();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [isStarted, timeRemaining, isCompleted, handleTimeUp]);

  useEffect(() => {
    generateAssessmentQuestions();
  }, [courseId, chapterId]);

  const generateAssessmentQuestions = () => {
    // Mock questions - in real app, these would come from the database
    const mockQuestions = [
      {
        id: 1,
        type: 'multiple-choice',
        question: 'What is the primary purpose of React hooks?',
        options: [
          'To replace class components entirely',
          'To add state and lifecycle features to functional components',
          'To improve performance of class components',
          'To simplify component testing'
        ],
        correctAnswer: 1,
        explanation: 'React hooks allow functional components to use state and other React features without converting to class components.'
      },
      {
        id: 2,
        type: 'multiple-choice',
        question: 'Which hook is used to perform side effects in functional components?',
        options: [
          'useState',
          'useEffect',
          'useContext',
          'useReducer'
        ],
        correctAnswer: 1,
        explanation: 'useEffect is the hook used to perform side effects like data fetching, subscriptions, or manually changing the DOM.'
      },
      {
        id: 3,
        type: 'true-false',
        question: 'React hooks can only be called at the top level of a component.',
        options: ['True', 'False'],
        correctAnswer: 0,
        explanation: 'Hooks must be called at the top level of React functions. They cannot be called inside loops, conditions, or nested functions.'
      },
      {
        id: 4,
        type: 'multiple-choice',
        question: 'What is the correct way to update state with the useState hook?',
        options: [
          'Directly modify the state variable',
          'Use the setter function returned by useState',
          'Call this.setState()',
          'Use the useReducer hook instead'
        ],
        correctAnswer: 1,
        explanation: 'The setter function returned by useState should be used to update state. Never modify the state variable directly.'
      },
      {
        id: 5,
        type: 'multiple-choice',
        question: 'Which of the following is NOT a built-in React hook?',
        options: [
          'useState',
          'useEffect',
          'useComponent',
          'useContext'
        ],
        correctAnswer: 2,
        explanation: 'useComponent is not a built-in React hook. The other options are all valid React hooks.'
      }
    ];

    setQuestions(mockQuestions);
  };

  const startAssessment = () => {
    setIsStarted(true);
    setTimeRemaining(timeLimit * 60);
  };

  const handleTimeUp = () => {
    setIsCompleted(true);
    calculateResults();
  };

  const handleAnswerSelect = (questionId, answerIndex) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answerIndex
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmitAssessment = () => {
    setIsCompleted(true);
    calculateResults();
  };

  const calculateResults = () => {
    let correctAnswers = 0;
    let totalQuestions = questions.length;

    questions.forEach(question => {
      const userAnswer = answers[question.id];
      if (userAnswer === question.correctAnswer) {
        correctAnswers++;
      }
    });

    const score = Math.round((correctAnswers / totalQuestions) * 100);
    const passed = score >= passingScore;

    const resultsData = {
      score,
      correctAnswers,
      totalQuestions,
      passed,
      timeSpent: (timeLimit * 60) - timeRemaining,
      answers,
      questions
    };

    setResults(resultsData);

    if (passed) {
      // Mark chapter as completed via test-out
      handleTestOutSuccess(resultsData);
    }
  };

  const handleTestOutSuccess = async (resultsData) => {
    try {
      // In a real app, you would call an API to mark the chapter as completed
      // and potentially award a certificate
      console.log('Test out successful:', resultsData);
      
      if (onComplete) {
        onComplete(resultsData);
      }
    } catch (error) {
      console.error('Error handling test out success:', error);
    }
  };

  const retakeAssessment = () => {
    setCurrentQuestionIndex(0);
    setAnswers({});
    setTimeRemaining(timeLimit * 60);
    setIsStarted(false);
    setIsCompleted(false);
    setResults(null);
    setShowReview(false);
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getQuestionStatus = (questionIndex) => {
    const question = questions[questionIndex];
    if (!question) return 'unanswered';
    
    const hasAnswer = answers[question.id] !== undefined;
    if (hasAnswer) {
      const isCorrect = answers[question.id] === question.correctAnswer;
      return isCorrect ? 'correct' : 'incorrect';
    }
    return 'unanswered';
  };

  const renderQuestion = () => {
    const question = questions[currentQuestionIndex];
    if (!question) return null;

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Question {currentQuestionIndex + 1} of {questions.length}
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="w-4 h-4" />
            <span className={timeRemaining < 300 ? 'text-red-600 font-medium' : ''}>
              {formatTime(timeRemaining)}
            </span>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">{question.question}</h3>
          
          <div className="space-y-3">
            {question.options.map((option, index) => (
              <label
                key={index}
                className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                  answers[question.id] === index
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name={`question-${question.id}`}
                  value={index}
                  checked={answers[question.id] === index}
                  onChange={() => handleAnswerSelect(question.id, index)}
                  className="mr-3 text-blue-600"
                />
                <span className="text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between pt-4">
          <Button
            onClick={handlePreviousQuestion}
            disabled={currentQuestionIndex === 0}
            variant="outline"
          >
            Previous
          </Button>
          
          <div className="flex items-center gap-2">
            {questions.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentQuestionIndex(index)}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === currentQuestionIndex
                    ? 'bg-blue-500'
                    : getQuestionStatus(index) === 'correct'
                    ? 'bg-green-500'
                    : getQuestionStatus(index) === 'incorrect'
                    ? 'bg-red-500'
                    : 'bg-gray-300'
                }`}
              />
            ))}
          </div>

          {currentQuestionIndex === questions.length - 1 ? (
            <Button
              onClick={handleSubmitAssessment}
              className="bg-green-600 hover:bg-green-700"
            >
              Submit Assessment
            </Button>
          ) : (
            <Button onClick={handleNextQuestion}>
              Next
            </Button>
          )}
        </div>
      </div>
    );
  };

  const renderResults = () => {
    if (!results) return null;

    return (
      <div className="text-center space-y-6">
        <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto ${
          results.passed ? 'bg-green-100' : 'bg-red-100'
        }`}>
          {results.passed ? (
            <CheckCircle className="w-10 h-10 text-green-600" />
          ) : (
            <XCircle className="w-10 h-10 text-red-600" />
          )}
        </div>

        <div>
          <h2 className={`text-2xl font-bold ${
            results.passed ? 'text-green-600' : 'text-red-600'
          }`}>
            {results.passed ? 'Congratulations!' : 'Assessment Failed'}
          </h2>
          <p className="text-gray-600 mt-2">
            {results.passed 
              ? 'You have successfully tested out of this chapter!'
              : `You need ${passingScore}% to pass. Please review the material and try again.`
            }
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{results.score}%</div>
            <div className="text-sm text-gray-600">Score</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{results.correctAnswers}</div>
            <div className="text-sm text-gray-600">Correct</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-600">{results.timeSpent}s</div>
            <div className="text-sm text-gray-600">Time</div>
          </div>
        </div>

        {results.passed && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2 justify-center">
              <Award className="w-5 h-5 text-green-600" />
              <span className="font-medium text-green-800">Chapter Completed!</span>
            </div>
            <p className="text-sm text-green-700 mt-1">
              You can now proceed to the next chapter or course.
            </p>
          </div>
        )}

        <div className="flex gap-3 justify-center">
          {!results.passed && (
            <Button onClick={retakeAssessment} className="bg-blue-600 hover:bg-blue-700">
              Retake Assessment
            </Button>
          )}
          <Button
            onClick={() => setShowReview(!showReview)}
            variant="outline"
          >
            {showReview ? 'Hide Review' : 'Review Answers'}
          </Button>
          <Button onClick={onCancel} variant="outline">
            Close
          </Button>
        </div>

        {showReview && (
          <div className="mt-6 text-left">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Answer Review</h3>
            <div className="space-y-4">
              {results.questions.map((question, index) => (
                <div key={question.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                      getQuestionStatus(index) === 'correct' ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                      {getQuestionStatus(index) === 'correct' ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 mb-2">
                        Question {index + 1}: {question.question}
                      </h4>
                      <div className="space-y-2">
                        {question.options.map((option, optionIndex) => (
                          <div
                            key={optionIndex}
                            className={`text-sm ${
                              optionIndex === question.correctAnswer
                                ? 'text-green-700 font-medium'
                                : optionIndex === results.answers[question.id]
                                ? 'text-red-700 font-medium'
                                : 'text-gray-600'
                            }`}
                          >
                            {optionIndex === question.correctAnswer && <CheckCircle className="w-4 h-4 inline mr-2" />}
                            {optionIndex === results.answers[question.id] && optionIndex !== question.correctAnswer && 
                              <XCircle className="w-4 h-4 inline mr-2" />
                            }
                            {option}
                          </div>
                        ))}
                      </div>
                      {question.explanation && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                          <div className="text-sm text-gray-700">
                            <strong>Explanation:</strong> {question.explanation}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  if (!isStarted) {
    return (
      <Card className="max-w-2xl mx-auto p-8">
        <div className="text-center space-y-6">
          <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto">
            <Target className="w-10 h-10 text-yellow-600" />
          </div>
          
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Test Out Assessment</h2>
            <p className="text-gray-600">
              Test your knowledge to skip this chapter. You need {passingScore}% to pass.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{questions.length}</div>
              <div className="text-sm text-blue-800">Questions</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{timeLimit}</div>
              <div className="text-sm text-green-800">Minutes</div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Pass with {passingScore}% or higher</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="w-4 h-4 text-blue-500" />
              <span>{timeLimit} minute time limit</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Award className="w-4 h-4 text-purple-500" />
              <span>Skip chapter if you pass</span>
            </div>
          </div>

          <div className="flex gap-3 justify-center">
            <Button onClick={onCancel} variant="outline">
              Cancel
            </Button>
            <Button onClick={startAssessment} className="bg-yellow-500 hover:bg-yellow-600">
              Start Assessment
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  if (isCompleted) {
    return (
      <Card className="max-w-8xl mx-auto p-8">
        {renderResults()}
      </Card>
    );
  }

  return (
    <Card className="max-w-8xl mx-auto p-8">
      {renderQuestion()}
    </Card>
  );
} 