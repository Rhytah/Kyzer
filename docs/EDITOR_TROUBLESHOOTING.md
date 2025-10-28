# Course Editor - Troubleshooting Guide

## ✅ Issue Fixed: 404 Error

### Problem
The editor route `/app/courses/:courseId/editor` was returning 404.

### Root Cause
The editor route was nested inside the `<DashboardLayout />` component routes, which caused routing conflicts and prevented the full-screen editor from rendering properly.

### Solution Applied
Moved the editor route OUTSIDE of the DashboardLayout wrapper:

```javascript
// BEFORE (Incorrect - Inside DashboardLayout)
<Route path="/app" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
  <Route path="courses/:courseId/editor" element={<CourseEditor />} />
  {/* Other routes */}
</Route>

// AFTER (Correct - Standalone with ProtectedRoute)
<Route
  path="/app/courses/:courseId/editor"
  element={
    <ProtectedRoute>
      <CourseEditor />
    </ProtectedRoute>
  }
/>

<Route path="/app" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
  {/* Other routes */}
</Route>
```

### Why This Matters
1. **Full-Screen Design**: The editor uses `h-screen` and expects to fill the entire viewport
2. **No Dashboard Chrome**: Editor has its own toolbar, sidebar, and timeline - doesn't need dashboard nav
3. **Route Precedence**: Specific routes must be defined before catch-all patterns
4. **Layout Conflicts**: DashboardLayout adds padding, headers, and navigation that interfere with editor

## 🧪 Testing the Fix

### 1. Verify Route Works
```bash
# Navigate to any course editor URL
http://localhost:4001/app/courses/YOUR_COURSE_ID/editor
```

### 2. Expected Behavior
- ✅ No 404 error
- ✅ Full-screen editor loads
- ✅ No dashboard navigation visible
- ✅ Editor toolbar at top
- ✅ Sidebar on left
- ✅ Canvas in center
- ✅ Properties on right
- ✅ Timeline at bottom

### 3. Check Browser Console
Open DevTools (F12) and look for:
- ❌ No import errors
- ❌ No component rendering errors
- ❌ No store initialization errors

## 🐛 Common Issues & Solutions

### Issue 1: Editor Appears But Shows Loading Forever
**Symptom**: Editor loads but stuck on "Loading course editor..."

**Possible Causes**:
1. Course ID doesn't exist in database
2. Supabase connection issue
3. Store initialization problem

**Solution**:
```javascript
// Check browser console for errors
// Verify course exists:
// SELECT * FROM courses WHERE id = 'your-course-id';

// Test with a known valid course ID
```

### Issue 2: Blank Screen / White Screen
**Symptom**: Route works but nothing renders

**Possible Causes**:
1. JavaScript error in component
2. Missing import
3. Store context issue

**Debug Steps**:
```javascript
// 1. Check browser console for errors
// 2. Add console.log in CourseEditor.jsx
console.log('CourseEditor mounted', { courseId });

// 3. Verify store is accessible
import { useEditorStore } from '@/store/editorStore';
const store = useEditorStore();
console.log('Editor store:', store);
```

### Issue 3: "useAuth is undefined" Error
**Symptom**: Error about useAuth or authentication context

**Cause**: CourseEditor must be inside AuthProvider context

**Verify**:
```javascript
// In App.jsx, ensure structure is:
<AuthProvider>
  <Router>
    <Routes>
      <Route path="/app/courses/:courseId/editor" element={...} />
    </Routes>
  </Router>
</AuthProvider>
```

### Issue 4: Sidebar Blocks Not Dragging
**Symptom**: Can't drag blocks from sidebar to canvas

**Solutions**:
1. Check browser support for Drag and Drop API
2. Verify `useDragAndDrop` hook is working
3. Check console for event handler errors

```javascript
// Test drag support
const div = document.createElement('div');
console.log('Draggable:', 'draggable' in div);
```

### Issue 5: Auto-Save Not Working
**Symptom**: Changes made but not saving

**Possible Causes**:
1. No lesson selected in timeline
2. Supabase permissions issue
3. Auto-save disabled

**Debug**:
```javascript
// In browser console
localStorage.getItem('editorAutoSave') // Should not be 'false'

// Check if lesson is selected
// Look for "No lesson selected" in toolbar
```

