// src/components/editor/EditorTimeline.jsx
import { useState, useEffect } from 'react';
import { useEditorStore } from '@/store/editorStore';
import { useCourseStore } from '@/store/courseStore';
import { useAuthStore } from '@/store/authStore';
import { useEditor } from '@/hooks/editor';
import { ChevronRight, ChevronDown, FileText, Folder, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '@/lib/supabase';

const EditorTimeline = ({ embedded = false }) => {
  const timeline = useEditorStore((state) => state.timeline);
  const ui = useEditorStore((state) => state.ui);
  const actions = useEditorStore((state) => state.actions);
  const currentCourse = useEditorStore((state) => state.currentCourse);
  const { selectLesson, selectModule, initialize } = useEditor();
  const { actions: courseActions } = useCourseStore();
  const user = useAuthStore((state) => state.user);
  const [creatingLesson, setCreatingLesson] = useState(null); // moduleId when creating

  if (!ui.timelineOpen && !embedded) {
    return (
      <button
        onClick={actions.toggleTimeline}
        className="h-10 bg-gray-100 hover:bg-gray-200 flex items-center justify-center border-t border-gray-200"
      >
        <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
          <Folder className="w-4 h-4" />
          Show Timeline
        </div>
      </button>
    );
  }

  const isModuleExpanded = (moduleId) => {
    return timeline.expandedModules.includes(moduleId);
  };

  const toggleModule = (moduleId) => {
    actions.toggleModuleExpanded(moduleId);
  };

  const handleCreateLesson = async (moduleId) => {
    if (!currentCourse?.id) {
      toast.error('Cannot create lesson: No course loaded. Please refresh the page.');
      return;
    }

    const lessonTitle = prompt('Enter lesson title:');
    if (!lessonTitle || !lessonTitle.trim()) {
      return;
    }

    setCreatingLesson(moduleId);

    try {
      // Get current user from Supabase session
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      
      if (!currentUser?.id) {
        toast.error('Cannot create lesson: User not authenticated. Please log in again.');
        setCreatingLesson(null);
        return;
      }

      const result = await courseActions.createLesson(
        {
          title: lessonTitle.trim(),
          content_type: 'editor', // Mark as editor-created lesson
          content_blocks: [], // Start with empty blocks
        },
        currentCourse.id,
        moduleId,
        currentUser.id
      );

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success(`Lesson "${lessonTitle}" created!`);
      
      // Reload the course to get updated lesson list
      await initialize(currentCourse.id);
      
      // Auto-select the new lesson
      if (result.data?.id) {
        selectLesson(result.data.id);
      }
    } catch (error) {
      toast.error('Failed to create lesson');
    } finally {
      setCreatingLesson(null);
    }
  };

  return (
    <div className="h-full bg-white flex flex-col">
      {/* Timeline header */}
      {!embedded && (
        <div className="px-4 py-2 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900">Course Structure</h3>
          <button
            onClick={actions.toggleTimeline}
            className="p-1 hover:bg-gray-100 rounded text-gray-500"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Timeline content */}
      <div className="flex-1 overflow-x-auto overflow-y-auto">
        <div className="inline-flex gap-4 p-4 min-w-full">
          {timeline.modules.length === 0 ? (
            <div className="flex items-center justify-center w-full text-center py-8">
              <div>
                <Folder className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No modules in this course</p>
                <button className="mt-2 text-sm text-primary-600 hover:text-primary-700 font-medium">
                  <Plus className="w-4 h-4 inline-block mr-1" />
                  Add Module
                </button>
              </div>
            </div>
          ) : (
            timeline.modules.map((module) => {
              const isExpanded = isModuleExpanded(module.id);
              const isSelected = timeline.selectedModule === module.id;

              return (
                <div
                  key={module.id}
                  className={`flex-shrink-0 w-64 border rounded-lg ${
                    isSelected
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-300 bg-white'
                  }`}
                >
                  {/* Module header */}
                  <div
                    className="px-3 py-2 border-b border-gray-200 flex items-center justify-between cursor-pointer hover:bg-gray-50"
                    onClick={() => {
                      selectModule(module.id);
                      toggleModule(module.id);
                    }}
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4 text-gray-500 flex-shrink-0" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-gray-500 flex-shrink-0" />
                      )}
                      <Folder className="w-4 h-4 text-primary-600 flex-shrink-0" />
                      <span className="text-sm font-medium text-gray-900 truncate">
                        {module.title}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500 ml-2">
                      {module.lessons?.length || 0}
                    </span>
                  </div>

                  {/* Module lessons */}
                  {isExpanded && (
                    <div className="p-2 space-y-1 max-h-32 overflow-y-auto">
                      {module.lessons && module.lessons.length > 0 && (
                        <>
                          {module.lessons.map((lesson) => {
                            const isLessonSelected = timeline.selectedLesson === lesson.id;
                            return (
                              <button
                                key={lesson.id}
                                onClick={() => selectLesson(lesson.id)}
                                className={`w-full px-3 py-2 rounded flex items-center gap-2 text-left transition-colors ${
                                  isLessonSelected
                                    ? 'bg-primary-100 text-primary-900'
                                    : 'hover:bg-gray-100 text-gray-700'
                                }`}
                              >
                                <FileText className="w-3 h-3 flex-shrink-0" />
                                <span className="text-xs truncate">{lesson.title}</span>
                              </button>
                            );
                          })}
                        </>
                      )}
                      
                      {/* Add Lesson Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCreateLesson(module.id);
                        }}
                        disabled={creatingLesson === module.id}
                        className="w-full px-3 py-2 rounded flex items-center justify-center gap-2 text-xs text-primary-600 hover:bg-primary-50 border border-dashed border-primary-300 hover:border-primary-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Plus className="w-3 h-3" />
                        {creatingLesson === module.id ? 'Creating...' : 'Add Lesson'}
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default EditorTimeline;
