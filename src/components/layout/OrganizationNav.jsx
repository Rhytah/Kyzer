// src/components/layout/OrganizationNav.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/auth/useAuth';
import { supabase } from '@/lib/supabase';
import { Building2, Users, Crown, Shield } from 'lucide-react';

export default function OrganizationNav() {
  const { user } = useAuth();
  const [organization, setOrganization] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      loadOrganization();
    }
  }, [user?.id]);

  const loadOrganization = async () => {
    try {
      setLoading(true);
      
      const { data: membership, error } = await supabase
        .from('organization_members')
        .select(`
          role,
          status,
          organizations (
            id,
            name,
            domain,
            subscription_status
          )
        `)
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      setOrganization(membership);
    } catch (error) {
      console.error('Error loading organization:', error);
      setOrganization(null);
    } finally {
      setLoading(false);
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin':
        return <Crown className="w-4 h-4" />;
      case 'manager':
        return <Shield className="w-4 h-4" />;
      case 'employee':
        return <Users className="w-4 h-4" />;
      default:
        return <Users className="w-4 h-4" />;
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin':
        return 'text-warning-default';
      case 'manager':
        return 'text-primary-default';
      case 'employee':
        return 'text-success-default';
      default:
        return 'text-text-light';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-3 px-4 py-3 border-b border-background-dark">
        <div className="w-8 h-8 bg-background-dark rounded-lg animate-pulse"></div>
        <div className="flex-1">
          <div className="w-24 h-4 bg-background-dark rounded animate-pulse mb-1"></div>
          <div className="w-16 h-3 bg-background-dark rounded animate-pulse"></div>
        </div>
      </div>
    );
  }

  if (!organization) {
    return null;
  }

  return (
    <div className="border-b border-background-dark bg-background-light/50">
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="w-8 h-8 bg-primary-light rounded-lg flex items-center justify-center">
          <Building2 className="w-4 h-4 text-primary-default" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-text-dark text-sm truncate">
              {organization.organizations.name}
            </h3>
            <div className={`flex items-center gap-1 ${getRoleColor(organization.role)}`}>
              {getRoleIcon(organization.role)}
              <span className="text-xs capitalize">{organization.role}</span>
            </div>
          </div>
          <p className="text-xs text-text-light truncate">
            {organization.organizations.domain || 'Corporate Member'}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <div className={`w-2 h-2 rounded-full ${
            organization.organizations.subscription_status === 'active' 
              ? 'bg-success-default' 
              : 'bg-warning-default'
          }`}></div>
          <span className="text-xs text-text-light">
            {organization.organizations.subscription_status === 'active' ? 'Active' : 'Trial'}
          </span>
        </div>
      </div>
      
      {/* Organization Navigation */}
      <div className="px-4 pb-3">
        <div className="space-y-1">
          <a
            href="/app/corporate/dashboard"
            className="flex items-center gap-3 px-3 py-2 text-sm text-text-light hover:text-text-dark hover:bg-background-light rounded-lg transition-colors"
          >
            <Building2 className="w-4 h-4" />
            Dashboard
          </a>
          <a
            href="/app/corporate/employees"
            className="flex items-center gap-3 px-3 py-2 text-sm text-text-light hover:text-text-dark hover:bg-background-light rounded-lg transition-colors"
          >
            <Users className="w-4 h-4" />
            Employees
          </a>
          <a
            href="/app/corporate/reports"
            className="flex items-center gap-3 px-3 py-2 text-sm text-text-light hover:text-text-dark hover:bg-background-light rounded-lg transition-colors"
          >
            <Shield className="w-4 h-4" />
            Reports
          </a>
          {organization.role === 'admin' && (
            <a
              href="/app/corporate/settings"
              className="flex items-center gap-3 px-3 py-2 text-sm text-text-light hover:text-text-dark hover:bg-background-light rounded-lg transition-colors"
            >
              <Crown className="w-4 h-4" />
              Settings
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
