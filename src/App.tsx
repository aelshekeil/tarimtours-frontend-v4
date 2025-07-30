import { useState, useEffect } from 'react';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import AuthModal from './components/common/AuthModal';
import RouterComponent from './pages/Router';
import { DrivingLicenseService } from './components/DrivingLicenseServices.tsx';
import { CartProvider } from './components/common/CartProvider';
import { AnalyticsProvider } from './components/AnalyticsProvider';

function App() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  // Removed unused handleVisaServiceSelection function

  const handleDrivingLicenseServiceSelection = (_service: DrivingLicenseService) => {
    // Handle driving license service selection if needed
    console.log('Driving license service selected:', _service);
  };

  return (
    <AnalyticsProvider>
      <CartProvider>
        <div className="min-h-screen bg-gray-50">
          <Header
            user={user}
            onAuthClick={() => setShowAuthModal(true)}
            onLogout={handleLogout}
          />
          
          <main className="pt-16 lg:pt-20">
            <RouterComponent
              handleDrivingLicenseServiceSelection={handleDrivingLicenseServiceSelection}
            />
          </main>

          <Footer />

          {showAuthModal && (
            <AuthModal
              isOpen={showAuthModal}
              onClose={() => setShowAuthModal(false)}
              onLoginSuccess={(user) => {
                setUser(user);
                setShowAuthModal(false);
              }}
            />
          )}
        </div>
      </CartProvider>
    </AnalyticsProvider>
  );
}

export default App;
