// src/components/editor/content-blocks/VideoBlock.jsx
import { useState } from 'react';
import { Video as VideoIcon, Link as LinkIcon } from 'lucide-react';
import { useEditor } from '@/hooks/editor';

const VideoBlock = ({ data, isPreviewMode, block }) => {
  const { updateBlock } = useEditor();
  const [urlInput, setUrlInput] = useState(data.src || '');
  const [videoType, setVideoType] = useState(data.type || 'youtube');

  const handleUrlSubmit = (e) => {
    e.preventDefault();
    if (urlInput.trim()) {
      // Auto-detect video type
      let detectedType = videoType;
      if (urlInput.includes('youtube.com') || urlInput.includes('youtu.be')) {
        detectedType = 'youtube';
      } else if (urlInput.includes('vimeo.com')) {
        detectedType = 'vimeo';
      } else {
        detectedType = 'html5';
      }

      updateBlock(block.id, {
        data: { 
          ...data, 
          src: urlInput.trim(),
          type: detectedType,
          controls: true
        }
      });
    }
  };

  if (!data.src || data.src === '') {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg">
        <VideoIcon className="w-12 h-12 text-gray-400 mb-4" />
        <p className="text-gray-500 text-sm mb-4">Add a video</p>
        {!isPreviewMode && (
          <form onSubmit={handleUrlSubmit} className="w-full max-w-md">
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Video Type
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setVideoType('youtube')}
                  className={`flex-1 px-3 py-2 rounded-lg border ${
                    videoType === 'youtube'
                      ? 'bg-red-50 border-red-500 text-red-700'
                      : 'bg-white border-gray-300 text-gray-600'
                  }`}
                >
                  YouTube
                </button>
                <button
                  type="button"
                  onClick={() => setVideoType('vimeo')}
                  className={`flex-1 px-3 py-2 rounded-lg border ${
                    videoType === 'vimeo'
                      ? 'bg-blue-50 border-blue-500 text-blue-700'
                      : 'bg-white border-gray-300 text-gray-600'
                  }`}
                >
                  Vimeo
                </button>
                <button
                  type="button"
                  onClick={() => setVideoType('html5')}
                  className={`flex-1 px-3 py-2 rounded-lg border ${
                    videoType === 'html5'
                      ? 'bg-primary-50 border-primary-500 text-primary-700'
                      : 'bg-white border-gray-300 text-gray-600'
                  }`}
                >
                  Direct URL
                </button>
              </div>
            </div>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <LinkIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="url"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder={
                    videoType === 'youtube' 
                      ? 'https://youtube.com/watch?v=...' 
                      : videoType === 'vimeo'
                      ? 'https://vimeo.com/...'
                      : 'https://example.com/video.mp4'
                  }
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                Add
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-2 text-center">
              {videoType === 'youtube' && 'Enter a YouTube video URL'}
              {videoType === 'vimeo' && 'Enter a Vimeo video URL'}
              {videoType === 'html5' && 'Enter a direct video file URL (.mp4, .webm, etc.)'}
            </p>
          </form>
        )}
      </div>
    );
  }

  // Handle different video types
  const renderVideo = () => {
    if (data.type === 'youtube') {
      // Extract YouTube video ID
      const videoId = data.src.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/)?.[1];

      if (videoId) {
        return (
          <iframe
            src={`https://www.youtube.com/embed/${videoId}`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full rounded-lg"
          />
        );
      }
    }

    if (data.type === 'vimeo') {
      // Extract Vimeo video ID
      const videoId = data.src.match(/vimeo\.com\/(\d+)/)?.[1];

      if (videoId) {
        return (
          <iframe
            src={`https://player.vimeo.com/video/${videoId}`}
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
            className="w-full h-full rounded-lg"
          />
        );
      }
    }

    // Default to HTML5 video
    return (
      <video
        src={data.src}
        controls={data.controls}
        autoPlay={data.autoplay}
        loop={data.loop}
        muted={data.muted}
        className="w-full h-full rounded-lg"
      >
        Your browser does not support the video tag.
      </video>
    );
  };

  const handleSizeChange = (field, value) => {
    updateBlock(block.id, {
      data: { ...data, [field]: value }
    });
  };

  return (
    <div>
      <div
        style={{
          width: data.width || '100%',
          height: data.height || '400px',
        }}
      >
        {renderVideo()}
      </div>
      {!isPreviewMode && (
        <div className="mt-2 space-y-2">
          <div className="flex gap-2 items-center">
            <input
              type="url"
              value={data.src}
              onChange={(e) => {
                if (e.target.value) {
                  let detectedType = data.type;
                  if (e.target.value.includes('youtube.com') || e.target.value.includes('youtu.be')) {
                    detectedType = 'youtube';
                  } else if (e.target.value.includes('vimeo.com')) {
                    detectedType = 'vimeo';
                  } else {
                    detectedType = 'html5';
                  }
                  updateBlock(block.id, {
                    data: { ...data, src: e.target.value, type: detectedType }
                  });
                }
              }}
              placeholder="Video URL"
              className="flex-1 px-3 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <span className="text-xs text-gray-500 px-2 py-1 bg-gray-100 rounded">
              {data.type === 'youtube' ? 'YouTube' : data.type === 'vimeo' ? 'Vimeo' : 'Direct'}
            </span>
            <button
              onClick={() => {
                updateBlock(block.id, {
                  data: { ...data, src: '' }
                });
                setUrlInput('');
              }}
              className="px-3 py-1 text-sm text-red-600 hover:text-red-700 border border-red-300 rounded hover:bg-red-50 transition-colors"
            >
              Remove
            </button>
          </div>

          {/* Video sizing controls */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Width</label>
              <select
                value={data.width || '100%'}
                onChange={(e) => handleSizeChange('width', e.target.value)}
                className="w-full px-3 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="100%">Full Width (100%)</option>
                <option value="75%">Large (75%)</option>
                <option value="50%">Medium (50%)</option>
                <option value="33%">Small (33%)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Height</label>
              <select
                value={data.height || '400px'}
                onChange={(e) => handleSizeChange('height', e.target.value)}
                className="w-full px-3 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="200px">Small (200px)</option>
                <option value="300px">Medium (300px)</option>
                <option value="400px">Large (400px)</option>
                <option value="500px">X-Large (500px)</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoBlock;
