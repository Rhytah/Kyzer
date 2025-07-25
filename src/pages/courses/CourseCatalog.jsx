// // src/pages/courses/CourseCatalog.jsx
// import { useState, useEffect } from "react";
// import { Link } from "react-router-dom";
// import { useCourses } from "@/hooks/courses/useCourses";
// import { useEnrollment } from "@/hooks/courses/useEnrollment";
// import {
//   Search,
//   Filter,
//   Star,
//   Clock,
//   Users,
//   BookOpen,
//   Play,
//   CheckCircle,
//   Grid,
//   List,
// } from "lucide-react";

// export default function CourseCatalog() {
//   const [searchTerm, setSearchTerm] = useState("");
//   const [selectedCategory, setSelectedCategory] = useState("");
//   const [selectedDifficulty, setSelectedDifficulty] = useState("");
//   const [showFreeOnly, setShowFreeOnly] = useState(false);
//   const [viewMode, setViewMode] = useState("grid");

//   const { courses, loading, searchCourses } = useCourses({
//     search: searchTerm,
//     category: selectedCategory,
//     difficulty: selectedDifficulty,
//     free: showFreeOnly,
//   });

//   const { isEnrolledInCourse } = useEnrollment();

//   const categories = [
//     "Frontend Development",
//     "Backend Development",
//     "JavaScript",
//     "CSS & Styling",
//     "Data Science",
//   ];

//   const difficulties = ["beginner", "intermediate", "advanced"];

//   const handleSearch = (term) => {
//     setSearchTerm(term);
//     searchCourses(term);
//   };

//   const CourseCard = ({ course }) => {
//     const isEnrolled = isEnrolledInCourse(course.id);

//     return (
//       <div className="bg-white rounded-xl border border-background-dark overflow-hidden hover:shadow-lg transition-shadow duration-200">
//         {/* Course Image */}
//         <div className="relative h-48 bg-background-medium">
//           <img
//             src={course.thumbnail_url || "/course-placeholder.jpg"}
//             alt={course.title}
//             className="w-full h-full object-cover"
//           />
//           {course.price === 0 && (
//             <span className="absolute top-3 left-3 px-2 py-1 bg-green-500 text-white text-xs font-medium rounded-full">
//               Free
//             </span>
//           )}
//           {isEnrolled && (
//             <span className="absolute top-3 right-3 px-2 py-1 bg-blue-500 text-white text-xs font-medium rounded-full">
//               Enrolled
//             </span>
//           )}
//         </div>

//         {/* Course Content */}
//         <div className="p-6">
//           <div className="mb-3">
//             <span className="text-xs text-primary font-medium">
//               {course.categories?.name}
//             </span>
//           </div>

//           <h3 className="text-lg font-semibold text-text-dark mb-2 line-clamp-2">
//             {course.title}
//           </h3>

//           <p className="text-sm text-text-light mb-4 line-clamp-3">
//             {course.description}
//           </p>

//           {/* Course Meta */}
//           <div className="flex items-center justify-between text-xs text-text-muted mb-4">
//             <div className="flex items-center space-x-4">
//               {course.rating && (
//                 <div className="flex items-center space-x-1">
//                   <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
//                   <span>{course.rating}</span>
//                 </div>
//               )}
//               {course.students && (
//                 <div className="flex items-center space-x-1">
//                   <Users className="w-3 h-3" />
//                   <span>{course.students.toLocaleString()}</span>
//                 </div>
//               )}
//               {course.duration && (
//                 <div className="flex items-center space-x-1">
//                   <Clock className="w-3 h-3" />
//                   <span>{course.duration}</span>
//                 </div>
//               )}
//             </div>

//             {course.difficulty && (
//               <span
//                 className={`px-2 py-1 rounded-full text-xs font-medium ${
//                   course.difficulty === "beginner"
//                     ? "bg-green-100 text-green-700"
//                     : course.difficulty === "intermediate"
//                       ? "bg-yellow-100 text-yellow-700"
//                       : "bg-red-100 text-red-700"
//                 }`}
//               >
//                 {course.difficulty}
//               </span>
//             )}
//           </div>

