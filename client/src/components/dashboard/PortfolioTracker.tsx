import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { AnimatedCounter } from '@/components/ui/animated-counter';
import { TrendingUp, TrendingDown, DollarSign, PieChart, BarChart3, Target } from 'lucide-react';
import { motion } from 'framer-motion';

interface PortfolioAsset {
  symbol: string;
  name: string;
  shares: number;
  currentPrice: number;
  purchasePrice: number;
  sector: string;
  type: 'stock' | 'etf' | 'bond' | 'crypto';
  lastUpdated: Date;
}

interface PortfolioData {
  totalValue: number;
  totalGainLoss: number;
  totalGainLossPercent: number;
  dayChange: number;
  dayChangePercent: number;
  assets: PortfolioAsset[];
  allocation: Record<string, number>;
}

const sectorColors = {
  'Technology': 'from-blue-500 to-blue-600',
  'Healthcare': 'from-green-500 to-green-600',
  'Finance': 'from-purple-500 to-purple-600',
  'Consumer': 'from-orange-500 to-orange-600',
  'Energy': 'from-red-500 to-red-600',
  'Real Estate': 'from-indigo-500 to-indigo-600',
  'Utilities': 'from-teal-500 to-teal-600',
  'Materials': 'from-gray-500 to-gray-600'
};

