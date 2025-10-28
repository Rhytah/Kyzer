// src/components/editor/content-blocks/HeadingBlock.jsx
import { useRef, useEffect } from 'react';
import { useEditor } from '@/hooks/editor';

const HeadingBlock = ({ data, isPreviewMode, block }) => {
  const { updateBlock } = useEditor();
  const contentRef = useRef(null);
  const HeadingTag = `h${data.level || 2}`;

  useEffect(() => {
    if (contentRef.current) {
      const currentText = contentRef.current.textContent || '';
      const dataText = data.text || '';
      
      // Only update if different to avoid cursor jumping
      if (currentText !== dataText) {
        contentRef.current.textContent = dataText;
      }
    }
  }, [data.text]);

  const handleInput = (e) => {
    updateBlock(block.id, {
      data: { ...data, text: e.target.textContent }
    });
  };

  return (
    <HeadingTag
      ref={contentRef}
      contentEditable={!isPreviewMode}
      suppressContentEditableWarning
      onInput={handleInput}
      style={{
        color: data.color || '#000000',
        textAlign: data.alignment || 'left',
        direction: 'ltr',
        unicodeBidi: 'plaintext',
        margin: 0,
        minHeight: '40px',
        padding: '8px',
      }}
      className="font-bold focus:outline-none"
      data-placeholder="Heading Text"
    />
  );
};

export default HeadingBlock;
