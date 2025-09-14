import { useState } from 'react';
import { Play, BookOpen, Target, Clock, Star, Users, Award, CheckCircle, X, Eye, Zap } from 'lucide-react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

export default function CoursePreview({ course, onClose, onEnroll, onTestOut }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [previewLesson, setPreviewLesson] = useState(null);
  const [showTestOutModal, setShowTestOutModal] = useState(false);

  const handleTestOut = () => {
    setShowTestOutModal(true);
  };

  const confirmTestOut = () => {
    if (onTestOut) {
      onTestOut(course);
    }
    setShowTestOutModal(false);
  };

  const renderPreviewContent = () => {
    if (!previewLesson) {
      return (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Play className="w-8 h-8 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Preview Course Content</h3>
          <p className="text-gray-600 mb-6">Select a lesson below to preview the course content</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
            {course.modules?.[0]?.chapters?.[0]?.lessons?.slice(0, 4).map((lesson) => (
              <div 
                key={lesson.id}
                className="border border-gray-200 rounded-lg p-4 cursor-pointer hover:border-blue-300 hover:bg-blue-50 transition-colors"
                onClick={() => setPreviewLesson(lesson)}
              >
                <div className="flex items-center gap-3">
                  {renderLessonIcon(lesson)}
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{lesson.title}</h4>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="w-3 h-3" />
                      {lesson.duration} min
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Preview: {previewLesson.title}</h3>
          <button
            onClick={() => setPreviewLesson(null)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-6 text-center">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            {renderLessonIcon(previewLesson)}
          </div>
          <h4 className="text-xl font-semibold text-gray-900 mb-2">{previewLesson.title}</h4>
          <p className="text-gray-600 mb-4">{previewLesson.description || 'This is a preview of the lesson content.'}</p>
          
          <div className="flex items-center justify-center gap-4 text-sm text-gray-600">
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {previewLesson.duration} minutes
            </span>
            <span className="flex items-center gap-1">
              <Target className="w-4 h-4" />
              {previewLesson.type}
            </span>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Eye className="w-4 h-4 text-yellow-600" />
            <span className="font-medium text-yellow-800">Preview Mode</span>
          </div>
          <p className="text-sm text-yellow-700">
            This is a preview of the lesson. Enroll in the course to access the full content and track your progress.
          </p>
        </div>
      </div>
    );
  };

  const renderLessonIcon = (lesson) => {
    switch (lesson.type) {
      case 'video':
        return <Play className="w-8 h-8 text-blue-600" />;
      case 'reading':
        return <BookOpen className="w-8 h-8 text-green-600" />;
      case 'quiz':
        return <Target className="w-8 h-8 text-purple-600" />;
      case 'project':
        return <Zap className="w-8 h-8 text-orange-600" />;
      default:
        return <Play className="w-8 h-8 text-gray-600" />;
    }
  };

  const renderTestOutModal = () => {
    if (!showTestOutModal) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Zap className="w-8 h-8 text-yellow-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Test Out Option</h3>
            <p className="text-gray-600 mb-6">
              Take a comprehensive assessment to test out of this course. If you pass, you'll receive credit without completing all lessons.
            </p>
            
            <div className="space-y-3 text-sm text-gray-600 mb-6">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Pass the final assessment (80%+ required)</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Receive course completion certificate</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Skip to advanced courses</span>
              </div>
            </div>
            
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowTestOutModal(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={confirmTestOut}
                className="flex-1 bg-yellow-500 hover:bg-yellow-600"
              >
                Start Test
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (!course) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-8xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{course.title}</h2>
            <p className="text-gray-600">{course.subtitle}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex h-[calc(90vh-120px)]">
          {/* Left Sidebar */}
          <div className="w-80 border-r border-gray-200 overflow-y-auto">
            <div className="p-4">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span>{course.rating} ({course.totalRatings} ratings)</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Users className="w-4 h-4 text-blue-500" />
                  <span>{course.students?.toLocaleString()} students enrolled</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="w-4 h-4 text-green-500" />
                  <span>{Math.round(course.duration / 60)} hours total</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Award className="w-4 h-4 text-purple-500" />
                  <span>Certificate included</span>
                </div>
              </div>

              <div className="mt-6 space-y-2">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    activeTab === 'overview' ? 'bg-blue-100 text-blue-800' : 'hover:bg-gray-100'
                  }`}
                >
                  Course Overview
                </button>
                <button
                  onClick={() => setActiveTab('curriculum')}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    activeTab === 'curriculum' ? 'bg-blue-100 text-blue-800' : 'hover:bg-gray-100'
                  }`}
                >
                  Curriculum
                </button>
                <button
                  onClick={() => setActiveTab('preview')}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    activeTab === 'preview' ? 'bg-blue-100 text-blue-800' : 'hover:bg-gray-100'
                  }`}
                >
                  Preview Content
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-6">
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">What you'll learn</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {course.outcomes?.map((outcome, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700">{outcome}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">Requirements</h3>
                    <div className="space-y-2">
                      {course.requirements?.map((requirement, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-gray-400 rounded-full mt-2 flex-shrink-0" />
                          <span className="text-gray-700">{requirement}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">Course Features</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {course.features?.map((feature, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="text-gray-700">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'curriculum' && (
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-gray-900">Course Curriculum</h3>
                  {course.modules?.map((module, moduleIndex) => (
                    <div key={module.id} className="border border-gray-200 rounded-lg">
                      <div className="p-4 bg-gray-50">
                        <h4 className="font-medium text-gray-900">
                          Module {moduleIndex + 1}: {module.title}
                        </h4>
                        <p className="text-sm text-gray-600">{module.description}</p>
                      </div>
                      <div className="p-4">
                        {module.chapters?.map((chapter, chapterIndex) => (
                          <div key={chapter.id} className="mb-4 last:mb-0">
                            <h5 className="font-medium text-gray-800 mb-2">
                              {chapterIndex + 1}. {chapter.title}
                            </h5>
                            <div className="space-y-2">
                              {chapter.lessons?.map((lesson, lessonIndex) => (
                                <div key={lesson.id} className="flex items-center gap-3 text-sm text-gray-600">
                                  <span className="w-6 text-center">{lessonIndex + 1}</span>
                                  {renderLessonIcon(lesson)}
                                  <span className="flex-1">{lesson.title}</span>
                                  <span className="text-gray-500">{lesson.duration}m</span>
                                  {lesson.free && (
                                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                                      Preview
                                    </span>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'preview' && renderPreviewContent()}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-2xl font-bold text-gray-900">${course.price}</div>
              {course.originalPrice && course.originalPrice > course.price && (
                <div className="text-lg text-gray-500 line-through">${course.originalPrice}</div>
              )}
            </div>
            
            <div className="flex gap-3">
              {course.testOutAvailable && (
                <Button
                  variant="outline"
                  onClick={handleTestOut}
                  className="border-yellow-500 text-yellow-600 hover:bg-yellow-50"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Test Out
                </Button>
              )}
              <Button onClick={onEnroll} className="bg-blue-600 hover:bg-blue-700">
                Enroll Now
              </Button>
            </div>
          </div>
        </div>
      </div>

      {renderTestOutModal()}
    </div>
  );
} 