import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  Database,
  Brain,
  Settings,
  Activity,
  Users,
  Lock,
  Eye,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Play,
  Pause,
  Square,
  BarChart3,
  Cpu,
  MessageSquare,
  FileText,
  Search,
  Download,
  Upload,
  Trash2,
  Edit,
  Save,
  X,
  Filter,
  Globe,
  Zap,
  Target,
  Info,
  DollarSign,
  Clock,
  UserCheck,
  UserX,
  Key,
  History
} from 'lucide-react';

interface AISystemData {
  id: string;
  name: string;
  type: 'chat' | 'analysis' | 'generation' | 'monitoring';
  status: 'active' | 'inactive' | 'error' | 'maintenance';
  users: number;
  requests: number;
  accuracy: number;
  cost: number;
  lastUpdate: string;
  security: {
    level: 'high' | 'medium' | 'low';
    vulnerabilities: string[];
    lastScan: string;
  };
  performance: {
    cpu: number;
    memory: number;
    latency: number;
    throughput: number;
  };
  data: {
    trainingData: number;
    userInteractions: number;
    modelSize: string;
    dataQuality: number;
  };
}

interface SecurityAnalysis {
  overallScore: number;
  threatLevel: 'low' | 'medium' | 'high' | 'critical';
  vulnerabilities: {
    id: string;
    type: string;
    severity: string;
    description: string;
    status: string;
    detected: string;
  }[];
  recommendations: string[];
  lastScan: string;
  nextScan: string;
}

interface DataAnalytics {
  totalDataPoints: number;
  dataQuality: number;
  storageUsed: number;
  growthRate: number;
  categories: {
    name: string;
    count: number;
    quality: number;
    lastUpdate: string;
  }[];
  privacy: {
    encrypted: number;
    anonymized: number;
    sensitive: number;
    compliance: string[];
  };
}

