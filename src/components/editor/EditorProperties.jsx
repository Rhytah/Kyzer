// src/components/editor/EditorProperties.jsx
import { useMemo, useState } from 'react';
import { useEditorStore } from '@/store/editorStore';
import { useEditor } from '@/hooks/editor';
import { getBlockDefinition, BLOCK_TYPES } from '@/lib/editor/blockRegistry';
import { X, Settings, Trash2, Palette } from 'lucide-react';

const EditorProperties = () => {
  const { canvas, ui, currentLesson, actions } = useEditorStore();
  const { updateBlock, deleteBlock } = useEditor();
  const [applyToAllPages, setApplyToAllPages] = useState(false);

  // Calculate pages and current page
  const { pages, currentPageIndex } = useMemo(() => {
    if (canvas.blocks.length === 0) return { pages: [], currentPageIndex: 0 };

    const pagesList = [];
    let currentPage = {
      blocks: [],
      backgroundColor: '#ffffff',
      showPageNumber: true,
      pageBreakBlockId: null,
    };

    canvas.blocks.forEach((block) => {
      if (block.type === BLOCK_TYPES.PAGE_BREAK) {
        if (currentPage.blocks.length > 0 || pagesList.length === 0) {
          pagesList.push(currentPage);
        }
        currentPage = {
          blocks: [],
          backgroundColor: block.data.backgroundColor || '#ffffff',
          showPageNumber: block.data.showPageNumber !== false,
          pageBreakBlockId: block.id, // Store the page break block ID for this page
        };
      } else {
        currentPage.blocks.push(block);
      }
    });

    if (currentPage.blocks.length > 0 || pagesList.length === 0) {
      pagesList.push(currentPage);
    }

    return { pages: pagesList, currentPageIndex: ui.currentPage || 0 };
  }, [canvas.blocks, ui.currentPage]);

  const currentPage = pages[currentPageIndex] || { blocks: [], backgroundColor: '#ffffff', showPageNumber: true };

  // Handle page background color change
  const handlePageBackgroundChange = (color, applyToAll = false) => {
    if (applyToAll) {
      // Apply to all pages - update all page break blocks
      const pageBreaks = canvas.blocks.filter(b => b.type === BLOCK_TYPES.PAGE_BREAK);
      pageBreaks.forEach(pageBreak => {
        updateBlock(pageBreak.id, {
          data: { 
            ...pageBreak.data,
            backgroundColor: color,
          }
        });
      });
      return;
    }

    // Apply to current page only
    if (pages.length === 1 && currentPageIndex === 0) {
      // Single page - we need to insert a page break at the end to apply the background
      // For simplicity, we'll create a page break that will define page 2's background
      // But show a message that they need to add a page break
      return; // Can't change background of first page without page breaks yet
    }

    if (currentPageIndex === 0 && pages.length > 1) {
      // First page of multiple pages - the first page break defines what comes AFTER it
      // So we can't directly change page 1's background this way
      // Instead, we'd need to insert a page break at the start
      // For now, just update the next page break
      const firstPageBreak = canvas.blocks.find(b => b.type === BLOCK_TYPES.PAGE_BREAK);
      if (firstPageBreak) {
        updateBlock(firstPageBreak.id, {
          data: { ...firstPageBreak.data, backgroundColor: color }
        });
      }
    } else if (currentPage.pageBreakBlockId) {
      // Update the page break that defines this page
      const pageBreakBlock = canvas.blocks.find(b => b.id === currentPage.pageBreakBlockId);
      if (pageBreakBlock) {
        updateBlock(currentPage.pageBreakBlockId, {
          data: { 
            ...pageBreakBlock.data,
            backgroundColor: color, 
            showPageNumber: pageBreakBlock.data.showPageNumber 
          }
        });
      }
    }
  };

  if (!ui.propertiesOpen) {
    return (
      <button
        onClick={actions.toggleProperties}
        className="w-12 bg-gray-100 hover:bg-gray-200 flex items-center justify-center border-l border-gray-200"
      >
        <Settings className="w-5 h-5 text-gray-600" />
      </button>
    );
  }

  const selectedBlock = canvas.blocks.find(b => b.id === canvas.selectedBlock);
  const blockDefinition = selectedBlock ? getBlockDefinition(selectedBlock.type) : null;

  return (
    <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Properties</h2>
          <button
            onClick={actions.toggleProperties}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Page Settings - Always visible */}
        {currentLesson && (
          <div className="p-4 border-b border-gray-200 bg-gradient-to-br from-primary-50 to-blue-50">
            <div className="flex items-center gap-2 mb-3">
              <Palette className="w-4 h-4 text-primary-600" />
              <h3 className="text-sm font-semibold text-gray-900">
                Page Settings
              </h3>
              {pages.length > 1 && (
                <span className="ml-auto text-xs bg-white px-2 py-0.5 rounded-full text-gray-600">
                  Page {currentPageIndex + 1} of {pages.length}
                </span>
              )}
            </div>

            {/* Background Color */}
            <div className="space-y-2">
              <label className="block text-xs font-medium text-gray-700">
                Background Color
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={currentPage.backgroundColor}
                  onChange={(e) => handlePageBackgroundChange(e.target.value, applyToAllPages)}
                  className="w-12 h-10 border-2 border-white rounded-lg cursor-pointer shadow-sm"
                />
                <input
                  type="text"
                  value={currentPage.backgroundColor}
                  onChange={(e) => handlePageBackgroundChange(e.target.value, applyToAllPages)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                  placeholder="#ffffff"
                />
              </div>

              {/* Color presets */}
              <div className="grid grid-cols-6 gap-2 pt-2">
                {['#ffffff', '#f3f4f6', '#dbeafe', '#fef3c7', '#d1fae5', '#fce7f3'].map((color) => (
                  <button
                    key={color}
                    onClick={() => handlePageBackgroundChange(color, applyToAllPages)}
                    className="w-full h-8 rounded border-2 border-gray-200 hover:border-primary-500 transition-colors shadow-sm"
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>

              {/* Apply to all pages checkbox */}
              {pages.length > 1 && (
                <div className="pt-2 border-t border-gray-200">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={applyToAllPages}
                      onChange={(e) => setApplyToAllPages(e.target.checked)}
                      className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500 cursor-pointer"
                    />
                    <span className="text-xs font-medium text-gray-700 group-hover:text-primary-700">
                      Apply to all pages ({pages.length} pages)
                    </span>
                  </label>
                  {applyToAllPages && (
                    <p className="text-xs text-primary-600 mt-1 ml-6">
                      ✓ All pages will use the same background
                    </p>
                  )}
                </div>
              )}

              <p className="text-xs text-gray-500 mt-2">
                {currentPageIndex === 0 && pages.length === 1
                  ? 'Add a Page Break to create multiple pages with different backgrounds'
                  : applyToAllPages
                  ? `This color will apply to all ${pages.length} pages`
                  : `This color applies to Page ${currentPageIndex + 1}`}
              </p>
            </div>
          </div>
        )}

        {!selectedBlock ? (
          <div className="p-8 text-center">
            <Settings className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-sm font-medium text-gray-900 mb-2">
              No block selected
            </h3>
            <p className="text-sm text-gray-500">
              Select a block on the canvas to edit its properties
            </p>
          </div>
        ) : (
          <div className="p-4 space-y-6">
            {/* Block info */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-2">
                {blockDefinition?.name || 'Block'}
              </h3>
              <p className="text-xs text-gray-500">
                {blockDefinition?.description || ''}
              </p>
            </div>

            {/* Block settings */}
            {blockDefinition?.settings && (
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-gray-900">Settings</h4>
                {blockDefinition.settings.map((setting) => (
                  <div key={setting.name}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {setting.label}
                    </label>

                    {/* Text input */}
                    {setting.type === 'text' && (
                      <input
                        type="text"
                        value={selectedBlock.data[setting.name] || ''}
                        onChange={(e) =>
                          updateBlock(selectedBlock.id, {
                            data: {
                              ...selectedBlock.data,
                              [setting.name]: e.target.value,
                            },
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    )}

                    {/* Number input */}
                    {setting.type === 'number' && (
                      <input
                        type="number"
                        value={selectedBlock.data[setting.name] || 0}
                        onChange={(e) =>
                          updateBlock(selectedBlock.id, {
                            data: {
                              ...selectedBlock.data,
                              [setting.name]: parseInt(e.target.value, 10),
                            },
                          })
                        }
                        min={setting.min}
                        max={setting.max}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    )}

                    {/* Select input */}
                    {setting.type === 'select' && (
                      <select
                        value={selectedBlock.data[setting.name] || setting.options[0]}
                        onChange={(e) =>
                          updateBlock(selectedBlock.id, {
                            data: {
                              ...selectedBlock.data,
                              [setting.name]: e.target.value,
                            },
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      >
                        {setting.options.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    )}

                    {/* Checkbox input */}
                    {setting.type === 'checkbox' && (
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={selectedBlock.data[setting.name] || false}
                          onChange={(e) =>
                            updateBlock(selectedBlock.id, {
                              data: {
                                ...selectedBlock.data,
                                [setting.name]: e.target.checked,
                              },
                            })
                          }
                          className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                        />
                        <span className="text-sm text-gray-700">{setting.label}</span>
                      </label>
                    )}

                    {/* Color input */}
                    {setting.type === 'color' && (
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={selectedBlock.data[setting.name] || '#000000'}
                          onChange={(e) =>
                            updateBlock(selectedBlock.id, {
                              data: {
                                ...selectedBlock.data,
                                [setting.name]: e.target.value,
                              },
                            })
                          }
                          className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                        />
                        <input
                          type="text"
                          value={selectedBlock.data[setting.name] || '#000000'}
                          onChange={(e) =>
                            updateBlock(selectedBlock.id, {
                              data: {
                                ...selectedBlock.data,
                                [setting.name]: e.target.value,
                              },
                            })
                          }
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          placeholder="#000000"
                        />
                      </div>
                    )}

                    {/* Textarea */}
                    {setting.type === 'textarea' && (
                      <textarea
                        value={selectedBlock.data[setting.name] || ''}
                        onChange={(e) =>
                          updateBlock(selectedBlock.id, {
                            data: {
                              ...selectedBlock.data,
                              [setting.name]: e.target.value,
                            },
                          })
                        }
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    )}

                    {/* Rich Text Editor (temporary textarea solution) */}
                    {setting.type === 'richtext' && (
                      <div>
                        <textarea
                          value={selectedBlock.data[setting.name]?.replace(/<[^>]*>/g, '') || ''}
                          onChange={(e) =>
                            updateBlock(selectedBlock.id, {
                              data: {
                                ...selectedBlock.data,
                                [setting.name]: `<p>${e.target.value}</p>`,
                              },
                            })
                          }
                          rows={6}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          placeholder="Type your content here..."
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Note: Full rich text editor coming soon
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Actions */}
            <div className="pt-4 border-t border-gray-200">
              <button
                onClick={() => deleteBlock(selectedBlock.id)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Delete Block
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EditorProperties;
