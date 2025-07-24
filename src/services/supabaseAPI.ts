import { supabase } from './supabaseClient';
import {
  AuthResponse,
  ApplicationSubmission,
} from '../utils/types';

class SupabaseAPI {
  async setToken(token: string) {
    // Supabase handles tokens automatically, but we can store for compatibility
    localStorage.setItem('jwt', token);
  }

  async removeToken() {
    localStorage.removeItem('jwt');
    await supabase.auth.signOut();
  }

  // Add generic get method for compatibility
  async get<T>(endpoint: string): Promise<T> {
    // This is a simplified implementation for compatibility
    // In a real scenario, you'd map endpoints to appropriate Supabase calls
    throw new Error(`Generic get method not implemented for endpoint: ${endpoint}`);
  }

  // Add generic post method for compatibility
  async post<T>(endpoint: string, _data: any): Promise<T> {
    // This is a simplified implementation for compatibility
    // In a real scenario, you'd map endpoints to appropriate Supabase calls
    throw new Error(`Generic post method not implemented for endpoint: ${endpoint}`);
  }

  async register(username: string, email: string, password: string): Promise<AuthResponse> {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
        },
      },
    });

    if (error) {
      throw new Error(error.message);
    }

    // Format response to match Strapi structure
    return {
      jwt: data.session?.access_token || '',
      user: {
        id: data.user?.id || '',
        username: username,
        email: email,
      },
    };
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password,
    });

    if (error) {
      throw new Error(error.message);
    }

    // Format response to match Strapi structure
    return {
      jwt: data.session?.access_token || '',
      user: {
        id: data.user?.id || '',
        username: data.user?.user_metadata?.username || '',
        email: data.user?.email || '',
      },
    };
  }

  async updateProfile(_userId: string, data: { username?: string; email?: string }): Promise<any> {
    const { error } = await supabase.auth.updateUser({
      email: data.email,
      data: {
        username: data.username,
      },
    });

    if (error) {
      throw new Error(error.message);
    }

    return { success: true };
  }

  async changePassword(data: { currentPassword?: string; password?: string; passwordConfirmation?: string }): Promise<any> {
    if (!data.password) {
      throw new Error('New password is required');
    }

    const { error } = await supabase.auth.updateUser({
      password: data.password,
    });

    if (error) {
      throw new Error(error.message);
    }

    return { success: true };
  }

  async getTravelPackages(featuredOnly?: boolean): Promise<any[]> {
    let query = supabase.from('travel_packages').select('*');
    
    if (featuredOnly) {
      query = query.eq('featured', true);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(error.message);
    }

    // Transform data to match Strapi structure
    return data.map((item: any) => ({
      id: item.id,
      attributes: {
        title: item.title,
        description: item.description,
        price: item.price,
        featured: item.featured,
        cover_image: {
          data: {
            attributes: {
              url: item.cover_image_url,
            },
          },
        },
        createdAt: item.created_at,
        updatedAt: item.updated_at,
      },
    }));
  }

  async getESIMProducts(): Promise<any[]> {
    const { data, error } = await supabase.from('esim_products').select('*');

    if (error) {
      throw new Error(error.message);
    }

    // Transform data to match Strapi structure
    return data.map((item: any) => ({
      id: item.id,
      attributes: {
        name: item.name,
        description: item.description,
        price: item.price,
        image: {
          data: {
            attributes: {
              url: item.image_url,
            },
          },
        },
        createdAt: item.created_at,
        updatedAt: item.updated_at,
      },
    }));
  }

  async getTravelAccessories(): Promise<any[]> {
    const { data, error } = await supabase.from('travel_accessories').select('*');

    if (error) {
      throw new Error(error.message);
    }

    // Transform data to match Strapi structure
    return data.map((item: any) => ({
      id: item.id,
      attributes: {
        name: item.name,
        description: item.description,
        price: item.price,
        images: {
          data: item.images_urls?.map((url: string, index: number) => ({
            id: index,
            attributes: {
              url,
            },
          })) || [],
        },
        createdAt: item.created_at,
        updatedAt: item.updated_at,
      },
    }));
  }

  async submitVisaApplication(applicationData: any, files?: FileList): Promise<ApplicationSubmission> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User must be authenticated');
    }

    // Generate tracking ID
    const trackingId = `VISA-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Handle file uploads if provided
    let fileUrls: string[] = [];
    if (files) {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileName = `visa-applications/${user.id}/${trackingId}/${file.name}`;
        
        const { error: uploadError } = await supabase.storage
          .from('applications')
          .upload(fileName, file);

        if (uploadError) {
          throw new Error(`Failed to upload file: ${uploadError.message}`);
        }

        const { data: { publicUrl } } = supabase.storage
          .from('applications')
          .getPublicUrl(fileName);

        fileUrls.push(publicUrl);
      }
    }

    const { data, error } = await supabase
      .from('visa_applications')
      .insert({
        full_name: applicationData.fullName,
        email: applicationData.email,
        payment_status: applicationData.paymentStatus || 'pending',
        tracking_id: trackingId,
        application_data: applicationData,
        files_urls: fileUrls,
        user_id: user.id,
      })
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    // Transform to match Strapi structure
    return {
      id: data.id,
      attributes: {
        fullName: data.full_name,
        email: data.email,
        paymentStatus: data.payment_status,
        trackingId: data.tracking_id,
        applicationData: data.application_data,
        filesUrls: data.files_urls,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      },
    };
  }

  async submitInternationalDrivingLicenseApplication(
    applicationData: { fullName: string; email: string; paymentStatus: 'pending' | 'completed' | 'failed' },
    files: { licenseFront: File; passportPage: File; personalPhoto: File }
  ): Promise<ApplicationSubmission> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User must be authenticated');
    }

    // Generate tracking ID
    const trackingId = `IDL-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Upload files
    const uploadFile = async (file: File, type: string): Promise<string> => {
      const fileName = `idl-applications/${user.id}/${trackingId}/${type}-${file.name}`;
      
      const { error: uploadError } = await supabase.storage
        .from('applications')
        .upload(fileName, file);

      if (uploadError) {
        throw new Error(`Failed to upload ${type}: ${uploadError.message}`);
      }

      const { data: { publicUrl } } = supabase.storage
        .from('applications')
        .getPublicUrl(fileName);

      return publicUrl;
    };

    const licenseFrontUrl = await uploadFile(files.licenseFront, 'license-front');
    const passportPageUrl = await uploadFile(files.passportPage, 'passport-page');
    const personalPhotoUrl = await uploadFile(files.personalPhoto, 'personal-photo');

    const { data, error } = await supabase
      .from('international_driving_license_applications')
      .insert({
        full_name: applicationData.fullName,
        email: applicationData.email,
        payment_status: applicationData.paymentStatus,
        tracking_id: trackingId,
        license_front_url: licenseFrontUrl,
        passport_page_url: passportPageUrl,
        personal_photo_url: personalPhotoUrl,
        type: 'international-driving-license',
        user_id: user.id,
      })
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    // Transform to match Strapi structure
    return {
      id: data.id,
      attributes: {
        fullName: data.full_name,
        email: data.email,
        paymentStatus: data.payment_status,
        trackingId: data.tracking_id,
        licenseFrontUrl: data.license_front_url,
        passportPageUrl: data.passport_page_url,
        personalPhotoUrl: data.personal_photo_url,
        type: data.type,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      },
    };
  }

  async trackApplication(type: string, trackingId: string): Promise<ApplicationSubmission | null> {
    const tableName = type === 'visa' ? 'visa_applications' : 'international_driving_license_applications';
    
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .eq('tracking_id', trackingId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // No data found
      }
      throw new Error(error.message);
    }

    // Transform to match Strapi structure
    return {
      id: data.id,
      attributes: {
        fullName: data.full_name,
        email: data.email,
        paymentStatus: data.payment_status,
        trackingId: data.tracking_id,
        ...(type === 'visa' ? {
          applicationData: data.application_data,
          filesUrls: data.files_urls,
        } : {
          licenseFrontUrl: data.license_front_url,
          passportPageUrl: data.passport_page_url,
          personalPhotoUrl: data.personal_photo_url,
          type: data.type,
        }),
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      },
    };
  }

  async uploadFile(file: File): Promise<{ id: number; url: string }> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User must be authenticated');
    }

    const fileName = `uploads/${user.id}/${Date.now()}-${file.name}`;
    
    const { error } = await supabase.storage
      .from('uploads')
      .upload(fileName, file);

    if (error) {
      throw new Error(`Failed to upload file: ${error.message}`);
    }

    const { data: { publicUrl } } = supabase.storage
      .from('uploads')
      .getPublicUrl(fileName);

    return {
      id: Date.now(), // Generate a simple ID
      url: publicUrl,
    };
  }
}

const supabaseAPI = new SupabaseAPI();
export default supabaseAPI;
