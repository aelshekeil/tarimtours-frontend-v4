-- Fix education_consultations RLS policies to avoid infinite recursion

-- First, drop existing policies if they exist
DROP POLICY IF EXISTS "education_consultations_public_insert" ON "public"."education_consultations";
DROP POLICY IF EXISTS "education_consultations_owner_select" ON "public"."education_consultations";
DROP POLICY IF EXISTS "education_consultations_admin_all" ON "public"."education_consultations";

-- Create simplified policies that don't cause recursion

-- Allow public to insert (for form submissions)
CREATE POLICY "education_consultations_public_insert" ON "public"."education_consultations" 
FOR INSERT TO anon, authenticated 
WITH CHECK (true);

-- Allow authenticated users to read all submissions (simplified for now)
CREATE POLICY "education_consultations_authenticated_select" ON "public"."education_consultations" 
FOR SELECT TO authenticated 
USING (true);

-- Allow authenticated users to update all submissions (for admin functionality)
CREATE POLICY "education_consultations_authenticated_update" ON "public"."education_consultations" 
FOR UPDATE TO authenticated 
USING (true)
WITH CHECK (true);

-- Allow authenticated users to delete (for admin functionality)
CREATE POLICY "education_consultations_authenticated_delete" ON "public"."education_consultations" 
FOR DELETE TO authenticated 
USING (true);

-- Ensure RLS is enabled
ALTER TABLE "public"."education_consultations" ENABLE ROW LEVEL SECURITY;

-- Grant necessary permissions
GRANT ALL ON TABLE "public"."education_consultations" TO "anon";
GRANT ALL ON TABLE "public"."education_consultations" TO "authenticated";
GRANT ALL ON TABLE "public"."education_consultations" TO "service_role";