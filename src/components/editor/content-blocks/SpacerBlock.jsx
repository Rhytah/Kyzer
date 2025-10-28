// src/components/editor/content-blocks/SpacerBlock.jsx
import { useEditor } from '@/hooks/editor';

const SpacerBlock = ({ data, isPreviewMode, block }) => {
  const { updateBlock } = useEditor();

  return (
    <div
      style={{ height: data.height || '40px' }}
      className={isPreviewMode ? '' : 'border-2 border-dashed border-gray-300 bg-gray-50 flex items-center justify-center'}
    >
      {!isPreviewMode && (
        <span className="text-xs text-gray-400">
          Spacer • {data.height || '40px'}
        </span>
      )}
    </div>
  );
};

export default SpacerBlock;

