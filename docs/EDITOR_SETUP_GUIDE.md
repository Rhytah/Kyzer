# Course Editor - Setup & Migration Guide

## 🚀 Quick Start

The course editor is now functional! Follow these steps to enable it:

### Step 1: Run Database Migration

**REQUIRED** - Add the `content_blocks` column to your lessons table:

```bash
# Navigate to your project directory
cd /Users/ritanamono/Desktop/byase/Kyzer

# Run the migration using Supabase CLI
supabase db push migrations/add_content_blocks_to_lessons.sql

# OR apply directly in Supabase Dashboard
# Go to SQL Editor and run the migration file
```

**Alternative: Manual Migration**

If you don't have Supabase CLI, copy and run this SQL in your Supabase Dashboard → SQL Editor:

```sql
-- Add content_blocks column to store editor block data
ALTER TABLE lessons
ADD COLUMN IF NOT EXISTS content_blocks JSONB DEFAULT '[]'::jsonb;

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_lessons_content_blocks
ON lessons USING GIN (content_blocks);

-- Add constraint to ensure it's always an array
ALTER TABLE lessons
ADD CONSTRAINT content_blocks_is_array
CHECK (jsonb_typeof(content_blocks) = 'array');

-- Update existing lessons
UPDATE lessons
SET content_blocks = '[]'::jsonb
WHERE content_blocks IS NULL;
```

### Step 2: Verify Migration

```sql
-- Check if column exists
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'lessons'
AND column_name = 'content_blocks';

-- Should return:
-- column_name     | data_type | column_default
-- content_blocks  | jsonb     | '[]'::jsonb
```

### Step 3: Test the Editor

1. Navigate to any course you created
2. Click "Edit Course Content" button
3. Select a lesson from the timeline
4. Start adding content blocks!

## ✨ Features Now Working

### ✅ Fully Functional
- ✅ Course loading with modules and lessons
- ✅ Lesson selection from timeline
- ✅ Drag-and-drop blocks from sidebar
- ✅ Block editing (text, images, videos, quizzes)
- ✅ Block deletion and duplication
- ✅ Auto-save (every 30 seconds)
- ✅ Manual save button
- ✅ Undo/Redo (50 steps)
- ✅ Keyboard shortcuts
- ✅ Zoom controls (25%-200%)
- ✅ Preview mode
- ✅ Grid overlay
- ✅ Responsive panels

### 🎯 User Experience Improvements
- Clear empty states with guidance
- Success/error toasts for all operations
- Loading states during initialization
- Better error messages
- Visual feedback for selection
- Block count display

## 🎨 How to Use the Editor

### 1. Access the Editor
```
Navigate to: /app/editor/{course-id}

Or click "Edit Course Content" button on:
- Course Detail page (for course creators)
- My Courses page (on your course cards)
```

### 2. Select a Lesson
- Look at the **timeline** at the bottom
- Click a **module** to expand it
- Click a **lesson** to load it into the editor
- You'll see a success message: "Ready to edit {lesson name}"

### 3. Add Content
- **Sidebar** (left) has all available blocks
- **Drag** a block type (Text, Image, Video, etc.)
- **Drop** it onto the canvas (center)
- Block appears with default content

### 4. Edit Content
- **Click** a block to select it
- **Properties panel** (right) shows editable fields
- Change text, colors, sizes, URLs, etc.
- Changes apply immediately

### 5. Manage Blocks
- **Hover** over a block to see controls (left side)
- **Grip icon** - Drag to reorder (future feature)
- **Copy icon** - Duplicate the block
- **Trash icon** - Delete the block

### 6. Save Your Work
- **Auto-save** runs every 30 seconds
- **Manual save**: Click "Save" button (top right)
- Or press `Cmd/Ctrl + S`
- Watch for "All changes saved" message

### 7. Preview Your Lesson
- Click **"Preview"** button in toolbar
- See exactly what learners will see
- Click again to return to edit mode

## ⌨️ Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Save | `Cmd/Ctrl + S` |
| Undo | `Cmd/Ctrl + Z` |
| Redo | `Cmd/Ctrl + Shift + Z` |
| Copy Block | `Cmd/Ctrl + C` |
| Paste Block | `Cmd/Ctrl + V` |
| Duplicate | `Cmd/Ctrl + D` |
| Delete | `Delete` or `Backspace` |
| Deselect | `Escape` |

## 📦 Available Block Types

### Basic Content
- **Text Block** - Rich formatted text
- **Heading Block** - H1-H6 titles
- **List Block** - Bullet or numbered lists

### Media
- **Image Block** - Photos with captions
- **Video Block** - YouTube, Vimeo, or uploads
- **PDF Block** - Document viewer

### Interactive
- **Quiz Block** - Assessments and tests
- **Presentation Block** - Slide shows
- **Embed Block** - External content

### Layout
- **Divider** - Visual separators
- **Spacer** - Custom spacing
- **Table** - Data tables

### Advanced
- **Code Block** - Syntax highlighted code
- **Link Button** - Call-to-action buttons

## 🔧 Troubleshooting

### Issue: "Failed to load course"
**Solution**:
- Verify course ID is correct
- Check you're the course creator
- Ensure Supabase connection is working

