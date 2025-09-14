// src/components/course/PresentationViewer.jsx
import { useState, useEffect, useRef, useCallback } from 'react';
import { useToast, Button, Card } from '@/components/ui';
import {
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  RotateCcw,
  Maximize2,
  Minimize2,
  Clock,
  CheckCircle,
  Circle,
  FileText,
  Image,
  Video,
  File,
  Music,
  BookOpen,
  Settings
} from 'lucide-react';

const CONTENT_TYPE_ICONS = {
  text: FileText,
  image: Image,
  video: Video,
  pdf: File,
  audio: Music,
  document: File
};

// Utility functions for external video platforms
const isYouTubeUrl = (url) => {
  const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
  return youtubeRegex.test(url);
};

const isVimeoUrl = (url) => {
  const vimeoRegex = /^(https?:\/\/)?(www\.)?vimeo\.com\/.+/;
  return vimeoRegex.test(url);
};

const isTikTokUrl = (url) => {
  const tiktokRegex = /^(https?:\/\/)?(www\.)?tiktok\.com\/@.+\/video\/.+/;
  return tiktokRegex.test(url);
};

const isInstagramUrl = (url) => {
  const instagramRegex = /^(https?:\/\/)?(www\.)?instagram\.com\/(p|tv|reel)\/.+/;
  return instagramRegex.test(url);
};

const isTwitterUrl = (url) => {
  const twitterRegex = /^(https?:\/\/)?(www\.)?(twitter\.com|x\.com)\/.+\/status\/.+/;
  return twitterRegex.test(url);
};

const getYouTubeEmbedUrl = (url) => {
  let videoId = '';
  
  if (url.includes('youtu.be/')) {
    videoId = url.split('youtu.be/')[1].split('?')[0];
  } else if (url.includes('youtube.com/watch')) {
    const urlParams = new URLSearchParams(url.split('?')[1]);
    videoId = urlParams.get('v');
  } else if (url.includes('youtube.com/embed/')) {
    return url; // Already an embed URL
  }
  
  return `https://www.youtube.com/embed/${videoId}`;
};

const getVimeoEmbedUrl = (url) => {
  let videoId = '';
  
  if (url.includes('vimeo.com/')) {
    const match = url.match(/vimeo\.com\/(\d+)/);
    if (match) {
      videoId = match[1];
    }
  }
  
  return `https://player.vimeo.com/video/${videoId}`;
};

const getTikTokEmbedUrl = (url) => {
  // TikTok doesn't have direct embed support, return null to show as link
  return null;
};

const getInstagramEmbedUrl = (url) => {
  // Instagram requires authentication for embeds, return null to show as link
  return null;
};

const getTwitterEmbedUrl = (url) => {
  // Twitter/X embeds require special handling, return null to show as link
  return null;
};

const getExternalVideoEmbedUrl = (url) => {
  if (isYouTubeUrl(url)) {
    return getYouTubeEmbedUrl(url);
  } else if (isVimeoUrl(url)) {
    return getVimeoEmbedUrl(url);
  } else if (isTikTokUrl(url)) {
    return getTikTokEmbedUrl(url);
  } else if (isInstagramUrl(url)) {
    return getInstagramEmbedUrl(url);
  } else if (isTwitterUrl(url)) {
    return getTwitterEmbedUrl(url);
  }
  return null;
};

const getExternalVideoPlatform = (url) => {
  if (isYouTubeUrl(url)) return 'YouTube';
  if (isVimeoUrl(url)) return 'Vimeo';
  if (isTikTokUrl(url)) return 'TikTok';
  if (isInstagramUrl(url)) return 'Instagram';
  if (isTwitterUrl(url)) return 'Twitter/X';
  return null;
};

