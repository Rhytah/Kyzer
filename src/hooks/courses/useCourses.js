import { useState, useEffect } from 'react';

const mockCourses = [
  {
    id: 1,
    title: 'React Fundamentals',
    description: 'Learn the basics of React including components, props, and state management.',
    duration: '8 hours',
    level: 'Beginner',
    instructor: 'John Smith',
    enrolled: 156,
    rating: 4.8,
    price: 99,
    tags: ['React', 'JavaScript', 'Frontend'],
    isEnrolled: false
  },
  {
    id: 2,
    title: 'JavaScript ES6+',
    description: 'Modern JavaScript features and best practices for web development.',
    duration: '6 hours',
    level: 'Intermediate',
    instructor: 'Sarah Johnson',
    enrolled: 203,
    rating: 4.9,
    price: 79,
    tags: ['JavaScript', 'ES6', 'Programming'],
    isEnrolled: true
  }
];

export const useCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        await new Promise(resolve => setTimeout(resolve, 500));
        setCourses(mockCourses);
      } catch (err) {
        setError('Failed to fetch courses');
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  return { courses, loading, error };
};
