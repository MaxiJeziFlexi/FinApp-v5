// Tool contracts and JSON Schema definitions for LLM function calling
// LLM serves as reasoning engine, all actions executed through these tools

export interface ToolContract {
  name: string;
  description: string;
  parameters: any;
  requires_permissions?: string[];
  risk_level: 'low' | 'medium' | 'high';
  can_simulate: boolean;
}

// Trading Tools
export const TRADING_TOOLS: ToolContract[] = [
  {
    name: "get_market_data_tradingview",
    description: "Fetch real-time market data from TradingView",
    requires_permissions: ["market_data"],
    risk_level: "low",
    can_simulate: false,
    parameters: {
      type: "object",
      properties: {
        symbol: { type: "string" },
        interval: { 
          type: "string", 
          enum: ["1m", "5m", "15m", "1h", "4h", "1d", "1w", "1M"] 
        },
        fields: { 
          type: "array", 
          items: { type: "string" } 
        }
      },
      required: ["symbol", "interval"]
    }
  },
  {
    name: "get_quotes_ibkr",
    description: "Get quotes from Interactive Brokers",
    requires_permissions: ["ibkr_read"],
    risk_level: "low",
    can_simulate: false,
    parameters: {
      type: "object",
      properties: {
        symbols: { 
          type: "array", 
          items: { type: "string" } 
        }
      },
      required: ["symbols"]
    }
  },
  {
    name: "place_order_ibkr",
    description: "Place order through Interactive Brokers - REQUIRES SIMULATION FIRST",
    requires_permissions: ["ibkr_trade"],
    risk_level: "high",
    can_simulate: true,
    parameters: {
      type: "object",
      properties: {
        symbol: { type: "string" },
        side: { type: "string", enum: ["buy", "sell"] },
        qty: { type: "number" },
        type: { type: "string", enum: ["market", "limit", "stop"] },
        limit_price: { type: ["number", "null"] },
        time_in_force: { type: "string", enum: ["day", "gtc"] },
        client_order_id: { type: "string" }
      },
      required: ["symbol", "side", "qty", "type", "time_in_force", "client_order_id"]
    }
  },
  {
    name: "get_quotes_xtb",
    description: "Get quotes from XTB",
    requires_permissions: ["xtb_read"],
    risk_level: "low",
    can_simulate: false,
    parameters: {
      type: "object",
      properties: {
        symbols: { 
          type: "array", 
          items: { type: "string" } 
        }
      },
      required: ["symbols"]
    }
  },
  {
    name: "place_order_xtb",
    description: "Place order through XTB - REQUIRES SIMULATION FIRST",
    requires_permissions: ["xtb_trade"],
    risk_level: "high",
    can_simulate: true,
    parameters: {
      type: "object",
      properties: {
        symbol: { type: "string" },
        side: { type: "string", enum: ["buy", "sell"] },
        qty: { type: "number" },
        type: { type: "string", enum: ["market", "limit", "stop"] },
        limit_price: { type: ["number", "null"] },
        time_in_force: { type: "string", enum: ["day", "gtc"] },
        client_order_id: { type: "string" }
      },
      required: ["symbol", "side", "qty", "type", "time_in_force", "client_order_id"]
    }
  },
  {
    name: "simulate_order",
    description: "Simulate order execution before real placement - MANDATORY before place_order_*",
    requires_permissions: ["trade_simulate"],
    risk_level: "low",
    can_simulate: false,
    parameters: {
      type: "object",
      properties: {
        broker: { type: "string", enum: ["ibkr", "xtb"] },
        order_payload: { type: "object" }
      },
      required: ["broker", "order_payload"]
    }
  }
];

// News Tools (Whitelist enforced)
export const NEWS_TOOLS: ToolContract[] = [
  {
    name: "news_search_whitelist",
    description: "Search news from whitelisted sources only: BBC, NYT, Bloomberg, WSJ",
    requires_permissions: ["news_read"],
    risk_level: "low",
    can_simulate: false,
    parameters: {
      type: "object",
      properties: {
        query: { type: "string" },
        sources: { 
          type: "array", 
          items: { 
            type: "string", 
            enum: ["bbc", "nyt", "bloomberg", "wsj"] 
          } 
        },
        date_range: {
          type: "object",
          properties: {
            from: { type: "string", format: "date" },
            to: { type: "string", format: "date" }
          }
        }
      },
      required: ["query", "sources"]
    }
  }
];