//           {/* Price and Action */}
//           <div className="flex items-center justify-between">
//             <div>
//               {course.price === 0 ? (
//                 <span className="text-lg font-bold text-green-600">Free</span>
//               ) : (
//                 <span className="text-lg font-bold text-text-dark">
//                   ${course.price}
//                 </span>
//               )}
//             </div>

//             <Link
//               to={`/courses/${course.id}`}
//               className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
//                 isEnrolled
//                   ? "bg-green-100 text-green-700 hover:bg-green-200"
//                   : "bg-primary text-white hover:bg-primary-dark"
//               }`}
//             >
//               {isEnrolled ? (
//                 <>
//                   <CheckCircle className="w-4 h-4 mr-2" />
//                   Continue
//                 </>
//               ) : (
//                 <>
//                   <Play className="w-4 h-4 mr-2" />
//                   {course.price === 0 ? "Start Free" : "Enroll Now"}
//                 </>
//               )}
//             </Link>
//           </div>
//         </div>
//       </div>
//     );
//   };

//   const CourseListItem = ({ course }) => {
//     const isEnrolled = isEnrolledInCourse(course.id);

//     return (
//       <div className="bg-white rounded-xl border border-background-dark p-6 hover:shadow-md transition-shadow duration-200">
//         <div className="flex items-start space-x-6">
//           {/* Course Image */}
//           <div className="relative w-24 h-18 bg-background-medium rounded-lg overflow-hidden flex-shrink-0">
//             <img
//               src={course.thumbnail_url || "/course-placeholder.jpg"}
//               alt={course.title}
//               className="w-full h-full object-cover"
//             />
//             {course.price === 0 && (
//               <span className="absolute top-1 left-1 px-1 py-0.5 bg-green-500 text-white text-xs font-medium rounded">
//                 Free
//               </span>
//             )}
//           </div>

//           {/* Course Info */}
//           <div className="flex-1 min-w-0">
//             <div className="flex items-start justify-between">
//               <div className="flex-1">
//                 <div className="mb-1">
//                   <span className="text-xs text-primary font-medium">
//                     {course.categories?.name}
//                   </span>
//                 </div>

//                 <h3 className="text-lg font-semibold text-text-dark mb-2">
//                   {course.title}
//                 </h3>

//                 <p className="text-sm text-text-light mb-3 line-clamp-2">
//                   {course.description}
//                 </p>

//                 {/* Course Meta */}
//                 <div className="flex items-center space-x-4 text-xs text-text-muted">
//                   {course.rating && (
//                     <div className="flex items-center space-x-1">
//                       <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
//                       <span>{course.rating}</span>
//                     </div>
//                   )}
//                   {course.students && (
//                     <div className="flex items-center space-x-1">
//                       <Users className="w-3 h-3" />
//                       <span>{course.students.toLocaleString()}</span>
//                     </div>
//                   )}
//                   {course.duration && (
//                     <div className="flex items-center space-x-1">
//                       <Clock className="w-3 h-3" />
//                       <span>{course.duration}</span>
//                     </div>
//                   )}
//                   {course.difficulty && (
//                     <span
//                       className={`px-2 py-1 rounded-full text-xs font-medium ${
//                         course.difficulty === "beginner"
//                           ? "bg-green-100 text-green-700"
//                           : course.difficulty === "intermediate"
//                             ? "bg-yellow-100 text-yellow-700"
//                             : "bg-red-100 text-red-700"
//                       }`}
//                     >
//                       {course.difficulty}
//                     </span>
//                   )}
//                 </div>
//               </div>

//               {/* Price and Action */}
//               <div className="text-right ml-6">
//                 <div className="mb-3">
//                   {course.price === 0 ? (
//                     <span className="text-lg font-bold text-green-600">
//                       Free
//                     </span>
//                   ) : (
//                     <span className="text-lg font-bold text-text-dark">
//                       ${course.price}
//                     </span>
//                   )}
//                 </div>

