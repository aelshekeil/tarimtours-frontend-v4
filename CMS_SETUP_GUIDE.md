# CMS (Content Management System) Setup Guide

This guide explains how to set up and use the dynamic pages & CMS functionality in your TarimTours application.

## Overview

The CMS system provides:
- **Dynamic Pages**: Create and manage pages for different content types (Study in Malaysia, Travel Packages, FAQs, etc.)
- **Blog Posts**: Manage blog content with categories, tags, and SEO features
- **Content Blocks**: Reusable content components (hero sections, text blocks, galleries, etc.)
- **Scheduling**: Schedule content to be published at specific times
- **Draft/Publish Workflow**: Control content visibility with draft, scheduled, published, and archived states

## Database Setup

### 1. Run the CMS Migration

Apply the CMS database migration to create the necessary tables:

```bash
# If using Supabase CLI
supabase db push

# Or apply the migration file directly in your Supabase dashboard
# File: supabase/migrations/20250729090000_create_cms_tables.sql
```

### 2. Database Tables Created

The migration creates these tables:
- `pages` - Dynamic pages with different types
- `content_blocks` - Reusable content components
- `page_content_blocks` - Junction table linking pages to content blocks
- Enhanced `posts` table with CMS features

## Admin Dashboard Access

### 1. Access the CMS

1. Navigate to your admin dashboard: `/admin`
2. Click on "Content Management" in the sidebar
3. You'll see three tabs:
   - **Pages**: Manage dynamic pages
   - **Posts**: Manage blog posts
   - **Content Blocks**: Manage reusable content components

### 2. User Permissions

Ensure your admin user has the necessary permissions:
- `manage_content` permission for content management
- `admin` or `super_admin` role for full access

## Creating Dynamic Pages

### 1. Page Types Available

- **Study in Malaysia**: Educational content and programs
- **Travel Packages**: Tour packages and travel offers
- **FAQs**: Frequently asked questions
- **Travel Accessories**: Travel gear and accessories
- **eSIM**: eSIM products and services
- **Visa Services**: Visa application services
- **Education**: General educational content
- **General**: Any other content type

### 2. Creating a New Page

1. Go to Admin Dashboard → Content Management → Pages
2. Click "Add Page"
3. Fill in the required information:
   - **Title**: Page title (required)
   - **Slug**: URL-friendly version (auto-generated if empty)
   - **Page Type**: Select from available types
   - **Content**: JSON structure for page content
   - **Meta Title/Description**: SEO optimization
   - **Featured Image**: Page thumbnail/hero image
   - **Status**: Draft, Published, or Scheduled

### 3. Page Content Structure

Pages use a flexible JSON content structure. Example:

```json
{
  "sections": [
    {
      "type": "hero",
      "title": "Study in Malaysia",
      "subtitle": "World-class education awaits you",
      "backgroundImage": "https://example.com/hero-bg.jpg",
      "ctaText": "Learn More",
      "ctaLink": "/contact"
    },
    {
      "type": "text",
      "content": "<p>Malaysia offers excellent educational opportunities...</p>",
      "alignment": "left"
    },
    {
      "type": "features",
      "title": "Why Choose Malaysia?",
      "items": [
        {
          "title": "Quality Education",
          "description": "World-renowned universities and programs",
          "icon": "https://example.com/education-icon.png"
        }
      ]
    }
  ]
}
```

## Managing Blog Posts

### 1. Creating Posts

1. Go to Content Management → Posts
2. Click "Add Post"
3. Fill in the post details:
   - **Title**: Post title
   - **Content**: Main post content (supports HTML)
   - **Excerpt**: Brief summary
   - **Category**: Post category
   - **Tags**: Searchable tags
   - **SEO Fields**: Meta title and description
   - **Featured**: Mark as featured post
   - **Status**: Draft, Published, Scheduled, or Archived

### 2. Post Scheduling

To schedule a post:
1. Set Status to "Scheduled"
2. Select the desired publication date and time
3. The post will automatically publish at the scheduled time

## Content Blocks

### 1. Available Block Types

- **Hero Section**: Page headers with background images
- **Text Block**: Rich text content
- **Image**: Single images with captions
- **Gallery**: Multiple images in a grid
- **FAQ**: Question and answer sections
- **Features**: Feature lists with icons
- **Testimonials**: Customer testimonials
- **Call to Action**: Action buttons and prompts
- **Form**: Contact forms
- **Video**: Video embeds

### 2. Creating Content Blocks

1. Go to Content Management → Content Blocks
2. Click "Add Content Block"
3. Configure the block:
   - **Name**: Descriptive name for the block
   - **Type**: Select block type
   - **Content**: JSON configuration for the block
   - **Global**: Check if the block can be reused across pages

### 3. Example Content Block Structures

**Hero Block:**
```json
{
  "title": "Welcome to TarimTours",
  "subtitle": "Your gateway to amazing experiences",
  "backgroundImage": "https://example.com/hero.jpg",
  "ctaText": "Get Started",
  "ctaLink": "/packages"
}
```

