import { useQuery } from '@tanstack/react-query';

export interface UserFeatures {
  features: {
    dashboard_access: boolean;
    profile_access: boolean;
    viz3d_access: boolean;
    transactions_import_basic: boolean;
    transactions_import_unlimited: boolean;
    advice_advanced: boolean;
    advice_personalized: boolean;
    chat_limited: boolean;
    chat_unlimited: boolean;
    analytics_basic: boolean;
    analytics_advanced: boolean;
    export_csv_limited: boolean;
    export_full: boolean;
    admin_access: boolean;
  };
  userId: string;
  timestamp: string;
}

/**
 * Hook to fetch user's RBAC features and subscription tier capabilities
 * Returns feature flags that control UI visibility and API access
 */
export function useUserFeatures() {
  return useQuery<UserFeatures>({
    queryKey: ['userFeatures'],
    queryFn: async () => {
      const response = await fetch('/api/me/features', {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch user features');
      }
      
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    retry: 2
  });
}

/**
 * Hook to check if user has specific feature access
 */
export function useHasFeature(featureName: keyof UserFeatures['features']) {
  const { data: userFeatures, isLoading } = useUserFeatures();
  
  return {
    hasFeature: userFeatures?.features?.[featureName] || false,
    isLoading,
    userTier: userFeatures?.userId // Could be enhanced to show actual tier
  };
}

/**
 * Component wrapper for feature-gated content
 */
export function FeatureGate({ 
  feature, 
  children, 
  fallback = null 
}: { 
  feature: keyof UserFeatures['features'];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const { hasFeature, isLoading } = useHasFeature(feature);
  
  if (isLoading) {
    return <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-4 rounded"></div>;
  }
  
  return hasFeature ? <>{children}</> : <>{fallback}</>;
}