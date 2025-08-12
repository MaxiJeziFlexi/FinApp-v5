import { useLocation } from "wouter";
import PremiumSubscriptionPlans from "@/components/premium/PremiumSubscriptionPlans";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Crown } from "lucide-react";

export default function UpgradePage() {
  const [location] = useLocation();
  const isPricingRoute = location === "/pricing";
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="mx-auto mb-4 p-3 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white w-fit">
            <Crown className="h-8 w-8" />
          </div>
          <h1 className="text-4xl font-bold mb-2">
            {isPricingRoute ? "Choose Your Plan" : "Upgrade to Premium"}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Unlock advanced financial insights and AI-powered tools
          </p>
        </div>
        <PremiumSubscriptionPlans />
      </div>
    </div>
  );
}