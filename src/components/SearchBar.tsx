import React, { useState, useEffect, useRef } from 'react';
import { Search, X, FileText, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import cmsAPI from '../services/cmsAPI';

interface SearchResult {
  id: string | number;
  title: string;
  type: 'page' | 'post';
  page_type?: string;
  category?: string;
  slug?: string;
  meta_description?: string;
  excerpt?: string;
  updated_at: string;
}

const SearchBar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const searchContent = async () => {
      if (query.trim().length < 2) {
        setResults([]);
        return;
      }

      setLoading(true);
      try {
        const [pages, posts] = await Promise.all([
          cmsAPI.getPages({ status: 'published' }),
          cmsAPI.getPosts({ status: 'published', published: true })
        ]);

        const searchTerm = query.toLowerCase();
        
        const pageResults: SearchResult[] = pages
          .filter(page => 
            page.title.toLowerCase().includes(searchTerm) ||
            page.meta_description?.toLowerCase().includes(searchTerm) ||
            JSON.stringify(page.content).toLowerCase().includes(searchTerm)
          )
          .map(page => ({
            id: page.id,
            title: page.title,
            type: 'page' as const,
            page_type: page.page_type,
            slug: page.slug,
            meta_description: page.meta_description,
            updated_at: page.updated_at
          }));

        const postResults: SearchResult[] = posts
          .filter(post => 
            post.title.toLowerCase().includes(searchTerm) ||
            post.content.toLowerCase().includes(searchTerm) ||
            post.excerpt?.toLowerCase().includes(searchTerm) ||
            post.category?.toLowerCase().includes(searchTerm)
          )
          .map(post => ({
            id: post.id,
            title: post.title,
            type: 'post' as const,
            category: post.category,
            slug: post.slug,
            excerpt: post.excerpt,
            updated_at: post.updated_at
          }));

        const allResults = [...pageResults, ...postResults]
          .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
          .slice(0, 8); // Limit to 8 results

        setResults(allResults);
      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(searchContent, 300);
    return () => clearTimeout(debounceTimer);
  }, [query]);

  const getResultUrl = (result: SearchResult) => {
    if (result.type === 'page') {
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
      return (typeRoutes[result.page_type || 'general'] || '/page/') + result.slug;
    }
    return `/post/${result.slug}`;
  };

  const getTypeLabel = (result: SearchResult) => {
    if (result.type === 'page') {
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
      return typeLabels[result.page_type || 'general'] || 'Page';
    }
    return result.category || 'Post';
  };

  const handleOpen = () => {
    setIsOpen(true);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleClose = () => {
    setIsOpen(false);
    setQuery('');
    setResults([]);
  };

  const handleResultClick = () => {
    handleClose();
  };

  return (
    <div ref={searchRef} className="relative">
      {/* Search Button */}
      <button
        onClick={handleOpen}
        className="p-2 text-gray-700 hover:text-blue-700 rounded-full transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-200 focus-visible:ring-offset-2"
        aria-label="Search"
      >
        <Search size={20} />
      </button>

      {/* Search Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-center pt-20">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[80vh] overflow-hidden">
            {/* Search Input */}
            <div className="p-4 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search pages, posts, and resources..."
                  className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                />
                <button
                  onClick={handleClose}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Search Results */}
            <div className="max-h-96 overflow-y-auto">
              {loading && (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-gray-600 mt-2">Searching...</p>
                </div>
              )}

              {!loading && query.trim().length >= 2 && results.length === 0 && (
                <div className="p-8 text-center">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No results found for "{query}"</p>
                  <p className="text-sm text-gray-500 mt-1">Try different keywords or browse all resources</p>
                </div>
              )}

              {!loading && query.trim().length < 2 && (
                <div className="p-8 text-center">
                  <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Start typing to search...</p>
                  <p className="text-sm text-gray-500 mt-1">Search through pages, posts, and resources</p>
                </div>
              )}

              {results.length > 0 && (
                <div className="py-2">
                  {results.map((result) => (
                    <Link
                      key={`${result.type}-${result.id}`}
                      to={getResultUrl(result)}
                      onClick={handleResultClick}
                      className="block px-4 py-3 hover:bg-gray-50 transition-colors duration-200"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {getTypeLabel(result)}
                            </span>
                          </div>
                          <h3 className="text-sm font-medium text-gray-900 truncate">
                            {result.title}
                          </h3>
                          {(result.meta_description || result.excerpt) && (
                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                              {result.meta_description || result.excerpt}
                            </p>
                          )}
                          <div className="flex items-center text-xs text-gray-500 mt-2">
                            <Calendar className="w-3 h-3 mr-1" />
                            {new Date(result.updated_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                  
                  {/* View All Results Link */}
                  <div className="border-t border-gray-200 p-4">
                    <Link
                      to={`/pages?search=${encodeURIComponent(query)}`}
                      onClick={handleResultClick}
                      className="block w-full text-center py-2 text-blue-600 hover:text-blue-700 font-medium"
                    >
                      View all results for "{query}"
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchBar;