import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import cmsAPI, { Page } from '../services/cmsAPI';
import LoadingSpinner from './common/LoadingSpinner';

interface DynamicPageProps {
  pageType?: string;
  slug?: string;
}

const DynamicPage: React.FC<DynamicPageProps> = ({ slug }) => {
  const params = useParams();
  const [page, setPage] = useState<Page | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const pageSlug = slug || params.slug;

  useEffect(() => {
    if (pageSlug) {
      loadPage();
    }
  }, [pageSlug]);

  const loadPage = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const pageData = await cmsAPI.getPageBySlug(pageSlug!);
      if (pageData && pageData.status === 'published') {
        setPage(pageData);
      } else {
        setError('Page not found or not published');
      }
    } catch (error) {
      console.error('Error loading page:', error);
      setError('Failed to load page');
    } finally {
      setLoading(false);
    }
  };

  const renderContentBlock = (blockType: string, content: any, index: number) => {
    switch (blockType) {
      case 'hero':
        return (
          <section key={index} className="relative bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
            {content.backgroundImage && (
              <div 
                className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30"
                style={{ backgroundImage: `url(${content.backgroundImage})` }}
              />
            )}
            <div className="relative container mx-auto px-4 text-center">
              <h1 className="text-4xl md:text-6xl font-bold mb-4">{content.title}</h1>
              {content.subtitle && (
                <p className="text-xl md:text-2xl mb-8 opacity-90">{content.subtitle}</p>
              )}
              {content.ctaText && content.ctaLink && (
                <a
                  href={content.ctaLink}
                  className="inline-block bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                >
                  {content.ctaText}
                </a>
              )}
            </div>
          </section>
        );

      case 'text':
        return (
          <section key={index} className="py-12">
            <div className="container mx-auto px-4">
              <div className={`prose max-w-none ${content.alignment === 'center' ? 'text-center' : content.alignment === 'right' ? 'text-right' : 'text-left'}`}>
                <div dangerouslySetInnerHTML={{ __html: content.content }} />
              </div>
            </div>
          </section>
        );

      case 'image':
        return (
          <section key={index} className="py-8">
            <div className="container mx-auto px-4">
              <div className="text-center">
                <img
                  src={content.src}
                  alt={content.alt}
                  className="mx-auto max-w-full h-auto rounded-lg shadow-lg"
                />
                {content.caption && (
                  <p className="mt-4 text-gray-600 italic">{content.caption}</p>
                )}
              </div>
            </div>
          </section>
        );

      case 'gallery':
        return (
          <section key={index} className="py-12">
            <div className="container mx-auto px-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {content.images?.map((image: any, imgIndex: number) => (
                  <div key={imgIndex} className="text-center">
                    <img
                      src={image.src}
                      alt={image.alt}
                      className="w-full h-64 object-cover rounded-lg shadow-lg"
                    />
                    {image.caption && (
                      <p className="mt-2 text-gray-600 text-sm">{image.caption}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>
        );

      case 'faq':
        return (
          <section key={index} className="py-12 bg-gray-50">
            <div className="container mx-auto px-4">
              <h2 className="text-3xl font-bold text-center mb-8">Frequently Asked Questions</h2>
              <div className="max-w-3xl mx-auto space-y-4">
                {content.items?.map((faq: any, faqIndex: number) => (
                  <div key={faqIndex} className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-semibold mb-2">{faq.question}</h3>
                    <p className="text-gray-600">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        );

      case 'features':
        return (
          <section key={index} className="py-12">
            <div className="container mx-auto px-4">
              <h2 className="text-3xl font-bold text-center mb-8">{content.title}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {content.items?.map((feature: any, featureIndex: number) => (
                  <div key={featureIndex} className="text-center">
                    {feature.icon && (
                      <div className="mb-4">
                        <img src={feature.icon} alt="" className="w-16 h-16 mx-auto" />
                      </div>
                    )}
                    <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                    <p className="text-gray-600">{feature.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        );

      case 'cta':
        return (
          <section 
            key={index} 
            className="py-16 text-white text-center"
            style={{ backgroundColor: content.backgroundColor || '#3B82F6' }}
          >
            <div className="container mx-auto px-4">
              <h2 className="text-3xl font-bold mb-4">{content.title}</h2>
              {content.description && (
                <p className="text-xl mb-8 opacity-90">{content.description}</p>
              )}
              {content.buttonText && content.buttonLink && (
                <a
                  href={content.buttonLink}
                  className="inline-block bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                >
                  {content.buttonText}
                </a>
              )}
            </div>
          </section>
        );

      default:
        return (
          <section key={index} className="py-8">
            <div className="container mx-auto px-4">
              <div className="bg-gray-100 p-4 rounded-lg">
                <p className="text-gray-600">Unsupported content block type: {blockType}</p>
                <pre className="mt-2 text-xs text-gray-500 overflow-x-auto">
                  {JSON.stringify(content, null, 2)}
                </pre>
              </div>
            </div>
          </section>
        );
    }
  };

  const renderPageContent = () => {
    if (!page?.content) return null;

    // Handle different content structures
    if (page.content.sections && Array.isArray(page.content.sections)) {
      return page.content.sections.map((section: any, index: number) => 
        renderContentBlock(section.type, section, index)
      );
    }

    // Handle single content block
    if (page.content.type) {
      return renderContentBlock(page.content.type, page.content, 0);
    }

    // Handle raw content
    return (
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="prose max-w-none">
            <pre className="whitespace-pre-wrap">{JSON.stringify(page.content, null, 2)}</pre>
          </div>
        </div>
      </section>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Page Not Found</h1>
          <p className="text-gray-600 mb-8">{error}</p>
          <a
            href="/"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Home
          </a>
        </div>
      </div>
    );
  }

  if (!page) {
    return null;
  }

  return (
    <div className="min-h-screen">
      {/* SEO Meta Tags */}
      <head>
        <title>{page.meta_title || page.title}</title>
        {page.meta_description && (
          <meta name="description" content={page.meta_description} />
        )}
        {page.featured_image && (
          <meta property="og:image" content={page.featured_image} />
        )}
      </head>

      {/* Page Content */}
      {renderPageContent()}
    </div>
  );
};

export default DynamicPage;