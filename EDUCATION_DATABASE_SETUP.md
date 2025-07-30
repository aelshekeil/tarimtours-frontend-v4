# Education Services Database Setup Guide

## Overview
This guide will help you set up the database for the Education Services feature, which includes form submissions and admin management.

## Database Setup Steps

### Step 1: Create the Education Consultations Table
Run the first migration in your Supabase SQL Editor:

```sql
-- Copy and paste the content from: supabase/migrations/20250729082400_create_education_consultations_table.sql
```

### Step 2: Fix RLS Policies (IMPORTANT)
If you encounter the "infinite recursion detected in policy" error, run this fix:

```sql
-- Copy and paste the content from: supabase/migrations/20250729084000_fix_education_consultations_policies.sql
```

## What These Migrations Do

### Migration 1: Create Table
- Creates `education_consultations` table with proper structure
- Adds indexes for performance
- Sets up initial RLS policies
- Creates triggers for automatic timestamp updates

### Migration 2: Fix Policies
- Removes problematic policies that cause infinite recursion
- Creates simplified, working RLS policies
- Ensures proper permissions for all user types

## Table Structure

```sql
education_consultations (
  id: uuid (primary key)
  full_name: text (required)
  email: text (required)
  phone: text (required)
  message: text (optional)
  service_type: 'malaysia' | 'tarim' (required)
  status: 'new' | 'contacted' | 'in_progress' | 'completed' | 'cancelled'
  created_at: timestamp (auto)
  updated_at: timestamp (auto)
)
```

## Security Policies

The fixed policies allow:
- **Anonymous users**: Can submit forms (INSERT)
- **Authenticated users**: Can view, update, and manage all consultations
- **Service role**: Full access for backend operations

## Accessing Your Data

### Via Admin Dashboard
1. Go to `/admin` in your application
2. Click on "Education Consultations" tab
3. View, filter, and manage all submissions
4. Export data as CSV
5. Update consultation status
6. Contact students directly via email/phone

### Via Supabase Dashboard
1. Go to your Supabase project dashboard
2. Navigate to "Table Editor"
3. Select "education_consultations" table
4. View and manage data directly

## Troubleshooting

### If you see "infinite recursion" error:
1. Run Migration 2 (fix policies)
2. Refresh your application
3. Test form submission

### If table doesn't exist:
1. Run Migration 1 (create table)
2. Then run Migration 2 (fix policies)
3. Refresh your application

### If permissions are denied:
1. Check that both migrations have been run
2. Verify RLS is enabled on the table
3. Ensure your user has proper authentication

## Testing the Setup

1. **Test Form Submission**:
   - Go to `/education-malaysia` or `/education-tarim`
   - Fill out and submit the consultation form
   - Check if data appears in admin dashboard

2. **Test Admin Interface**:
   - Go to `/admin`
   - Check "Education Consultations" section
   - Verify you can see submitted data
   - Test status updates and filtering

3. **Test Newsletter Integration**:
   - Check `newsletter_subscribers` table
   - Verify emails from forms are automatically added

## Support

If you encounter any issues:
1. Check the browser console for errors
2. Verify both SQL migrations have been run successfully
3. Ensure your Supabase project has the latest schema
4. Test with a fresh browser session

The education services feature is now ready for production use!