// Legal Tools (Government sources only)
export const LEGAL_TOOLS: ToolContract[] = [
  {
    name: "fetch_gov_law",
    description: "Fetch legal documents from official government sources only",
    requires_permissions: ["legal_research"],
    risk_level: "low",
    can_simulate: false,
    parameters: {
      type: "object",
      properties: {
        jurisdiction: { type: "string" },
        act_name: { type: "string" },
        since_date: { type: "string", format: "date" }
      },
      required: ["jurisdiction", "act_name"]
    }
  }
];

// Real-Time Data Tools
export const REALTIME_TOOLS: ToolContract[] = [
  {
    name: "get_realtime_updates",
    description: "Get contextually relevant real-time updates from WSJ, Bloomberg, Reuters, NYT, BBC, Economic Calendar, Legal Changes, and TradingView",
    requires_permissions: ["realtime_data"],
    risk_level: "low",
    can_simulate: false,
    parameters: {
      type: "object",
      properties: {
        user_query: {
          type: "string",
          description: "User's request or query to determine contextual relevance"
        },
        sources: {
          type: "array",
          items: {
            type: "string",
            enum: ["wsj", "bloomberg", "reuters", "nyt", "bbc", "economic_calendar", "legal_updates", "tradingview"]
          },
          description: "Specific sources to fetch from (if empty, fetches from all)"
        },
        countries: {
          type: "array",
          items: {
            type: "string",
            enum: ["US", "EU", "UK", "PL"]
          },
          description: "Countries for legal and economic updates"
        },
        instruments: {
          type: "array",
          items: {
            type: "string"
          },
          description: "Specific financial instruments to track (stocks, forex, crypto)"
        },
        relevance_threshold: {
          type: "number",
          minimum: 0.0,
          maximum: 1.0,
          default: 0.7,
          description: "Minimum relevance score (0.0-1.0) for including updates"
        }
      },
      required: ["user_query"]
    }
  },
  {
    name: "setup_realtime_tracking",
    description: "Initialize contextual real-time tracking based on user's profile and requests",
    requires_permissions: ["realtime_setup"],
    risk_level: "low",
    can_simulate: false,
    parameters: {
      type: "object",
      properties: {
        user_query: {
          type: "string",
          description: "Initial user query to establish tracking context"
        },
        tracking_preferences: {
          type: "object",
          properties: {
            news_sources: {
              type: "array",
              items: {
                type: "string",
                enum: ["wsj", "bloomberg", "reuters", "nyt", "bbc"]
              }
            },
            economic_calendars: {
              type: "array",
              items: {
                type: "string",
                enum: ["US", "EU", "UK", "PL"]
              }
            },
            legal_jurisdictions: {
              type: "array",
              items: {
                type: "string",
                enum: ["US", "EU", "UK", "PL"]
              }
            },
            market_data: {
              type: "object",
              properties: {
                instruments: {
                  type: "array",
                  items: {
                    type: "string"
                  }
                },
                update_frequency: {
                  type: "string",
                  enum: ["real-time", "minute", "5min", "15min", "hourly"],
                  default: "real-time"
                }
              }
            }
          }
        }
      },
      required: ["user_query"]
    }
  }
];

// Helper Tools
export const HELPER_TOOLS: ToolContract[] = [
  {
    name: "retrieve_document",
    description: "Retrieve document from whitelisted sources",
    requires_permissions: ["document_read"],
    risk_level: "low",
    can_simulate: false,
    parameters: {
      type: "object",
      properties: {
        doc_id: { type: "string" },
        url_whitelisted: { type: "string" }
      }
    }
  },
  {
    name: "create_audit_note",
    description: "Create audit trail note",
    requires_permissions: ["audit_write"],
    risk_level: "low",
    can_simulate: false,
    parameters: {
      type: "object",
      properties: {
        content: { type: "string" },
        tags: { type: "array", items: { type: "string" } }
      },
      required: ["content"]
    }
  },
  {
    name: "create_task",
    description: "Create task for follow-up",
    requires_permissions: ["task_create"],
    risk_level: "low",
    can_simulate: false,
    parameters: {
      type: "object",
      properties: {
        title: { type: "string" },
        prompt: { type: "string" }
      },
      required: ["title", "prompt"]
    }
  },
  {
    name: "charge_customer",
    description: "Propose customer charge - REQUIRES BACKEND APPROVAL",
    requires_permissions: ["billing_propose"],
    risk_level: "high",
    can_simulate: true,
    parameters: {
      type: "object",
      properties: {
        customer_id: { type: "string" },
        amount: { type: "number" },
        currency: { type: "string" },
        reason: { type: "string" }
      },
      required: ["customer_id", "amount", "currency"]
    }
  }
];

