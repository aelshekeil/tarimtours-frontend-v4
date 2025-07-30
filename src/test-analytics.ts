import { supabase } from './services/supabaseClient';

async function testAnalytics() {
  try {
    console.log('Testing analytics connection...');
    
    // Test connection by querying user count
    const { count, error: countError } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.error('Error getting user count:', countError);
      return;
    }
    
    console.log('Total users:', count);
    
    // Test analytics tables
    const { data: analyticsData, error: analyticsError } = await supabase
      .from('user_analytics')
      .select('count');
    
    if (analyticsError) {
      console.error('Error querying user_analytics:', analyticsError);
      return;
    }
    
    console.log('User analytics records:', analyticsData?.length || 0);
    
    // Test page analytics
    const { data: pageData, error: pageError } = await supabase
      .from('page_analytics')
      .select('count');
    
    if (pageError) {
      console.error('Error querying page_analytics:', pageError);
      return;
    }
    
    console.log('Page analytics records:', pageData?.length || 0);
    
    // Test system logs
    const { data: logData, error: logError } = await supabase
      .from('system_logs')
      .select('count');
    
    if (logError) {
      console.error('Error querying system_logs:', logError);
      return;
    }
    
    console.log('System log records:', logData?.length || 0);
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

testAnalytics();