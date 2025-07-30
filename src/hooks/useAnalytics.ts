import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import analyticsAPI from '../services/analyticsAPI';

export const useAnalytics = () => {
  const location = useLocation();

  useEffect(() => {
    // Track page view on route change
    analyticsAPI.trackPageView({
      pagePath: location.pathname,
      pageTitle: document.title,
    });

    // Track user events
    const trackClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const clickedElement = target.closest('button, a, [data-track]');
      
      if (clickedElement) {
        const trackData = clickedElement.getAttribute('data-track');
        const elementText = clickedElement.textContent || '';
        const elementType = clickedElement.tagName.toLowerCase();
        
        analyticsAPI.trackEvent({
          eventType: 'click',
          eventName: trackData || `${elementType}_click`,
          eventData: {
            element: elementType,
            text: elementText.substring(0, 50),
            href: (clickedElement as HTMLAnchorElement).href || null,
            path: location.pathname
          }
        });
      }
    };

    // Track form submissions
    const trackFormSubmit = (e: Event) => {
      const form = e.target as HTMLFormElement;
      const formName = form.getAttribute('name') || form.id || 'unnamed_form';
      
      analyticsAPI.trackEvent({
        eventType: 'form_submit',
        eventName: formName,
        eventData: {
          formId: form.id,
          formName: formName,
          path: location.pathname
        }
      });
    };

    // Add event listeners
    document.addEventListener('click', trackClick);
    document.addEventListener('submit', trackFormSubmit);

    // Cleanup
    return () => {
      document.removeEventListener('click', trackClick);
      document.removeEventListener('submit', trackFormSubmit);
    };
  }, [location]);

  // Public methods for manual tracking
  const trackEvent = (eventName: string, eventData?: any) => {
    analyticsAPI.trackEvent({
      eventType: 'custom',
      eventName,
      eventData,
      pagePath: location.pathname
    });
  };

  const trackFunnelStage = (funnelName: string, stage: string, stageOrder: number, metadata?: any) => {
    analyticsAPI.trackFunnelStage({
      funnelName,
      stage,
      stageOrder,
      metadata
    });
  };

  const logError = (message: string, error?: any) => {
    analyticsAPI.logEvent('error', message, { error: error?.message || error });
  };

  const logInfo = (message: string, metadata?: any) => {
    analyticsAPI.logEvent('info', message, metadata);
  };

  return {
    trackEvent,
    trackFunnelStage,
    logError,
    logInfo
  };
};

// Hook to track application funnel
export const useApplicationFunnel = (applicationType: string) => {
  const { trackFunnelStage } = useAnalytics();

  const trackApplicationStep = (step: string, stepOrder: number, metadata?: any) => {
    trackFunnelStage(`${applicationType}_application`, step, stepOrder, {
      ...metadata,
      timestamp: new Date().toISOString()
    });
  };

  return {
    trackHomepageVisit: () => trackApplicationStep('homepage_visit', 1),
    trackServiceSelection: () => trackApplicationStep('service_selection', 2),
    trackApplicationStarted: () => trackApplicationStep('application_started', 3),
    trackFormCompleted: () => trackApplicationStep('form_completed', 4),
    trackPaymentInitiated: () => trackApplicationStep('payment_initiated', 5),
    trackApplicationSubmitted: () => trackApplicationStep('application_submitted', 6),
  };
};