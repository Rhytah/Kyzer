# How to Use the Course Content Editor

## Quick Start Guide

### 1. Access the Editor

You can open the editor from three places:
- **Course Management** (`/app/courses/management`) - Click "Open Editor" button
- **My Courses** (`/app/courses`) - Click "Edit Course" button
- **Course Detail** page - Click "Edit Course Content" button

### 2. Important: Select a Lesson First!

**⚠️ Before you can add content blocks, you MUST select a lesson from the timeline at the bottom.**

The timeline shows your course structure with:
- **Modules** (folders) - Click to expand/collapse
- **Lessons** (files) - Click to select and edit

### 3. Add Content Blocks

Once a lesson is selected:
1. **Find the block you want** in the left sidebar (Text, Heading, Image, Video, Quiz, etc.)
2. **Drag the block** onto the white canvas area in the center
3. **Drop it** - You'll see a success message
4. **The block appears** on the canvas

### 4. Edit Block Content

After adding a block:
1. **Click on the block** to select it (it will show a blue border)
2. **The Properties Panel opens** on the right side
3. **Edit the content** in the properties panel:
   - For text blocks: Type in the textarea
   - For headings: Change text, level, color, alignment
   - For images: Set source URL, alt text, dimensions
   - For videos: Set video URL
4. **Changes save automatically** every 30 seconds

### 5. Block Actions

When a block is selected, you can:
- **Edit**: Change properties in the right panel
- **Duplicate**: Click the copy icon (or Cmd/Ctrl + D)
- **Delete**: Click the trash icon (or press Delete/Backspace)
- **Move**: Drag the grip icon to reorder blocks

### 6. Keyboard Shortcuts

- **Cmd/Ctrl + S** - Manual save
- **Cmd/Ctrl + Z** - Undo
- **Cmd/Ctrl + Shift + Z** - Redo
- **Cmd/Ctrl + C** - Copy selected block
- **Cmd/Ctrl + V** - Paste copied block
- **Cmd/Ctrl + D** - Duplicate selected block
- **Delete/Backspace** - Delete selected block
- **Escape** - Deselect block

### 7. Available Content Blocks

**Basic:**
- **Text** - Rich text content with formatting
- **Heading** - Section headings (H1-H6)
- **List** - Bulleted or numbered lists

**Media:**
- **Image** - Display images
- **Video** - Embed videos
- **PDF** - PDF documents

**Interactive:**
- **Quiz** - Add assessments
- **Embed** - Embed external content

**Layout:**
- **Divider** - Horizontal line separator
- **Spacer** - Add vertical space
- **Table** - Data tables

**Advanced:**
- **Code** - Code snippets with syntax highlighting
- **Presentation** - Slide presentations
- **SCORM** - SCORM packages

## Troubleshooting

### "Please select a lesson from the timeline below first"

**Problem**: You're trying to add blocks but no lesson is selected.

**Solution**:
1. Look at the timeline at the bottom of the screen
2. Click on a module to expand it
3. Click on a lesson to select it
4. Now you can drag and drop blocks

### Drag and Drop Not Working

**Problem**: You can drag blocks but they don't appear when dropped.

**Solutions**:
1. **Check if a lesson is selected** (see above)
2. **Check browser console** for errors (F12 → Console tab)
3. **Try refreshing** the page (Cmd/Ctrl + R)
4. **Check the console logs** - You should see:
   - "Drop data received: ..."
   - "Parsed drag data: ..."
   - "Adding block of type: ..."

### Can't Edit Text

**Problem**: Text blocks show content but you can't type in them.

**Solution**:
1. **Click the block** to select it
2. **Look at the Properties Panel** on the right
3. **Edit the content in the textarea** there
4. The block will update in real-time

### Changes Not Saving

**Problem**: Your changes disappear when you refresh.

**Solutions**:
1. **Auto-save is enabled** - Changes save every 30 seconds
2. **Check for "Unsaved changes" indicator** in bottom-right corner
3. **Manually save** with Cmd/Ctrl + S
4. **Check browser console** for save errors

## Tips & Best Practices

1. **Start with structure** - Create modules and lessons before adding content
2. **Select lesson first** - Always select a lesson before dragging blocks
3. **Use keyboard shortcuts** - Speed up your workflow
4. **Save frequently** - Use Cmd/Ctrl + S even though auto-save is on
5. **Preview your work** - Toggle preview mode to see how learners will see it
6. **Use headings** - Structure content with proper heading hierarchy
7. **Add alt text to images** - For accessibility
8. **Test quizzes** - Always test quiz questions before publishing

## Current Limitations

1. **Rich text editing** - Currently uses plain textarea (full WYSIWYG coming soon)
2. **Media upload** - Need to use URLs for now (file upload coming soon)
3. **Drag to reorder** - Block reordering not yet implemented
4. **Undo/Redo** - Implemented but may need testing
5. **Collaboration** - Real-time collaboration not yet enabled

## Need Help?

If you encounter issues:
1. Check this guide first
2. Check the browser console (F12) for errors
3. Take a screenshot of the error
4. Report the issue with steps to reproduce
