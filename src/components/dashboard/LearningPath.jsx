// src/components/dashboard/LearningPath.jsx
import { useCourseData } from '@/hooks/courses/useCourseData';

export default function LearningPath() {
  const { enrolledCourses, stats } = useCourseData();
  
  const nextCourse = enrolledCourses.find(course => 
    course.progress_percentage > 0 && course.progress_percentage < 100
  );
  
  const completedThisWeek = enrolledCourses.filter(course => {
    const completedAt = new Date(course.completed_at);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return completedAt > weekAgo;
  });
  
  return (
    <div className="learning-path">
      <h3>Your Learning Path</h3>
      
      {nextCourse && (
        <div className="next-up">
          <h4>Continue Learning</h4>
          <div className="course-card">
            <h5>{nextCourse.title}</h5>
            <div className="progress-bar">
              <div 
                className="progress" 
                style={{ width: `${nextCourse.progress_percentage}%` }}
              />
            </div>
            <p>{nextCourse.progress_percentage}% complete</p>
          </div>
        </div>
      )}
      
      {completedThisWeek.length > 0 && (
        <div className="recent-completions">
          <h4>Completed This Week</h4>
          {completedThisWeek.map(course => (
            <div key={course.id} className="completion-item">
              ✅ {course.title}
            </div>
          ))}
        </div>
      )}
      
      <div className="motivation">
        <p>Keep going! You've completed {stats.completedCourses} courses.</p>
      </div>
    </div>
  );
}