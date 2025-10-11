// src/store/editorStore.js
import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { getBlockDefinition } from '@/lib/editor/blockRegistry';

const useEditorStore = create((set, get) => ({
  // ==========================================
  // EDITOR STATE
  // ==========================================

  // Current editing session
  currentCourse: null,
  currentModule: null,
  currentLesson: null,
  editMode: 'edit', // 'edit' | 'preview' | 'template'

  // Canvas state
  canvas: {
    blocks: [], // Array of content blocks on canvas
    selectedBlock: null,
    clipboard: null,
    zoom: 100,
    gridEnabled: true,
  },

  // Timeline state
  timeline: {
    modules: [],
    selectedModule: null,
    selectedLesson: null,
    expandedModules: [],
  },

  // History for undo/redo
  history: {
    past: [],
    present: null,
    future: [],
    maxHistorySize: 50,
  },

  // Auto-save
  autoSave: {
    enabled: true,
    lastSaved: null,
    isSaving: false,
    hasUnsavedChanges: false,
  },

  // Media library
  media: {
    files: [],
    selectedFiles: [],
    uploadProgress: {},
    currentFolder: 'root',
  },

  // Templates
  templates: {
    library: [],
    categories: ['blank', 'presentation', 'interactive', 'assessment', 'scorm'],
    selectedTemplate: null,
  },

  // Collaboration (future enhancement)
  collaboration: {
    collaborators: [],
    comments: [],
    versions: [],
  },

  // UI state
  ui: {
    sidebarOpen: true,
    propertiesOpen: true,
    timelineOpen: true,
    mediaLibraryOpen: false,
    templateLibraryOpen: false,
    showGrid: true,
    showRulers: false,
    currentPage: 0, // Current page index for page-based view
  },

  // Loading states
  loading: {
    course: false,
    saving: false,
    media: false,
    templates: false,
  },

  error: null,

  // ==========================================
  // EDITOR ACTIONS
  // ==========================================

  actions: {
    // Initialize editor with course
    initializeEditor: async (courseId) => {
      set((state) => ({ loading: { ...state.loading, course: true }, error: null }));

      try {
        // Fetch course with all related data
        const { data: course, error } = await supabase
          .from('courses')
          .select(`
            *,
            modules:course_modules(
              *,
              lessons:lessons(*)
            )
          `)
          .eq('id', courseId)
          .single();

        if (error) {
          // Handle specific error cases
          if (error.code === 'PGRST116') {
            throw new Error(`Course with ID ${courseId} not found`);
          }
          throw error;
        }

        if (!course) {
          throw new Error(`Course with ID ${courseId} not found`);
        }

        set({
          currentCourse: course,
          timeline: {
            modules: course.modules || [],
            selectedModule: null,
            selectedLesson: null,
            expandedModules: (course.modules || []).map(m => m.id),
          },
          loading: { ...get().loading, course: false },
        });

        return { data: course, error: null };
      } catch (error) {
        const errorMessage = error.message || 'Failed to load course';
        set((state) => ({ error: errorMessage, loading: { ...state.loading, course: false } }));
        return { data: null, error: errorMessage };
      }
    },

    // Canvas operations
    addBlock: (blockType) => {
      const blockDefinition = getBlockDefinition(blockType);

      if (!blockDefinition) {
        console.error(`Unknown block type: ${blockType}`);
        return;
      }

      const newBlock = {
        id: `block_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: blockType,
        data: { ...blockDefinition.defaultData },
        position: { x: 0, y: 0 },
        size: { width: 800, height: 400 },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      set((state) => ({
        canvas: {
          ...state.canvas,
          blocks: [...state.canvas.blocks, newBlock],
          selectedBlock: newBlock.id,
        },
        autoSave: { ...state.autoSave, hasUnsavedChanges: true },
      }));

      get().actions.saveToHistory();
    },

    updateBlock: (blockId, updates) => {
      set((state) => ({
        canvas: {
          ...state.canvas,
          blocks: state.canvas.blocks.map(block =>
            block.id === blockId ? { ...block, ...updates } : block
          ),
        },
        autoSave: { ...state.autoSave, hasUnsavedChanges: true },
      }));

      get().actions.saveToHistory();
    },

    deleteBlock: (blockId) => {
      set((state) => ({
        canvas: {
          ...state.canvas,
          blocks: state.canvas.blocks.filter(block => block.id !== blockId),
          selectedBlock: state.canvas.selectedBlock === blockId ? null : state.canvas.selectedBlock,
        },
        autoSave: { ...state.autoSave, hasUnsavedChanges: true },
      }));

      get().actions.saveToHistory();
    },

    selectBlock: (blockId) => {
      set((state) => ({
        canvas: {
          ...state.canvas,
          selectedBlock: blockId,
        },
      }));
    },

    duplicateBlock: (blockId) => {
      const block = get().canvas.blocks.find(b => b.id === blockId);
      if (!block) return;

      const newBlock = {
        ...block,
        id: `block_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        position: { x: block.position.x + 20, y: block.position.y + 20 },
        createdAt: new Date().toISOString(),
      };

      set((state) => ({
        canvas: {
          ...state.canvas,
          blocks: [...state.canvas.blocks, newBlock],
          selectedBlock: newBlock.id,
        },
        autoSave: { ...state.autoSave, hasUnsavedChanges: true },
      }));

      get().actions.saveToHistory();
    },

    reorderBlocks: (blockIds) => {
      const blockMap = new Map(get().canvas.blocks.map(b => [b.id, b]));
      const reorderedBlocks = blockIds.map(id => blockMap.get(id)).filter(Boolean);

      set((state) => ({
        canvas: {
          ...state.canvas,
          blocks: reorderedBlocks,
        },
        autoSave: { ...state.autoSave, hasUnsavedChanges: true },
      }));

      get().actions.saveToHistory();
    },

    // Clipboard operations
    copyBlock: (blockId) => {
      const block = get().canvas.blocks.find(b => b.id === blockId);
      if (block) {
        set((state) => ({
          canvas: {
            ...state.canvas,
            clipboard: { ...block },
          },
        }));
      }
    },

    pasteBlock: () => {
      const clipboard = get().canvas.clipboard;
      if (!clipboard) return;

      get().actions.duplicateBlock(clipboard.id);
    },

    // History management (undo/redo)
    saveToHistory: () => {
      const { history, canvas } = get();
      const state = { blocks: canvas.blocks };

      set({
        history: {
          past: [...history.past.slice(-history.maxHistorySize + 1), history.present].filter(Boolean),
          present: state,
          future: [],
        },
      });
    },

    undo: () => {
      const { history } = get();
      if (history.past.length === 0) return;

      const previous = history.past[history.past.length - 1];
      const newPast = history.past.slice(0, -1);

      set((state) => ({
        canvas: {
          ...state.canvas,
          blocks: previous.blocks,
        },
        history: {
          past: newPast,
          present: previous,
          future: [history.present, ...history.future].filter(Boolean),
        },
        autoSave: { ...state.autoSave, hasUnsavedChanges: true },
      }));
    },

    redo: () => {
      const { history } = get();
      if (history.future.length === 0) return;

      const next = history.future[0];
      const newFuture = history.future.slice(1);

      set((state) => ({
        canvas: {
          ...state.canvas,
          blocks: next.blocks,
        },
        history: {
          past: [...history.past, history.present].filter(Boolean),
          present: next,
          future: newFuture,
        },
        autoSave: { ...state.autoSave, hasUnsavedChanges: true },
      }));
    },

    canUndo: () => get().history.past.length > 0,
    canRedo: () => get().history.future.length > 0,

    // Timeline operations
    selectModule: (moduleId) => {
      set((state) => ({
        timeline: {
          ...state.timeline,
          selectedModule: moduleId,
          selectedLesson: null,
        },
        currentModule: state.timeline.modules.find(m => m.id === moduleId) || null,
      }));
    },

    selectLesson: async (lessonId) => {
      const lesson = get().timeline.modules
        .flatMap(m => m.lessons || [])
        .find(l => l.id === lessonId);

      if (!lesson) {
        console.error('Lesson not found:', lessonId);
        return { error: 'Lesson not found' };
      }

      set({
        currentLesson: lesson,
        timeline: {
          ...get().timeline,
          selectedLesson: lessonId,
        },
      });

      // Load lesson content into canvas
      const result = await get().actions.loadLessonContent(lessonId);

      if (!result.error) {
        const blockCount = get().canvas.blocks.length;
        return {
          success: true,
          message: blockCount > 0
            ? `Loaded "${lesson.title}" with ${blockCount} block${blockCount !== 1 ? 's' : ''}`
            : `Ready to edit "${lesson.title}"`,
        };
      }

      return { error: result.error };
    },

    loadLessonContent: async (lessonId) => {
      try {
        const { data, error } = await supabase
          .from('lessons')
          .select('*')
          .eq('id', lessonId)
          .single();

        if (error) throw error;

        // Parse lesson content and convert to blocks
        // Handle various content_blocks formats:
        // - null/undefined → empty array
        // - valid array → use as-is
        // - invalid/corrupt → empty array with warning
        let blocks = [];

        if (data.content_blocks) {
          if (Array.isArray(data.content_blocks)) {
            blocks = data.content_blocks;
          } else {
            blocks = [];
          }
        }

        set((state) => ({
          canvas: {
            ...state.canvas,
            blocks,
            selectedBlock: null, // Clear selection when switching lessons
          },
          currentLesson: data, // Update current lesson with full data
          ui: {
            ...state.ui,
            currentPage: 0, // Reset to first page when loading new lesson
          },
          autoSave: {
            ...state.autoSave,
            hasUnsavedChanges: false, // Fresh load, no unsaved changes
          },
        }));

        return { data, error: null };
      } catch (error) {
        // Set empty blocks on error so editor is still usable
        set((state) => ({
          canvas: {
            ...state.canvas,
            blocks: [],
            selectedBlock: null,
          },
        }));
        return { data: null, error: error.message || 'Failed to load lesson' };
      }
    },

    toggleModuleExpanded: (moduleId) => {
      set((state) => ({
        timeline: {
          ...state.timeline,
          expandedModules: state.timeline.expandedModules.includes(moduleId)
            ? state.timeline.expandedModules.filter(id => id !== moduleId)
            : [...state.timeline.expandedModules, moduleId],
        },
      }));
    },

    // Save operations
    saveLesson: async (lessonId = null) => {
      const targetLessonId = lessonId || get().currentLesson?.id;
      if (!targetLessonId) return { data: null, error: 'No lesson selected' };

      set((state) => ({
        autoSave: { ...state.autoSave, isSaving: true },
        error: null,
      }));

      try {
        const { canvas } = get();

        const { data, error } = await supabase
          .from('lessons')
          .update({
            content_blocks: canvas.blocks,
            updated_at: new Date().toISOString(),
          })
          .eq('id', targetLessonId)
          .select()
          .single();

        if (error) throw error;

        set((state) => ({
          autoSave: {
            ...state.autoSave,
            isSaving: false,
            hasUnsavedChanges: false,
            lastSaved: new Date().toISOString(),
          },
        }));

        return { data, error: null };
      } catch (error) {
        set((state) => ({
          autoSave: { ...state.autoSave, isSaving: false },
          error: error.message,
        }));
        return { data: null, error };
      }
    },

    // Auto-save management
    enableAutoSave: () => {
      set((state) => ({
        autoSave: { ...state.autoSave, enabled: true },
      }));
    },

    disableAutoSave: () => {
      set((state) => ({
        autoSave: { ...state.autoSave, enabled: false },
      }));
    },

    // Media management
    fetchMedia: async (folderId = 'root') => {
      set((state) => ({ loading: { ...state.loading, media: true } }));

      try {
        const { data, error } = await supabase.storage
          .from('course-content')
          .list(folderId);

        if (error) throw error;

        set((state) => ({
          media: {
            ...state.media,
            files: data || [],
            currentFolder: folderId,
          },
          loading: { ...state.loading, media: false },
        }));

        return { data, error: null };
      } catch (error) {
        set((state) => ({ loading: { ...state.loading, media: false } }));
        return { data: [], error };
      }
    },

    uploadMedia: async (file, folder = 'root') => {
      const fileId = `${Date.now()}_${file.name}`;
      const filePath = folder === 'root' ? fileId : `${folder}/${fileId}`;

      try {
        const { data, error } = await supabase.storage
          .from('course-content')
          .upload(filePath, file, {
            onUploadProgress: (progress) => {
              const percentage = (progress.loaded / progress.total) * 100;
              set((state) => ({
                media: {
                  ...state.media,
                  uploadProgress: {
                    ...state.media.uploadProgress,
                    [fileId]: percentage,
                  },
                },
              }));
            },
          });

        if (error) throw error;

        // Get public URL
        const { data: urlData } = supabase.storage
          .from('course-content')
          .getPublicUrl(filePath);

        // Refresh media list
        await get().actions.fetchMedia(folder);

        return { data: { ...data, publicUrl: urlData.publicUrl }, error: null };
      } catch (error) {
        return { data: null, error };
      }
    },

    deleteMedia: async (filePath) => {
      try {
        const { error } = await supabase.storage
          .from('course-content')
          .remove([filePath]);

        if (error) throw error;

        // Refresh media list
        await get().actions.fetchMedia(get().media.currentFolder);

        return { error: null };
      } catch (error) {
        return { error };
      }
    },

    selectMediaFile: (fileId) => {
      set((state) => ({
        media: {
          ...state.media,
          selectedFiles: state.media.selectedFiles.includes(fileId)
            ? state.media.selectedFiles.filter(id => id !== fileId)
            : [...state.media.selectedFiles, fileId],
        },
      }));
    },

    // Template management
    fetchTemplates: async () => {
      set((state) => ({ loading: { ...state.loading, templates: true } }));

      try {
        // For now, return built-in templates
        const builtInTemplates = [
          {
            id: 'blank',
            name: 'Blank Course',
            description: 'Start from scratch',
            category: 'blank',
            thumbnail: null,
            blocks: [],
          },
          {
            id: 'presentation',
            name: 'Presentation Course',
            description: 'Slide-based learning experience',
            category: 'presentation',
            thumbnail: null,
            blocks: [],
          },
          {
            id: 'interactive',
            name: 'Interactive Course',
            description: 'Engage learners with interactive elements',
            category: 'interactive',
            thumbnail: null,
            blocks: [],
          },
          {
            id: 'assessment',
            name: 'Assessment-Heavy Course',
            description: 'Focus on quizzes and tests',
            category: 'assessment',
            thumbnail: null,
            blocks: [],
          },
        ];

        set((state) => ({
          templates: {
            ...state.templates,
            library: builtInTemplates,
          },
          loading: { ...state.loading, templates: false },
        }));

        return { data: builtInTemplates, error: null };
      } catch (error) {
        set((state) => ({ loading: { ...state.loading, templates: false } }));
        return { data: [], error };
      }
    },

    applyTemplate: (template) => {
      set((state) => ({
        canvas: {
          ...state.canvas,
          blocks: template.blocks || [],
        },
        templates: {
          ...state.templates,
          selectedTemplate: template,
        },
        autoSave: { ...state.autoSave, hasUnsavedChanges: true },
      }));

      get().actions.saveToHistory();
    },

    // UI controls
    toggleSidebar: () => {
      set((state) => ({
        ui: { ...state.ui, sidebarOpen: !state.ui.sidebarOpen },
      }));
    },

    toggleProperties: () => {
      set((state) => ({
        ui: { ...state.ui, propertiesOpen: !state.ui.propertiesOpen },
      }));
    },

    toggleTimeline: () => {
      set((state) => ({
        ui: { ...state.ui, timelineOpen: !state.ui.timelineOpen },
      }));
    },

    toggleMediaLibrary: () => {
      set((state) => ({
        ui: { ...state.ui, mediaLibraryOpen: !state.ui.mediaLibraryOpen },
      }));
    },

    toggleTemplateLibrary: () => {
      set((state) => ({
        ui: { ...state.ui, templateLibraryOpen: !state.ui.templateLibraryOpen },
      }));
    },

    setEditMode: (mode) => {
      set({ editMode: mode });
    },

    setZoom: (zoom) => {
      set((state) => ({
        canvas: { ...state.canvas, zoom },
      }));
    },

    toggleGrid: () => {
      set((state) => ({
        ui: { ...state.ui, showGrid: !state.ui.showGrid },
        canvas: { ...state.canvas, gridEnabled: !state.canvas.gridEnabled },
      }));
    },

    setCurrentPage: (pageIndex) => {
      set((state) => ({
        ui: { ...state.ui, currentPage: pageIndex },
      }));
    },

    // Reset editor
    resetEditor: () => {
      set({
        currentCourse: null,
        currentModule: null,
        currentLesson: null,
        canvas: {
          blocks: [],
          selectedBlock: null,
          clipboard: null,
          zoom: 100,
          gridEnabled: true,
        },
        history: {
          past: [],
          present: null,
          future: [],
          maxHistorySize: 50,
        },
        autoSave: {
          enabled: true,
          lastSaved: null,
          isSaving: false,
          hasUnsavedChanges: false,
        },
      });
    },
  },
}));

export { useEditorStore };
