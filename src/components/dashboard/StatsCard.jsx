// src/components/dashboard/StatsCard.jsx
import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

const StatsCard = ({ 
  title, 
  value, 
  change, 
  changeType = 'none', 
  icon: Icon,
  trend,
  className = "" 
}) => {
  const getChangeColor = () => {
    if (changeType === 'positive') return 'text-success';
    if (changeType === 'negative') return 'text-error';
    return 'text-text-light';
  };

  const getChangeIcon = () => {
    if (changeType === 'positive') return <TrendingUp className="w-4 h-4" />;
    if (changeType === 'negative') return <TrendingDown className="w-4 h-4" />;
    return null;
  };

  return (
    <div className={`bg-background-white rounded-xl border border-border p-6 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-text-light">{title}</p>
          <p className="text-2xl font-bold text-text-dark">{value}</p>
        </div>
        
        {Icon && (
          <div className="p-3 bg-primary-light rounded-lg">
            <Icon className="w-6 h-6 text-primary" />
          </div>
        )}
      </div>
      
      {change && (
        <div className="mt-4 flex items-center gap-2">
          {getChangeIcon()}
          <span className={`text-sm font-medium ${getChangeColor()}`}>
            {change}
          </span>
          {trend && (
            <span className="text-xs text-text-muted">vs last month</span>
          )}
        </div>
      )}
    </div>
  );
};

export default StatsCard;
