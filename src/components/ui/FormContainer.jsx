// src/components/ui/FormContainer.jsx
import React from 'react';
import { clsx } from 'clsx';
import Card from './Card';
import Button from './Button';
import LoadingSpinner from './LoadingSpinner';
import { AlertCircle, CheckCircle, X } from 'lucide-react';

const FormContainer = ({
  title,
  description,
  children,
  onSubmit,
  onCancel,
  submitText = 'Save',
  cancelText = 'Cancel',
  loading = false,
  error = '',
  success = '',
  disabled = false,
  maxWidth = 'max-w-4xl',
  className = '',
  showCancel = true,
  submitVariant = 'primary',
  cancelVariant = 'outline',
  ...props
}) => {
  return (
    <Card className={clsx(`${maxWidth} mx-auto`, className)}>
      <div className="space-y-6">
        {/* Header */}
        {(title || description) && (
          <div className="border-b border-gray-200 pb-4">
            {title && (
              <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
            )}
            {description && (
              <p className="mt-1 text-sm text-gray-600">{description}</p>
            )}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="rounded-md bg-red-50 p-4 border border-red-200">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="rounded-md bg-green-50 p-4 border border-green-200">
            <div className="flex">
              <div className="flex-shrink-0">
                <CheckCircle className="h-5 w-5 text-green-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-800">{success}</p>
              </div>
            </div>
          </div>
        )}

        {/* Form Content */}
        <form onSubmit={onSubmit} className="space-y-6" {...props}>
          {children}
        </form>

        {/* Form Actions */}
        <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
          {showCancel && onCancel && (
            <Button
              type="button"
              variant={cancelVariant}
              onClick={onCancel}
              disabled={loading || disabled}
            >
              {cancelText}
            </Button>
          )}
          <Button
            type="submit"
            variant={submitVariant}
            disabled={loading || disabled}
            onClick={onSubmit}
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <LoadingSpinner size="sm" />
                Loading...
              </div>
            ) : (
              submitText
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default FormContainer;
