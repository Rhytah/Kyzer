// import { Link } from "react-router-dom";
// import {
//   BookOpen,
//   Users,
//   Award,
//   Play,
//   CheckCircle,
//   Star,
//   ArrowRight,
//   Clock,
//   Target,
//   TrendingUp,
//   Zap,
//   Shield,
//   Building,
// } from "lucide-react";
// import Button from "../../components/ui/Button";
// import kyzerLogo from "../../assets/images/Kyzerlogo.png";

// const Home = () => {
//   const features = [
//     {
//       icon: BookOpen,
//       title: "Expert-Led Courses",
//       description:
//         "Learn from industry professionals with real-world experience and proven track records.",
//     },
//     {
//       icon: Clock,
//       title: "Self-Paced Learning",
//       description:
//         "Study at your own pace with 24/7 access to all course materials and resources.",
//     },
//     {
//       icon: Award,
//       title: "Verified Certificates",
//       description:
//         "Earn industry-recognized certificates to showcase your new skills to employers.",
//     },
//     {
//       icon: Users,
//       title: "Community Support",
//       description:
//         "Connect with fellow learners and get help from our active community.",
//     },
//     {
//       icon: Target,
//       title: "Skill Assessments",
//       description:
//         "Test your knowledge with quizzes and projects to track your progress.",
//     },
//     {
//       icon: Zap,
//       title: "Interactive Learning",
//       description: "Engage with hands-on projects and real-world case studies.",
//     },
//   ];

//   const stats = [
//     { number: "50,000+", label: "Active Learners" },
//     { number: "200+", label: "Expert Instructors" },
//     { number: "1,000+", label: "Courses Available" },
//     { number: "95%", label: "Success Rate" },
//   ];

//   const testimonials = [
//     {
//       name: "Sarah Johnson",
//       role: "Frontend Developer",
//       company: "Tech Solutions Inc.",
//       content:
//         "The React course completely transformed my career. I went from beginner to landing my dream job in just 6 months.",
//       rating: 5,
//       avatar: "/avatar-placeholder.jpg",
//     },
//     {
//       name: "Mike Chen",
//       role: "Data Scientist",
//       company: "Analytics Pro",
//       content:
//         "Outstanding content quality and practical projects. The Python for Data Science course was exactly what I needed.",
//       rating: 5,
//       avatar: "/avatar-placeholder.jpg",
//     },
//     {
//       name: "Emily Rodriguez",
//       role: "UX Designer",
//       company: "Design Studio",
//       content:
//         "The design courses are incredibly detailed and practical. I learned more here than in my entire college program.",
//       rating: 5,
//       avatar: "/avatar-placeholder.jpg",
//     },
//   ];

//   const popularCourses = [
//     {
//       title: "Complete React Developer Course",
//       instructor: "John Smith",
//       rating: 4.8,
//       students: 15234,
//       price: 89.99,
//       image: "/course-placeholder.jpg",
//     },
//     {
//       title: "Python for Data Science",
//       instructor: "Dr. Emily Rodriguez",
//       rating: 4.9,
//       students: 12678,
//       price: 99.99,
//       image: "/course-placeholder.jpg",
//     },
//     {
//       title: "UI/UX Design Fundamentals",
//       instructor: "Mike Chen",
//       rating: 4.7,
//       students: 8921,
//       price: 69.99,
//       image: "/course-placeholder.jpg",
//     },
//   ];

//   return (
//     <div className="min-h-screen">
//       {/* Navigation */}
//       <nav className="bg-white border-b border-background-dark">
//         <div className="container">
//           <div className="flex items-center justify-between h-16">
//             <div className="flex items-center space-x-2">
//                <div className="flex justify-center mb-6">
//               <img src={kyzerLogo} alt="Kyzer Logo" className="h-8 ml-2" />
//             </div>
//             </div>

