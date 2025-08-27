// src/components/course/EnrollButton.jsx
import { useCourseData } from '@/hooks/courses/useCourseData';
import { useCourseStore } from '@/store/courseStore';
import { useAuth } from '@/hooks/auth/useAuth';

export default function EnrollButton({ courseId }) {
  const { enrolledCourses, refresh } = useCourseData();
  const enrollInCourse = useCourseStore(state => state.actions.enrollInCourse);
  const { user } = useAuth();
  
  const isEnrolled = enrolledCourses.some(course => course.id === courseId);
  
  const handleEnroll = async () => {
    if (!user?.id) return;
    await enrollInCourse(user.id, courseId);
    // Refresh data to show new enrollment
    refresh(true);
  };
  
  if (isEnrolled) {
    return <button disabled>Already Enrolled</button>;
  }
  
  return <button onClick={handleEnroll}>Enroll Now</button>;
}