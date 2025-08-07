import React, { useState, useEffect } from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, TrendingUp, AlertCircle, Info, Zap, Target } from 'lucide-react';

interface FinancialInsight {
  id: string;
  category: 'tip' | 'warning' | 'trend' | 'fact' | 'strategy' | 'goal';
  title: string;
  content: string;
  emoji: string;
  learnMore?: string;
  context: string[];  // When to show this insight
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  impact: 'low' | 'medium' | 'high';
}

interface ContextualTooltipProps {
  context: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
  userLevel?: 'beginner' | 'intermediate' | 'advanced';
  playful?: boolean;
}

// Comprehensive financial insights database
const FINANCIAL_INSIGHTS: FinancialInsight[] = [
  // Budget & Spending
  {
    id: 'budget_50_30_20',
    category: 'tip',
    title: 'The 50/30/20 Rule',
    content: 'Spend 50% on needs, 30% on wants, and save 20%. It\'s like a balanced diet, but for your wallet!',
    emoji: '💰',
    context: ['budget', 'spending', 'savings'],
    difficulty: 'beginner',
    impact: 'high',
    learnMore: 'This budgeting method helps maintain financial balance by ensuring you cover essentials while still enjoying life and building wealth.'
  },
  {
    id: 'latte_factor',
    category: 'strategy',
    title: 'The Latte Factor',
    content: 'That daily $5 coffee? It\'s $1,825 per year! Small expenses add up to big money over time.',
    emoji: '☕',
    context: ['spending', 'budget', 'savings'],
    difficulty: 'beginner',
    impact: 'medium',
    learnMore: 'David Bach\'s concept shows how small, regular expenses compound over time. Investing that $5 daily could grow to over $50,000 in 20 years!'
  },
  {
    id: 'emergency_fund',
    category: 'warning',
    title: 'Emergency Fund Priority',
    content: 'Life happens! 3-6 months of expenses saved can turn a crisis into just an inconvenience.',
    emoji: '🚨',
    context: ['savings', 'emergency', 'goals'],
    difficulty: 'beginner',
    impact: 'high',
    learnMore: 'An emergency fund prevents you from going into debt when unexpected expenses arise. Start with $1,000 and build from there.'
  },

  // Investing
  {
    id: 'compound_magic',
    category: 'fact',
    title: 'Compound Interest Magic',
    content: 'Einstein called it the 8th wonder of the world. Start investing early - time is your biggest asset!',
    emoji: '🪄',
    context: ['investing', 'retirement', 'goals'],
    difficulty: 'beginner',
    impact: 'high',
    learnMore: 'Someone who starts investing $200/month at 25 will have more at 65 than someone who starts with $400/month at 35.'
  },
  {
    id: 'index_funds',
    category: 'strategy',
    title: 'Index Fund Power',
    content: 'Why pick stocks when you can own them all? Index funds offer instant diversification at low cost.',
    emoji: '📊',
    context: ['investing', 'portfolio', 'strategy'],
    difficulty: 'intermediate',
    impact: 'high',
    learnMore: 'Index funds track entire markets, offering built-in diversification and typically outperform 90% of actively managed funds over time.'
  },
  {
    id: 'dollar_cost_averaging',
    category: 'strategy',
    title: 'Dollar-Cost Averaging',
    content: 'Invest the same amount regularly, regardless of price. It smooths out market volatility like butter on toast!',
    emoji: '📈',
    context: ['investing', 'strategy', 'risk'],
    difficulty: 'intermediate',
    impact: 'medium',
    learnMore: 'This strategy reduces the impact of volatility by buying more shares when prices are low and fewer when prices are high.'
  },

  // Debt & Credit
  {
    id: 'credit_score_impact',
    category: 'warning',
    title: 'Credit Score Impact',
    content: 'Your credit score affects everything from loan rates to apartment applications. Guard it like treasure!',
    emoji: '💳',
    context: ['credit', 'debt', 'loans'],
    difficulty: 'beginner',
    impact: 'high',
    learnMore: 'A good credit score (720+) can save you tens of thousands in interest over your lifetime on mortgages and loans.'
  },
  {
    id: 'debt_avalanche',
    category: 'strategy',
    title: 'Debt Avalanche Method',
    content: 'Pay minimums on all debts, then attack the highest interest rate first. Math wins over emotions!',
    emoji: '⛷️',
    context: ['debt', 'strategy', 'payoff'],
    difficulty: 'intermediate',
    impact: 'high',
    learnMore: 'This method saves the most money in interest payments, though the debt snowball (smallest balance first) might feel more motivating.'
  },

  // Retirement
  {
    id: 'employer_match',
    category: 'tip',
    title: 'Free Money Alert!',
    content: 'Not contributing enough for your full employer 401k match? You\'re literally leaving money on the table!',
    emoji: '🎁',
    context: ['retirement', '401k', 'employer'],
    difficulty: 'beginner',
    impact: 'high',
    learnMore: 'Employer matching is an instant 100% return on your investment. Always contribute at least enough to get the full match.'
  },
  {
    id: 'roth_vs_traditional',
    category: 'strategy',
    title: 'Roth vs Traditional IRA',
    content: 'Pay taxes now (Roth) or later (Traditional)? If you think you\'ll be in a higher tax bracket later, choose Roth!',
    emoji: '🤔',
    context: ['retirement', 'ira', 'taxes'],
    difficulty: 'intermediate',
    impact: 'medium',
    learnMore: 'Roth IRAs grow tax-free and have no required distributions, making them powerful for long-term wealth building.'
  },

  // General Financial Wisdom
  {
    id: 'inflation_impact',
    category: 'fact',
    title: 'Inflation\'s Silent Tax',
    content: 'Money sitting in low-interest savings loses buying power over time. Inflation is like a slow leak in your financial tire.',
    emoji: '📉',
    context: ['inflation', 'savings', 'investing'],
    difficulty: 'intermediate',
    impact: 'medium',
    learnMore: 'With 3% annual inflation, $100 today will only buy $74 worth of goods in 10 years if not invested.'
  },
  {
    id: 'diversification',
    category: 'strategy',
    title: 'Don\'t Put All Eggs in One Basket',
    content: 'Diversification is the only free lunch in investing. Spread risk across different assets and sectors.',
    emoji: '🥚',
    context: ['investing', 'risk', 'portfolio'],
    difficulty: 'intermediate',
    impact: 'high',
    learnMore: 'Proper diversification can reduce risk without sacrificing returns. Consider stocks, bonds, real estate, and international markets.'
  },
  {
    id: 'tax_advantaged_accounts',
    category: 'tip',
    title: 'Tax-Advantaged Accounts',
    content: 'HSAs are triple tax-advantaged! Deductible contributions, tax-free growth, and tax-free withdrawals for medical expenses.',
    emoji: '🏥',
    context: ['taxes', 'hsa', 'savings'],
    difficulty: 'advanced',
    impact: 'medium',
    learnMore: 'After age 65, HSA withdrawals for any purpose are taxed like a traditional IRA, making it a powerful retirement tool.'
  },

  // Behavioral Finance
  {
    id: 'lifestyle_inflation',
    category: 'warning',
    title: 'Lifestyle Inflation Trap',
    content: 'Got a raise? Before upgrading your lifestyle, upgrade your savings rate first. Future you will thank you!',
    emoji: '🎈',
    context: ['spending', 'raises', 'lifestyle'],
    difficulty: 'intermediate',
    impact: 'high',
    learnMore: 'Save at least 50% of any raise or windfall. This prevents lifestyle inflation while still allowing you to enjoy increased income.'
  },
  {
    id: 'emotional_spending',
    category: 'tip',
    title: 'Emotional Spending Check',
    content: 'Before big purchases, sleep on it! The 24-hour rule can save you from impulse buys you\'ll regret.',
    emoji: '😴',
    context: ['spending', 'psychology', 'impulse'],
    difficulty: 'beginner',
    impact: 'medium',
    learnMore: 'Emotional spending often leads to buyer\'s remorse. Create a wish list and revisit items after waiting periods.'
  },

  // Advanced Strategies
  {
    id: 'asset_allocation',
    category: 'strategy',
    title: 'Age-Based Asset Allocation',
    content: 'A simple rule: 120 minus your age = percentage in stocks. So if you\'re 30, consider 90% stocks, 10% bonds.',
    emoji: '⚖️',
    context: ['investing', 'portfolio', 'age'],
    difficulty: 'intermediate',
    impact: 'high',
    learnMore: 'This rule adjusts for risk tolerance over time. Younger investors can handle more volatility for higher long-term returns.'
  },
  {
    id: 'rebalancing',
    category: 'strategy',
    title: 'Portfolio Rebalancing',
    content: 'Rebalance your portfolio annually. It forces you to sell high and buy low - the investing holy grail!',
    emoji: '⚡',
    context: ['investing', 'portfolio', 'maintenance'],
    difficulty: 'advanced',
    impact: 'medium',
    learnMore: 'Rebalancing maintains your desired risk level and can add 0.5-1% annual returns through systematic buying low and selling high.'
  }
];

