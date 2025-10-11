// src/components/editor/content-blocks/CodeBlock.jsx
import { useEditor } from '@/hooks/editor';
import { Copy, Check } from 'lucide-react';
import { useState } from 'react';

const CodeBlock = ({ data, isPreviewMode, block }) => {
  const { updateBlock } = useEditor();
  const [copied, setCopied] = useState(false);

  const handleCodeChange = (e) => {
    updateBlock(block.id, {
      data: { ...data, code: e.target.value }
    });
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(data.code || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-2">
      <div className="relative">
        <div className={`rounded-lg overflow-hidden ${data.theme === 'dark' ? 'bg-gray-900' : 'bg-gray-100'}`}>
          {/* Header */}
          <div className={`flex items-center justify-between px-4 py-2 border-b ${
            data.theme === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-gray-300 bg-gray-200'
          }`}>
            <span className={`text-xs font-medium ${
              data.theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}>
              {data.language || 'code'}
            </span>
            {isPreviewMode && (
              <button
                onClick={handleCopy}
                className={`flex items-center gap-1 px-2 py-1 text-xs rounded transition-colors ${
                  data.theme === 'dark'
                    ? 'text-gray-300 hover:bg-gray-700'
                    : 'text-gray-700 hover:bg-gray-300'
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-3 h-3" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    Copy
                  </>
                )}
              </button>
            )}
          </div>

          {/* Code */}
          <div className="relative">
            {isPreviewMode ? (
              <pre className={`p-4 overflow-x-auto ${data.lineNumbers ? 'pl-12' : ''} ${
                data.theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
              }`}>
                <code className="text-sm font-mono">
                  {data.code || '// Start coding...'}
                </code>
              </pre>
            ) : (
              <textarea
                value={data.code || ''}
                onChange={handleCodeChange}
                placeholder="// Start coding..."
                className={`w-full p-4 text-sm font-mono resize-none focus:outline-none ${
                  data.theme === 'dark'
                    ? 'bg-gray-900 text-gray-100 placeholder-gray-500'
                    : 'bg-gray-100 text-gray-900 placeholder-gray-400'
                }`}
                rows={10}
                spellCheck="false"
              />
            )}
          </div>
        </div>
      </div>

      {!isPreviewMode && (
        <p className="text-xs text-gray-500">
          Use Properties panel to change language and theme →
        </p>
      )}
    </div>
  );
};

export default CodeBlock;

