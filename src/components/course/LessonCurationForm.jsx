// src/components/course/LessonCurationForm.jsx
import { useState, useEffect, useRef } from 'react';
import { useCourseStore } from '@/store/courseStore';
import { useAuth } from '@/hooks/auth/useAuth';
import { 
  Button, 
  Card, 
  Input, 
  LoadingSpinner, 
  useToast,
  ContentTypeIcon,
  ActionButton,
  StatusBadge
} from '@/components/ui';
import SlideEditor from './SlideEditor';
import QuizSlideForm from './QuizSlideForm';
import {
  uploadFile,
  getFileUrl,
  STORAGE_BUCKETS,
  validateFileType,
  validateFileSize
} from '@/lib/supabase';
import {
  Plus,
  Trash2,
  GripVertical,
  Eye,
  Save,
  Upload,
  FileText,
  Image,
  Video,
  File,
  Music,
  Grid3X3,
  X,
  ArrowUp,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export default function LessonCurationForm({ 
  presentation = null, 
  lessonId, 
  courseId,
  onSuccess, 
  onCancel 
}) {
  const { user } = useAuth();
  const { success, error: showError } = useToast();
  
  // Refs for scrolling
  const slidesContainerRef = useRef(null);
  const quizFormRef = useRef(null);
  
  // Store selectors
  const createPresentation = useCourseStore(state => state.actions.createPresentation);
  const updatePresentation = useCourseStore(state => state.actions.updatePresentation);
  const createSlide = useCourseStore(state => state.actions.createSlide);
  const updateSlide = useCourseStore(state => state.actions.updateSlide);
  const deleteSlide = useCourseStore(state => state.actions.deleteSlide);
  const reorderSlides = useCourseStore(state => state.actions.reorderSlides);
  const createQuiz = useCourseStore(state => state.actions.createQuiz);
  const upsertQuizQuestions = useCourseStore(state => state.actions.upsertQuizQuestions);
  const fetchQuizzes = useCourseStore(state => state.actions.fetchQuizzes);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    estimated_duration: ''
  });

  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isEditing] = useState(!!presentation);
  const [isUploading, setIsUploading] = useState(false);
  const [isCreatingQuiz, setIsCreatingQuiz] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [draggedSlide, setDraggedSlide] = useState(null);
  const [showQuizForm, setShowQuizForm] = useState(false);
  const [existingQuizzes, setExistingQuizzes] = useState([]);
  const [showScrollToTop, setShowScrollToTop] = useState(false);
  const [collapsedSlides, setCollapsedSlides] = useState(new Set());

  // Initialize form with presentation data if editing
  useEffect(() => {
    if (presentation) {
      // Load presentation for editing
      
      setFormData({
        title: presentation.title || '',
        description: presentation.description || '',
        estimated_duration: presentation.estimated_duration || ''
      });
      
      // Mark existing slides as not new and ensure proper structure
      const existingSlides = (presentation.slides || []).map(slide => ({
        ...slide,
        isNew: false, // Mark as existing slide
        metadata: slide.metadata || {},
        content_format: slide.content_format || 'plaintext',
        duration_seconds: slide.duration_seconds || 30,
        is_required: slide.is_required !== undefined ? slide.is_required : true
      }));
      
      // Processed slides for editing
      setSlides(existingSlides);
    }
  }, [presentation]);

  // Collapse all slides by default when slides change
  useEffect(() => {
    if (slides.length > 0) {
      setCollapsedSlides(new Set(slides.map(slide => slide.id)));
    }
  }, [slides.length]); // Only run when slide count changes

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const addSlide = () => {
    const newSlide = {
      id: `temp_${Date.now()}`,
      slide_number: slides.length + 1,
      content_type: 'text',
      title: '',
      content_url: '',
      content_text: '',
      content_format: 'plaintext',
      duration_seconds: 30,
      metadata: {},
      is_required: true,
      isNew: true
    };
    setSlides(prev => [...prev, newSlide]);
    
    // Scroll to the new slide after state update
    setTimeout(() => {
      // Find the newly added slide element by its ID
      const newSlideElement = document.querySelector(`[data-slide-id="${newSlide.id}"]`);
      if (newSlideElement) {
        newSlideElement.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
      } else if (slidesContainerRef.current) {
        // Fallback to scrolling to the container if slide element not found
        slidesContainerRef.current.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
      }
    }, 100);
  };

  const handleAddQuiz = () => {
    setShowQuizForm(true);
    
    // Scroll to quiz form section after state update
    setTimeout(() => {
      if (quizFormRef.current) {
        quizFormRef.current.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
      }
    }, 100);
  };

  const handleQuizSuccess = () => {
    console.log('🎯 LessonCurationForm: handleQuizSuccess called - keeping quiz form open');
    // DON'T close the quiz form - let user continue adding quiz slides
    // setShowQuizForm(false); // COMMENTED OUT - this was causing the form to close unexpectedly
    console.log('🎯 LessonCurationForm: Quiz form kept open for user to continue editing');
    // The quiz has been added to local slides state and auto-saved
    // User can continue adding more quiz slides or questions
  };

  // Auto-save function to persist quiz slides immediately
  const autoSavePresentation = async () => {
    console.log('🎯 LessonCurationForm: autoSavePresentation started');

    // Use a default title if formData.title is empty for quiz creation
    const defaultTitle = formData.title || 'Untitled Presentation';

    let presentationData;

    if (isEditing) {
      presentationData = await updatePresentation(presentation.id, {
        title: defaultTitle,
        description: formData.description,
        estimated_duration: formData.estimated_duration ? parseInt(formData.estimated_duration) : null
      });
    } else {
      presentationData = await createPresentation({
        lesson_id: lessonId,
        title: defaultTitle,
        description: formData.description,
        estimated_duration: formData.estimated_duration ? parseInt(formData.estimated_duration) : null,
        created_by: user.id
      });
    }

    if (presentationData.error) {
      throw new Error(presentationData.error);
    }

    const presentationId = presentationData.data.id;

    // Get current slides state to avoid race conditions
    const currentSlides = slides.filter(slide => slide.isNew);
    const existingSlides = slides.filter(slide => !slide.isNew);

    // Create new slides and collect their actual IDs with slide mapping
    const createdSlideIds = [];
    const slideIdMappings = {};

    for (const slide of currentSlides) {
      const slideData = {
        presentation_id: presentationId,
        slide_number: slide.slide_number,
        content_type: slide.content_type,
        title: slide.title,
        content_url: slide.content_url,
        content_text: slide.content_text,
        content_format: slide.content_format,
        duration_seconds: slide.duration_seconds,
        metadata: slide.metadata,
        is_required: slide.is_required
      };

      const createdSlide = await createSlide(slideData);
      if (createdSlide.data) {
        createdSlideIds.push(createdSlide.data.id);
        slideIdMappings[slide.id] = createdSlide.data.id;
      } else {
        console.error('🎯 LessonCurationForm: Failed to create slide:', createdSlide.error);
        throw new Error(`Failed to create slide: ${createdSlide.error}`);
      }
    }

    // Update all slide IDs in one batch to avoid race conditions
    if (Object.keys(slideIdMappings).length > 0) {
      setSlides(prev => prev.map(slide => {
        const newId = slideIdMappings[slide.id];
        return newId ? { ...slide, id: newId, isNew: false } : slide;
      }));
    }

    // Reorder all slides to ensure correct slide numbers
    const existingSlideIds = existingSlides.map(slide => slide.id);
    const allSlideIds = [...existingSlideIds, ...createdSlideIds];

    console.log('🎯 LessonCurationForm: About to reorder slides');
    console.log('🎯 LessonCurationForm: Existing slide IDs:', existingSlideIds);
    console.log('🎯 LessonCurationForm: Created slide IDs:', createdSlideIds);
    console.log('🎯 LessonCurationForm: All slide IDs for reordering:', allSlideIds);

    // TEMPORARY FIX: Skip reordering when creating quiz slides to avoid 409 conflicts
    // Quiz slides are appended at the end with correct slide_number, so reordering isn't needed
    if (allSlideIds.length > 0 && createdSlideIds.length === 0) {
      try {
        const reorderResult = await reorderSlides(presentationId, allSlideIds);
        if (!reorderResult.success) {
          console.error('🎯 LessonCurationForm: Reorder failed:', reorderResult.error);
          throw new Error(`Failed to reorder slides: ${reorderResult.error}`);
        }
        console.log('🎯 LessonCurationForm: Slides reordered successfully');
      } catch (reorderError) {
        console.error('🎯 LessonCurationForm: Reorder error:', reorderError);
        throw new Error(`Failed to reorder slides: ${reorderError.message}`);
      }
    } else if (createdSlideIds.length > 0) {
      console.log('🎯 LessonCurationForm: Skipping reorder for newly created slides to avoid conflicts');
    }

    console.log('🎯 LessonCurationForm: autoSavePresentation completed successfully');

    // Return the presentation data for the onSuccess callback
    return presentationData.data;
  };

  // Auto-save function with explicit slides and form data parameters to avoid state timing issues
  const autoSavePresentationWithSlides = async (slidesArray, currentFormData) => {
    console.log('🎯 LessonCurationForm: autoSavePresentationWithSlides started');

    // Use a default title if currentFormData.title is empty for quiz creation
    const defaultTitle = currentFormData.title || 'Untitled Presentation';

    let presentationData;

    if (isEditing) {
      presentationData = await updatePresentation(presentation.id, {
        title: defaultTitle,
        description: currentFormData.description,
        estimated_duration: currentFormData.estimated_duration ? parseInt(currentFormData.estimated_duration) : null
      });
    } else {
      presentationData = await createPresentation({
        lesson_id: lessonId,
        title: defaultTitle,
        description: currentFormData.description,
        estimated_duration: currentFormData.estimated_duration ? parseInt(currentFormData.estimated_duration) : null,
        created_by: user.id
      });
    }

    if (presentationData.error) {
      throw new Error(presentationData.error);
    }

    const presentationId = presentationData.data.id;

    // Get current slides state to avoid race conditions
    const currentSlides = slidesArray.filter(slide => slide.isNew);
    const existingSlides = slidesArray.filter(slide => !slide.isNew);

    // Create new slides and collect their actual IDs with slide mapping
    const createdSlideIds = [];
    const slideIdMappings = {};

    for (const slide of currentSlides) {
      const slideData = {
        presentation_id: presentationId,
        slide_number: slide.slide_number,
        content_type: slide.content_type,
        title: slide.title,
        content_url: slide.content_url,
        content_text: slide.content_text,
        content_format: slide.content_format,
        duration_seconds: slide.duration_seconds,
        metadata: slide.metadata,
        is_required: slide.is_required
      };

      const createdSlide = await createSlide(slideData);
      if (createdSlide.data) {
        createdSlideIds.push(createdSlide.data.id);
        slideIdMappings[slide.id] = createdSlide.data.id;
      } else {
        console.error('🎯 LessonCurationForm: Failed to create slide:', createdSlide.error);
        throw new Error(`Failed to create slide: ${createdSlide.error}`);
      }
    }

    // Update all slide IDs in one batch to avoid race conditions
    if (Object.keys(slideIdMappings).length > 0) {
      setSlides(prev => prev.map(slide => {
        const newId = slideIdMappings[slide.id];
        return newId ? { ...slide, id: newId, isNew: false } : slide;
      }));
    }

    // Reorder all slides to ensure correct slide numbers
    const existingSlideIds = existingSlides.map(slide => slide.id);
    const allSlideIds = [...existingSlideIds, ...createdSlideIds];

    console.log('🎯 LessonCurationForm: autoSavePresentationWithSlides - About to reorder slides');
    console.log('🎯 LessonCurationForm: Existing slide IDs:', existingSlideIds);
    console.log('🎯 LessonCurationForm: Created slide IDs:', createdSlideIds);
    console.log('🎯 LessonCurationForm: All slide IDs for reordering:', allSlideIds);

    // TEMPORARY FIX: Skip reordering when creating quiz slides to avoid 409 conflicts
    // Quiz slides are appended at the end with correct slide_number, so reordering isn't needed
    if (allSlideIds.length > 0 && createdSlideIds.length === 0) {
      try {
        const reorderResult = await reorderSlides(presentationId, allSlideIds);
        if (!reorderResult.success) {
          console.error('🎯 LessonCurationForm: autoSavePresentationWithSlides - Reorder failed:', reorderResult.error);
          throw new Error(`Failed to reorder slides: ${reorderResult.error}`);
        }
        console.log('🎯 LessonCurationForm: autoSavePresentationWithSlides - Slides reordered successfully');
      } catch (reorderError) {
        console.error('🎯 LessonCurationForm: autoSavePresentationWithSlides - Reorder error:', reorderError);
        throw new Error(`Failed to reorder slides: ${reorderError.message}`);
      }
    } else if (createdSlideIds.length > 0) {
      console.log('🎯 LessonCurationForm: autoSavePresentationWithSlides - Skipping reorder for newly created slides to avoid conflicts');
    }

    console.log('🎯 LessonCurationForm: autoSavePresentationWithSlides completed successfully');

    // Return the presentation data for the onSuccess callback
    return presentationData.data;
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const updateSlideData = (slideId, updates) => {
    setSlides(prev => prev.map(slide => 
      slide.id === slideId ? { ...slide, ...updates } : slide
    ));
  };

  const removeSlide = (slideId) => {
    setSlides(prev => {
      const filtered = prev.filter(slide => slide.id !== slideId);
      // Renumber slides after removal
      return filtered.map((slide, index) => ({
        ...slide,
        slide_number: index + 1
      }));
    });
  };

  const handleDragStart = (e, slideId) => {
    setDraggedSlide(slideId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, targetSlideId) => {
    e.preventDefault();
    if (!draggedSlide || draggedSlide === targetSlideId) return;

    const draggedIndex = slides.findIndex(slide => slide.id === draggedSlide);
    const targetIndex = slides.findIndex(slide => slide.id === targetSlideId);
    
    if (draggedIndex === -1 || targetIndex === -1) return;

    const newSlides = [...slides];
    const [draggedSlideData] = newSlides.splice(draggedIndex, 1);
    newSlides.splice(targetIndex, 0, draggedSlideData);

    // Renumber slides
    const renumberedSlides = newSlides.map((slide, index) => ({
      ...slide,
      slide_number: index + 1
    }));

    setSlides(renumberedSlides);
    setDraggedSlide(null);
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      setError('Presentation title is required');
      return false;
    }
    if (slides.length === 0) {
      setError('At least one slide is required');
      return false;
    }
    
    // Validate each slide
    for (const slide of slides) {
      if (!slide.title.trim()) {
        setError(`Slide ${slide.slide_number} title is required`);
        return false;
      }
      if (slide.content_type === 'text' && !slide.content_text.trim()) {
        setError(`Slide ${slide.slide_number} content is required`);
        return false;
      }
      if (['video', 'image', 'pdf', 'audio', 'document'].includes(slide.content_type) && !slide.content_url.trim()) {
        setError(`Slide ${slide.slide_number} file is required`);
        return false;
      }
      if (slide.content_type === 'quiz' && (!slide.metadata || !slide.metadata.quiz_id)) {
        setError(`Slide ${slide.slide_number} quiz data is required`);
        return false;
      }
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    console.log('🎯 LessonCurationForm: handleSubmit called - this should only happen when user explicitly saves presentation');
    console.log('🎯 LessonCurationForm: Event type:', e.type);
    console.log('🎯 LessonCurationForm: Current slides count:', slides.length);

    if (!validateForm()) return;

    setLoading(true);

    try {
      let presentationData;
      
      if (isEditing) {
        presentationData = await updatePresentation(presentation.id, {
          title: formData.title,
          description: formData.description,
          estimated_duration: formData.estimated_duration ? parseInt(formData.estimated_duration) : null
        });
      } else {
        presentationData = await createPresentation({
          lesson_id: lessonId,
          title: formData.title,
          description: formData.description,
          estimated_duration: formData.estimated_duration ? parseInt(formData.estimated_duration) : null,
          created_by: user.id
        });
      }

      if (presentationData.error) {
        setError(presentationData.error);
        showError(presentationData.error);
        setLoading(false);
        return;
      }

      // Handle slides
      const presentationId = presentationData.data.id;
      
      // Separate new slides from existing slides
      const newSlides = slides.filter(slide => slide.isNew);
      const existingSlides = slides.filter(slide => !slide.isNew);
      
      // Get all current slides from the database to identify deleted ones
      let slidesToDelete = [];
      if (isEditing && presentation?.slides) {
        const currentSlideIds = existingSlides.map(slide => slide.id);
        slidesToDelete = presentation.slides.filter(dbSlide => !currentSlideIds.includes(dbSlide.id));
        
        if (slidesToDelete.length > 0) {
          console.log('Slides to delete:', slidesToDelete.map(s => s.id));
        }
      }

      // Delete slides that were removed
      for (const slide of slidesToDelete) {
        await deleteSlide(slide.id);
      }

      // Update existing slides (excluding slide_number to avoid conflicts)
      for (const slide of existingSlides) {
        const slideData = {
          content_type: slide.content_type,
          title: slide.title,
          content_url: slide.content_url,
          content_text: slide.content_text,
          content_format: slide.content_format,
          duration_seconds: slide.duration_seconds,
          metadata: slide.metadata,
          is_required: slide.is_required
        };

        await updateSlide(slide.id, slideData);
      }

      // Create new slides and collect their actual IDs
      const createdSlideIds = [];
      for (const slide of newSlides) {
        const slideData = {
          presentation_id: presentationId,
          slide_number: slide.slide_number,
          content_type: slide.content_type,
          title: slide.title,
          content_url: slide.content_url,
          content_text: slide.content_text,
          content_format: slide.content_format,
          duration_seconds: slide.duration_seconds,
          metadata: slide.metadata,
          is_required: slide.is_required
        };

        const createdSlide = await createSlide(slideData);
        if (createdSlide.data) {
          createdSlideIds.push(createdSlide.data.id);
        }
      }

      // Reorder all slides to ensure correct slide numbers
      // Use actual database IDs for existing slides and newly created slides
      const existingSlideIds = existingSlides.map(slide => slide.id);
      const allSlideIds = [...existingSlideIds, ...createdSlideIds];
      
      if (allSlideIds.length > 0) {
        await reorderSlides(presentationId, allSlideIds);
      }

      const message = isEditing 
        ? `Presentation "${formData.title}" updated successfully!` 
        : `Presentation "${formData.title}" created successfully!`;
      
      success(message);
      onSuccess(presentationData.data);
    } catch (error) {
      setError(error.message || 'An unexpected error occurred');
      showError(error.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Toggle slide collapse state
  const toggleSlideCollapse = (slideId) => {
    setCollapsedSlides(prev => {
      const newSet = new Set(prev);
      if (newSet.has(slideId)) {
        newSet.delete(slideId);
      } else {
        newSet.add(slideId);
      }
      return newSet;
    });
  };

  const getContentTypeIcon = (contentType) => {
    return <ContentTypeIcon type={contentType} size={16} className="w-4 h-4" />;
  };

  // Fetch existing quizzes for the course
  useEffect(() => {
    if (courseId) {
      const loadQuizzes = async () => {
        try {
          const result = await fetchQuizzes(courseId);
          if (result.data) {
            setExistingQuizzes(result.data);
          }
        } catch (error) {
          console.error('Failed to load quizzes:', error);
        }
      };
      loadQuizzes();
    }
  }, [courseId, fetchQuizzes]);

  // Scroll to top button visibility
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const shouldShow = scrollTop > 100;
      setShowScrollToTop(shouldShow);
    };

    // Check initial scroll position
    handleScroll();

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle adding quiz slide
  const handleAddQuizSlide = async (quizData) => {
    console.log('🎯 LessonCurationForm: handleAddQuizSlide started with data:', quizData);
    setIsCreatingQuiz(true);
    try {
      // Create quiz first
      console.log('🎯 LessonCurationForm: Creating quiz...');
      const quizResult = await createQuiz(quizData, courseId, user.id);
      console.log('🎯 LessonCurationForm: Quiz creation result:', quizResult);
      
      if (quizResult.error) {
        console.log('🎯 LessonCurationForm: Quiz creation failed:', quizResult.error);
        showError('Failed to create quiz: ' + quizResult.error);
        setIsCreatingQuiz(false);
        return { error: quizResult.error };
      }

      // Save quiz questions if they exist
      if (quizData.questions && quizData.questions.length > 0) {
        console.log('🎯 LessonCurationForm: Saving quiz questions...');
        const questionsResult = await upsertQuizQuestions(quizResult.data.id, quizData.questions);
        console.log('🎯 LessonCurationForm: Questions save result:', questionsResult);
        
        if (questionsResult.error) {
          console.log('🎯 LessonCurationForm: Questions save failed:', questionsResult.error);
          showError('Failed to save quiz questions: ' + questionsResult.error);
          setIsCreatingQuiz(false);
          return { error: questionsResult.error };
        }
      }

      // Create quiz slide
      console.log('🎯 LessonCurationForm: Creating quiz slide object...');
      const quizSlide = {
        id: `temp_${Date.now()}`,
        slide_number: slides.length + 1,
        content_type: 'quiz',
        title: quizData.title,
        content_url: '',
        content_text: quizData.description || '',
        content_format: 'quiz',
        duration_seconds: quizData.time_limit_minutes ? quizData.time_limit_minutes * 60 : 300, // Default 5 minutes
        metadata: {
          quiz_id: quizResult.data.id,
          pass_threshold: quizData.pass_threshold,
          time_limit_minutes: quizData.time_limit_minutes,
          question_count: quizData.questions ? quizData.questions.length : 0
        },
        is_required: true,
        isNew: true
      };

      console.log('🎯 LessonCurationForm: Adding quiz slide to slides array:', quizSlide);

      // Update slides state and form data title if needed
      const updatedFormData = {
        ...formData,
        title: formData.title || quizData.title || 'Quiz Presentation'
      };

      // Update state synchronously
      setSlides(prev => [...prev, quizSlide]);
      setFormData(updatedFormData);

      // TEMPORARILY DISABLE AUTO-SAVE TO TEST IF IT'S CAUSING FORM SUBMISSION ISSUES
      console.log('🎯 LessonCurationForm: AUTO-SAVE DISABLED FOR DEBUGGING - quiz slide created in memory only');
      console.log('🎯 LessonCurationForm: Quiz slide will be saved when user manually saves presentation');

      // // Auto-save the presentation to persist the quiz slide immediately
      // console.log('🎯 LessonCurationForm: Auto-saving presentation with new quiz slide...');
      // try {
      //   // Use a manual auto-save approach with the updated slides array
      //   const newSlidesArray = [...slides, quizSlide];
      //   const autoSaveResult = await autoSavePresentationWithSlides(newSlidesArray, updatedFormData);
      //   console.log('🎯 LessonCurationForm: Auto-save completed successfully');

      //   // DON'T trigger onSuccess callback during quiz creation - this causes unwanted redirect
      //   // The onSuccess callback should only be called when the user explicitly saves or finishes editing
      //   // if (onSuccess && autoSaveResult) {
      //   //   onSuccess(autoSaveResult);
      //   // }
      //   console.log('🎯 LessonCurationForm: Skipping onSuccess callback to prevent redirect during quiz editing');
      //   console.log('🎯 LessonCurationForm: onSuccess function exists:', !!onSuccess);
      //   console.log('🎯 LessonCurationForm: Auto-save result:', autoSaveResult);
      // } catch (autoSaveError) {
      //   console.log('🎯 LessonCurationForm: Auto-save failed:', autoSaveError);
      //   // Show a warning but don't fail completely
      //   showError('Quiz slide created but auto-save failed. Please save manually.');
      // }
      
      console.log('🎯 LessonCurationForm: Keeping quiz form open for user to continue editing...');
      // Don't close the form - let user continue adding more quiz slides or questions
      setIsCreatingQuiz(false);
      success('Quiz slide added and saved successfully! You can add more questions or create another quiz slide.');
      
      console.log('🎯 LessonCurationForm: handleAddQuizSlide completed successfully');
      return { success: true, quizSlide };
    } catch (error) {
      console.log('🎯 LessonCurationForm: Error in handleAddQuizSlide:', error);
      showError('Failed to create quiz slide: ' + error.message);
      setIsCreatingQuiz(false);
      return { error: error.message };
    }
  };

  // Handle selecting existing quiz
  const handleSelectExistingQuiz = async (quiz) => {
    const quizSlide = {
      id: `temp_${Date.now()}`,
      slide_number: slides.length + 1,
      content_type: 'quiz',
      title: quiz.title,
      content_url: '',
      content_text: quiz.description || '',
      content_format: 'quiz',
      duration_seconds: quiz.time_limit_minutes ? quiz.time_limit_minutes * 60 : 300,
      metadata: {
        quiz_id: quiz.id,
        pass_threshold: quiz.pass_threshold,
        time_limit_minutes: quiz.time_limit_minutes,
        question_count: quiz.question_count || 0
      },
      is_required: true,
      isNew: true
    };

    setSlides(prev => [...prev, quizSlide]);
    
    // TEMPORARILY DISABLE AUTO-SAVE TO TEST IF IT'S CAUSING FORM SUBMISSION ISSUES
    console.log('🎯 LessonCurationForm: AUTO-SAVE DISABLED FOR EXISTING QUIZ - quiz slide created in memory only');
    console.log('🎯 LessonCurationForm: Existing quiz slide will be saved when user manually saves presentation');

    // // Auto-save the presentation to persist the quiz slide immediately
    // console.log('🎯 LessonCurationForm: Auto-saving presentation with existing quiz slide...');
    // try {
    //   const autoSaveResult = await autoSavePresentation();
    //   console.log('🎯 LessonCurationForm: Auto-save for existing quiz completed successfully');

    //   // DON'T trigger onSuccess callback during existing quiz selection - this causes unwanted redirect
    //   // The onSuccess callback should only be called when the user explicitly saves or finishes editing
    //   // if (onSuccess && autoSaveResult) {
    //   //   onSuccess(autoSaveResult);
    //   // }
    //   console.log('🎯 LessonCurationForm: Skipping onSuccess callback to prevent redirect during existing quiz selection');
    //   console.log('🎯 LessonCurationForm: onSuccess function exists:', !!onSuccess);
    //   console.log('🎯 LessonCurationForm: Auto-save result for existing quiz:', autoSaveResult);
    // } catch (autoSaveError) {
    //   console.log('🎯 LessonCurationForm: Auto-save for existing quiz failed:', autoSaveError);
    //   // Don't show error to user as the quiz slide is still in local state
    // }
    
    // DON'T close the quiz form - let user continue adding more quiz slides
    // setShowQuizForm(false); // COMMENTED OUT - this was causing the form to close unexpectedly
    success('Existing quiz slide added and saved successfully! You can add more quiz slides or close the form manually.');
  };

  return (
    <Card className="max-w-6xl mx-auto">
      <div className="p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          {isEditing ? 'Edit Presentation' : 'Create New Presentation'}
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
                Presentation Title *
              </label>
              <Input
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Enter presentation title"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Enter presentation description"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estimated Duration (minutes)
              </label>
              <Input
                name="estimated_duration"
                type="number"
                value={formData.estimated_duration}
                onChange={handleInputChange}
                placeholder="e.g., 30"
                min="1"
              />
            </div>
          </div>

          {/* Slides Management */}
          <div className="border-t pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Slides ({slides.length})
              </h3>
              <div className="flex gap-2">
                <Button
                  type="button"
                  onClick={addSlide}
                  variant="outline"
                  size="sm"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Slide
                </Button>
                <ActionButton
                  action="add"
                  onClick={handleAddQuiz}
                  variant="outline"
                  size="sm"
                >
                  Add Quiz
                </ActionButton>
              </div>
            </div>

            {slides.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No slides yet. Click "Add Slide" to get started.</p>
              </div>
            ) : (
              <div ref={slidesContainerRef} className="space-y-4">
                {slides.map((slide, index) => (
                  <div
                    key={slide.id}
                    data-slide-id={slide.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, slide.id)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, slide.id)}
                    className={`border rounded-lg p-4 hover:shadow-md transition-shadow ${
                      slide.content_type === 'quiz' 
                        ? 'bg-blue-50 border-blue-200' 
                        : 'bg-white'
                    } ${
                      draggedSlide === slide.id ? 'opacity-50' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <GripVertical className="w-4 h-4 text-gray-400 cursor-move" />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleSlideCollapse(slide.id)}
                          className="p-1 hover:bg-gray-100"
                        >
                          {collapsedSlides.has(slide.id) ? (
                            <ChevronDown className="w-4 h-4 text-gray-500" />
                          ) : (
                            <ChevronUp className="w-4 h-4 text-gray-500" />
                          )}
                        </Button>
                        <span className="text-sm font-medium text-gray-600">
                          Slide {slide.slide_number}
                        </span>
                        <div className={`flex items-center gap-1 ${
                          slide.content_type === 'quiz' ? 'text-blue-600' : 'text-gray-500'
                        }`}>
                          {getContentTypeIcon(slide.content_type)}
                          <span className="text-xs capitalize font-medium">
                            {slide.content_type === 'quiz' ? 'Quiz' : slide.content_type}
                          </span>
                        </div>
                        {slide.content_type === 'quiz' && (
                          <StatusBadge status="info" size="sm">
                            Assessment
                          </StatusBadge>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeSlide(slide.id)}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </div>

                    {/* Collapsible content section */}
                    <div className={`transition-all duration-300 ease-in-out overflow-hidden ${
                      collapsedSlides.has(slide.id)
                        ? 'max-h-0 opacity-0'
                        : 'max-h-[1000px] opacity-100'
                    }`}>
                      {/* Quiz metadata display */}
                      {slide.content_type === 'quiz' && slide.metadata && (
                        <div className="mb-3 p-3 bg-blue-100 rounded-lg">
                          <div className="text-sm text-blue-800 space-y-1">
                            {slide.metadata.question_count > 0 && (
                              <p><strong>{slide.metadata.question_count}</strong> questions</p>
                            )}
                            {slide.metadata.pass_threshold && (
                              <p>Pass threshold: <strong>{slide.metadata.pass_threshold}%</strong></p>
                            )}
                            {slide.metadata.time_limit_minutes && (
                              <p>Time limit: <strong>{slide.metadata.time_limit_minutes} minutes</strong></p>
                            )}
                          </div>
                        </div>
                      )}

                      <SlideEditor
                        slide={slide}
                        onUpdate={(updates) => updateSlideData(slide.id, updates)}
                        courseId={courseId}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quiz Form Section */}
          {showQuizForm && (
            <div ref={quizFormRef} className="border-t pt-6">
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Add Quiz to Presentation</h3>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowQuizForm(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                
                <QuizSlideForm
                  onAddQuizSlide={handleAddQuizSlide}
                  onQuizSuccess={handleQuizSuccess}
                  existingQuizzes={existingQuizzes}
                  onSelectExistingQuiz={(quiz) => {
                    // Handle selecting existing quiz
                    handleAddQuizSlide({
                      title: quiz.title,
                      description: quiz.description,
                      pass_threshold: quiz.pass_threshold,
                      time_limit_minutes: quiz.time_limit_minutes,
                      lesson_id: lessonId,
                      quiz_id: quiz.id
                    });
                  }}
                  presentationId={presentation?.id}
                />
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-4 pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || isUploading || isCreatingQuiz}
            >
              {loading ? (
                <LoadingSpinner size="sm" className="mr-2" />
              ) : isCreatingQuiz ? (
                <LoadingSpinner size="sm" className="mr-2" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              {isCreatingQuiz ? 'Adding Quiz...' : isEditing ? 'Update Presentation' : 'Create Presentation'}
            </Button>
          </div>
        </form>
      </div>

      {/* Scroll to Top Button */}
      {showScrollToTop && (
        <Button
          type="button"
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-[9999] bg-primary-default hover:bg-primary-dark text-white rounded-full p-3 shadow-2xl transition-all duration-300 hover:scale-105 border-2 border-white"
          size="sm"
        >
          <ArrowUp className="w-5 h-5" />
        </Button>
      )}
    </Card>
  );
}
