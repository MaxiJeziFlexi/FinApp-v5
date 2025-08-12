import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Crown, Zap, ArrowRight, Lock } from "lucide-react";
import { Link } from "wouter";
import { ROUTES } from "@/constants/routes";

interface PremiumPaywallProps {
  title?: string;
  description?: string;
  requiredTier?: "PRO" | "MAX_PRO";
  feature?: string;
}

export default function PremiumPaywall({ 
  title = "Premium Feature",
  description = "This feature requires a premium subscription to access.",
  requiredTier = "PRO",
  feature 
}: PremiumPaywallProps) {
  const tierColors = {
    PRO: "from-purple-500 to-blue-500",
    MAX_PRO: "from-yellow-500 to-orange-500"
  };

  const tierIcons = {
    PRO: <Zap className="h-6 w-6" />,
    MAX_PRO: <Crown className="h-6 w-6" />
  };

  return (
    <div className="flex items-center justify-center min-h-[60vh] p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className={`mx-auto mb-4 p-3 rounded-full bg-gradient-to-r ${tierColors[requiredTier]} text-white w-fit`}>
            <Lock className="h-8 w-8" />
          </div>
          <CardTitle className="text-2xl">{title}</CardTitle>
          <CardDescription className="text-base">
            {description}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <Badge 
            variant="secondary" 
            className={`bg-gradient-to-r ${tierColors[requiredTier]} text-white border-0`}
          >
            {tierIcons[requiredTier]}
            <span className="ml-2">{requiredTier} Required</span>
          </Badge>
          
          <div className="space-y-2">
            <Button asChild className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              <Link href="/upgrade">
                Upgrade to {requiredTier} <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            
            <Button asChild variant="ghost" className="w-full">
              <Link href="/">
                Back to Dashboard
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}