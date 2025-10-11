// src/components/editor/EditorCanvas.jsx
import { useRef, useMemo } from 'react';
import { useEditor } from '@/hooks/editor';
import { useEditorStore } from '@/store/editorStore';
import BlockWrapper from './content-blocks/BlockWrapper';
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { BLOCK_TYPES } from '@/lib/editor/blockRegistry';

const EditorCanvas = () => {
  const canvasRef = useRef(null);
  const { canvas, currentLesson, editMode, addBlock, selectBlock } = useEditor();
  const { ui, actions } = useEditorStore();

  // Split blocks into pages based on PAGE_BREAK blocks
  const pages = useMemo(() => {
    if (canvas.blocks.length === 0) return [];

    const pagesList = [];
    let currentPage = {
      blocks: [],
      backgroundColor: '#ffffff',
      showPageNumber: true,
    };

    canvas.blocks.forEach((block, index) => {
      if (block.type === BLOCK_TYPES.PAGE_BREAK) {
        // Save current page and start new one
        if (currentPage.blocks.length > 0 || pagesList.length === 0) {
          pagesList.push(currentPage);
        }
        currentPage = {
          blocks: [],
          backgroundColor: block.data.backgroundColor || '#ffffff',
          showPageNumber: block.data.showPageNumber !== false,
        };
      } else {
        currentPage.blocks.push(block);
      }
    });

    // Add the last page
    if (currentPage.blocks.length > 0 || pagesList.length === 0) {
      pagesList.push(currentPage);
    }

    return pagesList;
  }, [canvas.blocks]);

  // Current page state from editor store
  const currentPageIndex = ui.currentPage || 0;

  const handlePageChange = (pageIndex) => {
    if (pageIndex >= 0 && pageIndex < pages.length) {
      actions.setCurrentPage(pageIndex);
    }
  };

  // Handle canvas drop
  const handleCanvasDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();

    // Check if a lesson is selected
    if (!currentLesson) {
      toast.error('Please select a lesson from the timeline below first');
      return;
    }

    try {
      const data = e.dataTransfer.getData('text/plain');

      if (data) {
        const dragData = JSON.parse(data);

        if (dragData.isNew && dragData.type) {
          addBlock(dragData.type);
          toast.success(`Added ${dragData.type} block`);
        }
      }
    } catch (error) {
      toast.error('Failed to add block');
    }
  };

  const handleCanvasDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleCanvasClick = (e) => {
    // Deselect block if clicking on canvas background
    if (e.target === canvasRef.current || e.target.classList.contains('canvas-background')) {
      selectBlock(null);
    }
  };

  // Get current page
  const currentPage = pages[currentPageIndex] || { blocks: [], backgroundColor: '#ffffff', showPageNumber: true };

  return (
    <div className="flex-1 overflow-hidden bg-gray-100 relative">
      {/* Canvas header */}
      <div className="bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h3 className="text-sm font-medium text-gray-900">
            {currentLesson?.title || 'Select a lesson to edit'}
          </h3>
          {editMode === 'preview' && (
            <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full">
              Preview Mode
            </span>
          )}
          {pages.length > 0 && (
            <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
              {pages.length} Page{pages.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        {/* Page navigation */}
        {pages.length > 1 && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(currentPageIndex - 1)}
              disabled={currentPageIndex === 0}
              className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="Previous page"
            >
              <ChevronLeft className="w-4 h-4 text-gray-600" />
            </button>
            <span className="text-xs font-medium text-gray-600 min-w-[60px] text-center">
              Page {currentPageIndex + 1} of {pages.length}
            </span>
            <button
              onClick={() => handlePageChange(currentPageIndex + 1)}
              disabled={currentPageIndex === pages.length - 1}
              className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="Next page"
            >
              <ChevronRight className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        )}
      </div>

      {/* Canvas area */}
      <div
        ref={canvasRef}
        className="canvas-background h-full overflow-auto p-8 flex justify-center"
        onClick={handleCanvasClick}
        onDrop={handleCanvasDrop}
        onDragOver={handleCanvasDragOver}
        style={{
          backgroundImage: ui.showGrid
            ? 'radial-gradient(circle, #d1d5db 1px, transparent 1px)'
            : 'none',
          backgroundSize: ui.showGrid ? '20px 20px' : 'auto',
        }}
      >
        {/* Main content container (Page) */}
        <div
          className="w-full max-w-5xl rounded-lg shadow-lg min-h-[800px] relative"
          onDrop={handleCanvasDrop}
          onDragOver={handleCanvasDragOver}
          style={{
            backgroundColor: currentPage.backgroundColor,
            transform: `scale(${canvas.zoom / 100})`,
            transformOrigin: 'top center',
            transition: 'transform 0.2s ease',
          }}
        >
          {/* Content blocks */}
          {canvas.blocks.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-96 text-center p-8">
              <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mb-4">
                <Plus className="w-10 h-10 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {currentLesson ? 'Start Building Your Lesson' : 'Select a Lesson to Edit'}
              </h3>
              {currentLesson ? (
                <div className="max-w-md space-y-4">
                  <p className="text-gray-600">
                    Drag content blocks from the left sidebar to start creating your lesson
                  </p>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
                    <h4 className="font-semibold text-blue-900 text-sm mb-2">Quick Start Tips:</h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Drag <strong>Text</strong> or <strong>Heading</strong> blocks for content</li>
                      <li>• Add <strong>Image</strong> or <strong>Video</strong> blocks for media</li>
                      <li>• Insert <strong>Page Break</strong> to create multiple pages</li>
                      <li>• Use page breaks to organize content like slides</li>
                      <li>• Changes auto-save every 30 seconds</li>
                    </ul>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 max-w-sm">
                  Choose a lesson from the timeline below to begin editing its content
                </p>
              )}
            </div>
          ) : (
            <div className="p-8 space-y-4">
              {/* Show page indicator at top */}
              {pages.length > 1 && editMode === 'edit' && (
                <div className="mb-6 -mx-8 -mt-8 px-8 py-3 bg-gradient-to-r from-primary-50 to-blue-50 border-b border-primary-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-primary-900">
                      Editing Page {currentPageIndex + 1} of {pages.length}
                    </span>
                    <div className="text-xs text-primary-700 bg-white px-3 py-1 rounded-full">
                      Background: {currentPage.backgroundColor}
                    </div>
                  </div>
                </div>
              )}

              {currentPage.blocks.map((block, index) => (
                <BlockWrapper
                  key={block.id}
                  block={block}
                  isSelected={canvas.selectedBlock === block.id}
                  isPreviewMode={editMode === 'preview'}
                  index={index}
                />
              ))}

              {/* Help text if page is empty */}
              {currentPage.blocks.length === 0 && pages.length > 1 && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                    <Plus className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 text-sm">
                    This page is empty. Drag blocks here to add content.
                  </p>
                  <p className="text-gray-400 text-xs mt-2">
                    Add content after the Page Break block to see it here.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Page number */}
          {currentPage.showPageNumber && pages.length > 1 && canvas.blocks.length > 0 && (
            <div className="absolute bottom-4 right-4 text-xs text-gray-400 font-medium">
              {currentPageIndex + 1}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditorCanvas;
