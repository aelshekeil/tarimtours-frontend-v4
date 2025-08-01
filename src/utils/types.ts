// API configuration and types
export const API_URL = import.meta.env.VITE_SUPABASE_URL;

// Strapi response types
export interface StrapiResponse<T> {
  data: T[];
  meta?: {
    pagination?: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

export interface StrapiEntity<T> {
  id: number;
  attributes: T;
}

export interface StrapiUserAttributes {
  id: string | number; // Support both string (Supabase) and number (Strapi) IDs
  email: string;
  confirmed?: boolean;
  blocked?: boolean;
  createdAt?: string;
  updatedAt?: string;
  created_at?: string; // Supabase format
  updated_at?: string; // Supabase format
  user_metadata?: {
    first_name?: string;
    last_name?: string;
    username?: string; // Added to resolve authService type errors
    [key: string]: any; // Allow other metadata fields
  };
}

export type StrapiUser = StrapiEntity<StrapiUserAttributes>;

export interface AuthResponse {
  jwt: string;
  user: StrapiUserAttributes; // Note: Strapi's auth/local returns user attributes directly, not an entity
}

// Define the structure for the image object returned by Strapi
export interface StrapiImage {
  id: number;
  documentId: string;
  name: string;
  alternativeText: string | null;
  caption: string | null;
  width: number;
  height: number;
  formats: any; // You can define this more strictly if needed
  hash: string;
  ext: string;
  mime: string;
  size: number;
  url: string;
  previewUrl: string | null;
  provider: string;
  provider_metadata: any | null;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

// Define image formats as seen in TravelPackages.tsx
export interface ImageFormat {
  url: string;
}

export interface CoverImage {
  url: string;
  formats?: {
    thumbnail?: ImageFormat;
    small?: ImageFormat;
    medium?: ImageFormat;
  };
}

// Content type interfaces (defining only attributes)
export interface TravelPackage {
  id: number;
  documentId: string;
  title: string;
  description: string;
  destination: string;
  price: number;
  duration: string;
  rating?: number;
  featured?: boolean;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  cover_image?: StrapiImage | null;
}

export interface VisaServiceAttributes {
  country: string;
  type: string;
  price: number;
  processing_time: string;
  requirements: string;
}

export type VisaService = StrapiEntity<VisaServiceAttributes>;

export interface ESIMProduct {
  id: number;
  name: string;
  country: string;
  region?: string;
  data_amount: string;
  validity: string;
  price: number;
  currency: string;
  provider: string;
  is_active: boolean;
  category: string;
  description: string;
  features?: any;
  stock_quantity: number;
  image: StrapiImage | null;
}

export interface EsimProductDetails {
  country: string;
  data_amount: string;
  validity: string;
}

export interface TravelAccessoryProductDetails {
  brand?: string;
  category?: string;
  requires_shipping?: boolean;
  weight?: string;
  dimensions?: string;
}

export type ProductDetails = EsimProductDetails | TravelAccessoryProductDetails;

export interface TravelAccessory {
  id: number;
  documentId: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  category: string;
  brand?: string;
  weight?: string;
  dimensions?: string;
  material?: string;
  color_options?: any;
  features?: any;
  is_active: boolean;
  stock_quantity: number;
  requires_shipping: boolean;
  shipping_weight?: number;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  images?: { url: string }[];
}

export interface InternationalDrivingLicenseApplicationAttributes {
  fullName: string;
  email: string;
  licenseFront: { data: StrapiImage | null } | null;
  passportPage: { data: StrapiImage | null } | null;
  personalPhoto: { data: StrapiImage | null } | null;
  paymentStatus: 'pending' | 'completed' | 'failed';
}

export type InternationalDrivingLicenseApplication = StrapiEntity<InternationalDrivingLicenseApplicationAttributes>;

export interface ApplicationSubmissionAttributes {
  type?: string;
  status?: string;
  tracking_id?: string;
  trackingId?: string; // Alternative naming
  data?: any;
  created_at?: string;
  updated_at?: string;
  createdAt?: string; // Alternative naming
  updatedAt?: string; // Alternative naming
  full_name?: string;
  fullName?: string; // Alternative naming
  nationality?: string;
  email?: string;
  paymentStatus?: 'pending' | 'completed' | 'failed';
  payment_status?: 'pending' | 'completed' | 'failed'; // Alternative naming
  applicationData?: any;
  application_data?: any; // Alternative naming
  filesUrls?: string[];
  files_urls?: string[]; // Alternative naming
  licenseFrontUrl?: string;
  license_front_url?: string; // Alternative naming
  passportPageUrl?: string;
  passport_page_url?: string; // Alternative naming
  personalPhotoUrl?: string;
  personal_photo_url?: string; // Alternative naming
}

export type ApplicationSubmission = StrapiEntity<ApplicationSubmissionAttributes>;

// For ApplicationTracking component
export interface TrackingResult {
  type: string;
  status: string;
  tracking_id: string;
  data: any;
  created_at: string;
  updated_at: string;
  full_name: string; 
  nationality: string; 
}

// Alternative ESIMProduct interface (if you need a different structure)
export interface ESIMProductSimple {
  id: string;
  country: string;
  data_amount: string;
  validity: number;
  price: number;
  // ... other properties
}

export interface CartItem {
  id: string;
  product_type: 'esim' | 'accessory' | 'travel-accessory' | 'travel-package';
  product_id?: number;
  name: string;
  quantity: number;
  price: number;
  product_details?: ProductDetails;
  image_url?: string;
  image?: string;
  description?: string;
}

export interface VisaOffer {
  id: string;
  country: string;
  visa_type: string;
  duration: string;
  price: number;
  requirements: string;
  cover_photo_url?: string;
}
