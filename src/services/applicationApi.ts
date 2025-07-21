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

  // Interface for the response from submitDrivingLicenseApplication
  interface SubmitDrivingLicenseResponse {
      trackingNumber?: string;
      error?: string;
    }

  // Generate a tracking ID before inserting into the database
  const trackingId = Math.random().toString(36).substring(2, 4).toUpperCase() + Math.floor(1000 + Math.random() * 9000).toString();

  try {
    // Prepare the request body including the generated tracking_id
    const requestBody = {
      fullName,
      email,
      phone,
      dateOfBirth,
      nationality,
      address,
      tracking_id: trackingId, // Include tracking_id in the request body
    };

    console.log('Request body:', requestBody);

    // Helper function to upload files to Supabase storage
    const uploadFile = async (file: File, path: string) => {
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('applications') // Assuming 'applications' is the bucket name
        .upload(`${trackingId}/${path}`, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        console.error('Error uploading file:', uploadError);
        // Consider rolling back the insert if file upload fails
        throw uploadError;
      }
      // Construct the public URL for the uploaded file
      // Example: "https://your-project-ref.supabase.co/storage/v1/object/public/applications/trackingId/idCopy"
      return `${API_URL}/storage/v1/object/public/${uploadData.path}`;
    };

    // Upload files concurrently
    const [idCopyUrl, photoUrl, oldLicenseCopyUrl] = await Promise.all([
      uploadFile(idCopy, 'idCopy'),
      uploadFile(photo, 'photo'),
      uploadFile(oldLicenseCopy, 'oldLicenseCopy'),
    ]);

    // Send the form data, including the file URLs and tracking_id, to the Supabase database
    const response = await api.post('/international_driving_license_applications', {
      fullName,
      email,
      phone,
      dateOfBirth,
      nationality,
      address,
      tracking_id: trackingId, // Ensure tracking_id is sent in the POST request
      idCopyUrl: idCopyUrl,
      photoUrl: photoUrl,
      oldLicenseCopyUrl: oldLicenseCopyUrl,
    });

    // Extract trackingNumber from the response (assuming the backend returns it)
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