export function PortfolioTracker({ userId }: { userId: string }) {
  const [portfolioData, setPortfolioData] = useState<PortfolioData>({
    totalValue: 28750,
    totalGainLoss: 3420,
    totalGainLossPercent: 13.5,
    dayChange: -142,
    dayChangePercent: -0.49,
    assets: [
      {
        symbol: 'AAPL',
        name: 'Apple Inc.',
        shares: 25,
        currentPrice: 185.20,
        purchasePrice: 165.40,
        sector: 'Technology',
        type: 'stock',
        lastUpdated: new Date()
      },
      {
        symbol: 'GOOGL',
        name: 'Alphabet Inc.',
        shares: 12,
        currentPrice: 142.80,
        purchasePrice: 128.90,
        sector: 'Technology',
        type: 'stock',
        lastUpdated: new Date()
      },
      {
        symbol: 'VOO',
        name: 'Vanguard S&P 500 ETF',
        shares: 30,
        currentPrice: 415.60,
        purchasePrice: 385.20,
        sector: 'Diversified',
        type: 'etf',
        lastUpdated: new Date()
      },
      {
        symbol: 'JNJ',
        name: 'Johnson & Johnson',
        shares: 18,
        currentPrice: 162.30,
        purchasePrice: 158.90,
        sector: 'Healthcare',
        type: 'stock',
        lastUpdated: new Date()
      },
      {
        symbol: 'BTC',
        name: 'Bitcoin',
        shares: 0.15,
        currentPrice: 42800,
        purchasePrice: 38500,
        sector: 'Cryptocurrency',
        type: 'crypto',
        lastUpdated: new Date()
      }
    ],
    allocation: {
      'Technology': 45.2,
      'Healthcare': 15.8,
      'Finance': 12.3,
      'Diversified': 18.7,
      'Cryptocurrency': 8.0
    }
  });

  const [selectedTimeframe, setSelectedTimeframe] = useState<'1D' | '1W' | '1M' | '3M' | '1Y'>('1D');

  const calculateAssetValue = (asset: PortfolioAsset) => {
    return asset.shares * asset.currentPrice;
  };

  const calculateAssetGainLoss = (asset: PortfolioAsset) => {
    const currentValue = calculateAssetValue(asset);
    const purchaseValue = asset.shares * asset.purchasePrice;
    return currentValue - purchaseValue;
  };

  const calculateAssetGainLossPercent = (asset: PortfolioAsset) => {
    const gainLoss = calculateAssetGainLoss(asset);
    const purchaseValue = asset.shares * asset.purchasePrice;
    return (gainLoss / purchaseValue) * 100;
  };

  const getAssetTypeIcon = (type: PortfolioAsset['type']) => {
    switch (type) {
      case 'stock': return BarChart3;
      case 'etf': return PieChart;
      case 'bond': return Target;
      case 'crypto': return TrendingUp;
    }
  };

  const topPerformers = portfolioData.assets
    .map(asset => ({
      ...asset,
      gainLossPercent: calculateAssetGainLossPercent(asset)
    }))
    .sort((a, b) => b.gainLossPercent - a.gainLossPercent)
    .slice(0, 3);

  const worstPerformers = portfolioData.assets
    .map(asset => ({
      ...asset,
      gainLossPercent: calculateAssetGainLossPercent(asset)
    }))
    .sort((a, b) => a.gainLossPercent - b.gainLossPercent)
    .slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Portfolio Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-blue-700 dark:text-blue-300 flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Portfolio Value
            </CardTitle>
            <CardDescription className="text-2xl font-bold text-blue-900 dark:text-blue-100">
              <AnimatedCounter value={portfolioData.totalValue} prefix="$" />
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className={`flex items-center text-sm ${
              portfolioData.dayChange >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {portfolioData.dayChange >= 0 ? (
                <TrendingUp className="h-4 w-4 mr-1" />
              ) : (
                <TrendingDown className="h-4 w-4 mr-1" />
              )}
              <span>
                ${Math.abs(portfolioData.dayChange).toFixed(2)} 
                ({portfolioData.dayChangePercent > 0 ? '+' : ''}{portfolioData.dayChangePercent}%) today
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900 dark:to-green-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-green-700 dark:text-green-300 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Total Gain/Loss
            </CardTitle>
            <CardDescription className="text-2xl font-bold text-green-900 dark:text-green-100">
              <AnimatedCounter 
                value={portfolioData.totalGainLoss} 
                prefix={portfolioData.totalGainLoss >= 0 ? '+$' : '-$'} 
              />
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-green-600 dark:text-green-400">
              {portfolioData.totalGainLossPercent > 0 ? '+' : ''}{portfolioData.totalGainLossPercent.toFixed(2)}% return
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900 dark:to-purple-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-purple-700 dark:text-purple-300 flex items-center gap-2">
              <PieChart className="h-4 w-4" />
              Diversification
            </CardTitle>
            <CardDescription className="text-2xl font-bold text-purple-900 dark:text-purple-100">
              {Object.keys(portfolioData.allocation).length} Sectors
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-purple-600 dark:text-purple-400">
              Well balanced
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900 dark:to-orange-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-orange-700 dark:text-orange-300 flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Holdings
            </CardTitle>
            <CardDescription className="text-2xl font-bold text-orange-900 dark:text-orange-100">
              {portfolioData.assets.length}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-orange-600 dark:text-orange-400">
              Assets tracked
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Asset Allocation */}
      <Card>
        <CardHeader>
          <CardTitle>Asset Allocation</CardTitle>
          <CardDescription>Your portfolio distribution by sector</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(portfolioData.allocation).map(([sector, percentage]) => (
              <div key={sector} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{sector}</span>
                  <span>{percentage.toFixed(1)}%</span>
                </div>
                <Progress value={percentage} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Holdings */}
      <Card>
        <CardHeader>
          <CardTitle>Your Holdings</CardTitle>
          <CardDescription>Current positions in your portfolio</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <div className="space-y-3">
              {portfolioData.assets.map((asset, index) => {
                const value = calculateAssetValue(asset);
                const gainLoss = calculateAssetGainLoss(asset);
                const gainLossPercent = calculateAssetGainLossPercent(asset);
                const IconComponent = getAssetTypeIcon(asset.type);
                
                return (
                  <motion.div
                    key={asset.symbol}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-white dark:bg-gray-700 rounded-lg shadow-sm">
                        <IconComponent className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {asset.symbol}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {asset.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {asset.shares} shares × ${asset.currentPrice.toFixed(2)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="font-medium text-gray-900 dark:text-white">
                        ${value.toFixed(2)}
                      </div>
                      <div className={`text-sm flex items-center justify-end gap-1 ${
                        gainLoss >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {gainLoss >= 0 ? (
                          <TrendingUp className="h-3 w-3" />
                        ) : (
                          <TrendingDown className="h-3 w-3" />
                        )}
                        <span>
                          {gainLoss >= 0 ? '+' : ''}${gainLoss.toFixed(2)} 
                          ({gainLossPercent >= 0 ? '+' : ''}{gainLossPercent.toFixed(2)}%)
                        </span>
                      </div>
                      <Badge variant={asset.type === 'crypto' ? 'destructive' : 'outline'} className="text-xs">
                        {asset.type.toUpperCase()}
                      </Badge>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-green-700 dark:text-green-400">Top Performers</CardTitle>
            <CardDescription>Best performing assets in your portfolio</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topPerformers.map((asset, index) => (
                <div key={asset.symbol} className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{asset.symbol}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">{asset.name}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-green-600 font-medium">
                      +{asset.gainLossPercent.toFixed(2)}%
                    </div>
                    <div className="text-sm text-gray-500">
                      +${calculateAssetGainLoss(asset).toFixed(2)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-red-700 dark:text-red-400">Underperformers</CardTitle>
            <CardDescription>Assets that need attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {worstPerformers.map((asset, index) => (
                <div key={asset.symbol} className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{asset.symbol}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">{asset.name}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-red-600 font-medium">
                      {asset.gainLossPercent.toFixed(2)}%
                    </div>
                    <div className="text-sm text-gray-500">
                      ${calculateAssetGainLoss(asset).toFixed(2)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}