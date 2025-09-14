# Email Setup Guide - User Invitation System

This guide explains how to set up the email functionality for user invitations using Supabase Edge Functions.

## 🚀 Quick Start

### 1. Deploy the Edge Function

```bash
# Make sure you have Supabase CLI installed
npm install -g supabase

# Login to Supabase
supabase login

# Deploy the Edge Function
./deploy-edge-function.sh
```

### 2. Test the Invitation System

1. Go to your corporate dashboard
2. Navigate to User Management → Invitations
3. Send a test invitation
4. Check the browser console for invitation details (currently logged for manual sending)

## 📧 Current Implementation

### Edge Function: `send-invitation-email`

**Location:** `supabase/functions/send-invitation-email/`

**Features:**
- ✅ Professional HTML email template
- ✅ Plain text fallback
- ✅ Responsive design
- ✅ Company branding
- ✅ Personal messages
- ✅ Invitation link generation
- ✅ Expiration handling

### Email Template

The system generates beautiful, responsive HTML emails with:
- Company name and branding
- Inviter information
- Role details
- Personal messages (optional)
- Call-to-action button
- Invitation link with 7-day expiration
- Fallback plain text version

## 🔧 Production Setup

### Option 1: SendGrid Integration

1. **Sign up for SendGrid:**
   - Create account at [sendgrid.com](https://sendgrid.com)
   - Get your API key

2. **Update Edge Function:**
   ```typescript
   // In supabase/functions/send-invitation-email/index.ts
   import sgMail from '@sendgrid/mail'
   
   sgMail.setApiKey(Deno.env.get('SENDGRID_API_KEY')!)
   
   // Replace the email sending section with:
   const msg = {
     to: email,
     from: 'noreply@yourcompany.com',
     subject: `Invitation to Join ${data.companyName}`,
     html: emailHtml,
     text: emailText,
   }
   
   await sgMail.send(msg)
   ```

3. **Set Environment Variable:**
   ```bash
   supabase secrets set SENDGRID_API_KEY=your_sendgrid_api_key
   ```

### Option 2: AWS SES Integration

1. **Set up AWS SES:**
   - Create AWS account
   - Verify your domain
   - Get access keys

2. **Update Edge Function:**
   ```typescript
   import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses'
   
   const sesClient = new SESClient({
     region: 'us-east-1',
     credentials: {
       accessKeyId: Deno.env.get('AWS_ACCESS_KEY_ID')!,
       secretAccessKey: Deno.env.get('AWS_SECRET_ACCESS_KEY')!,
     },
   })
   
   const command = new SendEmailCommand({
     Source: 'noreply@yourcompany.com',
     Destination: { ToAddresses: [email] },
     Message: {
       Subject: { Data: `Invitation to Join ${data.companyName}` },
       Body: {
         Html: { Data: emailHtml },
         Text: { Data: emailText },
       },
     },
   })
   
   await sesClient.send(command)
   ```

3. **Set Environment Variables:**
   ```bash
   supabase secrets set AWS_ACCESS_KEY_ID=your_access_key
   supabase secrets set AWS_SECRET_ACCESS_KEY=your_secret_key
   ```

### Option 3: Mailgun Integration

1. **Set up Mailgun:**
   - Create account at [mailgun.com](https://mailgun.com)
   - Verify your domain
   - Get API key

2. **Update Edge Function:**
   ```typescript
   const formData = new FormData()
   formData.append('from', 'noreply@yourcompany.com')
   formData.append('to', email)
   formData.append('subject', `Invitation to Join ${data.companyName}`)
   formData.append('html', emailHtml)
   formData.append('text', emailText)
   
   const response = await fetch(
     `https://api.mailgun.net/v3/${Deno.env.get('MAILGUN_DOMAIN')}/messages`,
     {
       method: 'POST',
       headers: {
         Authorization: `Basic ${btoa(`api:${Deno.env.get('MAILGUN_API_KEY')}`)}`,
       },
       body: formData,
     }
   )
   ```

3. **Set Environment Variables:**
   ```bash
   supabase secrets set MAILGUN_API_KEY=your_mailgun_api_key
   supabase secrets set MAILGUN_DOMAIN=your_domain
   ```

## 🧪 Testing

### Local Development

1. **Start Supabase locally:**
   ```bash
   supabase start
   ```

2. **Test the function:**
   ```bash
   curl -X POST 'http://localhost:54321/functions/v1/send-invitation-email' \
     -H 'Authorization: Bearer YOUR_ANON_KEY' \
     -H 'Content-Type: application/json' \
     -d '{
       "email": "test@example.com",
       "data": {
         "companyName": "Test Company",
         "inviterName": "John Doe",
         "role": "employee",
         "customMessage": "Welcome to our team!",
         "invitationLink": "https://yourapp.com/auth/accept-invitation?token=test123"
       }
     }'
   ```

### Production Testing

1. Send a test invitation through the UI
2. Check the browser console for logged invitation details
3. Manually send the email using the generated content
4. Verify the invitation link works

## 📝 Manual Email Sending (Current Workaround)

Until email service is configured, you can manually send invitations:

1. **Send invitation through UI**
2. **Check browser console** for logged details:
   ```javascript
   {
     email: "user@example.com",
     companyName: "Acme Corp",
     inviterName: "John Doe",
     role: "employee",
     customMessage: "Welcome!",
     invitationLink: "https://yourapp.com/auth/accept-invitation?token=abc123"
   }
   ```
3. **Copy the invitation link**
4. **Send via your preferred method** (Slack, email, etc.)

## 🔒 Security Considerations

- ✅ Invitation tokens expire in 7 days
- ✅ Tokens are unique and non-guessable
- ✅ Only authenticated users can send invitations
- ✅ Rate limiting should be implemented
- ✅ Email addresses are validated

## 📊 Monitoring

### Logs

Monitor Edge Function logs:
```bash
supabase functions logs send-invitation-email
```

### Metrics

Track invitation success rates:
- Invitations sent
- Invitations accepted
- Invitations expired
- Email delivery failures

## 🚨 Troubleshooting

### Common Issues

1. **Function not deployed:**
   - Run `./deploy-edge-function.sh`
   - Check Supabase CLI login status

2. **Email not sending:**
   - Check environment variables
   - Verify email service configuration
   - Check function logs

3. **Invitation link not working:**
   - Verify token exists in database
   - Check token expiration
   - Ensure proper URL format

### Debug Mode

Enable debug logging in the Edge Function:
```typescript
console.log('Debug info:', { email, data, response })
```

## 📚 Resources

- [Supabase Edge Functions Documentation](https://supabase.com/docs/guides/functions)
- [SendGrid API Documentation](https://docs.sendgrid.com/api-reference)
- [AWS SES Documentation](https://docs.aws.amazon.com/ses/)
- [Mailgun API Documentation](https://documentation.mailgun.com/)

## 🎯 Next Steps

1. ✅ Deploy Edge Function
2. ✅ Test invitation system
3. 🔄 Configure email service (SendGrid/AWS SES/Mailgun)
4. 🔄 Set up monitoring and logging
5. 🔄 Implement rate limiting
6. 🔄 Add email templates customization
7. 🔄 Set up analytics and tracking
