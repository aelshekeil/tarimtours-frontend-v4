import { supabase } from './services/supabaseClient';

async function insertTestAnalyticsData() {
  console.log('Inserting test analytics data...');

  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    console.log('Current user:', user?.email || 'Not authenticated');

    // Insert test user analytics data
    const { error: analyticsError } = await supabase
      .from('user_analytics')
      .insert([
        {
          user_id: user?.id || null,
          session_id: 'test-session-1',
          page_path: '/home',
          page_title: 'Home Page',
          referrer: 'https://google.com',
          user_agent: navigator.userAgent,
          location: {
            country: 'Malaysia',
            city: 'Kuala Lumpur',
            region: 'Federal Territory'
          },
          device_info: {
            type: 'desktop',
            os: 'Windows',
            browser: 'Chrome'
          },
          session_duration: 120,
          last_activity: new Date().toISOString()
        },
        {
          user_id: user?.id || null,
          session_id: 'test-session-2',
          page_path: '/visa-services',
          page_title: 'Visa Services',
          referrer: '/home',
          user_agent: navigator.userAgent,
          location: {
            country: 'United States',
            city: 'New York',
            region: 'NY'
          },
          device_info: {
            type: 'mobile',
            os: 'iOS',
            browser: 'Safari'
          },
          session_duration: 300,
          last_activity: new Date(Date.now() - 10 * 60 * 1000).toISOString() // 10 minutes ago
        }
      ]);

    if (analyticsError) {
      console.error('Error inserting user analytics:', analyticsError);
    } else {
      console.log('User analytics data inserted successfully');
    }

    // Insert test events
    const { error: eventsError } = await supabase
      .from('user_events')
      .insert([
        {
          user_id: user?.id || null,
          session_id: 'test-session-1',
          event_type: 'navigation',
          event_name: 'page_view',
          event_data: {
            from: '/home',
            to: '/visa-services'
          },
          page_path: '/visa-services'
        },
        {
          user_id: user?.id || null,
          session_id: 'test-session-1',
          event_type: 'click',
          event_name: 'button_click',
          event_data: {
            button: 'Apply Now',
            section: 'visa-services'
          },
          page_path: '/visa-services'
        }
      ]);

    if (eventsError) {
      console.error('Error inserting user events:', eventsError);
    } else {
      console.log('User events data inserted successfully');
    }

    // Insert test funnel data
    const { error: funnelError } = await supabase
      .from('funnel_analytics')
      .insert([
        {
          user_id: user?.id || null,
          session_id: 'test-session-1',
          funnel_name: 'visa_application',
          stage: 'Homepage Visit',
          stage_order: 1
        },
        {
          user_id: user?.id || null,
          session_id: 'test-session-1',
          funnel_name: 'visa_application',
          stage: 'Service Selection',
          stage_order: 2
        },
        {
          user_id: user?.id || null,
          session_id: 'test-session-2',
          funnel_name: 'visa_application',
          stage: 'Homepage Visit',
          stage_order: 1
        }
      ]);

    if (funnelError) {
      console.error('Error inserting funnel data:', funnelError);
    } else {
      console.log('Funnel data inserted successfully');
    }

    // Insert test system logs
    const { error: logsError } = await supabase
      .from('system_logs')
      .insert([
        {
          level: 'info',
          message: 'Test analytics data inserted',
          user_id: user?.id || null,
          user_email: user?.email || null,
          metadata: { test: true }
        },
        {
          level: 'warning',
          message: 'High traffic detected on visa services page',
          metadata: { page: '/visa-services', requests: 1000 }
        },
        {
          level: 'error',
          message: 'Payment gateway timeout',
          metadata: { gateway: 'stripe', timeout: 30000 }
        }
      ]);

    if (logsError) {
      console.error('Error inserting system logs:', logsError);
    } else {
      console.log('System logs inserted successfully');
    }

    console.log('All test data inserted successfully!');
    console.log('Please refresh the Analytics Dashboard to see the data.');

  } catch (error) {
    console.error('Error inserting test data:', error);
  }
}

// Export the function so it can be called from the console
(window as any).insertTestAnalyticsData = insertTestAnalyticsData;

console.log('Test analytics data script loaded. Run insertTestAnalyticsData() in the console to insert test data.');