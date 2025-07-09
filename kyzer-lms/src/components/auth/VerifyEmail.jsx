import { useState, useEffect } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { BookOpen, CheckCircle, XCircle, RefreshCw, Mail } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import Button from '../../components/ui/Button'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import toast from 'react-hot-toast'

const VerifyEmail = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [status, setStatus] = useState('verifying') // verifying, success, error, expired
  const [loading, setLoading] = useState(true)
  const [resendLoading, setResendLoading] = useState(false)

  const token = searchParams.get('token')
  const type = searchParams.get('type')
  const email = searchParams.get('email')

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token || !type) {
        setStatus('error')
        setLoading(false)
        return
      }

      try {
        if (type === 'signup') {
          const { error } = await supabase.auth.verifyOtp({
            token_hash: token,
            type: 'signup'
          })

          if (error) {
            if (error.message.includes('expired')) {
              setStatus('expired')
            } else {
              setStatus('error')
            }
          } else {
            setStatus('success')
            toast.success('Email verified successfully!')
            // Redirect to dashboard after success
            setTimeout(() => {
              navigate('/dashboard')
            }, 2000)
          }
        } else {
          setStatus('error')
        }
      } catch (error) {
        console.error('Verification error:', error)
        setStatus('error')
      } finally {
        setLoading(false)
      }
    }

    verifyEmail()
  }, [token, type, navigate])

  const handleResendVerification = async () => {
    if (!email) {
      toast.error('Email address not found. Please sign up again.')
      return
    }

    setResendLoading(true)
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email
      })

      if (error) throw error

      toast.success('Verification email sent! Please check your inbox.')
    } catch (error) {
      toast.error('Failed to resend verification email')
      console.error('Resend error:', error)
    } finally {
      setResendLoading(false)
    }
  }

  const renderContent = () => {
    switch (status) {
      case 'verifying':
        return (
          <div className="text-center">
            <LoadingSpinner size="xl" className="mb-6" />
            <h2 className="text-2xl font-bold text-text-dark mb-4">
              Verifying your email...
            </h2>
            <p className="text-text-medium">
              Please wait while we verify your email address.
            </p>
          </div>
        )

      case 'success':
        return (
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-text-dark mb-4">
              Email verified successfully!
            </h2>
            <p className="text-text-medium mb-6">
              Your account has been activated. You'll be redirected to your dashboard shortly.
            </p>
            <Link to="/dashboard">
              <Button>
                Go to Dashboard
              </Button>
            </Link>
          </div>
        )

      case 'expired':
        return (
          <div className="text-center">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <RefreshCw className="h-8 w-8 text-yellow-600" />
            </div>
            <h2 className="text-2xl font-bold text-text-dark mb-4">
              Verification link expired
            </h2>
            <p className="text-text-medium mb-6">
              The verification link has expired. Please request a new one to verify your email address.
            </p>
            <div className="space-y-4">
              <Button
                onClick={handleResendVerification}
                loading={resendLoading}
                className="w-full"
              >
                <Mail className="h-4 w-4 mr-2" />
                Send new verification email
              </Button>
              <Link to="/auth/login">
                <Button variant="ghost" className="w-full">
                  Back to sign in
                </Button>
              </Link>
            </div>
          </div>
        )

      case 'error':
      default:
        return (
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-text-dark mb-4">
              Verification failed
            </h2>
            <p className="text-text-medium mb-6">
              We couldn't verify your email address. The link may be invalid or expired.
            </p>
            <div className="space-y-4">
              {email && (
                <Button
                  onClick={handleResendVerification}
                  loading={resendLoading}
                  className="w-full"
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Send new verification email
                </Button>
              )}
              <Link to="/auth/signup">
                <Button variant="secondary" className="w-full">
                  Sign up again
                </Button>
              </Link>
              <Link to="/auth/login">
                <Button variant="ghost" className="w-full">
                  Already verified? Sign in
                </Button>
              </Link>
            </div>
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen bg-background-light flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center">
            <div className="flex items-center space-x-2">
              <BookOpen className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold text-text-dark">Kyzer LMS</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow p-8">
          {renderContent()}
        </div>

        {/* Help text */}
        <div className="text-center">
          <p className="text-sm text-text-medium">
            Need help?{' '}
            <a href="mailto:support@kyzer.com" className="text-primary hover:text-primary-dark">
              Contact support
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

export default VerifyEmail