// src/pages/dashboard/Profile.jsx
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useAuth } from "@/hooks/auth/useAuth";
import {
  User,
  Mail,
  Building,
  Calendar,
  Save,
  Camera,
  Settings,
  Shield,
  Bell,
  Globe,
  Loader2,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import toast from "react-hot-toast";

export default function Profile() {
  const { user, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(false);
  const [profileImage, setProfileImage] = useState(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting, isDirty },
  } = useForm({
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      companyName: "",
      jobTitle: "",
      bio: "",
      location: "",
      website: "",
      notifications: {
        email: true,
        push: true,
        courseUpdates: true,
        marketing: false,
      },
    },
  });

  useEffect(() => {
    if (user) {
      // Populate form with user data
      setValue("firstName", user.profile?.first_name || "");
      setValue("lastName", user.profile?.last_name || "");
      setValue("email", user.email || "");
      setValue("companyName", user.profile?.company_name || "");
      setValue("jobTitle", user.profile?.job_title || "");
      setValue("bio", user.profile?.bio || "");
      setValue("location", user.profile?.location || "");
      setValue("website", user.profile?.website || "");
      setProfileImage(user.profile?.avatar_url);
    }
  }, [user, setValue]);

  const onSubmit = async (data) => {
    try {
      setLoading(true);

      // Mock API call - replace with actual update function
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileImage(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "account", label: "Account", icon: Settings },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "privacy", label: "Privacy", icon: Shield },
  ];

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background-light flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-light">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-text-dark">
            Account Settings
          </h1>
          <p className="text-text-light mt-1">
            Manage your account settings and preferences
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:w-64 flex-shrink-0">
            <nav className="space-y-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 text-left rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? "bg-primary text-white"
                      : "text-text-medium hover:bg-background-medium"
                  }`}
                >
                  <tab.icon className="w-5 h-5" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="bg-white rounded-xl border border-background-dark">
              {/* Profile Tab */}
              {activeTab === "profile" && (
                <div className="p-6">
                  <div className="flex items-center space-x-6 mb-8">
                    {/* Profile Image */}
                    <div className="relative">
                      <div className="w-24 h-24 bg-background-medium rounded-full flex items-center justify-center overflow-hidden">
                        {profileImage ? (
                          <img
                            src={profileImage}
                            alt="Profile"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User className="w-12 h-12 text-text-light" />
                        )}
                      </div>
                      <label
                        htmlFor="profile-image"
                        className="absolute bottom-0 right-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center cursor-pointer hover:bg-primary-dark transition-colors"
                      >
                        <Camera className="w-4 h-4 text-white" />
                      </label>
                      <input
                        id="profile-image"
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </div>

                    <div>
                      <h2 className="text-xl font-semibold text-text-dark">
                        {user?.profile?.first_name} {user?.profile?.last_name}
                      </h2>
                      <p className="text-text-light">{user?.email}</p>
                      <p className="text-sm text-text-muted">
                        Member since{" "}
                        {new Date(user?.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {/* Personal Information */}
                    <div>
                      <h3 className="text-lg font-medium text-text-dark mb-4">
                        Personal Information
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-text-dark mb-2">
                            First name
                          </label>
                          <input
                            {...register("firstName", {
                              required: "First name is required",
                            })}
                            type="text"
                            className="w-full px-3 py-2 border border-background-dark rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                          />
                          {errors.firstName && (
                            <p className="mt-1 text-sm text-red-600">
                              {errors.firstName.message}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-text-dark mb-2">
                            Last name
                          </label>
                          <input
                            {...register("lastName", {
                              required: "Last name is required",
                            })}
                            type="text"
                            className="w-full px-3 py-2 border border-background-dark rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                          />
                          {errors.lastName && (
                            <p className="mt-1 text-sm text-red-600">
                              {errors.lastName.message}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Contact Information */}
                    <div>
                      <h3 className="text-lg font-medium text-text-dark mb-4">
                        Contact Information
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-text-dark mb-2">
                            Email address
                          </label>
                          <input
                            {...register("email")}
                            type="email"
                            disabled
                            className="w-full px-3 py-2 border border-background-dark rounded-lg bg-background-medium cursor-not-allowed"
                          />
                          <p className="mt-1 text-xs text-text-muted">
                            Email cannot be changed. Contact support if you need
                            to update your email.
                          </p>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-text-dark mb-2">
                            Location
                          </label>
                          <input
                            {...register("location")}
                            type="text"
                            placeholder="City, Country"
                            className="w-full px-3 py-2 border border-background-dark rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-text-dark mb-2">
                            Website
                          </label>
                          <input
                            {...register("website")}
                            type="url"
                            placeholder="https://yourwebsite.com"
                            className="w-full px-3 py-2 border border-background-dark rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Professional Information */}
                    {user?.profile?.account_type === "corporate" && (
                      <div>
                        <h3 className="text-lg font-medium text-text-dark mb-4">
                          Professional Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-text-dark mb-2">
                              Company name
                            </label>
                            <input
                              {...register("companyName")}
                              type="text"
                              className="w-full px-3 py-2 border border-background-dark rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-text-dark mb-2">
                              Job title
                            </label>
                            <input
                              {...register("jobTitle")}
                              type="text"
                              className="w-full px-3 py-2 border border-background-dark rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Bio */}
                    <div>
                      <label className="block text-sm font-medium text-text-dark mb-2">
                        Bio
                      </label>
                      <textarea
                        {...register("bio")}
                        rows={4}
                        placeholder="Tell us about yourself..."
                        className="w-full px-3 py-2 border border-background-dark rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                      />
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={loading || !isDirty}
                        className={`flex items-center px-6 py-2 rounded-lg font-medium transition-colors ${
                          loading || !isDirty
                            ? "bg-background-dark text-text-muted cursor-not-allowed"
                            : "bg-primary text-white hover:bg-primary-dark"
                        }`}
                      >
                        {loading ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4 mr-2" />
                            Save Changes
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Account Tab */}
              {activeTab === "account" && (
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-text-dark mb-6">
                    Account Settings
                  </h2>

                  <div className="space-y-6">
                    {/* Account Type */}
                    <div className="flex items-center justify-between p-4 bg-background-light rounded-lg">
                      <div>
                        <h3 className="font-medium text-text-dark">
                          Account Type
                        </h3>
                        <p className="text-sm text-text-light capitalize">
                          {user?.profile?.account_type || "Individual"} Account
                        </p>
                      </div>
                      <span className="px-3 py-1 bg-primary/10 text-primary text-sm font-medium rounded-full">
                        Active
                      </span>
                    </div>

                    {/* Change Password */}
                    <div className="border border-background-dark rounded-lg p-4">
                      <h3 className="font-medium text-text-dark mb-2">
                        Password
                      </h3>
                      <p className="text-sm text-text-light mb-4">
                        Last changed 30 days ago
                      </p>
                      <button className="px-4 py-2 border border-primary text-primary rounded-lg hover:bg-primary-light transition-colors">
                        Change Password
                      </button>
                    </div>

                    {/* Two-Factor Authentication */}
                    <div className="border border-background-dark rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-text-dark">
                            Two-Factor Authentication
                          </h3>
                          <p className="text-sm text-text-light">
                            Add an extra layer of security to your account
                          </p>
                        </div>
                        <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors">
                          Enable
                        </button>
                      </div>
                    </div>

                    {/* Danger Zone */}
                    <div className="border border-red-200 rounded-lg p-4 bg-red-50">
                      <h3 className="font-medium text-red-900 mb-2">
                        Danger Zone
                      </h3>
                      <p className="text-sm text-red-700 mb-4">
                        Once you delete your account, there is no going back.
                        Please be certain.
                      </p>
                      <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                        Delete Account
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Notifications Tab */}
              {activeTab === "notifications" && (
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-text-dark mb-6">
                    Notification Preferences
                  </h2>

                  <div className="space-y-6">
                    {/* Email Notifications */}
                    <div>
                      <h3 className="font-medium text-text-dark mb-4">
                        Email Notifications
                      </h3>
                      <div className="space-y-3">
                        <label className="flex items-center justify-between">
                          <span className="text-text-dark">
                            Course updates and announcements
                          </span>
                          <input
                            type="checkbox"
                            className="toggle"
                            defaultChecked
                          />
                        </label>
                        <label className="flex items-center justify-between">
                          <span className="text-text-dark">
                            New course recommendations
                          </span>
                          <input type="checkbox" className="toggle" />
                        </label>
                        <label className="flex items-center justify-between">
                          <span className="text-text-dark">
                            Marketing emails
                          </span>
                          <input type="checkbox" className="toggle" />
                        </label>
                      </div>
                    </div>

                    {/* Push Notifications */}
                    <div>
                      <h3 className="font-medium text-text-dark mb-4">
                        Push Notifications
                      </h3>
                      <div className="space-y-3">
                        <label className="flex items-center justify-between">
                          <span className="text-text-dark">
                            Assignment reminders
                          </span>
                          <input
                            type="checkbox"
                            className="toggle"
                            defaultChecked
                          />
                        </label>
                        <label className="flex items-center justify-between">
                          <span className="text-text-dark">
                            Achievement notifications
                          </span>
                          <input
                            type="checkbox"
                            className="toggle"
                            defaultChecked
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Privacy Tab */}
              {activeTab === "privacy" && (
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-text-dark mb-6">
                    Privacy Settings
                  </h2>

                  <div className="space-y-6">
                    <div className="border border-background-dark rounded-lg p-4">
                      <h3 className="font-medium text-text-dark mb-2">
                        Profile Visibility
                      </h3>
                      <p className="text-sm text-text-light mb-4">
                        Choose who can see your learning progress and
                        achievements
                      </p>
                      <select className="w-full px-3 py-2 border border-background-dark rounded-lg">
                        <option>Public</option>
                        <option>Organization only</option>
                        <option>Private</option>
                      </select>
                    </div>

                    <div className="border border-background-dark rounded-lg p-4">
                      <h3 className="font-medium text-text-dark mb-2">
                        Data Export
                      </h3>
                      <p className="text-sm text-text-light mb-4">
                        Download a copy of your data
                      </p>
                      <button className="px-4 py-2 border border-primary text-primary rounded-lg hover:bg-primary-light transition-colors">
                        Request Data Export
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