**FAQ Block:**
```json
{
  "items": [
    {
      "question": "What services do you offer?",
      "answer": "We offer visa services, travel packages, and educational consulting."
    },
    {
      "question": "How do I book a package?",
      "answer": "You can book through our website or contact our support team."
    }
  ]
}
```

## Frontend Integration

### 1. Displaying Dynamic Pages

Use the `DynamicPage` component to display CMS pages:

```tsx
import DynamicPage from '../components/DynamicPage';

// In your router
<Route path="/page/:slug" element={<DynamicPage />} />

// Or with specific page type
<DynamicPage pageType="study_malaysia" slug="study-programs" />
```

### 2. Accessing Pages by Type

Create dedicated routes for different page types:

```tsx
// Study in Malaysia pages
<Route path="/study/:slug" element={<DynamicPage pageType="study_malaysia" />} />

// Travel packages
<Route path="/packages/:slug" element={<DynamicPage pageType="travel_packages" />} />

// FAQs
<Route path="/faq/:slug" element={<DynamicPage pageType="faqs" />} />
```

### 3. Listing Pages

Create page listings:

```tsx
import cmsAPI from '../services/cmsAPI';

const StudyPages = () => {
  const [pages, setPages] = useState([]);

  useEffect(() => {
    const loadPages = async () => {
      const studyPages = await cmsAPI.getPages({ 
        page_type: 'study_malaysia',
        status: 'published'
      });
      setPages(studyPages);
    };
    loadPages();
  }, []);

  return (
    <div>
      {pages.map(page => (
        <div key={page.id}>
          <h2>{page.title}</h2>
          <Link to={`/study/${page.slug}`}>Read More</Link>
        </div>
      ))}
    </div>
  );
};
```

## Scheduling System

### 1. Automatic Publishing

The scheduling service automatically publishes scheduled content:

```tsx
import schedulingService from '../services/schedulingService';

// Start the scheduling service (runs automatically in production)
schedulingService.start(5); // Check every 5 minutes

// Get scheduled content
const scheduledContent = await schedulingService.getScheduledContent();

// Manual trigger
await schedulingService.publishScheduledContentNow();
```

### 2. Scheduling Content

Schedule pages and posts programmatically:

```tsx
// Schedule a page
await schedulingService.schedulePage(pageId, new Date('2024-12-25T10:00:00'));

// Schedule a post
await schedulingService.schedulePost(postId, new Date('2024-12-25T10:00:00'));
```

## SEO Features

### 1. Meta Tags

Each page and post supports:
- Custom meta title
- Meta description
- Featured image for social sharing
- Automatic slug generation

### 2. URL Structure

Pages use SEO-friendly URLs:
- `/page/study-in-malaysia`
- `/page/travel-packages-2024`
- `/page/frequently-asked-questions`

## Best Practices

### 1. Content Organization

- Use descriptive page titles and slugs
- Organize content with appropriate page types
- Use content blocks for reusable elements
- Keep content structure consistent

### 2. SEO Optimization

- Always fill in meta titles and descriptions
- Use descriptive alt text for images
- Create meaningful URL slugs
- Optimize content for search engines

### 3. Content Workflow

- Start with drafts for content review
- Use scheduling for planned releases
- Archive outdated content instead of deleting
- Regular content audits and updates

### 4. Performance

- Optimize images before uploading
- Use content blocks to avoid duplication
- Monitor page load times
- Cache frequently accessed content

## Troubleshooting

### 1. Common Issues

**Pages not displaying:**
- Check page status (must be "published")
- Verify slug matches URL
- Ensure proper routing setup

**Scheduled content not publishing:**
- Check scheduling service is running
- Verify scheduled time is in the future
- Check database permissions

**Content blocks not rendering:**
- Validate JSON structure
- Check block type is supported
- Verify content block exists

### 2. Database Queries

Check content directly in the database:

```sql
-- Get all published pages
SELECT * FROM pages WHERE status = 'published';

-- Get scheduled content
SELECT * FROM pages WHERE status = 'scheduled' AND scheduled_at <= NOW();

-- Get content blocks
SELECT * FROM content_blocks WHERE is_global = true;
```

## API Reference

### CMS API Methods

```tsx
import cmsAPI from '../services/cmsAPI';

// Pages
await cmsAPI.getPages(filters);
await cmsAPI.getPageBySlug(slug);
await cmsAPI.createPage(pageData);
await cmsAPI.updatePage(id, pageData);
await cmsAPI.deletePage(id);

// Posts
await cmsAPI.getPosts(filters);
await cmsAPI.getPostBySlug(slug);
await cmsAPI.createPost(postData);
await cmsAPI.updatePost(id, postData);
await cmsAPI.deletePost(id);

// Content Blocks
await cmsAPI.getContentBlocks(filters);
await cmsAPI.createContentBlock(blockData);
await cmsAPI.updateContentBlock(id, blockData);
await cmsAPI.deleteContentBlock(id);

// Utilities
await cmsAPI.publishScheduledContent();
await cmsAPI.getPageTypes();
await cmsAPI.getContentBlockTypes();
```

This CMS system provides a powerful foundation for managing dynamic content in your TarimTours application. You can extend it further by adding more content block types, implementing a visual editor, or adding more advanced scheduling features.