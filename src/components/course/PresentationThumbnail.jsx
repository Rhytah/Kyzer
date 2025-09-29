// src/components/course/PresentationThumbnail.jsx
import React from 'react';
import {
  FileText,
  Image,
  Video,
  File,
  Music,
  Grid3X3
} from 'lucide-react';

// Helper function to get size classes
const getSizeClasses = (size) => {
  switch (size) {
    case 'small':
      return 'w-32 h-24';
    case 'large':
      return 'w-80 h-60';
    case 'medium':
    default:
      return 'w-48 h-36';
  }
};

const PresentationThumbnail = ({
  presentation,
  size = 'medium',
  showInfo = true,
  onClick,
  className = ""
}) => {
  if (!presentation || !presentation.slides || presentation.slides.length === 0) {
    return (
      <div className={`bg-gray-100 border border-gray-200 rounded-lg overflow-hidden ${getSizeClasses(size)} ${className}`}>
        <div className="w-full h-full flex items-center justify-center">
          <FileText className="w-8 h-8 text-gray-400" />
        </div>
        {showInfo && (
          <div className="p-2">
            <div className="text-sm font-medium text-gray-600 truncate">
              No slides
            </div>
          </div>
        )}
      </div>
    );
  }

  // Get the first non-quiz slide for the main thumbnail, or first slide if all are quizzes
  const mainSlide = presentation.slides.find(slide => slide.content_type !== 'quiz') || presentation.slides[0];

  const renderSlideThumbnail = (slide) => {
    if (!slide) return null;

    const { content_type, content_url, content_text, title } = slide;

    switch (content_type) {
      case 'text':
        return (
          <div className="w-full h-full bg-white border border-gray-200 rounded flex flex-col overflow-hidden">
            <div className="bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600 border-b truncate">
              {title || 'Text Slide'}
            </div>
            <div className="flex-1 p-2 text-xs text-gray-700 overflow-hidden">
              <div className="line-clamp-4 leading-tight">
                {content_text ? content_text.substring(0, 100) + (content_text.length > 100 ? '...' : '') : 'Text content'}
              </div>
            </div>
          </div>
        );

      case 'image':
        return (
          <div className="w-full h-full bg-gray-100 border border-gray-200 rounded overflow-hidden relative">
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
              <Image className="w-8 h-8 text-gray-400" />
            </div>
          </div>
        );

      case 'video':
        return (
          <div className="w-full h-full bg-gray-900 border border-gray-200 rounded overflow-hidden relative">
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center">
                <Video className="w-12 h-12 text-white mb-2" />
                <div className="text-white text-sm font-medium truncate px-2">
                  {title || 'Video Slide'}
                </div>
              </div>
            </div>
          </div>
        );

      case 'pdf':
        return (
          <div className="w-full h-full bg-red-50 border border-gray-200 rounded overflow-hidden relative">
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center">
                <File className="w-12 h-12 text-red-600 mb-2" />
                <div className="text-red-600 text-sm font-medium truncate px-2">
                  {title || 'PDF Document'}
                </div>
              </div>
            </div>
          </div>
        );

      case 'quiz':
        return (
          <div className="w-full h-full bg-blue-50 border border-gray-200 rounded overflow-hidden relative">
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center">
                <Grid3X3 className="w-12 h-12 text-blue-600 mb-2" />
                <div className="text-blue-600 text-sm font-medium truncate px-2">
                  {title || 'Quiz'}
                </div>
                {slide.metadata && slide.metadata.question_count && (
                  <div className="text-xs text-blue-500 mt-1">
                    {slide.metadata.question_count} questions
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 'audio':
        return (
          <div className="w-full h-full bg-purple-50 border border-gray-200 rounded overflow-hidden relative">
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center">
                <Music className="w-12 h-12 text-purple-600 mb-2" />
                <div className="text-purple-600 text-sm font-medium truncate px-2">
                  {title || 'Audio'}
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="w-full h-full bg-gray-100 border border-gray-200 rounded overflow-hidden relative">
            <div className="w-full h-full flex items-center justify-center">
              <FileText className="w-12 h-12 text-gray-400" />
            </div>
          </div>
        );
    }
  };

  return (
    <div
      className={`${getSizeClasses(size)} ${onClick ? 'cursor-pointer hover:shadow-lg transition-shadow' : ''} ${className}`}
      onClick={onClick}
    >
      {/* Main slide thumbnail */}
      <div className="w-full h-full relative">
        {renderSlideThumbnail(mainSlide)}

        {/* Slide count overlay */}
        <div className="absolute top-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
          {presentation.slides.length} slides
        </div>

        {/* Quiz indicator */}
        {presentation.slides.some(slide => slide.content_type === 'quiz') && (
          <div className="absolute bottom-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
            <Grid3X3 className="w-3 h-3" />
            Quiz
          </div>
        )}
      </div>

      {/* Presentation info */}
      {showInfo && (
        <div className="p-3 bg-white border-t border-gray-200">
          <div className="text-sm font-medium text-gray-900 truncate mb-1">
            {presentation.title || 'Untitled Presentation'}
          </div>
          <div className="text-xs text-gray-500 flex items-center gap-2">
            <span>{presentation.slides.length} slides</span>
            {presentation.estimated_duration && (
              <>
                <span>•</span>
                <span>{presentation.estimated_duration}min</span>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PresentationThumbnail;