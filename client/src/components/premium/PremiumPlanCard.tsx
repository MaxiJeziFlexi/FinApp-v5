import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, X, Crown, Zap, Star, Sparkles } from "lucide-react";

interface PlanFeature {
  name: string;
  included: boolean;
  highlight?: boolean;
}

interface PremiumPlanCardProps {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  currency: string;
  interval: 'month' | 'year';
  description: string;
  features: PlanFeature[];
  apiLimit?: string;
  advisorAccess: number;
  decisionTreeAccess: boolean;
  popular?: boolean;
  recommended?: boolean;
  currentPlan?: boolean;
  onSelect: (planId: string) => void;
  isLoading?: boolean;
}

export default function PremiumPlanCard({
  id,
  name,
  price,
  originalPrice,
  currency,
  interval,
  description,
  features,
  apiLimit,
  advisorAccess,
  decisionTreeAccess,
  popular = false,
  recommended = false,
  currentPlan = false,
  onSelect,
  isLoading = false
}: PremiumPlanCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const getPlanIcon = () => {
    switch (name.toLowerCase()) {
      case 'free':
        return <Star className="h-5 w-5 text-blue-500" />;
      case 'pro':
        return <Zap className="h-5 w-5 text-purple-500" />;
      case 'max':
        return <Crown className="h-5 w-5 text-yellow-500" />;
      default:
        return <Sparkles className="h-5 w-5 text-gray-500" />;
    }
  };

  const getCardClasses = () => {
    let classes = "relative transition-all duration-300 cursor-pointer ";
    
    if (popular) {
      classes += "ring-2 ring-purple-500 shadow-lg scale-105 ";
    } else if (recommended) {
      classes += "ring-2 ring-blue-500 shadow-md ";
    } else if (currentPlan) {
      classes += "ring-2 ring-green-500 bg-green-50 ";
    } else {
      classes += "hover:shadow-lg border ";
    }

    if (isHovered && !currentPlan) {
      classes += "transform scale-102 ";
    }

    return classes;
  };

  const getButtonText = () => {
    if (currentPlan) return "Current Plan";
    if (price === 0) return "Get Started Free";
    return `Upgrade to ${name}`;
  };

  const getButtonVariant = () => {
    if (currentPlan) return "outline";
    if (popular) return "default";
    return "outline";
  };

  return (
    <Card 
      className={getCardClasses()}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Popular/Recommended Badge */}
      {(popular || recommended) && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <Badge 
            className={`${popular ? 'bg-purple-500' : 'bg-blue-500'} text-white px-3 py-1`}
          >
            {popular ? '🔥 Most Popular' : '⭐ Recommended'}
          </Badge>
        </div>
      )}

      <CardHeader className="text-center pb-4">
        <div className="flex items-center justify-center space-x-2 mb-2">
          {getPlanIcon()}
          <CardTitle className="text-xl font-bold">{name}</CardTitle>
        </div>
        
        <div className="space-y-1">
          <div className="flex items-center justify-center space-x-2">
            <span className="text-3xl font-bold">
              {currency === 'USD' ? '$' : currency}
              {price}
            </span>
            {originalPrice && originalPrice > price && (
              <span className="text-lg text-muted-foreground line-through">
                ${originalPrice}
              </span>
            )}
            <span className="text-muted-foreground">/{interval}</span>
          </div>
          
          {apiLimit && (
            <div className="text-sm text-muted-foreground">
              {apiLimit} API usage limit
            </div>
          )}
        </div>
        
        <CardDescription className="text-sm">{description}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Key Stats */}
        <div className="grid grid-cols-2 gap-4 text-center">
          <div className="space-y-1">
            <div className="text-lg font-semibold text-primary">
              {advisorAccess === 999 ? '∞' : advisorAccess}
            </div>
            <div className="text-xs text-muted-foreground">
              AI Advisor{advisorAccess !== 1 ? 's' : ''}
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-lg font-semibold text-primary">
              {decisionTreeAccess ? '✓' : '✗'}
            </div>
            <div className="text-xs text-muted-foreground">
              Decision Trees
            </div>
          </div>
        </div>

        {/* Features List */}
        <div className="space-y-3">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className={`flex items-center space-x-3 ${
                feature.highlight ? 'bg-blue-50 p-2 rounded-lg' : ''
              }`}
            >
              {feature.included ? (
                <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
              ) : (
                <X className="h-4 w-4 text-gray-300 flex-shrink-0" />
              )}
              <span 
                className={`text-sm ${
                  feature.included ? 'text-foreground' : 'text-muted-foreground'
                } ${feature.highlight ? 'font-medium' : ''}`}
              >
                {feature.name}
              </span>
            </div>
          ))}
        </div>

        {/* Action Button */}
        <Button
          onClick={() => onSelect(id)}
          disabled={currentPlan || isLoading}
          variant={getButtonVariant()}
          className={`w-full h-12 font-medium ${
            popular ? 'bg-purple-600 hover:bg-purple-700' : ''
          }`}
          size="lg"
        >
          {isLoading ? (
            <div className="flex items-center space-x-2">
              <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
              <span>Processing...</span>
            </div>
          ) : (
            getButtonText()
          )}
        </Button>

        {/* Additional Info */}
        {price > 0 && !currentPlan && (
          <div className="text-xs text-center text-muted-foreground">
            {interval === 'year' ? 'Billed annually' : 'Billed monthly'} • Cancel anytime
          </div>
        )}
      </CardContent>
    </Card>
  );
}