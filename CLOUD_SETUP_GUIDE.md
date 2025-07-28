# Cloud Supabase Setup Guide

## Overview
You have a cloud Supabase instance at `https://vrvrhzseqnjpriqesgoj.supabase.co` and we've created a local development setup. This guide explains how to manage both and apply the admin system to your cloud instance.

## Current Status
- ✅ **Cloud Supabase**: Your production database with existing tables
- ✅ **Local Supabase**: Development/testing environment (now disabled)
- ✅ **Frontend**: Now configured to use your cloud instance

## How to Apply Admin System to Cloud Supabase

### Step 1: Apply Database Changes to Cloud
1. Go to your Supabase dashboard: https://app.supabase.com
2. Select your project: `vrvrhzseqnjpriqesgoj`
3. Navigate to **SQL Editor**
4. Copy and paste the entire content from `supabase/migrations/apply_admin_to_cloud.sql`
5. Click **Run** to execute all SQL commands

### Step 2: Verify Cloud Setup
After running the SQL, verify the setup by checking:
- The `profiles` table now has new columns: `role`, `is_active`, `permissions`, etc.
- The `admin_users_view` view is created
- The database functions are available

### Step 3: Make Yourself Admin
Run this SQL in the cloud Supabase SQL editor (replace with your actual email):
```sql
UPDATE public.profiles 
SET role = 'super_admin', is_active = true 
WHERE email = 'your-email@domain.com';
```

### Step 4: Test the System
1. Log in to your application (now connected to cloud)
2. Navigate to `/admin`
3. You should see the Admin Users Management section
4. You can now invite new admin users

## Managing Both Instances

### Cloud Supabase (Production)
- **URL**: https://vrvrhzseqnjpriqesgoj.supabase.co
- **Use**: Production data and real users
- **Access**: Via your application and Supabase dashboard

### Local Supabase (Development)
- **URL**: http://127.0.0.1:54321
- **Use**: Development/testing only
- **Status**: Can be stopped with `npx supabase stop`

## Switching Between Environments

### To Use Cloud (Production):
```bash
# Your .env is already configured for cloud
VITE_SUPABASE_URL=https://vrvrhzseqnjpriqesgoj.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### To Use Local (Development):
```bash
# If you want to switch back to local for testing
# Update .env to:
# VITE_SUPABASE_URL=http://127.0.0.1:54321
# VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Important Notes

### 1. Existing Data
Your existing tables and data in the cloud instance remain untouched. The admin system only adds new columns and functionality.

### 2. User Roles
- All existing users will have the default role of 'user'
- You need to manually upgrade specific users to admin roles

### 3. Security
- The admin system uses Row Level Security (RLS) policies
- Only authenticated users with admin roles can access admin functions
- All operations are logged and auditable

### 4. Migration Strategy
Since you have existing tables, the SQL script is designed to be non-destructive:
- Uses `IF NOT EXISTS` for all new objects
- Adds columns only if they don't exist
- Preserves all existing data

## Troubleshooting Cloud Setup

### Common Issues:

1. **Permission Denied**
   - Ensure you're logged into the correct Supabase project
   - Check your project settings and API keys

2. **Functions Not Working**
   - Verify the SQL was executed completely
   - Check the Supabase logs for any errors

3. **Admin Access Issues**
   - Ensure you've updated your role to super_admin
   - Check the profiles table for your user record

### Verification Commands:
Run these in your cloud Supabase SQL editor to verify setup:
```sql
-- Check if admin system is properly set up
SELECT * FROM public.admin_users_view LIMIT 5;

-- Check your role
SELECT role FROM public.profiles WHERE email = 'your-email@domain.com';

-- Test admin function
SELECT public.is_admin(auth.uid());
```

## Next Steps

1. **Apply the SQL to your cloud instance** (Step 1 above)
2. **Set yourself as super admin** (Step 3 above)
3. **Test the admin functionality** in your live application
4. **Invite additional admin users** as needed

The admin system is now ready to use with your cloud Supabase instance. All frontend components will automatically work with your cloud database.
