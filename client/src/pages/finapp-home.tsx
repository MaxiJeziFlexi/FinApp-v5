import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Link } from "wouter";
import { 
  User, 
  MessageSquare, 
  TrendingUp, 
  Target, 
  Award, 
  Brain, 
  BarChart3, 
  Activity,
  Zap,
  Globe,
  Users,
  BookOpen,
  Crown,
  Settings,
  ShieldCheck,
  LogOut
} from "lucide-react";

import { useAuth } from "@/hooks/useAuth";
import RoleBasedAccess, { useUserPermissions } from "@/components/auth/RoleBasedAccess";
import UserProfileDropdown from "@/components/auth/UserProfileDropdown";
import UserSettingsModal from "@/components/settings/UserSettingsModal";


import OnboardingForm from "@/components/financial/OnboardingForm";
import AdvisorSelection from "@/components/financial/AdvisorSelection";
import DecisionTreeView from "@/components/financial/DecisionTreeView";
import ChatWindow from "@/components/financial/ChatWindow";
import AchievementNotification from "@/components/financial/AchievementNotification";
import { FinancialVisualizations3D } from "@/components/financial/FinancialVisualizations3D";
import { AdvancedAnalyticsDashboard } from "@/components/financial/AdvancedAnalyticsDashboard";

import type { UserProfile, User as UserType } from "@shared/schema";

type AppFlow = 'onboarding' | 'advisor-selection' | 'decision-tree' | 'chat' | 'analytics';

