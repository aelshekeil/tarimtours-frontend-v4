import { FC } from 'react';
import { 
  Clock, 
  Shield, 
  Globe, 
  Star, 
  CheckCircle, 
  ArrowRight,
  Zap,
  Award,
  FileText
} from 'lucide-react';

export interface VisaService {
  id: string;
  name: string;
  price: number;
  currency: string;
  processingTime: string;
  validity: string;
  features: string[];
  popular?: boolean;
  recommended?: boolean;
}

interface VisaServicesProps {
  onServiceSelect: (service: VisaService) => void;
}

const VisaServices: FC<VisaServicesProps> = ({ onServiceSelect }) => {

  const services: VisaService[] = [
    {
      id: 'tourist',
      name: 'Tourist Visa',
      price: 99.99,
      currency: 'USD',
      processingTime: '15-20 business days',
      validity: '3 months',
      features: [
        'Standard processing',
        'Email support',
        'Document checklist',
        'Single entry'
      ]
    },
    {
      id: 'business',
      name: 'Business Visa',
      price: 149.99,
      currency: 'USD',
      processingTime: '10-15 business days',
      validity: '6 months',
      features: [
        'Priority processing',
        'Phone & email support',
        'Invitation letter template',
        'Multiple entries',
        'Application tracking'
      ],
      popular: true
    },
    {
      id: 'express',
      name: 'Express Visa',
      price: 249.99,
      currency: 'USD',
      processingTime: '5-7 business days',
      validity: '1 year',
      features: [
        'Express processing',
        '24/7 priority support',
        'Document pre-check',
        'Multiple entries',
        'Real-time tracking',
        'Appointment scheduling'
      ],
      recommended: true
    },
    {
      id: 'concierge',
      name: 'Concierge Service',
      price: 499.99,
      currency: 'USD',
      processingTime: '2-4 business days',
      validity: '2 years',
      features: [
        'VIP processing',
        'Dedicated visa consultant',
        'Form filling assistance',
        'Document collection',
        'Real-time tracking',
        'Appointment scheduling',
        'Personal consultation'
      ]
    }
  ];

  const handleServiceSelect = (service: VisaService) => {
    onServiceSelect(service);
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
              Visa Application Services
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8 leading-relaxed">
              Hassle-free visa processing for your international travel needs.
            </p>
          </div>
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((service) => (
              <div 
                key={service.id}
                className={`relative group cursor-pointer transform transition-all duration-300 hover:scale-105 ${
                  service.recommended ? 'lg:scale-110' : ''
                }`}
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
                      {service.id === 'tourist' && <Globe className="w-8 h-8 text-blue-600" />}
                      {service.id === 'business' && <Star className="w-8 h-8 text-yellow-600" />}
                      {service.id === 'express' && <Zap className="w-8 h-8 text-green-600" />}
                      {service.id === 'concierge' && <Award className="w-8 h-8 text-purple-600" />}
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
                      onClick={() => handleServiceSelect(service)}
                      className={`w-full relative overflow-hidden font-semibold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center justify-center space-x-2 group ${
                        service.recommended
                          ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg'
                          : service.popular
                          ? 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white shadow-lg'
                          : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg'
                      }`}>
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
              <h3 className="text-2xl font-bold text-gray-800 mb-6">Our Commitment to You</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Shield className="w-6 h-6 text-blue-600" />
                  </div>
                  <h4 className="font-semibold text-gray-800 mb-2">Secure Process</h4>
                  <p className="text-gray-600 text-sm">Your data is encrypted and handled with care.</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Zap className="w-6 h-6 text-green-600" />
                  </div>
                  <h4 className="font-semibold text-gray-800 mb-2">Expert Review</h4>
                  <p className="text-gray-600 text-sm">Our specialists review every application.</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Globe className="w-6 h-6 text-purple-600" />
                  </div>
                  <h4 className="font-semibold text-gray-800 mb-2">Global Coverage</h4>
                  <p className="text-gray-600 text-sm">We assist with visa applications for most countries.</p>
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