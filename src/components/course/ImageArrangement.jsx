import React, { useState, useCallback } from 'react';
import { useDrag, useDrop, DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { 
  Move, 
  Trash2, 
  RotateCw, 
  ZoomIn, 
  Eye,
  Grid3X3,
  Layout,
  Columns,
  Rows
} from 'lucide-react';

const ITEM_TYPE = 'IMAGE_ITEM';

// Individual draggable image item
const DraggableImage = ({ 
  image, 
  index, 
  onRemove, 
  onRotate, 
  onZoom,
  onPreview,
  isSelected,
  onSelect
}) => {
  const [{ isDragging }, drag] = useDrag({
    type: ITEM_TYPE,
    item: { index, image },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const opacity = isDragging ? 0.5 : 1;

  return (
    <div
      ref={drag}
      className={`
        relative group cursor-move bg-white rounded-lg shadow-md overflow-hidden
        ${isSelected ? 'ring-2 ring-blue-500' : ''}
        ${isDragging ? 'opacity-50' : 'hover:shadow-lg'}
        transition-all duration-200
      `}
      style={{ opacity }}
      onClick={() => onSelect(index)}
    >
      {/* Image */}
      <div className="aspect-[3/4] bg-gray-100 flex items-center justify-center">
        <img
          src={image.imageUrl}
          alt={`Page ${image.pageNumber}`}
          className="w-full h-full object-contain"
          draggable={false}
        />
      </div>

      {/* Page number overlay */}
      <div className="absolute top-2 left-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
        Page {image.pageNumber}
      </div>

      {/* Action buttons */}
      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
        <div className="flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPreview(image);
            }}
            className="p-2 bg-white bg-opacity-90 rounded-full hover:bg-opacity-100 transition-all"
            title="Preview"
          >
            <Eye className="w-4 h-4 text-gray-700" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRotate(index);
            }}
            className="p-2 bg-white bg-opacity-90 rounded-full hover:bg-opacity-100 transition-all"
            title="Rotate"
          >
            <RotateCw className="w-4 h-4 text-gray-700" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onZoom(image);
            }}
            className="p-2 bg-white bg-opacity-90 rounded-full hover:bg-opacity-100 transition-all"
            title="Zoom"
          >
            <ZoomIn className="w-4 h-4 text-gray-700" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove(index);
            }}
            className="p-2 bg-red-500 bg-opacity-90 rounded-full hover:bg-opacity-100 transition-all"
            title="Remove"
          >
            <Trash2 className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>

      {/* Drag handle */}
      <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition-all">
        <Move className="w-3 h-3" />
      </div>
    </div>
  );
};

