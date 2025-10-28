# Course Editor - ClipChamp-Inspired Content Creation Tool

## Overview

The Kyzer Course Editor is a comprehensive, intuitive content curation tool inspired by ClipChamp's user interface. It provides a powerful drag-and-drop experience for creating rich, interactive course content with real-time preview, auto-save, and timeline-based organization.

## Architecture

### File Structure

```
src/
├── store/
│   └── editorStore.js                    # Zustand store for editor state
├── hooks/
│   └── editor/
│       ├── useEditor.js                  # Main editor hook
│       ├── useDragAndDrop.js             # Drag & drop functionality
│       ├── useAutoSave.js                # Auto-save management
│       └── useMediaUpload.js             # Media upload handling
├── lib/
│   └── editor/
│       └── blockRegistry.js              # Content block definitions
├── components/
│   └── editor/
│       ├── CourseEditor.jsx              # Main container
│       ├── EditorToolbar.jsx             # Top toolbar
│       ├── EditorSidebar.jsx             # Left sidebar
│       ├── EditorCanvas.jsx              # Center canvas
│       ├── EditorTimeline.jsx            # Bottom timeline
│       ├── EditorProperties.jsx          # Right properties panel
│       ├── content-blocks/               # Block components
│       │   ├── BlockWrapper.jsx
│       │   ├── TextBlock.jsx
│       │   ├── HeadingBlock.jsx
│       │   ├── ImageBlock.jsx
│       │   ├── VideoBlock.jsx
│       │   └── QuizBlock.jsx
│       └── media/                        # Media management
│           ├── MediaLibrary.jsx
│           ├── MediaUploader.jsx
│           └── MediaGrid.jsx
```

## Features

### 1. **Timeline-Based Organization**
- Visual module and lesson hierarchy
- Drag-and-drop reordering
- Expandable/collapsible modules
- Quick lesson navigation

### 2. **Rich Content Blocks**

#### Basic Blocks
- **Text Block**: Rich text with formatting options
- **Heading Block**: Configurable heading levels (H1-H6)
- **List Block**: Ordered and unordered lists

#### Media Blocks
- **Image Block**: Upload images with captions, sizing, and alignment
- **Video Block**: Support for uploads, YouTube, Vimeo
- **PDF Block**: Embedded PDF viewer

#### Interactive Blocks
- **Quiz Block**: Integrated quiz/assessment tool
- **Presentation Block**: Slide-based content
- **SCORM Block**: SCORM package support

#### Layout Blocks
- **Divider**: Visual separators
- **Spacer**: Custom spacing control
- **Table**: Data tables

#### Advanced Blocks
- **Code Block**: Syntax-highlighted code
- **Embed Block**: External content (iframes, HTML)
- **Link Button**: Call-to-action buttons

### 3. **Drag-and-Drop Interface**
- Drag blocks from sidebar to canvas
- Reorder blocks within lessons
- Visual drop indicators
- Smooth animations

### 4. **Live Preview**
- Toggle between edit and preview modes
- Real-time content rendering
- Accurate learner experience simulation

### 5. **Properties Panel**
- Context-aware settings
- Block-specific configurations
- Real-time updates
- Color pickers, font controls, size adjustments

### 6. **Auto-Save**
- Configurable auto-save interval (default: 30 seconds)
- Unsaved changes indicator
- Manual save option
- Before-unload protection

### 7. **History Management**
- Unlimited undo/redo (configurable max: 50 steps)
- Keyboard shortcuts (Cmd/Ctrl+Z, Cmd/Ctrl+Shift+Z)
- State preservation

### 8. **Media Library**
- Upload images, videos, PDFs
- Organized folder structure
- Search and filter
- Multi-select support
- Progress indicators

### 9. **Zoom & View Controls**
- Zoom in/out (25%-200%)
- Grid toggle
- Ruler display
- Canvas scaling

### 10. **Export Options**
- Export as PDF
- Export as HTML
- Export as SCORM package
- Export as JSON

## Usage

### Starting the Editor

1. **Navigate to a course:**
   ```javascript
   navigate(`/courses/${courseId}/editor`);
   ```

