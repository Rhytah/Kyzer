// import { useState, useEffect } from "react";
// import { useParams, Link } from "react-router-dom";
// import {
//   Award,
//   Download,
//   Share2,
//   Star,
//   BookOpen,
//   TrendingUp,
//   Target,
//   Clock,
//   Users,
//   ArrowRight,
//   CheckCircle,
//   Trophy,
//   Sparkles,
// } from "lucide-react";
// import Button from "../../components/ui/Button";
// import LoadingSpinner from "../../components/ui/LoadingSpinner";
// import { useAuthStore } from "../../store/authStore";
// import toast from "react-hot-toast";

// const CourseCompletion = () => {
//   const { courseId } = useParams();
//   const { profile } = useAuthStore();
//   const [course, setCourse] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [certificateLoading, setCertificateLoading] = useState(false);
//   const [recommendations, setRecommendations] = useState([]);
//   const [stats, setStats] = useState(null);

//   useEffect(() => {
//     const loadCompletionData = async () => {
//       // Simulate API call
//       await new Promise((resolve) => setTimeout(resolve, 1000));

//       setCourse({
//         id: courseId,
//         title: "Complete React Developer Course",
//         instructor: "John Smith",
//         thumbnail: "/course-placeholder.jpg",
//         completedDate: new Date().toISOString(),
//         totalDuration: 40,
//         totalLessons: 120,
//         certificate: {
//           id: "cert-001",
//           url: "/certificates/react-completion.pdf",
//           issued: new Date().toISOString(),
//         },
//         skills: ["React", "Redux", "TypeScript", "JavaScript", "JSX", "Hooks"],
//       });

//       setStats({
//         timeSpent: 38.5,
//         quizzesPassed: 15,
//         projectsCompleted: 5,
//         averageScore: 87,
//       });

//       setRecommendations([
//         {
//           id: "next-1",
//           title: "Advanced React Patterns",
//           instructor: "John Smith",
//           duration: 25,
//           rating: 4.8,
//           thumbnail: "/course-placeholder.jpg",
//           price: 79.99,
//         },
//         {
//           id: "next-2",
//           title: "Node.js Backend Development",
//           instructor: "Sarah Johnson",
//           duration: 35,
//           rating: 4.7,
//           thumbnail: "/course-placeholder.jpg",
//           price: 89.99,
//         },
//         {
//           id: "next-3",
//           title: "Full Stack React & Node.js",
//           instructor: "Mike Chen",
//           duration: 60,
//           rating: 4.9,
//           thumbnail: "/course-placeholder.jpg",
//           price: 149.99,
//         },
//       ]);

//       setLoading(false);
//     };

//     loadCompletionData();
//   }, [courseId]);

//   const downloadCertificate = async () => {
//     setCertificateLoading(true);
//     try {
//       // Simulate certificate generation/download
//       await new Promise((resolve) => setTimeout(resolve, 2000));

//       // In real app, this would trigger a download
//       const link = document.createElement("a");
//       link.href = course.certificate.url;
//       link.download = `${course.title.replace(/\s+/g, "_")}_Certificate.pdf`;
//       link.click();

//       toast.success("Certificate downloaded successfully!");
//     } catch (error) {
//       toast.error("Failed to download certificate");
//     } finally {
//       setCertificateLoading(false);
//     }
//   };

//   const shareCertificate = async () => {
//     try {
//       if (navigator.share) {
//         await navigator.share({
//           title: `I just completed ${course.title}!`,
//           text: `Check out my certificate for completing ${course.title} on Kyzer LMS`,
//           url: window.location.href,
//         });
//       } else {
//         // Fallback - copy to clipboard
//         await navigator.clipboard.writeText(window.location.href);
//         toast.success("Certificate link copied to clipboard!");
//       }
//     } catch (error) {
//       toast.error("Failed to share certificate");
//     }
//   };

