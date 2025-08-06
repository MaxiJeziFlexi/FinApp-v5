import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  LayoutDashboard, 
  TrendingUp, 
  Target, 
  Brain, 
  Globe, 
  Calculator,
  BookOpen,
  Zap,
  CreditCard,
  Bell,
  Settings,
  Star,
  BarChart3,
  DollarSign
} from 'lucide-react';

// Import all our revolutionary components
import { FinancialDashboardWidgets } from './FinancialDashboardWidgets';
import { SmartNotifications } from './SmartNotifications';
import { FinancialGoalTracker } from './FinancialGoalTracker';
import { PortfolioTracker } from './PortfolioTracker';
import { RealTimeInsights } from './RealTimeInsights';
import { BankingInsights } from './BankingInsights';
import { FinancialEducation } from './FinancialEducation';
import { MultilingualSupport } from '@/components/ai/MultilingualSupport';
import { TaxOptimizationTools } from '@/components/ai/TaxOptimizationTools';
import { InfiniteFeatureTree } from './InfiniteFeatureTree';
import { AnimatedCounter } from '@/components/ui/animated-counter';

interface DashboardStats {
  totalNetWorth: number;
  monthlyIncome: number;
  savingsRate: number;
  investmentReturn: number;
  budgetUtilization: number;
  creditScore: number;
  financialHealthScore: number;
  aiInsights: number;
}

export function UltimateFinancialDashboard({ userId }: { userId: string }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [showNotifications, setShowNotifications] = useState(false);

  const [dashboardStats] = useState<DashboardStats>({
    totalNetWorth: 127500,
    monthlyIncome: 8500,
    savingsRate: 28.5,
    investmentReturn: 12.7,
    budgetUtilization: 73.2,
    creditScore: 785,
    financialHealthScore: 87,
    aiInsights: 15
  });

  const tabs = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'portfolio', label: 'Portfolio', icon: TrendingUp },
    { id: 'goals', label: 'Goals', icon: Target },
    { id: 'insights', label: 'AI Insights', icon: Brain },
    { id: 'banking', label: 'Banking', icon: CreditCard },
    { id: 'education', label: 'Learn', icon: BookOpen },
    { id: 'taxes', label: 'Tax Optimization', icon: Calculator },
    { id: 'features', label: 'Feature Tree', icon: Zap },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  const handleLanguageChange = (language: string) => {
    setCurrentLanguage(language);
    // Implement language switching logic
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg text-white">
                  <BarChart3 className="h-6 w-6" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    FinApp Dashboard
                  </h1>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Your Complete Financial Intelligence Center
                  </p>
                </div>
              </div>
              <Badge className="bg-gradient-to-r from-green-500 to-green-600 text-white">
                Pro Max Plan
              </Badge>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Quick Stats */}
              <div className="hidden md:flex items-center gap-6 text-sm">
                <div className="text-center">
                  <div className="font-bold text-green-600">
                    <AnimatedCounter value={dashboardStats.financialHealthScore} suffix="%" />
                  </div>
                  <div className="text-xs text-gray-500">Health Score</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-blue-600">
                    <AnimatedCounter value={dashboardStats.totalNetWorth} prefix="$" />
                  </div>
                  <div className="text-xs text-gray-500">Net Worth</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-purple-600">
                    +<AnimatedCounter value={dashboardStats.investmentReturn} suffix="%" decimals={1} />
                  </div>
                  <div className="text-xs text-gray-500">Return</div>
                </div>
              </div>

              {/* Language Selector */}
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-gray-500" />
                <select 
                  value={currentLanguage} 
                  onChange={(e) => handleLanguageChange(e.target.value)}
                  className="text-sm border rounded-md px-2 py-1 bg-white dark:bg-gray-700"
                >
                  <option value="en">🇺🇸 English</option>
                  <option value="de">🇩🇪 Deutsch</option>
                  <option value="fr">🇫🇷 Français</option>
                  <option value="pl">🇵🇱 Polski</option>
                </select>
              </div>

              {/* Notifications */}
              <div className="relative">
                <SmartNotifications userId={userId} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Dashboard */}
      <div className="container mx-auto px-6 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          {/* Tab Navigation */}
          <div className="mb-6">
            <TabsList className="grid grid-cols-9 lg:w-full bg-white dark:bg-gray-800 p-1 rounded-xl shadow-lg">
              {tabs.map((tab) => {
                const IconComponent = tab.icon;
                return (
                  <TabsTrigger
                    key={tab.id}
                    value={tab.id}
                    className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-all data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white"
                  >
                    <IconComponent className="h-4 w-4" />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </div>

          {/* Tab Content */}
          <TabsContent value="overview" className="mt-0 space-y-6">
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
              <div className="xl:col-span-3">
                <FinancialDashboardWidgets userId={userId} />
              </div>
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button className="w-full justify-start gap-2" variant="outline">
                      <DollarSign className="h-4 w-4" />
                      Add Transaction
                    </Button>
                    <Button className="w-full justify-start gap-2" variant="outline">
                      <Target className="h-4 w-4" />
                      Set New Goal
                    </Button>
                    <Button className="w-full justify-start gap-2" variant="outline">
                      <Brain className="h-4 w-4" />
                      Get AI Advice
                    </Button>
                    <Button className="w-full justify-start gap-2" variant="outline">
                      <BookOpen className="h-4 w-4" />
                      Learn Finance
                    </Button>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Star className="h-4 w-4 text-yellow-500" />
                      Achievement Progress
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Financial Health Master</span>
                        <span>87%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-green-600 h-2 rounded-full" style={{ width: '87%' }}></div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Investment Expert</span>
                        <span>73%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: '73%' }}></div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Saving Champion</span>
                        <span>95%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-purple-600 h-2 rounded-full" style={{ width: '95%' }}></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="portfolio" className="mt-0">
            <PortfolioTracker userId={userId} />
          </TabsContent>

          <TabsContent value="goals" className="mt-0">
            <FinancialGoalTracker userId={userId} />
          </TabsContent>

          <TabsContent value="insights" className="mt-0">
            <RealTimeInsights userId={userId} />
          </TabsContent>

          <TabsContent value="banking" className="mt-0">
            <BankingInsights userId={userId} />
          </TabsContent>

          <TabsContent value="education" className="mt-0">
            <FinancialEducation userId={userId} />
          </TabsContent>

          <TabsContent value="taxes" className="mt-0">
            <TaxOptimizationTools userId={userId} />
          </TabsContent>

          <TabsContent value="features" className="mt-0">
            <InfiniteFeatureTree budget={25} />
          </TabsContent>

          <TabsContent value="settings" className="mt-0">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <MultilingualSupport 
                userId={userId} 
                currentLanguage={currentLanguage}
                onLanguageChange={handleLanguageChange}
              />
              <Card>
                <CardHeader>
                  <CardTitle>Account Settings</CardTitle>
                  <CardDescription>Manage your account preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Notification Preferences</label>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2">
                        <input type="checkbox" defaultChecked />
                        <span className="text-sm">Email notifications</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input type="checkbox" defaultChecked />
                        <span className="text-sm">Push notifications</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input type="checkbox" />
                        <span className="text-sm">SMS notifications</span>
                      </label>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Privacy Settings</label>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2">
                        <input type="checkbox" defaultChecked />
                        <span className="text-sm">Share anonymous analytics</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input type="checkbox" />
                        <span className="text-sm">Allow social features</span>
                      </label>
                    </div>
                  </div>
                  
                  <Button className="w-full">Save Settings</Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}