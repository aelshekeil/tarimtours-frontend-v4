-- Add missing DELETE policy for visa_offers table
-- This allows authenticated users to delete visa offers they created

CREATE POLICY "visa_offers_creator_delete" ON public.visa_offers
  FOR DELETE 
  TO authenticated
  USING (auth.uid() = created_by);