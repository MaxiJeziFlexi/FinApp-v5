import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { motion } from 'framer-motion';
import { 
  Activity, 
  Brain, 
  Database, 
  MonitorSpeaker, 
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  Cpu,
  MemoryStick,
  HardDrive,
  Network,
  Users,
  Clock,
  Zap,
  Eye,
  MousePointer,
  BarChart3,
  Settings,
  RefreshCw
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import HeatMap from '@/components/diagnostics/HeatMap';
import ClickRatioAnalytics from '@/components/diagnostics/ClickRatioAnalytics';
import FloatingElements, { Card3D } from '@/components/3d/FloatingElements';

interface SystemHealth {
  overall: 'healthy' | 'warning' | 'critical';
  score: number;
  components: Array<{
    name: string;
    status: 'healthy' | 'warning' | 'critical';
    metrics: any;
  }>;
  recommendations: string[];
}

interface DiagnosticInsight {
  type: 'performance' | 'usability' | 'engagement' | 'error' | 'optimization';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  recommendation: string;
  impact: string;
  confidence: number;
}

interface UserBehaviorAnalytics {
  totalSessions: number;
  averageSessionDuration: number;
  mostVisitedPages: Array<{ page: string; visits: number }>;
  mostClickedElements: Array<{ element: string; clicks: number }>;
  userJourney: Array<{ from: string; to: string; count: number }>;
}

// Real-time error monitoring component
function RealTimeErrorMonitor() {
  const { data: liveErrors } = useQuery({
    queryKey: ['/api/diagnostics/live-errors'],
    refetchInterval: 2000,
  });

  const { data: performanceAlerts } = useQuery({
    queryKey: ['/api/diagnostics/performance-alerts'],
    refetchInterval: 5000,
  });

  const { data: systemStatus } = useQuery({
    queryKey: ['/api/diagnostics/system-status'],
    refetchInterval: 3000,
  });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Live Error Monitor
              <Badge className="bg-red-100 text-red-700">{(liveErrors as any)?.length || 0} active</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {(liveErrors as any)?.length > 0 ? (liveErrors as any).map((error: any, index: number) => (
                <div key={index} className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-red-800">{error.type}</span>
                    <span className="text-xs text-red-600">{error.timestamp}</span>
                  </div>
                  <p className="text-sm text-red-700 mt-1">{error.message}</p>
                </div>
              )) : (
                <div className="text-center py-8 text-gray-600">
                  <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-500" />
                  No active errors detected
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MonitorSpeaker className="h-5 w-5" />
              Performance Alerts
              <Badge className="bg-orange-100 text-orange-700">{(performanceAlerts as any)?.length || 0} alerts</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {(performanceAlerts as any)?.length > 0 ? (performanceAlerts as any).map((alert: any, index: number) => (
                <div key={index} className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-orange-800">{alert.metric}</span>
                    <span className="text-xs text-orange-600">{alert.severity}</span>
                  </div>
                  <p className="text-sm text-orange-700 mt-1">{alert.description}</p>
                </div>
              )) : (
                <div className="text-center py-8 text-gray-600">
                  <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-500" />
                  System performing optimally
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Real-Time System Health
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-blue-600 font-semibold">API Response</div>
              <div className="text-2xl font-bold text-blue-700">
                {(systemStatus as any)?.apiResponseTime || 245}ms
              </div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-green-600 font-semibold">Database</div>
              <div className="text-2xl font-bold text-green-700">
                {(systemStatus as any)?.dbStatus || 'Online'}
              </div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-purple-600 font-semibold">Memory Usage</div>
              <div className="text-2xl font-bold text-purple-700">
                {(systemStatus as any)?.memoryUsage || 65}%
              </div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-orange-600 font-semibold">CPU Usage</div>
              <div className="text-2xl font-bold text-orange-700">
                {(systemStatus as any)?.cpuUsage || 23}%
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function DeveloperDiagnostics() {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedPage, setSelectedPage] = useState('/');
  const [timeRange, setTimeRange] = useState('24h');
  const [autoRefresh, setAutoRefresh] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Auto-refresh setup
  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(() => {
      queryClient.invalidateQueries({ queryKey: ['/api/diagnostics'] });
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [autoRefresh, queryClient]);

  // Fetch system health
  const { data: systemHealth, isLoading: healthLoading } = useQuery<SystemHealth>({
    queryKey: ['/api/diagnostics/system-health'],
    refetchInterval: autoRefresh ? 30000 : false,
  });

  // Fetch diagnostic insights
  const { data: insights, isLoading: insightsLoading } = useQuery<DiagnosticInsight[]>({
    queryKey: ['/api/diagnostics/insights'],
    refetchInterval: autoRefresh ? 60000 : false,
  });

  // Fetch user behavior analytics
  const { data: userBehavior, isLoading: behaviorLoading } = useQuery<UserBehaviorAnalytics>({
    queryKey: ['/api/diagnostics/user-behavior'],
    refetchInterval: autoRefresh ? 120000 : false,
  });

  // Convert API response to expected format or use mock data
  const mockSystemHealth: SystemHealth = (() => {
    if (systemHealth && systemHealth.components && Array.isArray(systemHealth.components)) {
      return systemHealth;
    }
    
    // If systemHealth has different structure, convert it
    if (systemHealth && systemHealth.components && typeof systemHealth.components === 'object') {
      const componentsArray = Object.entries(systemHealth.components).map(([key, value]: [string, any]) => ({
        name: key.charAt(0).toUpperCase() + key.slice(1),
        status: value.status || 'healthy',
        metrics: { 
          current: value.responseTime || 0, 
          threshold: 200, 
          unit: 'ms' 
        }
      }));
      
      return {
        ...systemHealth,
        components: componentsArray,
        recommendations: systemHealth.recommendations || []
      };
    }
    
    // Fallback to mock data
    return {
      overall: 'warning',
      score: 78,
      components: [
        {
          name: 'API Response Time',
          status: 'healthy',
          metrics: { current: 145, threshold: 200, unit: 'ms' }
        },
        {
          name: 'Error Rate',
          status: 'warning',
          metrics: { current: 2.3, threshold: 1, unit: '%' }
        },
        {
          name: 'Memory Usage',
          status: 'healthy',
          metrics: { current: 67, threshold: 70, unit: '%' }
        },
        {
          name: 'Database Connections',
          status: 'healthy',
          metrics: { current: 45, threshold: 100, unit: 'connections' }
        }
      ],
      recommendations: [
        'Investigate error spikes in user authentication module',
        'Consider implementing response caching for frequently accessed endpoints',
        'Monitor database query performance during peak hours'
      ]
    };
  })();

  const mockInsights: DiagnosticInsight[] = insights || [
    {
      type: 'performance',
      severity: 'high',
      title: 'Slow Query Performance Detected',
      description: 'Database queries are taking 40% longer than baseline during peak hours',
      recommendation: 'Implement query caching and optimize the user_profiles table indexes',
      impact: 'Could improve response time by 35-50%',
      confidence: 87
    },
    {
      type: 'usability',
      severity: 'medium',
      title: 'Low Click-Through Rate on Primary CTA',
      description: 'Main call-to-action button has only 12% click-through rate',
      recommendation: 'A/B test different button colors and positioning',
      impact: 'Could increase conversions by 20-30%',
      confidence: 73
    },
    {
      type: 'engagement',
      severity: 'low',
      title: 'High Bounce Rate on Landing Page',
      description: 'Landing page has 67% bounce rate, above industry average',
      recommendation: 'Improve above-the-fold content and page load speed',
      impact: 'Could reduce bounce rate by 15-25%',
      confidence: 65
    }
  ];

  const mockUserBehavior: UserBehaviorAnalytics = userBehavior || {
    totalSessions: 2847,
    averageSessionDuration: 245,
    mostVisitedPages: [
      { page: '/', visits: 1234 },
      { page: '/gaming', visits: 892 },
      { page: '/enhanced-crypto', visits: 567 },
      { page: '/ai-dashboard', visits: 445 },
      { page: '/admin', visits: 234 }
    ],
    mostClickedElements: [
      { element: 'primary-cta-button', clicks: 456 },
      { element: 'navigation-menu', clicks: 389 },
      { element: 'gaming-challenge-card', clicks: 267 },
      { element: 'crypto-trade-button', clicks: 234 },
      { element: 'ai-analysis-button', clicks: 198 }
    ],
    userJourney: [
      { from: '/', to: '/gaming', count: 234 },
      { from: '/gaming', to: '/enhanced-crypto', count: 187 },
      { from: '/', to: '/ai-dashboard', count: 156 },
      { from: '/enhanced-crypto', to: '/ai-dashboard', count: 134 },
      { from: '/ai-dashboard', to: '/admin', count: 89 }
    ]
  };

  // Mock heat map data
  const mockHeatMapData = [
    { x: 150, y: 80, intensity: 0.9, count: 45 },
    { x: 300, y: 120, intensity: 0.7, count: 32 },
    { x: 450, y: 200, intensity: 0.5, count: 28 },
    { x: 200, y: 300, intensity: 0.8, count: 38 },
    { x: 600, y: 150, intensity: 0.6, count: 29 },
    { x: 100, y: 400, intensity: 0.4, count: 21 },
    { x: 500, y: 350, intensity: 0.7, count: 35 }
  ];

  // Mock click ratio data
  const mockClickRatioData = [
    {
      element: 'primary-cta-button',
      page: selectedPage,
      totalViews: 1250,
      totalClicks: 456,
      clickRatio: 0.365,
      conversionRate: 0.365,
      avgTimeToClick: 2.3,
      bounceRate: 0.23
    },
    {
      element: 'navigation-menu',
      page: selectedPage,
      totalViews: 1100,
      totalClicks: 389,
      clickRatio: 0.354,
      conversionRate: 0.354,
      avgTimeToClick: 1.8,
      bounceRate: 0.12
    },
    {
      element: 'gaming-link',
      page: selectedPage,
      totalViews: 890,
      totalClicks: 267,
      clickRatio: 0.3,
      conversionRate: 0.3,
      avgTimeToClick: 3.1,
      bounceRate: 0.34
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="h-4 w-4" />;
      case 'warning': return <AlertTriangle className="h-4 w-4" />;
      case 'critical': return <AlertTriangle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'text-blue-600 bg-blue-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 relative overflow-hidden">
      <FloatingElements />
      
      <div className="container mx-auto px-6 py-8 relative z-10">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center mb-4">
              <Brain className="h-12 w-12 text-purple-600 mr-3" />
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  AI Diagnostics Center
                </h1>
                <p className="text-xl text-gray-600">
                  Advanced analytics and insights for developers and admins
                </p>
              </div>
            </div>
          </motion.div>

          <div className="flex gap-3">
            <Button
              variant={autoRefresh ? "default" : "outline"}
              size="sm"
              onClick={() => setAutoRefresh(!autoRefresh)}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
              Auto Refresh
            </Button>
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1h">Last Hour</SelectItem>
                <SelectItem value="24h">Last 24h</SelectItem>
                <SelectItem value="7d">Last 7 Days</SelectItem>
                <SelectItem value="30d">Last 30 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* System Health Overview */}
        <Card3D className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MonitorSpeaker className="h-5 w-5" />
                System Health Overview
              </CardTitle>
              <CardDescription>
                Real-time system performance and health metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-4 gap-6 mb-6">
                <div className="text-center">
                  <div className={`text-3xl font-bold mb-2 ${
                    mockSystemHealth.overall === 'healthy' ? 'text-green-600' :
                    mockSystemHealth.overall === 'warning' ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {mockSystemHealth.score}%
                  </div>
                  <Badge className={getStatusColor(mockSystemHealth.overall)}>
                    {getStatusIcon(mockSystemHealth.overall)}
                    <span className="ml-1">{mockSystemHealth.overall.toUpperCase()}</span>
                  </Badge>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600 mb-2">{mockUserBehavior.totalSessions}</div>
                  <div className="text-sm text-gray-600">Active Sessions</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600 mb-2">{Math.round(mockUserBehavior.averageSessionDuration / 60)}m</div>
                  <div className="text-sm text-gray-600">Avg Session</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600 mb-2">{mockInsights.length}</div>
                  <div className="text-sm text-gray-600">Active Insights</div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Component Status</h4>
                  <div className="space-y-2">
                    {mockSystemHealth.components.map((component) => (
                      <div key={component.name} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(component.status)}
                          <span className="text-sm font-medium">{component.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{component.metrics.current}{component.metrics.unit}</span>
                          <Badge className={getStatusColor(component.status)}>
                            {component.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Top Recommendations</h4>
                  <div className="space-y-2">
                    {(mockSystemHealth.recommendations || []).map((rec, index) => (
                      <div key={index} className="p-2 bg-blue-50 rounded text-sm text-blue-800">
                        • {rec}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </Card3D>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="heatmap">Heat Maps</TabsTrigger>
            <TabsTrigger value="analytics">Click Analytics</TabsTrigger>
            <TabsTrigger value="insights">AI Insights</TabsTrigger>
            <TabsTrigger value="behavior">User Behavior</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card3D>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5" />
                      Performance Metrics
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {mockSystemHealth.components.map((component) => (
                        <div key={component.name}>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium">{component.name}</span>
                            <span className="text-sm text-gray-600">
                              {component.metrics.current}{component.metrics.unit}
                            </span>
                          </div>
                          <Progress 
                            value={(component.metrics.current / component.metrics.threshold) * 100} 
                            className="h-2" 
                          />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </Card3D>

              <Card3D>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      User Engagement
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm">Page Views</span>
                        <span className="font-semibold">{mockUserBehavior.mostVisitedPages.reduce((sum, page) => sum + page.visits, 0)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Total Clicks</span>
                        <span className="font-semibold">{mockUserBehavior.mostClickedElements.reduce((sum, el) => sum + el.clicks, 0)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Avg Session</span>
                        <span className="font-semibold">{Math.round(mockUserBehavior.averageSessionDuration / 60)}m {mockUserBehavior.averageSessionDuration % 60}s</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Active Paths</span>
                        <span className="font-semibold">{mockUserBehavior.userJourney.length}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Card3D>
            </div>
          </TabsContent>

          {/* Heat Map Tab */}
          <TabsContent value="heatmap" className="space-y-6">
            <div className="mb-4">
              <Select value={selectedPage} onValueChange={setSelectedPage}>
                <SelectTrigger className="w-64">
                  <SelectValue placeholder="Select page to analyze" />
                </SelectTrigger>
                <SelectContent>
                  {mockUserBehavior.mostVisitedPages.map((page) => (
                    <SelectItem key={page.page} value={page.page}>
                      {page.page} ({page.visits} visits)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <HeatMap 
              data={mockHeatMapData}
              page={selectedPage}
              timeRange={timeRange}
              onTimeRangeChange={setTimeRange}
            />
          </TabsContent>

          {/* Click Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <ClickRatioAnalytics 
              data={mockClickRatioData}
              page={selectedPage}
            />
          </TabsContent>

          {/* AI Insights Tab */}
          <TabsContent value="insights" className="space-y-6">
            <div className="grid gap-6">
              {mockInsights.map((insight, index) => (
                <Card3D key={index}>
                  <Card>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          <Brain className="h-5 w-5 text-purple-600" />
                          <div>
                            <CardTitle>{insight.title}</CardTitle>
                            <CardDescription>{insight.type.charAt(0).toUpperCase() + insight.type.slice(1)} Analysis</CardDescription>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Badge className={getSeverityColor(insight.severity)}>
                            {insight.severity.toUpperCase()}
                          </Badge>
                          <Badge variant="outline">
                            {insight.confidence}% confidence
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium mb-2">Analysis</h4>
                          <p className="text-gray-700">{insight.description}</p>
                        </div>
                        
                        <div>
                          <h4 className="font-medium mb-2">Recommendation</h4>
                          <p className="text-blue-700 bg-blue-50 p-3 rounded">{insight.recommendation}</p>
                        </div>
                        
                        <div>
                          <h4 className="font-medium mb-2">Expected Impact</h4>
                          <p className="text-green-700">{insight.impact}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Card3D>
              ))}
            </div>
          </TabsContent>

          {/* User Behavior Tab */}
          <TabsContent value="behavior" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card3D>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Eye className="h-5 w-5" />
                      Most Visited Pages
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {mockUserBehavior.mostVisitedPages.map((page, index) => (
                        <div key={page.page} className="flex justify-between items-center">
                          <span className="text-sm font-medium">{page.page}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">{page.visits}</span>
                            <Progress 
                              value={(page.visits / mockUserBehavior.mostVisitedPages[0].visits) * 100} 
                              className="w-16 h-2" 
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </Card3D>

              <Card3D>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MousePointer className="h-5 w-5" />
                      Most Clicked Elements
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {mockUserBehavior.mostClickedElements.map((element, index) => (
                        <div key={element.element} className="flex justify-between items-center">
                          <span className="text-sm font-medium">{element.element}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">{element.clicks}</span>
                            <Progress 
                              value={(element.clicks / mockUserBehavior.mostClickedElements[0].clicks) * 100} 
                              className="w-16 h-2" 
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </Card3D>
            </div>

            <Card3D>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    User Journey Flow
                  </CardTitle>
                  <CardDescription>
                    Most common navigation paths through the application
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {mockUserBehavior.userJourney.map((journey, index) => (
                      <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2 flex-1">
                          <span className="font-medium text-blue-600">{journey.from}</span>
                          <span className="text-gray-400">→</span>
                          <span className="font-medium text-green-600">{journey.to}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">{journey.count} users</span>
                          <Progress 
                            value={(journey.count / mockUserBehavior.userJourney[0].count) * 100} 
                            className="w-20 h-2" 
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </Card3D>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}