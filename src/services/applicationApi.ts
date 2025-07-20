import axios, { AxiosResponse } from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { createClient } from '@supabase/supabase-js';

const API_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(API_URL, SUPABASE_ANON_KEY);

export interface DrivingLicenseApplicationData {
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  nationality: string;
  address: string;
  idCopy: File;
  photo: File;
  oldLicenseCopy: File;
  id_copy_url?: string;
  photo_url?: string;
  old_license_copy_url?: string;
}

export interface VisaApplicationData {
  fullName: string;
  email: string;
  phone: string;
  passportNumber: string;
  nationality: string;
  destinationCountry: string;
  visaType: string;
  travelDate: string;
  passportCopy: File;
  photo: File;
  additionalDocuments?: File[];
}

const api = axios.create({
  baseURL: `${API_URL}/rest/v1`,
});

api.interceptors.request.use((config) => {
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  if (anonKey) {
    config.headers.apikey = anonKey;
    config.headers.Authorization = `Bearer ${anonKey}`;
  }
  const user = localStorage.getItem('user');
  if (user) {
    const { jwt } = JSON.parse(user);
    if (jwt) {
      config.headers.Authorization = `Bearer ${jwt}`;
    }
  }
  return config;
});

export const submitDrivingLicenseApplication = async (
  data: DrivingLicenseApplicationData
) => {
  const { idCopy, photo, oldLicenseCopy, fullName, email, phone, dateOfBirth, nationality, address } = data;

  // In a real Supabase implementation, you would handle file uploads separately
  // and then store the URLs in the database.
  // This is a simplified example assuming the API handles it.

interface SubmitDrivingLicenseResponse {
    trackingNumber?: string;
    error?: string;
  }

const trackingId = Math.random().toString(36).substring(2, 4).toUpperCase() + Math.floor(1000 + Math.random() * 9000).toString();

  try {
    const requestBody = {
      fullName,
      email,
      phone,
      dateOfBirth,
      nationality,
      address,
      tracking_id: trackingId,
    };

    console.log('Request body:', requestBody);
    const uploadFile = async (file: File, path: string) => {
      const { data, error } = await supabase.storage
        .from('applications')
        .upload(`${trackingId}/${path}`, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) {
        console.error('Error uploading file:', error);
        throw error;
      }

      return `${API_URL}/storage/v1/object/public/${data.path}`;
    };

    const idCopyUrl = await uploadFile(idCopy, 'idCopy');
    const photoUrl = await uploadFile(photo, 'photo');
    const oldLicenseCopyUrl = await uploadFile(oldLicenseCopy, 'oldLicenseCopy');

    // 2. Send the form data, including the file URLs, to the Supabase database
    const response = await api.post('/international_driving_license_applications', {
      fullName,
      email,
      phone,
      dateOfBirth,
      nationality,
      address,
      tracking_id: trackingId,
      idCopyUrl: idCopyUrl,
      photoUrl: photoUrl,
      oldLicenseCopyUrl: oldLicenseCopyUrl,
    });

    const result: SubmitDrivingLicenseResponse = {
      trackingNumber: response.data.trackingNumber,
      error: response.data.error,
    };
    return result;
  } catch (error: any) {
    console.error(error);
    throw new Error(error.message || 'Failed to submit application. Please try again.');
  }
};

export const submitVisaApplication = async (data: VisaApplicationData) => {
  const { passportCopy, photo, additionalDocuments, ...otherData } = data;

  // In a real Supabase implementation, you would handle file uploads separately
  // and then store the URLs in the database.
  // This is a simplified example assuming the API handles it.

  const response = await api.post('/visa-applications', otherData);
  return response.data;
};

export const trackApplication = async (trackingNumber: string) => {
  const response = await api.get(`/track?trackingNumber=${trackingNumber}`);
  return response.data;
};
