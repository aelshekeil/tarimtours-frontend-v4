# Content Management System Guide

## Overview
The TarimTours CMS features a comprehensive content management system with user-friendly visual editors, rich text editing capabilities, and image upload functionality. This guide explains how to create and manage dynamic content across pages, posts, and content blocks.

## Content Types

### 1. Pages
Dynamic pages for different content types (Study in Malaysia, Travel Packages, FAQs, etc.)

### 2. Posts
Blog-style content with rich text editing, categories, tags, and SEO features

### 3. Content Blocks
Reusable content components that can be used across multiple pages

## How to Add Content

### 1. Accessing the Content Management System
- Go to Admin Dashboard → Content Management
- Choose from three tabs: **Pages**, **Posts**, or **Content Blocks**
- Click the "Add" button for the content type you want to create

### 2. Enhanced Content Editors

#### Pages - Visual Content Editor
The page editor provides several pre-built content section types:

**Hero Section**
- Large banner with title, description, and background image
- Perfect for page headers
- Fields: Title, Content, Image (URL or Upload)

**Text Block**
- Simple text content with title
- Good for articles, descriptions, information blocks
- Fields: Title, Content

**Image**
- Single image with optional caption
- Fields: Image (URL or Upload), Caption

**Features List**
- Bulleted list of features or benefits
- Fields: Title, List Items (add/remove as needed)

**FAQ Section**
- Question and answer pairs
- Format: "Q: Your question?|A: Your answer"
- Fields: Title, Q&A Items

##### How to Add Page Sections
1. Click any of the colored buttons: "Hero Section", "Text Block", "Image", etc.
2. A new section will appear with pre-filled example content
3. Edit the fields to match your needs
4. Use the trash icon to remove unwanted sections

#### Posts - Rich Text Editor
Posts feature a powerful rich text editor with formatting tools:

**Formatting Options**
- **Bold**: `**text**` or use the Bold button
- **Italic**: `*text*` or use the Italic button
- **Underline**: `<u>text</u>` or use the Underline button
- **Code**: `code` or use the Code button
- **Links**: `[text](url)` or use the Link button
- **Images**: `![alt](url)` or use the Image button
- **Lists**: Use the List buttons or type `- item` for bullets, `1. item` for numbers

**Editor Features**
- Live preview toggle to see formatted content
- Toolbar with formatting buttons
- Markdown-style syntax support
- Help text showing formatting shortcuts

#### Content Blocks - Visual Editor
Content blocks use the same visual editor as pages, allowing you to create reusable components.

### 3. Image Management

#### Image Upload Options
All image fields now support two input methods:

**URL Input**
- Enter a direct URL to an image file
- Supports common formats: PNG, JPG, JPEG, GIF, WebP

**File Upload**
- Click "Upload" tab to switch to file upload mode
- Drag and drop images or click to browse
- Automatic image preview
- Supports the same formats as URL input

**Image Upload Process**
1. Switch to "Upload" mode using the toggle buttons
2. Drag an image file into the upload area or click to browse
3. Wait for upload completion
4. Image URL will be automatically filled
5. Preview appears below the upload area

#### Image Best Practices
- Use high-quality images (minimum 1200px width for hero sections)
- Optimize images for web (under 500KB recommended)
- Use descriptive alt text for accessibility
- Consider using a CDN for better performance

### 4. Content Organization and Fields

#### Page Content
- **Title**: Main heading for the section
- **Content**: Description, paragraph text, or caption
- **Image**: Upload from desktop or enter URL
- **List Items**: For features and FAQs, click "Add Item" to add more entries

#### Post Content
- **Title**: Post headline
- **Content**: Rich text content with formatting
- **Excerpt**: Brief summary for previews
- **Featured Image**: Upload or URL for main post image
- **Category**: Organize posts by topic
- **Tags**: Keywords for better searchability
- **SEO Fields**: Custom title and description for search engines

#### Content Block Content
- **Name**: Identifier for the content block
- **Type**: Block type (hero, text, image, etc.)
- **Content**: Visual editor for block content
- **Global**: Check to make reusable across pages

### 5. Content Examples

#### Example 1: Study in Malaysia Page
```
Section 1: Hero Section
- Title: "Study in Malaysia - Your Gateway to Excellence"
- Content: "Discover world-class education opportunities in Malaysia with our comprehensive guidance and support services."
- Image: Upload a high-quality university campus image

Section 2: Features List
- Title: "Why Choose Malaysia?"
- Items:
  - "Affordable tuition fees"
  - "English-taught programs"
  - "Multicultural environment"
  - "High-quality education"

Section 3: FAQ
- Title: "Frequently Asked Questions"
- Items:
  - "Q: What are the admission requirements?|A: Requirements vary by university and program. Generally, you need academic transcripts, English proficiency test scores, and a valid passport."
  - "Q: How long does the visa process take?|A: Student visa processing typically takes 2-4 weeks after document submission."
```

