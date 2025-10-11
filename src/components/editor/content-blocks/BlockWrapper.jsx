// src/components/editor/content-blocks/BlockWrapper.jsx
import { useEditor } from '@/hooks/editor';
import { getBlockDefinition, BLOCK_TYPES } from '@/lib/editor/blockRegistry';
import { Grip, Copy, Trash2 } from 'lucide-react';

// Import block components
import TextBlock from './TextBlock';
import HeadingBlock from './HeadingBlock';
import ImageBlock from './ImageBlock';
import VideoBlock from './VideoBlock';
import QuizBlock from './QuizBlock';
import PageBreakBlock from './PageBreakBlock';
import ListBlock from './ListBlock';
import TableBlock from './TableBlock';
import LinkBlock from './LinkBlock';
import DividerBlock from './DividerBlock';
import SpacerBlock from './SpacerBlock';
import CodeBlock from './CodeBlock';
import EmbedBlock from './EmbedBlock';
import PDFBlock from './PDFBlock';

/**
 * Universal wrapper for all content blocks
 * Handles selection, actions, and rendering
 */
const BlockWrapper = ({ block, isSelected, isPreviewMode, index }) => {
  const { selectBlock, duplicateBlock, deleteBlock } = useEditor();

  const blockDefinition = getBlockDefinition(block.type);
  const BlockIcon = blockDefinition?.icon;

  const handleClick = (e) => {
    if (!isPreviewMode) {
      e.stopPropagation();
      selectBlock(block.id);
    }
  };

  // Render the appropriate block component
  const renderBlock = () => {
    const commonProps = {
      data: block.data,
      isPreviewMode,
      block,
    };

    switch (block.type) {
      case BLOCK_TYPES.TEXT:
        return <TextBlock {...commonProps} />;
      case BLOCK_TYPES.HEADING:
        return <HeadingBlock {...commonProps} />;
      case BLOCK_TYPES.IMAGE:
        return <ImageBlock {...commonProps} />;
      case BLOCK_TYPES.VIDEO:
        return <VideoBlock {...commonProps} />;
      case BLOCK_TYPES.QUIZ:
        return <QuizBlock {...commonProps} />;
      case BLOCK_TYPES.PAGE_BREAK:
        return <PageBreakBlock {...commonProps} />;
      case BLOCK_TYPES.LIST:
        return <ListBlock {...commonProps} />;
      case BLOCK_TYPES.TABLE:
        return <TableBlock {...commonProps} />;
      case BLOCK_TYPES.LINK:
        return <LinkBlock {...commonProps} />;
      case BLOCK_TYPES.DIVIDER:
        return <DividerBlock {...commonProps} />;
      case BLOCK_TYPES.SPACER:
        return <SpacerBlock {...commonProps} />;
      case BLOCK_TYPES.CODE:
        return <CodeBlock {...commonProps} />;
      case BLOCK_TYPES.EMBED:
        return <EmbedBlock {...commonProps} />;
      case BLOCK_TYPES.PDF:
        return <PDFBlock {...commonProps} />;
      // SCORM and Presentation are complex - show placeholder for now
      case BLOCK_TYPES.SCORM:
      case BLOCK_TYPES.PRESENTATION:
        return (
          <div className="p-8 bg-blue-50 border-2 border-dashed border-blue-300 rounded-lg text-center">
            <p className="text-blue-700 font-medium mb-2">
              {block.type === BLOCK_TYPES.SCORM ? 'SCORM Package' : 'Presentation'}
            </p>
            <p className="text-sm text-blue-600">
              Advanced block - Use dedicated tools to manage this content type
            </p>
          </div>
        );
      default:
        return (
          <div className="p-8 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg text-center">
            <p className="text-gray-500">
              Block type "{block.type}" not yet implemented
            </p>
          </div>
        );
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`relative group ${
        isSelected && !isPreviewMode
          ? 'ring-2 ring-primary-500 ring-offset-2'
          : ''
      }`}
    >
      {/* Block controls (only in edit mode) */}
      {!isPreviewMode && (
        <div
          className={`absolute -left-12 top-0 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity ${
            isSelected ? 'opacity-100' : ''
          }`}
        >
          <button
            className="p-2 bg-white border border-gray-300 rounded hover:bg-gray-50 shadow-sm"
            title="Drag to reorder"
          >
            <Grip className="w-4 h-4 text-gray-600" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              duplicateBlock(block.id);
            }}
            className="p-2 bg-white border border-gray-300 rounded hover:bg-gray-50 shadow-sm"
            title="Duplicate"
          >
            <Copy className="w-4 h-4 text-gray-600" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (window.confirm('Delete this block?')) {
                deleteBlock(block.id);
              }
            }}
            className="p-2 bg-white border border-gray-300 rounded hover:bg-red-50 shadow-sm"
            title="Delete"
          >
            <Trash2 className="w-4 h-4 text-red-600" />
          </button>
        </div>
      )}

      {/* Block label (only visible when selected in edit mode) */}
      {isSelected && !isPreviewMode && (
        <div className="absolute -top-6 left-0 flex items-center gap-2 bg-primary-600 text-white px-3 py-1 rounded-t text-xs font-medium">
          {BlockIcon && <BlockIcon className="w-3 h-3" />}
          {blockDefinition?.name || 'Block'}
        </div>
      )}

      {/* Block content */}
      <div className="relative">
        {renderBlock()}
      </div>
    </div>
  );
};

export default BlockWrapper;
