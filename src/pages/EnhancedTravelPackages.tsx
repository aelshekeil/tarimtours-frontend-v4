import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import supabaseAPI from '../services/supabaseAPI';

interface TravelPackage {
  id: number;
  attributes: {
    title: string;
    description: string;
    price: number;
    featured: boolean;
    cover_image: {
      data: {
        attributes: {
          url: string;
          formats?: {
            thumbnail?: { url: string };
            small?: { url: string };
            medium?: { url: string };
          };
        };
      };
    };
    createdAt: string;
    updatedAt: string;
    destination: string;
    duration: string;
    rating: number | null;
  };
}

const EnhancedTravelPackages = () => {
  const { t } = useTranslation();
  const [packages, setPackages] = useState<TravelPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [filteredPackages, setFilteredPackages] = useState<TravelPackage[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [priceRange, setPriceRange] = useState("All");
  const [favorites, setFavorites] = useState(new Set<number>());
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(false);

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const data = await supabaseAPI.getTravelPackages(false, true);
        setPackages(data);
        setFilteredPackages(data);
      } catch (err: any) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPackages();
  }, []);

  useEffect(() => {
    let filtered = packages;

    if (searchTerm) {
      filtered = filtered.filter(pkg =>
        pkg.attributes.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pkg.attributes.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pkg.attributes.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (showFeaturedOnly) {
      filtered = filtered.filter(pkg => pkg.attributes.featured);
    }

    if (priceRange !== "All") {
      filtered = filtered.filter(pkg => {
        switch (priceRange) {
          case "Under $200":
            return pkg.attributes.price < 200;
          case "$200-$500":
            return pkg.attributes.price >= 200 && pkg.attributes.price < 500;
          case "$500-$1000":
            return pkg.attributes.price >= 500 && pkg.attributes.price < 1000;
          case "Over $1000":
            return pkg.attributes.price >= 1000;
          default:
            return true;
        }
      });
    }

    setFilteredPackages(filtered);
  }, [packages, searchTerm, showFeaturedOnly, priceRange]);

  const toggleFavorite = (packageId: number) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(packageId)) {
      newFavorites.delete(packageId);
    } else {
      newFavorites.add(packageId);
    }
    setFavorites(newFavorites);
  };

  const formatDuration = (duration: string | null | undefined) => {
    if (!duration) {
      return 'N/A';
    }
    if (duration.includes('days') || duration.includes('day')) {
      return duration;
    }
    if (!isNaN(parseInt(duration))) {
      return `${duration} days`;
    }
    return duration;
  };

  const getImageUrl = (coverImage: TravelPackage['attributes']['cover_image']) => {
    if (!coverImage) return '';
    const attributes = coverImage.data.attributes;
    // The URL from Supabase is already a full URL, so no need to prepend API_URL
    return attributes.url;
  };

  const formatDescription = (description: string) => {
    return description
      .replace(/\n+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-300 rounded-md w-64 mx-auto mb-4"></div>
              <div className="h-4 bg-gray-300 rounded-md w-96 mx-auto"></div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl shadow-lg overflow-hidden animate-pulse">
                <div className="h-48 bg-gray-300"></div>
                <div className="p-6">
                  <div className="h-4 bg-gray-300 rounded mb-2"></div>
                  <div className="h-3 bg-gray-300 rounded mb-4"></div>
                  <div className="h-16 bg-gray-300 rounded mb-4"></div>
                  <div className="flex justify-between">
                    <div className="h-4 bg-gray-300 rounded w-20"></div>
                    <div className="h-4 bg-gray-300 rounded w-16"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    console.error("Error loading travel packages:", error);
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md mx-4">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{t("common.error_loading_packages")}</h3>
            <p className="text-gray-600 mb-4">{error.message}</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {t("common.try_again")}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              {t("common.discover_amazing_destinations_part1")} <span className="text-blue-600">{t("common.discover_amazing_destinations_part2")}</span> {t("common.discover_amazing_destinations_part3")}
            </h1>
            <p className="text-xl text-gray-600">
              {t("common.explore_southeast_asia")}
            </p>
          </div>
          
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <input
                  type="text"
                  placeholder={t("common.search_destinations_activities")}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="flex gap-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={showFeaturedOnly}
                  onChange={(e) => setShowFeaturedOnly(e.target.checked)}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm font-medium text-gray-700">{t("common.featured_only")}</span>
              </label>
              
              <select
                value={priceRange}
                onChange={(e) => setPriceRange(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="All">{t("common.all_prices")}</option>
                <option value="Under $200">{t("common.under_200")}</option>
                <option value="$200-$500">{t("common.200_500")}</option>
                <option value="$500-$1000">{t("common.500_1000")}</option>
                <option value="Over $1000">{t("common.over_1000")}</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-600">
            {filteredPackages.length} {filteredPackages.length === 1 ? t('common.package') : t('common.packages')} {t('common.found')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPackages.map((pkg) => {
            const imageUrl = getImageUrl(pkg.attributes.cover_image);
            const isFavorite = favorites.has(pkg.id);
            
            return (
              <div
                key={pkg.id}
                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 group"
              >
                <div className="relative">
                  {imageUrl && (
                    <img
                      src={imageUrl}
                      alt={pkg.attributes.title}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  )}
                  {!imageUrl && (
                    <div className="w-full h-48 bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                    </div>
                  )}
                  <div className="absolute top-4 right-4 flex gap-2">
                    <button
                      onClick={() => toggleFavorite(pkg.id)}
                      className={`p-2 rounded-full backdrop-blur-sm transition-colors ${
                        isFavorite 
                          ? 'bg-red-500 text-white' 
                          : 'bg-white/80 text-gray-600 hover:bg-white hover:text-red-500'
                      }`}
                    >
                    </button>
                    {pkg.attributes.featured && (
                      <div className="px-3 py-1 bg-yellow-500 text-white rounded-full text-sm font-medium">
                        {t("common.featured")}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {pkg.attributes.title}
                    </h3>
                  </div>
                  
                  <div className="flex items-center text-gray-600 mb-3">
                    <div className="text-sm">{pkg.attributes.destination}</div>
                  </div>
                  
                  <p className="text-gray-700 mb-4 line-clamp-3 leading-relaxed">
                    {formatDescription(pkg.attributes.description)}
                  </p>
                  
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center text-gray-600">
                      <div className="text-sm font-medium">{formatDuration(pkg.attributes.duration)}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <div className="text-2xl font-bold text-gray-900">{pkg.attributes.price}</div>
                    </div>
                    <div className="flex items-center">
                      <div className="text-sm font-medium text-gray-700">
                        {pkg.attributes.rating ? pkg.attributes.rating.toFixed(1) : t("common.no_rating")}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center group">
                      {t("common.book_now")}
                    </button>
                    <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        {filteredPackages.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{t("common.no_packages_found_title")}</h3>
            <p className="text-gray-600">{t("common.no_packages_found_text")}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedTravelPackages;
