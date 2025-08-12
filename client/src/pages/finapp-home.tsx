"use client";

import { useState, useEffect, useMemo } from "react";
import type { ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Link } from "wouter";
import {
  User as UserIcon,
  MessageSquare,
  TrendingUp,
  Target,
  Brain,
  BarChart3,
  Activity,
  Zap,
  Settings,
  LogOut,
  Crown,
} from "lucide-react";

import { useAuth } from "@/hooks/useAuth";
// (RoleBasedAccess, UserProfileDropdown są nieużywane – usuń importy, jeśli chcesz)
import UserSettingsModal from "@/components/settings/UserSettingsModal";

import OnboardingForm from "@/components/financial/OnboardingForm";
import AdvisorSelection from "@/components/financial/AdvisorSelection";
import { PersonalizedDecisionTreeView } from "@/components/financial/PersonalizedDecisionTreeView";

import EnhancedChatWindow from "@/components/chat/EnhancedChatWindow";
import FanaticAgentChatWindow from "@/components/advanced/FanaticAgentChatWindow";
import AchievementNotification from "@/components/financial/AchievementNotification";
import { FinancialVisualizations3D } from "@/components/financial/FinancialVisualizations3D";
import { AdvancedAnalyticsDashboard } from "@/components/financial/AdvancedAnalyticsDashboard";
import { FinancialDashboardWidgets } from "@/components/dashboard/FinancialDashboardWidgets";

import type { UserProfile as UserProfileType } from "@shared/schema";
import MobileViewportMeta from "@/components/mobile/MobileViewportMeta";

type AppFlow =
  | "onboarding"
  | "advisor-selection"
  | "decision-tree"
  | "chat"
  | "analytics";
type Advisor = { id: string; name: string; specialty?: string; icon?: string; [k: string]: any };

