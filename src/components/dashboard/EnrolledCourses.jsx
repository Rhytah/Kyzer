// src/components/dashboard/EnrolledCourses.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Play, Clock, CheckCircle, BookOpen } from 'lucide-react';
import Card from '@/components/ui/Card';

const EnrolledCourses = ({ courses = [], loading = false }) => {
  if (loading) {
    return (
      <Card className="bg-background-white rounded-xl border border-border p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-background-medium rounded w-1/4"></div>
          <div className="space-y-3">
            <div className="h-20 bg-background-medium rounded"></div>
            <div className="h-20 bg-background-medium rounded"></div>
            <div className="h-20 bg-background-medium rounded"></div>
          </div>
        </div>
      </Card>
    );
  }

  if (!courses.length) {
    return (
      <Card className="bg-background-white rounded-xl border border-border p-8 text-center">
        <BookOpen className="w-12 h-12 text-text-muted mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-text-dark mb-2">No courses enrolled yet</h3>
        <p className="text-text-light mb-6">Start your learning journey by enrolling in a course</p>
        <Link 
          to="/app/courses/catalog"
          className="inline-flex items-center px-4 py-2 bg-primary text-background-white rounded-lg hover:bg-primary-dark transition-colors"
        >
          Browse Courses
        </Link>
      </Card>
    );
  }

  return (
    <Card className="bg-background-white rounded-xl border border-border p-6 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-text-dark">Enrolled Courses</h2>
        <Link 
          to="/app/courses"
          className="text-primary hover:text-primary-dark transition-colors"
        >
          View All
        </Link>
      </div>

      <div className="space-y-4">
        {courses.slice(0, 3).map((course) => (
          <div key={course.id} className="flex items-center justify-between p-4 bg-background-light rounded-lg">
            <div className="flex-1">
              <h3 className="font-medium text-text-dark mb-1">{course.title}</h3>
              <div className="flex items-center gap-4 text-sm text-text-light">
                {course.difficulty_level && (
                  <span className="px-2 py-1 bg-background-medium rounded text-xs">
                    {course.difficulty_level}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <BookOpen className="w-4 h-4" />
                  {course.progress || 0}% complete
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {course.progress >= 100 ? (
                <CheckCircle className="w-5 h-5 text-success-default" />
              ) : (
                <Link 
                  to={`/app/courses/${course.id}`}
                  className="p-2 bg-primary text-background-white rounded-lg hover:bg-primary-dark transition-colors"
                >
                  <Play className="w-4 h-4" />
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default EnrolledCourses;