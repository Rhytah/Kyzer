// supabase/functions/create-user-direct/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create Supabase admin client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    const { email, password, firstName, lastName, role, departmentId, organizationId, invitedBy } = await req.json()

    if (!email) {
      return new Response(
        JSON.stringify({ error: 'Email is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Password is only required for new users
    // If user exists, we'll add them without password

    // Check if user already exists by checking profiles table
    const { data: existingProfile } = await supabaseAdmin
      .from('profiles')
      .select('id, email')
      .eq('email', email)
      .single()

    let userId = null
    let isNewUser = false

    if (existingProfile) {
      // User already exists - check if they're already in this organization
      userId = existingProfile.id
      
      if (organizationId) {
        const { data: existingMember } = await supabaseAdmin
          .from('organization_members')
          .select('id, status')
          .eq('organization_id', organizationId)
          .eq('user_id', userId)
          .single()

        if (existingMember) {
          if (existingMember.status === 'active') {
            return new Response(
              JSON.stringify({ error: 'User is already a member of this organization' }),
              { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
          } else {
            // Reactivate the member
            const { error: updateError } = await supabaseAdmin
              .from('organization_members')
              .update({
                status: 'active',
                role: role || 'employee',
                department_id: departmentId || null,
                joined_at: new Date().toISOString()
              })
              .eq('id', existingMember.id)

            if (updateError) {
              return new Response(
                JSON.stringify({ error: `Failed to reactivate member: ${updateError.message}` }),
                { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
              )
            }

            return new Response(
              JSON.stringify({ 
                success: true,
                user: {
                  id: userId,
                  email: email
                },
                action: 'added_to_organization'
              }),
              { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
          }
        } else {
          // User exists but not in this organization - add them without creating new account
          const { error: memberError } = await supabaseAdmin
            .from('organization_members')
            .insert({
              organization_id: organizationId,
              user_id: userId,
              role: role || 'employee',
              status: 'active',
              department_id: departmentId || null,
              joined_at: new Date().toISOString(),
              invited_by: invitedBy || null
            })

          if (memberError) {
            return new Response(
              JSON.stringify({ error: `Failed to add user to organization: ${memberError.message}` }),
              { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
          }

          return new Response(
            JSON.stringify({ 
              success: true,
              user: {
                id: userId,
                email: email
              },
              action: 'added_to_organization'
            }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
      } else {
        return new Response(
          JSON.stringify({ error: 'User already exists and no organization provided' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

    // If we reach here, user doesn't exist - create new user
    isNewUser = true

    // Password is required for new users
    if (!password) {
      return new Response(
        JSON.stringify({ error: 'Password is required for new users' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create user with admin API
    const { data: authUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Skip email confirmation
      user_metadata: {
        first_name: firstName || '',
        last_name: lastName || '',
        full_name: `${firstName || ''} ${lastName || ''}`.trim() || email,
        account_type: 'corporate'
      }
    })

    if (createError) {
      return new Response(
        JSON.stringify({ error: createError.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!authUser.user) {
      return new Response(
        JSON.stringify({ error: 'Failed to create user' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    userId = authUser.user.id

    // Create profile
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: authUser.user.id,
        email: authUser.user.email,
        first_name: firstName || '',
        last_name: lastName || '',
        account_type: 'corporate',
        role: 'learner',
        status: 'active',
        auth_user_id: authUser.user.id
      })

    if (profileError) {
      // Try to delete the auth user if profile creation fails
      await supabaseAdmin.auth.admin.deleteUser(authUser.user.id)
      return new Response(
        JSON.stringify({ error: `Failed to create profile: ${profileError.message}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Add to organization if provided
    if (organizationId) {
      const { error: memberError } = await supabaseAdmin
        .from('organization_members')
        .insert({
          organization_id: organizationId,
          user_id: authUser.user.id,
          role: role || 'employee',
          status: 'active',
          department_id: departmentId || null,
          joined_at: new Date().toISOString(),
          invited_by: invitedBy || null
        })

      if (memberError) {
        console.error('Failed to add user to organization:', memberError)
        // Don't fail the whole operation, just log the error
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        user: {
          id: authUser.user.id,
          email: authUser.user.email
        },
        action: 'created'
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