export default function FinAppHome(): ReactNode {
  const [currentFlow, setCurrentFlow] = useState<AppFlow>("onboarding");
  const [selectedAdvisor, setSelectedAdvisor] = useState<Advisor | null>(null);
  const [showAchievement, setShowAchievement] = useState<string | null>(null);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  // auth
  const {
    user: currentUser,
    isLoading: authLoading,
    isAuthenticated,
    isAdmin,
  } = useAuth();

  // redirect if not authed
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      window.location.href = "/";
    }
  }, [authLoading, isAuthenticated]);

  // analytics (guard na window)
  useEffect(() => {
    if (typeof window === "undefined") return;

    const trackEvent = async (eventType: string, data: any) => {
      try {
        await fetch("/api/analytics/track-event", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: (currentUser as any)?.id || "demo-user",
            eventType,
            eventData: data,
            timeSpent: Date.now() - (window as any).pageLoadTime,
            interactionCount: 1,
            learningPath: currentFlow,
          }),
        });
      } catch (error) {
        console.warn("Failed to track event:", error);
      }
    };

    if (!(window as any).pageLoadTime) {
      (window as any).pageLoadTime = Date.now();
    }

    trackEvent("page_view", {
      flow: currentFlow,
      advisor: selectedAdvisor,
      timestamp: new Date().toISOString(),
    });

    return () => {
      trackEvent("page_leave", {
        flow: currentFlow,
        sessionDuration: Date.now() - (window as any).pageLoadTime,
      });
    };
  }, [currentFlow, selectedAdvisor, (currentUser as any)?.id]);

  // user profile (FIX: dodany queryFn + enabled)
  const userId = (currentUser as any)?.id ?? null;

  const { data: userProfile, isLoading: profileLoading } = useQuery<
    UserProfileType | undefined
  >({
    queryKey: ["/api/user/profile"],
    enabled: !!userId, // dopiero gdy znamy usera
    retry: 1,
  });

  // helpery: obsługa snake_case/camelCase
  const onboardingComplete =
    (userProfile as any)?.onboardingComplete ??
    (userProfile as any)?.onboarding_complete ??
    false;

  // dane do 3D (bezpieczne fallbacki)
  const threeDData = useMemo(() => {
    if (!userProfile) {
      return {
        savingsGoal: 50000,
        currentSavings: 15000,
        monthlyIncome: 5000,
        expenses: [
          { category: "Housing", amount: 1500, color: "#3b82f6" },
          { category: "Food", amount: 600, color: "#10b981" },
          { category: "Transport", amount: 400, color: "#f59e0b" },
          { category: "Entertainment", amount: 300, color: "#ef4444" },
          { category: "Savings", amount: 800, color: "#8b5cf6" },
        ],
        projections: Array.from({ length: 12 }, (_, i) => ({
          month: `Month ${i + 1}`,
          value: 15000 + i * 2000 + Math.random() * 1000,
        })),
        riskProfile: "moderate" as const,
        learningProgress: 65,
        engagementScore: 82,
      };
    }

    const financialGoal =
      (userProfile as any).financialGoal ?? (userProfile as any).financial_goal;

    const currSavings =
      (userProfile as any).currentSavings ??
      (userProfile as any).current_savings;

    const monthlyIncome =
      (userProfile as any).monthlyIncome ?? (userProfile as any).monthly_income;

    const riskTolerance =
      (userProfile as any).riskTolerance ?? (userProfile as any).risk_tolerance;

    const progress = (userProfile as any).progress ?? 45;

    const engagementScore =
      (userProfile as any).engagementMetrics?.score ??
      (userProfile as any).engagement_metrics?.score ??
      75;

    return {
      savingsGoal:
        financialGoal === "emergency_fund"
          ? 20000
          : financialGoal === "home_purchase"
            ? 100000
            : 50000,
      currentSavings:
        currSavings === "high"
          ? 25000
          : currSavings === "medium"
            ? 10000
            : 2000,
      monthlyIncome:
        monthlyIncome === "high"
          ? 8000
          : monthlyIncome === "medium"
            ? 5000
            : 3000,
      expenses: [
        { category: "Housing", amount: 1500, color: "#3b82f6" },
        { category: "Food", amount: 600, color: "#10b981" },
        { category: "Transport", amount: 400, color: "#f59e0b" },
        { category: "Entertainment", amount: 300, color: "#ef4444" },
        { category: "Savings", amount: 800, color: "#8b5cf6" },
      ],
      projections: Array.from({ length: 12 }, (_, i) => ({
        month: `Month ${i + 1}`,
        value: (currSavings === "high" ? 25000 : 10000) + i * 1500,
      })),
      riskProfile:
        (riskTolerance as "conservative" | "moderate" | "aggressive") ||
        "moderate",
      learningProgress: progress,
      engagementScore,
    };
  }, [userProfile]);

  const handleFlowChange = (newFlow: AppFlow) => setCurrentFlow(newFlow);

  const handleAdvisorSelected = (advisor: Advisor) => {
    setSelectedAdvisor(advisor);
    setCurrentFlow("decision-tree");
  };

  const handleLogout = () => {
    localStorage.removeItem("finapp_admin_auth");
    localStorage.removeItem("finapp_user_auth");
    window.location.href = "/";
  };

  // Render upgrade section with proper typing
  const renderUpgradeSection = (): ReactNode => {
    const userTier = (currentUser as any)?.subscriptionTier || (currentUser as any)?.subscription_tier;
    const showUpgrade = currentUser && userTier === "free" && !isAdmin;

    if (!showUpgrade) return null;

    return (
      <div className="mt-8 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-900/80 dark:to-black/90 backdrop-blur-xl border border-purple-500/50 rounded-2xl p-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Crown className="w-8 h-8 text-black dark:text-black" />
          </div>
          <div className="text-2xl font-black bg-gradient-to-r from-yellow-400 to-orange-600 bg-clip-text text-transparent mb-2">
            NEURAL CORE UPGRADE
          </div>
          <p className="text-gray-700 dark:text-gray-300 font-mono text-sm mb-6">
            [ UNLOCK QUANTUM AI PROCESSING ]
          </p>
          <Link href="/checkout">
            <button className="bg-gradient-to-r from-yellow-500 to-orange-600 text-black dark:text-black px-8 py-3 rounded-xl font-bold text-lg tracking-wider hover:shadow-lg transition-all duration-300">
              Initialize Premium
            </button>
          </Link>
        </div>
      </div>
    );
  };

  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Brain className="w-12 h-12 mx-auto mb-4 text-blue-600 animate-pulse" />
          <div className="text-xl font-semibold mb-2">FinApp is Loading</div>
          <div className="text-gray-600">
            Initializing your personalized financial education experience...
          </div>
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
    <>
      <MobileViewportMeta />
      <div className="min-h-screen bg-white dark:bg-black relative">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-200/20 via-emerald-200/20 to-violet-200/20 dark:from-cyan-500/10 dark:via-purple-500/10 dark:to-blue-500/10" />
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, rgba(0, 255, 255, 0.05) 0%, transparent 50%), 
                            radial-gradient(circle at 75% 75%, rgba(147, 51, 234, 0.05) 0%, transparent 50%)`,
        }}
      />

      {/* Header */}
      <div className="relative bg-gradient-to-r from-white/90 via-gray-50/95 to-white/90 dark:from-black/90 dark:via-gray-900/95 dark:to-black/90 backdrop-blur-xl border-b border-cyan-500/30 py-6">
        <div className="w-full max-w-none px-4 sm:px-6 sm:max-w-6xl sm:mx-auto">
          <div className="text-center relative z-10">
            <div className="flex items-center justify-center mb-6">
              <div className="h-1 w-16 bg-gradient-to-r from-cyan-400 to-blue-600 rounded-full mr-4" />
              <div className="text-2xl sm:text-5xl font-black bg-gradient-to-r from-cyan-400 via-purple-500 to-blue-600 bg-clip-text text-transparent">
                FINAPP NEURAL CORE
              </div>
              <div className="h-1 w-16 bg-gradient-to-r from-blue-600 to-purple-400 rounded-full ml-4" />
            </div>

            <div className="text-cyan-600 dark:text-cyan-400 font-mono text-lg tracking-wider mb-4">
              [ QUANTUM FINANCIAL CONSCIOUSNESS SYSTEM ]
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-8 mt-6 max-w-4xl mx-auto">
              <div className="bg-white/30 dark:bg-black/30 backdrop-blur-md border border-cyan-500/30 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">10,000+</div>
                <div className="text-gray-700 dark:text-gray-300 font-mono text-sm">
                  ACTIVE NEURAL NODES
                </div>
              </div>
              <div className="bg-white/30 dark:bg-black/30 backdrop-blur-md border border-emerald-500/30 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">99.8%</div>
                <div className="text-gray-700 dark:text-gray-300 font-mono text-sm">
                  SYSTEM UPTIME
                </div>
              </div>
              <div className="bg-white/30 dark:bg-black/30 backdrop-blur-md border border-violet-500/30 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-violet-600 dark:text-violet-400">24/7</div>
                <div className="text-gray-700 dark:text-gray-300 font-mono text-sm">
                  AI PROCESSING
                </div>
              </div>
            </div>

            <div className="flex justify-center mt-6">
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

            {currentUser ? (
              <div className="flex items-center justify-center mt-6">
                <div className="bg-white/40 dark:bg-black/40 backdrop-blur-xl border border-cyan-500/50 rounded-2xl px-6 py-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-full flex items-center justify-center">
                      <div className="text-2xl">👤</div>
                    </div>
                    <div className="text-left">
                      <div className="text-gray-800 dark:text-white font-bold tracking-wider">
                        Welcome back,{" "}
                        {(currentUser as any)?.firstName ||
                          (currentUser as any)?.first_name ||
                          "User"}
                        !
                      </div>
                      <div className="text-cyan-600 dark:text-cyan-400 font-mono text-sm">
                        {((currentUser as any)?.subscriptionTier ||
                          (currentUser as any)?.subscription_tier) === "free"
                          ? "Free Plan"
                          : ((currentUser as any)?.subscriptionTier ||
                                (currentUser as any)?.subscription_tier) ===
                              "pro"
                            ? "Pro Member"
                            : "Premium Member"}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                      <span className="text-gray-600 dark:text-gray-300 font-mono text-xs">
                        NEURAL LINK ACTIVE
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <div className="w-full max-w-none px-4 sm:px-6 py-8 relative z-10">
        <div className="bg-gradient-to-r from-white/80 to-gray-100/90 dark:from-gray-900/80 dark:to-black/90 backdrop-blur-xl border border-cyan-500/30 rounded-2xl p-4 sm:p-6 mb-8">
          <div className="text-center mb-6">
            <div className="text-cyan-600 dark:text-cyan-400 font-mono text-sm tracking-wider mb-2">
              NEURAL INTERFACE SELECTION
            </div>
            <div className="h-1 w-32 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full mx-auto" />
          </div>

          <Tabs
            value={currentFlow}
            onValueChange={(v) => handleFlowChange(v as AppFlow)}
          >
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-5 bg-white/40 dark:bg-black/40 border border-cyan-500/20 rounded-xl p-2 gap-1 mobile-tabs">
              <TabsTrigger
                value="onboarding"
                className="flex items-center gap-1 sm:gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-blue-600 data-[state=active]:text-white text-gray-600 dark:text-gray-300 font-mono text-xs sm:text-sm transition-all duration-300 mobile-tab mobile-touch-target"
                disabled={!!onboardingComplete}
              >
                <UserIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">NEURAL PROFILE</span>
                <span className="sm:hidden">SETUP</span>
              </TabsTrigger>

              <TabsTrigger
                value="advisor-selection"
                className="flex items-center gap-1 sm:gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-600 data-[state=active]:text-white text-gray-600 dark:text-gray-300 font-mono text-xs sm:text-sm transition-all duration-300 mobile-tab mobile-touch-target"
                disabled={!onboardingComplete}
              >
                <Target className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">AI ADVISORS</span>
                <span className="sm:hidden">AI</span>
              </TabsTrigger>

              <TabsTrigger
                value="decision-tree"
                className="flex items-center gap-1 sm:gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white text-gray-600 dark:text-gray-300 font-mono text-xs sm:text-sm transition-all duration-300 col-span-2 sm:col-span-1 mobile-tab mobile-touch-target"
                disabled={!selectedAdvisor}
              >
                <BarChart3 className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">DECISION MATRIX</span>
                <span className="sm:hidden">ANALYSIS</span>
              </TabsTrigger>

              <TabsTrigger
                value="chat"
                className="flex items-center gap-1 sm:gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-600 data-[state=active]:text-white text-gray-600 dark:text-gray-300 font-mono text-xs sm:text-sm transition-all duration-300 mobile-tab mobile-touch-target"
                disabled={!selectedAdvisor}
              >
                <MessageSquare className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">NEURAL CHAT</span>
                <span className="sm:hidden">CHAT</span>
              </TabsTrigger>

              <TabsTrigger
                value="analytics"
                className="flex items-center gap-1 sm:gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-600 data-[state=active]:text-white text-gray-600 dark:text-gray-300 font-mono text-xs sm:text-sm transition-all duration-300 mobile-tab mobile-touch-target"
              >
                <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">ANALYTICS CORE</span>
                <span className="sm:hidden">STATS</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="onboarding" className="space-y-6">
              <Alert>
                <Brain className="h-4 w-4" />
                <AlertDescription>
                  <strong>AI-Enhanced Onboarding:</strong> Our advanced
                  profiling system analyzes your responses to create a
                  personalized learning experience with behavioral pattern
                  recognition.
                </AlertDescription>
              </Alert>
              <OnboardingForm
                userId={(currentUser as any)?.id || "demo-user"}
                onComplete={() => handleFlowChange("advisor-selection")}
              />
            </TabsContent>

            <TabsContent value="advisor-selection" className="space-y-6">
              <Alert>
                <Zap className="h-4 w-4" />
                <AlertDescription>
                  <strong>AI Advisor Ecosystem:</strong> Choose from specialized
                  financial education modules powered by advanced AI models and
                  real-time learning analytics.
                </AlertDescription>
              </Alert>
              <AdvisorSelection
                onAdvisorSelect={handleAdvisorSelected}
              />
            </TabsContent>

            <TabsContent value="decision-tree" className="space-y-6">
              <Alert>
                <Target className="h-4 w-4" />
                <AlertTitle>Personalized Decision Tree Assessment</AlertTitle>
                <AlertDescription>
                  <strong>5-Level Assessment:</strong> Complete the personalized
                  questionnaire tailored to your advisor's specialty. System
                  tracks progress for AI chat personalization.
                </AlertDescription>
              </Alert>
              {selectedAdvisor ? (
                <PersonalizedDecisionTreeView
                  advisorId={selectedAdvisor.id}
                  userId={(currentUser as any)?.id || "demo-user"}
                  advisor={selectedAdvisor}
                  onComplete={(insights) => {
                    console.log(
                      "Assessment completed with insights:",
                      insights,
                    );
                    setShowAchievement("assessment-complete");
                    handleFlowChange("chat");
                  }}
                />
              ) : (
                <Alert>
                  <AlertDescription>
                    Please select an advisor first to access assessment.
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>

            <TabsContent value="chat" className="space-y-6">
              <Alert>
                <MessageSquare className="h-4 w-4" />
                <AlertDescription>
                  <strong>Intelligent Chat System:</strong> Context-aware AI
                  conversations with sentiment analysis, learning progress
                  tracking, and personalized financial education.
                </AlertDescription>
              </Alert>

              {selectedAdvisor && (
                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-purple-500 to-cyan-500 rounded-xl p-6 text-white">
                    <h2 className="text-2xl font-bold mb-2">🚀 Fanatic AI Agent</h2>
                    <p className="text-purple-100">
                      Zaawansowany asystent AI z możliwościami GPT-4o, analizy plików, generowania raportów i więcej!
                      Podobny do Replit Agent lub ChatGPT-5!
                    </p>
                    <div className="flex flex-wrap gap-2 mt-4">
                      <Badge variant="secondary" className="bg-white/20">GPT-4o Integration</Badge>
                      <Badge variant="secondary" className="bg-white/20">File Analysis</Badge>
                      <Badge variant="secondary" className="bg-white/20">Report Generation</Badge>
                      <Badge variant="secondary" className="bg-white/20">Voice Input</Badge>
                    </div>
                  </div>

                  <FanaticAgentChatWindow 
                    userId={(currentUser as any)?.id || "demo-user"}
                    sessionId={`fanatic_${selectedAdvisor.id}_${(currentUser as any)?.id || "demo-user"}_${Date.now()}`}
                    advisorId={selectedAdvisor.id}
                    onMessageSent={(message) => {
                      console.log("Fanatic AI message:", message);
                    }}
                  />

                  <div className="flex gap-2 justify-center">
                    <Button
                      variant="outline"
                      onClick={() => setCurrentFlow("decision-tree")}
                    >
                      ← Powrót do Decision Tree
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setCurrentFlow("advisor-selection")}
                    >
                      ← Wybierz innego doradcę
                    </Button>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              <Alert>
                <BarChart3 className="h-4 w-4" />
                <AlertDescription>
                  <strong>Advanced Analytics Dashboard:</strong> Comprehensive
                  behavioral analysis, AI model performance tracking, and
                  real-time learning insights for the biggest financial
                  education experiment.
                </AlertDescription>
              </Alert>

              {/* Financial Dashboard Widgets - Available after Neural Profile completion */}
              {onboardingComplete && (
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-green-500" />
                      Your Personal Financial Dashboard
                    </CardTitle>
                    <CardDescription>
                      Personalized financial widgets based on your Neural Profile data
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <FinancialDashboardWidgets userId={(currentUser as any)?.id || "demo-user"} />
                  </CardContent>
                </Card>
              )}

              <FinancialVisualizations3D data={threeDData} />
              <AdvancedAnalyticsDashboard
                userId={(currentUser as any)?.id || "demo-user"}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {showAchievement && (
        <AchievementNotification
          achievement={
            {
              name: "Achievement Unlocked",
              description: "Great job!",
              icon: "trophy",
              type: "milestone",
              xpReward: 100,
            } as any
          }
          onClose={() => setShowAchievement(null)}
        />
      )}

      {renderUpgradeSection() as ReactNode}

      <div className="mt-8 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900/60 dark:to-black/80 backdrop-blur-md border border-cyan-500/20 rounded-2xl p-6">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
            <span className="text-cyan-600 dark:text-cyan-400 font-mono text-sm tracking-wider">
              NEURAL DATA STREAM ACTIVE
            </span>
          </div>
          <p className="text-gray-600 dark:text-gray-300 font-mono text-xs mb-4 max-w-3xl mx-auto">
            [ QUANTUM AI CONSCIOUSNESS CONTINUOUSLY PROCESSES BEHAVIORAL
            PATTERNS TO ENHANCE FINANCIAL EDUCATION ALGORITHMS ]
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            <div className="bg-white/60 dark:bg-black/40 border border-green-500/30 rounded-lg p-3">
              <div className="text-green-600 dark:text-green-400 font-bold text-sm">
                PRIVACY SHIELDED
              </div>
            </div>
            <div className="bg-white/60 dark:bg-black/40 border border-blue-500/30 rounded-lg p-3">
              <div className="text-blue-600 dark:text-blue-400 font-bold text-sm">
                AI TRAINING CORE
              </div>
            </div>
            <div className="bg-white/60 dark:bg-black/40 border border-purple-500/30 rounded-lg p-3">
              <div className="text-purple-600 dark:text-purple-400 font-bold text-sm">
                GLOBAL RESEARCH
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
    </>
  );
}
