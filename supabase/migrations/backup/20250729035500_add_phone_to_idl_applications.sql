-- Add phone column to international_driving_license_applications (if not exists)
ALTER TABLE public.international_driving_license_applications ADD COLUMN IF NOT EXISTS phone text;
