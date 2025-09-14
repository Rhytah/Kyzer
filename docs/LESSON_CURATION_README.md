# Lesson Curation Feature

## Overview

The Lesson Curation feature allows course creators to create rich, multi-format presentations by combining various content types (images, videos, PDFs, documents, audio, and text) into a single cohesive lesson experience.

## Features

### 🎯 Multi-Format Content Support
- **Images**: JPEG, PNG, GIF, WebP, SVG
- **Videos**: MP4, WebM, OGG, MOV
- **PDFs**: Document viewing and embedding
- **Audio**: MP3, WAV, OGG
- **Documents**: DOC, DOCX, PPT, PPTX, TXT
- **Text**: Plain text, Markdown, HTML

### 📊 Presentation Management
- Create and edit presentations with multiple slides
- Drag-and-drop slide reordering
- Individual slide duration settings
- Required/optional slide marking
- Real-time preview functionality

### 🎨 User Experience
- Intuitive slide editor with content type selection
- File upload with validation and progress tracking
- External URL support for all content types
- Fullscreen presentation viewing
- Auto-advance slides based on duration
- Progress tracking and completion status

## Database Schema

### Tables Created
1. **lesson_presentations**: Stores presentation metadata
2. **presentation_slides**: Stores individual slide content

### Key Features
- Row Level Security (RLS) policies for data protection
- Automatic slide count updates
- Timestamp tracking for all changes
- JSON metadata support for content-specific information

## Components

### Core Components
1. **LessonCurationForm**: Main form for creating/editing presentations
2. **SlideEditor**: Individual slide content management
3. **PresentationViewer**: Full presentation display and navigation
4. **PresentationManagement**: Administrative interface

### Integration Points
- **LessonForm**: Added "Presentation" content type option
- **LessonView**: Integrated presentation viewing in lesson player
- **CourseStore**: Added presentation management functions

## Usage Workflow

### 1. Creating a Presentation Lesson
1. Go to course management
2. Create a new lesson
3. Select "Presentation (Multi-format)" as content type
4. Fill in basic lesson details
5. Save the lesson

### 2. Building the Presentation
1. Navigate to the lesson's presentation management page
2. Click "Create Presentation"
3. Add slides with different content types:
   - Upload files or use external URLs
   - Set slide duration and requirements
   - Preview content before saving
4. Drag and drop to reorder slides
5. Save the presentation

### 3. Viewing Presentations
1. Students access the lesson normally
2. Presentation loads with slide navigation
3. Auto-advance based on slide duration
4. Manual navigation controls available
5. Progress tracking and completion status

## File Structure

```
src/
├── components/course/
│   ├── LessonCurationForm.jsx      # Main presentation form
│   ├── SlideEditor.jsx             # Individual slide editor
│   └── PresentationViewer.jsx      # Presentation display
├── pages/courses/
│   └── PresentationManagement.jsx  # Admin interface
├── store/
│   └── courseStore.js              # Updated with presentation functions
└── database/
    └── lesson_curation_schema.sql  # Database schema
```

## API Functions

### Presentation Management
- `createPresentation(presentationData)`
- `updatePresentation(presentationId, updates)`
- `deletePresentation(presentationId)`
- `fetchPresentation(presentationId)`
- `fetchPresentationByLesson(lessonId)`

### Slide Management
- `createSlide(slideData)`
- `updateSlide(slideId, updates)`
- `deleteSlide(slideId)`
- `reorderSlides(presentationId, slideIds)`

## Security Features

- RLS policies ensure users can only access presentations for enrolled courses
- File upload validation with type and size restrictions
- Secure file storage with proper access controls
- Input sanitization for all user-provided content

## Performance Considerations

- Lazy loading of presentation content
- Optimized file upload with progress tracking
- Efficient slide reordering with minimal database calls
- Cached presentation data for better performance

## Future Enhancements

- Slide templates and themes
- Collaborative editing capabilities
- Advanced analytics and engagement tracking
- Export presentations to various formats
- Integration with external presentation tools

## Troubleshooting

### Common Issues
1. **File Upload Failures**: Check file size and type restrictions
2. **Presentation Not Loading**: Verify lesson content type is "presentation"
3. **Slide Order Issues**: Use drag-and-drop or manual reordering
4. **Preview Problems**: Ensure file URLs are accessible

### Database Setup
Run the `lesson_curation_schema.sql` file in your Supabase SQL editor to create the necessary tables and policies.

## Support

For technical support or feature requests, please refer to the main project documentation or contact the development team.
