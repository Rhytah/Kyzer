// src/components/common/ConfirmDialog.jsx
import { Fragment } from "react";
import { AlertTriangle, X } from "lucide-react";

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  confirmVariant = "primary", // "primary" | "danger" | "warning"
  icon = null,
}) {
  if (!isOpen) return null;

  const variantClasses = {
    primary: "bg-primary hover:bg-primary-dark text-white",
    danger: "bg-red-600 hover:bg-red-700 text-white",
    warning: "bg-yellow-600 hover:bg-yellow-700 text-white",
  };

  const iconColors = {
    primary: "text-primary",
    danger: "text-red-600",
    warning: "text-yellow-600",
  };

  const DefaultIcon = icon || AlertTriangle;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-80 transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
        <div className="relative transform overflow-hidden rounded-lg bg-background-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-text-light hover:text-text-dark"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="sm:flex sm:items-start">
            {/* Icon */}
            <div className={`mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-opacity-10 sm:mx-0 sm:h-10 sm:w-10 ${
              confirmVariant === 'danger' ? 'bg-red-100' : 
              confirmVariant === 'warning' ? 'bg-yellow-100' : 'bg-primary/10'
            }`}>
              <DefaultIcon className={`h-6 w-6 ${iconColors[confirmVariant]}`} aria-hidden="true" />
            </div>

            {/* Content */}
            <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left flex-1">
              <h3 className="text-lg font-medium leading-6 text-text-dark" id="modal-title">
                {title}
              </h3>
              <div className="mt-2">
                <p className="text-sm text-text-light">
                  {description}
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse sm:gap-3">
            <button
              type="button"
              onClick={onConfirm}
              className={`inline-flex w-full justify-center rounded-lg px-4 py-2 text-sm font-medium transition-colors sm:w-auto ${variantClasses[confirmVariant]}`}
            >
              {confirmText}
            </button>
            <button
              type="button"
              className="mt-3 inline-flex w-full justify-center rounded-lg border border-background-dark bg-background-white px-4 py-2 text-sm font-medium text-text-dark hover:bg-background-light transition-colors sm:mt-0 sm:w-auto"
              onClick={onClose}
            >
              {cancelText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