// Drop zone for reordering
const DropZone = ({ index, onDrop }) => {
  const [{ isOver }, drop] = useDrop({
    accept: ITEM_TYPE,
    drop: (item) => {
      if (item.index !== index) {
        onDrop(item.index, index);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  return (
    <div
      ref={drop}
      className={`
        h-2 w-full transition-all duration-200
        ${isOver ? 'bg-blue-400 h-4' : 'bg-transparent'}
      `}
    />
  );
};

// Layout selector component
const LayoutSelector = ({ currentLayout, onLayoutChange }) => {
  const layouts = [
    { id: 'grid', name: 'Grid', icon: Grid3X3, description: 'Uniform grid layout' },
    { id: 'masonry', name: 'Masonry', icon: Layout, description: 'Pinterest-style layout' },
    { id: 'columns', name: 'Columns', icon: Columns, description: 'Vertical columns' },
    { id: 'rows', name: 'Rows', icon: Rows, description: 'Horizontal rows' }
  ];

  return (
    <div className="flex gap-2 p-4 bg-gray-50 rounded-lg">
      {layouts.map((layout) => {
        const Icon = layout.icon;
        return (
          <button
            key={layout.id}
            onClick={() => onLayoutChange(layout.id)}
            className={`
              flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium
              transition-all duration-200
              ${currentLayout === layout.id 
                ? 'bg-blue-500 text-white' 
                : 'bg-white text-gray-700 hover:bg-gray-100'
              }
            `}
            title={layout.description}
          >
            <Icon className="w-4 h-4" />
            {layout.name}
          </button>
        );
      })}
    </div>
  );
};

// Main ImageArrangement component
const ImageArrangement = ({ 
  images = [], 
  onImagesChange, 
  onPreview,
  className = ''
}) => {
  const [layout, setLayout] = useState('grid');
  const [selectedImages, setSelectedImages] = useState(new Set());
  const [rotations, setRotations] = useState({});

  console.log('ImageArrangement received images:', images.length);
  if (images.length > 0) {
    console.log('First image in ImageArrangement:', images[0]);
  }

  const handleDrop = useCallback((dragIndex, dropIndex) => {
    const newImages = [...images];
    const draggedItem = newImages[dragIndex];
    
    // Remove the dragged item
    newImages.splice(dragIndex, 1);
    
    // Insert at new position
    newImages.splice(dropIndex, 0, draggedItem);
    
    // Update page numbers
    const updatedImages = newImages.map((image, index) => ({
      ...image,
      pageNumber: index + 1,
      currentOrder: index + 1
    }));
    
    onImagesChange(updatedImages);
  }, [images, onImagesChange]);

  const handleRemove = useCallback((index) => {
    const newImages = images.filter((_, i) => i !== index);
    const updatedImages = newImages.map((image, index) => ({
      ...image,
      pageNumber: index + 1,
      currentOrder: index + 1
    }));
    onImagesChange(updatedImages);
  }, [images, onImagesChange]);

  const handleRotate = useCallback((index) => {
    const currentRotation = rotations[index] || 0;
    const newRotation = (currentRotation + 90) % 360;
    setRotations(prev => ({
      ...prev,
      [index]: newRotation
    }));
  }, [rotations]);

  const handleZoom = useCallback((image) => {
    if (onPreview) {
      onPreview(image);
    }
  }, [onPreview]);

  const handleSelect = useCallback((index) => {
    setSelectedImages(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    setSelectedImages(new Set(images.map((_, index) => index)));
  }, [images]);

  const handleClearSelection = useCallback(() => {
    setSelectedImages(new Set());
  }, []);

  const handleRemoveSelected = useCallback(() => {
    const newImages = images.filter((_, index) => !selectedImages.has(index));
    const updatedImages = newImages.map((image, index) => ({
      ...image,
      pageNumber: index + 1,
      currentOrder: index + 1
    }));
    onImagesChange(updatedImages);
    setSelectedImages(new Set());
  }, [images, selectedImages, onImagesChange]);

  // Render different layouts
  const renderLayout = () => {
    const baseClasses = "grid gap-4";
    
    switch (layout) {
      case 'grid':
        return `${baseClasses} grid-cols-2 md:grid-cols-3 lg:grid-cols-4`;
      case 'masonry':
        return `${baseClasses} grid-cols-1 md:grid-cols-2 lg:grid-cols-3`;
      case 'columns':
        return `${baseClasses} grid-cols-1 md:grid-cols-2`;
      case 'rows':
        return `${baseClasses} grid-cols-2 md:grid-cols-4 lg:grid-cols-6`;
      default:
        return `${baseClasses} grid-cols-2 md:grid-cols-3 lg:grid-cols-4`;
    }
  };

  if (!images || images.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <Grid3X3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>No images to arrange</p>
      </div>
    );
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className={`space-y-4 ${className}`}>
        {/* Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              {images.length} page{images.length !== 1 ? 's' : ''}
            </span>
            
            {selectedImages.size > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-blue-600">
                  {selectedImages.size} selected
                </span>
                <button
                  onClick={handleRemoveSelected}
                  className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition-colors"
                >
                  Remove Selected
                </button>
                <button
                  onClick={handleClearSelection}
                  className="px-3 py-1 bg-gray-500 text-white text-sm rounded hover:bg-gray-600 transition-colors"
                >
                  Clear
                </button>
              </div>
            )}
            
            {selectedImages.size === 0 && (
              <button
                onClick={handleSelectAll}
                className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors"
              >
                Select All
              </button>
            )}
          </div>
        </div>

        {/* Layout selector */}
        <LayoutSelector currentLayout={layout} onLayoutChange={setLayout} />

        {/* Images grid */}
        <div className="space-y-2">
          <DropZone index={0} onDrop={handleDrop} />
          <div className={renderLayout()}>
            {images.map((image, index) => (
              <React.Fragment key={`${image.originalPageNum}-${index}`}>
                <div
                  style={{
                    transform: rotations[index] ? `rotate(${rotations[index]}deg)` : 'none'
                  }}
                  className="transition-transform duration-300"
                >
                  <DraggableImage
                    image={image}
                    index={index}
                    onRemove={handleRemove}
                    onRotate={handleRotate}
                    onZoom={handleZoom}
                    onPreview={onPreview}
                    isSelected={selectedImages.has(index)}
                    onSelect={handleSelect}
                  />
                </div>
                <DropZone index={index + 1} onDrop={handleDrop} />
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </DndProvider>
  );
};

export default ImageArrangement;
