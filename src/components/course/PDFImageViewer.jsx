import React, { useState, useCallback, useRef, useEffect } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  ZoomIn, 
  ZoomOut, 
  RotateCw, 
  Grid3X3,
  Layout,
  Columns,
  Rows,
  Fullscreen,
  Download,
  Share
} from 'lucide-react';

// Individual image component
const ImagePage = ({ 
  image, 
  isActive, 
  onSelect, 
  zoom, 
  rotation,
  className = '' 
}) => {
  return (
    <div
      className={`
        relative cursor-pointer transition-all duration-200
        ${isActive ? 'ring-2 ring-blue-500' : 'hover:ring-2 hover:ring-gray-300'}
        ${className}
      `}
      onClick={() => onSelect(image)}
      style={{
        transform: `rotate(${rotation}deg) scale(${zoom})`
      }}
    >
      <img
        src={image.imageUrl}
        alt={`Page ${image.pageNumber}`}
        className="w-full h-full object-contain bg-white rounded-lg shadow-sm"
        draggable={false}
      />
      
      {/* Page number overlay */}
      <div className="absolute top-2 left-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
        Page {image.pageNumber}
      </div>
    </div>
  );
};

// Slideshow viewer
const SlideshowViewer = ({ images, currentIndex, onIndexChange, settings }) => {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [autoAdvance, setAutoAdvance] = useState(settings?.autoAdvance || 0);
  const [showControls, setShowControls] = useState(settings?.showNavigation !== false);
  const intervalRef = useRef(null);

  const currentImage = images[currentIndex];

  // Auto-advance functionality
  useEffect(() => {
    if (autoAdvance > 0 && images.length > 1) {
      intervalRef.current = setInterval(() => {
        onIndexChange((currentIndex + 1) % images.length);
      }, autoAdvance * 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [autoAdvance, currentIndex, images.length, onIndexChange]);

  const handleZoom = useCallback((direction) => {
    setZoom(prev => {
      const newZoom = direction === 'in' ? prev * 1.2 : prev / 1.2;
      return Math.max(0.5, Math.min(3, newZoom));
    });
  }, []);

  const handleRotate = useCallback(() => {
    setRotation(prev => (prev + 90) % 360);
  }, []);

  const handlePrevious = useCallback(() => {
    onIndexChange(currentIndex > 0 ? currentIndex - 1 : images.length - 1);
  }, [currentIndex, images.length, onIndexChange]);

  const handleNext = useCallback(() => {
    onIndexChange(currentIndex < images.length - 1 ? currentIndex + 1 : 0);
  }, [currentIndex, images.length, onIndexChange]);

  if (!currentImage) return null;

  return (
    <div className="relative w-full h-full bg-gray-100 flex items-center justify-center">
      {/* Main image */}
      <div className="relative max-w-full max-h-full">
        <ImagePage
          image={currentImage}
          isActive={true}
          onSelect={() => {}}
          zoom={zoom}
          rotation={rotation}
          className="w-full h-full"
        />
      </div>

      {/* Navigation controls */}
      {showControls && (
        <>
          <button
            onClick={handlePrevious}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-all"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-all"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      {/* Toolbar */}
      <div className="absolute top-4 right-4 flex gap-2">
        <button
          onClick={() => handleZoom('out')}
          className="p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-all"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={() => handleZoom('in')}
          className="p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-all"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={handleRotate}
          className="p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-all"
          title="Rotate"
        >
          <RotateCw className="w-4 h-4" />
        </button>
      </div>

      {/* Smart Pagination */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
        <div className="flex items-center gap-1 bg-black bg-opacity-75 backdrop-blur-sm rounded-full px-3 py-2 text-white">
          {/* Previous button */}
          <button
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            className="flex items-center gap-1 px-2 py-1 rounded-md text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white hover:bg-opacity-20"
          >
            <ChevronLeft className="w-3 h-3" />
            <span className="hidden sm:inline">Prev</span>
          </button>

          {/* Page numbers */}
          <div className="flex items-center gap-1 mx-2">
            {(() => {
              const totalPages = images.length;
              const currentPage = currentIndex + 1;
              const maxVisible = 5;
              const pages = [];

              if (totalPages <= maxVisible) {
                // Show all pages if total is small
                for (let i = 1; i <= totalPages; i++) {
                  pages.push(
                    <button
                      key={i}
                      onClick={() => onIndexChange(i - 1)}
                      className={`w-8 h-8 rounded-md text-sm font-medium transition-colors ${
                        i === currentPage
                          ? 'bg-blue-500 text-white'
                          : 'hover:bg-white hover:bg-opacity-20'
                      }`}
                    >
                      {i}
                    </button>
                  );
                }
              } else {
                // Smart pagination for large page counts
                const showEllipsis = totalPages > maxVisible + 2;
                
                // Always show first page
                pages.push(
                  <button
                    key={1}
                    onClick={() => onIndexChange(0)}
                    className={`w-8 h-8 rounded-md text-sm font-medium transition-colors ${
                      1 === currentPage
                        ? 'bg-blue-500 text-white'
                        : 'hover:bg-white hover:bg-opacity-20'
                    }`}
                  >
                    1
                  </button>
                );

                if (currentPage > 3) {
                  pages.push(<span key="ellipsis1" className="px-1">...</span>);
                }

                // Show pages around current page
                const start = Math.max(2, currentPage - 1);
                const end = Math.min(totalPages - 1, currentPage + 1);
                
                for (let i = start; i <= end; i++) {
                  if (i !== 1 && i !== totalPages) {
                    pages.push(
                      <button
                        key={i}
                        onClick={() => onIndexChange(i - 1)}
                        className={`w-8 h-8 rounded-md text-sm font-medium transition-colors ${
                          i === currentPage
                            ? 'bg-blue-500 text-white'
                            : 'hover:bg-white hover:bg-opacity-20'
                        }`}
                      >
                        {i}
                      </button>
                    );
                  }
                }

                if (currentPage < totalPages - 2) {
                  pages.push(<span key="ellipsis2" className="px-1">...</span>);
                }

                // Always show last page
                if (totalPages > 1) {
                  pages.push(
                    <button
                      key={totalPages}
                      onClick={() => onIndexChange(totalPages - 1)}
                      className={`w-8 h-8 rounded-md text-sm font-medium transition-colors ${
                        totalPages === currentPage
                          ? 'bg-blue-500 text-white'
                          : 'hover:bg-white hover:bg-opacity-20'
                      }`}
                    >
                      {totalPages}
                    </button>
                  );
                }
              }

              return pages;
            })()}
          </div>

          {/* Next button */}
          <button
            onClick={handleNext}
            disabled={currentIndex === images.length - 1}
            className="flex items-center gap-1 px-2 py-1 rounded-md text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white hover:bg-opacity-20"
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Auto-advance controls */}
      {autoAdvance > 0 && (
        <div className="absolute bottom-4 right-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
          Auto: {autoAdvance}s
        </div>
      )}
    </div>
  );
};

// Grid viewer
const GridViewer = ({ images, selectedIndex, onSelect, settings }) => {
  const columns = settings?.columns || 3;

  return (
    <div 
      className="grid gap-4 p-4 h-full overflow-auto"
      style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
    >
      {images.map((image, index) => (
        <ImagePage
          key={`${image.originalPageNum}-${index}`}
          image={image}
          isActive={selectedIndex === index}
          onSelect={() => onSelect(index)}
          zoom={1}
          rotation={0}
          className="aspect-[3/4]"
        />
      ))}
    </div>
  );
};

// Booklet viewer (two-page spread)
const BookletViewer = ({ images, currentIndex, onIndexChange, settings }) => {
  const currentPair = Math.floor(currentIndex / 2);
  const leftPage = images[currentPair * 2];
  const rightPage = images[currentPair * 2 + 1];

  const handlePrevious = useCallback(() => {
    const newIndex = Math.max(0, currentIndex - 2);
    onIndexChange(newIndex);
  }, [currentIndex, onIndexChange]);

  const handleNext = useCallback(() => {
    const newIndex = Math.min(images.length - 1, currentIndex + 2);
    onIndexChange(newIndex);
  }, [currentIndex, images.length, onIndexChange]);

  return (
    <div className="relative w-full h-full bg-gray-100 flex items-center justify-center">
      <div className="flex gap-4 max-w-full max-h-full">
        {/* Left page */}
        <div className="flex-1 max-w-[50%]">
          {leftPage && (
            <ImagePage
              image={leftPage}
              isActive={currentIndex === leftPage.currentOrder - 1}
              onSelect={() => onIndexChange(leftPage.currentOrder - 1)}
              zoom={1}
              rotation={0}
              className="w-full aspect-[3/4]"
            />
          )}
        </div>
        
        {/* Right page */}
        <div className="flex-1 max-w-[50%]">
          {rightPage && (
            <ImagePage
              image={rightPage}
              isActive={currentIndex === rightPage.currentOrder - 1}
              onSelect={() => onIndexChange(rightPage.currentOrder - 1)}
              zoom={1}
              rotation={0}
              className="w-full aspect-[3/4]"
            />
          )}
        </div>
      </div>

      {/* Navigation */}
      <button
        onClick={handlePrevious}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-all"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button
        onClick={handleNext}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-all"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Smart Pagination for Booklet */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
        <div className="flex items-center gap-1 bg-black bg-opacity-75 backdrop-blur-sm rounded-full px-3 py-2 text-white">
          {/* Previous button */}
          <button
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            className="flex items-center gap-1 px-2 py-1 rounded-md text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white hover:bg-opacity-20"
          >
            <ChevronLeft className="w-3 h-3" />
            <span className="hidden sm:inline">Prev</span>
          </button>

          {/* Page numbers */}
          <div className="flex items-center gap-1 mx-2">
            {(() => {
              const totalPairs = Math.ceil(images.length / 2);
              const currentPairNum = currentPair + 1;
              const maxVisible = 5;
              const pages = [];

              if (totalPairs <= maxVisible) {
                // Show all pairs if total is small
                for (let i = 1; i <= totalPairs; i++) {
                  pages.push(
                    <button
                      key={i}
                      onClick={() => onIndexChange((i - 1) * 2)}
                      className={`w-8 h-8 rounded-md text-sm font-medium transition-colors ${
                        i === currentPairNum
                          ? 'bg-blue-500 text-white'
                          : 'hover:bg-white hover:bg-opacity-20'
                      }`}
                    >
                      {i}
                    </button>
                  );
                }
              } else {
                // Smart pagination for large pair counts
                
                // Always show first pair
                pages.push(
                  <button
                    key={1}
                    onClick={() => onIndexChange(0)}
                    className={`w-8 h-8 rounded-md text-sm font-medium transition-colors ${
                      1 === currentPairNum
                        ? 'bg-blue-500 text-white'
                        : 'hover:bg-white hover:bg-opacity-20'
                    }`}
                  >
                    1
                  </button>
                );

                if (currentPairNum > 3) {
                  pages.push(<span key="ellipsis1" className="px-1">...</span>);
                }

                // Show pairs around current pair
                const start = Math.max(2, currentPairNum - 1);
                const end = Math.min(totalPairs - 1, currentPairNum + 1);
                
                for (let i = start; i <= end; i++) {
                  if (i !== 1 && i !== totalPairs) {
                    pages.push(
                      <button
                        key={i}
                        onClick={() => onIndexChange((i - 1) * 2)}
                        className={`w-8 h-8 rounded-md text-sm font-medium transition-colors ${
                          i === currentPairNum
                            ? 'bg-blue-500 text-white'
                            : 'hover:bg-white hover:bg-opacity-20'
                        }`}
                      >
                        {i}
                      </button>
                    );
                  }
                }

                if (currentPairNum < totalPairs - 2) {
                  pages.push(<span key="ellipsis2" className="px-1">...</span>);
                }

                // Always show last pair
                if (totalPairs > 1) {
                  pages.push(
                    <button
                      key={totalPairs}
                      onClick={() => onIndexChange((totalPairs - 1) * 2)}
                      className={`w-8 h-8 rounded-md text-sm font-medium transition-colors ${
                        totalPairs === currentPairNum
                          ? 'bg-blue-500 text-white'
                          : 'hover:bg-white hover:bg-opacity-20'
                      }`}
                    >
                      {totalPairs}
                    </button>
                  );
                }
              }

              return pages;
            })()}
          </div>

          {/* Next button */}
          <button
            onClick={handleNext}
            disabled={currentIndex >= images.length - 2}
            className="flex items-center gap-1 px-2 py-1 rounded-md text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white hover:bg-opacity-20"
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};

// Document viewer (scrollable)
const DocumentViewer = ({ images, selectedIndex, onSelect }) => {
  return (
    <div className="w-full h-full overflow-auto p-4 space-y-4">
      {images.map((image, index) => (
        <ImagePage
          key={`${image.originalPageNum}-${index}`}
          image={image}
          isActive={selectedIndex === index}
          onSelect={() => onSelect(index)}
          zoom={1}
          rotation={0}
          className="w-full max-w-2xl mx-auto"
        />
      ))}
    </div>
  );
};

// Main PDF Image Viewer component
const PDFImageViewer = ({ 
  images = [], 
  format = 'slideshow', 
  settings = {},
  onFormatChange,
  className = ''
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleIndexChange = useCallback((index) => {
    setCurrentIndex(index);
    setSelectedIndex(index);
  }, []);

  const handleSelect = useCallback((index) => {
    setSelectedIndex(index);
    if (format === 'slideshow') {
      setCurrentIndex(index);
    }
  }, [format]);

  const renderViewer = () => {
    if (!images || images.length === 0) {
      return (
        <div className="w-full h-full flex items-center justify-center text-gray-500">
          <div className="text-center">
            <Grid3X3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No images to display</p>
          </div>
        </div>
      );
    }

    switch (format) {
      case 'slideshow':
        return (
          <SlideshowViewer
            images={images}
            currentIndex={currentIndex}
            onIndexChange={handleIndexChange}
            settings={settings}
          />
        );
      case 'grid':
        return (
          <GridViewer
            images={images}
            selectedIndex={selectedIndex}
            onSelect={handleSelect}
            settings={settings}
          />
        );
      case 'booklet':
        return (
          <BookletViewer
            images={images}
            currentIndex={currentIndex}
            onIndexChange={handleIndexChange}
            settings={settings}
          />
        );
      case 'document':
        return (
          <DocumentViewer
            images={images}
            selectedIndex={selectedIndex}
            onSelect={handleSelect}
          />
        );
      default:
        return (
          <SlideshowViewer
            images={images}
            currentIndex={currentIndex}
            onIndexChange={handleIndexChange}
            settings={settings}
          />
        );
    }
  };

  const formatOptions = [
    { id: 'slideshow', name: 'Slideshow', icon: Grid3X3 },
    { id: 'grid', name: 'Grid', icon: Layout },
    { id: 'booklet', name: 'Booklet', icon: Columns },
    { id: 'document', name: 'Document', icon: Rows }
  ];

  return (
    <div className={`relative bg-white rounded-lg overflow-hidden ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-gray-50">
        <div className="flex items-center gap-4">
          {formatOptions.map((option) => {
            const Icon = option.icon;
            return (
              <button
                key={option.id}
                onClick={() => onFormatChange && onFormatChange(option.id)}
                className={`
                  flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all
                  ${format === option.id 
                    ? 'bg-blue-500 text-white' 
                    : 'text-gray-700 hover:bg-gray-200'
                  }
                `}
              >
                <Icon className="w-4 h-4" />
                {option.name}
              </button>
            );
          })}
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">
            {images.length} pages
          </span>
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
            title="Toggle Fullscreen"
          >
            <Fullscreen className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Viewer */}
      <div className={`${isFullscreen ? 'fixed inset-0 z-50' : 'h-96 md:h-[500px]'}`}>
        {renderViewer()}
      </div>
    </div>
  );
};

export default PDFImageViewer;
