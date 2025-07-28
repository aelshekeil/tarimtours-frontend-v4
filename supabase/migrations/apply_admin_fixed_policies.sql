-- Admin Users Management - Fixed Policies (No Recursion)
-- Fix infinite recursion in policies

-- Step 1: Add missing columns (skip if exist)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS role text DEFAULT 'user' NOT NULL,
ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true NOT NULL,
ADD COLUMN IF NOT EXISTS permissions jsonb DEFAULT '{}'::jsonb;

-- Step 2: Fix admin policies - use direct auth.uid() check
DROP POLICY IF EXISTS "profiles_admin_select_all" ON public.profiles;
DROP POLICY IF EXISTS "profiles_admin_update_all" ON public.profiles;
DROP POLICY IF EXISTS "profiles_admin_insert" ON public.profiles;

-- Allow admins to view all profiles (direct check)
CREATE POLICY "profiles_admin_select_all" ON public.profiles
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() IS NOT NULL AND
    (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'super_admin')
  );

-- Allow admins to update any profile (direct check)
CREATE POLICY "profiles_admin_update_all" ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() IS NOT NULL AND
    (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'super_admin')
  )
  WITH CHECK (
    auth.uid() IS NOT NULL AND
    (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'super_admin')
  );

-- Allow admins to insert new profiles (direct check)
CREATE POLICY "profiles_admin_insert" ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() IS NOT NULL AND
    (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'super_admin')
  );

-- Step 3: Create admin view
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
  p.permissions
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
ORDER BY u.created_at DESC;

-- Step 4: Make yourself admin
UPDATE public.profiles SET role = 'super_admin', is_active = true WHERE email = 'myemail@gmail.com';

-- Step 5: Verify setup
SELECT 'Admin system ready' as status;