const getCategoryIcon = (category: FinancialInsight['category']) => {
  switch (category) {
    case 'tip': return <Lightbulb className="w-4 h-4 text-yellow-500" />;
    case 'strategy': return <Target className="w-4 h-4 text-blue-500" />;
    case 'warning': return <AlertCircle className="w-4 h-4 text-red-500" />;
    case 'fact': return <Info className="w-4 h-4 text-purple-500" />;
    case 'trend': return <TrendingUp className="w-4 h-4 text-green-500" />;
    case 'goal': return <Zap className="w-4 h-4 text-orange-500" />;
    default: return <Info className="w-4 h-4 text-gray-500" />;
  }
};

const getRandomInsight = (
  context: string, 
  userLevel: 'beginner' | 'intermediate' | 'advanced' = 'beginner',
  viewedInsights: Set<string>
): FinancialInsight | null => {
  const relevantInsights = FINANCIAL_INSIGHTS.filter(insight => 
    insight.context.includes(context.toLowerCase()) &&
    (insight.difficulty === userLevel || insight.difficulty === 'beginner') &&
    !viewedInsights.has(insight.id)
  );

  if (relevantInsights.length === 0) return null;
  
  // Prioritize high-impact insights
  const highImpact = relevantInsights.filter(i => i.impact === 'high');
  const insights = highImpact.length > 0 ? highImpact : relevantInsights;
  
  return insights[Math.floor(Math.random() * insights.length)];
};

