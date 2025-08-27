# Kyzer LMS Theming System

This document describes the comprehensive theming system implemented in Kyzer LMS, which allows users to switch between different visual themes and automatically adapts to system preferences.

## Features

- **Multiple Themes**: Light, Dark, Corporate, and Nature themes
- **System Integration**: Automatic detection and following of system theme preferences
- **Persistent Storage**: Theme selection is saved in localStorage
- **Smooth Transitions**: CSS transitions for seamless theme switching
- **CSS Custom Properties**: Dynamic theming using CSS variables
- **Tailwind Integration**: Full compatibility with Tailwind CSS classes

## Theme Variants

### 1. Light Theme (Default)
- Clean, bright design
- High contrast for readability
- Professional appearance
- Colors: Gray-based palette

### 2. Dark Theme
- Easy on the eyes
- Modern, sleek appearance
- Blue accent colors
- Colors: Dark backgrounds with light text

### 3. Corporate Theme
- Professional blue color scheme
- Business-focused design
- High contrast for corporate environments
- Colors: Blue-based palette

### 4. Nature Theme
- Green and fresh design
- Eco-friendly appearance
- Calming color scheme
- Colors: Green-based palette

## Implementation Details

### File Structure
```
src/
├── contexts/
│   └── ThemeContext.jsx          # Theme context and provider
├── components/ui/
│   ├── ThemeSwitcher.jsx         # Full theme selector dropdown
│   └── ThemeToggle.jsx           # Simple light/dark toggle
├── hooks/
│   └── useTheme.js               # Theme hook re-export
└── pages/public/
    └── ThemeDemo.jsx             # Theme showcase page
```

### Core Components

#### ThemeContext.jsx
- Manages theme state
- Handles system theme detection
- Provides theme switching functions
- Manages localStorage persistence

#### ThemeSwitcher.jsx
- Dropdown menu for theme selection
- Shows all available themes with descriptions
- Includes system preference option
- Responsive design

#### ThemeToggle.jsx
- Simple button for quick light/dark switching
- Icon changes based on current theme
- Minimal footprint for header integration

### CSS Implementation

#### Tailwind Configuration
- CSS custom properties for each theme
- Dynamic color generation
- Theme-specific class definitions

#### CSS Variables
```css
:root {
  --color-primary: #374151;
  --color-text-dark: #111827;
  --color-background-light: #F9FAFB;
  /* ... more variables */
}

.theme-dark {
  --color-primary: #60A5FA;
  --color-text-dark: #F9FAFB;
  --color-background-light: #111827;
  /* ... dark theme variables */
}
```

#### Theme Transitions
- Smooth transitions between themes
- CSS transitions on all color properties
- 0.2s ease transitions for smooth UX

## Usage

### Basic Theme Hook
```jsx
import { useTheme } from '@/hooks/useTheme';

function MyComponent() {
  const { theme, toggleTheme, setCustomTheme, isDark } = useTheme();
  
  return (
    <div>
      <p>Current theme: {theme}</p>
      <button onClick={toggleTheme}>
        Switch to {isDark ? 'light' : 'dark'}
      </button>
    </div>
  );
}
```

### Theme Components
```jsx
import ThemeSwitcher from '@/components/ui/ThemeSwitcher';
import ThemeToggle from '@/components/ui/ThemeToggle';

function Header() {
  return (
    <header>
      <ThemeSwitcher />  {/* Full theme selector */}
      <ThemeToggle />    {/* Quick toggle */}
    </header>
  );
}
```

### Theme-Aware Styling
```jsx
// Use theme-aware classes
<div className="bg-background-white text-text-dark border border-border">
  Content with theme-aware colors
</div>

// Or use CSS custom properties directly
<div style={{ backgroundColor: 'var(--color-background-white)' }}>
  Content with CSS variables
</div>
```

## Available CSS Classes

### Background Colors
- `bg-background-white` - Main content background
- `bg-background-light` - Page background
- `bg-background-medium` - Secondary background
- `bg-background-dark` - Dark background

### Text Colors
- `text-text-dark` - Primary text
- `text-text-medium` - Secondary text
- `text-text-light` - Muted text
- `text-text-muted` - Very muted text

### Theme Colors
- `bg-primary` - Primary brand color
- `bg-success` - Success states
- `bg-warning` - Warning states
- `bg-error` - Error states

### Utility Classes
- `text-theme-primary` - Theme-aware primary text
- `bg-theme-primary` - Theme-aware primary background
- `border-theme-primary` - Theme-aware primary border

## Adding New Themes

### 1. Update Tailwind Config
Add new theme colors to `tailwind.config.js`:

```js
'.theme-new-theme': {
  '--color-primary': '#your-color',
  '--color-text-dark': '#your-text-color',
  // ... more variables
}
```

### 2. Update ThemeContext
Add the new theme to the available themes list:

```jsx
// Remove all theme classes
root.classList.remove('theme-light', 'theme-dark', 'theme-corporate', 'theme-nature', 'theme-new-theme');

// Add current theme class
root.classList.add(`theme-${theme}`);
```

### 3. Update ThemeSwitcher
Add the new theme to the themes array:

```jsx
const themes = [
  // ... existing themes
  { id: 'new-theme', name: 'New Theme', icon: NewIcon, description: 'Description' }
];
```

## Browser Support

- **Modern Browsers**: Full support for CSS custom properties
- **CSS Transitions**: Smooth theme switching
- **localStorage**: Theme persistence
- **Media Queries**: System theme detection

## Performance Considerations

- CSS custom properties are performant
- Theme switching is instant
- No JavaScript re-rendering required
- Minimal bundle size impact

## Accessibility

- High contrast ratios maintained across themes
- Keyboard navigation support
- Screen reader friendly
- Focus indicators preserved

## Future Enhancements

- **Custom Theme Builder**: Allow users to create custom themes
- **Theme Presets**: Industry-specific theme collections
- **Animation Themes**: Different transition styles
- **Component-Level Themes**: Individual component theming
- **Export/Import**: Share custom themes

## Troubleshooting

### Theme Not Switching
1. Check if ThemeProvider wraps your app
2. Verify CSS custom properties are loaded
3. Check browser console for errors
4. Ensure Tailwind CSS is properly configured

### Colors Not Updating
1. Verify CSS variable names match
2. Check if theme classes are applied to document root
3. Ensure no conflicting CSS rules
4. Clear browser cache

### Performance Issues
1. Limit theme transitions to color properties only
2. Avoid heavy animations during theme switching
3. Use CSS transforms instead of layout changes
4. Optimize CSS variable usage

## Contributing

When adding new themes or modifying existing ones:

1. Follow the established color naming convention
2. Ensure sufficient contrast ratios
3. Test across different screen sizes
4. Update documentation
5. Add to the theme demo page

## License

This theming system is part of Kyzer LMS and follows the same licensing terms.
