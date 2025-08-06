import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Lightbulb, TrendingUp, AlertCircle, Target, DollarSign, Calendar, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface FinancialInsight {
  id: string;
  type: 'opportunity' | 'warning' | 'tip' | 'goal_progress';
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
  category: 'savings' | 'spending' | 'investment' | 'debt' | 'tax';
  actionText?: string;
  potentialSaving?: number;
  confidence: number;
  createdAt: Date;
}

const insightIcons = {
  opportunity: TrendingUp,
  warning: AlertCircle,
  tip: Lightbulb,
  goal_progress: Target
};

const impactColors = {
  low: 'from-gray-500 to-gray-600',
  medium: 'from-blue-500 to-blue-600',
  high: 'from-green-500 to-green-600'
};

const categoryIcons = {
  savings: DollarSign,
  spending: DollarSign,
  investment: TrendingUp,
  debt: AlertCircle,
  tax: Calendar
};

export function RealTimeInsights({ userId }: { userId: string }) {
  const [insights, setInsights] = useState<FinancialInsight[]>([
    {
      id: '1',
      type: 'opportunity',
      title: 'High-Yield Savings Opportunity',
      description: 'Your emergency fund could earn an additional $420/year by switching to a high-yield savings account with 4.2% APY.',
      impact: 'high',
      category: 'savings',
      actionText: 'Compare Rates',
      potentialSaving: 420,
      confidence: 0.95,
      createdAt: new Date(Date.now() - 10 * 60 * 1000)
    },
    {
      id: '2',
      type: 'warning',
      title: 'Subscription Spending Alert',
      description: 'Your monthly subscriptions have increased by 23% ($47) compared to last month. Review unused services.',
      impact: 'medium',
      category: 'spending',
      actionText: 'Review Subscriptions',
      potentialSaving: 564,
      confidence: 0.88,
      createdAt: new Date(Date.now() - 25 * 60 * 1000)
    },
    {
      id: '3',
      type: 'tip',
      title: 'Tax-Loss Harvesting Opportunity',
      description: 'You could offset $1,200 in capital gains by selling underperforming stocks in your taxable account.',
      impact: 'high',
      category: 'tax',
      actionText: 'Analyze Holdings',
      potentialSaving: 288,
      confidence: 0.82,
      createdAt: new Date(Date.now() - 45 * 60 * 1000)
    },
    {
      id: '4',
      type: 'goal_progress',
      title: 'Emergency Fund Milestone',
      description: 'Congratulations! You\'re now 74% of the way to your 6-month emergency fund goal. Only $6,500 to go!',
      impact: 'medium',
      category: 'savings',
      actionText: 'View Progress',
      confidence: 1.0,
      createdAt: new Date(Date.now() - 60 * 60 * 1000)
    },
    {
      id: '5',
      type: 'opportunity',
      title: 'Credit Card Cashback Optimization',
      description: 'Switch to using your 2% cashback card for gas purchases to earn an extra $156/year based on your spending patterns.',
      impact: 'low',
      category: 'spending',
      actionText: 'Optimize Cards',
      potentialSaving: 156,
      confidence: 0.91,
      createdAt: new Date(Date.now() - 90 * 60 * 1000)
    },
    {
      id: '6',
      type: 'warning',
      title: 'Investment Rebalancing Needed',
      description: 'Your portfolio has drifted from your target allocation. Your tech stocks now represent 52% vs target 40%.',
      impact: 'medium',
      category: 'investment',
      actionText: 'Rebalance',
      confidence: 0.94,
      createdAt: new Date(Date.now() - 120 * 60 * 1000)
    }
  ]);

  const [filter, setFilter] = useState<'all' | FinancialInsight['type']>('all');
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);

  const filteredInsights = filter === 'all' 
    ? insights 
    : insights.filter(insight => insight.type === filter);

  const highImpactInsights = insights.filter(i => i.impact === 'high').length;
  const totalPotentialSavings = insights
    .filter(i => i.potentialSaving)
    .reduce((sum, i) => sum + (i.potentialSaving || 0), 0);

  const generateNewInsights = async () => {
    setIsGeneratingInsights(true);
    
    // Simulate AI-powered insight generation
    setTimeout(() => {
      const newInsight: FinancialInsight = {
        id: Date.now().toString(),
        type: 'tip',
        title: 'New Savings Opportunity Detected',
        description: 'Based on your recent spending patterns, you could save $85/month by meal planning and reducing food delivery orders.',
        impact: 'medium',
        category: 'spending',
        actionText: 'Create Plan',
        potentialSaving: 1020,
        confidence: 0.87,
        createdAt: new Date()
      };
      
      setInsights(prev => [newInsight, ...prev]);
      setIsGeneratingInsights(false);
    }, 2000);
  };

  const dismissInsight = (id: string) => {
    setInsights(prev => prev.filter(insight => insight.id !== id));
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
      {/* Insights Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-blue-700 dark:text-blue-300">Active Insights</CardTitle>
            <CardDescription className="text-2xl font-bold text-blue-900 dark:text-blue-100">
              {insights.length}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-blue-600 dark:text-blue-400">
              {highImpactInsights} high-impact opportunities
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900 dark:to-green-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-green-700 dark:text-green-300">Potential Savings</CardTitle>
            <CardDescription className="text-2xl font-bold text-green-900 dark:text-green-100">
              ${totalPotentialSavings.toLocaleString()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-green-600 dark:text-green-400">
              Annual opportunity
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900 dark:to-purple-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-purple-700 dark:text-purple-300">AI Confidence</CardTitle>
            <CardDescription className="text-2xl font-bold text-purple-900 dark:text-purple-100">
              {Math.round(insights.reduce((sum, i) => sum + i.confidence, 0) / insights.length * 100)}%
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-purple-600 dark:text-purple-400">
              Average accuracy
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Filter:</span>
          <div className="flex gap-2">
            {(['all', 'opportunity', 'warning', 'tip', 'goal_progress'] as const).map((filterType) => (
              <Button
                key={filterType}
                variant={filter === filterType ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter(filterType)}
                className="capitalize"
              >
                {filterType === 'all' ? 'All' : filterType.replace('_', ' ')}
              </Button>
            ))}
          </div>
        </div>

        <Button 
          onClick={generateNewInsights}
          disabled={isGeneratingInsights}
          className="gap-2"
        >
          <Lightbulb className="h-4 w-4" />
          {isGeneratingInsights ? 'Analyzing...' : 'Generate New Insights'}
        </Button>
      </div>

      {/* Insights List */}
      <div className="space-y-4">
        <AnimatePresence>
          {filteredInsights.map((insight, index) => {
            const IconComponent = insightIcons[insight.type];
            const CategoryIcon = categoryIcons[insight.category];
            
            return (
              <motion.div
                key={insight.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-blue-500">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg bg-gradient-to-r ${impactColors[insight.impact]} text-white`}>
                          <IconComponent className="h-5 w-5" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{insight.title}</CardTitle>
                          <CardDescription className="flex items-center gap-2 mt-1">
                            <CategoryIcon className="h-3 w-3" />
                            <span className="capitalize">{insight.category}</span>
                            <span>•</span>
                            <span>{formatTimeAgo(insight.createdAt)}</span>
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={insight.impact === 'high' ? 'default' : 'outline'}
                          className="capitalize"
                        >
                          {insight.impact} impact
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => dismissInsight(insight.id)}
                          className="h-6 w-6 p-0"
                        >
                          ×
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <p className="text-gray-700 dark:text-gray-300 mb-4">
                      {insight.description}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        {insight.potentialSaving && (
                          <div className="text-sm">
                            <span className="text-gray-600 dark:text-gray-400">Potential saving: </span>
                            <span className="font-semibold text-green-600">
                              ${insight.potentialSaving.toLocaleString()}/year
                            </span>
                          </div>
                        )}
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {Math.round(insight.confidence * 100)}% confidence
                        </div>
                      </div>
                      
                      {insight.actionText && (
                        <Button size="sm" className="gap-2">
                          {insight.actionText}
                          <ArrowRight className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {filteredInsights.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Lightbulb className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="font-semibold mb-2">No insights available</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Try generating new insights or changing your filter.
            </p>
            <Button onClick={generateNewInsights} disabled={isGeneratingInsights}>
              Generate Insights
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}