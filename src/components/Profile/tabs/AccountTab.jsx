// src/components/profile/tabs/AccountTab.jsx
import { useState } from "react";
import { Shield, AlertCircle, Key, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import ConfirmDialog from "@/components/common/ConfirmDialog";

export default function AccountTab({ user }) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handlePasswordChange = () => {
    // This would typically open a modal or redirect to password change page
    toast.info("Password change functionality coming soon");
  };

  const handleEnable2FA = () => {
    // This would open 2FA setup modal
    toast.info("Two-factor authentication setup coming soon");
  };

  const handleDeleteAccount = async () => {
    try {
      // Implement account deletion logic
      toast.success("Account deletion request submitted");
      setShowDeleteDialog(false);
    } catch (error) {
      toast.error("Failed to delete account");
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold text-text-dark mb-6">
        Account Settings
      </h2>

      <div className="space-y-6">
        {/* Account Type */}
        <div className="flex items-center justify-between p-4 bg-background-light rounded-lg border border-background-dark">
          <div>
            <h3 className="font-medium text-text-dark">Account Type</h3>
            <p className="text-sm text-text-light capitalize">
              {user?.profile?.account_type || "Individual"} Account
            </p>
          </div>
          <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
            Active
          </span>
        </div>

        {/* Change Password */}
        <div className="border border-background-dark rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <Key className="w-5 h-5 text-text-light mt-0.5" />
            <div className="flex-1">
              <h3 className="font-medium text-text-dark mb-1">Password</h3>
              <p className="text-sm text-text-light mb-4">
                Keep your account secure with a strong password
              </p>
              <button
                onClick={handlePasswordChange}
                className="px-4 py-2 border border-primary text-primary rounded-lg hover:bg-primary hover:text-white transition-colors"
              >
                Change Password
              </button>
            </div>
          </div>
        </div>

        {/* Two-Factor Authentication */}
        <div className="border border-background-dark rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <Shield className="w-5 h-5 text-text-light mt-0.5" />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-text-dark">
                    Two-Factor Authentication
                  </h3>
                  <p className="text-sm text-text-light">
                    Add an extra layer of security to your account
                  </p>
                </div>
                <button
                  onClick={handleEnable2FA}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                >
                  Enable
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Session Management */}
        <div className="border border-background-dark rounded-lg p-4">
          <h3 className="font-medium text-text-dark mb-2">Active Sessions</h3>
          <p className="text-sm text-text-light mb-4">
            Manage where you're signed in
          </p>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-background-light rounded-lg">
              <div>
                <p className="font-medium text-text-dark">Current Device</p>
                <p className="text-sm text-text-light">
                  Chrome on macOS • Last active now
                </p>
              </div>
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                Active
              </span>
            </div>
          </div>
          <button className="mt-3 text-sm text-primary hover:text-primary-dark">
            Sign out of all other sessions
          </button>
        </div>

        {/* Danger Zone */}
        <div className="border border-red-200 rounded-lg p-4 bg-red-50">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-medium text-red-900 mb-1">Danger Zone</h3>
              <p className="text-sm text-red-700 mb-4">
                Once you delete your account, there is no going back. Please be
                certain.
              </p>
              <button
                onClick={() => setShowDeleteDialog(true)}
                className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Account Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDeleteAccount}
        title="Delete Account"
        description="Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently removed."
        confirmText="Delete Account"
        confirmVariant="danger"
      />
    </div>
  );
}
