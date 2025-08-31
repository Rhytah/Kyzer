// src/components/course/LessonForm.jsx
import { useState, useEffect, useRef } from 'react';
import { useCourseStore } from '@/store/courseStore';
import { useAuth } from '@/hooks/auth/useAuth';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { useToast } from '@/components/ui';
import {
  uploadFile,
  getFileUrl,
  STORAGE_BUCKETS,
  validateFileType,
  validateFileSize
} from '@/lib/supabase';

export default function LessonForm({ lesson = null, courseId, onSuccess, onCancel }) {
  const { user } = useAuth();
  const { success, error: showError } = useToast();
  
  // Store selectors - individual to prevent infinite loops
  const createLesson = useCourseStore(state => state.actions.createLesson);
  const updateLesson = useCourseStore(state => state.actions.updateLesson);
  const fetchCourseModules = useCourseStore(state => state.actions.fetchCourseModules);
  const isLessonTitleUnique = useCourseStore(state => state.actions.isLessonTitleUnique);

  const [formData, setFormData] = useState({
    title: '',
    content_type: 'video',
    content_url: '',
    content_text: '',
    content_format: 'plaintext',
    duration_minutes: '',
    order_index: 1,
    is_required: true,
    module_id: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isEditing] = useState(!!lesson);
  const [modules, setModules] = useState([]);
  const [loadingModules, setLoadingModules] = useState(false);
  const [videoSourceType, setVideoSourceType] = useState('external'); // 'external' | 'upload'
  const [videoFile, setVideoFile] = useState(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [splitPreview, setSplitPreview] = useState(false);
  const [pdfSourceType, setPdfSourceType] = useState('external'); // 'external' | 'upload'
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState('');

  // Initialize form with lesson data if editing
  useEffect(() => {
    if (lesson) {
      // Detect saved format marker in content_text
      const detectFormat = (text) => {
        if (!text) return { format: 'plaintext', text: '' };
        const match = text.match(/^<!--content_format:(markdown|html|plaintext)-->([\s\S]*)/);
        if (match) {
          return { format: match[1], text: match[2] };
        }
        return { format: 'plaintext', text };
      };
      const detected = detectFormat(lesson.content_text || '');
      setFormData({
        title: lesson.title || '',
        content_type: lesson.content_type || 'video',
        content_url: lesson.content_url || '',
        content_text: detected.text || '',
        content_format: detected.format || 'plaintext',
        duration_minutes: lesson.duration_minutes || '',
        order_index: lesson.order_index || 1,
        is_required: lesson.is_required !== undefined ? lesson.is_required : true,
        module_id: lesson.module_id || '' // Assuming lesson object has module_id
      });
      if ((lesson.content_type || 'video') === 'video') {
        if (lesson.content_url) setVideoSourceType('external');
      }
    }
  }, [lesson]);

  // Load last used format for new text lessons
  useEffect(() => {
    if (!lesson && formData.content_type === 'text') {
      try {
        const saved = window.localStorage.getItem('kyzer_text_format');
        if (saved && ['plaintext', 'markdown', 'html'].includes(saved)) {
          setFormData(prev => ({ ...prev, content_format: saved }));
        }
      } catch (_) {}
    }
  }, [lesson, formData.content_type]);

  // Fetch modules for the course
  useEffect(() => {
    const loadModules = async () => {
      if (courseId) {
        setLoadingModules(true);
        try {
          const result = await fetchCourseModules(courseId);
          if (result.data) {
            setModules(result.data);
          }
        } catch (error) {
          console.error('Failed to load modules:', error);
        } finally {
          setLoadingModules(false);
        }
      }
    };

    loadModules();
  }, [courseId, fetchCourseModules]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (name === 'content_format') {
      try { window.localStorage.setItem('kyzer_text_format', value); } catch (_) {}
    }
  };

  // Formatting helpers for Markdown editing
  const textareaRef = useRef(null);
  const wrapSelection = (before, after = before) => {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart || 0;
    const end = el.selectionEnd || 0;
    const text = formData.content_text || '';
    const selected = text.substring(start, end);
    const updated = text.substring(0, start) + before + selected + after + text.substring(end);
    setFormData(prev => ({ ...prev, content_text: updated, content_format: prev.content_format === 'plaintext' ? 'markdown' : prev.content_format }));
    requestAnimationFrame(() => {
      const cursor = start + before.length + selected.length + after.length;
      el.focus();
      el.setSelectionRange(cursor, cursor);
    });
  };

  const applyFormat = (action) => {
    switch (action) {
      case 'bold':
        wrapSelection('**', '**');
        break;
      case 'italic':
        wrapSelection('*', '*');
        break;
      case 'h1':
        wrapSelection('# ');
        break;
      case 'h2':
        wrapSelection('## ');
        break;
      case 'h3':
        wrapSelection('### ');
        break;
      case 'ul':
        // prefix selection lines
        {
          const el = textareaRef.current;
          if (!el) break;
          const start = el.selectionStart || 0;
          const end = el.selectionEnd || 0;
          const text = formData.content_text || '';
          const before = text.substring(0, start);
          const selected = text.substring(start, end) || '';
          const after = text.substring(end);
          const lines = (selected || '').split('\n');
          const prefixed = lines.map(l => (l.length ? `- ${l}` : l)).join('\n');
          const updated = before + prefixed + after;
          setFormData(prev => ({ ...prev, content_text: updated, content_format: prev.content_format === 'plaintext' ? 'markdown' : prev.content_format }));
          requestAnimationFrame(() => {
            const cursor = start + prefixed.length;
            el.focus();
            el.setSelectionRange(cursor, cursor);
          });
        }
        break;
      case 'ol':
        {
          const el = textareaRef.current;
          if (!el) break;
          const start = el.selectionStart || 0;
          const end = el.selectionEnd || 0;
          const text = formData.content_text || '';
          const before = text.substring(0, start);
          const selected = text.substring(start, end) || '';
          const after = text.substring(end);
          const lines = (selected || '').split('\n');
          const prefixed = lines.map((l, idx) => (l.length ? `${idx + 1}. ${l}` : l)).join('\n');
          const updated = before + prefixed + after;
          setFormData(prev => ({ ...prev, content_text: updated, content_format: prev.content_format === 'plaintext' ? 'markdown' : prev.content_format }));
          requestAnimationFrame(() => {
            const cursor = start + prefixed.length;
            el.focus();
            el.setSelectionRange(cursor, cursor);
          });
        }
        break;
      case 'quote':
        {
          const el = textareaRef.current;
          if (!el) break;
          const start = el.selectionStart || 0;
          const end = el.selectionEnd || 0;
          const text = formData.content_text || '';
          const before = text.substring(0, start);
          const selected = text.substring(start, end) || '';
          const after = text.substring(end);
          const lines = (selected || '').split('\n');
          const prefixed = lines.map(l => (l.length ? `> ${l}` : l)).join('\n');
          const updated = before + prefixed + after;
          setFormData(prev => ({ ...prev, content_text: updated, content_format: prev.content_format === 'plaintext' ? 'markdown' : prev.content_format }));
          requestAnimationFrame(() => {
            const cursor = start + prefixed.length;
            el.focus();
            el.setSelectionRange(cursor, cursor);
          });
        }
        break;
      case 'code-inline':
        wrapSelection('`', '`');
        break;
      case 'code-block':
        wrapSelection('```\n', '\n```');
        break;
      case 'link':
        wrapSelection('[', '](https://)');
        break;
      case 'hr':
        {
          const el = textareaRef.current;
          if (!el) break;
          const start = el.selectionStart || 0;
          const end = el.selectionEnd || 0;
          const text = formData.content_text || '';
          const updated = text.substring(0, start) + '\n\n---\n\n' + text.substring(end);
          setFormData(prev => ({ ...prev, content_text: updated, content_format: prev.content_format === 'plaintext' ? 'markdown' : prev.content_format }));
          requestAnimationFrame(() => {
            const cursor = start + 6;
            el.focus();
            el.setSelectionRange(cursor, cursor);
          });
        }
        break;
      default:
        break;
    }
  };

  const escapeHtml = (unsafe) => {
    return unsafe
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll('\'', '&#039;');
  };

  const renderMarkdownToHtml = (md) => {
    const escaped = escapeHtml(md);
    let html = escaped;
    html = html.replace(/^######\s?(.*)$/gm, '<h6>$1</h6>')
               .replace(/^#####\s?(.*)$/gm, '<h5>$1</h5>')
               .replace(/^####\s?(.*)$/gm, '<h4>$1</h4>')
               .replace(/^###\s?(.*)$/gm, '<h3>$1</h3>')
               .replace(/^##\s?(.*)$/gm, '<h2>$1</h2>')
               .replace(/^#\s?(.*)$/gm, '<h1>$1</h1>');
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
               .replace(/\*(.*?)\*/g, '<em>$1</em>');
    html = html.replace(/`([^`]+)`/g, '<code>$1<\/code>')
               .replace(/\[(.*?)\]\((https?:\/\/[^\s)]+)\)/g, '<a href=\"$2\" target=\"_blank\" rel=\"noopener noreferrer\">$1<\/a>');
    // Blockquotes
    html = html.replace(/^(?:>\s.*(?:\n|$))+?/gm, (block) => {
      const items = block.trim().split(/\n/).map(l => l.replace(/^>\s?/, '').trim()).join('\n');
      return `<blockquote>${items.replace(/\n/g,'<br/>')}<\/blockquote>`;
    });
    html = html.replace(/^(?:-\s.*(?:\n|$))+?/gm, (block) => {
      const items = block.trim().split(/\n/).map(l => l.replace(/^-\s?/, '').trim()).filter(Boolean);
      return items.length ? '<ul>' + items.map(i => `<li>${i}<\/li>`).join('') + '<\/ul>' : block;
    });
    html = html.replace(/^(?:\d+\.\s.*(?:\n|$))+?/gm, (block) => {
      const items = block.trim().split(/\n/).map(l => l.replace(/^\d+\.\s?/, '').trim()).filter(Boolean);
      return items.length ? '<ol>' + items.map(i => `<li>${i}<\/li>`).join('') + '<\/ol>' : block;
    });
    // Horizontal rules
    html = html.replace(/\n?-{3,}\n?/g, '<hr/>');
    html = html.replace(/\n{2,}/g, '</p><p>');
    html = `<p>${html.replace(/\n/g, '<br/>')}<\/p>`;
    return html;
  };

  const isYouTubeUrl = (url) => {
    if (!url) return false;
    return url.includes('youtube.com') || url.includes('youtu.be');
  };

  const getYouTubeVideoId = (url) => {
    if (!isYouTubeUrl(url)) return null;
    if (url.includes('youtu.be/')) {
      return url.split('youtu.be/')[1]?.split('?')[0];
    }
    if (url.includes('youtube.com/watch')) {
      const urlParams = new URLSearchParams(url.split('?')[1]);
      return urlParams.get('v');
    }
    return null;
  };

  // Preserve original filename on upload with safe sanitization and collision handling
  const sanitizeFileName = (name) => {
    const trimmed = (name || '').trim();
    // replace spaces with dashes and strip disallowed chars, keep dots/underscores/hyphens
    const replaced = trimmed.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9._-]/g, '');
    // Avoid hidden or empty names
    return replaced.length ? replaced.toLowerCase() : `file-${Date.now()}`;
  };

  const isConflictError = (err) => {
    const code = err?.statusCode || err?.code;
    const msg = (err?.message || '').toLowerCase();
    return code === '409' || msg.includes('already exists') || msg.includes('duplicate') || msg.includes('conflict') || msg.includes('resource already');
  };

  const splitBaseExt = (safeName) => {
    const lastDot = safeName.lastIndexOf('.');
    if (lastDot <= 0 || lastDot === safeName.length - 1) {
      return { base: safeName, ext: '' };
    }
    return { base: safeName.substring(0, lastDot), ext: safeName.substring(lastDot) };
  };

  const uploadPreservingName = async (subdir, file) => {
    const safeName = sanitizeFileName(file?.name || 'upload');
    const { base, ext } = splitBaseExt(safeName);
    let candidatePath = `${subdir}/${safeName}`;
    try {
      await uploadFile(STORAGE_BUCKETS.COURSE_CONTENT, candidatePath, file);
      return candidatePath;
    } catch (err) {
      if (!isConflictError(err)) throw err;
    }
    // On conflict, try suffixes -1..-50
    for (let index = 1; index <= 50; index++) {
      candidatePath = `${subdir}/${base}-${index}${ext}`;
      try {
        await uploadFile(STORAGE_BUCKETS.COURSE_CONTENT, candidatePath, file);
        return candidatePath;
      } catch (err) {
        if (!isConflictError(err)) throw err;
      }
    }
    // If all candidates conflicted, fallback to timestamp once
    candidatePath = `${subdir}/${base}-${Date.now()}${ext}`;
    await uploadFile(STORAGE_BUCKETS.COURSE_CONTENT, candidatePath, file);
    return candidatePath;
  };

  const handleVideoFileChange = (e) => {
    const file = e.target.files && e.target.files[0] ? e.target.files[0] : null;
    setVideoFile(file);
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setVideoPreviewUrl(objectUrl);
    } else {
      setVideoPreviewUrl('');
    }
  };

  useEffect(() => {
    return () => {
      if (videoPreviewUrl) URL.revokeObjectURL(videoPreviewUrl);
      if (pdfPreviewUrl) URL.revokeObjectURL(pdfPreviewUrl);
    };
  }, [videoPreviewUrl, pdfPreviewUrl]);

  const validateForm = async () => {
    if (!formData.title.trim()) {
      setError('Lesson title is required');
      return false;
    }
    if (formData.content_type === 'video') {
      if (videoSourceType === 'upload') {
        if (!videoFile) {
          setError('Please select a video file to upload');
          return false;
        }
        const allowedTypes = ['video/mp4', 'video/webm', 'video/ogg'];
        if (!validateFileType(videoFile, allowedTypes)) {
          setError('Unsupported video format. Allowed: MP4, WebM, Ogg');
          return false;
        }
        if (!validateFileSize(videoFile, 500)) { // 500 MB max
          setError('Video file is too large (max 500MB)');
          return false;
        }
      } else {
        if (!formData.content_url.trim()) {
          setError('Please provide an external video URL');
          return false;
        }
      }
    } else if (formData.content_type === 'text') {
      if (!formData.content_text.trim()) {
        setError('Please enter lesson content text');
        return false;
      }
      if (!['plaintext', 'markdown', 'html'].includes(formData.content_format)) {
        setError('Please select a valid content format');
        return false;
      }
    } else if (formData.content_type === 'pdf') {
      if (pdfSourceType === 'upload') {
        if (!pdfFile) {
          setError('Please select a PDF file to upload');
          return false;
        }
        const allowedTypes = ['application/pdf'];
        if (!validateFileType(pdfFile, allowedTypes)) {
          setError('Unsupported file type. Only PDF is allowed');
          return false;
        }
        if (!validateFileSize(pdfFile, 100)) { // 100 MB max
          setError('PDF file is too large (max 100MB)');
          return false;
        }
      } else {
        if (!formData.content_url.trim()) {
          setError('Please provide a PDF URL');
          return false;
        }
        if (!/\.pdf(?:\?|#|$)/i.test(formData.content_url.trim())) {
          setError('The URL should point to a .pdf resource');
          return false;
        }
      }
    } else {
      if (!formData.content_text.trim() && !formData.content_url.trim()) {
        setError('Provide content text or a content URL');
        return false;
      }
    }
    // Uniqueness check within module (or course if unassigned)
    const excludeId = lesson?.id || null;
    const unique = await isLessonTitleUnique(
      courseId,
      formData.module_id || null,
      formData.title,
      excludeId
    );
    if (!unique) {
      setError('A lesson with this title already exists in this module/course');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!(await validateForm())) return;

    setLoading(true);

    try {
      const lessonData = {
        ...formData,
        duration_minutes: formData.duration_minutes ? parseInt(formData.duration_minutes) : null,
        order_index: formData.order_index ? parseInt(formData.order_index) : 1,
        module_id: formData.module_id || null // Allow null for unassigned lessons
      };

      // Persist format marker inside content_text instead of separate column
      if (lessonData.content_type === 'text') {
        const marker = `<!--content_format:${lessonData.content_format || 'plaintext'}-->`;
        lessonData.content_text = `${marker}${lessonData.content_text || ''}`;
      }
      // Do not send content_format as a separate DB column
      delete lessonData.content_format;

      // Handle video upload if selected
      if (formData.content_type === 'video' && videoSourceType === 'upload' && videoFile) {
        setIsUploading(true);
        const subdir = `lessons/videos/${courseId}`;
        const path = await uploadPreservingName(subdir, videoFile);
        const publicUrl = getFileUrl(STORAGE_BUCKETS.COURSE_CONTENT, path);
        lessonData.content_url = publicUrl;
        if (lessonData.content_text) lessonData.content_text = '';
        setIsUploading(false);
      }

      // Handle PDF upload if selected
      if (formData.content_type === 'pdf' && pdfSourceType === 'upload' && pdfFile) {
        setIsUploading(true);
        const subdir = `lessons/pdfs/${courseId}`;
        const path = await uploadPreservingName(subdir, pdfFile);
        const publicUrl = getFileUrl(STORAGE_BUCKETS.COURSE_CONTENT, path);
        lessonData.content_url = publicUrl;
        setIsUploading(false);
      }

      let result;
      if (isEditing) {
        result = await updateLesson(lesson.id, lessonData);
      } else {
        result = await createLesson(
          lessonData,
          courseId,
          formData.module_id || null,
          user.id
        );
      }

      if (result.error) {
        setError(result.error);
        showError(result.error);
        return;
      }

      const message = isEditing 
        ? `Lesson "${result.data.title}" updated successfully!` 
        : `Lesson "${result.data.title}" created successfully!`;
      
      success(message);
      onSuccess(result.data);
    } catch (error) {
      setError(error.message || 'An unexpected error occurred');
      showError(error.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const lessonTypes = [
    { value: 'video', label: 'Video Lesson' },
    { value: 'text', label: 'Text Lesson' },
    { value: 'interactive', label: 'Interactive Lesson' },
    { value: 'quiz', label: 'Quiz/Assessment' },
    { value: 'assignment', label: 'Assignment' }
  ];

  return (
    <Card className="max-w-3xl mx-auto">
      <div className="p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          {isEditing ? 'Edit Lesson' : 'Add New Lesson'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lesson Title *
              </label>
              <Input
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Enter lesson title"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Content Type
              </label>
              <select
                name="content_type"
                value={formData.content_type}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="video">Video</option>
                <option value="text">Text</option>
                {/* <option value="scorm">SCORM Package</option> */}
                <option value="pdf">PDF</option>
                {/* <option value="interactive">Interactive</option> */}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Module (Optional)
              </label>
              <select
                name="module_id"
                value={formData.module_id}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">No Module (Unassigned)</option>
                {loadingModules ? (
                  <option disabled>Loading modules...</option>
                ) : (
                  modules.map(module => (
                    <option key={module.id} value={module.id}>
                      {module.title}
                    </option>
                  ))
                )}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Select a module to organize this lesson, or leave unassigned
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Duration (minutes)
              </label>
              <Input
                name="duration_minutes"
                type="number"
                value={formData.duration_minutes}
                onChange={handleInputChange}
                placeholder="e.g., 15"
                min="0"
              />
            </div>

            {isEditing && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Order Index
                </label>
                <Input
                  name="order_index"
                  type="number"
                  value={formData.order_index}
                  onChange={handleInputChange}
                  placeholder="1"
                  min="1"
                />
              </div>
            )}
          </div>

          {/* Content */}
          <div className="space-y-6">
            {formData.content_type === 'video' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Video Source
                  </label>
                  <div className="flex items-center gap-4">
                    <label className="inline-flex items-center gap-2">
                      <input
                        type="radio"
                        name="video_source"
                        value="external"
                        checked={videoSourceType === 'external'}
                        onChange={() => setVideoSourceType('external')}
                      />
                      <span className="text-sm text-gray-700">External Link</span>
                    </label>
                    <label className="inline-flex items-center gap-2">
                      <input
                        type="radio"
                        name="video_source"
                        value="upload"
                        checked={videoSourceType === 'upload'}
                        onChange={() => setVideoSourceType('upload')}
                      />
                      <span className="text-sm text-gray-700">Upload File</span>
                    </label>
                  </div>
                </div>

                {videoSourceType === 'external' ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      External Video URL
                    </label>
                    <Input
                      name="content_url"
                      value={formData.content_url}
                      onChange={handleInputChange}
                      placeholder="https://youtube.com/watch?v=... or direct video URL (mp4, webm)"
                      type="url"
                    />

                    {formData.content_url && (
                      <div className="mt-3">
                        {isYouTubeUrl(formData.content_url) ? (
                          (() => {
                            const vid = getYouTubeVideoId(formData.content_url);
                            if (!vid) {
                              return (
                                <div className="text-sm text-gray-600">
                                  Invalid YouTube URL. Please use the full watch URL.
                                </div>
                              );
                            }
                            const embed = `https://www.youtube.com/embed/${vid}?rel=0`;
                            return (
                              <div className="relative w-full" style={{ paddingTop: '56.25%' }}>
                                <iframe
                                  src={embed}
                                  title="YouTube preview"
                                  className="absolute top-0 left-0 w-full h-full rounded border"
                                  frameBorder="0"
                                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                  referrerPolicy="strict-origin-when-cross-origin"
                                  allowFullScreen
                                />
                              </div>
                            );
                          })()
                        ) : (
                          <video
                            src={formData.content_url}
                            controls
                            className="w-full rounded border"
                          />
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Upload Video File
                    </label>
                    <input
                      type="file"
                      accept="video/*"
                      onChange={handleVideoFileChange}
                      className="block w-full text-sm text-gray-700"
                    />

                    {videoPreviewUrl && (
                      <div className="mt-3">
                        <video src={videoPreviewUrl} controls className="w-full rounded border" />
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {formData.content_type === 'pdf' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    PDF Source
                  </label>
                  <div className="flex items-center gap-4">
                    <label className="inline-flex items-center gap-2">
                      <input
                        type="radio"
                        name="pdf_source"
                        value="external"
                        checked={pdfSourceType === 'external'}
                        onChange={() => setPdfSourceType('external')}
                      />
                      <span className="text-sm text-gray-700">External Link</span>
                    </label>
                    <label className="inline-flex items-center gap-2">
                      <input
                        type="radio"
                        name="pdf_source"
                        value="upload"
                        checked={pdfSourceType === 'upload'}
                        onChange={() => setPdfSourceType('upload')}
                      />
                      <span className="text-sm text-gray-700">Upload File</span>
                    </label>
                  </div>
                </div>

                {pdfSourceType === 'external' ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      PDF URL
                    </label>
                    <Input
                      name="content_url"
                      value={formData.content_url}
                      onChange={handleInputChange}
                      placeholder="https://example.com/file.pdf"
                      type="url"
                    />

                    {formData.content_url && (
                      <div className="mt-3 border rounded-lg overflow-hidden">
                        <iframe
                          src={formData.content_url}
                          title="PDF Preview"
                          className="w-full h-96"
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Upload PDF File
                    </label>
                    <input
                      type="file"
                      accept="application/pdf"
                      onChange={(e) => {
                        const file = e.target.files && e.target.files[0] ? e.target.files[0] : null;
                        setPdfFile(file);
                        if (file) {
                          const objectUrl = URL.createObjectURL(file);
                          setPdfPreviewUrl(objectUrl);
                        } else {
                          setPdfPreviewUrl('');
                        }
                      }}
                      className="block w-full text-sm text-gray-700"
                    />

                    {pdfPreviewUrl && (
                      <div className="mt-3 border rounded-lg overflow-hidden">
                        <iframe src={pdfPreviewUrl} title="PDF Preview" className="w-full h-96" />
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {formData.content_type === 'text' && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">Text Format</label>
                  <select
                    name="content_format"
                    value={formData.content_format}
                    onChange={handleInputChange}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="plaintext">Plain text</option>
                    <option value="markdown">Markdown</option>
                    <option value="html">HTML</option>
                  </select>
                </div>

                {formData.content_format !== 'html' && (
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <button type="button" className="text-xs px-2 py-1 border rounded" onClick={() => applyFormat('bold')} title="Bold (Ctrl/Cmd+B)"><strong>B</strong></button>
                    <button type="button" className="text-xs px-2 py-1 border rounded" onClick={() => applyFormat('italic')} title="Italic (Ctrl/Cmd+I)"><em>I</em></button>
                    <span className="mx-1 text-gray-300">|</span>
                    <button type="button" className="text-xs px-2 py-1 border rounded" onClick={() => applyFormat('h1')} title="Heading 1 (Ctrl/Cmd+1)">H1</button>
                    <button type="button" className="text-xs px-2 py-1 border rounded" onClick={() => applyFormat('h2')} title="Heading 2 (Ctrl/Cmd+2)">H2</button>
                    <button type="button" className="text-xs px-2 py-1 border rounded" onClick={() => applyFormat('h3')} title="Heading 3">H3</button>
                    <span className="mx-1 text-gray-300">|</span>
                    <button type="button" className="text-xs px-2 py-1 border rounded" onClick={() => applyFormat('ul')} title="Bulleted List (Ctrl/Cmd+U)">• List</button>
                    <button type="button" className="text-xs px-2 py-1 border rounded" onClick={() => applyFormat('ol')} title="Numbered List (Ctrl/Cmd+O)">1. List</button>
                    <button type="button" className="text-xs px-2 py-1 border rounded" onClick={() => applyFormat('quote')} title="> Quote">“”</button>
                    <span className="mx-1 text-gray-300">|</span>
                    <button type="button" className="text-xs px-2 py-1 border rounded" onClick={() => applyFormat('code-inline')} title="Inline code">{`</>`}</button>
                    <button type="button" className="text-xs px-2 py-1 border rounded" onClick={() => applyFormat('code-block')} title="Code block">{`{ }`}</button>
                    <button type="button" className="text-xs px-2 py-1 border rounded" onClick={() => applyFormat('hr')} title="Horizontal rule">HR</button>
                    <span className="flex-1" />
                    <label className="inline-flex items-center gap-2 text-xs text-gray-600">
                      <input type="checkbox" checked={splitPreview} onChange={(e) => setSplitPreview(e.target.checked)} />
                      Split preview
                    </label>
                    <button type="button" className="text-xs px-2 py-1 border rounded" onClick={() => setShowPreview(sp => !sp)}>{showPreview ? 'Hide preview' : 'Show preview'}</button>
                  </div>
                )}

                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lesson Content Text
                </label>
                {splitPreview ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <textarea
                      name="content_text"
                      value={formData.content_text}
                      onChange={handleInputChange}
                      onKeyDown={(e) => {
                        const mod = e.metaKey || e.ctrlKey;
                        if (mod && e.key.toLowerCase() === 'b') { e.preventDefault(); applyFormat('bold'); }
                        if (mod && e.key.toLowerCase() === 'i') { e.preventDefault(); applyFormat('italic'); }
                        if (mod && e.key.toLowerCase() === 'k') { e.preventDefault(); applyFormat('link'); }
                        if (mod && e.key === '1') { e.preventDefault(); applyFormat('h1'); }
                        if (mod && e.key === '2') { e.preventDefault(); applyFormat('h2'); }
                        if (mod && (e.key.toLowerCase() === 'u')) { e.preventDefault(); applyFormat('ul'); }
                        if (mod && (e.key.toLowerCase() === 'o')) { e.preventDefault(); applyFormat('ol'); }
                      }}
                      ref={textareaRef}
                      rows={10}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter the main content text of this lesson..."
                    />
                    <div>
                      <div className="text-sm text-gray-600 mb-2">Preview</div>
                      <div
                        className="prose max-w-none border rounded-md p-3 bg-white overflow-auto"
                        dangerouslySetInnerHTML={{
                          __html: formData.content_format === 'markdown'
                            ? renderMarkdownToHtml(formData.content_text)
                            : formData.content_format === 'html'
                              ? formData.content_text
                              : escapeHtml(formData.content_text).replace(/\n/g, '<br/>')
                        }}
                      />
                    </div>
                  </div>
                ) : (
                  <>
                    <textarea
                      name="content_text"
                      value={formData.content_text}
                      onChange={handleInputChange}
                      onKeyDown={(e) => {
                        const mod = e.metaKey || e.ctrlKey;
                        if (mod && e.key.toLowerCase() === 'b') { e.preventDefault(); applyFormat('bold'); }
                        if (mod && e.key.toLowerCase() === 'i') { e.preventDefault(); applyFormat('italic'); }
                        if (mod && e.key.toLowerCase() === 'k') { e.preventDefault(); applyFormat('link'); }
                        if (mod && e.key === '1') { e.preventDefault(); applyFormat('h1'); }
                        if (mod && e.key === '2') { e.preventDefault(); applyFormat('h2'); }
                        if (mod && (e.key.toLowerCase() === 'u')) { e.preventDefault(); applyFormat('ul'); }
                        if (mod && (e.key.toLowerCase() === 'o')) { e.preventDefault(); applyFormat('ol'); }
                      }}
                      ref={textareaRef}
                      rows={6}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter the main content text of this lesson..."
                    />

                    {showPreview && (
                      <div className="mt-4">
                        <div className="text-sm text-gray-600 mb-2">Preview</div>
                        <div
                          className="prose max-w-none border rounded-md p-3 bg-white"
                          dangerouslySetInnerHTML={{
                            __html: formData.content_format === 'markdown'
                              ? renderMarkdownToHtml(formData.content_text)
                              : formData.content_format === 'html'
                                ? formData.content_text
                                : escapeHtml(formData.content_text).replace(/\n/g, '<br/>')
                          }}
                        />
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* Fallback fields for other types */}
            {formData.content_type !== 'video' && formData.content_type !== 'text' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Content URL
                  </label>
                  <Input
                    name="content_url"
                    value={formData.content_url}
                    onChange={handleInputChange}
                    placeholder="https://example.com/resource"
                    type="url"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Content Text
                  </label>
                  <textarea
                    name="content_text"
                    value={formData.content_text}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Optional supporting text..."
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Required Lesson
              </label>
              <div className="flex items-center">
                <input
                  name="is_required"
                  type="checkbox"
                  checked={formData.is_required}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">
                  This lesson is required to complete the course
                </label>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <Button
              type="button"
              variant="secondary"
              onClick={onCancel}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="min-w-[120px]"
            >
              {loading ? (
                <LoadingSpinner size="sm" />
              ) : (
                isEditing ? 'Update Lesson' : 'Add Lesson'
              )}
            </Button>
          </div>
        </form>
      </div>
    </Card>
  );
} 