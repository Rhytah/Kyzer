// src/components/editor/content-blocks/EmbedBlock.jsx
import { useState } from 'react';
import { useEditor } from '@/hooks/editor';
import { Code, ExternalLink } from 'lucide-react';

const EmbedBlock = ({ data, isPreviewMode, block }) => {
  const { updateBlock } = useEditor();

  const handleUrlChange = (e) => {
    updateBlock(block.id, {
      data: { ...data, src: e.target.value }
    });
  };

  const handleEmbedCodeChange = (e) => {
    updateBlock(block.id, {
      data: { ...data, embedCode: e.target.value }
    });
  };

  // Render based on type
  if (data.type === 'iframe' && data.src) {
    return (
      <div className="space-y-2">
        <iframe
          src={data.src}
          style={{
            width: data.width || '100%',
            height: data.height || '400px',
          }}
          className="border border-gray-300 rounded-lg"
          title="Embedded content"
        />
        {!isPreviewMode && (
          <div className="space-y-2">
            <input
              type="url"
              value={data.src || ''}
              onChange={handleUrlChange}
              placeholder="https://example.com"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <p className="text-xs text-gray-500">
              Use Properties panel to change width and height →
            </p>
          </div>
        )}
      </div>
    );
  }

  if (data.type === 'html' && data.embedCode) {
    return (
      <div className="space-y-2">
        <div
          dangerouslySetInnerHTML={{ __html: data.embedCode }}
          className="border border-gray-300 rounded-lg p-4"
        />
        {!isPreviewMode && (
          <textarea
            value={data.embedCode || ''}
            onChange={handleEmbedCodeChange}
            placeholder="<div>Your HTML here...</div>"
            className="w-full px-3 py-2 text-sm font-mono border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            rows={4}
          />
        )}
      </div>
    );
  }

  // Empty state
  return (
    <div className="flex flex-col items-center justify-center p-12 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg">
      <Code className="w-12 h-12 text-gray-400 mb-4" />
      <p className="text-gray-500 text-sm mb-4">Embed external content</p>
      {!isPreviewMode && (
        <div className="w-full max-w-md space-y-2">
          <input
            type="url"
            value={data.src || ''}
            onChange={handleUrlChange}
            placeholder="Enter URL or paste embed code below"
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <textarea
            value={data.embedCode || ''}
            onChange={handleEmbedCodeChange}
            placeholder="Or paste HTML embed code here..."
            className="w-full px-3 py-2 text-sm font-mono border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            rows={4}
          />
          <p className="text-xs text-gray-400 text-center">
            Supports iframes, HTML embeds, and external content
          </p>
        </div>
      )}
    </div>
  );
};

export default EmbedBlock;

