import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Eye, FileText, Tag } from 'lucide-react';
import cmsAPI, { Page } from '../services/cmsAPI';
import LoadingSpinner from '../components/common/LoadingSpinner';

const CMSPagesList: React.FC = () => {
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<string>('all');

  useEffect(() => {
    loadPages();
  }, [selectedType]);

  const loadPages = async () => {
    setLoading(true);
    try {
      const filters: any = { status: 'published' };
      if (selectedType !== 'all') {
        filters.page_type = selectedType;
      }
      const pagesData = await cmsAPI.getPages(filters);
      setPages(pagesData);
    } catch (error) {
      console.error('Error loading pages:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPageTypeLabel = (type: string) => {
    const typeLabels: Record<string, string> = {
      'study_malaysia': 'Study in Malaysia',
      'travel_packages': 'Travel Packages',
      'faqs': 'FAQs',
      'travel_accessories': 'Travel Accessories',
      'esim': 'eSIM',
      'visa_services': 'Visa Services',
      'education': 'Education',
      'general': 'General'
    };
    return typeLabels[type] || type;
  };

  const getPageUrl = (page: Page) => {
    const typeRoutes: Record<string, string> = {
      'study_malaysia': '/study/',
      'travel_packages': '/packages/',
      'faqs': '/faq/',
      'travel_accessories': '/accessories/',
      'esim': '/esim/',
      'visa_services': '/visa/',
      'education': '/education/',
      'general': '/page/'
    };
    return (typeRoutes[page.page_type] || '/page/') + page.slug;
  };

  const pageTypes = [
    { value: 'all', label: 'All Pages' },
    { value: 'study_malaysia', label: 'Study in Malaysia' },
    { value: 'travel_packages', label: 'Travel Packages' },
    { value: 'faqs', label: 'FAQs' },
    { value: 'travel_accessories', label: 'Travel Accessories' },
    { value: 'esim', label: 'eSIM' },
    { value: 'visa_services', label: 'Visa Services' },
    { value: 'education', label: 'Education' },
    { value: 'general', label: 'General' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">All Pages</h1>
          <p className="text-gray-600">Browse all published content pages</p>
        </div>

        {/* Filter */}
        <div className="mb-6">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {pageTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        {/* Pages Grid */}
        {pages.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Pages Found</h3>
            <p className="text-gray-600">
              {selectedType === 'all' 
                ? 'No published pages available yet.' 
                : `No published pages found for ${getPageTypeLabel(selectedType)}.`
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pages.map((page) => (
              <div key={page.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                {/* Featured Image */}
                {page.featured_image && (
                  <div className="h-48 bg-gray-200">
                    <img
                      src={page.featured_image}
                      alt={page.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                
                {/* Content */}
                <div className="p-6">
                  {/* Page Type Badge */}
                  <div className="mb-3">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      <Tag className="w-3 h-3 mr-1" />
                      {getPageTypeLabel(page.page_type)}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2">
                    {page.title}
                  </h3>

                  {/* Meta Description */}
                  {page.meta_description && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {page.meta_description}
                    </p>
                  )}

                  {/* Footer */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="w-4 h-4 mr-1" />
                      {new Date(page.updated_at).toLocaleDateString()}
                    </div>
                    
                    <Link
                      to={getPageUrl(page)}
                      className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View Page
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Admin Link */}
        <div className="mt-12 text-center">
          <Link
            to="/admin"
            className="inline-flex items-center px-6 py-3 bg-gray-800 text-white font-medium rounded-lg hover:bg-gray-900 transition-colors"
          >
            <FileText className="w-5 h-5 mr-2" />
            Manage Content
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CMSPagesList;