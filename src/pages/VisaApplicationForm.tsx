import React, { FC, useState, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';
import { VisaApplicationData, submitVisaApplication } from '../services/applicationApi';
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
  FileText,
  Briefcase,
  Plane
} from 'lucide-react';

const REQUIRED_FIELDS: (keyof Omit<VisaApplicationData, 'passportCopy' | 'photo' | 'invitationLetter' | 'additionalDocuments' | 'visaType' | 'travelDate'>)[] =
  ['fullName', 'email', 'phone', 'dateOfBirth', 'nationality', 'address', 'passportNumber', 'destinationCountry'];

countries.registerLocale(enLocale);
countries.registerLocale(arLocale);

const generateTrackingId = () =>
  Math.random().toString(36).substring(2, 8).toUpperCase();

const VisaApplicationForm: FC = () => {
  const { t, i18n } = useTranslation();
  const [currentStep, setCurrentStep] = useState(1);
  const [isReviewing, setIsReviewing] = useState(false);
  const [showInfo, setShowInfo] = useState(true);
  const [formData, setFormData] = useState<Partial<VisaApplicationData & { nationality: string, destinationCountry: string }>>({ address: '', visaType: 'tourist' });
  const [files, setFiles] = useState<{ passportCopy?: File; photo?: File; invitationLetter?: File }>({});
  const [loading, setLoading] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [trackingId, setTrackingId] = useState('');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<any>(null);
  const { isLoggedIn, user } = useAuth();

  useEffect(() => {
    const storedService = localStorage.getItem('selectedVisaService');
    if (storedService) {
      const serviceData = JSON.parse(storedService);
      let icon;
      switch (serviceData.id) {
        case 'tourist-visa':
          icon = <Plane className="w-8 h-8" />;
          break;
        case 'business-visa':
          icon = <Briefcase className="w-8 h-8" />;
          break;
        case 'student-visa':
          icon = <User className="w-8 h-8" />;
          break;
        case 'work-visa':
          icon = <FileText className="w-8 h-8" />;
          break;
        default:
          icon = <Plane className="w-8 h-8" />;
      }
      setSelectedService({ ...serviceData, icon });
      setShowInfo(false);
    }
  }, []);

  const handleFileChange = useCallback(
    (file: File, field: keyof typeof files) => setFiles((prev) => ({ ...prev, [field]: file })),
    []
  );

  const handleChange = useCallback(
    (
      e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement> | E164Number | string,
      name?: keyof VisaApplicationData | 'nationality' | 'destinationCountry'
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
    if (!files.passportCopy || !files.photo) {
      setValidationError(t('common.upload_required_documents'));
      return;
    }
    if (!user?.id) {
      setValidationError(t('common.login_required_text'));
      return;
    }

    setLoading(true);
    const applicationData: VisaApplicationData = {
      fullName: formData.fullName!,
      email: formData.email!,
      phone: formData.phone!,
      dateOfBirth: new Date(formData.dateOfBirth!).toISOString(),
      nationality: formData.nationality!,
      address: formData.address!,
      passportNumber: formData.passportNumber!,
      destinationCountry: formData.destinationCountry!,
      visaType: formData.visaType!,
      travelDate: new Date().toISOString(), // Placeholder for now
      passportCopy: files.passportCopy!,
      photo: files.photo!,
      invitationLetter: files.invitationLetter,
    };

    const generatedTrackingId = generateTrackingId();

    try {
      const res: any = await submitVisaApplication(applicationData, generatedTrackingId);
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
      if (!files.passportCopy || !files.photo) {
        setValidationError(t('common.upload_required_documents'));
        return;
      }
      setValidationError(null);
      setIsReviewing(true);
      setCurrentStep(2);
    },
    [formData, files, t]
  );



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
                Application Submitted!
              </h2>
              <p className="text-gray-600 text-lg mb-8 max-w-md mx-auto">
                Your visa application is now being processed. We will keep you updated on its status.
              </p>
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 mb-8 border border-blue-100">
                <p className="text-blue-800 font-semibold text-lg">
                  Tracking Number:{' '}
                  <span className="font-mono">{trackingId}</span>
                </p>
              </div>
              <div className="flex items-center justify-center space-x-4 text-gray-600">
                <Truck className="w-6 h-6 text-blue-600" />
                <span className="font-medium">You will be notified via email.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 text-white py-16">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10 max-w-6xl mx-auto px-4 text-center">
          <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-6">
            <FileText className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">Visa Application Form</h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto opacity-90">
             Complete your visa application with our secure and easy-to-use form.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12">
        {!showInfo && (
          <>
            {selectedService && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl shadow-lg border border-blue-200 p-6 mb-8">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="text-blue-600 mr-4">{selectedService.icon}</div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-800">{selectedService.country}</h3>
                      <p className="text-gray-600">{selectedService.visa_type}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-blue-600">${selectedService.price}</div>
                    <p className="text-gray-600">{selectedService.duration}</p>
                  </div>
                </div>
              </div>
            )}

            {!isLoggedIn ? (
              <>
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-12 text-center">
                  <AlertCircle className="w-20 h-20 text-orange-500 mx-auto mb-6" />
                  <h3 className="text-3xl font-bold text-gray-800 mb-4">Login Required</h3>
                  <p className="text-gray-600 mb-8 text-lg">Please log in to continue with your application.</p>
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
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-100">
                  <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                    <User className="w-6 h-6 text-blue-600 mr-3" />
                    Personal Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <input name="fullName" placeholder="Full Name" onChange={handleChange} required disabled={isReviewing} className="w-full px-4 py-3 border border-gray-300 rounded-xl" />
                    <input name="email" type="email" placeholder="Email" onChange={handleChange} required disabled={isReviewing} className="w-full px-4 py-3 border border-gray-300 rounded-xl" />
                    <PhoneInput name="phone" placeholder="Phone Number" onChange={(value) => handleChange(value || '', 'phone')} required disabled={isReviewing} className="w-full px-4 py-3 border border-gray-300 rounded-xl" />
                    <input name="dateOfBirth" type="date" onChange={handleChange} required disabled={isReviewing} className="w-full px-4 py-3 border border-gray-300 rounded-xl" />
                    <select name="nationality" onChange={handleChange} required disabled={isReviewing} className="w-full px-4 py-3 border border-gray-300 rounded-xl">
                      <option value="">Select Nationality</option>
                      {Object.entries(countries.getNames(i18n.language === 'ar' ? 'ar' : 'en')).map(([code, name]) => (
                        <option key={code} value={name}>{name}</option>
                      ))}
                    </select>
                    <input name="passportNumber" placeholder="Passport Number" onChange={handleChange} required disabled={isReviewing} className="w-full px-4 py-3 border border-gray-300 rounded-xl" />
                    <select name="destinationCountry" onChange={handleChange} required disabled={isReviewing} className="w-full px-4 py-3 border border-gray-300 rounded-xl">
                      <option value="">Select Destination Country</option>
                      {Object.entries(countries.getNames(i18n.language === 'ar' ? 'ar' : 'en')).map(([code, name]) => (
                        <option key={code} value={name}>{name}</option>
                      ))}
                    </select>
                    <input name="address" placeholder="Address" onChange={handleChange} required disabled={isReviewing} className="w-full px-4 py-3 border border-gray-300 rounded-xl" />
                  </div>
                </div>

                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border border-green-100">
                  <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                    <Camera className="w-6 h-6 text-green-600 mr-3" />
                    Required Documents
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Dropzone onFileChange={(file: File) => handleFileChange(file, 'passportCopy')} label="Passport Copy" />
                    <Dropzone onFileChange={(file: File) => handleFileChange(file, 'photo')} label="Personal Photo" />
                    <Dropzone onFileChange={(file: File) => handleFileChange(file, 'invitationLetter')} label="Invitation Letter (Optional)" />
                  </div>
                </div>

                {validationError && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center">
                    <AlertCircle className="w-5 h-5 text-red-600 mr-3" />
                    <p className="text-red-800">{validationError}</p>
                  </div>
                )}

                <div className="fixed inset-x-0 bottom-0 bg-white/90 backdrop-blur-md border-t border-gray-200 p-4 z-20">
                  <div className="max-w-6xl mx-auto flex items-center justify-between">
                    {isReviewing ? (
                      <>
                        <button type="button" onClick={() => { setIsReviewing(false); setCurrentStep(1); }} className="px-8 py-4 border-2 border-gray-300 rounded-xl font-semibold">Back to Edit</button>
                        <button type="submit" disabled={loading} className="px-10 py-4 bg-blue-600 text-white rounded-xl font-semibold">
                          {loading ? 'Processing...' : `Submit & Pay $${selectedService?.price}`}
                        </button>
                      </>
                    ) : (
                      <button type="submit" className="px-10 py-4 bg-blue-600 text-white rounded-xl font-semibold ml-auto">Review Application</button>
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

export default VisaApplicationForm;
