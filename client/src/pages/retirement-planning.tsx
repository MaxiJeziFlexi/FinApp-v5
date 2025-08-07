import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { 
  PiggyBank, 
  TrendingUp, 
  Calculator, 
  Calendar,
  DollarSign,
  Shield,
  Brain,
  Target,
  Heart,
  Home,
  Plane,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

export default function RetirementPlanning() {
  const [currentAge, setCurrentAge] = useState('35');
  const [retirementAge, setRetirementAge] = useState('65');
  const [currentSavings, setCurrentSavings] = useState('125000');
  const [monthlyContribution, setMonthlyContribution] = useState('1500');
  const [desiredIncome, setDesiredIncome] = useState('80000');

  const { data: retirementAnalysis, isLoading } = useQuery({
    queryKey: ['/api/retirement/analysis', currentAge, retirementAge, currentSavings],
    refetchInterval: 300000,
  });

  const { data: socialSecurityProjection } = useQuery({
    queryKey: ['/api/retirement/social-security'],
    refetchInterval: 86400000, // Daily
  });

  const planningMutation = useMutation({
    mutationFn: async (planData: any) => {
      const response = await apiRequest('/api/retirement/create-plan', {
        method: 'POST',
        body: JSON.stringify(planData)
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/retirement/analysis'] });
    }
  });

  const calculateProjectedValue = () => {
    const years = parseInt(retirementAge) - parseInt(currentAge);
    const current = parseFloat(currentSavings);
    const monthly = parseFloat(monthlyContribution);
    const rate = 0.07; // 7% annual return
    
    const futureValue = current * Math.pow(1 + rate, years) + 
                       (monthly * 12) * (Math.pow(1 + rate, years) - 1) / rate;
    
    return futureValue;
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <PiggyBank className="w-8 h-8 text-blue-600" />
          Safe Retirement Planning
        </h1>
        <p className="text-gray-600">AI-powered retirement strategies that adapt to changing regulations and market conditions</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="w-5 h-5" />
              Retirement Calculator
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="current-age">Current Age</Label>
                <Input
                  id="current-age"
                  type="number"
                  value={currentAge}
                  onChange={(e) => setCurrentAge(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="retirement-age">Retirement Age</Label>
                <Input
                  id="retirement-age"
                  type="number"
                  value={retirementAge}
                  onChange={(e) => setRetirementAge(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="current-savings">Current Savings</Label>
                <Input
                  id="current-savings"
                  type="number"
                  value={currentSavings}
                  onChange={(e) => setCurrentSavings(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="monthly-contribution">Monthly Contribution</Label>
                <Input
                  id="monthly-contribution"
                  type="number"
                  value={monthlyContribution}
                  onChange={(e) => setMonthlyContribution(e.target.value)}
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="desired-income">Desired Annual Income</Label>
                <Input
                  id="desired-income"
                  type="number"
                  value={desiredIncome}
                  onChange={(e) => setDesiredIncome(e.target.value)}
                />
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-blue-800 font-semibold mb-2">Projected Retirement Value</div>
              <div className="text-3xl font-bold text-blue-600">
                ${calculateProjectedValue().toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </div>
              <div className="text-sm text-blue-700 mt-1">
                In {parseInt(retirementAge) - parseInt(currentAge)} years (assuming 7% annual return)
              </div>
            </div>

            <Button 
              className="w-full" 
              size="lg"
              onClick={() => planningMutation.mutate({
                currentAge: parseInt(currentAge),
                retirementAge: parseInt(retirementAge),
                currentSavings: parseFloat(currentSavings),
                monthlyContribution: parseFloat(monthlyContribution),
                desiredIncome: parseFloat(desiredIncome)
              })}
              disabled={planningMutation.isPending}
            >
              {planningMutation.isPending ? 'Creating Plan...' : 'Generate AI Retirement Plan'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-green-600" />
              Retirement Health
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">85%</div>
              <div className="text-sm text-gray-600">On Track</div>
              <Progress value={85} className="mt-2" />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm">401(k) Maximized</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm">IRA Contributions</span>
              </div>
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-orange-600" />
                <span className="text-sm">Healthcare Planning</span>
              </div>
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-orange-600" />
                <span className="text-sm">Estate Planning</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="strategy" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="strategy">401(k) Strategy</TabsTrigger>
          <TabsTrigger value="social-security">Social Security</TabsTrigger>
          <TabsTrigger value="healthcare">Healthcare Costs</TabsTrigger>
          <TabsTrigger value="income">Income Planning</TabsTrigger>
          <TabsTrigger value="estate">Estate Planning</TabsTrigger>
        </TabsList>

        <TabsContent value="strategy" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  401(k) Optimization
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <div className="text-blue-600 text-sm font-semibold">Current Balance</div>
                    <div className="text-xl font-bold text-blue-700">$125,000</div>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg">
                    <div className="text-green-600 text-sm font-semibold">Annual Contribution</div>
                    <div className="text-xl font-bold text-green-700">$18,000</div>
                  </div>
                  <div className="bg-purple-50 p-3 rounded-lg">
                    <div className="text-purple-600 text-sm font-semibold">Employer Match</div>
                    <div className="text-xl font-bold text-purple-700">$4,500</div>
                  </div>
                  <div className="bg-orange-50 p-3 rounded-lg">
                    <div className="text-orange-600 text-sm font-semibold">Tax Savings</div>
                    <div className="text-xl font-bold text-orange-700">$4,320</div>
                  </div>
                </div>

                <Alert>
                  <Brain className="h-4 w-4" />
                  <AlertDescription>
                    <strong>AI Recommendation:</strong> Increase contribution by $4,000 to capture full employer match and reduce tax liability by an additional $960.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>IRA Strategy</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg">
                  <h4 className="font-semibold mb-2">Roth vs Traditional IRA</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Current Tax Bracket</span>
                      <Badge>24%</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Retirement Tax Bracket</span>
                      <Badge variant="outline">22%</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Recommended Split</span>
                      <Badge className="bg-green-600">70% Traditional, 30% Roth</Badge>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="p-3 bg-green-50 rounded-lg border-l-4 border-green-500">
                    <h5 className="font-semibold text-green-800 mb-1">Traditional IRA Benefits</h5>
                    <p className="text-sm text-green-700">Immediate tax deduction, lower current tax burden</p>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                    <h5 className="font-semibold text-blue-800 mb-1">Roth IRA Benefits</h5>
                    <p className="text-sm text-blue-700">Tax-free growth, no required distributions</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Contribution Timeline & Limits</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <h4 className="font-semibold">2025 Contribution Limits</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">401(k)</span>
                      <span className="font-semibold">$24,000</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">IRA</span>
                      <span className="font-semibold">$7,000</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Catch-up (50+)</span>
                      <span className="font-semibold">+$7,500</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h4 className="font-semibold">Your Progress</h4>
                  <div className="space-y-2">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">401(k) Progress</span>
                        <span className="text-sm">75%</span>
                      </div>
                      <Progress value={75} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">IRA Progress</span>
                        <span className="text-sm">100%</span>
                      </div>
                      <Progress value={100} className="h-2" />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h4 className="font-semibold">Optimization Actions</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span>Max employer match</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-orange-600" />
                      <span>Increase 401(k) by $6,000</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span>IRA fully funded</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="social-security" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-green-600" />
                  Social Security Projection
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-green-50 p-3 rounded-lg">
                    <div className="text-green-600 text-sm font-semibold">At Age 62 (Early)</div>
                    <div className="text-xl font-bold text-green-700">$1,890/mo</div>
                    <div className="text-xs text-green-600">75% of full benefit</div>
                  </div>
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <div className="text-blue-600 text-sm font-semibold">At Age 67 (Full)</div>
                    <div className="text-xl font-bold text-blue-700">$2,520/mo</div>
                    <div className="text-xs text-blue-600">100% of full benefit</div>
                  </div>
                  <div className="bg-purple-50 p-3 rounded-lg">
                    <div className="text-purple-600 text-sm font-semibold">At Age 70 (Delayed)</div>
                    <div className="text-xl font-bold text-purple-700">$3,330/mo</div>
                    <div className="text-xs text-purple-600">132% of full benefit</div>
                  </div>
                  <div className="bg-orange-50 p-3 rounded-lg">
                    <div className="text-orange-600 text-sm font-semibold">Lifetime Value</div>
                    <div className="text-xl font-bold text-orange-700">$950K</div>
                    <div className="text-xs text-orange-600">If claiming at 67</div>
                  </div>
                </div>

                <Alert>
                  <Brain className="h-4 w-4" />
                  <AlertDescription>
                    <strong>AI Analysis:</strong> Delaying until age 70 maximizes lifetime benefits if you live beyond age 82. Your health profile suggests this strategy.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Maximization Strategies</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-1">Work Longer Strategy</h4>
                  <p className="text-sm text-blue-700">Continue working part-time after 67 to increase benefit calculation</p>
                  <div className="text-sm font-semibold text-blue-600 mt-1">Additional: $180/month</div>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <h4 className="font-semibold text-green-800 mb-1">Spousal Benefits</h4>
                  <p className="text-sm text-green-700">Coordinate claiming strategy with spouse for maximum household benefit</p>
                  <div className="text-sm font-semibold text-green-600 mt-1">Combined: $4,200/month</div>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg">
                  <h4 className="font-semibold text-purple-800 mb-1">Tax Planning</h4>
                  <p className="text-sm text-purple-700">Manage retirement withdrawals to minimize SS taxation</p>
                  <div className="text-sm font-semibold text-purple-600 mt-1">Tax Savings: $3,600/year</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="healthcare" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="w-5 h-5 text-red-600" />
                  Healthcare Cost Planning
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-red-50 p-4 rounded-lg border-l-4 border-red-500">
                  <h4 className="font-semibold text-red-800 mb-2">Projected Healthcare Costs</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="text-red-600 text-sm">Age 65-75</div>
                      <div className="font-bold text-red-700">$8,400/year</div>
                    </div>
                    <div>
                      <div className="text-red-600 text-sm">Age 75-85</div>
                      <div className="font-bold text-red-700">$12,600/year</div>
                    </div>
                    <div>
                      <div className="text-red-600 text-sm">Age 85+</div>
                      <div className="font-bold text-red-700">$18,900/year</div>
                    </div>
                    <div>
                      <div className="text-red-600 text-sm">Total Lifetime</div>
                      <div className="font-bold text-red-700">$315,000</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold">Coverage Options</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center p-2 border rounded">
                      <span className="text-sm">Medicare Part A</span>
                      <Badge className="bg-green-100 text-green-800">Included</Badge>
                    </div>
                    <div className="flex justify-between items-center p-2 border rounded">
                      <span className="text-sm">Medicare Part B</span>
                      <Badge>$164.90/month</Badge>
                    </div>
                    <div className="flex justify-between items-center p-2 border rounded">
                      <span className="text-sm">Medigap Insurance</span>
                      <Badge variant="outline">$125-200/month</Badge>
                    </div>
                    <div className="flex justify-between items-center p-2 border rounded">
                      <span className="text-sm">Long-term Care</span>
                      <Badge variant="secondary">$3,500/month</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Health Savings Strategy</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-green-50 rounded-lg">
                  <h4 className="font-semibold text-green-800 mb-2">HSA Triple Tax Advantage</h4>
                  <ul className="text-sm text-green-700 space-y-1">
                    <li>• Tax-deductible contributions</li>
                    <li>• Tax-free growth and earnings</li>
                    <li>• Tax-free withdrawals for medical expenses</li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Current HSA Balance</span>
                    <span className="font-semibold">$15,400</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Annual Contribution</span>
                    <span className="font-semibold">$4,300</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Projected at 65</span>
                    <span className="font-semibold text-green-600">$185,000</span>
                  </div>
                </div>

                <Alert>
                  <Brain className="h-4 w-4" />
                  <AlertDescription>
                    <strong>AI Recommendation:</strong> Max out HSA contributions and invest the funds. HSA becomes a supplemental retirement account after age 65.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Long-term Care Planning</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <h4 className="font-semibold">Care Options</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Home care (daily)</span>
                      <span className="font-semibold">$61/day</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Adult day care</span>
                      <span className="font-semibold">$78/day</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Assisted living</span>
                      <span className="font-semibold">$4,500/month</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Nursing home</span>
                      <span className="font-semibold">$9,200/month</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h4 className="font-semibold">Insurance Options</h4>
                  <div className="space-y-2 text-sm">
                    <div className="p-2 border rounded">
                      <div className="font-semibold">Traditional LTC Insurance</div>
                      <div className="text-gray-600">$2,400-4,800/year</div>
                    </div>
                    <div className="p-2 border rounded">
                      <div className="font-semibold">Hybrid Life/LTC</div>
                      <div className="text-gray-600">Combines life insurance</div>
                    </div>
                    <div className="p-2 border rounded">
                      <div className="font-semibold">Self-Insurance</div>
                      <div className="text-gray-600">Dedicated savings account</div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h4 className="font-semibold">Risk Assessment</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span>High need probability: 70%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                      <span>Average duration: 3.7 years</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span>Women higher risk</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="income" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-green-600" />
                  Income Replacement Strategy
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <div className="text-blue-600 text-sm font-semibold">Current Income</div>
                    <div className="text-xl font-bold text-blue-700">$120,000</div>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg">
                    <div className="text-green-600 text-sm font-semibold">Target (80%)</div>
                    <div className="text-xl font-bold text-green-700">$96,000</div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold">Income Sources</h4>
                  <div className="space-y-2">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">Social Security</span>
                        <span className="text-sm">$30,240 (32%)</span>
                      </div>
                      <Progress value={32} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">401(k)/IRA</span>
                        <span className="text-sm">$48,000 (50%)</span>
                      </div>
                      <Progress value={50} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">Other Savings</span>
                        <span className="text-sm">$17,760 (18%)</span>
                      </div>
                      <Progress value={18} className="h-2" />
                    </div>
                  </div>
                </div>

                <Alert>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    <strong>Status:</strong> On track to replace 100% of desired retirement income with current savings plan.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Withdrawal Strategy</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-purple-50 rounded-lg">
                  <h4 className="font-semibold text-purple-800 mb-2">4% Rule Analysis</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Portfolio Value at 65</span>
                      <span className="font-semibold">$1,200,000</span>
                    </div>
                    <div className="flex justify-between">
                      <span>4% Annual Withdrawal</span>
                      <span className="font-semibold">$48,000</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Success Probability</span>
                      <span className="font-semibold text-green-600">92%</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold">Tax-Efficient Withdrawal Order</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 p-2 border rounded">
                      <span className="text-sm font-semibold">1.</span>
                      <span className="text-sm">Taxable accounts first</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 border rounded">
                      <span className="text-sm font-semibold">2.</span>
                      <span className="text-sm">Traditional 401(k)/IRA</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 border rounded">
                      <span className="text-sm font-semibold">3.</span>
                      <span className="text-sm">Roth IRA last</span>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-yellow-50 rounded-lg">
                  <h5 className="font-semibold text-yellow-800 mb-1">Dynamic Withdrawal</h5>
                  <p className="text-sm text-yellow-700">Adjust withdrawal rate based on market performance and portfolio value</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="estate" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Home className="w-5 h-5 text-purple-600" />
                  Estate Planning Essentials
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded">
                    <span className="font-medium">Will</span>
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded">
                    <span className="font-medium">Durable Power of Attorney</span>
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded">
                    <span className="font-medium">Healthcare Directive</span>
                    <AlertCircle className="w-5 h-5 text-orange-600" />
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded">
                    <span className="font-medium">Beneficiary Designations</span>
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded">
                    <span className="font-medium">Trust Planning</span>
                    <AlertCircle className="w-5 h-5 text-orange-600" />
                  </div>
                </div>

                <Alert>
                  <AlertCircle className="h-4 w-4 text-orange-600" />
                  <AlertDescription className="text-orange-800">
                    <strong>Action Required:</strong> Update healthcare directive and consider trust planning for tax efficiency.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tax-Efficient Legacy Planning</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-2">Estate Tax Exemption</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>2025 Federal Exemption</span>
                      <span className="font-semibold">$13.99M</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Your Estate Value</span>
                      <span className="font-semibold">$2.4M</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Federal Tax Liability</span>
                      <span className="font-semibold text-green-600">$0</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold">Advanced Strategies</h4>
                  <div className="space-y-2">
                    <div className="p-3 bg-green-50 rounded-lg">
                      <h5 className="font-semibold text-green-800 mb-1">Roth Conversion Strategy</h5>
                      <p className="text-sm text-green-700">Convert traditional IRA to Roth for tax-free inheritance</p>
                    </div>
                    <div className="p-3 bg-purple-50 rounded-lg">
                      <h5 className="font-semibold text-purple-800 mb-1">Charitable Remainder Trust</h5>
                      <p className="text-sm text-purple-700">Income stream + charitable deduction + legacy planning</p>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <h5 className="font-semibold text-blue-800 mb-1">Life Insurance Trust</h5>
                      <p className="text-sm text-blue-700">Estate tax-free death benefit for heirs</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Beneficiary & Inheritance Planning</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <h4 className="font-semibold">Primary Beneficiaries</h4>
                  <div className="space-y-2">
                    <div className="p-3 border rounded-lg">
                      <div className="font-semibold">Spouse</div>
                      <div className="text-sm text-gray-600">60% of assets</div>
                      <div className="text-xs text-green-600">Unlimited marital deduction</div>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <div className="font-semibold">Children</div>
                      <div className="text-sm text-gray-600">40% of assets (split equally)</div>
                      <div className="text-xs text-blue-600">Trust until age 25</div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h4 className="font-semibold">Account Types</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>401(k)</span>
                      <span className="font-semibold">$845,000</span>
                    </div>
                    <div className="flex justify-between">
                      <span>IRA/Roth IRA</span>
                      <span className="font-semibold">$275,000</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Taxable Accounts</span>
                      <span className="font-semibold">$180,000</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Life Insurance</span>
                      <span className="font-semibold">$500,000</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Real Estate</span>
                      <span className="font-semibold">$650,000</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h4 className="font-semibold">Required Actions</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm">Review annually</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-orange-600" />
                      <span className="text-sm">Update after major life events</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-orange-600" />
                      <span className="text-sm">Consider minor children trusts</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm">Coordinate with attorney</span>
                    </div>
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