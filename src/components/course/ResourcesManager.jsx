// src/components/course/ResourcesManager.jsx
import { useState } from 'react';
import { Link, Plus, Trash2, Upload, ExternalLink, File } from 'lucide-react';
import Button from '@/components/ui/Button';
import { uploadFile, getFileUrl, STORAGE_BUCKETS } from '@/lib/supabase';

export default function ResourcesManager({ resources = [], onChange, courseId, label = 'Resources' }) {
  const [newResource, setNewResource] = useState({
    type: 'link',
    title: '',
    url: '',
    description: '',
    file: null
  });
  const [uploading, setUploading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  // Normalize URL to ensure it has a protocol
  const normalizeUrl = (url) => {
    if (!url) return url;
    const trimmed = url.trim();
    // If URL doesn't start with http:// or https://, add https://
    if (!trimmed.match(/^https?:\/\//i)) {
      return `https://${trimmed}`;
    }
    return trimmed;
  };

  const handleAddResource = async () => {
    if (!newResource.title.trim()) return;

    let resourceData = {
      id: `resource_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: newResource.type,
      title: newResource.title.trim(),
      description: newResource.description.trim() || null,
      created_at: new Date().toISOString()
    };

    if (newResource.type === 'link') {
      if (!newResource.url.trim()) return;
      resourceData.url = normalizeUrl(newResource.url);
    } else if (newResource.type === 'file' && newResource.file) {
      setUploading(true);
      try {
        // Pass directory only - uploadFile will handle filename sanitization
        const subdir = `resources/${courseId || 'general'}`;
        const path = await uploadFile(STORAGE_BUCKETS.COURSE_CONTENT, subdir, newResource.file);
        const publicUrl = getFileUrl(STORAGE_BUCKETS.COURSE_CONTENT, path.path);
        
        resourceData.url = publicUrl;
        resourceData.file_path = path.path;
        resourceData.file_name = newResource.file.name; // Keep original name for display
        resourceData.file_size = newResource.file.size;
      } catch (error) {
        setUploading(false);
        return;
      }
      setUploading(false);
    } else {
      return;
    }

    const updatedResources = [...(resources || []), resourceData];
    onChange(updatedResources);
    
    setNewResource({
      type: 'link',
      title: '',
      url: '',
      description: '',
      file: null
    });
    setShowAddForm(false);
  };

  const handleRemoveResource = (resourceId) => {
    const updatedResources = (resources || []).filter(r => r.id !== resourceId);
    onChange(updatedResources);
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setShowAddForm(!showAddForm)}
        >
          <Plus className="w-4 h-4 mr-1" />
          Add Resource
        </Button>
      </div>

      {showAddForm && (
        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Resource Type
            </label>
            <select
              value={newResource.type}
              onChange={(e) => setNewResource({ ...newResource, type: e.target.value, file: null })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="link">Link</option>
              <option value="file">File Upload</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Title *
            </label>
            <input
              type="text"
              value={newResource.title}
              onChange={(e) => setNewResource({ ...newResource, title: e.target.value })}
              placeholder="Resource title"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>

          {newResource.type === 'link' ? (
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                URL *
              </label>
              <input
                type="url"
                value={newResource.url}
                onChange={(e) => setNewResource({ ...newResource, url: e.target.value })}
                placeholder="https://example.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
          ) : (
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                File *
              </label>
              <input
                type="file"
                onChange={(e) => setNewResource({ ...newResource, file: e.target.files?.[0] || null })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Description (Optional)
            </label>
            <textarea
              value={newResource.description}
              onChange={(e) => setNewResource({ ...newResource, description: e.target.value })}
              placeholder="Brief description"
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              size="sm"
              onClick={handleAddResource}
              disabled={uploading || !newResource.title.trim() || (newResource.type === 'link' && !newResource.url.trim()) || (newResource.type === 'file' && !newResource.file)}
            >
              {uploading ? 'Uploading...' : 'Add'}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setShowAddForm(false);
                setNewResource({ type: 'link', title: '', url: '', description: '', file: null });
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {resources && resources.length > 0 ? (
        <div className="space-y-2">
          {resources.map((resource) => (
            <div
              key={resource.id}
              className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {resource.type === 'link' ? (
                  <ExternalLink className="w-4 h-4 text-blue-600 flex-shrink-0" />
                ) : (
                  <File className="w-4 h-4 text-gray-600 flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <a
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium text-gray-900 hover:text-blue-600 truncate"
                    >
                      {resource.title}
                    </a>
                    {resource.file_size && (
                      <span className="text-xs text-gray-500">
                        ({formatFileSize(resource.file_size)})
                      </span>
                    )}
                  </div>
                  {resource.description && (
                    <p className="text-xs text-gray-500 mt-1">{resource.description}</p>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleRemoveResource(resource.id)}
                className="p-1 text-red-600 hover:bg-red-50 rounded"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      ) : !showAddForm ? (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-white">
          <div className="flex flex-col items-center gap-3">
            <div className="p-3 bg-gray-100 rounded-full">
              <Link className="w-8 h-8 text-gray-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">No resources added yet</p>
              <p className="text-xs text-gray-500 mt-1">Add links, PDFs, videos, or other helpful materials</p>
            </div>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={() => setShowAddForm(true)}
              className="mt-2"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Your First Resource
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
