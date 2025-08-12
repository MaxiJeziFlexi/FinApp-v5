import { useQuery } from "@tanstack/react-query";
import PremiumPaywall from "./PremiumPaywall";
import { useAuth } from "@/hooks/useAuth";

interface PremiumGateProps {
  children: React.ReactNode;
  required: "FREE" | "PRO" | "MAX_PRO" | "ADMIN";
  feature?: string;
  fallbackTitle?: string;
  fallbackDescription?: string;
}

export default function PremiumGate({ 
  children, 
  required, 
  feature,
  fallbackTitle,
  fallbackDescription 
}: PremiumGateProps) {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  
  const { data: userFeatures, isLoading: featuresLoading } = useQuery({
    queryKey: ["/api/me/features"],
    enabled: isAuthenticated && !!user
  });

  // Show loading state while checking permissions
  if (authLoading || featuresLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  // Check if user has required tier access
  const userTier = user?.role || "FREE";
  const tierHierarchy = ["FREE", "PRO", "MAX_PRO", "ADMIN"];
  const hasAccess = tierHierarchy.indexOf(userTier) >= tierHierarchy.indexOf(required);

  if (!hasAccess) {
    return (
      <PremiumPaywall 
        title={fallbackTitle}
        description={fallbackDescription}
        requiredTier={required === "ADMIN" ? "MAX_PRO" : required as "PRO" | "MAX_PRO"}
        feature={feature}
      />
    );
  }

  return <>{children}</>;
}