// Analytics configuration
export const analyticsConfig = {
  // Set to false to disable analytics tracking
  // Enable this after running the analytics migration in Supabase
  enabled: true,
  
  // Session tracking interval in milliseconds (30 seconds)
  sessionUpdateInterval: 30000,
  
  // Active user threshold in minutes
  activeUserThreshold: 30,
  
  // Enable console logging for debugging
  debug: false
};