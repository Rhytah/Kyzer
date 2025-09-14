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

# Set environment variables if not already set
echo "🔧 Setting up environment variables..."

# Check VITE_APP_URL
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

# Check email service configuration
echo ""
echo "📧 Email Service Configuration:"
echo "Choose your email service:"
echo "1) Resend (recommended - free tier: 3,000 emails/month)"
echo "2) SendGrid (free tier: 100 emails/day)"
echo "3) Skip email setup (will use fallback mode)"
echo ""
read -p "Enter your choice (1-3): " email_choice

case $email_choice in
    1)
        echo "Setting up Resend..."
        read -p "Enter your Resend API key: " resend_key
        read -p "Enter your FROM email (e.g., noreply@yourdomain.com): " from_email
        
        if [ ! -z "$resend_key" ] && [ ! -z "$from_email" ]; then
            supabase secrets set EMAIL_SERVICE_URL="https://api.resend.com/emails"
            supabase secrets set EMAIL_SERVICE_API_KEY="$resend_key"
            supabase secrets set FROM_EMAIL="$from_email"
            echo "✅ Resend configured successfully"
        else
            echo "⚠️  Skipping Resend setup. You'll need to configure it manually."
        fi
        ;;
    2)
        echo "Setting up SendGrid..."
        read -p "Enter your SendGrid API key: " sendgrid_key
        read -p "Enter your FROM email (e.g., noreply@yourdomain.com): " from_email
        
        if [ ! -z "$sendgrid_key" ] && [ ! -z "$from_email" ]; then
            supabase secrets set EMAIL_SERVICE_URL="https://api.sendgrid.com/v3/mail/send"
            supabase secrets set EMAIL_SERVICE_API_KEY="$sendgrid_key"
            supabase secrets set FROM_EMAIL="$from_email"
            echo "✅ SendGrid configured successfully"
        else
            echo "⚠️  Skipping SendGrid setup. You'll need to configure it manually."
        fi
        ;;
    3)
        echo "⚠️  Skipping email service setup. Function will use fallback mode."
        echo "To set up email later, run:"
        echo "supabase secrets set EMAIL_SERVICE_URL=https://api.resend.com/emails"
        echo "supabase secrets set EMAIL_SERVICE_API_KEY=your_api_key"
        echo "supabase secrets set FROM_EMAIL=noreply@yourdomain.com"
        ;;
    *)
        echo "⚠️  Invalid choice. Skipping email service setup."
        ;;
esac

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
    echo "2. Configure email settings in Supabase Auth dashboard"
    echo "3. Test the invitation functionality"
    echo "4. Check Supabase email delivery logs if needed"
else
    echo "❌ Failed to deploy Edge Function"
    exit 1
fi
