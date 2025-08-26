// Centralny rejestr whitelisty domen - News/Prawo/Computer Use
// Middleware odrzucające wszystko spoza listy

export interface WhitelistedDomain {
  domain: string;
  category: 'news' | 'legal' | 'computer_use' | 'broker' | 'market_data';
  country?: string;
  verified: boolean;
  description: string;
  allowedPaths?: string[];
  blocked_paths?: string[];
}

// Centralny rejestr zweryfikowanych domen
export const WHITELIST_DOMAINS: WhitelistedDomain[] = [
  // NEWS SOURCES (tylko te 4)
  {
    domain: 'bbc.com',
    category: 'news',
    country: 'UK',
    verified: true,
    description: 'BBC News - British Broadcasting Corporation',
    allowedPaths: ['/news', '/business'],
    blocked_paths: ['/iplayer', '/sounds']
  },
  {
    domain: 'nytimes.com',
    category: 'news',
    country: 'US',
    verified: true,
    description: 'The New York Times',
    allowedPaths: ['/section/business', '/section/technology'],
    blocked_paths: ['/games', '/cooking']
  },
  {
    domain: 'bloomberg.com',
    category: 'news',
    country: 'US',
    verified: true,
    description: 'Bloomberg Financial News',
    allowedPaths: ['/news', '/markets', '/technology'],
    blocked_paths: ['/opinion', '/newsletters']
  },
  {
    domain: 'wsj.com',
    category: 'news',
    country: 'US',
    verified: true,
    description: 'The Wall Street Journal',
    allowedPaths: ['/news', '/markets', '/economy'],
    blocked_paths: ['/opinion', '/lifestyle']
  },

  // LEGAL SOURCES (oficjalne rządowe)
  {
    domain: 'eur-lex.europa.eu',
    category: 'legal',
    country: 'EU',
    verified: true,
    description: 'EUR-Lex - EU Law Database',
    allowedPaths: ['/legal-content', '/browse']
  },
  {
    domain: 'admin.ch',
    category: 'legal',
    country: 'CH',
    verified: true,
    description: 'Swiss Federal Administration',
    allowedPaths: ['/gov', '/bundesrecht']
  },
  {
    domain: 'gov.uk',
    category: 'legal',
    country: 'UK',
    verified: true,
    description: 'UK Government Official',
    allowedPaths: ['/government', '/guidance']
  },
  {
    domain: 'legislation.gov.uk',
    category: 'legal',
    country: 'UK',
    verified: true,
    description: 'UK Legislation Database',
    allowedPaths: ['/ukpga', '/uksi']
  },
  {
    domain: 'sejm.gov.pl',
    category: 'legal',
    country: 'PL',
    verified: true,
    description: 'Polish Parliament (Sejm)',
    allowedPaths: ['/prawo', '/ustawy']
  },
  {
    domain: 'gov.pl',
    category: 'legal',
    country: 'PL',
    verified: true,
    description: 'Polish Government Portal',
    allowedPaths: ['/web', '/prawo']
  },

  // MARKET DATA & BROKERS
  {
    domain: 'tradingview.com',
    category: 'market_data',
    verified: true,
    description: 'TradingView Charts and Data',
    allowedPaths: ['/symbols', '/chart', '/markets']
  },
  {
    domain: 'interactivebrokers.com',
    category: 'broker',
    verified: true,
    description: 'Interactive Brokers',
    allowedPaths: ['/api', '/portal', '/trading']
  },
  {
    domain: 'xtb.com',
    category: 'broker',
    verified: true,
    description: 'XTB Broker',
    allowedPaths: ['/api', '/trading', '/market-data']
  },

  // COMPUTER USE - same domains as news/legal
  {
    domain: 'bbc.com',
    category: 'computer_use',
    country: 'UK',
    verified: true,
    description: 'BBC News for Computer Use',
    allowedPaths: ['/news', '/business']
  },
  {
    domain: 'nytimes.com',
    category: 'computer_use',
    country: 'US',
    verified: true,
    description: 'NYT for Computer Use',
    allowedPaths: ['/section/business']
  },
  {
    domain: 'bloomberg.com',
    category: 'computer_use',
    country: 'US',
    verified: true,
    description: 'Bloomberg for Computer Use',
    allowedPaths: ['/news', '/markets']
  },
  {
    domain: 'wsj.com',
    category: 'computer_use',
    country: 'US',
    verified: true,
    description: 'WSJ for Computer Use',
    allowedPaths: ['/news', '/markets']
  }
];