//   const formatDate = (dateString) => {
//     return new Date(dateString).toLocaleDateString("en-US", {
//       year: "numeric",
//       month: "long",
//       day: "numeric",
//     });
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-background-light flex items-center justify-center">
//         <LoadingSpinner size="lg" />
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-primary-light via-background-light to-background-medium">
//       <div className="container py-12">
//         {/* Celebration Header */}
//         <div className="text-center mb-12">
//           <div className="relative inline-block mb-6">
//             <Trophy className="h-20 w-20 text-yellow-500 mx-auto" />
//             <Sparkles className="h-8 w-8 text-yellow-400 absolute -top-2 -right-2 animate-pulse" />
//             <Sparkles className="h-6 w-6 text-yellow-400 absolute -bottom-1 -left-2 animate-pulse" />
//           </div>

//           <h1 className="text-4xl md:text-5xl font-bold text-text-dark mb-4">
//             Congratulations! 🎉
//           </h1>
//           <p className="text-xl text-text-medium mb-2">
//             You've successfully completed
//           </p>
//           <h2 className="text-2xl md:text-3xl font-bold text-primary mb-4">
//             {course.title}
//           </h2>
//           <p className="text-text-medium">
//             Completed on {formatDate(course.completedDate)}
//           </p>
//         </div>

//         <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
//           {/* Certificate Section */}
//           <div className="lg:col-span-2">
//             <div className="card mb-8">
//               <div className="text-center">
//                 <Award className="h-16 w-16 text-primary mx-auto mb-4" />
//                 <h3 className="text-2xl font-bold text-text-dark mb-2">
//                   Your Certificate is Ready!
//                 </h3>
//                 <p className="text-text-medium mb-6">
//                   Share your achievement with the world and add it to your
//                   LinkedIn profile.
//                 </p>

//                 {/* Certificate Preview */}
//                 <div className="bg-gradient-to-br from-primary to-primary-dark p-8 rounded-lg text-white mb-6 max-w-md mx-auto">
//                   <div className="text-center">
//                     <Award className="h-12 w-12 mx-auto mb-4" />
//                     <h4 className="text-lg font-bold mb-2">
//                       Certificate of Completion
//                     </h4>
//                     <p className="text-sm opacity-90 mb-4">
//                       This certifies that
//                     </p>
//                     <p className="text-xl font-bold mb-2">
//                       {profile?.first_name} {profile?.last_name}
//                     </p>
//                     <p className="text-sm opacity-90 mb-4">
//                       has successfully completed
//                     </p>
//                     <p className="font-semibold mb-4">{course.title}</p>
//                     <div className="flex justify-between text-xs opacity-75">
//                       <span>{formatDate(course.certificate.issued)}</span>
//                       <span>Kyzer LMS</span>
//                     </div>
//                   </div>
//                 </div>

//                 <div className="flex flex-col sm:flex-row gap-4 justify-center">
//                   <Button
//                     onClick={downloadCertificate}
//                     loading={certificateLoading}
//                     size="lg"
//                   >
//                     <Download className="h-5 w-5 mr-2" />
//                     Download Certificate
//                   </Button>
//                   <Button
//                     variant="secondary"
//                     onClick={shareCertificate}
//                     size="lg"
//                   >
//                     <Share2 className="h-5 w-5 mr-2" />
//                     Share Achievement
//                   </Button>
//                 </div>
//               </div>
//             </div>