// All tools combined
export const ALL_TOOLS = [
  ...TRADING_TOOLS,
  ...NEWS_TOOLS,
  ...LEGAL_TOOLS,
  ...REALTIME_TOOLS,
  ...HELPER_TOOLS
];

// Structured output schemas
export const STRUCTURED_OUTPUT_SCHEMAS = {
  PlanAction: {
    type: "object",
    properties: {
      type: { const: "PlanAction" },
      version: { const: "1.0" },
      goal: { type: "string" },
      assumptions: { type: "array", items: { type: "string" } },
      needed_data: {
        type: "array",
        items: {
          type: "object",
          properties: {
            name: { type: "string" },
            tool: { type: "string" },
            why: { type: "string" }
          },
          required: ["name", "tool", "why"]
        }
      },
      legal_checks: {
        type: "array",
        items: {
          type: "object",
          properties: {
            jurisdiction: { type: "string" },
            act_name: { type: "string" },
            since_date: { type: "string", pattern: "\\d{4}-\\d{2}-\\d{2}" },
            why: { type: "string" }
          },
          required: ["jurisdiction", "act_name", "why"]
        }
      },
      risk_flags: { type: "array", items: { type: "string" } },
      proposed_actions: {
        type: "array",
        items: {
          type: "object",
          properties: {
            id: { type: "string" },
            kind: { 
              type: "string", 
              enum: ["analysis", "order", "payment", "document", "task"] 
            },
            tool: { type: "string" },
            payload: { type: "object" },
            preconditions: { 
              type: "array", 
              items: { 
                type: "string",
                enum: ["simulate_ok", "limits_ok", "law_ok"]
              }
            },
            can_execute: { const: false },
            rationale: { type: "string" }
          },
          required: ["id", "kind", "tool", "payload", "preconditions", "can_execute", "rationale"]
        }
      }
    },
    required: ["type", "version", "goal", "assumptions", "needed_data", "legal_checks", "risk_flags", "proposed_actions"]
  },
  
  PlanVerification: {
    type: "object",
    properties: {
      type: { const: "PlanVerification" },
      version: { const: "1.0" },
      checks: {
        type: "object",
        properties: {
          law_ok: {
            type: "object",
            properties: {
              status: { type: "string", enum: ["unknown", "pass", "fail"] },
              evidence: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    source: { type: "string" },
                    title: { type: "string" },
                    date: { type: "string", pattern: "\\d{4}-\\d{2}-\\d{2}" }
                  },
                  required: ["source", "title", "date"]
                }
              }
            },
            required: ["status", "evidence"]
          },
          simulate_ok: {
            type: "object",
            properties: {
              status: { type: "string", enum: ["unknown", "pass", "fail"] },
              notes: { type: "string" }
            },
            required: ["status", "notes"]
          },
          limits_ok: {
            type: "object",
            properties: {
              status: { type: "string", enum: ["unknown", "pass", "fail"] },
              notes: { type: "string" }
            },
            required: ["status", "notes"]
          }
        },
        required: ["law_ok", "simulate_ok", "limits_ok"]
      },
      open_issues: { type: "array", items: { type: "string" } }
    },
    required: ["type", "version", "checks", "open_issues"]
  },
  
  Decision: {
    type: "object",
    properties: {
      type: { const: "Decision" },
      version: { const: "1.0" },
      summary: { type: "string" },
      approved_actions: { type: "array", items: { type: "string" } },
      deferred_actions: { type: "array", items: { type: "string" } },
      rejected_actions: { type: "array", items: { type: "string" } },
      next_questions: { type: "array", items: { type: "string" } }
    },
    required: ["type", "version", "summary", "approved_actions", "deferred_actions", "rejected_actions", "next_questions"]
  }
};