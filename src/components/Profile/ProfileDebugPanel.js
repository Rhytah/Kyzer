// src/components/profile/ProfileDebugPanel.jsx - Debug component
import { useState } from "react";
import { useProfile } from "@/hooks/auth/useProfile";
import { useAuth } from "@/hooks/auth/useAuth";
import { profileUtils } from "@/utils/profileUtils";

export default function ProfileDebugPanel() {
  const { user } = useAuth();
  const { debugUserAuth, profileData } = useProfile();
  const [debugResults, setDebugResults] = useState(null);

  const runFullDebug = async () => {
    
    const results = {
      userAuth: await debugUserAuth(),
      profileVerification: await profileUtils.verifyProfile(user?.id),
      profileData: profileData,
      timestamp: new Date().toISOString()
    };
    
    setDebugResults(results);
    await profileUtils.debugProfileData();
  };

  const fixProfile = async () => {
    const result = await profileUtils.fixProfileIdMismatch();
    setDebugResults(prev => ({ ...prev, fixResult: result }));
  };

  if (process.env.NODE_ENV !== 'development') {
    return null; // Only show in development
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-300 rounded-lg p-4 shadow-lg max-w-md">
      <h3 className="font-bold text-sm mb-2">🔧 Profile Debug Panel</h3>
      
      <div className="space-y-2 text-xs">
        <button
          onClick={runFullDebug}
          className="w-full px-2 py-1 bg-blue-500 text-white rounded text-xs"
        >
          Run Debug
        </button>
        
        <button
          onClick={fixProfile}
          className="w-full px-2 py-1 bg-green-500 text-white rounded text-xs"
        >
          Fix Profile
        </button>
        
        {debugResults && (
          <div className="mt-2 p-2 bg-gray-100 rounded text-xs">
            <pre className="whitespace-pre-wrap">
              {JSON.stringify(debugResults, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}