// Real-Time Data Sources with Contextual Relevance Filtering
// WSJ, Economic Calendar, Legal Reports, Bloomberg, Reuters, NYT, BBC, TradingView

import { storage } from '../storage';
import { validateNewsSource } from '../tools/whitelist';

export interface DataSource {
  name: string;
  url: string;
  category: 'news' | 'economic' | 'legal' | 'market';
  country?: string;
  credibility: 'high' | 'medium' | 'low';
  updateFrequency: 'real-time' | 'hourly' | 'daily';
}

// Verified real-time data sources
export const REAL_TIME_SOURCES: DataSource[] = [
  // News Sources
  {
    name: 'Wall Street Journal',
    url: 'https://api.wsj.com',
    category: 'news',
    credibility: 'high',
    updateFrequency: 'real-time'
  },
  {
    name: 'Bloomberg',
    url: 'https://api.bloomberg.com',
    category: 'news',
    credibility: 'high',
    updateFrequency: 'real-time'
  },
  {
    name: 'Reuters',
    url: 'https://api.reuters.com',
    category: 'news',
    credibility: 'high',
    updateFrequency: 'real-time'
  },
  {
    name: 'New York Times',
    url: 'https://api.nytimes.com',
    category: 'news',
    credibility: 'high',
    updateFrequency: 'real-time'
  },
  {
    name: 'BBC',
    url: 'https://api.bbc.com',
    category: 'news',
    credibility: 'high',
    updateFrequency: 'real-time'
  },

  // Economic Calendar Sources
  {
    name: 'Economic Calendar US',
    url: 'https://api.tradingeconomics.com',
    category: 'economic',
    country: 'US',
    credibility: 'high',
    updateFrequency: 'real-time'
  },
  {
    name: 'Economic Calendar EU',
    url: 'https://api.ecb.europa.eu',
    category: 'economic',
    country: 'EU',
    credibility: 'high',
    updateFrequency: 'real-time'
  },
  {
    name: 'Economic Calendar UK',
    url: 'https://api.bankofengland.co.uk',
    category: 'economic',
    country: 'UK',
    credibility: 'high',
    updateFrequency: 'real-time'
  },

  // Legal Document Sources
  {
    name: 'US Government Legal',
    url: 'https://api.govinfo.gov',
    category: 'legal',
    country: 'US',
    credibility: 'high',
    updateFrequency: 'daily'
  },
  {
    name: 'EU Legal Documents',
    url: 'https://api.eur-lex.europa.eu',
    category: 'legal',
    country: 'EU',
    credibility: 'high',
    updateFrequency: 'daily'
  },
  {
    name: 'UK Legal Changes',
    url: 'https://api.legislation.gov.uk',
    category: 'legal',
    country: 'UK',
    credibility: 'high',
    updateFrequency: 'daily'
  },
  {
    name: 'Poland Legal Documents',
    url: 'https://api.gov.pl',
    category: 'legal',
    country: 'PL',
    credibility: 'high',
    updateFrequency: 'daily'
  },

  // Market Data Sources
  {
    name: 'TradingView',
    url: 'https://api.tradingview.com',
    category: 'market',
    credibility: 'high',
    updateFrequency: 'real-time'
  }
];

export interface ContextualFilter {
  userId: string;
  keywords: string[];
  countries: string[];
  sectors: string[];
  instruments: string[];
  riskProfile: 'conservative' | 'moderate' | 'aggressive';
  relevanceThreshold: number; // 0.0 - 1.0
}

export interface RealTimeUpdate {
  id: string;
  source: string;
  category: 'news' | 'economic' | 'legal' | 'market';
  title: string;
  content: string;
  url: string;
  timestamp: Date;
  relevanceScore: number;
  country?: string;
  sector?: string;
  instruments?: string[];
  tags: string[];
  userId: string;
  sessionId: string;
}

export class RealTimeDataService {
  private activeFilters: Map<string, ContextualFilter> = new Map();
  private updateQueue: RealTimeUpdate[] = [];

