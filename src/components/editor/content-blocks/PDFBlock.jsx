// src/components/editor/content-blocks/PDFBlock.jsx
import { useState } from 'react';
import { useEditor } from '@/hooks/editor';
import { FileText, Upload, Link as LinkIcon } from 'lucide-react';

const PDFBlock = ({ data, isPreviewMode, block }) => {
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

  if (!data.src) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg">
        <FileText className="w-12 h-12 text-gray-400 mb-4" />
        <p className="text-gray-500 text-sm mb-4">Add a PDF document</p>
        {!isPreviewMode && (
          <form onSubmit={handleUrlSubmit} className="w-full max-w-md space-y-3">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <LinkIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="url"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="Enter PDF URL (https://...)"
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
            <p className="text-xs text-gray-400 text-center">
              Enter a URL to a PDF hosted online
            </p>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <div className="flex-1 h-px bg-gray-300" />
              <span>or</span>
              <div className="flex-1 h-px bg-gray-300" />
            </div>
            <button
              type="button"
              className="w-full flex items-center justify-center gap-2 px-4 py-2 border-2 border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors"
            >
              <Upload className="w-4 h-4" />
              Upload PDF (Coming Soon)
            </button>
          </form>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <iframe
        src={data.src}
        style={{
          width: '100%',
          height: data.height || '600px',
        }}
        className="border border-gray-300 rounded-lg"
        title="PDF Viewer"
      />
      {!isPreviewMode && (
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
            placeholder="PDF URL"
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
      )}
    </div>
  );
};

export default PDFBlock;

