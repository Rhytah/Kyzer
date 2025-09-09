// Cached Corporate Store Integration
// This file shows how to integrate the cached members approach with your corporate store

// Example corporate store functions that work with cached members

// 1. Fetch organization with cached members
export const fetchCurrentCompany = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Get user's profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, organization_id')
      .eq('auth_user_id', user.id)
      .single();

    if (!profile?.organization_id) {
      return null;
    }

    // Get organization with cached members
    const { data: organization, error } = await supabase
      .from('organizations')
      .select(`
        id,
        name,
        domain,
        email,
        max_employees,
        subscription_status,
        subscription_end_date,
        member_count,
        members
      `)
      .eq('id', profile.organization_id)
      .single();

    if (error) throw error;

    return {
      ...organization,
      // Parse the cached members array
      members: organization.members || [],
      // Add computed fields
      memberCount: organization.member_count || 0,
      cachedMemberCount: organization.members ? organization.members.length : 0
    };
  } catch (error) {
    console.error('Error fetching current company:', error);
    throw error;
  }
};

// 2. Fetch employees using cached data
export const fetchEmployees = async () => {
  try {
    const { currentCompany } = get();
    if (!currentCompany) return [];

    // Use the cached members data directly
    const members = currentCompany.members || [];
    
    // Transform cached data to match your component expectations
    const employees = members.map(member => ({
      id: member.id,
      profile_id: member.profile_id,
      email: member.email,
      first_name: member.first_name,
      last_name: member.last_name,
      full_name: member.full_name,
      role: member.role,
      status: member.status,
      avatar_url: member.avatar_url,
      department_id: member.department_id,
      department_name: member.department_name,
      joined_at: member.joined_at,
      invited_by: member.invited_by,
      invited_at: member.invited_at,
      permissions: member.permissions || {}
    }));

    set({ employees });
    return employees;
  } catch (error) {
    console.error('Error fetching employees:', error);
    throw error;
  }
};

