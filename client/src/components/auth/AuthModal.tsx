import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import UserRegistrationForm from "./UserRegistrationForm";
import PremiumSubscriptionPlans from "@/components/premium/PremiumSubscriptionPlans";
import { 
  LogIn, 
  UserPlus, 
  Crown, 
  Sparkles,
  Mail,
  Lock,
  ArrowRight,
  Shield,
  Zap
} from "lucide-react";
import type { User } from "@shared/schema";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUserRegistered?: (user: User) => void;
  defaultTab?: 'signin' | 'signup' | 'premium';
}

export default function AuthModal({ 
  isOpen, 
  onClose, 
  onUserRegistered, 
  defaultTab = 'signup' 
}: AuthModalProps) {
  const [currentTab, setCurrentTab] = useState(defaultTab);
  const [isLoading, setIsLoading] = useState(false);

  const handleRegistrationSuccess = (user: User) => {
    setIsLoading(false);
    onUserRegistered?.(user);
    onClose();
  };

  const handlePremiumUpgrade = () => {
    setCurrentTab('premium');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center">
            <div className="flex items-center justify-center gap-3 mb-2">
              <div className="flex items-center gap-2">
                <Zap className="w-8 h-8 text-blue-600" />
                <span className="text-2xl font-bold">FinApp</span>
              </div>
              <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                AI-Powered Education
              </Badge>
            </div>
            <p className="text-sm text-gray-600 font-normal">
              Join the world's biggest AI financial education experiment
            </p>
          </DialogTitle>
        </DialogHeader>

        <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger 
              value="signin" 
              className="flex items-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              Sign In
            </TabsTrigger>
            <TabsTrigger 
              value="signup" 
              className="flex items-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              Get Started
            </TabsTrigger>
            <TabsTrigger 
              value="premium" 
              className="flex items-center gap-2"
            >
              <Crown className="w-4 h-4" />
              Go Premium
            </TabsTrigger>
          </TabsList>

          {/* Sign In Tab */}
          <TabsContent value="signin" className="space-y-6 mt-6">
            <div className="text-center">
              <Mail className="w-12 h-12 mx-auto mb-4 text-blue-600" />
              <h3 className="text-xl font-semibold mb-2">Welcome Back to FinApp</h3>
              <p className="text-gray-600 mb-6">
                Continue your AI-powered financial education journey
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-blue-900">Demo Mode Available</span>
              </div>
              <p className="text-sm text-blue-800">
                For this demo, you can explore FinApp without signing in. 
                Click "Continue as Guest" below to start your financial education journey.
              </p>
            </div>

            <div className="space-y-4">
              <Button 
                className="w-full" 
                size="lg"
                onClick={() => {
                  // For demo purposes, simulate user login
                  const demoUser = {
                    id: `demo-user-${Date.now()}`,
                    name: 'Demo User',
                    email: 'demo@finapp.com',
                    subscriptionTier: 'free' as const,
                    accountStatus: 'active' as const,
                    preferences: {},
                    createdAt: new Date(),
                    updatedAt: new Date(),
                  };
                  handleRegistrationSuccess(demoUser as User);
                }}
              >
                <ArrowRight className="w-4 h-4 mr-2" />
                Continue as Guest
              </Button>

              <div className="text-center text-sm text-gray-500">
                <p>Full authentication will be available in production</p>
              </div>
            </div>
          </TabsContent>

          {/* Sign Up Tab */}
          <TabsContent value="signup" className="mt-6">
            <UserRegistrationForm 
              onSuccess={handleRegistrationSuccess}
              onClose={onClose}
            />
          </TabsContent>

          {/* Premium Tab */}
          <TabsContent value="premium" className="mt-6">
            <div className="text-center mb-6">
              <Crown className="w-12 h-12 mx-auto mb-4 text-purple-600" />
              <h3 className="text-xl font-semibold mb-2">Unlock Premium Features</h3>
              <p className="text-gray-600">
                Get advanced AI insights, priority learning, and contribute to the biggest financial education experiment
              </p>
            </div>

            <PremiumSubscriptionPlans
              currentTier="free"
              userId="demo-user"
              onSuccess={() => onClose()}
              onClose={onClose}
            />
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <div className="border-t pt-4 mt-6">
          <div className="flex items-center justify-center gap-6 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <Shield className="w-3 h-3" />
              <span>Privacy Protected</span>
            </div>
            <div className="flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              <span>AI-Powered</span>
            </div>
            <div className="flex items-center gap-1">
              <Zap className="w-3 h-3" />
              <span>Global Impact</span>
            </div>
          </div>
          <p className="text-center text-xs text-gray-400 mt-2">
            Join thousands of learners worldwide in revolutionizing financial education through AI
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}