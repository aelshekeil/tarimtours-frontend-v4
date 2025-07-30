import { FC, useEffect, useState } from 'react';
import { 
  Clock, 
  Shield, 
  Star, 
  ArrowRight,
  Zap,
  Award,
  FileText,
  MessageCircle
} from 'lucide-react';
import supabaseAPI from '../services/supabaseAPI';

export interface VisaService {
  id: string;
  country: string;
  visa_type: string;
  duration: string;
  price: number;
  requirements: string;
  cover_photo_url?: string;
  popular?: boolean;
  recommended?: boolean;
}

interface VisaServicesProps {
  onServiceSelect: (service: VisaService) => void;
}

const VisaServices: FC<VisaServicesProps> = ({ onServiceSelect }) => {
  const [services, setServices] = useState<VisaService[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchServices = async () => {
      setLoading(true);
      try {
        const data = await supabaseAPI.getVisaOffers();
        setServices(data || []);
      } catch (err: any) {
        setError(err.message);
      }
      setLoading(false);
    };

    fetchServices();
  }, []);

  const handleServiceSelect = (service: VisaService) => {
    onServiceSelect(service);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <section className="relative py-28 md:py-36 bg-gradient-to-br from-blue-800 via-purple-700 to-indigo-900 text-white overflow-hidden">
        {/* Animated/blurred background shapes */}
        <div className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-gradient-to-br from-blue-400/40 via-purple-400/30 to-indigo-400/20 rounded-full blur-3xl animate-pulse-slow z-0"></div>
        <div className="absolute -bottom-40 right-0 w-[400px] h-[400px] bg-gradient-to-tr from-purple-300/30 via-blue-300/20 to-indigo-300/10 rounded-full blur-2xl animate-pulse-slow z-0"></div>
        <div className="absolute inset-0 bg-black/20 z-0"></div>
        <div className="container-custom text-center relative z-10">
          <div className="max-w-3xl mx-auto bg-white/10 backdrop-blur-md rounded-3xl shadow-2xl px-8 py-12 border border-white/20 flex flex-col items-center">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-400/40 via-purple-400/40 to-indigo-400/40 rounded-full flex items-center justify-center mb-8 shadow-lg border-4 border-white/20">
              <FileText className="w-12 h-12 text-white drop-shadow-lg" />
            </div>
            <h1 className="text-5xl md:text-6xl font-extrabold mb-6 leading-tight bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent drop-shadow-lg">
              Visa Application Services
            </h1>
            <p className="text-2xl md:text-3xl text-blue-100/90 mb-8 leading-relaxed font-medium drop-shadow">
              Hassle-free visa processing for your international travel needs.
            </p>
            <a href="#plans" className="inline-block mt-4 px-8 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold text-lg shadow-lg transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-white/50">
              Explore Plans
            </a>
            <div className="mt-8 flex flex-col items-center">
              <span className="animate-bounce text-blue-200/80">
                <svg width="32" height="32" fill="none" viewBox="0 0 24 24"><path d="M12 5v14m0 0l-7-7m7 7l7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </span>
              <span className="text-xs text-blue-100/70 mt-1">Scroll down</span>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works Timeline */}
      <section className="py-12">
        <div className="container-custom max-w-4xl mx-auto">
          <h2 className="text-3xl font-extrabold text-center mb-10 bg-gradient-to-r from-blue-700 via-purple-700 to-indigo-700 bg-clip-text text-transparent drop-shadow-lg">
            How It Works
          </h2>
          <ol className="relative border-l-4 border-blue-200/40 ml-4">
            <li className="mb-10 ml-8">
              <span className="absolute flex items-center justify-center w-10 h-10 bg-blue-600 rounded-full -left-5 ring-4 ring-white/60">
                <FileText className="w-6 h-6 text-white" />
              </span>
              <h3 className="font-bold text-lg text-blue-800 mb-1">Choose Your Visa Plan</h3>
              <p className="text-gray-700">Browse our modern plans and select the one that fits your travel needs.</p>
            </li>
            <li className="mb-10 ml-8">
              <span className="absolute flex items-center justify-center w-10 h-10 bg-purple-600 rounded-full -left-5 ring-4 ring-white/60">
                <Star className="w-6 h-6 text-white" />
              </span>
              <h3 className="font-bold text-lg text-purple-800 mb-1">Submit Your Application</h3>
              <p className="text-gray-700">Fill out a simple online form and upload your documents securely.</p>
            </li>
            <li className="mb-10 ml-8">
              <span className="absolute flex items-center justify-center w-10 h-10 bg-green-600 rounded-full -left-5 ring-4 ring-white/60">
                <Shield className="w-6 h-6 text-white" />
              </span>
              <h3 className="font-bold text-lg text-green-800 mb-1">Expert Review & Processing</h3>
              <p className="text-gray-700">Our team reviews your application and processes your visa quickly and securely.</p>
            </li>
            <li className="ml-8">
              <span className="absolute flex items-center justify-center w-10 h-10 bg-yellow-500 rounded-full -left-5 ring-4 ring-white/60">
                <Award className="w-6 h-6 text-white" />
              </span>
              <h3 className="font-bold text-lg text-yellow-800 mb-1">Receive Your Visa</h3>
              <p className="text-gray-700">Get your approved visa delivered to your email or address. Ready to travel!</p>
            </li>
          </ol>
        </div>
      </section>

      {/* Service Plans Section */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="container-custom">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold mb-4">
              VISA SERVICES
            </span>
            <h2 className="text-5xl font-extrabold text-gray-900 mb-6 bg-gradient-to-r from-gray-900 via-blue-900 to-gray-900 bg-clip-text text-transparent">
              Choose Your Visa Plan
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Select from our carefully curated visa services. Fast processing, expert support, and transparent pricing for all destinations.
            </p>
          </div>

          <div id="plans" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {services.map((service, index) => (
              <div
                key={service.id}
                className={`relative group cursor-pointer transition-all duration-500 hover:z-10 ${
                  service.recommended ? 'md:scale-[1.02]' : ''
                }`}
                style={{
                  animationDelay: `${index * 100}ms`,
                  animation: 'fadeInUp 0.6s ease-out forwards',
                  opacity: 0
                }}
              >
                {/* Card Container */}
                <div
                  className={`relative h-full bg-white rounded-2xl overflow-hidden transition-all duration-500
                    ${service.recommended
                      ? 'shadow-2xl ring-2 ring-blue-500/20'
                      : 'shadow-lg hover:shadow-2xl'
                    }
                    group-hover:-translate-y-1
                  `}
                >
                  {/* Badge */}
                  {(service.popular || service.recommended) && (
                    <div className="absolute top-0 right-0 z-20">
                      <div className={`
                        px-4 py-2 text-xs font-bold uppercase tracking-wider
                        ${service.recommended
                          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white'
                          : 'bg-gradient-to-r from-amber-500 to-orange-500 text-white'
                        }
                      `}>
                        {service.recommended ? 'Best Value' : 'Popular'}
                      </div>
                    </div>
                  )}

                  {/* Country Image Header */}
                  <div className="relative h-48 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                    {service.cover_photo_url ? (
                      <>
                        <img
                          src={service.cover_photo_url}
                          alt={`${service.country} visa`}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                      </>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center">
                          <FileText className="w-12 h-12 text-gray-400" />
                        </div>
                      </div>
                    )}
                    
                    {/* Country Name Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <h3 className="text-3xl font-bold text-white drop-shadow-lg">
                        {service.country}
                      </h3>
                      <p className="text-white/90 text-sm mt-1">{service.visa_type}</p>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6 space-y-4">
                    {/* Price Section */}
                    <div className="text-center pb-4 border-b border-gray-100">
                      <div className="flex items-baseline justify-center gap-1">
                        <span className="text-4xl font-extrabold text-gray-900">${service.price}</span>
                        <span className="text-gray-500 text-sm ml-1">USD</span>
                      </div>
                    </div>

                    {/* Features */}
                    <div className="space-y-3">
                      {/* Duration */}
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Clock className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-gray-500 uppercase tracking-wider">Validity</p>
                          <p className="font-semibold text-gray-900">{service.duration}</p>
                        </div>
                      </div>

                      {/* Requirements */}
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Shield className="w-5 h-5 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-gray-500 uppercase tracking-wider">Requirements</p>
                          <p className="font-semibold text-gray-900 text-sm">{service.requirements}</p>
                        </div>
                      </div>

                      {/* Processing Time - Added for better info */}
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Zap className="w-5 h-5 text-purple-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-gray-500 uppercase tracking-wider">Processing</p>
                          <p className="font-semibold text-gray-900">Fast Track Available</p>
                        </div>
                      </div>
                    </div>

                    {/* CTA Button */}
                    <button
                      onClick={() => handleServiceSelect(service)}
                      className={`
                        w-full py-3 px-6 rounded-xl font-semibold text-white
                        transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]
                        flex items-center justify-center gap-2 group/btn
                        ${service.recommended
                          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/25'
                          : service.popular
                          ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-lg shadow-orange-500/25'
                          : 'bg-gradient-to-r from-gray-700 to-gray-900 hover:from-gray-800 hover:to-black shadow-lg shadow-gray-500/25'
                        }
                      `}
                    >
                      <span>Apply Now</span>
                      <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                    </button>

                    {/* Quick Info */}
                    <div className="pt-3 flex items-center justify-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Star className="w-3 h-3" />
                        Expert Support
                      </span>
                      <span className="flex items-center gap-1">
                        <Shield className="w-3 h-3" />
                        Secure Process
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Call to Action */}
          <div className="mt-16 text-center">
            <p className="text-gray-600 mb-4">
              Need help choosing? Our visa experts are here to guide you.
            </p>
            <button className="inline-flex items-center gap-2 px-6 py-3 bg-white border-2 border-gray-300 rounded-xl font-semibold text-gray-700 hover:border-blue-500 hover:text-blue-600 transition-all duration-300">
              <MessageCircle className="w-5 h-5" />
              Talk to an Expert
            </button>
          </div>

          {/* Additional Info */}
          <div className="mt-20 flex justify-center">
            <div className="bg-white/30 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-10 max-w-5xl w-full mx-auto flex flex-col items-center">
              <h3 className="text-3xl font-extrabold text-gray-900 mb-10 drop-shadow-lg bg-gradient-to-r from-blue-700 via-purple-700 to-indigo-700 bg-clip-text text-transparent">
                Our Commitment to You
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
                <div className="text-center group transition-all duration-300 hover:scale-105">
                  <div className="w-16 h-16 bg-blue-100/70 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg group-hover:bg-blue-200/90 transition-all">
                    <Shield className="w-8 h-8 text-blue-600 group-hover:animate-bounce" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2 text-lg">Secure Process</h4>
                  <p className="text-gray-700 text-sm">Your data is encrypted and handled with care.</p>
                </div>
                <div className="text-center group transition-all duration-300 hover:scale-105">
                  <div className="w-16 h-16 bg-green-100/70 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg group-hover:bg-green-200/90 transition-all">
                    <Zap className="w-8 h-8 text-green-600 group-hover:animate-spin-slow" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2 text-lg">Expert Review</h4>
                  <p className="text-gray-700 text-sm">Our specialists review every application.</p>
                </div>
                <div className="text-center group transition-all duration-300 hover:scale-105">
                  <div className="w-16 h-16 bg-purple-100/70 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg group-hover:bg-purple-200/90 transition-all">
                    <MessageCircle className="w-8 h-8 text-purple-600 group-hover:animate-pulse" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2 text-lg">Consultant Support</h4>
                  <p className="text-gray-700 text-sm mb-3">Contact our visa consultants for personalized guidance.</p>
                  <button className="mt-2 px-5 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold shadow-md hover:from-purple-700 hover:to-blue-700 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-300">
                    Contact Consultant →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default VisaServices;
