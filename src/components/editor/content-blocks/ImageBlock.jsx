// src/components/editor/content-blocks/ImageBlock.jsx
import { useState } from 'react';
import { Image as ImageIcon, Link as LinkIcon } from 'lucide-react';
import { useEditor } from '@/hooks/editor';

const ImageBlock = ({ data, isPreviewMode, block }) => {
  const { updateBlock } = useEditor();
  const [urlInput, setUrlInput] = useState(data.src || '');

  const handleUrlSubmit = (e) => {
    e.preventDefault();
    if (urlInput.trim()) {
      updateBlock(block.id, {
        data: { ...data, src: urlInput.trim() }
      });
    }
  };

  const handleAltChange = (e) => {
    updateBlock(block.id, {
      data: { ...data, alt: e.target.value }
    });
  };

  const handleCaptionChange = (e) => {
    updateBlock(block.id, {
      data: { ...data, caption: e.target.value }
    });
  };

  const handleSizeChange = (field, value) => {
    updateBlock(block.id, {
      data: { ...data, [field]: value }
    });
  };

  if (!data.src) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg">
        <ImageIcon className="w-12 h-12 text-gray-400 mb-4" />
        <p className="text-gray-500 text-sm mb-4">Add an image</p>
        {!isPreviewMode && (
          <form onSubmit={handleUrlSubmit} className="w-full max-w-md">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <LinkIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="url"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="Enter image URL (https://...)"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                Add
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-2 text-center">
              Enter a URL to an image hosted online
            </p>
          </form>
        )}
      </div>
    );
  }

  return (
    <figure className="m-0">
      <img
        src={data.src}
        alt={data.alt || ''}
        style={{
          width: data.width || '100%',
          height: data.height || 'auto',
          objectFit: data.objectFit || 'contain',
        }}
        className="rounded-lg"
      />
      {!isPreviewMode && (
        <div className="mt-2 space-y-2">
          <div className="flex gap-2">
            <input
              type="url"
              value={data.src}
              onChange={(e) => {
                if (e.target.value) {
                  updateBlock(block.id, {
                    data: { ...data, src: e.target.value }
                  });
                }
              }}
              placeholder="Image URL"
              className="flex-1 px-3 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <button
              onClick={() => {
                updateBlock(block.id, {
                  data: { ...data, src: '' }
                });
                setUrlInput('');
              }}
              className="px-3 py-1 text-sm text-red-600 hover:text-red-700 border border-red-300 rounded hover:bg-red-50 transition-colors"
            >
              Remove
            </button>
          </div>

          {/* Image sizing controls */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Width</label>
              <select
                value={data.width || '100%'}
                onChange={(e) => handleSizeChange('width', e.target.value)}
                className="w-full px-3 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="100%">Full Width (100%)</option>
                <option value="75%">Large (75%)</option>
                <option value="50%">Medium (50%)</option>
                <option value="33%">Small (33%)</option>
                <option value="25%">Tiny (25%)</option>
                <option value="auto">Auto</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Height</label>
              <select
                value={data.height || 'auto'}
                onChange={(e) => handleSizeChange('height', e.target.value)}
                className="w-full px-3 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="auto">Auto</option>
                <option value="200px">Small (200px)</option>
                <option value="300px">Medium (300px)</option>
                <option value="400px">Large (400px)</option>
                <option value="500px">X-Large (500px)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-600 mb-1">Fit</label>
            <select
              value={data.objectFit || 'contain'}
              onChange={(e) => handleSizeChange('objectFit', e.target.value)}
              className="w-full px-3 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="contain">Contain (fit inside)</option>
              <option value="cover">Cover (fill area)</option>
              <option value="fill">Fill (stretch)</option>
              <option value="none">None (original size)</option>
              <option value="scale-down">Scale Down</option>
            </select>
          </div>

          <input
            type="text"
            value={data.alt || ''}
            onChange={handleAltChange}
            placeholder="Alt text (for accessibility)"
            className="w-full px-3 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <input
            type="text"
            value={data.caption || ''}
            onChange={handleCaptionChange}
            placeholder="Caption (optional)"
            className="w-full px-3 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      )}
      {data.caption && isPreviewMode && (
        <figcaption className="text-sm text-gray-600 text-center mt-2">
          {data.caption}
        </figcaption>
      )}
    </figure>
  );
};

export default ImageBlock;
