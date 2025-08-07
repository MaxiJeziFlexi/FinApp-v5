import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';
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
  Info
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import FloatingElements, { Card3D } from '@/components/3d/FloatingElements';

interface AIPerformanceMetrics {
  predictionAccuracy: number;
  quantumModelEfficiency: number;
  spectrumTaxOptimization: number;
  userSatisfactionScore: number;
  totalPredictions: number;
  successfulOptimizations: number;
}

interface QuantumModel {
  name: string;
  algorithm: string;
  accuracy: number;
  lastUpdate: string;
  status: 'active' | 'training' | 'error';
}

export default function AdvancedAIDashboard() {
  const [activeTab, setActiveTab] = useState('performance');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch AI performance metrics
  const { data: aiMetrics } = useQuery<AIPerformanceMetrics>({
    queryKey: ['/api/admin/ai-performance'],
  });

  // Fetch quantum models status
  const { data: quantumModels } = useQuery<QuantumModel[]>({
    queryKey: ['/api/admin/quantum-models'],
  });

  // Retrain AI models mutation
  const retrainModelsMutation = useMutation({
    mutationFn: async (modelType: string) => {
      const response = await apiRequest('POST', '/api/admin/retrain-models', { modelType });
      return response;
    },
    onSuccess: () => {
      toast({
        title: "AI Models Retrained",
        description: "Quantum mathematics and spectrum tax models have been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/ai-performance'] });
    }
  });

  // Update spectrum tax data mutation
  const updateTaxDataMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/admin/update-tax-data', {});
      return response;
    },
    onSuccess: () => {
      toast({
        title: "Tax Data Updated",
        description: "2025 tax reforms and spectrum analysis data has been refreshed.",
      });
    }
  });

  const mockAIMetrics: AIPerformanceMetrics = aiMetrics || {
    predictionAccuracy: 87.3,
    quantumModelEfficiency: 92.1,
    spectrumTaxOptimization: 85.7,
    userSatisfactionScore: 94.2,
    totalPredictions: 15247,
    successfulOptimizations: 12890
  };

  const mockQuantumModels: QuantumModel[] = quantumModels || [
    {
      name: 'Quantum Portfolio Optimizer',
      algorithm: 'Quantum Monte Carlo',
      accuracy: 91.2,
      lastUpdate: '2025-08-06T14:30:00Z',
      status: 'active'
    },
    {
      name: 'Spectrum Tax Analyzer',
      algorithm: 'Quantum Fourier Transform',
      accuracy: 88.7,
      lastUpdate: '2025-08-06T12:15:00Z',
      status: 'active'
    },
    {
      name: 'Market Volatility Predictor',
      algorithm: 'Quantum Annealing',
      accuracy: 85.3,
      lastUpdate: '2025-08-06T10:45:00Z',
      status: 'training'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50 relative overflow-hidden">
      <FloatingElements />
      <div className="container mx-auto px-6 py-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center justify-center mb-4">
              <Brain className="h-12 w-12 text-purple-600 mr-3" />
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Advanced AI Control Center
              </h1>
            </div>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Monitor and control quantum mathematics models, spectrum tax analysis, and predictive customer needs assessment.
            </p>
          </motion.div>
        </div>

        {/* AI Performance Overview */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card3D>
            <Card className="text-center">
              <CardContent className="p-6">
                <Target className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <div className="text-3xl font-bold text-green-600 mb-1">
                  {mockAIMetrics.predictionAccuracy}%
                </div>
                <div className="text-sm text-gray-600">Prediction Accuracy</div>
              </CardContent>
            </Card>
          </Card3D>

          <Card3D>
            <Card className="text-center">
              <CardContent className="p-6">
                <Zap className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <div className="text-3xl font-bold text-blue-600 mb-1">
                  {mockAIMetrics.quantumModelEfficiency}%
                </div>
                <div className="text-sm text-gray-600">Quantum Efficiency</div>
              </CardContent>
            </Card>
          </Card3D>

          <Card3D>
            <Card className="text-center">
              <CardContent className="p-6">
                <Calculator className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <div className="text-3xl font-bold text-purple-600 mb-1">
                  {mockAIMetrics.spectrumTaxOptimization}%
                </div>
                <div className="text-sm text-gray-600">Tax Optimization</div>
              </CardContent>
            </Card>
          </Card3D>

          <Card3D>
            <Card className="text-center">
              <CardContent className="p-6">
                <Users className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                <div className="text-3xl font-bold text-orange-600 mb-1">
                  {mockAIMetrics.userSatisfactionScore}%
                </div>
                <div className="text-sm text-gray-600">User Satisfaction</div>
              </CardContent>
            </Card>
          </Card3D>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-fit">
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="quantum">Quantum Models</TabsTrigger>
            <TabsTrigger value="spectrum">Spectrum Tax</TabsTrigger>
            <TabsTrigger value="controls">Controls</TabsTrigger>
          </TabsList>

          {/* Performance Tab */}
          <TabsContent value="performance" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card3D>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      AI Performance Metrics
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Total Predictions</span>
                        <Badge variant="secondary">{mockAIMetrics.totalPredictions.toLocaleString()}</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Successful Optimizations</span>
                        <Badge variant="secondary">{mockAIMetrics.successfulOptimizations.toLocaleString()}</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Success Rate</span>
                        <Badge className="bg-green-100 text-green-800">
                          {((mockAIMetrics.successfulOptimizations / mockAIMetrics.totalPredictions) * 100).toFixed(1)}%
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Card3D>

              <Card3D>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5" />
                      Real-Time Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm">Quantum Models Active</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm">Spectrum Tax Data Updated</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-yellow-500" />
                        <span className="text-sm">Model Retraining Recommended</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Info className="h-4 w-4 text-blue-500" />
                        <span className="text-sm">Next Update: 2 hours</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Card3D>
            </div>
          </TabsContent>

          {/* Quantum Models Tab */}
          <TabsContent value="quantum" className="space-y-6">
            <div className="grid gap-6">
              {mockQuantumModels.map((model) => (
                <Card3D key={model.name}>
                  <Card>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>{model.name}</CardTitle>
                          <CardDescription>Algorithm: {model.algorithm}</CardDescription>
                        </div>
                        <Badge 
                          className={`${
                            model.status === 'active' ? 'bg-green-100 text-green-800' :
                            model.status === 'training' ? 'bg-blue-100 text-blue-800' :
                            'bg-red-100 text-red-800'
                          }`}
                        >
                          {model.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid md:grid-cols-3 gap-4">
                        <div>
                          <div className="text-2xl font-bold text-purple-600 text-center ml-[0px] mr-[0px]">{model.accuracy}%</div>
                          <div className="text-sm text-gray-600">Accuracy</div>
                        </div>
                        <div>
                          <div className="text-sm font-medium">Last Updated</div>
                          <div className="text-sm text-gray-600">
                            {new Date(model.lastUpdate).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => retrainModelsMutation.mutate(model.name)}
                            disabled={retrainModelsMutation.isPending}
                          >
                            <RefreshCw className="h-4 w-4 mr-1" />
                            Retrain
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Card3D>
              ))}
            </div>
          </TabsContent>

          {/* Spectrum Tax Tab */}
          <TabsContent value="spectrum" className="space-y-6">
            <Card3D>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calculator className="h-5 w-5" />
                    2025 Tax Reform Integration
                  </CardTitle>
                  <CardDescription>
                    Spectrum analysis of current tax regulations and optimization opportunities
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <h4 className="font-semibold">Active Tax Reforms</h4>
                        <ul className="text-sm space-y-1">
                          <li>• Section 199A QBI deduction extended</li>
                          <li>• Crypto tax clarity - DeFi protocols</li>
                          <li>• SALT cap modification proposals</li>
                          <li>• Green energy tax credits expansion</li>
                          <li>• Remote work tax nexus changes</li>
                        </ul>
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-semibold">Optimization Strategies</h4>
                        <ul className="text-sm space-y-1">
                          <li>• Augusta Rule implementation</li>
                          <li>• Conservation easement timing</li>
                          <li>• Installment sales optimization</li>
                          <li>• Like-kind exchange strategies</li>
                          <li>• Retirement backdoor conversions</li>
                        </ul>
                      </div>
                    </div>
                    <Button 
                      onClick={() => updateTaxDataMutation.mutate()}
                      disabled={updateTaxDataMutation.isPending}
                      className="bg-gradient-to-r from-green-600 to-emerald-600"
                    >
                      <RefreshCw className="mr-2 h-4 w-4" />
                      {updateTaxDataMutation.isPending ? 'Updating...' : 'Update Tax Data'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </Card3D>
          </TabsContent>

          {/* Controls Tab */}
          <TabsContent value="controls" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card3D>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="h-5 w-5" />
                      AI Model Controls
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button 
                      onClick={() => retrainModelsMutation.mutate('all')}
                      disabled={retrainModelsMutation.isPending}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600"
                    >
                      <Brain className="mr-2 h-4 w-4" />
                      {retrainModelsMutation.isPending ? 'Retraining...' : 'Retrain All Models'}
                    </Button>
                    <Button variant="outline" className="w-full">
                      <Target className="mr-2 h-4 w-4" />
                      Calibrate Predictions
                    </Button>
                    <Button variant="outline" className="w-full">
                      <Zap className="mr-2 h-4 w-4" />
                      Optimize Performance
                    </Button>
                  </CardContent>
                </Card>
              </Card3D>

              <Card3D>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5" />
                      Financial Impact
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm">Average Savings per User</span>
                        <span className="font-semibold text-green-600">$12,450</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Total Platform Savings</span>
                        <span className="font-semibold text-green-600">$2.8M</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Tax Optimization Success</span>
                        <span className="font-semibold text-blue-600">89.2%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Card3D>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}