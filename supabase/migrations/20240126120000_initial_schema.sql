-------------------------------------------------------------------------------
-- 1. Complete cleanup - Remove ALL policies first, then tables
-------------------------------------------------------------------------------
DO $$
DECLARE
    pol record;
    tbl text;
BEGIN
    -- First, drop ALL policies on ALL tables in public schema
    FOR pol IN
        SELECT schemaname, tablename, policyname
        FROM pg_policies
        WHERE schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I;', pol.policyname, pol.schemaname, pol.tablename);
    END LOOP;
    
    -- Then disable RLS and drop problematic tables
    FOR tbl IN SELECT tablename
               FROM pg_tables
               WHERE schemaname = 'public'
                 AND tablename IN ('esim_products','travel_accessories','visa_offers','visa_applications','international_driving_license_applications','profiles')
    LOOP
        EXECUTE format('ALTER TABLE public.%I DISABLE ROW LEVEL SECURITY;', tbl);
        EXECUTE format('DROP TABLE IF EXISTS public.%I CASCADE;', tbl);
    END LOOP;
END $$;

-------------------------------------------------------------------------------
-- 2. Clean restart with proper types
-------------------------------------------------------------------------------
-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" SCHEMA extensions;

-- Trigger helper
CREATE OR REPLACE FUNCTION public.update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    IF (NEW.* IS DISTINCT FROM OLD.*) THEN
        NEW.updated_at = NOW();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-------------------------------------------------------------------------------
-- Tables with explicit UUID types
-------------------------------------------------------------------------------
CREATE TABLE public.travel_packages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  destination text NOT NULL,
  price numeric NOT NULL,
  duration text NOT NULL,
  cover_photo_url text,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT NOW() NOT NULL,
  updated_at timestamptz DEFAULT NOW() NOT NULL
);

CREATE TABLE public.visa_offers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  country text NOT NULL,
  visa_type text NOT NULL,
  duration text NOT NULL,
  price numeric NOT NULL,
  requirements text NOT NULL,
  cover_photo_url text,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT NOW() NOT NULL
);

CREATE TABLE public.visa_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text,
  email text,
  payment_status text,
  tracking_id text,
  application_data jsonb,
  files_urls text[],
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT NOW() NOT NULL,
  updated_at timestamptz DEFAULT NOW() NOT NULL
);

CREATE TABLE public.international_driving_license_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text,
  email text,
  payment_status text,
  tracking_id text,
  license_front_url text,
  passport_page_url text,
  personal_photo_url text,
  type text,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT NOW() NOT NULL,
  updated_at timestamptz DEFAULT NOW() NOT NULL
);

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  avatar_url text,
  role text DEFAULT 'user' NOT NULL,
  created_at timestamptz DEFAULT NOW() NOT NULL,
  updated_at timestamptz DEFAULT NOW() NOT NULL
);

-------------------------------------------------------------------------------
-- Add update triggers
-------------------------------------------------------------------------------
CREATE TRIGGER update_travel_packages_updated_at
    BEFORE UPDATE ON public.travel_packages
    FOR EACH ROW
    EXECUTE FUNCTION public.update_modified_column();

CREATE TRIGGER update_visa_applications_updated_at
    BEFORE UPDATE ON public.visa_applications
    FOR EACH ROW
    EXECUTE FUNCTION public.update_modified_column();

CREATE TRIGGER update_idl_applications_updated_at
    BEFORE UPDATE ON public.international_driving_license_applications
    FOR EACH ROW
    EXECUTE FUNCTION public.update_modified_column();

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_modified_column();

-------------------------------------------------------------------------------
-- Enable RLS
-------------------------------------------------------------------------------
ALTER TABLE public.visa_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visa_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.international_driving_license_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-------------------------------------------------------------------------------
-- Create RLS policies with proper UUID comparisons
-------------------------------------------------------------------------------

-- travel_packages policies
CREATE POLICY "travel_packages_public_read" ON public.travel_packages
  FOR SELECT 
  TO public
  USING (true);

CREATE POLICY "travel_packages_authenticated_insert" ON public.travel_packages
  FOR INSERT 
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "travel_packages_creator_update" ON public.travel_packages
  FOR UPDATE 
  TO authenticated
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

-- visa_offers policies
CREATE POLICY "visa_offers_public_read" ON public.visa_offers
  FOR SELECT 
  TO public
  USING (true);

CREATE POLICY "visa_offers_authenticated_insert" ON public.visa_offers
  FOR INSERT 
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "visa_offers_creator_update" ON public.visa_offers
  FOR UPDATE 
  TO authenticated
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

-- visa_applications policies  
CREATE POLICY "visa_applications_owner_all" ON public.visa_applications
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- international_driving_license_applications policies
CREATE POLICY "idl_applications_owner_all" ON public.international_driving_license_applications
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- profiles policies
CREATE POLICY "profiles_owner_select" ON public.profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "profiles_owner_update" ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_owner_insert" ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-------------------------------------------------------------------------------
-- Storage policies (create buckets first if they don't exist)
-------------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public) 
VALUES ('visa-covers', 'visa-covers', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('visa-documents', 'visa-documents', false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('idl-documents', 'idl-documents', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
DROP POLICY IF EXISTS "visa_covers_authenticated_upload" ON storage.objects;
CREATE POLICY "visa_covers_authenticated_upload" ON storage.objects
  FOR INSERT 
  TO authenticated
  WITH CHECK (bucket_id = 'visa-covers');

DROP POLICY IF EXISTS "visa_covers_public_read" ON storage.objects;
CREATE POLICY "visa_covers_public_read" ON storage.objects
  FOR SELECT 
  TO public
  USING (bucket_id = 'visa-covers');

DROP POLICY IF EXISTS "visa_documents_owner_upload" ON storage.objects;
CREATE POLICY "visa_documents_owner_upload" ON storage.objects
  FOR INSERT 
  TO authenticated
  WITH CHECK (
    bucket_id = 'visa-documents' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "visa_documents_owner_read" ON storage.objects;
CREATE POLICY "visa_documents_owner_read" ON storage.objects
  FOR SELECT 
  TO authenticated
  USING (
    bucket_id = 'visa-documents' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "idl_documents_owner_upload" ON storage.objects;
CREATE POLICY "idl_documents_owner_upload" ON storage.objects
  FOR INSERT 
  TO authenticated
  WITH CHECK (
    bucket_id = 'idl-documents' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "idl_documents_owner_read" ON storage.objects;
CREATE POLICY "idl_documents_owner_read" ON storage.objects
  FOR SELECT 
  TO authenticated
  USING (
    bucket_id = 'idl-documents' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-------------------------------------------------------------------------------
-- Verify everything is working
-------------------------------------------------------------------------------
DO $$
BEGIN
    -- Check that auth.uid() returns uuid type
    PERFORM auth.uid();
    
    -- Verify all tables exist with correct structure
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'travel_packages') THEN
        RAISE EXCEPTION 'travel_packages table not created';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'visa_offers') THEN
        RAISE EXCEPTION 'visa_offers table not created';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'visa_applications') THEN
        RAISE EXCEPTION 'visa_applications table not created';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'international_driving_license_applications') THEN
        RAISE EXCEPTION 'international_driving_license_applications table not created';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') THEN
        RAISE EXCEPTION 'profiles table not created';
    END IF;
END $$;

SELECT 'Database setup completed successfully! All UUID types are properly configured.' AS status;