export default function PresentationViewer({ 
  presentation, 
  lesson,
  onSlideComplete, 
  onPresentationComplete,
  externalFullscreen = false,
  onToggleFullscreen,
  isCompleted = false,
  onMarkComplete
}) {
  const { success, error: showError } = useToast();
  
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [completedSlides, setCompletedSlides] = useState(new Set());
  const [slideStartTime, setSlideStartTime] = useState(null);
  const [slideProgress, setSlideProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [touchStartX, setTouchStartX] = useState(null);
  const [touchEndX, setTouchEndX] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const progressIntervalRef = useRef(null);
  const slideTimeoutRef = useRef(null);

  const currentSlide = presentation?.slides?.[currentSlideIndex];
  const totalSlides = presentation?.slides?.length || 0;
  const progress = totalSlides > 0 ? ((currentSlideIndex + 1) / totalSlides) * 100 : 0;


  const markSlideComplete = (slideIndex) => {
    if (!completedSlides.has(slideIndex)) {
      setCompletedSlides(prev => new Set([...prev, slideIndex]));
      onSlideComplete?.(slideIndex);
    }
  };

  const handlePresentationComplete = () => {
    setIsPlaying(false);
    onPresentationComplete?.();
    success('Presentation completed!');
  };

  const handleNextSlide = useCallback(() => {
    if (currentSlideIndex < totalSlides - 1) {
      markSlideComplete(currentSlideIndex);
      setCurrentSlideIndex(prev => prev + 1);
      setSlideProgress(0);
    } else {
      // Last slide
      markSlideComplete(currentSlideIndex);
      handlePresentationComplete();
    }
  }, [currentSlideIndex, totalSlides, completedSlides, onSlideComplete, onPresentationComplete, success]);

  const handlePrevSlide = useCallback(() => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex(prev => prev - 1);
      setSlideProgress(0);
    }
  }, [currentSlideIndex]);

  const handleSlideClick = (index) => {
    setCurrentSlideIndex(index);
    setSlideProgress(0);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(prev => !prev);
  };

  // Keyboard navigation
  const handleKeyDown = useCallback((event) => {
    switch (event.key) {
      case 'ArrowLeft':
      case 'ArrowUp':
        event.preventDefault();
        handlePrevSlide();
        break;
      case 'ArrowRight':
      case 'ArrowDown':
      case ' ':
        event.preventDefault();
        handleNextSlide();
        break;
      case 'Home':
        event.preventDefault();
        setCurrentSlideIndex(0);
        setSlideProgress(0);
        break;
      case 'End':
        event.preventDefault();
        setCurrentSlideIndex(totalSlides - 1);
        setSlideProgress(0);
        break;
      case 'Escape':
        event.preventDefault();
        if (isFullscreen) {
          setIsFullscreen(false);
        } else {
          setIsPlaying(false);
        }
        break;
      case 'F11':
        event.preventDefault();
        toggleFullscreen();
        break;
    }
  }, [handlePrevSlide, handleNextSlide, totalSlides, isFullscreen, toggleFullscreen]);

  // Touch navigation
  const handleTouchStart = useCallback((event) => {
    setTouchEndX(null);
    setTouchStartX(event.targetTouches[0].clientX);
  }, []);

  const handleTouchMove = useCallback((event) => {
    setTouchEndX(event.targetTouches[0].clientX);
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (!touchStartX || !touchEndX) return;
    
    const distance = touchStartX - touchEndX;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      handleNextSlide();
    } else if (isRightSwipe) {
      handlePrevSlide();
    }
  }, [touchStartX, touchEndX, handleNextSlide, handlePrevSlide]);

  // Set up keyboard navigation
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  const togglePlayPause = () => {
    setIsPlaying(prev => !prev);
  };

  const resetPresentation = () => {
    setCurrentSlideIndex(0);
    setCompletedSlides(new Set());
    setSlideProgress(0);
    setIsPlaying(false);
  };

  // Auto-play effect - must be after handleNextSlide is defined
  useEffect(() => {
    if (isPlaying && currentSlide?.duration_seconds) {
      const startTime = Date.now();
      setSlideStartTime(startTime);
      setSlideProgress(0);
      
      // Auto-advance slide after duration
      slideTimeoutRef.current = setTimeout(() => {
        handleNextSlide();
      }, currentSlide.duration_seconds * 1000);
      
      // Update progress every second
      progressIntervalRef.current = setInterval(() => {
        const elapsed = (Date.now() - startTime) / 1000;
        const progress = Math.min((elapsed / currentSlide.duration_seconds) * 100, 100);
        setSlideProgress(progress);
      }, 1000);
    }

    return () => {
      if (slideTimeoutRef.current) {
        clearTimeout(slideTimeoutRef.current);
      }
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [isPlaying, currentSlide?.duration_seconds, handleNextSlide]);

  const getContentTypeIcon = (contentType) => {
    const IconComponent = CONTENT_TYPE_ICONS[contentType] || FileText;
    return <IconComponent className="w-4 h-4" />;
  };

  // Standardized 16:9 content container
  const ContentContainer = ({ children, className = "" }) => (
    <div className={`w-full aspect-video bg-gray-50 rounded-lg overflow-hidden ${className}`}>
      <div className="w-full h-full flex items-center justify-center p-4">
        {children}
      </div>
    </div>
  );

  const renderSlideContent = () => {
    if (!currentSlide) return null;

    const { content_type, content_url, content_text, content_format } = currentSlide;

    switch (content_type) {
      case 'text':
        return (
          <ContentContainer>
            <div className="prose max-w-none w-full h-full overflow-y-auto">
              {content_format === 'html' ? (
                <div dangerouslySetInnerHTML={{ __html: content_text }} />
              ) : content_format === 'markdown' ? (
                <div className="whitespace-pre-wrap">{content_text}</div>
              ) : (
                <div className="whitespace-pre-wrap">{content_text}</div>
              )}
            </div>
          </ContentContainer>
        );

      case 'image':
        return (
          <ContentContainer>
            <img
              src={content_url}
              alt={currentSlide.title}
              className="max-w-full max-h-full object-contain rounded-sm shadow-lg"
              onLoad={() => setIsLoading(false)}
              onError={() => {
                setIsLoading(false);
                showError('Failed to load image');
              }}
            />
          </ContentContainer>
        );

      case 'video':
        // Check if it's an external video platform
        const embedUrl = getExternalVideoEmbedUrl(content_url);
        const platform = getExternalVideoPlatform(content_url);
        
        if (embedUrl) {
          // Render external video as iframe embed (YouTube, Vimeo)
          return (
            <div className="w-full">
              <div className="w-full aspect-video bg-gray-50 rounded-lg overflow-hidden">
                <iframe
                  src={embedUrl}
                  title={currentSlide.title}
                  className="w-full h-full rounded-sm border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  onLoad={() => setIsLoading(false)}
                  onError={() => {
                    setIsLoading(false);
                    showError('Failed to load external video');
                  }}
                />
              </div>
              <div className="mt-2 text-xs text-text-light text-center">
                {platform} Video
              </div>
            </div>
          );
        } else if (platform) {
          // Render external video as clickable link (TikTok, Instagram, Twitter)
          return (
            <ContentContainer>
              <div className="flex flex-col items-center justify-center w-full h-full">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mb-4">
                  <Video className="w-8 h-8 text-primary-default" />
                </div>
                <h3 className="text-lg font-semibold text-text-dark mb-2 text-center">
                  {platform} Video
                </h3>
                <p className="text-text-dark mb-4 text-center text-sm">
                  This {platform} video cannot be embedded directly. Click the link below to view it on {platform}.
                </p>
                <Button
                  onClick={() => window.open(content_url, '_blank', 'noopener,noreferrer')}
                >
                  <Video className="w-4 h-4 mr-2" />
                  Watch on {platform}
                </Button>
                <div className="mt-3 text-xs text-text-light text-center max-w-md">
                  <a 
                    href={content_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary-default hover:text-primary-dark break-all"
                  >
                    {content_url}
                  </a>
                </div>
              </div>
            </ContentContainer>
          );
        } else {
          // Render as regular HTML5 video
          return (
            <ContentContainer>
              <video
                src={content_url}
                controls
                className="w-full h-full rounded-sm shadow-lg"
                onLoadStart={() => setIsLoading(true)}
                onCanPlay={() => setIsLoading(false)}
                onError={() => {
                  setIsLoading(false);
                  showError('Failed to load video');
                }}
              />
            </ContentContainer>
          );
        }

      case 'pdf':
        return (
          <ContentContainer>
            <iframe
              src={`${content_url}#toolbar=1&navpanes=1&scrollbar=1&view=FitH`}
              className="w-full h-full rounded-sm shadow-lg"
              title={currentSlide.title}
              onLoad={() => setIsLoading(false)}
              onError={() => {
                setIsLoading(false);
                showError('Failed to load PDF');
              }}
            />
          </ContentContainer>
        );

      case 'audio':
        return (
          <ContentContainer>
            <audio
              src={content_url}
              controls
              className="w-full max-w-md"
              onLoadStart={() => setIsLoading(true)}
              onCanPlay={() => setIsLoading(false)}
              onError={() => {
                setIsLoading(false);
                showError('Failed to load audio');
              }}
            />
          </ContentContainer>
        );

      case 'document':
        return (
          <ContentContainer>
            <iframe
              src={`${content_url}#toolbar=1&navpanes=1&scrollbar=1&view=FitH`}
              className="w-full h-full rounded-sm shadow-lg"
              title={currentSlide.title}
              onLoad={() => setIsLoading(false)}
              onError={() => {
                setIsLoading(false);
                showError('Failed to load document');
              }}
            />
          </ContentContainer>
        );

      default:
        return (
          <ContentContainer>
            <div className="text-center text-text-medium">
              <FileText className="w-12 h-12 mx-auto mb-3 text-text-light" />
              <p>Unsupported content type: {content_type}</p>
            </div>
          </ContentContainer>
        );
    }
  };

  if (!presentation || !currentSlide) {
    return (
      <Card className="p-8">
        <div className="text-center text-text-medium">
          <FileText className="w-12 h-12 mx-auto mb-3 text-text-light" />
          <p>No presentation content available</p>
        </div>
      </Card>
    );
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const isInFullscreen = isFullscreen || externalFullscreen;

  return (
    <div className={`space-y-6 ${isInFullscreen ? 'fixed inset-0 z-50 bg-white p-6 overflow-auto' : ''}`}>
      {/* Fullscreen indicator */}
      {isFullscreen && (
        <div className="fixed top-4 right-4 z-60 bg-black bg-opacity-75 text-white px-3 py-1 rounded text-sm">
          Press F11 or Esc to exit fullscreen
        </div>
      )}
      {/* Lesson Info - Matching LessonView pattern */}
      {/* <Card className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-text-dark mb-2">
              {lesson?.title || presentation.title}
            </h1>
            {presentation.description && (
              <p className="text-text-medium">{presentation.description}</p>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {!isCompleted ? (
              <Button onClick={onMarkComplete}>
                <CheckCircle className="w-4 h-4 mr-2" />
                Mark Complete
              </Button>
            ) : (
              <div className="flex items-center gap-2 text-success-default">
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">Completed</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-6 text-sm text-text-muted">
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            <span>Presentation</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span>{presentation.estimated_duration ? `${presentation.estimated_duration} min` : formatTime(totalSlides * 30)}</span>
          </div>
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            <span>{totalSlides} slides</span>
          </div>
        </div>
      </Card> */}

      {/* Presentation Content */}
      <Card className="p-6">
        {/* Presentation Controls */}
        <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <h3 className="text-2xl font-semibold text-text-dark">
                {currentSlide.title}
              </h3>
              <h2 className="text-sm font-semibold text-text-dark">
                Slide {currentSlideIndex + 1} of {totalSlides}
              </h2>
             
              <div className="flex items-center gap-2 text-sm text-text-light">
                {getContentTypeIcon(currentSlide.content_type)}
                <span className="capitalize">{currentSlide.content_type}</span>
              </div>
            {/* <div className="hidden md:flex items-center gap-4 text-xs text-text-muted">
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-xs">←</kbd>
                <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-xs">→</kbd>
                Navigate
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-xs">Space</kbd>
                Next
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-xs">F11</kbd>
                {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
              </span>
              <span className="text-xs">or swipe on mobile</span>
            </div> */}
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={togglePlayPause}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={resetPresentation}
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={toggleFullscreen}
              title={isFullscreen ? 'Exit fullscreen (F11 or Esc)' : 'Enter fullscreen (F11)'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </Button>
            
            {onToggleFullscreen && (
              <Button
                variant="outline"
                size="sm"
                onClick={onToggleFullscreen}
                title="External fullscreen toggle"
              >
                {externalFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </Button>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 h-2 rounded-full mb-6">
          <div 
            className="bg-primary-default h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Slide Content */}
        <div className="relative min-h-96">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-10">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-default"></div>
            </div>
          )}
          
          <div className="mb-6">
            {/* <h3 className="text-2xl font-semibold text-text-dark mb-4">
              {currentSlide.title}
            </h3> */}
            {/* {currentSlide.duration_seconds && (
              <div className="flex items-center gap-2 text-sm text-text-muted mb-4">
                <Clock className="w-4 h-4" />
                <span>Duration: {currentSlide.duration_seconds}s</span>
                {isPlaying && (
                  <div className="flex-1 bg-gray-200 rounded-full h-2 ml-2 max-w-xs">
                    <div 
                      className="bg-primary-default h-2 rounded-full transition-all duration-1000"
                      style={{ width: `${slideProgress}%` }}
                    />
                  </div>
                )}
              </div>
            )} */}
          </div>

          <div 
            className={`bg-gray-50 p-4 touch-none select-none ${
              isInFullscreen ? 'min-h-[70vh] flex items-center justify-center' : 'min-h-64'
            }`}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
          >
            {renderSlideContent()}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200">
          <Button
            variant="outline"
            onClick={handlePrevSlide}
            disabled={currentSlideIndex === 0}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>

          {/* Slide Thumbnails */}
          <div className="flex items-center gap-2 max-w-md overflow-x-auto">
            {presentation.slides.map((slide, index) => (
              <button
                key={slide.id}
                onClick={() => handleSlideClick(index)}
                className={`w-8 h-8 rounded flex items-center justify-center text-xs transition-colors flex-shrink-0 ${
                  index === currentSlideIndex
                    ? 'bg-primary-default text-white'
                    : completedSlides.has(index)
                    ? 'bg-green-100 text-green-600'
                    : 'bg-gray-200 text-text-light hover:bg-gray-300'
                }`}
              >
                {completedSlides.has(index) ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <span className="font-medium text-text-medium">{index + 1}</span>
                )}
              </button>
            ))}
          </div>

          <Button
            onClick={handleNextSlide}
            disabled={currentSlideIndex === totalSlides - 1}
          >
            {currentSlideIndex === totalSlides - 1 ? 'Complete' : 'Next'}
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </Card>
    </div>
  );
}
