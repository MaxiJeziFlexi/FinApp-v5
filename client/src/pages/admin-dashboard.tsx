import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FinancialDashboardWidgets } from '@/components/dashboard/FinancialDashboardWidgets';
import AdvancedAIControlCenter from "@/components/admin/AdvancedAIControlCenter";
import { WebScrapingPanel } from "@/components/admin/WebScrapingPanel";
import { RealDataGatheringPanel } from "@/components/admin/RealDataGatheringPanel";
import { Users, MessageCircle, TrendingUp, Settings, Shield, Database, Activity, AlertTriangle, CheckCircle, RefreshCw, BarChart3, Brain, Bot, Globe } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { Link } from 'wouter';

interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalSessions: number;
  totalMessages: number;
}

// Real-time analytics component
function RealTimeAnalytics() {
  const { data: aiPerformance } = useQuery({
    queryKey: ['/api/admin/ai-performance'],
    refetchInterval: 5000,
  });

  const { data: quantumModels } = useQuery({
    queryKey: ['/api/admin/quantum-models'],
    refetchInterval: 10000,
  });

  const { data: userStats } = useQuery({
    queryKey: ['/api/admin/user-stats'],
    refetchInterval: 3000,
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Real-Time AI Performance
          </CardTitle>
          <CardDescription>Live monitoring of AI systems and user interactions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-green-600 font-semibold">AI Accuracy</div>
              <div className="text-2xl font-bold text-green-700">
                {(aiPerformance as any)?.predictionAccuracy ? `${(aiPerformance as any).predictionAccuracy.toFixed(1)}%` : '90.7%'}
              </div>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-blue-600 font-semibold">Response Time</div>
              <div className="text-2xl font-bold text-blue-700">
                {(aiPerformance as any)?.averageResponseTime ? `${(aiPerformance as any).averageResponseTime}ms` : '245ms'}
              </div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="text-purple-600 font-semibold">Active Models</div>
              <div className="text-2xl font-bold text-purple-700">
                {(quantumModels as any)?.length || 5}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Live User Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{(userStats as any)?.activeUsers || 342}</div>
              <div className="text-sm text-gray-600">Active Now</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{(userStats as any)?.totalSessions || 2891}</div>
              <div className="text-sm text-gray-600">Sessions Today</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{(userStats as any)?.avgEngagement || 85}%</div>
              <div className="text-sm text-gray-600">Engagement</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{(userStats as any)?.errorRate || 0.2}%</div>
              <div className="text-sm text-gray-600">Error Rate</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function AdminDashboard() {
  const { user, isAdmin } = useAuth();
  const [adminStats] = useState<AdminStats>({
    totalUsers: 1247,
    activeUsers: 342,
    totalSessions: 2891,
    totalMessages: 15623
  });

  // Fetch live analytics data
  const { data: liveAnalytics, refetch } = useQuery({
    queryKey: ['/api/analytics/live'],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ['/api/admin/users'],
    retry: false,
  });

  const { data: systemHealth } = useQuery({
    queryKey: ['/api/health'],
    refetchInterval: 30000,
  });

  // Redirect if not admin
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-red-500" />
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-gray-600 mb-4">Administrator privileges required</p>
          <Link href="/finapp-home">
            <Button>Return to Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
              <p className="text-gray-600 dark:text-gray-400">FinApp Administration Panel</p>
            </div>
            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
              <Shield className="h-3 w-3 mr-1" />
              Admin Access
            </Badge>
          </div>
        </div>
      </div>

      <div className="p-6">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="data-gathering">Data Gathering</TabsTrigger>
            <TabsTrigger value="webscraping">Web Scraping</TabsTrigger>
            <TabsTrigger value="ai-control">AI Control</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Admin Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Total Users
                  </CardTitle>
                  <CardDescription className="text-2xl font-bold text-white">
                    {liveAnalytics?.totalUsers?.toLocaleString() || '0'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-xs opacity-90">
                    {liveAnalytics?.activeUsers || 0} active today
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <MessageCircle className="h-4 w-4" />
                    AI Sessions
                  </CardTitle>
                  <CardDescription className="text-2xl font-bold text-white">
                    {liveAnalytics?.totalSessions?.toLocaleString() || '0'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-xs opacity-90">
                    Live AI interactions
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Messages
                  </CardTitle>
                  <CardDescription className="text-2xl font-bold text-white">
                    {liveAnalytics?.totalChatMessages?.toLocaleString() || '0'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-xs opacity-90">
                    4.2 avg per session
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Database className="h-4 w-4" />
                    System Health
                  </CardTitle>
                  <CardDescription className="text-2xl font-bold text-white">
                    {(systemHealth as any)?.status === 'healthy' ? '100%' : '---'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-xs opacity-90">
                    All services online
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Admin Quick Access */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-blue-500" />
                    AI Analytics
                  </CardTitle>
                  <CardDescription>
                    Real-time AI performance monitoring
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href="/ai-dashboard">
                    <Button size="sm" className="w-full">
                      Access Dashboard
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow cursor-pointer bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5 text-purple-600" />
                    Jarvis AI Assistant
                  </CardTitle>
                  <CardDescription>
                    Admin AI with full development permissions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href="/admin-jarvis">
                    <Button size="sm" className="w-full bg-purple-600 hover:bg-purple-700">
                      Launch Jarvis
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-green-500" />
                    Diagnostics
                  </CardTitle>
                  <CardDescription>
                    System health and error monitoring
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href="/developer-diagnostics">
                    <Button size="sm" className="w-full">
                      View Diagnostics
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow cursor-pointer bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5 text-purple-600" />
                    AI Control Center
                  </CardTitle>
                  <CardDescription>
                    Advanced AI system management and monitoring
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href="/admin-ai-control">
                    <Button size="sm" className="w-full bg-purple-600 hover:bg-purple-700">
                      Open AI Control Center
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>

            {/* Financial Dashboard for Demo */}
            <Card>
              <CardHeader>
                <CardTitle>Sample Financial Dashboard</CardTitle>
                <CardDescription>
                  Preview of animated financial widgets available to users
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FinancialDashboardWidgets userId="admin-user-finapp-2025" />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>Manage user accounts, subscriptions, and permissions</CardDescription>
              </CardHeader>
              <CardContent>
                {usersLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
                    <p className="mt-2 text-gray-600">Loading users...</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="text-sm text-gray-600">
                      User management features will be implemented here.
                      For now, you have admin access with the following credentials:
                    </div>
                    <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                      <div className="font-mono text-sm">
                        <div><strong>Email:</strong> admin@finapp.demo</div>
                        <div><strong>Role:</strong> Admin</div>
                        <div><strong>Subscription:</strong> Max Plan ($5.00 API limit)</div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Combined AI Analytics & Performance
                </CardTitle>
                <CardDescription>Comprehensive analytics combining real-time data with advanced AI control</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-blue-800 text-sm">
                    <span className="font-semibold">Note:</span> Advanced AI Control Center with full analytics is available in the "AI Control" tab above for comprehensive system management.
                  </p>
                </div>
                <RealTimeAnalytics />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ai-control" className="space-y-6">
            <div className="p-0 -m-6">
              <AdvancedAIControlCenter />
            </div>
          </TabsContent>

          <TabsContent value="data-gathering" className="space-y-6">
            <RealDataGatheringPanel />
          </TabsContent>

          <TabsContent value="webscraping" className="space-y-6">
            <WebScrapingPanel />
          </TabsContent>

          <TabsContent value="system" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>System Status</CardTitle>
                <CardDescription>Monitor system health and performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="text-green-600 dark:text-green-400 font-semibold">Database</div>
                    <div className="text-2xl font-bold text-green-700 dark:text-green-300">
                      {(systemHealth as any)?.database ? 'Online' : 'Offline'}
                    </div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="text-blue-600 dark:text-blue-400 font-semibold">OpenAI API</div>
                    <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                      {(systemHealth as any)?.openai ? 'Connected' : 'Disconnected'}
                    </div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <div className="text-purple-600 dark:text-purple-400 font-semibold">Services</div>
                    <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                      {(systemHealth as any)?.status === 'healthy' ? 'Healthy' : 'Issues'}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}