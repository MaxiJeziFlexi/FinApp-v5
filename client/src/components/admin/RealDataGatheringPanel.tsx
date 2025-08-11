import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { 
  Database, 
  TrendingUp, 
  Users, 
  Activity, 
  MousePointer, 
  Eye, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  BarChart3,
  RefreshCw,
  Play,
  Brain
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

interface AppDataMetrics {
  userActivity: {
    totalUsers: number;
    activeUsers: number;
    newUsersToday: number;
    sessionDuration: number;
    bounceRate: number;
  };
  
  pageMetrics: {
    mostVisited: Array<{ page: string; visits: number; avgTime: number }>;
    conversionFunnels: Array<{ step: string; users: number; conversionRate: number }>;
  };
  
  featureUsage: {
    aiAdvisors: { advisor: string; sessions: number; satisfaction: number }[];
    tools: { tool: string; usage: number; completion: number }[];
    chatInteractions: { totalMessages: number; avgLength: number; successRate: number };
  };
  
  performanceMetrics: {
    averageLoadTime: number;
    errorRate: number;
    apiResponseTimes: { endpoint: string; avgTime: number }[];
    systemHealth: number;
  };
  
  userBehavior: {
    clickPatterns: Array<{ element: string; clicks: number; timestamp: string }>;
    userJourneys: Array<{ path: string; frequency: number; outcome: string }>;
    dropoffPoints: Array<{ page: string; exitRate: number }>;
  };
}

interface DataInsight {
  type: 'performance' | 'usage' | 'behavior' | 'optimization';
  severity: 'low' | 'medium' | 'high';
  title: string;
  description: string;
  recommendation: string;
  impact: string;
}

export function RealDataGatheringPanel() {
  const [activeTab, setActiveTab] = useState('overview');
  const [isCollecting, setIsCollecting] = useState(false);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get real app metrics
  const { data: appMetrics, isLoading: metricsLoading, refetch: refetchMetrics } = useQuery({
    queryKey: ['/api/admin/data-gathering/metrics'],
    refetchInterval: 30000,
  });

  // Get real insights
  const { data: insights = [], isLoading: insightsLoading } = useQuery({
    queryKey: ['/api/admin/data-gathering/insights'],
    refetchInterval: 15000,
  });

  // Trigger data collection
  const collectDataMutation = useMutation({
    mutationFn: () => apiRequest('/api/admin/data-gathering/collect', 'POST'),
    onMutate: () => {
      setIsCollecting(true);
    },
    onSuccess: async () => {
      await refetchMetrics();
      queryClient.invalidateQueries({ queryKey: ['/api/admin/data-gathering/insights'] });
      toast({
        title: "Data Collection Complete",
        description: "Real app data has been gathered successfully",
      });
      setIsCollecting(false);
    },
    onError: (error: any) => {
      toast({
        title: "Data Collection Failed",
        description: error.message,
        variant: "destructive"
      });
      setIsCollecting(false);
    }
  });

  const handleCollectData = () => {
    collectDataMutation.mutate();
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high': return <AlertTriangle className="h-4 w-4" />;
      case 'medium': return <Clock className="h-4 w-4" />;
      case 'low': return <CheckCircle className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
            <Database className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Real App Data Gathering</h2>
            <p className="text-gray-600 dark:text-gray-400">Collect and analyze real usage data from your FinApp</p>
          </div>
        </div>

        <Button 
          onClick={handleCollectData}
          disabled={isCollecting || collectDataMutation.isPending}
          className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
        >
          {isCollecting || collectDataMutation.isPending ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Collecting...
            </>
          ) : (
            <>
              <Play className="h-4 w-4 mr-2" />
              Collect Real Data
            </>
          )}
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">User Activity</TabsTrigger>
          <TabsTrigger value="features">Feature Usage</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Total Users
                </CardTitle>
                <CardDescription className="text-2xl font-bold text-white">
                  {metricsLoading ? '...' : (appMetrics?.userActivity?.totalUsers?.toLocaleString() || '0')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-xs opacity-90">
                  {metricsLoading ? '...' : (appMetrics?.userActivity?.newUsersToday || 0)} new today
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  Active Users
                </CardTitle>
                <CardDescription className="text-2xl font-bold text-white">
                  {metricsLoading ? '...' : (appMetrics?.userActivity?.activeUsers?.toLocaleString() || '0')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-xs opacity-90">
                  Currently active
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Brain className="h-4 w-4" />
                  AI Messages
                </CardTitle>
                <CardDescription className="text-2xl font-bold text-white">
                  {metricsLoading ? '...' : (appMetrics?.featureUsage?.chatInteractions?.totalMessages?.toLocaleString() || '0')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-xs opacity-90">
                  {metricsLoading ? '...' : (appMetrics?.featureUsage?.chatInteractions?.successRate?.toFixed(1) || '0')}% success rate
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  System Health
                </CardTitle>
                <CardDescription className="text-2xl font-bold text-white">
                  {metricsLoading ? '...' : `${appMetrics?.performanceMetrics?.systemHealth || 0}%`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-xs opacity-90">
                  {metricsLoading ? '...' : `${appMetrics?.performanceMetrics?.errorRate?.toFixed(2) || '0'}%`} error rate
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Data Collection Status</CardTitle>
              <CardDescription>Real-time monitoring of your app's performance and usage</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>User Activity Tracking</span>
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </div>
                <div className="flex items-center justify-between">
                  <span>Page Analytics</span>
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </div>
                <div className="flex items-center justify-between">
                  <span>AI Performance Metrics</span>
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </div>
                <div className="flex items-center justify-between">
                  <span>System Health Monitoring</span>
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>User Activity Analytics</CardTitle>
              <CardDescription>Real data about how users interact with your FinApp</CardDescription>
            </CardHeader>
            <CardContent>
              {metricsLoading ? (
                <div className="text-center py-8">
                  <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
                  <p>Loading user analytics...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-4">Session Metrics</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span>Average Session Duration</span>
                        <span className="font-mono">{(appMetrics?.userActivity?.sessionDuration / 60)?.toFixed(1) || '0'} min</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Bounce Rate</span>
                        <span className="font-mono">{appMetrics?.userActivity?.bounceRate?.toFixed(1) || '0'}%</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-4">Most Visited Pages</h4>
                    <div className="space-y-2">
                      {appMetrics?.pageMetrics?.mostVisited?.slice(0, 5).map((page: any, index: number) => (
                        <div key={index} className="flex justify-between">
                          <span className="truncate">{page.page}</span>
                          <span className="font-mono">{page.visits}</span>
                        </div>
                      )) || <p className="text-gray-500">No data available</p>}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="features" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>AI Advisor Usage</CardTitle>
              <CardDescription>How users interact with your AI financial advisors</CardDescription>
            </CardHeader>
            <CardContent>
              {metricsLoading ? (
                <div className="text-center py-8">
                  <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
                  <p>Loading feature analytics...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {appMetrics?.featureUsage?.aiAdvisors?.map((advisor: any, index: number) => (
                    <Card key={index} className="p-4">
                      <h4 className="font-medium">{advisor.advisor}</h4>
                      <div className="mt-2 space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>Sessions</span>
                          <span>{advisor.sessions}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Satisfaction</span>
                          <span>{advisor.satisfaction}%</span>
                        </div>
                      </div>
                    </Card>
                  )) || <p className="text-gray-500">No AI advisor data available</p>}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>System Performance</CardTitle>
              <CardDescription>Real performance metrics from your application</CardDescription>
            </CardHeader>
            <CardContent>
              {metricsLoading ? (
                <div className="text-center py-8">
                  <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
                  <p>Loading performance data...</p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div className="text-blue-600 dark:text-blue-400 font-semibold">Avg Load Time</div>
                      <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                        {appMetrics?.performanceMetrics?.averageLoadTime?.toFixed(0) || '0'}ms
                      </div>
                    </div>

                    <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <div className="text-green-600 dark:text-green-400 font-semibold">Error Rate</div>
                      <div className="text-2xl font-bold text-green-700 dark:text-green-300">
                        {appMetrics?.performanceMetrics?.errorRate?.toFixed(2) || '0'}%
                      </div>
                    </div>

                    <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <div className="text-purple-600 dark:text-purple-400 font-semibold">System Health</div>
                      <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                        {appMetrics?.performanceMetrics?.systemHealth || '0'}%
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-4">API Response Times</h4>
                    <div className="space-y-2">
                      {appMetrics?.performanceMetrics?.apiResponseTimes?.map((api: any, index: number) => (
                        <div key={index} className="flex justify-between items-center">
                          <span className="font-mono text-sm">{api.endpoint}</span>
                          <span className="font-mono text-sm">{api.avgTime.toFixed(0)}ms</span>
                        </div>
                      )) || <p className="text-gray-500">No API data available</p>}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Data-Driven Insights</CardTitle>
              <CardDescription>Actionable recommendations based on real app usage</CardDescription>
            </CardHeader>
            <CardContent>
              {insightsLoading ? (
                <div className="text-center py-8">
                  <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
                  <p>Analyzing data for insights...</p>
                </div>
              ) : insights.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="h-8 w-8 mx-auto mb-4 text-green-500" />
                  <p className="text-gray-500">No critical issues detected. Your app is performing well!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {insights.map((insight: DataInsight, index: number) => (
                    <Card key={index} className="border-l-4 border-l-current">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <Badge className={`${getSeverityColor(insight.severity)} text-white`}>
                            {getSeverityIcon(insight.severity)}
                            <span className="ml-1">{insight.severity.toUpperCase()}</span>
                          </Badge>
                          <div className="flex-1">
                            <h4 className="font-medium">{insight.title}</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{insight.description}</p>
                            <div className="mt-3 space-y-2">
                              <div>
                                <strong className="text-sm">Recommendation:</strong>
                                <p className="text-sm text-gray-600 dark:text-gray-400">{insight.recommendation}</p>
                              </div>
                              <div>
                                <strong className="text-sm">Impact:</strong>
                                <p className="text-sm text-gray-600 dark:text-gray-400">{insight.impact}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}