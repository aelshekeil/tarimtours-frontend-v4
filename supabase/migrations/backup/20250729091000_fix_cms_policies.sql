-- Fix CMS policies to remove dependency on is_admin function

-- Drop existing policies that reference is_admin
DROP POLICY IF EXISTS "Authors can update their pages" ON pages;
DROP POLICY IF EXISTS "Authors can delete their pages" ON pages;
DROP POLICY IF EXISTS "Creators can update their content blocks" ON content_blocks;
DROP POLICY IF EXISTS "Creators can delete their content blocks" ON content_blocks;

-- Create simplified policies for pages
CREATE POLICY "Authors can update their pages" ON pages
    FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Authors can delete their pages" ON pages
    FOR DELETE USING (auth.uid() = author_id);

-- Create simplified policies for content blocks
CREATE POLICY "Creators can update their content blocks" ON content_blocks
    FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Creators can delete their content blocks" ON content_blocks
    FOR DELETE USING (auth.uid() = created_by);

-- Create is_admin function for future use
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    -- For now, return false. This can be enhanced later with proper admin role checking
    RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update posts table to ensure it has the required columns
ALTER TABLE posts ADD COLUMN IF NOT EXISTS seo_title TEXT;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS seo_description TEXT;

-- Ensure posts slug column allows NULL values initially
ALTER TABLE posts ALTER COLUMN slug DROP NOT NULL;