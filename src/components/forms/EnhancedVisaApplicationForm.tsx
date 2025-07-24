// src/components/forms/EnhancedVisaApplicationForm.tsx
import { FC, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';
import { VisaApplicationData, submitVisaApplication } from '../services/applicationApi';
import Dropzone from '../components/forms/Dropzone';
import ProgressBar from '../components/common/ProgressBar';
import AlertCircle from 'lucide-react/dist/esm/icons/alert-circle';
import FileText from 'lucide-react/dist/esm/icons/file-text';
import CheckCircle from 'lucide-react/dist/esm/icons/check-circle';
import Copy from 'lucide-react/dist/esm/icons/clipboard-copy';
import ArrowLeft from 'lucide-react/dist/esm/icons/arrow-left';
import countries from 'i18n-iso-countries';
import enLocale from 'i18n-iso-countries/langs/en.json';
import arLocale from 'i18n-iso-countries/langs/ar.json';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';

countries.registerLocale(enLocale);
countries.registerLocale(arLocale);

const VisaApplicationForm: FC = () => {
  const { t, i18n } = useTranslation();
  const [currentStep, setCurrentStep] = useState(1);
  const [isReviewing, setIsReviewing] = useState(false);
  const [formData, setFormData] = useState<Partial<VisaApplicationData>>({});
  const [files, setFiles] = useState<{ passportCopy?: File; photo?: File; additionalDocuments?: File[] }>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [trackingNumber, setTrackingNumber] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const { isLoggedIn, user } = useAuth();

  const handleFileChange = useCallback((file: File, field: keyof typeof files) => {
    setFiles((prev) => ({ ...prev, [field]: file }));
  }, []);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement> | string, name?: string) => {
      if (name === 'phone' && typeof e === 'string') {
        setFormData((prev) => ({ ...prev, phone: e }));
      } else if (typeof e === 'object' && 'target' in e) {
        const { name: targetName, value } = e.target;
        setFormData((prev) => ({ ...prev, [targetName]: value }));
      }
    },
    []
  );

  const scrollTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    const requiredFields: (keyof Omit<VisaApplicationData, 'passportCopy' | 'photo' | 'additionalDocuments'>)[] = [
      'fullName', 'email', 'phone', 'passportNumber', 'nationality', 'destinationCountry', 'visaType', 'travelDate',
    ];
    const missing = requiredFields.filter((f) => !formData[f]);
    if (missing.length) {
      setValidationError(`${t('common.fill_required_fields')}: ${missing.join(', ')}`);
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

    const payload: VisaApplicationData = {
      ...formData,
      passportCopy: files.passportCopy!,
      photo: files.photo!,
      ...(files.additionalDocuments && { additionalDocuments: files.additionalDocuments }),
    } as VisaApplicationData;

    setLoading(true);
    setError(null);
    try {
      const { data } = await submitVisaApplication(payload);
      setTrackingNumber(data.trackingNumber);
      setCurrentStep(4);
      scrollTop();
    } catch (err: any) {
      setError(err.message || t('common.submission_failed'));
    } finally {
      setLoading(false);
    }
  };

  const handleReview = (e: React.FormEvent) => {
    e.preventDefault();
    const required = ['fullName', 'email', 'phone', 'passportNumber', 'nationality', 'destinationCountry', 'visaType', 'travelDate'];
    const missing = required.filter((f) => !formData[f as keyof typeof formData]);
    if (missing.length) {
      setValidationError(`${t('common.fill_required_fields')}: ${missing.join(', ')}`);
      return;
    }
    if (!files.passportCopy || !files.photo) {
      setValidationError(t('common.upload_required_documents'));
      return;
    }
    setValidationError(null);
    setIsReviewing(true);
    setCurrentStep(2);
    scrollTop();
  };

  const steps = [
    t('visa_application.steps.upload'),
    t('visa_application.steps.review'),
    t('visa_application.steps.payment'),
    t('visa_application.steps.delivery'),
  ];

  /* ---------- SUCCESS SCREEN ---------- */
  if (trackingNumber) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center px-4"
      >
        <div className="bg-white/70 backdrop-blur-lg rounded-3xl shadow-2xl p-10 max-w-md w-full border border-white/50">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <CheckCircle className="w-10 h-10 text-green-600" />
          </motion.div>
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">{t('common.submission_successful')}</h2>
          <p className="text-center text-gray-600 mb-6">{t('visa_application.track_description')}</p>

          <div className="relative bg-blue-50/70 backdrop-blur-sm border border-blue-200 rounded-2xl p-4 mb-6">
            <p className="text-sm text-blue-800 font-medium mb-1">{t('common.tracking_number_is')}</p>
            <p className="text-xl font-bold text-blue-700 select-all">{trackingNumber}</p>
            <button
              onClick={() => {
                navigator.clipboard.writeText(trackingNumber);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
              className="absolute top-2 right-2 p-2 rounded-full hover:bg-blue-200 transition"
              aria-label="Copy"
            >
              <Copy className="w-4 h-4 text-blue-600" />
            </button>
            <AnimatePresence>
              {copied && (
                <motion.span
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="absolute -top-6 right-2 text-xs bg-blue-600 text-white px-2 py-1 rounded"
                >
                  {t('common.copied')}
                </motion.span>
              )}
            </AnimatePresence>
          </div>

          <button
            onClick={() => (window.location.href = '/dashboard')}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
          >
            {t('common.back_to_dashboard')}
          </button>
        </div>
      </motion.div>
    );
  }

  /* ---------- LOGIN GUARD ---------- */
  if (!isLoggedIn) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center p-12 bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-2xl mt-8"
      >
        <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="w-10 h-10 text-yellow-600" />
        </div>
        <h3 className="text-2xl font-bold text-yellow-800 mb-4">{t('common.login_required_title')}</h3>
        <p className="text-yellow-700 text-lg">{t('common.login_required_text')}</p>
      </motion.div>
    );
  }

  /* ---------- FORM ---------- */
  return (
    <>
      <ProgressBar currentStep={currentStep} steps={steps} />
      <motion.form
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onSubmit={isReviewing ? handleSubmit : handleReview}
        className="space-y-10 max-w-5xl mx-auto"
      >
        {/* Personal Info */}
        <motion.section
          layout
          className="bg-white/60 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-6 shadow-lg"
        >
          <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-3">
            <FileText className="w-6 h-6 text-blue-600" />
            {t('common.personal_information')}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* inputs unchanged – only styling */}
            {[
              { name: 'fullName', placeholder: t('common.full_name'), type: 'text' },
              { name: 'email', placeholder: t('common.email'), type: 'email' },
              { name: 'passportNumber', placeholder: t('visa_application.passport_number'), type: 'text' },
              { name: 'destinationCountry', placeholder: t('visa_application.destination_country'), type: 'text' },
            ].map(({ name, placeholder, type }) => (
              <div key={name}>
                <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">{placeholder}</label>
                <input
                  name={name}
                  type={type}
                  placeholder={placeholder}
                  onChange={handleChange}
                  disabled={isReviewing}
                  className="w-full px-4 py-3 bg-white/70 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 border border-gray-300/50 transition"
                />
              </div>
            ))}

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
              <PhoneInput
                name="phone"
                value={formData.phone}
                onChange={(v) => handleChange(v || '', 'phone')}
                disabled={isReviewing}
                defaultCountry="US"
                international
                className="w-full px-4 py-3 bg-white/70 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 border border-gray-300/50 transition"
              />
            </div>

            {/* Nationality */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nationality</label>
              <select
                name="nationality"
                value={formData.nationality || ''}
                onChange={handleChange}
                disabled={isReviewing}
                className="w-full px-4 py-3 bg-white/70 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 border border-gray-300/50 transition"
              >
                <option value="">{t('common.select_nationality')}</option>
                {Object.entries(countries.getNames(i18n.language === 'ar' ? 'ar' : 'en')).map(([code, name]) => (
                  <option key={code} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </div>

            {/* Visa Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Visa Type</label>
              <select
                name="visaType"
                onChange={handleChange}
                disabled={isReviewing}
                className="w-full px-4 py-3 bg-white/70 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 border border-gray-300/50 transition"
              >
                <option value="">{t('visa_application.select_visa_type')}</option>
                <option value="tourist">{t('visa_application.tourist_visa')}</option>
                <option value="business">{t('visa_application.business_visa')}</option>
                <option value="student">{t('visa_application.student_visa')}</option>
              </select>
            </div>

            {/* Travel Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Travel Date</label>
              <input
                name="travelDate"
                type="date"
                onChange={handleChange}
                disabled={isReviewing}
                className="w-full px-4 py-3 bg-white/70 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 border border-gray-300/50 transition"
              />
            </div>
          </div>
        </motion.section>

        {/* Documents */}
        <motion.section
          layout
          className="bg-white/60 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-6 shadow-lg"
        >
          <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-3">
            <FileText className="w-6 h-6 text-green-600" />
            {t('visa_application.required_documents')}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Dropzone onFileChange={(f) => handleFileChange(f, 'passportCopy')} label={t('visa_application.passport_copy')} />
            <Dropzone onFileChange={(f) => handleFileChange(f, 'photo')} label={t('visa_application.photo')} />
            <Dropzone onFileChange={(f) => handleFileChange(f, 'additionalDocuments')} label={t('common.additional_documents')} />
          </div>
        </motion.section>

        {/* Errors */}
        <AnimatePresence>
          {(validationError || error) && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="p-4 bg-red-50/70 backdrop-blur-sm border border-red-200 rounded-2xl flex items-center gap-3"
            >
              <AlertCircle className="w-5 h-5 text-red-600" />
              <p className="text-red-700 font-medium">{validationError || error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {isReviewing ? (
            <>
              <button
                type="button"
                onClick={() => {
                  setIsReviewing(false);
                  setCurrentStep(1);
                  scrollTop();
                }}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition"
              >
                <ArrowLeft className="w-4 h-4" />
                {t('common.edit')}
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center justify-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    {t('common.submitting')}
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    {t('common.submit_application')}
                  </>
                )}
              </button>
            </>
          ) : (
            <button
              type="submit"
              className="px-10 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              {t('common.review_application')}
            </button>
          )}
        </div>
      </motion.form>
    </>
  );
};

export default VisaApplicationForm;