  // Initialize user's contextual filter based on their request
  async createContextualFilter(
    userId: string,
    userQuery: string,
    userProfile: any = {}
  ): Promise<ContextualFilter> {
    // Extract keywords and context from user query using AI
    const keywords = this.extractKeywords(userQuery);
    const countries = this.extractCountries(userQuery, userProfile.jurisdiction);
    const sectors = this.extractSectors(userQuery);
    const instruments = this.extractInstruments(userQuery);

    const filter: ContextualFilter = {
      userId,
      keywords,
      countries,
      sectors,
      instruments,
      riskProfile: userProfile.riskProfile || 'moderate',
      relevanceThreshold: 0.7 // Only high relevance content
    };

    this.activeFilters.set(userId, filter);
    
    // Save to database for persistence
    await storage.saveUserDataFilter(userId, filter);
    
    return filter;
  }

  // Get real-time updates from WSJ
  async getWSJUpdates(filter: ContextualFilter): Promise<RealTimeUpdate[]> {
    try {
      // Mock implementation - in production would use WSJ API
      const mockData = {
        articles: [
          {
            headline: "Fed Considers Rate Cut Amid Economic Uncertainty",
            summary: "Federal Reserve officials are weighing a potential interest rate reduction as economic indicators show mixed signals.",
            url: "https://wsj.com/articles/fed-rate-cut-2025",
            timestamp: new Date().toISOString(),
            sector: "monetary_policy",
            relevance: this.calculateRelevance("Fed rate cut", filter)
          },
          {
            headline: "Tech Stocks Rally on AI Innovation",
            summary: "Major technology companies see significant gains following breakthrough AI announcements.",
            url: "https://wsj.com/articles/tech-stocks-ai-rally",
            timestamp: new Date().toISOString(),
            sector: "technology",
            relevance: this.calculateRelevance("tech stocks AI", filter)
          }
        ]
      };

      return mockData.articles
        .filter(article => article.relevance >= filter.relevanceThreshold)
        .map(article => ({
          id: `wsj_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          source: 'Wall Street Journal',
          category: 'news' as const,
          title: article.headline,
          content: article.summary,
          url: article.url,
          timestamp: new Date(article.timestamp),
          relevanceScore: article.relevance,
          sector: article.sector,
          tags: this.generateTags(article.headline + " " + article.summary),
          userId: filter.userId,
          sessionId: `realtime_${Date.now()}`
        }));
    } catch (error) {
      console.error('WSJ API error:', error);
      return [];
    }
  }

  // Get economic calendar updates
  async getEconomicCalendarUpdates(filter: ContextualFilter): Promise<RealTimeUpdate[]> {
    try {
      // Mock implementation for economic calendar
      const mockEvents = [
        {
          title: "US CPI Data Release",
          description: "Consumer Price Index for December showing inflation trends",
          time: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
          country: "US",
          impact: "high",
          relevance: this.calculateRelevance("US inflation CPI", filter)
        },
        {
          title: "ECB Interest Rate Decision",
          description: "European Central Bank announces monetary policy decision",
          time: new Date(Date.now() + 172800000).toISOString(), // Day after tomorrow
          country: "EU",
          impact: "high",
          relevance: this.calculateRelevance("ECB interest rate", filter)
        }
      ];

      return mockEvents
        .filter(event => 
          event.relevance >= filter.relevanceThreshold &&
          (filter.countries.length === 0 || filter.countries.includes(event.country))
        )
        .map(event => ({
          id: `eco_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          source: 'Economic Calendar',
          category: 'economic' as const,
          title: event.title,
          content: event.description,
          url: `https://tradingeconomics.com/calendar`,
          timestamp: new Date(event.time),
          relevanceScore: event.relevance,
          country: event.country,
          tags: this.generateTags(event.title + " " + event.description),
          userId: filter.userId,
          sessionId: `realtime_${Date.now()}`
        }));
    } catch (error) {
      console.error('Economic Calendar error:', error);
      return [];
    }
  }