// Whitelist Manager Class
export class WhitelistManager {
  private domains: Map<string, WhitelistedDomain[]> = new Map();

  constructor() {
    this.initializeDomains();
  }

  private initializeDomains(): void {
    WHITELIST_DOMAINS.forEach(domain => {
      const existing = this.domains.get(domain.domain) || [];
      existing.push(domain);
      this.domains.set(domain.domain, existing);
    });
  }

  // Sprawdź czy domena jest na białej liście
  isDomainWhitelisted(
    url: string, 
    category?: WhitelistedDomain['category']
  ): { 
    allowed: boolean; 
    domain?: WhitelistedDomain; 
    reason?: string 
  } {
    try {
      const urlObj = new URL(url);
      const domain = urlObj.hostname.replace(/^www\./, '');
      const path = urlObj.pathname;

      const domainConfigs = this.domains.get(domain);
      if (!domainConfigs || domainConfigs.length === 0) {
        return {
          allowed: false,
          reason: `Domena ${domain} nie jest na białej liście`
        };
      }

      // Filtruj według kategorii jeśli podana
      const relevantConfigs = category 
        ? domainConfigs.filter(d => d.category === category)
        : domainConfigs;

      if (relevantConfigs.length === 0) {
        return {
          allowed: false,
          reason: `Domena ${domain} nie jest dozwolona dla kategorii ${category}`
        };
      }

      // Sprawdź pierwszy pasujący config
      const config = relevantConfigs[0];

      // Sprawdź blocked paths
      if (config.blocked_paths) {
        const isBlocked = config.blocked_paths.some(blockedPath => 
          path.startsWith(blockedPath)
        );
        if (isBlocked) {
          return {
            allowed: false,
            reason: `Ścieżka ${path} jest zablokowana dla domeny ${domain}`
          };
        }
      }

      // Sprawdź allowed paths (jeśli są zdefiniowane)
      if (config.allowedPaths && config.allowedPaths.length > 0) {
        const isAllowed = config.allowedPaths.some(allowedPath => 
          path.startsWith(allowedPath)
        );
        if (!isAllowed) {
          return {
            allowed: false,
            reason: `Ścieżka ${path} nie jest dozwolona dla domeny ${domain}`
          };
        }
      }

      return {
        allowed: true,
        domain: config
      };
    } catch (error) {
      return {
        allowed: false,
        reason: `Nieprawidłowy URL: ${url}`
      };
    }
  }

  // Pobierz wszystkie domeny dla kategorii
  getDomainsForCategory(category: WhitelistedDomain['category']): WhitelistedDomain[] {
    const result: WhitelistedDomain[] = [];
    for (const configs of this.domains.values()) {
      result.push(...configs.filter(config => config.category === category));
    }
    return result;
  }

  // Middleware dla sprawdzania URL w żądaniach
  validateUrlMiddleware(category?: WhitelistedDomain['category']) {
    return (req: any, res: any, next: any) => {
      const { url, source_url, target_url } = req.body;
      const urlToCheck = url || source_url || target_url;

      if (!urlToCheck) {
        return res.status(400).json({
          error: 'Brak URL do sprawdzenia',
          code: 'MISSING_URL'
        });
      }

      const validation = this.isDomainWhitelisted(urlToCheck, category);
      if (!validation.allowed) {
        return res.status(403).json({
          error: 'URL nie jest na białej liście',
          code: 'URL_NOT_WHITELISTED',
          reason: validation.reason,
          url: urlToCheck,
          category: category || 'any'
        });
      }

      // Dodaj informacje o domenie do request
      req.whitelistedDomain = validation.domain;
      req.validatedUrl = urlToCheck;
      
      next();
    };
  }

