// src/components/ui/StatusBadge.jsx
import React from 'react';
import { clsx } from 'clsx';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertCircle, 
  Info,
  Play,
  Pause,
  StopCircle,
  User,
  Users,
  Lock,
  Unlock
} from 'lucide-react';

const StatusBadge = ({
  status,
  variant = 'default',
  size = 'default',
  showIcon = true,
  className = '',
  children
}) => {
  const statusConfig = {
    // Success states
    success: { 
      classes: 'bg-green-100 text-green-800 border-green-200', 
      icon: CheckCircle,
      defaultText: 'Success'
    },
    active: { 
      classes: 'bg-green-100 text-green-800 border-green-200', 
      icon: CheckCircle,
      defaultText: 'Active'
    },
    completed: { 
      classes: 'bg-green-100 text-green-800 border-green-200', 
      icon: CheckCircle,
      defaultText: 'Completed'
    },
    passed: { 
      classes: 'bg-green-100 text-green-800 border-green-200', 
      icon: CheckCircle,
      defaultText: 'Passed'
    },
    available: { 
      classes: 'bg-green-100 text-green-800 border-green-200', 
      icon: CheckCircle,
      defaultText: 'Available'
    },
    enrolled: { 
      classes: 'bg-green-100 text-green-800 border-green-200', 
      icon: CheckCircle,
      defaultText: 'Enrolled'
    },

    // Error/Danger states
    error: { 
      classes: 'bg-red-100 text-red-800 border-red-200', 
      icon: XCircle,
      defaultText: 'Error'
    },
    failed: { 
      classes: 'bg-red-100 text-red-800 border-red-200', 
      icon: XCircle,
      defaultText: 'Failed'
    },
    inactive: { 
      classes: 'bg-red-100 text-red-800 border-red-200', 
      icon: XCircle,
      defaultText: 'Inactive'
    },
    rejected: { 
      classes: 'bg-red-100 text-red-800 border-red-200', 
      icon: XCircle,
      defaultText: 'Rejected'
    },

    // Warning states
    warning: { 
      classes: 'bg-yellow-100 text-yellow-800 border-yellow-200', 
      icon: AlertCircle,
      defaultText: 'Warning'
    },
    pending: { 
      classes: 'bg-yellow-100 text-yellow-800 border-yellow-200', 
      icon: Clock,
      defaultText: 'Pending'
    },
    draft: { 
      classes: 'bg-yellow-100 text-yellow-800 border-yellow-200', 
      icon: Clock,
      defaultText: 'Draft'
    },

    // Info states
    info: { 
      classes: 'bg-blue-100 text-blue-800 border-blue-200', 
      icon: Info,
      defaultText: 'Info'
    },
    in_progress: { 
      classes: 'bg-blue-100 text-blue-800 border-blue-200', 
      icon: Play,
      defaultText: 'In Progress'
    },
    processing: { 
      classes: 'bg-blue-100 text-blue-800 border-blue-200', 
      icon: Clock,
      defaultText: 'Processing'
    },
    loading: { 
      classes: 'bg-blue-100 text-blue-800 border-blue-200', 
      icon: Clock,
      defaultText: 'Loading'
    },

    // Neutral states
    default: { 
      classes: 'bg-gray-100 text-gray-800 border-gray-200', 
      icon: Info,
      defaultText: 'Default'
    },
    paused: { 
      classes: 'bg-gray-100 text-gray-800 border-gray-200', 
      icon: Pause,
      defaultText: 'Paused'
    },
    stopped: { 
      classes: 'bg-gray-100 text-gray-800 border-gray-200', 
      icon: StopCircle,
      defaultText: 'Stopped'
    },
    locked: { 
      classes: 'bg-gray-100 text-gray-800 border-gray-200', 
      icon: Lock,
      defaultText: 'Locked'
    },
    unlocked: { 
      classes: 'bg-gray-100 text-gray-800 border-gray-200', 
      icon: Unlock,
      defaultText: 'Unlocked'
    },
    individual: { 
      classes: 'bg-gray-100 text-gray-800 border-gray-200', 
      icon: User,
      defaultText: 'Individual'
    },
    corporate: { 
      classes: 'bg-gray-100 text-gray-800 border-gray-200', 
      icon: Users,
      defaultText: 'Corporate'
    }
  };

  const config = statusConfig[status] || statusConfig.default;
  const IconComponent = config.icon;

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    default: 'px-2.5 py-1.5 text-sm',
    lg: 'px-3 py-2 text-base'
  };

  const iconSizeClasses = {
    sm: 'h-3 w-3',
    default: 'h-4 w-4',
    lg: 'h-5 w-5'
  };

  return (
    <span className={clsx(
      'inline-flex items-center gap-1.5 rounded-full border font-medium',
      config.classes,
      sizeClasses[size],
      className
    )}>
      {showIcon && <IconComponent className={iconSizeClasses[size]} />}
      {children || config.defaultText}
    </span>
  );
};

export default StatusBadge;
