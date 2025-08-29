// Simple monitoring and analytics utilities

interface EventData {
  [key: string]: any;
}

// Basic analytics tracking
export const trackEvent = (eventName: string, properties?: EventData) => {
  if (process.env.NODE_ENV === 'development') {
    console.log('📊 Event tracked:', eventName, properties);
    return;
  }

  // In production, this would send to your analytics service
  // Example: Google Analytics, Mixpanel, PostHog, etc.
  try {
    // Placeholder for analytics integration
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', eventName, properties);
    }
  } catch (error) {
    console.warn('Failed to track event:', error);
  }
};

// Performance monitoring
export const measurePerformance = (name: string, fn: () => any) => {
  const start = performance.now();
  const result = fn();
  const end = performance.now();
  
  if (process.env.NODE_ENV === 'development') {
    console.log(`⏱️ ${name} took ${(end - start).toFixed(2)}ms`);
  }
  
  // Track slow operations
  if (end - start > 1000) {
    trackEvent('slow_operation', {
      operation: name,
      duration: end - start
    });
  }
  
  return result;
};

// Error tracking
export const trackError = (error: Error, context?: string) => {
  console.error('Error tracked:', error, context);
  
  trackEvent('error_occurred', {
    error_message: error.message,
    error_stack: error.stack,
    context
  });
};

// User journey tracking
export const trackUserAction = (action: string, page?: string) => {
  trackEvent('user_action', {
    action,
    page: page || window.location.pathname,
    timestamp: new Date().toISOString()
  });
};

// Business metrics
export const trackBusinessMetric = (metric: string, value: number, unit?: string) => {
  trackEvent('business_metric', {
    metric,
    value,
    unit,
    timestamp: new Date().toISOString()
  });
};