// src/components/course/PresentationViewer.jsx
import { useState, useEffect, useRef, useCallback } from 'react';
import { useToast, Button, Card, ContentTypeIcon } from '@/components/ui';
import LessonCurationForm from './LessonCurationForm';
import QuizSlide from './QuizSlide';
import { useCourseStore } from '@/store/courseStore';
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
  Settings,
  Edit3,
  Grid3X3,
  ArrowUp
} from 'lucide-react';

// Content type icons are now handled by ContentTypeIcon component

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
  onMarkComplete,
  onPreviousLesson,
  onNextLesson,
  hasPreviousLesson = false,
  hasNextLesson = true
}) {
  const { success, error: showError } = useToast();
  const actions = useCourseStore(state => state.actions);

  // Add custom scrollbar styles
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .custom-scrollbar::-webkit-scrollbar {
        height: 4px;
      }
      .custom-scrollbar::-webkit-scrollbar-track {
        background: transparent;
      }
      .custom-scrollbar::-webkit-scrollbar-thumb {
        background: #e5e7eb;
        border-radius: 2px;
      }
      .custom-scrollbar::-webkit-scrollbar-thumb:hover {
        background: #d1d5db;
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);
  
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [completedSlides, setCompletedSlides] = useState(new Set());
  const [slideStartTime, setSlideStartTime] = useState(null);
  const [slideProgress, setSlideProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [touchStartX, setTouchStartX] = useState(null);
  const [touchEndX, setTouchEndX] = useState(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showScrollToTop, setShowScrollToTop] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Quiz-related state
  const [quizData, setQuizData] = useState({});
  const [quizQuestions, setQuizQuestions] = useState({});
  const [quizLoading, setQuizLoading] = useState({});
  const [quizResults, setQuizResults] = useState({}); // Store quiz completion results
  const [quizAttempts, setQuizAttempts] = useState({}); // Track attempts per slide
  
  const progressIntervalRef = useRef(null);
  const slideTimeoutRef = useRef(null);

  const currentSlide = presentation?.slides?.[currentSlideIndex];
  const totalSlides = presentation?.slides?.length || 0;
  const progress = totalSlides > 0 ? ((currentSlideIndex + 1) / totalSlides) * 100 : 0;

  // Function to fetch quiz data for a quiz slide
  const fetchQuizData = useCallback(async (slide) => {
    if (slide.content_type !== 'quiz' || !slide.metadata?.quiz_id) return;
    
    const slideId = slide.id;
    const quizId = slide.metadata.quiz_id;
    
    // Avoid refetching if already loaded
    if (quizData[slideId] || quizLoading[slideId]) return;
    
    try {
      setQuizLoading(prev => ({ ...prev, [slideId]: true }));
      
      // Fetch quiz data and questions
      const [quizResult, questionsResult] = await Promise.all([
        actions.fetchQuiz(quizId),
        actions.fetchQuizQuestions(quizId)
      ]);
      
      if (quizResult.data) {
        setQuizData(prev => ({ ...prev, [slideId]: quizResult.data }));
      }
      
      if (questionsResult.data) {
        setQuizQuestions(prev => ({ ...prev, [slideId]: questionsResult.data }));
      }
    } catch (error) {
      showError(`Failed to load quiz: ${error.message}`);
    } finally {
      setQuizLoading(prev => ({ ...prev, [slideId]: false }));
    }
  }, [actions, quizData, quizLoading, showError]);
  // Fetch quiz data when current slide is a quiz
  useEffect(() => {
    if (currentSlide?.content_type === 'quiz') {
      fetchQuizData(currentSlide);
    }
  }, [currentSlide, fetchQuizData]);

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

  const handleEditSuccess = (updatedPresentation) => {
    setShowEditForm(false);
    success('Presentation updated successfully!');
    // The presentation data will be updated by the parent component
  };

  const handleEditCancel = () => {
    setShowEditForm(false);
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // Scroll to top button visibility
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const shouldShow = scrollTop > 100; // Reduced threshold for easier testing
      setShowScrollToTop(shouldShow);
    };

    // Check initial scroll position
    handleScroll();

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
    return <ContentTypeIcon type={contentType} size={16} className="w-4 h-4" />;
  };

  // Standardized 16:9 content container
  const ContentContainer = ({ children, className = "" }) => (
    <div className={`w-full aspect-video bg-gray-50 rounded-lg overflow-hidden ${className}`}>
      <div className="w-full h-full flex items-center justify-center p-4">
        {children}
      </div>
    </div>
  );

  // Function to render slide thumbnail preview
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
            <div className="flex-1 p-1 text-xs text-gray-700 overflow-hidden">
              <div className="line-clamp-3 leading-tight">
                {content_text ? content_text.substring(0, 50) + (content_text.length > 50 ? '...' : '') : 'Text content'}
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
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100" style={{ display: content_url ? 'none' : 'flex' ,overflowY: 'hidden'}}>
              <Image className="w-4 h-4 text-gray-400" style={{ overflowY: 'hidden'}}/>
            </div>
            {/* {title && (
              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs px-1 py-0.5 truncate">
                {title}
              </div>
            )} */}
          </div>
        );

      case 'video':
        return (
          <div className="w-full h-full bg-gray-900 border border-gray-200 rounded overflow-hidden relative">
            {content_url ? (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center">
                  <Video className="w-6 h-6 text-white mb-1" />
                  <div className="text-white text-xs truncate px-1">
                    {title || 'Video Slide'}
                  </div>
                </div>
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Video className="w-6 h-6 text-gray-400" />
              </div>
            )}
          </div>
        );

      case 'pdf':
        return (
          <div className="w-full h-full bg-red-50 border border-gray-200 rounded overflow-hidden relative">
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center">
                <File className="w-5 h-5 text-red-600 mb-1" />
                <div className="text-red-600 text-xs font-medium truncate px-1">
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
                <Grid3X3 className="w-5 h-5 text-blue-600 mb-1" />
                <div className="text-blue-600 text-xs font-medium truncate px-1">
                  {title || 'Quiz'}
                </div>
              </div>
            </div>
          </div>
        );

      case 'audio':
        return (
          <div className="w-full h-full bg-purple-50 border border-gray-200 rounded overflow-hidden relative">
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center">
                <Music className="w-5 h-5 text-purple-600 mb-1" />
                <div className="text-purple-600 text-xs font-medium truncate px-1">
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
              <FileText className="w-5 h-5 text-gray-400" />
            </div>
          </div>
        );
    }
  };

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

      case 'quiz':
        const slideId = currentSlide.id;
        const currentQuizData = quizData[slideId];
        const currentQuizQuestions = quizQuestions[slideId];
        const isLoading = quizLoading[slideId];
        
        if (isLoading) {
          return (
            <ContentContainer>
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading quiz...</p>
                </div>
              </div>
            </ContentContainer>
          );
        }
        
        if (!currentQuizData || !currentQuizQuestions) {
          return (
            <ContentContainer>
              <div className="w-full h-full flex flex-col items-center justify-center p-6">
                <div className="text-center max-w-2xl">
                  <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                    <Grid3X3 className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {currentSlide.title || 'Knowledge Check'}
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {currentSlide.content_text || 'Test your knowledge with this interactive quiz.'}
                  </p>
                  
                  {/* Quiz Information */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <div className="flex items-center justify-center gap-2 text-blue-700 mb-2">
                      <Grid3X3 className="w-5 h-5" />
                      <span className="font-medium">Quiz Assessment</span>
                    </div>
                    
                    {/* Quiz metadata display */}
                    {currentSlide.metadata && (
                      <div className="text-sm text-blue-600 space-y-1">
                        {currentSlide.metadata.question_count > 0 && (
                          <p><strong>{currentSlide.metadata.question_count}</strong> questions</p>
                        )}
                        {currentSlide.metadata.pass_threshold && (
                          <p>Pass threshold: <strong>{currentSlide.metadata.pass_threshold}%</strong></p>
                        )}
                        {currentSlide.metadata.time_limit_minutes && (
                          <p>Time limit: <strong>{currentSlide.metadata.time_limit_minutes} minutes</strong></p>
                        )}
                      </div>
                    )}
                    
                    <p className="text-sm text-blue-600 mt-2">
                      Quiz data not available.
                    </p>
                  </div>
                </div>
              </div>
            </ContentContainer>
          );
        }
        
        return (
          <ContentContainer>
            <div className="w-full h-full overflow-auto p-4">
              <QuizSlide
                quiz={currentQuizData}
                questions={currentQuizQuestions}
                timeLimitMinutes={currentQuizData.time_limit_minutes}
                maxAttempts={currentQuizData.max_attempts || 3}
                currentAttempt={quizAttempts[slideId] || 1}
                storedResult={quizResults[slideId]}
                onQuizComplete={(result) => {
                  const slideId = currentSlide.id;
                  
                  // Store quiz result
                  setQuizResults(prev => ({
                    ...prev,
                    [slideId]: result
                  }));
                  
                  // Increment attempt count
                  setQuizAttempts(prev => ({
                    ...prev,
                    [slideId]: (prev[slideId] || 0) + 1
                  }));
                  
                  markSlideComplete(currentSlideIndex);
                  success(`Quiz completed! Score: ${result.score}/${result.maxScore} (${result.percentage}%)`);
                  
                  // Auto-advance to next slide after a short delay
                  setTimeout(() => {
                    if (currentSlideIndex < totalSlides - 1) {
                      handleNextSlide();
                    } else {
                      // If this is the last slide, complete the presentation
                      handlePresentationComplete();
                    }
                  }, 2000);
                }}
                onQuizRetake={() => {
                  const slideId = currentSlide.id;
                  
                  // Clear stored quiz result for this slide
                  setQuizResults(prev => {
                    const newResults = { ...prev };
                    delete newResults[slideId];
                    return newResults;
                  });
                  
                  // Reset completion status
                  setCompletedSlides(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(currentSlideIndex);
                    return newSet;
                  });
                  
                  console.log('🎯 PresentationViewer: Quiz retake - cleared stored result for slide:', slideId);
                }}
              />
            </div>
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
      {/* Presentation Info */}
      <Card className="p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-text-dark mb-2">
              {lesson?.title || presentation.title}
            </h1>
            {presentation.description && (
              <p className="text-text-medium mb-3">{presentation.description}</p>
            )}
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
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="secondary" 
              size="sm"
              onClick={() => setShowEditForm(true)}
              className="flex items-center gap-2"
            >
              <Edit3 className="w-4 h-4" />
              Edit
            </Button>
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
      </Card>

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

        {/* Slide Navigation */}
        <div className="flex items-center justify-center mt-6 pt-6 border-t border-gray-200">
          <div className="flex items-center gap-4 w-full max-w-6xl">
            {/* Previous Slide Arrow */}
            <button
              onClick={handlePrevSlide}
              disabled={currentSlideIndex === 0}
              className={`flex items-center justify-center w-10 h-10 rounded-full transition-all duration-200 flex-shrink-0 ${
                currentSlideIndex === 0
                  ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                  : 'bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-800 shadow-md hover:shadow-lg'
              }`}
              title="Previous Slide"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {/* Slide Thumbnails */}
            <div 
              className="flex items-center gap-3 w-4/5 overflow-x-auto px-2 custom-scrollbar" 
              style={{
                scrollbarWidth: 'thin', 
                scrollbarColor: '#e5e7eb transparent'
              }}
            >
              {presentation.slides.map((slide, index) => {
                const isActive = index === currentSlideIndex;
                const isCompleted = completedSlides.has(index);
                
                return (
                  <button
                    key={slide.id}
                    onClick={() => handleSlideClick(index)}
                    className={`relative flex-shrink-0 transition-all duration-200 hover:scale-110 ${
                      isActive 
                        ? 'ring-2 ring-primary-default ring-offset-2' 
                        : isCompleted
                        ? 'ring-2 ring-green-500 ring-offset-2'
                        : 'hover:ring-2 hover:ring-gray-300 hover:ring-offset-2'
                    }`}
                    title={`Slide ${index + 1}: ${slide.title || slide.content_type}${slide.content_type === 'quiz' ? ' (Quiz)' : ''}`}
                  >
                    <div className="w-20 h-14 rounded-lg overflow-hidden shadow-sm">
                      {renderSlideThumbnail(slide)}
                    </div>
                    
                    {/* Completion indicator */}
                    {isCompleted && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-3 h-3 text-white" />
                      </div>
                    )}
                    
                    {/* Active indicator */}
                    {isActive && (
                      <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-primary-default rounded-full"></div>
                    )}
                    
                    {/* Slide number */}
                    <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-gray-500 font-medium">
                      {index + 1}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Next Slide Arrow */}
            <button
              onClick={handleNextSlide}
              disabled={currentSlideIndex === totalSlides - 1}
              className={`flex items-center justify-center w-10 h-10 rounded-full transition-all duration-200 flex-shrink-0 ${
                currentSlideIndex === totalSlides - 1
                  ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                  : 'bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-800 shadow-md hover:shadow-lg'
              }`}
              title="Next Slide"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Lesson Navigation */}
        <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200">
          <Button
            variant="outline"
            onClick={onPreviousLesson}
            disabled={!hasPreviousLesson || !onPreviousLesson}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Previous Lesson
          </Button>

          <div className="text-sm text-gray-500">
            Use slide thumbnails above to navigate within this presentation
          </div>

          <Button
            onClick={onNextLesson}
            disabled={!hasNextLesson || !onNextLesson}
          >
            {hasNextLesson ? 'Next Lesson' : 'Complete Course'}
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </Card>

      {/* Edit Presentation Modal */}
      {showEditForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <LessonCurationForm
              presentation={presentation}
              lessonId={lesson?.id}
              onSuccess={handleEditSuccess}
              onCancel={handleEditCancel}
            />
          </div>
        </div>
      )}

      {/* Scroll to Top Button */}
      {showScrollToTop && (
        <Button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-[9999] bg-primary-default hover:bg-primary-dark text-white rounded-full p-3 shadow-2xl transition-all duration-300 hover:scale-105 border-2 border-white"
          size="sm"
        >
          <ArrowUp className="w-5 h-5" />
        </Button>
      )}
    </div>
  );
}
