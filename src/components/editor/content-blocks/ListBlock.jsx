// src/components/editor/content-blocks/ListBlock.jsx
import { useState } from 'react';
import { useEditor } from '@/hooks/editor';
import { Plus, X } from 'lucide-react';

const ListBlock = ({ data, isPreviewMode, block }) => {
  const { updateBlock } = useEditor();
  const [newItemText, setNewItemText] = useState('');

  const handleItemChange = (index, value) => {
    const newItems = [...(data.items || [])];
    newItems[index] = value;
    updateBlock(block.id, {
      data: { ...data, items: newItems }
    });
  };

  const handleAddItem = () => {
    if (newItemText.trim()) {
      updateBlock(block.id, {
        data: { ...data, items: [...(data.items || []), newItemText.trim()] }
      });
      setNewItemText('');
    }
  };

  const handleRemoveItem = (index) => {
    const newItems = [...(data.items || [])];
    newItems.splice(index, 1);
    updateBlock(block.id, {
      data: { ...data, items: newItems }
    });
  };

  const handleToggleOrdered = () => {
    updateBlock(block.id, {
      data: { ...data, ordered: !data.ordered }
    });
  };

  const ListTag = data.ordered ? 'ol' : 'ul';

  return (
    <div className="space-y-2">
      <ListTag 
        className={`pl-6 space-y-1 ${data.ordered ? 'list-decimal' : 'list-disc'}`}
        style={{ listStyleType: data.style || (data.ordered ? 'decimal' : 'disc') }}
      >
        {(data.items || []).map((item, index) => (
          <li key={index} className="text-gray-800">
            {isPreviewMode ? (
              <span>{item}</span>
            ) : (
              <div className="flex items-center gap-2 group">
                <input
                  type="text"
                  value={item}
                  onChange={(e) => handleItemChange(index, e.target.value)}
                  className="flex-1 px-2 py-1 border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <button
                  onClick={() => handleRemoveItem(index)}
                  className="opacity-0 group-hover:opacity-100 p-1 text-red-600 hover:bg-red-50 rounded transition-opacity"
                  title="Remove item"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
          </li>
        ))}
      </ListTag>

      {!isPreviewMode && (
        <div className="space-y-2 pt-2 border-t border-gray-200">
          <div className="flex gap-2">
            <input
              type="text"
              value={newItemText}
              onChange={(e) => setNewItemText(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddItem()}
              placeholder="Add new item..."
              className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <button
              onClick={handleAddItem}
              disabled={!newItemText.trim()}
              className="px-3 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <button
            onClick={handleToggleOrdered}
            className="text-xs text-gray-600 hover:text-primary-600 transition-colors"
          >
            Switch to {data.ordered ? 'unordered (bullets)' : 'ordered (numbers)'}
          </button>
        </div>
      )}
    </div>
  );
};

export default ListBlock;

