// src/components/editor/content-blocks/LinkBlock.jsx
import { useState } from 'react';
import { useEditor } from '@/hooks/editor';
import { Link as LinkIcon, ExternalLink } from 'lucide-react';

const LinkBlock = ({ data, isPreviewMode, block }) => {
  const { updateBlock } = useEditor();

  const handleTextChange = (e) => {
    updateBlock(block.id, {
      data: { ...data, text: e.target.value }
    });
  };

  const handleUrlChange = (e) => {
    updateBlock(block.id, {
      data: { ...data, href: e.target.value }
    });
  };

  const variantStyles = {
    primary: 'bg-primary-600 text-white hover:bg-primary-700',
    secondary: 'bg-gray-600 text-white hover:bg-gray-700',
    outline: 'border-2 border-primary-600 text-primary-600 hover:bg-primary-50',
    text: 'text-primary-600 hover:text-primary-700 hover:underline',
  };

  const sizeStyles = {
    small: 'px-3 py-1.5 text-sm',
    medium: 'px-4 py-2 text-base',
    large: 'px-6 py-3 text-lg',
  };

  const alignmentStyles = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end',
  };

  if (isPreviewMode) {
    return (
      <div className={`flex ${alignmentStyles[data.alignment || 'left']}`}>
        <a
          href={data.href || '#'}
          target={data.target || '_blank'}
          rel="noopener noreferrer"
          className={`inline-flex items-center gap-2 rounded-lg font-medium transition-all ${
            variantStyles[data.variant || 'primary']
          } ${sizeStyles[data.size || 'medium']}`}
        >
          {data.text || 'Click Here'}
          {data.target === '_blank' && <ExternalLink className="w-4 h-4" />}
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className={`flex ${alignmentStyles[data.alignment || 'left']}`}>
        <button
          className={`inline-flex items-center gap-2 rounded-lg font-medium ${
            variantStyles[data.variant || 'primary']
          } ${sizeStyles[data.size || 'medium']}`}
        >
          {data.text || 'Click Here'}
          {data.target === '_blank' && <ExternalLink className="w-4 h-4" />}
        </button>
      </div>

      <div className="space-y-2 pt-2 border-t border-gray-200">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Button Text
          </label>
          <input
            type="text"
            value={data.text || ''}
            onChange={handleTextChange}
            placeholder="Click Here"
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            URL
          </label>
          <div className="relative">
            <LinkIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="url"
              value={data.href || ''}
              onChange={handleUrlChange}
              placeholder="https://example.com"
              className="w-full pl-10 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        <p className="text-xs text-gray-500">
          Use Properties panel to customize style, size, and alignment →
        </p>
      </div>
    </div>
  );
};

export default LinkBlock;

