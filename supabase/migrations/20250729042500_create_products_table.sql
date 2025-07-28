CREATE TABLE public.products (
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

ALTER TABLE public.products ADD CONSTRAINT products_category_check CHECK (category IN ('eSIM', 'Travel Accessory'));
