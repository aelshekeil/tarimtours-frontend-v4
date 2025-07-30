# Analytics Dashboard Implementation Guide

## Overview

The analytics dashboard provides comprehensive user behavior tracking, real-time monitoring, and user management features for the TarimTours admin panel.

## Features Implemented

### 1. **Real-Time User Tracking**
- Active users monitoring (last 30 minutes)
- User location tracking with country/city data
- Session duration tracking
- Current page tracking for each active user

### 2. **User Behavior Analytics**
- Page view tracking with unique visitors
- Average time on page
- User journey flow visualization
- Click and form submission tracking
- Custom event tracking

### 3. **Funnel Analysis**
- Application journey tracking through stages:
  - Homepage Visit
  - Service Selection
  - Application Started
  - Form Completed
  - Payment Initiated
  - Application Submitted
- Conversion rate visualization
- Drop-off analysis between stages

### 4. **User Management Features**
- **Delete Users**: Soft delete (deactivate) users
- **Export to Excel**: Export all users data as CSV
- **Reset Password**: Send password reset emails
- **User Status Toggle**: Activate/deactivate users
- **Role-based Permissions**: Super admins cannot be deleted

### 5. **System Logging**
- Three log levels: info, warning, error
- Searchable and filterable logs
- Export logs to CSV
- Real-time log updates

### 6. **Analytics Overview**
- Total users count
- Active users (real-time)
- New users today
- Average session duration
- Top pages by views
- User locations distribution

## Database Schema

### Tables Created

1. **user_analytics**
   - Tracks individual user sessions and page views
   - Stores location, device info, and session data

2. **page_analytics**
   - Aggregates page view statistics
   - Tracks unique visitors and average time on page

3. **system_logs**
   - Stores all system events and errors
   - Includes user context and metadata

4. **funnel_analytics**
   - Tracks user progression through application funnels
   - Stores stage transitions with timestamps

5. **user_events**
   - Captures all user interactions (clicks, form submissions)
   - Stores event context and metadata

## Setup Instructions

### 1. Apply Database Migrations

Run the migration file to create the necessary tables:

```bash
# Using Supabase CLI
supabase db push

# Or apply directly in Supabase SQL Editor
-- Copy contents of supabase/migrations/20250729210000_add_analytics_tables.sql
```

### 2. Enable Real-time Subscriptions

In Supabase Dashboard:
1. Go to Database → Replication
2. Enable replication for:
   - `user_analytics` table
   - `system_logs` table

### 3. Configure Environment Variables

Ensure your `.env` file has:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Usage in Components

#### Track Page Views (Automatic)
The `useAnalytics` hook automatically tracks page views when integrated with React Router.

```typescript
// Already integrated in App.tsx via AnalyticsProvider
```

#### Track Custom Events
```typescript
import { useAnalytics } from '../hooks/useAnalytics';

const MyComponent = () => {
  const { trackEvent } = useAnalytics();
  
  const handleButtonClick = () => {
    trackEvent('button_clicked', {
      button_name: 'Submit Application',
      section: 'visa_services'
    });
  };
  
  return <button onClick={handleButtonClick}>Submit</button>;
};
```

#### Track Funnel Stages
```typescript
import { useApplicationFunnel } from '../hooks/useAnalytics';

const VisaApplication = () => {
  const funnel = useApplicationFunnel('visa');
  
  // Track when user starts application
  useEffect(() => {
    funnel.trackApplicationStarted();
  }, []);
  
  // Track form completion
  const handleFormSubmit = () => {
    funnel.trackFormCompleted();
  };
};
```

## Admin Dashboard Access

1. Navigate to `/admin` in your application
2. Click on "Analytics Dashboard" in the sidebar
3. Use the tabs to switch between different views:
   - **Overview**: General statistics and metrics
   - **Active Users**: Real-time user monitoring
   - **User Behavior**: Funnel analysis and user flow
   - **System Logs**: Application logs and errors

## API Methods

### Analytics API Service

```typescript
// Track page view
analyticsAPI.trackPageView({
  pagePath: '/visa-services',
  pageTitle: 'Visa Services'
});

// Track custom event
analyticsAPI.trackEvent({
  eventType: 'click',
  eventName: 'cta_button',
  eventData: { section: 'hero' }
});

// Log system event
analyticsAPI.logEvent('info', 'User completed application', {
  application_id: '12345'
});

// Export users to CSV
analyticsAPI.exportUsersToCSV();

// Delete user (soft delete)
analyticsAPI.deleteUser(userId);

// Reset user password
analyticsAPI.resetUserPassword(userEmail);
```

## Security Considerations

1. **Row Level Security (RLS)** is enabled on all analytics tables
2. Only admin and super_admin roles can view analytics data
3. Users can only insert their own analytics data
4. System logs are write-only for non-admin users

## Performance Optimization

1. **Indexes** are created on frequently queried columns
2. **Real-time subscriptions** are limited to necessary tables
3. **Session tracking** updates every 30 seconds to reduce database load
4. **Page analytics** are aggregated daily

## Troubleshooting

### Common Issues

1. **No data showing in dashboard**
   - Check if migrations were applied successfully
   - Verify RLS policies are correctly set
   - Ensure user has admin/super_admin role

2. **Real-time updates not working**
   - Enable replication in Supabase Dashboard
   - Check WebSocket connection in browser console
   - Verify Supabase real-time is enabled

3. **Location data not accurate**
   - The basic implementation uses IP geolocation
   - For production, consider using a more accurate service
   - Add fallback for users with VPN/proxy

## Future Enhancements

1. **Advanced Analytics**
   - Heatmap visualization
   - A/B testing integration
   - Cohort analysis

2. **Performance Metrics**
   - Page load times
   - API response times
   - Error rates

3. **Custom Dashboards**
   - Drag-and-drop widget arrangement
   - Custom date ranges
   - Saved report templates

4. **Integrations**
   - Google Analytics integration
   - Export to external BI tools
   - Webhook notifications for events

## Support

For issues or questions:
1. Check the browser console for errors
2. Review Supabase logs for database errors
3. Ensure all environment variables are set correctly
4. Contact the development team for assistance