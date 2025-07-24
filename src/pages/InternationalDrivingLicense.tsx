// InternationalDrivingLicense.tsx
import { FC, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';
import { DrivingLicenseApplicationData, submitDrivingLicenseApplication } from '../services/applicationApi';
import AuthModal from '../components/common/AuthModal';
import Dropzone from '../components/forms/Dropzone';
import countries from 'i18n-iso-countries';
import enLocale from 'i18n-iso-countries/langs/en.json';
import arLocale from 'i18n-iso-countries/langs/ar.json';
import PhoneInput from 'react-phone-number-input';
import { E164Number } from 'libphonenumber-js/core';
import 'react-phone-number-input/style.css';
import {
  CheckCircle,
  Truck,
  AlertCircle,
  User,
  Camera,
  ArrowLeft,
  CreditCard,
  ArrowRight,
  Shield,
  Clock,
  Globe,
  HelpCircle,
  Zap,
  Award,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

const REQUIRED_FIELDS: (keyof Omit<DrivingLicenseApplicationData, 'idCopy' | 'photo' | 'oldLicenseCopy'>)[] =
  ['fullName', 'email', 'phone', 'dateOfBirth', 'nationality', 'address'];

countries.registerLocale(enLocale);
countries.registerLocale(arLocale);

// 6-char random id like Supabase short-uuid
const generateTrackingId = () =>
  Math.random().toString(36).substring(2, 8).toUpperCase();

const InternationalDrivingLicense: FC = () => {
  const { t, i18n } = useTranslation();
  const [currentStep, setCurrentStep] = useState(1);
  const [isReviewing, setIsReviewing] = useState(false);
  const [showInfo, setShowInfo] = useState(true);
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);
  const [formData, setFormData] = useState<Partial<DrivingLicenseApplicationData & { nationality: string }>>({ address: '' });
  const [files, setFiles] = useState<{ idCopy?: File; photo?: File; oldLicenseCopy?: File }>({});
  const [loading, setLoading] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [trackingId, setTrackingId] = useState('');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const { isLoggedIn, user } = useAuth();

  const handleFileChange = useCallback(
    (file: File, field: keyof typeof files) => setFiles((prev) => ({ ...prev, [field]: file })),
    []
  );

  const handleChange = useCallback(
    (
      e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement> | E164Number | string,
      name?: keyof DrivingLicenseApplicationData | 'nationality'
    ) => {
      if (name === 'phone' && typeof e === 'string') {
        setFormData((prev) => ({ ...prev, phone: e }));
      } else if (typeof e === 'object' && e && 'target' in e) {
        const { name: targetName, value } = e.target as HTMLInputElement | HTMLSelectElement;
        setFormData((prev) => ({ ...prev, [targetName]: value }));
      }
    },
    []
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (formData.dateOfBirth) {
      const age = new Date().getFullYear() - new Date(formData.dateOfBirth).getFullYear();
      if (age < 18) {
        setValidationError(t('common.age_validation'));
        return;
      }
    }

    const missingFields = REQUIRED_FIELDS.filter((field) => !formData[field]);
    if (missingFields.length) {
      setValidationError(`${t('common.fill_required_fields')}: ${missingFields.join(', ')}`);
      return;
    }
    if (!files.idCopy || !files.photo || !files.oldLicenseCopy) {
      setValidationError(t('common.upload_required_documents'));
      return;
    }
    if (!user?.id) {
      setValidationError(t('common.login_required_text'));
      return;
    }

    setLoading(true);
    const applicationData: DrivingLicenseApplicationData = {
      fullName: formData.fullName!,
      email: formData.email!,
      phone: formData.phone!,
      dateOfBirth: new Date(formData.dateOfBirth!).toISOString(),
      nationality: formData.nationality!,
      address: formData.address!,
      idCopy: files.idCopy!,
      photo: files.photo!,
      oldLicenseCopy: files.oldLicenseCopy!,
    };

    // Generate tracking ID in the UI
    const generatedTrackingId = generateTrackingId();

    try {
      const res: any = await submitDrivingLicenseApplication(applicationData, generatedTrackingId);
      const dbId = res?.trackingNumber || generatedTrackingId;
      setTrackingId(dbId);
      setLoading(false);
      setCurrentStep(4);
    } catch (err: any) {
      console.error('Application submission failed:', err);
      setLoading(false);
      setValidationError(
        err.message || 'Failed to submit application. Please check your information and try again.'
      );
    }
  };

  const handleReview = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const missingFields = REQUIRED_FIELDS.filter((field) => !formData[field]);
      if (missingFields.length) {
        setValidationError(`${t('common.fill_required_fields')}: ${missingFields.join(', ')}`);
        return;
      }
      if (!files.idCopy || !files.photo || !files.oldLicenseCopy) {
        setValidationError(t('common.upload_required_documents'));
        return;
      }
      setValidationError(null);
      setIsReviewing(true);
      setCurrentStep(2);
    },
    [formData, files, t]
  );

  const steps = [
    t('idl.steps.upload'),
    t('idl.steps.review'),
    t('idl.steps.payment'),
    t('idl.steps.delivery')
  ];

  const faqs = [
    { question: t('faq.q1'), answer: t('faq.a1') },
    { question: t('faq.q2'), answer: t('faq.a2') },
    { question: t('faq.q3'), answer: t('faq.a3') },
    { question: t('faq.q4'), answer: t('faq.a4') }
  ];

  /* ---------- SUCCESS PAGE ---------- */
  if (currentStep === 4)
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-50 py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-12 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-green-400/10 to-blue-400/10"></div>
            <div className="relative z-10">
              <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg">
                <CheckCircle className="w-14 h-14 text-white" />
              </div>
              <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-6">
                Application Submitted Successfully!
              </h2>
              <p className="text-gray-600 text-lg mb-8 max-w-md mx-auto">
                Your International Driving Permit application is now being processed by our team.
              </p>
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 mb-8 border border-blue-100">
                <p className="text-blue-800 font-semibold text-lg">
                  Tracking Number:{' '}
                  <span className="font-mono">{trackingId}</span>
                </p>
              </div>
              <div className="flex items-center justify-center space-x-4 text-gray-600">
                <Truck className="w-6 h-6 text-blue-600" />
                <span className="font-medium">Expected delivery: 7-10 business days</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );

  /* ---------- MAIN RENDER ---------- */
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 text-white py-16">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10 max-w-6xl mx-auto px-4 text-center">
          <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-6">
            <Globe className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">International Driving Permit</h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto opacity-90">
            Drive legally in over 150 countries with your official International Driving Permit
          </p>
          <div className="flex flex-wrap justify-center gap-8 text-sm">
            <div className="flex items-center">
              <Shield className="w-5 h-5 mr-2" />
              <span>Officially Recognized</span>
            </div>
            <div className="flex items-center">
              <Clock className="w-5 h-5 mr-2" />
              <span>Fast Processing</span>
            </div>
            <div className="flex items-center">
              <Award className="w-5 h-5 mr-2" />
              <span>Valid for 1 Year</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* -------------- INFO CARDS & FAQ -------------- */}
        {showInfo && (
          <div className="mb-12 space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Eligibility */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 hover:shadow-xl transition-all duration-300">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 ml-3">Eligibility</h3>
                </div>
                <p className="text-gray-600 leading-relaxed">
                  To be eligible for an International Driving Permit, you must be 18 years or older and hold a valid
                  domestic driver's license from your home country.
                </p>
              </div>

              {/* Process */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 hover:shadow-xl transition-all duration-300">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 ml-3">Simple Process</h3>
                </div>
                <p className="text-gray-600 leading-relaxed">
                  Fill out the form, upload the required documents, pay, and receive your permit within 7-10 business
                  days.
                </p>
              </div>

              {/* Support */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 hover:shadow-xl transition-all duration-300">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center">
                    <HelpCircle className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 ml-3">24/7 Support</h3>
                </div>
                <p className="text-gray-600 leading-relaxed">
                  Our dedicated support team is available around the clock to assist you with any questions or concerns.
                </p>
              </div>
            </div>

            {/* FAQ */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">Frequently Asked Questions</h3>
              <div className="space-y-4">
                {faqs.map((faq, index) => (
                  <div key={index} className="border border-gray-200 rounded-xl overflow-hidden">
                    <button
                      onClick={() => setExpandedFAQ(expandedFAQ === index ? null : index)}
                      className="w-full px-6 py-4 text-left flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      <span className="font-semibold text-gray-800">{faq.question}</span>
                      {expandedFAQ === index ? (
                        <ChevronUp className="w-5 h-5 text-gray-600" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-600" />
                      )}
                    </button>
                    {expandedFAQ === index && (
                      <div className="px-6 py-4 bg-white">
                        <p className="text-gray-600">{faq.answer}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="text-center">
              <button
                onClick={() => setShowInfo(false)}
                className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Start Your Application
                <ArrowRight className="w-5 h-5 ml-2" />
              </button>
            </div>
          </div>
        )}

        {/* -------------- APPLICATION FORM -------------- */}
        {!showInfo && (
          <>
            {/* Progress bar */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-8 mb-8">
              <div className="flex items-center justify-between mb-6">
                {steps.map((_step, index) => (
                  <div key={index} className="flex items-center">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center font-bold transition-all duration-300 ${
                        index + 1 <= currentStep
                          ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                          : 'bg-gray-200 text-gray-500'
                      }`}
                    >
                      {index + 1 < currentStep ? <CheckCircle className="w-6 h-6" /> : index + 1}
                    </div>
                    {index < steps.length - 1 && (
                      <div
                        className={`hidden sm:block w-24 h-1 mx-4 rounded-full transition-all duration-300 ${
                          index + 1 < currentStep ? 'bg-gradient-to-r from-blue-500 to-purple-500' : 'bg-gray-200'
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-sm font-medium text-gray-600">
                {steps.map((_step, index) => (
                  <div
                    key={index}
                    className={`text-center ${index + 1 === currentStep ? 'text-blue-600 font-bold' : ''}`}
                  >
                    {steps[index]}
                  </div>
                ))}
              </div>
            </div>

            {!isLoggedIn ? (
              <>
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-12 text-center">
                  <AlertCircle className="w-20 h-20 text-orange-500 mx-auto mb-6" />
                  <h3 className="text-3xl font-bold text-gray-800 mb-4">Login Required</h3>
                  <p className="text-gray-600 mb-8 text-lg">Please log in to continue with your application</p>
                  <button
                    onClick={() => setIsAuthModalOpen(true)}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-10 py-4 rounded-full font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    Login to Continue
                  </button>
                </div>
                <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
              </>
            ) : (
              <form onSubmit={isReviewing ? handleSubmit : handleReview} className="space-y-8 pb-32">
                {/* Personal Information Section */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-100">
                  <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                    <User className="w-6 h-6 text-blue-600 mr-3" />
                    Personal Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                      <input 
                        name="fullName" 
                        placeholder="Enter your full name" 
                        value={formData.fullName || ''}
                        onChange={handleChange} 
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white" 
                        required 
                        disabled={isReviewing}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                      <input 
                        name="email" 
                        type="email" 
                        placeholder="your.email@example.com" 
                        value={formData.email || ''}
                        onChange={handleChange} 
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white" 
                        required 
                        disabled={isReviewing}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                      <PhoneInput
                        name="phone"
                        placeholder="+1 (555) 123-4567"
                        value={formData.phone}
                        onChange={(value) => handleChange(value || '', 'phone')}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
                        required
                        disabled={isReviewing}
                        defaultCountry="US"
                        international
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
                      <input 
                        name="dateOfBirth" 
                        type="date" 
                        value={formData.dateOfBirth || ''}
                        onChange={handleChange} 
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white" 
                        required 
                        disabled={isReviewing}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Nationality</label>
                      <select
                        name="nationality"
                        value={formData.nationality || ''}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
                        required
                        disabled={isReviewing}
                      >
                        <option value="">Select your nationality</option>
                        {Object.entries(countries.getNames(i18n.language === 'ar' ? 'ar' : 'en')).map(([code, name]) => (
                          <option key={code} value={name}>
                            {name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                      <input 
                        name="address" 
                        placeholder="Enter your full address" 
                        value={formData.address || ''}
                        onChange={handleChange} 
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white" 
                        required 
                        disabled={isReviewing}
                      />
                    </div>
                  </div>
                </div>

                {/* Document Upload Section */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border border-green-100">
                  <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                    <Camera className="w-6 h-6 text-green-600 mr-3" />
                    Required Documents
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Dropzone onFileChange={(file: File) => handleFileChange(file, 'idCopy')} label="ID Copy" />
                    <Dropzone onFileChange={(file: File) => handleFileChange(file, 'photo')} label="Personal Photo" />
                    <Dropzone onFileChange={(file: File) => handleFileChange(file, 'oldLicenseCopy')} label="License Copy" />
                  </div>
                </div>

                {/* Error */}
                {validationError && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center">
                    <AlertCircle className="w-5 h-5 text-red-600 mr-3 flex-shrink-0" />
                    <p className="text-red-800">{validationError}</p>
                  </div>
                )}

                {/* Sticky footer buttons */}
                <div className="fixed inset-x-0 bottom-0 bg-white/90 backdrop-blur-md border-t border-gray-200 p-4 z-20">
                  <div className="max-w-6xl mx-auto flex flex-col sm:flex-row gap-4">
                    {isReviewing ? (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            setIsReviewing(false);
                            setCurrentStep(1);
                          }}
                          className="flex items-center justify-center px-8 py-4 border-2 border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-300"
                        >
                          <ArrowLeft className="w-5 h-5 mr-2" />
                          Edit Information
                        </button>
                        <button
                          type="submit"
                          disabled={loading}
                          className="flex items-center justify-center px-10 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex-1 shadow-lg hover:shadow-xl"
                        >
                          {loading ? (
                            <>
                              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                              Processing Application...
                            </>
                          ) : (
                            <>
                              <CreditCard className="w-5 h-5 mr-2" />
                              Submit & Pay $29.99
                            </>
                          )}
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => setShowInfo(true)}
                          className="flex items-center px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors"
                        >
                          <ArrowLeft className="w-4 h-4 mr-2" />
                          Back to Info
                        </button>
                        <button
                          type="submit"
                          className="flex items-center justify-center px-10 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl ml-auto"
                        >
                          Review Application
                          <ArrowRight className="w-5 h-5 ml-2" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default InternationalDrivingLicense
