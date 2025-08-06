import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AnimatedCounter } from '@/components/ui/animated-counter';
import { 
  TrendingUp, 
  TrendingDown, 
  Brain, 
  AlertTriangle, 
  Target,
  Globe,
  Newspaper,
  Activity,
  DollarSign,
  Clock,
  BarChart3,
  PieChart,
  Zap,
  Star
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface MarketSignal {
  id: string;
  asset: string;
  signal: 'buy' | 'sell' | 'hold' | 'watch';
  strength: number; // 0-100
  confidence: number; // 0-1
  reason: string;
  timeframe: '1D' | '1W' | '1M' | '3M';
  priceTarget?: number;
  currentPrice: number;
  aiModel: string;
  timestamp: Date;
}

interface MarketSentiment {
  overall: number; // -100 to 100
  sectors: Record<string, number>;
  newsImpact: number;
  socialSentiment: number;
  technicalMomentum: number;
  economicIndicators: number;
}

interface AIInsight {
  id: string;
  type: 'opportunity' | 'risk' | 'trend' | 'economic';
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high' | 'critical';
  timeframe: string;
  actionable: boolean;
  confidence: number;
  relevantAssets: string[];
}

const signalColors = {
  buy: 'text-green-600 bg-green-50 border-green-200',
  sell: 'text-red-600 bg-red-50 border-red-200',
  hold: 'text-blue-600 bg-blue-50 border-blue-200',
  watch: 'text-orange-600 bg-orange-50 border-orange-200'
};

const impactColors = {
  low: 'text-gray-600 bg-gray-50 border-gray-200',
  medium: 'text-blue-600 bg-blue-50 border-blue-200',
  high: 'text-orange-600 bg-orange-50 border-orange-200',
  critical: 'text-red-600 bg-red-50 border-red-200'
};

export function AdvancedMarketIntelligence({ userId }: { userId: string }) {
  const [marketSignals, setMarketSignals] = useState<MarketSignal[]>([
    {
      id: '1',
      asset: 'AAPL',
      signal: 'buy',
      strength: 82,
      confidence: 0.87,
      reason: 'Strong earnings momentum, positive analyst revisions, and oversold technical indicators',
      timeframe: '3M',
      priceTarget: 195.50,
      currentPrice: 182.30,
      aiModel: 'GPT-4 Financial Analyst',
      timestamp: new Date(Date.now() - 15 * 60 * 1000)
    },
    {
      id: '2',
      asset: 'TSLA',
      signal: 'watch',
      strength: 65,
      confidence: 0.74,
      reason: 'Mixed signals: Strong delivery numbers offset by margin concerns and regulatory headwinds',
      timeframe: '1M',
      priceTarget: 280.00,
      currentPrice: 267.45,
      aiModel: 'Advanced Pattern Recognition',
      timestamp: new Date(Date.now() - 32 * 60 * 1000)
    },
    {
      id: '3',
      asset: 'VOO',
      signal: 'buy',
      strength: 78,
      confidence: 0.91,
      reason: 'Market breadth improving, economic indicators stabilizing, strong long-term fundamentals',
      timeframe: '1W',
      currentPrice: 415.60,
      aiModel: 'Ensemble Market Predictor',
      timestamp: new Date(Date.now() - 45 * 60 * 1000)
    }
  ]);

  const [marketSentiment, setMarketSentiment] = useState<MarketSentiment>({
    overall: 23, // Moderately positive
    sectors: {
      'Technology': 31,
      'Healthcare': 18,
      'Financial': -8,
      'Energy': 45,
      'Consumer Discretionary': 12,
      'Utilities': -3
    },
    newsImpact: 15,
    socialSentiment: 28,
    technicalMomentum: 34,
    economicIndicators: 19
  });

  const [aiInsights, setAiInsights] = useState<AIInsight[]>([
    {
      id: '1',
      type: 'opportunity',
      title: 'Emerging Market Rotation Pattern',
      description: 'AI models detect institutional money rotating from growth to value stocks. Historical patterns suggest 15-20% outperformance potential in financial and industrial sectors over next 6 months.',
      impact: 'high',
      timeframe: '6 months',
      actionable: true,
      confidence: 0.84,
      relevantAssets: ['XLF', 'XLI', 'VTV']
    },
    {
      id: '2',
      type: 'risk',
      title: 'Yield Curve Inversion Signal',
      description: 'Advanced macroeconomic models show 73% probability of recession within 12-18 months based on yield curve dynamics and credit spreads.',
      impact: 'critical',
      timeframe: '12-18 months',
      actionable: true,
      confidence: 0.73,
      relevantAssets: ['TLT', 'GLD', 'VTI']
    },
    {
      id: '3',
      type: 'trend',
      title: 'AI Infrastructure Boom Accelerating',
      description: 'Sentiment analysis of earnings calls and patent filings indicates massive AI infrastructure spending cycle just beginning. Semiconductor and cloud companies positioned to benefit.',
      impact: 'high',
      timeframe: '2-3 years',
      actionable: true,
      confidence: 0.89,
      relevantAssets: ['NVDA', 'AMD', 'MSFT', 'GOOGL']
    }
  ]);

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  const runAdvancedAnalysis = async () => {
    setIsAnalyzing(true);
    
    // Simulate AI analysis
    setTimeout(() => {
      // Generate new signal
      const newSignal: MarketSignal = {
        id: Date.now().toString(),
        asset: ['BTC', 'ETH', 'QQQ', 'SPY'][Math.floor(Math.random() * 4)],
        signal: (['buy', 'sell', 'hold', 'watch'] as const)[Math.floor(Math.random() * 4)],
        strength: Math.floor(Math.random() * 40) + 60,
        confidence: Math.random() * 0.3 + 0.7,
        reason: 'Advanced AI pattern recognition detected significant market opportunities',
        timeframe: (['1D', '1W', '1M', '3M'] as const)[Math.floor(Math.random() * 4)],
        currentPrice: Math.random() * 500 + 50,
        aiModel: 'GPT-4 Turbo Financial',
        timestamp: new Date()
      };
      
      setMarketSignals(prev => [newSignal, ...prev.slice(0, 4)]);
      setLastUpdate(new Date());
      setIsAnalyzing(false);
    }, 3000);
  };

  const getSentimentColor = (sentiment: number) => {
    if (sentiment > 20) return 'text-green-600';
    if (sentiment > 0) return 'text-blue-600';
    if (sentiment > -20) return 'text-orange-600';
    return 'text-red-600';
  };

  const getSentimentDirection = (sentiment: number) => {
    return sentiment > 0 ? TrendingUp : TrendingDown;
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const minutes = Math.floor((now.getTime() - date.getTime()) / 60000);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <div className="space-y-6">
      {/* Market Intelligence Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-blue-700 dark:text-blue-300 flex items-center gap-2">
              <Brain className="h-4 w-4" />
              AI Signals Active
            </CardTitle>
            <CardDescription className="text-2xl font-bold text-blue-900 dark:text-blue-100">
              <AnimatedCounter value={marketSignals.length} />
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-blue-600 dark:text-blue-400">
              {marketSignals.filter(s => s.signal === 'buy').length} buy signals
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900 dark:to-green-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-green-700 dark:text-green-300 flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Market Sentiment
            </CardTitle>
            <CardDescription className={`text-2xl font-bold ${getSentimentColor(marketSentiment.overall)}`}>
              <AnimatedCounter value={marketSentiment.overall} suffix="%" />
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-1 text-xs">
              {getSentimentDirection(marketSentiment.overall)({ className: "h-3 w-3" })}
              <span className={getSentimentColor(marketSentiment.overall)}>
                {marketSentiment.overall > 0 ? 'Bullish' : 'Bearish'}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900 dark:to-purple-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-purple-700 dark:text-purple-300 flex items-center gap-2">
              <Target className="h-4 w-4" />
              High Confidence
            </CardTitle>
            <CardDescription className="text-2xl font-bold text-purple-900 dark:text-purple-100">
              {marketSignals.filter(s => s.confidence > 0.8).length}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-purple-600 dark:text-purple-400">
              Above 80% confidence
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900 dark:to-orange-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-orange-700 dark:text-orange-300 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Last Update
            </CardTitle>
            <CardDescription className="text-lg font-bold text-orange-900 dark:text-orange-100">
              {formatTimeAgo(lastUpdate)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              size="sm" 
              onClick={runAdvancedAnalysis}
              disabled={isAnalyzing}
              className="w-full text-xs"
            >
              {isAnalyzing ? (
                <>
                  <Brain className="h-3 w-3 mr-1 animate-pulse" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Zap className="h-3 w-3 mr-1" />
                  Run Analysis
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Market Sentiment Dashboard */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Advanced Market Sentiment Analysis
          </CardTitle>
          <CardDescription>
            AI-powered sentiment analysis across multiple data sources
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Sentiment Components</h3>
              {Object.entries({
                'News Impact': marketSentiment.newsImpact,
                'Social Media': marketSentiment.socialSentiment,
                'Technical Momentum': marketSentiment.technicalMomentum,
                'Economic Data': marketSentiment.economicIndicators
              }).map(([component, value]) => (
                <div key={component} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{component}</span>
                    <span className={getSentimentColor(value)}>
                      {value > 0 ? '+' : ''}{value}%
                    </span>
                  </div>
                  <Progress 
                    value={Math.abs(value)} 
                    className="h-2" 
                  />
                </div>
              ))}
            </div>
            
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Sector Sentiment</h3>
              {Object.entries(marketSentiment.sectors).map(([sector, sentiment]) => {
                const SentimentIcon = getSentimentDirection(sentiment);
                return (
                  <div key={sector} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <SentimentIcon className={`h-4 w-4 ${getSentimentColor(sentiment)}`} />
                      <span className="text-sm">{sector}</span>
                    </div>
                    <Badge className={getSentimentColor(sentiment).includes('green') ? 'bg-green-100 text-green-800' : 
                                   getSentimentColor(sentiment).includes('red') ? 'bg-red-100 text-red-800' : 
                                   'bg-gray-100 text-gray-800'}>
                      {sentiment > 0 ? '+' : ''}{sentiment}%
                    </Badge>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Market Signals */}
      <Card>
        <CardHeader>
          <CardTitle>AI Market Signals</CardTitle>
          <CardDescription>Advanced algorithmic trading signals powered by machine learning</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {marketSignals.map((signal, index) => (
              <motion.div
                key={signal.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-700 rounded-lg border hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="font-bold text-lg text-gray-900 dark:text-white">
                      {signal.asset}
                    </div>
                    <Badge className={signalColors[signal.signal]}>
                      {signal.signal.toUpperCase()}
                    </Badge>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      ${signal.currentPrice.toFixed(2)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">
                      Strength: {signal.strength}%
                    </div>
                    <div className="text-xs text-gray-500">
                      Confidence: {(signal.confidence * 100).toFixed(0)}%
                    </div>
                  </div>
                </div>
                
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                  {signal.reason}
                </p>
                
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center gap-4">
                    <span>Timeframe: {signal.timeframe}</span>
                    {signal.priceTarget && (
                      <span>Target: ${signal.priceTarget.toFixed(2)}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Brain className="h-3 w-3" />
                    <span>{signal.aiModel}</span>
                    <span>•</span>
                    <span>{formatTimeAgo(signal.timestamp)}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* AI Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            Strategic AI Insights
          </CardTitle>
          <CardDescription>
            Deep market intelligence and strategic opportunities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {aiInsights.map((insight, index) => {
              const typeIcons = {
                opportunity: TrendingUp,
                risk: AlertTriangle,
                trend: Activity,
                economic: Globe
              };
              const IconComponent = typeIcons[insight.type];
              
              return (
                <motion.div
                  key={insight.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 border rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg bg-gradient-to-r ${
                        insight.type === 'opportunity' ? 'from-green-500 to-green-600' :
                        insight.type === 'risk' ? 'from-red-500 to-red-600' :
                        insight.type === 'trend' ? 'from-blue-500 to-blue-600' :
                        'from-purple-500 to-purple-600'
                      } text-white`}>
                        <IconComponent className="h-4 w-4" />
                      </div>
                      <div>
                        <h3 className="font-medium text-lg">{insight.title}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className={impactColors[insight.impact]}>
                            {insight.impact} impact
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {insight.timeframe}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        {(insight.confidence * 100).toFixed(0)}% confidence
                      </div>
                      {insight.actionable && (
                        <Badge variant="outline" className="text-xs mt-1">
                          Actionable
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                    {insight.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex flex-wrap gap-1">
                      {insight.relevantAssets.map((asset, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {asset}
                        </Badge>
                      ))}
                    </div>
                    <Button size="sm" variant="outline">
                      View Details
                    </Button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}