import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Car, Globe, Shield, Clock, ArrowRight, Zap, FileText } from 'lucide-react';

interface DrivingLicenseService {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  features: string[];
  processingTime: string;
  validity: string;
  icon: React.ReactNode;
  popular?: boolean;
  recommended?: boolean;
}

interface DrivingLicenseServiceSelectionProps {
  onSelectService: (service: DrivingLicenseService) => void;
}

export const DrivingLicenseServiceSelection: React.FC<DrivingLicenseServiceSelectionProps> = ({ onSelectService }) => {
  // Removed unused selectedService state
  const navigate = useNavigate();

  const services: DrivingLicenseService[] = [
    {
      id: 'standard-idl',
      name: 'Standard International Driving License',
      description: 'Valid in over 150 countries worldwide',
      price: 49,
      currency: 'USD',
      features: [
        'Valid for 1 year',
        'Recognized in 150+ countries',
        'Digital copy included',
        'Express processing available'
      ],
      processingTime: '3-5 business days',
      validity: '1 year',
      icon: <Car className="w-8 h-8 text-blue-600" />
    },
    {
      id: 'premium-idl',
      name: 'Premium International Driving License',
      description: 'Extended validity with premium features',
      price: 89,
      currency: 'USD',
      features: [
        'Valid for 3 years',
        'Priority processing',
        'Physical card with security features',
        'Emergency replacement service',
        '24/7 support hotline'
      ],
      processingTime: '2-3 business days',
      validity: '3 years',
      icon: <Shield className="w-8 h-8 text-green-600" />,
      popular: true
    },
    {
      id: 'express-idl',
      name: 'Express International Driving License',
      description: 'Same-day processing for urgent travel',
      price: 129,
      currency: 'USD',
      features: [
        'Same-day processing',
        'Valid for 1 year',
        'Digital delivery within hours',
        'Physical card expedited shipping',
        'VIP customer support'
      ],
      processingTime: 'Same day',
      validity: '1 year',
      icon: <Clock className="w-8 h-8 text-yellow-600" />,
      recommended: true
    },
    {
      id: 'global-idl',
      name: 'Global Executive License',
      description: 'Premium service for frequent international travelers',
      price: 199,
      currency: 'USD',
      features: [
        'Valid for 5 years',
        'Covers all vehicle categories',
        'Multiple language translations',
        'Concierge support service',
        'Free renewals for minor updates',
        'Diplomatic pouch delivery option'
      ],
      processingTime: '1-2 business days',
      validity: '5 years',
      icon: <Globe className="w-8 h-8 text-purple-600" />
    }
  ];

  // Removed handleServiceSelect and selection logic, as selection is handled by per-card button

  const handleProceed = (service: DrivingLicenseService) => {
    onSelectService(service);
    // Store selected service in localStorage for the application form (excluding the icon to avoid circular reference)
    const serviceData = {
      id: service.id,
      name: service.name,
      description: service.description,
      price: service.price,
      currency: service.currency,
      features: service.features,
      processingTime: service.processingTime,
      validity: service.validity
    };
    localStorage.setItem('selectedDrivingLicenseService', JSON.stringify(serviceData));
    // Navigate to the application form
    navigate('/international-driving-license');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-r from-blue-700 to-purple-800 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="container-custom text-center relative z-10">
          <div className="max-w-4xl mx-auto">
            <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-6">
              <FileText className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              International Driving License Services
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8 leading-relaxed">
              Hassle-free international driving license packages for your global journeys.
            </p>
          </div>
        </div>
      </section>

      {/* Service Plans Section */}
      <section className="py-20">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Our License Packages</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Choose the right international driving license package for your travel needs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((service) => (
              <div
                key={service.id}
                className={`relative group cursor-pointer transform transition-all duration-300 hover:scale-105 ${
                  service.recommended ? 'lg:scale-110' : ''
                }`}
                // Removed onClick for selection, only per-card button handles selection
              >
                {/* Popular/Recommended badges */}
                {service.popular && (
                  <div className="absolute -top-3 -right-3 z-20">
                    <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                      Most Popular
                    </div>
                  </div>
                )}

                {service.recommended && (
                  <div className="absolute -top-3 -left-3 z-20">
                    <div className="bg-gradient-to-r from-green-400 to-emerald-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                      Recommended
                    </div>
                  </div>
                )}

                <div className={`relative overflow-hidden bg-white rounded-2xl shadow-xl border transition-all duration-300 group-hover:shadow-2xl h-full ${
                  service.recommended
                    ? 'border-green-200 ring-2 ring-green-100'
                    : service.popular
                    ? 'border-yellow-200 ring-2 ring-yellow-100'
                    : 'border-gray-100 group-hover:border-blue-200'
                }`}>

                  {/* Header */}
                  <div className={`p-6 text-center ${
                    service.recommended
                      ? 'bg-gradient-to-br from-green-50 to-emerald-50'
                      : service.popular
                      ? 'bg-gradient-to-br from-yellow-50 to-orange-50'
                      : 'bg-gradient-to-br from-blue-50 to-indigo-50'
                  }`}>
                    <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${
                      service.recommended
                        ? 'bg-green-100'
                        : service.popular
                        ? 'bg-yellow-100'
                        : 'bg-blue-100'
                    }`}>
                      {service.icon}
                    </div>
                    
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">{service.name}</h3>
                    <div className="text-4xl font-bold text-gray-900 mb-1">
                      ${service.price}
                    </div>
                    <p className="text-gray-600 text-sm">{service.currency}</p>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    {/* Processing Info */}
                    <div className="mb-6 space-y-3">
                      <div className="flex items-center text-gray-700">
                        <Clock className="w-5 h-5 text-blue-600 mr-3" />
                        <span className="font-medium">{service.processingTime}</span>
                      </div>
                      <div className="flex items-center text-gray-700">
                        <Shield className="w-5 h-5 text-green-600 mr-3" />
                        <span className="font-medium">Valid for {service.validity}</span>
                      </div>
                    </div>

                    {/* Features */}
                    <ul className="space-y-3 mb-8">
                      {service.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start text-sm text-gray-700">
                          <CheckCircle className="w-4 h-4 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>

                    {/* CTA Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleProceed(service);
                      }}
                      className={`w-full relative overflow-hidden font-semibold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center justify-center space-x-2 group ${
                        service.recommended
                          ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg'
                          : service.popular
                          ? 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white shadow-lg'
                          : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg'
                      }`}
                    >
                      <span className="relative z-10">Select Plan</span>
                      <ArrowRight size={16} className="relative z-10 transition-transform group-hover:translate-x-1" />
                      {/* Shimmer effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Additional Info */}
          <div className="mt-16 text-center">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 max-w-4xl mx-auto">
              <h3 className="text-2xl font-bold text-gray-800 mb-6">Important Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Shield className="w-6 h-6 text-blue-600" />
                  </div>
                  <h4 className="font-semibold text-gray-800 mb-2">Official Recognition</h4>
                  <p className="text-gray-600 text-sm">All our licenses are officially recognized and valid worldwide.</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Zap className="w-6 h-6 text-green-600" />
                  </div>
                  <h4 className="font-semibold text-gray-800 mb-2">Fast Processing</h4>
                  <p className="text-gray-600 text-sm">Get your license quickly with our express and premium options.</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Globe className="w-6 h-6 text-purple-600" />
                  </div>
                  <h4 className="font-semibold text-gray-800 mb-2">Global Support</h4>
                  <p className="text-gray-600 text-sm">We provide support for travelers in over 150 countries.</p>
                </div>
              </div>
              <div className="mt-8 text-left">
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• An International Driving License is a translation of your national driving license.</li>
                  <li>• You must carry both your IDL and your original license when driving abroad.</li>
                  <li>• Processing times may vary during peak seasons.</li>
                  <li>• All prices include shipping and handling fees.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};