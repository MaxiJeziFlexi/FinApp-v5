import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { 
  FileText, 
  Download, 
  TrendingUp, 
  PieChart, 
  BarChart3, 
  DollarSign,
  Target,
  AlertTriangle,
  Lightbulb,
  Calendar,
  Brain
} from 'lucide-react';

export default function AIReportGenerator() {
  const [reportType, setReportType] = useState('monthly');
  const [isGenerating, setIsGenerating] = useState(false);

  const { data: reportData, isLoading } = useQuery({
    queryKey: ['/api/reports/financial-analysis'],
    refetchInterval: 60000,
  });

  const generateReportMutation = useMutation({
    mutationFn: async (type: string) => {
      setIsGenerating(true);
      const response = await apiRequest(`/api/reports/generate`, {
        method: 'POST',
        body: JSON.stringify({ type, analysisDepth: 'comprehensive' })
      });
      setIsGenerating(false);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/reports/financial-analysis'] });
    }
  });

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Brain className="w-8 h-8 text-blue-600" />
          AI Report Generator
        </h1>
        <p className="text-gray-600">Generate comprehensive financial reports with AI-powered insights</p>
      </div>

      <Tabs defaultValue="generator" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="generator">Generate Report</TabsTrigger>
          <TabsTrigger value="monthly">Monthly Analysis</TabsTrigger>
          <TabsTrigger value="investment">Investment Performance</TabsTrigger>
          <TabsTrigger value="risk">Risk Assessment</TabsTrigger>
        </TabsList>

        <TabsContent value="generator" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow border-2 border-blue-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-600" />
                  Monthly Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-gray-600 mb-3">Comprehensive monthly financial overview</p>
                <Button 
                  size="sm" 
                  className="w-full"
                  onClick={() => generateReportMutation.mutate('monthly')}
                  disabled={isGenerating}
                >
                  {isGenerating ? 'Generating...' : 'Generate'}
                </Button>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-lg transition-shadow border-2 border-green-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  Investment Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-gray-600 mb-3">Portfolio performance and optimization</p>
                <Button 
                  size="sm" 
                  className="w-full bg-green-600 hover:bg-green-700"
                  onClick={() => generateReportMutation.mutate('investment')}
                  disabled={isGenerating}
                >
                  {isGenerating ? 'Generating...' : 'Generate'}
                </Button>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-lg transition-shadow border-2 border-orange-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-orange-600" />
                  Risk Assessment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-gray-600 mb-3">Financial risk analysis and mitigation</p>
                <Button 
                  size="sm" 
                  className="w-full bg-orange-600 hover:bg-orange-700"
                  onClick={() => generateReportMutation.mutate('risk')}
                  disabled={isGenerating}
                >
                  {isGenerating ? 'Generating...' : 'Generate'}
                </Button>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-lg transition-shadow border-2 border-purple-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Target className="w-4 h-4 text-purple-600" />
                  Goal Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-gray-600 mb-3">Financial goals tracking and insights</p>
                <Button 
                  size="sm" 
                  className="w-full bg-purple-600 hover:bg-purple-700"
                  onClick={() => generateReportMutation.mutate('goals')}
                  disabled={isGenerating}
                >
                  {isGenerating ? 'Generating...' : 'Generate'}
                </Button>
              </CardContent>
            </Card>
          </div>

          {reportData && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Latest Generated Report</span>
                  <Button size="sm" variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Download PDF
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="text-blue-600 font-semibold">Total Assets</div>
                    <div className="text-2xl font-bold text-blue-700">$125,847</div>
                    <div className="text-sm text-blue-600">+12.3% this month</div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="text-green-600 font-semibold">Monthly Savings</div>
                    <div className="text-2xl font-bold text-green-700">$3,240</div>
                    <div className="text-sm text-green-600">+8.5% vs goal</div>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="text-purple-600 font-semibold">Investment ROI</div>
                    <div className="text-2xl font-bold text-purple-700">14.2%</div>
                    <div className="text-sm text-purple-600">Above market avg</div>
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-yellow-500" />
                    AI-Generated Insights
                  </h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="text-green-500">•</span>
                      Your emergency fund has reached 6 months of expenses - excellent financial health
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-500">•</span>
                      Consider increasing 401(k) contribution by 2% to maximize employer matching
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-orange-500">•</span>
                      Dining expenses increased 23% - review monthly subscriptions and discretionary spending
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="monthly" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Spending Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm">Housing</span>
                      <span className="font-semibold">$2,100 (35%)</span>
                    </div>
                    <Progress value={35} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm">Food & Dining</span>
                      <span className="font-semibold">$720 (12%)</span>
                    </div>
                    <Progress value={12} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm">Transportation</span>
                      <span className="font-semibold">$480 (8%)</span>
                    </div>
                    <Progress value={8} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm">Savings & Investments</span>
                      <span className="font-semibold text-green-600">$1,800 (30%)</span>
                    </div>
                    <Progress value={30} className="h-2 bg-green-100" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Growth Opportunities</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 bg-green-50 rounded-lg">
                  <h4 className="font-semibold text-green-800 mb-1">Tax Optimization</h4>
                  <p className="text-sm text-green-700">Potential savings: $2,400/year</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-1">Investment Rebalancing</h4>
                  <p className="text-sm text-blue-700">Optimize portfolio allocation for higher returns</p>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg">
                  <h4 className="font-semibold text-purple-800 mb-1">Debt Optimization</h4>
                  <p className="text-sm text-purple-700">Refinancing could save $180/month</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="investment" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Portfolio Value</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$89,247</div>
                <div className="text-sm text-green-600">+18.3% YTD</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Monthly Contribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$1,500</div>
                <div className="text-sm text-blue-600">Auto-invested</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Risk Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">6.2/10</div>
                <div className="text-sm text-orange-600">Moderate Risk</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Portfolio Allocation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">US Stocks</span>
                    <Badge>60%</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">International Stocks</span>
                    <Badge variant="secondary">25%</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Bonds</span>
                    <Badge variant="outline">10%</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Cash & Alternatives</span>
                    <Badge variant="outline">5%</Badge>
                  </div>
                </div>
                <div className="bg-gradient-to-r from-blue-50 to-green-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">AI Recommendation</h4>
                  <p className="text-sm text-gray-700">Consider rebalancing to increase international exposure by 5% for better diversification given current market conditions.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="risk" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-orange-500" />
                  Risk Assessment
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm">Credit Risk</span>
                      <Badge className="bg-green-100 text-green-800">Low</Badge>
                    </div>
                    <Progress value={20} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm">Market Risk</span>
                      <Badge className="bg-yellow-100 text-yellow-800">Medium</Badge>
                    </div>
                    <Progress value={60} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm">Liquidity Risk</span>
                      <Badge className="bg-green-100 text-green-800">Low</Badge>
                    </div>
                    <Progress value={25} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm">Inflation Risk</span>
                      <Badge className="bg-orange-100 text-orange-800">High</Badge>
                    </div>
                    <Progress value={75} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Risk Mitigation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="border-l-4 border-blue-500 pl-3">
                  <h4 className="font-semibold text-blue-800">Emergency Fund</h4>
                  <p className="text-sm text-gray-600">Maintain 6 months of expenses in high-yield savings</p>
                </div>
                <div className="border-l-4 border-green-500 pl-3">
                  <h4 className="font-semibold text-green-800">Diversification</h4>
                  <p className="text-sm text-gray-600">Spread investments across asset classes and regions</p>
                </div>
                <div className="border-l-4 border-purple-500 pl-3">
                  <h4 className="font-semibold text-purple-800">Insurance Coverage</h4>
                  <p className="text-sm text-gray-600">Review life, disability, and property insurance annually</p>
                </div>
                <div className="border-l-4 border-orange-500 pl-3">
                  <h4 className="font-semibold text-orange-800">Inflation Hedge</h4>
                  <p className="text-sm text-gray-600">Consider TIPS and real estate investment exposure</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}