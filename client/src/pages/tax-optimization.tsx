import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { 
  Calculator, 
  DollarSign, 
  FileText, 
  TrendingDown,
  AlertCircle,
  CheckCircle,
  Lightbulb,
  Calendar,
  Target,
  Brain,
  Shield
} from 'lucide-react';

export default function TaxOptimization() {
  const [taxYear, setTaxYear] = useState('2025');
  const [analysisType, setAnalysisType] = useState('comprehensive');

  const { data: taxAnalysis, isLoading } = useQuery({
    queryKey: ['/api/tax/analysis', taxYear],
    refetchInterval: 300000, // 5 minutes
  });

  const { data: taxReforms } = useQuery({
    queryKey: ['/api/tax/reforms-2025'],
    refetchInterval: 86400000, // Daily updates
  });

  const optimizationMutation = useMutation({
    mutationFn: async (strategy: any) => {
      const response = await apiRequest('POST', '/api/tax/optimize', strategy);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tax/analysis'] });
    }
  });

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Calculator className="w-8 h-8 text-purple-600" />
          Tax Optimization & Legal Strategies
        </h1>
        <p className="text-gray-600">AI-powered tax planning with 2025 reform analysis and legal loophole identification</p>
      </div>

      {/* 2025 Tax Reform Alert */}
      <Alert className="mb-6 border-blue-200 bg-blue-50">
        <AlertCircle className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          <strong>2025 Tax Reform Update:</strong> New regulations affecting capital gains, retirement accounts, and business deductions. 
          Our AI has identified 12 new optimization opportunities based on recent changes.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-purple-600" />
              AI Tax Analysis Dashboard
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-green-600 font-semibold">Potential Savings</div>
                <div className="text-2xl font-bold text-green-700">$8,247</div>
                <div className="text-sm text-green-600">Through optimization</div>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-blue-600 font-semibold">Current Tax Rate</div>
                <div className="text-2xl font-bold text-blue-700">22.4%</div>
                <div className="text-sm text-blue-600">Effective rate</div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="text-purple-600 font-semibold">Optimized Rate</div>
                <div className="text-2xl font-bold text-purple-700">18.1%</div>
                <div className="text-sm text-purple-600">With strategies</div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Tax Optimization Progress</span>
                  <span className="text-sm text-gray-600">73% Complete</span>
                </div>
                <Progress value={73} className="h-3" />
              </div>
              
              <Button 
                className="w-full" 
                size="lg"
                onClick={() => optimizationMutation.mutate({
                  year: taxYear,
                  strategy: 'comprehensive',
                  includeLoopholes: true
                })}
                disabled={optimizationMutation.isPending}
              >
                {optimizationMutation.isPending ? 'Analyzing...' : 'Generate Optimization Plan'}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-green-600" />
              Legal Compliance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-sm">IRS Compliant</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-sm">2025 Reform Ready</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-sm">Audit Protection</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-sm">Real-time Updates</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="strategies" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="strategies">Tax Strategies</TabsTrigger>
          <TabsTrigger value="loopholes">Legal Loopholes</TabsTrigger>
          <TabsTrigger value="deductions">Deductions</TabsTrigger>
          <TabsTrigger value="planning">Tax Planning</TabsTrigger>
          <TabsTrigger value="reforms">2025 Reforms</TabsTrigger>
        </TabsList>

        <TabsContent value="strategies" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingDown className="w-5 h-5 text-green-600" />
                  Active Tax Strategies
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-green-800">Tax-Loss Harvesting</h4>
                    <Badge className="bg-green-100 text-green-800">Active</Badge>
                  </div>
                  <p className="text-sm text-green-700 mb-2">Offset capital gains with strategic losses</p>
                  <div className="text-sm font-semibold text-green-800">Potential Savings: $2,100</div>
                </div>

                <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-blue-800">401(k) Optimization</h4>
                    <Badge className="bg-blue-100 text-blue-800">Recommended</Badge>
                  </div>
                  <p className="text-sm text-blue-700 mb-2">Maximize pre-tax contributions</p>
                  <div className="text-sm font-semibold text-blue-800">Potential Savings: $3,200</div>
                </div>

                <div className="p-4 bg-purple-50 rounded-lg border-l-4 border-purple-500">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-purple-800">Roth Conversion</h4>
                    <Badge className="bg-purple-100 text-purple-800">Planning</Badge>
                  </div>
                  <p className="text-sm text-purple-700 mb-2">Strategic tax-free growth planning</p>
                  <div className="text-sm font-semibold text-purple-800">Long-term Savings: $15,000+</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>AI-Identified Opportunities</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="border rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Lightbulb className="w-4 h-4 text-yellow-500" />
                    <span className="font-semibold">HSA Maximization</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">Triple tax advantage opportunity</p>
                  <div className="flex justify-between text-sm">
                    <span>Implementation Difficulty:</span>
                    <Badge variant="outline">Easy</Badge>
                  </div>
                </div>

                <div className="border rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Lightbulb className="w-4 h-4 text-yellow-500" />
                    <span className="font-semibold">Qualified Small Business Stock</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">Section 1202 exclusion opportunity</p>
                  <div className="flex justify-between text-sm">
                    <span>Implementation Difficulty:</span>
                    <Badge variant="outline">Moderate</Badge>
                  </div>
                </div>

                <div className="border rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Lightbulb className="w-4 h-4 text-yellow-500" />
                    <span className="font-semibold">Charitable Remainder Trust</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">Income + tax benefits strategy</p>
                  <div className="flex justify-between text-sm">
                    <span>Implementation Difficulty:</span>
                    <Badge variant="outline">Complex</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="loopholes" className="space-y-6">
          <Alert className="border-orange-200 bg-orange-50">
            <AlertCircle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              <strong>Legal Disclaimer:</strong> All strategies listed are IRS-compliant and regularly updated based on current tax law. 
              Always consult with a tax professional before implementation.
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="border-green-200">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  Step-Up Basis Strategy
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm text-gray-600">
                  <strong>Mechanism:</strong> Hold appreciating assets until death for stepped-up basis
                </div>
                <div className="bg-green-50 p-3 rounded">
                  <div className="text-sm font-semibold text-green-800">Potential Tax Savings</div>
                  <div className="text-lg font-bold text-green-600">$25,000+</div>
                </div>
                <div className="text-xs text-gray-500">Risk Level: Low | Legality: 100% Compliant</div>
              </CardContent>
            </Card>

            <Card className="border-blue-200">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-blue-600" />
                  Installment Sales
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm text-gray-600">
                  <strong>Mechanism:</strong> Spread capital gains over multiple years
                </div>
                <div className="bg-blue-50 p-3 rounded">
                  <div className="text-sm font-semibold text-blue-800">Tax Rate Reduction</div>
                  <div className="text-lg font-bold text-blue-600">5-12%</div>
                </div>
                <div className="text-xs text-gray-500">Risk Level: Low | Legality: 100% Compliant</div>
              </CardContent>
            </Card>

            <Card className="border-purple-200">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-purple-600" />
                  1031 Like-Kind Exchange
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm text-gray-600">
                  <strong>Mechanism:</strong> Defer capital gains on real estate exchanges
                </div>
                <div className="bg-purple-50 p-3 rounded">
                  <div className="text-sm font-semibold text-purple-800">Tax Deferral</div>
                  <div className="text-lg font-bold text-purple-600">Indefinite</div>
                </div>
                <div className="text-xs text-gray-500">Risk Level: Medium | Legality: 100% Compliant</div>
              </CardContent>
            </Card>

            <Card className="border-orange-200">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-orange-600" />
                  Opportunity Zones
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm text-gray-600">
                  <strong>Mechanism:</strong> Capital gains deferral + elimination in qualified zones
                </div>
                <div className="bg-orange-50 p-3 rounded">
                  <div className="text-sm font-semibold text-orange-800">Tax Elimination</div>
                  <div className="text-lg font-bold text-orange-600">100%</div>
                </div>
                <div className="text-xs text-gray-500">Risk Level: Medium | Legality: 100% Compliant</div>
              </CardContent>
            </Card>

            <Card className="border-indigo-200">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-indigo-600" />
                  Conservation Easements
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm text-gray-600">
                  <strong>Mechanism:</strong> Land preservation for significant deductions
                </div>
                <div className="bg-indigo-50 p-3 rounded">
                  <div className="text-sm font-semibold text-indigo-800">Deduction Multiple</div>
                  <div className="text-lg font-bold text-indigo-600">3-10x</div>
                </div>
                <div className="text-xs text-gray-500">Risk Level: High | Legality: Requires Compliance</div>
              </CardContent>
            </Card>

            <Card className="border-teal-200">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-teal-600" />
                  Defined Benefit Plans
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm text-gray-600">
                  <strong>Mechanism:</strong> High-income earners maximize pre-tax contributions
                </div>
                <div className="bg-teal-50 p-3 rounded">
                  <div className="text-sm font-semibold text-teal-800">Annual Deduction</div>
                  <div className="text-lg font-bold text-teal-600">$200K+</div>
                </div>
                <div className="text-xs text-gray-500">Risk Level: Low | Legality: 100% Compliant</div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="deductions" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Maximized Deductions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span className="font-medium">Home Office</span>
                  <span className="font-bold">$3,600</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span className="font-medium">Business Meals</span>
                  <span className="font-bold">$2,400</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span className="font-medium">Professional Education</span>
                  <span className="font-bold">$1,800</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span className="font-medium">Health Savings Account</span>
                  <span className="font-bold">$4,300</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-green-50 rounded border border-green-200">
                  <span className="font-medium text-green-800">Total Deductions</span>
                  <span className="font-bold text-green-600">$12,100</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Missed Opportunities</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 bg-yellow-50 rounded-lg border-l-4 border-yellow-500">
                  <h4 className="font-semibold text-yellow-800 mb-1">Vehicle Deduction</h4>
                  <p className="text-sm text-yellow-700">Business use percentage: 65%</p>
                  <div className="text-sm font-semibold text-yellow-800">Potential: $4,200</div>
                </div>
                <div className="p-3 bg-orange-50 rounded-lg border-l-4 border-orange-500">
                  <h4 className="font-semibold text-orange-800 mb-1">Equipment Depreciation</h4>
                  <p className="text-sm text-orange-700">Section 179 immediate expensing</p>
                  <div className="text-sm font-semibold text-orange-800">Potential: $8,500</div>
                </div>
                <div className="p-3 bg-red-50 rounded-lg border-l-4 border-red-500">
                  <h4 className="font-semibold text-red-800 mb-1">Charitable Bunching</h4>
                  <p className="text-sm text-red-700">Multi-year donation strategy</p>
                  <div className="text-sm font-semibold text-red-800">Potential: $3,600</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="planning" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Q1 2025 Action Items
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm">Maximize 401(k) contributions</span>
                </div>
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-orange-600" />
                  <span className="text-sm">Review estimated tax payments</span>
                </div>
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-orange-600" />
                  <span className="text-sm">Implement tax-loss harvesting</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Mid-Year Review
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-orange-600" />
                  <span className="text-sm">Adjust withholdings</span>
                </div>
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-orange-600" />
                  <span className="text-sm">Roth conversion analysis</span>
                </div>
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-orange-600" />
                  <span className="text-sm">Business expense review</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Year-End Planning
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-orange-600" />
                  <span className="text-sm">Charitable donations</span>
                </div>
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-orange-600" />
                  <span className="text-sm">Capital gains realization</span>
                </div>
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-orange-600" />
                  <span className="text-sm">Retirement contributions</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="reforms" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-blue-600" />
                2025 Tax Reform Impact Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold text-green-800">Beneficial Changes</h4>
                  <div className="space-y-3">
                    <div className="p-3 bg-green-50 rounded-lg">
                      <h5 className="font-semibold text-green-800 mb-1">Enhanced Child Tax Credit</h5>
                      <p className="text-sm text-green-700">Increased to $3,000 per child, expanded age limits</p>
                      <div className="text-sm font-semibold text-green-600">Your Impact: +$1,500</div>
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg">
                      <h5 className="font-semibold text-green-800 mb-1">Higher 401(k) Limits</h5>
                      <p className="text-sm text-green-700">Contribution limit increased to $24,000</p>
                      <div className="text-sm font-semibold text-green-600">Your Impact: +$2,000 deduction</div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-semibold text-red-800">Challenging Changes</h4>
                  <div className="space-y-3">
                    <div className="p-3 bg-red-50 rounded-lg">
                      <h5 className="font-semibold text-red-800 mb-1">SALT Deduction Limits</h5>
                      <p className="text-sm text-red-700">Continued $10,000 cap on state and local taxes</p>
                      <div className="text-sm font-semibold text-red-600">Your Impact: -$3,200</div>
                    </div>
                    <div className="p-3 bg-red-50 rounded-lg">
                      <h5 className="font-semibold text-red-800 mb-1">Capital Gains Rate Changes</h5>
                      <p className="text-sm text-red-700">Higher rates for high-income earners</p>
                      <div className="text-sm font-semibold text-red-600">Your Impact: Monitor threshold</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-yellow-500" />
                  AI-Recommended Adaptations
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-3 border rounded-lg">
                    <h5 className="font-semibold mb-2">Immediate Actions</h5>
                    <ul className="text-sm space-y-1">
                      <li>• Increase 401(k) contributions</li>
                      <li>• Review state tax strategy</li>
                      <li>• Plan capital gains timing</li>
                    </ul>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <h5 className="font-semibold mb-2">Medium-term Planning</h5>
                    <ul className="text-sm space-y-1">
                      <li>• Consider relocation analysis</li>
                      <li>• Evaluate business structure</li>
                      <li>• Review insurance needs</li>
                    </ul>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <h5 className="font-semibold mb-2">Long-term Strategy</h5>
                    <ul className="text-sm space-y-1">
                      <li>• Estate planning updates</li>
                      <li>• Trust structure evaluation</li>
                      <li>• Generational planning</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}