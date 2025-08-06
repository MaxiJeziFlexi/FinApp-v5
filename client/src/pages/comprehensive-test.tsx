import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { 
  Loader2, 
  CheckCircle, 
  XCircle, 
  Globe, 
  Scale, 
  CreditCard, 
  BarChart3, 
  Users,
  Star
} from "lucide-react";

interface TestResult {
  service: string;
  status: 'success' | 'error' | 'pending';
  message: string;
  data?: any;
  duration?: number;
}

export default function ComprehensiveTest() {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [legalJurisdiction, setLegalJurisdiction] = useState('US');
  const [testQuery, setTestQuery] = useState('What are the current SEC regulations for cryptocurrency trading?');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Test user ID for demo
  const [testUserId] = useState(() => `test-user-${Math.random().toString(36).substr(2, 9)}`);

  const addTestResult = (result: TestResult) => {
    setTestResults(prev => [...prev, { ...result, timestamp: Date.now() }]);
  };

  const updateTestResult = (service: string, updates: Partial<TestResult>) => {
    setTestResults(prev => prev.map(result => 
      result.service === service ? { ...result, ...updates } : result
    ));
  };

  // Run comprehensive system tests
  const runComprehensiveTests = async () => {
    setIsRunningTests(true);
    setTestResults([]);

    const tests = [
      // Health Check
      {
        name: 'System Health',
        test: async () => {
          const response = await apiRequest("GET", "/health");
          return response;
        }
      },
      // Translation Service
      {
        name: 'Translation Service',
        test: async () => {
          const response = await apiRequest("POST", "/api/translate", {
            text: "Welcome to our financial education platform",
            fromLanguage: "en",
            toLanguage: "de",
            context: "financial education"
          });
          return response;
        }
      },
      // Legal AI Service
      {
        name: 'Legal AI Service',
        test: async () => {
          const response = await apiRequest("POST", "/api/legal/query", {
            question: "What are basic investment regulations?",
            jurisdiction: "US",
            category: "investment",
            language: "en"
          });
          return response;
        }
      },
      // Subscription Plans
      {
        name: 'Subscription Plans',
        test: async () => {
          const response = await apiRequest("GET", "/api/subscription/plans");
          return response;
        }
      },
      // User Analytics
      {
        name: 'Analytics System',
        test: async () => {
          const response = await apiRequest("GET", `/api/analytics/user-behavior/${testUserId}`);
          return response;
        }
      },
      // OpenAI Integration
      {
        name: 'OpenAI Service',
        test: async () => {
          const response = await apiRequest("POST", "/api/chat/completions", {
            messages: [
              { role: "user", content: "What is compound interest?" }
            ],
            temperature: 0.7
          });
          return response;
        }
      }
    ];

    for (const testCase of tests) {
      addTestResult({
        service: testCase.name,
        status: 'pending',
        message: 'Running test...'
      });

      try {
        const startTime = Date.now();
        const result = await testCase.test();
        const duration = Date.now() - startTime;

        updateTestResult(testCase.name, {
          status: 'success',
          message: 'Test passed successfully',
          data: result,
          duration
        });
      } catch (error: any) {
        updateTestResult(testCase.name, {
          status: 'error',
          message: error.message || 'Test failed',
          data: error
        });
      }
    }

    setIsRunningTests(false);
  };

  // Individual service test functions
  const testTranslation = async () => {
    try {
      const startTime = Date.now();
      const response = await apiRequest("POST", "/api/translate", {
        text: "Investment portfolio diversification is crucial for risk management",
        fromLanguage: "en",
        toLanguage: selectedLanguage,
        context: "financial education"
      });
      const duration = Date.now() - startTime;

      toast({
        title: "Translation Success",
        description: `Translated in ${duration}ms`,
      });

      return response;
    } catch (error: any) {
      toast({
        title: "Translation Failed",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const testLegalAI = async () => {
    try {
      const startTime = Date.now();
      const response = await apiRequest("POST", "/api/legal/query", {
        question: testQuery,
        jurisdiction: legalJurisdiction,
        category: "financial",
        language: selectedLanguage
      });
      const duration = Date.now() - startTime;

      toast({
        title: "Legal AI Success",
        description: `Query processed in ${duration}ms`,
      });

      return response;
    } catch (error: any) {
      toast({
        title: "Legal AI Failed",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  // Fetch supported languages and jurisdictions
  const { data: supportedLanguages = {} } = useQuery({
    queryKey: ["/api/translate/languages"],
    queryFn: () => apiRequest("GET", "/api/translate/languages"),
  });

  const { data: supportedJurisdictions = [] } = useQuery({
    queryKey: ["/api/legal/jurisdictions"],
    queryFn: () => apiRequest("GET", "/api/legal/jurisdictions"),
  });

  const { data: subscriptionPlans = [] } = useQuery({
    queryKey: ["/api/subscription/plans"],
    queryFn: () => apiRequest("GET", "/api/subscription/plans"),
  });

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'pending':
        return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />;
    }
  };

  const getStatusBadge = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <Badge className="bg-green-100 text-green-800">Success</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      case 'pending':
        return <Badge className="bg-blue-100 text-blue-800">Running</Badge>;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Comprehensive System Test</h1>
          <p className="text-muted-foreground">Test all premium features and AI services</p>
        </div>
        <Button 
          onClick={runComprehensiveTests}
          disabled={isRunningTests}
          size="lg"
        >
          {isRunningTests ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <BarChart3 className="w-4 h-4 mr-2" />
          )}
          Run All Tests
        </Button>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="translation">Translation</TabsTrigger>
          <TabsTrigger value="legal">Legal AI</TabsTrigger>
          <TabsTrigger value="subscription">Plans</TabsTrigger>
          <TabsTrigger value="results">Test Results</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Translation Service</CardTitle>
                <Globe className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{Object.keys(supportedLanguages).length}</div>
                <p className="text-xs text-muted-foreground">Supported Languages</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Legal AI</CardTitle>
                <Scale className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{supportedJurisdictions.length}</div>
                <p className="text-xs text-muted-foreground">Legal Jurisdictions</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Subscription Plans</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{subscriptionPlans.length}</div>
                <p className="text-xs text-muted-foreground">Available Plans</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Test Results</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{testResults.length}</div>
                <p className="text-xs text-muted-foreground">Tests Executed</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>System Status</CardTitle>
              <CardDescription>Current status of all premium services</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {testResults.slice(0, 6).map((result) => (
                  <div key={result.service} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(result.status)}
                      <div>
                        <p className="font-medium">{result.service}</p>
                        <p className="text-sm text-muted-foreground">{result.message}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {result.duration && (
                        <span className="text-xs text-muted-foreground">{result.duration}ms</span>
                      )}
                      {getStatusBadge(result.status)}
                    </div>
                  </div>
                ))}
                {testResults.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    No tests run yet. Click "Run All Tests" to start comprehensive testing.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="translation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Translation Service Test</CardTitle>
              <CardDescription>Test multilingual AI translation capabilities</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="target-language">Target Language</Label>
                  <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(supportedLanguages).map(([code, name]) => (
                        <SelectItem key={code} value={code}>{name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="test-text">Test Text</Label>
                  <Input
                    value="Investment portfolio diversification is crucial"
                    disabled
                    className="text-sm"
                  />
                </div>
              </div>
              <Button onClick={testTranslation} className="w-full">
                <Globe className="w-4 h-4 mr-2" />
                Test Translation
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Supported Languages</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {Object.entries(supportedLanguages).map(([code, name]) => (
                  <div key={code} className="flex items-center space-x-2 p-2 border rounded">
                    <Badge variant="outline">{code.toUpperCase()}</Badge>
                    <span className="text-sm">{name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="legal" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Legal AI Service Test</CardTitle>
              <CardDescription>Test legal AI with government-sourced knowledge</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="jurisdiction">Jurisdiction</Label>
                  <Select value={legalJurisdiction} onValueChange={setLegalJurisdiction}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select jurisdiction" />
                    </SelectTrigger>
                    <SelectContent>
                      {supportedJurisdictions.map((jurisdiction) => (
                        <SelectItem key={jurisdiction} value={jurisdiction}>{jurisdiction}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="legal-query">Legal Query</Label>
                  <Textarea
                    value={testQuery}
                    onChange={(e) => setTestQuery(e.target.value)}
                    placeholder="Enter your legal question..."
                    rows={3}
                  />
                </div>
              </div>
              <Button onClick={testLegalAI} className="w-full">
                <Scale className="w-4 h-4 mr-2" />
                Test Legal AI
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subscription" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {subscriptionPlans.map((plan) => (
              <Card key={plan.id} className={`relative ${plan.id === 'pro' ? 'ring-2 ring-blue-500' : ''}`}>
                {plan.id === 'pro' && (
                  <Badge className="absolute -top-2 left-4 bg-blue-500">Most Popular</Badge>
                )}
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    {plan.name}
                    <span className="text-2xl font-bold">
                      {plan.price === 0 ? 'Free' : `$${plan.price}`}
                    </span>
                  </CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                  <div className="text-sm text-muted-foreground">
                    API Limit: ${plan.apiLimit?.toFixed(2) || 'N/A'}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    {Object.entries(plan.features).map(([feature, value]) => {
                      const isEnabled = value === true || (typeof value === 'string' && value !== 'false') || (typeof value === 'number' && value > 0);
                      return (
                        <div key={feature} className="flex items-center justify-between">
                          <span className="text-sm capitalize">
                            {feature.replace(/([A-Z])/g, ' $1').trim()}
                          </span>
                          {isEnabled ? (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          ) : (
                            <XCircle className="w-4 h-4 text-gray-300" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <Separator />
                  <Button 
                    className="w-full" 
                    variant={plan.id === 'free' ? 'outline' : 'default'}
                    disabled={plan.id === 'free'}
                  >
                    {plan.id === 'free' ? 'Current Plan' : 'Upgrade'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="results" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Detailed Test Results</CardTitle>
              <CardDescription>Comprehensive test execution results and performance metrics</CardDescription>
            </CardHeader>
            <CardContent>
              {testResults.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <BarChart3 className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>No test results available</p>
                  <p className="text-sm">Run comprehensive tests to see detailed results here</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {testResults.map((result, index) => (
                    <div key={`${result.service}-${index}`} className="border rounded-lg p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {getStatusIcon(result.status)}
                          <h3 className="font-medium">{result.service}</h3>
                          {getStatusBadge(result.status)}
                        </div>
                        {result.duration && (
                          <span className="text-sm text-muted-foreground">
                            {result.duration}ms
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{result.message}</p>
                      {result.data && result.status === 'success' && (
                        <details className="mt-2">
                          <summary className="cursor-pointer text-sm font-medium">View Response Data</summary>
                          <pre className="mt-2 p-2 bg-gray-50 rounded text-xs overflow-auto max-h-40">
                            {JSON.stringify(result.data, null, 2)}
                          </pre>
                        </details>
                      )}
                      {result.data && result.status === 'error' && (
                        <div className="mt-2 p-2 bg-red-50 rounded">
                          <p className="text-sm text-red-700">Error: {result.data.message || 'Unknown error'}</p>
                        </div>
                      )}
                    </div>
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