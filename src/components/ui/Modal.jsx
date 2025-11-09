// src/components/ui/Modal.jsx
import React, { useEffect } from 'react';
import { X } from 'lucide-react';

const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  size = "default",
  showCloseButton = true 
}) => {
  // Close modal on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: "max-w-md",
    default: "max-w-2xl",
    lg: "max-w-8xl",
    xl: "max-w-6xl",
    full: "max-w-full mx-4"
  };

  const overlayStyles = {
    background: 'linear-gradient(160deg, rgba(8, 20, 47, 0.92) 0%, rgba(4, 11, 30, 0.96) 100%)'
  };

  const containerStyles = {
    boxShadow: '0 32px 64px rgba(4, 11, 30, 0.35)'
  };

  const headerStyles = {
    background: 'linear-gradient(120deg, #0A1D3C 0%, #0F2C5C 100%)',
    borderBottom: '1px solid rgba(255, 143, 63, 0.35)'
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 transition-opacity"
        style={overlayStyles}
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className={`relative w-full ${sizeClasses[size]} bg-background-white rounded-xl`}
          style={containerStyles}
        >
          {/* Header */}
          {title && (
            <div
              className="flex items-center justify-between p-6 text-white"
              style={headerStyles}
            >
              <h2 className="text-xl font-semibold tracking-wide">{title}</h2>
              {showCloseButton && (
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg text-white/80 hover:text-white hover:bg-[rgba(255,143,63,0.18)] focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-[#FF8F3F] focus:ring-offset-transparent transition-colors"
                  aria-label="Close modal"
                >
                  <X size={20} />
                </button>
              )}
            </div>
          )}
          
          {/* Content */}
          <div className="p-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
