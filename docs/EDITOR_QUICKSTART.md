# Course Editor - Quick Start Guide

## 🚀 Getting Started in 5 Minutes

### Step 1: Access the Editor
Navigate to any course and add `/editor` to the URL:
```
/app/courses/YOUR_COURSE_ID/editor
```

Or programmatically:
```javascript
navigate(`/app/courses/${courseId}/editor`);
```

### Step 2: Select a Lesson
1. Look at the **timeline** at the bottom
2. Click on a **module** to expand it
3. Click on a **lesson** to load its content

### Step 3: Add Content Blocks
1. Look at the **left sidebar**
2. Choose a block type (Text, Image, Video, etc.)
3. **Drag** the block onto the canvas
4. Block appears with default settings

### Step 4: Customize Block
1. **Click** on the block to select it
2. **Right panel** opens with properties
3. Edit settings (text, colors, sizes, etc.)
4. Changes apply **instantly**

### Step 5: Save Your Work
- **Auto-save**: Happens every 30 seconds automatically
- **Manual save**: Click "Save" button or press `Cmd/Ctrl + S`
- Look for "All changes saved" indicator

## 🎯 Essential Features

### Layout Overview
```
┌─────────────────────────────────────────────────────┐
│  Toolbar (Save, Undo, Redo, Zoom, Preview)         │
├──────┬─────────────────────────────────┬────────────┤
│      │                                 │            │
│ Side │         Canvas                  │ Properties │
│ bar  │      (Your Content)             │   Panel    │
│      │                                 │            │
│      │                                 │            │
├──────┴─────────────────────────────────┴────────────┤
│           Timeline (Modules & Lessons)              │
└─────────────────────────────────────────────────────┘
```

### Available Blocks

#### 📝 Basic Content
- **Text**: Formatted paragraphs
- **Heading**: H1-H6 titles
- **List**: Bullet or numbered lists

#### 🎨 Media
- **Image**: Upload photos
- **Video**: YouTube, Vimeo, or uploads
- **PDF**: Document viewer

#### 🎮 Interactive
- **Quiz**: Assessments
- **Presentation**: Slide shows
- **Embed**: External content

#### 📐 Layout
- **Divider**: Horizontal lines
- **Spacer**: Empty space
- **Table**: Data tables

## ⌨️ Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| **Save** | `Cmd/Ctrl + S` |
| **Undo** | `Cmd/Ctrl + Z` |
| **Redo** | `Cmd/Ctrl + Shift + Z` |
| **Copy Block** | `Cmd/Ctrl + C` |
| **Paste Block** | `Cmd/Ctrl + V` |
| **Duplicate** | `Cmd/Ctrl + D` |
| **Delete Block** | `Delete` or `Backspace` |
| **Deselect** | `Escape` |

## 📋 Common Tasks

### Add a Text Block
1. Drag **Text Block** from sidebar
2. Click to select it
3. In **Properties Panel** (right):
   - Edit content
   - Change font size
   - Choose alignment
4. Block updates instantly

### Add an Image
1. Drag **Image Block** from sidebar
2. Click to select it
3. In **Properties Panel**:
   - Click "Image URL" field
   - Paste image URL or upload
   - Add alt text and caption
4. Image displays immediately

### Add a Video
1. Drag **Video Block** from sidebar
2. Click to select it
3. In **Properties Panel**:
   - Paste YouTube or Vimeo URL
   - Or upload a video file
   - Toggle controls, autoplay, etc.
4. Video embeds automatically

### Add a Quiz
1. Drag **Quiz Block** from sidebar
2. Click to select it
3. In **Properties Panel**:
   - Select an existing quiz
   - Set pass threshold
   - Configure display options
4. Quiz integrates seamlessly

### Reorder Blocks
1. **Hover** over a block
2. Click the **grip icon** (left side)
3. **Drag** block up or down
4. Drop at desired position

### Copy a Block
1. **Select** the block
2. Press `Cmd/Ctrl + C` (or click copy icon)
3. Press `Cmd/Ctrl + V` to paste
4. New block appears below

