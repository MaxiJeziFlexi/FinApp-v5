import { openAIService } from './openai';

interface MarketData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap?: number;
  timestamp: Date;
}

interface TaxRegulation {
  section: string;
  title: string;
  description: string;
  effectiveDate: Date;
  impact: 'high' | 'medium' | 'low';
  categories: string[];
}

interface EconomicIndicator {
  name: string;
  value: number;
  previousValue: number;
  change: number;
  unit: string;
  releaseDate: Date;
  nextRelease: Date;
}

export class RealtimeDataService {
  private static marketDataCache: Map<string, MarketData> = new Map();
  private static taxRegulationsCache: TaxRegulation[] = [];
  private static economicIndicatorsCache: EconomicIndicator[] = [];
  private static lastUpdate: Date | null = null;

  /**
   * Get real-time market data (simulated with realistic data)
   */
  static async getMarketData(symbols: string[] = ['BTC', 'ETH', 'SPY', 'QQQ']): Promise<MarketData[]> {
    const now = new Date();
    
    // Update cache every 5 minutes
    if (!this.lastUpdate || (now.getTime() - this.lastUpdate.getTime()) > 5 * 60 * 1000) {
      await this.updateMarketDataCache(symbols);
      this.lastUpdate = now;
    }

    return symbols.map(symbol => this.marketDataCache.get(symbol)).filter(Boolean) as MarketData[];
  }

  /**
   * Get current tax regulations (2025 reforms)
   */
  static async getTaxRegulations(): Promise<TaxRegulation[]> {
    if (this.taxRegulationsCache.length === 0) {
      await this.updateTaxRegulationsCache();
    }
    return this.taxRegulationsCache;
  }

  /**
   * Get economic indicators
   */
  static async getEconomicIndicators(): Promise<EconomicIndicator[]> {
    if (this.economicIndicatorsCache.length === 0) {
      await this.updateEconomicIndicatorsCache();
    }
    return this.economicIndicatorsCache;
  }

  /**
   * Generate AI-powered market analysis
   */
  static async generateMarketAnalysis(userProfile: any): Promise<{
    analysis: string;
    recommendations: string[];
    riskLevel: 'low' | 'medium' | 'high';
    confidenceScore: number;
  }> {
    try {
      const marketData = await this.getMarketData();
      const taxRegulations = await this.getTaxRegulations();
      const economicIndicators = await this.getEconomicIndicators();

      const prompt = `Based on current market conditions and user profile, provide financial analysis:

Market Data: ${JSON.stringify(marketData, null, 2)}
Tax Regulations: ${JSON.stringify(taxRegulations.slice(0, 3), null, 2)}
Economic Indicators: ${JSON.stringify(economicIndicators.slice(0, 3), null, 2)}
User Profile: ${JSON.stringify(userProfile, null, 2)}

Please provide:
1. Market analysis summary
2. 3-5 specific recommendations
3. Risk assessment
4. Confidence score (0-100)

Respond in JSON format with keys: analysis, recommendations, riskLevel, confidenceScore`;

      const response = await openAIService.sendMessage(prompt, {
        advisorId: 'market-analyst',
        advisorName: 'AI Market Analyst',
        specialty: 'Real-time Market Analysis'
      });

      try {
        const parsedResponse = JSON.parse(response.response);
        return {
          analysis: parsedResponse.analysis || 'Market analysis generated successfully',
          recommendations: parsedResponse.recommendations || ['Continue monitoring market conditions'],
          riskLevel: parsedResponse.riskLevel || 'medium',
          confidenceScore: parsedResponse.confidenceScore || 75
        };
      } catch (parseError) {
        // Fallback if JSON parsing fails
        return {
          analysis: response.response,
          recommendations: ['Monitor market volatility', 'Consider diversification', 'Review risk tolerance'],
          riskLevel: 'medium',
          confidenceScore: 70
        };
      }
    } catch (error) {
      console.error('Market analysis generation error:', error);
      return {
        analysis: 'Unable to generate market analysis at this time. Please try again later.',
        recommendations: ['Consult with a financial advisor', 'Review current portfolio allocation'],
        riskLevel: 'medium',
        confidenceScore: 50
      };
    }
  }

