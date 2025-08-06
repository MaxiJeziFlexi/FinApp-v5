import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import {
  Shield,
  Crown,
  User,
  AlertTriangle,
  CheckCircle,
  Lock,
  Zap
} from "lucide-react";
import type { User as UserType } from "@shared/schema";

interface AuthenticatedOnboardingProps {
  user: UserType;
  onComplete: () => void;
}

export default function AuthenticatedOnboarding({ 
  user, 
  onComplete 
}: AuthenticatedOnboardingProps) {
  const [isCompleting, setIsCompleting] = useState(false);
  const { toast } = useToast();

  // Check if user has required access levels
  const hasOnboardingAccess = user.accountStatus === 'active' || user.role === 'admin';
  
  const getRoleInfo = (role: string) => {
    switch (role) {
      case 'admin':
        return {
          icon: <Crown className="h-5 w-5 text-yellow-500" />,
          label: 'Administrator',
          description: 'Full access to all features and user management',
          color: 'bg-yellow-50 border-yellow-200 text-yellow-800'
        };
      case 'moderator':
        return {
          icon: <Shield className="h-5 w-5 text-blue-500" />,
          label: 'Moderator',
          description: 'Enhanced access to moderation tools and analytics',
          color: 'bg-blue-50 border-blue-200 text-blue-800'
        };
      case 'user':
      default:
        return {
          icon: <User className="h-5 w-5 text-gray-500" />,
          label: 'User',
          description: 'Standard access based on subscription tier',
          color: 'bg-gray-50 border-gray-200 text-gray-800'
        };
    }
  };

  const getTierInfo = (tier: string) => {
    switch (tier) {
      case 'free':
        return {
          name: 'Free Plan',
          description: 'Basic access to 1 advisor, $0.20 API limit',
          features: ['1 AI Advisor', 'Basic chat only', '$0.20 API usage'],
          color: 'text-gray-600'
        };
      case 'pro':
        return {
          name: 'Pro Plan',
          description: '3 advisors, decision trees, $1.30 API limit',
          features: ['3 AI Advisors', 'Decision trees', '$1.30 API usage'],
          color: 'text-purple-600'
        };
      case 'max':
        return {
          name: 'Max Plan',
          description: 'Unlimited access, all features, $5.00 API limit',
          features: ['All AI Advisors', 'All features', '$5.00 API usage'],
          color: 'text-yellow-600'
        };
      default:
        return {
          name: 'Unknown Plan',
          description: 'Contact support for plan details',
          features: [],
          color: 'text-gray-600'
        };
    }
  };

  const handleCompleteOnboarding = async () => {
    if (!hasOnboardingAccess) {
      toast({
        title: "Access Required",
        description: "You need to activate your account first. Please check your email for verification.",
        variant: "destructive",
      });
      return;
    }

    setIsCompleting(true);
    try {
      // Mark onboarding as complete
      onComplete();
      
      toast({
        title: "Welcome to FinApp!",
        description: "Your account setup is complete. You can now access all available features.",
      });
    } catch (error) {
      toast({
        title: "Setup Error",
        description: "Failed to complete onboarding. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCompleting(false);
    }
  };

  const roleInfo = getRoleInfo(user.role);
  const tierInfo = getTierInfo(user.subscriptionTier);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-foreground">
          Welcome to FinApp!
        </h1>
        <p className="text-muted-foreground text-lg">
          The world's most advanced AI Financial Education Platform
        </p>
      </div>

      {/* Account Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <span>Account Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Role Badge */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                User Role
              </label>
              <div className={`p-3 rounded-lg border ${roleInfo.color}`}>
                <div className="flex items-center space-x-2">
                  {roleInfo.icon}
                  <span className="font-medium">{roleInfo.label}</span>
                </div>
                <p className="text-xs mt-1">{roleInfo.description}</p>
              </div>
            </div>

            {/* Subscription Tier */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                Subscription Plan
              </label>
              <div className="p-3 rounded-lg border bg-white">
                <div className="flex items-center space-x-2">
                  <Zap className={`h-4 w-4 ${tierInfo.color}`} />
                  <span className="font-medium">{tierInfo.name}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {tierInfo.description}
                </p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {tierInfo.features.map((feature, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {feature}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Access Requirements */}
      {!hasOnboardingAccess && (
        <Alert className="border-orange-200 bg-orange-50">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            <strong>Account Activation Required:</strong> Please verify your email address to access the onboarding process and start using FinApp's AI features.
          </AlertDescription>
        </Alert>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col space-y-3">
        <Button
          onClick={handleCompleteOnboarding}
          disabled={!hasOnboardingAccess || isCompleting}
          className="w-full h-12 text-lg font-medium"
          size="lg"
        >
          {isCompleting ? (
            <div className="flex items-center space-x-2">
              <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
              <span>Setting up your account...</span>
            </div>
          ) : hasOnboardingAccess ? (
            'Complete Setup & Enter FinApp'
          ) : (
            <div className="flex items-center space-x-2">
              <Lock className="h-4 w-4" />
              <span>Verify Email to Continue</span>
            </div>
          )}
        </Button>

        {!hasOnboardingAccess && (
          <Button
            variant="outline"
            onClick={() => {
              toast({
                title: "Check Your Email",
                description: "Look for a verification email from FinApp to activate your account.",
              });
            }}
            className="w-full"
          >
            Resend Verification Email
          </Button>
        )}
      </div>

      {/* Feature Access Info */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardContent className="p-6">
          <h3 className="font-semibold text-foreground mb-3">
            What you'll get with FinApp:
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>AI-powered financial advisors</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Interactive decision trees</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Personalized learning paths</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Real-time financial insights</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}