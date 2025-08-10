import { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { Link, useLocation } from 'wouter';
import { 
  Brain, 
  Target, 
  BarChart3, 
  MessageSquare, 
  Trophy, 
  Settings, 
  LogOut,
  User,
  Activity,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import AdvisorSelection from '@/components/financial/AdvisorSelection';
import { PersonalizedDecisionTreeView } from '@/components/financial/PersonalizedDecisionTreeView';
import EnhancedChatWindow from '@/components/chat/EnhancedChatWindow';
import UserSettingsModal from '@/components/settings/UserSettingsModal';
import { useToast } from '@/hooks/use-toast';
import type { UserProfile, Advisor } from '@/shared/schema';

interface UserProfileType {
  id: string;
  userId: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  onboardingComplete?: boolean;
  financialGoals?: {
    primaryGoal?: string;
    timeHorizon?: string;
    riskTolerance?: string;
    monthlyIncome?: number;
    monthlyExpenses?: number;
    currentSavings?: number;
    savingsGoal?: number;
  };
}

export default function FinAppHome() {
  const { isAuthenticated, user: currentUser, isLoading: authLoading, isAdmin } = useAuth();
  
  const logout = () => {
    localStorage.removeItem('finapp_admin_auth');
    localStorage.removeItem('finapp_user_auth');
    window.location.reload();
  };
  
  const [location, setLocation] = useLocation();
  const [currentFlow, setCurrentFlow] = useState('onboarding');
  const [selectedAdvisor, setSelectedAdvisor] = useState<Advisor | null>(null);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const { toast } = useToast();

  // Analytics tracking
  const trackEvent = useCallback(async (eventType: string, data: any) => {
    if (!currentUser?.id) return;
    
    try {
      await fetch('/api/analytics/track-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
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
  }, [currentUser?.id, currentFlow]);

  useEffect(() => {
    if (!(window as any).pageLoadTime) {
      (window as any).pageLoadTime = Date.now();
    }

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
  }, [currentFlow, selectedAdvisor, currentUser?.id]);

  // User profile
  const userId = currentUser?.id ?? null;
  
  const { data: userProfile, isLoading: profileLoading } = useQuery<UserProfileType | undefined>({
    queryKey: ['userProfile', userId],
    enabled: !!userId,
    queryFn: async () => {
      const res = await fetch(`/api/user/profile?userId=${encodeURIComponent(userId as string)}`);
      if (!res.ok) return undefined;
      return res.json();
    },
    retry: 1,
  });

  // Navigation handlers
  const handleFlowChange = (newFlow: string) => {
    setCurrentFlow(newFlow);
    trackEvent('navigation_change', { from: currentFlow, to: newFlow });
  };

  const handleAdvisorSelect = (advisor: Advisor) => {
    setSelectedAdvisor(advisor);
    setCurrentFlow('decision-tree');
    trackEvent('advisor_selected', { advisorId: advisor.id, advisorName: advisor.name });
    toast({
      title: `${advisor.name} Selected`,
      description: `Your AI advisor ${advisor.name} is now ready to help you!`
    });
  };

  const handleLogout = async () => {
    trackEvent('logout', { sessionDuration: Date.now() - (window as any).pageLoadTime });
    await logout();
    setLocation('/auth');
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Brain className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">FinApp Dashboard</h1>
                <p className="text-gray-600">Your personalized financial education platform</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {isAdmin && (
                <div className="flex items-center space-x-2">
                  <Link href="/admin-dashboard">
                    <Button variant="outline" size="sm">
                      <Settings className="w-4 h-4 mr-2" />
                      Admin
                    </Button>
                  </Link>
                  <Link href="/developer-diagnostics">
                    <Button variant="outline" size="sm">
                      <Activity className="w-4 h-4 mr-2" />
                      Diagnostics
                    </Button>
                  </Link>
                </div>
              )}

              <Button onClick={handleLogout} variant="outline" size="sm">
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
          
          {/* User Status */}
          {currentUser && (
            <div className="mt-4 flex items-center justify-center">
              <Card className="w-full max-w-md">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">
                        Welcome back, {(currentUser as any)?.firstName || 'User'}!
                      </div>
                      <div className="text-sm text-gray-500">
                        {(currentUser as any)?.subscriptionTier === 'free' ? 'Free Plan' : 
                         (currentUser as any)?.subscriptionTier === 'pro' ? 'Pro Member' : 'Premium Member'}
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <span className="text-xs text-gray-500">Online</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Navigation Tabs */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-center">Financial Learning Journey</CardTitle>
            <CardDescription className="text-center">
              Navigate through your personalized financial education experience
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={currentFlow} onValueChange={(value: string) => handleFlowChange(value)}>
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger 
                  value="onboarding" 
                  className="flex items-center gap-2"
                  disabled={userProfile?.onboardingComplete || false}
                >
                  <User className="w-4 h-4" />
                  Profile Setup
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
                  disabled={!selectedAdvisor?.id}
                >
                  <BarChart3 className="w-4 h-4" />
                  Decision Tree
                </TabsTrigger>
                <TabsTrigger 
                  value="chat" 
                  className="flex items-center gap-2"
                  disabled={!selectedAdvisor?.id}
                >
                  <MessageSquare className="w-4 h-4" />
                  AI Chat
                </TabsTrigger>
                <TabsTrigger 
                  value="achievements" 
                  className="flex items-center gap-2"
                >
                  <Trophy className="w-4 h-4" />
                  Achievements
                </TabsTrigger>
              </TabsList>

              <TabsContent value="onboarding" className="mt-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="text-center">
                      <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" />
                      <h3 className="text-xl font-semibold mb-2">Profile Setup Complete</h3>
                      <p className="text-gray-600 mb-4">Your financial profile has been successfully configured</p>
                      <Badge variant="secondary">Setup Complete</Badge>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="advisor-selection" className="mt-6">
                <AdvisorSelection onAdvisorSelect={handleAdvisorSelect} />
              </TabsContent>

              <TabsContent value="decision-tree" className="mt-6">
                {selectedAdvisor ? (
                  <PersonalizedDecisionTreeView 
                    advisorId={selectedAdvisor.id}
                    userId={currentUser?.id}
                  />
                ) : (
                  <Card>
                    <CardContent className="p-6 text-center">
                      <AlertCircle className="w-12 h-12 mx-auto mb-4 text-amber-500" />
                      <p className="text-gray-600">Please select an AI advisor first to access the decision tree</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="chat" className="mt-6">
                {selectedAdvisor ? (
                  <EnhancedChatWindow 
                    advisor={selectedAdvisor}
                    userId={currentUser?.id}
                  />
                ) : (
                  <Card>
                    <CardContent className="p-6 text-center">
                      <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                      <p className="text-gray-600">Select an AI advisor to start chatting</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="achievements" className="mt-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Trophy className="w-5 h-5 text-yellow-500" />
                        Achievements
                      </CardTitle>
                      <CardDescription>Your financial learning milestones</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <CheckCircle className="w-6 h-6 text-green-500" />
                            <span>Profile Setup</span>
                          </div>
                          <Badge variant="secondary">Complete</Badge>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <Clock className="w-6 h-6 text-gray-400" />
                            <span>First AI Session</span>
                          </div>
                          <Badge variant="outline">Pending</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Learning Progress</CardTitle>
                      <CardDescription>Track your financial knowledge growth</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Financial Knowledge</span>
                            <span>25%</span>
                          </div>
                          <Progress value={25} />
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>AI Interactions</span>
                            <span>60%</span>
                          </div>
                          <Progress value={60} />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Premium Upgrade Section */}
        {(currentUser as any)?.subscriptionTier === 'free' && (
          <Card className="mb-8 border-yellow-200 bg-yellow-50">
            <CardContent className="p-6">
              <div className="text-center">
                <h3 className="text-xl font-semibold text-yellow-800 mb-2">Upgrade to Premium</h3>
                <p className="text-yellow-700 mb-4">
                  Unlock advanced AI features and personalized financial insights
                </p>
                <Link href="/premium-upgrade">
                  <Button className="bg-yellow-600 hover:bg-yellow-700 text-white">
                    Upgrade Now
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {showSettingsModal && currentUser && (
        <UserSettingsModal
          isOpen={showSettingsModal}
          onClose={() => setShowSettingsModal(false)}
          user={currentUser as any}
        />
      )}
    </div>
  );
}