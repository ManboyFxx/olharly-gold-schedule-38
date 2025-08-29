import React from 'react';

// Performance optimization utilities

// Debounce function for search inputs
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Throttle function for scroll events
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// Lazy loading helper
export const lazyWithRetry = (importFn: () => Promise<any>, retries = 3) => {
  return React.lazy(async () => {
    let attempt = 0;
    while (attempt < retries) {
      try {
        return await importFn();
      } catch (error) {
        attempt++;
        if (attempt >= retries) {
          throw error;
        }
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }
    throw new Error('Failed to load component after retries');
  });
};

// Image optimization helper
export const optimizeImageUrl = (url: string, width?: number, quality = 80) => {
  if (!url) return url;
  
  // If it's a Supabase storage URL, we can add optimization parameters
  if (url.includes('supabase.co/storage')) {
    const urlObj = new URL(url);
    if (width) urlObj.searchParams.set('width', width.toString());
    urlObj.searchParams.set('quality', quality.toString());
    return urlObj.toString();
  }
  
  return url;
};

// Memory usage monitoring (development only)
export const logMemoryUsage = () => {
  if (process.env.NODE_ENV === 'development' && 'memory' in performance) {
    const memInfo = (performance as any).memory;
    console.log('Memory Usage:', {
      used: Math.round(memInfo.usedJSHeapSize / 1048576) + 'MB',
      total: Math.round(memInfo.totalJSHeapSize / 1048576) + 'MB',
      limit: Math.round(memInfo.jsHeapSizeLimit / 1048576) + 'MB'
    });
  }
};