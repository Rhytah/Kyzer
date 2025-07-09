// src/pages/auth/VerifyEmail.jsx
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, CheckCircle, RefreshCw, ArrowLeft } from 'lucide-react'
import { useAuth } from '@/hooks/auth/useAuth'
import toast from 'react-hot-toast'

export default function VerifyEmail() {
  const [isResending, setIsResending] = useState(false)
  const { resendVerification, user } = useAuth()

  const handleResendVerification = async () => {
    if (!user?.email) {
      toast.error('No email found. Please sign up again.')
      return
    }

    try {
      setIsResending(true)
      const result = await resendVerification(user.email)
      
      if (result.error) {
        toast.error(result.error.message || 'Failed to resend verification email')
        return
      }

      toast.success('Verification email sent! Check your inbox.')
    } catch (error) {
      console.error('Error resending verification:', error)
      toast.error('An unexpected error occurred')
    } finally {
      setIsResending(false)
    }
  }

  return (
    <div className="min-h-screen bg-background-light flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <Mail className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-text-dark">
            Verify your email address
          </h2>
          <p className="mt-2 text-sm text-text-light">
            We've sent a verification link to your email address
          </p>
          {user?.email && (
            <p className="mt-1 text-sm font-medium text-text-dark">
              {user.email}
            </p>
          )}
        </div>

        {/* Instructions */}
        <div className="bg-white rounded-xl border border-background-dark p-6">
          <h3 className="text-lg font-medium text-text-dark mb-4">
            What's next?
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-xs font-bold">1</span>
              </div>
              <div>
                <p className="text-sm font-medium text-text-dark">Check your email</p>
                <p className="text-xs text-text-light">
                  Look for an email from Kyzer LMS with the subject "Verify your email address"
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-xs font-bold">2</span>
              </div>
              <div>
                <p className="text-sm font-medium text-text-dark">Click the verification link</p>
                <p className="text-xs text-text-light">
                  Click the "Verify Email" button in the email to activate your account
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-xs font-bold">3</span>
              </div>
              <div>
                <p className="text-sm font-medium text-text-dark">Start learning</p>
                <p className="text-xs text-text-light">
                  Once verified, you'll be redirected to your dashboard to begin your learning journey
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Troubleshooting */}
        <div className="bg-background-medium rounded-lg p-4 border border-background-dark">
          <h3 className="text-sm font-medium text-text-dark mb-3">
            Didn't receive the email?
          </h3>
          <ul className="text-sm text-text-light space-y-1 mb-4">
            <li>• Check your spam/junk folder</li>
            <li>• Make sure you entered the correct email address</li>
            <li>• Wait a few minutes for the email to arrive</li>
            <li>• Check that your email provider isn't blocking our emails</li>
          </ul>
          
          <button
            onClick={handleResendVerification}
            disabled={isResending}
            className="w-full flex items-center justify-center py-2 px-4 border border-primary text-primary rounded-lg hover:bg-primary-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isResending ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Resend verification email
              </>
            )}
          </button>
        </div>

        {/* Success Notice */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <h3 className="text-sm font-medium text-green-800">
              Email verified successfully?
            </h3>
          </div>
          <p className="text-sm text-green-700 mt-1">
            If you've already verified your email, you can sign in to your account.
          </p>
          <div className="mt-3">
            <Link
              to="/login"
              className="text-sm font-medium text-green-800 hover:text-green-900 transition-colors"
            >
              Go to sign in →
            </Link>
          </div>
        </div>

        {/* Footer Links */}
        <div className="text-center space-y-4">
          <div className="text-sm">
            <Link 
              to="/login" 
              className="inline-flex items-center text-text-light hover:text-primary transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to sign in
            </Link>
          </div>
          
          <div className="text-xs text-text-muted">
            Need help? Contact our support team at{' '}
            <a 
              href="mailto:support@kyzer.com" 
              className="text-primary hover:text-primary-dark transition-colors"
            >
              support@kyzer.com
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}