//             {/* Course Stats */}
//             <div className="card">
//               <h3 className="text-xl font-bold text-text-dark mb-6">
//                 Your Learning Journey
//               </h3>
//               <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
//                 <div className="text-center">
//                   <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
//                     <Clock className="h-8 w-8 text-blue-600" />
//                   </div>
//                   <div className="text-2xl font-bold text-text-dark">
//                     {stats.timeSpent}h
//                   </div>
//                   <div className="text-sm text-text-medium">Time Spent</div>
//                 </div>
//                 <div className="text-center">
//                   <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
//                     <CheckCircle className="h-8 w-8 text-green-600" />
//                   </div>
//                   <div className="text-2xl font-bold text-text-dark">
//                     {course.totalLessons}
//                   </div>
//                   <div className="text-sm text-text-medium">
//                     Lessons Completed
//                   </div>
//                 </div>
//                 <div className="text-center">
//                   <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
//                     <Target className="h-8 w-8 text-purple-600" />
//                   </div>
//                   <div className="text-2xl font-bold text-text-dark">
//                     {stats.quizzesPassed}
//                   </div>
//                   <div className="text-sm text-text-medium">Quizzes Passed</div>
//                 </div>
//                 <div className="text-center">
//                   <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-2">
//                     <Star className="h-8 w-8 text-yellow-600" />
//                   </div>
//                   <div className="text-2xl font-bold text-text-dark">
//                     {stats.averageScore}%
//                   </div>
//                   <div className="text-sm text-text-medium">Average Score</div>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Sidebar */}
//           <div className="space-y-6">
//             {/* Skills Earned */}
//             <div className="card">
//               <h3 className="text-lg font-semibold text-text-dark mb-4">
//                 Skills You've Mastered
//               </h3>
//               <div className="flex flex-wrap gap-2">
//                 {course.skills.map((skill, index) => (
//                   <span
//                     key={index}
//                     className="px-3 py-1 bg-primary-light text-primary rounded-full text-sm font-medium"
//                   >
//                     {skill}
//                   </span>
//                 ))}
//               </div>
//             </div>

//             {/* Course Rating */}
//             <div className="card">
//               <h3 className="text-lg font-semibold text-text-dark mb-4">
//                 Rate This Course
//               </h3>
//               <p className="text-text-medium text-sm mb-4">
//                 Help other learners by sharing your experience
//               </p>
//               <div className="flex justify-center space-x-2 mb-4">
//                 {[1, 2, 3, 4, 5].map((rating) => (
//                   <button key={rating} className="p-1">
//                     <Star className="h-6 w-6 text-gray-300 hover:text-yellow-400 transition-colors" />
//                   </button>
//                 ))}
//               </div>
//               <Button variant="secondary" size="sm" className="w-full">
//                 Write a Review
//               </Button>
//             </div>

//             {/* Continue Learning */}
//             <div className="card">
//               <h3 className="text-lg font-semibold text-text-dark mb-4">
//                 Continue Learning
//               </h3>
//               <div className="space-y-4">
//                 <Link to="/my-courses" className="block">
//                   <Button variant="secondary" className="w-full justify-start">
//                     <BookOpen className="h-4 w-4 mr-2" />
//                     View All My Courses
//                   </Button>
//                 </Link>
//                 <Link to="/courses" className="block">
//                   <Button variant="ghost" className="w-full justify-start">
//                     <TrendingUp className="h-4 w-4 mr-2" />
//                     Explore More Courses
//                   </Button>
//                 </Link>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Recommended Courses */}
//         <div className="mt-16">
//           <div className="text-center mb-8">
//             <h2 className="text-3xl font-bold text-text-dark mb-4">
//               Continue Your Learning Journey
//             </h2>
//             <p className="text-xl text-text-medium">
//               Build on your React skills with these recommended courses
//             </p>
//           </div>

//           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
//             {recommendations.map((recommendation) => (
//               <div key={recommendation.id} className="card course-card">
//                 <img
//                   src={recommendation.thumbnail}
//                   alt={recommendation.title}
//                   className="w-full h-40 object-cover rounded-lg mb-4"
//                 />

//                 <h3 className="text-lg font-semibold text-text-dark mb-2">
//                   {recommendation.title}
//                 </h3>

//                 <p className="text-text-medium text-sm mb-3">
//                   by {recommendation.instructor}
//                 </p>

//                 <div className="flex items-center justify-between text-xs text-text-light mb-4">
//                   <div className="flex items-center">
//                     <Clock className="h-3 w-3 mr-1" />
//                     {recommendation.duration}h
//                   </div>
//                   <div className="flex items-center">
//                     <Star className="h-3 w-3 mr-1 fill-yellow-400 text-yellow-400" />
//                     {recommendation.rating}
//                   </div>
//                 </div>

//                 <div className="flex items-center justify-between">
//                   <div className="text-xl font-bold text-text-dark">
//                     ${recommendation.price}
//                   </div>
//                   <Button size="sm">
//                     Enroll Now
//                     <ArrowRight className="h-4 w-4 ml-1" />
//                   </Button>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>

