-- Add missing DELETE policy for visa_offers table
-- Execute this in your Supabase SQL Editor

-- Check if the policy already exists
SELECT 
    schemaname, 
    tablename, 
    policyname, 
    cmd 
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename = 'visa_offers' 
  AND cmd = 'DELETE';

-- Create the missing DELETE policy
CREATE POLICY "visa_offers_creator_delete" ON public.visa_offers
  FOR DELETE 
  TO authenticated
  USING (auth.uid() = created_by);

-- Verify the policy was created
SELECT 
    schemaname, 
    tablename, 
    policyname, 
    cmd,
    qual
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename = 'visa_offers' 
  AND policyname = 'visa_offers_creator_delete';