# PDF Splitter & Multi-Format Arrangement

This document describes the new PDF splitting functionality that allows users to convert PDF documents into individual page images that can be rearranged and presented in multiple formats.

## Features

### 1. PDF to Images Conversion
- Upload PDF files up to 100MB
- Convert each page to high-quality JPEG images
- Automatic upload to Supabase storage
- Progress tracking during conversion

### 2. Image Arrangement
- Drag and drop interface for reordering pages
- Remove unwanted pages
- Rotate individual pages
- Preview functionality
- Multiple selection and batch operations

### 3. Multi-Format Layouts
- **Slideshow**: Full-screen presentation mode with auto-advance
- **Booklet**: Two-page spread layout for reading
- **Grid**: Multiple pages displayed simultaneously
- **Mobile**: Optimized for mobile devices
- **Document**: Scrollable document view

### 4. Format Customization
- Auto-advance timing for slideshows
- Navigation controls toggle
- Loop presentation option
- Page size selection for booklets
- Column count for grid layouts
- Uniform sizing options

## Usage

### In Lesson Creation

1. **Create a new lesson** with content type "PDF"
2. **Select "Split to Images"** as the PDF source
3. **Click "Open Splitter"** to launch the PDF splitter modal
4. **Upload your PDF file** and wait for processing
5. **Arrange pages** using drag and drop
6. **Choose presentation format** (slideshow, booklet, grid, etc.)
7. **Customize format settings** as needed
8. **Save configuration** to complete the lesson

### In Lesson Editing

1. **Open an existing PDF lesson** for editing
2. **If the lesson was previously split**, you'll see "Edit Split PDF" option
3. **Click "Edit Split"** to modify the existing arrangement
4. **Rearrange pages** or **change format settings**
5. **Add more pages** using the "Add Pages" button (if needed)
6. **Save changes** to update the lesson

### In Presentations

1. **Create a presentation lesson** with content type "Presentation (Multi-format)"
2. **Go to presentation management** and create slides
3. **Add a PDF slide** by selecting "PDF Document" content type
4. **Choose "Split to Images"** as the PDF source
5. **Click "Open Splitter"** to configure the PDF split
6. **Arrange pages and choose format** as needed
7. **Save the slide** - the split PDF will be embedded in the presentation

### Editing Features

- **Rearrange existing pages** with drag and drop
- **Change presentation format** (slideshow ↔ booklet ↔ grid, etc.)
- **Update format settings** (auto-advance, columns, etc.)
- **Add new pages** from additional PDF files
- **Remove unwanted pages**
- **Preview changes** before saving
- **Remove split configuration** to revert to regular PDF

### File Structure

```
src/
├── utils/
│   └── pdfSplitter.js           # Core PDF processing utilities
├── components/course/
│   ├── PDFSplitter.jsx          # Main splitter component
│   ├── ImageArrangement.jsx     # Drag & drop arrangement
│   ├── MultiFormatLayout.jsx    # Format selection & settings
│   └── PDFImageViewer.jsx       # Multi-format display
├── hooks/courses/
│   └── usePdfSplitter.js        # PDF splitting hook
└── components/course/
    └── LessonForm.jsx           # Updated with splitter integration
```

### Technical Details

#### PDF Processing
- Uses PDF.js library for client-side PDF rendering
- Converts pages to canvas elements
- Exports as JPEG with configurable quality
- Automatic cleanup of temporary object URLs

#### Storage
- Images stored in Supabase storage under `lessons/pdf-images/{courseId}/`
- Original PDF metadata preserved
- Split configuration stored as JSON in lesson content_text

#### Performance
- Client-side processing reduces server load
- Progress tracking for user feedback
- Efficient memory management with cleanup
- Lazy loading for large PDFs

#### Editing Workflow
- Automatic detection of existing split PDFs
- Seamless transition between creation and editing modes
- Preservation of original configuration when editing
- Ability to add pages to existing splits
- Option to remove split configuration entirely

#### Presentation Integration
- PDF splitter available in slide creation within presentations
- Split PDFs embedded as individual slides in multi-format presentations
- Maintains all split functionality within presentation context
- Seamless integration with existing presentation workflow

### API Integration

The PDF splitter integrates with the existing course management system:

```javascript
// Example usage in lesson creation
const lessonData = {
  title: "My PDF Lesson",
  content_type: "pdf",
  content_text: JSON.stringify({
    images: [...], // Array of image objects
    format: "slideshow",
    settings: {...},
    originalPdf: {...}
  })
};
```

### Browser Compatibility

- Modern browsers with Canvas API support
- PDF.js compatibility
- Drag and drop API support
- ES6+ features required

### Limitations

- Maximum PDF size: 100MB
- Client-side processing may be slow for very large PDFs
- Requires sufficient browser memory for processing
- PDF.js worker must be accessible from CDN

## Future Enhancements

- Server-side PDF processing for large files
- OCR text extraction for searchable content
- Annotations and markup tools
- Collaborative editing features
- Export to various formats (PPT, HTML, etc.)

## Troubleshooting

### Common Issues

1. **PDF processing fails**
   - Check file size (max 100MB)
   - Verify PDF is not password protected
   - Ensure stable internet connection for PDF.js worker

2. **Images not loading**
   - Check Supabase storage permissions
   - Verify course ID is valid
   - Check browser console for errors

3. **Drag and drop not working**
   - Ensure browser supports HTML5 drag and drop
   - Check for JavaScript errors
   - Try refreshing the page

### Debug Mode

Enable debug logging by setting:
```javascript
localStorage.setItem('pdf-splitter-debug', 'true');
```

This will log detailed information about the PDF processing and image arrangement steps.
