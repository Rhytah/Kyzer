// src/components/editor/EditorSidebar.jsx
import { useState } from 'react';
import { useEditorStore } from '@/store/editorStore';
import { getAllBlockTypes, getBlocksByCategory, BLOCK_CATEGORIES } from '@/lib/editor/blockRegistry';
import { X, Search, Image as ImageIcon, FileText, Layout } from 'lucide-react';

const EditorSidebar = () => {
  const { ui, actions } = useEditorStore();
  const [activeTab, setActiveTab] = useState('blocks'); // 'blocks' | 'media' | 'templates'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Handle drag start for new blocks
  const handleNewBlockDragStart = (blockType, event) => {
    const dragData = {
      type: blockType,
      isNew: true,
    };

    event.dataTransfer.effectAllowed = 'copy';
    event.dataTransfer.setData('text/plain', JSON.stringify(dragData));

    // Add visual feedback
    event.target.style.opacity = '0.5';
  };

  // Handle drag end
  const handleDragEnd = (event) => {
    event.target.style.opacity = '1';
  };

  if (!ui.sidebarOpen) {
    return (
      <button
        onClick={actions.toggleSidebar}
        className="w-12 bg-gray-100 hover:bg-gray-200 flex items-center justify-center border-r border-gray-200"
      >
        <Layout className="w-5 h-5 text-gray-600" />
      </button>
    );
  }

  const categories = [
    { id: 'all', name: 'All Blocks' },
    { id: BLOCK_CATEGORIES.BASIC, name: 'Basic' },
    { id: BLOCK_CATEGORIES.MEDIA, name: 'Media' },
    { id: BLOCK_CATEGORIES.INTERACTIVE, name: 'Interactive' },
    { id: BLOCK_CATEGORIES.LAYOUT, name: 'Layout' },
    { id: BLOCK_CATEGORIES.ADVANCED, name: 'Advanced' },
  ];

  const blocks = selectedCategory === 'all'
    ? getAllBlockTypes()
    : getBlocksByCategory(selectedCategory);

  const filteredBlocks = blocks.filter(block =>
    block.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    block.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Content Library</h2>
          <button
            onClick={actions.toggleSidebar}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setActiveTab('blocks')}
            className={`flex-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
              activeTab === 'blocks'
                ? 'bg-primary-100 text-primary-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Layout className="w-4 h-4 inline-block mr-1" />
            Blocks
          </button>
          <button
            onClick={() => setActiveTab('media')}
            className={`flex-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
              activeTab === 'media'
                ? 'bg-primary-100 text-primary-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <ImageIcon className="w-4 h-4 inline-block mr-1" />
            Media
          </button>
          <button
            onClick={() => setActiveTab('templates')}
            className={`flex-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
              activeTab === 'templates'
                ? 'bg-primary-100 text-primary-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <FileText className="w-4 h-4 inline-block mr-1" />
            Templates
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'blocks' && (
          <div className="p-4">
            {/* Category filter */}
            <div className="mb-4">
              <div className="flex flex-wrap gap-2">
                {categories.map(category => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                      selectedCategory === category.id
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Block list */}
            <div className="space-y-2">
              {filteredBlocks.map(block => {
                const Icon = block.icon;
                return (
                  <div
                    key={block.type}
                    draggable="true"
                    onDragStart={(e) => handleNewBlockDragStart(block.type, e)}
                    onDragEnd={handleDragEnd}
                    className="p-3 border border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 cursor-move transition-all group"
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-gray-100 group-hover:bg-primary-100 rounded-lg">
                        <Icon className="w-5 h-5 text-gray-600 group-hover:text-primary-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-sm font-medium text-gray-900">{block.name}</h3>
                        <p className="text-xs text-gray-500 mt-1">{block.description}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'media' && (
          <div className="p-4">
            <p className="text-sm text-gray-500 text-center py-8">
              Media library coming soon...
            </p>
          </div>
        )}

        {activeTab === 'templates' && (
          <div className="p-4">
            <p className="text-sm text-gray-500 text-center py-8">
              Templates coming soon...
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EditorSidebar;
