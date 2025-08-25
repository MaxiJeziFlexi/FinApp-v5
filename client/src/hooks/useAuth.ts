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
    const checkAuth = () => {
      let adminAuth = null;
      let userAuth = null;

      try {
        // Check for admin auth first
        const adminData = sessionStorage.getItem('finapp_admin_auth');
        if (adminData) {
          adminAuth = JSON.parse(adminData);
          console.log('🔑 Admin auth found:', adminAuth);
        }

        // Check for regular user auth
        const userData = sessionStorage.getItem('finapp_user_auth');
        if (userData) {
          userAuth = JSON.parse(userData);
          console.log('👤 User auth found:', userAuth);
        }
      } catch (e) {
        console.error('❌ Auth parsing error:', e);
        sessionStorage.removeItem('finapp_admin_auth');
        sessionStorage.removeItem('finapp_user_auth');
      }

      setLocalAuth({
        adminAuth,
        userAuth,
        isLoaded: true
      });
    };

    // Initial check
    checkAuth();

    // Listen for storage changes (including logout from other tabs)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'finapp_admin_auth' || e.key === 'finapp_user_auth' || e.key === null) {
        console.log('🔄 Storage changed, rechecking auth...');
        checkAuth();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Cleanup listener
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const { data: user, isLoading: queryLoading } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: false,
    enabled: false, // Disable this query to prevent 401 loops for demo
  });

  // Return the appropriate user based on authentication state
  if (!localAuth.isLoaded) {
    console.log('⏳ Auth still loading...');
    return {
      user: null,
      isLoading: true,
      isAuthenticated: false,
      isAdmin: false
    };
  }

  // If admin is authenticated, return admin user
  if (localAuth.adminAuth) {
    console.log('✅ Admin authenticated:', localAuth.adminAuth.systemRole);
    const adminUser = {
      id: 'admin-user',
      email: localAuth.adminAuth.email,
      name: localAuth.adminAuth.name,
      role: 'ADMIN',
      systemRole: 'ADMIN',
      subscriptionTier: 'MAX_PRO',
      accountStatus: 'active',
      onboardingCompleted: true
    };
    
    return {
      user: adminUser,
      isLoading: false,
      isAuthenticated: true,
      isAdmin: true
    };
  }

  // If demo user is authenticated, return demo user
  if (localAuth.userAuth) {
    const onboardingCompleted = localAuth.userAuth.onboardingCompleted || false;
    console.log('✅ User authenticated:', {
      systemRole: localAuth.userAuth.systemRole,
      onboardingCompleted,
      email: localAuth.userAuth.email
    });
    
    const regularUser = {
      id: 'demo-user',
      email: localAuth.userAuth.email,
      name: localAuth.userAuth.name,
      role: 'FREE',
      subscriptionTier: 'FREE',
      accountStatus: 'active',
      systemRole: 'USER',
      onboardingCompleted
    };
    
    return {
      user: regularUser,
      isLoading: false,
      isAuthenticated: true,
      isAdmin: false
    };
  }

  // No authentication found
  console.log('❌ No authentication found');
  return {
    user: null,
    isLoading: false,
    isAuthenticated: false,
    isAdmin: false
  };
}

export function logout() {
  // Clear all authentication data first
  sessionStorage.removeItem('finapp_admin_auth');
  sessionStorage.removeItem('finapp_user_auth');
  
  // Clear any other session data
  sessionStorage.clear();
  
  // Force page reload to clear React state and redirect to landing
  window.location.href = '/';
}