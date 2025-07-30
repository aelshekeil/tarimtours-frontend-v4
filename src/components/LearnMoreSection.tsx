import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Calendar, FileText } from 'lucide-react';
import cmsAPI, { Page } from '../services/cmsAPI';

interface LearnMoreSectionProps {
  pageType?: string;
  title?: string;
  description?: string;
  maxItems?: number;
}

const LearnMoreSection: React.FC<LearnMoreSectionProps> = ({ 
  pageType, 
  title = "Learn More", 
  description = "Explore our comprehensive guides and resources",
  maxItems = 3 
}) => {
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRelatedPages();
  }, [pageType]);

  const loadRelatedPages = async () => {
    setLoading(true);
    try {
      const filters: any = { status: 'published' };
      if (pageType) {
        filters.page_type = pageType;
      }
      
      const pagesData = await cmsAPI.getPages(filters);
      setPages(pagesData.slice(0, maxItems));
    } catch (error) {
      console.error('Error loading related pages:', error);
    } finally {
      setLoading(false);
    }
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

  const getPageTypeLabel = (type: string) => {
    const typeLabels: Record<string, string> = {
      'study_malaysia': 'Study in Malaysia',
      'travel_packages': 'Travel Packages',
      'faqs': 'FAQ',
      'travel_accessories': 'Travel Accessories',
      'esim': 'eSIM',
      'visa_services': 'Visa Services',
      'education': 'Education',
      'general': 'General'
    };
    return typeLabels[type] || type;
  };

  if (loading) {
    return (
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-2">Loading resources...</p>
          </div>
        </div>
      </section>
    );
  }

  if (pages.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">{title}</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">{description}</p>
        </div>

        {/* Pages Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {pages.map((page) => (
            <div key={page.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 group">
              {/* Featured Image */}
              {page.featured_image && (
                <div className="h-48 bg-gray-200 overflow-hidden">
                  <img
                    src={page.featured_image}
                    alt={page.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              )}
              
              {/* Content */}
              <div className="p-6">
                {/* Page Type Badge */}
                <div className="mb-3">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    <FileText className="w-3 h-3 mr-1" />
                    {getPageTypeLabel(page.page_type)}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors duration-300">
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
                    className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium text-sm group-hover:translate-x-1 transition-all duration-300"
                  >
                    Read More
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center">
          <Link
            to={pageType ? `/pages?type=${pageType}` : '/pages'}
            className="inline-flex items-center px-8 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            <FileText className="w-5 h-5 mr-2" />
            View All Resources
            <ArrowRight className="w-5 h-5 ml-2" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default LearnMoreSection;