import { supabase } from './supabaseClient';

export interface Page {
  id: string;
  title: string;
  slug: string;
  page_type: 'study_malaysia' | 'travel_packages' | 'faqs' | 'travel_accessories' | 'esim' | 'visa_services' | 'education' | 'general';
  content: Record<string, any>;
  meta_title?: string;
  meta_description?: string;
  featured_image?: string;
  status: 'draft' | 'scheduled' | 'published' | 'archived';
  published_at?: string;
  scheduled_at?: string;
  author_id?: string;
  created_at: string;
  updated_at: string;
}

export interface ContentBlock {
  id: string;
  name: string;
  type: string;
  content: Record<string, any>;
  is_global: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface Post {
  id: number;
  title: string;
  content: string;
  excerpt?: string;
  featured_image?: string;
  author_id?: number;
  author_name?: string;
  category?: string;
  tags?: string[];
  published: boolean;
  featured: boolean;
  seo_title?: string;
  seo_description?: string;
  slug?: string;
  status?: 'draft' | 'scheduled' | 'published' | 'archived';
  scheduled_at?: string;
  created_at: string;
  updated_at: string;
}

export interface CreatePageData {
  title: string;
  slug?: string;
  page_type: Page['page_type'];
  content: Record<string, any>;
  meta_title?: string;
  meta_description?: string;
  featured_image?: string;
  status?: Page['status'];
  scheduled_at?: string;
}

export interface CreatePostData {
  title: string;
  content: string;
  excerpt?: string;
  featured_image?: string;
  category?: string;
  tags?: string[];
  published?: boolean;
  featured?: boolean;
  seo_title?: string;
  seo_description?: string;
  slug?: string;
  status?: Post['status'];
  scheduled_at?: string;
}

export interface CreateContentBlockData {
  name: string;
  type: string;
  content: Record<string, any>;
  is_global?: boolean;
}

class CMSAPIService {
  // Generate slug from title
  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .trim();
  }

  // PAGES MANAGEMENT
  async getPages(filters?: { status?: string; page_type?: string }): Promise<Page[]> {
    let query = supabase
      .from('pages')
      .select('*')
      .order('updated_at', { ascending: false });

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.page_type) {
      query = query.eq('page_type', filters.page_type);
    }

    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return data || [];
  }

  async getPageBySlug(slug: string): Promise<Page | null> {
    const { data, error } = await supabase
      .from('pages')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw new Error(error.message);
    }
    return data;
  }

  async getPageById(id: string): Promise<Page | null> {
    const { data, error } = await supabase
      .from('pages')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(error.message);
    }
    return data;
  }

  async createPage(pageData: CreatePageData): Promise<Page> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const slug = pageData.slug || this.generateSlug(pageData.title);
    
    const { data, error } = await supabase
      .from('pages')
      .insert({
        ...pageData,
        slug,
        author_id: user.id,
        published_at: pageData.status === 'published' ? new Date().toISOString() : null
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async updatePage(id: string, pageData: Partial<CreatePageData>): Promise<Page> {
    const updateData: any = { ...pageData };
    
    if (pageData.title && !pageData.slug) {
      updateData.slug = this.generateSlug(pageData.title);
    }

    if (pageData.status === 'published' && !updateData.published_at) {
      updateData.published_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('pages')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async deletePage(id: string): Promise<void> {
    const { error } = await supabase
      .from('pages')
      .delete()
      .eq('id', id);

    if (error) throw new Error(error.message);
  }

  // POSTS MANAGEMENT
  async getPosts(filters?: { status?: string; category?: string; published?: boolean }): Promise<Post[]> {
    let query = supabase
      .from('posts')
      .select('*')
      .order('updated_at', { ascending: false });

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.category) {
      query = query.eq('category', filters.category);
    }
    if (filters?.published !== undefined) {
      query = query.eq('published', filters.published);
    }

    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return data || [];
  }

  async getPostBySlug(slug: string): Promise<Post | null> {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(error.message);
    }
    return data;
  }

  async getPostById(id: number): Promise<Post | null> {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(error.message);
    }
    return data;
  }

  async createPost(postData: CreatePostData): Promise<Post> {
    const slug = postData.slug || this.generateSlug(postData.title);
    
    const { data, error } = await supabase
      .from('posts')
      .insert({
        ...postData,
        slug,
        published: postData.status === 'published' || postData.published || false
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async updatePost(id: number, postData: Partial<CreatePostData>): Promise<Post> {
    const updateData: any = { ...postData };
    
    if (postData.title && !postData.slug) {
      updateData.slug = this.generateSlug(postData.title);
    }

    if (postData.status === 'published') {
      updateData.published = true;
    }

    const { data, error } = await supabase
      .from('posts')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async deletePost(id: number): Promise<void> {
    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', id);

    if (error) throw new Error(error.message);
  }

  // CONTENT BLOCKS MANAGEMENT
  async getContentBlocks(filters?: { type?: string; is_global?: boolean }): Promise<ContentBlock[]> {
    let query = supabase
      .from('content_blocks')
      .select('*')
      .order('updated_at', { ascending: false });

    if (filters?.type) {
      query = query.eq('type', filters.type);
    }
    if (filters?.is_global !== undefined) {
      query = query.eq('is_global', filters.is_global);
    }

    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return data || [];
  }

  async getContentBlockById(id: string): Promise<ContentBlock | null> {
    const { data, error } = await supabase
      .from('content_blocks')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(error.message);
    }
    return data;
  }

  async createContentBlock(blockData: CreateContentBlockData): Promise<ContentBlock> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('content_blocks')
      .insert({
        ...blockData,
        created_by: user.id
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async updateContentBlock(id: string, blockData: Partial<CreateContentBlockData>): Promise<ContentBlock> {
    const { data, error } = await supabase
      .from('content_blocks')
      .update(blockData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async deleteContentBlock(id: string): Promise<void> {
    const { error } = await supabase
      .from('content_blocks')
      .delete()
      .eq('id', id);

    if (error) throw new Error(error.message);
  }

  // UTILITY METHODS
  async publishScheduledContent(): Promise<void> {
    const { error } = await supabase.rpc('publish_scheduled_content');
    if (error) throw new Error(error.message);
  }

  async getPageTypes(): Promise<Array<{ value: string; label: string }>> {
    return [
      { value: 'study_malaysia', label: 'Study in Malaysia' },
      { value: 'travel_packages', label: 'Travel Packages' },
      { value: 'faqs', label: 'FAQs' },
      { value: 'travel_accessories', label: 'Travel Accessories' },
      { value: 'esim', label: 'eSIM' },
      { value: 'visa_services', label: 'Visa Services' },
      { value: 'education', label: 'Education' },
      { value: 'general', label: 'General' }
    ];
  }

  async getContentBlockTypes(): Promise<Array<{ value: string; label: string }>> {
    return [
      { value: 'hero', label: 'Hero Section' },
      { value: 'text', label: 'Text Block' },
      { value: 'image', label: 'Image' },
      { value: 'gallery', label: 'Image Gallery' },
      { value: 'faq', label: 'FAQ Section' },
      { value: 'features', label: 'Features List' },
      { value: 'testimonials', label: 'Testimonials' },
      { value: 'cta', label: 'Call to Action' },
      { value: 'form', label: 'Form' },
      { value: 'video', label: 'Video' }
    ];
  }
}

export default new CMSAPIService();