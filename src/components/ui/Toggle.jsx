// src/components/ui/Toggle.jsx
import { useState } from "react";

export default function Toggle({ 
  checked = false, 
  onChange, 
  disabled = false,
  size = "default",
  className = "" 
}) {
  const [isChecked, setIsChecked] = useState(checked);

  const handleToggle = () => {
    if (disabled) return;
    const newValue = !isChecked;
    setIsChecked(newValue);
    if (onChange) {
      onChange(newValue);
    }
  };

  const sizeClasses = {
    small: "h-4 w-7",
    default: "h-6 w-11",
    large: "h-8 w-14"
  };

  const thumbSizeClasses = {
    small: "h-3 w-3",
    default: "h-4 w-4", 
    large: "h-6 w-6"
  };

  const translateClasses = {
    small: isChecked ? "translate-x-3" : "translate-x-0.5",
    default: isChecked ? "translate-x-6" : "translate-x-1",
    large: isChecked ? "translate-x-7" : "translate-x-1"
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={disabled}
      className={`
        relative inline-flex ${sizeClasses[size]} items-center rounded-full 
        transition-colors duration-200 ease-in-out focus:outline-none 
        focus:ring-2 focus:ring-primary/20 focus:ring-offset-2
        ${isChecked ? "bg-primary" : "bg-background-dark"}
        ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
        ${className}
      `}
      role="switch"
      aria-checked={isChecked}
    >
      <span
        className={`
          inline-block ${thumbSizeClasses[size]} transform rounded-full 
          bg-background-white transition-transform duration-200 ease-in-out
          ${translateClasses[size]}
        `}
      />
    </button>
  );
}
