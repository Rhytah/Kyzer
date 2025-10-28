# Certificate Templates Setup Guide

## 🚨 Database Setup Required

The certificate templates feature requires database tables and storage bucket setup. Follow these steps:

## Step 1: Create Database Tables

1. **Go to Supabase Dashboard**
   - Open your Supabase project
   - Navigate to **SQL Editor**

2. **Run the SQL Schema**
   - Copy the contents of `CERTIFICATE_TEMPLATES_SCHEMA.sql`
   - Paste and execute in SQL Editor
   - This creates:
     - `certificate_templates` table
     - Updates `certificates` table
     - Sets up RLS policies
     - Creates storage policies

## Step 2: Create Storage Bucket

1. **Go to Storage Section**
   - In Supabase Dashboard, click **Storage**
   - Click **New Bucket**

2. **Create Certificates Bucket**
   - Name: `certificates`
   - Public bucket: **Yes** (checked)
   - Click **Create bucket**

## Step 3: Verify Setup

1. **Refresh the Certificate Templates page**
2. **Try creating a test template**
3. **Upload a sample certificate image**

## Current Errors Fixed

### 404 Error on certificate_templates
- **Cause**: Table doesn't exist
- **Fix**: Run the SQL schema

### 403 Storage Upload Error
- **Cause**: Missing storage bucket and policies
- **Fix**: Create certificates bucket and run storage policies

### RLS Policy Violations
- **Cause**: Missing permissions
- **Fix**: SQL schema includes proper RLS policies

## Quick Setup Commands

If you prefer SQL commands for storage setup:

```sql
-- Create certificates bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('certificates', 'certificates', true)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on storage.objects (if not enabled)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
```

## Test After Setup

1. Navigate to **Courses** → **Certificate Templates**
2. Click **New Template**
3. Upload a certificate background image
4. Select placeholders and save
5. Complete a course to test automatic certificate generation

## Support

If you encounter issues:
1. Check Supabase logs for detailed error messages
2. Verify your user has `manage_courses` permission
3. Ensure storage bucket is public
4. Check RLS policies are applied correctly