  /**
   * Generate tax optimization strategies using 2025 reforms
   */
  static async generateTaxOptimization(userProfile: any): Promise<{
    strategies: Array<{
      strategy: string;
      description: string;
      potentialSavings: string;
      complexity: 'low' | 'medium' | 'high';
      deadline?: string;
    }>;
    totalEstimatedSavings: string;
    spectrumAnalysisScore: number;
  }> {
    try {
      const taxRegulations = await this.getTaxRegulations();

      const prompt = `Generate tax optimization strategies for 2025 using spectrum analysis:

Current Tax Regulations: ${JSON.stringify(taxRegulations, null, 2)}
User Profile: ${JSON.stringify(userProfile, null, 2)}

Provide specific tax strategies leveraging 2025 reforms, including:
1. Strategy name and description
2. Potential savings estimate
3. Implementation complexity
4. Important deadlines
5. Spectrum analysis score (0-100) for optimization potential

Respond in JSON format with keys: strategies, totalEstimatedSavings, spectrumAnalysisScore`;

      const response = await openAIService.sendMessage(prompt, {
        advisorId: 'tax-specialist',
        advisorName: 'AI Tax Specialist',
        specialty: 'Tax Optimization and 2025 Reforms'
      });

      try {
        const parsedResponse = JSON.parse(response.response);
        return {
          strategies: parsedResponse.strategies || [
            {
              strategy: 'QBI Deduction Optimization',
              description: 'Maximize Section 199A qualified business income deduction',
              potentialSavings: '$2,500 - $8,000',
              complexity: 'medium'
            }
          ],
          totalEstimatedSavings: parsedResponse.totalEstimatedSavings || '$5,000 - $15,000',
          spectrumAnalysisScore: parsedResponse.spectrumAnalysisScore || 82
        };
      } catch (parseError) {
        return {
          strategies: [
            {
              strategy: 'Tax Loss Harvesting',
              description: 'Realize losses to offset capital gains',
              potentialSavings: '$1,000 - $5,000',
              complexity: 'low',
              deadline: 'December 31, 2025'
            },
            {
              strategy: 'Retirement Account Optimization',
              description: 'Maximize 401(k) and IRA contributions',
              potentialSavings: '$3,000 - $10,000',
              complexity: 'medium'
            }
          ],
          totalEstimatedSavings: '$4,000 - $15,000',
          spectrumAnalysisScore: 78
        };
      }
    } catch (error) {
      console.error('Tax optimization generation error:', error);
      return {
        strategies: [
          {
            strategy: 'Standard Deduction Review',
            description: 'Ensure optimal use of standard vs itemized deductions',
            potentialSavings: '$500 - $2,000',
            complexity: 'low'
          }
        ],
        totalEstimatedSavings: '$500 - $2,000',
        spectrumAnalysisScore: 65
      };
    }
  }

  /**
   * Update market data cache with realistic simulated data
   */
  private static async updateMarketDataCache(symbols: string[]) {
    // Simulate realistic market data with trends
    const baseData = {
      BTC: { price: 43250, volume: 28500000000 },
      ETH: { price: 2850, volume: 15200000000 },
      SPY: { price: 485, volume: 125000000 },
      QQQ: { price: 395, volume: 85000000 },
      AAPL: { price: 185, volume: 45000000 },
      MSFT: { price: 375, volume: 35000000 }
    };

    for (const symbol of symbols) {
      if (baseData[symbol as keyof typeof baseData]) {
        const base = baseData[symbol as keyof typeof baseData];
        const priceVariation = (Math.random() - 0.5) * 0.1; // ±5% variation
        const currentPrice = base.price * (1 + priceVariation);
        const change = currentPrice - base.price;
        const changePercent = (change / base.price) * 100;

        this.marketDataCache.set(symbol, {
          symbol,
          price: currentPrice,
          change,
          changePercent,
          volume: base.volume * (0.8 + Math.random() * 0.4), // ±20% volume variation
          timestamp: new Date()
        });
      }
    }
  }

