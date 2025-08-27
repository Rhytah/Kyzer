import { useState, useEffect } from 'react';
import { CheckCircle, Circle, Clock, Award, TrendingUp, BookOpen, Target } from 'lucide-react';
import { useCourseStore } from '@/store/courseStore';

export default function CourseProgress({ courseId, showDetails = true }) {
  // Store selectors - individual to prevent infinite loops
  const currentCourse = useCourseStore(state => state.currentCourse);
  const courseProgress = useCourseStore(state => state.courseProgress);
  const [progressStats, setProgressStats] = useState({
    totalLessons: 0,
    completedLessons: 0,
    inProgressLessons: 0,
    totalTime: 0,
    completedTime: 0,
    estimatedCompletion: null,
    currentStreak: 0,
    averageScore: 0,
  });

  useEffect(() => {
    if (courseId && courseProgress[courseId]) {
      calculateProgressStats();
    }
  }, [courseId, courseProgress]);

  const calculateProgressStats = () => {
    if (!currentCourse || !courseProgress[courseId]) return;

    const progress = courseProgress[courseId];
    let totalLessons = 0;
    let completedLessons = 0;
    let inProgressLessons = 0;
    let totalTime = 0;
    let completedTime = 0;
    let totalScore = 0;
    let scoredLessons = 0;

    // Calculate progress across all modules and chapters
    currentCourse.modules?.forEach(module => {
      module.chapters?.forEach(chapter => {
        chapter.lessons?.forEach(lesson => {
          totalLessons++;
          totalTime += lesson.duration || 0;

          const lessonProgress = progress[lesson.id];
          if (lessonProgress) {
            if (lessonProgress.completed) {
              completedLessons++;
              completedTime += lesson.duration || 0;
            } else if (lessonProgress.started) {
              inProgressLessons++;
            }

            if (lessonProgress.score !== undefined) {
              totalScore += lessonProgress.score;
              scoredLessons++;
            }
          }
        });
      });
    });

    const progressPercentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
    const averageScore = scoredLessons > 0 ? Math.round(totalScore / scoredLessons) : 0;
    
    // Calculate estimated completion time
    const remainingTime = totalTime - completedTime;
    const estimatedCompletion = remainingTime > 0 ? Math.ceil(remainingTime / 60) : 0; // in hours

    setProgressStats({
      totalLessons,
      completedLessons,
      inProgressLessons,
      totalTime,
      completedTime,
      progressPercentage,
      estimatedCompletion,
      averageScore,
    });
  };

  const getProgressColor = (percentage) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    if (percentage >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const getProgressBarColor = (percentage) => {
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 60) return 'bg-yellow-500';
    if (percentage >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const formatTime = (minutes) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  const renderProgressBar = () => (
    <div className="w-full bg-gray-200 rounded-full h-3">
      <div 
        className={`h-3 rounded-full transition-all duration-500 ${getProgressBarColor(progressStats.progressPercentage)}`}
        style={{ width: `${progressStats.progressPercentage}%` }}
      />
    </div>
  );

  const renderProgressStats = () => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="text-center p-4 bg-blue-50 rounded-lg">
        <div className="text-2xl font-bold text-blue-600">{progressStats.completedLessons}</div>
        <div className="text-sm text-blue-800">Completed</div>
        <div className="text-xs text-blue-600">of {progressStats.totalLessons}</div>
      </div>
      
      <div className="text-center p-4 bg-green-50 rounded-lg">
        <div className="text-2xl font-bold text-green-600">{progressStats.progressPercentage}%</div>
        <div className="text-sm text-green-800">Progress</div>
        <div className="text-xs text-green-600">Overall</div>
      </div>
      
      <div className="text-center p-4 bg-purple-50 rounded-lg">
        <div className="text-2xl font-bold text-purple-600">{formatTime(progressStats.completedTime)}</div>
        <div className="text-sm text-purple-800">Time Spent</div>
        <div className="text-xs text-purple-600">of {formatTime(progressStats.totalTime)}</div>
      </div>
      
      <div className="text-center p-4 bg-orange-50 rounded-lg">
        <div className="text-2xl font-bold text-orange-600">{progressStats.averageScore}%</div>
        <div className="text-sm text-orange-800">Avg Score</div>
        <div className="text-xs text-orange-600">on Assessments</div>
      </div>
    </div>
  );

  const renderModuleProgress = () => {
    if (!currentCourse?.modules) return null;

    return (
      <div className="space-y-4">
        <h4 className="text-lg font-semibold text-gray-900">Module Progress</h4>
        {currentCourse.modules.map((module) => {
          const moduleProgress = getModuleProgress(module);
          return (
            <div key={module.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h5 className="font-medium text-gray-900">{module.title}</h5>
                <span className={`text-sm font-medium ${getProgressColor(moduleProgress)}`}>
                  {moduleProgress}%
                </span>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-500 ${getProgressBarColor(moduleProgress)}`}
                  style={{ width: `${moduleProgress}%` }}
                />
              </div>
              
              <div className="flex items-center justify-between text-xs text-gray-600">
                <span>{getCompletedLessonsInModule(module)} of {getTotalLessonsInModule(module)} lessons</span>
                <span>{formatTime(getModuleTime(module))}</span>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const getModuleProgress = (module) => {
    if (!module.chapters) return 0;
    
    let totalLessons = 0;
    let completedLessons = 0;
    
    module.chapters.forEach(chapter => {
      if (chapter.lessons) {
        totalLessons += chapter.lessons.length;
        chapter.lessons.forEach(lesson => {
          if (courseProgress[courseId]?.[lesson.id]?.completed) {
            completedLessons++;
          }
        });
      }
    });
    
    return totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
  };

  const getCompletedLessonsInModule = (module) => {
    if (!module.chapters) return 0;
    
    let completedLessons = 0;
    module.chapters.forEach(chapter => {
      if (chapter.lessons) {
        chapter.lessons.forEach(lesson => {
          if (courseProgress[courseId]?.[lesson.id]?.completed) {
            completedLessons++;
          }
        });
      }
    });
    
    return completedLessons;
  };

  const getTotalLessonsInModule = (module) => {
    if (!module.chapters) return 0;
    
    let totalLessons = 0;
    module.chapters.forEach(chapter => {
      if (chapter.lessons) {
        totalLessons += chapter.lessons.length;
      }
    });
    
    return totalLessons;
  };

  const getModuleTime = (module) => {
    if (!module.chapters) return 0;
    
    let totalTime = 0;
    module.chapters.forEach(chapter => {
      if (chapter.lessons) {
        chapter.lessons.forEach(lesson => {
          totalTime += lesson.duration || 0;
        });
      }
    });
    
    return totalTime;
  };

  if (!currentCourse) {
    return <div className="text-center py-8">Loading progress...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-gray-900">Course Progress</h3>
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5 text-yellow-500" />
          <span className="text-sm text-gray-600">Certificate available at 100%</span>
        </div>
      </div>

      {/* Main Progress Bar */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Overall Progress</span>
          <span className={`text-lg font-bold ${getProgressColor(progressStats.progressPercentage)}`}>
            {progressStats.progressPercentage}%
          </span>
        </div>
        {renderProgressBar()}
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>{progressStats.completedLessons} of {progressStats.totalLessons} lessons completed</span>
          <span>{formatTime(progressStats.completedTime)} of {formatTime(progressStats.totalTime)}</span>
        </div>
      </div>

      {/* Progress Statistics */}
      {showDetails && (
        <>
          {renderProgressStats()}
          {renderModuleProgress()}
        </>
      )}

      {/* Completion Estimate */}
      {progressStats.estimatedCompletion > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-blue-600" />
            <div>
              <h4 className="font-medium text-blue-900">Estimated Completion</h4>
              <p className="text-sm text-blue-700">
                {progressStats.estimatedCompletion} hours remaining at your current pace
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 