2. **The editor will automatically:**
   - Load course structure (modules & lessons)
   - Initialize the canvas
   - Set up auto-save
   - Enable keyboard shortcuts

### Adding Content Blocks

1. **From Sidebar:**
   - Browse available blocks by category
   - Drag a block to the canvas
   - Block is automatically added with default settings

2. **From Keyboard:**
   - Select canvas area
   - Use quick-add shortcuts (future enhancement)

### Editing Block Properties

1. **Select a block** on the canvas
2. **Properties panel** opens on the right
3. **Modify settings:**
   - Text content
   - Colors, fonts, sizes
   - Media URLs
   - Interactive options
4. Changes apply **immediately**

### Managing Timeline

1. **Click on modules** to expand/collapse
2. **Click on lessons** to load content
3. **Drag modules/lessons** to reorder (future enhancement)
4. **Timeline auto-syncs** with course structure

### Saving Work

**Auto-save:**
- Enabled by default
- Saves every 30 seconds
- Only when changes detected

**Manual save:**
- Click "Save" button in toolbar
- Keyboard: Cmd/Ctrl+S
- Confirmation toast notification

### Preview Mode

1. **Click "Preview" button** in toolbar
2. **Canvas switches to learner view:**
   - Edit controls hidden
   - Interactive elements functional
   - Accurate spacing and styling
3. **Toggle back to edit mode** anytime

## Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Save | `Cmd/Ctrl + S` |
| Undo | `Cmd/Ctrl + Z` |
| Redo | `Cmd/Ctrl + Shift + Z` |
| Copy Block | `Cmd/Ctrl + C` |
| Paste Block | `Cmd/Ctrl + V` |
| Duplicate Block | `Cmd/Ctrl + D` |
| Delete Block | `Delete` or `Backspace` |
| Deselect | `Escape` |

## Block Configuration

### Example: Text Block

```javascript
{
  type: 'text',
  data: {
    content: '<p>Your content here</p>',
    fontSize: 16,
    fontFamily: 'Inter',
    color: '#000000',
    alignment: 'left'
  }
}
```

### Example: Video Block

```javascript
{
  type: 'video',
  data: {
    src: 'https://youtube.com/watch?v=...',
    type: 'youtube',
    autoplay: false,
    controls: true,
    loop: false,
    width: '100%',
    height: '400px'
  }
}
```

### Example: Quiz Block

```javascript
{
  type: 'quiz',
  data: {
    quizId: 'uuid-here',
    title: 'Module Quiz',
    passThreshold: 70,
    showResults: true,
    allowRetakes: true
  }
}
```

## State Management

### Editor Store Structure

```javascript
{
  currentCourse: {...},          // Active course
  currentModule: {...},          // Selected module
  currentLesson: {...},          // Active lesson

  canvas: {
    blocks: [],                  // Content blocks
    selectedBlock: null,         // Active block ID
    clipboard: null,             // Copied block
    zoom: 100,                   // Canvas zoom %
    gridEnabled: true            // Grid visibility
  },

  timeline: {
    modules: [],                 // Course modules
    selectedModule: null,        // Active module
    selectedLesson: null,        // Active lesson
    expandedModules: []          // Expanded module IDs
  },

  history: {
    past: [],                    // Undo history
    present: null,               // Current state
    future: [],                  // Redo history
    maxHistorySize: 50           // Max undo steps
  },

  autoSave: {
    enabled: true,               // Auto-save toggle
    lastSaved: null,             // Last save timestamp
    isSaving: false,             // Save in progress
    hasUnsavedChanges: false     // Changes indicator
  },

  media: {
    files: [],                   // Available media
    selectedFiles: [],           // Selected media IDs
    uploadProgress: {},          // Upload percentages
    currentFolder: 'root'        // Active folder
  },

  ui: {
    sidebarOpen: true,           // Sidebar visibility
    propertiesOpen: true,        // Properties panel
    timelineOpen: true,          // Timeline visibility
    mediaLibraryOpen: false,     // Media library modal
    showGrid: true,              // Grid visibility
    showRulers: false            // Ruler visibility
  }
}
```

