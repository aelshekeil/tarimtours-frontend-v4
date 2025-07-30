import React, { useState, useEffect } from 'react';
import { X, Save, Layout } from 'lucide-react';
import cmsAPI, { ContentBlock, CreateContentBlockData } from '../../services/cmsAPI';
import ContentEditor from './ContentEditor';

interface EditContentBlockModalProps {
  contentBlock: ContentBlock;
  onClose: () => void;
  onSuccess: () => void;
}

const EditContentBlockModal: React.FC<EditContentBlockModalProps> = ({ contentBlock, onClose, onSuccess }) => {
  const [formData, setFormData] = useState<Partial<CreateContentBlockData>>({
    name: contentBlock.name,
    type: contentBlock.type,
    content: contentBlock.content,
    is_global: contentBlock.is_global
  });
  const [loading, setLoading] = useState(false);
  const [blockTypes, setBlockTypes] = useState<Array<{ value: string; label: string }>>([]);

  useEffect(() => {
    loadBlockTypes();
  }, []);

  const loadBlockTypes = async () => {
    try {
      const types = await cmsAPI.getContentBlockTypes();
      setBlockTypes(types);
    } catch (error) {
      console.error('Error loading block types:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await cmsAPI.updateContentBlock(contentBlock.id, formData);
      onSuccess();
    } catch (error) {
      console.error('Error updating content block:', error);
      alert('Failed to update content block. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof CreateContentBlockData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const getDefaultContent = (type: string) => {
    const defaults: Record<string, any> = {
      hero: {
        title: 'Hero Title',
        subtitle: 'Hero subtitle text',
        backgroundImage: '',
        ctaText: 'Call to Action',
        ctaLink: '#'
      },
      text: {
        content: 'Your text content here...',
        alignment: 'left'
      },
      image: {
        src: '',
        alt: 'Image description',
        caption: ''
      },
      gallery: {
        images: [
          { src: '', alt: '', caption: '' }
        ]
      },
      faq: {
        items: [
          { question: 'Sample question?', answer: 'Sample answer.' }
        ]
      },
      features: {
        title: 'Features',
        items: [
          { title: 'Feature 1', description: 'Feature description', icon: '' }
        ]
      },
      testimonials: {
        title: 'What Our Customers Say',
        items: [
          { name: 'Customer Name', content: 'Testimonial content', rating: 5, avatar: '' }
        ]
      },
      cta: {
        title: 'Call to Action Title',
        description: 'Call to action description',
        buttonText: 'Get Started',
        buttonLink: '#',
        backgroundColor: '#3B82F6'
      },
      form: {
        title: 'Contact Form',
        fields: [
          { name: 'name', label: 'Name', type: 'text', required: true },
          { name: 'email', label: 'Email', type: 'email', required: true }
        ],
        submitText: 'Submit'
      },
      video: {
        src: '',
        title: 'Video Title',
        description: 'Video description',
        thumbnail: ''
      }
    };

    return defaults[type] || {};
  };

  const handleTypeChange = (newType: string) => {
    if (newType !== formData.type) {
      const confirmChange = confirm(
        'Changing the block type will reset the content structure. Are you sure you want to continue?'
      );
      if (confirmChange) {
        handleInputChange('type', newType);
        handleInputChange('content', getDefaultContent(newType));
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Edit Content Block</h2>
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
                  Block Name *
                </label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Homepage Hero, About Us Text"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Block Type *
                </label>
                <select
                  value={formData.type || 'text'}
                  onChange={(e) => handleTypeChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  {blockTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.is_global || false}
                    onChange={(e) => handleInputChange('is_global', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    Global Block
                    <p className="text-xs text-gray-500 mt-1">
                      Can be reused across multiple pages
                    </p>
                  </span>
                </label>
              </div>
            </div>

            {/* Block Preview */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Block Preview</h3>
              <div className="bg-gray-50 p-4 rounded-md border-2 border-dashed border-gray-300">
                <div className="flex items-center justify-center text-gray-500">
                  <Layout className="w-8 h-8 mb-2" />
                </div>
                <p className="text-center text-sm text-gray-600">
                  {(formData.type || 'text').charAt(0).toUpperCase() + (formData.type || 'text').slice(1)} Block
                </p>
                <p className="text-center text-xs text-gray-500 mt-1">
                  {formData.is_global ? 'Global Block' : 'Page-specific Block'}
                </p>
              </div>
            </div>
          </div>

          {/* Content Configuration */}
          <div>
            <ContentEditor
              content={formData.content || {}}
              onChange={(content) => handleInputChange('content', content)}
            />
          </div>

          {/* Content Type Examples */}
          <div className="bg-blue-50 p-4 rounded-md">
            <h4 className="text-sm font-medium text-blue-900 mb-2">
              {(formData.type || 'text').charAt(0).toUpperCase() + (formData.type || 'text').slice(1)} Block Structure Reference
            </h4>
            <pre className="text-xs text-blue-800 bg-blue-100 p-2 rounded overflow-x-auto">
              {JSON.stringify(getDefaultContent(formData.type || 'text'), null, 2)}
            </pre>
          </div>

          {/* Block Info */}
          <div className="bg-gray-50 p-4 rounded-md">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Block Information</h4>
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
              <div>
                <span className="font-medium">Created:</span> {new Date(contentBlock.created_at).toLocaleString()}
              </div>
              <div>
                <span className="font-medium">Last Updated:</span> {new Date(contentBlock.updated_at).toLocaleString()}
              </div>
              <div>
                <span className="font-medium">Block ID:</span> {contentBlock.id}
              </div>
              <div>
                <span className="font-medium">Usage:</span> {contentBlock.is_global ? 'Global (Reusable)' : 'Page-specific'}
              </div>
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
              {loading ? 'Updating...' : 'Update Block'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditContentBlockModal;