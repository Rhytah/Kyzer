// src/components/ui/ContentTypeIcon.jsx
import React from 'react';
import { 
  FileText, 
  Image, 
  Video, 
  File, 
  Music, 
  Grid3X3,
  FileType,
  HelpCircle
} from 'lucide-react';

const ContentTypeIcon = ({ 
  type, 
  size = 16, 
  className = '',
  showLabel = false 
}) => {
  const iconMap = {
    text: FileText,
    image: Image,
    video: Video,
    audio: Music,
    pdf: File,
    document: File,
    quiz: Grid3X3,
    // Legacy mappings
    'image/jpeg': Image,
    'image/png': Image,
    'image/gif': Image,
    'image/webp': Image,
    'image/svg': Image,
    'video/mp4': Video,
    'video/webm': Video,
    'video/ogg': Video,
    'audio/mp3': Music,
    'audio/wav': Music,
    'audio/ogg': Music,
    'application/pdf': FileType,
    'application/msword': File,
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': File,
    'application/vnd.ms-powerpoint': File,
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': File,
    'text/plain': FileText,
    'text/html': FileText,
    'text/markdown': FileText
  };

  const IconComponent = iconMap[type] || HelpCircle;
  const label = type?.charAt(0).toUpperCase() + type?.slice(1) || 'Unknown';

  if (showLabel) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <IconComponent size={size} />
        <span className="text-sm font-medium">{label}</span>
      </div>
    );
  }

  return <IconComponent size={size} className={className} />;
};

export default ContentTypeIcon;
