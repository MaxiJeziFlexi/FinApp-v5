// Admin Monitoring Dashboard - Advanced Real-time Tool Monitoring
// Displays top 5 metrics, alerts, AI usage tracking, and whitelist compliance

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  AlertTriangle, 
  Activity, 
  Clock, 
  TrendingUp, 
  TrendingDown, 
  Shield, 
  CheckCircle, 
  XCircle,
  Brain,
  Search,
  RefreshCw,
  Settings
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface MonitoringMetrics {
  successRate: number;
  medianLatencyMs: number;
  fallbackRate: number;
  staleDataPercentage: number;
  whitelistViolations: number;
  timeRangeMinutes: number;
  totalExecutions: number;
  openaiUsage: {
    used: number;
    contentMatches: number;
    contentMismatches: number;
  };
  perplexityUsage: {
    used: number;
    contentMatches: number;
    contentMismatches: number;
  };
}

interface AlertInstance {
  id: string;
  title: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'active' | 'acknowledged' | 'resolved';
  triggeredAt: string;
  triggerValue: string;
  threshold: string;
}

interface ToolExecution {
  id: string;
  toolName: string;
  status: 'success' | 'failed' | 'timeout' | 'fallback';
  executionTimeMs: number;
  dataFreshness: 'real_time' | 'fresh' | 'stale' | 'unknown';
  openaiUsed: boolean;
  perplexityUsed: boolean;
  whitelistViolations: any[];
  createdAt: string;
}

