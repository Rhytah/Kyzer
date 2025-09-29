// src/components/ui/FormField.jsx
import React from 'react';
import { clsx } from 'clsx';
import Input from './Input';
import ContentTypeIcon from './ContentTypeIcon';
import { AlertCircle, CheckCircle, Info } from 'lucide-react';

const FormField = ({
  label,
  name,
  type = 'text',
  value,
  onChange,
  onBlur,
  placeholder,
  error,
  helperText,
  success,
  disabled = false,
  required = false,
  leftIcon,
  rightIcon,
  contentType,
  className = '',
  children,
  ...props
}) => {
  const hasError = !!error;
  const hasSuccess = !!success && !hasError;

  const fieldClasses = clsx(
    'space-y-2',
    className
  );

  const inputClasses = clsx(
    'w-full px-3 py-2 border rounded-lg transition-colors duration-200',
    'focus:outline-none focus:ring-2 focus:ring-offset-2',
    'placeholder:text-gray-400',
    hasError
      ? 'border-red-300 bg-red-50 text-red-900 hover:border-red-400 focus:ring-red-500 focus:border-red-500'
      : 'border-gray-300 bg-white hover:border-gray-400 focus:ring-blue-500 focus:border-blue-500',
    hasSuccess && 'border-green-300 focus:border-green-500 focus:ring-green-500',
    disabled && 'bg-gray-100 cursor-not-allowed',
    className
  );

  const renderInput = () => {
    if (type === 'select') {
      return (
        <select
          name={name}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          disabled={disabled}
          required={required}
          className={inputClasses}
          {...props}
        >
          {children}
        </select>
      );
    }

    // For other input types, use the Input component
    const inputProps = {
      name,
      type,
      value,
      onChange,
      onBlur,
      placeholder,
      disabled,
      required,
      leftIcon: leftIcon || (contentType ? <ContentTypeIcon type={contentType} /> : undefined),
      rightIcon: rightIcon || (hasError ? AlertCircle : hasSuccess ? CheckCircle : undefined),
      className: inputClasses,
      ...props
    };

    return <Input {...inputProps} />;
  };

  return (
    <div className={fieldClasses}>
      {label && (
        <label htmlFor={name} className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      {renderInput()}
      
      {/* Helper text, error, or success message */}
      {error && (
        <div className="flex items-center gap-1 text-sm text-red-600">
          <AlertCircle size={14} />
          <span>{error}</span>
        </div>
      )}
      
      {success && !error && (
        <div className="flex items-center gap-1 text-sm text-green-600">
          <CheckCircle size={14} />
          <span>{success}</span>
        </div>
      )}
      
      {helperText && !error && !success && (
        <div className="flex items-center gap-1 text-sm text-gray-500">
          <Info size={14} />
          <span>{helperText}</span>
        </div>
      )}
    </div>
  );
};

export default FormField;
