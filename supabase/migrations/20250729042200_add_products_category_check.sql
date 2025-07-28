ALTER TABLE public.products ADD CONSTRAINT products_category_check CHECK (category IN ('eSIM', 'Travel Accessory'));
