// src/components/editor/content-blocks/DividerBlock.jsx
import { useEditor } from '@/hooks/editor';

const DividerBlock = ({ data, isPreviewMode, block }) => {
  const { updateBlock } = useEditor();

  const spacingMap = {
    small: '16px',
    medium: '32px',
    large: '48px',
  };

  const marginY = spacingMap[data.spacing || 'medium'];

  return (
    <div style={{ marginTop: marginY, marginBottom: marginY }}>
      <hr
        style={{
          borderStyle: data.style || 'solid',
          borderWidth: `${data.thickness || 1}px 0 0 0`,
          borderColor: data.color || '#e5e7eb',
          width: data.width || '100%',
          margin: '0 auto',
        }}
      />
      {!isPreviewMode && (
        <div className="mt-2 text-xs text-gray-500 text-center">
          Divider • {data.style || 'solid'} • {data.thickness || 1}px • {data.spacing || 'medium'} spacing
        </div>
      )}
    </div>
  );
};

export default DividerBlock;