//             <div className="hidden md:flex items-center space-x-8">
//               <a
//                 href="#features"
//                 className="text-text-medium hover:text-text-dark"
//               >
//                 Features
//               </a>
//               <a
//                 href="#courses"
//                 className="text-text-medium hover:text-text-dark"
//               >
//                 Courses
//               </a>
//               <a
//                 href="#pricing"
//                 className="text-text-medium hover:text-text-dark"
//               >
//                 Pricing
//               </a>
//               <a
//                 href="#contact"
//                 className="text-text-medium hover:text-text-dark"
//               >
//                 Contact
//               </a>
//             </div>

//             <div className="flex items-center space-x-4">
//               <Link to="/login">
//                 <Button variant="ghost">Sign In</Button>
//               </Link>
//               <Link to="/signup">
//                 <Button>Get Started</Button>
//               </Link>
//             </div>
//           </div>
//         </div>
//       </nav>

//       {/* Hero Section */}
//       <section className="bg-gradient-to-br from-primary-light via-background-light to-background-medium py-20">
//         <div className="container">
//           <div className="text-center max-w-4xl mx-auto">
//             <h1 className="text-5xl md:text-6xl font-bold text-text-dark mb-6">
//               Master New Skills with
//               <span className="text-primary block">Expert-Led Courses</span>
//             </h1>
//             <p className="text-xl text-text-medium mb-8 max-w-2xl mx-auto">
//               Join thousands of learners advancing their careers with our
//               comprehensive online courses. Learn at your own pace, earn
//               certificates, and unlock new opportunities.
//             </p>
//             <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
//               <Link to="/signup">
//                 <Button size="lg" className="w-full sm:w-auto">
//                   Start Learning Free
//                   <ArrowRight className="ml-2 h-5 w-5" />
//                 </Button>
//               </Link>
//               <Link to="/courses">
//                 <Button
//                   variant="secondary"
//                   size="lg"
//                   className="w-full sm:w-auto"
//                 >
//                   <Play className="mr-2 h-5 w-5" />
//                   Browse Courses
//                 </Button>
//               </Link>
//             </div>

//             {/* Stats */}
//             <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
//               {stats.map((stat, index) => (
//                 <div key={index} className="text-center">
//                   <div className="text-2xl md:text-3xl font-bold text-primary">
//                     {stat.number}
//                   </div>
//                   <div className="text-text-medium text-sm">{stat.label}</div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* Features Section */}
//       <section id="features" className="py-20 bg-white">
//         <div className="container">
//           <div className="text-center mb-16">
//             <h2 className="text-3xl md:text-4xl font-bold text-text-dark mb-4">
//               Why Choose Kyzer LMS?
//             </h2>
//             <p className="text-xl text-text-medium max-w-2xl mx-auto">
//               We provide everything you need to succeed in your learning journey
//             </p>
//           </div>

//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
//             {features.map((feature, index) => (
//               <div key={index} className="text-center group">
//                 <div className="w-16 h-16 bg-primary-light rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary transition-colors">
//                   <feature.icon className="h-8 w-8 text-primary group-hover:text-white" />
//                 </div>
//                 <h3 className="text-xl font-semibold text-text-dark mb-2">
//                   {feature.title}
//                 </h3>
//                 <p className="text-text-medium">{feature.description}</p>
//               </div>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* Popular Courses */}
//       <section id="courses" className="py-20 bg-background-light">
//         <div className="container">
//           <div className="text-center mb-16">
//             <h2 className="text-3xl md:text-4xl font-bold text-text-dark mb-4">
//               Popular Courses
//             </h2>
//             <p className="text-xl text-text-medium max-w-2xl mx-auto">
//               Start with our most loved and highly-rated courses
//             </p>
//           </div>

