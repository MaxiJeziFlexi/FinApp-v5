import * as cheerio from 'cheerio';
import puppeteer from 'puppeteer';
import fetch, { Response } from 'node-fetch';

export interface ScrapingResult {
  id: string;
  url: string;
  title: string;
  content: string;
  metadata: {
    description?: string;
    keywords?: string[];
    author?: string;
    publishDate?: string;
    wordCount: number;
    images: string[];
    links: string[];
  };
  scrapedAt: Date;
  status: 'success' | 'failed';
  error?: string;
}

export interface ScrapingJob {
  id: string;
  urls: string[];
  options: ScrapingOptions;
  status: 'pending' | 'running' | 'completed' | 'failed';
  results: ScrapingResult[];
  createdAt: Date;
  completedAt?: Date;
  progress: number;
}

export interface ScrapingOptions {
  useHeadlessBrowser?: boolean;
  waitForDynamicContent?: boolean;
  extractImages?: boolean;
  extractLinks?: boolean;
  customSelectors?: {
    title?: string;
    content?: string;
    description?: string;
  };
  timeout?: number;
  userAgent?: string;
  followRedirects?: boolean;
}

class WebScrapingService {
  private jobs: Map<string, ScrapingJob> = new Map();
  private browser: any = null;

  async initializeBrowser() {
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu'
        ]
      });
    }
    return this.browser;
  }

  async scrapeWithFetch(url: string, options: ScrapingOptions = {}): Promise<ScrapingResult> {
    const id = this.generateId();
    const startTime = Date.now();

    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': options.userAgent || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      }) as Response;

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const html = await response.text();
      const $ = cheerio.load(html);

      // Extract basic information
      const title = $(options.customSelectors?.title || 'title').first().text().trim() ||
                   $('h1').first().text().trim() ||
                   'No title found';

      const description = $(options.customSelectors?.description || 'meta[name="description"]').attr('content') ||
                         $('meta[property="og:description"]').attr('content') ||
                         '';

      const content = $(options.customSelectors?.content || 'main, article, .content, #content, body').first().text().trim() ||
                     $('body').text().trim();

      // Extract metadata
      const keywords = $('meta[name="keywords"]').attr('content')?.split(',').map((k: string) => k.trim()) || [];
      const author = $('meta[name="author"]').attr('content') || 
                    $('meta[property="article:author"]').attr('content') || '';
      
      const publishDate = $('meta[property="article:published_time"]').attr('content') ||
                         $('meta[name="date"]').attr('content') ||
                         $('time[datetime]').attr('datetime') || '';

      const images = options.extractImages ? 
        $('img').map((_: number, el: any) => $(el).attr('src')).get().filter(Boolean) : [];

      const links = options.extractLinks ?
        $('a[href]').map((_: number, el: any) => $(el).attr('href')).get().filter(Boolean) : [];

      return {
        id,
        url,
        title,
        content,
        metadata: {
          description,
          keywords,
          author,
          publishDate,
          wordCount: content.split(/\s+/).length,
          images,
          links
        },
        scrapedAt: new Date(),
        status: 'success'
      };

    } catch (error: any) {
      return {
        id,
        url,
        title: '',
        content: '',
        metadata: {
          wordCount: 0,
          images: [],
          links: []
        },
        scrapedAt: new Date(),
        status: 'failed',
        error: error.message
      };
    }
  }

  async scrapeWithPuppeteer(url: string, options: ScrapingOptions = {}): Promise<ScrapingResult> {
    const id = this.generateId();
    let page: any = null;

    try {
      const browser = await this.initializeBrowser();
      page = await browser.newPage();
      
      await page.setUserAgent(options.userAgent || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
      
      await page.goto(url, { 
        waitUntil: options.waitForDynamicContent ? 'networkidle0' : 'domcontentloaded',
        timeout: options.timeout || 30000
      });

      // Wait for dynamic content if requested
      if (options.waitForDynamicContent) {
        await page.waitForTimeout(2000);
      }

      const result = await page.evaluate((selectors: any) => {
        const title = document.querySelector(selectors.title || 'title')?.textContent?.trim() ||
                     document.querySelector('h1')?.textContent?.trim() ||
                     'No title found';

        const description = document.querySelector(selectors.description || 'meta[name="description"]')?.getAttribute('content') ||
                           document.querySelector('meta[property="og:description"]')?.getAttribute('content') ||
                           '';

        const content = document.querySelector(selectors.content || 'main, article, .content, #content, body')?.textContent?.trim() ||
                       document.body?.textContent?.trim() || '';

        const keywords = document.querySelector('meta[name="keywords"]')?.getAttribute('content')?.split(',').map((k: string) => k.trim()) || [];
        const author = document.querySelector('meta[name="author"]')?.getAttribute('content') ||
                      document.querySelector('meta[property="article:author"]')?.getAttribute('content') || '';
        
        const publishDate = document.querySelector('meta[property="article:published_time"]')?.getAttribute('content') ||
                           document.querySelector('meta[name="date"]')?.getAttribute('content') ||
                           document.querySelector('time[datetime]')?.getAttribute('datetime') || '';

        const images = Array.from(document.querySelectorAll('img')).map(img => (img as HTMLImageElement).src).filter(Boolean);
        const links = Array.from(document.querySelectorAll('a[href]')).map(a => (a as HTMLAnchorElement).href).filter(Boolean);

        return {
          title,
          description,
          content,
          keywords,
          author,
          publishDate,
          images,
          links,
          wordCount: content.split(/\s+/).length
        };
      }, options.customSelectors || {});

      return {
        id,
        url,
        title: result.title,
        content: result.content,
        metadata: {
          description: result.description,
          keywords: result.keywords,
          author: result.author,
          publishDate: result.publishDate,
          wordCount: result.wordCount,
          images: options.extractImages ? result.images : [],
          links: options.extractLinks ? result.links : []
        },
        scrapedAt: new Date(),
        status: 'success'
      };

    } catch (error: any) {
      return {
        id,
        url,
        title: '',
        content: '',
        metadata: {
          wordCount: 0,
          images: [],
          links: []
        },
        scrapedAt: new Date(),
        status: 'failed',
        error: error.message
      };
    } finally {
      if (page) {
        await page.close();
      }
    }
  }

  async createScrapingJob(urls: string[], options: ScrapingOptions = {}): Promise<string> {
    const jobId = this.generateId();
    const job: ScrapingJob = {
      id: jobId,
      urls,
      options,
      status: 'pending',
      results: [],
      createdAt: new Date(),
      progress: 0
    };

    this.jobs.set(jobId, job);

    // Start processing in background
    this.processJob(jobId);

    return jobId;
  }

  private async processJob(jobId: string) {
    const job = this.jobs.get(jobId);
    if (!job) return;

    job.status = 'running';
    
    try {
      for (let i = 0; i < job.urls.length; i++) {
        const url = job.urls[i];
        const result = job.options.useHeadlessBrowser ?
          await this.scrapeWithPuppeteer(url, job.options) :
          await this.scrapeWithFetch(url, job.options);

        job.results.push(result);
        job.progress = ((i + 1) / job.urls.length) * 100;
      }

      job.status = 'completed';
      job.completedAt = new Date();
    } catch (error) {
      job.status = 'failed';
      console.error('Job processing failed:', error);
    }
  }

  getJob(jobId: string): ScrapingJob | undefined {
    return this.jobs.get(jobId);
  }

  getAllJobs(): ScrapingJob[] {
    return Array.from(this.jobs.values()).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  deleteJob(jobId: string): boolean {
    return this.jobs.delete(jobId);
  }

  async scrapeUrl(url: string, options: ScrapingOptions = {}): Promise<ScrapingResult> {
    return options.useHeadlessBrowser ?
      await this.scrapeWithPuppeteer(url, options) :
      await this.scrapeWithFetch(url, options);
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
}

export const webScrapingService = new WebScrapingService();