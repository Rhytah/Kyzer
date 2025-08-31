import React, { useState } from 'react';
import { ScormPlayer, ScormUpload } from '@/components/course';
import { Card } from '@/components/ui';
import { File, Play, Upload, Info } from 'lucide-react';

const ScormDemo = () => {
  const [demoScormUrl, setDemoScormUrl] = useState('');
  const [showPlayer, setShowPlayer] = useState(false);
  const [uploadedPackage, setUploadedPackage] = useState(null);

  const handleUploadComplete = (scormData) => {
    if (scormData) {
      setUploadedPackage(scormData);
      setDemoScormUrl(scormData.scormUrl);
      setShowPlayer(true);
    }
  };

  const handleScormProgress = (score) => {
    console.log('SCORM Progress Update:', score);
  };

  const handleScormComplete = (completionData) => {
    console.log("SCORM Completed:", completionData);
    alert(`SCORM package completed! Score: ${completionData.score}%, Status: ${completionData.status}`);
  };

  const handleScormError = (error) => {
    console.error('SCORM Error:', error);
    alert(`SCORM Error: ${error}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">SCORM Package Demo</h1>
          <p className="text-gray-600 max-w-3xl">
            This page demonstrates SCORM (Sharable Content Object Reference Model) functionality in the Kyzer LMS. 
            Upload a SCORM package to test tracking, progress, and completion features.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Upload and Info */}
          <div className="space-y-6">
            {/* SCORM Upload */}
            <Card className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <Upload className="h-6 w-6 text-blue-600" />
                <h2 className="text-xl font-semibold text-gray-900">Upload SCORM Package</h2>
              </div>
              
              <ScormUpload
                courseId="demo-course"
                lessonId="demo-lesson"
                onUploadComplete={handleUploadComplete}
                onError={(error) => alert(`Upload error: ${error}`)}
              />
            </Card>

            {/* SCORM Information */}
            <Card className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <Info className="h-6 w-6 text-green-600" />
                <h2 className="text-xl font-semibold text-gray-900">About SCORM</h2>
              </div>
              
              <div className="space-y-4 text-sm text-gray-600">
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">What is SCORM?</h3>
                  <p>
                    SCORM (Sharable Content Object Reference Model) is a set of technical standards for e-learning software products. 
                    It enables interoperability between learning management systems and content authoring tools.
                  </p>
                </div>
                
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Supported Versions</h3>
                  <ul className="list-disc list-inside space-y-1">
                    <li><strong>SCORM 1.2:</strong> Basic tracking and completion</li>
                    <li><strong>SCORM 2004:</strong> Advanced sequencing and navigation</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Features</h3>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Progress tracking and completion</li>
                    <li>Score recording and assessment</li>
                    <li>Time tracking and session management</li>
                    <li>Sequencing and navigation control</li>
                    <li>Data persistence across sessions</li>
                  </ul>
                </div>
              </div>
            </Card>

            {/* Demo Controls */}
            {uploadedPackage && (
              <Card className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <File className="h-6 w-6 text-purple-600" />
                  <h2 className="text-xl font-semibold text-gray-900">Demo Controls</h2>
                </div>
                
                <div className="space-y-3">
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm font-medium text-blue-900 mb-1">Uploaded Package</p>
                    <p className="text-xs text-blue-700">{uploadedPackage.fileName}</p>
                    <p className="text-xs text-blue-600">
                      Size: {(uploadedPackage.fileSize / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  
                  <div className="flex space-x-3">
                    <button
                      onClick={() => setShowPlayer(true)}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                    >
                      <Play className="h-4 w-4" />
                      <span>Launch SCORM</span>
                    </button>
                    
                    <button
                      onClick={() => setShowPlayer(false)}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      Hide Player
                    </button>
                  </div>
                </div>
              </Card>
            )}
          </div>

          {/* Right Column - SCORM Player */}
          <div className="space-y-6">
            {showPlayer && demoScormUrl ? (
              <Card className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <Play className="h-6 w-6 text-green-600" />
                  <h2 className="text-xl font-semibold text-gray-900">SCORM Player</h2>
                </div>
                
                <ScormPlayer
                  scormUrl={demoScormUrl}
                  lessonId="demo-lesson"
                  courseId="demo-course"
                  onProgress={handleScormProgress}
                  onComplete={handleScormComplete}
                  onError={handleScormError}
                  height="500px"
                />
                
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    <strong>Demo Mode:</strong> This is a demonstration environment. 
                    Progress and completion data will be logged to the console but not saved permanently.
                  </p>
                </div>
              </Card>
            ) : (
              <Card className="p-6">
                <div className="text-center py-12">
                  <File className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No SCORM Package Loaded</h3>
                  <p className="text-gray-600">
                    Upload a SCORM package using the form on the left to start testing.
                  </p>
                </div>
              </Card>
            )}

            {/* Console Output */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Console Output</h2>
              <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm h-48 overflow-y-auto">
                <p>// SCORM activity will be logged here</p>
                <p>// Open browser console to see detailed logs</p>
                <p>// Progress updates, completion events, and errors</p>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Check the browser console (F12) for real-time SCORM API calls and data.
              </p>
            </Card>
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-12 p-6 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-medium text-blue-900 mb-2">Testing SCORM Packages</h3>
          <div className="text-sm text-blue-800 space-y-2">
            <p>
              <strong>For Testing:</strong> You can use any SCORM 1.2 or 2004 compliant package. 
              Many e-learning authoring tools provide sample SCORM packages for testing purposes.
            </p>
            <p>
              <strong>Expected Behavior:</strong> The SCORM player will track progress, record scores, 
              and handle completion events according to the SCORM specification.
            </p>
            <p>
              <strong>Browser Console:</strong> All SCORM API calls and data exchanges are logged to 
              the browser console for debugging and verification.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScormDemo;

