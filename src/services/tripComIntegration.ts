import { supabase } from './supabaseClient';

// Trip.com API types
export interface TripComBookingRequest {
  destination: string;
  checkInDate: string;
  checkOutDate: string;
  guests: number;
  rooms: number;
  packageId?: string;
}

export interface TripComBookingResponse {
  bookingId: string;
  status: 'pending' | 'confirmed' | 'failed';
  totalPrice: number;
  currency: string;
  confirmationCode?: string;
  hotelDetails?: {
    name: string;
    address: string;
    rating: number;
  };
}

export interface TripComSearchRequest {
  destination: string;
  checkInDate: string;
  checkOutDate: string;
  guests: number;
  rooms: number;
  priceRange?: {
    min: number;
    max: number;
  };
}

export interface TripComHotel {
  id: string;
  name: string;
  address: string;
  rating: number;
  price: number;
  currency: string;
  images: string[];
  amenities: string[];
  availability: boolean;
}

class TripComIntegrationService {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    // These would typically come from environment variables
    this.apiKey = import.meta.env.VITE_TRIPCOM_API_KEY || '';
    this.baseUrl = import.meta.env.VITE_TRIPCOM_API_URL || 'https://api.trip.com/v1';
  }

  async searchHotels(searchRequest: TripComSearchRequest): Promise<TripComHotel[]> {
    try {
      // Mock implementation - replace with actual Trip.com API call
      const mockHotels: TripComHotel[] = [
        {
          id: 'hotel_1',
          name: 'Luxury Desert Resort',
          address: 'Shibam, Hadramout, Yemen',
          rating: 4.5,
          price: 150,
          currency: 'USD',
          images: [
            'https://images.unsplash.com/photo-1566073771259-6a8506099945',
            'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b'
          ],
          amenities: ['WiFi', 'Pool', 'Restaurant', 'Spa'],
          availability: true,
        },
        {
          id: 'hotel_2',
          name: 'Traditional Yemeni Guesthouse',
          address: 'Sanaa Old City, Yemen',
          rating: 4.2,
          price: 80,
          currency: 'USD',
          images: [
            'https://images.unsplash.com/photo-1571896349842-33c89424de2d',
            'https://images.unsplash.com/photo-1578662996442-48f60103fc96'
          ],
          amenities: ['WiFi', 'Traditional Breakfast', 'Cultural Tours'],
          availability: true,
        },
      ];

      // Log search request to Supabase for analytics
      await this.logSearchRequest(searchRequest);

      return mockHotels;
    } catch (error) {
      console.error('Error searching hotels:', error);
      throw error;
    }
  }

  async createBooking(bookingRequest: TripComBookingRequest): Promise<TripComBookingResponse> {
    try {
      // Mock implementation - replace with actual Trip.com API call
      const mockBookingResponse: TripComBookingResponse = {
        bookingId: `TRIP_${Date.now()}`,
        status: 'pending',
        totalPrice: 300,
        currency: 'USD',
        confirmationCode: `TC${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
        hotelDetails: {
          name: 'Luxury Desert Resort',
          address: 'Shibam, Hadramout, Yemen',
          rating: 4.5,
        },
      };

      // Store booking in Supabase
      await this.storeBooking(bookingRequest, mockBookingResponse);

      return mockBookingResponse;
    } catch (error) {
      console.error('Error creating booking:', error);
      throw error;
    }
  }

  async getBookingStatus(bookingId: string): Promise<TripComBookingResponse> {
    try {
      // First check our local database
      const { data, error } = await supabase
        .from('trip_com_bookings')
        .select('*')
        .eq('booking_id', bookingId)
        .single();

      if (error) {
        throw new Error(`Booking not found: ${error.message}`);
      }

      // Mock status update - in real implementation, you'd call Trip.com API
      return {
        bookingId: data.booking_id,
        status: data.status,
        totalPrice: data.total_price,
        currency: data.currency,
        confirmationCode: data.confirmation_code,
        hotelDetails: data.hotel_details,
      };
    } catch (error) {
      console.error('Error getting booking status:', error);
      throw error;
    }
  }

  async cancelBooking(bookingId: string): Promise<{ success: boolean; message: string }> {
    try {
      // Update booking status in our database
      const { error } = await supabase
        .from('trip_com_bookings')
        .update({ status: 'cancelled', updated_at: new Date().toISOString() })
        .eq('booking_id', bookingId);

      if (error) {
        throw new Error(`Failed to cancel booking: ${error.message}`);
      }

      // In real implementation, you'd also call Trip.com API to cancel

      return {
        success: true,
        message: 'Booking cancelled successfully',
      };
    } catch (error) {
      console.error('Error cancelling booking:', error);
      throw error;
    }
  }

  private async logSearchRequest(searchRequest: TripComSearchRequest): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      await supabase.from('trip_com_search_logs').insert({
        user_id: user?.id || null,
        destination: searchRequest.destination,
        check_in_date: searchRequest.checkInDate,
        check_out_date: searchRequest.checkOutDate,
        guests: searchRequest.guests,
        rooms: searchRequest.rooms,
        price_range: searchRequest.priceRange,
        created_at: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error logging search request:', error);
      // Don't throw error here as it's not critical
    }
  }

  private async storeBooking(
    bookingRequest: TripComBookingRequest,
    bookingResponse: TripComBookingResponse
  ): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      await supabase.from('trip_com_bookings').insert({
        booking_id: bookingResponse.bookingId,
        user_id: user?.id || null,
        destination: bookingRequest.destination,
        check_in_date: bookingRequest.checkInDate,
        check_out_date: bookingRequest.checkOutDate,
        guests: bookingRequest.guests,
        rooms: bookingRequest.rooms,
        package_id: bookingRequest.packageId,
        status: bookingResponse.status,
        total_price: bookingResponse.totalPrice,
        currency: bookingResponse.currency,
        confirmation_code: bookingResponse.confirmationCode,
        hotel_details: bookingResponse.hotelDetails,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error storing booking:', error);
      throw error;
    }
  }

  // Real-time booking updates using Supabase subscriptions
  subscribeToBookingUpdates(
    bookingId: string,
    callback: (booking: any) => void
  ): () => void {
    const subscription = supabase
      .channel(`booking_${bookingId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'trip_com_bookings',
          filter: `booking_id=eq.${bookingId}`,
        },
        callback
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }
}

export default new TripComIntegrationService();

