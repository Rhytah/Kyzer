import { useState } from 'react';
import toast from 'react-hot-toast';

export const useEnrollment = () => {
  const [enrollingCourses, setEnrollingCourses] = useState(new Set());

  const enrollInCourse = async (courseId) => {
    try {
      setEnrollingCourses(prev => new Set([...prev, courseId]));
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Successfully enrolled!');
      return { success: true };
    } catch (error) {
      toast.error('Failed to enroll');
      return { success: false };
    } finally {
      setEnrollingCourses(prev => {
        const newSet = new Set(prev);
        newSet.delete(courseId);
        return newSet;
      });
    }
  };

  const isEnrolling = (courseId) => enrollingCourses.has(courseId);

  return { enrollInCourse, isEnrolling };
};
