// src/pages/dashboard/Profile.jsx
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/auth/useAuth";
import { Loader2 } from "lucide-react";
import ProfileContent from "../../components/Profile/ProfileContent";
export default function Profile() {
  const { user, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background-light flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-light">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
          {/* <ProfileTab activeTab={activeTab} setActiveTab={setActiveTab} /> */}

          {/* Main Content */}
          <div className="flex-1">
            <div className="bg-white rounded-xl border border-background-dark">
              <ProfileContent activeTab={activeTab} user={user} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
