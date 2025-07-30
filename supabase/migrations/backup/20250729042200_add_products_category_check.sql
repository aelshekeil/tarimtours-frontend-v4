-- Add constraint only if products table exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'products' AND table_schema = 'public') THEN
        IF NOT EXISTS (
            SELECT 1 FROM pg_constraint
            WHERE conname = 'products_category_check'
        ) THEN
            ALTER TABLE public.products ADD CONSTRAINT products_category_check CHECK (category IN ('eSIM', 'Travel Accessory'));
        END IF;
    END IF;
END $$;
