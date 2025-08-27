import { useState, useRef, useEffect } from 'react';
import { useTheme } from '@/hooks/useTheme';
import { Moon, Sun, Building2, Leaf, Monitor, ChevronDown } from 'lucide-react';

const themes = [
  { id: 'light', name: 'Light', icon: Sun, description: 'Clean and bright' },
  { id: 'dark', name: 'Dark', icon: Moon, description: 'Easy on the eyes' },
  { id: 'corporate', name: 'Corporate', icon: Building2, description: 'Professional blue' },
  { id: 'nature', name: 'Nature', icon: Leaf, description: 'Green and fresh' }
];

export default function ThemeSwitcher({ className = '' }) {
  const { theme, setCustomTheme, resetToSystem } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentTheme = themes.find(t => t.id === theme) || themes[0];
  const CurrentIcon = currentTheme.icon;

  const handleThemeChange = (themeId) => {
    console.log('🎨 ThemeSwitcher: Changing theme to:', themeId);
    setCustomTheme(themeId);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-text-dark bg-background-white border border-border rounded-lg hover:bg-background-light focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors"
        aria-label="Switch theme"
      >
        <CurrentIcon className="w-4 h-4" />
        <span className="hidden sm:inline">{currentTheme.name}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-background-white border border-border rounded-lg shadow-lg z-50">
          <div className="p-2">
            {themes.map((themeOption) => {
              const Icon = themeOption.icon;
              const isActive = themeOption.id === theme;
              
              return (
                <button
                  key={themeOption.id}
                  onClick={() => handleThemeChange(themeOption.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-left rounded-md transition-colors ${
                    isActive 
                      ? 'bg-primary-light text-primary-dark' 
                      : 'text-text-dark hover:bg-background-light'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <div className="flex-1">
                    <div className="font-medium">{themeOption.name}</div>
                    <div className="text-xs text-text-light">{themeOption.description}</div>
                  </div>
                  {isActive && (
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                  )}
                </button>
              );
            })}
            
            <div className="border-t border-border mt-2 pt-2">
              <button
                onClick={() => {
                  resetToSystem();
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-3 px-3 py-2 text-left text-text-dark hover:bg-background-light rounded-md transition-colors"
              >
                <Monitor className="w-4 h-4" />
                <div className="flex-1">
                  <div className="font-medium">System</div>
                  <div className="text-xs text-text-light">Follow system preference</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
