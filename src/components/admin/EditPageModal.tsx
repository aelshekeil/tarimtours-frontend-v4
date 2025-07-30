import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import cmsAPI, { Page, CreatePageData } from '../../services/cmsAPI';
import ContentEditor from './ContentEditor';
import ImageUploader from './ImageUploader';

interface EditPageModalProps {
  page: Page;
  onClose: () => void;
  onSuccess: () => void;
}

const EditPageModal: React.FC<EditPageModalProps> = ({ page, onClose, onSuccess }) => {
  const [formData, setFormData] = useState<Partial<CreatePageData>>({
    title: page.title,
    slug: page.slug,
    page_type: page.page_type,
    content: page.content,
    meta_title: page.meta_title || '',
    meta_description: page.meta_description || '',
    featured_image: page.featured_image || '',
    status: page.status,
    scheduled_at: page.scheduled_at ? new Date(page.scheduled_at).toISOString().slice(0, 16) : ''
  });
  const [loading, setLoading] = useState(false);
  const [pageTypes, setPageTypes] = useState<Array<{ value: string; label: string }>>([]);

  useEffect(() => {
    loadPageTypes();
  }, []);

  const loadPageTypes = async () => {
    try {
      const types = await cmsAPI.getPageTypes();
      setPageTypes(types);
    } catch (error) {
      console.error('Error loading page types:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const submitData = { ...formData };
      
      // Remove empty fields
      if (!submitData.meta_title) delete submitData.meta_title;
      if (!submitData.meta_description) delete submitData.meta_description;
      if (!submitData.featured_image) delete submitData.featured_image;
      if (!submitData.scheduled_at) delete submitData.scheduled_at;

      await cmsAPI.updatePage(page.id, submitData);
      onSuccess();
    } catch (error) {
      console.error('Error updating page:', error);
      alert('Failed to update page. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof CreatePageData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const generateSlug = () => {
    const slug = formData.title
      ?.toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .trim();
    handleInputChange('slug', slug);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Edit Page</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title || ''}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Slug
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.slug || ''}
                    onChange={(e) => handleInputChange('slug', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="auto-generated-from-title"
                  />
                  <button
                    type="button"
                    onClick={generateSlug}
                    className="px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                  >
                    Generate
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Page Type *
                </label>
                <select
                  value={formData.page_type || 'general'}
                  onChange={(e) => handleInputChange('page_type', e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  {pageTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <ImageUploader
                  value={formData.featured_image || ''}
                  onChange={(url) => handleInputChange('featured_image', url)}
                  label="Featured Image"
                  placeholder="https://example.com/image.jpg"
                />
              </div>
            </div>

            {/* SEO & Publishing */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">SEO & Publishing</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Meta Title
                </label>
                <input
                  type="text"
                  value={formData.meta_title || ''}
                  onChange={(e) => handleInputChange('meta_title', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="SEO title for search engines"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Meta Description
                </label>
                <textarea
                  value={formData.meta_description || ''}
                  onChange={(e) => handleInputChange('meta_description', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="SEO description for search engines"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status *
                </label>
                <select
                  value={formData.status || 'draft'}
                  onChange={(e) => handleInputChange('status', e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="archived">Archived</option>
                </select>
              </div>

              {formData.status === 'scheduled' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Scheduled Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.scheduled_at || ''}
                    onChange={(e) => handleInputChange('scheduled_at', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required={formData.status === 'scheduled'}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Content */}
          <div>
            <ContentEditor
              content={formData.content || {}}
              onChange={(content) => handleInputChange('content', content)}
            />
          </div>

          {/* Page Info */}
          <div className="bg-gray-50 p-4 rounded-md">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Page Information</h4>
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
              <div>
                <span className="font-medium">Created:</span> {new Date(page.created_at).toLocaleString()}
              </div>
              <div>
                <span className="font-medium">Last Updated:</span> {new Date(page.updated_at).toLocaleString()}
              </div>
              {page.published_at && (
                <div>
                  <span className="font-medium">Published:</span> {new Date(page.published_at).toLocaleString()}
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Save className="w-4 h-4" />
              )}
              {loading ? 'Updating...' : 'Update Page'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPageModal;