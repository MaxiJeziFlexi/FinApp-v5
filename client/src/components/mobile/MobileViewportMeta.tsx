import { useEffect } from 'react';

export default function MobileViewportMeta() {
  useEffect(() => {
    // Ensure proper viewport meta tag for mobile
    let viewportMeta = document.querySelector('meta[name="viewport"]');
    
    if (!viewportMeta) {
      viewportMeta = document.createElement('meta');
      viewportMeta.setAttribute('name', 'viewport');
      document.head.appendChild(viewportMeta);
    }
    
    // Set optimal mobile viewport
    viewportMeta.setAttribute(
      'content', 
      'width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, viewport-fit=cover, user-scalable=no'
    );
    
    // Add theme-color for mobile browsers
    let themeColorMeta = document.querySelector('meta[name="theme-color"]');
    if (!themeColorMeta) {
      themeColorMeta = document.createElement('meta');
      themeColorMeta.setAttribute('name', 'theme-color');
      themeColorMeta.setAttribute('content', '#06b6d4'); // cyan-500
      document.head.appendChild(themeColorMeta);
    }
    
    // Add apple-mobile-web-app-capable
    let appleMeta = document.querySelector('meta[name="apple-mobile-web-app-capable"]');
    if (!appleMeta) {
      appleMeta = document.createElement('meta');
      appleMeta.setAttribute('name', 'apple-mobile-web-app-capable');
      appleMeta.setAttribute('content', 'yes');
      document.head.appendChild(appleMeta);
    }
    
    // Add apple-mobile-web-app-status-bar-style
    let appleStatusMeta = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]');
    if (!appleStatusMeta) {
      appleStatusMeta = document.createElement('meta');
      appleStatusMeta.setAttribute('name', 'apple-mobile-web-app-status-bar-style');
      appleStatusMeta.setAttribute('content', 'default');
      document.head.appendChild(appleStatusMeta);
    }
  }, []);
  
  return null; // This component only manages meta tags
}