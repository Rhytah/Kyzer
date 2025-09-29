// src/components/ui/FormSection.jsx
import React from 'react';
import { clsx } from 'clsx';
import { ChevronDown, ChevronRight } from 'lucide-react';

const FormSection = ({
  title,
  description,
  children,
  collapsible = false,
  defaultCollapsed = false,
  className = '',
  titleClassName = '',
  contentClassName = '',
  ...props
}) => {
  const [isCollapsed, setIsCollapsed] = React.useState(defaultCollapsed);

  const handleToggle = () => {
    if (collapsible) {
      setIsCollapsed(!isCollapsed);
    }
  };

  return (
    <div className={clsx('space-y-4', className)} {...props}>
      {/* Section Header */}
      {(title || description) && (
        <div 
          className={clsx(
            'border-b border-gray-200 pb-3',
            collapsible && 'cursor-pointer hover:bg-gray-50 -mx-4 px-4 py-2 rounded-lg'
          )}
          onClick={handleToggle}
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              {title && (
                <h3 className={clsx(
                  'text-lg font-semibold text-gray-900',
                  titleClassName
                )}>
                  {title}
                </h3>
              )}
              {description && (
                <p className="mt-1 text-sm text-gray-600">{description}</p>
              )}
            </div>
            {collapsible && (
              <div className="ml-4">
                {isCollapsed ? (
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-400" />
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Section Content */}
      {(!collapsible || !isCollapsed) && (
        <div className={clsx('space-y-4', contentClassName)}>
          {children}
        </div>
      )}
    </div>
  );
};

export default FormSection;
