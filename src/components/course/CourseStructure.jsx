import { useState } from 'react';
import { ChevronDown, ChevronRight, Play, CheckCircle, Clock, BookOpen, Target, RefreshCw, Zap } from 'lucide-react';
import { useCourseStore } from '@/store/courseStore';

export default function CourseStructure({ courseId, onLessonSelect, userType = 'first-time' }) {
  const [expandedModules, setExpandedModules] = useState(new Set());
  const [expandedChapters, setExpandedChapters] = useState(new Set());
  // Store selectors - individual to prevent infinite loops
  const currentCourse = useCourseStore(state => state.currentCourse);
  const courseProgress = useCourseStore(state => state.courseProgress);

  const toggleModule = (moduleId) => {
    const newExpanded = new Set(expandedModules);
    if (newExpanded.has(moduleId)) {
      newExpanded.delete(moduleId);
    } else {
      newExpanded.add(moduleId);
    }
    setExpandedModules(newExpanded);
  };

  const toggleChapter = (chapterId) => {
    const newExpanded = new Set(expandedChapters);
    if (newExpanded.has(chapterId)) {
      newExpanded.delete(chapterId);
    } else {
      newExpanded.add(chapterId);
    }
    setExpandedChapters(newExpanded);
  };

  const handleLessonSelect = (lesson) => {
    if (onLessonSelect) {
      onLessonSelect(lesson);
    }
  };

  const getLessonStatus = (lessonId) => {
    if (!courseProgress[courseId] || !courseProgress[courseId][lessonId]) {
      return 'not-started';
    }
    return courseProgress[courseId][lessonId].completed ? 'completed' : 'in-progress';
  };

  const getModuleProgress = (module) => {
    if (!module.chapters) return 0;
    
    let totalLessons = 0;
    let completedLessons = 0;
    
    module.chapters.forEach(chapter => {
      if (chapter.lessons) {
        totalLessons += chapter.lessons.length;
        chapter.lessons.forEach(lesson => {
          if (getLessonStatus(lesson.id) === 'completed') {
            completedLessons++;
          }
        });
      }
    });
    
    return totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
  };

  const getChapterProgress = (chapter) => {
    if (!chapter.lessons) return 0;
    
    let completedLessons = 0;
    chapter.lessons.forEach(lesson => {
      if (getLessonStatus(lesson.id) === 'completed') {
        completedLessons++;
      }
    });
    
    return chapter.lessons.length > 0 ? Math.round((completedLessons / chapter.lessons.length) * 100) : 0;
  };

  const renderLessonIcon = (lesson) => {
    switch (lesson.type) {
      case 'video':
        return <Play className="w-4 h-4 text-blue-500" />;
      case 'reading':
        return <BookOpen className="w-4 h-4 text-green-500" />;
      case 'quiz':
        return <Target className="w-4 h-4 text-purple-500" />;
      case 'project':
        return <Zap className="w-4 h-4 text-orange-500" />;
      default:
        return <Play className="w-4 h-4 text-gray-500" />;
    }
  };

  const renderLessonStatus = (lessonId) => {
    const status = getLessonStatus(lessonId);
    
    if (status === 'completed') {
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    }
    
    return <div className="w-4 h-4 border-2 border-gray-300 rounded-full" />;
  };

  const renderLearnerTypeLabel = (lesson) => {
    if (lesson.learnerTypes?.includes('first-time')) {
      return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">First-time</span>;
    }
    if (lesson.learnerTypes?.includes('refresher')) {
      return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">Refresher</span>;
    }
    return null;
  };

  const renderTestOutOption = (chapter) => {
    if (!chapter.testOutAvailable) return null;
    
    return (
      <div className="flex items-center gap-2 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
        <RefreshCw className="w-4 h-4 text-yellow-600" />
        <span className="text-sm text-yellow-800 font-medium">Test Out Available</span>
        <button 
          className="ml-auto px-3 py-1 text-xs bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors"
          onClick={() => handleLessonSelect({ ...chapter, type: 'test-out' })}
        >
          Take Test
        </button>
      </div>
    );
  };

  if (!currentCourse) {
    return <div className="text-center py-8">Loading course structure...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Course Content</h3>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span>Learner Type: {userType === 'first-time' ? 'First-time' : 'Refresher'}</span>
        </div>
      </div>

      {currentCourse.modules?.map((module) => (
        <div key={module.id} className="border border-gray-200 rounded-lg">
          <div 
            className="flex items-center justify-between p-4 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
            onClick={() => toggleModule(module.id)}
          >
            <div className="flex items-center gap-3">
              {expandedModules.has(module.id) ? (
                <ChevronDown className="w-5 h-5 text-gray-500" />
              ) : (
                <ChevronRight className="w-5 h-5 text-gray-500" />
              )}
              <div>
                <h4 className="font-medium text-gray-900">{module.title}</h4>
                <p className="text-sm text-gray-600">{module.description}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-600">
                {module.chapters?.length || 0} chapters
              </div>
              <div className="text-sm text-gray-600">
                {getModuleProgress(module)}% complete
              </div>
            </div>
          </div>

          {expandedModules.has(module.id) && (
            <div className="p-4 space-y-3">
              {module.chapters?.map((chapter) => (
                <div key={chapter.id} className="border-l-2 border-gray-200 pl-4">
                  <div 
                    className="flex items-center justify-between cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors"
                    onClick={() => toggleChapter(chapter.id)}
                  >
                    <div className="flex items-center gap-3">
                      {expandedChapters.has(chapter.id) ? (
                        <ChevronDown className="w-4 h-4 text-gray-500" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-gray-500" />
                      )}
                      <div>
                        <h5 className="font-medium text-gray-800">{chapter.title}</h5>
                        <p className="text-sm text-gray-600">{chapter.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-sm text-gray-600">
                        {chapter.lessons?.length || 0} lessons
                      </div>
                      <div className="text-sm text-gray-600">
                        {getChapterProgress(chapter)}% complete
                      </div>
                    </div>
                  </div>

                  {expandedChapters.has(chapter.id) && (
                    <div className="mt-3 space-y-2">
                      {renderTestOutOption(chapter)}
                      
                      {chapter.lessons?.map((lesson) => (
                        <div 
                          key={lesson.id}
                          className="flex items-center gap-3 p-2 rounded hover:bg-gray-50 cursor-pointer transition-colors"
                          onClick={() => handleLessonSelect(lesson)}
                        >
                          {renderLessonIcon(lesson)}
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-gray-800">{lesson.title}</span>
                              {renderLearnerTypeLabel(lesson)}
                            </div>
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {lesson.duration} min
                              </span>
                              {lesson.type && (
                                <span className="capitalize">{lesson.type}</span>
                              )}
                            </div>
                          </div>
                          {renderLessonStatus(lesson.id)}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
} 