-- Make yourself super admin via GUI - Complete solution
-- Run this in Supabase SQL Editor to fix policies and set admin

-- Step 1: Drop problematic policies
DROP POLICY IF EXISTS "profiles_admin_select_all" ON public.profiles;
DROP POLICY IF EXISTS "profiles_admin_update_all" ON public.profiles;
DROP POLICY IF EXISTS "profiles_admin_insert" ON public.profiles;

-- Step 2: Add required columns
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS role text DEFAULT 'user' NOT NULL,
ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true NOT NULL,
ADD COLUMN IF NOT EXISTS permissions jsonb DEFAULT '{}'::jsonb;

-- Step 3: Create working policies (no recursion)
CREATE POLICY "profiles_public_select" ON public.profiles
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "profiles_owner_select" ON public.profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "profiles_owner_update" ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Step 4: Create admin view
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

-- Step 5: Make yourself super admin
UPDATE public.profiles SET role = 'super_admin', is_active = true WHERE email = 'a.elshkeil@yahoo.com';

-- Step 6: Verify
SELECT 'Admin setup complete - refresh your /admin page' as status;