### Delete a Block
1. **Select** the block
2. Press `Delete` or `Backspace`
3. Or click **trash icon** (left side)
4. Confirm deletion

## 🎨 Customization Tips

### Text Styling
- Use **headings** for structure
- Choose **readable fonts** (Inter, Arial)
- Set **font size** 14-18px for body text
- Use **alignment** for visual balance

### Images
- Add **alt text** for accessibility
- Use **captions** for context
- Set **width to 100%** for responsive design
- Choose **object-fit** for cropping style

### Videos
- Enable **controls** for user control
- Disable **autoplay** unless necessary
- Set **height to 400-600px**
- Use **YouTube/Vimeo** for better performance

### Colors
- Use the **color picker** in properties
- Maintain **contrast** for readability
- Match your **brand colors**
- Test in **preview mode**

## 🔍 Preview Mode

### How to Preview
1. Click **"Preview"** button in toolbar
2. Canvas switches to learner view
3. All blocks render as students see them
4. Interactive elements work

### What Preview Shows
- ✅ Exact spacing and sizing
- ✅ Functional videos
- ✅ Working links and buttons
- ✅ Quiz interfaces
- ✅ Real colors and fonts

### Back to Edit Mode
- Click **"Preview"** again to toggle back

## 💾 Saving Your Work

### Auto-Save
- Runs every **30 seconds**
- Only when **changes detected**
- See **"Unsaved changes"** indicator
- Watch for **"All changes saved"**

### Manual Save
- Click **"Save" button** (top right)
- Or press **`Cmd/Ctrl + S`**
- Confirmation toast appears
- Indicator updates

### Before Closing
- Browser warns if **unsaved changes**
- Click **"Save"** before closing
- Or let **auto-save** finish

## 🔧 Troubleshooting

### Block Won't Drag
- **Refresh** the page
- Check browser console for errors
- Try a different block type

### Properties Not Updating
- **Click the block** to select it
- Ensure **right panel is open**
- Check for error messages

### Auto-Save Not Working
- Check **internet connection**
- Look for **error toasts**
- Try **manual save**

### Image Not Loading
- Verify **URL is correct**
- Check **file permissions**
- Try a different image

### Video Won't Play
- Ensure **URL format** is correct
- Check **video privacy settings**
- Enable **controls** option

## 🎓 Best Practices

### Content Structure
1. Start with a **heading**
2. Add **text** for context
3. Include **media** for engagement
4. End with **quiz** for assessment

### Visual Hierarchy
- Use **H2 for main sections**
- Use **H3 for subsections**
- Add **dividers** between topics
- Use **spacers** for breathing room

### Engagement
- Mix **text and media**
- Add **interactive elements**
- Break up long content
- Use **lists** for clarity

### Accessibility
- Add **alt text** to all images
- Use **proper heading levels**
- Ensure **color contrast**
- Test with **screen readers**

### Performance
- **Optimize images** before upload
- Use **YouTube/Vimeo** for videos
- Limit **blocks per lesson** (50 max recommended)
- Test on **slow connections**

## 📱 Next Steps

After creating content:
1. **Preview** your lesson
2. **Save** your work
3. **Test** as a student
4. **Publish** your course
5. **Share** with learners

## 📚 Learn More

- **Full Documentation**: `COURSE_EDITOR.md`
- **Implementation Details**: `EDITOR_IMPLEMENTATION_SUMMARY.md`
- **Video Tutorials**: Coming soon
- **Community Forum**: Ask questions

## 💡 Pro Tips

1. **Use keyboard shortcuts** for speed
2. **Preview frequently** to check layout
3. **Copy blocks** to save time
4. **Organize with modules** for structure
5. **Save before previewing** to be safe
6. **Test on different screens** for responsive design
7. **Use templates** when available (coming soon)

---

**Need Help?** Check the full documentation in `COURSE_EDITOR.md`

**Found a Bug?** Report it to the development team

**Have Feedback?** We'd love to hear from you!

Happy course creating! 🎉
