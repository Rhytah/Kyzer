// src/store/editorStore.js
import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { getBlockDefinition, BLOCK_TYPES } from '@/lib/editor/blockRegistry';

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
    zoom: 70,
    gridEnabled: true,
    firstPageBackground: '#ffffff', // Background color for page 1
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

      set((state) => {
        const currentPage = state.ui.currentPage || 0;
        const blocks = [...state.canvas.blocks];
        
        // Find insertion point based on current page
        let insertIndex = blocks.length; // Default to end
        
        if (currentPage === 0) {
          // For first page, insert before the first PAGE_BREAK (or at end if no breaks)
          const firstPageBreak = blocks.findIndex(b => b.type === BLOCK_TYPES.PAGE_BREAK);
          insertIndex = firstPageBreak !== -1 ? firstPageBreak : blocks.length;
        } else {
          // For other pages, find the Nth PAGE_BREAK and insert after its content
          let pageBreakCount = 0;
          for (let i = 0; i < blocks.length; i++) {
            if (blocks[i].type === BLOCK_TYPES.PAGE_BREAK) {
              pageBreakCount++;
              if (pageBreakCount === currentPage + 1) {
                // Found the page break AFTER current page, insert before it
                insertIndex = i;
                break;
              }
            }
          }
          // If we didn't find a page break after current page, append to end
        }
        
        // Insert block at the calculated position
        blocks.splice(insertIndex, 0, newBlock);
        
        return {
          canvas: {
            ...state.canvas,
            blocks,
            selectedBlock: newBlock.id,
          },
          autoSave: { ...state.autoSave, hasUnsavedChanges: true },
        };
      });

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
        // Select all columns - Supabase will only return what exists
        const { data, error } = await supabase
          .from('lessons')
          .select('*')
          .eq('id', lessonId)
          .single();

        if (error) throw error;

        // Parse lesson content and convert to blocks
        // Handle various content_blocks formats:
        // - null/undefined → migrate legacy content or empty array
        // - empty array → migrate legacy content if other content exists
        // - valid array with content → use as-is
        // - invalid/corrupt → empty array with warning
        let blocks = [];

        if (data.content_blocks) {
          if (Array.isArray(data.content_blocks)) {
            blocks = data.content_blocks;
          } else if (typeof data.content_blocks === 'string') {
            // Try to parse if it's a JSON string
            try {
              const parsed = JSON.parse(data.content_blocks);
              blocks = Array.isArray(parsed) ? parsed : [];
            } catch {
              blocks = [];
            }
          } else {
            blocks = [];
          }
        }

        // If blocks is empty but lesson has other content, try migration
        if (blocks.length === 0 && (data.content_url || data.content_text)) {
          blocks = get().actions.migrateLegacyContent(data);
        }

        // Parse content metadata for first page background
        let firstPageBackground = '#ffffff';
        if (data.content_meta) {
          try {
            const meta = typeof data.content_meta === 'string' 
              ? JSON.parse(data.content_meta) 
              : data.content_meta;
            firstPageBackground = meta.firstPageBackground || '#ffffff';
          } catch {
            firstPageBackground = '#ffffff';
          }
        }

        // Log for debugging
        console.info(`[Editor] Lesson ${lessonId}: Loaded ${blocks.length} blocks`, {
          hasContentBlocks: !!data.content_blocks,
          contentType: data.content_type,
          lessonTitle: data.title,
        });

        set((state) => ({
          canvas: {
            ...state.canvas,
            blocks,
            selectedBlock: null, // Clear selection when switching lessons
            firstPageBackground, // Load first page background
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

    /**
     * Migrate legacy lesson content to editor blocks
     */
    migrateLegacyContent: (lessonData) => {
      console.info(`[Editor Migration] Starting migration for lesson:`, {
        title: lessonData.title,
        contentType: lessonData.content_type,
        hasContentUrl: !!lessonData.content_url,
        hasContentText: !!lessonData.content_text,
      });

      const blocks = [];
      let blockIdCounter = 1;

      const generateBlockId = () => {
        return `block-${Date.now()}-${blockIdCounter++}`;
      };

      // Add a heading with the lesson title (first page)
      blocks.push({
        id: generateBlockId(),
        type: 'heading',
        data: {
          text: lessonData.title || 'Lesson Content',
          level: 2,
          color: '#000000',
          alignment: 'left',
        },
      });

      // Migrate based on content_type
      if (lessonData.content_type === 'text' && lessonData.content_text) {
        // Convert text content to a text block
        blocks.push({
          id: generateBlockId(),
          type: 'text',
          data: {
            content: lessonData.content_text,
            fontSize: 16,
            fontFamily: 'Inter',
            color: '#000000',
            alignment: 'left',
          },
        });
      } else if (lessonData.content_type === 'video' && lessonData.content_url) {
        // Convert video URL to a video block
        let videoType = 'html5';
        if (lessonData.content_url.includes('youtube.com') || lessonData.content_url.includes('youtu.be')) {
          videoType = 'youtube';
        } else if (lessonData.content_url.includes('vimeo.com')) {
          videoType = 'vimeo';
        }

        blocks.push({
          id: generateBlockId(),
          type: 'video',
          data: {
            src: lessonData.content_url,
            type: videoType,
            width: '100%',
            height: '400px',
            controls: true,
            autoplay: false,
            loop: false,
            muted: false,
          },
        });
      } else if (lessonData.content_type === 'pdf' && lessonData.content_url) {
        // Convert PDF to a PDF block
        blocks.push({
          id: generateBlockId(),
          type: 'pdf',
          data: {
            src: lessonData.content_url,
            title: lessonData.title || 'PDF Document',
          },
        });
      } else if (lessonData.content_type === 'image' && lessonData.content_url) {
        // Convert image to an image block
        blocks.push({
          id: generateBlockId(),
          type: 'image',
          data: {
            src: lessonData.content_url,
            alt: lessonData.title || 'Image',
            width: '100%',
            height: 'auto',
            objectFit: 'contain',
          },
        });
      } else if (lessonData.content_type === 'ppt' && lessonData.content_url) {
        // Convert PPT URL to an embed block using Office Online Viewer
        blocks.push({
          id: generateBlockId(),
          type: 'embed',
          data: {
            type: 'iframe',
            src: `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(lessonData.content_url)}`,
            width: '100%',
            height: '600px',
            title: lessonData.title || 'PowerPoint Presentation',
          },
        });
        
        // Add a helpful note about PPT content
        blocks.push({
          id: generateBlockId(),
          type: 'text',
          data: {
            content: '<p style="color: #666; font-size: 14px; padding: 1rem; background: #eff6ff; border-left: 3px solid #3b82f6; border-radius: 4px;">💡 <strong>PowerPoint Presentation</strong><br/>This PPT is displayed using Office Online Viewer. You can also <a href="' + lessonData.content_url + '" target="_blank" style="color: #2563eb; text-decoration: underline;">download it here</a>. Add more content blocks below to supplement the presentation.</p>',
            fontSize: 14,
            fontFamily: 'Inter',
            color: '#666666',
            alignment: 'left',
          },
        });
      } else if (lessonData.content_type === 'presentation') {
        // For presentations with slides, we need to fetch slides and convert them
        // This is done asynchronously, so we'll mark it for async loading
        blocks.push({
          id: generateBlockId(),
          type: 'text',
          data: {
            content: '<p><em>⏳ Loading presentation slides...</em></p>',
            fontSize: 14,
            fontFamily: 'Inter',
            color: '#666666',
            alignment: 'center',
          },
        });

        // Trigger async presentation migration
        get().actions.migratePresentationSlides(lessonData.id);
        return blocks; // Return early, slides will be loaded asynchronously
      }

      // Add a note that this was migrated
      if (blocks.length > 1) {
        blocks.push({
          id: generateBlockId(),
          type: 'text',
          data: {
            content: '<p style="color: #666; font-size: 12px; font-style: italic; margin-top: 2rem; padding-top: 1rem; border-top: 1px solid #e5e7eb;">📝 This content was automatically converted from the legacy format. You can now edit it using the editor blocks. Save your changes to update the lesson.</p>',
            fontSize: 12,
            fontFamily: 'Inter',
            color: '#666666',
            alignment: 'left',
          },
        });
      }

      return blocks;
    },

    /**
     * Migrate presentation slides to editor blocks
     * Fetches slides from the database and converts them to pages
     */
    migratePresentationSlides: async (lessonId) => {
      try {
        // Fetch presentation and slides
        const { data, error } = await supabase
          .from('lesson_presentations')
          .select(`
            *,
            slides:presentation_slides(*)
          `)
          .eq('lesson_id', lessonId)
          .single();

        if (error) throw error;

        const blocks = [];
        let blockIdCounter = 1;

        const generateBlockId = () => {
          return `block-pres-${Date.now()}-${blockIdCounter++}`;
        };

        // Sort slides by slide_number
        const slides = (data?.slides || []).sort((a, b) => a.slide_number - b.slide_number);

        if (slides.length === 0) {
          // No slides found, show a message
          blocks.push({
            id: generateBlockId(),
            type: 'heading',
            data: {
              text: 'Presentation (Empty)',
              level: 2,
              color: '#000000',
              alignment: 'left',
            },
          });
          blocks.push({
            id: generateBlockId(),
            type: 'text',
            data: {
              content: '<p>This presentation has no slides yet. Use the presentation management tools to add slides, or start adding content blocks here.</p>',
              fontSize: 14,
              fontFamily: 'Inter',
              color: '#666666',
              alignment: 'left',
            },
          });
        } else {
          // Convert each slide to editor blocks with page breaks
          slides.forEach((slide, index) => {
            // Add page break before each slide (except the first)
            if (index > 0) {
              blocks.push({
                id: generateBlockId(),
                type: 'page_break',
                data: {
                  backgroundColor: '#ffffff',
                  showPageNumber: true,
                },
              });
            }

            // Add slide title as heading
            if (slide.title) {
              blocks.push({
                id: generateBlockId(),
                type: 'heading',
                data: {
                  text: slide.title,
                  level: 2,
                  color: '#000000',
                  alignment: 'left',
                },
              });
            }

            // Add slide content based on content_type
            if (slide.content_type === 'text' && slide.content_text) {
              blocks.push({
                id: generateBlockId(),
                type: 'text',
                data: {
                  content: slide.content_text,
                  fontSize: 16,
                  fontFamily: 'Inter',
                  color: '#000000',
                  alignment: 'left',
                },
              });
            } else if (slide.content_type === 'video' && slide.content_url) {
              let videoType = 'html5';
              if (slide.content_url.includes('youtube.com') || slide.content_url.includes('youtu.be')) {
                videoType = 'youtube';
              } else if (slide.content_url.includes('vimeo.com')) {
                videoType = 'vimeo';
              }

              blocks.push({
                id: generateBlockId(),
                type: 'video',
                data: {
                  src: slide.content_url,
                  type: videoType,
                  width: '100%',
                  height: '400px',
                  controls: true,
                  autoplay: false,
                  loop: false,
                  muted: false,
                },
              });
            } else if (slide.content_type === 'image' && slide.content_url) {
              blocks.push({
                id: generateBlockId(),
                type: 'image',
                data: {
                  src: slide.content_url,
                  alt: slide.title || 'Slide image',
                  width: '100%',
                  height: 'auto',
                  objectFit: 'contain',
                },
              });
            } else if (slide.content_type === 'pdf' && slide.content_url) {
              blocks.push({
                id: generateBlockId(),
                type: 'pdf',
                data: {
                  src: slide.content_url,
                  title: slide.title || 'PDF Document',
                },
              });
            } else if (slide.content_type === 'audio' && slide.content_url) {
              // Audio as HTML5 audio player using embed block
              blocks.push({
                id: generateBlockId(),
                type: 'embed',
                data: {
                  type: 'html',
                  embedCode: `<audio controls style="width: 100%;"><source src="${slide.content_url}" type="audio/mpeg">Your browser does not support the audio element.</audio>`,
                  title: slide.title || 'Audio',
                },
              });
            }

            // Add any additional text content
            if (slide.content_text && slide.content_type !== 'text') {
              blocks.push({
                id: generateBlockId(),
                type: 'text',
                data: {
                  content: slide.content_text,
                  fontSize: 14,
                  fontFamily: 'Inter',
                  color: '#333333',
                  alignment: 'left',
                },
              });
            }
          });

          // Add migration note at the end
          blocks.push({
            id: generateBlockId(),
            type: 'page_break',
            data: {
              backgroundColor: '#f9fafb',
              showPageNumber: false,
            },
          });

          blocks.push({
            id: generateBlockId(),
            type: 'text',
            data: {
              content: `<p style="color: #666; font-size: 12px; font-style: italic; padding: 1rem; background: #f0f9ff; border-left: 3px solid #3b82f6; border-radius: 4px;">📊 <strong>Presentation Migration Complete</strong><br/>This presentation with ${slides.length} slide${slides.length !== 1 ? 's' : ''} has been converted to editor pages. Each slide is now a separate page. You can edit the content, add new blocks, or rearrange pages. Save your changes to update the lesson.</p>`,
              fontSize: 12,
              fontFamily: 'Inter',
              color: '#666666',
              alignment: 'left',
            },
          });
        }

        // Update the canvas with the migrated blocks
        set((state) => ({
          canvas: {
            ...state.canvas,
            blocks,
            selectedBlock: null,
          },
          ui: {
            ...state.ui,
            currentPage: 0,
          },
        }));

        return { success: true, blocks };
      } catch (error) {
        // Show error message in the canvas
        const errorBlocks = [
          {
            id: `block-error-${Date.now()}`,
            type: 'text',
            data: {
              content: `<p style="color: #dc2626; padding: 1rem; background: #fef2f2; border-left: 3px solid #dc2626; border-radius: 4px;">⚠️ <strong>Failed to load presentation slides</strong><br/>${error.message || 'Unknown error'}</p>`,
              fontSize: 14,
              fontFamily: 'Inter',
              color: '#dc2626',
              alignment: 'left',
            },
          },
        ];

        set((state) => ({
          canvas: {
            ...state.canvas,
            blocks: errorBlocks,
          },
        }));

        return { success: false, error: error.message };
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

        // Prepare content metadata
        const contentMeta = {
          firstPageBackground: canvas.firstPageBackground || '#ffffff',
        };

        // Try to update with content_meta, fall back without it if column doesn't exist
        let updateData = {
          content_blocks: canvas.blocks,
          updated_at: new Date().toISOString(),
        };

        // Check if content_meta column exists by trying to read it first
        const { data: checkData } = await supabase
          .from('lessons')
          .select('id, content_meta')
          .eq('id', targetLessonId)
          .single();

        // If content_meta exists in the schema, include it in the update
        if (checkData && 'content_meta' in checkData) {
          updateData.content_meta = contentMeta;
        }

        const { data, error } = await supabase
          .from('lessons')
          .update(updateData)
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

    setFirstPageBackground: (color) => {
      set((state) => ({
        canvas: { ...state.canvas, firstPageBackground: color },
        autoSave: { ...state.autoSave, hasUnsavedChanges: true },
      }));
      get().actions.saveToHistory();
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
          zoom: 70,
          gridEnabled: true,
          firstPageBackground: '#ffffff',
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
