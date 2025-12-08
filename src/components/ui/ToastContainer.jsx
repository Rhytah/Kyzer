// src/components/ui/ToastContainer.jsx
import toast from 'react-hot-toast';
import Toast from './Toast';

// Use react-hot-toast for global toast notifications
export const useToast = () => {
  const success = (message, duration) => {
    return toast.success(message, { duration: duration || 3000 });
  };

  const error = (message, duration) => {
    return toast.error(message, { duration: duration || 5000 });
  };

  const warning = (message, duration) => {
    return toast(message, { 
      duration: duration || 4000,
      icon: '⚠️',
      style: {
        background: '#fef3c7',
        color: '#92400e',
        border: '1px solid #fde68a'
      }
    });
  };

  const info = (message, duration) => {
    return toast(message, { 
      duration: duration || 4000,
      icon: 'ℹ️',
      style: {
        background: '#dbeafe',
        color: '#1e40af',
        border: '1px solid #93c5fd'
      }
    });
  };

  return {
    success,
    error,
    warning,
    info,
    // Compatibility aliases
    showSuccess: success,
    showError: error,
    showWarning: warning,
    showInfo: info,
    // For backward compatibility with Layout component
    toasts: [],
    removeToast: () => {}
  };
};

export default function ToastContainer({ toasts, onRemove }) {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          id={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={onRemove}
        />
      ))}
    </div>
  );
} 