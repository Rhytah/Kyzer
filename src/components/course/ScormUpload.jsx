import React, { useState, useRef } from 'react';
import { Upload, File, AlertCircle, CheckCircle, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';

const ScormUpload = ({ 
  courseId, 
  lessonId, 
  onUploadComplete, 
  onError,
  existingScormUrl = null 
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState('idle');
  const [scormInfo, setScormInfo] = useState(null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.name.endsWith('.zip')) {
      setError('Please select a valid SCORM package (.zip file)');
      return;
    }

    if (file.size > 100 * 1024 * 1024) {
      setError('File size must be less than 100MB');
      return;
    }

    await uploadScormPackage(file);
  };

  const uploadScormPackage = async (file) => {
    setIsUploading(true);
    setUploadStatus('uploading');
    setError(null);
    setUploadProgress(0);

    try {
      const timestamp = Date.now();
      const fileName = `scorm_${courseId}_${lessonId}_${timestamp}.zip`;
      const filePath = `scorm-packages/${courseId}/${fileName}`;

      const { data, error: uploadError } = await supabase.storage
        .from('course-content')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      const { data: urlData } = supabase.storage
        .from('course-content')
        .getPublicUrl(filePath);

      if (!urlData?.publicUrl) {
        throw new Error('Failed to get public URL for uploaded file');
      }

      setScormInfo({
        fileName: file.name,
        fileSize: file.size,
        uploadDate: new Date().toISOString(),
        publicUrl: urlData.publicUrl
      });

      setUploadStatus('success');
      setUploadProgress(100);

      onUploadComplete?.({
        scormUrl: urlData.publicUrl,
        fileName: file.name,
        fileSize: file.size
      });

    } catch (error) {
      console.error('SCORM upload error:', error);
      setError(error.message);
      setUploadStatus('error');
      onError?.(error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="scorm-upload-container">
      {!scormInfo && (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 hover:bg-blue-50 transition-colors">
          <div className="flex flex-col items-center space-y-4">
            <Upload className="h-8 w-8 text-gray-400" />
            
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                Upload SCORM Package
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Drag and drop a SCORM package (.zip) or click to browse
              </p>
            </div>

            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              Select SCORM Package
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept=".zip"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
        </div>
      )}

      {scormInfo && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <h4 className="font-medium text-green-900">SCORM Package Uploaded</h4>
                <p className="text-sm text-green-700">{scormInfo.fileName}</p>
              </div>
            </div>
            
            <button
              onClick={() => onUploadComplete?.(scormInfo)}
              className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
            >
              Use Package
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center space-x-3">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScormUpload;
