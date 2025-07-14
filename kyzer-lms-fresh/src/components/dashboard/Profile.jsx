// src/pages/dashboard/Profile.jsx
import { ArrowLeft, User } from 'lucide-react'
import { Link } from 'react-router-dom'
import { ProfileForm } from '../../components/auth/ProfileForm'
import { Button } from '../../components/ui/Button'

export function Profile() {
  return (
    <div className="min-h-screen bg-background-light">
      {/* Header */}
      <div className="bg-background-white border-b border-background-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Back Navigation */}
            <div className="flex items-center gap-4">
              <Link to="/dashboard">
                <Button variant="ghost" size="small" className="flex items-center gap-2">
                  <ArrowLeft size={16} />
                  Back to Dashboard
                </Button>
              </Link>
              <div className="h-6 w-px bg-background-dark" />
              <div className="flex items-center gap-2">
                <User size={20} className="text-text-light" />
                <h1 className="text-xl font-semibold text-text-dark">Profile Settings</h1>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-text-dark mb-2">Account Settings</h2>
          <p className="text-text-light">
            Manage your account information, security settings, and preferences.
          </p>
        </div>

        <ProfileForm />
      </div>
    </div>
  )
}