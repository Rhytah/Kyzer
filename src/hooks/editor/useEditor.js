// src/hooks/editor/useEditor.js
import { useCallback, useEffect } from 'react';
import { useEditorStore } from '@/store/editorStore';
import toast from 'react-hot-toast';

/**
 * Main editor hook - provides unified access to editor functionality
 */
export const useEditor = () => {
  const store = useEditorStore();
  const { actions } = store;

  // Initialize editor when component mounts
  const initialize = useCallback(async (courseId) => {
    return await actions.initializeEditor(courseId);
  }, [actions]);

  // Save current work
  const save = useCallback(async (lessonId = null) => {
    return await actions.saveLesson(lessonId);
  }, [actions]);

  // Block operations
  const addBlock = useCallback((blockType) => {
    actions.addBlock(blockType);
  }, [actions]);

  const updateBlock = useCallback((blockId, updates) => {
    actions.updateBlock(blockId, updates);
  }, [actions]);

  const deleteBlock = useCallback((blockId) => {
    actions.deleteBlock(blockId);
  }, [actions]);

  const selectBlock = useCallback((blockId) => {
    actions.selectBlock(blockId);
  }, [actions]);

  const duplicateBlock = useCallback((blockId) => {
    actions.duplicateBlock(blockId);
  }, [actions]);

  // History operations
  const undo = useCallback(() => {
    actions.undo();
  }, [actions]);

  const redo = useCallback(() => {
    actions.redo();
  }, [actions]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Cmd/Ctrl + Z - Undo
      if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        actions.undo();
      }

      // Cmd/Ctrl + Shift + Z - Redo
      if ((e.metaKey || e.ctrlKey) && e.key === 'z' && e.shiftKey) {
        e.preventDefault();
        actions.redo();
      }

      // Cmd/Ctrl + S - Save
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        actions.saveLesson();
      }

      // Cmd/Ctrl + C - Copy
      if ((e.metaKey || e.ctrlKey) && e.key === 'c' && store.canvas.selectedBlock) {
        e.preventDefault();
        actions.copyBlock(store.canvas.selectedBlock);
      }

      // Cmd/Ctrl + V - Paste
      if ((e.metaKey || e.ctrlKey) && e.key === 'v' && store.canvas.clipboard) {
        e.preventDefault();
        actions.pasteBlock();
      }

      // Cmd/Ctrl + D - Duplicate
      if ((e.metaKey || e.ctrlKey) && e.key === 'd' && store.canvas.selectedBlock) {
        e.preventDefault();
        actions.duplicateBlock(store.canvas.selectedBlock);
      }

      // Delete/Backspace - Delete selected block
      if ((e.key === 'Delete' || e.key === 'Backspace') && store.canvas.selectedBlock) {
        e.preventDefault();
        actions.deleteBlock(store.canvas.selectedBlock);
      }

      // Escape - Deselect
      if (e.key === 'Escape') {
        e.preventDefault();
        actions.selectBlock(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [actions, store.canvas.selectedBlock, store.canvas.clipboard]);

  return {
    // State
    currentCourse: store.currentCourse,
    currentModule: store.currentModule,
    currentLesson: store.currentLesson,
    editMode: store.editMode,
    canvas: store.canvas,
    timeline: store.timeline,
    loading: store.loading,
    error: store.error,
    autoSave: store.autoSave,

    // Capabilities
    canUndo: actions.canUndo(),
    canRedo: actions.canRedo(),
    hasUnsavedChanges: store.autoSave.hasUnsavedChanges,

    // Actions
    initialize,
    save,
    addBlock,
    updateBlock,
    deleteBlock,
    selectBlock,
    duplicateBlock,
    undo,
    redo,

    // Additional actions
    setEditMode: actions.setEditMode,
    selectModule: actions.selectModule,
    selectLesson: async (lessonId) => {
      const result = await actions.selectLesson(lessonId);
      if (result?.success) {
        toast.success(result.message);
      } else if (result?.error) {
        toast.error(result.error);
      }
      return result;
    },
    reorderBlocks: actions.reorderBlocks,
    copyBlock: actions.copyBlock,
    pasteBlock: actions.pasteBlock,
  };
};
