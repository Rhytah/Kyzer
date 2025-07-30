// src/pages/auth/VerifyEmail.jsx - Fixed email verification component
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/hooks/auth/useAuth";
// import { supabase } from "@/lib/supabase";
import { LoadingSpinner } from "@/components/ui";
import toast from "react-hot-toast";
import { supabase } from "../../lib/supabase";

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const [verifying, setVerifying] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const accessToken = searchParams.get('access_token');
        const refreshToken = searchParams.get('refresh_token');
        const type = searchParams.get('type');

        if (type === 'signup' && accessToken && refreshToken) {
          // Set the session with the tokens from URL
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          });

          if (error) {
            console.error('Verification error:', error);
            setMessage('Email verification failed. Please try again.');
            toast.error('Email verification failed');
            return;
          }

          if (data.user) {
            // Refresh the user in our auth context
            await refreshUser();
            
            setMessage('Email verified successfully! Redirecting...');
            toast.success('Email verified successfully!');
            
            // Redirect to dashboard after a short delay
            setTimeout(() => {
              navigate('/dashboard', { replace: true });
            }, 2000);
          }
        } else if (type === 'recovery') {
          // Handle password recovery
          setMessage('Please enter your new password.');
          navigate('/reset-password', { replace: true });
        } else {
          // No valid tokens found
          setMessage('Invalid verification link. Please check your email or request a new verification.');
          toast.error('Invalid verification link');
        }
      } catch (error) {
        console.error('Auth callback error:', error);
        setMessage('An error occurred during verification. Please try again.');
        toast.error('Verification failed');
      } finally {
        setVerifying(false);
      }
    };

    handleAuthCallback();
  }, [searchParams, navigate, refreshUser]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background-light">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-lg shadow-medium p-8 text-center">
          <div className="mb-6">
            <div className="mx-auto w-16 h-16 bg-primary-light rounded-full flex items-center justify-center mb-4">
              {verifying ? (
                <LoadingSpinner className="w-8 h-8 text-primary" />
              ) : (
                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
            </div>
            
            <h1 className="text-2xl font-bold text-text-dark mb-2">
              {verifying ? 'Verifying Email' : 'Email Verification'}
            </h1>
            
            <p className="text-text-medium">
              {verifying 
                ? 'Please wait while we verify your email address...'
                : message
              }
            </p>
          </div>

          {!verifying && (
            <div className="space-y-4">
              <button
                onClick={() => navigate('/login')}
                className="w-full bg-primary text-white py-2 px-4 rounded-lg hover:bg-primary-dark transition-colors"
              >
                Go to Login
              </button>
              
              <button
                onClick={() => navigate('/')}
                className="w-full bg-transparent text-primary py-2 px-4 rounded-lg border border-primary hover:bg-primary-light transition-colors"
              >
                Back to Home
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
export { VerifyEmail };