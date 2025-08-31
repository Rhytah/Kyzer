// src/components/course/QuizForm.jsx
import { useEffect, useMemo, useState } from 'react';
import { useCourseStore } from '@/store/courseStore';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function QuizForm({ quiz = null, courseId, onSuccess, onCancel }) {
  const actions = useCourseStore(state => state.actions);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isEditing] = useState(!!quiz);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    pass_threshold: 70, // percent
    time_limit_minutes: 0, // 0 means no limit
    lesson_id: null,
  });

  const emptyQuestion = useMemo(() => ({
    id: undefined,
    question_type: 'single', // 'single' | 'multiple' | 'true_false' | 'short'
    question_text: '',
    options: [''], // used for single/multiple
    correct_answer: null, // for single: number; multiple: number[]; true_false: boolean; short: string
    order_index: undefined,
  }), []);

  const [questions, setQuestions] = useState([emptyQuestion]);
  const [lessonOptions, setLessonOptions] = useState([]);

  // Initialize for edit mode
  useEffect(() => {
    const init = async () => {
      if (quiz) {
        setFormData({
          title: quiz.title || '',
          description: quiz.description || '',
          pass_threshold: quiz.pass_threshold ?? 70,
          time_limit_minutes: quiz.time_limit_minutes ?? 0,
          lesson_id: quiz.lesson_id || null,
        });
        const { data } = await actions.fetchQuizQuestions(quiz.id);
        if (data && Array.isArray(data) && data.length > 0) {
          setQuestions(
            data.map(q => ({
              id: q.id,
              question_type: q.question_type || 'single',
              question_text: q.question_text || '',
              options: q.options || [''],
              correct_answer: q.correct_answer ?? null,
              order_index: q.order_index,
            }))
          );
        }
      }
      // Load lessons for selector
      const res = await actions.fetchCourseLessons(courseId);
      if (res?.data) {
        const flat = [];
        Object.values(res.data).forEach(m => {
          (m.lessons || []).forEach(l => flat.push({ id: l.id, title: l.title }));
        });
        setLessonOptions(flat.sort((a,b) => a.title.localeCompare(b.title)));
      }
    };
    init();
  }, [quiz, actions]);

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? '' : Number(value)) : value,
    }));
  };

  const addQuestion = () => {
    setQuestions(prev => [...prev, { ...emptyQuestion }]);
  };

  const removeQuestion = (index) => {
    setQuestions(prev => prev.filter((_, i) => i !== index));
  };

  const updateQuestion = (index, updates) => {
    setQuestions(prev => prev.map((q, i) => (i === index ? { ...q, ...updates } : q)));
  };

  const addOption = (qIndex) => {
    setQuestions(prev => prev.map((q, i) => {
      if (i !== qIndex) return q;
      const next = { ...q, options: [...(q.options || []), ''] };
      return next;
    }));
  };

  const updateOption = (qIndex, optIndex, value) => {
    setQuestions(prev => prev.map((q, i) => {
      if (i !== qIndex) return q;
      const nextOptions = [...(q.options || [])];
      nextOptions[optIndex] = value;
      return { ...q, options: nextOptions };
    }));
  };

  const removeOption = (qIndex, optIndex) => {
    setQuestions(prev => prev.map((q, i) => {
      if (i !== qIndex) return q;
      const nextOptions = (q.options || []).filter((_, oi) => oi !== optIndex);
      return { ...q, options: nextOptions.length ? nextOptions : [''] };
    }));
  };

  const validate = () => {
    if (!formData.title.trim()) {
      setError('Quiz title is required');
      return false;
    }
    if (formData.pass_threshold < 0 || formData.pass_threshold > 100) {
      setError('Pass threshold must be between 0 and 100');
      return false;
    }
    for (const [i, q] of questions.entries()) {
      if (!q.question_text.trim()) {
        setError(`Question ${i + 1}: text is required`);
        return false;
      }
      if ((q.question_type === 'single' || q.question_type === 'multiple')) {
        const opts = (q.options || []).map(o => (o || '').trim()).filter(Boolean);
        if (opts.length < 2) {
          setError(`Question ${i + 1}: at least two options are required`);
          return false;
        }
      }
    }
    setError('');
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      let result;
      if (isEditing) {
        result = await actions.updateQuiz(quiz.id, formData);
      } else {
        result = await actions.createQuiz(formData, courseId, undefined);
      }
      if (result.error) {
        setError(result.error);
        setLoading(false);
        return;
      }

      const quizId = isEditing ? quiz.id : result.data.id;

      // Normalize questions per type before upsert
      const normalized = questions.map((q, idx) => {
        let correct = q.correct_answer;
        if (q.question_type === 'single') {
          // single: number index
          if (Array.isArray(correct)) correct = correct[0] ?? null;
          if (typeof correct !== 'number') correct = null;
        } else if (q.question_type === 'multiple') {
          // multiple: array of indices
          if (!Array.isArray(correct)) correct = [];
        } else if (q.question_type === 'true_false') {
          // boolean
          correct = !!correct;
        } else if (q.question_type === 'short') {
          correct = (correct || '').toString();
        }
        return { ...q, correct_answer: correct, order_index: idx + 1 };
      });

      const saveQs = await actions.upsertQuizQuestions(quizId, normalized);
      if (saveQs.error) {
        setError(saveQs.error);
        setLoading(false);
        return;
      }
      onSuccess?.({ id: quizId });
    } catch (err) {
      setError(err.message || 'Failed to save quiz');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-3xl mx-auto">
      <div className="p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">{isEditing ? 'Edit Quiz' : 'Add New Quiz'}</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Quiz Title *</label>
              <Input name="title" value={formData.title} onChange={handleInputChange} placeholder="Enter quiz title" required />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Describe this quiz (optional)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Pass Threshold (%)</label>
              <Input name="pass_threshold" type="number" min="0" max="100" value={formData.pass_threshold} onChange={handleInputChange} />
              <p className="text-xs text-gray-500 mt-1">Score required to pass</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Time Limit (minutes)</label>
              <Input name="time_limit_minutes" type="number" min="0" value={formData.time_limit_minutes} onChange={handleInputChange} />
              <p className="text-xs text-gray-500 mt-1">0 means no time limit</p>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Attach to Lesson (optional)</label>
              <select
                name="lesson_id"
                value={formData.lesson_id || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, lesson_id: e.target.value || null }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">No Lesson</option>
                {lessonOptions.map(l => (
                  <option key={l.id} value={l.id}>{l.title}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900">Questions</h3>
              <Button type="button" variant="secondary" size="sm" onClick={addQuestion}>Add Question</Button>
            </div>
            <div className="space-y-4">
              {questions.map((q, idx) => (
                <div key={idx} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-gray-500">Question {idx + 1}</span>
                    <Button type="button" variant="ghost" size="sm" className="text-red-600" onClick={() => removeQuestion(idx)}>Remove</Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="md:col-span-3">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Text</label>
                      <Input value={q.question_text} onChange={(e) => updateQuestion(idx, { question_text: e.target.value })} placeholder="Enter question text" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                      <select
                        value={q.question_type}
                        onChange={(e) => updateQuestion(idx, { question_type: e.target.value, options: e.target.value === 'short' || e.target.value === 'true_false' ? [] : (q.options?.length ? q.options : ['']), correct_answer: null })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="single">Multiple Choice (single answer)</option>
                        <option value="multiple">Multiple Choice (multiple answers)</option>
                        <option value="true_false">True / False</option>
                        <option value="short">Short Answer</option>
                      </select>
                    </div>
                  </div>

                  {(q.question_type === 'single' || q.question_type === 'multiple') && (
                    <div className="mt-4">
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-medium text-gray-700">Options</label>
                        <Button type="button" variant="secondary" size="sm" onClick={() => addOption(idx)}>Add Option</Button>
                      </div>
                      <div className="space-y-2">
                        {(q.options || ['']).map((opt, oi) => (
                          <div key={oi} className="flex items-center gap-2">
                            <Input value={opt} onChange={(e) => updateOption(idx, oi, e.target.value)} placeholder={`Option ${oi + 1}`} />
                            <Button type="button" variant="ghost" size="sm" className="text-red-600" onClick={() => removeOption(idx, oi)}>Remove</Button>
                          </div>
                        ))}
                      </div>
                      <div className="mt-3">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Correct Answer{q.question_type === 'multiple' ? 's' : ''}</label>
                        {q.question_type === 'single' ? (
                          <select
                            value={typeof q.correct_answer === 'number' ? q.correct_answer : ''}
                            onChange={(e) => updateQuestion(idx, { correct_answer: e.target.value === '' ? null : Number(e.target.value) })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="">Select correct option</option>
                            {(q.options || []).map((opt, oi) => (
                              <option key={oi} value={oi}>{`Option ${oi + 1}`}</option>
                            ))}
                          </select>
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            {(q.options || []).map((opt, oi) => (
                              <label key={oi} className="inline-flex items-center gap-2 text-sm">
                                <input
                                  type="checkbox"
                                  checked={Array.isArray(q.correct_answer) ? q.correct_answer.includes(oi) : false}
                                  onChange={(e) => {
                                    const next = new Set(Array.isArray(q.correct_answer) ? q.correct_answer : []);
                                    if (e.target.checked) next.add(oi); else next.delete(oi);
                                    updateQuestion(idx, { correct_answer: Array.from(next) });
                                  }}
                                />
                                <span>{`Option ${oi + 1}`}</span>
                              </label>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {q.question_type === 'true_false' && (
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Correct Answer</label>
                      <select
                        value={q.correct_answer === true ? 'true' : q.correct_answer === false ? 'false' : ''}
                        onChange={(e) => updateQuestion(idx, { correct_answer: e.target.value === 'true' ? true : e.target.value === 'false' ? false : null })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select</option>
                        <option value="true">True</option>
                        <option value="false">False</option>
                      </select>
                    </div>
                  )}

                  {q.question_type === 'short' && (
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Expected Answer</label>
                      <Input value={q.correct_answer || ''} onChange={(e) => updateQuestion(idx, { correct_answer: e.target.value })} placeholder="Enter expected answer (optional)" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
            <Button type="button" variant="secondary" onClick={onCancel} disabled={loading}>Cancel</Button>
            <Button type="submit" disabled={loading} className="min-w-[120px]">
              {loading ? <LoadingSpinner size="sm" /> : isEditing ? 'Update Quiz' : 'Create Quiz'}
            </Button>
          </div>
        </form>
      </div>
    </Card>
  );
}


