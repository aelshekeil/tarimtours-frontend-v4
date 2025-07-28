-- Add admin roles and permissions system
-- This migration adds the necessary structure for admin user management

-- Create enum for user roles
CREATE TYPE public.user_role AS ENUM ('user', 'admin', 'super_admin', 'editor', 'viewer');

-- Add role column to profiles table if it doesn't exist
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS role public.user_role DEFAULT 'user' NOT NULL;

-- Add additional admin-related columns
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true NOT NULL,
ADD COLUMN IF NOT EXISTS last_login timestamptz,
ADD COLUMN IF NOT EXISTS invited_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS invited_at timestamptz,
ADD COLUMN IF NOT EXISTS permissions jsonb DEFAULT '{}'::jsonb;

-- Create admin policies for profiles table
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

-- Create function to handle new user registration and profile creation
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

-- Create trigger for new user registration
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to check if user has admin role
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

-- Create function to check if user has specific permission
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

-- Create view for admin user management
CREATE OR REPLACE VIEW public.admin_users_view AS
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

-- Grant necessary permissions
GRANT SELECT ON public.admin_users_view TO authenticated;

-- Create function to invite new admin user
CREATE OR REPLACE FUNCTION public.invite_admin_user(
  target_email text,
  target_role public.user_role,
  target_permissions jsonb DEFAULT '{}'::jsonb
)
RETURNS uuid AS $$
DECLARE
  new_user_id uuid;
  inviter_id uuid := auth.uid();
BEGIN
  -- Check if inviter has admin rights
  IF NOT public.is_admin(inviter_id) THEN
    RAISE EXCEPTION 'Only admins can invite new users';
  END IF;

  -- Create user in auth.users
  INSERT INTO auth.users (email, email_confirmed_at, raw_user_meta_data)
  VALUES (target_email, NOW(), '{"invited": true}'::jsonb)
  RETURNING id INTO new_user_id;

  -- Create profile with role and permissions
  INSERT INTO public.profiles (id, role, permissions, invited_by, invited_at)
  VALUES (new_user_id, target_role, target_permissions, inviter_id, NOW());

  RETURN new_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to update user role and permissions
CREATE OR REPLACE FUNCTION public.update_user_role(
  target_user_id uuid,
  new_role public.user_role,
  new_permissions jsonb DEFAULT NULL
)
RETURNS void AS $$
DECLARE
  updater_id uuid := auth.uid();
BEGIN
  -- Check if updater has admin rights
  IF NOT public.is_admin(updater_id) THEN
    RAISE EXCEPTION 'Only admins can update user roles';
  END IF;

  -- Prevent super_admin role changes by non-super admins
  IF new_role = 'super_admin' AND NOT EXISTS (
    SELECT 1 FROM public.profiles WHERE id = updater_id AND role = 'super_admin'
  ) THEN
    RAISE EXCEPTION 'Only super admins can assign super admin role';
  END IF;

  -- Update user role and permissions
  UPDATE public.profiles
  SET 
    role = new_role,
    permissions = COALESCE(new_permissions, permissions),
    updated_at = NOW()
  WHERE id = target_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to toggle user active status
CREATE OR REPLACE FUNCTION public.toggle_user_status(
  target_user_id uuid,
  new_status boolean
)
RETURNS void AS $$
DECLARE
  updater_id uuid := auth.uid();
BEGIN
  -- Check if updater has admin rights
  IF NOT public.is_admin(updater_id) THEN
    RAISE EXCEPTION 'Only admins can toggle user status';
  END IF;

  UPDATE public.profiles
  SET 
    is_active = new_status,
    updated_at = NOW()
  WHERE id = target_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Note: Default admin user creation is disabled
-- To create your first admin user, sign up normally and then run:
-- UPDATE public.profiles SET role = 'super_admin' WHERE email = 'your-email@example.com';

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_is_active ON public.profiles(is_active);
CREATE INDEX IF NOT EXISTS idx_profiles_invited_by ON public.profiles(invited_by);

SELECT 'Admin roles and permissions system setup completed successfully!' AS status;
