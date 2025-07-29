import { useState } from 'react';
import toast from 'react-hot-toast';

export const useEnrollment = () => {
  const [enrollingCourses, setEnrollingCourses] = useState(new Set());
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(false);
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
const getStats = async (userId) => {
  try {
    setLoading(true);
    const response = await fetch(`/api/users/${userId}/stats`);
    
    // First check if the response is OK (status 200-299)
    if (!response.ok) {
      const errorData = await response.text(); // Get the response as text first
      throw new Error(`Server error: ${response.status} - ${errorData}`);
    }

    // Check content type to ensure it's JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      throw new Error(`Expected JSON but got: ${text.substring(0, 100)}...`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching stats:', error);
    throw error; // Re-throw so the caller can handle it
  } finally {
    setLoading(false);
  }
};

  const isEnrolling = (courseId) => enrollingCourses.has(courseId);

  return {   enrollInCourse, 
    isEnrolling, 
    getStats,
    enrollments,
    loading  };
};
