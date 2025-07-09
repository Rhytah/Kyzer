// src/components/auth/SignupForm.jsx (Simple validation)
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Eye, EyeOff, Mail, Lock, User, Building, Users, Loader2 } from 'lucide-react'
import { useAuth } from '@/hooks/auth/useAuth'
import toast from 'react-hot-toast'

export default function SignupForm({ accountType, onSuccess }) {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const { signup, loading } = useAuth()

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting }
  } = useForm({
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      ...(accountType === 'corporate' && {
        companyName: '',
        jobTitle: '',
        employeeCount: ''
      })
    }
  })

  // Watch password for confirmation validation
  const watchPassword = watch('password')

  const onSubmit = async (data) => {
    try {
      const userData = {
        email: data.email,
        password: data.password,
        options: {
          data: {
            first_name: data.firstName,
            last_name: data.lastName,
            account_type: accountType,
            ...(accountType === 'corporate' && {
              company_name: data.companyName,
              job_title: data.jobTitle,
              employee_count: data.employeeCount
            })
          }
        }
      }

      const result = await signup(userData)
      
      if (result.error) {
        toast.error(result.error.message || 'Signup failed')
        return
      }

      toast.success('Account created! Please check your email to verify your account.')
      onSuccess?.()
    } catch (error) {
      console.error('Signup error:', error)
      toast.error('An unexpected error occurred')
    }
  }

  const isLoading = loading || isSubmitting

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Name Fields */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-text-dark mb-2">
            First name
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <User className="h-5 w-5 text-text-light" />
            </div>
            <input
              {...register('firstName', {
                required: 'First name is required',
                minLength: {
                  value: 2,
                  message: 'First name must be at least 2 characters'
                }
              })}
              type="text"
              id="firstName"
              autoComplete="given-name"
              disabled={isLoading}
              className={`
                block w-full pl-10 pr-3 py-3 border rounded-lg 
                placeholder-text-muted text-text-dark
                focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary
                disabled:bg-background-medium disabled:cursor-not-allowed
                transition-colors
                ${errors.firstName 
                  ? 'border-red-300 bg-red-50' 
                  : 'border-background-dark bg-white hover:border-primary-light'
                }
              `}
              placeholder="First name"
            />
          </div>
          {errors.firstName && (
            <p className="mt-2 text-sm text-red-600">{errors.firstName.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-text-dark mb-2">
            Last name
          </label>
          <input
            {...register('lastName', {
              required: 'Last name is required',
              minLength: {
                value: 2,
                message: 'Last name must be at least 2 characters'
              }
            })}
            type="text"
            id="lastName"
            autoComplete="family-name"
            disabled={isLoading}
            className={`
              block w-full px-3 py-3 border rounded-lg 
              placeholder-text-muted text-text-dark
              focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary
              disabled:bg-background-medium disabled:cursor-not-allowed
              transition-colors
              ${errors.lastName 
                ? 'border-red-300 bg-red-50' 
                : 'border-background-dark bg-white hover:border-primary-light'
              }
            `}
            placeholder="Last name"
          />
          {errors.lastName && (
            <p className="mt-2 text-sm text-red-600">{errors.lastName.message}</p>
          )}
        </div>
      </div>

      {/* Corporate Fields */}
      {accountType === 'corporate' && (
        <>
          <div>
            <label htmlFor="companyName" className="block text-sm font-medium text-text-dark mb-2">
              Company name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Building className="h-5 w-5 text-text-light" />
              </div>
              <input
                {...register('companyName', {
                  required: 'Company name is required',
                  minLength: {
                    value: 2,
                    message: 'Company name must be at least 2 characters'
                  }
                })}
                type="text"
                id="companyName"
                autoComplete="organization"
                disabled={isLoading}
                className={`
                  block w-full pl-10 pr-3 py-3 border rounded-lg 
                  placeholder-text-muted text-text-dark
                  focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary
                  disabled:bg-background-medium disabled:cursor-not-allowed
                  transition-colors
                  ${errors.companyName 
                    ? 'border-red-300 bg-red-50' 
                    : 'border-background-dark bg-white hover:border-primary-light'
                  }
                `}
                placeholder="Your company name"
              />
            </div>
            {errors.companyName && (
              <p className="mt-2 text-sm text-red-600">{errors.companyName.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="jobTitle" className="block text-sm font-medium text-text-dark mb-2">
                Job title
              </label>
              <input
                {...register('jobTitle', {
                  required: 'Job title is required'
                })}
                type="text"
                id="jobTitle"
                autoComplete="organization-title"
                disabled={isLoading}
                className={`
                  block w-full px-3 py-3 border rounded-lg 
                  placeholder-text-muted text-text-dark
                  focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary
                  disabled:bg-background-medium disabled:cursor-not-allowed
                  transition-colors
                  ${errors.jobTitle 
                    ? 'border-red-300 bg-red-50' 
                    : 'border-background-dark bg-white hover:border-primary-light'
                  }
                `}
                placeholder="Your job title"
              />
              {errors.jobTitle && (
                <p className="mt-2 text-sm text-red-600">{errors.jobTitle.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="employeeCount" className="block text-sm font-medium text-text-dark mb-2">
                Company size
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Users className="h-5 w-5 text-text-light" />
                </div>
                <select
                  {...register('employeeCount', {
                    required: 'Please select employee count'
                  })}
                  id="employeeCount"
                  disabled={isLoading}
                  className={`
                    block w-full pl-10 pr-8 py-3 border rounded-lg 
                    text-text-dark bg-white
                    focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary
                    disabled:bg-background-medium disabled:cursor-not-allowed
                    transition-colors
                    ${errors.employeeCount 
                      ? 'border-red-300 bg-red-50' 
                      : 'border-background-dark hover:border-primary-light'
                    }
                  `}
                >
                  <option value="">Select size</option>
                  <option value="1-10">1-10 employees</option>
                  <option value="11-50">11-50 employees</option>
                  <option value="51-100">51-100 employees</option>
                  <option value="101-200">101-200 employees</option>
                </select>
              </div>
              {errors.employeeCount && (
                <p className="mt-2 text-sm text-red-600">{errors.employeeCount.message}</p>
              )}
            </div>
          </div>
        </>
      )}

      {/* Email Field */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-text-dark mb-2">
          Email address
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Mail className="h-5 w-5 text-text-light" />
          </div>
          <input
            {...register('email', {
              required: 'Email is required',
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: 'Please enter a valid email address'
              }
            })}
            type="email"
            id="email"
            autoComplete="email"
            disabled={isLoading}
            className={`
              block w-full pl-10 pr-3 py-3 border rounded-lg 
              placeholder-text-muted text-text-dark
              focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary
              disabled:bg-background-medium disabled:cursor-not-allowed
              transition-colors
              ${errors.email 
                ? 'border-red-300 bg-red-50' 
                : 'border-background-dark bg-white hover:border-primary-light'
              }
            `}
            placeholder="Enter your email"
          />
        </div>
        {errors.email && (
          <p className="mt-2 text-sm text-red-600">{errors.email.message}</p>
        )}
      </div>

      {/* Password Fields */}
      <div className="grid grid-cols-1 gap-4">
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-text-dark mb-2">
            Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-text-light" />
            </div>
            <input
              {...register('password', {
                required: 'Password is required',
                minLength: {
                  value: 8,
                  message: 'Password must be at least 8 characters'
                },
                pattern: {
                  value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                  message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number'
                }
              })}
              type={showPassword ? 'text' : 'password'}
              id="password"
              autoComplete="new-password"
              disabled={isLoading}
              className={`
                block w-full pl-10 pr-12 py-3 border rounded-lg 
                placeholder-text-muted text-text-dark
                focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary
                disabled:bg-background-medium disabled:cursor-not-allowed
                transition-colors
                ${errors.password 
                  ? 'border-red-300 bg-red-50' 
                  : 'border-background-dark bg-white hover:border-primary-light'
                }
              `}
              placeholder="Create a password"
            />
            <button
              type="button"
              disabled={isLoading}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5 text-text-light hover:text-text-medium transition-colors" />
              ) : (
                <Eye className="h-5 w-5 text-text-light hover:text-text-medium transition-colors" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="mt-2 text-sm text-red-600">{errors.password.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-text-dark mb-2">
            Confirm password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-text-light" />
            </div>
            <input
              {...register('confirmPassword', {
                required: 'Please confirm your password',
                validate: value => 
                  value === watchPassword || "Passwords don't match"
              })}
              type={showConfirmPassword ? 'text' : 'password'}
              id="confirmPassword"
              autoComplete="new-password"
              disabled={isLoading}
              className={`
                block w-full pl-10 pr-12 py-3 border rounded-lg 
                placeholder-text-muted text-text-dark
                focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary
                disabled:bg-background-medium disabled:cursor-not-allowed
                transition-colors
                ${errors.confirmPassword 
                  ? 'border-red-300 bg-red-50' 
                  : 'border-background-dark bg-white hover:border-primary-light'
                }
              `}
              placeholder="Confirm your password"
            />
            <button
              type="button"
              disabled={isLoading}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? (
                <EyeOff className="h-5 w-5 text-text-light hover:text-text-medium transition-colors" />
              ) : (
                <Eye className="h-5 w-5 text-text-light hover:text-text-medium transition-colors" />
              )}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="mt-2 text-sm text-red-600">{errors.confirmPassword.message}</p>
          )}
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className={`
          w-full flex justify-center items-center py-3 px-4 border border-transparent 
          rounded-lg shadow-sm text-sm font-medium text-white 
          focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary/20
          transition-all duration-200
          ${isLoading
            ? 'bg-primary/70 cursor-not-allowed'
            : 'bg-primary hover:bg-primary-dark hover:shadow-md transform hover:-translate-y-0.5'
          }
        `}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Creating account...
          </>
        ) : (
          `Create ${accountType} account`
        )}
      </button>
    </form>
  )
}