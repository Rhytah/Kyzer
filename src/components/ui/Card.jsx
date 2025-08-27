// src/components/ui/Card.jsx
import React from 'react';

const Card = ({ 
  children, 
  className = "", 
  onClick, 
  hover = false,
  padding = "p-6"
}) => {
  const baseClasses = "rounded-xl border transition-all duration-200";
  
  const variantClasses = {
    default: "bg-background-white border-border",
    hover: "bg-background-white border-border hover:shadow-md hover:border-primary/20",
    interactive: "bg-background-white border-border hover:shadow-md hover:border-primary/20 cursor-pointer"
  };

  const variant = onClick ? "interactive" : hover ? "hover" : "default";
  
  const classes = `${baseClasses} ${variantClasses[variant]} ${padding} ${className}`;

  return (
    <div 
      className={classes}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      } : undefined}
    >
      {children}
    </div>
  );
};

export default Card;
