import { useEffect, useCallback } from 'react';
import { apiRequest } from '@/lib/queryClient';

interface InteractionData {
  element: string;
  action: 'click' | 'hover' | 'scroll' | 'focus' | 'submit';
  coordinates: { x: number; y: number };
  viewport: { width: number; height: number };
  page: string;
  duration?: number;
  metadata?: any;
}

export function useDiagnostics() {
  // Generate or get session ID
  const getSessionId = useCallback(() => {
    let sessionId = sessionStorage.getItem('diagnostics_session_id');
    if (!sessionId) {
      sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('diagnostics_session_id', sessionId);
    }
    return sessionId;
  }, []);

  // Get user ID (mock for now)
  const getUserId = useCallback(() => {
    return localStorage.getItem('user_id') || 'anonymous';
  }, []);

  // Track interaction
  const trackInteraction = useCallback(async (
    element: string,
    action: 'click' | 'hover' | 'scroll' | 'focus' | 'submit',
    event?: MouseEvent | FocusEvent,
    duration?: number,
    metadata?: any
  ) => {
    try {
      const interactionData: InteractionData = {
        element,
        action,
        coordinates: {
          x: (event as MouseEvent)?.clientX || 0,
          y: (event as MouseEvent)?.clientY || 0
        },
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight
        },
        page: window.location.pathname,
        duration,
        metadata
      };

      // Send to backend
      await apiRequest('POST', '/api/diagnostics/track-interaction', {
        userId: getUserId(),
        sessionId: getSessionId(),
        ...interactionData
      });
    } catch (error) {
      // Silently fail - diagnostics shouldn't break app functionality
      console.debug('Diagnostics tracking error:', error);
    }
  }, [getSessionId, getUserId]);

  // Track performance metrics
  const trackPerformanceMetrics = useCallback(async () => {
    try {
      // Get performance data from browser
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const paint = performance.getEntriesByType('paint');
      
      const metrics = {
        responseTime: navigation ? navigation.responseEnd - navigation.requestStart : 0,
        errorRate: 0, // Would need to track actual errors
        throughput: 1, // Simplified
        memoryUsage: (performance as any).memory ? (performance as any).memory.usedJSHeapSize / (performance as any).memory.totalJSHeapSize * 100 : 0,
        cpuUsage: 0, // Not available in browser
        dbConnections: 0, // Backend metric
        activeUsers: 1 // Simplified
      };

      await apiRequest('POST', '/api/diagnostics/performance-metrics', metrics);
    } catch (error) {
      console.debug('Performance metrics tracking error:', error);
    }
  }, []);

  // Auto-track common interactions
  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const element = target.id || target.className || target.tagName;
      trackInteraction(element, 'click', event);
    };

    const handleFocus = (event: FocusEvent) => {
      const target = event.target as HTMLElement;
      const element = target.id || target.className || target.tagName;
      trackInteraction(element, 'focus', event);
    };

    let scrollTimer: NodeJS.Timeout;
    const handleScroll = () => {
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(() => {
        trackInteraction('page', 'scroll', undefined, undefined, {
          scrollY: window.scrollY,
          scrollHeight: document.documentElement.scrollHeight
        });
      }, 250); // Debounce scroll events
    };

    // Add event listeners
    document.addEventListener('click', handleClick);
    document.addEventListener('focus', handleFocus, true);
    window.addEventListener('scroll', handleScroll, { passive: true });

    // Track performance metrics on page load
    if (document.readyState === 'complete') {
      setTimeout(trackPerformanceMetrics, 1000);
    } else {
      window.addEventListener('load', () => {
        setTimeout(trackPerformanceMetrics, 1000);
      });
    }

    // Cleanup
    return () => {
      document.removeEventListener('click', handleClick);
      document.removeEventListener('focus', handleFocus, true);
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimer);
    };
  }, [trackInteraction, trackPerformanceMetrics]);

  return {
    trackInteraction,
    trackPerformanceMetrics,
    sessionId: getSessionId(),
    userId: getUserId()
  };
}