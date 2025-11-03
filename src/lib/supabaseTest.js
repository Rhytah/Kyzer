// src/lib/supabaseTest.js - Debug Supabase connection issues
import { supabase } from './supabase';

export const testSupabaseConnection = async () => {
  try {
    console.log('🔍 Testing Supabase connection... (not logging secrets)');
    
    // Test basic connection
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('❌ Supabase connection failed:', error);
      return { success: false, error };
    }
    
    console.log('✅ Supabase connection successful:', data);
    return { success: true, data };
    
  } catch (error) {
    console.error('❌ Supabase connection error:', error);
    return { success: false, error };
  }
};

export const testSupabaseAuth = async () => {
  try {
    console.log('🔍 Testing Supabase auth...');
    
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('❌ Supabase auth failed:', error);
      return { success: false, error };
    }
    
    console.log('✅ Supabase auth successful:', data);
    return { success: true, data };
    
  } catch (error) {
    console.error('❌ Supabase auth error:', error);
    return { success: false, error };
  }
};