export function ContextualTooltip({ 
  context, 
  children, 
  position = 'top', 
  className = '',
  userLevel = 'beginner',
  playful = true 
}: ContextualTooltipProps) {
  const [insight, setInsight] = useState<FinancialInsight | null>(null);
  const [viewedInsights, setViewedInsights] = useState<Set<string>>(new Set());
  const [showExtended, setShowExtended] = useState(false);

  useEffect(() => {
    const selectedInsight = getRandomInsight(context, userLevel, viewedInsights);
    if (selectedInsight) {
      setInsight(selectedInsight);
    }
  }, [context, userLevel, viewedInsights]);

  const handleInsightViewed = (insightId: string) => {
    setViewedInsights(prev => new Set([...prev, insightId]));
    
    // Store in localStorage to persist across sessions
    const stored = localStorage.getItem('financialInsightsSeen') || '[]';
    const seen = new Set(JSON.parse(stored));
    seen.add(insightId);
    localStorage.setItem('financialInsightsSeen', JSON.stringify([...seen]));
  };

  // Load viewed insights from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('financialInsightsSeen');
    if (stored) {
      setViewedInsights(new Set(JSON.parse(stored)));
    }
  }, []);

  if (!insight) {
    return <>{children}</>;
  }

  const TooltipContentComponent = () => (
    <TooltipContent 
      side={position as any}
      className="max-w-80 p-4 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 border-2 border-blue-200 dark:border-blue-800"
      onPointerEnter={() => handleInsightViewed(insight.id)}
    >
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {getCategoryIcon(insight.category)}
            <Badge 
              variant="secondary" 
              className="text-xs font-medium"
            >
              {insight.category}
            </Badge>
          </div>
          <span className="text-xl">{insight.emoji}</span>
        </div>
        
        <div>
          <h4 className="font-semibold text-sm text-gray-900 dark:text-gray-100 mb-1">
            {insight.title}
          </h4>
          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
            {insight.content}
          </p>
        </div>

        {insight.learnMore && (
          <div className="space-y-2">
            <button
              onClick={() => setShowExtended(!showExtended)}
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center space-x-1"
            >
              <Info className="w-3 h-3" />
              <span>{showExtended ? 'Show less' : 'Learn more'}</span>
            </button>
            
            {showExtended && (
              <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-blue-200 dark:border-blue-700">
                <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                  {insight.learnMore}
                </p>
              </div>
            )}
          </div>
        )}

        <div className="flex justify-between items-center pt-2 border-t border-blue-200 dark:border-blue-700">
          <div className="flex items-center space-x-2">
            <Badge 
              variant={insight.impact === 'high' ? 'default' : 'secondary'} 
              className="text-xs"
            >
              {insight.impact} impact
            </Badge>
            <Badge variant="outline" className="text-xs">
              {insight.difficulty}
            </Badge>
          </div>
          
          {playful && (
            <div className="text-xs text-gray-500 dark:text-gray-400">
              💡 Financial Tip
            </div>
          )}
        </div>
      </div>
    </TooltipContent>
  );

  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild className={className}>
          <div className="relative">
            {children}
            {playful && (
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full animate-pulse" />
            )}
          </div>
        </TooltipTrigger>
        <TooltipContentComponent />
      </Tooltip>
    </TooltipProvider>
  );
}

