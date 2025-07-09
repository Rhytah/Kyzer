import { Link } from 'react-router-dom'
import { 
  BookOpen, 
  Users, 
  Award, 
  Play,
  CheckCircle,
  Star,
  ArrowRight,
  Clock,
  Target,
  TrendingUp,
  Zap,
  Shield,
  Building
} from 'lucide-react'
import Button from '../../components/ui/Button'

const Home = () => {
  const features = [
    {
      icon: BookOpen,
      title: 'Expert-Led Courses',
      description: 'Learn from industry professionals with real-world experience and proven track records.'
    },
    {
      icon: Clock,
      title: 'Self-Paced Learning',
      description: 'Study at your own pace with 24/7 access to all course materials and resources.'
    },
    {
      icon: Award,
      title: 'Verified Certificates',
      description: 'Earn industry-recognized certificates to showcase your new skills to employers.'
    },
    {
      icon: Users,
      title: 'Community Support',
      description: 'Connect with fellow learners and get help from our active community.'
    },
    {
      icon: Target,
      title: 'Skill Assessments',
      description: 'Test your knowledge with quizzes and projects to track your progress.'
    },
    {
      icon: Zap,
      title: 'Interactive Learning',
      description: 'Engage with hands-on projects and real-world case studies.'
    }
  ]

  const stats = [
    { number: '50,000+', label: 'Active Learners' },
    { number: '200+', label: 'Expert Instructors' },
    { number: '1,000+', label: 'Courses Available' },
    { number: '95%', label: 'Success Rate' }
  ]

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Frontend Developer',
      company: 'Tech Solutions Inc.',
      content: 'The React course completely transformed my career. I went from beginner to landing my dream job in just 6 months.',
      rating: 5,
      avatar: '/avatar-placeholder.jpg'
    },
    {
      name: 'Mike Chen',
      role: 'Data Scientist',
      company: 'Analytics Pro',
      content: 'Outstanding content quality and practical projects. The Python for Data Science course was exactly what I needed.',
      rating: 5,
      avatar: '/avatar-placeholder.jpg'
    },
    {
      name: 'Emily Rodriguez',
      role: 'UX Designer',
      company: 'Design Studio',
      content: 'The design courses are incredibly detailed and practical. I learned more here than in my entire college program.',
      rating: 5,
      avatar: '/avatar-placeholder.jpg'
    }
  ]

  const popularCourses = [
    {
      title: 'Complete React Developer Course',
      instructor: 'John Smith',
      rating: 4.8,
      students: 15234,
      price: 89.99,
      image: '/course-placeholder.jpg'
    },
    {
      title: 'Python for Data Science',
      instructor: 'Dr. Emily Rodriguez',
      rating: 4.9,
      students: 12678,
      price: 99.99,
      image: '/course-placeholder.jpg'
    },
    {
      title: 'UI/UX Design Fundamentals',
      instructor: 'Mike Chen',
      rating: 4.7,
      students: 8921,
      price: 69.99,
      image: '/course-placeholder.jpg'
    }
  ]

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="bg-white border-b border-background-dark">
        <div className="container">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <BookOpen className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold text-text-dark">Kyzer LMS</span>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-text-medium hover:text-text-dark">Features</a>
              <a href="#courses" className="text-text-medium hover:text-text-dark">Courses</a>
              <a href="#pricing" className="text-text-medium hover:text-text-dark">Pricing</a>
              <a href="#contact" className="text-text-medium hover:text-text-dark">Contact</a>
            </div>

            <div className="flex items-center space-x-4">
              <Link to="/auth/login">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link to="/auth/signup">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-light via-background-light to-background-medium py-20">
        <div className="container">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold text-text-dark mb-6">
              Master New Skills with
              <span className="text-primary block">Expert-Led Courses</span>
            </h1>
            <p className="text-xl text-text-medium mb-8 max-w-2xl mx-auto">
              Join thousands of learners advancing their careers with our comprehensive online courses. 
              Learn at your own pace, earn certificates, and unlock new opportunities.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Link to="/auth/signup">
                <Button size="lg" className="w-full sm:w-auto">
                  Start Learning Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/courses">
                <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                  <Play className="mr-2 h-5 w-5" />
                  Browse Courses
                </Button>
              </Link>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-2xl md:text-3xl font-bold text-primary">{stat.number}</div>
                  <div className="text-text-medium text-sm">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-text-dark mb-4">
              Why Choose Kyzer LMS?
            </h2>
            <p className="text-xl text-text-medium max-w-2xl mx-auto">
              We provide everything you need to succeed in your learning journey
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center group">
                <div className="w-16 h-16 bg-primary-light rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary transition-colors">
                  <feature.icon className="h-8 w-8 text-primary group-hover:text-white" />
                </div>
                <h3 className="text-xl font-semibold text-text-dark mb-2">{feature.title}</h3>
                <p className="text-text-medium">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Courses */}
      <section id="courses" className="py-20 bg-background-light">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-text-dark mb-4">
              Popular Courses
            </h2>
            <p className="text-xl text-text-medium max-w-2xl mx-auto">
              Start with our most loved and highly-rated courses
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {popularCourses.map((course, index) => (
              <div key={index} className="card course-card">
                <img
                  src={course.image}
                  alt={course.title}
                  className="w-full h-40 object-cover rounded-lg mb-4"
                />
                <h3 className="text-lg font-semibold text-text-dark mb-2">
                  {course.title}
                </h3>
                <p className="text-text-medium text-sm mb-3">
                  by {course.instructor}
                </p>
                <div className="flex items-center justify-between text-sm text-text-light mb-4">
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                    {course.rating}
                  </div>
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-1" />
                    {course.students.toLocaleString()}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-text-dark">${course.price}</span>
                  <Button size="sm">Enroll Now</Button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center">
            <Link to="/courses">
              <Button variant="secondary" size="lg">
                View All Courses
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-text-dark mb-4">
              What Our Students Say
            </h2>
            <p className="text-xl text-text-medium max-w-2xl mx-auto">
              Join thousands of successful learners who transformed their careers
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="card">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                  ))}
                </div>
                <blockquote className="text-text-medium mb-4">
                  "{testimonial.content}"
                </blockquote>
                <div className="flex items-center">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-10 h-10 rounded-full mr-3"
                  />
                  <div>
                    <div className="font-medium text-text-dark">{testimonial.name}</div>
                    <div className="text-sm text-text-light">
                      {testimonial.role} at {testimonial.company}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Corporate Section */}
      <section className="py-20 bg-primary text-white">
        <div className="container">
          <div className="text-center max-w-4xl mx-auto">
            <Building className="h-16 w-16 mx-auto mb-6 opacity-80" />
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Enterprise Learning Solutions
            </h2>
            <p className="text-xl opacity-90 mb-8">
              Empower your team with our comprehensive corporate training programs. 
              Manage up to 200 employees with advanced reporting and progress tracking.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="secondary" size="lg">
                <Shield className="mr-2 h-5 w-5" />
                Learn More
              </Button>
              <Button variant="ghost" size="lg" className="text-white border-white hover:bg-white hover:text-primary">
                Request Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-background-light">
        <div className="container">
          <div className="text-center max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-text-dark mb-4">
              Ready to Start Learning?
            </h2>
            <p className="text-xl text-text-medium mb-8">
              Join thousands of learners and start your journey today. 
              First course is free, no credit card required.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/auth/signup">
                <Button size="lg" className="w-full sm:w-auto">
                  <TrendingUp className="mr-2 h-5 w-5" />
                  Start Learning Now
                </Button>
              </Link>
              <Link to="/courses">
                <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                  Browse Courses
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-text-dark text-white py-12">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <BookOpen className="h-6 w-6" />
                <span className="text-lg font-bold">Kyzer LMS</span>
              </div>
              <p className="text-gray-300 text-sm">
                Empowering learners worldwide with quality education and practical skills.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-3">Platform</h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li><a href="#" className="hover:text-white">Browse Courses</a></li>
                <li><a href="#" className="hover:text-white">For Business</a></li>
                <li><a href="#" className="hover:text-white">Mobile App</a></li>
                <li><a href="#" className="hover:text-white">Certificates</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-3">Support</h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li><a href="#" className="hover:text-white">Help Center</a></li>
                <li><a href="#" className="hover:text-white">Contact Us</a></li>
                <li><a href="#" className="hover:text-white">Community</a></li>
                <li><a href="#" className="hover:text-white">System Status</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-3">Company</h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li><a href="#" className="hover:text-white">About Us</a></li>
                <li><a href="#" className="hover:text-white">Careers</a></li>
                <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-sm text-gray-300">
            <p>&copy; 2024 Kyzer LMS. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Home