export default function AdminMonitoring() {
  const [timeRange, setTimeRange] = useState(60); // minutes
  const [autoRefresh, setAutoRefresh] = useState(true);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch monitoring data - add demo param for development
  const { data: dashboardData, isLoading, error } = useQuery({
    queryKey: ['/api/admin/monitoring/dashboard', timeRange],
    queryFn: () => apiRequest('GET', `/api/admin/monitoring/dashboard?timeRange=${timeRange}&demo=true`),
    refetchInterval: autoRefresh ? 30000 : false, // Refresh every 30 seconds
  });

  // Acknowledge alert mutation
  const acknowledgeAlertMutation = useMutation({
    mutationFn: (alertId: string) => 
      apiRequest('POST', `/api/admin/monitoring/alerts/${alertId}/acknowledge`),
    onSuccess: () => {
      toast({ title: 'Alert acknowledged successfully' });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/monitoring/dashboard'] });
    },
    onError: () => {
      toast({ title: 'Failed to acknowledge alert', variant: 'destructive' });
    }
  });

  // Resolve alert mutation
  const resolveAlertMutation = useMutation({
    mutationFn: (alertId: string) => 
      apiRequest('POST', `/api/admin/monitoring/alerts/${alertId}/resolve`),
    onSuccess: () => {
      toast({ title: 'Alert resolved successfully' });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/monitoring/dashboard'] });
    },
    onError: () => {
      toast({ title: 'Failed to resolve alert', variant: 'destructive' });
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Card className="p-6">
          <CardContent>
            <div className="text-center text-red-600">
              Failed to load monitoring data. Please check your permissions.
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const metrics: MonitoringMetrics = dashboardData?.metrics;
  const activeAlerts: AlertInstance[] = dashboardData?.activeAlerts || [];
  const recentExecutions: ToolExecution[] = dashboardData?.recentExecutions || [];
  const trends = dashboardData?.trends || {};

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-600';
      case 'failed': return 'text-red-600';
      case 'timeout': return 'text-orange-600';
      case 'fallback': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  const getTrendIcon = (trend: number) => {
    if (trend > 0) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (trend < 0) return <TrendingDown className="h-4 w-4 text-red-600" />;
    return <div className="h-4 w-4" />;
  };

  return (
    <div className="container mx-auto p-6 space-y-6" data-testid="admin-monitoring-dashboard">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-dashboard-title">Tool Monitoring Dashboard</h1>
          <p className="text-muted-foreground">Real-time performance metrics and alerts</p>
        </div>
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
            data-testid="button-toggle-autorefresh"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
            Auto Refresh: {autoRefresh ? 'On' : 'Off'}
          </Button>
          <select 
            value={timeRange} 
            onChange={(e) => setTimeRange(Number(e.target.value))}
            className="px-3 py-2 border rounded-md"
            data-testid="select-time-range"
          >
            <option value={15}>Last 15 minutes</option>
            <option value={60}>Last hour</option>
            <option value={240}>Last 4 hours</option>
            <option value={1440}>Last 24 hours</option>
          </select>
        </div>
      </div>

      {/* Critical Alerts Banner */}
      {activeAlerts.filter(a => a.severity === 'critical').length > 0 && (
        <Card className="border-red-500 bg-red-50 dark:bg-red-950/10">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-800 dark:text-red-200">
              <AlertTriangle className="h-5 w-5" />
              <span className="font-semibold">Critical Alert Active</span>
              <Badge variant="destructive" data-testid="badge-critical-alerts">
                {activeAlerts.filter(a => a.severity === 'critical').length} Critical
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Top 5 Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card data-testid="card-success-rate">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600" data-testid="text-success-rate">
              {metrics?.successRate?.toFixed(1) || 0}%
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              {getTrendIcon(trends.successRateTrend)}
              <span className="ml-1">vs previous period</span>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-median-latency">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Median Latency</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-median-latency">
              {metrics?.medianLatencyMs || 0}ms
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              {getTrendIcon(trends.latencyTrend)}
              <span className="ml-1">vs previous period</span>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-fallback-rate">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fallback Rate</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600" data-testid="text-fallback-rate">
              {metrics?.fallbackRate?.toFixed(1) || 0}%
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              {getTrendIcon(trends.fallbackRateTrend)}
              <span className="ml-1">vs previous period</span>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-stale-data">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stale Data</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600" data-testid="text-stale-data">
              {metrics?.staleDataPercentage?.toFixed(1) || 0}%
            </div>
            <div className="text-xs text-muted-foreground">
              of responses
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-whitelist-violations">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Whitelist Violations</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600" data-testid="text-whitelist-violations">
              {metrics?.whitelistViolations || 0}
            </div>
            <div className="text-xs text-muted-foreground">
              in {timeRange} minutes
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="alerts">
            Alerts
            {activeAlerts.length > 0 && (
              <Badge variant="destructive" className="ml-2" data-testid="badge-active-alerts">
                {activeAlerts.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="executions">Recent Executions</TabsTrigger>
          <TabsTrigger value="ai-usage">AI Usage</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Execution Overview */}
            <Card data-testid="card-execution-overview">
              <CardHeader>
                <CardTitle>Execution Overview</CardTitle>
                <CardDescription>Last {timeRange} minutes</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Total Executions</span>
                  <span className="font-bold" data-testid="text-total-executions">
                    {metrics?.totalExecutions || 0}
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Success Rate</span>
                    <span>{metrics?.successRate?.toFixed(1) || 0}%</span>
                  </div>
                  <Progress value={metrics?.successRate || 0} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Fallback Rate</span>
                    <span>{metrics?.fallbackRate?.toFixed(1) || 0}%</span>
                  </div>
                  <Progress value={metrics?.fallbackRate || 0} className="h-2" />
                </div>
              </CardContent>
            </Card>

            {/* Data Quality */}
            <Card data-testid="card-data-quality">
              <CardHeader>
                <CardTitle>Data Quality</CardTitle>
                <CardDescription>Freshness and compliance metrics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Stale Data</span>
                    <span>{metrics?.staleDataPercentage?.toFixed(1) || 0}%</span>
                  </div>
                  <Progress value={metrics?.staleDataPercentage || 0} className="h-2" />
                </div>
                <div className="flex justify-between items-center">
                  <span>Whitelist Violations</span>
                  <Badge variant={metrics?.whitelistViolations > 0 ? 'destructive' : 'default'}>
                    {metrics?.whitelistViolations || 0}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Median Latency</span>
                  <span className="font-bold">{metrics?.medianLatencyMs || 0}ms</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <Card data-testid="card-alerts">
            <CardHeader>
              <CardTitle>Active Alerts</CardTitle>
              <CardDescription>
                Current system alerts requiring attention
              </CardDescription>
            </CardHeader>
            <CardContent>
              {activeAlerts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                  <p>No active alerts. All systems operational!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {activeAlerts.map((alert) => (
                    <div 
                      key={alert.id} 
                      className="border rounded-lg p-4 space-y-3"
                      data-testid={`alert-${alert.id}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${getSeverityColor(alert.severity)}`} />
                            <h4 className="font-semibold">{alert.title}</h4>
                            <Badge variant="outline">{alert.severity}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{alert.message}</p>
                          <p className="text-xs text-muted-foreground">
                            Triggered: {new Date(alert.triggeredAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {alert.status === 'active' && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => acknowledgeAlertMutation.mutate(alert.id)}
                              disabled={acknowledgeAlertMutation.isPending}
                              data-testid={`button-acknowledge-${alert.id}`}
                            >
                              Acknowledge
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => resolveAlertMutation.mutate(alert.id)}
                              disabled={resolveAlertMutation.isPending}
                              data-testid={`button-resolve-${alert.id}`}
                            >
                              Resolve
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="executions" className="space-y-4">
          <Card data-testid="card-recent-executions">
            <CardHeader>
              <CardTitle>Recent Executions</CardTitle>
              <CardDescription>Latest tool execution history</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {recentExecutions.slice(0, 20).map((execution) => (
                  <div 
                    key={execution.id} 
                    className="flex items-center justify-between py-2 border-b"
                    data-testid={`execution-${execution.id}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${getStatusColor(execution.status).replace('text-', 'bg-')}`} />
                      <span className="font-medium">{execution.toolName}</span>
                      <Badge variant="outline" className="text-xs">
                        {execution.dataFreshness}
                      </Badge>
                      {execution.openaiUsed && (
                        <Badge variant="secondary" className="text-xs">
                          <Brain className="h-3 w-3 mr-1" />
                          OpenAI
                        </Badge>
                      )}
                      {execution.perplexityUsed && (
                        <Badge variant="secondary" className="text-xs">
                          <Search className="h-3 w-3 mr-1" />
                          Perplexity
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{execution.executionTimeMs}ms</span>
                      <span className={getStatusColor(execution.status)}>
                        {execution.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai-usage" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card data-testid="card-openai-usage">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  OpenAI Usage
                </CardTitle>
                <CardDescription>Content verification and enrichment</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Times Used</span>
                  <span className="font-bold" data-testid="text-openai-usage-count">
                    {metrics?.openaiUsage?.used || 0}
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Content Matches</span>
                    <span className="text-green-600">{metrics?.openaiUsage?.contentMatches || 0}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Content Mismatches</span>
                    <span className="text-red-600">{metrics?.openaiUsage?.contentMismatches || 0}</span>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">
                  Treated as auxiliary source/enricher. Always shows primary source (BBC/NYT/BBG/WSJ) with date.
                </div>
              </CardContent>
            </Card>

            <Card data-testid="card-perplexity-usage">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  Perplexity Usage
                </CardTitle>
                <CardDescription>Real-time data verification</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Times Used</span>
                  <span className="font-bold" data-testid="text-perplexity-usage-count">
                    {metrics?.perplexityUsage?.used || 0}
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Content Matches</span>
                    <span className="text-green-600">{metrics?.perplexityUsage?.contentMatches || 0}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Content Mismatches</span>
                    <span className="text-red-600">{metrics?.perplexityUsage?.contentMismatches || 0}</span>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">
                  Used as verification source. Content compared against whitelist for compliance checking.
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}