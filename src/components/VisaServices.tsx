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
      <section className="py-20">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Our Visa Plans</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Choose the right service level for your travel timeline and requirements.
            </p>
          </div>

          <div id="plans" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
            {services.map((service) => (
              <div
                key={service.id}
                className={`relative group cursor-pointer transition-all duration-500 hover:scale-[1.04] hover:z-20 ${
                  service.recommended ? 'lg:scale-105' : ''
                }`}
                style={{ perspective: 1200 }}
              >
                {/* Popular/Recommended badges */}
                {service.popular && (
                  <div className="absolute -top-4 -right-4 z-30">
                    <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-xl ring-2 ring-yellow-200/60">
                      Most Popular
                    </div>
                  </div>
                )}
                {service.recommended && (
                  <div className="absolute -top-4 -left-4 z-30">
                    <div className="bg-gradient-to-r from-green-400 to-emerald-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-xl ring-2 ring-green-200/60">
                      Recommended
                    </div>
                  </div>
                )}

                <div
                  className={`relative overflow-hidden rounded-3xl border border-white/20 shadow-2xl bg-white/30 backdrop-blur-xl transition-all duration-500 group-hover:shadow-3xl group-hover:-translate-y-2 group-hover:ring-4 group-hover:ring-blue-200/40 h-full`}
                >
                  {/* Animated glass shine */}
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute -left-1/2 top-0 w-2/3 h-full bg-gradient-to-r from-white/30 via-white/10 to-transparent blur-2xl opacity-60 group-hover:animate-glass-shine"></div>
                  </div>
                  {/* Header */}
                  <div
                    className={`p-7 text-center border-b border-white/20 ${
                      service.recommended
                        ? 'bg-gradient-to-br from-green-500/80 to-emerald-500/60 text-white'
                        : service.popular
                        ? 'bg-gradient-to-br from-yellow-400/80 to-orange-400/60 text-white'
                        : 'bg-gradient-to-br from-blue-600/80 to-indigo-600/60 text-white'
                    }`}
                  >
                    {/* Photo */}
                    {service.cover_photo_url && (
                      <div className="mb-6">
                        <img
                          src={service.cover_photo_url}
                          alt={`${service.country} visa`}
                          className="w-36 h-36 object-cover rounded-3xl shadow-2xl mx-auto border-4 border-white/30"
                        />
                      </div>
                    )}
                    {/* Country Name - prominent */}
                    <h3 className="text-4xl md:text-5xl font-extrabold text-white mb-4 drop-shadow-lg tracking-tight text-center">
                      {service.country}
                    </h3>
                  </div>

                  {/* Content */}
                  <div className="p-7 pt-2">
                    {/* Price */}
                    <div className="flex flex-col items-center mb-2">
                      <div className="text-3xl md:text-4xl font-black text-blue-900 drop-shadow-lg tracking-tight">
                        <span className="text-2xl align-super">$</span>
                        {service.price}
                      </div>
                    </div>
                    {/* Visa Type */}
                    <div className="flex flex-col items-center mb-2">
                      <p className="text-blue-800 text-lg font-semibold">{service.visa_type}</p>
                    </div>
                    {/* Visa Validity */}
                    <div className="flex items-center justify-center gap-3 mb-2">
                      <Clock className="w-5 h-5 text-blue-500" />
                      <div>
                        <p className="text-xs text-gray-500">Visa Validity</p>
                        <p className="font-semibold text-gray-800">{service.duration}</p>
                      </div>
                    </div>
                    {/* Requirements */}
                    <div className="flex items-center justify-center gap-3 mb-6">
                      <div className="w-9 h-9 bg-green-100/60 flex items-center justify-center rounded-lg">
                        <FileText className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Requirements</p>
                        <p className="font-semibold text-gray-800">{service.requirements}</p>
                      </div>
                    </div>
                    {/* CTA Button */}
                    <button
                      onClick={() => handleServiceSelect(service)}
                      className={`w-full relative overflow-hidden font-bold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center justify-center space-x-2 group
                        ${
                          service.recommended
                            ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg'
                            : service.popular
                            ? 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white shadow-lg'
                            : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg'
                        }`}
                      tabIndex={0}
                    >
                      <span className="relative z-10 flex items-center">
                        <span>Select Plan</span>
                        <span className="ml-2 w-2 h-2 rounded-full bg-white animate-pulse"></span>
                      </span>
                      <ArrowRight size={16} className="relative z-10 transition-transform group-hover:translate-x-1" />
                      {/* Glass shimmer */}
                      <div className="absolute inset-0 bg-gradient-to-r from-white/30 via-white/50 to-white/30 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700 pointer-events-none"></div>
                    </button>
                  </div>
                </div>
              </div>
            ))}
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
