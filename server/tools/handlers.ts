// Tool handlers - implements all function calling endpoints
// Each handler validates input, checks permissions, logs execution, returns structured output

import { Request, Response } from 'express';
import { z } from 'zod';
import { checkPermission, createAuditEntry, UserRole } from './permissions';
import { isWhitelistedDomain, enforceWhitelist } from './whitelist';
import { TRADING_TOOLS, NEWS_TOOLS, LEGAL_TOOLS, HELPER_TOOLS } from './contracts';
import { storage } from '../storage';

interface ToolContext {
  userId: string;
  userRole: UserRole;
  sessionId: string;
  requestId: string;
}

interface ToolResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  execution_time_ms: number;
  can_execute: boolean;
  requires_confirmation?: boolean;
  risk_flags: string[];
  sources?: Array<{
    title: string;
    url: string;
    date: string;
    domain: string;
  }>;
}

// Generic tool execution wrapper
async function executeToolSafely<T>(
  toolName: string,
  context: ToolContext,
  handler: () => Promise<T>,
  inputData: any
): Promise<ToolResponse<T>> {
  const startTime = Date.now();
  const riskFlags: string[] = [];
  
  try {
    // Permission check
    const permission = checkPermission(context.userRole, toolName as any, inputData);
    if (!permission.granted) {
      const auditEntry = createAuditEntry(
        context.userId,
        context.userRole,
        toolName,
        inputData,
        { error: permission.reason },
        'rejected',
        ['permission_denied'],
        permission.reason || 'Permission denied'
      );
      
      await storage.saveToolExecution(auditEntry);
      
      return {
        success: false,
        error: {
          code: 'PERMISSION_DENIED',
          message: permission.reason || 'Access denied',
        },
        execution_time_ms: Date.now() - startTime,
        can_execute: false,
        risk_flags: ['permission_denied']
      };
    }

    // Execute tool
    const result = await handler();
    
    // Create audit entry
    const auditEntry = createAuditEntry(
      context.userId,
      context.userRole,
      toolName,
      inputData,
      result,
      'executed',
      riskFlags,
      `Tool executed successfully`
    );
    
    await storage.saveToolExecution(auditEntry);
    
    return {
      success: true,
      data: result,
      execution_time_ms: Date.now() - startTime,
      can_execute: true,
      requires_confirmation: permission.requires_confirmation,
      risk_flags: riskFlags
    };
    
  } catch (error: any) {
    const auditEntry = createAuditEntry(
      context.userId,
      context.userRole,
      toolName,
      inputData,
      { error: error.message },
      'failed',
      ['execution_error'],
      `Tool execution failed: ${error.message}`
    );
    
    await storage.saveToolExecution(auditEntry);
    
    return {
      success: false,
      error: {
        code: 'EXECUTION_ERROR',
        message: error.message,
        details: error.stack
      },
      execution_time_ms: Date.now() - startTime,
      can_execute: false,
      risk_flags: ['execution_error']
    };
  }
}

// TRADING TOOLS

export async function handleGetMarketDataTradingView(req: Request, res: Response) {
  const context: ToolContext = {
    userId: req.body.userId || 'demo-user',
    userRole: req.body.userRole || 'analysis_only',
    sessionId: req.body.sessionId || 'default',
    requestId: req.body.requestId || Date.now().toString()
  };

  const schema = z.object({
    symbol: z.string(),
    interval: z.enum(['1m', '5m', '15m', '1h', '4h', '1d', '1w', '1M']),
    fields: z.array(z.string()).optional()
  });

  try {
    const input = schema.parse(req.body);
    
    const result = await executeToolSafely(
      'get_market_data_tradingview',
      context,
      async () => {
        // Mock implementation - replace with actual TradingView API
        return {
          symbol: input.symbol,
          interval: input.interval,
          timestamp: new Date().toISOString(),
          price: 100 + Math.random() * 50,
          volume: Math.floor(Math.random() * 1000000),
          change_percent: (Math.random() - 0.5) * 10,
          source: 'tradingview.com'
        };
      },
      input
    );
    
    res.json(result);
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: error.message },
      execution_time_ms: 0,
      can_execute: false,
      risk_flags: ['validation_error']
    });
  }
}

