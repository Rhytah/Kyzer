// src/components/ui/Button.jsx
import React from "react";
import { Loader2 } from "lucide-react";
import { clsx } from "clsx";

const Button = React.forwardRef(
  (
    {
      children,
      className = "",
      variant = "primary",
      size = "default",
      loading = false,
      disabled = false,
      type = "button",
      onClick,
      ...props
    },
    ref,
  ) => {
    const baseClasses =
      "inline-flex items-center justify-center font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed";

    const variants = {
      primary:
        "bg-primary text-white hover:bg-primary-dark focus:ring-primary/20",
      secondary:
        "bg-white text-primary border border-primary hover:bg-primary-light focus:ring-primary/20",
      ghost:
        "bg-transparent text-text-light hover:bg-background-medium focus:ring-primary/20",
      danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500/20",
    };

    const sizes = {
      sm: "px-3 py-1.5 text-sm",
      default: "px-4 py-2 text-sm",
      lg: "px-6 py-3 text-base",
      xl: "px-8 py-4 text-lg",
    };

    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        onClick={onClick}
        className={clsx(baseClasses, variants[variant], sizes[size], className)}
        {...props}
      >
        {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
        {children}
      </button>
    );
  },
);

Button.displayName = "Button";

export default Button;
