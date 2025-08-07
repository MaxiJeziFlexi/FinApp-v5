import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { motion } from 'framer-motion';
import { 
  Bitcoin, 
  Coins, 
  TrendingUp, 
  MessageSquare, 
  Star, 
  Award, 
  DollarSign,
  Users,
  Trophy,
  Zap,
  Brain,
  Target,
  Shield,
  CheckCircle,
  ArrowRight,
  Plus,
  Search,
  Crown
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { Link } from 'wouter';
import FloatingElements, { Card3D } from '@/components/3d/FloatingElements';

interface CryptoTransaction {
  id: string;
  type: 'earn' | 'spend' | 'convert';
  amount: number;
  description: string;
  timestamp: string;
  status: 'completed' | 'pending';
}

interface AdviceRequest {
  id: string;
  title: string;
  description: string;
  category: string;
  complexity: number;
  bounty: number;
  cryptoReward: number;
  asker: string;
  responses: number;
  status: 'open' | 'answered' | 'closed';
  tags: string[];
}

interface UserStats {
  cryptoBalance: number;
  totalEarned: number;
  questionsAnswered: number;
  helpfulAnswers: number;
  reputation: number;
  level: number;
}

export default function CryptoMarketplace() {
  const [activeTab, setActiveTab] = useState('marketplace');
  const [searchQuery, setSearchQuery] = useState('');
  const [newQuestion, setNewQuestion] = useState({
    title: '',
    description: '',
    category: 'general',
    bounty: 50
  });
  const { toast } = useToast();
  const { user, isAdmin } = useAuth();

  // Check if user has access to crypto marketplace (Pro/Max plans or admin)
  const hasAccess = isAdmin || (user as any)?.subscriptionTier === 'pro' || (user as any)?.subscriptionTier === 'max';

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto text-center">
            <Bitcoin className="w-16 h-16 mx-auto mb-6 text-orange-500" />
            <h1 className="text-3xl font-bold mb-4">Premium Crypto Marketplace</h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
              Access to the advanced crypto marketplace with peer-to-peer trading requires a Pro or Max plan. 
              Unlock real-time market data, sentiment analysis, competitive bidding, and sophisticated portfolio analytics.
            </p>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-8 shadow-lg">
              <h3 className="text-xl font-semibold mb-4">Crypto Marketplace Features:</h3>
              <ul className="text-left space-y-2 text-gray-600 dark:text-gray-400">
                <li className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  Real-time market data and sentiment analysis
                </li>
                <li className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-500" />
                  Peer-to-peer financial advice trading
                </li>
                <li className="flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-purple-500" />
                  Competitive bidding and leaderboards
                </li>
                <li className="flex items-center gap-2">
                  <Brain className="w-4 h-4 text-orange-500" />
                  Sophisticated portfolio analytics
                </li>
              </ul>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/checkout">
                <Button className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white font-semibold px-8 py-3">
                  <Crown className="w-4 h-4 mr-2" />
                  Upgrade to Pro Plan
                </Button>
              </Link>
              <Link href="/finapp-home">
                <Button variant="outline" className="px-8 py-3">
                  Return to Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }
  const queryClient = useQueryClient();

  // Fetch user stats
  const { data: userStats } = useQuery<UserStats>({
    queryKey: ['/api/crypto/user-stats'],
  });

  // Fetch advice requests
  const { data: adviceRequests } = useQuery<AdviceRequest[]>({
    queryKey: ['/api/crypto/advice-requests'],
  });

  // Fetch crypto transactions
  const { data: transactions } = useQuery<CryptoTransaction[]>({
    queryKey: ['/api/crypto/transactions'],
  });

  // Submit new question mutation
  const submitQuestionMutation = useMutation({
    mutationFn: async (questionData: any) => {
      const response = await apiRequest('POST', '/api/crypto/submit-question', questionData);
      return response;
    },
    onSuccess: () => {
      toast({
        title: "Question Posted!",
        description: "Your question is now live in the marketplace. Premium users can provide answers for crypto rewards.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/crypto/advice-requests'] });
      setNewQuestion({ title: '', description: '', category: 'general', bounty: 50 });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to post question. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Answer question mutation
  const answerQuestionMutation = useMutation({
    mutationFn: async ({ questionId, answer }: { questionId: string; answer: string }) => {
      const response = await apiRequest('POST', `/api/crypto/answer-question/${questionId}`, { answer });
      return response;
    },
    onSuccess: () => {
      toast({
        title: "Answer Submitted!",
        description: "Your detailed answer has been submitted. You'll earn crypto rewards when the asker marks it as helpful!",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/crypto/advice-requests'] });
    }
  });

  const handleSubmitQuestion = () => {
    if (!newQuestion.title || !newQuestion.description) {
      toast({
        title: "Missing Information",
        description: "Please fill in both title and description for your question.",
        variant: "destructive"
      });
      return;
    }

    submitQuestionMutation.mutate(newQuestion);
  };

  const handleAnswerQuestion = (questionId: string, answer: string) => {
    if (!answer.trim()) {
      toast({
        title: "Empty Answer",
        description: "Please provide a detailed answer to earn crypto rewards.",
        variant: "destructive"
      });
      return;
    }

    answerQuestionMutation.mutate({ questionId, answer });
  };

  const mockUserStats: UserStats = userStats || {
    cryptoBalance: 1250.75,
    totalEarned: 3400.50,
    questionsAnswered: 127,
    helpfulAnswers: 98,
    reputation: 4.8,
    level: 15
  };

  const mockAdviceRequests: AdviceRequest[] = adviceRequests || [
    {
      id: '1',
      title: 'Tax Optimization for High-Frequency Trading',
      description: 'Looking for advanced strategies to minimize tax liability on crypto trading profits using 2025 reforms.',
      category: 'Tax Planning',
      complexity: 9,
      bounty: 500,
      cryptoReward: 0.025,
      asker: 'CryptoTrader_Pro',
      responses: 3,
      status: 'open',
      tags: ['Tax', 'Crypto', 'Advanced', 'Trading']
    },
    {
      id: '2',
      title: 'Quantum Portfolio Optimization Strategy',
      description: 'Need help implementing quantum mathematical models for portfolio balance. Complex derivatives involved.',
      category: 'Investment Strategy',
      complexity: 10,
      bounty: 750,
      cryptoReward: 0.040,
      asker: 'QuantumInvestor',
      responses: 1,
      status: 'open',
      tags: ['Quantum', 'Portfolio', 'Advanced', 'Mathematics']
    },
    {
      id: '3',
      title: 'Retirement Planning with DeFi Integration',
      description: 'How to safely integrate DeFi protocols into traditional retirement planning while maintaining security.',
      category: 'Retirement',
      complexity: 7,
      bounty: 300,
      cryptoReward: 0.015,
      asker: 'RetirementPlan2025',
      responses: 5,
      status: 'answered',
      tags: ['DeFi', 'Retirement', 'Security', 'Planning']
    }
  ];

  const mockTransactions: CryptoTransaction[] = transactions || [
    { id: '1', type: 'earn', amount: 0.025, description: 'Complex tax strategy answer', timestamp: '2025-08-06T10:30:00Z', status: 'completed' },
    { id: '2', type: 'earn', amount: 0.015, description: 'Retirement planning advice', timestamp: '2025-08-06T09:15:00Z', status: 'completed' },
    { id: '3', type: 'spend', amount: 0.020, description: 'Premium consultation purchase', timestamp: '2025-08-05T16:45:00Z', status: 'completed' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 relative overflow-hidden">
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
              <Bitcoin className="h-12 w-12 text-orange-500 mr-3" />
              <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-purple-600 bg-clip-text text-transparent">
                Crypto Marketplace
              </h1>
            </div>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Earn cryptocurrency by providing expert financial advice. Buy premium consultation from top advisors.
            </p>
          </motion.div>
        </div>

        {/* User Stats Overview */}
        <Card3D className="mb-8">
          <Card className="bg-gradient-to-r from-purple-600 to-blue-600 text-white border-0">
            <CardContent className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">{mockUserStats.cryptoBalance.toFixed(3)}</div>
                  <div className="text-sm opacity-80">BTC Balance</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">${mockUserStats.totalEarned.toLocaleString()}</div>
                  <div className="text-sm opacity-80">Total Earned</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{mockUserStats.questionsAnswered}</div>
                  <div className="text-sm opacity-80">Questions Answered</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{mockUserStats.helpfulAnswers}</div>
                  <div className="text-sm opacity-80">Helpful Answers</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{mockUserStats.reputation}/5.0</div>
                  <div className="text-sm opacity-80">Reputation</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold flex items-center justify-center">
                    <Trophy className="h-6 w-6 mr-1" />
                    {mockUserStats.level}
                  </div>
                  <div className="text-sm opacity-80">Expert Level</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </Card3D>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-fit">
            <TabsTrigger value="marketplace">Marketplace</TabsTrigger>
            <TabsTrigger value="ask">Ask Question</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="earnings">Earnings</TabsTrigger>
          </TabsList>

          {/* Marketplace Tab */}
          <TabsContent value="marketplace" className="space-y-6">
            <div className="flex gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search questions by topic, complexity, or reward..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button className="bg-gradient-to-r from-purple-600 to-blue-600">
                <Search className="mr-2 h-4 w-4" />
                Search
              </Button>
            </div>

            <div className="grid gap-6">
              {mockAdviceRequests.map((request) => (
                <Card3D key={request.id}>
                  <Card className="hover:shadow-lg transition-all duration-300">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <CardTitle className="text-xl mb-2">{request.title}</CardTitle>
                          <CardDescription className="text-gray-600">
                            {request.description}
                          </CardDescription>
                          <div className="flex flex-wrap gap-2 mt-3">
                            {request.tags.map((tag) => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div className="text-right ml-4">
                          <Badge 
                            className={`mb-2 ${
                              request.status === 'open' ? 'bg-green-100 text-green-800' :
                              request.status === 'answered' ? 'bg-blue-100 text-blue-800' :
                              'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {request.status}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-6">
                          <div className="flex items-center text-sm text-gray-600">
                            <Target className="h-4 w-4 mr-1" />
                            Complexity: {request.complexity}/10
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <MessageSquare className="h-4 w-4 mr-1" />
                            {request.responses} responses
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <Users className="h-4 w-4 mr-1" />
                            by {request.asker}
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <div className="text-lg font-bold text-green-600">
                              {request.cryptoReward} BTC
                            </div>
                            <div className="text-sm text-gray-500">
                              ${request.bounty} USD
                            </div>
                          </div>
                          <Button 
                            className="bg-gradient-to-r from-green-600 to-emerald-600"
                            disabled={request.status === 'closed'}
                          >
                            {request.status === 'open' ? 'Answer & Earn' : 'View Answers'}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Card3D>
              ))}
            </div>
          </TabsContent>

          {/* Ask Question Tab */}
          <TabsContent value="ask" className="space-y-6">
            <Card3D>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="h-5 w-5" />
                    Ask a Financial Question
                  </CardTitle>
                  <CardDescription>
                    Get expert advice from premium users. Higher bounties attract more detailed answers.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="title">Question Title</Label>
                    <Input
                      id="title"
                      placeholder="e.g., Tax optimization strategies for crypto trading"
                      value={newQuestion.title}
                      onChange={(e) => setNewQuestion(prev => ({ ...prev, title: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Detailed Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Provide context, specific details, and what kind of expertise you're looking for..."
                      rows={4}
                      value={newQuestion.description}
                      onChange={(e) => setNewQuestion(prev => ({ ...prev, description: e.target.value }))}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="category">Category</Label>
                      <select 
                        id="category"
                        className="w-full p-2 border rounded-md"
                        value={newQuestion.category}
                        onChange={(e) => setNewQuestion(prev => ({ ...prev, category: e.target.value }))}
                      >
                        <option value="general">General Planning</option>
                        <option value="tax">Tax Strategy</option>
                        <option value="investment">Investment Strategy</option>
                        <option value="retirement">Retirement Planning</option>
                        <option value="crypto">Cryptocurrency</option>
                        <option value="advanced">Advanced/Complex</option>
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="bounty">Bounty (USD)</Label>
                      <Input
                        id="bounty"
                        type="number"
                        min="10"
                        max="1000"
                        value={newQuestion.bounty}
                        onChange={(e) => setNewQuestion(prev => ({ ...prev, bounty: parseInt(e.target.value) || 50 }))}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Crypto equivalent: ~{(newQuestion.bounty / 50000).toFixed(4)} BTC
                      </p>
                    </div>
                  </div>
                  <Button 
                    onClick={handleSubmitQuestion}
                    disabled={submitQuestionMutation.isPending}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600"
                  >
                    {submitQuestionMutation.isPending ? 'Posting...' : 'Post Question & Set Bounty'}
                  </Button>
                </CardContent>
              </Card>
            </Card3D>
          </TabsContent>

          {/* Transactions Tab */}
          <TabsContent value="transactions" className="space-y-6">
            <Card3D>
              <Card>
                <CardHeader>
                  <CardTitle>Recent Transactions</CardTitle>
                  <CardDescription>
                    Track your crypto earnings and spending activity
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockTransactions.map((transaction) => (
                      <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-full ${
                            transaction.type === 'earn' ? 'bg-green-100 text-green-600' :
                            transaction.type === 'spend' ? 'bg-red-100 text-red-600' :
                            'bg-blue-100 text-blue-600'
                          }`}>
                            {transaction.type === 'earn' ? <TrendingUp className="h-4 w-4" /> :
                             transaction.type === 'spend' ? <DollarSign className="h-4 w-4" /> :
                             <Coins className="h-4 w-4" />}
                          </div>
                          <div>
                            <div className="font-medium">{transaction.description}</div>
                            <div className="text-sm text-gray-500">
                              {new Date(transaction.timestamp).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`font-bold ${
                            transaction.type === 'earn' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {transaction.type === 'earn' ? '+' : '-'}{transaction.amount.toFixed(4)} BTC
                          </div>
                          <Badge variant={transaction.status === 'completed' ? 'default' : 'secondary'}>
                            {transaction.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </Card3D>
          </TabsContent>

          {/* Earnings Tab */}
          <TabsContent value="earnings" className="space-y-6">
            <div className="grid md:grid-cols-3 gap-6">
              <Card3D>
                <Card className="text-center">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-center gap-2">
                      <Trophy className="h-5 w-5 text-yellow-500" />
                      Expert Level
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-purple-600 mb-2">
                      Level {mockUserStats.level}
                    </div>
                    <p className="text-sm text-gray-600">
                      Quantum Finance Expert
                    </p>
                    <div className="mt-4 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-purple-600 h-2 rounded-full" 
                        style={{ width: `${(mockUserStats.level % 10) * 10}%` }}
                      />
                    </div>
                  </CardContent>
                </Card>
              </Card3D>

              <Card3D>
                <Card className="text-center">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-center gap-2">
                      <Bitcoin className="h-5 w-5 text-orange-500" />
                      Total Crypto Earned
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-orange-600 mb-2">
                      {mockUserStats.cryptoBalance.toFixed(4)} BTC
                    </div>
                    <p className="text-sm text-gray-600">
                      ≈ ${(mockUserStats.cryptoBalance * 50000).toLocaleString()}
                    </p>
                    <Button className="mt-4 bg-gradient-to-r from-orange-500 to-red-500">
                      Convert to Cash
                    </Button>
                  </CardContent>
                </Card>
              </Card3D>

              <Card3D>
                <Card className="text-center">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-center gap-2">
                      <Star className="h-5 w-5 text-yellow-500" />
                      Reputation Score
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-yellow-600 mb-2">
                      {mockUserStats.reputation}/5.0
                    </div>
                    <p className="text-sm text-gray-600">
                      Based on {mockUserStats.helpfulAnswers} helpful answers
                    </p>
                    <div className="flex justify-center mt-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star 
                          key={star} 
                          className={`h-4 w-4 ${
                            star <= Math.floor(mockUserStats.reputation) 
                              ? 'text-yellow-500 fill-current' 
                              : 'text-gray-300'
                          }`} 
                        />
                      ))}
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