  // Middleware dla sprawdzania źródeł w news
  validateNewsSourceMiddleware() {
    return (req: any, res: any, next: any) => {
      const { sources } = req.body;
      
      if (!sources || !Array.isArray(sources)) {
        return res.status(400).json({
          error: 'Brak listy źródeł lub nieprawidłowy format',
          code: 'INVALID_SOURCES'
        });
      }

      const allowedNewsDomains = this.getDomainsForCategory('news').map(d => d.domain);
      const invalidSources = sources.filter((source: string) => {
        const domain = source.includes('.') ? source : `${source}.com`;
        return !allowedNewsDomains.some(allowed => 
          allowed.includes(domain.replace(/^www\./, ''))
        );
      });

      if (invalidSources.length > 0) {
        return res.status(403).json({
          error: 'Niektóre źródła nie są na białej liście',
          code: 'INVALID_NEWS_SOURCES',
          invalidSources,
          allowedSources: allowedNewsDomains
        });
      }

      next();
    };
  }

  // Sprawdź czy wszystkie URL w żądaniu są na liście
  validateAllUrls(urls: string[], category?: WhitelistedDomain['category']): {
    allValid: boolean;
    invalidUrls: Array<{ url: string; reason: string }>;
    validUrls: Array<{ url: string; domain: WhitelistedDomain }>;
  } {
    const invalidUrls: Array<{ url: string; reason: string }> = [];
    const validUrls: Array<{ url: string; domain: WhitelistedDomain }> = [];

    for (const url of urls) {
      const validation = this.isDomainWhitelisted(url, category);
      if (validation.allowed && validation.domain) {
        validUrls.push({ url, domain: validation.domain });
      } else {
        invalidUrls.push({ url, reason: validation.reason || 'Unknown error' });
      }
    }

    return {
      allValid: invalidUrls.length === 0,
      invalidUrls,
      validUrls
    };
  }

  // Dodaj nową domenę do whitelist (admin only)
  addDomain(domain: WhitelistedDomain): boolean {
    try {
      const existing = this.domains.get(domain.domain) || [];
      existing.push(domain);
      this.domains.set(domain.domain, existing);
      return true;
    } catch (error) {
      return false;
    }
  }

  // Usuń domenę z whitelist (admin only)
  removeDomain(domainName: string, category?: WhitelistedDomain['category']): boolean {
    try {
      const existing = this.domains.get(domainName);
      if (!existing) return false;

      if (category) {
        const filtered = existing.filter(d => d.category !== category);
        if (filtered.length === 0) {
          this.domains.delete(domainName);
        } else {
          this.domains.set(domainName, filtered);
        }
      } else {
        this.domains.delete(domainName);
      }
      
      return true;
    } catch (error) {
      return false;
    }
  }

  // Statystyki whitelist
  getWhitelistStats(): {
    totalDomains: number;
    categoryCounts: Record<string, number>;
    countryCounts: Record<string, number>;
  } {
    const allDomains: WhitelistedDomain[] = [];
    for (const configs of this.domains.values()) {
      allDomains.push(...configs);
    }

    const categoryCounts: Record<string, number> = {};
    const countryCounts: Record<string, number> = {};

    allDomains.forEach(domain => {
      categoryCounts[domain.category] = (categoryCounts[domain.category] || 0) + 1;
      if (domain.country) {
        countryCounts[domain.country] = (countryCounts[domain.country] || 0) + 1;
      }
    });

    return {
      totalDomains: allDomains.length,
      categoryCounts,
      countryCounts
    };
  }
}

// Singleton instance
export const whitelistManager = new WhitelistManager();