import { supabase } from './supabaseClient';
import { analyticsConfig } from '../config/analytics.config';

export interface AnalyticsData {
  userId?: string;
  sessionId?: string;
  pagePath: string;
  pageTitle?: string;
  referrer?: string;
  userAgent?: string;
  ipAddress?: string;
  location?: {
    country: string;
    city: string;
    region?: string;
    lat?: number;
    lng?: number;
  };
  deviceInfo?: {
    type: string;
    os: string;
    browser: string;
  };
}

export interface EventData {
  userId?: string;
  sessionId?: string;
  eventType: string;
  eventName: string;
  eventData?: any;
  pagePath?: string;
}

export interface FunnelStage {
  userId?: string;
  sessionId?: string;
  funnelName: string;
  stage: string;
  stageOrder: number;
  metadata?: any;
}

class AnalyticsAPIService {
  private sessionId: string;
  private lastActivityTimer: NodeJS.Timeout | null = null;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.startSessionTracking();
  }

  private generateSessionId(): string {
    // Generate a proper UUID v4 for session_id
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  private startSessionTracking() {
    if (!analyticsConfig.enabled) return;
    
    // Update session duration every 30 seconds
    this.lastActivityTimer = setInterval(() => {
      this.updateSessionDuration();
    }, analyticsConfig.sessionUpdateInterval);

    // Clean up on page unload
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => {
        if (this.lastActivityTimer) {
          clearInterval(this.lastActivityTimer);
        }
        this.updateSessionDuration();
      });
    }
  }

  private async updateSessionDuration() {
    if (!analyticsConfig.enabled) return;
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // First get current session duration
        const { data: currentSession } = await supabase
          .from('user_analytics')
          .select('session_duration')
          .eq('session_id', this.sessionId)
          .eq('user_id', user.id)
          .single();

        const newDuration = (currentSession?.session_duration || 0) + 30;

        await supabase
          .from('user_analytics')
          .update({ 
            last_activity: new Date().toISOString(),
            session_duration: newDuration
          })
          .eq('session_id', this.sessionId)
          .eq('user_id', user.id);
      }
    } catch (error) {
      console.error('Error updating session duration:', error);
    }
  }

  // Track page view
  async trackPageView(data: AnalyticsData): Promise<void> {
    if (!analyticsConfig.enabled) {
      if (analyticsConfig.debug) {
        console.log('[Analytics] Page view tracking disabled:', data.pagePath);
      }
      return;
    }
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Get user location from IP (you might want to use a geolocation service)
      const location = await this.getUserLocation();
      
      const analyticsData = {
        user_id: user?.id || null,
        session_id: this.sessionId,
        page_path: data.pagePath,
        page_title: data.pageTitle || document.title,
        referrer: data.referrer || document.referrer,
        user_agent: data.userAgent || navigator.userAgent,
        ip_address: data.ipAddress || null,
        location: location || data.location || null,
        device_info: this.getDeviceInfo(),
        last_activity: new Date().toISOString()
      };

      console.log('[Analytics] Tracking page view:', analyticsData);

      const { error } = await supabase
        .from('user_analytics')
        .insert(analyticsData);

      if (error) {
        console.error('[Analytics] Error inserting page view:', error);
        throw error;
      }

      console.log('[Analytics] Page view tracked successfully');

      // Log the page view
      await this.logEvent('info', `Page view: ${data.pagePath}`, {
        page_path: data.pagePath,
        user_id: user?.id
      });
    } catch (error) {
      console.error('Error tracking page view:', error);
    }
  }

  // Track user event
  async trackEvent(event: EventData): Promise<void> {
    if (!analyticsConfig.enabled) {
      if (analyticsConfig.debug) {
        console.log('[Analytics] Event tracking disabled:', event.eventName);
      }
      return;
    }
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const eventData = {
        user_id: user?.id || null,
        session_id: this.sessionId,
        event_type: event.eventType,
        event_name: event.eventName,
        event_data: event.eventData || {},
        page_path: event.pagePath || window.location.pathname,
        timestamp: new Date().toISOString()
      };

      const { error } = await supabase
        .from('user_events')
        .insert(eventData);

      if (error) throw error;
    } catch (error) {
      console.error('Error tracking event:', error);
    }
  }

  // Track funnel stage
  async trackFunnelStage(funnel: FunnelStage): Promise<void> {
    if (!analyticsConfig.enabled) {
      if (analyticsConfig.debug) {
        console.log('[Analytics] Funnel tracking disabled:', funnel.stage);
      }
      return;
    }
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .rpc('track_funnel_stage', {
          p_user_id: user?.id || null,
          p_session_id: this.sessionId,
          p_funnel_name: funnel.funnelName,
          p_stage: funnel.stage,
          p_stage_order: funnel.stageOrder,
          p_metadata: funnel.metadata || {}
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error tracking funnel stage:', error);
    }
  }

  // Log system event
  async logEvent(
    level: 'info' | 'warning' | 'error',
    message: string,
    metadata?: any
  ): Promise<void> {
    if (!analyticsConfig.enabled) {
      if (analyticsConfig.debug) {
        console.log(`[Analytics] ${level.toUpperCase()}: ${message}`, metadata);
      }
      return;
    }
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .rpc('log_system_event', {
          p_level: level,
          p_message: message,
          p_user_id: user?.id || null,
          p_user_email: user?.email || null,
          p_metadata: metadata || {}
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error logging event:', error);
    }
  }

  // Get device information
  private getDeviceInfo() {
    const userAgent = navigator.userAgent;
    let deviceType = 'desktop';
    let os = 'unknown';
    let browser = 'unknown';

    // Detect device type
    if (/tablet|ipad|playbook|silk/i.test(userAgent)) {
      deviceType = 'tablet';
    } else if (/mobile|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/i.test(userAgent)) {
      deviceType = 'mobile';
    }

    // Detect OS
    if (/windows/i.test(userAgent)) os = 'Windows';
    else if (/mac/i.test(userAgent)) os = 'macOS';
    else if (/linux/i.test(userAgent)) os = 'Linux';
    else if (/android/i.test(userAgent)) os = 'Android';
    else if (/ios|iphone|ipad|ipod/i.test(userAgent)) os = 'iOS';

    // Detect browser
    if (/chrome/i.test(userAgent) && !/edge/i.test(userAgent)) browser = 'Chrome';
    else if (/safari/i.test(userAgent) && !/chrome/i.test(userAgent)) browser = 'Safari';
    else if (/firefox/i.test(userAgent)) browser = 'Firefox';
    else if (/edge/i.test(userAgent)) browser = 'Edge';
    else if (/opera|opr/i.test(userAgent)) browser = 'Opera';

    return { type: deviceType, os, browser };
  }

  // Get user location (simplified - in production, use a proper geolocation service)
  private async getUserLocation(): Promise<any> {
    try {
      // This is a placeholder - in production, you'd use a service like ipapi.co or similar
      const response = await fetch('https://ipapi.co/json/');
      if (response.ok) {
        const data = await response.json();
        return {
          country: data.country_name,
          city: data.city,
          region: data.region,
          lat: data.latitude,
          lng: data.longitude
        };
      }
    } catch (error) {
      console.error('Error getting user location:', error);
    }
    return null;
  }

  // Get analytics summary
  async getAnalyticsSummary() {
    try {
      const { data: activeUsers } = await supabase
        .rpc('get_active_users_count', { p_minutes: 30 });

      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const { count: newUsersToday } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', today.toISOString());

      return {
        activeUsers: activeUsers || 0,
        totalUsers: totalUsers || 0,
        newUsersToday: newUsersToday || 0
      };
    } catch (error) {
      console.error('Error getting analytics summary:', error);
      return {
        activeUsers: 0,
        totalUsers: 0,
        newUsersToday: 0
      };
    }
  }

  // Export users data to CSV
  async exportUsersToCSV() {
    try {
      const { data: users, error } = await supabase
        .from('profiles')
        .select(`
          id,
          email,
          full_name,
          role,
          is_active,
          created_at,
          last_sign_in_at
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const csv = [
        ['ID', 'Email', 'Full Name', 'Role', 'Active', 'Joined Date', 'Last Login'],
        ...(users || []).map(user => [
          user.id,
          user.email,
          user.full_name || '',
          user.role,
          user.is_active ? 'Yes' : 'No',
          new Date(user.created_at).toLocaleDateString(),
          user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString() : 'Never'
        ])
      ].map(row => row.join(',')).join('\n');

      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `users-export-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);

      await this.logEvent('info', 'Users data exported to CSV');
    } catch (error: any) {
      console.error('Error exporting users:', error);
      await this.logEvent('error', 'Failed to export users data', { error: error?.message || 'Unknown error' });
    }
  }

  // Delete user (admin only)
  async deleteUser(userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_active: false })
        .eq('id', userId);

      if (error) throw error;

      await this.logEvent('warning', `User deactivated: ${userId}`);
    } catch (error: any) {
      console.error('Error deleting user:', error);
      await this.logEvent('error', `Failed to deactivate user: ${userId}`, { error: error?.message || 'Unknown error' });
      throw error;
    }
  }

  // Reset user password (admin only)
  async resetUserPassword(email: string): Promise<void> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });

      if (error) throw error;

      await this.logEvent('info', `Password reset email sent to: ${email}`);
    } catch (error: any) {
      console.error('Error resetting password:', error);
      await this.logEvent('error', `Failed to reset password for: ${email}`, { error: error?.message || 'Unknown error' });
      throw error;
    }
  }
}

export default new AnalyticsAPIService();