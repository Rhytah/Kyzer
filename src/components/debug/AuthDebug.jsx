// src/components/debug/AuthDebug.jsx - Temporary debug component
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/auth/useAuth';
import { supabase } from '@/lib/supabase';

export default function AuthDebug() {
  const { user, profile, createUserProfile } = useAuth();
  const [allProfiles, setAllProfiles] = useState([]);
  const [allOrgs, setAllOrgs] = useState([]);
  const [authUsers, setAuthUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchDebugData = async () => {
      try {
        // Get all profiles
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, email, account_type, organization_id, role, created_at')
          .order('created_at', { ascending: false });
        
        // Get all organizations  
        const { data: orgs } = await supabase
          .from('organizations')
          .select('id, name, slug, subscription_status, max_employees, created_at')
          .order('created_at', { ascending: false });
          
        setAllProfiles(profiles || []);
        setAllOrgs(orgs || []);
      } catch (error) {
        console.error('Debug data fetch error:', error);
      }
    };

    fetchDebugData();
  }, []);

  const createMissingProfile = async () => {
    if (!user) {
      alert('No user logged in');
      return;
    }
    
    setLoading(true);
    try {
      
      const result = await createUserProfile(user, user.user_metadata);
      
      alert('Profile created successfully! Check console for details.');
      window.location.reload();
    } catch (error) {
      console.error('🔴 Profile creation failed:', error);
      alert(`Profile creation failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testCorporateSignup = async () => {
    if (!user) {
      alert('No user logged in');
      return;
    }
    
    setLoading(true);
    try {
      // Test data for corporate signup
      const testCorporateData = {
        account_type: 'corporate',
        first_name: 'Test',
        last_name: 'Admin',
        job_title: 'CEO',
        company_name: 'Test Corp',
        employee_count: '11-50'
      };
      
      const result = await createUserProfile(user, testCorporateData);
      
      alert('Corporate profile created successfully! Check console for details.');
      window.location.reload();
    } catch (error) {
      console.error('🔴 Corporate profile creation failed:', error);
      alert(`Corporate profile creation failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-gray-50 border rounded-lg mb-6">
      <h3 className="text-lg font-bold mb-4 text-gray-900">🐛 Auth Debug Panel</h3>
      
      <div className="grid gap-4">
        {/* Current User Info */}
        <div>
          <h4 className="font-semibold text-gray-800 mb-2">Current User:</h4>
          <div className="bg-white p-3 rounded border text-xs font-mono">
            <div><strong>ID:</strong> {user?.id || 'Not logged in'}</div>
            <div><strong>Email:</strong> {user?.email || 'N/A'}</div>
            <div><strong>Email Confirmed:</strong> {user?.email_confirmed_at ? 'Yes' : 'No'}</div>
            <div><strong>Metadata:</strong> {JSON.stringify(user?.user_metadata, null, 2)}</div>
          </div>
        </div>

        {/* Current Profile */}
        <div>
          <h4 className="font-semibold text-gray-800 mb-2">Current Profile:</h4>
          <div className="bg-white p-3 rounded border text-xs font-mono">
            {profile ? (
              <>
                <div><strong>Account Type:</strong> {profile.account_type}</div>
                <div><strong>Role:</strong> {profile.role}</div>
                <div><strong>Organization ID:</strong> {profile.organization_id || 'None'}</div>
                <div><strong>Company Name:</strong> {profile.company_name || 'None'}</div>
              </>
            ) : (
              <div className="text-red-600">❌ No profile found</div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          {user && !profile && (
            <>
              <button 
                onClick={createMissingProfile}
                disabled={loading}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded text-sm disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create Individual Profile'}
              </button>
              
              <button 
                onClick={testCorporateSignup}
                disabled={loading}
                className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded text-sm disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Test Corporate Profile'}
              </button>
            </>
          )}
        </div>

        {/* All Profiles */}
        <div>
          <h4 className="font-semibold text-gray-800 mb-2">All Profiles ({allProfiles.length}):</h4>
          <div className="bg-white p-3 rounded border max-h-32 overflow-y-auto">
            {allProfiles.length === 0 ? (
              <div className="text-red-600 text-sm">❌ No profiles found in database</div>
            ) : (
              allProfiles.map(p => (
                <div key={p.id} className="text-xs border-b py-1 flex justify-between">
                  <span>{p.email}</span>
                  <span className="font-semibold">{p.account_type}</span>
                  <span className="text-gray-500">Org: {p.organization_id || 'None'}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* All Organizations */}
        <div>
          <h4 className="font-semibold text-gray-800 mb-2">All Organizations ({allOrgs.length}):</h4>
          <div className="bg-white p-3 rounded border max-h-32 overflow-y-auto">
            {allOrgs.length === 0 ? (
              <div className="text-red-600 text-sm">❌ No organizations found</div>
            ) : (
              allOrgs.map(org => (
                <div key={org.id} className="text-xs border-b py-1 flex justify-between">
                  <span>{org.name}</span>
                  <span className="text-gray-500">({org.slug})</span>
                  <span className="font-semibold">{org.subscription_status}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-yellow-50 border border-yellow-200 p-3 rounded">
          <h5 className="font-semibold text-yellow-800 mb-1">Testing Instructions:</h5>
          <ol className="text-xs text-yellow-700 space-y-1">
            <li>1. Sign up with a new email (corporate account)</li>
            <li>2. Check email and click verification link</li>
            <li>3. Should redirect to /auth/callback</li>
            <li>4. AuthCallback should create profile + organization</li>
            <li>5. Should redirect to dashboard</li>
          </ol>
        </div>
      </div>
    </div>
  );
}