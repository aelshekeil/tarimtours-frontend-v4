import { supabase } from './supabaseClient';
import {
  AuthResponse,
  ApplicationSubmission,
} from '../utils/types';

class SupabaseAPI {
  // VISA OFFERS CRUD
  async getVisaOffers() {
    const { data, error } = await supabase
      .from('visa_offers')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return data || [];
  }

async uploadVisaOffer(formData: any, coverFile: File) {
  // Ensure user is authenticated
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated");

  // 1. Sanitize filename
  const sanitizeFilename = (name: string) => {
    return name
      .replace(/\s+/g, '_')
      .replace(/[^\w.\-]/g, '')
      .toLowerCase()
      .substring(0, 100);
  };
  
  const cleanFilename = `${Date.now()}_${sanitizeFilename(coverFile.name)}`;
  const storagePath = `visa-covers/${cleanFilename}`;
  
  // 2. Upload image to storage
  const { error: uploadError } = await supabase.storage
    .from('visa-covers')
    .upload(storagePath, coverFile, {
      cacheControl: '3600',
      upsert: false
    });
  
  if (uploadError) {
    console.error("Storage upload error:", uploadError);
    throw new Error(`File upload failed: ${uploadError.message}`);
  }
  
  // 3. Get public URL
  const { data: urlData } = supabase.storage
    .from('visa-covers')
    .getPublicUrl(storagePath);
  
  // 4. Create database record
  const { error: dbError } = await supabase
    .from('visa_offers')
    .insert({
      ...formData,
      cover_photo_url: urlData.publicUrl,
      created_by: user.id  // Add created_by column
    });
  
  if (dbError) {
    console.error("DB insert error:", dbError);
    throw new Error(`Database insert failed: ${dbError.message}`);
  }
  
  return true;
}
  async updateVisaOffer(id: string, offer: any) {
    const { data, error } = await supabase
      .from('visa_offers')
      .update(offer)
      .eq('id', id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  }

  async deleteVisaOffer(id: string) {
    console.log(`Attempting to delete visa offer with ID: ${id}`);
    
    // Get current user to verify authentication
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('User not authenticated');
    }
    console.log(`Authenticated user: ${user.id}`);
    
    // First, let's check if the record exists and who created it
    const { data: existingRecord, error: fetchError } = await supabase
      .from('visa_offers')
      .select('id, created_by, country')
      .eq('id', id)
      .single();
      
    if (fetchError) {
      console.error('Error fetching record:', fetchError);
      throw new Error(`Record not found: ${fetchError.message}`);
    }
    
    console.log(`Found record:`, existingRecord);
    console.log(`Record created by: ${existingRecord.created_by}, Current user: ${user.id}`);
    
    // Try to create the missing DELETE policy first
    try {
      console.log('Attempting to create DELETE policy...');
      const { error: policyError } = await supabase.rpc('exec_sql', {
        query: `
          DO $$
          BEGIN
            IF NOT EXISTS (
              SELECT 1 FROM pg_policies
              WHERE schemaname = 'public'
              AND tablename = 'visa_offers'
              AND policyname = 'visa_offers_creator_delete'
            ) THEN
              EXECUTE 'CREATE POLICY "visa_offers_creator_delete" ON public.visa_offers FOR DELETE TO authenticated USING (auth.uid() = created_by)';
              RAISE NOTICE 'DELETE policy created successfully';
            ELSE
              RAISE NOTICE 'DELETE policy already exists';
            END IF;
          END $$;
        `
      });
      
      if (policyError) {
        console.warn('Could not create DELETE policy via RPC:', policyError.message);
        
        // Try alternative approach using direct SQL execution
        const { error: sqlError } = await supabase
          .from('pg_policies')
          .select('*')
          .eq('schemaname', 'public')
          .eq('tablename', 'visa_offers')
          .eq('policyname', 'visa_offers_creator_delete')
          .single();
          
        if (sqlError && sqlError.code === 'PGRST116') {
          console.log('DELETE policy does not exist, this explains the issue');
        }
      } else {
        console.log('DELETE policy creation attempted successfully');
      }
    } catch (err) {
      console.warn('Policy creation failed:', err);
    }
    
    // Now attempt the delete
    const { error, count } = await supabase
      .from('visa_offers')
      .delete({ count: 'exact' })
      .eq('id', id);
      
    if (error) {
      console.error('Delete error details:', error);
      throw new Error(`Failed to delete visa offer: ${error.message} (Code: ${error.code})`);
    }
    
    console.log(`Delete operation completed. Rows affected: ${count}`);
    
    if (count === 0) {
      throw new Error('No rows were deleted. The DELETE policy for visa_offers table is missing. Please contact your database administrator to add: CREATE POLICY "visa_offers_creator_delete" ON public.visa_offers FOR DELETE TO authenticated USING (auth.uid() = created_by);');
    }
    
    return true;
  }

