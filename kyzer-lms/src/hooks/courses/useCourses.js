// // src/hooks/courses/useCourses.js
// import { useState, useEffect } from 'react'
// import { db } from '@/lib/supabase'
// import toast from 'react-hot-toast'

// export function useCourses(filters = {}) {
//   const [courses, setCourses] = useState([])
//   const [loading, setLoading] = useState(true)
//   const [error, setError] = useState(null)

//   useEffect(() => {
//     loadCourses()
//   }, [JSON.stringify(filters)])

//   const loadCourses = async () => {
//     try {
//       setLoading(true)
//       setError(null)
      
//       // For now, using mock data - replace with actual Supabase call
//       const mockCourses = [
//         {
//           id: 'react-intro',
//           title: 'Introduction to React',
//           description: 'Learn the fundamentals of React including components, props, state, and event handling.',
//           thumbnail_url: '/course-placeholder.jpg',
//           duration: '8 hours',
//           difficulty: 'beginner',
//           rating: 4.8,
//           students: 1520,
//           price: 0, // Free course
//           category_id: 'frontend',
//           published: true,
//           created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
//           categories: { name: 'Frontend Development' }
//         },
//         {
//           id: 'js-advanced',
//           title: 'Advanced JavaScript Concepts',
//           description: 'Master advanced JavaScript topics including closures, prototypes, async/await, and ES6+ features.',
//           thumbnail_url: '/course-placeholder.jpg',
//           duration: '12 hours',
//           difficulty: 'advanced',
//           rating: 4.9,
//           students: 890,
//           price: 49.99,
//           category_id: 'javascript',
//           published: true,
//           created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
//           categories: { name: 'JavaScript' }
//         },
//         {
//           id: 'css-grid-flexbox',
//           title: 'CSS Grid and Flexbox Mastery',
//           description: 'Create beautiful, responsive layouts with CSS Grid and Flexbox. Learn modern CSS layout techniques.',
//           thumbnail_url: '/course-placeholder.jpg',
//           duration: '6 hours',
//           difficulty: 'intermediate',
//           rating: 4.7,
//           students: 1205,
//           price: 29.99,
//           category_id: 'css',
//           published: true,
//           created_at: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000),
//           categories: { name: 'CSS & Styling' }
//         },
//         {
//           id: 'node-backend',
//           title: 'Node.js Backend Development',
//           description: 'Build scalable backend applications with Node.js, Express, and MongoDB.',
//           thumbnail_url: '/course-placeholder.jpg',
//           duration: '15 hours',
//           difficulty: 'intermediate',
//           rating: 4.6,
//           students: 756,
//           price: 79.99,
//           category_id: 'backend',
//           published: true,
//           created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
//           categories: { name: 'Backend Development' }
//         },
//         {
//           id: 'python-data-science',
//           title: 'Python for Data Science',
//           description: 'Learn Python programming for data analysis, visualization, and machine learning.',
//           thumbnail_url: '/course-placeholder.jpg',
//           duration: '20 hours',
//           difficulty: 'intermediate',
//           rating: 4.8,
//           students: 2340,
//           price: 99.99,
//           category_id: 'data-science',
//           published: true,
//           created_at: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
//           categories: { name: 'Data Science' }
//         }
//       ]

//       // Apply filters
//       let filteredCourses = mockCourses

//       if (filters.category) {
//         filteredCourses = filteredCourses.filter(course => 
//           course.category_id === filters.category
//         )
//       }

//       if (filters.search) {
//         const searchTerm = filters.search.toLowerCase()
//         filteredCourses = filteredCourses.filter(course =>
//           course.title.toLowerCase().includes(searchTerm) ||
//           course.description.toLowerCase().includes(searchTerm)
//         )
//       }

//       if (filters.difficulty) {
//         filteredCourses = filteredCourses.filter(course =>
//           course.difficulty === filters.difficulty
//         )
//       }

