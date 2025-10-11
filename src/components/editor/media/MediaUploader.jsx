// src/components/editor/media/MediaUploader.jsx
import { useCallback } from 'react';
import { Upload, X } from 'lucide-react';

const MediaUploader = ({ onUpload, onCancel, uploadProgress, uploads }) => {
  const handleDrop = useCallback((e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      onUpload(files);
    }
  }, [onUpload]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
  }, []);

  const handleFileInput = useCallback((e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      onUpload(files);
    }
  }, [onUpload]);

  return (
    <div className="space-y-6">
      {/* Drop zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-primary-500 transition-colors cursor-pointer"
      >
        <input
          type="file"
          multiple
          onChange={handleFileInput}
          className="hidden"
          id="file-upload"
          accept="image/*,video/*,application/pdf"
        />
        <label htmlFor="file-upload" className="cursor-pointer">
          <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-lg font-medium text-gray-900 mb-2">
            Drop files here or click to upload
          </p>
          <p className="text-sm text-gray-500">
            Support for images, videos, and PDF files
          </p>
        </label>
      </div>

      {/* Upload progress */}
      {uploads.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-gray-900">Uploading files</h3>
          {uploads.map((upload) => (
            <div key={upload.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{upload.name}</p>
                <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary-600 h-2 rounded-full transition-all"
                    style={{ width: `${uploadProgress[upload.id] || 0}%` }}
                  />
                </div>
              </div>
              <span className="text-sm text-gray-500">
                {Math.round(uploadProgress[upload.id] || 0)}%
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="flex justify-end">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default MediaUploader;