### Issue 6: Media Library Won't Open
**Symptom**: Click media button, nothing happens

**Cause**: Modal state not toggling

**Solution**:
```javascript
// Check in browser console
const { ui } = useEditorStore.getState();
console.log('Media library open:', ui.mediaLibraryOpen);

// Manually toggle
useEditorStore.getState().actions.toggleMediaLibrary();
```

## 🔍 Debugging Checklist

### Route-Level Issues
- [ ] Route is defined in App.jsx
- [ ] Route is BEFORE `/app` catch-all
- [ ] Route uses `<ProtectedRoute>`
- [ ] CourseEditor component imported correctly
- [ ] No typos in route path

### Component-Level Issues
- [ ] All imports resolve (no 404s in Network tab)
- [ ] Component renders (React DevTools shows it)
- [ ] Props passed correctly
- [ ] No JavaScript errors in console

### Store-Level Issues
- [ ] editorStore.js exists and exports
- [ ] Zustand installed (`npm list zustand`)
- [ ] Store initializes without errors
- [ ] Actions are accessible

### Data-Level Issues
- [ ] Course ID is valid UUID
- [ ] Course exists in database
- [ ] User has permission to edit
- [ ] Supabase connection works

## 🛠️ Quick Fixes

### Clear Application State
```javascript
// In browser console
localStorage.clear();
sessionStorage.clear();
location.reload();
```

### Test Minimal Editor
Create a simple test route to isolate issues:

```javascript
// In App.jsx, add temporary test route
<Route
  path="/editor-test"
  element={
    <div className="p-8">
      <h1>Editor Test</h1>
      <button onClick={() => navigate('/app/courses/test-id/editor')}>
        Go to Editor
      </button>
    </div>
  }
/>
```

### Verify All Dependencies
```bash
# Check if all packages are installed
npm list zustand react-router-dom lucide-react react-hot-toast

# Reinstall if needed
npm install
```

## 📋 Pre-Deployment Checklist

Before deploying to production:

- [ ] Test editor route with valid course ID
- [ ] Test editor route with invalid course ID (should show error)
- [ ] Test editor without authentication (should redirect to login)
- [ ] Test editor as non-course-creator (should show permission error)
- [ ] Test all editor panels (sidebar, properties, timeline)
- [ ] Test drag-and-drop functionality
- [ ] Test auto-save functionality
- [ ] Test manual save button
- [ ] Test undo/redo
- [ ] Test preview mode toggle
- [ ] Verify no console errors
- [ ] Test on mobile (should show "desktop only" message)

## 🎯 Performance Monitoring

### Monitor These Metrics
1. **Initial Load Time**: Editor should load in < 2 seconds
2. **Auto-Save Frequency**: Every 30 seconds (check Network tab)
3. **Block Render Time**: Blocks should render instantly
4. **Memory Usage**: Should stay under 100MB
5. **Store Size**: History should cap at 50 states

### Check in DevTools
```javascript
// Performance
performance.mark('editor-start');
// ... editor loads
performance.mark('editor-ready');
performance.measure('editor-load', 'editor-start', 'editor-ready');

// Memory (Chrome DevTools > Memory)
// Take heap snapshot and check for leaks
```

## 📞 Getting Help

If issues persist:

1. **Check Documentation**
   - COURSE_EDITOR.md - Full feature guide
   - EDITOR_IMPLEMENTATION_SUMMARY.md - Technical details

2. **Review Code**
   - All editor files in `src/components/editor/`
   - Store in `src/store/editorStore.js`
   - Hooks in `src/hooks/editor/`

3. **Check Browser Console**
   - Look for red errors
   - Check Network tab for failed requests
   - Inspect React DevTools component tree

4. **Test Incrementally**
   - Disable features one by one
   - Isolate the problematic component
   - Test with minimal data

---

## ✅ Current Status

- **Route Configuration**: ✅ Fixed (moved outside DashboardLayout)
- **Build Status**: ✅ Builds successfully
- **Import Validation**: ✅ All imports resolve
- **Component Structure**: ✅ Properly organized

The editor should now load correctly at:
```
http://localhost:4001/app/courses/{course-id}/editor
```

**Last Updated**: 2025-10-08
**Status**: 🟢 Operational
