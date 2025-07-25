import { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import VisaServices, { VisaService } from '../components/VisaServices';

const VisaServicesPage: FC = () => {
  const navigate = useNavigate();

  const handleServiceSelect = (service: VisaService) => {
    // Store selected service in localStorage and go directly to the application form
    localStorage.setItem('selectedVisaService', JSON.stringify(service));
    navigate('/visa-application-form');
  };

  return (
    <VisaServices onServiceSelect={handleServiceSelect} />
  );
};

export default VisaServicesPage;
