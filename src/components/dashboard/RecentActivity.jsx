// src/components/dashboard/RecentActivity.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, BookOpen, Award, Play, CheckCircle } from 'lucide-react';
import Card from '@/components/ui/Card';

const RecentActivity = ({ activities = [], loading = false }) => {
  const getActivityIcon = (type) => {
    switch (type) {
      case 'course_started':
        return <Play className="w-4 h-4 text-primary" />;
      case 'course_completed':
        return <CheckCircle className="w-4 h-4 text-success-default" />;
      case 'lesson_completed':
        return <BookOpen className="w-4 h-4 text-warning-default" />;
      case 'certificate_earned':
        return <Award className="w-4 h-4 text-success-default" />;
      default:
        return <Clock className="w-4 h-4 text-text-muted" />;
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case 'course_started':
        return 'text-primary';
      case 'course_completed':
        return 'text-success-default';
      case 'lesson_completed':
        return 'text-warning-default';
      case 'certificate_earned':
        return 'text-success-default';
      default:
        return 'text-text-muted';
    }
  };

  if (loading) {
    return (
      <Card className="bg-background-white rounded-xl border border-border p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-background-medium rounded w-1/3"></div>
          <div className="space-y-3">
            <div className="h-16 bg-background-medium rounded"></div>
            <div className="h-16 bg-background-medium rounded"></div>
            <div className="h-16 bg-background-medium rounded"></div>
          </div>
        </div>
      </Card>
    );
  }

  if (!activities.length) {
    return (
      <Card className="bg-background-white rounded-xl border border-border p-6">
        <div className="text-center py-8">
          <Clock className="w-12 h-12 text-text-muted mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-text-dark mb-2">No recent activity</h3>
          <p className="text-text-light">Start learning to see your activity here</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="bg-background-white rounded-xl border border-border p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-text-dark">Recent Activity</h2>
        <Link 
          to="/app/activity"
          className="text-primary hover:text-primary-dark transition-colors"
        >
          View All
        </Link>
      </div>

      <div className="space-y-4">
        {activities.slice(0, 5).map((activity) => (
          <div key={activity.id} className="flex items-start gap-3 p-4 bg-background-light rounded-lg">
            <div className="flex-shrink-0 mt-1">
              {getActivityIcon(activity.type)}
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="text-sm text-text-dark mb-1">
                {activity.description}
              </p>
              <div className="flex items-center gap-2 text-xs text-text-light">
                <Clock className="w-3 h-3" />
                <span>{activity.timeAgo}</span>
                {activity.course && (
                  <Link 
                    to={`/app/courses/${activity.course.id}`}
                    className="text-primary hover:text-primary-dark"
                  >
                    {activity.course.title}
                  </Link>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default RecentActivity;
