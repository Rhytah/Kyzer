// src/lib/supabase.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables')
  console.log('Make sure you have VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file')
}

// Create Supabase client
export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '', {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  },
  db: {
    schema: 'public'
  },
  global: {
    headers: {
      'X-Client-Info': 'kyzer-lms@1.0.0'
    }
  }
})

export default supabase

// Database helper functions
export const db = {
  // Profiles
  profiles: {
    async create(profile) {
      const { data, error } = await supabase
        .from('profiles')
        .insert(profile)
        .select()
        .single()
      
      if (error) throw error
      return data
    },

    async getById(id) {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single()
      
      if (error && error.code !== 'PGRST116') throw error
      return data
    },

    async update(id, updates) {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      return data
    }
  },

  // Organizations (for corporate accounts)
  organizations: {
    async create(organization) {
      const { data, error } = await supabase
        .from('organizations')
        .insert(organization)
        .select()
        .single()
      
      if (error) throw error
      return data
    },

    async getById(id) {
      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', id)
        .single()
      
      if (error && error.code !== 'PGRST116') throw error
      return data
    },

    async getByOwnerId(ownerId) {
      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .eq('owner_id', ownerId)
        .single()
      
      if (error && error.code !== 'PGRST116') throw error
      return data
    }
  },

  // Courses
  courses: {
    async getAll(filters = {}) {
      let query = supabase
        .from('courses')
        .select(`
          *,
          categories(name),
          course_enrollments(id, user_id, progress, completed_at)
        `)
        .eq('published', true)

      if (filters.category) {
        query = query.eq('category_id', filters.category)
      }

      if (filters.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
      }

      const { data, error } = await query.order('created_at', { ascending: false })
      
      if (error) throw error
      return data
    },

    async getById(id) {
      const { data, error } = await supabase
        .from('courses')
        .select(`
          *,
          categories(name),
          course_modules(
            id,
            title,
            description,
            order_index,
            lessons(
              id,
              title,
              type,
              content_url,
              duration,
              order_index
            )
          )
        `)
        .eq('id', id)
        .single()
      
      if (error) throw error
      return data
    }
  },

  // Enrollments
  enrollments: {
    async create(enrollment) {
      const { data, error } = await supabase
        .from('course_enrollments')
        .insert(enrollment)
        .select()
        .single()
      
      if (error) throw error
      return data
    },

    async getUserEnrollments(userId) {
      const { data, error } = await supabase
        .from('course_enrollments')
        .select(`
          *,
          courses(
            id,
            title,
            description,
            thumbnail_url,
            duration,
            difficulty
          )
        `)
        .eq('user_id', userId)
        .order('enrolled_at', { ascending: false })
      
      if (error) throw error
      return data
    },

    async getByUserAndCourse(userId, courseId) {
      const { data, error } = await supabase
        .from('course_enrollments')
        .select('*')
        .eq('user_id', userId)
        .eq('course_id', courseId)
        .single()
      
      if (error && error.code !== 'PGRST116') throw error
      return data
    }
  }
}

// Storage helpers
export const storage = {
  async uploadFile(bucket, path, file) {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file)
    
    if (error) throw error
    return data
  },

  async getPublicUrl(bucket, path) {
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(path)
    
    return data.publicUrl
  },

  async deleteFile(bucket, path) {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path])
    
    if (error) throw error
  }
}

// Real-time helpers
export const realtime = {
  subscribeToTable(table, callback, filter = null) {
    let subscription = supabase
      .channel(`public:${table}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: table,
        ...(filter && { filter })
      }, callback)
      .subscribe()

    return subscription
  },

  unsubscribe(subscription) {
    if (subscription) {
      supabase.removeChannel(subscription)
    }
  }
}

