// src/components/editor/EditorToolbar.jsx
import { useState } from 'react';
import {
  Save,
  Undo,
  Redo,
  Eye,
  Download,
  Settings,
  Grid,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Loader2,
} from 'lucide-react';
import { useEditor } from '@/hooks/editor';
import { useEditorStore } from '@/store/editorStore';
import BackButton from '@/components/ui/BackButton';
import Tooltip from '@/components/ui/Tooltip';

const EditorToolbar = ({ currentCourse, isSaving, hasUnsavedChanges, onSave, editMode }) => {
  const { undo, redo, canUndo, canRedo, setEditMode } = useEditor();
  const { canvas, ui, actions } = useEditorStore();
  const [showExportMenu, setShowExportMenu] = useState(false);

  const handleZoomIn = () => {
    actions.setZoom(Math.min(canvas.zoom + 10, 200));
  };

  const handleZoomOut = () => {
    actions.setZoom(Math.max(canvas.zoom - 10, 25));
  };

  const handleResetZoom = () => {
    actions.setZoom(100);
  };

  const handleExport = (format) => {
    // TODO: Implement export functionality
    setShowExportMenu(false);
  };

  return (
    <div className="flex items-center gap-2">
      {/* Editor controls */}
        {/* Undo/Redo */}
        <div className="flex items-center gap-1 border-r border-gray-200 pr-2 mr-2">
          <Tooltip content="Undo (⌘Z)" position="bottom">
            <button
              onClick={undo}
              disabled={!canUndo}
              className="p-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Undo className="w-4 h-4" />
            </button>
          </Tooltip>
          <Tooltip content="Redo (⌘⇧Z)" position="bottom">
            <button
              onClick={redo}
              disabled={!canRedo}
              className="p-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Redo className="w-4 h-4" />
            </button>
          </Tooltip>
        </div>

        {/* Zoom controls */}
        <div className="flex items-center gap-1 border-r border-gray-200 pr-2 mr-2">
          <Tooltip content="Zoom out" position="bottom">
            <button
              onClick={handleZoomOut}
              className="p-2 rounded hover:bg-gray-100"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
          </Tooltip>
          <Tooltip content="Reset zoom to 100%" position="bottom">
            <button
              onClick={handleResetZoom}
              className="px-3 py-1 text-sm font-medium hover:bg-gray-100 rounded"
            >
              {canvas.zoom}%
            </button>
          </Tooltip>
          <Tooltip content="Zoom in" position="bottom">
            <button
              onClick={handleZoomIn}
              className="p-2 rounded hover:bg-gray-100"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </Tooltip>
        </div>

        {/* View options */}
        <div className="flex items-center gap-1">
          <Tooltip content={ui.showGrid ? "Hide grid" : "Show grid"} position="bottom">
            <button
              onClick={actions.toggleGrid}
              className={`p-2 rounded hover:bg-gray-100 ${ui.showGrid ? 'bg-blue-50 text-blue-600' : ''}`}
            >
              <Grid className="w-4 h-4" />
            </button>
          </Tooltip>
          <Tooltip content={editMode === 'preview' ? "Exit preview mode" : "Preview mode"} position="bottom">
            <button
              onClick={() => setEditMode(editMode === 'preview' ? 'edit' : 'preview')}
              className={`p-2 rounded hover:bg-gray-100 ${editMode === 'preview' ? 'bg-blue-50 text-blue-600' : ''}`}
            >
              <Eye className="w-4 h-4" />
            </button>
          </Tooltip>
        </div>

      {/* Right section - Actions */}
        {/* Export menu */}
        <div className="relative">
          <button
            onClick={() => setShowExportMenu(!showExportMenu)}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export
          </button>

          {showExportMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
              <div className="py-1">
                <button
                  onClick={() => handleExport('pdf')}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                >
                  Export as PDF
                </button>
                <button
                  onClick={() => handleExport('html')}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                >
                  Export as HTML
                </button>
                <button
                  onClick={() => handleExport('scorm')}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                >
                  Export as SCORM
                </button>
                <button
                  onClick={() => handleExport('json')}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                >
                  Export as JSON
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Save button */}
        <button
          onClick={onSave}
          disabled={isSaving || !hasUnsavedChanges}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Save
            </>
          )}
        </button>
    </div>
  );
};

export default EditorToolbar;
