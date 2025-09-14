#!/bin/bash

# Deploy Supabase Edge Function for sending invitation emails
# Make sure you have the Supabase CLI installed and are logged in

echo "🚀 Deploying Supabase Edge Function: send-invitation-email"

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI is not installed. Please install it first:"
    echo "npm install -g supabase"
    exit 1
fi

# Check if user is logged in to Supabase
if ! supabase projects list &> /dev/null; then
    echo "❌ Not logged in to Supabase. Please run:"
    echo "supabase login"
    exit 1
fi

# Set environment variable if not already set
echo "🔧 Setting up environment variables..."
if ! supabase secrets list | grep -q "VITE_APP_URL"; then
    echo "⚠️  VITE_APP_URL not found in secrets. Please set it manually:"
    echo "supabase secrets set VITE_APP_URL=https://your-app-domain.com"
    echo ""
    read -p "Enter your app URL (or press Enter to skip): " app_url
    if [ ! -z "$app_url" ]; then
        supabase secrets set VITE_APP_URL="$app_url"
        echo "✅ VITE_APP_URL set to: $app_url"
    else
        echo "⚠️  Skipping VITE_APP_URL setup. You'll need to set it manually later."
    fi
else
    echo "✅ VITE_APP_URL already configured"
fi

# Deploy the Edge Function
echo "📦 Deploying function..."
supabase functions deploy send-invitation-email

if [ $? -eq 0 ]; then
    echo "✅ Edge Function deployed successfully!"
    echo ""
    echo "📧 The function is now available at:"
    echo "https://your-project.supabase.co/functions/v1/send-invitation-email"
    echo ""
    echo "🔧 Next steps:"
    echo "1. Ensure VITE_APP_URL is set correctly in Supabase secrets"
    echo "2. Test the invitation functionality"
    echo "3. Set up email service integration (SendGrid, AWS SES, etc.)"
else
    echo "❌ Failed to deploy Edge Function"
    exit 1
fi