//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
//             {popularCourses.map((course, index) => (
//               <div key={index} className="card course-card">
//                 <img
//                   src={course.image}
//                   alt={course.title}
//                   className="w-full h-40 object-cover rounded-lg mb-4"
//                 />
//                 <h3 className="text-lg font-semibold text-text-dark mb-2">
//                   {course.title}
//                 </h3>
//                 <p className="text-text-medium text-sm mb-3">
//                   by {course.instructor}
//                 </p>
//                 <div className="flex items-center justify-between text-sm text-text-light mb-4">
//                   <div className="flex items-center">
//                     <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
//                     {course.rating}
//                   </div>
//                   <div className="flex items-center">
//                     <Users className="h-4 w-4 mr-1" />
//                     {course.students.toLocaleString()}
//                   </div>
//                 </div>
//                 <div className="flex items-center justify-between">
//                   <span className="text-2xl font-bold text-text-dark">
//                     ${course.price}
//                   </span>
//                   <Button size="sm">Enroll Now</Button>
//                 </div>
//               </div>
//             ))}
//           </div>

//           <div className="text-center">
//             <Link to="/courses">
//               <Button variant="secondary" size="lg">
//                 View All Courses
//                 <ArrowRight className="ml-2 h-5 w-5" />
//               </Button>
//             </Link>
//           </div>
//         </div>
//       </section>

//       {/* Testimonials */}
//       <section className="py-20 bg-white">
//         <div className="container">
//           <div className="text-center mb-16">
//             <h2 className="text-3xl md:text-4xl font-bold text-text-dark mb-4">
//               What Our Students Say
//             </h2>
//             <p className="text-xl text-text-medium max-w-2xl mx-auto">
//               Join thousands of successful learners who transformed their
//               careers
//             </p>
//           </div>

//           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
//             {testimonials.map((testimonial, index) => (
//               <div key={index} className="card">
//                 <div className="flex items-center mb-4">
//                   {[...Array(testimonial.rating)].map((_, i) => (
//                     <Star
//                       key={i}
//                       className="h-4 w-4 text-yellow-400 fill-current"
//                     />
//                   ))}
//                 </div>
//                 <blockquote className="text-text-medium mb-4">
//                   "{testimonial.content}"
//                 </blockquote>
//                 <div className="flex items-center">
//                   <img
//                     src={testimonial.avatar}
//                     alt={testimonial.name}
//                     className="w-10 h-10 rounded-full mr-3"
//                   />
//                   <div>
//                     <div className="font-medium text-text-dark">
//                       {testimonial.name}
//                     </div>
//                     <div className="text-sm text-text-light">
//                       {testimonial.role} at {testimonial.company}
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* Corporate Section */}
//       <section className="py-20 bg-primary text-white">
//         <div className="container">
//           <div className="text-center max-w-4xl mx-auto">
//             <Building className="h-16 w-16 mx-auto mb-6 opacity-80" />
//             <h2 className="text-3xl md:text-4xl font-bold mb-4">
//               Enterprise Learning Solutions
//             </h2>
//             <p className="text-xl opacity-90 mb-8">
//               Empower your team with our comprehensive corporate training
//               programs. Manage up to 200 employees with advanced reporting and
//               progress tracking.
//             </p>
//             <div className="flex flex-col sm:flex-row gap-4 justify-center">
//               <Button variant="secondary" size="lg">
//                 <Shield className="mr-2 h-5 w-5" />
//                 Learn More
//               </Button>
//               <Button
//                 variant="ghost"
//                 size="lg"
//                 className="text-white border-white hover:bg-white hover:text-primary"
//               >
//                 Request Demo
//               </Button>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* CTA Section */}
//       <section className="py-20 bg-background-light">
//         <div className="container">
//           <div className="text-center max-w-4xl mx-auto">
//             <h2 className="text-3xl md:text-4xl font-bold text-text-dark mb-4">
//               Ready to Start Learning?
//             </h2>
//             <p className="text-xl text-text-medium mb-8">
//               Join thousands of learners and start your journey today. First
//               course is free, no credit card required.
//             </p>
//             <div className="flex flex-col sm:flex-row gap-4 justify-center">
//               <Link to="/auth/signup">
//                 <Button size="lg" className="w-full sm:w-auto">
//                   <TrendingUp className="mr-2 h-5 w-5" />
//                   Start Learning Now
//                 </Button>
//               </Link>
//               <Link to="/courses">
//                 <Button
//                   variant="secondary"
//                   size="lg"
//                   className="w-full sm:w-auto"
//                 >
//                   Browse Courses
//                 </Button>
//               </Link>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* Footer */}
//       <footer className="bg-text-dark text-white py-12">
//         <div className="container">
//           <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
//             <div>
//               <div className="flex items-center space-x-2 mb-4">
//                 <BookOpen className="h-6 w-6" />
//                 <span className="text-lg font-bold">Kyzer LMS</span>
//               </div>
//               <p className="text-gray-300 text-sm">
//                 Empowering learners worldwide with quality education and
//                 practical skills.
//               </p>
//             </div>

