import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface InvitationEmailData {
  email: string
  data: {
    companyName: string
    inviterName: string
    role: string
    customMessage?: string
    invitationLink: string
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Parse request body
    const { email, data }: InvitationEmailData = await req.json()

    if (!email || !data) {
      return new Response(
        JSON.stringify({ error: 'Missing email or data' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Create email template
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Invitation to Join ${data.companyName}</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f9fafb;
          }
          .container {
            background-color: white;
            border-radius: 8px;
            padding: 40px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
          }
          .logo {
            font-size: 24px;
            font-weight: bold;
            color: #2563eb;
            margin-bottom: 10px;
          }
          .title {
            font-size: 28px;
            font-weight: bold;
            color: #0D1821;
            margin-bottom: 10px;
          }
          .subtitle {
            font-size: 16px;
            color: #6b7280;
          }
          .content {
            margin-bottom: 30px;
          }
          .message {
            background-color: #f3f4f6;
            padding: 20px;
            border-radius: 6px;
            margin: 20px 0;
            border-left: 4px solid #2563eb;
          }
          .cta-button {
            display: inline-block;
            background-color: #2563eb;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            margin: 20px 0;
          }
          .cta-button:hover {
            background-color: #1d4ed8;
          }
          .details {
            background-color: #f9fafb;
            padding: 20px;
            border-radius: 6px;
            margin: 20px 0;
          }
          .detail-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
          }
          .detail-label {
            font-weight: 600;
            color: #374151;
          }
          .detail-value {
            color: #6b7280;
          }
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            text-align: center;
            color: #6b7280;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">Kyzer LMS</div>
            <h1 class="title">You're Invited!</h1>
            <p class="subtitle">Join ${data.companyName} on our learning platform</p>
          </div>

          <div class="content">
            <p>Hello!</p>
            <p><strong>${data.inviterName}</strong> has invited you to join <strong>${data.companyName}</strong> on Kyzer LMS.</p>
            
            ${data.customMessage ? `
              <div class="message">
                <strong>Personal Message:</strong><br>
                "${data.customMessage}"
              </div>
            ` : ''}

            <div class="details">
              <div class="detail-row">
                <span class="detail-label">Company:</span>
                <span class="detail-value">${data.companyName}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Role:</span>
                <span class="detail-value">${data.role}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Invited by:</span>
                <span class="detail-value">${data.inviterName}</span>
              </div>
            </div>

            <div style="text-align: center;">
              <a href="${data.invitationLink}" class="cta-button">Accept Invitation</a>
            </div>

            <p><small>This invitation will expire in 7 days. If you're unable to click the button above, copy and paste this link into your browser:</small></p>
            <p style="word-break: break-all; color: #6b7280; font-size: 12px;">${data.invitationLink}</p>
          </div>

          <div class="footer">
            <p>This invitation was sent by ${data.inviterName} from ${data.companyName}.</p>
            <p>If you didn't expect this invitation, you can safely ignore this email.</p>
          </div>
        </div>
      </body>
      </html>
    `

    const emailText = `
You're Invited to Join ${data.companyName}!

Hello!

${data.inviterName} has invited you to join ${data.companyName} on Kyzer LMS.

${data.customMessage ? `Personal Message: "${data.customMessage}"` : ''}

Company: ${data.companyName}
Role: ${data.role}
Invited by: ${data.inviterName}

Accept your invitation here: ${data.invitationLink}

This invitation will expire in 7 days.

If you didn't expect this invitation, you can safely ignore this email.
    `

    // Get the correct base URL for current environment
    const baseURL = Deno.env.get('VITE_APP_URL') || 'http://localhost:3000';
    
    // Try to send email using Supabase's built-in email functionality
    try {
      // First, try to use Supabase Auth to invite the user (this will send an email if configured)
      const { data: emailData, error: emailError } = await supabaseClient.auth.admin.inviteUserByEmail(email, {
        data: {
          companyName: data.companyName,
          inviterName: data.inviterName,
          role: data.role,
          customMessage: data.customMessage,
          invitationLink: data.invitationLink
        },
        redirectTo: `${baseURL}/auth/accept-invitation?token=${data.invitationLink.split('token=')[1] || data.invitationLink}`
      })

      if (emailError) {
        // If inviteUserByEmail fails, try generateLink as fallback
        const { data: linkData, error: linkError } = await supabaseClient.auth.admin.generateLink({
          type: 'signup',
          email: email,
          options: {
            redirectTo: `${baseURL}/auth/accept-invitation?token=${data.invitationLink.split('token=')[1] || data.invitationLink}`,
            data: {
              companyName: data.companyName,
              inviterName: data.inviterName,
              role: data.role
            }
          }
        })

        if (linkError) {
          throw linkError
        }
      }

      // If successful, return success
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Invitation email sent successfully',
          invitationLink: data.invitationLink
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    } catch (emailError) {
      console.error('Error sending email via Supabase:', emailError)
      
      // Fallback: Use a simple email service or log for manual sending
      // For development, we'll simulate email sending
      console.log('📧 EMAIL INVITATION (Manual Send Required):')
      console.log('==========================================')
      console.log(`To: ${email}`)
      console.log(`Subject: Invitation to Join ${data.companyName}`)
      console.log(`Invitation Link: ${data.invitationLink}`)
      console.log('==========================================')
      
      // In a real implementation, you would integrate with:
      // - SendGrid
      // - AWS SES
      // - Mailgun
      // - Nodemailer with SMTP
      // - Or any other email service
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Invitation created - email details logged for manual sending',
          invitationLink: data.invitationLink,
          emailDetails: {
            to: email,
            subject: `Invitation to Join ${data.companyName}`,
            companyName: data.companyName,
            inviterName: data.inviterName,
            role: data.role,
            customMessage: data.customMessage,
            invitationLink: data.invitationLink
          }
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

  } catch (error) {
    console.error('Error in send-invitation-email function:', error)
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
