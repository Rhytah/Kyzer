import React, { useState, useEffect, useCallback } from 'react';
import { CheckCircle, Clock, RotateCcw, AlertCircle } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useToast } from '@/components/ui';

const QuizSlide = ({ 
  quiz, 
  questions, 
  onQuizComplete, 
  onQuizRetake,
  timeLimitMinutes = null,
  isRetake = false 
}) => {
  const { success, error: showError } = useToast();
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(timeLimitMinutes ? timeLimitMinutes * 60 : null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [quizResult, setQuizResult] = useState(null);

  // Timer effect
  useEffect(() => {
    if (timeLeft === null) return;
    
    if (timeLeft <= 0) {
      handleSubmitQuiz();
      return;
    }
    
    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    
    return () => clearInterval(timer);
  }, [timeLeft]);

  // Format time display
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle answer selection
  const handleAnswerChange = (questionId, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  // Navigate to next question
  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  // Navigate to previous question
  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  // Submit quiz
  const handleSubmitQuiz = async () => {
    setIsSubmitting(true);
    
    try {
      // Calculate score
      let score = 0;
      const questionResults = questions.map((question, index) => {
        const userAnswer = answers[question.id];
        let isCorrect = false;
        
        switch (question.question_type) {
          case 'multiple_choice':
            isCorrect = userAnswer === question.correct_answer;
            break;
          case 'multiple_select':
            const userSet = new Set(Array.isArray(userAnswer) ? userAnswer : []);
            const correctSet = new Set(Array.isArray(question.correct_answer) ? question.correct_answer : []);
            isCorrect = userSet.size === correctSet.size && [...userSet].every(v => correctSet.has(v));
            break;
          case 'true_false':
            isCorrect = userAnswer === question.correct_answer;
            break;
          case 'short_answer':
            const userText = (userAnswer || '').toString().trim().toLowerCase();
            const correctText = (question.correct_answer || '').toString().trim().toLowerCase();
            isCorrect = userText === correctText;
            break;
        }
        
        if (isCorrect) score++;
        
        return {
          questionIndex: index,
          questionId: question.id,
          userAnswer,
          isCorrect,
          correctAnswer: question.correct_answer
        };
      });

      const percentage = Math.round((score / questions.length) * 100);
      const passed = percentage >= (quiz.pass_threshold || 70);
      
      const result = {
        score,
        maxScore: questions.length,
        percentage,
        passed,
        questionResults,
        timeSpent: timeLimitMinutes ? (timeLimitMinutes * 60) - timeLeft : 0
      };

      setQuizResult(result);
      setShowResults(true);
      
      if (onQuizComplete) {
        onQuizComplete(result);
      }
      
      success(`Quiz completed! You scored ${score}/${questions.length} (${percentage}%)`);
      
    } catch (error) {
      showError('Failed to submit quiz: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle retake
  const handleRetake = () => {
    setCurrentQuestionIndex(0);
    setAnswers({});
    setTimeLeft(timeLimitMinutes ? timeLimitMinutes * 60 : null);
    setShowResults(false);
    setQuizResult(null);
    
    if (onQuizRetake) {
      onQuizRetake();
    }
  };

  // Render question based on type
  const renderQuestion = (question) => {
    const currentAnswer = answers[question.id];
    
    switch (question.question_type) {
      case 'multiple_choice':
        return (
          <div className="space-y-3">
            {question.options?.map((option, index) => (
              <label key={index} className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name={`question_${question.id}`}
                  value={index}
                  checked={currentAnswer === index}
                  onChange={(e) => handleAnswerChange(question.id, parseInt(e.target.value))}
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <span className="text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        );
        
      case 'multiple_select':
        const selectedAnswers = Array.isArray(currentAnswer) ? currentAnswer : [];
        return (
          <div className="space-y-3">
            {question.options?.map((option, index) => (
              <label key={index} className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedAnswers.includes(index)}
                  onChange={(e) => {
                    const newAnswers = e.target.checked
                      ? [...selectedAnswers, index]
                      : selectedAnswers.filter(i => i !== index);
                    handleAnswerChange(question.id, newAnswers);
                  }}
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <span className="text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        );
        
      case 'true_false':
        return (
          <div className="space-y-3">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="radio"
                name={`question_${question.id}`}
                value="true"
                checked={currentAnswer === true}
                onChange={(e) => handleAnswerChange(question.id, e.target.value === 'true')}
                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <span className="text-gray-700">True</span>
            </label>
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="radio"
                name={`question_${question.id}`}
                value="false"
                checked={currentAnswer === false}
                onChange={(e) => handleAnswerChange(question.id, e.target.value === 'true')}
                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <span className="text-gray-700">False</span>
            </label>
          </div>
        );
        
      case 'short_answer':
        return (
          <div>
            <textarea
              value={currentAnswer || ''}
              onChange={(e) => handleAnswerChange(question.id, e.target.value)}
              placeholder="Enter your answer here..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={3}
            />
          </div>
        );
        
      default:
        return <div className="text-gray-500">Unsupported question type</div>;
    }
  };

  if (showResults && quizResult) {
    return (
      <div className="space-y-6">
        {/* Results Summary */}
        <Card className="p-6 text-center">
          <div className="mb-6">
            {quizResult.passed ? (
              <div className="flex items-center justify-center mb-4">
                <CheckCircle className="w-16 h-16 text-green-500" />
              </div>
            ) : (
              <div className="flex items-center justify-center mb-4">
                <AlertCircle className="w-16 h-16 text-red-500" />
              </div>
            )}
            
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {quizResult.passed ? 'Congratulations!' : 'Keep Learning!'}
            </h2>
            
            <p className="text-gray-600 mb-4">
              {quizResult.passed 
                ? `You passed the quiz with a score of ${quizResult.score}/${quizResult.maxScore} (${quizResult.percentage}%)`
                : `You scored ${quizResult.score}/${quizResult.maxScore} (${quizResult.percentage}%). The passing threshold is ${quiz.pass_threshold || 70}%`
              }
            </p>
          </div>

          {/* Score Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto mb-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-blue-600">{quizResult.score}/{quizResult.maxScore}</div>
              <div className="text-sm text-gray-600">Questions Correct</div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-purple-600">{quizResult.percentage}%</div>
              <div className="text-sm text-gray-600">Final Score</div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-green-600">
                {Math.floor(quizResult.timeSpent / 60)}:{(quizResult.timeSpent % 60).toString().padStart(2, '0')}
              </div>
              <div className="text-sm text-gray-600">Time Taken</div>
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button 
            onClick={handleRetake}
            variant="secondary"
            className="flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Retake Quiz
          </Button>
          
          <Button 
            onClick={() => onQuizComplete && onQuizComplete(quizResult)}
            className="flex items-center gap-2"
          >
            <CheckCircle className="w-4 h-4" />
            Continue
          </Button>
        </div>
      </div>
    );
  }

  if (!questions || questions.length === 0) {
    return (
      <Card className="p-6 text-center">
        <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Quiz Questions</h3>
        <p className="text-gray-600">This quiz doesn't have any questions yet.</p>
      </Card>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <div className="space-y-6">
      {/* Quiz Header */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{quiz.title}</h2>
            {quiz.description && (
              <p className="text-gray-600 mt-1">{quiz.description}</p>
            )}
          </div>
          
          <div className="text-right">
            {timeLeft !== null && (
              <div className={`text-2xl font-bold ${timeLeft <= 60 ? 'text-red-600' : 'text-gray-900'}`}>
                {formatTime(timeLeft)}
              </div>
            )}
            <div className="text-sm text-gray-600">
              Question {currentQuestionIndex + 1} of {questions.length}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </Card>

      {/* Current Question */}
      <Card className="p-6">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {currentQuestion.question_text}
          </h3>
          
          {renderQuestion(currentQuestion)}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            onClick={handlePrevQuestion}
            disabled={currentQuestionIndex === 0}
            variant="secondary"
          >
            Previous
          </Button>
          
          <div className="flex gap-2">
            {currentQuestionIndex < questions.length - 1 ? (
              <Button
                onClick={handleNextQuestion}
                disabled={answers[currentQuestion.id] === undefined}
              >
                Next Question
              </Button>
            ) : (
              <Button
                onClick={handleSubmitQuiz}
                disabled={isSubmitting || answers[currentQuestion.id] === undefined}
                className="bg-green-600 hover:bg-green-700"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Quiz'}
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default QuizSlide;