// Hook for programmatic insights
export function useFinancialInsights() {
  const [viewedInsights, setViewedInsights] = useState<Set<string>>(new Set());

  useEffect(() => {
    const stored = localStorage.getItem('financialInsightsSeen');
    if (stored) {
      setViewedInsights(new Set(JSON.parse(stored)));
    }
  }, []);

  const getInsight = (
    context: string, 
    userLevel: 'beginner' | 'intermediate' | 'advanced' = 'beginner'
  ) => {
    return getRandomInsight(context, userLevel, viewedInsights);
  };

  const markInsightViewed = (insightId: string) => {
    const newViewed = new Set([...viewedInsights, insightId]);
    setViewedInsights(newViewed);
    localStorage.setItem('financialInsightsSeen', JSON.stringify([...newViewed]));
  };

  const getInsightStats = () => {
    return {
      totalInsights: FINANCIAL_INSIGHTS.length,
      viewedCount: viewedInsights.size,
      remainingCount: FINANCIAL_INSIGHTS.length - viewedInsights.size,
      completionPercentage: Math.round((viewedInsights.size / FINANCIAL_INSIGHTS.length) * 100)
    };
  };

  return {
    getInsight,
    markInsightViewed,
    getInsightStats,
    viewedInsights: [...viewedInsights]
  };
}

// Component for displaying insight progress
export function InsightProgress() {
  const { getInsightStats } = useFinancialInsights();
  const stats = getInsightStats();

  return (
    <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 rounded-lg border border-blue-200 dark:border-blue-800">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-sm flex items-center space-x-2">
          <Lightbulb className="w-4 h-4 text-yellow-500" />
          <span>Financial Learning Progress</span>
        </h3>
        <Badge variant="secondary" className="text-xs">
          {stats.completionPercentage}% Complete
        </Badge>
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
          <span>Insights Discovered: {stats.viewedCount}/{stats.totalInsights}</span>
          <span>{stats.remainingCount} remaining</span>
        </div>
        
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${stats.completionPercentage}%` }}
          />
        </div>
      </div>
    </div>
  );
}