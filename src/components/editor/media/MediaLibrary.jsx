// src/components/editor/media/MediaLibrary.jsx
import { useState } from 'react';
import { useEditorStore } from '@/store/editorStore';
import { useMediaUpload } from '@/hooks/editor';
import MediaUploader from './MediaUploader';
import MediaGrid from './MediaGrid';
import { X, Upload, Folder, Search } from 'lucide-react';

const MediaLibrary = () => {
  const { media, ui, actions } = useEditorStore();
  const { uploadFiles, uploads, uploadProgress } = useMediaUpload();
  const [showUploader, setShowUploader] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleUpload = async (files) => {
    await uploadFiles(files, media.currentFolder);
    setShowUploader(false);
  };

  if (!ui.mediaLibraryOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-6xl h-[80vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Media Library</h2>
            <button
              onClick={actions.toggleMediaLibrary}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-gray-500" />
            </button>
          </div>

          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search media..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* Upload button */}
            <button
              onClick={() => setShowUploader(true)}
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              <Upload className="w-5 h-5" />
              Upload
            </button>
          </div>

          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 mt-4 text-sm">
            <Folder className="w-4 h-4 text-gray-500" />
            <span className="text-gray-600">{media.currentFolder}</span>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {showUploader ? (
            <MediaUploader
              onUpload={handleUpload}
              onCancel={() => setShowUploader(false)}
              uploadProgress={uploadProgress}
              uploads={uploads}
            />
          ) : (
            <MediaGrid
              files={media.files}
              selectedFiles={media.selectedFiles}
              onSelectFile={actions.selectMediaFile}
              searchQuery={searchQuery}
            />
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 flex items-center justify-between bg-gray-50">
          <div className="text-sm text-gray-600">
            {media.selectedFiles.length > 0 && (
              <span>{media.selectedFiles.length} file(s) selected</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={actions.toggleMediaLibrary}
              className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              disabled={media.selectedFiles.length === 0}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Insert Selected
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MediaLibrary;