export default function FinAppHome() {
  const [currentFlow, setCurrentFlow] = useState<AppFlow>('onboarding');
  const [selectedAdvisor, setSelectedAdvisor] = useState<string | null>(null);
  const [userId] = useState(() => `user-${Math.random().toString(36).substring(2, 15)}-${Math.random().toString(36).substring(2, 15)}`);
  const [showAchievement, setShowAchievement] = useState<string | null>(null);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  
  // Get authenticated user
  const { user: currentUser, isLoading: authLoading, isAuthenticated, isAdmin } = useAuth();

  // Redirect to landing page if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      window.location.href = '/';
    }
  }, [authLoading, isAuthenticated]);

  // Track user engagement analytics
  useEffect(() => {
    const trackEvent = async (eventType: string, data: any) => {
      try {
        await fetch('/api/analytics/track-event', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            eventType,
            eventData: data,
            timeSpent: Date.now() - (window as any).pageLoadTime,
            interactionCount: 1,
            learningPath: currentFlow
          })
        });
      } catch (error) {
        console.warn('Failed to track event:', error);
      }
    };

    // Set page load time
    if (!(window as any).pageLoadTime) {
      (window as any).pageLoadTime = Date.now();
    }

    // Track page view
    trackEvent('page_view', { 
      flow: currentFlow, 
      advisor: selectedAdvisor,
      timestamp: new Date().toISOString()
    });

    return () => {
      trackEvent('page_leave', { 
        flow: currentFlow, 
        sessionDuration: Date.now() - (window as any).pageLoadTime 
      });
    };
  }, [currentFlow, selectedAdvisor, userId]);

  // Fetch user profile
  const { data: userProfile, isLoading: profileLoading } = useQuery<UserProfile>({
    queryKey: ['/api/user/profile', userId],
    retry: false,
  });

  // Generate sample data for 3D visualizations
  const generate3DData = () => {
    if (!userProfile) {
      return {
        savingsGoal: 50000,
        currentSavings: 15000,
        monthlyIncome: 5000,
        expenses: [
          { category: 'Housing', amount: 1500, color: '#3b82f6' },
          { category: 'Food', amount: 600, color: '#10b981' },
          { category: 'Transport', amount: 400, color: '#f59e0b' },
          { category: 'Entertainment', amount: 300, color: '#ef4444' },
          { category: 'Savings', amount: 800, color: '#8b5cf6' },
        ],
        projections: Array.from({ length: 12 }, (_, i) => ({
          month: `Month ${i + 1}`,
          value: 15000 + i * 2000 + Math.random() * 1000
        })),
        riskProfile: 'moderate' as const,
        learningProgress: 65,
        engagementScore: 82
      };
    }

    return {
      savingsGoal: userProfile.financialGoal === 'emergency_fund' ? 20000 : 
                   userProfile.financialGoal === 'home_purchase' ? 100000 : 50000,
      currentSavings: userProfile.currentSavings === 'high' ? 25000 : 
                      userProfile.currentSavings === 'medium' ? 10000 : 2000,
      monthlyIncome: userProfile.monthlyIncome === 'high' ? 8000 :
                     userProfile.monthlyIncome === 'medium' ? 5000 : 3000,
      expenses: [
        { category: 'Housing', amount: 1500, color: '#3b82f6' },
        { category: 'Food', amount: 600, color: '#10b981' },
        { category: 'Transport', amount: 400, color: '#f59e0b' },
        { category: 'Entertainment', amount: 300, color: '#ef4444' },
        { category: 'Savings', amount: 800, color: '#8b5cf6' },
      ],
      projections: Array.from({ length: 12 }, (_, i) => ({
        month: `Month ${i + 1}`,
        value: (userProfile.currentSavings === 'high' ? 25000 : 10000) + i * 1500
      })),
      riskProfile: (userProfile.riskTolerance as 'conservative' | 'moderate' | 'aggressive') || 'moderate',
      learningProgress: userProfile.progress || 45,
      engagementScore: (userProfile.engagementMetrics as any)?.score || 75
    };
  };

  const handleFlowChange = (newFlow: AppFlow) => {
    setCurrentFlow(newFlow);
  };

  const handleAdvisorSelected = (advisorId: string) => {
    setSelectedAdvisor(advisorId);
    setCurrentFlow('decision-tree');
  };

  const handleDecisionTreeComplete = () => {
    setCurrentFlow('chat');
    setShowAchievement('decision_tree_complete');
  };

  const handleLogout = () => {
    // Clear authentication data
    localStorage.removeItem('finapp_admin_auth');
    localStorage.removeItem('finapp_user_auth');
    // Redirect to landing page
    window.location.href = '/';
  };

  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Brain className="w-12 h-12 mx-auto mb-4 text-blue-600 animate-pulse" />
          <div className="text-xl font-semibold mb-2">FinApp is Loading</div>
          <div className="text-gray-600">Initializing your personalized financial education experience...</div>
        </div>
      </div>
    );
  }

  // Show loading if not authenticated (will redirect)
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl font-semibold mb-2">Redirecting...</div>
          <div className="text-gray-600">Please sign in to access FinApp</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-green-500 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Globe className="w-8 h-8" />
              <h1 className="text-4xl font-bold">FinApp</h1>
              <Badge variant="secondary" className="bg-white/20 text-white">
                AI-Powered
              </Badge>
            </div>
            <p className="text-xl mb-2">The World's Most Advanced AI Financial Education Platform</p>
            <p className="text-sm opacity-80">The biggest learning AI financial experiment that will revolutionize financial education globally</p>
            
            {/* Live Statistics */}
            <div className="flex items-center justify-center gap-8 mt-6">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                <span className="text-sm">10,000+ Active Learners</span>
              </div>
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 animate-pulse" />
                <span className="text-sm">Real-time AI Learning</span>
              </div>
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                <span className="text-sm">Advanced Analytics</span>
              </div>
            </div>
            
            {/* User Status and Navigation */}
            <div className="flex items-center justify-center gap-4 mt-6">
              <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-lg">
                {isAdmin ? (
                  <ShieldCheck className="w-5 h-5 text-yellow-300" />
                ) : (
                  <User className="w-5 h-5" />
                )}
                <span className="font-medium">
                  {isAdmin ? 'Administrator' : 'User'}: {currentUser?.email}
                </span>
                <Badge variant="secondary" className="bg-white/20 text-white">
                  {currentUser?.subscriptionTier === 'max' ? 'Max Plan' : 
                   currentUser?.subscriptionTier === 'pro' ? 'Pro Plan' : 'Free Plan'}
                </Badge>
              </div>
              
              {/* Admin Navigation */}
              {isAdmin && (
                <div className="flex items-center gap-2">
                  <Link href="/admin-dashboard">
                    <Button
                      variant="outline"
                      className="bg-white/10 border-white/20 text-white hover:bg-white/20 flex items-center gap-2"
                    >
                      <Settings className="w-4 h-4" />
                      Admin Panel
                    </Button>
                  </Link>
                  <Link href="/developer-diagnostics">
                    <Button
                      variant="outline"
                      className="bg-white/10 border-white/20 text-white hover:bg-white/20 flex items-center gap-2"
                    >
                      <Activity className="w-4 h-4" />
                      Diagnostics
                    </Button>
                  </Link>
                </div>
              )}

              <Button
                onClick={handleLogout}
                variant="outline"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20 flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </Button>
            </div>
            
            {/* User Profile Section for Header */}
            {currentUser && (
              <div className="flex items-center justify-center mt-6">
                <div className="flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
                  <div className="text-center">
                    <p className="text-sm font-medium">Welcome back, {currentUser.firstName || 'User'}!</p>
                    <p className="text-xs opacity-80">
                      {currentUser.subscriptionTier === 'free' ? 'Free Plan' : 
                       currentUser.subscriptionTier === 'pro' ? 'Pro Member' : 'Premium Member'}
                    </p>
                  </div>
                  <UserProfileDropdown
                    user={currentUser}
                    onLogout={handleLogout}
                    onOpenSettings={() => setShowSettingsModal(true)}
                    onOpenSubscription={() => window.location.href = '/checkout'}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Enhanced Navigation */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <Tabs value={currentFlow} onValueChange={(value: any) => handleFlowChange(value)}>
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger 
                  value="onboarding" 
                  className="flex items-center gap-2"
                  disabled={userProfile?.onboardingComplete || false}
                >
                  <User className="w-4 h-4" />
                  Smart Profile
                </TabsTrigger>
                <TabsTrigger 
                  value="advisor-selection" 
                  className="flex items-center gap-2"
                  disabled={!userProfile?.onboardingComplete}
                >
                  <Target className="w-4 h-4" />
                  AI Advisors
                </TabsTrigger>
                <TabsTrigger 
                  value="decision-tree" 
                  className="flex items-center gap-2"
                  disabled={!selectedAdvisor}
                >
                  <TrendingUp className="w-4 h-4" />
                  Decision Tree
                </TabsTrigger>
                <TabsTrigger 
                  value="chat" 
                  className="flex items-center gap-2"
                  disabled={!selectedAdvisor}
                >
                  <MessageSquare className="w-4 h-4" />
                  AI Chat
                </TabsTrigger>
                <TabsTrigger 
                  value="analytics" 
                  className="flex items-center gap-2"
                >
                  <BarChart3 className="w-4 h-4" />
                  Analytics
                </TabsTrigger>
              </TabsList>

              <TabsContent value="onboarding" className="space-y-6">
                <Alert>
                  <Brain className="h-4 w-4" />
                  <AlertDescription>
                    <strong>AI-Enhanced Onboarding:</strong> Our advanced profiling system analyzes your responses to create a personalized learning experience with behavioral pattern recognition.
                  </AlertDescription>
                </Alert>
                <OnboardingForm 
                  userId={userId} 
                  onComplete={() => handleFlowChange('advisor-selection')} 
                />
              </TabsContent>

              <TabsContent value="advisor-selection" className="space-y-6">
                <Alert>
                  <Zap className="h-4 w-4" />
                  <AlertDescription>
                    <strong>AI Advisor Ecosystem:</strong> Choose from specialized financial education modules powered by advanced AI models and real-time learning analytics.
                  </AlertDescription>
                </Alert>
                <AdvisorSelection 
                  userId={userId} 
                  onAdvisorSelected={handleAdvisorSelected} 
                />
              </TabsContent>

              <TabsContent value="decision-tree" className="space-y-6">
                <Alert>
                  <TrendingUp className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Interactive Decision Trees:</strong> Gamified financial decision-making with real-time feedback, learning analytics, and personalized pathways.
                  </AlertDescription>
                </Alert>
                {selectedAdvisor ? (
                  // Show based on user subscription
                  isAdmin || currentUser?.subscriptionTier === 'max' || currentUser?.subscriptionTier === 'pro' ? (
                    <DecisionTreeView
                      userId={userId}
                      advisorId={selectedAdvisor}
                      onComplete={handleDecisionTreeComplete}
                    />
                  ) : (
                    <Alert className="border-orange-200 bg-orange-50">
                      <AlertDescription>
                        <Crown className="w-4 h-4 inline mr-2" />
                        Decision trees are available for Pro and Max plan users. Free users have access to basic advisor chat.
                        <Link href="/checkout">
                          <Button variant="link" className="p-0 h-auto ml-2">Upgrade to Pro</Button>
                        </Link>
                      </AlertDescription>
                    </Alert>
                  )
                ) : (
                  <Alert>
                    <AlertDescription>
                      Please select an advisor first to access decision trees.
                    </AlertDescription>
                  </Alert>
                )}
              </TabsContent>

              <TabsContent value="chat" className="space-y-6">
                <Alert>
                  <MessageSquare className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Intelligent Chat System:</strong> Context-aware AI conversations with sentiment analysis, learning progress tracking, and personalized financial education.
                  </AlertDescription>
                </Alert>
                {selectedAdvisor && (
                  <ChatWindow
                    userId={userId}
                    advisorId={selectedAdvisor}
                    userProfile={userProfile}
                  />
                )}
              </TabsContent>

              <TabsContent value="analytics" className="space-y-6">
                <Alert>
                  <BarChart3 className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Advanced Analytics Dashboard:</strong> Comprehensive behavioral analysis, AI model performance tracking, and real-time learning insights for the biggest financial education experiment.
                  </AlertDescription>
                </Alert>
                
                {/* 3D Financial Visualizations */}
                <FinancialVisualizations3D data={generate3DData()} />
                
                {/* Advanced Analytics Dashboard */}
                <AdvancedAnalyticsDashboard userId={userId} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Achievement Notifications */}
        {showAchievement && (
          <AchievementNotification
            achievementId={showAchievement}
            onClose={() => setShowAchievement(null)}
          />
        )}

        {/* Premium Upgrade CTA for non-premium users */}
        {currentUser && currentUser.subscriptionTier === 'free' && !isAdmin && (
          <Card className="mt-8 bg-gradient-to-r from-purple-600 to-pink-600 text-white">
            <CardContent className="p-6 text-center">
              <Crown className="w-12 h-12 mx-auto mb-4 text-yellow-300" />
              <h3 className="text-2xl font-bold mb-2">Unlock Premium AI Features</h3>
              <p className="mb-4 opacity-90">
                Get unlimited AI advisors, advanced analytics, and priority learning features
              </p>
              <Link href="/checkout">
                <Button className="bg-white text-purple-600 hover:bg-gray-100 font-semibold">
                  <Crown className="w-4 h-4 mr-2" />
                  Upgrade to Premium
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Footer - Data Collection Notice */}
        <Card className="mt-8">
          <CardContent className="p-4">
            <div className="text-center text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Activity className="w-4 h-4 text-green-500 animate-pulse" />
                <span className="font-medium">Live Data Collection & AI Learning Active</span>
              </div>
              <p>
                FinApp continuously collects behavioral data to improve AI model accuracy and advance financial education research. 
                All data is anonymized and used to create the world's most comprehensive financial learning dataset.
              </p>
              <div className="flex items-center justify-center gap-4 mt-2">
                <Badge variant="outline">Privacy Protected</Badge>
                <Badge variant="outline">AI Model Training</Badge>
                <Badge variant="outline">Global Research</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User Settings Modal */}
      {currentUser && (
        <UserSettingsModal
          isOpen={showSettingsModal}
          onClose={() => setShowSettingsModal(false)}
          user={currentUser}
        />
      )}

      {/* Achievement Notifications */}
      {showAchievement && (
        <AchievementNotification
          achievementId={showAchievement}
          onClose={() => setShowAchievement(null)}
        />
      )}
    </div>
  );
}