//         {/* Call to Action */}
//         <div className="mt-16 text-center">
//           <div className="card max-w-2xl mx-auto">
//             <h3 className="text-2xl font-bold text-text-dark mb-4">
//               Ready for Your Next Challenge?
//             </h3>
//             <p className="text-text-medium mb-6">
//               Keep the momentum going! Explore our full catalog of courses and
//               continue building your skills.
//             </p>
//             <Link to="/courses">
//               <Button size="lg">
//                 <BookOpen className="h-5 w-5 mr-2" />
//                 Browse All Courses
//               </Button>
//             </Link>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default CourseCompletion;


// src/pages/courses/CourseCompletion.jsx
import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { 
  Award, 
  Download, 
  Share2, 
  Star,
  Clock,
  BookOpen,
  TrendingUp,
  Users,
  ArrowRight,
  CheckCircle,
  Trophy,
  Target,
  Calendar
} from 'lucide-react'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

export default function CourseCompletion() {
  const { courseId } = useParams()
  const [course, setCourse] = useState(null)
  const [completionData, setCompletionData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showConfetti, setShowConfetti] = useState(false)
  const [rating, setRating] = useState(0)
  const [review, setReview] = useState('')
  const [showReviewForm, setShowReviewForm] = useState(false)

  // Mock completion data
  const mockCompletionData = {
    completedAt: new Date().toISOString(),
    totalTimeSpent: 1650, // minutes
    finalScore: 92,
    lessonsCompleted: 45,
    totalLessons: 45,
    quizzesPassed: 8,
    totalQuizzes: 8,
    projectsCompleted: 3,
    certificate: {
      id: 'cert-react-001',
      downloadUrl: '/certificates/react-completion.pdf',
      shareUrl: 'https://kyzer.com/certificates/cert-react-001'
    },
    badges: [
      { id: 1, name: 'React Master', icon: '⚛️', description: 'Completed all React lessons' },
      { id: 2, name: 'Project Builder', icon: '🏗️', description: 'Built 3+ projects' },
      { id: 3, name: 'Quick Learner', icon: '⚡', description: 'Completed course in record time' }
    ],
    skills: [
      { name: 'React Development', level: 'Advanced' },
      { name: 'JavaScript ES6+', level: 'Advanced' },
      { name: 'State Management', level: 'Intermediate' },
      { name: 'Testing', level: 'Intermediate' }
    ]
  }

  const mockCourse = {
    id: courseId,
    title: 'Complete React Development Bootcamp',
    instructor: 'Sarah Chen',
    category: 'Technology',
    level: 'Intermediate',
    rating: 4.8,
    students: 12500,
    description: 'Master React from basics to advanced concepts including hooks, context, and testing.'
  }

  const recommendedCourses = [
    {
      id: 'next-js',
      title: 'Next.js Full Stack Development',
      instructor: 'Mike Johnson',
      rating: 4.9,
      students: 8500,
      duration: 2400,
      thumbnail: '/api/placeholder/300/180'
    },
    {
      id: 'typescript',
      title: 'TypeScript for React Developers',
      instructor: 'Emily Chen',
      rating: 4.7,
      students: 6200,
      duration: 1800,
      thumbnail: '/api/placeholder/300/180'
    },
    {
      id: 'node-js',
      title: 'Node.js Backend Development',
      instructor: 'Alex Rodriguez',
      rating: 4.8,
      students: 9300,
      duration: 2100,
      thumbnail: '/api/placeholder/300/180'
    }
  ]

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setCourse(mockCourse)
      setCompletionData(mockCompletionData)
      setLoading(false)
      setShowConfetti(true)
      
      // Hide confetti after 3 seconds
      setTimeout(() => setShowConfetti(false), 3000)
    }, 1000)
  }, [courseId])

  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
  }

  const handleDownloadCertificate = () => {
    // In real app, this would trigger certificate download
    window.open(completionData.certificate.downloadUrl, '_blank')
  }

  const handleShareCertificate = () => {
    if (navigator.share) {
      navigator.share({
        title: `I completed ${course.title}!`,
        text: `I just completed "${course.title}" on Kyzer LMS and earned my certificate!`,
        url: completionData.certificate.shareUrl
      })
    } else {
      // Fallback to copying link
      navigator.clipboard.writeText(completionData.certificate.shareUrl)
      // Show toast notification
    }
  }

  const submitReview = async () => {
    if (rating === 0) return
    
    // Submit review to backend
    setShowReviewForm(false)
    
    // Show success message
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Confetti Animation */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-transparent">
            {/* Simple confetti simulation */}
            {[...Array(50)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 bg-primary-default rounded-full animate-bounce"
                style={{
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${2 + Math.random() * 2}s`
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Hero Section */}
      <Card className="text-center p-12 bg-gradient-to-br from-success-light to-primary-light">
        <div className="mb-6">
          <Trophy className="w-24 h-24 text-warning-default mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-text-dark mb-4">
            Congratulations! 🎉
          </h1>
          <p className="text-xl text-text-medium mb-2">
            You've successfully completed
          </p>
          <h2 className="text-2xl font-bold text-primary-default">
            {course.title}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto">
          <div className="text-center">
            <div className="text-3xl font-bold text-success-default">{completionData.finalScore}%</div>
            <div className="text-sm text-text-light">Final Score</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary-default">{formatTime(completionData.totalTimeSpent)}</div>
            <div className="text-sm text-text-light">Time Invested</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-warning-default">{completionData.lessonsCompleted}</div>
            <div className="text-sm text-text-light">Lessons Completed</div>
          </div>
        </div>
      </Card>

      {/* Certificate Section */}
      <Card className="p-8">
        <div className="text-center mb-6">
          <Award className="w-16 h-16 text-warning-default mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-text-dark mb-2">Your Certificate is Ready!</h2>
          <p className="text-text-light">
            Download your certificate and share your achievement with the world.
          </p>
        </div>

        <div className="max-w-md mx-auto bg-gradient-to-br from-primary-default to-primary-dark rounded-lg p-8 text-white mb-6">
          <div className="text-center">
            <Award className="w-12 h-12 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Certificate of Completion</h3>
            <p className="text-primary-light mb-4">This certifies that</p>
            <p className="text-2xl font-bold mb-4">John Doe</p>
            <p className="text-primary-light mb-2">has successfully completed</p>
            <p className="font-semibold mb-4">{course.title}</p>
            <p className="text-sm text-primary-light">
              Completed on {new Date(completionData.completedAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button onClick={handleDownloadCertificate} size="lg">
            <Download className="w-5 h-5 mr-2" />
            Download Certificate
          </Button>
          <Button variant="secondary" onClick={handleShareCertificate} size="lg">
            <Share2 className="w-5 h-5 mr-2" />
            Share Certificate
          </Button>
        </div>
      </Card>

      {/* Achievement Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Badges Earned */}
        <Card className="p-6">
          <h3 className="text-xl font-semibold text-text-dark mb-4">Badges Earned</h3>
          <div className="space-y-4">
            {completionData.badges.map((badge) => (
              <div key={badge.id} className="flex items-center gap-4 p-3 bg-background-light rounded-lg">
                <div className="text-3xl">{badge.icon}</div>
                <div>
                  <h4 className="font-semibold text-text-dark">{badge.name}</h4>
                  <p className="text-sm text-text-light">{badge.description}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Skills Acquired */}
        <Card className="p-6">
          <h3 className="text-xl font-semibold text-text-dark mb-4">Skills Acquired</h3>
          <div className="space-y-3">
            {completionData.skills.map((skill, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-text-dark">{skill.name}</span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  skill.level === 'Advanced' ? 'bg-success-light text-success-default' :
                  skill.level === 'Intermediate' ? 'bg-warning-light text-warning-default' :
                  'bg-primary-light text-primary-default'
                }`}>
                  {skill.level}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Course Statistics */}
      <Card className="p-6">
        <h3 className="text-xl font-semibold text-text-dark mb-6">Your Learning Journey</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-success-light rounded-full flex items-center justify-center mx-auto mb-3">
              <CheckCircle className="w-8 h-8 text-success-default" />
            </div>
            <div className="text-2xl font-bold text-text-dark">{completionData.lessonsCompleted}</div>
            <div className="text-sm text-text-light">Lessons Completed</div>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-primary-light rounded-full flex items-center justify-center mx-auto mb-3">
              <Target className="w-8 h-8 text-primary-default" />
            </div>
            <div className="text-2xl font-bold text-text-dark">{completionData.quizzesPassed}</div>
            <div className="text-sm text-text-light">Quizzes Passed</div>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-warning-light rounded-full flex items-center justify-center mx-auto mb-3">
              <BookOpen className="w-8 h-8 text-warning-default" />
            </div>
            <div className="text-2xl font-bold text-text-dark">{completionData.projectsCompleted}</div>
            <div className="text-sm text-text-light">Projects Built</div>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-error-light rounded-full flex items-center justify-center mx-auto mb-3">
              <Clock className="w-8 h-8 text-error-default" />
            </div>
            <div className="text-2xl font-bold text-text-dark">{formatTime(completionData.totalTimeSpent)}</div>
            <div className="text-sm text-text-light">Time Invested</div>
          </div>
        </div>
      </Card>

      {/* Course Review */}
      <Card className="p-6">
        <h3 className="text-xl font-semibold text-text-dark mb-4">Rate This Course</h3>
        {!showReviewForm ? (
          <div className="text-center">
            <p className="text-text-light mb-4">
              Help other students by sharing your experience with this course.
            </p>
            <Button onClick={() => setShowReviewForm(true)}>
              <Star className="w-4 h-4 mr-2" />
              Leave a Review
            </Button>
          </div>
        ) : (
          <div className="max-w-md mx-auto">
            <div className="mb-4">
              <label className="block text-sm font-medium text-text-dark mb-2">
                Your Rating
              </label>
              <div className="flex justify-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className="transition-colors"
                  >
                    <Star 
                      className={`w-8 h-8 ${
                        star <= rating 
                          ? 'fill-warning-default text-warning-default' 
                          : 'text-background-dark hover:text-warning-default'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-text-dark mb-2">
                Your Review (Optional)
              </label>
              <textarea
                className="w-full p-3 border border-background-dark rounded-lg focus:ring-2 focus:ring-primary-default focus:border-primary-default"
                rows={4}
                placeholder="Share your thoughts about this course..."
                value={review}
                onChange={(e) => setReview(e.target.value)}
              />
            </div>
            
            <div className="flex gap-3">
              <Button onClick={submitReview} disabled={rating === 0}>
                Submit Review
              </Button>
              <Button variant="ghost" onClick={() => setShowReviewForm(false)}>
                Cancel
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Recommended Courses */}
      <Card className="p-6">
        <h3 className="text-xl font-semibold text-text-dark mb-6">Continue Your Learning Journey</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {recommendedCourses.map((recommendedCourse) => (
            <div key={recommendedCourse.id} className="border border-background-dark rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="w-full h-32 bg-background-medium rounded-lg flex items-center justify-center mb-4">
                <BookOpen className="w-8 h-8 text-text-muted" />
              </div>
              
              <h4 className="font-semibold text-text-dark mb-2">{recommendedCourse.title}</h4>
              <p className="text-sm text-text-light mb-3">By {recommendedCourse.instructor}</p>
              
              <div className="flex items-center gap-4 text-xs text-text-muted mb-4">
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3 fill-warning-default text-warning-default" />
                  <span>{recommendedCourse.rating}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  <span>{recommendedCourse.students.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{formatTime(recommendedCourse.duration)}</span>
                </div>
              </div>
              
              <Link to={`/courses/${recommendedCourse.id}`}>
                <Button variant="secondary" size="sm" className="w-full">
                  View Course
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </Card>

      {/* Navigation */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link to="/courses/my-courses">
          <Button variant="secondary" size="lg">
            View My Courses
          </Button>
        </Link>
        <Link to="/courses">
          <Button size="lg">
            Browse More Courses
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </Link>
      </div>
    </div>
  )
}