export async function handleSimulateOrder(req: Request, res: Response) {
  const context: ToolContext = {
    userId: req.body.userId || 'demo-user', 
    userRole: req.body.userRole || 'analysis_only',
    sessionId: req.body.sessionId || 'default',
    requestId: req.body.requestId || Date.now().toString()
  };

  const schema = z.object({
    broker: z.enum(['ibkr', 'xtb']),
    order_payload: z.object({
      symbol: z.string(),
      side: z.enum(['buy', 'sell']),
      qty: z.number().positive(),
      type: z.enum(['market', 'limit', 'stop']),
      limit_price: z.number().nullable().optional(),
      time_in_force: z.enum(['day', 'gtc'])
    })
  });

  try {
    const input = schema.parse(req.body);
    
    const result = await executeToolSafely(
      'simulate_order',
      context,
      async () => {
        const order = input.order_payload;
        const currentPrice = 100 + Math.random() * 50;
        const estimatedFill = order.type === 'market' ? currentPrice : (order.limit_price || currentPrice);
        const estimatedCost = estimatedFill * order.qty;
        
        // Risk checks
        const riskFlags = [];
        if (estimatedCost > 10000) riskFlags.push('high_value');
        if (order.qty > 1000) riskFlags.push('large_position');
        
        return {
          simulation_id: `sim_${Date.now()}`,
          broker: input.broker,
          order: order,
          estimated_fill_price: estimatedFill,
          estimated_total_cost: estimatedCost,
          estimated_commission: estimatedCost * 0.001,
          estimated_slippage: 0.01,
          risk_assessment: {
            risk_level: estimatedCost > 10000 ? 'high' : 'medium',
            flags: riskFlags,
            max_loss_estimate: estimatedCost * 0.05
          },
          can_execute: riskFlags.length === 0,
          timestamp: new Date().toISOString()
        };
      },
      input
    );
    
    res.json(result);
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: error.message },
      execution_time_ms: 0,
      can_execute: false,
      risk_flags: ['validation_error']
    });
  }
}

// NEWS TOOLS

export async function handleNewsSearchWhitelist(req: Request, res: Response) {
  const context: ToolContext = {
    userId: req.body.userId || 'demo-user',
    userRole: req.body.userRole || 'analysis_only', 
    sessionId: req.body.sessionId || 'default',
    requestId: req.body.requestId || Date.now().toString()
  };

  const schema = z.object({
    query: z.string().min(1),
    sources: z.array(z.enum(['bbc', 'nyt', 'bloomberg', 'wsj'])),
    date_range: z.object({
      from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/)
    }).optional()
  });

  try {
    const input = schema.parse(req.body);
    
    const result = await executeToolSafely(
      'news_search_whitelist',
      context,
      async () => {
        // Mock implementation - replace with actual news APIs
        const mockArticles = input.sources.map((source, index) => ({
          id: `article_${Date.now()}_${index}`,
          title: `${input.query} - Financial Analysis from ${source.toUpperCase()}`,
          summary: `Analysis of ${input.query} from trusted source ${source}`,
          url: `https://${source === 'nyt' ? 'nytimes' : source}.com/finance/article-${Date.now()}`,
          source: source,
          author: `${source} Editorial Team`,
          published_at: new Date().toISOString(),
          relevance_score: 0.85 + Math.random() * 0.15
        }));

        return {
          query: input.query,
          sources_searched: input.sources,
          articles: mockArticles,
          total_found: mockArticles.length,
          search_timestamp: new Date().toISOString(),
          whitelist_verified: true
        };
      },
      input
    );
    
    // Add source information
    if (result.success && result.data) {
      result.sources = result.data.articles.map((article: any) => ({
        title: article.title,
        url: article.url,
        date: article.published_at,
        domain: article.source
      }));
    }
    
    res.json(result);
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: error.message },
      execution_time_ms: 0,
      can_execute: false,
      risk_flags: ['validation_error']
    });
  }
}

// LEGAL TOOLS

