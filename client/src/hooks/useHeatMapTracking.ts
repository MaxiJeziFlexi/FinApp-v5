import { useEffect } from 'react';

export const useHeatMapTracking = () => {
  useEffect(() => {
    // Simple click tracking
    const trackClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      
      // Only track buttons and interactive elements
      if (target.tagName === 'BUTTON' || 
          target.role === 'button' ||
          target.tagName === 'A' ||
          target.classList.contains('btn') ||
          target.classList.contains('clickable')) {
        
        const clickData = {
          buttonId: target.id || target.className || 'unknown',
          buttonText: target.textContent?.trim() || target.getAttribute('aria-label') || 'Unknown',
          page: window.location.pathname,
          position: { x: event.clientX, y: event.clientY },
          timestamp: new Date().toISOString(),
          userId: 'admin-user',
          sessionId: `session_${Date.now()}`
        };
        
        // Send to server without awaiting
        fetch('/api/public/analytics/button-click', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(clickData)
        }).catch(() => {
          // Silently fail - just for tracking
        });
      }
    };

    document.addEventListener('click', trackClick);
    
    return () => {
      document.removeEventListener('click', trackClick);
    };
  }, []);
};