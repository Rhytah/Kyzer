#!/bin/bash

# Deploy the send-invitation-email Edge Function to Supabase
# Make sure you have the Supabase CLI installed and are logged in

echo "🚀 Deploying send-invitation-email Edge Function..."

# Check if supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found. Please install it first:"
    echo "   npm install -g supabase"
    exit 1
fi

# Check if user is logged in
if ! supabase projects list &> /dev/null; then
    echo "❌ Not logged in to Supabase. Please run:"
    echo "   supabase login"
    exit 1
fi

# Deploy the function
echo "📦 Deploying function..."
supabase functions deploy send-invitation-email

if [ $? -eq 0 ]; then
    echo "✅ Edge Function deployed successfully!"
    echo ""
    echo "📧 Email sending is now configured. The function will:"
    echo "   1. Try to send emails via Supabase Auth (if configured)"
    echo "   2. Fall back to logging email details for manual sending"
    echo ""
    echo "🔧 To enable actual email sending, configure:"
    echo "   - Supabase Auth email settings in your dashboard"
    echo "   - Or integrate with SendGrid, AWS SES, etc. in the Edge Function"
    echo ""
    echo "📝 Check the Supabase dashboard logs to see email details when invitations are sent."
else
    echo "❌ Failed to deploy Edge Function. Check the error above."
    exit 1
fi
