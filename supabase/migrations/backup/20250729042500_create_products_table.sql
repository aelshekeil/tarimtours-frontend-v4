CREATE TABLE IF NOT EXISTS public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  price numeric NOT NULL,
  category text,
  images text[],
  specifications jsonb,
  stock_quantity integer DEFAULT 0,
  sku text,
  featured boolean DEFAULT false,
  status text DEFAULT 'active',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add constraint only if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'products_category_check'
    ) THEN
        ALTER TABLE public.products ADD CONSTRAINT products_category_check CHECK (category IN ('eSIM', 'Travel Accessory'));
    END IF;
END $$;
