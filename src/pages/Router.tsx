import { FC, Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

// Define props for RouterComponent
interface RouterComponentProps {
  // Removed handleVisaServiceSelection: (service: any) => void;
  handleDrivingLicenseServiceSelection?: (service: any) => void;
}

// Import components
const Hero = lazy(() => import('./Hero'));
const Services = lazy(() => import('./Services'));
const TravelPackages = lazy(() => import('./TravelPackages'));
const ApplicationTracking = lazy(() => import('./ApplicationTracking'));
const Shop = lazy(() => import('./Shop'));
const AuthGuard = lazy(() => import('./AuthGuard'));
const Profile = lazy(() => import('./Profile'));

// New components we'll create
const EnhancedESIMShop = lazy(() => import('./EnhancedESIMShop'));
const TravelAccessories = lazy(() => import('./Travelaccessories'));
const EnhancedTravelPackages = lazy(() => import('./EnhancedTravelPackages'));
const VisaServices = lazy(() => import('./VisaServices'));
import ErrorBoundary from '../components/common/ErrorBoundary';
/* Removed VisaServiceSelection and DrivingLicenseServices lazy imports */
const DrivingLicenseServiceSelection = lazy(() => import('../components/DrivingLicenseServiceSelection').then(module => ({ default: module.DrivingLicenseServiceSelection })));
const BusinessIncorporation = lazy(() => import('./BusinessIncorporation'));
const Checkout = lazy(() => import('./Checkout'));
const VisaApplicationForm = lazy(() => import('./VisaApplicationForm'));
const InternationalDrivingLicense = lazy(() => import('./InternationalDrivingLicense'));
const AdminDashboard = lazy(() => import('./AdminDashboard'));

const Home: FC = () => {
  const { t } = useTranslation();

  return (
    <>
      <Suspense fallback={<div>Loading...</div>}>
        <Hero />
        <Services />
        <TravelPackages />
      </Suspense>
      <section id="contact" className="py-20 bg-white">
        <div className="container-custom">
          <h2 className="section-title">{t('common.contact_us')}</h2>
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-lg text-gray-600 mb-8">
              {t('contact_section.description')}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <h3 className="text-xl font-semibold mb-2">{t('contact_section.email_title')}</h3>
                <p className="text-gray-600">info@tarimtours.com</p>
              </div>
              <div className="text-center">
                <h3 className="text-xl font-semibold mb-2">{t('contact_section.phone_title')}</h3>
                <p className="text-gray-600">+1 (555) 123-4567</p>
              </div>
              <div className="text-center">
                <h3 className="text-xl font-semibold mb-2">{t('contact_section.office_hours_title')}</h3>
                <p className="text-gray-600">{t('contact_section.office_hours_time')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

const RouterComponent: FC<RouterComponentProps> = ({
  // Removed handleVisaServiceSelection,
  handleDrivingLicenseServiceSelection
}) => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/services" element={
        <Suspense fallback={<div>Loading...</div>}>
          <Services />
        </Suspense>
      } />
      <Route path="/travel-packages" element={
        <Suspense fallback={<div>Loading...</div>}>
          <TravelPackages />
        </Suspense>
      } />
      <Route path="/enhanced-travel-packages" element={
        <ErrorBoundary>
          <Suspense fallback={<div>Loading...</div>}>
            <EnhancedTravelPackages />
          </Suspense>
        </ErrorBoundary>
      } />
      <Route path="/esim-shop" element={
        <Suspense fallback={<div>Loading...</div>}>
          <EnhancedESIMShop />
        </Suspense>
      } />
      <Route path="/travel-accessories" element={
        <Suspense fallback={<div>Loading...</div>}>
          <TravelAccessories />
        </Suspense>
      } />
      <Route path="/visa-services" element={
        <Suspense fallback={<div>Loading...</div>}>
          <VisaServices />
        </Suspense>
      } />
     {/* Removed /driving-license-services route as component does not exist */}
      <Route path="/driving-license-service-selection" element={
        <Suspense fallback={<div>Loading...</div>}>
          <DrivingLicenseServiceSelection onSelectService={handleDrivingLicenseServiceSelection || (() => {})} />
        </Suspense>
      } />
      <Route path="/international-driving-license" element={
        <Suspense fallback={<div>Loading...</div>}>
          <InternationalDrivingLicense />
        </Suspense>
      } />
      <Route path="/business-incorporation" element={
        <Suspense fallback={<div>Loading...</div>}>
          <BusinessIncorporation />
        </Suspense>
      } />
      <Route path="/application-tracking" element={
        <Suspense fallback={<div>Loading...</div>}>
          <ApplicationTracking />
        </Suspense>
      } />
      <Route path="/shop" element={
        <Suspense fallback={<div>Loading...</div>}>
          <Shop />
        </Suspense>
      } />
      <Route path="/checkout" element={
        <Suspense fallback={<div>Loading...</div>}>
          <Checkout />
        </Suspense>
      } />
      <Route path="/visa-application-form" element={
        <Suspense fallback={<div>Loading...</div>}>
          <VisaApplicationForm />
        </Suspense>
      } />
      <Route path="/profile" element={
        <AuthGuard>
          <Suspense fallback={<div>Loading...</div>}>
            <Profile />
          </Suspense>
        </AuthGuard>
      } />
      <Route path="/admin" element={
        <Suspense fallback={<div>Loading...</div>}>
          <AdminDashboard />
        </Suspense>
      } />
    </Routes>
  );
};

export default RouterComponent;
