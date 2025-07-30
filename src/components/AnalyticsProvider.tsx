import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAnalytics } from '../hooks/useAnalytics';

interface AnalyticsProviderProps {
  children: React.ReactNode;
}

export const AnalyticsProvider: React.FC<AnalyticsProviderProps> = ({ children }) => {
  const location = useLocation();
  const analytics = useAnalytics();

  useEffect(() => {
    // Log navigation events
    analytics.logInfo('Page navigation', {
      path: location.pathname,
      search: location.search,
      hash: location.hash
    });
  }, [location]);

  return <>{children}</>;
};