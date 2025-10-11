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
    <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shadow-sm">
      {/* Left section */}
      <div className="flex items-center gap-4">
        <BackButton fallbackPath="/app/courses" />

        <div className="h-6 w-px bg-gray-300" />

        <div className="flex flex-col">
          <h1 className="text-lg font-semibold text-gray-900">
            {currentCourse?.title || 'Untitled Course'}
          </h1>
          <p className="text-xs text-gray-500">
            {hasUnsavedChanges ? 'Unsaved changes' : 'All changes saved'}
          </p>
        </div>
      </div>

      {/* Center section - Editor controls */}
      <div className="flex items-center gap-2">
        {/* Undo/Redo */}
        <div className="flex items-center gap-1 border-r border-gray-200 pr-2 mr-2">
          <button
            onClick={undo}
            disabled={!canUndo}
            className="p-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Undo (Cmd+Z)"
          >
            <Undo className="w-4 h-4" />
          </button>
          <button
            onClick={redo}
            disabled={!canRedo}
            className="p-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Redo (Cmd+Shift+Z)"
          >
            <Redo className="w-4 h-4" />
          </button>
        </div>

        {/* Zoom controls */}
        <div className="flex items-center gap-1 border-r border-gray-200 pr-2 mr-2">
          <button
            onClick={handleZoomOut}
            className="p-2 rounded hover:bg-gray-100"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={handleResetZoom}
            className="px-3 py-1 text-sm font-medium hover:bg-gray-100 rounded"
            title="Reset Zoom"
          >
            {canvas.zoom}%
          </button>
          <button
            onClick={handleZoomIn}
            className="p-2 rounded hover:bg-gray-100"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
        </div>

        {/* View options */}
        <div className="flex items-center gap-1">
          <button
            onClick={actions.toggleGrid}
            className={`p-2 rounded hover:bg-gray-100 ${ui.showGrid ? 'bg-blue-50 text-blue-600' : ''}`}
            title="Toggle Grid"
          >
            <Grid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setEditMode(editMode === 'preview' ? 'edit' : 'preview')}
            className={`p-2 rounded hover:bg-gray-100 ${editMode === 'preview' ? 'bg-blue-50 text-blue-600' : ''}`}
            title="Preview Mode"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Right section - Actions */}
      <div className="flex items-center gap-2">
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
    </div>
  );
};

export default EditorToolbar;
