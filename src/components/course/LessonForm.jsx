// src/components/course/LessonForm.jsx
import { useState, useEffect, useRef } from 'react';
import { useCourseStore } from '@/store/courseStore';
import { useAuth } from '@/hooks/auth/useAuth';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { useToast } from '@/components/ui';
import PDFSplitter from './PDFSplitter';
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
  const createPresentation = useCourseStore(state => state.actions.createPresentation);
  const createSlide = useCourseStore(state => state.actions.createSlide);

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

  // Separate state for text lesson content
  const [textContent, setTextContent] = useState('');

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
  const [pdfSourceType, setPdfSourceType] = useState('external'); // 'external' | 'upload' | 'split'
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState('');
  const [showPdfSplitter, setShowPdfSplitter] = useState(false);
  const [pdfSplitData, setPdfSplitData] = useState(null);
  const [pptSourceType, setPptSourceType] = useState('external'); // 'external' | 'upload'
  const [pptFile, setPptFile] = useState(null);
  const [pptPreviewUrl, setPptPreviewUrl] = useState('');
  const [scormFile, setScormFile] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState('');
  const [audioFile, setAudioFile] = useState(null);
  const [audioPreviewUrl, setAudioPreviewUrl] = useState('');
  
  // Existing content state for editing
  const [existingContent, setExistingContent] = useState({
    videoUrl: '',
    pdfUrl: '',
    pptUrl: '',
    imageUrl: '',
    audioUrl: '',
    scormUrl: '',
    presentationUrl: ''
  });

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
        content_text: lesson.content_type === 'text' ? '' : (detected.text || ''), // Use content_text for description, not text content
        content_format: detected.format || 'plaintext',
        duration_minutes: lesson.duration_minutes || '',
        order_index: lesson.order_index || 1,
        is_required: lesson.is_required !== undefined ? lesson.is_required : true,
        module_id: lesson.module_id || '' // Assuming lesson object has module_id
      });
      
      // Set text content separately for text lessons
      if (lesson.content_type === 'text') {
        setTextContent(detected.text || '');
      }
      
      // Set existing content URLs for previews
      setExistingContent({
        videoUrl: lesson.content_type === 'video' ? lesson.content_url : '',
        pdfUrl: lesson.content_type === 'pdf' ? lesson.content_url : '',
        pptUrl: lesson.content_type === 'ppt' ? lesson.content_url : '',
        imageUrl: lesson.content_type === 'image' ? lesson.content_url : '',
        audioUrl: lesson.audio_attachment_url || '',
        scormUrl: lesson.content_type === 'scorm' ? lesson.content_url : ''
      });
      
      // Set source types based on existing content
      if (lesson.content_type === 'video' && lesson.content_url) {
        setVideoSourceType('external');
      }
      if (lesson.content_type === 'pdf') {
        // For PDF lessons, check if it has URL or default to upload
        if (lesson.content_url) {
          setPdfSourceType('external');
        } else {
          setPdfSourceType('upload');
        }
      } else if (lesson.content_type === 'presentation') {
        // For presentation lessons, check if it has existing presentation
        if (lesson.content_url) {
          setPdfSourceType('external');
        } else {
          setPdfSourceType('split');
          // Note: pdfSplitData will be loaded separately if needed
        }
      }
      if (lesson.content_type === 'ppt' && lesson.content_url) {
        setPptSourceType('external');
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
    
    // Protect content_text when it contains split PDF data
    if (name === 'content_text' && formData.content_type === 'presentation' && pdfSplitData) {
      return; // Don't update content_text if it contains split PDF data
    }
    
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

  const handlePdfSplitterSuccess = (splitData) => {
    setPdfSplitData(splitData);
    setShowPdfSplitter(false);
    
    // Update content type to presentation but don't store split data in content_text
    const updatedFormData = {
      ...formData,
      content_type: 'presentation', // Change content type to presentation after splitting
      content_text: '', // Clear content_text - split data is stored separately
      content_url: '' // Clear URL since we're using split data
    };
    
    setFormData(updatedFormData);
    
    success(`PDF successfully split into ${splitData.images.length} pages! Ready to save as presentation.`);
  };

  const handlePdfSplitterCancel = () => {
    setShowPdfSplitter(false);
    setPdfSplitData(null);
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
      // Clear existing content when new file is selected
      setExistingContent(prev => ({ ...prev, videoUrl: '' }));
    } else {
      setVideoPreviewUrl('');
    }
  };

  const handleImageFileChange = (e) => {
    const file = e.target.files && e.target.files[0] ? e.target.files[0] : null;
    setImageFile(file);
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setImagePreviewUrl(objectUrl);
      // Clear existing content when new file is selected
      setExistingContent(prev => ({ ...prev, imageUrl: '' }));
    } else {
      setImagePreviewUrl('');
    }
  };

  const handleAudioFileChange = (e) => {
    const file = e.target.files && e.target.files[0] ? e.target.files[0] : null;
    setAudioFile(file);
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setAudioPreviewUrl(objectUrl);
      // Clear existing content when new file is selected
      setExistingContent(prev => ({ ...prev, audioUrl: '' }));
    } else {
      setAudioPreviewUrl('');
    }
  };

  useEffect(() => {
    return () => {
      if (videoPreviewUrl) URL.revokeObjectURL(videoPreviewUrl);
      if (pdfPreviewUrl) URL.revokeObjectURL(pdfPreviewUrl);
      if (pptPreviewUrl) URL.revokeObjectURL(pptPreviewUrl);
      if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl);
      if (audioPreviewUrl) URL.revokeObjectURL(audioPreviewUrl);
    };
  }, [videoPreviewUrl, pdfPreviewUrl, pptPreviewUrl, imagePreviewUrl, audioPreviewUrl]);

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
    } else if (formData.content_type === 'presentation') {
      // For presentation type, we don't validate content here as it will be handled by the presentation form
      // Just ensure basic lesson data is valid
      if (!formData.title.trim()) {
        setError('Lesson title is required for presentation');
        return false;
      }
    } else if (formData.content_type === 'pdf') {
      if (pdfSourceType === 'upload') {
        // For PDF upload, require either a new file or existing content
        if (!pdfFile && !existingContent.pdfUrl) {
          setError('Please select a PDF file to upload');
          return false;
        }
        
        // Only validate file if a new file is being uploaded
        if (pdfFile) {
          const allowedTypes = ['application/pdf'];
          if (!validateFileType(pdfFile, allowedTypes)) {
            setError('Unsupported file type. Only PDF is allowed');
            return false;
          }
          if (!validateFileSize(pdfFile, 100)) { // 100 MB max
            setError('PDF file is too large (max 100MB)');
            return false;
          }
        }
      } else if (pdfSourceType === 'split') {
        // For PDF split, require split data
        if (!pdfSplitData || !pdfSplitData.images || pdfSplitData.images.length === 0) {
          setError('Please split a PDF into images first');
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
    } else if (formData.content_type === 'ppt') {
      if (pptSourceType === 'upload') {
        // For PPT upload, require either a new file or existing content
        if (!pptFile && !existingContent.pptUrl) {
          setError('Please select a PowerPoint file to upload');
          return false;
        }
        
        // Only validate file if a new file is being uploaded
        if (pptFile) {
          const allowedTypes = [
            'application/vnd.ms-powerpoint',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            'application/vnd.ms-powerpoint.presentation.macroEnabled.12'
          ];
          if (!validateFileType(pptFile, allowedTypes)) {
            setError('Unsupported file type. Allowed: PPT, PPTX');
            return false;
          }
          if (!validateFileSize(pptFile, 200)) { // 200 MB max
            setError('PowerPoint file is too large (max 200MB)');
            return false;
          }
        }
      } else {
        if (!formData.content_url.trim()) {
          setError('Please provide a PowerPoint URL');
          return false;
        }
        const url = formData.content_url.trim();
        const decodedUrl = decodeURIComponent(url);
        const isPowerPointFile = /\.(ppt|pptx)(?:\?|#|$|&|%20|%2E|%3F|%23)/i.test(url) || 
                                /\.(ppt|pptx)(?:\?|#|$|&)/i.test(decodedUrl);
        const isGoogleSlides = /docs\.google\.com\/presentation\/d\/[a-zA-Z0-9_-]+/i.test(url);
        
        if (!isPowerPointFile && !isGoogleSlides) {
          setError('The URL should point to a .ppt/.pptx file or a Google Slides presentation');
          return false;
        }
      }
    } else if (formData.content_type === 'scorm') {
      // For SCORM, require either a new file or existing content
      if (!scormFile && !existingContent.scormUrl) {
        setError('Please select a SCORM package file to upload');
        return false;
      }
      
      // Only validate file if a new file is being uploaded
      if (scormFile) {
        const allowedTypes = ['application/zip', 'application/x-zip-compressed'];
        if (!validateFileType(scormFile, allowedTypes)) {
          setError('Unsupported file type. Only ZIP files are allowed for SCORM packages');
          return false;
        }
        if (!validateFileSize(scormFile, 100)) { // 100 MB max
          setError('SCORM package is too large (max 100MB)');
          return false;
        }
      }
    } else if (formData.content_type === 'image') {
      // For image lessons, require either a new file or existing content
      if (!imageFile && !existingContent.imageUrl) {
        setError('Please select an image file to upload or provide an image URL');
        return false;
      }
      
      // Only validate file if a new file is being uploaded
      if (imageFile) {
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
        if (!validateFileType(imageFile, allowedTypes)) {
          setError('Unsupported image format. Allowed: JPEG, PNG, GIF, WebP, SVG');
          return false;
        }
        if (!validateFileSize(imageFile, 50)) { // 50 MB max
          setError('Image file is too large (max 50MB)');
          return false;
        }
      }
    } else if (formData.content_type === 'presentation') {
      // For presentation lessons, require either split PDF data or existing content
      const hasSplitData = pdfSplitData && pdfSplitData.images && pdfSplitData.images.length > 0;
      const hasExistingPresentation = existingContent.presentationUrl;
      
      if (!hasSplitData && !hasExistingPresentation) {
        setError('Please use PDF splitter to create presentation content');
        return false;
      }
    } else {
      if (!formData.content_text.trim() && !formData.content_url.trim()) {
        setError('Provide content text or a content URL');
        return false;
      }
    }

    // Validate audio attachment if provided
    if (audioFile) {
      const allowedTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/m4a', 'audio/aac', 'audio/webm'];
      if (!validateFileType(audioFile, allowedTypes)) {
        setError('Unsupported audio format. Allowed: MP3, WAV, OGG, M4A, AAC, WebM');
        return false;
      }
      if (!validateFileSize(audioFile, 100)) { // 100 MB max
        setError('Audio file is too large (max 100MB)');
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
        // content_text is already set from formData (used for description)
        // course_id and module_id are passed as separate parameters to createLesson
      };

      // For text lessons, use textContent with format marker
      if (lessonData.content_type === 'text') {
        const marker = `<!--content_format:${lessonData.content_format || 'plaintext'}-->`;
        lessonData.content_text = `${marker}${textContent || ''}`;
      }
      // Do not send content_format as a separate DB column
      delete lessonData.content_format;
      
      // Remove any presentation_description field if it exists (shouldn't be there but just in case)
      delete lessonData.presentation_description;
      

      // Handle SCORM upload if selected - MUST happen before lesson creation
      if (formData.content_type === 'scorm' && scormFile) {
        setIsUploading(true);
        try {
          // For SCORM packages, upload the ZIP file and get the public URL
          const subdir = `lessons/scorm/${courseId}`;
          const path = await uploadPreservingName(subdir, scormFile);
          const publicUrl = getFileUrl(STORAGE_BUCKETS.COURSE_CONTENT, path);
          
          // Store the public URL so it can be accessed directly
          lessonData.content_url = publicUrl;
          setIsUploading(false);
        } catch (error) {
          setError('Failed to upload SCORM package: ' + error.message);
          setIsUploading(false);
          return;
        }
      }

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

      // Handle PPT upload if selected
      if (formData.content_type === 'ppt' && pptSourceType === 'upload' && pptFile) {
        setIsUploading(true);
        const subdir = `lessons/presentations/${courseId}`;
        const path = await uploadPreservingName(subdir, pptFile);
        const publicUrl = getFileUrl(STORAGE_BUCKETS.COURSE_CONTENT, path);
        lessonData.content_url = publicUrl;
        setIsUploading(false);
      }

      // Handle presentation creation for split PDF data
      if (formData.content_type === 'presentation' && pdfSplitData) {
        try {
          const splitData = pdfSplitData;
          if (splitData.images && Array.isArray(splitData.images)) {
            // Create the lesson first
            const lessonResult = isEditing 
              ? await updateLesson(lesson.id, lessonData)
              : await createLesson(lessonData, courseId, formData.module_id || null, user.id);

            if (lessonResult.error) {
              setError(lessonResult.error);
              showError(lessonResult.error);
              return;
            }

            const createdLesson = lessonResult.data;

            // Create presentation record
            const presentationData = {
              lesson_id: createdLesson.id,
              title: `${createdLesson.title} - Presentation`,
              description: formData.content_text || `Auto-generated presentation from split PDF with ${splitData.images.length} pages`,
              estimated_duration: Math.ceil(splitData.images.length * 30), // 30 seconds per page
              created_by: user.id
            };

            const presentationResult = await createPresentation(presentationData);
            if (presentationResult.error) {
              setError(`Failed to create presentation: ${presentationResult.error}`);
              showError(`Failed to create presentation: ${presentationResult.error}`);
              return;
            }

            const presentation = presentationResult.data;

            // Create slides from split PDF images
            const slides = splitData.images.map((image, index) => ({
              presentation_id: presentation.id,
              slide_number: index + 1,
              content_type: 'image',
              title: `Page ${index + 1}`,
              content_url: image.imageUrl,
              content_text: '',
              content_format: 'plaintext',
              duration_seconds: 30,
              metadata: {
                originalPageNum: image.originalPageNum,
                width: image.width,
                height: image.height,
                originalFileName: image.originalFileName
              },
              is_required: true
            }));

            // Create slides in batches to avoid overwhelming the database
            for (const slide of slides) {
              const slideResult = await createSlide(slide);
              if (slideResult.error) {
                console.error(`Failed to create slide ${slide.slide_number}:`, slideResult.error);
                // Continue with other slides even if one fails
              }
            }

            success('Lesson with split PDF presentation created successfully!');
            onSuccess(createdLesson);
            return;
          }
        } catch (parseError) {
          console.error('Failed to parse split PDF data:', parseError);
          setError('Invalid split PDF data format');
          showError('Invalid split PDF data format');
          return;
        }
      }

      // If not a presentation, create the lesson normally
      if (formData.content_type !== 'presentation') {
        const lessonResult = isEditing 
          ? await updateLesson(lesson.id, lessonData)
          : await createLesson(lessonData, courseId, formData.module_id || null, user.id);

        if (lessonResult.error) {
          setError(lessonResult.error);
          showError(lessonResult.error);
          return;
        }

        const message = isEditing 
          ? `Lesson "${lessonData.title}" updated successfully!` 
          : `Lesson "${lessonData.title}" created successfully!`;
        
        success(message);
        onSuccess(lessonResult.data);
        return;
      }


      // Handle image upload if selected
      if (formData.content_type === 'image' && imageFile) {
        setIsUploading(true);
        try {
          const subdir = `lessons/images/${courseId}`;
          const path = await uploadPreservingName(subdir, imageFile);
          const publicUrl = getFileUrl(STORAGE_BUCKETS.COURSE_CONTENT, path);
          
          lessonData.content_url = publicUrl;
          setIsUploading(false);
        } catch (error) {
          setError('Failed to upload image: ' + error.message);
          setIsUploading(false);
          return;
        }
      }

      // Handle audio attachment upload if selected
      if (audioFile) {
        setIsUploading(true);
        try {
          const subdir = `lessons/audio-attachments/${courseId}`;
          const path = await uploadPreservingName(subdir, audioFile);
          const publicUrl = getFileUrl(STORAGE_BUCKETS.COURSE_CONTENT, path);
          
          lessonData.audio_attachment_url = publicUrl;
          setIsUploading(false);
        } catch (error) {
          setError('Failed to upload audio attachment: ' + error.message);
          setIsUploading(false);
          return;
        }
      }
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
    <Card className="max-w-2xl mx-auto">
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

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lesson Description
              </label>
              <textarea
                name="content_text"
                value={formData.content_text || ''}
                onChange={handleInputChange}
                placeholder="Describe what this lesson will cover..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              {formData.content_type === 'presentation' && pdfSplitData && (
                <p className="text-xs text-blue-600 mt-1">
                  💡 PDF successfully split into {pdfSplitData.images.length} pages. Add your own description above.
                </p>
              )}
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
                <option value="presentation">Presentation (Multi-format)</option>
                <option value="scorm">SCORM Package</option>
                <option value="pdf">PDF</option>
                <option value="ppt">PowerPoint</option>
                <option value="image">Image</option>
                {/* <option value="interactive">Interactive</option> */}
              </select>
              
              {/* Show split PDF status */}
              {formData.content_type === 'presentation' && pdfSplitData && (
                <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-green-800">
                        PDF Successfully Split
                      </h3>
                      <div className="mt-1 text-sm text-green-700">
                        <p>
                          {pdfSplitData.images.length} pages configured as {pdfSplitData.format || 'slideshow'}
                        </p>
                        <p className="text-xs mt-1">
                          Ready to save as presentation lesson
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
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
                    <label className="inline-flex items-center gap-2">
                      <input
                        type="radio"
                        name="pdf_source"
                        value="split"
                        checked={pdfSourceType === 'split'}
                        onChange={() => setPdfSourceType('split')}
                      />
                      <span className="text-sm text-gray-700">Split to Images</span>
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
                ) : pdfSourceType === 'upload' ? (
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
                          // Clear existing content when new file is selected
                          setExistingContent(prev => ({ ...prev, pdfUrl: '' }));
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
                ) : null}

                {/* PDF Splitter */}
                {pdfSourceType === 'split' && (
                  <div className="space-y-4">
                    <div className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">
                            {pdfSplitData ? 'Edit Split PDF' : 'Split PDF to Images'}
                          </h4>
                          <p className="text-xs text-gray-600 mt-1">
                            {pdfSplitData 
                              ? 'Edit the arrangement and format of your split PDF pages'
                              : 'Convert PDF pages to images that can be rearranged and presented in multiple formats'
                            }
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => setShowPdfSplitter(true)}
                            variant="outline"
                            size="sm"
                          >
                            {pdfSplitData ? 'Edit Split' : 'Open Splitter'}
                          </Button>
                          {pdfSplitData && (
                            <Button
                              onClick={() => {
                                setPdfSplitData(null);
                                setFormData(prev => ({ ...prev, content_text: '' }));
                              }}
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              Remove Split
                            </Button>
                          )}
                        </div>
                      </div>
                      
                      {pdfSplitData && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                          <div className="flex items-center gap-2 text-green-800">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <span className="text-sm font-medium">
                              {isEditing ? 'Split PDF Configured' : 'PDF Split Complete'}
                            </span>
                          </div>
                          <div className="mt-2 text-sm text-green-700 space-y-1">
                            <p><strong>{pdfSplitData.images.length}</strong> pages configured as <strong>{pdfSplitData.format}</strong></p>
                            {pdfSplitData.originalPdf?.name && (
                              <p className="text-xs">Original: {pdfSplitData.originalPdf.name}</p>
                            )}
                            {isEditing && (
                              <p className="text-xs">Click "Edit Split" to rearrange pages or change format</p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {formData.content_type === 'ppt' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    PowerPoint Source
                  </label>
                  <div className="flex items-center gap-4">
                    <label className="inline-flex items-center gap-2">
                      <input
                        type="radio"
                        name="ppt_source"
                        value="external"
                        checked={pptSourceType === 'external'}
                        onChange={() => setPptSourceType('external')}
                      />
                      <span className="text-sm text-gray-700">External Link</span>
                    </label>
                    <label className="inline-flex items-center gap-2">
                      <input
                        type="radio"
                        name="ppt_source"
                        value="upload"
                        checked={pptSourceType === 'upload'}
                        onChange={() => setPptSourceType('upload')}
                      />
                      <span className="text-sm text-gray-700">Upload File</span>
                    </label>
                  </div>
                </div>

                {pptSourceType === 'external' ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Presentation URL
                    </label>
                    <Input
                      name="content_url"
                      value={formData.content_url}
                      onChange={handleInputChange}
                      placeholder="https://example.com/presentation.pptx or https://docs.google.com/presentation/d/..."
                      type="url"
                    />

                    {formData.content_url && (
                      <div className="mt-3 border rounded-lg overflow-hidden">
                        {(() => {
                          const url = formData.content_url.trim();
                          const isGoogleSlides = /docs\.google\.com\/presentation\/d\/[a-zA-Z0-9_-]+/i.test(url);
                          
                          if (isGoogleSlides) {
                            // Convert Google Slides edit URL to embed URL
                            const presentationId = url.match(/\/d\/([a-zA-Z0-9_-]+)/)?.[1];
                            const embedUrl = presentationId 
                              ? `https://docs.google.com/presentation/d/${presentationId}/embed`
                              : url;
                            
                            return (
                              <iframe
                                src={embedUrl}
                                title="Google Slides Preview"
                                className="w-full h-96"
                                frameBorder="0"
                                allowFullScreen
                              />
                            );
                          } else {
                            return (
                              <iframe
                                src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(url)}`}
                                title="PowerPoint Preview"
                                className="w-full h-96"
                                frameBorder="0"
                              />
                            );
                          }
                        })()}
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Upload PowerPoint File
                    </label>
                    <input
                      type="file"
                      accept=".ppt,.pptx,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation"
                      onChange={(e) => {
                        const file = e.target.files && e.target.files[0] ? e.target.files[0] : null;
                        setPptFile(file);
                        if (file) {
                          const objectUrl = URL.createObjectURL(file);
                          setPptPreviewUrl(objectUrl);
                          // Clear existing content when new file is selected
                          setExistingContent(prev => ({ ...prev, pptUrl: '' }));
                        } else {
                          setPptPreviewUrl('');
                        }
                      }}
                      className="block w-full text-sm text-gray-700"
                    />

                    {pptPreviewUrl && (
                      <div className="mt-3 border rounded-lg overflow-hidden">
                        <iframe
                          src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(pptPreviewUrl)}`}
                          title="PowerPoint Preview"
                          className="w-full h-96"
                          frameBorder="0"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {formData.content_type === 'scorm' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    SCORM Package Upload
                  </label>
                  <input
                    type="file"
                    accept=".zip,application/zip,application/x-zip-compressed"
                    onChange={(e) => {
                      const file = e.target.files && e.target.files[0] ? e.target.files[0] : null;
                      setScormFile(file);
                      // Clear existing content when new file is selected
                      if (file) {
                        setExistingContent(prev => ({ ...prev, scormUrl: '' }));
                      }
                    }}
                    className="block w-full text-sm text-gray-700"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Upload a SCORM 1.2 or 2004 compliant package (.zip file). Maximum size: 100MB.
                  </p>
                </div>

                {scormFile && (
                  <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 text-sm font-medium">ZIP</span>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-blue-900 truncate">
                          {scormFile.name}
                        </p>
                        <p className="text-xs text-blue-700">
                          {(scormFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="text-sm font-medium text-blue-900 mb-2">SCORM Package Information</h4>
                  <ul className="text-xs text-blue-700 space-y-1">
                    <li>• Must be a valid SCORM 1.2 or 2004 compliant package</li>
                    <li>• Should contain imsmanifest.xml file in the root</li>
                    <li>• All assets and resources should be included in the package</li>
                    <li>• Package will be uploaded and made available to learners</li>
                  </ul>
                  <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
                    <p className="text-xs text-yellow-800">
                      <strong>Note:</strong> SCORM packages require server-side processing for full functionality. 
                      The package will be uploaded successfully and learners can access it, but full SCORM tracking 
                      requires additional server configuration.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {formData.content_type === 'image' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Image Upload
                  </label>
                  <input
                    type="file"
                    accept="image/*,.jpg,.jpeg,.png,.gif,.webp,.svg"
                    onChange={handleImageFileChange}
                    className="block w-full text-sm text-gray-700"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Upload an image file. Supported formats: JPEG, PNG, GIF, WebP, SVG. Maximum size: 50MB.
                  </p>
                </div>

                {imagePreviewUrl && (
                  <div className="space-y-3">
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                            <span className="text-green-600 text-sm font-medium">IMG</span>
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-green-900 truncate">
                            {imageFile.name}
                          </p>
                          <p className="text-xs text-green-700">
                            {(imageFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Image Preview</h4>
                      <div className="max-w-md">
                        <img
                          src={imagePreviewUrl}
                          alt="Preview"
                          className="max-w-full h-auto rounded-lg shadow-sm"
                          style={{ maxHeight: '300px' }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="text-sm font-medium text-blue-900 mb-2">Image Lesson Information</h4>
                  <ul className="text-xs text-blue-700 space-y-1">
                    <li>• Images will be displayed in the lesson view</li>
                    <li>• Supported formats: JPEG, PNG, GIF, WebP, SVG</li>
                    <li>• Maximum file size: 50MB</li>
                    <li>• Images are optimized for web display</li>
                  </ul>
                </div>
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
                      value={textContent}
                      onChange={(e) => setTextContent(e.target.value)}
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
                    {formData.content_type === 'presentation' && pdfSplitData && (
                      <p className="text-xs text-gray-500 mt-1">
                        Content is automatically generated from split PDF. To edit, use the PDF splitter.
                      </p>
                    )}
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
                      value={textContent}
                      onChange={(e) => setTextContent(e.target.value)}
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
                    {formData.content_type === 'presentation' && pdfSplitData && (
                      <p className="text-xs text-gray-500 mt-1">
                        Content is automatically generated from split PDF. To edit, use the PDF splitter.
                      </p>
                    )}

                    {showPreview && (
                      <div className="mt-4">
                        <div className="text-sm text-gray-600 mb-2">Preview</div>
                        <div
                          className="prose max-w-none border rounded-md p-3 bg-white"
                          dangerouslySetInnerHTML={{
                            __html: formData.content_format === 'markdown'
                              ? renderMarkdownToHtml(textContent)
                              : formData.content_format === 'html'
                                ? textContent
                                : escapeHtml(textContent).replace(/\n/g, '<br/>')
                          }}
                        />
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* Existing Content Preview Section - Show when editing */}
            {isEditing && (
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Current Content Preview</h3>
                <div className="space-y-4">
                  {/* Video Preview */}
                  {formData.content_type === 'video' && existingContent.videoUrl && (
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Current Video</h4>
                      {isYouTubeUrl(existingContent.videoUrl) ? (
                        <div className="aspect-video">
                          <iframe
                            src={`https://www.youtube.com/embed/${getYouTubeVideoId(existingContent.videoUrl)}`}
                            title="Video Preview"
                            className="w-full h-full rounded-lg"
                            allowFullScreen
                          />
                        </div>
                      ) : (
                        <video
                          controls
                          className="w-full max-w-md rounded-lg"
                          src={existingContent.videoUrl}
                        >
                          Your browser does not support the video tag.
                        </video>
                      )}
                    </div>
                  )}

                  {/* PDF Preview */}
                  {formData.content_type === 'pdf' && existingContent.pdfUrl && (
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Current PDF</h4>
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                          <span className="text-red-600 text-sm font-medium">PDF</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">PDF Document</p>
                          <a
                            href={existingContent.pdfUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:text-blue-800"
                          >
                            View PDF in new tab
                          </a>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* PowerPoint Preview */}
                  {formData.content_type === 'ppt' && existingContent.pptUrl && (
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Current PowerPoint</h4>
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                          <span className="text-orange-600 text-sm font-medium">PPT</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">PowerPoint Presentation</p>
                          <a
                            href={existingContent.pptUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:text-blue-800"
                          >
                            View presentation in new tab
                          </a>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Image Preview */}
                  {formData.content_type === 'image' && existingContent.imageUrl && (
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Current Image</h4>
                      <div className="max-w-md">
                        <img
                          src={existingContent.imageUrl}
                          alt="Current image"
                          className="max-w-full h-auto rounded-lg shadow-sm"
                          style={{ maxHeight: '300px' }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Split PDF Preview */}
                  {formData.content_type === 'presentation' && formData.content_text && formData.content_text.includes('"images"') && (
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Split PDF Presentation</h4>
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 text-sm font-medium">📄</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">PDF Split into Images</p>
                          <p className="text-xs text-gray-600">
                            {(() => {
                              try {
                                const splitData = JSON.parse(formData.content_text);
                                return `${splitData.images?.length || 0} pages configured as ${splitData.format || 'slideshow'}`;
                              } catch {
                                return 'Split PDF data loaded';
                              }
                            })()}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* SCORM Preview */}
                  {formData.content_type === 'scorm' && existingContent.scormUrl && (
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Current SCORM Package</h4>
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 text-sm font-medium">ZIP</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">SCORM Package</p>
                          <a
                            href={existingContent.scormUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:text-blue-800"
                          >
                            Download SCORM package
                          </a>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Audio Attachment Preview */}
                  {existingContent.audioUrl && (
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Current Audio Attachment</h4>
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <span className="text-green-600 text-sm font-medium">🎵</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">Audio Narration</p>
                        </div>
                      </div>
                      <audio
                        controls
                        className="w-full max-w-md"
                        src={existingContent.audioUrl}
                      >
                        Your browser does not support the audio element.
                      </audio>
                    </div>
                  )}

                  {/* Text Content Preview */}
                  {formData.content_type === 'text' && formData.content_text && (
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Current Text Content</h4>
                      <div className="prose prose-sm max-w-none">
                        {formData.content_format === 'markdown' ? (
                          <div dangerouslySetInnerHTML={{ 
                            __html: formData.content_text.replace(/\n/g, '<br>') 
                          }} />
                        ) : formData.content_format === 'html' ? (
                          <div dangerouslySetInnerHTML={{ __html: formData.content_text }} />
                        ) : (
                          <div className="whitespace-pre-wrap">{formData.content_text}</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Audio Attachment Section - Available for all lesson types */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Audio Attachment (Optional)</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Attach Audio File
                  </label>
                  <input
                    type="file"
                    accept="audio/*,.mp3,.wav,.ogg,.m4a,.aac,.webm"
                    onChange={handleAudioFileChange}
                    className="block w-full text-sm text-gray-700"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Add an audio narration, explanation, or supplementary audio content. Supported formats: MP3, WAV, OGG, M4A, AAC, WebM. Maximum size: 100MB.
                  </p>
                </div>

                {audioPreviewUrl && (
                  <div className="space-y-3">
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                            <span className="text-green-600 text-sm font-medium">🎵</span>
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-green-900 truncate">
                            {audioFile.name}
                          </p>
                          <p className="text-xs text-green-700">
                            {(audioFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Audio Preview</h4>
                      <audio
                        controls
                        className="w-full"
                        src={audioPreviewUrl}
                      >
                        Your browser does not support the audio element.
                      </audio>
                    </div>
                  </div>
                )}

                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="text-sm font-medium text-blue-900 mb-2">Audio Attachment Information</h4>
                  <ul className="text-xs text-blue-700 space-y-1">
                    <li>• Audio will be displayed alongside the main lesson content</li>
                    <li>• Perfect for adding narration to text lessons or supplementary explanations</li>
                    <li>• Supported formats: MP3, WAV, OGG, M4A, AAC, WebM</li>
                    <li>• Maximum file size: 100MB</li>
                    <li>• Audio is optimized for web playback with built-in controls</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Presentation Content */}
            {formData.content_type === 'presentation' && (
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 text-sm font-medium">📊</span>
                    </div>
                    <h4 className="text-sm font-medium text-blue-900">Presentation Lesson</h4>
                  </div>
                  <p className="text-sm text-blue-700 mb-3">
                    This lesson will contain a curated presentation with multiple content types (images, videos, PDFs, etc.) arranged as slides.
                  </p>
                  <div className="text-sm text-blue-600">
                    <p>• After creating this lesson, you'll be able to add and arrange slides</p>
                    <p>• Each slide can contain different content types</p>
                    <p>• Slides can be reordered and customized</p>
                    <p className="font-medium mt-2">💡 Look for the "Manage Presentation" button in course management to add your slides!</p>
                  </div>
                </div>
              </div>
            )}

            {/* Fallback fields for other types */}
            {formData.content_type !== 'video' && formData.content_type !== 'text' && formData.content_type !== 'pdf' && formData.content_type !== 'ppt' && formData.content_type !== 'scorm' && formData.content_type !== 'image' && formData.content_type !== 'presentation' && (
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
                  {formData.content_type === 'presentation' && pdfSplitData && (
                    <p className="text-xs text-gray-500 mt-1">
                      Content is automatically generated from split PDF. To edit, use the PDF splitter.
                    </p>
                  )}
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
              className={`min-w-[120px] ${
                formData.content_type === 'presentation' && pdfSplitData 
                  ? 'bg-green-600 hover:bg-green-700' 
                  : ''
              }`}
            >
              {loading ? (
                <LoadingSpinner size="sm" />
              ) : (
                formData.content_type === 'presentation' && pdfSplitData 
                  ? (isEditing ? 'Update Presentation' : 'Create Presentation')
                  : (isEditing ? 'Update Lesson' : 'Add Lesson')
              )}
            </Button>
          </div>
        </form>
      </div>

      {/* PDF Splitter Modal */}
      {showPdfSplitter && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-6xl max-h-[90vh] w-full overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">
                PDF Splitter & Arranger
              </h3>
              <button
                onClick={() => setShowPdfSplitter(false)}
                className="p-2 hover:bg-gray-100 rounded-md text-gray-400 hover:text-gray-600"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            <div className="overflow-auto max-h-[calc(90vh-80px)]">
              <PDFSplitter
                onImagesReady={handlePdfSplitterSuccess}
                onCancel={handlePdfSplitterCancel}
                initialSplitData={pdfSplitData}
                courseId={courseId}
                className="p-6"
              />
            </div>
          </div>
        </div>
      )}
    </Card>
  );
} 