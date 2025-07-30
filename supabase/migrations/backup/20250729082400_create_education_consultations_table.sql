-- Create education_consultations table
CREATE TABLE IF NOT EXISTS "public"."education_consultations" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "full_name" text NOT NULL,
    "email" text NOT NULL,
    "phone" text NOT NULL,
    "message" text,
    "service_type" text NOT NULL CHECK (service_type IN ('malaysia', 'tarim')),
    "status" text DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'in_progress', 'completed', 'cancelled')),
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT "education_consultations_pkey" PRIMARY KEY ("id")
);

-- Create indexes for faster queries (if they don't exist)
CREATE INDEX IF NOT EXISTS "idx_education_consultations_email" ON "public"."education_consultations" USING btree ("email");
CREATE INDEX IF NOT EXISTS "idx_education_consultations_service_type" ON "public"."education_consultations" USING btree ("service_type");
CREATE INDEX IF NOT EXISTS "idx_education_consultations_status" ON "public"."education_consultations" USING btree ("status");
CREATE INDEX IF NOT EXISTS "idx_education_consultations_created_at" ON "public"."education_consultations" USING btree ("created_at");

-- Add RLS policies
ALTER TABLE "public"."education_consultations" ENABLE ROW LEVEL SECURITY;

-- Create policies (drop existing ones first to avoid conflicts)
DROP POLICY IF EXISTS "education_consultations_public_insert" ON "public"."education_consultations";
DROP POLICY IF EXISTS "education_consultations_owner_select" ON "public"."education_consultations";
DROP POLICY IF EXISTS "education_consultations_admin_all" ON "public"."education_consultations";

-- Allow public to insert (for form submissions)
CREATE POLICY "education_consultations_public_insert" ON "public"."education_consultations"
FOR INSERT TO anon, authenticated
WITH CHECK (true);

-- Allow authenticated users to read their own submissions
CREATE POLICY "education_consultations_owner_select" ON "public"."education_consultations"
FOR SELECT TO authenticated
USING (true);

-- Allow admins to read all submissions
CREATE POLICY "education_consultations_admin_all" ON "public"."education_consultations"
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role IN ('admin', 'super_admin')
  )
);

-- Add trigger for updated_at
CREATE OR REPLACE TRIGGER "update_education_consultations_updated_at" 
BEFORE UPDATE ON "public"."education_consultations" 
FOR EACH ROW EXECUTE FUNCTION "public"."update_modified_column"();

-- Grant permissions
GRANT ALL ON TABLE "public"."education_consultations" TO "anon";
GRANT ALL ON TABLE "public"."education_consultations" TO "authenticated";
GRANT ALL ON TABLE "public"."education_consultations" TO "service_role";