//       if (filters.free) {
//         filteredCourses = filteredCourses.filter(course => course.price === 0)
//       }

//       // Simulate API delay
//       await new Promise(resolve => setTimeout(resolve, 300))
      
//       setCourses(filteredCourses)
//     } catch (err) {
//       console.error('Error loading courses:', err)
//       setError('Failed to load courses')
//       toast.error('Failed to load courses')
//     } finally {
//       setLoading(false)
//     }
//   }

//   const getCourseById = async (courseId) => {
//     try {
//       // Mock course detail - replace with actual Supabase call
//       const course = courses.find(c => c.id === courseId)
      
//       if (!course) {
//         // If not in current list, simulate fetching from API
//         const mockCourseDetail = {
//           id: courseId,
//           title: 'Course Title',
//           description: 'Course description...',
//           // ... other course properties
//           course_modules: [
//             {
//               id: 'module-1',
//               title: 'Getting Started',
//               description: 'Introduction to the course',
//               order_index: 1,
//               lessons: [
//                 {
//                   id: 'lesson-1',
//                   title: 'Welcome',
//                   type: 'video',
//                   content_url: '#',
//                   duration: '5 min',
//                   order_index: 1
//                 }
//               ]
//             }
//           ]
//         }
//         return mockCourseDetail
//       }

//       return course
//     } catch (err) {
//       console.error('Error getting course:', err)
//       throw err
//     }
//   }

//   const searchCourses = async (searchTerm) => {
//     return loadCourses({ ...filters, search: searchTerm })
//   }

//   const getPopularCourses = () => {
//     return courses
//       .filter(course => course.students > 1000)
//       .sort((a, b) => b.students - a.students)
//       .slice(0, 6)
//   }

//   const getRecentCourses = () => {
//     return courses
//       .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
//       .slice(0, 6)
//   }

//   const getFreeCourses = () => {
//     return courses.filter(course => course.price === 0)
//   }

//   const getCoursesByCategory = (categoryId) => {
//     return courses.filter(course => course.category_id === categoryId)
//   }

//   return {
//     courses,
//     loading,
//     error,
    
//     // Actions
//     loadCourses,
//     getCourseById,
//     searchCourses,
    
//     // Computed data
//     getPopularCourses,
//     getRecentCourses,
//     getFreeCourses,
//     getCoursesByCategory,
    
//     // Stats
//     totalCourses: courses.length,
//     freeCourses: courses.filter(c => c.price === 0).length,
//     averageRating: courses.length > 0 
//       ? (courses.reduce((sum, course) => sum + (course.rating || 0), 0) / courses.length).toFixed(1)
//       : 0
//   }
// }

// src/hooks/courses/useCourses.js
// =================
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export const useCourses = (filters = {}) => {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchCourses()
  }, [filters])

  const fetchCourses = async () => {
    try {
      setLoading(true)
      setError(null)

      let query = supabase
        .from('courses')
        .select(`
          *,
          course_modules (
            id,
            title,
            lessons (id)
          )
        `)
        .eq('is_published', true)

      // Apply filters
      if (filters.search) {
        query = query.ilike('title', `%${filters.search}%`)
      }
      
      if (filters.difficulty) {
        query = query.eq('difficulty_level', filters.difficulty)
      }

      const { data, error: fetchError } = await query.order('created_at', { ascending: false })

      if (fetchError) throw fetchError

      // Calculate lesson count for each course
      const coursesWithStats = data.map(course => ({
        ...course,
        lesson_count: course.course_modules.reduce((total, module) => 
          total + module.lessons.length, 0
        ),
        module_count: course.course_modules.length
      }))

      setCourses(coursesWithStats)
    } catch (err) {
      setError(err.message)
      console.error('Error fetching courses:', err)
    } finally {
      setLoading(false)
    }
  }

  return {
    courses,
    loading,
    error,
    refetch: fetchCourses
  }
}