//                 <Link
//                   to={`/courses/${course.id}`}
//                   className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
//                     isEnrolled
//                       ? "bg-green-100 text-green-700 hover:bg-green-200"
//                       : "bg-primary text-white hover:bg-primary-dark"
//                   }`}
//                 >
//                   {isEnrolled ? (
//                     <>
//                       <CheckCircle className="w-4 h-4 mr-2" />
//                       Continue
//                     </>
//                   ) : (
//                     <>
//                       <Play className="w-4 h-4 mr-2" />
//                       {course.price === 0 ? "Start Free" : "Enroll Now"}
//                     </>
//                   )}
//                 </Link>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   };

//   return (
//     <div className="min-h-screen bg-background-light">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//         {/* Header */}
//         <div className="mb-8">
//           <h1 className="text-3xl font-bold text-text-dark mb-2">
//             Course Catalog
//           </h1>
//           <p className="text-text-light">
//             Discover courses designed to help you master new skills and advance
//             your career
//           </p>
//         </div>

//         {/* Search and Filters */}
//         <div className="bg-white rounded-xl border border-background-dark p-6 mb-8">
//           <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
//             {/* Search */}
//             <div className="lg:col-span-2">
//               <div className="relative">
//                 <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-light" />
//                 <input
//                   type="text"
//                   placeholder="Search courses..."
//                   value={searchTerm}
//                   onChange={(e) => handleSearch(e.target.value)}
//                   className="w-full pl-10 pr-4 py-3 border border-background-dark rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
//                 />
//               </div>
//             </div>

//             {/* Category Filter */}
//             <div>
//               <select
//                 value={selectedCategory}
//                 onChange={(e) => setSelectedCategory(e.target.value)}
//                 className="w-full px-3 py-3 border border-background-dark rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
//               >
//                 <option value="">All Categories</option>
//                 {categories.map((category) => (
//                   <option key={category} value={category}>
//                     {category}
//                   </option>
//                 ))}
//               </select>
//             </div>

//             {/* Difficulty Filter */}
//             <div>
//               <select
//                 value={selectedDifficulty}
//                 onChange={(e) => setSelectedDifficulty(e.target.value)}
//                 className="w-full px-3 py-3 border border-background-dark rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
//               >
//                 <option value="">All Levels</option>
//                 {difficulties.map((difficulty) => (
//                   <option key={difficulty} value={difficulty}>
//                     {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
//                   </option>
//                 ))}
//               </select>
//             </div>
//           </div>

//           {/* Additional Filters */}
//           <div className="flex items-center justify-between mt-4 pt-4 border-t border-background-medium">
//             <div className="flex items-center space-x-4">
//               <label className="flex items-center space-x-2">
//                 <input
//                   type="checkbox"
//                   checked={showFreeOnly}
//                   onChange={(e) => setShowFreeOnly(e.target.checked)}
//                   className="rounded border-background-dark focus:ring-primary/20"
//                 />
//                 <span className="text-sm text-text-medium">
//                   Free courses only
//                 </span>
//               </label>
//             </div>

//             {/* View Mode Toggle */}
//             <div className="flex items-center space-x-2">
//               <button
//                 onClick={() => setViewMode("grid")}
//                 className={`p-2 rounded-lg transition-colors ${
//                   viewMode === "grid"
//                     ? "bg-primary text-white"
//                     : "bg-background-medium text-text-light hover:bg-background-dark"
//                 }`}
//               >
//                 <Grid className="w-5 h-5" />
//               </button>
//               <button
//                 onClick={() => setViewMode("list")}
//                 className={`p-2 rounded-lg transition-colors ${
//                   viewMode === "list"
//                     ? "bg-primary text-white"
//                     : "bg-background-medium text-text-light hover:bg-background-dark"
//                 }`}
//               >
//                 <List className="w-5 h-5" />
//               </button>
//             </div>
//           </div>
//         </div>

//         {/* Results Count */}
//         <div className="flex items-center justify-between mb-6">
//           <p className="text-text-medium">
//             {loading ? "Loading courses..." : `${courses.length} courses found`}
//           </p>
//         </div>