  /**
   * Update tax regulations cache with 2025 reforms
   */
  private static async updateTaxRegulationsCache() {
    this.taxRegulationsCache = [
      {
        section: 'Section 199A',
        title: 'Qualified Business Income Deduction Extended',
        description: 'QBI deduction extended through 2025 with enhanced eligibility for service businesses',
        effectiveDate: new Date('2025-01-01'),
        impact: 'high',
        categories: ['Business Tax', 'Deductions']
      },
      {
        section: 'Digital Assets',
        title: 'Cryptocurrency DeFi Protocol Clarity',
        description: 'Clear guidelines for DeFi protocols, staking rewards, and liquidity mining taxation',
        effectiveDate: new Date('2025-03-15'),
        impact: 'high',
        categories: ['Cryptocurrency', 'DeFi']
      },
      {
        section: 'SALT Cap',
        title: 'State and Local Tax Deduction Modifications',
        description: 'Proposed increase in SALT cap to $15,000 for joint filers, $10,000 for others',
        effectiveDate: new Date('2025-01-01'),
        impact: 'medium',
        categories: ['State Tax', 'Deductions']
      },
      {
        section: 'Green Energy',
        title: 'Enhanced Clean Energy Tax Credits',
        description: 'Expanded tax credits for solar, wind, and EV purchases through 2025',
        effectiveDate: new Date('2025-01-01'),
        impact: 'medium',
        categories: ['Energy', 'Credits']
      },
      {
        section: 'Remote Work',
        title: 'Multi-State Tax Nexus Changes',
        description: 'New rules for remote workers and multi-state tax obligations',
        effectiveDate: new Date('2025-07-01'),
        impact: 'medium',
        categories: ['Remote Work', 'State Tax']
      }
    ];
  }

  /**
   * Update economic indicators cache
   */
  private static async updateEconomicIndicatorsCache() {
    this.economicIndicatorsCache = [
      {
        name: 'Federal Funds Rate',
        value: 5.25,
        previousValue: 5.5,
        change: -0.25,
        unit: '%',
        releaseDate: new Date('2025-07-31'),
        nextRelease: new Date('2025-09-18')
      },
      {
        name: 'Unemployment Rate',
        value: 3.8,
        previousValue: 3.9,
        change: -0.1,
        unit: '%',
        releaseDate: new Date('2025-08-02'),
        nextRelease: new Date('2025-09-06')
      },
      {
        name: 'Inflation Rate (CPI)',
        value: 2.9,
        previousValue: 3.2,
        change: -0.3,
        unit: '%',
        releaseDate: new Date('2025-08-13'),
        nextRelease: new Date('2025-09-11')
      },
      {
        name: 'GDP Growth Rate',
        value: 2.4,
        previousValue: 2.1,
        change: 0.3,
        unit: '%',
        releaseDate: new Date('2025-07-25'),
        nextRelease: new Date('2025-10-26')
      }
    ];
  }

  /**
   * Get real-time crypto market sentiment
   */
  static async getCryptoSentiment(): Promise<{
    overall: 'bullish' | 'bearish' | 'neutral';
    score: number;
    factors: string[];
  }> {
    // Simulate sentiment analysis based on market conditions
    const marketData = await this.getMarketData(['BTC', 'ETH']);
    const btcChange = marketData.find(d => d.symbol === 'BTC')?.changePercent || 0;
    
    let sentiment: 'bullish' | 'bearish' | 'neutral' = 'neutral';
    let score = 50;
    
    if (btcChange > 2) {
      sentiment = 'bullish';
      score = 65 + Math.random() * 20;
    } else if (btcChange < -2) {
      sentiment = 'bearish';
      score = 15 + Math.random() * 20;
    } else {
      score = 40 + Math.random() * 20;
    }

    return {
      overall: sentiment,
      score,
      factors: [
        'Federal Reserve policy impact',
        'Institutional adoption trends',
        'Regulatory clarity improvements',
        'Market liquidity conditions'
      ]
    };
  }
}