export default function ComprehensiveAIControlCenter() {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedSystem, setSelectedSystem] = useState<string | null>(null);
  const [aiSystems, setAISystems] = useState<AISystemData[]>([]);
  const [securityData, setSecurityData] = useState<SecurityAnalysis | null>(null);
  const [analytics, setAnalytics] = useState<DataAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [realTimeMode, setRealTimeMode] = useState(false);
  const { toast } = useToast();

  // Mock data for demonstration - in production this would come from APIs
  useEffect(() => {
    const mockAISystems: AISystemData[] = [
      {
        id: 'chat-ai-1',
        name: 'Financial Chat Assistant',
        type: 'chat',
        status: 'active',
        users: 1247,
        requests: 15432,
        accuracy: 94.2,
        cost: 2145.67,
        lastUpdate: new Date().toISOString(),
        security: {
          level: 'high',
          vulnerabilities: [],
          lastScan: new Date(Date.now() - 3600000).toISOString()
        },
        performance: {
          cpu: 45,
          memory: 62,
          latency: 120,
          throughput: 150
        },
        data: {
          trainingData: 450000,
          userInteractions: 98765,
          modelSize: '7.5GB',
          dataQuality: 96.8
        }
      },
      {
        id: 'analysis-ai-1',
        name: 'Investment Analysis AI',
        type: 'analysis',
        status: 'active',
        users: 890,
        requests: 8765,
        accuracy: 91.7,
        cost: 1876.43,
        lastUpdate: new Date(Date.now() - 1800000).toISOString(),
        security: {
          level: 'high',
          vulnerabilities: ['minor-data-leak-risk'],
          lastScan: new Date(Date.now() - 7200000).toISOString()
        },
        performance: {
          cpu: 78,
          memory: 84,
          latency: 89,
          throughput: 95
        },
        data: {
          trainingData: 780000,
          userInteractions: 56789,
          modelSize: '12.3GB',
          dataQuality: 94.1
        }
      },
      {
        id: 'generation-ai-1',
        name: 'Report Generation AI',
        type: 'generation',
        status: 'maintenance',
        users: 234,
        requests: 3456,
        accuracy: 89.3,
        cost: 845.21,
        lastUpdate: new Date(Date.now() - 3600000).toISOString(),
        security: {
          level: 'medium',
          vulnerabilities: ['outdated-dependencies'],
          lastScan: new Date(Date.now() - 86400000).toISOString()
        },
        performance: {
          cpu: 25,
          memory: 30,
          latency: 250,
          throughput: 45
        },
        data: {
          trainingData: 120000,
          userInteractions: 12345,
          modelSize: '4.7GB',
          dataQuality: 87.9
        }
      }
    ];

    const mockSecurity: SecurityAnalysis = {
      overallScore: 87,
      threatLevel: 'low',
      vulnerabilities: [
        {
          id: 'vuln-001',
          type: 'Data Exposure',
          severity: 'medium',
          description: 'Minor risk of data leakage in analysis logs',
          status: 'monitoring',
          detected: new Date(Date.now() - 86400000).toISOString()
        }
      ],
      recommendations: [
        'Implement additional encryption for sensitive data',
        'Update security scanning frequency',
        'Review access control policies',
        'Enable real-time threat monitoring'
      ],
      lastScan: new Date(Date.now() - 3600000).toISOString(),
      nextScan: new Date(Date.now() + 82800000).toISOString()
    };

    const mockAnalytics: DataAnalytics = {
      totalDataPoints: 2456789,
      dataQuality: 94.5,
      storageUsed: 847.6,
      growthRate: 12.3,
      categories: [
        { name: 'Chat Interactions', count: 1250000, quality: 96.2, lastUpdate: new Date().toISOString() },
        { name: 'Financial Data', count: 780000, quality: 98.1, lastUpdate: new Date().toISOString() },
        { name: 'User Profiles', count: 156789, quality: 92.7, lastUpdate: new Date().toISOString() },
        { name: 'Market Analysis', count: 245000, quality: 94.8, lastUpdate: new Date().toISOString() }
      ],
      privacy: {
        encrypted: 98.7,
        anonymized: 87.3,
        sensitive: 2.1,
        compliance: ['GDPR', 'CCPA', 'SOC2']
      }
    };

    setAISystems(mockAISystems);
    setSecurityData(mockSecurity);
    setAnalytics(mockAnalytics);
    setLoading(false);
  }, []);

  const handleSystemControl = async (systemId: string, action: 'start' | 'stop' | 'restart') => {
    try {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setAISystems(prev => prev.map(system => 
        system.id === systemId 
          ? { ...system, status: action === 'stop' ? 'inactive' : 'active' }
          : system
      ));

      toast({
        title: "System Control",
        description: `Successfully ${action}ed ${systemId}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${action} system`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSecurityScan = async () => {
    try {
      setLoading(true);
      // Simulate security scan
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const updatedSecurity: SecurityAnalysis = {
        ...securityData!,
        lastScan: new Date().toISOString(),
        overallScore: Math.round(85 + Math.random() * 10),
      };
      
      setSecurityData(updatedSecurity);
      
      toast({
        title: "Security Scan Complete",
        description: `Security score: ${updatedSecurity.overallScore}/100`,
      });
    } catch (error) {
      toast({
        title: "Scan Failed",
        description: "Security scan could not be completed",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getSystemStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'inactive': return 'bg-gray-500';
      case 'error': return 'bg-red-500';
      case 'maintenance': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getSecurityLevelColor = (level: string) => {
    switch (level) {
      case 'high': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading && aiSystems.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading AI Control Center...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                🛡️ Comprehensive AI Control Center
              </h1>
              <p className="text-blue-200">
                Full administrative control over AI systems, data, and security
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Label htmlFor="realtime" className="text-white text-sm">Real-time Mode</Label>
                <Switch
                  id="realtime"
                  checked={realTimeMode}
                  onCheckedChange={setRealTimeMode}
                />
              </div>
              <Button
                onClick={() => window.location.reload()}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-slate-800 border-slate-700">
            <TabsTrigger value="overview" className="text-white data-[state=active]:bg-blue-600">
              <Eye className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="systems" className="text-white data-[state=active]:bg-blue-600">
              <Brain className="h-4 w-4 mr-2" />
              AI Systems
            </TabsTrigger>
            <TabsTrigger value="security" className="text-white data-[state=active]:bg-blue-600">
              <Shield className="h-4 w-4 mr-2" />
              Security
            </TabsTrigger>
            <TabsTrigger value="data" className="text-white data-[state=active]:bg-blue-600">
              <Database className="h-4 w-4 mr-2" />
              Data Analytics
            </TabsTrigger>
            <TabsTrigger value="controls" className="text-white data-[state=active]:bg-blue-600">
              <Settings className="h-4 w-4 mr-2" />
              Controls
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-white">Active AI Systems</CardTitle>
                  <Brain className="h-4 w-4 text-green-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{aiSystems.filter(s => s.status === 'active').length}</div>
                  <p className="text-xs text-gray-400">of {aiSystems.length} total systems</p>
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-white">Security Score</CardTitle>
                  <Shield className="h-4 w-4 text-blue-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{securityData?.overallScore}/100</div>
                  <p className="text-xs text-gray-400">Threat level: {securityData?.threatLevel}</p>
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-white">Data Quality</CardTitle>
                  <Database className="h-4 w-4 text-purple-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{analytics?.dataQuality}%</div>
                  <p className="text-xs text-gray-400">{analytics?.totalDataPoints.toLocaleString()} data points</p>
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-white">Total Cost</CardTitle>
                  <DollarSign className="h-4 w-4 text-yellow-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">
                    ${aiSystems.reduce((sum, sys) => sum + sys.cost, 0).toLocaleString()}
                  </div>
                  <p className="text-xs text-gray-400">This month</p>
                </CardContent>
              </Card>
            </div>

            {/* System Status Grid */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">System Status Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {aiSystems.map((system) => (
                    <div
                      key={system.id}
                      className="p-4 bg-slate-700 rounded-lg border border-slate-600 hover:border-slate-500 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-medium text-white">{system.name}</h3>
                        <div className={`w-3 h-3 rounded-full ${getSystemStatusColor(system.status)}`} />
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between text-gray-300">
                          <span>Users:</span>
                          <span>{system.users.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-gray-300">
                          <span>Accuracy:</span>
                          <span>{system.accuracy}%</span>
                        </div>
                        <div className="flex justify-between text-gray-300">
                          <span>Cost:</span>
                          <span>${system.cost.toLocaleString()}</span>
                        </div>
                      </div>
                      <div className="mt-3">
                        <Badge className={getSecurityLevelColor(system.security.level)}>
                          {system.security.level} security
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* AI Systems Tab */}
          <TabsContent value="systems" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Systems List */}
              <div className="lg:col-span-2 space-y-4">
                {aiSystems.map((system) => (
                  <Card
                    key={system.id}
                    className={`bg-slate-800 border-slate-700 cursor-pointer transition-all ${
                      selectedSystem === system.id ? 'ring-2 ring-blue-500' : ''
                    }`}
                    onClick={() => setSelectedSystem(selectedSystem === system.id ? null : system.id)}
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-4 h-4 rounded-full ${getSystemStatusColor(system.status)}`} />
                          <div>
                            <CardTitle className="text-white">{system.name}</CardTitle>
                            <p className="text-sm text-gray-400 capitalize">{system.type} • {system.status}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSystemControl(system.id, system.status === 'active' ? 'stop' : 'start');
                            }}
                            className="border-slate-600 text-white hover:bg-slate-700"
                          >
                            {system.status === 'active' ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSystemControl(system.id, 'restart');
                            }}
                            className="border-slate-600 text-white hover:bg-slate-700"
                          >
                            <RefreshCw className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-gray-400">Users</p>
                          <p className="text-white font-medium">{system.users.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-gray-400">Requests</p>
                          <p className="text-white font-medium">{system.requests.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-gray-400">Accuracy</p>
                          <p className="text-white font-medium">{system.accuracy}%</p>
                        </div>
                        <div>
                          <p className="text-gray-400">Cost</p>
                          <p className="text-white font-medium">${system.cost.toLocaleString()}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* System Details */}
              <div>
                {selectedSystem && (
                  <Card className="bg-slate-800 border-slate-700">
                    <CardHeader>
                      <CardTitle className="text-white">System Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {(() => {
                        const system = aiSystems.find(s => s.id === selectedSystem);
                        if (!system) return null;
                        
                        return (
                          <>
                            <div>
                              <h4 className="text-white font-medium mb-2">Performance</h4>
                              <div className="space-y-2">
                                <div>
                                  <div className="flex justify-between text-sm mb-1">
                                    <span className="text-gray-400">CPU Usage</span>
                                    <span className="text-white">{system.performance.cpu}%</span>
                                  </div>
                                  <Progress value={system.performance.cpu} className="h-2" />
                                </div>
                                <div>
                                  <div className="flex justify-between text-sm mb-1">
                                    <span className="text-gray-400">Memory</span>
                                    <span className="text-white">{system.performance.memory}%</span>
                                  </div>
                                  <Progress value={system.performance.memory} className="h-2" />
                                </div>
                                <div className="flex justify-between text-sm">
                                  <span className="text-gray-400">Latency</span>
                                  <span className="text-white">{system.performance.latency}ms</span>
                                </div>
                              </div>
                            </div>
                            
                            <Separator className="bg-slate-600" />
                            
                            <div>
                              <h4 className="text-white font-medium mb-2">Data Metrics</h4>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-gray-400">Training Data</span>
                                  <span className="text-white">{system.data.trainingData.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-400">User Interactions</span>
                                  <span className="text-white">{system.data.userInteractions.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-400">Model Size</span>
                                  <span className="text-white">{system.data.modelSize}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-400">Data Quality</span>
                                  <span className="text-white">{system.data.dataQuality}%</span>
                                </div>
                              </div>
                            </div>
                            
                            <Separator className="bg-slate-600" />
                            
                            <div>
                              <h4 className="text-white font-medium mb-2">Security</h4>
                              <Badge className={getSecurityLevelColor(system.security.level)}>
                                {system.security.level} security level
                              </Badge>
                              {system.security.vulnerabilities.length > 0 && (
                                <div className="mt-2">
                                  <p className="text-sm text-orange-400">
                                    {system.security.vulnerabilities.length} vulnerability(ies) detected
                                  </p>
                                </div>
                              )}
                            </div>
                          </>
                        );
                      })()}
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-white">Security Overview</CardTitle>
                  <Button
                    onClick={handleSecurityScan}
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Shield className="h-4 w-4" />}
                    {loading ? 'Scanning...' : 'Run Scan'}
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-white">Overall Security Score</span>
                      <span className="text-2xl font-bold text-white">{securityData?.overallScore}/100</span>
                    </div>
                    <Progress value={securityData?.overallScore} className="h-3" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-slate-700 rounded-lg">
                      <div className="text-2xl font-bold text-white">{securityData?.vulnerabilities.length}</div>
                      <p className="text-sm text-gray-400">Vulnerabilities</p>
                    </div>
                    <div className="text-center p-3 bg-slate-700 rounded-lg">
                      <div className="text-2xl font-bold text-white capitalize">{securityData?.threatLevel}</div>
                      <p className="text-sm text-gray-400">Threat Level</p>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-400 mb-2">Last Scan</p>
                    <p className="text-white">{securityData?.lastScan ? new Date(securityData.lastScan).toLocaleString() : 'Never'}</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Security Recommendations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {securityData?.recommendations.map((rec, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-slate-700 rounded-lg">
                        <Info className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />
                        <p className="text-white text-sm">{rec}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Vulnerabilities */}
            {securityData?.vulnerabilities && securityData.vulnerabilities.length > 0 && (
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Detected Vulnerabilities</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {securityData?.vulnerabilities?.map((vuln) => (
                      <div key={vuln.id} className="p-4 bg-slate-700 rounded-lg border-l-4 border-orange-500">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-white font-medium">{vuln.type}</h4>
                          <Badge variant="outline" className="text-orange-400 border-orange-400">
                            {vuln.severity}
                          </Badge>
                        </div>
                        <p className="text-gray-300 text-sm mb-2">{vuln.description}</p>
                        <div className="flex items-center justify-between text-xs text-gray-400">
                          <span>Status: {vuln.status}</span>
                          <span>Detected: {new Date(vuln.detected).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Data Analytics Tab */}
          <TabsContent value="data" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Data Overview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-400">Total Data Points</p>
                    <p className="text-2xl font-bold text-white">{analytics?.totalDataPoints.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Data Quality</p>
                    <div className="flex items-center gap-2">
                      <Progress value={analytics?.dataQuality} className="flex-1" />
                      <span className="text-white font-medium">{analytics?.dataQuality}%</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Storage Used</p>
                    <p className="text-xl font-bold text-white">{analytics?.storageUsed} GB</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Growth Rate</p>
                    <div className="flex items-center gap-1">
                      <TrendingUp className="h-4 w-4 text-green-400" />
                      <span className="text-white font-medium">+{analytics?.growthRate}%/month</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="lg:col-span-2 bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Data Categories</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analytics?.categories.map((category, index) => (
                      <div key={index} className="p-3 bg-slate-700 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-white font-medium">{category.name}</h4>
                          <span className="text-white">{category.count.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Progress value={category.quality} className="flex-1" />
                          <span className="text-sm text-gray-400">{category.quality}% quality</span>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">
                          Last updated: {new Date(category.lastUpdate).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Privacy & Compliance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-white font-medium mb-3">Data Protection</h4>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-gray-400 text-sm">Encrypted</span>
                          <span className="text-white text-sm">{analytics?.privacy.encrypted}%</span>
                        </div>
                        <Progress value={analytics?.privacy.encrypted} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-gray-400 text-sm">Anonymized</span>
                          <span className="text-white text-sm">{analytics?.privacy.anonymized}%</span>
                        </div>
                        <Progress value={analytics?.privacy.anonymized} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-gray-400 text-sm">Sensitive Data</span>
                          <span className="text-orange-400 text-sm">{analytics?.privacy.sensitive}%</span>
                        </div>
                        <Progress value={analytics?.privacy.sensitive} className="h-2" />
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-white font-medium mb-3">Compliance Standards</h4>
                    <div className="flex flex-wrap gap-2">
                      {analytics?.privacy.compliance.map((standard, index) => (
                        <Badge key={index} className="bg-green-600 text-white">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          {standard}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Controls Tab */}
          <TabsContent value="controls" className="space-y-6">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">System-wide Controls</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="text-white font-medium">AI Model Controls</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="text-gray-300">Auto-scaling</Label>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label className="text-gray-300">Load balancing</Label>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label className="text-gray-300">Fail-safe mode</Label>
                        <Switch />
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="text-white font-medium">Security Controls</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="text-gray-300">Real-time monitoring</Label>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label className="text-gray-300">Threat detection</Label>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label className="text-gray-300">Auto-quarantine</Label>
                        <Switch />
                      </div>
                    </div>
                  </div>
                </div>

                <Separator className="bg-slate-600" />

                <div className="space-y-4">
                  <h4 className="text-white font-medium">Emergency Controls</h4>
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
                    >
                      <Square className="h-4 w-4 mr-2" />
                      Emergency Stop All
                    </Button>
                    <Button
                      variant="outline"
                      className="border-yellow-600 text-yellow-400 hover:bg-yellow-600 hover:text-white"
                    >
                      <Pause className="h-4 w-4 mr-2" />
                      Maintenance Mode
                    </Button>
                    <Button
                      variant="outline"
                      className="border-blue-600 text-blue-400 hover:bg-blue-600 hover:text-white"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Full System Restart
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Configuration Management</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-300">Global Rate Limit</Label>
                    <Select defaultValue="1000">
                      <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="500">500 req/min</SelectItem>
                        <SelectItem value="1000">1000 req/min</SelectItem>
                        <SelectItem value="2000">2000 req/min</SelectItem>
                        <SelectItem value="unlimited">Unlimited</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-gray-300">Default AI Model</Label>
                    <Select defaultValue="gpt-4o">
                      <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                        <SelectItem value="claude">Claude 3.5</SelectItem>
                        <SelectItem value="gemini">Gemini Pro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <Label className="text-gray-300">System Maintenance Window</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      placeholder="Start time (e.g., 02:00)"
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                    <Input
                      placeholder="End time (e.g., 04:00)"
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                </div>
                
                <div className="flex gap-3 pt-4">
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Save className="h-4 w-4 mr-2" />
                    Save Configuration
                  </Button>
                  <Button variant="outline" className="border-slate-600 text-gray-300 hover:bg-slate-700">
                    <Download className="h-4 w-4 mr-2" />
                    Export Settings
                  </Button>
                  <Button variant="outline" className="border-slate-600 text-gray-300 hover:bg-slate-700">
                    <Upload className="h-4 w-4 mr-2" />
                    Import Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}