// 3. Add employee using cached function
export const addEmployee = async (profileId, role = 'learner', departmentId = null) => {
  try {
    const { currentCompany } = get();
    if (!currentCompany) throw new Error('No current company');

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Get inviter profile ID
    const { data: inviterProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('auth_user_id', user.id)
      .single();

    // Add member using cached function
    const { data: membershipId, error } = await supabase.rpc('add_organization_member_cached', {
      org_id: currentCompany.id,
      profile_id: profileId,
      member_role: role,
      dept_id: departmentId,
      inviter_id: inviterProfile?.id
    });

    if (error) throw error;

    // Refresh the current company data to get updated members
    await fetchCurrentCompany();
    await fetchEmployees();

    return membershipId;
  } catch (error) {
    console.error('Error adding employee:', error);
    throw error;
  }
};

// 4. Update employee role using cached function
export const updateEmployeeRole = async (profileId, newRole) => {
  try {
    const { currentCompany } = get();
    if (!currentCompany) throw new Error('No current company');

    // Update role using cached function
    const { error } = await supabase.rpc('update_organization_member_role_cached', {
      org_id: currentCompany.id,
      profile_id: profileId,
      new_role: newRole
    });

    if (error) throw error;

    // Refresh the current company data
    await fetchCurrentCompany();
    await fetchEmployees();

    return true;
  } catch (error) {
    console.error('Error updating employee role:', error);
    throw error;
  }
};

// 5. Remove employee using cached function
export const removeEmployee = async (profileId) => {
  try {
    const { currentCompany } = get();
    if (!currentCompany) throw new Error('No current company');

    // Remove member using cached function
    const { error } = await supabase.rpc('remove_organization_member_cached', {
      org_id: currentCompany.id,
      profile_id: profileId
    });

    if (error) throw error;

    // Refresh the current company data
    await fetchCurrentCompany();
    await fetchEmployees();

    return true;
  } catch (error) {
    console.error('Error removing employee:', error);
    throw error;
  }
};

// 6. Search employees using cached search function
export const searchEmployees = async (searchTerm) => {
  try {
    const { currentCompany } = get();
    if (!currentCompany) return [];

    if (!searchTerm.trim()) {
      return await fetchEmployees();
    }

    // Use cached search function
    const { data: searchResults, error } = await supabase.rpc('search_organization_members_cached', {
      org_id: currentCompany.id,
      search_term: searchTerm
    });

    if (error) throw error;

    // Transform results to match component expectations
    const employees = searchResults.map(member => ({
      id: member.id,
      profile_id: member.profile_id,
      email: member.email,
      first_name: member.first_name,
      last_name: member.last_name,
      full_name: member.full_name,
      role: member.role,
      status: member.status,
      avatar_url: member.avatar_url,
      department_name: member.department_name
    }));

    return employees;
  } catch (error) {
    console.error('Error searching employees:', error);
    throw error;
  }
};

// 7. Get employees by role using cached function
export const getEmployeesByRole = async (role) => {
  try {
    const { currentCompany } = get();
    if (!currentCompany) return [];

    // Use cached function to get members by role
    const { data: roleMembers, error } = await supabase.rpc('get_organization_members_by_role_cached', {
      org_id: currentCompany.id,
      member_role: role
    });

    if (error) throw error;

    return roleMembers;
  } catch (error) {
    console.error('Error getting employees by role:', error);
    throw error;
  }
};

// 8. Get organization statistics
export const getOrganizationStats = async () => {
  try {
    const { currentCompany } = get();
    if (!currentCompany) return null;

    const members = currentCompany.members || [];
    
    const stats = {
      totalMembers: currentCompany.member_count || 0,
      cachedMemberCount: members.length,
      admins: members.filter(m => m.role === 'corporate_admin').length,
      instructors: members.filter(m => m.role === 'instructor').length,
      learners: members.filter(m => m.role === 'learner').length,
      managers: members.filter(m => m.role === 'manager').length,
      activeMembers: members.filter(m => m.status === 'active').length,
      pendingMembers: members.filter(m => m.status === 'pending').length
    };

    return stats;
  } catch (error) {
    console.error('Error getting organization stats:', error);
    throw error;
  }
};

// 9. Force refresh cache (useful for debugging or manual refresh)
export const refreshMembersCache = async () => {
  try {
    const { currentCompany } = get();
    if (!currentCompany) throw new Error('No current company');

    // Force refresh the cache
    const { error } = await supabase.rpc('refresh_organization_members_cache', {
      org_id: currentCompany.id
    });

    if (error) throw error;

    // Refresh the current company data
    await fetchCurrentCompany();
    await fetchEmployees();

    return true;
  } catch (error) {
    console.error('Error refreshing members cache:', error);
    throw error;
  }
};

// 10. Check if user is member of organization
export const isUserMember = async (profileId) => {
  try {
    const { currentCompany } = get();
    if (!currentCompany) return false;

    const members = currentCompany.members || [];
    return members.some(member => member.profile_id === profileId);
  } catch (error) {
    console.error('Error checking user membership:', error);
    return false;
  }
};

// 11. Get member details by profile ID
export const getMemberDetails = async (profileId) => {
  try {
    const { currentCompany } = get();
    if (!currentCompany) return null;

    const members = currentCompany.members || [];
    const member = members.find(m => m.profile_id === profileId);
    
    return member || null;
  } catch (error) {
    console.error('Error getting member details:', error);
    return null;
  }
};

// 12. Get members with pagination
export const getMembersPaginated = async (page = 1, limit = 10) => {
  try {
    const { currentCompany } = get();
    if (!currentCompany) return { members: [], total: 0, pages: 0 };

    const members = currentCompany.members || [];
    const total = members.length;
    const pages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    
    const paginatedMembers = members.slice(startIndex, endIndex);

    return {
      members: paginatedMembers,
      total,
      pages,
      currentPage: page,
      hasNextPage: page < pages,
      hasPrevPage: page > 1
    };
  } catch (error) {
    console.error('Error getting paginated members:', error);
    throw error;
  }
};
