import axios from 'axios';
import { createClient } from '@supabase/supabase-js';

const API_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Create Supabase client with dynamic auth token
const supabase = createClient(API_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

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
  dateOfBirth: string;
  address: string;
  passportCopy: File;
  photo: File;
  invitationLetter?: File;
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
  data: DrivingLicenseApplicationData,
  trackingId: string
) => {
  const { idCopy, photo, oldLicenseCopy, fullName, email, phone, dateOfBirth, nationality, address } = data;

  
  try {
    // Prepare the request body including the provided tracking_id
    const requestBody = {
      fullName,
      email,
      phone,
      dateOfBirth,
      nationality,
      address,
      tracking_id: trackingId, // Use the provided tracking_id
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
      return `${API_URL}/storage/v1/object/public/applications/${uploadData.path}`;
    };

    // Upload files concurrently
    const [idCopyUrl, photoUrl, oldLicenseCopyUrl] = await Promise.all([
      uploadFile(idCopy, 'idCopy'),
      uploadFile(photo, 'photo'),
      uploadFile(oldLicenseCopy, 'oldLicenseCopy'),
    ]);

    // Get current user ID from Supabase auth
    const { data: { user } } = await supabase.auth.getUser();
    
    // Send the form data, including the file URLs and tracking_id, to the Supabase database
    const response = await api.post('/international_driving_license_applications', {
      full_name: fullName,
      email,
      phone,
      dateOfBirth,
      nationality,
      address,
      tracking_id: trackingId,
      license_front_url: idCopyUrl,
      personal_photo_url: photoUrl,
      passport_page_url: oldLicenseCopyUrl,
      user_id: user?.id
    });

    // Log the backend response for debugging
    console.log('Backend response:', response.data);

    // Extract the tracking number from the backend response (supporting both trackingNumber and tracking_id)
    let trackingNumber = response.data.trackingNumber || response.data.tracking_id;
    // If backend does not return a tracking number, use the one provided
    if (!trackingNumber) {
      trackingNumber = trackingId;
    }
    return { trackingNumber };
  } catch (error: any) {
    console.error(error);
    throw new Error(error.message || 'Failed to submit application. Please try again.');
  }
};

export const submitVisaApplication = async (data: VisaApplicationData, trackingId: string) => {
  const { passportCopy, photo, additionalDocuments, ...otherData } = data;

  const uploadFile = async (file: File, path: string) => {
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('applications')
      .upload(`${trackingId}/${path}`, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      console.error('Error uploading file:', uploadError);
      throw uploadError;
    }
    return `${API_URL}/storage/v1/object/public/applications/${uploadData.path}`;
  };

  const [passportCopyUrl, photoUrl] = await Promise.all([
    uploadFile(passportCopy, 'passportCopy'),
    uploadFile(photo, 'photo'),
  ]);

  let additionalDocumentsUrls: string[] = [];
  if (additionalDocuments && additionalDocuments.length > 0) {
    additionalDocumentsUrls = await Promise.all(
      additionalDocuments.map((file, index) =>
        uploadFile(file, `additionalDocument_${index}`)
      )
    );
  }

  const { fullName, email, phone, passportNumber, nationality, destinationCountry, visaType, travelDate, dateOfBirth, address } = otherData;

  const applicationData = {
    phone,
    passportNumber,
    nationality,
    destinationCountry,
    visaType,
    travelDate,
    dateOfBirth,
    address,
  };

  const { data: { user } } = await supabase.auth.getUser();

  const response = await api.post('/visa_applications', {
    full_name: fullName,
    email: email,
    tracking_id: trackingId,
    application_data: applicationData,
    files_urls: [passportCopyUrl, photoUrl, ...additionalDocumentsUrls].filter(Boolean),
    user_id: user?.id,
  });

  return response.data;
};

export const trackApplication = async (trackingNumber: string) => {
  // Supabase requires filters to be formatted as column=operator.value
  // For string values, it's often column=eq.value
  // The correct endpoint is likely 'international_driving_license_applications'
  const response = await api.get(`/international_driving_license_applications?tracking_id=eq.${trackingNumber}`);
  return response.data;
};
