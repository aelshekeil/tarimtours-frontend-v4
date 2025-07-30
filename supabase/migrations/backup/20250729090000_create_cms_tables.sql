-- Enhanced CMS tables for dynamic pages and content management

-- Create page_types enum
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

-- Create content_status enum  
CREATE TYPE content_status AS ENUM (
  'draft',
  'scheduled',
  'published',
  'archived'
);

-- Enhanced pages table for dynamic content
CREATE TABLE IF NOT EXISTS pages (
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
CREATE TABLE IF NOT EXISTS content_blocks (
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
CREATE TABLE IF NOT EXISTS page_content_blocks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  page_id UUID REFERENCES pages(id) ON DELETE CASCADE,
  content_block_id UUID REFERENCES content_blocks(id) ON DELETE CASCADE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enhanced posts table (modify existing)
ALTER TABLE posts ADD COLUMN IF NOT EXISTS slug TEXT;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS status content_status DEFAULT 'draft';
ALTER TABLE posts ADD COLUMN IF NOT EXISTS scheduled_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS meta_title TEXT;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS meta_description TEXT;

-- Create unique index on slug for posts
CREATE UNIQUE INDEX IF NOT EXISTS posts_slug_idx ON posts(slug) WHERE slug IS NOT NULL;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS pages_slug_idx ON pages(slug);
CREATE INDEX IF NOT EXISTS pages_status_idx ON pages(status);
CREATE INDEX IF NOT EXISTS pages_page_type_idx ON pages(page_type);
CREATE INDEX IF NOT EXISTS pages_published_at_idx ON pages(published_at);
CREATE INDEX IF NOT EXISTS content_blocks_type_idx ON content_blocks(type);
CREATE INDEX IF NOT EXISTS content_blocks_global_idx ON content_blocks(is_global);

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_pages_updated_at BEFORE UPDATE ON pages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_content_blocks_updated_at BEFORE UPDATE ON content_blocks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_content_blocks ENABLE ROW LEVEL SECURITY;

-- Pages policies
CREATE POLICY "Pages are viewable by everyone" ON pages
    FOR SELECT USING (status = 'published' OR auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert pages" ON pages
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authors can update their pages" ON pages
    FOR UPDATE USING (auth.uid() = author_id OR is_admin(auth.uid()));

CREATE POLICY "Authors can delete their pages" ON pages
    FOR DELETE USING (auth.uid() = author_id OR is_admin(auth.uid()));

-- Content blocks policies
CREATE POLICY "Content blocks are viewable by everyone" ON content_blocks
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert content blocks" ON content_blocks
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Creators can update their content blocks" ON content_blocks
    FOR UPDATE USING (auth.uid() = created_by OR is_admin(auth.uid()));

CREATE POLICY "Creators can delete their content blocks" ON content_blocks
    FOR DELETE USING (auth.uid() = created_by OR is_admin(auth.uid()));

-- Page content blocks policies
CREATE POLICY "Page content blocks are viewable by everyone" ON page_content_blocks
    FOR SELECT USING (true);

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