export async function handleFetchGovLaw(req: Request, res: Response) {
  const context: ToolContext = {
    userId: req.body.userId || 'demo-user',
    userRole: req.body.userRole || 'analysis_only',
    sessionId: req.body.sessionId || 'default', 
    requestId: req.body.requestId || Date.now().toString()
  };

  const schema = z.object({
    jurisdiction: z.string().min(1),
    act_name: z.string().min(1),
    since_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional()
  });

  try {
    const input = schema.parse(req.body);
    
    const result = await executeToolSafely(
      'fetch_gov_law',
      context,
      async () => {
        // Mock implementation - replace with actual government API calls
        const govSources = {
          'US': 'congress.gov',
          'EU': 'eur-lex.europa.eu',
          'UK': 'legislation.gov.uk',
          'PL': 'sejm.gov.pl',
          'CH': 'admin.ch'
        };

        const source = govSources[input.jurisdiction as keyof typeof govSources] || 'unknown';
        
        return {
          jurisdiction: input.jurisdiction,
          act_name: input.act_name,
          source_url: `https://${source}/act/${input.act_name.toLowerCase().replace(/\s+/g, '-')}`,
          last_modified: new Date().toISOString(),
          content_summary: `Legal document: ${input.act_name} from ${input.jurisdiction} jurisdiction`,
          sections: [
            {
              section: 'Section 1',
              title: 'Definitions and Scope',
              content: `This section defines terms and scope for ${input.act_name}`
            },
            {
              section: 'Section 2', 
              title: 'Requirements and Obligations',
              content: `Key requirements under ${input.act_name}`
            }
          ],
          changes_since: input.since_date ? [] : undefined,
          is_current: true,
          official_source: true,
          whitelist_verified: true
        };
      },
      input
    );
    
    res.json(result);
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: error.message },
      execution_time_ms: 0,
      can_execute: false,
      risk_flags: ['validation_error']
    });
  }
}

// HELPER TOOLS

export async function handleCreateAuditNote(req: Request, res: Response) {
  const context: ToolContext = {
    userId: req.body.userId || 'demo-user',
    userRole: req.body.userRole || 'analysis_only',
    sessionId: req.body.sessionId || 'default',
    requestId: req.body.requestId || Date.now().toString()
  };

  const schema = z.object({
    content: z.string().min(1),
    tags: z.array(z.string()).optional()
  });

  try {
    const input = schema.parse(req.body);
    
    const result = await executeToolSafely(
      'create_audit_note',
      context,
      async () => {
        const noteId = `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        return {
          note_id: noteId,
          content: input.content,
          tags: input.tags || [],
          created_by: context.userId,
          session_id: context.sessionId,
          timestamp: new Date().toISOString(),
          stored: true
        };
      },
      input
    );
    
    res.json(result);
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: error.message },
      execution_time_ms: 0,
      can_execute: false,
      risk_flags: ['validation_error']
    });
  }
}

export async function handleChargeCustomer(req: Request, res: Response) {
  const context: ToolContext = {
    userId: req.body.userId || 'demo-user',
    userRole: req.body.userRole || 'analysis_only',
    sessionId: req.body.sessionId || 'default',
    requestId: req.body.requestId || Date.now().toString()
  };

  const schema = z.object({
    customer_id: z.string(),
    amount: z.number().positive(),
    currency: z.string().length(3),
    reason: z.string().min(1)
  });

  try {
    const input = schema.parse(req.body);
    
    const result = await executeToolSafely(
      'charge_customer',
      context,
      async () => {
        // This tool NEVER actually charges - only proposes
        return {
          proposal_id: `charge_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          customer_id: input.customer_id,
          amount: input.amount,
          currency: input.currency,
          reason: input.reason,
          status: 'PROPOSAL_CREATED',
          requires_approval: true,
          auto_execute: false,
          created_by: context.userId,
          timestamp: new Date().toISOString(),
          warning: 'This is only a proposal. No actual charge has been made.'
        };
      },
      input
    );
    
    // Always add high risk flag for billing operations
    if (result.success) {
      result.risk_flags.push('billing_operation');
      result.requires_confirmation = true;
    }
    
    res.json(result);
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: error.message },
      execution_time_ms: 0,
      can_execute: false,
      risk_flags: ['validation_error']
    });
  }
}