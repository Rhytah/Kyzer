import React, { useState, useCallback } from 'react';
import { 
  Monitor, 
  Smartphone, 
  Tablet, 
  BookOpen, 
  Presentation, 
  FileText,
  Settings,
  Eye,
  Download,
  Share
} from 'lucide-react';

// Format preview component
const FormatPreview = ({ 
  format, 
  images, 
  isActive, 
  onSelect, 
  className = '' 
}) => {
  const formatConfig = {
    slideshow: {
      icon: Presentation,
      name: 'Slideshow',
      description: 'Full-screen presentation mode',
      color: 'bg-blue-500'
    },
    booklet: {
      icon: BookOpen,
      name: 'Booklet',
      description: 'Two-page spread layout',
      color: 'bg-green-500'
    },
    grid: {
      icon: Monitor,
      name: 'Grid View',
      description: 'Multiple pages at once',
      color: 'bg-purple-500'
    },
    mobile: {
      icon: Smartphone,
      name: 'Mobile',
      description: 'Optimized for mobile devices',
      color: 'bg-orange-500'
    },
    document: {
      icon: FileText,
      name: 'Document',
      description: 'Scrollable document view',
      color: 'bg-gray-500'
    }
  };

  const config = formatConfig[format];
  const Icon = config.icon;

  return (
    <div
      className={`
        relative p-4 rounded-lg border-2 cursor-pointer transition-all duration-200
        ${isActive 
          ? 'border-blue-500 bg-blue-50 shadow-lg' 
          : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
        }
        ${className}
      `}
      onClick={() => onSelect(format)}
    >
      <div className="flex items-center gap-3 mb-2">
        <div className={`p-2 rounded-lg ${config.color} text-white`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-medium text-gray-900">{config.name}</h3>
          <p className="text-sm text-gray-600">{config.description}</p>
        </div>
      </div>
      
      {/* Preview thumbnail */}
      <div className="mt-3 bg-gray-100 rounded p-2">
        {format === 'slideshow' && (
          <div className="aspect-video bg-white rounded border flex items-center justify-center">
            <Presentation className="w-6 h-6 text-gray-400" />
          </div>
        )}
        {format === 'booklet' && (
          <div className="flex gap-1">
            <div className="flex-1 aspect-[3/4] bg-white rounded border"></div>
            <div className="flex-1 aspect-[3/4] bg-white rounded border"></div>
          </div>
        )}
        {format === 'grid' && (
          <div className="grid grid-cols-2 gap-1">
            {[1,2,3,4].map(i => (
              <div key={i} className="aspect-square bg-white rounded border"></div>
            ))}
          </div>
        )}
        {format === 'mobile' && (
          <div className="aspect-[9/16] bg-white rounded border mx-auto max-w-[60px]"></div>
        )}
        {format === 'document' && (
          <div className="space-y-1">
            {[1,2,3].map(i => (
              <div key={i} className="h-2 bg-white rounded border"></div>
            ))}
          </div>
        )}
      </div>
      
      {isActive && (
        <div className="absolute top-2 right-2 w-3 h-3 bg-blue-500 rounded-full"></div>
      )}
    </div>
  );
};

// Settings panel for format customization
const FormatSettings = ({ 
  format, 
  settings, 
  onSettingsChange, 
  isOpen, 
  onToggle 
}) => {
  if (!isOpen) {
    return (
      <button
        onClick={onToggle}
        className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
      >
        <Settings className="w-4 h-4" />
        Customize
      </button>
    );
  }

  const renderSettings = () => {
    switch (format) {
      case 'slideshow':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Auto-advance (seconds)
              </label>
              <input
                type="number"
                min="0"
                max="60"
                value={settings.autoAdvance || 0}
                onChange={(e) => onSettingsChange({ autoAdvance: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">0 = manual advance only</p>
            </div>
            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={settings.showNavigation || false}
                  onChange={(e) => onSettingsChange({ showNavigation: e.target.checked })}
                  className="rounded border-gray-300"
                />
                <span className="text-sm text-gray-700">Show navigation controls</span>
              </label>
            </div>
            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={settings.loop || false}
                  onChange={(e) => onSettingsChange({ loop: e.target.checked })}
                  className="rounded border-gray-300"
                />
                <span className="text-sm text-gray-700">Loop presentation</span>
              </label>
            </div>
          </div>
        );
        
      case 'booklet':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Page size
              </label>
              <select
                value={settings.pageSize || 'a4'}
                onChange={(e) => onSettingsChange({ pageSize: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="a4">A4</option>
                <option value="letter">Letter</option>
                <option value="legal">Legal</option>
              </select>
            </div>
            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={settings.showMargins || false}
                  onChange={(e) => onSettingsChange({ showMargins: e.target.checked })}
                  className="rounded border-gray-300"
                />
                <span className="text-sm text-gray-700">Show page margins</span>
              </label>
            </div>
          </div>
        );
        
      case 'grid':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Columns
              </label>
              <input
                type="number"
                min="1"
                max="6"
                value={settings.columns || 3}
                onChange={(e) => onSettingsChange({ columns: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={settings.uniformSize || false}
                  onChange={(e) => onSettingsChange({ uniformSize: e.target.checked })}
                  className="rounded border-gray-300"
                />
                <span className="text-sm text-gray-700">Uniform image sizes</span>
              </label>
            </div>
          </div>
        );
        
      default:
        return (
          <div className="text-sm text-gray-500">
            No custom settings available for this format.
          </div>
        );
    }
  };

  return (
    <div className="bg-gray-50 rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-gray-900">Format Settings</h4>
        <button
          onClick={onToggle}
          className="text-gray-400 hover:text-gray-600"
        >
          ×
        </button>
      </div>
      {renderSettings()}
    </div>
  );
};

// Main MultiFormatLayout component
const MultiFormatLayout = ({ 
  images = [], 
  onFormatChange, 
  onSettingsChange,
  initialFormat = 'slideshow',
  className = ''
}) => {
  const [selectedFormat, setSelectedFormat] = useState(initialFormat);
  const [showSettings, setShowSettings] = useState(false);
  const [formatSettings, setFormatSettings] = useState({});

  const formats = ['slideshow', 'booklet', 'grid', 'mobile', 'document'];

  const handleFormatSelect = useCallback((format) => {
    setSelectedFormat(format);
    onFormatChange(format);
  }, [onFormatChange]);

  const handleSettingsChange = useCallback((newSettings) => {
    const updatedSettings = {
      ...formatSettings,
      ...newSettings
    };
    setFormatSettings(updatedSettings);
    onSettingsChange(updatedSettings);
  }, [formatSettings, onSettingsChange]);

  const handlePreview = useCallback(() => {
    // This would open a preview modal or navigate to preview
    console.log('Preview format:', selectedFormat, 'with settings:', formatSettings);
  }, [selectedFormat, formatSettings]);

  const handleExport = useCallback(() => {
    // This would handle exporting in the selected format
    console.log('Export format:', selectedFormat, 'with settings:', formatSettings);
  }, [selectedFormat, formatSettings]);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Choose Layout Format</h2>
          <p className="text-sm text-gray-600">
            Select how you want to present your PDF pages
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={handlePreview}
            className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
          >
            <Eye className="w-4 h-4" />
            Preview
          </button>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Format selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {formats.map((format) => (
          <FormatPreview
            key={format}
            format={format}
            images={images}
            isActive={selectedFormat === format}
            onSelect={handleFormatSelect}
          />
        ))}
      </div>

      {/* Format settings */}
      <div>
        <FormatSettings
          format={selectedFormat}
          settings={formatSettings}
          onSettingsChange={handleSettingsChange}
          isOpen={showSettings}
          onToggle={() => setShowSettings(!showSettings)}
        />
      </div>

      {/* Summary */}
      <div className="bg-blue-50 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">Selected Configuration</h4>
        <div className="text-sm text-blue-800">
          <p><strong>Format:</strong> {selectedFormat}</p>
          <p><strong>Pages:</strong> {images.length}</p>
          {Object.keys(formatSettings).length > 0 && (
            <p><strong>Settings:</strong> {JSON.stringify(formatSettings, null, 2)}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default MultiFormatLayout;
