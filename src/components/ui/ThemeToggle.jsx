import { useTheme } from '@/hooks/useTheme';
import { Moon, Sun } from 'lucide-react';

export default function ThemeToggle({ className = '' }) {
  const { theme, toggleTheme, isDark } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`p-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
        isDark 
          ? 'bg-background-medium text-text-light hover:bg-background-dark' 
          : 'bg-background-light text-text-dark hover:bg-background-medium'
      } ${className}`}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} theme`}
    >
      {isDark ? (
        <Sun className="w-5 h-5" />
      ) : (
        <Moon className="w-5 h-5" />
      )}
    </button>
  );
}
