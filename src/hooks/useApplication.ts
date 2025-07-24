import { useState } from 'react';
import { submitDrivingLicenseApplication, submitVisaApplication, trackApplication, DrivingLicenseApplicationData, VisaApplicationData } from '../services/applicationApi';
import axios from 'axios';

export const useApplication = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [trackingNumber, setTrackingNumber] = useState<string | null>(null);
  const [applicationStatus, setApplicationStatus] = useState<any | null>(null);

  const submitDrivingLicense = async (data: DrivingLicenseApplicationData, trackingId: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await submitDrivingLicenseApplication(data, trackingId);
      setTrackingNumber(response.trackingNumber);
    } catch (err) {
      setError('Failed to submit application. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const submitVisa = async (data: VisaApplicationData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await submitVisaApplication(data);
      setTrackingNumber(response.trackingNumber);
    } catch (err) {
      setError('Failed to submit application. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const track = async (trackingId: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await trackApplication(trackingId);
      if (response && response.length > 0) {
        setApplicationStatus(response[0]); // Set to the first item in the array
      } else {
        // Handle case where no application is found or response is empty
        setApplicationStatus(null); // Or some other indicator
        setError('Application not found. Please check the tracking number.');
      }
    } catch (err) {
      setError('Failed to track application. Please check the tracking number and try again.');
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    trackingNumber,
    applicationStatus,
    submitDrivingLicense,
    submitVisa,
    track,
  };
};
