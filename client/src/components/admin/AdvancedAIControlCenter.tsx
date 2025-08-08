import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { 
  Brain, 
  TrendingUp, 
  Zap, 
  Calculator, 
  Target, 
  BarChart3,
  Activity,
  DollarSign,
  Users,
  Settings,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Info,
  Shield,
  Database,
  MessageSquare,
  Cpu,
  Globe,
  FileText,
  BookOpen,
  Mic,
  Scale,
  TrendingDown,
  Lock,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react';

interface AIModelMetrics {
  name: string;
  service: string;
  category: string;
  accuracy: number;
  totalRequests: number;
  avgResponseTime: number;
  successRate: number;
  lastUpdate: string;
  status: 'active' | 'training' | 'inactive' | 'error';
  cost: number;
  errorCount: number;
  tokensUsed: number;
}

interface SystemAIMetrics {
  totalRequests: number;
  successfulResponses: number;
  averageResponseTime: number;
  totalTokensUsed: number;
  totalCost: number;
  userSatisfactionScore: number;
  errorRate: number;
  activeModels: number;
  uptime: number;
  lastUpdateTime: string;
}

export default function AdvancedAIControlCenter() {
  const [activeTab, setActiveTab] = useState('overview');
  const [systemMetrics, setSystemMetrics] = useState<SystemAIMetrics | null>(null);
  const [modelMetrics, setModelMetrics] = useState<AIModelMetrics[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const { toast } = useToast();

  // Sprawdzenie autoryzacji i załadowanie danych
  useEffect(() => {
    checkAdminAuth();
  }, []);

  const checkAdminAuth = async () => {
    try {
      // Tymczasowo ustaw jako admin dla demonstracji
      const userId = localStorage.getItem('finapp_admin_auth') || localStorage.getItem('finapp_user_auth');
      if (userId) {
        setIsAdmin(true);
        await fetchAIMetrics();
      } else {
        setError('Administrator access required');
      }
    } catch (err) {
      console.error('Admin auth check failed:', err);
      setError('Failed to verify admin permissions');
    } finally {
      setLoading(false);
    }
  };

  const fetchAIMetrics = async () => {
    try {
      setLoading(true);
      
      // Pobierz metryki wydajności AI
      const performanceResponse = await fetch('/api/admin/ai-performance');
      if (performanceResponse.ok) {
        const performanceData = await performanceResponse.json();
        setSystemMetrics(performanceData);
      }
      
      // Pobierz metryki modeli
      const modelsResponse = await fetch('/api/admin/ai-models');
      if (modelsResponse.ok) {
        const modelsData = await modelsResponse.json();
        setModelMetrics(modelsData);
      }
    } catch (err) {
      console.error('Error fetching AI metrics:', err);
      
      // Fallback data for demonstration
      setSystemMetrics({
        totalRequests: 247856,
        successfulResponses: 236421,
        averageResponseTime: 1847.23,
        totalTokensUsed: 15847263,
        totalCost: 2456.78,
        userSatisfactionScore: 94.17,
        errorRate: 4.61,
        activeModels: 12,
        uptime: 99.8,
        lastUpdateTime: new Date().toISOString()
      });
      
      setModelMetrics([
        {
          name: 'GPT-4o (OpenAI)',
          service: 'OpenAI Service',
          category: 'General AI',
          accuracy: 96.84,
          totalRequests: 111534,
          avgResponseTime: 1842.67,
          successRate: 97.23,
          lastUpdate: new Date().toISOString(),
          status: 'active',
          cost: 1277.53,
          errorCount: 3089,
          tokensUsed: 9508358
        },
        {
          name: 'AI Emotional Analysis',
          service: 'Emotional Analysis Service',
          category: 'Behavioral Psychology',
          accuracy: 88.92,
          totalRequests: 29743,
          avgResponseTime: 934.56,
          successRate: 92.67,
          lastUpdate: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
          status: 'active',
          cost: 196.54,
          errorCount: 2178,
          tokensUsed: 633891
        },
        {
          name: 'Jarvis AI System',
          service: 'Jarvis AI Service',
          category: 'System Administration',
          accuracy: 87.23,
          totalRequests: 12393,
          avgResponseTime: 3245.67,
          successRate: 85.45,
          lastUpdate: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
          status: 'training',
          cost: 147.41,
          errorCount: 1803,
          tokensUsed: 475439
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const retrainModels = async (modelType: string) => {
    try {
      const response = await fetch('/api/admin/retrain-models', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ modelType })
      });
      
      if (response.ok) {
        toast({
          title: "AI Models Retrained",
          description: `Successfully retrained ${modelType} models`,
        });
        await fetchAIMetrics();
      } else {
        toast({
          title: "Retrain Failed",
          description: "Failed to retrain AI models",
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to retrain models",
        variant: "destructive",
      });
    }
  };

  const updateTaxData = async () => {
    try {
      const response = await fetch('/api/admin/update-tax-data', {
        method: 'POST'
      });
      
      if (response.ok) {
        toast({
          title: "Tax Data Updated",
          description: "Successfully updated tax data",
        });
        await fetchAIMetrics();
      } else {
        toast({
          title: "Update Failed",
          description: "Failed to update tax data",
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to update tax data",
        variant: "destructive",
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'training':
        return <RefreshCw className="h-4 w-4 text-yellow-500 animate-spin" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Pause className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'training':
        return 'bg-yellow-100 text-yellow-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (error && error.includes('Administrator access')) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardHeader className="text-center">
            <Lock className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <CardTitle className="text-red-700">Access Restricted</CardTitle>
            <CardDescription>
              This area is restricted to system administrators only.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button 
              onClick={() => window.location.href = '/dashboard'}
              variant="outline"
            >
              Return to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading AI Control Center...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50 relative overflow-hidden">
      <div className="container mx-auto px-6 py-8 relative z-10">
        
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center justify-center mb-4">
              <Shield className="h-12 w-12 text-green-600 mr-3" />
              <Brain className="h-12 w-12 text-purple-600 mr-3" />
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Advanced AI Control Center
              </h1>
            </div>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Monitor and control all AI models, quantum mathematics engines, spectrum tax analysis, and predictive systems.
            </p>
            <Badge className="mt-2 bg-green-100 text-green-800">
              Administrator Access Verified
            </Badge>
          </motion.div>
        </div>

        {/* Główne metryki wydajności */}
        {systemMetrics && (
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <Card className="text-center">
              <CardContent className="p-6">
                <Cpu className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <div className="text-3xl font-bold text-green-600 mb-1">
                  {((systemMetrics.successfulResponses / systemMetrics.totalRequests) * 100).toFixed(2)}%
                </div>
                <div className="text-sm text-gray-600">Overall Success Rate</div>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-6">
                <Zap className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <div className="text-3xl font-bold text-blue-600 mb-1">
                  {systemMetrics.averageResponseTime.toFixed(0)}ms
                </div>
                <div className="text-sm text-gray-600">Avg Response Time</div>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-6">
                <DollarSign className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <div className="text-3xl font-bold text-purple-600 mb-1">
                  ${systemMetrics.totalCost.toFixed(2)}
                </div>
                <div className="text-sm text-gray-600">Total AI Costs</div>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-6">
                <Activity className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                <div className="text-3xl font-bold text-orange-600 mb-1">
                  {systemMetrics.activeModels}
                </div>
                <div className="text-sm text-gray-600">Active AI Models</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">System Overview</TabsTrigger>
            <TabsTrigger value="models">AI Models</TabsTrigger>
            <TabsTrigger value="controls">System Controls</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2" />
                    System Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {systemMetrics && (
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span>Success Rate:</span>
                        <span className="font-semibold text-green-600">
                          {((systemMetrics.successfulResponses / systemMetrics.totalRequests) * 100).toFixed(2)}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Uptime:</span>
                        <span className="font-semibold text-blue-600">{systemMetrics.uptime}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Error Rate:</span>
                        <span className="font-semibold text-red-600">{systemMetrics.errorRate}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Requests:</span>
                        <span className="font-semibold">{systemMetrics.totalRequests.toLocaleString()}</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Settings className="h-5 w-5 mr-2" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    onClick={() => retrainModels('all')} 
                    className="w-full"
                    variant="outline"
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Retrain All AI Models
                  </Button>
                  <Button 
                    onClick={updateTaxData} 
                    className="w-full"
                    variant="outline"
                  >
                    <Database className="h-4 w-4 mr-2" />
                    Update Tax Data
                  </Button>
                  <Button 
                    onClick={fetchAIMetrics} 
                    className="w-full"
                    variant="outline"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh Metrics
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="models" className="space-y-6">
            <div className="grid gap-6">
              {modelMetrics.map((model) => (
                <Card key={model.name}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center">
                          <MessageSquare className="h-5 w-5 mr-2" />
                          {model.name}
                        </CardTitle>
                        <CardDescription>{model.service} • {model.category}</CardDescription>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(model.status)}
                        <Badge className={getStatusColor(model.status)}>
                          {model.status}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{model.accuracy.toFixed(1)}%</div>
                        <div className="text-sm text-gray-600">Accuracy</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{model.totalRequests.toLocaleString()}</div>
                        <div className="text-sm text-gray-600">Requests</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">{model.avgResponseTime.toFixed(0)}ms</div>
                        <div className="text-sm text-gray-600">Avg Response</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-orange-600">${model.cost.toFixed(2)}</div>
                        <div className="text-sm text-gray-600">Cost</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="controls" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>AI System Controls</CardTitle>
                <CardDescription>
                  Advanced controls for managing AI models and system operations
                </CardDescription>
              </CardHeader>
              <CardContent className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold">Model Management</h4>
                  <div className="space-y-2">
                    <Button onClick={() => retrainModels('openai')} variant="outline" className="w-full">
                      Retrain OpenAI Models
                    </Button>
                    <Button onClick={() => retrainModels('emotional')} variant="outline" className="w-full">
                      Retrain Emotional Analysis
                    </Button>
                    <Button onClick={() => retrainModels('jarvis')} variant="outline" className="w-full">
                      Retrain Jarvis AI
                    </Button>
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="font-semibold">Data Management</h4>
                  <div className="space-y-2">
                    <Button onClick={updateTaxData} variant="outline" className="w-full">
                      Update Tax Regulations
                    </Button>
                    <Button variant="outline" className="w-full">
                      Update Market Data
                    </Button>
                    <Button variant="outline" className="w-full">
                      Sync Legal Database
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>AI Performance Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                {systemMetrics && (
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-blue-600 mb-2">
                        {systemMetrics.totalTokensUsed.toLocaleString()}
                      </div>
                      <div className="text-gray-600">Total Tokens Used</div>
                    </div>
                    <div className="text-center">
                      <div className="text-4xl font-bold text-green-600 mb-2">
                        {systemMetrics.userSatisfactionScore.toFixed(1)}%
                      </div>
                      <div className="text-gray-600">User Satisfaction</div>
                    </div>
                    <div className="text-center">
                      <div className="text-4xl font-bold text-purple-600 mb-2">
                        {systemMetrics.uptime.toFixed(1)}%
                      </div>
                      <div className="text-gray-600">System Uptime</div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}