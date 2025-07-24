// src/utils/profileUtils.js - Utility functions for profile management
export const profileUtils = {
  // Verify if user has a valid profile
  async verifyProfile(userId) {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, email, created_at")
        .eq("id", userId)
        .single();

      return {
        exists: !error && !!data,
        profile: data,
        error: error
      };
    } catch (error) {
      return {
        exists: false,
        profile: null,
        error: error
      };
    }
  },

  // Fix profile ID mismatch issues
  async fixProfileIdMismatch() {
    try {
      // Get current authenticated user
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error("Not authenticated");
      }

      // Check if profile exists with correct ID
      const { exists, profile } = await this.verifyProfile(user.id);
      
      if (!exists) {
        
        const newProfile = {
          id: user.id,
          email: user.email,
          first_name: user.user_metadata?.first_name || "",
          last_name: user.user_metadata?.last_name || "",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        const { data, error } = await supabase
          .from("profiles")
          .insert(newProfile)
          .select()
          .single();

        if (error) throw error;
        
        return { success: true, profile: data };
      }

      return { success: true, profile };

    } catch (error) {
      console.error("❌ Error fixing profile:", error);
      return { success: false, error };
    }
  },

  // Debug function to check all profile-related data
  async debugProfileData() {
    
    try {
      // 1. Check authentication
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (!user) {
        return;
      }

      // 2. Check profile existence
      const { data: profiles, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id);


      // 3. Check RLS policies
      const { data: { session } } = await supabase.auth.getSession();

      // 4. Test profile permissions
      const { data: testInsert, error: insertError } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", user.id)
        .limit(1);

    } catch (error) {
      console.error("❌ Debug error:", error);
    }
    
    console.groupEnd();
  }
};
