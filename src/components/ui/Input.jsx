// src/components/ui/Input.jsx
import React, { forwardRef } from 'react';
import { clsx } from 'clsx';

const Input = forwardRef(
  (
    {
      label,
      error,
      helperText,
      leftIcon: LeftIcon,
      rightIcon: RightIcon,
      className = "",
      ...props
    },
    ref,
  ) => {
    const inputClasses = clsx(
      "w-full px-3 py-2 border rounded-lg transition-colors duration-200",
      "focus:outline-none focus:ring-2 focus:ring-offset-2",
      "placeholder:text-text-muted",
      error
        ? "border-error bg-error-light text-error-dark hover:border-error-dark"
        : "border-background-dark bg-background-white hover:border-primary-light focus:ring-primary/20 focus:border-primary",
      LeftIcon && "pl-10",
      RightIcon && "pr-10",
      className
    );

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-text-dark mb-2">
            {label}
          </label>
        )}
        
        <div className="relative">
          {LeftIcon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted">
              <LeftIcon size={16} />
            </div>
          )}
          
          <input
            ref={ref}
            className={inputClasses}
            {...props}
          />
          
          {RightIcon && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-muted">
              <RightIcon size={16} />
            </div>
          )}
        </div>
        
        {error && (
          <p className="mt-1 text-sm text-error">{error}</p>
        )}
        
        {helperText && !error && (
          <p className="mt-1 text-sm text-text-light">{helperText}</p>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";

export default Input;
