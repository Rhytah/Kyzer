// src/components/ui/ActionButton.jsx
import React from 'react';
import { clsx } from 'clsx';
import Button from './Button';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  Check, 
  Upload, 
  Download,
  Eye,
  EyeOff,
  Copy,
  Share,
  Settings,
  MoreHorizontal,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const ActionButton = ({
  action = 'add',
  variant = 'outline',
  size = 'default',
  disabled = false,
  loading = false,
  showIcon = true,
  showText = true,
  className = '',
  children,
  ...props
}) => {
  const actionConfig = {
    add: { 
      icon: Plus, 
      text: 'Add',
      variant: variant === 'default' ? 'primary' : variant
    },
    edit: { 
      icon: Edit, 
      text: 'Edit',
      variant: variant === 'default' ? 'outline' : variant
    },
    delete: { 
      icon: Trash2, 
      text: 'Delete',
      variant: variant === 'default' ? 'danger' : variant
    },
    save: { 
      icon: Save, 
      text: 'Save',
      variant: variant === 'default' ? 'primary' : variant
    },
    cancel: { 
      icon: X, 
      text: 'Cancel',
      variant: variant === 'default' ? 'outline' : variant
    },
    confirm: { 
      icon: Check, 
      text: 'Confirm',
      variant: variant === 'default' ? 'success' : variant
    },
    upload: { 
      icon: Upload, 
      text: 'Upload',
      variant: variant === 'default' ? 'primary' : variant
    },
    download: { 
      icon: Download, 
      text: 'Download',
      variant: variant === 'default' ? 'outline' : variant
    },
    view: { 
      icon: Eye, 
      text: 'View',
      variant: variant === 'default' ? 'outline' : variant
    },
    hide: { 
      icon: EyeOff, 
      text: 'Hide',
      variant: variant === 'default' ? 'outline' : variant
    },
    copy: { 
      icon: Copy, 
      text: 'Copy',
      variant: variant === 'default' ? 'outline' : variant
    },
    share: { 
      icon: Share, 
      text: 'Share',
      variant: variant === 'default' ? 'outline' : variant
    },
    settings: { 
      icon: Settings, 
      text: 'Settings',
      variant: variant === 'default' ? 'outline' : variant
    },
    more: { 
      icon: MoreHorizontal, 
      text: 'More',
      variant: variant === 'default' ? 'ghost' : variant
    },
    expand: { 
      icon: ChevronDown, 
      text: 'Expand',
      variant: variant === 'default' ? 'ghost' : variant
    },
    collapse: { 
      icon: ChevronUp, 
      text: 'Collapse',
      variant: variant === 'default' ? 'ghost' : variant
    },
    previous: { 
      icon: ChevronLeft, 
      text: 'Previous',
      variant: variant === 'default' ? 'outline' : variant
    },
    next: { 
      icon: ChevronRight, 
      text: 'Next',
      variant: variant === 'default' ? 'outline' : variant
    }
  };

  const config = actionConfig[action];
  const IconComponent = config?.icon || Plus;
  const displayText = children || config?.text || 'Action';
  const buttonVariant = config?.variant || variant;

  const iconSizeClasses = {
    sm: 'h-4 w-4',
    default: 'h-4 w-4',
    lg: 'h-5 w-5',
    xl: 'h-6 w-6'
  };

  return (
    <Button
      type="button"
      variant={buttonVariant}
      size={size}
      disabled={disabled || loading}
      className={clsx(className)}
      {...props}
    >
      <div className="flex items-center gap-2">
        {showIcon && <IconComponent className={iconSizeClasses[size]} />}
        {showText && <span>{displayText}</span>}
      </div>
    </Button>
  );
};

export default ActionButton;
