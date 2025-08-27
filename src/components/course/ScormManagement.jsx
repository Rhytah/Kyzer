import React, { useState, useEffect } from 'react';
import { File, Upload, Trash2, Eye, Download, AlertCircle } from 'lucide-react';
import ScormUpload from './ScormUpload';
import { supabase } from '@/lib/supabase';

const ScormManagement = ({ courseId, lessonId, onScormUpdate }) => {
  const [scormPackages, setScormPackages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedPackage, setSelectedPackage] = useState(null);

  useEffect(() => {
    if (courseId && lessonId) {
      loadScormPackages();
    }
  }, [courseId, lessonId]);

  const loadScormPackages = async () => {
    setLoading(true);
    try {
      // List SCORM packages for this lesson
      const { data, error } = await supabase.storage
        .from('course-content')
        .list(`scorm-packages/${courseId}`, {
          search: lessonId.toString()
        });

      if (error) throw error;

      // Transform storage data to package info
      const packages = data?.map(file => ({
        id: file.id,
        name: file.name,
        size: file.metadata?.size || 0,
        created: file.created_at,
        path: `scorm-packages/${courseId}/${file.name}`
      })) || [];

      setScormPackages(packages);
    } catch (error) {
      console.error('Error loading SCORM packages:', error);
      setError('Failed to load SCORM packages');
    } finally {
      setLoading(false);
    }
  };

  const handleUploadComplete = (scormData) => {
    if (scormData) {
      // Add new package to list
      setScormPackages(prev => [...prev, {
        id: Date.now(),
        name: scormData.fileName,
        size: scormData.fileSize,
        created: new Date().toISOString(),
        path: `scorm-packages/${courseId}/${scormData.fileName}`
      }]);
      
      // Notify parent component
      onScormUpdate?.(scormData);
    }
  };

  const handleDeletePackage = async (packageId) => {
    try {
      const packageToDelete = scormPackages.find(p => p.id === packageId);
      if (!packageToDelete) return;

      // Delete from storage
      const { error } = await supabase.storage
        .from('course-content')
        .remove([packageToDelete.path]);

      if (error) throw error;

      // Remove from local state
      setScormPackages(prev => prev.filter(p => p.id !== packageId));
      
      // Clear selection if deleted package was selected
      if (selectedPackage?.id === packageId) {
        setSelectedPackage(null);
      }

    } catch (error) {
      console.error('Error deleting SCORM package:', error);
      setError('Failed to delete SCORM package');
    }
  };

  const handleSelectPackage = (pkg) => {
    setSelectedPackage(pkg);
    onScormUpdate?.({
      scormUrl: supabase.storage
        .from('course-content')
        .getPublicUrl(pkg.path).data?.publicUrl,
      fileName: pkg.name,
      fileSize: pkg.size
    });
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="scorm-management">
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">SCORM Package Management</h3>
        
        {/* Upload New Package */}
        <ScormUpload
          courseId={courseId}
          lessonId={lessonId}
          onUploadComplete={handleUploadComplete}
          onError={setError}
        />
      </div>

      {/* Existing Packages */}
      {scormPackages.length > 0 && (
        <div className="mb-6">
          <h4 className="text-md font-medium text-gray-900 mb-3">Available Packages</h4>
          <div className="space-y-3">
            {scormPackages.map((pkg) => (
              <div
                key={pkg.id}
                className={`p-4 border rounded-lg transition-colors ${
                  selectedPackage?.id === pkg.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <File className="h-5 w-5 text-gray-600" />
                    <div>
                      <p className="font-medium text-gray-900">{pkg.name}</p>
                      <div className="text-sm text-gray-500 space-x-4">
                        <span>{formatFileSize(pkg.size)}</span>
                        <span>Uploaded: {formatDate(pkg.created)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleSelectPackage(pkg)}
                      className={`px-3 py-1 text-xs rounded transition-colors ${
                        selectedPackage?.id === pkg.id
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {selectedPackage?.id === pkg.id ? 'Selected' : 'Select'}
                    </button>
                    
                    <button
                      onClick={() => handleDeletePackage(pkg.id)}
                      className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
                      title="Delete package"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Selected Package Info */}
      {selectedPackage && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <File className="h-5 w-5 text-green-600" />
              <div>
                <h4 className="font-medium text-green-900">Selected Package</h4>
                <p className="text-sm text-green-700">{selectedPackage.name}</p>
                <p className="text-xs text-green-600">
                  {formatFileSize(selectedPackage.size)} • Uploaded {formatDate(selectedPackage.created)}
                </p>
              </div>
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={() => {
                  const url = supabase.storage
                    .from('course-content')
                    .getPublicUrl(selectedPackage.path).data?.publicUrl;
                  if (url) window.open(url, '_blank');
                }}
                className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 flex items-center space-x-1"
              >
                <Eye className="h-3 w-3" />
                <span>Preview</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center space-x-3">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <div>
              <h4 className="font-medium text-red-900">Error</h4>
              <p className="text-sm text-red-700">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-400 hover:text-red-600"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Help Text */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="text-sm font-medium text-gray-900 mb-2">SCORM Package Guidelines</h4>
        <ul className="text-xs text-gray-600 space-y-1">
          <li>• Upload SCORM 1.2 or 2004 compliant packages (.zip files)</li>
          <li>• Packages should contain imsmanifest.xml and all required assets</li>
          <li>• Maximum file size: 100MB per package</li>
          <li>• Select a package to associate it with this lesson</li>
          <li>• Learners will see the selected package when they access this lesson</li>
        </ul>
      </div>
    </div>
  );
};

export default ScormManagement;