## Extending the Editor

### Adding a New Block Type

1. **Define block in registry:**

```javascript
// src/lib/editor/blockRegistry.js
export const BLOCK_REGISTRY = {
  // ... existing blocks

  [BLOCK_TYPES.YOUR_BLOCK]: {
    type: BLOCK_TYPES.YOUR_BLOCK,
    name: 'Your Block',
    description: 'Description here',
    category: BLOCK_CATEGORIES.BASIC,
    icon: YourIcon,
    defaultData: {
      // Default properties
    },
    settings: [
      // Configuration options
    ]
  }
}
```

2. **Create block component:**

```javascript
// src/components/editor/content-blocks/YourBlock.jsx
const YourBlock = ({ data, isPreviewMode }) => {
  return (
    <div>
      {/* Your block rendering */}
    </div>
  );
};

export default YourBlock;
```

3. **Add to BlockWrapper:**

```javascript
// src/components/editor/content-blocks/BlockWrapper.jsx
import YourBlock from './YourBlock';

// In renderBlock():
case BLOCK_TYPES.YOUR_BLOCK:
  return <YourBlock {...commonProps} />;
```

### Adding Custom Actions

```javascript
// In editorStore.js
actions: {
  // Your custom action
  yourCustomAction: (param) => {
    set((state) => ({
      // State updates
    }));
  }
}
```

## Integration with Existing Features

### With Course Management
- Seamless navigation from course list
- Auto-load course structure
- Direct lesson editing

### With Quiz System
- Quiz block integration
- Quiz selector in properties
- Preview quiz content

### With Presentation System
- Presentation block support
- Slide embedding
- Progress tracking integration

### With Media Storage
- Supabase storage integration
- Automatic path management
- CDN URL generation

## Performance Optimization

1. **Lazy Loading**: Content blocks loaded on demand
2. **Debounced Auto-Save**: Prevents excessive saves
3. **Memoized Components**: Reduces re-renders
4. **Virtual Scrolling**: For large lesson lists (future)
5. **Image Optimization**: Automatic resizing and compression (future)

## Future Enhancements

1. **Collaboration Features**
   - Real-time multi-user editing
   - Comments and annotations
   - Version history with diffs
   - Change tracking

2. **Advanced Templates**
   - Pre-built course templates
   - Custom template creation
   - Template marketplace

3. **AI-Powered Features**
   - Content suggestions
   - Grammar checking
   - Auto-formatting
   - Accessibility recommendations

4. **Enhanced Media**
   - Built-in image editor
   - Video trimming
   - Audio recording
   - Screen recording

5. **Analytics Integration**
   - Engagement heatmaps
   - Drop-off points
   - Interaction tracking

## Troubleshooting

### Editor Won't Load
- Check course ID in URL
- Verify Supabase connection
- Check browser console for errors

### Auto-Save Not Working
- Verify `autoSave.enabled` is true
- Check for network issues
- Ensure lesson is selected

### Blocks Not Draggable
- Check browser drag-and-drop support
- Verify event handlers in `useDragAndDrop`
- Test in different browsers

### Media Upload Failing
- Check Supabase storage permissions
- Verify file size limits
- Check file type restrictions

## Best Practices

1. **Save Frequently**: Even with auto-save, manually save important changes
2. **Use Preview Mode**: Test learner experience regularly
3. **Organize Content**: Use modules and lessons logically
4. **Optimize Media**: Compress images and videos before upload
5. **Test Interactivity**: Preview quizzes and presentations
6. **Use Headings**: Structure content with proper heading hierarchy
7. **Add Alt Text**: Make content accessible with image descriptions

## API Reference

See inline JSDoc comments in:
- `src/store/editorStore.js`
- `src/hooks/editor/*.js`
- `src/lib/editor/blockRegistry.js`

## Contributing

When adding new features:
1. Follow existing code patterns
2. Add TypeScript types (future)
3. Write tests for new blocks
4. Update this documentation
5. Add keyboard shortcuts where appropriate

---

**Version**: 1.0.0
**Last Updated**: 2025-10-08
**Maintained By**: Kyzer Development Team
