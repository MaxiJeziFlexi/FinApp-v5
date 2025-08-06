import { useEffect, useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Shield,
  Crown,
  User,
  Lock,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Settings
} from "lucide-react";
import type { User as UserType } from "@shared/schema";

interface RoleBasedAccessProps {
  user: UserType;
  requiredRole?: 'user' | 'moderator' | 'admin';
  requiredTier?: 'free' | 'pro' | 'max';
  requiredStatus?: 'active' | 'pending' | 'suspended';
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onUpgrade?: () => void;
}

interface AccessRules {
  canAccessDecisionTrees: boolean;
  canAccessMultipleAdvisors: boolean;
  canAccessAnalytics: boolean;
  canAccessAdminPanel: boolean;
  canModerateContent: boolean;
  maxApiUsage: number;
  maxAdvisors: number;
}

export default function RoleBasedAccess({
  user,
  requiredRole = 'user',
  requiredTier = 'free',
  requiredStatus = 'active',
  children,
  fallback,
  onUpgrade
}: RoleBasedAccessProps) {
  const [hasAccess, setHasAccess] = useState(false);
  const [accessRules, setAccessRules] = useState<AccessRules>({
    canAccessDecisionTrees: false,
    canAccessMultipleAdvisors: false,
    canAccessAnalytics: false,
    canAccessAdminPanel: false,
    canModerateContent: false,
    maxApiUsage: 0.20,
    maxAdvisors: 1
  });
  const { toast } = useToast();

  useEffect(() => {
    // Calculate access rules based on user role and subscription
    const rules = calculateAccessRules(user);
    setAccessRules(rules);

    // Check if user meets requirements
    const meetsRoleRequirement = checkRoleHierarchy(user.role, requiredRole);
    const meetsTierRequirement = checkTierRequirement(user.subscriptionTier, requiredTier);
    const meetsStatusRequirement = user.accountStatus === requiredStatus;

    setHasAccess(meetsRoleRequirement && meetsTierRequirement && meetsStatusRequirement);
  }, [user, requiredRole, requiredTier, requiredStatus]);

  const calculateAccessRules = (user: UserType): AccessRules => {
    const baseRules = {
      canAccessDecisionTrees: false,
      canAccessMultipleAdvisors: false,
      canAccessAnalytics: false,
      canAccessAdminPanel: false,
      canModerateContent: false,
      maxApiUsage: 0.20,
      maxAdvisors: 1
    };

    // Role-based permissions
    if (user.role === 'admin') {
      return {
        ...baseRules,
        canAccessDecisionTrees: true,
        canAccessMultipleAdvisors: true,
        canAccessAnalytics: true,
        canAccessAdminPanel: true,
        canModerateContent: true,
        maxApiUsage: 5.0,
        maxAdvisors: 999
      };
    }

    if (user.role === 'moderator') {
      baseRules.canModerateContent = true;
      baseRules.canAccessAnalytics = true;
    }

    // Subscription tier permissions
    switch (user.subscriptionTier) {
      case 'free':
        return {
          ...baseRules,
          maxApiUsage: 0.20,
          maxAdvisors: 1,
          canAccessDecisionTrees: false
        };
      case 'pro':
        return {
          ...baseRules,
          maxApiUsage: 1.30, // 65% of $2.00
          maxAdvisors: 3,
          canAccessDecisionTrees: true,
          canAccessMultipleAdvisors: true
        };
      case 'max':
        return {
          ...baseRules,
          maxApiUsage: 5.0,
          maxAdvisors: 999,
          canAccessDecisionTrees: true,
          canAccessMultipleAdvisors: true,
          canAccessAnalytics: true
        };
      default:
        return baseRules;
    }
  };

  const checkRoleHierarchy = (userRole: string, requiredRole: string): boolean => {
    const roleHierarchy = {
      'user': 0,
      'moderator': 1,
      'admin': 2
    };

    const userLevel = roleHierarchy[userRole as keyof typeof roleHierarchy] ?? 0;
    const requiredLevel = roleHierarchy[requiredRole as keyof typeof roleHierarchy] ?? 0;

    return userLevel >= requiredLevel;
  };

  const checkTierRequirement = (userTier: string, requiredTier: string): boolean => {
    const tierHierarchy = {
      'free': 0,
      'pro': 1,
      'max': 2
    };

    const userLevel = tierHierarchy[userTier as keyof typeof tierHierarchy] ?? 0;
    const requiredLevel = tierHierarchy[requiredTier as keyof typeof tierHierarchy] ?? 0;

    return userLevel >= requiredLevel;
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Crown className="h-4 w-4 text-yellow-500" />;
      case 'moderator':
        return <Shield className="h-4 w-4 text-blue-500" />;
      default:
        return <User className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTierBadge = (tier: string) => {
    switch (tier) {
      case 'free':
        return <Badge variant="secondary">Free</Badge>;
      case 'pro':
        return <Badge className="bg-purple-100 text-purple-800">Pro</Badge>;
      case 'max':
        return <Badge className="bg-yellow-100 text-yellow-800">Max</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  if (hasAccess) {
    return <>{children}</>;
  }

  // Access denied - show appropriate message and upgrade options
  if (fallback) {
    return <>{fallback}</>;
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center space-x-2">
          <Lock className="h-5 w-5 text-orange-500" />
          <span>Access Restricted</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Status */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold mb-3">Your Current Access</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center space-x-2">
              {getRoleIcon(user.role)}
              <span>Role: {user.role}</span>
            </div>
            <div className="flex items-center space-x-2">
              {getTierBadge(user.subscriptionTier)}
              <span>Plan</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`h-2 w-2 rounded-full ${
                user.accountStatus === 'active' ? 'bg-green-500' : 'bg-orange-500'
              }`} />
              <span>Status: {user.accountStatus}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span>${accessRules.maxApiUsage} API limit</span>
            </div>
          </div>
        </div>

        {/* Requirements */}
        <Alert className="border-orange-200 bg-orange-50">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            <strong>This feature requires:</strong>
            <ul className="mt-2 space-y-1">
              {requiredRole !== 'user' && (
                <li>• {requiredRole} role or higher</li>
              )}
              {requiredTier !== 'free' && (
                <li>• {requiredTier} subscription plan or higher</li>
              )}
              {requiredStatus !== user.accountStatus && (
                <li>• {requiredStatus} account status</li>
              )}
            </ul>
          </AlertDescription>
        </Alert>

        {/* Upgrade Options */}
        <div className="space-y-3">
          {requiredTier !== 'free' && user.subscriptionTier === 'free' && (
            <Button
              onClick={onUpgrade}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              size="lg"
            >
              <TrendingUp className="mr-2 h-4 w-4" />
              Upgrade to {requiredTier} Plan
            </Button>
          )}

          {user.accountStatus === 'pending' && (
            <Button
              onClick={() => {
                toast({
                  title: "Check Your Email",
                  description: "Please verify your email address to activate your account.",
                });
              }}
              variant="outline"
              className="w-full"
            >
              <Settings className="mr-2 h-4 w-4" />
              Activate Account
            </Button>
          )}

          {requiredRole !== 'user' && user.role === 'user' && (
            <Alert>
              <AlertDescription>
                Role upgrades are managed by administrators. Contact support if you believe you should have {requiredRole} access.
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Feature Benefits */}
        {requiredTier !== 'free' && (
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">What you'll unlock:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              {requiredTier === 'pro' && (
                <>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="h-3 w-3" />
                    <span>Access to 3 specialized AI advisors</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="h-3 w-3" />
                    <span>Interactive decision trees</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="h-3 w-3" />
                    <span>$1.30 API usage limit (65% of max)</span>
                  </li>
                </>
              )}
              {requiredTier === 'max' && (
                <>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="h-3 w-3" />
                    <span>Unlimited AI advisors</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="h-3 w-3" />
                    <span>All features unlocked</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="h-3 w-3" />
                    <span>$5.00 API usage limit</span>
                  </li>
                </>
              )}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Hook for checking specific permissions
export function useUserPermissions(user: UserType) {
  const [permissions, setPermissions] = useState<AccessRules>({
    canAccessDecisionTrees: false,
    canAccessMultipleAdvisors: false,
    canAccessAnalytics: false,
    canAccessAdminPanel: false,
    canModerateContent: false,
    maxApiUsage: 0.20,
    maxAdvisors: 1
  });

  useEffect(() => {
    const calculateAccessRules = (user: UserType): AccessRules => {
      const baseRules = {
        canAccessDecisionTrees: false,
        canAccessMultipleAdvisors: false,
        canAccessAnalytics: false,
        canAccessAdminPanel: false,
        canModerateContent: false,
        maxApiUsage: 0.20,
        maxAdvisors: 1
      };

      // Role-based permissions
      if (user.role === 'admin') {
        return {
          ...baseRules,
          canAccessDecisionTrees: true,
          canAccessMultipleAdvisors: true,
          canAccessAnalytics: true,
          canAccessAdminPanel: true,
          canModerateContent: true,
          maxApiUsage: 5.0,
          maxAdvisors: 999
        };
      }

      if (user.role === 'moderator') {
        baseRules.canModerateContent = true;
        baseRules.canAccessAnalytics = true;
      }

      // Subscription tier permissions
      switch (user.subscriptionTier) {
        case 'free':
          return {
            ...baseRules,
            maxApiUsage: 0.20,
            maxAdvisors: 1,
            canAccessDecisionTrees: false
          };
        case 'pro':
          return {
            ...baseRules,
            maxApiUsage: 1.30,
            maxAdvisors: 3,
            canAccessDecisionTrees: true,
            canAccessMultipleAdvisors: true
          };
        case 'max':
          return {
            ...baseRules,
            maxApiUsage: 5.0,
            maxAdvisors: 999,
            canAccessDecisionTrees: true,
            canAccessMultipleAdvisors: true,
            canAccessAnalytics: true
          };
        default:
          return baseRules;
      }
    };

    setPermissions(calculateAccessRules(user));
  }, [user]);

  return permissions;
}