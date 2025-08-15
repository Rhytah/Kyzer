// src/components/auth/ProfileForm.jsx
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Save, Eye, EyeOff, User, Mail, Phone, Bell } from 'lucide-react'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Card } from '../ui/Card'
import { useAuth } from '../../hooks/auth/useAuth'
import toast from 'react-hot-toast'
import { AvatarUpload } from '../ui'

// Validation schema
const profileSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().optional(),
  currentPassword: z.string().optional(),
  newPassword: z.string().optional(),
  confirmPassword: z.string().optional(),
  emailNotifications: z.boolean(),
  courseUpdates: z.boolean(),
  progressReminders: z.boolean()
}).refine((data) => {
  if (data.newPassword && data.newPassword.length < 8) {
    return false
  }
  return true
}, {
  message: "New password must be at least 8 characters",
  path: ["newPassword"]
}).refine((data) => {
  if (data.newPassword && data.newPassword !== data.confirmPassword) {
    return false
  }
  return true
}, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
})

export function ProfileForm() {
  const { user, updateProfile, updatePassword } = useAuth()
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('profile')

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    watch,
    reset
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.user_metadata?.firstName || '',
      lastName: user?.user_metadata?.lastName || '',
      email: user?.email || '',
      phone: user?.user_metadata?.phone || '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
      emailNotifications: user?.user_metadata?.emailNotifications ?? true,
      courseUpdates: user?.user_metadata?.courseUpdates ?? true,
      progressReminders: user?.user_metadata?.progressReminders ?? true
    }
  })

  const watchedNewPassword = watch('newPassword')

  const handleAvatarChange = async (file) => {
    try {
      setIsLoading(true)
      // TODO: Upload to Supabase storage
      toast.success('Avatar updated successfully')
    } catch (error) {
      toast.error('Failed to update avatar')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAvatarRemove = async () => {
    try {
      setIsLoading(true)
      // TODO: Remove from Supabase storage
      toast.success('Avatar removed')
    } catch (error) {
      toast.error('Failed to remove avatar')
    } finally {
      setIsLoading(false)
    }
  }

  const onSubmit = async (data) => {
    setIsLoading(true)
    
    try {
      // Update profile information
      const profileData = {
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        emailNotifications: data.emailNotifications,
        courseUpdates: data.courseUpdates,
        progressReminders: data.progressReminders
      }
      
      await updateProfile(profileData)

      // Update password if provided
      if (data.newPassword && data.currentPassword) {
        await updatePassword(data.currentPassword, data.newPassword)
        toast.success('Password updated successfully')
      }

      toast.success('Profile updated successfully')
      reset(data) // Reset form state
    } catch (error) {
      toast.error(error.message || 'Failed to update profile')
    } finally {
      setIsLoading(false)
    }
  }

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Eye },
    { id: 'notifications', label: 'Notifications', icon: Bell }
  ]

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Tab Navigation */}
      <div className="border-b border-background-dark">
        <nav className="flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-primary-default text-primary-default'
                    : 'border-transparent text-text-light hover:text-text-medium hover:border-background-dark'
                }`}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            )
          })}
        </nav>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-text-dark mb-6">Profile Information</h3>
            
            {/* Avatar Upload */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-text-dark mb-4">
                Profile Photo
              </label>
              <AvatarUpload
                currentAvatar={user?.user_metadata?.avatar_url}
                onAvatarChange={handleAvatarChange}
                onAvatarRemove={handleAvatarRemove}
                disabled={isLoading}
              />
            </div>

            {/* Personal Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-text-dark mb-2">
                  First Name *
                </label>
                <Input
                  {...register('firstName')}
                  error={errors.firstName?.message}
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-dark mb-2">
                  Last Name *
                </label>
                <Input
                  {...register('lastName')}
                  error={errors.lastName?.message}
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-dark mb-2">
                  Email Address *
                </label>
                <Input
                  type="email"
                  {...register('email')}
                  error={errors.email?.message}
                  disabled={true} // Email changes require verification
                  icon={Mail}
                />
                <p className="text-xs text-text-muted mt-1">
                  Contact support to change your email address
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-dark mb-2">
                  Phone Number
                </label>
                <Input
                  type="tel"
                  {...register('phone')}
                  error={errors.phone?.message}
                  disabled={isLoading}
                  icon={Phone}
                  placeholder="+1 (555) 123-4567"
                />
              </div>
            </div>
          </Card>
        )}

        {/* Security Tab */}
        {activeTab === 'security' && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-text-dark mb-6">Change Password</h3>
            
            <div className="space-y-6 max-w-md">
              <div>
                <label className="block text-sm font-medium text-text-dark mb-2">
                  Current Password
                </label>
                <div className="relative">
                  <Input
                    type={showCurrentPassword ? 'text' : 'password'}
                    {...register('currentPassword')}
                    error={errors.currentPassword?.message}
                    disabled={isLoading}
                    placeholder="Enter current password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-light hover:text-text-medium"
                  >
                    {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-dark mb-2">
                  New Password
                </label>
                <div className="relative">
                  <Input
                    type={showNewPassword ? 'text' : 'password'}
                    {...register('newPassword')}
                    error={errors.newPassword?.message}
                    disabled={isLoading}
                    placeholder="Enter new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-light hover:text-text-medium"
                  >
                    {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {watchedNewPassword && (
                  <div className="mt-2">
                    <div className="text-xs text-text-muted mb-1">Password strength:</div>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4].map((level) => (
                        <div
                          key={level}
                          className={`h-1 flex-1 rounded ${
                            watchedNewPassword.length >= level * 2
                              ? watchedNewPassword.length >= 8
                                ? 'bg-success-default'
                                : 'bg-warning-default'
                              : 'bg-background-dark'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-text-dark mb-2">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? 'text' : 'password'}
                    {...register('confirmPassword')}
                    error={errors.confirmPassword?.message}
                    disabled={isLoading}
                    placeholder="Confirm new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-light hover:text-text-medium"
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-text-dark mb-6">Notification Preferences</h3>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-text-dark">
                    Email Notifications
                  </label>
                  <p className="text-sm text-text-light">
                    Receive general email notifications
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    {...register('emailNotifications')}
                    className="sr-only peer"
                    disabled={isLoading}
                  />
                  <div className="w-11 h-6 bg-background-dark peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-default"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-text-dark">
                    Course Updates
                  </label>
                  <p className="text-sm text-text-light">
                    Get notified about new courses and content updates
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    {...register('courseUpdates')}
                    className="sr-only peer"
                    disabled={isLoading}
                  />
                  <div className="w-11 h-6 bg-background-dark peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-default"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-text-dark">
                    Progress Reminders
                  </label>
                  <p className="text-sm text-text-light">
                    Receive reminders to continue your learning
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    {...register('progressReminders')}
                    className="sr-only peer"
                    disabled={isLoading}
                  />
                  <div className="w-11 h-6 bg-background-dark peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-default"></div>
                </label>
              </div>
            </div>
          </Card>
        )}

        {/* Save Button */}
        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={!isDirty || isLoading}
            className="flex items-center gap-2"
          >
            <Save size={16} />
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </div>
  )
}