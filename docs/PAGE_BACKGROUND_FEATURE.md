# 🎨 Page Background Color in Properties Panel

## Overview
Added a persistent "Page Settings" section in the Properties panel that lets you change the current page's background color at any time while editing.

## ✨ Features

### **1. Always Visible Page Settings**
- **Location:** Top of Properties panel (right sidebar)
- **Visibility:** Shows whenever a lesson is loaded
- **Content:** Background color picker with color presets

### **2. Color Picker**
- **HTML5 Color Input:** Visual color picker
- **Hex Input Field:** Type exact color codes
- **6 Color Presets:** Quick access to common colors
  - White (#ffffff)
  - Light Gray (#f3f4f6)
  - Light Blue (#dbeafe)
  - Light Yellow (#fef3c7)
  - Light Green (#d1fae5)
  - Light Pink (#fce7f3)

### **3. Smart Context**
- Shows current page number when multiple pages exist
- Displays helpful hints about which page the color applies to
- Explains when you need to add page breaks

## 🎯 How It Works

### **Single Page Lesson:**
- First page always has white background by default
- To add background colors, you need to create multiple pages
- Hint message guides you to add a Page Break

### **Multiple Page Lesson:**
- Background color picker is active
- Changes apply to the current page you're viewing
- Each page can have its own unique background color

### **Technical Details:**
- Page Break blocks define the background color for the page AFTER them
- First page (Page 1) always starts with white (#ffffff)
- To change Page 2's background, adjust the first Page Break
- To change Page 3's background, adjust the second Page Break
- And so on...

## 📋 Usage Instructions

### **To Change a Page Background:**

1. **Navigate to the page** you want to style (use Previous/Next buttons)
2. **Open Properties panel** (right sidebar - should be open by default)
3. **Look for "Page Settings"** section at the top
4. **Choose a color:**
   - Click the color square to use color picker
   - Type a hex code directly
   - Click one of the preset colors
5. **Background updates instantly** on the canvas

### **Color Preset Guide:**

| Color | Best For | Use Case |
|-------|----------|----------|
| White | Standard content | Default, clean look |
| Light Gray | Secondary info | Less emphasis |
| Light Blue | Key concepts | Important information |
| Light Yellow | Warnings/Notes | Attention-getting |
| Light Green | Success/Tips | Positive content |
| Light Pink | Special topics | Highlights |

## 🎨 Design Patterns

### **Professional Course:**
```
Page 1: White (Title/Intro)
Page 2: Light Blue (Concept 1)
Page 3: Light Blue (Concept 2)
Page 4: Light Yellow (Key Takeaway)
Page 5: White (Summary)
```

### **Training Module:**
```
Page 1: White (Overview)
Page 2: Light Gray (Theory)
Page 3: Light Green (Practice)
Page 4: Light Yellow (Common Mistakes)
Page 5: White (Conclusion)
```

### **Assessment:**
```
Page 1: White (Instructions)
Page 2-4: Light Blue (Questions)
Page 5: Light Green (Results)
```

## ⚡ Quick Tips

✅ **Do:**
- Use consistent colors for similar content types
- Keep backgrounds light for readability
- Use color to create visual hierarchy
- Test with actual text to ensure contrast

❌ **Don't:**
- Use too many different colors (max 3-4)
- Use dark backgrounds (text becomes hard to read)
- Change colors randomly without purpose
- Forget to check text visibility on backgrounds

## 🔧 Technical Implementation

### **State Management:**
- Page calculations happen in Properties panel using `useMemo`
- Background colors stored in Page Break block data
- Changes update via `updateBlock` action
- Canvas automatically reflects changes

### **Data Structure:**
```javascript
{
  type: 'page_break',
  data: {
    backgroundColor: '#dbeafe',
    showPageNumber: true
  }
}
```

### **Page Logic:**
- Pages are computed on-the-fly from blocks array
- Page Break blocks act as separators
- Each page "inherits" settings from its Page Break
- First page always starts with white

## 🎓 Advanced Usage

### **Creating a Theme:**
1. Add Page Breaks to create multiple pages
2. Set consistent background colors
3. Add similar content blocks to each page
4. Save as a template (coming soon)

### **Color Accessibility:**
- Ensure text contrast meets WCAG standards
- Test with colorblind simulation
- Provide alternative cues (icons, labels)
- Keep important content on white backgrounds

## 🐛 Troubleshooting

**Q: Background color isn't changing?**
- Make sure you have multiple pages (add Page Break)
- Check you're on the correct page
- Try refreshing the page

**Q: First page background can't be changed?**
- Currently, first page is always white by default
- Change Page 2+ backgrounds using Page Settings
- This is a design decision for consistency

**Q: Color preset not applying?**
- Click directly on the preset button
- Ensure Properties panel is open
- Try typing the hex code manually

## 📊 Benefits

1. **User-Friendly:** No need to find and edit Page Break blocks
2. **Always Accessible:** Settings visible at all times
3. **Visual Feedback:** See changes instantly on canvas
4. **Preset Colors:** Quick access to common choices
5. **Context-Aware:** Shows which page you're editing

---

**Implementation Date:** October 11, 2025  
**Status:** ✅ Complete and Live

