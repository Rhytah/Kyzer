// src/components/auth/SignupForm.jsx - ENHANCED WITH EMAIL VALIDATION
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/auth/useAuth";
import { Button, Input } from "@/components/ui";
import { Eye, EyeOff, AlertCircle, Clock, CheckCircle, X } from "lucide-react";
import toast from "react-hot-toast";
import { supabase } from "@/lib/supabase";

// Validation schemas (same as before)
const individualSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const corporateSchema = individualSchema.extend({
  jobTitle: z.string().min(1, "Job title is required"),
  companyName: z.string().min(1, "Company name is required"),
  employeeCount: z.string().min(1, "Please select company size"),
});

export default function SignupForm({ accountType, onSuccess }) {
  const { signup } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rateLimited, setRateLimited] = useState(false);
  
  // ✅ NEW: Email validation states
  const [emailCheckStatus, setEmailCheckStatus] = useState('idle'); // 'idle', 'checking', 'available', 'taken'
  const [emailCheckTimeout, setEmailCheckTimeout] = useState(null);

  const schema = accountType === 'corporate' ? corporateSchema : individualSchema;

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setError,
    clearErrors
  } = useForm({
    resolver: zodResolver(schema),
    mode: "onBlur"
  });

  const password = watch("password", "");
  const emailValue = watch("email", "");

  // ✅ NEW: Check if email exists (debounced)
  const checkEmailAvailability = async (email) => {
    if (!email || !email.includes('@')) {
      setEmailCheckStatus('idle');
      return;
    }

    setEmailCheckStatus('checking');
    
    try {
      // Check in auth.users table (this requires a database function or RPC)
      const { data, error } = await supabase.rpc('check_email_exists', { 
        email_to_check: email 
      });

      if (error) {
        console.error('Email check error:', error);
        setEmailCheckStatus('idle');
        return;
      }

      if (data === true) {
        setEmailCheckStatus('taken');
        setError('email', { 
          type: 'manual', 
          message: 'This email is already registered. Try signing in instead.' 
        });
      } else {
        setEmailCheckStatus('available');
        clearErrors('email');
      }
    } catch (error) {
      console.error('Email availability check failed:', error);
      setEmailCheckStatus('idle');
    }
  };

  // ✅ NEW: Debounced email checking
  const handleEmailChange = (e) => {
    const email = e.target.value;
    
    // Clear previous timeout
    if (emailCheckTimeout) {
      clearTimeout(emailCheckTimeout);
    }

    // Reset status
    setEmailCheckStatus('idle');
    clearErrors('email');

    // Set new timeout for checking
    const timeoutId = setTimeout(() => {
      checkEmailAvailability(email);
    }, 1000); // Check after 1 second of no typing

    setEmailCheckTimeout(timeoutId);
  };

  const onSubmit = async (formData) => {
    
    // ✅ BLOCK SUBMISSION if email is taken
    if (emailCheckStatus === 'taken') {
      toast.error('Please use a different email address');
      return;
    }

    setIsLoading(true);
    setRateLimited(false);

    try {
      const signupData = {
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName,
            account_type: accountType,
            job_title: formData.jobTitle || '',
            company_name: formData.companyName || '',
            employee_count: formData.employeeCount || '',
          }
        }
      };

      const result = await signup(signupData);

      if (result.error) {
        console.error('🔴 Signup error:', result.error);
        
        // ✅ ENHANCED: Handle various signup errors
        if (result.error.message?.includes('already registered') ||
            result.error.message?.includes('already been registered') ||
            result.error.message?.includes('email address not authorized') ||
            result.error.code === 'email_address_already_registered') {
          setError('email', { 
            type: 'manual', 
            message: 'This email is already registered. Please sign in instead or use a different email.' 
          });
          toast.error('Email already registered');
          return;
        }
        
        // Handle rate limiting
        if (result.error.type === 'RATE_LIMITED' || 
            result.error.message?.includes('rate') ||
            result.error.message?.includes('limit')) {
          setRateLimited(true);
          toast.error(
            'Hit email rate limit. Wait 1 hour, set up SMTP, or disable email confirmation for development.',
            { duration: 8000 }
          );
          return;
        }
        
        // Handle weak password
        if (result.error.message?.includes('weak password')) {
          setError('password', { 
            type: 'manual', 
            message: 'Password is too weak. Please choose a stronger password.' 
          });
          toast.error('Password is too weak');
          return;
        }

        // Generic error
        toast.error(result.error.message || 'Signup failed');
        return;
      }

      
      if (result.skipVerification) {
        toast.success('Account created successfully! (Development mode)');
        window.location.href = '/app/dashboard';
      } else {
        toast.success('Account created! Please check your email to verify your account.');
        
        if (onSuccess) {
          onSuccess({ email: formData.email });
        }
      }

    } catch (error) {
      console.error('🔴 Signup exception:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const getPasswordStrength = (password) => {
    if (!password) return { strength: 0, label: '', color: '' };
    
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    const levels = [
      { label: 'Very Weak', color: 'bg-red-500' },
      { label: 'Weak', color: 'bg-orange-500' },
      { label: 'Fair', color: 'bg-yellow-500' },
      { label: 'Good', color: 'bg-blue-500' },
      { label: 'Strong', color: 'bg-green-500' }
    ];

    return { strength, ...levels[Math.min(strength, 4)] };
  };

  const passwordStrength = getPasswordStrength(password);

  return (
    <div className="space-y-6">
      {/* Rate Limit Warning */}
      {rateLimited && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <Clock className="w-5 h-5 text-yellow-600 mr-3" />
            <div>
              <h4 className="text-sm font-medium text-yellow-800">Email Rate Limit Hit</h4>
              <p className="text-sm text-yellow-700 mt-1">
                Supabase's free email service has limits. 
                <br />
                <strong>Quick fixes:</strong>
              </p>
              <ul className="text-xs text-yellow-700 mt-2 space-y-1">
                <li>• Wait 1 hour and try again</li>
                <li>• Set up SMTP (recommended)</li>
                <li>• Temporarily disable email confirmation in Supabase settings</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Name Fields */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-dark mb-2">
              First Name
            </label>
            <Input
              {...register("firstName")}
              placeholder="John"
              error={errors.firstName?.message}
              disabled={isLoading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-dark mb-2">
              Last Name
            </label>
            <Input
              {...register("lastName")}
              placeholder="Doe"
              error={errors.lastName?.message}
              disabled={isLoading}
            />
          </div>
        </div>

        {/* ✅ ENHANCED: Email with availability checking */}
        <div>
          <label className="block text-sm font-medium text-text-dark mb-2">
            Email Address
          </label>
          <div className="relative">
            <Input
              type="email"
              {...register("email", {
                onChange: handleEmailChange
              })}
              placeholder="john@example.com"
              error={errors.email?.message}
              disabled={isLoading}
              className={`${
                emailCheckStatus === 'available' ? 'border-green-500 focus:ring-green-500' :
                emailCheckStatus === 'taken' ? 'border-red-500 focus:ring-red-500' : ''
              }`}
            />
            
            {/* Email status indicator */}
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              {emailCheckStatus === 'checking' && (
                <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              )}
              {emailCheckStatus === 'available' && (
                <CheckCircle className="w-5 h-5 text-green-500" />
              )}
              {emailCheckStatus === 'taken' && (
                <X className="w-5 h-5 text-red-500" />
              )}
            </div>
          </div>
          
          {/* Email status message */}
          {emailCheckStatus === 'available' && !errors.email && (
            <p className="mt-1 text-sm text-green-600 flex items-center">
              <CheckCircle className="w-4 h-4 mr-1" />
              Email is available
            </p>
          )}
          {emailCheckStatus === 'taken' && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="w-7 h-5 text-red-500" />
              Email is taken, please use a different one!
            </p>
          )}
        </div>

        {/* Corporate Fields */}
        {accountType === 'corporate' && (
          <>
            <div>
              <label className="block text-sm font-medium text-text-dark mb-2">
                Job Title
              </label>
              <Input
                {...register("jobTitle")}
                placeholder="CEO, Manager, Developer, etc."
                error={errors.jobTitle?.message}
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-dark mb-2">
                Company Name
              </label>
              <Input
                {...register("companyName")}
                placeholder="Acme Corporation"
                error={errors.companyName?.message}
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-dark mb-2">
                Company Size
              </label>
              <select
                {...register("employeeCount")}
                className="w-full px-3 py-2 border border-background-dark rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                disabled={isLoading}
              >
                <option value="">Select company size</option>
                <option value="1-10">1-10 employees</option>
                <option value="11-50">11-50 employees</option>
                <option value="51-200">51-200 employees</option>
              </select>
              {errors.employeeCount && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.employeeCount.message}
                </p>
              )}
            </div>
          </>
        )}

        {/* Password */}
        <div>
          <label className="block text-sm font-medium text-text-dark mb-2">
            Password
          </label>
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              {...register("password")}
              placeholder="Create a strong password"
              error={errors.password?.message}
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-light hover:text-text-dark"
              disabled={isLoading}
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          {/* Password Strength Indicator */}
          {password && (
            <div className="mt-2">
              <div className="flex items-center space-x-2">
                <div className="flex-1 h-2 bg-background-medium rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${passwordStrength.color}`}
                    style={{ width: `${(passwordStrength.strength / 4) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-text-light font-medium">
                  {passwordStrength.label}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-sm font-medium text-text-dark mb-2">
            Confirm Password
          </label>
          <div className="relative">
            <Input
              type={showConfirmPassword ? "text" : "password"}
              {...register("confirmPassword")}
              placeholder="Confirm your password"
              error={errors.confirmPassword?.message}
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-light hover:text-text-dark"
              disabled={isLoading}
            >
              {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full"
          loading={isLoading}
          disabled={isLoading || emailCheckStatus === 'taken'}
        >
          {isLoading ? 'Creating Account...' : 'Create Account'}
        </Button>

        {/* Development Notice */}
        {import.meta.env.DEV && import.meta.env.VITE_SKIP_EMAIL_CONFIRMATION === 'true' && (
          <div className="text-xs text-blue-600 bg-blue-50 rounded-lg p-3 text-center">
            🚀 Development Mode: Email confirmation disabled
          </div>
        )}

        {/* Corporate info */}
        {accountType === 'corporate' && (
          <div className="text-xs text-text-light bg-background-medium rounded-lg p-3">
            <p className="font-medium mb-1">Corporate Account Benefits:</p>
            <ul className="space-y-1">
              <li>• Manage up to 200 employees</li>
              <li>• Advanced reporting and analytics</li>
              <li>• Bulk course assignments</li>
              <li>• Priority support</li>
            </ul>
          </div>
        )}
      </form>
    </div>
  );
}