#### Example 2: Travel Blog Post
```
Title: "Top 10 Hidden Gems in Malaysia"
Content: Use rich text editor with:
- **Bold headings** for each location
- *Italic text* for emphasis
- [Links](url) to booking pages
- ![Images](url) for each destination
- Bulleted lists for highlights

Featured Image: Upload a stunning Malaysia landscape
Category: Travel
Tags: Malaysia, Hidden Gems, Travel Guide
```

#### Example 3: Reusable Content Block
```
Block Name: "Contact CTA"
Type: Call to Action
Content:
- Title: "Ready to Start Your Journey?"
- Description: "Contact our expert team for personalized assistance"
- Button Text: "Get Started"
- Button Link: "/contact"
Global: ✓ (to use across multiple pages)
```

### 6. Advanced Features

#### JSON View (Pages & Content Blocks)
- Click "JSON View" to see the raw data structure
- Useful for advanced users or troubleshooting
- Click "Visual Editor" to return to the user-friendly interface

#### Rich Text Preview (Posts)
- Click "Preview" to see formatted content
- Toggle back to "Edit" to continue writing
- Real-time formatting as you type

#### Content Structure
The system automatically creates structured data:

**Pages & Content Blocks:**
```json
{
  "sections": [
    {
      "type": "hero",
      "title": "Your Title",
      "content": "Your content",
      "image": "uploaded-image-url.jpg"
    },
    {
      "type": "features",
      "title": "Features",
      "items": ["Item 1", "Item 2", "Item 3"]
    }
  ]
}
```

**Posts:**
```
Rich text with markdown-style formatting
**Bold text**, *italic text*, [links](url)
- Bulleted lists
1. Numbered lists
```

### 7. Publishing & Management

#### Status Options
- **Draft**: Content is saved but not visible to visitors
- **Published**: Content is live and visible to everyone
- **Scheduled**: Content will be published at a specific date/time
- **Archived**: Content is hidden but preserved

#### Content Organization
- **Pages**: Organized by page type (Study Malaysia, Travel Packages, etc.)
- **Posts**: Organized by category and tags
- **Content Blocks**: Organized by type and global/local usage

#### SEO Optimization
- Fill in Meta Title and Meta Description for pages
- Use SEO Title and SEO Description for posts
- Include relevant keywords naturally in content
- Upload optimized images with descriptive names

### 8. Best Practices

#### Content Creation
1. **Pages**: Start with a Hero section for impact, follow with informative content
2. **Posts**: Use engaging headlines, break up text with formatting, include images
3. **Content Blocks**: Create reusable components for consistent branding

#### Image Management
- Upload high-quality images (minimum 1200px width for heroes)
- Optimize images for web (under 500KB recommended)
- Use descriptive alt text for accessibility
- Maintain consistent image styles across content

#### Writing Guidelines
- Keep titles concise and descriptive
- Write in a friendly, helpful tone
- Use formatting to improve readability
- Include relevant keywords for SEO
- Break up long content with headings and lists

### 9. Troubleshooting

#### Common Issues
- **Content not saving**: Check internet connection and try again
- **Images not uploading**: Ensure file size is under 5MB and format is supported
- **Formatting not working**: Check markdown syntax in rich text editor
- **Preview not updating**: Refresh the page and try again

#### Getting Help
- Check browser console (F12) for error messages
- Ensure you're logged in with proper permissions
- Verify file formats and sizes for uploads
- Contact the development team for technical issues

## Content Types Reference

### Pages
- **Hero Section**: Main banner with title, content, and image
- **Text Block**: General content with title and description
- **Image**: Single image with caption
- **Features List**: Bulleted benefits or highlights
- **FAQ Section**: Question and answer pairs

### Posts
- **Rich Text Content**: Full markdown-style formatting support
- **Categories**: Organize posts by topic
- **Tags**: Keywords for searchability
- **SEO Fields**: Custom meta information
- **Featured Images**: Main post visuals

### Content Blocks
- **Reusable Components**: Use across multiple pages
- **Global Blocks**: Available site-wide
- **Local Blocks**: Page-specific components
- **All Section Types**: Same options as pages

## Recent Enhancements ✨

### ✅ Completed Features
- **Rich Text Editor**: Full formatting toolbar for posts
- **Image Upload**: Direct file upload from desktop
- **Enhanced Visual Editor**: Improved page content creation
- **Content Block Management**: Reusable component system
- **SEO Optimization**: Meta fields for better search visibility
- **Content Scheduling**: Publish content at specific times

### 🚀 Future Enhancements
- Video embedding capabilities
- Custom CSS styling options
- Content templates and themes
- Multi-language content support
- Advanced image editing tools
- Content analytics and insights