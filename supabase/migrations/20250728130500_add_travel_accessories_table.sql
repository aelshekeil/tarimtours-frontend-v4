-- Create the travel_accessories table
CREATE TABLE public.travel_accessories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  price numeric NOT NULL,
  currency text,
  category text,
  brand text,
  weight text,
  dimensions text,
  material text,
  color_options jsonb,
  features jsonb,
  is_active boolean DEFAULT true NOT NULL,
  stock_quantity integer DEFAULT 0 NOT NULL,
  requires_shipping boolean DEFAULT false NOT NULL,
  shipping_weight numeric,
  images jsonb,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT NOW() NOT NULL,
  updated_at timestamptz DEFAULT NOW() NOT NULL
);

-- Add update trigger
CREATE TRIGGER update_travel_accessories_updated_at
    BEFORE UPDATE ON public.travel_accessories
    FOR EACH ROW
    EXECUTE FUNCTION public.update_modified_column();

-- Enable RLS
ALTER TABLE public.travel_accessories ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "travel_accessories_public_read" ON public.travel_accessories
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "travel_accessories_authenticated_insert" ON public.travel_accessories
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "travel_accessories_creator_update" ON public.travel_accessories
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "travel_accessories_creator_delete" ON public.travel_accessories
  FOR DELETE
  TO authenticated
  USING (auth.uid() = created_by);
