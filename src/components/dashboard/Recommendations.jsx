// src/components/dashboard/Recommendations.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Clock, Users, BookOpen } from 'lucide-react';
import Card from '@/components/ui/Card';

const Recommendations = ({ recommendations = [], loading = false }) => {
  if (loading) {
    return (
      <Card className="bg-background-white rounded-xl border border-border p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-background-medium rounded w-1/3"></div>
          <div className="space-y-3">
            <div className="h-24 bg-background-medium rounded"></div>
            <div className="h-24 bg-background-medium rounded"></div>
            <div className="h-24 bg-background-medium rounded"></div>
          </div>
        </div>
      </Card>
    );
  }

  if (!recommendations.length) {
    return (
      <Card className="bg-background-white rounded-xl border border-border p-6">
        <div className="text-center py-8">
          <BookOpen className="w-12 h-12 text-text-muted mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-text-dark mb-2">No recommendations yet</h3>
          <p className="text-text-light">Complete more courses to get personalized recommendations</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="bg-background-white rounded-xl border border-border p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-text-dark">Recommended for You</h2>
        <Link 
          to="/app/courses/catalog"
          className="text-primary hover:text-primary-dark transition-colors text-sm"
        >
          View All
        </Link>
      </div>

      <div className="space-y-3">
        {recommendations.slice(0, 3).map((course) => (
          <div key={course.id} className="p-4 bg-background-light rounded-lg hover:shadow-md transition-shadow duration-200">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <img
                  src={course.thumbnail || '/course-placeholder.jpg'}
                  alt={course.title}
                  className="w-16 h-12 object-cover rounded-lg bg-background-medium"
                />
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-text-dark mb-1 line-clamp-1">
                  {course.title}
                </h3>
                <p className="text-xs text-text-light mb-2 line-clamp-2">
                  {course.description}
                </p>
                
                <div className="flex items-center gap-4 text-xs text-text-light">
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 text-warning" />
                    <span>{course.rating}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{course.duration}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    <span>{course.enrolledCount} enrolled</span>
                  </div>
                </div>
              </div>
              
              <Link
                to={`/app/courses/${course.id}`}
                className="px-3 py-1.5 bg-primary text-background-white text-xs font-medium rounded-lg hover:bg-primary-dark transition-colors"
              >
                View
              </Link>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default Recommendations;
