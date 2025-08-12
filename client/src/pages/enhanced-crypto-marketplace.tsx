import { useState, useEffect } from 'react';
import PremiumGate from '@/components/premium/PremiumGate';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { motion } from 'framer-motion';
import { 
  Bitcoin, 
  TrendingUp, 
  TrendingDown,
  Users, 
  Star,
  MessageCircle,
  Trophy,
  Target,
  Clock,
  DollarSign,
  BarChart3,
  Zap,
  Award,
  Crown,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Eye,
  ThumbsUp,
  Calendar
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { Link } from 'wouter';
import FloatingElements, { Card3D } from '@/components/3d/FloatingElements';

interface MarketStats {
  totalVolume: number;
  activeTraders: number;
  averageReward: number;
  totalQuestions: number;
  answeredQuestions: number;
  topCategories: Array<{
    name: string;
    volume: number;
    growth: number;
  }>;
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
  views: number;
  status: 'open' | 'answered' | 'closed';
  tags: string[];
  createdAt: string;
  deadline?: string;
  featured?: boolean;
}

interface UserStats {
  cryptoBalance: number;
  totalEarned: number;
  questionsAnswered: number;
  helpfulAnswers: number;
  reputation: number;
  level: number;
  rank: number;
}

interface CryptoTransaction {
  id: string;
  type: 'earn' | 'spend' | 'bonus';
  amount: number;
  description: string;
  timestamp: string;
  status: 'completed' | 'pending' | 'failed';
  relatedId?: string;
}

interface MarketSentiment {
  overall: 'bullish' | 'bearish' | 'neutral';
  score: number;
  factors: string[];
}

export default function EnhancedCryptoMarketplace() {
  return (
    <PremiumGate required="PRO" fallbackTitle="Enhanced Crypto Market - PRO Feature" fallbackDescription="Access advanced crypto trading platform with real-time data and analytics with your PRO subscription.">
      <EnhancedCryptoMarketplaceContent />
    </PremiumGate>
  );
}

function EnhancedCryptoMarketplaceContent() {
  const [activeTab, setActiveTab] = useState('marketplace');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user, isAdmin } = useAuth();

  // Check if user has access to enhanced crypto marketplace (Pro/Max plans or admin)
  const hasAccess = isAdmin || (user as any)?.subscriptionTier === 'pro' || (user as any)?.subscriptionTier === 'max';

  // Fetch data with React Query (always call hooks before any conditional returns)
  const { data: userStats } = useQuery<UserStats>({
    queryKey: ['/api/crypto/user-stats'],
    enabled: hasAccess, // Only fetch when user has access
  });

  const { data: marketStats } = useQuery<MarketStats>({
    queryKey: ['/api/crypto/market-stats'],
    enabled: hasAccess,
  });

  const { data: adviceRequests } = useQuery<AdviceRequest[]>({
    queryKey: ['/api/crypto/advice-requests'],
    enabled: hasAccess,
  });

  const { data: transactions } = useQuery<CryptoTransaction[]>({
    queryKey: ['/api/crypto/transactions'],
    enabled: hasAccess,
  });

  const { data: sentiment } = useQuery<MarketSentiment>({
    queryKey: ['/api/realtime/crypto-sentiment'],
    enabled: hasAccess,
  });

  const placeBidMutation = useMutation({
    mutationFn: async (data: { questionId: string; bidAmount: number; bidType: string }) => {
      return apiRequest('POST', '/api/crypto/place-bid', data);
    },
    onSuccess: () => {
      toast({
        title: "Bid Placed!",
        description: "Your bid has been successfully placed.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/crypto/advice-requests'] });
    },
  });

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto text-center">
            <Crown className="w-16 h-16 mx-auto mb-6 text-blue-500" />
            <h1 className="text-3xl font-bold mb-4">Enhanced Crypto Trading Platform</h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
              Access to the enhanced crypto marketplace with advanced analytics and competitive trading requires a Pro or Max plan. 
              Unlock real-time data feeds, sentiment analysis, competitive bidding systems, and quantum mathematical predictions.
            </p>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-8 shadow-lg">
              <h3 className="text-xl font-semibold mb-4">Enhanced Marketplace Features:</h3>
              <ul className="text-left space-y-2 text-gray-600 dark:text-gray-400">
                <li className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-green-500" />
                  Real-time market feeds and sentiment analysis
                </li>
                <li className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-blue-500" />
                  Advanced portfolio analytics and predictions
                </li>
                <li className="flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-purple-500" />
                  Competitive bidding and leaderboard systems
                </li>
                <li className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-orange-500" />
                  Quantum mathematical models for price prediction
                </li>
              </ul>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/checkout">
                <Button className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold px-8 py-3">
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

  // Complete the remaining component logic
  const mockUserStats: UserStats = userStats || {
    cryptoBalance: 1.25075,
    totalEarned: 3400.50,
    questionsAnswered: 127,
    helpfulAnswers: 98,
    reputation: 4.8,
    level: 15,
    rank: 47
  };

  const mockMarketStats: MarketStats = marketStats || {
    totalVolume: 2.4,
    activeTraders: 1347,
    averageReward: 0.021,
    totalQuestions: 2891,
    answeredQuestions: 2234,
    topCategories: [
      { name: 'Tax Planning', volume: 0.8, growth: 12.5 },
      { name: 'Investment Strategy', volume: 0.6, growth: 8.3 },
      { name: 'Retirement Planning', volume: 0.4, growth: 15.7 },
      { name: 'Crypto Trading', volume: 0.6, growth: 22.1 }
    ]
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
      views: 142,
      status: 'open',
      tags: ['Tax', 'Crypto', 'Advanced', 'Trading'],
      createdAt: '2025-08-06T14:30:00Z',
      deadline: '2025-08-13T23:59:59Z',
      featured: true
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
      views: 89,
      status: 'open',
      tags: ['Quantum', 'Portfolio', 'Advanced', 'Mathematics'],
      createdAt: '2025-08-06T12:15:00Z',
      featured: true
    },
    {
      id: '3',
      title: 'DeFi Yield Farming Safety Protocols',
      description: 'How to safely participate in DeFi yield farming while minimizing smart contract risks?',
      category: 'DeFi Strategy',
      complexity: 7,
      bounty: 300,
      cryptoReward: 0.015,
      asker: 'DeFiExplorer',
      responses: 8,
      views: 234,
      status: 'answered',
      tags: ['DeFi', 'Yield Farming', 'Security', 'Risk Management'],
      createdAt: '2025-08-05T16:45:00Z'
    }
  ];

  const categories = ['all', 'Tax Planning', 'Investment Strategy', 'DeFi Strategy', 'Retirement Planning', 'Crypto Trading'];

  const filteredRequests = mockAdviceRequests.filter(request => 
    selectedCategory === 'all' || request.category === selectedCategory
  );

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'bullish': return 'text-green-600 bg-green-100';
      case 'bearish': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getComplexityColor = (complexity: number) => {
    if (complexity <= 3) return 'text-green-600 bg-green-100';
    if (complexity <= 6) return 'text-yellow-600 bg-yellow-100';
    if (complexity <= 8) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50 relative overflow-hidden">
      <FloatingElements />
      
      <div className="container mx-auto px-6 py-8 relative z-10">
        {/* Header with Real-time Stats */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center justify-center mb-4">
              <Bitcoin className="h-12 w-12 text-orange-500 mr-3" />
              <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-500 to-yellow-500 bg-clip-text text-transparent">
                Enhanced Crypto Marketplace
              </h1>
            </div>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-6">
              Advanced peer-to-peer financial advice trading with real-time market data and AI-powered insights.
            </p>
            
            {/* Market Sentiment */}
            {sentiment && (
              <div className="flex justify-center">
                <Badge className={getSentimentColor(sentiment.overall)}>
                  Market Sentiment: {sentiment.overall.toUpperCase()} ({sentiment.score}%)
                </Badge>
              </div>
            )}
          </motion.div>
        </div>

        {/* Enhanced Stats Grid */}
        <div className="grid md:grid-cols-6 gap-4 mb-8">
          <Card3D>
            <Card className="text-center">
              <CardContent className="p-4">
                <Bitcoin className="h-6 w-6 text-orange-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-orange-600">
                  {mockUserStats.cryptoBalance.toFixed(5)}
                </div>
                <div className="text-sm text-gray-600">My BTC Balance</div>
              </CardContent>
            </Card>
          </Card3D>

          <Card3D>
            <Card className="text-center">
              <CardContent className="p-4">
                <TrendingUp className="h-6 w-6 text-green-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-green-600">
                  {mockMarketStats.totalVolume.toFixed(1)}
                </div>
                <div className="text-sm text-gray-600">Total Volume (BTC)</div>
              </CardContent>
            </Card>
          </Card3D>

          <Card3D>
            <Card className="text-center">
              <CardContent className="p-4">
                <Users className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-blue-600">
                  {mockMarketStats.activeTraders.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">Active Traders</div>
              </CardContent>
            </Card>
          </Card3D>

          <Card3D>
            <Card className="text-center">
              <CardContent className="p-4">
                <Star className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-purple-600">
                  {mockUserStats.reputation.toFixed(1)}
                </div>
                <div className="text-sm text-gray-600">My Reputation</div>
              </CardContent>
            </Card>
          </Card3D>

          <Card3D>
            <Card className="text-center">
              <CardContent className="p-4">
                <Trophy className="h-6 w-6 text-yellow-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-yellow-600">
                  #{mockUserStats.rank}
                </div>
                <div className="text-sm text-gray-600">Global Rank</div>
              </CardContent>
            </Card>
          </Card3D>

          <Card3D>
            <Card className="text-center">
              <CardContent className="p-4">
                <Activity className="h-6 w-6 text-indigo-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-indigo-600">
                  {Math.round((mockMarketStats.answeredQuestions / mockMarketStats.totalQuestions) * 100)}%
                </div>
                <div className="text-sm text-gray-600">Market Activity</div>
              </CardContent>
            </Card>
          </Card3D>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 lg:w-fit">
            <TabsTrigger value="marketplace">Marketplace</TabsTrigger>
            <TabsTrigger value="trading">Live Trading</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
            <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
          </TabsList>

          {/* Enhanced Marketplace Tab */}
          <TabsContent value="marketplace" className="space-y-6">
            {/* Category Filter */}
            <Card3D>
              <Card>
                <CardContent className="p-4">
                  <div className="flex flex-wrap gap-2">
                    {categories.map(category => (
                      <Button
                        key={category}
                        variant={selectedCategory === category ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedCategory(category)}
                      >
                        {category}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </Card3D>

            {/* Featured Requests */}
            <div>
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Crown className="h-5 w-5 text-yellow-600" />
                Featured High-Value Requests
              </h3>
              <div className="grid gap-6">
                {filteredRequests.filter(r => r.featured).map((request) => (
                  <Card3D key={request.id}>
                    <Card className="border-2 border-yellow-200 bg-gradient-to-r from-yellow-50 to-orange-50">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge className="bg-yellow-100 text-yellow-800">
                                <Crown className="h-3 w-3 mr-1" />
                                Featured
                              </Badge>
                              <Badge className={getComplexityColor(request.complexity)}>
                                Complexity {request.complexity}/10
                              </Badge>
                              {request.deadline && (
                                <Badge variant="outline" className="text-red-600">
                                  <Clock className="h-3 w-3 mr-1" />
                                  Deadline: {new Date(request.deadline).toLocaleDateString()}
                                </Badge>
                              )}
                            </div>
                            <CardTitle className="text-xl">{request.title}</CardTitle>
                            <CardDescription className="mt-2 text-base">
                              {request.description}
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid md:grid-cols-4 gap-4 mb-4">
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-green-600" />
                            <span className="font-semibold">${request.bounty}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Bitcoin className="h-4 w-4 text-orange-600" />
                            <span className="font-semibold">{request.cryptoReward} BTC</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MessageCircle className="h-4 w-4 text-blue-600" />
                            <span>{request.responses} responses</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Eye className="h-4 w-4 text-gray-600" />
                            <span>{request.views} views</span>
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-2 mb-4">
                          {request.tags.map(tag => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>

                        <div className="flex gap-3">
                          <Button 
                            className="flex-1 bg-gradient-to-r from-orange-600 to-yellow-600 hover:from-orange-700 hover:to-yellow-700"
                            onClick={() => placeBidMutation.mutate({ 
                              questionId: request.id, 
                              bidAmount: request.bounty * 1.1, 
                              bidType: 'competitive' 
                            })}
                          >
                            <Target className="mr-2 h-4 w-4" />
                            Place Competitive Bid
                          </Button>
                          <Button variant="outline">
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </Card3D>
                ))}
              </div>
            </div>

            {/* Regular Requests */}
            <div>
              <h3 className="text-xl font-semibold mb-4">All Requests</h3>
              <div className="grid gap-4">
                {filteredRequests.filter(r => !r.featured).map((request) => (
                  <Card3D key={request.id}>
                    <Card>
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge className={getComplexityColor(request.complexity)}>
                                Level {request.complexity}
                              </Badge>
                              <Badge variant="outline">{request.category}</Badge>
                              {request.status === 'answered' && (
                                <Badge className="bg-green-100 text-green-800">
                                  <ThumbsUp className="h-3 w-3 mr-1" />
                                  Answered
                                </Badge>
                              )}
                            </div>
                            <CardTitle className="text-lg">{request.title}</CardTitle>
                            <CardDescription className="mt-1">
                              {request.description.substring(0, 150)}...
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <DollarSign className="h-3 w-3" />
                              ${request.bounty}
                            </span>
                            <span className="flex items-center gap-1">
                              <Bitcoin className="h-3 w-3" />
                              {request.cryptoReward} BTC
                            </span>
                            <span className="flex items-center gap-1">
                              <MessageCircle className="h-3 w-3" />
                              {request.responses}
                            </span>
                            <span className="flex items-center gap-1">
                              <Eye className="h-3 w-3" />
                              {request.views}
                            </span>
                          </div>
                          <div className="flex gap-2">
                            {request.status === 'open' ? (
                              <Button size="sm" variant="outline">
                                Answer Question
                              </Button>
                            ) : (
                              <Button size="sm" variant="outline">
                                View Answer
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Card3D>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Live Trading Tab */}
          <TabsContent value="trading" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card3D>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5" />
                      Active Trading Positions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                        <div>
                          <div className="font-semibold">Tax Strategy Q&A</div>
                          <div className="text-sm text-gray-600">Pending response</div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-green-600">+0.015 BTC</div>
                          <div className="text-sm text-gray-600">Est. return</div>
                        </div>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                        <div>
                          <div className="font-semibold">Portfolio Analysis</div>
                          <div className="text-sm text-gray-600">In review</div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-blue-600">+0.008 BTC</div>
                          <div className="text-sm text-gray-600">Potential</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Card3D>

              <Card3D>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Market Trends
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {mockMarketStats.topCategories.map((category, index) => (
                        <div key={category.name} className="flex justify-between items-center">
                          <span className="text-sm font-medium">{category.name}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm">{category.volume} BTC</span>
                            <Badge className={category.growth > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                              {category.growth > 0 ? <ArrowUpRight className="h-3 w-3 mr-1" /> : <ArrowDownRight className="h-3 w-3 mr-1" />}
                              {Math.abs(category.growth)}%
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </Card3D>
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid md:grid-cols-3 gap-6">
              <Card3D>
                <Card>
                  <CardHeader>
                    <CardTitle>Earnings Analytics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm">This Month</span>
                          <span className="font-semibold">0.045 BTC</span>
                        </div>
                        <Progress value={75} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm">This Week</span>
                          <span className="font-semibold">0.012 BTC</span>
                        </div>
                        <Progress value={60} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm">Today</span>
                          <span className="font-semibold">0.003 BTC</span>
                        </div>
                        <Progress value={30} className="h-2" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Card3D>

              <Card3D>
                <Card>
                  <CardHeader>
                    <CardTitle>Performance Metrics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm">Success Rate</span>
                        <span className="font-semibold text-green-600">92%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Avg Response Time</span>
                        <span className="font-semibold">2.3h</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Client Satisfaction</span>
                        <span className="font-semibold text-blue-600">4.8/5</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Expertise Areas</span>
                        <span className="font-semibold">7</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Card3D>

              <Card3D>
                <Card>
                  <CardHeader>
                    <CardTitle>Growth Projections</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm">Next Month Est.</span>
                        <span className="font-semibold text-purple-600">0.078 BTC</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Quarterly Goal</span>
                        <span className="font-semibold text-orange-600">0.250 BTC</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Annual Target</span>
                        <span className="font-semibold text-green-600">1.200 BTC</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Card3D>
            </div>
          </TabsContent>

          {/* Portfolio Tab */}
          <TabsContent value="portfolio" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card3D>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="h-5 w-5" />
                      Portfolio Overview
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-orange-600 mb-2">
                          {mockUserStats.cryptoBalance.toFixed(5)} BTC
                        </div>
                        <div className="text-sm text-gray-600">
                          ≈ ${(mockUserStats.cryptoBalance * 43250).toLocaleString()}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 pt-4">
                        <div className="text-center">
                          <div className="text-lg font-semibold text-green-600">
                            +{((mockUserStats.cryptoBalance / 1.2) * 0.2).toFixed(4)}
                          </div>
                          <div className="text-sm text-gray-600">This Month</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-semibold text-blue-600">
                            +{(mockUserStats.cryptoBalance * 0.15).toFixed(4)}
                          </div>
                          <div className="text-sm text-gray-600">Potential Earnings</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Card3D>

              <Card3D>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="h-5 w-5" />
                      Achievement Progress
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm">Expert Status</span>
                          <span className="text-sm font-medium">Level {mockUserStats.level}</span>
                        </div>
                        <Progress value={(mockUserStats.level / 20) * 100} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm">Questions Answered</span>
                          <span className="text-sm font-medium">{mockUserStats.questionsAnswered}/150</span>
                        </div>
                        <Progress value={(mockUserStats.questionsAnswered / 150) * 100} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm">Helpful Answers</span>
                          <span className="text-sm font-medium">{mockUserStats.helpfulAnswers}/100</span>
                        </div>
                        <Progress value={(mockUserStats.helpfulAnswers / 100) * 100} className="h-2" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Card3D>
            </div>
          </TabsContent>

          {/* Leaderboard Tab */}
          <TabsContent value="leaderboard" className="space-y-6">
            <Card3D>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5" />
                    Top Crypto Earners
                  </CardTitle>
                  <CardDescription>
                    Leading experts in our marketplace community
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { rank: 1, username: 'QuantumTaxGuru', earned: 4.567, specialties: ['Tax Planning', 'Quantum Math'] },
                      { rank: 2, username: 'CryptoStrategist', earned: 3.892, specialties: ['Crypto Trading', 'DeFi'] },
                      { rank: 3, username: 'RetirementSage', earned: 3.234, specialties: ['Retirement', 'Investment'] },
                      { rank: 4, username: 'SpectrumAnalyst', earned: 2.891, specialties: ['Tax Analysis', 'Spectrum Math'] },
                      { rank: 5, username: 'PortfolioOptimizer', earned: 2.567, specialties: ['Portfolio', 'Quantum Models'] }
                    ].map((user) => (
                      <div key={user.rank} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                            user.rank === 1 ? 'bg-yellow-500 text-white' :
                            user.rank === 2 ? 'bg-gray-400 text-white' :
                            user.rank === 3 ? 'bg-orange-500 text-white' :
                            'bg-gray-200 text-gray-700'
                          }`}>
                            {user.rank}
                          </div>
                          <div>
                            <div className="font-semibold">{user.username}</div>
                            <div className="text-sm text-gray-600">
                              {user.specialties.join(', ')}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-orange-600">{user.earned} BTC</div>
                          <div className="text-sm text-gray-600">Total Earned</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </Card3D>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}