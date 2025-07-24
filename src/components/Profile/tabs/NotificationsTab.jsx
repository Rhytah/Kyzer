// src/components/profile/tabs/NotificationsTab.jsx
import { useState, useEffect } from "react";
import { Bell, Mail, Smartphone } from "lucide-react";
import Toggle from "@/components/ui/Toggle";
import { useNotificationSettings } from "@/hooks/auth/useNotificationSettings";
import toast from "react-hot-toast";

export default function NotificationsTab({ user }) {
  const { settings, updateSettings, loading } = useNotificationSettings();
  const [localSettings, setLocalSettings] = useState({
    email: {
      courseUpdates: true,
      newCourses: false,
      marketing: false,
      weeklyDigest: true,
    },
    push: {
      assignmentReminders: true,
      achievements: true,
      deadlines: true,
    },
    inApp: {
      messages: true,
      announcements: true,
    },
  });

  useEffect(() => {
    if (settings) {
      setLocalSettings(settings);
    }
  }, [settings]);

  const handleToggle = async (category, setting) => {
    const newSettings = {
      ...localSettings,
      [category]: {
        ...localSettings[category],
        [setting]: !localSettings[category][setting],
      },
    };

    setLocalSettings(newSettings);

    try {
      await updateSettings(newSettings);
    } catch (error) {
      // Revert on error
      setLocalSettings(localSettings);
      toast.error("Failed to update notification settings");
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold text-text-dark mb-6">
        Notification Preferences
      </h2>

      <div className="space-y-8">
        {/* Email Notifications */}
        <div>
          <div className="flex items-center space-x-3 mb-4">
            <Mail className="w-5 h-5 text-text-light" />
            <h3 className="font-medium text-text-dark">Email Notifications</h3>
          </div>
          <div className="space-y-4 ml-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-text-dark">Course updates</p>
                <p className="text-sm text-text-light">
                  Get notified about course content changes and announcements
                </p>
              </div>
              <Toggle
                checked={localSettings.email.courseUpdates}
                onChange={() => handleToggle("email", "courseUpdates")}
                disabled={loading}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-text-dark">New course recommendations</p>
                <p className="text-sm text-text-light">
                  Receive suggestions for courses that match your interests
                </p>
              </div>
              <Toggle
                checked={localSettings.email.newCourses}
                onChange={() => handleToggle("email", "newCourses")}
                disabled={loading}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-text-dark">Weekly digest</p>
                <p className="text-sm text-text-light">
                  Summary of your learning progress and activities
                </p>
              </div>
              <Toggle
                checked={localSettings.email.weeklyDigest}
                onChange={() => handleToggle("email", "weeklyDigest")}
                disabled={loading}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-text-dark">Marketing emails</p>
                <p className="text-sm text-text-light">
                  Updates about new features and promotional content
                </p>
              </div>
              <Toggle
                checked={localSettings.email.marketing}
                onChange={() => handleToggle("email", "marketing")}
                disabled={loading}
              />
            </div>
          </div>
        </div>

        {/* Push Notifications */}
        <div>
          <div className="flex items-center space-x-3 mb-4">
            <Smartphone className="w-5 h-5 text-text-light" />
            <h3 className="font-medium text-text-dark">Push Notifications</h3>
          </div>
          <div className="space-y-4 ml-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-text-dark">Assignment reminders</p>
                <p className="text-sm text-text-light">
                  Reminders about upcoming assignments and deadlines
                </p>
              </div>
              <Toggle
                checked={localSettings.push.assignmentReminders}
                onChange={() => handleToggle("push", "assignmentReminders")}
                disabled={loading}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-text-dark">Achievement notifications</p>
                <p className="text-sm text-text-light">
                  Celebrate your progress with achievement notifications
                </p>
              </div>
              <Toggle
                checked={localSettings.push.achievements}
                onChange={() => handleToggle("push", "achievements")}
                disabled={loading}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-text-dark">Deadline alerts</p>
                <p className="text-sm text-text-light">
                  Important deadlines and time-sensitive notifications
                </p>
              </div>
              <Toggle
                checked={localSettings.push.deadlines}
                onChange={() => handleToggle("push", "deadlines")}
                disabled={loading}
              />
            </div>
          </div>
        </div>

        {/* In-App Notifications */}
        <div>
          <div className="flex items-center space-x-3 mb-4">
            <Bell className="w-5 h-5 text-text-light" />
            <h3 className="font-medium text-text-dark">In-App Notifications</h3>
          </div>
          <div className="space-y-4 ml-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-text-dark">Messages</p>
                <p className="text-sm text-text-light">
                  Direct messages from instructors and team members
                </p>
              </div>
              <Toggle
                checked={localSettings.inApp.messages}
                onChange={() => handleToggle("inApp", "messages")}
                disabled={loading}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-text-dark">Announcements</p>
                <p className="text-sm text-text-light">
                  Important system announcements and updates
                </p>
              </div>
              <Toggle
                checked={localSettings.inApp.announcements}
                onChange={() => handleToggle("inApp", "announcements")}
                disabled={loading}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