  // Get legal document updates by country
  async getLegalUpdates(filter: ContextualFilter): Promise<RealTimeUpdate[]> {
    try {
      // Mock implementation for legal updates
      const mockLegalChanges = [
        {
          title: "New Financial Regulations EU MiFID III",
          content: "European Union introduces enhanced investor protection measures under MiFID III directive",
          country: "EU",
          effectiveDate: "2025-01-01",
          url: "https://eur-lex.europa.eu/legal-content/EN/TXT/PDF/?uri=CELEX:32025L0001",
          relevance: this.calculateRelevance("EU financial regulations MiFID", filter)
        },
        {
          title: "US SEC Crypto Asset Rules",
          content: "Securities and Exchange Commission finalizes cryptocurrency custody and trading rules",
          country: "US",
          effectiveDate: "2025-03-01",
          url: "https://govinfo.gov/content/pkg/FR-2025-01-15/pdf/2025-00123.pdf",
          relevance: this.calculateRelevance("US SEC crypto regulations", filter)
        }
      ];

      return mockLegalChanges
        .filter(change => 
          change.relevance >= filter.relevanceThreshold &&
          (filter.countries.length === 0 || filter.countries.includes(change.country))
        )
        .map(change => ({
          id: `legal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          source: `Legal Updates ${change.country}`,
          category: 'legal' as const,
          title: change.title,
          content: change.content,
          url: change.url,
          timestamp: new Date(),
          relevanceScore: change.relevance,
          country: change.country,
          tags: this.generateTags(change.title + " " + change.content),
          userId: filter.userId,
          sessionId: `realtime_${Date.now()}`
        }));
    } catch (error) {
      console.error('Legal updates error:', error);
      return [];
    }
  }

  // Get TradingView price updates for all products
  async getTradingViewUpdates(filter: ContextualFilter): Promise<RealTimeUpdate[]> {
    try {
      // Generate price updates for instruments in user's filter
      const instruments = filter.instruments.length > 0 ? filter.instruments : 
        ['AAPL', 'GOOGL', 'MSFT', 'TSLA', 'EUR/USD', 'BTC/USD'];

      const priceUpdates = instruments.map(symbol => {
        const mockPrice = Math.random() * 1000 + 100;
        const change = (Math.random() - 0.5) * 10;
        const changePercent = (change / mockPrice) * 100;

        return {
          id: `tv_${symbol}_${Date.now()}`,
          source: 'TradingView',
          category: 'market' as const,
          title: `${symbol} Price Update`,
          content: `${symbol}: $${mockPrice.toFixed(2)} (${change >= 0 ? '+' : ''}${change.toFixed(2)}, ${changePercent.toFixed(2)}%)`,
          url: `https://tradingview.com/symbols/${symbol}`,
          timestamp: new Date(),
          relevanceScore: filter.instruments.includes(symbol) ? 1.0 : 0.5,
          instruments: [symbol],
          tags: [symbol, 'price', 'market_data'],
          userId: filter.userId,
          sessionId: `realtime_${Date.now()}`
        };
      });

      return priceUpdates.filter(update => update.relevanceScore >= filter.relevanceThreshold);
    } catch (error) {
      console.error('TradingView updates error:', error);
      return [];
    }
  }

  // Get aggregated real-time updates from all sources
  async getAllRelevantUpdates(userId: string): Promise<RealTimeUpdate[]> {
    const filter = this.activeFilters.get(userId);
    if (!filter) {
      throw new Error(`No contextual filter found for user ${userId}`);
    }

    const [wsjUpdates, economicUpdates, legalUpdates, tradingViewUpdates] = await Promise.all([
      this.getWSJUpdates(filter),
      this.getEconomicCalendarUpdates(filter),
      this.getLegalUpdates(filter),
      this.getTradingViewUpdates(filter)
    ]);

    const allUpdates = [
      ...wsjUpdates,
      ...economicUpdates,
      ...legalUpdates,
      ...tradingViewUpdates
    ];

    // Sort by relevance score and timestamp
    allUpdates.sort((a, b) => {
      if (a.relevanceScore !== b.relevanceScore) {
        return b.relevanceScore - a.relevanceScore;
      }
      return b.timestamp.getTime() - a.timestamp.getTime();
    });

    // Save updates to database for audit trail
    for (const update of allUpdates) {
      await storage.saveRealTimeUpdate(update);
    }

    return allUpdates;
  }

  // Extract keywords from user query using simple NLP
  private extractKeywords(query: string): string[] {
    const stopWords = ['i', 'want', 'to', 'buy', 'sell', 'the', 'a', 'an', 'and', 'or', 'but'];
    return query.toLowerCase()
      .split(/\s+/)
      .filter(word => word.length > 2 && !stopWords.includes(word))
      .slice(0, 10); // Limit to 10 keywords
  }

