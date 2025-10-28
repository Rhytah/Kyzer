// src/hooks/editor/useDragAndDrop.js
import { useState, useCallback, useRef } from 'react';

/**
 * Hook for drag and drop functionality in the editor
 */
export const useDragAndDrop = ({ onDrop, onReorder }) => {
  const [draggedItem, setDraggedItem] = useState(null);
  const [dropTarget, setDropTarget] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartPos = useRef({ x: 0, y: 0 });

  // Handle drag start
  const handleDragStart = useCallback((item, event) => {
    setDraggedItem(item);
    setIsDragging(true);

    if (event?.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', JSON.stringify(item));
    }

    dragStartPos.current = {
      x: event?.clientX || 0,
      y: event?.clientY || 0,
    };
  }, []);

  // Handle drag over
  const handleDragOver = useCallback((targetId, event) => {
    if (event) {
      event.preventDefault();
      event.dataTransfer.dropEffect = 'move';
    }

    setDropTarget(targetId);
  }, []);

  // Handle drag end
  const handleDragEnd = useCallback((event) => {
    // Only reset state if this is the end of a drag operation
    if (draggedItem) {
      setDraggedItem(null);
      setDropTarget(null);
      setIsDragging(false);
    }
  }, [draggedItem]);

  // Handle drop
  const handleDrop = useCallback((targetId, event) => {
    if (event) {
      event.preventDefault();
    }

    // Get the dragged item from dataTransfer or state
    let itemToDrop = draggedItem;
    
    if (!itemToDrop && event?.dataTransfer) {
      try {
        const data = event.dataTransfer.getData('text/plain');
        if (data) {
          itemToDrop = JSON.parse(data);
        }
      } catch (error) {
        console.error('Error parsing drag data:', error);
      }
    }

    if (itemToDrop && onDrop) {
      const dropPosition = {
        x: event?.clientX || 0,
        y: event?.clientY || 0,
      };

      onDrop(itemToDrop, targetId, dropPosition);
    }

    setDraggedItem(null);
    setDropTarget(null);
    setIsDragging(false);
  }, [draggedItem, onDrop]);

  // Handle reorder (for lists/timelines)
  const handleReorder = useCallback((items, startIndex, endIndex) => {
    if (startIndex === endIndex) return items;

    const result = Array.from(items);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);

    if (onReorder) {
      onReorder(result);
    }

    return result;
  }, [onReorder]);

  // Drag handlers for blocks on canvas
  const handleBlockDragStart = useCallback((blockId, event) => {
    const block = { id: blockId, type: 'block' };
    handleDragStart(block, event);
  }, [handleDragStart]);

  // Drag handlers for new blocks from sidebar
  const handleNewBlockDragStart = useCallback((blockType, event) => {
    const block = { type: blockType, isNew: true };
    handleDragStart(block, event);
  }, [handleDragStart]);

  return {
    // State
    draggedItem,
    dropTarget,
    isDragging,
    dragStartPos: dragStartPos.current,

    // Handlers
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    handleDrop,
    handleReorder,
    handleBlockDragStart,
    handleNewBlockDragStart,
  };
};
