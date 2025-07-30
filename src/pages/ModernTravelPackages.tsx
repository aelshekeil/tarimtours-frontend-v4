import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  MapPin, Calendar, Star, Heart,
  ShoppingCart, Search, Filter, ChevronRight, Users,
  Shield, Sparkles, TrendingUp, Info, Check, X
} from 'lucide-react';
import { supabase } from '../services/supabaseClient';
import supabaseAPI from '../services/supabaseAPI';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';

interface TravelPackage {
  id: string;
  name: string;
  description: string;
  destination: string;
  price: number;
  duration: string;
  cover_photo_url: string;
  created_by: string;
  created_at: string;
  rating?: number;
  featured?: boolean;
  max_participants?: number;
  included_features?: string[];
  highlights?: string[];
}

interface PackageDetailModalProps {
  package: TravelPackage;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: () => void;
  onBookNow: () => void;
}

const PackageDetailModal: React.FC<PackageDetailModalProps> = ({ 
  package: pkg, 
  isOpen, 
  onClose, 
  onAddToCart,
  onBookNow 
}) => {
  const { t } = useTranslation();
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-900 opacity-75" onClick={onClose}></div>
        </div>

        <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          {/* Header Image */}
          <div className="relative h-96">
            <img
              src={pkg.cover_photo_url}
              alt={pkg.name}
              className="w-full h-full object-cover"
            />
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors"
            >
              <X className="w-6 h-6 text-gray-700" />
            </button>
            {pkg.featured && (
              <div className="absolute top-4 left-4 px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-full font-semibold flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                {t('common.featured')}
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-8">
            <div className="mb-6">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">{pkg.name}</h2>
              <div className="flex items-center gap-4 text-gray-600">
                <div className="flex items-center gap-1">
                  <MapPin className="w-5 h-5" />
                  <span>{pkg.destination}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-5 h-5" />
                  <span>{pkg.duration}</span>
                </div>
                {pkg.max_participants && (
                  <div className="flex items-center gap-1">
                    <Users className="w-5 h-5" />
                    <span>{t('common.max')} {pkg.max_participants} {t('common.people')}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">{t('common.description')}</h3>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">{pkg.description}</p>
            </div>

            {/* Highlights */}
            {pkg.highlights && pkg.highlights.length > 0 && (
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{t('common.highlights')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {pkg.highlights.map((highlight, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{highlight}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Included Features */}
            {pkg.included_features && pkg.included_features.length > 0 && (
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{t('common.whats_included')}</h3>
                <div className="bg-gray-50 rounded-xl p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {pkg.included_features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Price and Actions */}
            <div className="border-t pt-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{t('common.price_per_person')}</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-gray-900">${pkg.price}</span>
                    <span className="text-gray-600">USD</span>
                  </div>
                </div>
                {pkg.rating && (
                  <div className="text-right">
                    <div className="flex items-center gap-1 mb-1">
                      <Star className="w-5 h-5 text-yellow-500 fill-current" />
                      <span className="text-xl font-semibold">{pkg.rating.toFixed(1)}</span>
                    </div>
                    <p className="text-sm text-gray-600">{t('common.customer_rating')}</p>
                  </div>
                )}
              </div>

              <div className="flex gap-4">
                <button
                  onClick={onAddToCart}
                  className="flex-1 bg-gray-100 text-gray-900 py-3 px-6 rounded-xl font-semibold hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                >
                  <ShoppingCart className="w-5 h-5" />
                  {t('common.add_to_cart')}
                </button>
                <button
                  onClick={onBookNow}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all transform hover:scale-105 flex items-center justify-center gap-2"
                >
                  {t('common.book_now')}
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              {/* Trust Badges */}
              <div className="mt-6 flex items-center justify-center gap-6 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Shield className="w-4 h-4" />
                  <span>{t('common.secure_booking')}</span>
                </div>
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-4 h-4" />
                  <span>{t('common.best_price_guarantee')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ModernTravelPackages: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user } = useAuth();
  
  const [packages, setPackages] = useState<TravelPackage[]>([]);
  const [filteredPackages, setFilteredPackages] = useState<TravelPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [priceRange, setPriceRange] = useState("all");
  const [sortBy, setSortBy] = useState("featured");
  const [favorites, setFavorites] = useState(new Set<string>());
  const [selectedPackage, setSelectedPackage] = useState<TravelPackage | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('travel_packages')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setPackages(data || []);
      setFilteredPackages(data || []);
    } catch (err) {
      setError(err as Error);
      console.error('Error fetching travel packages:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let filtered = [...packages];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(pkg => 
        pkg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pkg.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pkg.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Price filter
    if (priceRange !== "all") {
      filtered = filtered.filter(pkg => {
        switch (priceRange) {
          case "budget":
            return pkg.price < 200;
          case "mid":
            return pkg.price >= 200 && pkg.price < 500;
          case "premium":
            return pkg.price >= 500 && pkg.price < 1000;
          case "luxury":
            return pkg.price >= 1000;
          default:
            return true;
        }
      });
    }

    // Sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return a.price - b.price;
        case "price-high":
          return b.price - a.price;
        case "newest":
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case "featured":
          return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
        default:
          return 0;
      }
    });

    setFilteredPackages(filtered);
  }, [packages, searchTerm, priceRange, sortBy]);

  const toggleFavorite = (packageId: string) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(packageId)) {
      newFavorites.delete(packageId);
    } else {
      newFavorites.add(packageId);
    }
    setFavorites(newFavorites);
  };

  const handleAddToCart = (pkg: TravelPackage) => {
    addToCart({
      id: pkg.id,
      name: pkg.name,
      price: pkg.price,
      product_type: 'travel-package',
      image: pkg.cover_photo_url,
      description: pkg.description
    });
    
    // Show success notification (you can implement a toast notification here)
    alert(t('common.added_to_cart'));
  };

  const handleBookNow = async (pkg: TravelPackage) => {
    if (!user) {
      // Show login modal or redirect to login
      alert(t('common.login_required_text'));
      return;
    }

    try {
      // Create a booking directly
      const booking = await supabaseAPI.createTravelPackageBooking({
        packageId: pkg.id,
        packageName: pkg.name,
        packagePrice: pkg.price,
        quantity: 1,
        customerName: user.user_metadata?.first_name + ' ' + user.user_metadata?.last_name || user.email || '',
        customerEmail: user.email || '',
        numberOfTravelers: 1
      });

      // Show success message
      alert(`Booking created successfully! Your booking reference is: ${booking.booking_reference}`);
      
      // Navigate to profile to see the booking
      navigate('/profile');
    } catch (error) {
      console.error('Error creating booking:', error);
      alert('Failed to create booking. Please try again.');
    }
  };

  const openPackageDetail = (pkg: TravelPackage) => {
    setSelectedPackage(pkg);
    setShowDetailModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="animate-pulse">
            <div className="h-12 bg-gray-300 rounded-lg w-1/3 mx-auto mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl overflow-hidden">
                  <div className="h-64 bg-gray-300"></div>
                  <div className="p-6">
                    <div className="h-6 bg-gray-300 rounded mb-4"></div>
                    <div className="h-4 bg-gray-300 rounded mb-2"></div>
                    <div className="h-4 bg-gray-300 rounded w-2/3"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <X className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('common.error_loading_packages')}</h3>
            <p className="text-gray-600 mb-4">{error.message}</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {t('common.try_again')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 py-24">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-6">
              {t('common.discover_amazing_destinations')}
            </h1>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              {t('common.explore_southeast_asia_description')}
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6" />
                <input
                  type="text"
                  placeholder={t('common.search_destinations_activities_placeholder')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-14 pr-4 py-4 rounded-2xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-white/30"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Results */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Filter Bar */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 w-full lg:w-auto">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <Filter className="w-5 h-5" />
                {t('common.filters')}
              </button>
              
              <select
                value={priceRange}
                onChange={(e) => setPriceRange(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">{t('common.all_prices')}</option>
                <option value="budget">{t('common.budget')} (&lt; $200)</option>
                <option value="mid">{t('common.mid_range')} ($200-$500)</option>
                <option value="premium">{t('common.premium')} ($500-$1000)</option>
                <option value="luxury">{t('common.luxury')} ($1000+)</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="featured">{t('common.featured_first')}</option>
                <option value="price-low">{t('common.price_low_to_high')}</option>
                <option value="price-high">{t('common.price_high_to_low')}</option>
                <option value="newest">{t('common.newest_first')}</option>
              </select>
            </div>

            <div className="text-gray-600">
              {filteredPackages.length} {t('common.packages_found')}
            </div>
          </div>
        </div>

        {/* Package Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPackages.map((pkg) => {
            const isFavorite = favorites.has(pkg.id);
            
            return (
              <div
                key={pkg.id}
                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 group cursor-pointer"
                onClick={() => openPackageDetail(pkg)}
              >
                {/* Image */}
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={pkg.cover_photo_url}
                    alt={pkg.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  {/* Badges */}
                  <div className="absolute top-4 left-4 flex gap-2">
                    {pkg.featured && (
                      <div className="px-3 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-full text-sm font-semibold flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        {t('common.featured')}
                      </div>
                    )}
                  </div>

                  {/* Favorite Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(pkg.id);
                    }}
                    className={`absolute top-4 right-4 p-2 rounded-full backdrop-blur-sm transition-all ${
                      isFavorite 
                        ? 'bg-red-500 text-white' 
                        : 'bg-white/80 text-gray-700 hover:bg-white'
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
                  </button>

                  {/* Quick View Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openPackageDetail(pkg);
                    }}
                    className="absolute bottom-4 right-4 px-4 py-2 bg-white/90 backdrop-blur-sm rounded-full text-sm font-semibold text-gray-900 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center gap-2"
                  >
                    <Info className="w-4 h-4" />
                    {t('common.quick_view')}
                  </button>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                    {pkg.name}
                  </h3>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span>{pkg.destination}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{pkg.duration}</span>
                    </div>
                  </div>

                  <p className="text-gray-700 mb-4 line-clamp-2">
                    {pkg.description}
                  </p>

                  {/* Rating */}
                  {pkg.rating && (
                    <div className="flex items-center gap-2 mb-4">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < Math.floor(pkg.rating!) 
                                ? 'text-yellow-500 fill-current' 
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-600">
                        {pkg.rating.toFixed(1)}
                      </span>
                    </div>
                  )}

                  {/* Price and Actions */}
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div>
                      <p className="text-sm text-gray-600">{t('common.from')}</p>
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-bold text-gray-900">${pkg.price}</span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddToCart(pkg);
                        }}
                        className="p-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        <ShoppingCart className="w-5 h-5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleBookNow(pkg);
                        }}
                        className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all"
                      >
                        {t('common.book_now')}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredPackages.length === 0 && (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {t('common.no_packages_found_title')}
            </h3>
            <p className="text-gray-600 max-w-md mx-auto">
              {t('common.no_packages_found_text')}
            </p>
          </div>
        )}
      </div>

      {/* Package Detail Modal */}
      {selectedPackage && (
        <PackageDetailModal
          package={selectedPackage}
          isOpen={showDetailModal}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedPackage(null);
          }}
          onAddToCart={() => {
            handleAddToCart(selectedPackage);
            setShowDetailModal(false);
          }}
          onBookNow={() => {
            handleBookNow(selectedPackage);
            setShowDetailModal(false);
          }}
        />
      )}
    </div>
  );
};

export default ModernTravelPackages;