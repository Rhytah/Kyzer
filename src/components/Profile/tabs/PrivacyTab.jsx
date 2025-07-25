// src/components/profile/tabs/PrivacyTab.jsx
import { useState } from "react";
import { Shield, Download, Eye, Users, Lock } from "lucide-react";
import toast from "react-hot-toast";

export default function PrivacyTab({ user }) {
  const [profileVisibility, setProfileVisibility] = useState("organization");
  const [dataProcessing, setDataProcessing] = useState(false);

  const handleDataExport = async () => {
    try {
      toast.success("Data export request submitted. You'll receive an email when ready.");
    } catch (error) {
      toast.error("Failed to request data export");
    }
  };

  const handleVisibilityChange = async (visibility) => {
    try {
      setProfileVisibility(visibility);
      toast.success("Privacy settings updated");
    } catch (error) {
      toast.error("Failed to update privacy settings");
    }
  };

  const visibilityOptions = [
    {
      value: "public",
      label: "Public",
      description: "Anyone can see your learning progress and achievements",
      icon: Eye,
    },
    {
      value: "organization",
      label: "Organization Only",
      description: "Only members of your organization can see your profile",
      icon: Users,
    },
    {
      value: "private",
      label: "Private",
      description: "Your profile and progress are completely private",
      icon: Lock,
    },
  ];

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold text-text-dark mb-6">
        Privacy Settings
      </h2>

      <div className="space-y-6">
        {/* Profile Visibility */}
        <div className="border border-background-dark rounded-lg p-4">
          <div className="flex items-start space-x-3 mb-4">
            <Shield className="w-5 h-5 text-text-light mt-0.5" />
            <div>
              <h3 className="font-medium text-text-dark mb-1">
                Profile Visibility
              </h3>
              <p className="text-sm text-text-light">
                Choose who can see your learning progress and achievements
              </p>
            </div>
          </div>

          <div className="space-y-3 ml-8">
            {visibilityOptions.map((option) => (
              <label
                key={option.value}
                className={`flex items-start space-x-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                  profileVisibility === option.value
                    ? "border-primary bg-primary/5"
                    : "border-background-dark hover:bg-background-light"
                }`}
              >
                <input
                  type="radio"
                  name="visibility"
                  value={option.value}
                  checked={profileVisibility === option.value}
                  onChange={() => handleVisibilityChange(option.value)}
                  className="mt-1"
                />
                <option.icon className="w-5 h-5 text-text-light mt-0.5" />
                <div>
                  <p className="font-medium text-text-dark">{option.label}</p>
                  <p className="text-sm text-text-light">{option.description}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Data Export */}
        <div className="border border-background-dark rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <Download className="w-5 h-5 text-text-light mt-0.5" />
            <div className="flex-1">
              <h3 className="font-medium text-text-dark mb-1">Data Export</h3>
              <p className="text-sm text-text-light mb-4">
                Download a copy of all your data including courses, progress,
                and certificates
              </p>
              <button
                onClick={handleDataExport}
                className="px-4 py-2 border border-primary text-primary rounded-lg hover:bg-primary hover:text-white transition-colors"
              >
                Request Data Export
              </button>
            </div>
          </div>
        </div>

        {/* Data Processing */}
        <div className="border border-background-dark rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-text-dark mb-1">
                Analytics & Improvement
              </h3>
              <p className="text-sm text-text-light">
                Help us improve by sharing anonymous usage data
              </p>
            </div>
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={dataProcessing}
                onChange={(e) => setDataProcessing(e.target.checked)}
                className="sr-only"
              />
              <div
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  dataProcessing ? "bg-primary" : "bg-background-dark"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    dataProcessing ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </div>
            </label>
          </div>
        </div>

        {/* Cookie Settings */}
        <div className="border border-background-dark rounded-lg p-4">
          <h3 className="font-medium text-text-dark mb-2">Cookie Preferences</h3>
          <p className="text-sm text-text-light mb-4">
            Manage how we use cookies to enhance your experience
          </p>
          <button className="text-sm text-primary hover:text-primary-dark">
            Manage Cookie Settings
          </button>
        </div>

        {/* Contact Privacy Officer */}
        <div className="bg-background-light border border-background-dark rounded-lg p-4">
          <h3 className="font-medium text-text-dark mb-2">
            Questions about Privacy?
          </h3>
          <p className="text-sm text-text-light mb-3">
            If you have questions about how we handle your data, contact our
            privacy team.
          </p>
          <a
            href="mailto:privacy@kyzer.com"
            className="text-sm text-primary hover:text-primary-dark"
          >
            privacy@kyzer.com
          </a>
        </div>
      </div>
    </div>
  );
}