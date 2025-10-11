// src/hooks/editor/useAutoSave.js
import { useEffect, useRef, useCallback } from 'react';
import { useEditorStore } from '@/store/editorStore';
import toast from 'react-hot-toast';

/**
 * Auto-save hook for editor
 * @param {number} interval - Auto-save interval in milliseconds (default: 30000 - 30 seconds)
 */
export const useAutoSave = (interval = 30000) => {
  const autoSave = useEditorStore((state) => state.autoSave);
  const currentLesson = useEditorStore((state) => state.currentLesson);
  const { saveLesson } = useEditorStore((state) => state.actions);

  const saveTimeoutRef = useRef(null);
  const lastSaveRef = useRef(null);

  // Manual save function
  const save = useCallback(async () => {
    if (!currentLesson?.id) {
      toast.error('No lesson selected to save');
      return { success: false, error: 'No lesson selected' };
    }

    try {
      const result = await saveLesson(currentLesson.id);

      if (result.error) {
        toast.error('Failed to save changes');
        return { success: false, error: result.error };
      }

      toast.success('Changes saved successfully');
      lastSaveRef.current = new Date();
      return { success: true, data: result.data };
    } catch (error) {
      toast.error('Failed to save changes');
      return { success: false, error: error.message };
    }
  }, [currentLesson, saveLesson]);

  // Auto-save effect
  useEffect(() => {
    if (!autoSave.enabled || !autoSave.hasUnsavedChanges || !currentLesson?.id) {
      return;
    }

    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Set new timeout for auto-save
    saveTimeoutRef.current = setTimeout(async () => {
      const result = await saveLesson(currentLesson.id);

      if (result.error) {
        toast.error('Auto-save failed');
      } else {
        lastSaveRef.current = new Date();
        toast.success('Auto-saved');
      }
    }, interval);

    // Cleanup
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [autoSave.enabled, autoSave.hasUnsavedChanges, currentLesson, interval, saveLesson]);

  // Save before unload
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (autoSave.hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [autoSave.hasUnsavedChanges]);

  return {
    // State
    enabled: autoSave.enabled,
    isSaving: autoSave.isSaving,
    hasUnsavedChanges: autoSave.hasUnsavedChanges,
    lastSaved: autoSave.lastSaved || lastSaveRef.current,

    // Actions
    save,
  };
};
