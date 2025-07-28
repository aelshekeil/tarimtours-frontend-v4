-- Apply Admin Users Management System to Cloud Supabase - FIXED
-- Run this SQL directly in your cloud Supabase SQL editor

-- Step 1: Handle existing user_role enum (skip if exists)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE public.user_role AS ENUM ('user', 'admin', 'super_admin', 'editor', 'viewer');
    END IF;
END $$;

-- Step 2: Add columns to profiles table (skip if already exist)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS role public.user_role DEFAULT 'user' NOT NULL,
ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true NOT NULL,
ADD COLUMN IF NOT EXISTS last_login timestamptz,
ADD COLUMN IF NOT EXISTS invited_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS invited_at timestamptz,
ADD COLUMN IF NOT EXISTS permissions jsonb DEFAULT '{}'::jsonb;

-- Step 3: Create admin policies for profiles table
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "profiles_admin_select_all" ON public.profiles;
DROP POLICY IF EXISTS "profiles_admin_update_all" ON public.profiles;
DROP POLICY IF EXISTS "profiles_admin_insert" ON public.profiles;

-- Allow admins to view all profiles
CREATE POLICY "profiles_admin_select_all" ON public.profiles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
      AND p.role IN ('admin', 'super_admin')
    )
  );

-- Allow admins to update any profile
CREATE POLICY "profiles_admin_update_all" ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
      AND p.role IN ('admin', 'super_admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
      AND p.role IN ('admin', 'super_admin')
    )
  );

-- Allow admins to insert new profiles (for inviting users)
CREATE POLICY "profiles_admin_insert" ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
      AND p.role IN ('admin', 'super_admin')
    )
  );

-- Step 4: Create admin users view
DROP VIEW IF EXISTS public.admin_users_view;
CREATE VIEW public.admin_users_view AS
SELECT 
  u.id,
  u.email,
  u.created_at as joined_at,
  u.last_sign_in_at,
  p.full_name,
  p.role,
  p.is_active,
  p.last_login,
  p.invited_by,
  p.invited_at,
  p.permissions,
  inviter.email as invited_by_email
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
LEFT JOIN auth.users inviter ON p.invited_by = inviter.id
ORDER BY u.created_at DESC;

-- Step 5: Create database functions (handle existing functions)
DROP FUNCTION IF EXISTS public.is_admin(uuid);
CREATE OR REPLACE FUNCTION public.is_admin(user_uuid uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = user_uuid
    AND role IN ('admin', 'super_admin')
    AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP FUNCTION IF EXISTS public.has_permission(uuid, text);
CREATE OR REPLACE FUNCTION public.has_permission(user_uuid uuid, permission text)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = user_uuid
    AND (
      role = 'super_admin' OR
      (role IN ('admin', 'editor') AND permissions->>permission = 'true')
    )
    AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 6: Create trigger for new user registration
DROP FUNCTION IF EXISTS public.handle_new_user();
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Step 7: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_is_active ON public.profiles(is_active);
CREATE INDEX IF NOT EXISTS idx_profiles_invited_by ON public.profiles(invited_by);

-- Step 8: Grant permissions
GRANT SELECT ON public.admin_users_view TO authenticated;

-- Step 9: Make yourself super admin (replace with your email)
-- UPDATE public.profiles SET role = 'super_admin', is_active = true WHERE email = 'myemail@gmail.com';

-- Step 10: Verify setup
SELECT 'Admin Users Management System applied to cloud Supabase successfully!' AS status;

-- Step 11: Check current setup
SELECT 
  'Profiles table updated' as check_name,
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='role') 
    THEN '✅ role column exists' 
    ELSE '❌ role column missing' 
  END as status
UNION ALL
SELECT 
  'Admin view created' as check_name,
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.views WHERE table_name='admin_users_view') 
    THEN '✅ admin_users_view exists' 
    ELSE '❌ admin_users_view missing' 
  END as status;
