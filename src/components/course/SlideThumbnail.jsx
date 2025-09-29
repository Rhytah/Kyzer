// src/components/course/SlideThumbnail.jsx
import React from 'react';
import {
  FileText,
  Image,
  Video,
  File,
  Music,
  Grid3X3
} from 'lucide-react';

const SlideThumbnail = ({
  slide,
  index,
  size = 'medium',
  onClick,
  className = ""
}) => {
  if (!slide) return null;

  const getSizeClasses = (size) => {
    switch (size) {
      case 'small':
        return 'w-24 h-18';
      case 'large':
        return 'w-48 h-32';
      case 'medium':
      default:
        return 'w-32 h-24';
    }
  };

  const renderSlideContent = () => {
    const { content_type, content_url, content_text, title } = slide;

    switch (content_type) {
      case 'text':
        return (
          <div className="w-full h-full bg-white rounded flex flex-col overflow-hidden">
            <div className="bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600 border-b truncate">
              {title || 'Text Slide'}
            </div>
            <div className="flex-1 p-2 text-xs text-gray-700 overflow-hidden">
              <div className="line-clamp-3 leading-tight">
                {content_text ? content_text.substring(0, 60) + (content_text.length > 60 ? '...' : '') : 'Text content'}
              </div>
            </div>
          </div>
        );

      case 'image':
        return (
          <div className="w-full h-full bg-gray-100 rounded overflow-hidden relative">
            {content_url ? (
              <img
                src={content_url}
                alt={title || 'Slide image'}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
            ) : null}
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100" style={{ display: content_url ? 'none' : 'flex' }}>
              <Image className="w-6 h-6 text-gray-400" />
            </div>
          </div>
        );

      case 'video':
        return (
          <div className="w-full h-full bg-gray-900 rounded overflow-hidden relative">
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center">
                <Video className="w-8 h-8 text-white mb-1" />
                <div className="text-white text-xs font-medium truncate px-1">
                  {title || 'Video'}
                </div>
              </div>
            </div>
          </div>
        );

      case 'pdf':
        return (
          <div className="w-full h-full bg-red-50 rounded overflow-hidden relative">
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center">
                <File className="w-8 h-8 text-red-600 mb-1" />
                <div className="text-red-600 text-xs font-medium truncate px-1">
                  {title || 'PDF'}
                </div>
              </div>
            </div>
          </div>
        );

      case 'quiz':
        return (
          <div className="w-full h-full bg-blue-50 rounded overflow-hidden relative">
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center">
                <Grid3X3 className="w-8 h-8 text-blue-600 mb-1" />
                <div className="text-blue-600 text-xs font-medium truncate px-1">
                  {title || 'Quiz'}
                </div>
                {slide.metadata && slide.metadata.question_count && (
                  <div className="text-xs text-blue-500">
                    {slide.metadata.question_count}q
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 'audio':
        return (
          <div className="w-full h-full bg-purple-50 rounded overflow-hidden relative">
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center">
                <Music className="w-8 h-8 text-purple-600 mb-1" />
                <div className="text-purple-600 text-xs font-medium truncate px-1">
                  {title || 'Audio'}
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="w-full h-full bg-gray-100 rounded overflow-hidden relative">
            <div className="w-full h-full flex items-center justify-center">
              <FileText className="w-8 h-8 text-gray-400" />
            </div>
          </div>
        );
    }
  };

  return (
    <div
      className={`${getSizeClasses(size)} relative ${onClick ? 'cursor-pointer hover:shadow-lg' : ''} transition-all duration-200 ${className}`}
      onClick={onClick}
      title={`Slide ${slide.slide_number}: ${slide.title || slide.content_type}`}
    >
      <div className="w-full h-full border border-gray-200 rounded overflow-hidden relative">
        {renderSlideContent()}

        {/* Slide number overlay */}
        <div className="absolute top-1 left-1 bg-black bg-opacity-75 text-white text-xs px-1.5 py-0.5 rounded">
          {slide.slide_number}
        </div>

        {/* Content type indicator */}
        <div className={`absolute bottom-1 right-1 text-xs px-1.5 py-0.5 rounded ${
          slide.content_type === 'quiz'
            ? 'bg-blue-600 text-white'
            : 'bg-gray-800 text-white'
        }`}>
          {slide.content_type === 'quiz' ? 'Q' : slide.content_type.charAt(0).toUpperCase()}
        </div>

        {/* Required indicator */}
        {slide.is_required && (
          <div className="absolute top-1 right-1 w-2 h-2 bg-green-500 rounded-full"></div>
        )}
      </div>
    </div>
  );
};

export default SlideThumbnail;