// src/components/editor/content-blocks/PageBreakBlock.jsx
import { Minus, ChevronDown, ChevronUp } from 'lucide-react';
import { useEditor } from '@/hooks/editor';

const PageBreakBlock = ({ data, isPreviewMode, block }) => {
  const { updateBlock } = useEditor();

  const handleColorChange = (e) => {
    updateBlock(block.id, {
      data: { ...data, backgroundColor: e.target.value }
    });
  };

  const handlePageNumberToggle = () => {
    updateBlock(block.id, {
      data: { ...data, showPageNumber: !data.showPageNumber }
    });
  };

  if (isPreviewMode) {
    return (
      <div className="flex items-center justify-center py-8 page-break-preview">
        <div className="flex items-center gap-3 text-gray-400">
          <Minus className="w-6 h-6" />
          <span className="text-sm font-medium">New Page</span>
          <Minus className="w-6 h-6" />
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Page break indicator */}
      <div 
        className="flex items-center justify-center py-8 border-t-2 border-b-2 border-dashed border-primary-300 bg-primary-50"
        style={{ borderColor: data.backgroundColor !== '#ffffff' ? data.backgroundColor : undefined }}
      >
        <div className="flex flex-col items-center gap-3">
          <div className="flex items-center gap-3 text-primary-600">
            <ChevronUp className="w-5 h-5" />
            <Minus className="w-8 h-8" />
            <span className="text-sm font-semibold uppercase tracking-wider">Page Break</span>
            <Minus className="w-8 h-8" />
            <ChevronDown className="w-5 h-5" />
          </div>
          
          {/* Edit controls */}
          <div className="flex items-center gap-4 bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center gap-2">
              <label htmlFor={`bg-color-${block.id}`} className="text-xs font-medium text-gray-700">
                Next Page Background:
              </label>
              <input
                id={`bg-color-${block.id}`}
                type="color"
                value={data.backgroundColor || '#ffffff'}
                onChange={handleColorChange}
                className="w-10 h-8 rounded border border-gray-300 cursor-pointer"
              />
              <span className="text-xs text-gray-500 font-mono">
                {data.backgroundColor || '#ffffff'}
              </span>
            </div>
            
            <div className="h-4 w-px bg-gray-300" />
            
            <button
              onClick={handlePageNumberToggle}
              className={`text-xs px-3 py-1 rounded transition-colors ${
                data.showPageNumber
                  ? 'bg-primary-100 text-primary-700 border border-primary-300'
                  : 'bg-gray-100 text-gray-600 border border-gray-300'
              }`}
            >
              {data.showPageNumber ? '✓ Show Page #' : 'Hide Page #'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PageBreakBlock;

