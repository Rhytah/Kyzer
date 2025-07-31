// // src/pages/auth/AuthCallback.jsx - Handles email verification redirects
// import { useEffect, useState } from 'react';
// import { useNavigate, useSearchParams } from 'react-router-dom';
// import { supabase } from '@/lib/supabase';
// import { useAuth } from '@/hooks/auth/useAuth';
// import toast from 'react-hot-toast';

// // Simple loading spinner component
// const LoadingSpinner = ({ size = 'md' }) => {
//   const sizeClasses = {
//     sm: 'w-4 h-4',
//     md: 'w-8 h-8',
//     lg: 'w-16 h-16'
//   };

//   return (
//     <div className={`animate-spin rounded-full border-2 border-primary-light border-t-primary ${sizeClasses[size]}`} />
//   );
// };

// export default function AuthCallback() {
//   const navigate = useNavigate();
//   const [searchParams] = useSearchParams();
//   const { refreshUser } = useAuth();
//   const [status, setStatus] = useState('processing'); // processing, success, error

//   useEffect(() => {
//     const handleAuthCallback = async () => {
//       try {
//         console.log('Processing auth callback...');
//         setStatus('processing');

//         // Get URL parameters
//         const type = searchParams.get('type');
//         const accessToken = searchParams.get('access_token');
//         const refreshToken = searchParams.get('refresh_token');
//         const error = searchParams.get('error');
//         const errorDescription = searchParams.get('error_description');

//         // Handle error from URL
//         if (error) {
//           console.error('Auth callback error from URL:', error, errorDescription);
//           setStatus('error');
//           toast.error(errorDescription || 'Authentication failed');
          
//           setTimeout(() => {
//             navigate('/login');
//           }, 3000);
//           return;
//         }

//         // Handle email verification callback
//         if (accessToken && refreshToken) {
//           // Set the session with the tokens from URL
//           const { data, error: sessionError } = await supabase.auth.setSession({
//             access_token: accessToken,
//             refresh_token: refreshToken
//           });

//           if (sessionError) {
//             console.error('Session error:', sessionError);
//             setStatus('error');
//             toast.error('Failed to complete authentication');
//             navigate('/login');
//             return;
//           }

//           if (data.session) {
//             console.log('Session established successfully');
//             setStatus('success');
            
//             // Refresh user profile
//             await refreshUser();
            
//             // Show success message based on type
//             if (type === 'signup') {
//               toast.success('Email verified successfully! Welcome to Kyzer LMS!');
//             } else if (type === 'recovery') {
//               toast.success('Password reset verified. Please set your new password.');
//               navigate('/reset-password');
//               return;
//             } else {
//               toast.success('Successfully authenticated!');
//             }
            
//             // Redirect to intended page or dashboard
//             const redirectTo = sessionStorage.getItem('auth_redirect') || '/dashboard';
//             sessionStorage.removeItem('auth_redirect');
            
//             setTimeout(() => {
//               navigate(redirectTo);
//             }, 2000);
//           } else {
//             throw new Error('No session created');
//           }
//         } else {
//           // No tokens in URL, try to get current session
//           const { data: { session }, error: getSessionError } = await supabase.auth.getSession();
          
//           if (getSessionError) {
//             console.error('Get session error:', getSessionError);
//             setStatus('error');
//             toast.error('Authentication failed');
//             navigate('/login');
//             return;
//           }
          
//           if (session) {
//             console.log('Found existing session');
//             setStatus('success');
            
//             await refreshUser();
            
//             if (type === 'signup') {
//               toast.success('Email verified successfully!');
//             } else {
//               toast.success('Successfully authenticated!');
//             }
            
//             const redirectTo = sessionStorage.getItem('auth_redirect') || '/dashboard';
//             sessionStorage.removeItem('auth_redirect');
//             navigate(redirectTo);
//           } else {
//             console.log('No session found, redirecting to login');
//             setStatus('error');
//             toast.error('No active session found');
//             navigate('/login');
//           }
//         }
//       } catch (error) {
//         console.error('Unexpected error in auth callback:', error);
//         setStatus('error');
//         toast.error('An unexpected error occurred during authentication');
        
//         setTimeout(() => {
//           navigate('/login');
//         }, 3000);
//       }
//     };

//     // Small delay to ensure URL parameters are fully loaded
//     const timeoutId = setTimeout(handleAuthCallback, 100);
    
//     return () => clearTimeout(timeoutId);
//   }, [navigate, searchParams, refreshUser]);

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-background-light">
//       <div className="max-w-md mx-auto p-8 bg-white rounded-lg shadow-lg text-center">
//         {status === 'processing' && (
//           <>
//             <LoadingSpinner size="lg" />
//             <h2 className="mt-6 text-xl font-semibold text-text-dark">
//               Completing Authentication...
//             </h2>
//             <p className="mt-2 text-text-medium">
//               Please wait while we verify your email and sign you in.
//             </p>
//           </>
//         )}

//         {status === 'success' && (
//           <>
//             <div className="w-16 h-16 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center">
//               <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
//               </svg>
//             </div>
//             <h2 className="text-xl font-semibold text-text-dark">
//               Authentication Successful!
//             </h2>
//             <p className="mt-2 text-text-medium">
//               Redirecting you to your dashboard...
//             </p>
//           </>
//         )}

