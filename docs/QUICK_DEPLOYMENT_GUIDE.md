# 🚀 Quick Edge Function Deployment Guide

## Current Issue
The invitation system is showing "Failed to fetch" errors because the Edge Function isn't deployed yet. Here's how to fix it:

## Option 1: Deploy Edge Function (Recommended)

### Prerequisites
```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Login to Supabase
supabase login
```

### Deploy
```bash
# Set your app URL first
supabase secrets set VITE_APP_URL=https://your-app-domain.com

# Run the deployment script
./deploy-edge-function.sh
```

### Manual Deployment (if script fails)
```bash
# Set environment variable
supabase secrets set VITE_APP_URL=https://your-app-domain.com

# Deploy the function directly
supabase functions deploy send-invitation-email

# Check deployment status
supabase functions list
```

## Option 2: Use Fallback Mode (Current)

The system is already configured with fallback handling:

1. **Send invitation through UI**
2. **Check browser console** for invitation details
3. **Copy invitation link** from console
4. **Share manually** with invitee

### Example Console Output:
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

## Option 3: Configure Email Service

After deploying the Edge Function, configure an email service:

### SendGrid (Recommended)
```bash
# Set your SendGrid API key
supabase secrets set SENDGRID_API_KEY=your_sendgrid_api_key

# Update the Edge Function to use SendGrid
# Edit: supabase/functions/send-invitation-email/index.ts
```

### AWS SES
```bash
supabase secrets set AWS_ACCESS_KEY_ID=your_access_key
supabase secrets set AWS_SECRET_ACCESS_KEY=your_secret_key
```

### Mailgun
```bash
supabase secrets set MAILGUN_API_KEY=your_api_key
supabase secrets set MAILGUN_DOMAIN=your_domain
```

## Testing

### Test Edge Function Locally
```bash
# Start Supabase locally
supabase start

# Test the function
curl -X POST 'http://localhost:54321/functions/v1/send-invitation-email' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "email": "test@example.com",
    "data": {
      "companyName": "Test Company",
      "inviterName": "John Doe",
      "role": "employee",
      "customMessage": "Welcome!",
      "invitationLink": "https://yourapp.com/auth/accept-invitation?token=test123"
    }
  }'
```

### Test in Production
1. Deploy Edge Function
2. Send test invitation through UI
3. Check function logs: `supabase functions logs send-invitation-email`

## Troubleshooting

### Common Issues

1. **"Failed to fetch" error:**
   - Edge Function not deployed
   - Check Supabase CLI login status
   - Verify project connection

2. **"Auth check timeout":**
   - Network connectivity issues
   - Supabase service status
   - Check browser console for details

3. **"Organization query timeout":**
   - Database performance issues
   - Large organization data
   - Network latency

### Debug Steps

1. **Check Supabase CLI:**
   ```bash
   supabase status
   supabase projects list
   ```

2. **Check Function Logs:**
   ```bash
   supabase functions logs send-invitation-email
   ```

3. **Check Browser Console:**
   - Look for detailed error messages
   - Check network tab for failed requests

## Next Steps

1. ✅ **Deploy Edge Function** (Option 1)
2. 🔄 **Configure Email Service** (Option 3)
3. 🔄 **Test Invitation Flow**
4. 🔄 **Monitor Performance**

The system is designed to work even without the Edge Function deployed - it will fall back to manual invitation sharing until you're ready to configure the email service.
