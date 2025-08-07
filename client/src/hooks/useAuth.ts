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
        role: 'admin',
        subscriptionTier: 'max',
        accountStatus: 'active'
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
        role: 'user',
        subscriptionTier: 'free',
        accountStatus: 'active'
      },
      isLoading: false,
      isAuthenticated: true,
      isAdmin: false
    };
  }

  // Fall back to server authentication (Replit OAuth)
  return {
    user,
    isLoading: queryLoading,
    isAuthenticated: !!user,
    isAdmin: false
  };
}