import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";

export function useAuth() {
  const [localAuth, setLocalAuth] = useState<{
    adminAuth: any;
    userAuth: any;
    isLoaded: boolean;
  }>({
    adminAuth: null,
    userAuth: null,
    isLoaded: false
  });
  
  // Check for authentication in localStorage
  useEffect(() => {
    let adminAuth = null;
    let userAuth = null;

    // Check for admin auth first
    const adminData = localStorage.getItem('finapp_admin_auth');
    if (adminData) {
      try {
        adminAuth = JSON.parse(adminData);
      } catch (e) {
        localStorage.removeItem('finapp_admin_auth');
      }
    }

    // Check for regular user auth
    const userData = localStorage.getItem('finapp_user_auth');
    if (userData) {
      try {
        userAuth = JSON.parse(userData);
      } catch (e) {
        localStorage.removeItem('finapp_user_auth');
      }
    }

    setLocalAuth({
      adminAuth,
      userAuth,
      isLoaded: true
    });
  }, []);

  const { data: user, isLoading: queryLoading } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: false,
    enabled: false, // Disable this query to prevent 401 loops for demo
  });

  // Return the appropriate user based on authentication state
  if (!localAuth.isLoaded) {
    return {
      user: null,
      isLoading: true,
      isAuthenticated: false,
      isAdmin: false
    };
  }

  // If admin is authenticated, return admin user
  if (localAuth.adminAuth) {
    return {
      user: {
        id: 'admin-user',
        email: localAuth.adminAuth.email,
        name: localAuth.adminAuth.name,
        role: 'ADMIN',
        systemRole: 'ADMIN',
        subscriptionTier: 'MAX_PRO',
        accountStatus: 'active',
        onboardingCompleted: true
      },
      isLoading: false,
      isAuthenticated: true,
      isAdmin: true
    };
  }

  // If demo user is authenticated, return demo user
  if (localAuth.userAuth) {
    return {
      user: {
        id: 'demo-user',
        email: localAuth.userAuth.email,
        name: localAuth.userAuth.name,
        role: 'FREE',
        subscriptionTier: 'FREE',
        accountStatus: 'active',
        systemRole: 'USER',
        onboardingCompleted: localAuth.userAuth.onboardingCompleted || false
      },
      isLoading: false,
      isAuthenticated: true,
      isAdmin: false
    };
  }

  // Fall back to server authentication (Replit OAuth) - disabled for demo
  return {
    user: null,
    isLoading: false, // Don't show loading for unauthenticated users
    isAuthenticated: false,
    isAdmin: false
  };
}

export function logout() {
  // Clear all authentication data
  localStorage.removeItem('finapp_admin_auth');
  localStorage.removeItem('finapp_user_auth');
  
  // Redirect to server logout endpoint which handles proper session termination
  window.location.href = '/api/logout';
}