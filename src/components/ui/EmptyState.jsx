// src/components/ui/EmptyState.jsx
import React from 'react';
import { clsx } from 'clsx';
import Button from './Button';
import { 
  FileText, 
  FolderOpen, 
  Search, 
  Plus, 
  AlertCircle,
  Users,
  BookOpen,
  Calendar,
  MessageSquare,
  Settings
} from 'lucide-react';

const EmptyState = ({
  icon = 'file',
  title,
  description,
  action,
  actionText,
  actionVariant = 'primary',
  className = '',
  size = 'default'
}) => {
  const iconMap = {
    file: FileText,
    folder: FolderOpen,
    search: Search,
    plus: Plus,
    alert: AlertCircle,
    users: Users,
    book: BookOpen,
    calendar: Calendar,
    message: MessageSquare,
    settings: Settings
  };

  const IconComponent = iconMap[icon] || FileText;

  const sizeClasses = {
    sm: {
      container: 'py-8',
      icon: 'h-8 w-8',
      title: 'text-lg',
      description: 'text-sm',
      spacing: 'space-y-3'
    },
    default: {
      container: 'py-12',
      icon: 'h-12 w-12',
      title: 'text-xl',
      description: 'text-base',
      spacing: 'space-y-4'
    },
    lg: {
      container: 'py-16',
      icon: 'h-16 w-16',
      title: 'text-2xl',
      description: 'text-lg',
      spacing: 'space-y-6'
    }
  };

  const classes = sizeClasses[size];

  return (
    <div className={clsx(
      'flex flex-col items-center justify-center text-center',
      classes.container,
      className
    )}>
      <div className={clsx('flex flex-col items-center', classes.spacing)}>
        {/* Icon */}
        <div className="flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full">
          <IconComponent className={clsx('text-gray-400', classes.icon)} />
        </div>

        {/* Content */}
        <div className={clsx('max-w-sm', classes.spacing)}>
          {title && (
            <h3 className={clsx('font-medium text-gray-900', classes.title)}>
              {title}
            </h3>
          )}
          
          {description && (
            <p className={clsx('text-gray-500', classes.description)}>
              {description}
            </p>
          )}
        </div>

        {/* Action */}
        {action && actionText && (
          <Button
            onClick={action}
            variant={actionVariant}
            size="default"
          >
            {actionText}
          </Button>
        )}
      </div>
    </div>
  );
};

export default EmptyState;
