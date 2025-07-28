import React, { FC, useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useApplication } from '../hooks/useApplication';
import Search from 'lucide-react/dist/esm/icons/search';
import FileText from 'lucide-react/dist/esm/icons/file-text';
import Calendar from 'lucide-react/dist/esm/icons/calendar';
import CheckCircle from 'lucide-react/dist/esm/icons/check-circle';
import Clock from 'lucide-react/dist/esm/icons/clock';
import AlertCircle from 'lucide-react/dist/esm/icons/alert-circle';
import Car from 'lucide-react/dist/esm/icons/car';
import Plane from 'lucide-react/dist/esm/icons/plane';
import FileCheck from 'lucide-react/dist/esm/icons/file-check';
import ChevronDown from 'lucide-react/dist/esm/icons/chevron-down';
import ChevronUp from 'lucide-react/dist/esm/icons/chevron-up';
import User from 'lucide-react/dist/esm/icons/user';
import Mail from 'lucide-react/dist/esm/icons/mail';
import Phone from 'lucide-react/dist/esm/icons/phone';
import MapPin from 'lucide-react/dist/esm/icons/map-pin';
import CreditCard from 'lucide-react/dist/esm/icons/credit-card';
import Globe from 'lucide-react/dist/esm/icons/globe';
import Image from 'lucide-react/dist/esm/icons/image';

// Application types configuration
const APPLICATION_TYPES: {
  id: string;
  name: string;
  icon: React.ElementType;
  table: string;
  color: 'blue' | 'green';
  description: string;
  features: string[];
}[] = [
  {
    id: 'visa_applications',
    name: 'Visa Application',
    icon: Plane,
    table: 'visa_applications',
    color: 'blue',
    description: 'Track your visa application status and documents',
    features: ['Real-time status updates', 'Document verification', 'Processing timeline']
  },
  {
    id: 'international_driving_license_applications',
    name: 'International Driving License',
    icon: Car,
    table: 'international_driving_license_applications',
    color: 'green',
    description: 'Track your international driving license application',
    features: ['Application progress', 'Document review', 'License delivery status']
  }
];