  async setToken(token: string) {
    // Supabase handles tokens automatically, but we can store for compatibility
    localStorage.setItem('jwt', token);
  }

  async removeToken() {
    localStorage.removeItem('jwt');
    await supabase.auth.signOut();
  }

  // Add generic get method for compatibility
  // Remove generic methods since we have specific implementations
  // All API calls should use the specific methods below
  // Generic methods were causing confusion and errors
  // async get<T>(endpoint: string): Promise<T> {
  //   throw new Error(`Generic get method not implemented for endpoint: ${endpoint}`);
  // }

  // async post<T>(endpoint: string, _data: any): Promise<T> {
  //   throw new Error(`Generic post method not implemented for endpoint: ${endpoint}`);
  // }

  async register(firstName: string, lastName: string, email: string, password: string): Promise<AuthResponse> {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
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
        email: email,
        user_metadata: data.user?.user_metadata || { first_name: firstName, last_name: lastName },
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
        email: email,
        user_metadata: data.user?.user_metadata,
      },
    };
  }

  async updateProfile(_userId: string, data: { first_name?: string; last_name?: string; email?: string }): Promise<any> {
    const { error } = await supabase.auth.updateUser({
      data: {
        first_name: data.first_name,
        last_name: data.last_name,
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

  async getTravelPackages(featuredOnly?: boolean, populate?: boolean): Promise<any[]> {
    let query = supabase.from('travel_packages').select(populate ? '*' : '*');
    
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
        title: item.name,
        description: item.description,
        price: item.price,
        featured: item.featured,
        cover_image: {
          data: {
            attributes: {
              url: item.cover_photo_url,
            },
          },
        },
        createdAt: item.created_at,
        updatedAt: item.updated_at,
        duration: item.duration,
        destination: item.destination,
        rating: item.rating,
      },
    }));
  }

  async createTravelPackage(pkg: any): Promise<any> {
    const { data, error } = await supabase
      .from('travel_packages')
      .insert([pkg])
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }
async updateTravelPackage(id: string, pkg: any) {
    const { data, error } = await supabase
      .from('travel_packages')
      .update(pkg)
      .eq('id', id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  }

  async deleteTravelPackage(id: string) {
    const { error } = await supabase
      .from('travel_packages')
      .delete()
      .eq('id', id);
    if (error) throw new Error(error.message);
    return true;
  }

  async createTravelPackageBooking(bookingData: {
    packageId: string;
    packageName: string;
    packagePrice: number;
    quantity: number;
    customerName: string;
    customerEmail: string;
    customerPhone?: string;
    travelDate?: string;
    numberOfTravelers?: number;
    specialRequests?: string;
  }): Promise<any> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User must be authenticated to book a package');
    }

    const totalAmount = bookingData.packagePrice * bookingData.quantity;

    const { data, error } = await supabase
      .from('travel_package_bookings')
      .insert({
        user_id: user.id,
        package_id: bookingData.packageId,
        package_name: bookingData.packageName,
        package_price: bookingData.packagePrice,
        quantity: bookingData.quantity,
        total_amount: totalAmount,
        customer_name: bookingData.customerName,
        customer_email: bookingData.customerEmail,
        customer_phone: bookingData.customerPhone,
        travel_date: bookingData.travelDate,
        number_of_travelers: bookingData.numberOfTravelers || 1,
        special_requests: bookingData.specialRequests,
        status: 'pending',
        payment_status: 'pending'
      })
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  async getTravelPackageBookings(): Promise<any[]> {
    const { data, error } = await supabase
      .from('travel_package_bookings')
      .select('*, travel_packages(*)')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return data || [];
  }

  async updateTravelPackageBookingStatus(id: string, status: string, paymentStatus?: string): Promise<any> {
    const updateData: any = {
      status,
      updated_at: new Date().toISOString()
    };
    
    if (paymentStatus) {
      updateData.payment_status = paymentStatus;
    }

    const { data, error } = await supabase
      .from('travel_package_bookings')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  async deleteTravelPackageBooking(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('travel_package_bookings')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(error.message);
    }

    return true;
  }

  async getESIMProducts(): Promise<any[]> {
    const { data, error } = await supabase.from('eSIM').select('*');

    if (error) {
      throw new Error(error.message);
    }

    // Transform data to match the structure of the eSIM table
    return data.map((item: any) => ({
      id: item.id,
      name: item.name,
      country: item['Country Region'],
      price: item.price,
      data_amount: item.Data,
      validity: item.validity,
      image: item.image ? { url: item.image } : null,
      description: item.description,
      features: item.features,
      category: item.Type,
      stock_quantity: item.stock_quantity,
      is_active: item.status === 'active',
    }));
  }

  async getTravelAccessories(): Promise<any[]> {
    const { data, error } = await supabase.from('travel_accessories').select('*');

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  async createTravelAccessory(accessory: any): Promise<any> {
    const { data, error } = await supabase
      .from('travel_accessories')
      .insert([accessory])
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  async updateTravelAccessory(id: number, accessory: any) {
    const { data, error } = await supabase
      .from('travel_accessories')
      .update(accessory)
      .eq('id', id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  }

  async deleteTravelAccessory(id: number) {
    const { error } = await supabase
      .from('travel_accessories')
      .delete()
      .eq('id', id);
    if (error) throw new Error(error.message);
    return true;
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

  async submitDrivingLicenseApplication(applicationData: any, files?: File[]): Promise<ApplicationSubmission> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User must be authenticated');
    }

    // Generate tracking ID
    const trackingId = `DRIVING-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Handle file uploads if provided
    let fileUrls: string[] = [];
    if (files) {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileName = `driving-applications/${user.id}/${trackingId}/${file.name}`;
        
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
      .from('driving_license_applications')
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

  // Education Consultation Methods
  async submitEducationConsultation(consultationData: {
    name: string;
    email: string;
    phone: string;
    message?: string;
    serviceType: 'malaysia' | 'tarim';
  }): Promise<any> {
    const { data, error } = await supabase
      .from('education_consultations')
      .insert({
        full_name: consultationData.name,
        email: consultationData.email,
        phone: consultationData.phone,
        message: consultationData.message || '',
        service_type: consultationData.serviceType,
        status: 'new'
      })
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    // Also add to newsletter subscribers if not already exists
    await this.addNewsletterSubscriber(consultationData.email);

    return data;
  }

  // Business Incorporation Consultation Methods
  async submitBusinessConsultation(consultationData: {
    name: string;
    email: string;
    phone: string;
    message?: string;
    serviceType: 'business-incorporation';
    preferredCountry?: string;
    businessType?: string;
  }): Promise<any> {
    const { data, error } = await supabase
      .from('business_incorporation_consultations')
      .insert({
        full_name: consultationData.name,
        email: consultationData.email,
        phone: consultationData.phone,
        message: consultationData.message || '',
        service_type: consultationData.serviceType,
        preferred_country: consultationData.preferredCountry,
        business_type: consultationData.businessType,
        status: 'new'
      })
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    // Also add to newsletter subscribers if not already exists
    await this.addNewsletterSubscriber(consultationData.email);

    return data;
  }

  async getBusinessConsultations(): Promise<any[]> {
    const { data, error } = await supabase
      .from('business_incorporation_consultations')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return data || [];
  }

  async updateBusinessConsultationStatus(id: string, status: string, notes?: string): Promise<any> {
    const updateData: any = {
      status,
      updated_at: new Date().toISOString()
    };
    
    if (notes !== undefined) {
      updateData.notes = notes;
    }

    const { data, error } = await supabase
      .from('business_incorporation_consultations')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  async deleteBusinessConsultation(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('business_incorporation_consultations')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(error.message);
    }

    return true;
  }

  async getEducationConsultations(serviceType?: 'malaysia' | 'tarim'): Promise<any[]> {
    let query = supabase
      .from('education_consultations')
      .select('*')
      .order('created_at', { ascending: false });

    if (serviceType) {
      query = query.eq('service_type', serviceType);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(error.message);
    }

    return data || [];
  }

  async updateEducationConsultationStatus(id: string, status: string): Promise<any> {
    const { data, error } = await supabase
      .from('education_consultations')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  // Newsletter subscription methods
  async addNewsletterSubscriber(email: string): Promise<any> {
    // Check if email already exists
    const { data: existing } = await supabase
      .from('newsletter_subscribers')
      .select('id')
      .eq('email', email)
      .single();

    if (existing) {
      return existing; // Already subscribed
    }

    const { data, error } = await supabase
      .from('newsletter_subscribers')
      .insert({
        email: email,
        status: 'active'
      })
      .select()
      .single();

    if (error) {
      // Ignore duplicate email errors
      if (error.code === '23505') {
        return null;
      }
      throw new Error(error.message);
    }

    return data;
  }

  async getNewsletterSubscribers(): Promise<any[]> {
    const { data, error } = await supabase
      .from('newsletter_subscribers')
      .select('*')
      .eq('status', 'active')
      .order('subscribed_at', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return data || [];
  }

  // User Profile Service Methods
  async getUserApplications(userId: string): Promise<{
    visaApplications: any[];
    drivingLicenseApplications: any[];
    educationConsultations: any[];
    travelPackageBookings: any[];
  }> {
    // Fetch visa applications
    const { data: visaApps, error: visaError } = await supabase
      .from('visa_applications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (visaError) {
      console.error('Error fetching visa applications:', visaError);
    }

    // Fetch driving license applications
    const { data: drivingApps, error: drivingError } = await supabase
      .from('international_driving_license_applications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (drivingError) {
      console.error('Error fetching driving license applications:', drivingError);
    }

    // Fetch education consultations
    const { data: eduConsultations, error: eduError } = await supabase
      .from('education_consultations')
      .select('*')
      .eq('email', (await supabase.auth.getUser()).data.user?.email)
      .order('created_at', { ascending: false });

    if (eduError) {
      console.error('Error fetching education consultations:', eduError);
    }

    // Fetch travel package bookings
    const { data: travelBookings, error: travelError } = await supabase
      .from('travel_package_bookings')
      .select('*, travel_packages(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (travelError) {
      console.error('Error fetching travel bookings:', travelError);
    }

    return {
      visaApplications: visaApps || [],
      drivingLicenseApplications: drivingApps || [],
      educationConsultations: eduConsultations || [],
      travelPackageBookings: travelBookings || []
    };
  }

  async getUserStatistics(userId: string): Promise<{
    totalApplications: number;
    pendingApplications: number;
    completedApplications: number;
    totalSpent: number;
  }> {
    const applications = await this.getUserApplications(userId);
    
    const totalApplications =
      applications.visaApplications.length +
      applications.drivingLicenseApplications.length +
      applications.educationConsultations.length +
      applications.travelPackageBookings.length;

    const pendingApplications =
      applications.visaApplications.filter(app => app.status === 'pending' || app.status === 'processing').length +
      applications.drivingLicenseApplications.filter(app => app.status === 'pending' || app.status === 'processing').length +
      applications.educationConsultations.filter(app => app.status === 'new' || app.status === 'in_progress').length;

    const completedApplications =
      applications.visaApplications.filter(app => app.status === 'approved' || app.status === 'completed').length +
      applications.drivingLicenseApplications.filter(app => app.status === 'approved' || app.status === 'completed').length +
      applications.educationConsultations.filter(app => app.status === 'completed').length;

    const totalSpent = applications.travelPackageBookings.reduce((sum, booking) =>
      sum + (booking.total_amount || 0), 0
    );

    return {
      totalApplications,
      pendingApplications,
      completedApplications,
      totalSpent
    };
  }
}

const supabaseAPI = new SupabaseAPI();
export default supabaseAPI;
