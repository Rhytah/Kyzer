// src/components/quiz/QuizResult.jsx
import { memo } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { CheckCircle, XCircle, Clock, Award, RotateCcw } from 'lucide-react';

const QuizResult = memo(({ 
  quiz, 
  questions, 
  userAnswers, 
  score, 
  maxScore, 
  timeSpent, 
  passed,
  percentage,
  onRetake, 
  onClose 
}) => {
  // Use passed status from props if available, otherwise calculate
  const isPassed = passed !== undefined ? passed : (percentage >= (quiz?.pass_threshold || 70));
  const finalPercentage = percentage !== undefined ? percentage : (maxScore > 0 ? Math.round((score / maxScore) * 100) : 0);
  
  // Calculate time spent in minutes and seconds
  const minutes = Math.floor(timeSpent / 60);
  const seconds = timeSpent % 60;
  const timeDisplay = minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;

  // Get question result for each question
  const getQuestionResult = (question, questionIndex) => {
    const userAnswer = userAnswers[questionIndex];
    const correctAnswer = question.correct_answer;
    const questionType = question.question_type;
    
    let isCorrect = false;
    let explanation = '';

    switch (questionType) {
      case 'multiple_choice':
        isCorrect = typeof userAnswer === 'number' && userAnswer === correctAnswer;
        explanation = isCorrect 
          ? `Correct! You selected option ${userAnswer + 1}`
          : `Incorrect. The correct answer was option ${correctAnswer + 1}`;
        break;
        
      case 'multiple_select':
        const userSet = new Set(Array.isArray(userAnswer) ? userAnswer : []);
        const correctSet = new Set(Array.isArray(correctAnswer) ? correctAnswer : []);
        isCorrect = userSet.size === correctSet.size && [...userSet].every(v => correctSet.has(v));
        explanation = isCorrect 
          ? 'Correct! You selected all the right options'
          : `Incorrect. The correct answers were options ${correctAnswer.map(i => i + 1).join(', ')}`;
        break;
        
      case 'true_false':
        isCorrect = typeof userAnswer === 'boolean' && userAnswer === !!correctAnswer;
        explanation = isCorrect 
          ? `Correct! The answer is ${correctAnswer ? 'True' : 'False'}`
          : `Incorrect. The answer is ${correctAnswer ? 'True' : 'False'}`;
        break;
        
      case 'short_answer':
        const userText = (userAnswer || '').toString().trim().toLowerCase();
        const correctText = (correctAnswer || '').toString().trim().toLowerCase();
        isCorrect = userText === correctText;
        explanation = isCorrect 
          ? 'Correct! Your answer matches the expected response'
          : `Incorrect. The correct answer was: "${correctAnswer}"`;
        break;
        
      default:
        isCorrect = false;
        explanation = 'Unable to determine correctness';
    }

    return { isCorrect, explanation };
  };

  return (
    <div className="space-y-6">
      {/* Result Summary */}
      <Card className="p-6 text-center">
        <div className="mb-6">
          {isPassed ? (
            <div className="flex items-center justify-center mb-4">
              <Award className="w-16 h-16 text-green-500" />
            </div>
          ) : (
            <div className="flex items-center justify-center mb-4">
              <XCircle className="w-16 h-16 text-red-500" />
            </div>
          )}
          
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {isPassed ? 'Congratulations!' : 'Keep Learning!'}
          </h2>
          
          <p className="text-gray-600 mb-4">
            {isPassed 
              ? `You passed the quiz with a score of ${score}/${maxScore} (${finalPercentage}%)`
              : `You scored ${score}/${maxScore} (${finalPercentage}%). The passing threshold is ${quiz?.pass_threshold || 70}%`
            }
          </p>
        </div>

        {/* Score Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-blue-600">{score}/{maxScore}</div>
            <div className="text-sm text-gray-600">Questions Correct</div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-purple-600">{finalPercentage}%</div>
            <div className="text-sm text-gray-600">Final Score</div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-green-600">{timeDisplay}</div>
            <div className="text-sm text-gray-600">Time Taken</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-6 max-w-md mx-auto">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Progress</span>
            <span>{finalPercentage}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className={`h-3 rounded-full transition-all duration-500 ${
                isPassed ? 'bg-green-500' : 'bg-red-500'
              }`}
              style={{ width: `${Math.min(finalPercentage, 100)}%` }}
            />
          </div>
        </div>
      </Card>

      {/* Detailed Question Review */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Question Review</h3>
        <div className="space-y-4">
          {questions.map((question, index) => {
            const { isCorrect, explanation } = getQuestionResult(question, index);
            const userAnswer = userAnswers[index];
            
            return (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <h4 className="font-medium text-gray-900">
                    Question {index + 1}
                  </h4>
                  <div className="flex items-center">
                    {isCorrect ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-500" />
                    )}
                  </div>
                </div>
                
                <p className="text-gray-700 mb-3">{question.question_text}</p>
                
                {/* Show user's answer */}
                <div className="mb-2">
                  <span className="text-sm font-medium text-gray-600">Your answer: </span>
                  <span className={`text-sm ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                    {question.question_type === 'multiple_choice' ? 
                      `Option ${(userAnswer || 0) + 1}` :
                    question.question_type === 'multiple_select' ?
                      `Options ${(Array.isArray(userAnswer) ? userAnswer : []).map(i => i + 1).join(', ')}` :
                    question.question_type === 'true_false' ?
                      (userAnswer ? 'True' : 'False') :
                    question.question_type === 'short_answer' ?
                      `"${userAnswer || 'No answer'}"` :
                      'No answer'
                    }
                  </span>
                </div>
                
                {/* Show correct answer for incorrect responses */}
                {!isCorrect && (
                  <div className="mb-2">
                    <span className="text-sm font-medium text-gray-600">Correct answer: </span>
                    <span className="text-sm text-green-600">
                      {question.question_type === 'multiple_choice' ? 
                        `Option ${question.correct_answer + 1}` :
                      question.question_type === 'multiple_select' ?
                        `Options ${question.correct_answer.map(i => i + 1).join(', ')}` :
                      question.question_type === 'true_false' ?
                        (question.correct_answer ? 'True' : 'False') :
                      question.question_type === 'short_answer' ?
                        `"${question.correct_answer}"` :
                        'Unknown'
                      }
                    </span>
                  </div>
                )}
                
                <p className="text-sm text-gray-600">{explanation}</p>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button 
          onClick={onRetake}
          variant="secondary"
          className="flex items-center gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          Retake Quiz
        </Button>
        
        <Button 
          onClick={onClose}
          className="flex items-center gap-2"
        >
          <Clock className="w-4 h-4" />
          Continue Learning
        </Button>
      </div>
    </div>
  );
});

QuizResult.displayName = 'QuizResult';

export default QuizResult;
