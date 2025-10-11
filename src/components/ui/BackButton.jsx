// src/components/ui/BackButton.jsx
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

/**
 * Reusable Back Button Component
 * Uses browser history to navigate back to the previous page
 */
const BackButton = ({ 
  className = '', 
  showIcon = true, 
  showText = true, 
  text = 'Back',
  fallbackPath = null,
  onClick = null
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) {
      onClick();
      return;
    }

    // Check if there's history to go back to
    if (window.history.length > 1) {
      navigate(-1);
    } else if (fallbackPath) {
      navigate(fallbackPath);
    } else {
      // Default fallback to dashboard
      navigate('/app/dashboard');
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors ${className}`}
    >
      {showIcon && <ArrowLeft className="w-4 h-4" />}
      {showText && <span className="text-sm font-medium">{text}</span>}
    </button>
  );
};

export default BackButton;