//         {/* Course Grid/List */}
//         {loading ? (
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//             {[...Array(6)].map((_, index) => (
//               <div
//                 key={index}
//                 className="bg-white rounded-xl border border-background-dark overflow-hidden"
//               >
//                 <div className="h-48 bg-background-medium animate-pulse"></div>
//                 <div className="p-6 space-y-4">
//                   <div className="h-4 bg-background-medium rounded animate-pulse"></div>
//                   <div className="h-6 bg-background-medium rounded animate-pulse"></div>
//                   <div className="h-16 bg-background-medium rounded animate-pulse"></div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         ) : courses.length === 0 ? (
//           <div className="text-center py-12">
//             <BookOpen className="w-16 h-16 text-text-light mx-auto mb-4" />
//             <h3 className="text-lg font-medium text-text-dark mb-2">
//               No courses found
//             </h3>
//             <p className="text-text-light">
//               Try adjusting your search criteria or browse all courses
//             </p>
//           </div>
//         ) : (
//           <div
//             className={
//               viewMode === "grid"
//                 ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
//                 : "space-y-4"
//             }
//           >
//             {courses.map((course) =>
//               viewMode === "grid" ? (
//                 <CourseCard key={course.id} course={course} />
//               ) : (
//                 <CourseListItem key={course.id} course={course} />
//               ),
//             )}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }


// src/pages/courses/CourseCatalog.jsx
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  Search, 
  Filter, 
  BookOpen, 
  Clock, 
  Users, 
  Star,
  Play,
  Award,
  TrendingUp,
  Grid,
  List
} from 'lucide-react'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