//             <div>
//               <h4 className="font-semibold mb-3">Platform</h4>
//               <ul className="space-y-2 text-sm text-gray-300">
//                 <li>
//                   <a href="#" className="hover:text-white">
//                     Browse Courses
//                   </a>
//                 </li>
//                 <li>
//                   <a href="#" className="hover:text-white">
//                     For Business
//                   </a>
//                 </li>
//                 <li>
//                   <a href="#" className="hover:text-white">
//                     Mobile App
//                   </a>
//                 </li>
//                 <li>
//                   <a href="#" className="hover:text-white">
//                     Certificates
//                   </a>
//                 </li>
//               </ul>
//             </div>

//             <div>
//               <h4 className="font-semibold mb-3">Support</h4>
//               <ul className="space-y-2 text-sm text-gray-300">
//                 <li>
//                   <a href="#" className="hover:text-white">
//                     Help Center
//                   </a>
//                 </li>
//                 <li>
//                   <a href="#" className="hover:text-white">
//                     Contact Us
//                   </a>
//                 </li>
//                 <li>
//                   <a href="#" className="hover:text-white">
//                     Community
//                   </a>
//                 </li>
//                 <li>
//                   <a href="#" className="hover:text-white">
//                     System Status
//                   </a>
//                 </li>
//               </ul>
//             </div>

//             <div>
//               <h4 className="font-semibold mb-3">Company</h4>
//               <ul className="space-y-2 text-sm text-gray-300">
//                 <li>
//                   <a href="#" className="hover:text-white">
//                     About Us
//                   </a>
//                 </li>
//                 <li>
//                   <a href="#" className="hover:text-white">
//                     Careers
//                   </a>
//                 </li>
//                 <li>
//                   <a href="#" className="hover:text-white">
//                     Privacy Policy
//                   </a>
//                 </li>
//                 <li>
//                   <a href="#" className="hover:text-white">
//                     Terms of Service
//                   </a>
//                 </li>
//               </ul>
//             </div>
//           </div>

//           <div className="border-t border-gray-700 mt-8 pt-8 text-center text-sm text-gray-300">
//             <p>&copy; 2024 Kyzer LMS. All rights reserved.</p>
//           </div>
//         </div>
//       </footer>
//     </div>
//   );
// };

// export default Home;

// src/pages/public/Home.jsx
import { Link } from 'react-router-dom'
import { 
  ArrowRight, 
  Play,
  Users,
  BookOpen,
  Award,
  TrendingUp,
  CheckCircle,
  Star,
  Building2,
  Globe,
  Shield,
  Zap
} from 'lucide-react'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'

