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

type UserType = User;

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUserRegistered?: (user: UserType) => void;
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

  const handleRegistrationSuccess = (user: UserType) => {
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
                  const demoUser: UserType = {
                    id: `demo-user-${Date.now()}`,
                    firstName: 'Demo',
                    lastName: 'User',
                    email: 'demo@finapp.com',
                    username: 'demo_user',
                    subscriptionTier: 'free' as const,
                    role: 'user' as const,
                    accountStatus: 'active' as const,
                    emailVerified: true,
                    apiUsage: { used: 0, limit: 0.20 },
                    createdAt: new Date(),
                    updatedAt: new Date(),
                  };
                  handleRegistrationSuccess(demoUser);
                }}
              >
                <ArrowRight className="w-4 h-4 mr-2" />
                Continue as Guest
              </Button>

              {/* Social Login Section */}
              <div className="text-center">
                <div className="text-sm text-gray-500 mb-4">Or sign in with social accounts</div>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    className="flex items-center gap-2"
                    onClick={() => console.log("Google login - coming soon")}
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Google
                  </Button>
                  <Button
                    variant="outline"
                    className="flex items-center gap-2"
                    onClick={() => console.log("Facebook login - coming soon")}
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    Facebook
                  </Button>
                </div>
              </div>

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