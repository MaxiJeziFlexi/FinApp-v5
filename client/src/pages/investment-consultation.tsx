import { useState, useEffect } from 'react';
import PremiumGate from '@/components/premium/PremiumGate';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { 
  TrendingUp, 
  DollarSign, 
  Target, 
  BarChart3, 
  PieChart,
  Brain,
  Lightbulb,
  AlertCircle,
  Shield,
  Calendar,
  Calculator
} from 'lucide-react';

export default function InvestmentConsultation() {
  return (
    <PremiumGate required="PRO" fallbackTitle="Investment Consultation - PRO Feature" fallbackDescription="Access personalized investment advice and portfolio analysis with your PRO subscription.">
      <InvestmentConsultationContent />
    </PremiumGate>
  );
}

function InvestmentConsultationContent() {
  const [consultationType, setConsultationType] = useState('portfolio-review');
  const [investmentAmount, setInvestmentAmount] = useState('');
  const [riskTolerance, setRiskTolerance] = useState('moderate');
  const [timeHorizon, setTimeHorizon] = useState('long-term');

  const { data: marketData, isLoading: marketLoading } = useQuery({
    queryKey: ['/api/investment/market-analysis'],
    refetchInterval: 60000,
  });

  const { data: portfolioAnalysis } = useQuery({
    queryKey: ['/api/investment/portfolio-analysis'],
    refetchInterval: 300000, // 5 minutes
  });

  const consultationMutation = useMutation({
    mutationFn: async (consultation: any) => {
      const response = await apiRequest('POST', '/api/investment/consultation', consultation);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/investment/portfolio-analysis'] });
    }
  });

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Brain className="w-8 h-8 text-green-600" />
          Investment Consultation AI
        </h1>
        <p className="text-gray-600">Get personalized investment advice based on real-time market analysis</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="w-5 h-5" />
              Investment Consultation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="amount">Investment Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="Enter amount"
                  value={investmentAmount}
                  onChange={(e) => setInvestmentAmount(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="timeframe">Time Horizon</Label>
                <select 
                  className="w-full p-2 border rounded-md"
                  value={timeHorizon}
                  onChange={(e) => setTimeHorizon(e.target.value)}
                >
                  <option value="short-term">1-3 years</option>
                  <option value="medium-term">3-10 years</option>
                  <option value="long-term">10+ years</option>
                </select>
              </div>
            </div>

            <div>
              <Label>Risk Tolerance</Label>
              <div className="grid grid-cols-3 gap-2 mt-2">
                {['conservative', 'moderate', 'aggressive'].map((risk) => (
                  <Button
                    key={risk}
                    variant={riskTolerance === risk ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setRiskTolerance(risk)}
                  >
                    {risk.charAt(0).toUpperCase() + risk.slice(1)}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="goals">Investment Goals</Label>
              <Textarea
                id="goals"
                placeholder="Describe your investment goals and any specific requirements..."
                rows={3}
              />
            </div>

            <Button 
              className="w-full" 
              size="lg"
              onClick={() => consultationMutation.mutate({
                amount: investmentAmount,
                riskTolerance,
                timeHorizon,
                consultationType
              })}
              disabled={consultationMutation.isPending}
            >
              {consultationMutation.isPending ? 'Analyzing...' : 'Get AI Consultation'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              Market Snapshot
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-green-50 p-3 rounded-lg">
                <div className="text-green-600 text-sm font-semibold">S&P 500</div>
                <div className="text-lg font-bold">4,567</div>
                <div className="text-sm text-green-600">+1.2%</div>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="text-blue-600 text-sm font-semibold">NASDAQ</div>
                <div className="text-lg font-bold">14,234</div>
                <div className="text-sm text-blue-600">+0.8%</div>
              </div>
              <div className="bg-purple-50 p-3 rounded-lg">
                <div className="text-purple-600 text-sm font-semibold">10Y Treasury</div>
                <div className="text-lg font-bold">4.25%</div>
                <div className="text-sm text-purple-600">-0.1%</div>
              </div>
              <div className="bg-orange-50 p-3 rounded-lg">
                <div className="text-orange-600 text-sm font-semibold">VIX</div>
                <div className="text-lg font-bold">18.4</div>
                <div className="text-sm text-orange-600">+2.1%</div>
              </div>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-yellow-500" />
                Market Insight
              </h4>
              <p className="text-sm text-gray-600">
                Current market conditions favor diversified growth strategies with emerging market exposure.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="recommendations" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="recommendations">AI Recommendations</TabsTrigger>
          <TabsTrigger value="portfolio">Portfolio Optimization</TabsTrigger>
          <TabsTrigger value="market-trends">Market Analysis</TabsTrigger>
          <TabsTrigger value="risk-analysis">Risk Assessment</TabsTrigger>
        </TabsList>

        <TabsContent value="recommendations" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-blue-600" />
                  Recommended Allocation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm">Large Cap Stocks</span>
                    <span className="font-semibold">40%</span>
                  </div>
                  <Progress value={40} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm">International Stocks</span>
                    <span className="font-semibold">25%</span>
                  </div>
                  <Progress value={25} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm">Small/Mid Cap</span>
                    <span className="font-semibold">15%</span>
                  </div>
                  <Progress value={15} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm">Bonds</span>
                    <span className="font-semibold">15%</span>
                  </div>
                  <Progress value={15} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm">Alternatives</span>
                    <span className="font-semibold">5%</span>
                  </div>
                  <Progress value={5} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>AI-Generated Strategies</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 bg-green-50 rounded-lg border-l-4 border-green-500">
                  <h4 className="font-semibold text-green-800 mb-1">Growth Strategy</h4>
                  <p className="text-sm text-green-700">Focus on technology and healthcare sectors with 15-20% expected annual returns</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                  <h4 className="font-semibold text-blue-800 mb-1">Diversification</h4>
                  <p className="text-sm text-blue-700">Add emerging market exposure for enhanced returns with manageable risk</p>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg border-l-4 border-purple-500">
                  <h4 className="font-semibold text-purple-800 mb-1">Tax Efficiency</h4>
                  <p className="text-sm text-purple-700">Utilize tax-advantaged accounts and tax-loss harvesting strategies</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-purple-600" />
                Personalized AI Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-3">
                  <h4 className="font-semibold">Based on Your Profile</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="text-green-500">•</span>
                      Your moderate risk tolerance aligns well with balanced growth funds
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-500">•</span>
                      Long-term horizon allows for higher equity allocation
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-500">•</span>
                      Consider dollar-cost averaging for regular investments
                    </li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <h4 className="font-semibold">Market Opportunities</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="text-green-500">•</span>
                      AI and renewable energy sectors showing strong momentum
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-500">•</span>
                      International markets offering attractive valuations
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-orange-500">•</span>
                      Consider REIT exposure for inflation protection
                    </li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <h4 className="font-semibold">Risk Considerations</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="text-red-500">•</span>
                      Monitor inflation impact on fixed income
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-yellow-500">•</span>
                      Geopolitical tensions affecting emerging markets
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-500">•</span>
                      Tech sector concentration risk in major indices
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="portfolio" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Current vs Optimal</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">US Stocks</span>
                      <span className="text-sm">Current: 70% | Optimal: 55%</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Progress value={70} className="h-2 bg-red-100" />
                      <Progress value={55} className="h-2 bg-green-100" />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">International</span>
                      <span className="text-sm">Current: 15% | Optimal: 25%</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Progress value={15} className="h-2 bg-red-100" />
                      <Progress value={25} className="h-2 bg-green-100" />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Bonds</span>
                      <span className="text-sm">Current: 10% | Optimal: 15%</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Progress value={10} className="h-2 bg-red-100" />
                      <Progress value={15} className="h-2 bg-green-100" />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Alternatives</span>
                      <span className="text-sm">Current: 5% | Optimal: 5%</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Progress value={5} className="h-2 bg-green-100" />
                      <Progress value={5} className="h-2 bg-green-100" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Rebalancing Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 bg-red-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="w-4 h-4 text-red-600" />
                    <span className="font-semibold text-red-800">Sell: US Large Cap</span>
                  </div>
                  <p className="text-sm text-red-700">Reduce by 15% ($4,500) - Currently overweighted</p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                    <span className="font-semibold text-green-800">Buy: International Stocks</span>
                  </div>
                  <p className="text-sm text-green-700">Increase by 10% ($3,000) - Better diversification</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="w-4 h-4 text-blue-600" />
                    <span className="font-semibold text-blue-800">Buy: Bond Allocation</span>
                  </div>
                  <p className="text-sm text-blue-700">Add 5% ($1,500) - Risk management</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="market-trends" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Technology Sector</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">+24.3%</div>
                <div className="text-sm text-gray-600">YTD Performance</div>
                <Badge className="mt-2 bg-green-100 text-green-800">Strong Buy</Badge>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Healthcare</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">+12.1%</div>
                <div className="text-sm text-gray-600">YTD Performance</div>
                <Badge className="mt-2 bg-blue-100 text-blue-800">Buy</Badge>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Energy</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">-8.4%</div>
                <div className="text-sm text-gray-600">YTD Performance</div>
                <Badge className="mt-2 bg-red-100 text-red-800">Hold</Badge>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="risk-analysis" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Portfolio Risk Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm">Beta (Market Risk)</span>
                    <span className="font-semibold">1.12</span>
                  </div>
                  <Progress value={56} className="h-2" />
                  <p className="text-xs text-gray-600 mt-1">12% more volatile than market</p>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm">Sharpe Ratio</span>
                    <span className="font-semibold">1.34</span>
                  </div>
                  <Progress value={67} className="h-2" />
                  <p className="text-xs text-gray-600 mt-1">Good risk-adjusted returns</p>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm">Max Drawdown</span>
                    <span className="font-semibold">-18.2%</span>
                  </div>
                  <Progress value={82} className="h-2" />
                  <p className="text-xs text-gray-600 mt-1">Largest historical decline</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Risk Scenarios</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 bg-red-50 rounded-lg">
                  <h4 className="font-semibold text-red-800 mb-1">Bear Market (-20%)</h4>
                  <p className="text-sm text-red-700">Portfolio could decline to $72,000</p>
                </div>
                <div className="p-3 bg-yellow-50 rounded-lg">
                  <h4 className="font-semibold text-yellow-800 mb-1">Correction (-10%)</h4>
                  <p className="text-sm text-yellow-700">Portfolio could decline to $81,000</p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <h4 className="font-semibold text-green-800 mb-1">Bull Market (+25%)</h4>
                  <p className="text-sm text-green-700">Portfolio could grow to $112,500</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}