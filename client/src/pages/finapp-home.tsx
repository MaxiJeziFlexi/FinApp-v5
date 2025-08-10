import { useState, useEffect, useCallback, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
  AlertCircle,
  TrendingUp,
  DollarSign,
  Shield,
  Zap,
  Star,
  Crown
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
import type { UserProfile, Advisor, DecisionTreeProgress } from '@/shared/schema';

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
  const queryClient = useQueryClient();

  // Data collection for analytics
  const trackEvent = useCallback((event: string, data: any) => {
    if (!currentUser?.id) return;
    
    try {
      fetch('/api/analytics/track-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          event,
          data,
          timestamp: new Date().toISOString()
        })
      });
    } catch (error) {
      console.log('Analytics tracking failed:', error);
    }
  }, [currentUser?.id]);

  // Initialize analytics tracking
  useEffect(() => {
    if (!currentUser?.id) return;
    
    (window as any).pageLoadTime = Date.now();
    
    trackEvent('page_view', { 
      page: 'dashboard', 
      flow: currentFlow, 
      advisorId: selectedAdvisor?.id 
    });

    // Track page exit
    return () => {
      trackEvent('page_leave', { 
        flow: currentFlow, 
        sessionDuration: Date.now() - (window as any).pageLoadTime 
      });
    };
  }, [currentFlow, selectedAdvisor, currentUser?.id]);

  // Fetch user profile
  const { data: userProfile, isLoading: profileLoading } = useQuery<UserProfile>({
    queryKey: ['/api/user/profile', currentUser?.id],
    retry: false,
  });

  // Generate sample data for 3D visualizations
  const generate3DData = () => {
    if (!userProfile) {
      return {
        savingsGoal: 50000,
        currentSavings: 15000,
        monthlyIncome: 5000,
        monthlyExpenses: 3500,
        riskTolerance: 'moderate',
        investmentHorizon: '10-15 years'
      };
    }

    return {
      savingsGoal: userProfile.financialGoals?.savingsGoal || 50000,
      currentSavings: userProfile.financialGoals?.currentSavings || 15000,
      monthlyIncome: userProfile.financialGoals?.monthlyIncome || 5000,
      monthlyExpenses: userProfile.financialGoals?.monthlyExpenses || 3500,
      riskTolerance: userProfile.financialGoals?.riskTolerance || 'moderate',
      investmentHorizon: userProfile.financialGoals?.investmentHorizon || '10-15 years'
    };
  };

  const financialData = generate3DData();

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
      title: `${advisor.name} Activated`,
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
    <div className="min-h-screen bg-black relative">
      {/* Futuristic Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-purple-500/10 to-blue-500/10"></div>
      <div className="absolute inset-0" style={{
        backgroundImage: `radial-gradient(circle at 25% 25%, rgba(0, 255, 255, 0.1) 0%, transparent 50%), 
                         radial-gradient(circle at 75% 75%, rgba(147, 51, 234, 0.1) 0%, transparent 50%)`
      }}></div>
      
      {/* Neural Header */}
      <div className="relative bg-gradient-to-r from-black/90 via-gray-900/95 to-black/90 backdrop-blur-xl border-b border-cyan-500/30 py-6">
        <div className="container mx-auto px-4">
          <div className="text-center relative z-10">
            {/* Main Neural Interface Title */}
            <div className="flex items-center justify-center mb-6">
              <div className="h-1 w-16 bg-gradient-to-r from-cyan-400 to-blue-600 rounded-full mr-4"></div>
              <div className="text-5xl font-black bg-gradient-to-r from-cyan-400 via-purple-500 to-blue-600 bg-clip-text text-transparent">
                FINAPP NEURAL CORE
              </div>
              <div className="h-1 w-16 bg-gradient-to-r from-blue-600 to-purple-400 rounded-full ml-4"></div>
            </div>
            
            <div className="text-cyan-400 font-mono text-lg tracking-wider mb-4">
              [ QUANTUM FINANCIAL CONSCIOUSNESS SYSTEM ]
            </div>
            
            {/* Neural System Status */}
            <div className="grid grid-cols-3 gap-8 mt-6 max-w-4xl mx-auto">
              <div className="bg-black/30 backdrop-blur-md border border-cyan-500/30 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-cyan-400">10,000+</div>
                <div className="text-gray-300 font-mono text-sm">ACTIVE NEURAL NODES</div>
              </div>
              <div className="bg-black/30 backdrop-blur-md border border-purple-500/30 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-purple-400">99.8%</div>
                <div className="text-gray-300 font-mono text-sm">SYSTEM UPTIME</div>
              </div>
              <div className="bg-black/30 backdrop-blur-md border border-green-500/30 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-green-400">47.2TB</div>
                <div className="text-gray-300 font-mono text-sm">PROCESSED DATA</div>
              </div>
            </div>
            
            {/* Neural Control Panel */}
            <div className="flex items-center justify-center gap-4 mt-8">
              {isAdmin && (
                <div className="flex items-center gap-2">
                  <Link href="/admin-dashboard">
                    <button className="bg-gradient-to-r from-yellow-500 to-orange-600 text-black px-4 py-2 rounded-xl font-bold text-sm tracking-wider hover:shadow-lg transition-all duration-300">
                      <div className="flex items-center gap-2">
                        <Settings className="w-4 h-4" />
                        ADMIN CORE
                      </div>
                    </button>
                  </Link>
                  <Link href="/developer-diagnostics">
                    <button className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-4 py-2 rounded-xl font-bold text-sm tracking-wider hover:shadow-lg transition-all duration-300">
                      <div className="flex items-center gap-2">
                        <Activity className="w-4 h-4" />
                        DIAGNOSTICS
                      </div>
                    </button>
                  </Link>
                </div>
              )}

              <button
                onClick={handleLogout}
                className="bg-gradient-to-r from-red-500 to-pink-600 text-white px-4 py-2 rounded-xl font-bold text-sm tracking-wider hover:shadow-lg transition-all duration-300"
              >
                <div className="flex items-center gap-2">
                  <LogOut className="w-4 h-4" />
                  DISCONNECT
                </div>
              </button>
            </div>
            
            {/* Neural User Status */}
            {currentUser && (
              <div className="flex items-center justify-center mt-6">
                <div className="bg-black/40 backdrop-blur-xl border border-cyan-500/50 rounded-2xl px-6 py-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-full flex items-center justify-center">
                      <div className="text-2xl">👤</div>
                    </div>
                    <div className="text-left">
                      <div className="text-white font-bold tracking-wider">
                        Welcome back, {(currentUser as any)?.firstName || 'User'}!
                      </div>
                      <div className="text-cyan-400 font-mono text-sm">
                        {(currentUser as any)?.subscriptionTier === 'free' ? 'Free Plan' : 
                         (currentUser as any)?.subscriptionTier === 'pro' ? 'Pro Member' : 'Premium Member'}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-gray-300 font-mono text-xs">NEURAL LINK ACTIVE</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Neural Navigation Interface */}
        <div className="bg-gradient-to-r from-gray-900/80 to-black/90 backdrop-blur-xl border border-cyan-500/30 rounded-2xl p-6 mb-8">
          <div className="text-center mb-6">
            <div className="text-cyan-400 font-mono text-sm tracking-wider mb-2">NEURAL INTERFACE SELECTION</div>
            <div className="h-1 w-32 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full mx-auto"></div>
          </div>
          
          <Tabs value={currentFlow} onValueChange={(value: string) => handleFlowChange(value)}>
            <TabsList className="grid w-full grid-cols-5 bg-black/40 border border-cyan-500/20 rounded-xl p-2">
              <TabsTrigger 
                value="onboarding" 
                className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-blue-600 data-[state=active]:text-white text-gray-300 font-mono text-sm transition-all duration-300"
                disabled={userProfile?.onboardingComplete || false}
              >
                <User className="w-4 h-4" />
                NEURAL PROFILE
              </TabsTrigger>
              <TabsTrigger 
                value="advisor-selection" 
                className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-600 data-[state=active]:text-white text-gray-300 font-mono text-sm transition-all duration-300"
                disabled={!userProfile?.onboardingComplete}
              >
                <Target className="w-4 h-4" />
                AI ADVISORS
              </TabsTrigger>
              <TabsTrigger 
                value="decision-tree" 
                className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white text-gray-300 font-mono text-sm transition-all duration-300"
                disabled={!selectedAdvisor?.id}
              >
                <BarChart3 className="w-4 h-4" />
                DECISION MATRIX
              </TabsTrigger>
              <TabsTrigger 
                value="chat" 
                className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-teal-600 data-[state=active]:text-white text-gray-300 font-mono text-sm transition-all duration-300"
                disabled={!selectedAdvisor?.id}
              >
                <MessageSquare className="w-4 h-4" />
                AI COMMUNICATION
              </TabsTrigger>
              <TabsTrigger 
                value="achievements" 
                className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-500 data-[state=active]:to-amber-600 data-[state=active]:text-white text-gray-300 font-mono text-sm transition-all duration-300"
              >
                <Trophy className="w-4 h-4" />
                NEURAL ACHIEVEMENTS
              </TabsTrigger>
            </TabsList>

            <TabsContent value="onboarding" className="mt-6">
              <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 backdrop-blur-md border border-cyan-500/20 rounded-xl p-6">
                <div className="text-center">
                  <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-400" />
                  <h3 className="text-2xl font-bold text-white mb-2">Neural Profile Complete</h3>
                  <p className="text-gray-300 mb-4">Your financial neural network has been successfully initialized</p>
                  <div className="bg-black/30 rounded-lg p-4 border border-green-500/30">
                    <div className="text-green-400 font-mono text-sm">QUANTUM STATUS: PROFILE_OPTIMIZED</div>
                  </div>
                </div>
              </div>
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
                <div className="text-center py-8">
                  <AlertCircle className="w-12 h-12 mx-auto mb-4 text-amber-400" />
                  <p className="text-gray-300">Please select an AI advisor first to access the decision matrix</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="chat" className="mt-6">
              {selectedAdvisor ? (
                <EnhancedChatWindow 
                  advisor={selectedAdvisor}
                  userId={currentUser?.id}
                />
              ) : (
                <div className="text-center py-8">
                  <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-300">Select an AI advisor to start neural communication</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="achievements" className="mt-6">
              <div className="grid gap-6 md:grid-cols-2">
                <Card className="bg-gradient-to-br from-yellow-500/10 to-amber-500/10 border-yellow-500/30">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-yellow-400">
                      <Trophy className="w-5 h-5" />
                      Neural Achievements
                    </CardTitle>
                    <CardDescription className="text-gray-300">Your financial learning milestones</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-black/30 rounded-lg border border-green-500/30">
                        <div className="flex items-center gap-3">
                          <CheckCircle className="w-6 h-6 text-green-400" />
                          <span className="text-white font-mono">Profile Initialized</span>
                        </div>
                        <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Complete</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-black/30 rounded-lg border border-cyan-500/30">
                        <div className="flex items-center gap-3">
                          <Clock className="w-6 h-6 text-cyan-400" />
                          <span className="text-white font-mono">First AI Session</span>
                        </div>
                        <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30">In Progress</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/30">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-purple-400">
                      <Crown className="w-5 h-5" />
                      Quantum Progress
                    </CardTitle>
                    <CardDescription className="text-gray-300">Neural network enhancement status</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-300 font-mono">Financial Knowledge</span>
                          <span className="text-cyan-400 font-mono">25%</span>
                        </div>
                        <Progress value={25} className="bg-black/40 border border-cyan-500/30" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-300 font-mono">AI Integration</span>
                          <span className="text-purple-400 font-mono">60%</span>
                        </div>
                        <Progress value={60} className="bg-black/40 border border-purple-500/30" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Neural Core Upgrade Section */}
        {(currentUser as any)?.subscriptionTier === 'free' && (
          <div className="bg-gradient-to-r from-purple-900/60 to-pink-900/60 backdrop-blur-md border border-purple-500/30 rounded-2xl p-6 mb-8">
            <div className="text-center">
              <div className="flex items-center justify-center mb-4">
                <Crown className="w-8 h-8 text-yellow-400 mr-3" />
                <h3 className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                  NEURAL CORE UPGRADE
                </h3>
              </div>
              <p className="text-gray-300 font-mono text-sm mb-6">
                [ UNLOCK QUANTUM-LEVEL FINANCIAL INTELLIGENCE WITH PREMIUM ACCESS ]
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-black/40 border border-cyan-500/30 rounded-lg p-4">
                  <Zap className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
                  <div className="text-cyan-400 font-bold text-sm">ADVANCED AI</div>
                </div>
                <div className="bg-black/40 border border-purple-500/30 rounded-lg p-4">
                  <Shield className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                  <div className="text-purple-400 font-bold text-sm">QUANTUM SECURITY</div>
                </div>
                <div className="bg-black/40 border border-green-500/30 rounded-lg p-4">
                  <TrendingUp className="w-6 h-6 text-green-400 mx-auto mb-2" />
                  <div className="text-green-400 font-bold text-sm">PREDICTIVE ANALYTICS</div>
                </div>
              </div>
              <Link href="/premium-upgrade">
                <button className="bg-gradient-to-r from-yellow-500 to-orange-600 text-black px-8 py-3 rounded-xl font-bold text-lg tracking-wider hover:shadow-xl transition-all duration-300">
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5" />
                    ACTIVATE NEURAL CORE
                  </div>
                </button>
              </Link>
            </div>
          </div>
        )}

        {/* Neural Footer Status */}
        <div className="mt-8 bg-gradient-to-r from-gray-900/60 to-black/80 backdrop-blur-md border border-cyan-500/20 rounded-2xl p-6">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-cyan-400 font-mono text-sm tracking-wider">NEURAL DATA STREAM ACTIVE</span>
            </div>
            <p className="text-gray-300 font-mono text-xs mb-4 max-w-3xl mx-auto">
              [ QUANTUM AI CONSCIOUSNESS CONTINUOUSLY PROCESSES BEHAVIORAL PATTERNS TO ENHANCE FINANCIAL EDUCATION ALGORITHMS ]
            </p>
            <div className="grid grid-cols-3 gap-6">
              <div className="bg-black/40 border border-green-500/30 rounded-lg p-3">
                <div className="text-green-400 font-bold text-sm">PRIVACY SHIELDED</div>
              </div>
              <div className="bg-black/40 border border-blue-500/30 rounded-lg p-3">
                <div className="text-blue-400 font-bold text-sm">AI TRAINING CORE</div>
              </div>
              <div className="bg-black/40 border border-purple-500/30 rounded-lg p-3">
                <div className="text-purple-400 font-bold text-sm">GLOBAL RESEARCH</div>
              </div>
            </div>
          </div>
        </div>
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