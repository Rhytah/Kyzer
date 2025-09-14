# Send Invitation Email Edge Function

This Supabase Edge Function handles sending invitation emails to users who are invited to join an organization.

## Usage

The function expects a POST request with the following JSON payload:

```json
{
  "email": "user@example.com",
  "data": {
    "companyName": "Acme Corp",
    "inviterName": "John Doe",
    "role": "employee",
    "customMessage": "Welcome to our team!",
    "invitationLink": "https://yourapp.com/auth/accept-invitation?token=abc123"
  }
}
```

## Response

The function returns a JSON response with email details:

```json
{
  "success": true,
  "message": "Invitation email prepared",
  "emailData": {
    "to": "user@example.com",
    "subject": "Invitation to Join Acme Corp",
    "html": "...",
    "text": "...",
    "invitationLink": "https://yourapp.com/auth/accept-invitation?token=abc123"
  }
}
```

## Setup

1. Set the required environment variable:
   ```bash
   supabase secrets set VITE_APP_URL=https://your-app-domain.com
   ```

2. Deploy the function to Supabase:
   ```bash
   supabase functions deploy send-invitation-email
   ```

3. The function will be available at:
   ```
   https://your-project.supabase.co/functions/v1/send-invitation-email
   ```

## Email Service Integration

Currently, the function prepares the email content but doesn't actually send emails. To enable actual email sending, integrate with:

- SendGrid
- AWS SES
- Mailgun
- Or any other email service provider

Update the function to include your email service API calls in the email sending section.
