import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import {
  Crown,
  Star,
  Zap,
  Check,
  X,
  TrendingUp,
  BarChart3,
  MessageSquare,
  Shield,
  Smartphone,
  Headphones,
  Brain,
  Globe,
  Sparkles
} from "lucide-react";
import type { SubscriptionPlan } from "@shared/schema";

interface PremiumSubscriptionPlansProps {
  currentTier?: 'free' | 'premium' | 'pro';
  userId: string;
  onSuccess?: (plan: SubscriptionPlan) => void;
  onClose?: () => void;
}

export default function PremiumSubscriptionPlans({ 
  currentTier = 'free', 
  userId, 
  onSuccess, 
  onClose 
}: PremiumSubscriptionPlansProps) {
  const [billingInterval, setBillingInterval] = useState<'month' | 'year'>('month');
  const { toast } = useToast();

  // Fetch available subscription plans
  const { data: plans, isLoading } = useQuery<SubscriptionPlan[]>({
    queryKey: ['/api/subscription/plans'],
    retry: false,
  });

  // Subscribe mutation
  const subscribeMutation = useMutation({
    mutationFn: async (planId: string) => {
      const response = await apiRequest("POST", "/api/subscription/create", {
        userId,
        planId,
        billingInterval,
      });
      return await response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Subscription Updated!",
        description: "Redirecting to payment...",
      });
      onSuccess?.(data);
    },
    onError: (error: any) => {
      toast({
        title: "Subscription Failed",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    },
  });

  // Default plans if API is not available
  const defaultPlans: SubscriptionPlan[] = [
    {
      id: 'free',
      name: 'Free',
      description: 'Perfect for getting started with AI financial education',
      price: "0",
      currency: 'USD',
      interval: 'month' as const,
      features: {
        aiAdvisors: 1,
        analysisReports: 3,
        portfolioTracking: false,
        premiumSupport: false,
        advancedAnalytics: false,
        apiAccess: false,
        customDashboards: false,
        priorityLearning: false,
      },
      stripePriceId: null,
      active: true,
      createdAt: new Date(),
    },
    {
      id: 'premium',
      name: 'Premium',
      description: 'Enhanced AI learning with advanced analytics and priority support',
      price: billingInterval === 'month' ? "1999" : "19990", // $19.99/month or $199.99/year
      currency: 'USD',
      interval: billingInterval,
      features: {
        aiAdvisors: 5,
        analysisReports: 25,
        portfolioTracking: true,
        premiumSupport: true,
        advancedAnalytics: true,
        apiAccess: false,
        customDashboards: true,
        priorityLearning: true,
      },
      stripePriceId: 'price_premium',
      active: true,
      createdAt: new Date(),
    },
    {
      id: 'pro',
      name: 'Pro',
      description: 'Complete AI financial education platform with unlimited access',
      price: billingInterval === 'month' ? "4999" : "49990", // $49.99/month or $499.99/year
      currency: 'USD',
      interval: billingInterval,
      features: {
        aiAdvisors: 999,
        analysisReports: 999,
        portfolioTracking: true,
        premiumSupport: true,
        advancedAnalytics: true,
        apiAccess: true,
        customDashboards: true,
        priorityLearning: true,
      },
      stripePriceId: 'price_pro',
      active: true,
      createdAt: new Date(),
    },
  ];

  const displayPlans = plans || defaultPlans;

  const formatPrice = (price: string, currency: string, interval: string) => {
    const amount = parseInt(price) / 100;
    if (amount === 0) return 'Free';
    
    const formatted = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
    
    return `${formatted}/${interval}`;
  };

  const getPlanIcon = (planId: string) => {
    switch (planId) {
      case 'pro':
        return <Crown className="w-6 h-6 text-purple-600" />;
      case 'premium':
        return <Star className="w-6 h-6 text-gold-600" />;
      default:
        return <Zap className="w-6 h-6 text-blue-600" />;
    }
  };

  const getPlanColor = (planId: string) => {
    switch (planId) {
      case 'pro':
        return 'border-purple-200 bg-gradient-to-br from-purple-50 to-white';
      case 'premium':
        return 'border-yellow-200 bg-gradient-to-br from-yellow-50 to-white';
      default:
        return 'border-gray-200 bg-white';
    }
  };

  const getFeatureList = (features: any) => [
    {
      name: `${features.aiAdvisors === 999 ? 'Unlimited' : features.aiAdvisors} AI Advisor${features.aiAdvisors > 1 ? 's' : ''}`,
      icon: <Brain className="w-4 h-4" />,
      included: true,
    },
    {
      name: `${features.analysisReports === 999 ? 'Unlimited' : features.analysisReports} Analysis Reports/month`,
      icon: <BarChart3 className="w-4 h-4" />,
      included: true,
    },
    {
      name: 'Portfolio Tracking',
      icon: <TrendingUp className="w-4 h-4" />,
      included: features.portfolioTracking,
    },
    {
      name: 'Advanced Analytics',
      icon: <BarChart3 className="w-4 h-4" />,
      included: features.advancedAnalytics,
    },
    {
      name: 'Custom Dashboards',
      icon: <Sparkles className="w-4 h-4" />,
      included: features.customDashboards,
    },
    {
      name: 'Priority AI Learning',
      icon: <Zap className="w-4 h-4" />,
      included: features.priorityLearning,
    },
    {
      name: 'Premium Support',
      icon: <Headphones className="w-4 h-4" />,
      included: features.premiumSupport,
    },
    {
      name: 'API Access',
      icon: <Globe className="w-4 h-4" />,
      included: features.apiAccess,
    },
  ];

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="h-32 bg-gray-100 rounded-t-lg" />
            <CardContent className="h-64 bg-gray-50" />
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-2">Choose Your FinApp Experience</h2>
        <p className="text-gray-600 mb-6">
          Unlock the full power of AI-driven financial education and join the biggest learning experiment in finance
        </p>
        
        {/* Billing Toggle */}
        <div className="flex items-center justify-center gap-4 p-4 bg-gray-50 rounded-lg">
          <span className={`text-sm font-medium ${billingInterval === 'month' ? 'text-gray-900' : 'text-gray-500'}`}>
            Monthly
          </span>
          <Switch
            checked={billingInterval === 'year'}
            onCheckedChange={(checked) => setBillingInterval(checked ? 'year' : 'month')}
          />
          <span className={`text-sm font-medium ${billingInterval === 'year' ? 'text-gray-900' : 'text-gray-500'}`}>
            Yearly
          </span>
          {billingInterval === 'year' && (
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              Save 20%
            </Badge>
          )}
        </div>
      </div>

      {/* Plans Grid */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        {displayPlans.map((plan) => {
          const isCurrentPlan = plan.id === currentTier;
          const isPro = plan.id === 'pro';
          const featureList = getFeatureList(plan.features);
          
          return (
            <Card 
              key={plan.id} 
              className={`relative ${getPlanColor(plan.id)} ${
                isPro ? 'ring-2 ring-purple-200 shadow-lg scale-105' : 'shadow-sm'
              }`}
            >
              {isPro && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-purple-600 text-white px-4 py-1">
                    Most Popular
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center pb-2">
                <div className="flex justify-center mb-3">
                  {getPlanIcon(plan.id)}
                </div>
                <CardTitle className="text-xl mb-1">{plan.name}</CardTitle>
                <div className="text-3xl font-bold mb-1">
                  {formatPrice(plan.price, plan.currency, plan.interval)}
                </div>
                {parseInt(plan.price) > 0 && billingInterval === 'year' && (
                  <p className="text-sm text-gray-500">
                    ${(parseInt(plan.price) / 100 / 12).toFixed(2)} per month, billed annually
                  </p>
                )}
                <CardDescription className="mt-2">{plan.description}</CardDescription>
              </CardHeader>

              <CardContent className="pt-4">
                <div className="space-y-3 mb-6">
                  {featureList.map((feature, index) => (
                    <div key={index} className="flex items-center gap-3">
                      {feature.included ? (
                        <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                      ) : (
                        <X className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      )}
                      <div className="flex items-center gap-2">
                        {feature.icon}
                        <span className={`text-sm ${feature.included ? 'text-gray-900' : 'text-gray-400'}`}>
                          {feature.name}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <Button
                  className="w-full"
                  variant={isPro ? 'default' : isCurrentPlan ? 'outline' : 'outline'}
                  disabled={isCurrentPlan || subscribeMutation.isPending}
                  onClick={() => !isCurrentPlan && subscribeMutation.mutate(plan.id)}
                >
                  {isCurrentPlan 
                    ? 'Current Plan' 
                    : subscribeMutation.isPending 
                    ? 'Processing...' 
                    : parseInt(plan.price) === 0 
                    ? 'Get Started' 
                    : `Upgrade to ${plan.name}`
                  }
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* AI Learning Experiment Info */}
      <Alert className="mb-6">
        <Brain className="h-4 w-4" />
        <AlertDescription>
          <strong>Join the AI Financial Revolution:</strong> All premium subscriptions contribute to the world's largest AI financial education experiment. Your learning data helps improve AI models for global financial literacy while you get personalized insights and advanced features.
        </AlertDescription>
      </Alert>

      {/* FAQ or Additional Info */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-8 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            <span>30-day money-back guarantee</span>
          </div>
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4" />
            <span>Cancel anytime</span>
          </div>
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            <span>24/7 support</span>
          </div>
        </div>
        
        <p className="text-xs text-gray-500">
          All subscriptions include access to our AI financial education experiment data and contribute to advancing global financial literacy through machine learning.
        </p>
      </div>

      {onClose && (
        <div className="text-center mt-6">
          <Button variant="ghost" onClick={onClose}>
            Maybe Later
          </Button>
        </div>
      )}
    </div>
  );
}