export default function CourseCatalog() {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedLevel, setSelectedLevel] = useState('all')
  const [sortBy, setSortBy] = useState('popular')
  const [viewMode, setViewMode] = useState('grid') // 'grid' or 'list'

  // Mock course data - in real app, this would come from your database
  const mockCourses = [
    {
      id: '1',
      title: 'Complete React Development Bootcamp',
      description: 'Master React from basics to advanced concepts including hooks, context, and testing.',
      category: 'Technology',
      level: 'Intermediate',
      duration: 180, // minutes
      price: 99,
      rating: 4.8,
      students: 1250,
      instructor: 'Sarah Chen',
      thumbnail: '/api/placeholder/400/225',
      tags: ['React', 'JavaScript', 'Frontend'],
      enrolled: false,
      featured: true
    },
    {
      id: '2',
      title: 'Digital Marketing Fundamentals',
      description: 'Learn the core principles of digital marketing including SEO, social media, and analytics.',
      category: 'Marketing',
      level: 'Beginner',
      duration: 120,
      price: 79,
      rating: 4.6,
      students: 890,
      instructor: 'Mike Rodriguez',
      thumbnail: '/api/placeholder/400/225',
      tags: ['SEO', 'Social Media', 'Analytics'],
      enrolled: true,
      featured: false
    },
    {
      id: '3',
      title: 'Project Management Mastery',
      description: 'Comprehensive guide to project management methodologies and best practices.',
      category: 'Business',
      level: 'Advanced',
      duration: 240,
      price: 129,
      rating: 4.9,
      students: 567,
      instructor: 'Dr. Emily Watson',
      thumbnail: '/api/placeholder/400/225',
      tags: ['Agile', 'Scrum', 'Leadership'],
      enrolled: false,
      featured: true
    },
    {
      id: '4',
      title: 'UX/UI Design Principles',
      description: 'Learn user experience and interface design from industry experts.',
      category: 'Design',
      level: 'Intermediate',
      duration: 200,
      price: 89,
      rating: 4.7,
      students: 723,
      instructor: 'Alex Kim',
      thumbnail: '/api/placeholder/400/225',
      tags: ['UX', 'UI', 'Figma'],
      enrolled: false,
      featured: false
    },
    {
      id: '5',
      title: 'Python for Data Science',
      description: 'Complete Python programming course focused on data analysis and machine learning.',
      category: 'Technology',
      level: 'Beginner',
      duration: 300,
      price: 149,
      rating: 4.8,
      students: 1456,
      instructor: 'Dr. James Park',
      thumbnail: '/api/placeholder/400/225',
      tags: ['Python', 'Data Science', 'ML'],
      enrolled: true,
      featured: true
    },
    {
      id: '6',
      title: 'Financial Planning & Analysis',
      description: 'Master financial planning, budgeting, and analysis for business success.',
      category: 'Finance',
      level: 'Advanced',
      duration: 160,
      price: 119,
      rating: 4.5,
      students: 334,
      instructor: 'Lisa Thompson',
      thumbnail: '/api/placeholder/400/225',
      tags: ['Finance', 'Budgeting', 'Analysis'],
      enrolled: false,
      featured: false
    }
  ]

  const categories = ['all', 'Technology', 'Business', 'Design', 'Marketing', 'Finance']
  const levels = ['all', 'Beginner', 'Intermediate', 'Advanced']

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setCourses(mockCourses)
      setLoading(false)
    }, 1000)
  }, [])

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesCategory = selectedCategory === 'all' || course.category === selectedCategory
    const matchesLevel = selectedLevel === 'all' || course.level === selectedLevel
    
    return matchesSearch && matchesCategory && matchesLevel
  })

  const sortedCourses = [...filteredCourses].sort((a, b) => {
    switch (sortBy) {
      case 'popular':
        return b.students - a.students
      case 'rating':
        return b.rating - a.rating
      case 'price-low':
        return a.price - b.price
      case 'price-high':
        return b.price - a.price
      case 'newest':
        return b.id - a.id // Mock newest
      default:
        return 0
    }
  })

  const CourseCard = ({ course }) => (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 group">
      <div className="relative">
        <div className="w-full h-48 bg-background-medium flex items-center justify-center">
          <BookOpen className="w-16 h-16 text-text-muted" />
        </div>
        {course.featured && (
          <div className="absolute top-3 left-3 bg-warning-default text-white px-2 py-1 rounded-full text-xs font-medium">
            Featured
          </div>
        )}
        {course.enrolled && (
          <div className="absolute top-3 right-3 bg-success-default text-white px-2 py-1 rounded-full text-xs font-medium">
            Enrolled
          </div>
        )}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
          <Button 
            className="opacity-0 group-hover:opacity-100 transition-opacity"
            size="sm"
          >
            <Play className="w-4 h-4 mr-2" />
            Preview
          </Button>
        </div>
      </div>

      <div className="p-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs bg-primary-light text-primary-default px-2 py-1 rounded-full">
            {course.category}
          </span>
          <span className="text-xs text-text-muted">{course.level}</span>
        </div>

        <h3 className="text-lg font-semibold text-text-dark mb-2 line-clamp-2">
          {course.title}
        </h3>
        
        <p className="text-text-light text-sm mb-4 line-clamp-2">
          {course.description}
        </p>

        <div className="flex items-center gap-2 mb-4 text-sm text-text-muted">
          <Clock className="w-4 h-4" />
          <span>{Math.floor(course.duration / 60)}h {course.duration % 60}m</span>
          <Users className="w-4 h-4 ml-2" />
          <span>{course.students.toLocaleString()}</span>
        </div>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-warning-default text-warning-default" />
            <span className="text-sm font-medium">{course.rating}</span>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-text-dark">${course.price}</div>
          </div>
        </div>

        <div className="flex flex-wrap gap-1 mb-4">
          {course.tags.slice(0, 3).map((tag, index) => (
            <span key={index} className="text-xs bg-background-light text-text-medium px-2 py-1 rounded">
              {tag}
            </span>
          ))}
        </div>

        <Link to={`/courses/${course.id}`}>
          <Button className="w-full" variant={course.enrolled ? 'secondary' : 'default'}>
            {course.enrolled ? 'Continue Learning' : 'View Course'}
          </Button>
        </Link>
      </div>
    </Card>
  )

  const CourseListItem = ({ course }) => (
    <Card className="p-6 hover:shadow-md transition-shadow">
      <div className="flex gap-6">
        <div className="w-48 h-32 bg-background-medium rounded-lg flex items-center justify-center flex-shrink-0">
          <BookOpen className="w-12 h-12 text-text-muted" />
        </div>
        
        <div className="flex-1">
          <div className="flex items-start justify-between mb-3">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs bg-primary-light text-primary-default px-2 py-1 rounded-full">
                  {course.category}
                </span>
                <span className="text-xs text-text-muted">{course.level}</span>
                {course.featured && (
                  <span className="text-xs bg-warning-light text-warning-default px-2 py-1 rounded-full">
                    Featured
                  </span>
                )}
              </div>
              <h3 className="text-xl font-semibold text-text-dark mb-2">{course.title}</h3>
              <p className="text-text-light mb-3">{course.description}</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-text-dark">${course.price}</div>
            </div>
          </div>

          <div className="flex items-center gap-6 mb-3 text-sm text-text-muted">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{Math.floor(course.duration / 60)}h {course.duration % 60}m</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>{course.students.toLocaleString()} students</span>
            </div>
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-warning-default text-warning-default" />
              <span>{course.rating}</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex flex-wrap gap-1">
              {course.tags.map((tag, index) => (
                <span key={index} className="text-xs bg-background-light text-text-medium px-2 py-1 rounded">
                  {tag}
                </span>
              ))}
            </div>
            
            <Link to={`/courses/${course.id}`}>
              <Button variant={course.enrolled ? 'secondary' : 'default'}>
                {course.enrolled ? 'Continue Learning' : 'View Course'}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </Card>
  )

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text-dark">Course Catalog</h1>
          <p className="text-text-light mt-1">
            Discover courses to advance your skills and career
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <Grid className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <List className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="text"
              placeholder="Search courses..."
              className="w-full pl-10 pr-4 py-2 border border-background-dark rounded-lg focus:ring-2 focus:ring-primary-default focus:border-primary-default"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Category Filter */}
          <select
            className="px-3 py-2 border border-background-dark rounded-lg focus:ring-2 focus:ring-primary-default focus:border-primary-default"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category === 'all' ? 'All Categories' : category}
              </option>
            ))}
          </select>

          {/* Level Filter */}
          <select
            className="px-3 py-2 border border-background-dark rounded-lg focus:ring-2 focus:ring-primary-default focus:border-primary-default"
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
          >
            {levels.map(level => (
              <option key={level} value={level}>
                {level === 'all' ? 'All Levels' : level}
              </option>
            ))}
          </select>

          {/* Sort */}
          <select
            className="px-3 py-2 border border-background-dark rounded-lg focus:ring-2 focus:ring-primary-default focus:border-primary-default"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="popular">Most Popular</option>
            <option value="rating">Highest Rated</option>
            <option value="newest">Newest</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
          </select>
        </div>
      </Card>

      {/* Results Header */}
      <div className="flex items-center justify-between">
        <p className="text-text-light">
          Showing {sortedCourses.length} of {courses.length} courses
        </p>
        
        {filteredCourses.length !== courses.length && (
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => {
              setSearchTerm('')
              setSelectedCategory('all')
              setSelectedLevel('all')
            }}
          >
            Clear Filters
          </Button>
        )}
      </div>

      {/* Course Grid/List */}
      {sortedCourses.length === 0 ? (
        <Card className="p-12 text-center">
          <BookOpen className="w-16 h-16 text-text-muted mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-text-dark mb-2">No courses found</h3>
          <p className="text-text-light mb-4">
            Try adjusting your search criteria or browse all courses
          </p>
          <Button onClick={() => {
            setSearchTerm('')
            setSelectedCategory('all')
            setSelectedLevel('all')
          }}>
            View All Courses
          </Button>
        </Card>
      ) : (
        <div className={
          viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
            : 'space-y-4'
        }>
          {sortedCourses.map(course => 
            viewMode === 'grid' 
              ? <CourseCard key={course.id} course={course} />
              : <CourseListItem key={course.id} course={course} />
          )}
        </div>
      )}

      {/* Load More */}
      {sortedCourses.length > 0 && (
        <div className="text-center py-8">
          <Button variant="secondary" size="lg">
            Load More Courses
          </Button>
        </div>
      )}
    </div>
  )
}