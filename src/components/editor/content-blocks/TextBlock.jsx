// src/components/editor/content-blocks/TextBlock.jsx
import { useRef, useEffect } from 'react';
import { useEditor } from '@/hooks/editor';

const TextBlock = ({ data, isPreviewMode, block }) => {
  const contentRef = useRef(null);
  const { updateBlock } = useEditor();

  useEffect(() => {
    if (contentRef.current) {
      if (data.content && data.content !== contentRef.current.innerHTML) {
        contentRef.current.innerHTML = data.content;
      } else if (!data.content && contentRef.current.innerHTML !== '') {
        contentRef.current.innerHTML = '';
      }
    }
  }, [data.content]);

  const handleInput = () => {
    if (contentRef.current) {
      updateBlock(block.id, {
        data: { ...data, content: contentRef.current.innerHTML }
      });
    }
  };

  const handleFocus = () => {
    // Clear placeholder on focus if empty
    if (contentRef.current && contentRef.current.innerHTML === '') {
      contentRef.current.innerHTML = '';
    }
  };

  const handleBlur = () => {
    // If empty after editing, ensure it stays empty
    if (contentRef.current && contentRef.current.innerHTML.trim() === '') {
      contentRef.current.innerHTML = '';
    }
  };

  return (
    <div
      ref={contentRef}
      contentEditable={!isPreviewMode}
      suppressContentEditableWarning
      onInput={handleInput}
      onFocus={handleFocus}
      onBlur={handleBlur}
      className="prose max-w-none focus:outline-none"
      style={{
        fontSize: `${data.fontSize || 16}px`,
        fontFamily: data.fontFamily || 'Inter',
        color: data.color || '#000000',
        textAlign: data.alignment || 'left',
        direction: 'ltr',
        minHeight: '40px',
        padding: '8px',
      }}
      placeholder={!isPreviewMode && !data.content ? 'Start typing...' : undefined}
      data-placeholder="Start typing..."
    />
  );
};

export default TextBlock;