### Issue: Timeline shows no modules
**Solution**:
- Course might not have modules yet
- Create modules in course management
- Refresh the editor page

### Issue: Can't click lesson in timeline
**Solution**:
- Make sure module is expanded (click to expand)
- Check browser console for errors
- Verify lessons exist in module

### Issue: Blocks don't save
**Solution**:
1. Check migration was run: `SELECT content_blocks FROM lessons LIMIT 1;`
2. If column doesn't exist, run migration again
3. Check browser console for save errors
4. Verify internet connection

### Issue: Drag and drop not working
**Solution**:
- Check browser supports Drag & Drop API
- Try Chrome/Firefox/Safari (latest versions)
- Disable browser extensions that might interfere
- Check console for JavaScript errors

### Issue: Auto-save not working
**Solution**:
- Auto-save requires a lesson to be selected
- Check "Unsaved changes" indicator appears
- Wait 30 seconds to see auto-save trigger
- Try manual save with `Cmd/Ctrl + S`

## 📊 Data Structure

### content_blocks Format

```json
[
  {
    "id": "block_1728471234567_abc123",
    "type": "text",
    "data": {
      "content": "<p>Your text here</p>",
      "fontSize": 16,
      "fontFamily": "Inter",
      "color": "#000000",
      "alignment": "left"
    },
    "position": { "x": 0, "y": 0 },
    "size": { "width": 800, "height": 400 },
    "createdAt": "2025-10-08T10:00:00.000Z",
    "updatedAt": "2025-10-08T10:00:00.000Z"
  },
  {
    "id": "block_1728471245678_def456",
    "type": "image",
    "data": {
      "src": "https://...",
      "alt": "Description",
      "width": "100%",
      "height": "auto",
      "caption": "Image caption"
    },
    "position": { "x": 0, "y": 0 },
    "size": { "width": 800, "height": 400 },
    "createdAt": "2025-10-08T10:05:00.000Z",
    "updatedAt": "2025-10-08T10:05:00.000Z"
  }
]
```

## 🔐 Permissions

### Who Can Access the Editor?
- Course creators (user_id matches course.created_by)
- Future: Admins, Instructors with permissions

### Row Level Security
The editor uses your existing Supabase RLS policies. Ensure:
```sql
-- Users can update their own courses' lessons
CREATE POLICY "Users can update their course lessons"
ON lessons FOR UPDATE
USING (
  auth.uid() IN (
    SELECT created_by FROM courses WHERE id = lessons.course_id
  )
);
```

## 📈 Performance

### Expected Metrics
- **Initial Load**: < 2 seconds
- **Lesson Switch**: < 500ms
- **Block Addition**: Instant
- **Save Operation**: < 1 second
- **Auto-save Frequency**: Every 30 seconds

### Optimization Tips
1. Keep blocks count under 50 per lesson
2. Optimize images before upload (< 2MB)
3. Use YouTube/Vimeo for videos (not direct uploads)
4. Clear browser cache if sluggish

## 🆕 Migration for Existing Lessons

If you have existing lessons with content in other formats:

### Option 1: Start Fresh
- Existing lesson content remains unchanged
- New content_blocks field starts empty
- Old content still accessible in database

### Option 2: Migrate Old Content (Manual)
```sql
-- Example: Convert description to text block
UPDATE lessons
SET content_blocks = jsonb_build_array(
  jsonb_build_object(
    'id', concat('block_', extract(epoch from now())::text, '_migrated'),
    'type', 'text',
    'data', jsonb_build_object(
      'content', concat('<p>', description, '</p>'),
      'fontSize', 16,
      'fontFamily', 'Inter',
      'color', '#000000',
      'alignment', 'left'
    ),
    'position', jsonb_build_object('x', 0, 'y', 0),
    'size', jsonb_build_object('width', 800, 'height', 400),
    'createdAt', now(),
    'updatedAt', now()
  )
)
WHERE content_blocks = '[]'::jsonb
AND description IS NOT NULL
AND description != '';
```

## 🐛 Known Limitations

1. **Mobile Support**: Editor is desktop-only (responsive view coming soon)
2. **Block Reordering**: Drag to reorder not yet implemented (use delete & re-add)
3. **Rich Text Editor**: Basic HTML only (WYSIWYG editor planned)
4. **Media Editor**: No built-in image/video editing (upload pre-edited files)
5. **Collaboration**: Single-user editing only (real-time collab planned)
6. **Version History**: Only session undo/redo (full versioning planned)

## 📝 Next Steps

1. ✅ Run database migration
2. ✅ Test editor with a course
3. ✅ Create a sample lesson
4. 📧 Provide feedback on usability
5. 🎨 Request additional block types
6. 🐛 Report any bugs found

## 📞 Support

If you encounter issues:
1. Check this guide's troubleshooting section
2. Review browser console errors
3. Verify database migration was successful
4. Check [COURSE_EDITOR.md](COURSE_EDITOR.md) for detailed docs

---

**Version**: 1.1.0 (Functional)
**Date**: 2025-10-08
**Status**: 🟢 Production Ready (after migration)
**Migration File**: [migrations/add_content_blocks_to_lessons.sql](migrations/add_content_blocks_to_lessons.sql)
