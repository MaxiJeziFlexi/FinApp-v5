import fetch from 'node-fetch';

// Real-Time Financial Data Service using Perplexity API
export class RealTimeDataService {
  private perplexityApiKey: string;
  private baseUrl = 'https://api.perplexity.ai/chat/completions';

  constructor() {
    this.perplexityApiKey = process.env.PERPLEXITY_API_KEY!;
    if (!this.perplexityApiKey) {
      throw new Error('PERPLEXITY_API_KEY is required for real-time data access');
    }
  }

  // Core web search function using Perplexity
  private async searchWeb(query: string, options: {
    model?: string;
    temperature?: number;
    recency?: 'hour' | 'day' | 'week' | 'month';
    searchDomain?: string[];
  } = {}): Promise<{
    content: string;
    citations: string[];
    sources: number;
  }> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.perplexityApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: options.model || 'llama-3.1-sonar-large-128k-online',
          messages: [
            {
              role: 'system',
              content: 'You are a financial data analyst providing precise, current market information with specific numbers, percentages, and citations.'
            },
            {
              role: 'user',
              content: query
            }
          ],
          temperature: options.temperature || 0.2,
          search_recency_filter: options.recency || 'day',
          search_domain_filter: options.searchDomain || [],
          return_citations: true,
          return_related_questions: false,
          stream: false
        })
      });

      if (!response.ok) {
        throw new Error(`Perplexity API error: ${response.status}`);
      }

      const data = await response.json() as any;
      return {
        content: data.choices[0].message.content,
        citations: data.citations || [],
        sources: data.citations?.length || 0
      };
    } catch (error) {
      console.error('Real-time search error:', error);
      throw new Error(`Failed to fetch real-time data: ${(error as Error).message}`);
    }
  }

  // Get current market data for stocks, crypto, commodities
  async getMarketData(symbol: string, market: 'stock' | 'crypto' | 'commodity' = 'stock'): Promise<{
    price: string;
    change: string;
    percentChange: string;
    volume: string;
    marketCap?: string;
    analysis: string;
    sources: string[];
    timestamp: string;
  }> {
    const query = `Current ${market} price for ${symbol} today. Include exact price, percentage change, volume, market cap if available. Provide analysis of recent price movement and key factors affecting the price.`;
    
    const result = await this.searchWeb(query, {
      recency: 'hour',
      searchDomain: ['finance.yahoo.com', 'marketwatch.com', 'bloomberg.com', 'reuters.com']
    });

    // Parse the response to extract structured data
    const priceMatch = result.content.match(/\$?([\d,]+\.?\d*)/);
    const changeMatch = result.content.match(/([+-]?\$?[\d,]+\.?\d*)\s*\(([+-]?[\d,]+\.?\d*)%\)/);
    
    return {
      price: priceMatch?.[1] || 'Price not found',
      change: changeMatch?.[1] || 'Change not found',
      percentChange: changeMatch?.[2] || 'Percentage not found',
      volume: this.extractVolume(result.content),
      marketCap: this.extractMarketCap(result.content),
      analysis: result.content,
      sources: result.citations,
      timestamp: new Date().toISOString()
    };
  }

  // Get latest financial news and market sentiment
  async getFinancialNews(topics: string[] = ['market', 'stocks'], count: number = 5): Promise<{
    headlines: Array<{
      title: string;
      summary: string;
      impact: 'positive' | 'negative' | 'neutral';
      relevance: number;
    }>;
    overallSentiment: string;
    keyThemes: string[];
    sources: string[];
  }> {
    const topicsStr = topics.join(', ');
    const query = `Latest breaking financial news about ${topicsStr}. Include top ${count} most important stories, their market impact, and overall market sentiment. Focus on news that could affect stock prices and investment decisions.`;
    
    const result = await this.searchWeb(query, {
      recency: 'hour',
      searchDomain: ['bloomberg.com', 'reuters.com', 'cnbc.com', 'marketwatch.com', 'wsj.com']
    });

    return {
      headlines: this.parseHeadlines(result.content, count),
      overallSentiment: this.analyzeSentiment(result.content),
      keyThemes: this.extractKeyThemes(result.content),
      sources: result.citations
    };
  }

  // Get economic indicators and data
  async getEconomicIndicators(indicators: string[] = ['GDP', 'inflation', 'unemployment', 'interest rates']): Promise<{
    data: Array<{
      indicator: string;
      currentValue: string;
      previousValue: string;
      change: string;
      trend: 'rising' | 'falling' | 'stable';
      impact: string;
    }>;
    economicOutlook: string;
    sources: string[];
  }> {
    const indicatorsStr = indicators.join(', ');
    const query = `Current economic indicators: ${indicatorsStr}. Include latest values, previous values, changes, trends, and economic impact analysis. Focus on US economy unless specified otherwise.`;
    
    const result = await this.searchWeb(query, {
      recency: 'week',
      searchDomain: ['bls.gov', 'bea.gov', 'federalreserve.gov', 'tradingeconomics.com']
    });

    return {
      data: this.parseEconomicData(result.content, indicators),
      economicOutlook: this.extractOutlook(result.content),
      sources: result.citations
    };
  }

  // Get company earnings and financial reports
  async getCompanyFinancials(company: string): Promise<{
    revenue: string;
    earnings: string;
    eps: string;
    guidance: string;
    keyMetrics: Array<{
      metric: string;
      value: string;
      change: string;
    }>;
    analystRatings: string;
    analysis: string;
    sources: string[];
  }> {
    const query = `Latest earnings report and financial data for ${company}. Include revenue, earnings, EPS, guidance, key financial metrics, analyst ratings, and financial analysis.`;
    
    const result = await this.searchWeb(query, {
      recency: 'week',
      searchDomain: ['sec.gov', 'finance.yahoo.com', 'marketwatch.com', 'seekingalpha.com']
    });

    return {
      revenue: this.extractMetric(result.content, 'revenue'),
      earnings: this.extractMetric(result.content, 'earnings'),
      eps: this.extractMetric(result.content, 'EPS'),
      guidance: this.extractGuidance(result.content),
      keyMetrics: this.parseFinancialMetrics(result.content),
      analystRatings: this.extractAnalystRatings(result.content),
      analysis: result.content,
      sources: result.citations
    };
  }

  // Get sector analysis and trends
  async getSectorAnalysis(sector: string): Promise<{
    performance: string;
    topPerformers: string[];
    bottomPerformers: string[];
    sectorTrends: string[];
    outlook: string;
    keyDrivers: string[];
    analysis: string;
    sources: string[];
  }> {
    const query = `Current ${sector} sector analysis and performance. Include top and bottom performing stocks, sector trends, outlook, key drivers, and investment implications.`;
    
    const result = await this.searchWeb(query, {
      recency: 'day',
      searchDomain: ['morningstar.com', 'sectorspdr.com', 'bloomberg.com', 'marketwatch.com']
    });

    return {
      performance: this.extractSectorPerformance(result.content),
      topPerformers: this.extractPerformers(result.content, 'top'),
      bottomPerformers: this.extractPerformers(result.content, 'bottom'),
      sectorTrends: this.extractTrends(result.content),
      outlook: this.extractSectorOutlook(result.content),
      keyDrivers: this.extractKeyDrivers(result.content),
      analysis: result.content,
      sources: result.citations
    };
  }

  // Get crypto market data and DeFi trends
  async getCryptoMarketData(symbols: string[] = ['BTC', 'ETH', 'SPX']): Promise<{
    prices: Array<{
      symbol: string;
      price: string;
      change24h: string;
      volume: string;
      marketCap: string;
    }>;
    marketSentiment: string;
    defiTrends: string[];
    analysis: string;
    sources: string[];
  }> {
    const symbolsStr = symbols.join(', ');
    const query = `Current cryptocurrency prices for ${symbolsStr}. Include 24h price changes, volume, market cap, market sentiment, DeFi trends, and crypto market analysis.`;
    
    const result = await this.searchWeb(query, {
      recency: 'hour',
      searchDomain: ['coinbase.com', 'binance.com', 'coingecko.com', 'coindesk.com']
    });

    return {
      prices: this.parseCryptoPrices(result.content, symbols),
      marketSentiment: this.analyzeCryptoSentiment(result.content),
      defiTrends: this.extractDeFiTrends(result.content),
      analysis: result.content,
      sources: result.citations
    };
  }

  // Comprehensive market search for any financial query
  async searchFinancialData(query: string, context: {
    timeframe?: 'hour' | 'day' | 'week' | 'month';
    domain?: 'stocks' | 'crypto' | 'bonds' | 'commodities' | 'forex' | 'general';
    region?: 'US' | 'EU' | 'Asia' | 'Global';
  } = {}): Promise<{
    data: string;
    insights: string[];
    recommendations: string[];
    riskFactors: string[];
    sources: string[];
    confidence: number;
  }> {
    const enhancedQuery = this.enhanceQuery(query, context);
    const searchDomains = this.getSearchDomains(context.domain || 'general');
    
    const result = await this.searchWeb(enhancedQuery, {
      recency: context.timeframe || 'day',
      searchDomain: searchDomains
    });

    return {
      data: result.content,
      insights: this.extractInsights(result.content),
      recommendations: this.extractRecommendations(result.content),
      riskFactors: this.extractRiskFactors(result.content),
      sources: result.citations,
      confidence: this.calculateConfidence(result.sources, result.content)
    };
  }

  // Utility methods for parsing and extracting data
  private extractVolume(content: string): string {
    const volumeMatch = content.match(/volume[:\s]+(\d+(?:,\d+)*(?:\.\d+)?[KMB]?)/i);
    return volumeMatch?.[1] || 'Volume not found';
  }

  private extractMarketCap(content: string): string {
    const capMatch = content.match(/market\s+cap[:\s]+\$?(\d+(?:,\d+)*(?:\.\d+)?[KMB]?)/i);
    return capMatch?.[1] || 'Market cap not found';
  }

  private parseHeadlines(content: string, count: number): Array<{
    title: string;
    summary: string;
    impact: 'positive' | 'negative' | 'neutral';
    relevance: number;
  }> {
    // Simple headline extraction - could be enhanced with more sophisticated parsing
    const sentences = content.split('.').slice(0, count);
    return sentences.map((sentence, index) => ({
      title: sentence.trim().substring(0, 100) + '...',
      summary: sentence.trim(),
      impact: this.determineImpact(sentence),
      relevance: Math.max(0.9 - (index * 0.1), 0.5)
    }));
  }

  private analyzeSentiment(content: string): string {
    const positiveWords = ['positive', 'bullish', 'growth', 'gains', 'up', 'strong', 'optimistic'];
    const negativeWords = ['negative', 'bearish', 'decline', 'losses', 'down', 'weak', 'pessimistic'];
    
    const lowerContent = content.toLowerCase();
    const positiveCount = positiveWords.filter(word => lowerContent.includes(word)).length;
    const negativeCount = negativeWords.filter(word => lowerContent.includes(word)).length;
    
    if (positiveCount > negativeCount) return 'Bullish';
    if (negativeCount > positiveCount) return 'Bearish';
    return 'Neutral';
  }

  private extractKeyThemes(content: string): string[] {
    // Extract key financial themes - simplified implementation
    const themes = ['earnings', 'inflation', 'interest rates', 'GDP', 'unemployment', 'trade', 'regulation'];
    return themes.filter(theme => content.toLowerCase().includes(theme));
  }

  private parseEconomicData(content: string, indicators: string[]): Array<{
    indicator: string;
    currentValue: string;
    previousValue: string;
    change: string;
    trend: 'rising' | 'falling' | 'stable';
    impact: string;
  }> {
    return indicators.map(indicator => ({
      indicator,
      currentValue: this.extractCurrentValue(content, indicator),
      previousValue: this.extractPreviousValue(content, indicator),
      change: this.extractChange(content, indicator),
      trend: this.determineTrend(content, indicator),
      impact: this.extractImpact(content, indicator)
    }));
  }

  private extractOutlook(content: string): string {
    const outlookMatch = content.match(/outlook[:\s]+([\s\S]{0,200})/i);
    return outlookMatch?.[1]?.trim() || 'Economic outlook information not found';
  }

  private extractMetric(content: string, metric: string): string {
    const regex = new RegExp(`${metric}[:\s]+\\$?([\\d,]+(?:\\.\\d+)?[KMB]?)`, 'i');
    const match = content.match(regex);
    return match?.[1] || `${metric} not found`;
  }

  private extractGuidance(content: string): string {
    const guidanceMatch = content.match(/guidance[:\s]+([\s\S]{0,150})/i);
    return guidanceMatch?.[1]?.trim() || 'Guidance information not found';
  }

  private parseFinancialMetrics(content: string): Array<{
    metric: string;
    value: string;
    change: string;
  }> {
    const metrics = ['P/E ratio', 'ROE', 'Debt-to-equity', 'Profit margin'];
    return metrics.map(metric => ({
      metric,
      value: this.extractMetric(content, metric),
      change: this.extractMetricChange(content, metric)
    }));
  }

  private extractAnalystRatings(content: string): string {
    const ratingMatch = content.match(/analyst[s]?\s+rating[s]?[:\s]+([\s\S]{0,100})/i);
    return ratingMatch?.[1]?.trim() || 'Analyst ratings not found';
  }

  private enhanceQuery(query: string, context: any): string {
    let enhancedQuery = query;
    
    if (context.region && context.region !== 'Global') {
      enhancedQuery += ` in ${context.region}`;
    }
    
    if (context.domain) {
      enhancedQuery += ` ${context.domain} market`;
    }
    
    enhancedQuery += ' with specific numbers, percentages, and current data';
    
    return enhancedQuery;
  }

  private getSearchDomains(domain: string): string[] {
    const domainMap = {
      stocks: ['finance.yahoo.com', 'marketwatch.com', 'bloomberg.com'],
      crypto: ['coinbase.com', 'binance.com', 'coingecko.com'],
      bonds: ['treasurydirect.gov', 'bloomberg.com', 'marketwatch.com'],
      commodities: ['investing.com', 'marketwatch.com', 'bloomberg.com'],
      forex: ['xe.com', 'forexfactory.com', 'bloomberg.com'],
      general: ['bloomberg.com', 'reuters.com', 'marketwatch.com', 'cnbc.com']
    };
    
    return domainMap[domain as keyof typeof domainMap] || domainMap.general;
  }

  private calculateConfidence(sourceCount: number, content: string): number {
    let confidence = 0.5; // Base confidence
    
    // Increase confidence based on sources
    confidence += Math.min(sourceCount * 0.1, 0.3);
    
    // Increase confidence if content contains specific data
    if (content.includes('$') || content.includes('%') || /\d+/.test(content)) {
      confidence += 0.2;
    }
    
    return Math.min(confidence, 1.0);
  }

  // Additional helper methods (simplified implementations)
  private extractInsights(content: string): string[] {
    return content.split('.').slice(0, 3).map(s => s.trim()).filter(s => s.length > 20);
  }

  private extractRecommendations(content: string): string[] {
    const recMatch = content.match(/recommend[s]?[:\s]+([\s\S]{0,100})/i);
    return recMatch ? [recMatch[1].trim()] : ['No specific recommendations found'];
  }

  private extractRiskFactors(content: string): string[] {
    const riskMatch = content.match(/risk[s]?[:\s]+([\s\S]{0,100})/i);
    return riskMatch ? [riskMatch[1].trim()] : ['Risk factors not specified'];
  }

  // Placeholder implementations for other helper methods
  private extractCurrentValue(content: string, indicator: string): string {
    const regex = new RegExp(`${indicator}[:\s]+([\\d.%]+)`, 'i');
    const match = content.match(regex);
    return match?.[1] || 'Not found';
  }

  private extractPreviousValue(content: string, indicator: string): string {
    return 'Previous value extraction not implemented';
  }

  private extractChange(content: string, indicator: string): string {
    return 'Change extraction not implemented';
  }

  private determineTrend(content: string, indicator: string): 'rising' | 'falling' | 'stable' {
    return 'stable';
  }

  private extractImpact(content: string, indicator: string): string {
    return 'Impact analysis not implemented';
  }

  private extractSectorPerformance(content: string): string {
    return 'Sector performance extraction not implemented';
  }

  private extractPerformers(content: string, type: 'top' | 'bottom'): string[] {
    return [`${type} performers extraction not implemented`];
  }

  private extractTrends(content: string): string[] {
    return ['Trend extraction not implemented'];
  }

  private extractSectorOutlook(content: string): string {
    return 'Sector outlook extraction not implemented';
  }

  private extractKeyDrivers(content: string): string[] {
    return ['Key drivers extraction not implemented'];
  }

  private parseCryptoPrices(content: string, symbols: string[]): Array<{
    symbol: string;
    price: string;
    change24h: string;
    volume: string;
    marketCap: string;
  }> {
    return symbols.map(symbol => ({
      symbol,
      price: 'Price extraction not implemented',
      change24h: 'Change extraction not implemented',
      volume: 'Volume extraction not implemented',
      marketCap: 'Market cap extraction not implemented'
    }));
  }

  private analyzeCryptoSentiment(content: string): string {
    return 'Crypto sentiment analysis not implemented';
  }

  private extractDeFiTrends(content: string): string[] {
    return ['DeFi trends extraction not implemented'];
  }

  private determineImpact(sentence: string): 'positive' | 'negative' | 'neutral' {
    if (sentence.toLowerCase().includes('positive') || sentence.toLowerCase().includes('gain')) {
      return 'positive';
    }
    if (sentence.toLowerCase().includes('negative') || sentence.toLowerCase().includes('loss')) {
      return 'negative';
    }
    return 'neutral';
  }

  private extractMetricChange(content: string, metric: string): string {
    return 'Metric change extraction not implemented';
  }
}

// Export singleton instance
export const realTimeDataService = new RealTimeDataService();