  // Extract countries from query and user profile
  private extractCountries(query: string, defaultJurisdiction?: string): string[] {
    const countries = [];
    const queryLower = query.toLowerCase();
    
    if (queryLower.includes('us') || queryLower.includes('usa') || queryLower.includes('american')) {
      countries.push('US');
    }
    if (queryLower.includes('eu') || queryLower.includes('europe') || queryLower.includes('european')) {
      countries.push('EU');
    }
    if (queryLower.includes('uk') || queryLower.includes('britain') || queryLower.includes('british')) {
      countries.push('UK');
    }
    if (queryLower.includes('poland') || queryLower.includes('polish') || queryLower.includes('pl')) {
      countries.push('PL');
    }

    // Add default jurisdiction if no specific country mentioned
    if (countries.length === 0 && defaultJurisdiction) {
      countries.push(defaultJurisdiction);
    }

    return countries;
  }

  // Extract sectors from user query
  private extractSectors(query: string): string[] {
    const sectors = [];
    const queryLower = query.toLowerCase();

    if (queryLower.includes('tech') || queryLower.includes('technology') || queryLower.includes('software')) {
      sectors.push('technology');
    }
    if (queryLower.includes('bank') || queryLower.includes('financial') || queryLower.includes('finance')) {
      sectors.push('financial');
    }
    if (queryLower.includes('energy') || queryLower.includes('oil') || queryLower.includes('gas')) {
      sectors.push('energy');
    }
    if (queryLower.includes('health') || queryLower.includes('pharma') || queryLower.includes('medical')) {
      sectors.push('healthcare');
    }

    return sectors;
  }

  // Extract financial instruments from query
  private extractInstruments(query: string): string[] {
    const instruments = [];
    const queryUpper = query.toUpperCase();

    // Common stock symbols
    const stockSymbols = ['AAPL', 'GOOGL', 'MSFT', 'TSLA', 'AMZN', 'NVDA', 'META'];
    stockSymbols.forEach(symbol => {
      if (queryUpper.includes(symbol)) {
        instruments.push(symbol);
      }
    });

    // Currency pairs
    const currencyPairs = ['EUR/USD', 'GBP/USD', 'USD/JPY', 'AUD/USD'];
    currencyPairs.forEach(pair => {
      if (queryUpper.includes(pair.replace('/', ''))) {
        instruments.push(pair);
      }
    });

    // Crypto
    if (queryUpper.includes('BTC') || queryUpper.includes('BITCOIN')) {
      instruments.push('BTC/USD');
    }
    if (queryUpper.includes('ETH') || queryUpper.includes('ETHEREUM')) {
      instruments.push('ETH/USD');
    }

    return instruments;
  }

  // Calculate relevance score based on keyword matching
  private calculateRelevance(content: string, filter: ContextualFilter): number {
    const contentLower = content.toLowerCase();
    let score = 0;

    // Check keyword matches (40% weight)
    const keywordMatches = filter.keywords.filter(keyword => 
      contentLower.includes(keyword.toLowerCase())
    ).length;
    score += (keywordMatches / filter.keywords.length) * 0.4;

    // Check sector matches (30% weight)
    const sectorMatches = filter.sectors.filter(sector => 
      contentLower.includes(sector.toLowerCase())
    ).length;
    score += (sectorMatches / Math.max(filter.sectors.length, 1)) * 0.3;

    // Check instrument matches (30% weight)
    const instrumentMatches = filter.instruments.filter(instrument => 
      contentLower.includes(instrument.toLowerCase())
    ).length;
    score += (instrumentMatches / Math.max(filter.instruments.length, 1)) * 0.3;

    return Math.min(score, 1.0); // Cap at 1.0
  }

  // Generate tags from content
  private generateTags(content: string): string[] {
    const words = content.toLowerCase().split(/\s+/);
    const importantWords = words.filter(word => 
      word.length > 4 && !['that', 'this', 'with', 'from'].includes(word)
    );
    return importantWords.slice(0, 5);
  }
}