// src/components/ui/Button.jsx
import React from 'react';
import { clsx } from 'clsx';

const Button = React.forwardRef(
  (
    {
      children,
      variant = "primary",
      size = "default",
      disabled = false,
      loading = false,
      className = "",
      ...props
    },
    ref,
  ) => {
    const baseClasses = "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

    const variantClasses = {
      primary: "bg-primary text-background-white hover:bg-primary-dark focus:ring-primary/20",
      secondary: "bg-background-medium text-text-dark hover:bg-background-dark focus:ring-background-medium/20",
      outline: "bg-transparent text-primary border border-primary hover:bg-primary hover:text-background-white focus:ring-primary/20",
      ghost: "bg-transparent text-text-dark hover:bg-background-light focus:ring-text-dark/20",
      danger: "bg-error text-background-white hover:bg-error-dark focus:ring-error/20",
      success: "bg-success text-background-white hover:bg-success-dark focus:ring-success/20",
      warning: "bg-warning text-background-white hover:bg-warning-dark focus:ring-warning/20",
      white: "bg-background-white text-primary border border-primary hover:bg-primary-light focus:ring-primary/20"
    };

    const sizeClasses = {
      sm: "px-3 py-1.5 text-sm",
      default: "px-4 py-2 text-sm",
      lg: "px-6 py-3 text-base",
      xl: "px-8 py-4 text-lg"
    };

    const classes = clsx(
      baseClasses,
      variantClasses[variant],
      sizeClasses[size],
      className
    );

    return (
      <button
        ref={ref}
        className={classes}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            Loading...
          </div>
        ) : (
          children
        )}
      </button>
    );
  },
);

Button.displayName = "Button";

export default Button;
