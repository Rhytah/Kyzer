// src/hooks/editor/useMediaUpload.js
import { useState, useCallback } from 'react';
import { useEditorStore } from '@/store/editorStore';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';

/**
 * Hook for handling media uploads in the editor
 */
export const useMediaUpload = () => {
  const [uploadProgress, setUploadProgress] = useState({});
  const [uploads, setUploads] = useState([]);
  const currentCourse = useEditorStore((state) => state.currentCourse);
  const { fetchMedia } = useEditorStore((state) => state.actions);

  // Upload single file
  const uploadFile = useCallback(async (file, folder = null) => {
    if (!currentCourse?.id) {
      toast.error('No course selected');
      return { data: null, error: 'No course selected' };
    }

    const fileId = `${Date.now()}_${file.name}`;
    const folderPath = folder || `course_${currentCourse.id}`;
    const filePath = `${folderPath}/${fileId}`;

    try {
      setUploads(prev => [...prev, { id: fileId, name: file.name, status: 'uploading' }]);

      const { data, error } = await supabase.storage
        .from('course-content')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
          onUploadProgress: (progress) => {
            const percentage = Math.round((progress.loaded / progress.total) * 100);
            setUploadProgress(prev => ({
              ...prev,
              [fileId]: percentage,
            }));
          },
        });

      if (error) throw error;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('course-content')
        .getPublicUrl(filePath);

      setUploads(prev =>
        prev.map(u => u.id === fileId ? { ...u, status: 'completed' } : u)
      );

      // Refresh media library
      await fetchMedia(folderPath);

      toast.success(`${file.name} uploaded successfully`);

      return {
        data: {
          path: filePath,
          publicUrl: urlData.publicUrl,
          name: file.name,
          size: file.size,
          type: file.type,
        },
        error: null,
      };
    } catch (error) {
      setUploads(prev =>
        prev.map(u => u.id === fileId ? { ...u, status: 'error' } : u)
      );
      toast.error(`Failed to upload ${file.name}`);
      return { data: null, error: error.message };
    }
  }, [currentCourse, fetchMedia]);

  // Upload multiple files
  const uploadFiles = useCallback(async (files, folder = null) => {
    const results = [];

    for (const file of files) {
      const result = await uploadFile(file, folder);
      results.push({ file: file.name, ...result });
    }

    const successCount = results.filter(r => !r.error).length;
    const failCount = results.filter(r => r.error).length;

    if (successCount > 0) {
      toast.success(`${successCount} file(s) uploaded successfully`);
    }
    if (failCount > 0) {
      toast.error(`${failCount} file(s) failed to upload`);
    }

    return results;
  }, [uploadFile]);

  // Clear upload history
  const clearUploads = useCallback(() => {
    setUploads([]);
    setUploadProgress({});
  }, []);

  // Cancel upload (Note: Supabase doesn't support cancellation natively)
  const cancelUpload = useCallback((fileId) => {
    setUploads(prev =>
      prev.map(u => u.id === fileId ? { ...u, status: 'cancelled' } : u)
    );
    toast.info('Upload cancelled');
  }, []);

  // Get upload status
  const getUploadStatus = useCallback((fileId) => {
    const upload = uploads.find(u => u.id === fileId);
    return upload?.status || 'idle';
  }, [uploads]);

  return {
    // State
    uploadProgress,
    uploads,

    // Actions
    uploadFile,
    uploadFiles,
    clearUploads,
    cancelUpload,
    getUploadStatus,
  };
};