//         {status === 'error' && (
//           <>
//             <div className="w-16 h-16 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
//               <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//               </svg>
//             </div>
//             <h2 className="text-xl font-semibold text-text-dark">
//               Authentication Failed
//             </h2>
//             <p className="mt-2 text-text-medium">
//               There was an issue completing your authentication. Redirecting to login...
//             </p>
//             <button
//               onClick={() => navigate('/login')}
//               className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
//             >
//               Go to Login
//             </button>
//           </>
//         )}
//       </div>
//     </div>
//   );
// }


// src/pages/auth/AuthCallback.jsx - NEW FILE
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/auth/useAuth";
import { LoadingSpinner } from "@/components/ui";
import toast from "react-hot-toast";

export default function AuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { createUserProfile } = useAuth();
  const [status, setStatus] = useState('verifying');
  const [message, setMessage] = useState('Verifying your email...');

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const type = searchParams.get('type');
        const error = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');

        console.log('🔵 Auth callback triggered:', { type, error });

        if (error) {
          console.error('🔴 Auth callback error:', error, errorDescription);
          setStatus('error');
          setMessage(errorDescription || 'Authentication failed');
          toast.error(errorDescription || 'Authentication failed');
          
          setTimeout(() => {
            navigate('/login', { replace: true });
          }, 3000);
          return;
        }

        // Handle email confirmation
        if (type === 'signup' || type === 'email_change') {
          console.log('🟡 Handling email confirmation...');
          setMessage('Confirming your email...');

          // Get the current session after email confirmation
          const { data: { session }, error: sessionError } = await supabase.auth.getSession();

          if (sessionError) {
            console.error('🔴 Session error after confirmation:', sessionError);
            setStatus('error');
            setMessage('Failed to confirm email');
            toast.error('Failed to confirm email');
            
            setTimeout(() => {
              navigate('/login', { replace: true });
            }, 3000);
            return;
          }

          if (!session?.user) {
            console.error('🔴 No user session after confirmation');
            setStatus('error');
            setMessage('No user session found');
            
            setTimeout(() => {
              navigate('/login', { replace: true });
            }, 3000);
            return;
          }

          // Check if profile exists
          const { data: existingProfile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .maybeSingle();

          // Create profile if it doesn't exist
          if (!existingProfile) {
            console.log('🟡 Creating profile after email confirmation...');
            setMessage('Setting up your account...');

            try {
              await createUserProfile(session.user, session.user.user_metadata);
              console.log('🟢 Profile created successfully after email confirmation');
            } catch (profileError) {
              console.error('🔴 Profile creation failed:', profileError);
              // Continue anyway - profile might be created by trigger
            }
          } else {
            console.log('🟢 Profile already exists');
          }

          setStatus('success');
          setMessage('Email confirmed successfully! Redirecting...');
          toast.success('Email confirmed! Welcome to Kyzer LMS!');

          setTimeout(() => {
            navigate('/app/dashboard', { replace: true });
          }, 2000);
          return;
        }

        // Handle password recovery
        if (type === 'recovery') {
          console.log('🟡 Handling password recovery...');
          setStatus('success');
          setMessage('Redirecting to password reset...');
          
          setTimeout(() => {
            navigate('/auth/reset-password', { replace: true });
          }, 1000);
          return;
        }

        // Default redirect for other cases
        console.log('🟡 Default auth callback handling');
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          setStatus('success');
          setMessage('Authentication successful! Redirecting...');
          
          setTimeout(() => {
            navigate('/app/dashboard', { replace: true });
          }, 1000);
        } else {
          setStatus('error');
          setMessage('Authentication failed');
          
          setTimeout(() => {
            navigate('/login', { replace: true });
          }, 3000);
        }

      } catch (error) {
        console.error('🔴 Auth callback error:', error);
        setStatus('error');
        setMessage('An error occurred during authentication');
        toast.error('An error occurred during authentication');
        
        setTimeout(() => {
          navigate('/login', { replace: true });
        }, 3000);
      }
    };

    handleAuthCallback();
  }, [searchParams, navigate, createUserProfile]);

  return (
    <div className="min-h-screen bg-background-light flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
        <div className="mb-6">
          {status === 'verifying' && (
            <div className="text-primary">
              <LoadingSpinner className="w-12 h-12 mx-auto mb-4" />
            </div>
          )}
          
          {status === 'success' && (
            <div className="text-green-600 mb-4">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
          )}
          
          {status === 'error' && (
            <div className="text-red-600 mb-4">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </div>
          )}
        </div>

        <h2 className="text-xl font-semibold text-text-dark mb-2">
          {status === 'verifying' && 'Verifying Email'}
          {status === 'success' && 'Success!'}
          {status === 'error' && 'Error'}
        </h2>

        <p className="text-text-light">
          {message}
        </p>

        {status === 'error' && (
          <div className="mt-6">
            <button
              onClick={() => navigate('/login', { replace: true })}
              className="w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-primary-dark transition-colors"
            >
              Return to Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
}