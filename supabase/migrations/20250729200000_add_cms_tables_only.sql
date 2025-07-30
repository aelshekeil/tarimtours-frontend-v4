-- CMS Tables Migration - Safe for existing database
-- This migration only adds CMS-related tables and functions

-- Create page_types enum if it doesn't exist
DO $$ BEGIN
    CREATE TYPE page_type AS ENUM (
        'study_malaysia',
        'travel_packages', 
        'faqs',
        'travel_accessories',
        'esim',
        'visa_services',
        'education',
        'general'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create content_status enum if it doesn't exist
DO $$ BEGIN
    CREATE TYPE content_status AS ENUM (
        'draft',
        'scheduled',
        'published',
        'archived'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create pages table for dynamic content
CREATE TABLE IF NOT EXISTS public.pages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    page_type page_type NOT NULL DEFAULT 'general',
    content JSONB NOT NULL DEFAULT '{}',
    meta_title TEXT,
    meta_description TEXT,
    featured_image TEXT,
    status content_status NOT NULL DEFAULT 'draft',
    published_at TIMESTAMP WITH TIME ZONE,
    scheduled_at TIMESTAMP WITH TIME ZONE,
    author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create content_blocks table for reusable content components
CREATE TABLE IF NOT EXISTS public.content_blocks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL, -- 'hero', 'text', 'image', 'gallery', 'faq', 'features', etc.
    content JSONB NOT NULL DEFAULT '{}',
    is_global BOOLEAN DEFAULT false, -- Can be used across multiple pages
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create page_content_blocks junction table
CREATE TABLE IF NOT EXISTS public.page_content_blocks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    page_id UUID REFERENCES pages(id) ON DELETE CASCADE,
    content_block_id UUID REFERENCES content_blocks(id) ON DELETE CASCADE,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add CMS columns to posts table if they don't exist
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS slug TEXT;
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS status content_status DEFAULT 'draft';
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS scheduled_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS seo_title TEXT;
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS seo_description TEXT;

-- Create unique index on slug for posts if it doesn't exist
DO $$ 
BEGIN
    CREATE UNIQUE INDEX posts_slug_idx ON posts(slug) WHERE slug IS NOT NULL;
EXCEPTION
    WHEN duplicate_table THEN null;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS pages_slug_idx ON pages(slug);
CREATE INDEX IF NOT EXISTS pages_status_idx ON pages(status);
CREATE INDEX IF NOT EXISTS pages_page_type_idx ON pages(page_type);
CREATE INDEX IF NOT EXISTS pages_published_at_idx ON pages(published_at);
CREATE INDEX IF NOT EXISTS content_blocks_type_idx ON content_blocks(type);
CREATE INDEX IF NOT EXISTS content_blocks_global_idx ON content_blocks(is_global);

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_pages_updated_at ON pages;
CREATE TRIGGER update_pages_updated_at BEFORE UPDATE ON pages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_content_blocks_updated_at ON content_blocks;
CREATE TRIGGER update_content_blocks_updated_at BEFORE UPDATE ON content_blocks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS on CMS tables
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_content_blocks ENABLE ROW LEVEL SECURITY;

-- Drop and recreate is_admin function to fix parameter name conflict
DROP FUNCTION IF EXISTS is_admin(UUID);
CREATE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    -- Check if user has admin role
    RETURN EXISTS (
        SELECT 1 FROM auth.users
        WHERE id = user_id
        AND raw_user_meta_data->>'role' = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Pages policies
DROP POLICY IF EXISTS "Pages are viewable by everyone" ON pages;
CREATE POLICY "Pages are viewable by everyone" ON pages
    FOR SELECT USING (status = 'published' OR auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can insert pages" ON pages;
CREATE POLICY "Authenticated users can insert pages" ON pages
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authors can update their pages" ON pages;
CREATE POLICY "Authors can update their pages" ON pages
    FOR UPDATE USING (auth.uid() = author_id OR is_admin(auth.uid()));

DROP POLICY IF EXISTS "Authors can delete their pages" ON pages;
CREATE POLICY "Authors can delete their pages" ON pages
    FOR DELETE USING (auth.uid() = author_id OR is_admin(auth.uid()));

-- Content blocks policies
DROP POLICY IF EXISTS "Content blocks are viewable by everyone" ON content_blocks;
CREATE POLICY "Content blocks are viewable by everyone" ON content_blocks
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert content blocks" ON content_blocks;
CREATE POLICY "Authenticated users can insert content blocks" ON content_blocks
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Creators can update their content blocks" ON content_blocks;
CREATE POLICY "Creators can update their content blocks" ON content_blocks
    FOR UPDATE USING (auth.uid() = created_by OR is_admin(auth.uid()));

DROP POLICY IF EXISTS "Creators can delete their content blocks" ON content_blocks;
CREATE POLICY "Creators can delete their content blocks" ON content_blocks
    FOR DELETE USING (auth.uid() = created_by OR is_admin(auth.uid()));

-- Page content blocks policies
DROP POLICY IF EXISTS "Page content blocks are viewable by everyone" ON page_content_blocks;
CREATE POLICY "Page content blocks are viewable by everyone" ON page_content_blocks
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can manage page content blocks" ON page_content_blocks;
CREATE POLICY "Authenticated users can manage page content blocks" ON page_content_blocks
    FOR ALL USING (auth.role() = 'authenticated');

-- Function to auto-publish scheduled content
CREATE OR REPLACE FUNCTION publish_scheduled_content()
RETURNS void AS $$
BEGIN
    -- Update pages
    UPDATE pages 
    SET status = 'published', published_at = NOW()
    WHERE status = 'scheduled' 
    AND scheduled_at <= NOW();
    
    -- Update posts
    UPDATE posts 
    SET published = true
    WHERE status = 'scheduled' 
    AND scheduled_at <= NOW();
END;
$$ LANGUAGE plpgsql;

-- Create a function to generate slug from title
CREATE OR REPLACE FUNCTION generate_slug(title TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN lower(regexp_replace(regexp_replace(title, '[^a-zA-Z0-9\s]', '', 'g'), '\s+', '-', 'g'));
END;
$$ LANGUAGE plpgsql;