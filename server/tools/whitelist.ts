// Centralized whitelist enforcement for all external data sources
// ZERO hardcoded domains outside this file

export interface SourceConfig {
  domain: string;
  api_endpoint?: string;
  requires_auth: boolean;
  category: 'news' | 'legal' | 'trading' | 'document';
  risk_level: 'safe' | 'monitored' | 'restricted';
}

// News sources whitelist
export const NEWS_SOURCES: SourceConfig[] = [
  {
    domain: "bbc.com",
    api_endpoint: "https://newsapi.org/v2/everything?domains=bbc.com",
    requires_auth: true,
    category: "news",
    risk_level: "safe"
  },
  {
    domain: "nytimes.com", 
    api_endpoint: "https://api.nytimes.com/svc/search/v2/articlesearch.json",
    requires_auth: true,
    category: "news",
    risk_level: "safe"
  },
  {
    domain: "bloomberg.com",
    api_endpoint: "https://newsapi.org/v2/everything?domains=bloomberg.com",
    requires_auth: true,
    category: "news", 
    risk_level: "safe"
  },
  {
    domain: "wsj.com",
    api_endpoint: "https://newsapi.org/v2/everything?domains=wsj.com",
    requires_auth: true,
    category: "news",
    risk_level: "safe"
  }
];

// Legal/Government sources whitelist
export const LEGAL_SOURCES: SourceConfig[] = [
  {
    domain: "eur-lex.europa.eu",
    requires_auth: false,
    category: "legal",
    risk_level: "safe"
  },
  {
    domain: "admin.ch", 
    requires_auth: false,
    category: "legal",
    risk_level: "safe"
  },
  {
    domain: "gov.uk",
    requires_auth: false,
    category: "legal",
    risk_level: "safe"
  },
  {
    domain: "sejm.gov.pl",
    requires_auth: false,
    category: "legal",
    risk_level: "safe"
  },
  {
    domain: "gov.pl",
    requires_auth: false,
    category: "legal", 
    risk_level: "safe"
  },
  {
    domain: "prawo.sejm.gov.pl",
    requires_auth: false,
    category: "legal",
    risk_level: "safe"
  }
];

// Trading/Financial data sources
export const TRADING_SOURCES: SourceConfig[] = [
  {
    domain: "tradingview.com",
    api_endpoint: "https://scanner.tradingview.com/",
    requires_auth: true,
    category: "trading",
    risk_level: "monitored"
  },
  {
    domain: "ibkr.com",
    requires_auth: true,
    category: "trading",
    risk_level: "restricted"
  },
  {
    domain: "xtb.com",
    requires_auth: true,
    category: "trading", 
    risk_level: "restricted"
  }
];

export const ALL_WHITELISTED_SOURCES = [
  ...NEWS_SOURCES,
  ...LEGAL_SOURCES,
  ...TRADING_SOURCES
];

// Whitelist validation functions
export function isWhitelistedDomain(url: string, category?: 'news' | 'legal' | 'trading'): boolean {
  try {
    const domain = new URL(url).hostname.replace('www.', '');
    const sources = category ? 
      ALL_WHITELISTED_SOURCES.filter(s => s.category === category) :
      ALL_WHITELISTED_SOURCES;
    
    return sources.some(source => domain === source.domain || domain.endsWith('.' + source.domain));
  } catch (error) {
    return false;
  }
}

export function getSourceConfig(domain: string): SourceConfig | null {
  return ALL_WHITELISTED_SOURCES.find(s => 
    domain === s.domain || domain.endsWith('.' + s.domain)
  ) || null;
}

export function validateNewsSource(source: string): boolean {
  const validSources = ['bbc', 'nyt', 'bloomberg', 'wsj'];
  return validSources.includes(source.toLowerCase());
}

// Middleware for whitelist enforcement
export function enforceWhitelist(req: any, res: any, next: any) {
  const { url, domain, sources } = req.body;
  
  // Check URL whitelist
  if (url && !isWhitelistedDomain(url)) {
    return res.status(403).json({
      error: 'URL not whitelisted',
      code: 'WHITELIST_VIOLATION',
      allowed_domains: ALL_WHITELISTED_SOURCES.map(s => s.domain)
    });
  }
  
  // Check news sources whitelist  
  if (sources && Array.isArray(sources)) {
    const invalidSources = sources.filter((s: string) => !validateNewsSource(s));
    if (invalidSources.length > 0) {
      return res.status(403).json({
        error: 'Invalid news sources',
        code: 'SOURCE_VIOLATION', 
        invalid_sources: invalidSources,
        allowed_sources: ['bbc', 'nyt', 'bloomberg', 'wsj']
      });
    }
  }
  
  next();
}