export default function Home() {
  const features = [
    {
      icon: BookOpen,
      title: "Rich Course Catalog",
      description: "Access thousands of courses across technology, business, design, and more with new content added weekly."
    },
    {
      icon: TrendingUp,
      title: "Advanced Analytics",
      description: "Track progress, measure engagement, and gain insights into learning patterns with comprehensive reporting."
    },
    {
      icon: Users,
      title: "Corporate Management",
      description: "Manage teams, assign mandatory courses, and track organizational learning goals with powerful admin tools."
    },
    {
      icon: Award,
      title: "Certification System",
      description: "Earn recognized certificates and badges that showcase your achievements and newly acquired skills."
    },
    {
      icon: Globe,
      title: "Mobile Learning",
      description: "Learn anywhere, anytime with our responsive platform and offline course downloads."
    },
    {
      icon: Shield,
      title: "Enterprise Security",
      description: "Bank-grade security with SSO integration, compliance features, and data protection guarantees."
    }
  ]

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Learning & Development Manager",
      company: "TechCorp Inc.",
      avatar: "👩‍💼",
      content: "Kyzer LMS transformed our training program. Employee engagement increased by 300% and we can finally track real learning outcomes.",
      rating: 5
    },
    {
      name: "Michael Chen",
      role: "Senior Developer",
      company: "StartupXYZ",
      avatar: "👨‍💻",
      content: "The courses are practical and up-to-date. I've learned more in 3 months than in my previous year of scattered online learning.",
      rating: 5
    },
    {
      name: "Emily Rodriguez",
      role: "HR Director",
      company: "Global Solutions",
      avatar: "👩‍🎓",
      content: "Managing 500+ employees' learning paths used to be a nightmare. Now it's seamless with automated reporting and progress tracking.",
      rating: 5
    }
  ]

  const stats = [
    { number: "50K+", label: "Active Learners" },
    { number: "1000+", label: "Expert-Led Courses" },
    { number: "500+", label: "Companies Trust Us" },
    { number: "98%", label: "Satisfaction Rate" }
  ]

  const useCases = [
    {
      icon: Users,
      title: "Individual Professionals",
      description: "Advance your career with personalized learning paths, skill assessments, and industry-recognized certifications.",
      features: ["Personalized recommendations", "Skill gap analysis", "Career coaching", "Portfolio building"]
    },
    {
      icon: Building2,
      title: "Growing Teams",
      description: "Scale your team's capabilities with collaborative learning, team challenges, and shared knowledge bases.",
      features: ["Team progress tracking", "Collaborative projects", "Peer learning", "Skills matrix mapping"]
    },
    {
      icon: Globe,
      title: "Large Enterprises",
      description: "Deploy organization-wide training with compliance tracking, custom content, and advanced reporting.",
      features: ["Custom integrations", "Compliance management", "Advanced analytics", "Multi-tenant architecture"]
    }
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-dark via-primary-default to-text-dark text-white py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
                Transform Learning Into
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-green-200">
                  {" "}Growth
                </span>
              </h1>
              <p className="text-xl text-gray-200 mb-8 leading-relaxed">
                Empower your team with the most comprehensive learning management system. 
                From individual skill building to enterprise-wide training programs.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Link to="/signup">
                  <Button size="lg" className="bg-white text-primary-default hover:bg-gray-100">
                    Start Free Trial
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <Button variant="ghost" size="lg" className="text-white border-white hover:bg-white hover:text-primary-default">
                  <Play className="w-5 h-5 mr-2" />
                  Watch Demo
                </Button>
              </div>

              <div className="flex items-center gap-6 text-sm text-gray-300">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span>Free 14-day trial</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span>Cancel anytime</span>
                </div>
              </div>
            </div>

            {/* Hero Image/Visual */}
            <div className="relative">
              <div className="relative bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                <div className="grid grid-cols-2 gap-4">
                  <Card className="p-4 bg-white/90">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 bg-success-light rounded-full flex items-center justify-center">
                        <TrendingUp className="w-4 h-4 text-success-default" />
                      </div>
                      <div>
                        <div className="text-xs text-text-muted">Progress</div>
                        <div className="font-semibold text-text-dark">85%</div>
                      </div>
                    </div>
                    <div className="w-full bg-background-medium rounded-full h-2">
                      <div className="bg-success-default h-2 rounded-full" style={{width: '85%'}}></div>
                    </div>
                  </Card>

                  <Card className="p-4 bg-white/90">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 bg-primary-light rounded-full flex items-center justify-center">
                        <Award className="w-4 h-4 text-primary-default" />
                      </div>
                      <div>
                        <div className="text-xs text-text-muted">Certificates</div>
                        <div className="font-semibold text-text-dark">12</div>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-4 bg-white/90 col-span-2">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-warning-light rounded-full flex items-center justify-center">
                        <BookOpen className="w-4 h-4 text-warning-default" />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-text-dark">React Development</div>
                        <div className="text-xs text-text-muted">Next lesson: Advanced Hooks</div>
                      </div>
                      <div className="text-xs text-success-default font-medium">In Progress</div>
                    </div>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-background-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl font-bold text-primary-default mb-2">{stat.number}</div>
                <div className="text-text-light">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-text-dark mb-4">
              Everything You Need to Scale Learning
            </h2>
            <p className="text-xl text-text-light max-w-3xl mx-auto">
              From individual growth to enterprise-wide training programs, we've got every learning scenario covered.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <Card key={index} className="p-8 text-center hover:shadow-lg transition-shadow">
                  <div className="w-16 h-16 bg-primary-light rounded-full flex items-center justify-center mx-auto mb-6">
                    <Icon className="w-8 h-8 text-primary-default" />
                  </div>
                  <h3 className="text-xl font-semibold text-text-dark mb-4">{feature.title}</h3>
                  <p className="text-text-light">{feature.description}</p>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-20 bg-background-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-text-dark mb-4">
              Built for Every Learning Journey
            </h2>
            <p className="text-xl text-text-light max-w-3xl mx-auto">
              Whether you're an individual looking to grow or an organization scaling globally, 
              we have the perfect solution for your needs.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {useCases.map((useCase, index) => {
              const Icon = useCase.icon
              return (
                <Card key={index} className="p-8">
                  <div className="w-12 h-12 bg-primary-light rounded-lg flex items-center justify-center mb-6">
                    <Icon className="w-6 h-6 text-primary-default" />
                  </div>
                  <h3 className="text-xl font-semibold text-text-dark mb-4">{useCase.title}</h3>
                  <p className="text-text-light mb-6">{useCase.description}</p>
                  <ul className="space-y-2">
                    {useCase.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center gap-3">
                        <CheckCircle className="w-4 h-4 text-success-default flex-shrink-0" />
                        <span className="text-text-dark text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-text-dark mb-4">
              Loved by Learners and Leaders
            </h2>
            <p className="text-xl text-text-light max-w-3xl mx-auto">
              See why thousands of professionals and hundreds of organizations choose Kyzer LMS
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="p-8">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, starIndex) => (
                    <Star key={starIndex} className="w-4 h-4 fill-warning-default text-warning-default" />
                  ))}
                </div>
                <p className="text-text-dark mb-6 italic">"{testimonial.content}"</p>
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{testimonial.avatar}</div>
                  <div>
                    <div className="font-semibold text-text-dark">{testimonial.name}</div>
                    <div className="text-sm text-text-light">{testimonial.role}</div>
                    <div className="text-sm text-primary-default">{testimonial.company}</div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Integration Section */}
      <section className="py-20 bg-background-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-text-dark mb-4">
            Seamlessly Integrates With Your Workflow
          </h2>
          <p className="text-xl text-text-light mb-12 max-w-3xl mx-auto">
            Connect with the tools your team already uses and loves
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 items-center justify-items-center">
            {['Slack', 'Microsoft Teams', 'Google Workspace', 'Zoom', 'Salesforce', 'HubSpot'].map((integration, index) => (
              <Card key={index} className="w-24 h-24 flex items-center justify-center hover:shadow-md transition-shadow">
                <div className="text-sm font-medium text-text-muted">{integration}</div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-default to-primary-dark text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Transform Your Learning?
          </h2>
          <p className="text-xl text-gray-200 mb-8">
            Join thousands of professionals and organizations who are already growing with Kyzer LMS
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Link to="/signup">
              <Button size="lg" className="bg-white text-primary-default hover:bg-gray-100">
                Start Free Trial
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link to="/contact">
              <Button variant="ghost" size="lg" className="text-white border-white hover:bg-white hover:text-primary-default">
                Schedule Demo
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
            <div className="flex items-center justify-center gap-2">
              <Zap className="w-4 h-4" />
              <span>Setup in minutes</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <Shield className="w-4 h-4" />
              <span>Enterprise-grade security</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <Users className="w-4 h-4" />
              <span>24/7 support included</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}