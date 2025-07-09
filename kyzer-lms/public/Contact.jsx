import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { 
  BookOpen,
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  MessageCircle,
  Users,
  Building,
  HelpCircle,
  ArrowRight,
  CheckCircle
} from 'lucide-react'
import Button from '../../components/ui/Button'
import toast from 'react-hot-toast'

const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  company: z.string().optional(),
  subject: z.string().min(5, 'Subject must be at least 5 characters'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
  inquiryType: z.string().min(1, 'Please select an inquiry type')
})

const Contact = () => {
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(contactSchema)
  })

  const inquiryTypes = [
    { value: 'general', label: 'General Question' },
    { value: 'sales', label: 'Sales Inquiry' },
    { value: 'support', label: 'Technical Support' },
    { value: 'partnership', label: 'Partnership' },
    { value: 'enterprise', label: 'Enterprise Solution' },
    { value: 'feedback', label: 'Feedback' }
  ]

  const contactMethods = [
    {
      icon: Mail,
      title: 'Email Us',
      description: 'Send us a message and we\'ll respond within 24 hours',
      contact: 'hello@kyzer.com',
      link: 'mailto:hello@kyzer.com'
    },
    {
      icon: Phone,
      title: 'Call Us',
      description: 'Speak with our team during business hours',
      contact: '+1 (555) 123-4567',
      link: 'tel:+15551234567'
    },
    {
      icon: MessageCircle,
      title: 'Live Chat',
      description: 'Get instant help through our live chat support',
      contact: 'Available 24/7',
      link: '#'
    }
  ]

  const offices = [
    {
      city: 'San Francisco',
      address: '123 Market Street, Suite 100',
      postal: 'San Francisco, CA 94105',
      phone: '+1 (555) 123-4567',
      email: 'sf@kyzer.com'
    },
    {
      city: 'New York',
      address: '456 Broadway, Floor 15',
      postal: 'New York, NY 10013',
      phone: '+1 (555) 987-6543',
      email: 'ny@kyzer.com'
    },
    {
      city: 'London',
      address: '789 Oxford Street, Suite 200',
      postal: 'London W1C 1JN, UK',
      phone: '+44 20 7123 4567',
      email: 'london@kyzer.com'
    }
  ]

  const supportOptions = [
    {
      icon: HelpCircle,
      title: 'Help Center',
      description: 'Browse our comprehensive knowledge base',
      link: '#'
    },
    {
      icon: Users,
      title: 'Community Forum',
      description: 'Connect with other learners and get help',
      link: '#'
    },
    {
      icon: BookOpen,
      title: 'Documentation',
      description: 'Technical documentation and guides',
      link: '#'
    }
  ]

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      console.log('Contact form submitted:', data)
      setSubmitted(true)
      reset()
      toast.success('Message sent successfully! We\'ll get back to you soon.')
    } catch (error) {
      toast.error('Failed to send message. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="bg-white border-b border-background-dark">
        <div className="container">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center space-x-2">
              <BookOpen className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold text-text-dark">Kyzer LMS</span>
            </Link>
            
            <div className="hidden md:flex items-center space-x-8">
              <Link to="/" className="text-text-medium hover:text-text-dark">Home</Link>
              <Link to="/about" className="text-text-medium hover:text-text-dark">About</Link>
              <Link to="/pricing" className="text-text-medium hover:text-text-dark">Pricing</Link>
              <Link to="/contact" className="text-primary font-medium">Contact</Link>
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
      <section className="bg-gradient-to-br from-primary-light to-background-light py-20">
        <div className="container">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold text-text-dark mb-6">
              Get in Touch
              <span className="text-primary block">We're Here to Help</span>
            </h1>
            <p className="text-xl text-text-medium mb-8">
              Have questions about Kyzer LMS? Need help getting started? 
              Our team is ready to assist you with any inquiries.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="py-20 bg-white">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-text-dark mb-4">
              Multiple Ways to Reach Us
            </h2>
            <p className="text-xl text-text-medium max-w-2xl mx-auto">
              Choose the method that works best for you. We're committed to providing 
              excellent support to all our users.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {contactMethods.map((method, index) => (
              <div key={index} className="card text-center group hover:shadow-lg transition-all">
                <div className="w-16 h-16 bg-primary-light rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary transition-colors">
                  <method.icon className="h-8 w-8 text-primary group-hover:text-white" />
                </div>
                <h3 className="text-xl font-semibold text-text-dark mb-2">{method.title}</h3>
                <p className="text-text-medium mb-4">{method.description}</p>
                <a 
                  href={method.link}
                  className="text-primary font-medium hover:text-primary-dark inline-flex items-center"
                >
                  {method.contact}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              </div>
            ))}
          </div>

          {/* Business Hours */}
          <div className="card max-w-2xl mx-auto">
            <div className="flex items-center justify-center mb-4">
              <Clock className="h-6 w-6 text-primary mr-3" />
              <h3 className="text-xl font-semibold text-text-dark">Business Hours</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-center">
              <div>
                <p className="font-medium text-text-dark">Support Hours</p>
                <p className="text-text-medium">Monday - Friday: 9:00 AM - 6:00 PM PST</p>
                <p className="text-text-medium">Saturday - Sunday: 10:00 AM - 4:00 PM PST</p>
              </div>
              <div>
                <p className="font-medium text-text-dark">Sales Hours</p>
                <p className="text-text-medium">Monday - Friday: 8:00 AM - 8:00 PM PST</p>
                <p className="text-text-medium">Saturday: 10:00 AM - 6:00 PM PST</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form & Info */}
      <section className="py-20 bg-background-light">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div className="card">
              <h2 className="text-2xl font-bold text-text-dark mb-6">Send Us a Message</h2>
              
              {submitted ? (
                <div className="text-center py-8">
                  <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-text-dark mb-2">
                    Message Sent Successfully!
                  </h3>
                  <p className="text-text-medium mb-6">
                    Thank you for contacting us. We'll get back to you within 24 hours.
                  </p>
                  <Button onClick={() => setSubmitted(false)}>
                    Send Another Message
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="label">Name *</label>
                      <input
                        {...register('name')}
                        className={`input ${errors.name ? 'input-error' : ''}`}
                        placeholder="Your full name"
                      />
                      {errors.name && (
                        <p className="error-text">{errors.name.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="label">Email *</label>
                      <input
                        {...register('email')}
                        type="email"
                        className={`input ${errors.email ? 'input-error' : ''}`}
                        placeholder="your@email.com"
                      />
                      {errors.email && (
                        <p className="error-text">{errors.email.message}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="label">Company</label>
                    <input
                      {...register('company')}
                      className="input"
                      placeholder="Your company name (optional)"
                    />
                  </div>

                  <div>
                    <label className="label">Inquiry Type *</label>
                    <select
                      {...register('inquiryType')}
                      className={`input ${errors.inquiryType ? 'input-error' : ''}`}
                    >
                      <option value="">Select inquiry type</option>
                      {inquiryTypes.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                    {errors.inquiryType && (
                      <p className="error-text">{errors.inquiryType.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="label">Subject *</label>
                    <input
                      {...register('subject')}
                      className={`input ${errors.subject ? 'input-error' : ''}`}
                      placeholder="Brief description of your inquiry"
                    />
                    {errors.subject && (
                      <p className="error-text">{errors.subject.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="label">Message *</label>
                    <textarea
                      {...register('message')}
                      rows={5}
                      className={`input ${errors.message ? 'input-error' : ''}`}
                      placeholder="Tell us more about how we can help you..."
                    />
                    {errors.message && (
                      <p className="error-text">{errors.message.message}</p>
                    )}
                  </div>

                  <Button type="submit" loading={loading} className="w-full" size="lg">
                    <Send className="h-5 w-5 mr-2" />
                    Send Message
                  </Button>
                </form>
              )}
            </div>

            {/* Company Info */}
            <div className="space-y-8">
              {/* Office Locations */}
              <div className="card">
                <h3 className="text-xl font-semibold text-text-dark mb-6">Our Offices</h3>
                <div className="space-y-6">
                  {offices.map((office, index) => (
                    <div key={index} className="border-b border-background-light last:border-b-0 pb-4 last:pb-0">
                      <h4 className="font-medium text-text-dark mb-2">{office.city}</h4>
                      <div className="space-y-1 text-sm text-text-medium">
                        <div className="flex items-start">
                          <MapPin className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                          <div>
                            <p>{office.address}</p>
                            <p>{office.postal}</p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <Phone className="h-4 w-4 mr-2" />
                          <a href={`tel:${office.phone}`} className="hover:text-primary">
                            {office.phone}
                          </a>
                        </div>
                        <div className="flex items-center">
                          <Mail className="h-4 w-4 mr-2" />
                          <a href={`mailto:${office.email}`} className="hover:text-primary">
                            {office.email}
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Self-Service Options */}
              <div className="card">
                <h3 className="text-xl font-semibold text-text-dark mb-6">
                  Self-Service Support
                </h3>
                <p className="text-text-medium mb-6">
                  Looking for immediate help? Check out these resources for quick answers.
                </p>
                <div className="space-y-4">
                  {supportOptions.map((option, index) => (
                    <a
                      key={index}
                      href={option.link}
                      className="flex items-center p-3 border border-background-dark rounded-lg hover:bg-background-light transition-colors group"
                    >
                      <div className="w-10 h-10 bg-primary-light rounded-full flex items-center justify-center mr-4 group-hover:bg-primary transition-colors">
                        <option.icon className="h-5 w-5 text-primary group-hover:text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-text-dark">{option.title}</h4>
                        <p className="text-sm text-text-medium">{option.description}</p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-text-light group-hover:text-primary" />
                    </a>
                  ))}
                </div>
              </div>

              {/* Enterprise Contact */}
              <div className="card border-l-4 border-l-primary">
                <div className="flex items-start space-x-4">
                  <Building className="h-8 w-8 text-primary mt-1" />
                  <div>
                    <h3 className="text-xl font-semibold text-text-dark mb-2">
                      Enterprise Solutions
                    </h3>
                    <p className="text-text-medium mb-4">
                      Need a custom solution for your organization? Our enterprise team 
                      specializes in large-scale deployments and custom integrations.
                    </p>
                    <div className="space-y-2">
                      <a 
                        href="mailto:enterprise@kyzer.com"
                        className="flex items-center text-primary hover:text-primary-dark"
                      >
                        <Mail className="h-4 w-4 mr-2" />
                        enterprise@kyzer.com
                      </a>
                      <a 
                        href="tel:+15551234567"
                        className="flex items-center text-primary hover:text-primary-dark"
                      >
                        <Phone className="h-4 w-4 mr-2" />
                        +1 (555) 123-4567 ext. 200
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-20 bg-white">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-text-dark mb-4">Visit Our Headquarters</h2>
            <p className="text-xl text-text-medium">
              Located in the heart of San Francisco
            </p>
          </div>
          
          <div className="card">
            <div className="bg-background-medium h-96 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <MapPin className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-text-dark mb-2">Interactive Map</h3>
                <p className="text-text-medium">
                  123 Market Street, Suite 100<br />
                  San Francisco, CA 94105
                </p>
              </div>
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
                <li><Link to="/courses" className="hover:text-white">Browse Courses</Link></li>
                <li><Link to="/pricing" className="hover:text-white">Pricing</Link></li>
                <li><Link to="#" className="hover:text-white">For Business</Link></li>
                <li><Link to="#" className="hover:text-white">Mobile App</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-3">Company</h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li><Link to="/about" className="hover:text-white">About Us</Link></li>
                <li><Link to="#" className="hover:text-white">Careers</Link></li>
                <li><Link to="#" className="hover:text-white">Press</Link></li>
                <li><Link to="/contact" className="hover:text-white">Contact</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-3">Support</h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li><Link to="#" className="hover:text-white">Help Center</Link></li>
                <li><Link to="#" className="hover:text-white">Community</Link></li>
                <li><Link to="#" className="hover:text-white">Privacy Policy</Link></li>
                <li><Link to="#" className="hover:text-white">Terms of Service</Link></li>
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

export default Contact