import { useState, useEffect } from 'react';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import AuthModal from './components/common/AuthModal';
import RouterComponent from './pages/Router';
import { DrivingLicenseService } from './components/DrivingLicenseServices.tsx';
import { CartProvider } from './components/common/CartProvider';

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
          />
        )}
      </div>
    </CartProvider>
  );
}

export default App;
