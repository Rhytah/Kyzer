// src/components/editor/RightPanel.jsx
import { useState } from 'react';
import { Settings, FolderTree, X } from 'lucide-react';
import EditorProperties from './EditorProperties';
import EditorTimeline from './EditorTimeline';
import Tooltip from '@/components/ui/Tooltip';
import { useEditorStore } from '@/store/editorStore';

const RightPanel = () => {
  const [activeTab, setActiveTab] = useState('properties'); // 'properties' | 'structure'
  const ui = useEditorStore((state) => state.ui);
  const actions = useEditorStore((state) => state.actions);

  if (!ui.propertiesOpen) {
    return (
      <Tooltip content="Show right panel" position="left">
        <button
          onClick={actions.toggleProperties}
          className="w-12 bg-white border-l border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
        >
          <div className="flex flex-col items-center gap-2">
            <Settings className="w-5 h-5 text-gray-600" />
            <div className="w-px h-8 bg-gray-300" />
            <FolderTree className="w-5 h-5 text-gray-600" />
          </div>
        </button>
      </Tooltip>
    );
  }

  return (
    <aside className="w-80 bg-white border-l border-gray-200 flex flex-col shadow-sm">
      {/* Tab Header */}
      <div className="flex items-center border-b border-gray-200">
        <Tooltip content="Block and page properties" position="bottom">
          <button
            onClick={() => setActiveTab('properties')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'properties'
                ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <Settings className="w-4 h-4" />
            Properties
          </button>
        </Tooltip>
        <Tooltip content="Course modules and lessons" position="bottom">
          <button
            onClick={() => setActiveTab('structure')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'structure'
                ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <FolderTree className="w-4 h-4" />
            Structure
          </button>
        </Tooltip>
        <Tooltip content="Close panel" position="bottom">
          <button
            onClick={actions.toggleProperties}
            className="p-3 text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </Tooltip>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'properties' ? (
          <EditorProperties embedded />
        ) : (
          <EditorTimeline embedded />
        )}
      </div>
    </aside>
  );
};

export default RightPanel;