const ApplicationTracking: FC = () => {
  const { t } = useTranslation();
  const [trackingId, setTrackingId] = useState('');
  const [selectedApplicationType, setSelectedApplicationType] = useState(APPLICATION_TYPES[0]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { loading, error, applicationStatus, track } = useApplication();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelectType = (type: typeof APPLICATION_TYPES[0]) => {
    setSelectedApplicationType(type);
    setIsDropdownOpen(false);
  };

  const handleTrack = () => {
    if (trackingId && selectedApplicationType) {
      // Pass the table name to the track function
      track(trackingId, selectedApplicationType.table);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'approved':
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'pending':
      case 'processing':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'rejected':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <FileText className="w-5 h-5 text-blue-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'approved':
      case 'completed':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'pending':
      case 'processing':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'rejected':
        return 'bg-red-50 border-red-200 text-red-800';
      default:
        return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-16 px-4">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative container mx-auto max-w-4xl text-center">
          <div className="flex justify-center mb-6">
            <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-full p-4">
              <Search className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            {t('tracking.title') || 'Track Your Application'}
          </h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">
            {t('tracking.hero_subtitle') || 'Stay updated on all your travel and document application status with our comprehensive tracking system'}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Application Type Selection */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 mb-6">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full p-3">
                <FileText className="w-6 h-6 text-white" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              {t('tracking.select_service_type') || 'Select Service Type'}
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Choose the type of application you want to track. Each service has its own tracking system.
            </p>
          </div>

          {/* Modern Dropdown */}
          <div className="max-w-md mx-auto">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Application Type
            </label>
            <div className="relative" ref={dropdownRef}>
              {/* Dropdown Button */}
              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="relative w-full bg-white border-2 border-gray-300 rounded-xl shadow-sm pl-4 pr-10 py-4 text-left cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 hover:border-gray-400"
              >
                <div className="flex items-center gap-3">
                  <div className={`rounded-full p-2 ${
                    selectedApplicationType.color === 'blue' ? 'bg-blue-100' :
                    selectedApplicationType.color === 'green' ? 'bg-green-100' : 'bg-purple-100'
                  }`}>
                    {React.createElement(selectedApplicationType.icon, { 
                      className: `w-5 h-5 ${
                        selectedApplicationType.color === 'blue' ? 'text-blue-600' :
                        selectedApplicationType.color === 'green' ? 'text-green-600' : 'text-purple-600'
                      }` 
                    })}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-lg font-semibold text-gray-900 truncate">
                      {selectedApplicationType.name}
                    </p>
                    <p className="text-sm text-gray-500 truncate">
                      {selectedApplicationType.description}
                    </p>
                  </div>
                </div>
                <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                  {isDropdownOpen ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </div>
              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute z-50 mt-2 w-full bg-white shadow-xl rounded-xl border border-gray-200 overflow-hidden">
                  <div className="py-2">
                    {APPLICATION_TYPES.map((type) => {
                      const IconComponent = type.icon;
                      const isSelected = selectedApplicationType.id === type.id;
                      
                      return (
                        <button
                          key={type.id}
                          onClick={() => handleSelectType(type)}
                          className={`w-full px-4 py-3 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none transition-colors duration-150 ${
                            isSelected ? 'bg-indigo-50 border-r-4 border-indigo-500' : ''
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`rounded-full p-2 transition-all duration-200 ${
                              isSelected 
                                ? `${type.color === 'blue' ? 'bg-blue-500' : type.color === 'green' ? 'bg-green-500' : 'bg-purple-500'}`
                                : `${type.color === 'blue' ? 'bg-blue-100' : type.color === 'green' ? 'bg-green-100' : 'bg-purple-100'}`
                            }`}>
                              <IconComponent className={`w-5 h-5 transition-colors duration-200 ${
                                isSelected 
                                  ? 'text-white' 
                                  : `${type.color === 'blue' ? 'text-blue-600' : type.color === 'green' ? 'text-green-600' : 'text-purple-600'}`
                              }`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p className={`text-base font-semibold truncate transition-colors duration-200 ${
                                  isSelected ? 'text-indigo-900' : 'text-gray-900'
                                }`}>
                                  {type.name}
                                </p>
                                {isSelected && (
                                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                                )}
                              </div>
                              <p className={`text-sm truncate transition-colors duration-200 ${
                                isSelected ? 'text-indigo-700' : 'text-gray-500'
                              }`}>
                                {type.description}
                              </p>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Selected type summary */}
          <div className="mt-8 max-w-md mx-auto p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-200">
            <div className="flex items-center gap-3">
              <div className="bg-white rounded-full p-2 shadow-sm">
                <CheckCircle className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-indigo-700">Selected Service:</p>
                <p className="text-lg font-bold text-indigo-900">{selectedApplicationType.name}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search Card */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-blue-100 rounded-full p-2">
              <Search className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-800">
              {t('tracking.enter_tracking_id') || 'Enter Your Tracking ID'}
            </h2>
          </div>

          <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 text-blue-800">
              {React.createElement(selectedApplicationType.icon, { className: "w-4 h-4" })}
              <span className="text-sm font-medium">
                Tracking for: <strong>{selectedApplicationType.name}</strong>
              </span>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-grow">
              <input
                type="text"
                value={trackingId}
                onChange={(e) => setTrackingId(e.target.value)}
                placeholder={t('tracking.placeholder') || 'Enter your tracking number...'}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all duration-200 text-lg"
              />
            </div>
            <button
              onClick={handleTrack}
              disabled={loading || !trackingId}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  {t('common.loading') || 'Loading...'}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Search className="w-5 h-5" />
                  {t('tracking.track_button') || 'Track Application'}
                </div>
              )}
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <div>
              <p className="text-red-700 font-medium">{error}</p>
              <p className="text-red-600 text-sm mt-1">
                Make sure you've selected the correct service type for your tracking ID.
              </p>
            </div>
          </div>
        )}

        {/* Status Display */}
        {applicationStatus && (
          <div className="space-y-6">
            {/* Status Overview Card */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
              <div className={`px-6 py-4 border-b border-gray-200 ${getStatusColor(applicationStatus.status)}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(applicationStatus.status)}
                    <div>
                      <h3 className="text-lg font-semibold">
                        {t('tracking.status_title') || 'Application Status'}
                      </h3>
                      <p className="text-sm opacity-80">
                        Your {selectedApplicationType.name.toLowerCase()} application is currently {applicationStatus.status?.toLowerCase() || 'under review'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium opacity-80">Tracking ID</p>
                    <p className="text-lg font-bold font-mono">{applicationStatus.tracking_id}</p>
                  </div>
                </div>
              </div>

              {/* Basic Information */}
              <div className="p-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-blue-600" />
                  Application Details
                </h4>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-100 rounded-full p-2">
                      <User className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Full Name</p>
                      <p className="text-base font-semibold text-gray-800">{applicationStatus.fullName}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="bg-green-100 rounded-full p-2">
                      <Mail className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Email</p>
                      <p className="text-base font-semibold text-gray-800">{applicationStatus.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="bg-purple-100 rounded-full p-2">
                      <Phone className="w-4 h-4 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Phone</p>
                      <p className="text-base font-semibold text-gray-800">{applicationStatus.phone}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="bg-orange-100 rounded-full p-2">
                      <Calendar className="w-4 h-4 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Submitted</p>
                      <p className="text-base font-semibold text-gray-800">
                        {new Date(applicationStatus.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="bg-indigo-100 rounded-full p-2">
                      <Globe className="w-4 h-4 text-indigo-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Nationality</p>
                      <p className="text-base font-semibold text-gray-800">{applicationStatus.nationality}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="bg-yellow-100 rounded-full p-2">
                      <CreditCard className="w-4 h-4 text-yellow-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Payment Status</p>
                      <p className={`text-base font-semibold ${
                        applicationStatus.payment_status === 'paid' ? 'text-green-600' : 
                        applicationStatus.payment_status === 'pending' ? 'text-yellow-600' : 'text-gray-600'
                      }`}>
                        {applicationStatus.payment_status || 'Pending'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Service-Specific Information */}
            {selectedApplicationType.id === 'visa_applications' && (
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Plane className="w-5 h-5 text-blue-600" />
                  Visa Application Details
                </h4>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {applicationStatus.destinationCountry && (
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-100 rounded-full p-2">
                        <Globe className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Destination</p>
                        <p className="text-base font-semibold text-gray-800 capitalize">{applicationStatus.destinationCountry}</p>
                      </div>
                    </div>
                  )}

                  {applicationStatus.visaType && (
                    <div className="flex items-center gap-3">
                      <div className="bg-green-100 rounded-full p-2">
                        <FileText className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Visa Type</p>
                        <p className="text-base font-semibold text-gray-800 capitalize">{applicationStatus.visaType}</p>
                      </div>
                    </div>
                  )}

                  {applicationStatus.travelDate && (
                    <div className="flex items-center gap-3">
                      <div className="bg-purple-100 rounded-full p-2">
                        <Calendar className="w-4 h-4 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Travel Date</p>
                        <p className="text-base font-semibold text-gray-800">
                          {new Date(applicationStatus.travelDate).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                  )}

                  {applicationStatus.passportNumber && (
                    <div className="flex items-center gap-3">
                      <div className="bg-orange-100 rounded-full p-2">
                        <FileText className="w-4 h-4 text-orange-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Passport Number</p>
                        <p className="text-base font-semibold text-gray-800 font-mono">{applicationStatus.passportNumber}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {selectedApplicationType.id === 'international_driving_license_applications' && (
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Car className="w-5 h-5 text-green-600" />
                  Driving License Details
                </h4>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {applicationStatus.dateOfBirth && (
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-100 rounded-full p-2">
                        <Calendar className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Date of Birth</p>
                        <p className="text-base font-semibold text-gray-800">
                          {new Date(applicationStatus.dateOfBirth).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                  )}

                  {applicationStatus.address && (
                    <div className="flex items-center gap-3">
                      <div className="bg-green-100 rounded-full p-2">
                        <MapPin className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Address</p>
                        <p className="text-base font-semibold text-gray-800">{applicationStatus.address}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Documents Section - Only show if there are valid documents */}
            {(() => {
              const hasValidDocuments = 
                (applicationStatus.photoUrl || applicationStatus.photo_url) ||
                applicationStatus.idCopyUrl ||
                applicationStatus.oldLicenseCopyUrl ||
                applicationStatus.passport_copy_url ||
                applicationStatus.additional_documents_urls;

              if (!hasValidDocuments) {
                return (
                  <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                    <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <Image className="w-5 h-5 text-indigo-600" />
                      Submitted Documents
                    </h4>
                    <div className="text-center py-8">
                      <div className="bg-gray-100 rounded-full p-4 w-16 h-16 mx-auto mb-4">
                        <FileCheck className="w-8 h-8 text-gray-400" />
                      </div>
                      <p className="text-gray-600 mb-2">We have received your documents.</p>
                      <p className="text-sm text-gray-500">For your security, we do not display the documents here, but rest assured they are being securely processed by our team.</p>
                    </div>
                  </div>
                );
              }

              return (
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Image className="w-5 h-5 text-indigo-600" />
                    Submitted Documents
                  </h4>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Photo */}
                {(applicationStatus.photoUrl || applicationStatus.photo_url) && (
                  <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="bg-blue-100 rounded-full p-2">
                        <Image className="w-4 h-4 text-blue-600" />
                      </div>
                      <p className="font-medium text-gray-800">Photo</p>
                    </div>
                    <div className="flex items-center gap-2 text-green-600 text-sm">
                      <CheckCircle className="w-4 h-4" />
                      <span>Document has been submitted and is being reviewed by our team.</span>
                    </div>
                  </div>
                )}

                {/* ID Copy (for driving license) */}
                {applicationStatus.idCopyUrl && (
                  <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="bg-green-100 rounded-full p-2">
                        <FileText className="w-4 h-4 text-green-600" />
                      </div>
                      <p className="font-medium text-gray-800">ID Copy</p>
                    </div>
                    <div className="flex items-center gap-2 text-green-600 text-sm">
                      <CheckCircle className="w-4 h-4" />
                      <span>Document has been submitted and is being reviewed by our team.</span>
                    </div>
                  </div>
                )}

                {/* Old License Copy (for driving license) */}
                {applicationStatus.oldLicenseCopyUrl && (
                  <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="bg-purple-100 rounded-full p-2">
                        <Car className="w-4 h-4 text-purple-600" />
                      </div>
                      <p className="font-medium text-gray-800">Current License</p>
                    </div>
                    <div className="flex items-center gap-2 text-green-600 text-sm">
                      <CheckCircle className="w-4 h-4" />
                      <span>Document has been submitted and is being reviewed by our team.</span>
                    </div>
                  </div>
                )}

                {/* Passport Copy (for visa) */}
                {applicationStatus.passport_copy_url && (
                  <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="bg-orange-100 rounded-full p-2">
                        <FileText className="w-4 h-4 text-orange-600" />
                      </div>
                      <p className="font-medium text-gray-800">Passport Copy</p>
                    </div>
                    <div className="flex items-center gap-2 text-green-600 text-sm">
                      <CheckCircle className="w-4 h-4" />
                      <span>Document has been submitted and is being reviewed by our team.</span>
                    </div>
                  </div>
                )}

                {/* Additional Documents (for visa) */}
                {applicationStatus.additional_documents_urls && (
                  <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="bg-indigo-100 rounded-full p-2">
                        <FileCheck className="w-4 h-4 text-indigo-600" />
                      </div>
                      <p className="font-medium text-gray-800">Additional Documents</p>
                    </div>
                    <div className="flex items-center gap-2 text-green-600 text-sm">
                      <CheckCircle className="w-4 h-4" />
                      <span>Document has been submitted and is being reviewed by our team.</span>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Document Status Note */}
              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-start gap-3">
                  <div className="bg-blue-100 rounded-full p-1 mt-0.5">
                    <AlertCircle className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-blue-800">Document Security Notice</p>
                    <p className="text-sm text-blue-700 mt-1">
                      Your documents are securely stored and accessible only to our authorized staff for processing your application. 
                      For security reasons, document previews are not available in the tracking system.
                    </p>
                  </div>
                </div>
              </div>
            </div>
              );
            })()}

            {/* Processing Timeline */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-yellow-600" />
                Processing Timeline
              </h4>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="bg-green-500 rounded-full p-2">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">Application Submitted</p>
                    <p className="text-sm text-gray-600">
                      {new Date(applicationStatus.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className={`rounded-full p-2 ${
                    applicationStatus.status === 'Under Review' || applicationStatus.status === 'Completed' 
                      ? 'bg-blue-500' : 'bg-gray-300'
                  }`}>
                    <Clock className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">Under Review</p>
                    <p className="text-sm text-gray-600">
                      {applicationStatus.status === 'Under Review' ? 'Currently being processed' :
                       applicationStatus.status === 'Completed' ? 'Review complete' : 'Pending review'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className={`rounded-full p-2 ${
                    applicationStatus.status === 'Completed' 
                      ? 'bg-green-500' : 'bg-gray-300'
                  }`}>
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">Completed</p>
                    <p className="text-sm text-gray-600">
                      {applicationStatus.status === 'Completed' 
                        ? 'Application approved' : 'Awaiting completion'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Help Section */}
        <div className="mt-12 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-8 border border-blue-200">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">{t('tracking.need_help') || 'Need Help?'}</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-700 mb-2">{t('tracking.common_questions') || 'Common Questions'}</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• {t('tracking.processing_time_info') || 'Processing usually takes 5-10 business days'}</li>
                <li>• {t('tracking.email_updates_info') || 'You\'ll receive email updates for status changes'}</li>
                <li>• {t('tracking.keep_tracking_number_safe') || 'Keep your tracking number safe for future reference'}</li>
                <li>• Make sure to select the correct service type when tracking</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-700 mb-2">{t('tracking.contact_support') || 'Contact Support'}</h4>
              <p className="text-sm text-gray-600 mb-2">
                {t('tracking.questions_about_application') || 'If you have questions about your application:'}
              </p>
              <div className="flex flex-col gap-2">
                <a href="mailto:tarimtours@gmail.com" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                  tarimtours@gmail.com
                </a>
                <a href="tel:+60 10-335 3030" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                  +60 10-335 3030
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicationTracking;
