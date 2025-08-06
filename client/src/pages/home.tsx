import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import OnboardingForm from "@/components/financial/OnboardingForm";
import AdvisorSelection from "@/components/financial/AdvisorSelection";
import DecisionTreeView from "@/components/financial/DecisionTreeView";
import ChatWindow from "@/components/financial/ChatWindow";
import AchievementNotification from "@/components/financial/AchievementNotification";
import FinancialProgressChart from "@/components/financial/FinancialProgressChart";
import { useQuery } from "@tanstack/react-query";
import { Bot, TrendingUp, Shield, Users, Award } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useDiagnostics } from "@/hooks/useDiagnostics";

type ViewType = 'onboarding' | 'advisorSelection' | 'decisionTree' | 'chat';

interface UserProfile {
  id: string;
  userId: string;
  financialGoal: string;
  timeframe: string;
  monthlyIncome: string;
  currentSavings: number;
  targetAmount: number;
  onboardingComplete: boolean;
  isPremium: boolean;
  progress: number;
  consents: any;
  financialData: any[];
  achievements: string[];
}

interface Achievement {
  title: string;
  description: string;
  icon: string;
}

export default function Home() {
  const { trackInteraction } = useDiagnostics();
  const [currentView, setCurrentView] = useState<ViewType>('onboarding');
  const [userId] = useState(() => {
    let storedUserId = localStorage.getItem('userId');
    if (!storedUserId) {
      // Generate a UUID-like string for new users
      storedUserId = 'user-' + Math.random().toString(36).substr(2, 9) + '-' + Date.now().toString(36);
      localStorage.setItem('userId', storedUserId);
    }
    return storedUserId;
  });
  const [achievement, setAchievement] = useState<Achievement | null>(null);
  const [selectedAdvisor, setSelectedAdvisor] = useState<any>(null);

  // Health check query
  const { data: healthStatus } = useQuery({
    queryKey: ['/health'],
    refetchInterval: 30000, // Check every 30 seconds
  });

  // User profile query
  const { data: userProfile, refetch: refetchProfile } = useQuery<UserProfile>({
    queryKey: ['/api/user/profile', userId],
    retry: false,
  });

  // Check user's onboarding status
  useEffect(() => {
    if (userProfile?.onboardingComplete) {
      setCurrentView('advisorSelection');
    }
  }, [userProfile]);

  const handleOnboardingComplete = () => {
    setCurrentView('advisorSelection');
    setAchievement({
      title: 'Profile Created!',
      description: 'You\'ve started your financial journey',
      icon: '🎉'
    });
    refetchProfile();
  };

  const handleAdvisorSelect = (advisor: any) => {
    setSelectedAdvisor(advisor);
    setCurrentView('decisionTree');
  };

  const handleDecisionTreeComplete = () => {
    setCurrentView('chat');
    setAchievement({
      title: 'Decision Tree Complete!',
      description: `You've received personalized recommendations from ${selectedAdvisor?.name}`,
      icon: '🏆'
    });
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'onboarding':
        return (
          <OnboardingForm
            onComplete={handleOnboardingComplete}
            userId={userId}
          />
        );
      
      case 'advisorSelection':
        return (
          <AdvisorSelection
            userProfile={userProfile}
            onAdvisorSelect={handleAdvisorSelect}
          />
        );
      
      case 'decisionTree':
        return (
          <DecisionTreeView
            advisor={selectedAdvisor}
            userId={userId}
            userProfile={userProfile}
            onComplete={handleDecisionTreeComplete}
            onBackToAdvisors={() => setCurrentView('advisorSelection')}
          />
        );
      
      case 'chat':
        return (
          <ChatWindow
            advisor={selectedAdvisor}
            userId={userId}
            userProfile={userProfile}
            onBackToDecisionTree={() => setCurrentView('decisionTree')}
            onBackToAdvisors={() => setCurrentView('advisorSelection')}
          />
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      {/* Header */}
      <header className="gradient-bg text-white shadow-xl">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center">
                <Bot className="text-primary text-xl" />
              </div>
              <div>
                <h1 className="text-xl font-bold">AI Financial Advisor</h1>
                <p className="text-sm opacity-90">Your Personal Finance Assistant</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-2 bg-white/20 rounded-full px-4 py-2">
                <div className={`w-2 h-2 rounded-full ${
                  healthStatus?.status === 'healthy' ? 'bg-green-400' : 'bg-red-400'
                }`} />
                <span className="text-sm">
                  {healthStatus?.status === 'healthy' ? 'Backend Connected' : 'Connection Issues'}
                </span>
              </div>
              <button className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors">
                <Users className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8 max-w-7xl">
        {/* Progress Indicators */}
        {currentView !== 'onboarding' && (
          <Card className="mb-8">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Your Progress</h3>
                <Badge variant="secondary" className="flex items-center space-x-1">
                  <Award className="w-4 h-4" />
                  <span>{userProfile?.achievements?.length || 0} Achievements</span>
                </Badge>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    currentView === 'onboarding' ? 'bg-primary text-white' : 'bg-green-500 text-white'
                  }`}>
                    {currentView === 'onboarding' ? '1' : '✓'}
                  </div>
                  <span className="text-sm font-medium">Profile Setup</span>
                </div>
                <div className="flex-1 h-px bg-border" />
                <div className="flex items-center space-x-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    currentView === 'advisorSelection' ? 'bg-primary text-white' : 
                    ['decisionTree', 'chat'].includes(currentView) ? 'bg-green-500 text-white' : 'bg-muted text-muted-foreground'
                  }`}>
                    {['decisionTree', 'chat'].includes(currentView) ? '✓' : '2'}
                  </div>
                  <span className="text-sm font-medium">Advisor Selection</span>
                </div>
                <div className="flex-1 h-px bg-border" />
                <div className="flex items-center space-x-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    currentView === 'decisionTree' ? 'bg-primary text-white' : 
                    currentView === 'chat' ? 'bg-green-500 text-white' : 'bg-muted text-muted-foreground'
                  }`}>
                    {currentView === 'chat' ? '✓' : '3'}
                  </div>
                  <span className="text-sm font-medium">Consultation</span>
                </div>
                <div className="flex-1 h-px bg-border" />
                <div className="flex items-center space-x-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    currentView === 'chat' ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'
                  }`}>
                    4
                  </div>
                  <span className="text-sm font-medium">AI Chat</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main View */}
        <div className="animate-fade-in">
          {renderCurrentView()}
        </div>

        {/* Financial Progress Chart - Show after onboarding */}
        {currentView !== 'onboarding' && userProfile && (
          <div className="mt-12">
            <FinancialProgressChart userProfile={userProfile} />
          </div>
        )}

        {/* Achievement Notification */}
        {achievement && (
          <AchievementNotification
            achievement={achievement}
            onClose={() => setAchievement(null)}
          />
        )}

        {/* Backend Status Warning */}
        {healthStatus && !healthStatus.openai && (
          <div className="fixed bottom-4 right-4 bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-2 rounded-lg shadow-lg">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
              <span className="text-sm font-medium">
                Offline mode - Some features may be limited
              </span>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
