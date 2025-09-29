import React, { useState, useCallback } from 'react';
import { Plus, Trash2, Edit3, Eye } from 'lucide-react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import { useToast } from '@/components/ui';

const QuizSlideForm = ({ 
  onAddQuizSlide, 
  onQuizSuccess,
  existingQuizzes = [], 
  onSelectExistingQuiz,
  presentationId 
}) => {
  const { success, error: showError } = useToast();
  
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showExistingQuizzes, setShowExistingQuizzes] = useState(false);
  const [quizForm, setQuizForm] = useState({
    title: '',
    description: '',
    pass_threshold: 70,
    time_limit_minutes: null
  });
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState({
    question_text: '',
    question_type: 'multiple_choice',
    options: ['', ''],
    correct_answer: 0,
    explanation: ''
  });

  // Handle form input changes
  const handleQuizFormChange = (field, value) => {
    setQuizForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleQuestionChange = (field, value) => {
    setCurrentQuestion(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Add option to current question
  const addOption = () => {
    setCurrentQuestion(prev => ({
      ...prev,
      options: [...prev.options, '']
    }));
  };

  // Remove option from current question
  const removeOption = (index) => {
    if (currentQuestion.options.length > 2) {
      const newOptions = currentQuestion.options.filter((_, i) => i !== index);
      setCurrentQuestion(prev => ({
        ...prev,
        options: newOptions,
        correct_answer: prev.correct_answer >= index ? Math.max(0, prev.correct_answer - 1) : prev.correct_answer
      }));
    }
  };

  // Update option text
  const updateOption = (index, value) => {
    setCurrentQuestion(prev => ({
      ...prev,
      options: prev.options.map((opt, i) => i === index ? value : opt)
    }));
  };

  // Add question to quiz
  const addQuestion = () => {
    if (!currentQuestion.question_text.trim()) {
      showError('Please enter a question');
      return;
    }

    if (currentQuestion.options.filter(opt => opt.trim()).length < 2) {
      showError('Please provide at least 2 options');
      return;
    }

    const newQuestion = {
      ...currentQuestion,
      id: Date.now(), // Temporary ID
      order_index: questions.length + 1
    };

    setQuestions(prev => [...prev, newQuestion]);
    
    // Reset form
    setCurrentQuestion({
      question_text: '',
      question_type: 'multiple_choice',
      options: ['', ''],
      correct_answer: 0,
      explanation: ''
    });
    
    success('Question added successfully!');
  };

  // Remove question
  const removeQuestion = (index) => {
    setQuestions(prev => prev.filter((_, i) => i !== index));
  };

  // Create new quiz and add as slide
  const createQuizSlide = async () => {
    console.log('🎯 QuizSlideForm: createQuizSlide started');
    
    if (!quizForm.title.trim()) {
      showError('Please enter a quiz title');
      return;
    }

    if (questions.length === 0) {
      showError('Please add at least one question');
      return;
    }

    // Add confirmation for quiz creation
    const confirmed = window.confirm(
      `Are you sure you want to create this quiz slide with ${questions.length} question${questions.length > 1 ? 's' : ''}? This will add the quiz to your presentation.`
    );

    if (!confirmed) {
      console.log('🎯 QuizSlideForm: User cancelled quiz creation');
      return;
    }

    console.log('🎯 QuizSlideForm: Starting quiz creation with data:', { 
      title: quizForm.title, 
      questionsCount: questions.length,
      presentationId 
    });

    try {
      const quizData = {
        ...quizForm,
        questions,
        presentation_id: presentationId
      };

      if (onAddQuizSlide) {
        console.log('🎯 QuizSlideForm: Calling onAddQuizSlide...');
        const result = await onAddQuizSlide(quizData);
        console.log('🎯 QuizSlideForm: onAddQuizSlide result:', result);
        
        // Only reset form and notify success if the quiz was actually created successfully
        // Check if onAddQuizSlide returned an error or if it completed successfully
        if (result && result.error) {
          console.log('🎯 QuizSlideForm: Error from onAddQuizSlide:', result.error);
          showError('Failed to create quiz slide: ' + result.error);
          return;
        }
        
        console.log('🎯 QuizSlideForm: Quiz created successfully, keeping form open for more questions...');
        // Reset only the questions array and current question to allow user to create another quiz
        setQuestions([]);
        setCurrentQuestion({
          question_text: '',
          question_type: 'multiple_choice',
          options: ['', ''],
          correct_answer: 0,
          explanation: ''
        });

        // Show success message and keep form open
        success('Quiz slide added! You can create another quiz slide or close the form.');

        // DON'T call onQuizSuccess - this was causing the form to close
        // if (onQuizSuccess) {
        //   console.log('🎯 QuizSlideForm: Calling onQuizSuccess...');
        //   onQuizSuccess();
        // }
        
        console.log('🎯 QuizSlideForm: createQuizSlide completed successfully');
      }
    } catch (error) {
      console.log('🎯 QuizSlideForm: Error in createQuizSlide:', error);
      showError('Failed to create quiz slide: ' + error.message);
    }
  };

  // Select existing quiz
  const handleSelectExistingQuiz = (quiz) => {
    if (onSelectExistingQuiz) {
      onSelectExistingQuiz(quiz);
      setShowExistingQuizzes(false);

      // DON'T call onQuizSuccess - this causes the form to close unexpectedly
      // Let the user continue adding more quiz slides if they want
      // if (onQuizSuccess) {
      //   onQuizSuccess();
      // }
      success('Existing quiz added as slide! You can add more quiz slides or close the form.');
    }
  };

  if (showExistingQuizzes) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Select Existing Quiz</h3>
          <Button
            type="button"
            variant="secondary"
            onClick={() => setShowExistingQuizzes(false)}
          >
            Cancel
          </Button>
        </div>
        
        <div className="space-y-3 max-h-60 overflow-y-auto">
          {existingQuizzes.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No existing quizzes found</p>
          ) : (
            existingQuizzes.map((quiz) => (
              <div key={quiz.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{quiz.title}</h4>
                    {quiz.description && (
                      <p className="text-sm text-gray-600 mt-1">{quiz.description}</p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-gray-500 mt-2">
                      <span>Pass: {quiz.pass_threshold}%</span>
                      {quiz.time_limit_minutes && (
                        <span>Time: {quiz.time_limit_minutes}min</span>
                      )}
                    </div>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => handleSelectExistingQuiz(quiz)}
                    className="ml-4"
                  >
                    Select
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    );
  }

  if (showCreateForm) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">Create Quiz Slide</h3>
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              // Reset form when user cancels
              setQuizForm({
                title: '',
                description: '',
                pass_threshold: 70,
                time_limit_minutes: null
              });
              setQuestions([]);
              setShowCreateForm(false);
            }}
          >
            Close
          </Button>
        </div>

        {/* Disclaimer */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="w-5 h-5 text-yellow-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h4 className="text-sm font-medium text-yellow-800">
                Single Question Limitation
              </h4>
              <p className="text-sm text-yellow-700 mt-1">
                When creating quizzes in edit presentation mode, you can only add one question per quiz slide. For multi-question quizzes, please create them separately in the quiz management section.
              </p>
            </div>
          </div>
        </div>

        {/* Quiz Basic Info */}
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quiz Title *
            </label>
            <Input
              value={quizForm.title}
              onChange={(e) => handleQuizFormChange('title', e.target.value)}
              placeholder="Enter quiz title"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={quizForm.description}
              onChange={(e) => handleQuizFormChange('description', e.target.value)}
              placeholder="Enter quiz description"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={3}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pass Threshold (%)
              </label>
              <Input
                type="number"
                min="0"
                max="100"
                value={quizForm.pass_threshold}
                onChange={(e) => handleQuizFormChange('pass_threshold', parseInt(e.target.value) || 70)}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Time Limit (minutes)
              </label>
              <Input
                type="number"
                min="1"
                value={quizForm.time_limit_minutes || ''}
                onChange={(e) => handleQuizFormChange('time_limit_minutes', e.target.value ? parseInt(e.target.value) : null)}
                placeholder="Optional"
              />
            </div>
          </div>
        </div>

        {/* Add Question Form */}
        <div className="border-t pt-6">
          <h4 className="text-md font-semibold mb-4">Add Questions to Quiz</h4>
          <p className="text-sm text-gray-600 mb-4">
            Fill out the question details below and click "Add This Question to Quiz" to add it to your quiz.
          </p>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Question Text *
              </label>
              <textarea
                value={currentQuestion.question_text}
                onChange={(e) => handleQuestionChange('question_text', e.target.value)}
                placeholder="Enter your question"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={2}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Question Type
              </label>
              <select
                value={currentQuestion.question_type}
                onChange={(e) => handleQuestionChange('question_type', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="multiple_choice">Multiple Choice</option>
                <option value="multiple_select">Multiple Select</option>
                <option value="true_false">True/False</option>
                <option value="short_answer">Short Answer</option>
              </select>
            </div>
            
            {/* Options for multiple choice/select */}
            {(currentQuestion.question_type === 'multiple_choice' || currentQuestion.question_type === 'multiple_select') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Options
                </label>
                <div className="space-y-2">
                  {currentQuestion.options.map((option, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="correct_answer"
                        checked={currentQuestion.correct_answer === index}
                        onChange={() => handleQuestionChange('correct_answer', index)}
                        className="w-4 h-4 text-blue-600"
                      />
                      <Input
                        value={option}
                        onChange={(e) => updateOption(index, e.target.value)}
                        placeholder={`Option ${index + 1}`}
                        className="flex-1"
                      />
                      {currentQuestion.options.length > 2 && (
                        <Button
                          type="button"
                          size="sm"
                          variant="secondary"
                          onClick={() => removeOption(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={addOption}
                    className="flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add Option
                  </Button>
                </div>
              </div>
            )}
            
            {/* True/False correct answer */}
            {currentQuestion.question_type === 'true_false' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Correct Answer
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="correct_answer"
                      checked={currentQuestion.correct_answer === true}
                      onChange={() => handleQuestionChange('correct_answer', true)}
                    />
                    <span>True</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="correct_answer"
                      checked={currentQuestion.correct_answer === false}
                      onChange={() => handleQuestionChange('correct_answer', false)}
                    />
                    <span>False</span>
                  </label>
                </div>
              </div>
            )}
            
            {/* Short answer correct answer */}
            {currentQuestion.question_type === 'short_answer' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Correct Answer *
                </label>
                <Input
                  value={currentQuestion.correct_answer}
                  onChange={(e) => handleQuestionChange('correct_answer', e.target.value)}
                  placeholder="Enter the correct answer"
                />
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Explanation (Optional)
              </label>
              <textarea
                value={currentQuestion.explanation}
                onChange={(e) => handleQuestionChange('explanation', e.target.value)}
                placeholder="Explain why this is the correct answer"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={2}
              />
            </div>
            
            <Button
              type="button"
              onClick={addQuestion}
              className="w-full flex items-center justify-center gap-2"
              variant="outline"
            >
              <Plus className="w-4 h-4" />
              Add This Question to Quiz
            </Button>
          </div>
        </div>

        {/* Added Questions */}
        {questions.length > 0 && (
          <div className="border-t pt-6 bg-gray-50 -mx-6 px-6 py-4">
            <h4 className="text-md font-semibold mb-4 text-gray-800">Quiz Questions ({questions.length})</h4>
            <div className="space-y-3 max-h-40 overflow-y-auto">
              {questions.map((question, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{question.question_text}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {question.question_type.replace('_', ' ')} • {question.options?.length || 0} options
                      </p>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      onClick={() => removeQuestion(index)}
                      className="text-red-600 hover:text-red-700 ml-2"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Create Quiz Button */}
        <div className="border-t pt-6">
          <div className="flex gap-3">
            <Button
              type="button"
              onClick={createQuizSlide}
              disabled={questions.length === 0}
              className="flex-1"
            >
              Create Quiz Slide ({questions.length} questions)
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                // Reset form when user cancels
                setQuizForm({
                  title: '',
                  description: '',
                  pass_threshold: 70,
                  time_limit_minutes: null
                });
                setQuestions([]);
                setShowCreateForm(false);
              }}
              className="px-6"
            >
              Done / Close Form
            </Button>
          </div>
          {questions.length === 0 && (
            <p className="text-sm text-gray-500 mt-2 text-center">
              Add at least one question to create the quiz slide
            </p>
          )}
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Button
        type="button"
        onClick={() => setShowCreateForm(true)}
        className="w-full flex items-center justify-center gap-2"
      >
        <Plus className="w-4 h-4" />
        Create New Quiz Slide
      </Button>
      
      {existingQuizzes.length > 0 && (
        <Button
          type="button"
          onClick={() => setShowExistingQuizzes(true)}
          variant="secondary"
          className="w-full flex items-center justify-center gap-2"
        >
          <Eye className="w-4 h-4" />
          Use Existing Quiz
        </Button>
      )}
    </div>
  );
};

export default QuizSlideForm;

