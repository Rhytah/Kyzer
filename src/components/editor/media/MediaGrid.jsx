// src/components/editor/media/MediaGrid.jsx
import { Image, Video, FileText, Check } from 'lucide-react';

const MediaGrid = ({ files, selectedFiles, onSelectFile, searchQuery }) => {
  const getFileIcon = (file) => {
    const name = file.name.toLowerCase();
    if (name.match(/\.(jpg|jpeg|png|gif|svg|webp)$/)) {
      return Image;
    }
    if (name.match(/\.(mp4|mov|avi|webm)$/)) {
      return Video;
    }
    if (name.match(/\.pdf$/)) {
      return FileText;
    }
    return FileText;
  };

  const filteredFiles = files.filter(file =>
    file.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (filteredFiles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <FileText className="w-16 h-16 text-gray-300 mb-4" />
        <p className="text-gray-500">No media files found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-4 gap-4">
      {filteredFiles.map((file) => {
        const Icon = getFileIcon(file);
        const isSelected = selectedFiles.includes(file.id || file.name);

        return (
          <div
            key={file.id || file.name}
            onClick={() => onSelectFile(file.id || file.name)}
            className={`relative aspect-square border-2 rounded-lg overflow-hidden cursor-pointer transition-all hover:shadow-lg ${
              isSelected
                ? 'border-primary-500 ring-2 ring-primary-200'
                : 'border-gray-200 hover:border-primary-300'
            }`}
          >
            {/* File preview */}
            <div className="w-full h-full flex items-center justify-center bg-gray-100">
              {file.name.match(/\.(jpg|jpeg|png|gif|svg|webp)$/) ? (
                <img
                  src={file.publicUrl || `/api/placeholder/200/200`}
                  alt={file.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Icon className="w-12 h-12 text-gray-400" />
              )}
            </div>

            {/* Selection indicator */}
            {isSelected && (
              <div className="absolute top-2 right-2 w-6 h-6 bg-primary-600 rounded-full flex items-center justify-center">
                <Check className="w-4 h-4 text-white" />
              </div>
            )}

            {/* File name */}
            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-75 text-white p-2">
              <p className="text-xs truncate">{file.name}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MediaGrid;
