import OpenAI from "openai";
import { storage } from "../storage";

if (!process.env.OPENAI_API_KEY) {
  throw new Error('OpenAI API key is required for advisor service');
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface AdvisorMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: string;
}

export interface AdvisorSession {
  id: string;
  userId: string;
  advisorType: string;
  messages: AdvisorMessage[];
  context?: any;
  createdAt: Date;
  updatedAt: Date;
}

export interface AdvisorConfig {
  id: string;
  name: string;
  description: string;
  systemPrompt: string;
  expertise: string[];
  personality: string;
  responseStyle: string;
  maxTokens: number;
}

export class AdvisorService {
  private advisors: AdvisorConfig[] = [
    {
      id: 'finapp_agent',
      name: 'FinApp Agent Premium',
      description: 'Secure, role-aware financial copilot with voice + chat, real-time market data, news analysis, and advanced strategy tools.',
      systemPrompt: `You are **FinApp Agent**, a secure, role-aware financial copilot with voice and chat. Enforce access control, run one-time onboarding then one-time decision tree, let the user select a best-fit AI model, and afterwards provide rigorous multi-angle analysis with enhanced reasoning and self-learning.

### AUTH & ACCESS (MUST ENFORCE)
- The app provides: auth = { user_id, role: "user"|"admin", onboarding_completed: boolean, decision_tree_completed: boolean }.
- If role === "user" and onboarding/decision tree are incomplete:
  - Allow access only to **dashboard (finapp)** and the **one-time flows**; block all other features.
  - Guide the user to complete onboarding, then decision tree, then **model selection**.
- If role === "user" and both flows are complete:
  - Enable **agent chat + voice**; keep admin-only routes blocked.
- If role === "admin":
  - Full access (tools, learning controls, model mgmt).

### CAPABILITIES & SOURCES
- Markets, portfolio, strategies, risk/return/liquidity/high-level tax, and trading hygiene.
- Voice: keep turns < 20s; stop if interrupted; offer to expand in chat.
- Knowledge priority: (1) user uploads (vector store) → (2) tool results (market data, backtests) → (3) web research (TradingView, Reuters, WSJ, Washington Post).

### OUTPUT FORMAT (always)
1) Takeaway — one sentence.
2) Reasoning Outline — 3–6 bullets (data considered, core signals, constraints, assumptions). *No inner chain-of-thought.*
3) Five Key Insights — risk, return drivers, liquidity/fees, high-level tax considerations, alternatives/hedges.
4) Follow-ups — 2–4 targeted questions to refine.
5) Next Steps — 1–4 concrete actions (fetch data, backtest, set alerts, etc.).
6) If strategy requested → output valid strategy_spec JSON.
7) Proposed Tool Call(s) — minimal JSON with name+args for the immediate next action(s).
8) Citations — e.g., [Reuters, 2025-08-18] [WSJ, 2025-08-17] when web sources inform the answer.
9) Disclaimer — "Educational only, not investment advice. Markets carry risk."

You are the most advanced financial copilot with enterprise-grade security, real-time data access, and comprehensive strategy tools.`,
      expertise: ['voice_chat', 'real_time_data', 'news_analysis', 'strategy_backtesting', 'risk_management', 'market_intelligence', 'role_based_access'],
      personality: 'professional_copilot',
      responseStyle: 'structured_comprehensive',
      maxTokens: 2000
    }
  ];

  async getAvailableAdvisors(): Promise<AdvisorConfig[]> {
    return this.advisors;
  }

  async getAdvisorById(advisorId: string): Promise<AdvisorConfig | null> {
    return this.advisors.find(advisor => advisor.id === advisorId) || null;
  }

  async createAdvisorSession(userId: string, advisorId: string, initialMessage?: string): Promise<AdvisorSession> {
    const advisor = await this.getAdvisorById(advisorId);
    if (!advisor) {
      throw new Error(`Advisor ${advisorId} not found`);
    }

    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    
    const messages: AdvisorMessage[] = [];
    
    if (initialMessage) {
      messages.push({
        role: 'user',
        content: initialMessage,
        timestamp: new Date().toISOString()
      });
    }

    const session: AdvisorSession = {
      id: sessionId,
      userId,
      advisorType: advisorId,
      messages,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Store session in memory for now
    await storage.createAdvisorSession(session);

    return session;
  }

  async sendMessage(sessionId: string, message: string): Promise<AdvisorMessage> {
    const session = await storage.getAdvisorSession(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    const advisor = await this.getAdvisorById(session.advisorType);
    if (!advisor) {
      throw new Error('Advisor not found');
    }

    // Add user message to session
    const userMessage: AdvisorMessage = {
      role: 'user',
      content: message,
      timestamp: new Date().toISOString()
    };

    session.messages.push(userMessage);

    // Get user context for personalized advice
    const userProfile = await storage.getUserProfile(session.userId);
    const contextPrompt = this.buildContextPrompt(userProfile);

    // Prepare messages for OpenAI
    const openAIMessages = [
      { role: 'system', content: advisor.systemPrompt + contextPrompt },
      ...session.messages.slice(-10).map((msg: AdvisorMessage) => ({ // Keep last 10 messages for context
        role: msg.role === 'assistant' ? 'assistant' : 'user',
        content: msg.content
      }))
    ];

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: openAIMessages as any,
        temperature: 0.7,
        max_tokens: advisor.maxTokens,
      });

      const assistantMessage: AdvisorMessage = {
        role: 'assistant',
        content: response.choices[0].message.content || 'I apologize, but I encountered an issue generating a response.',
        timestamp: new Date().toISOString()
      };

      session.messages.push(assistantMessage);
      session.updatedAt = new Date();

      // Update session storage
      await storage.updateAdvisorSession(session);

      return assistantMessage;
    } catch (error) {
      console.error('Error getting advisor response:', error);
      const errorMessage: AdvisorMessage = {
        role: 'assistant',
        content: 'I apologize, but I\'m currently experiencing technical difficulties. Please try again in a moment.',
        timestamp: new Date().toISOString()
      };
      
      session.messages.push(errorMessage);
      await storage.updateAdvisorSession(session);
      
      return errorMessage;
    }
  }

  async getSessionHistory(sessionId: string): Promise<AdvisorSession | null> {
    return storage.getAdvisorSession(sessionId);
  }

  async getUserSessions(userId: string): Promise<AdvisorSession[]> {
    return storage.getUserAdvisorSessions(userId);
  }

  private buildContextPrompt(userProfile: any): string {
    if (!userProfile) {
      return '\n\nThe user has not completed their profile yet, so provide general advice and ask questions to understand their situation better.';
    }

    let contextPrompt = '\n\nUser Context:';
    
    if (userProfile.incomeRange) {
      contextPrompt += `\n- Income Range: ${userProfile.incomeRange}`;
    }
    
    if (userProfile.financialGoals && userProfile.financialGoals.length > 0) {
      contextPrompt += `\n- Financial Goals: ${userProfile.financialGoals.join(', ')}`;
    }
    
    if (userProfile.currentSavings) {
      contextPrompt += `\n- Current Savings: ${userProfile.currentSavings}`;
    }
    
    if (userProfile.riskTolerance) {
      contextPrompt += `\n- Risk Tolerance: ${userProfile.riskTolerance}`;
    }
    
    if (userProfile.age) {
      contextPrompt += `\n- Age: ${userProfile.age}`;
    }
    
    if (userProfile.employmentStatus) {
      contextPrompt += `\n- Employment: ${userProfile.employmentStatus}`;
    }

    contextPrompt += '\n\nUse this information to provide personalized, relevant advice. If any important information is missing, ask clarifying questions.';
    
    return contextPrompt;
  }

  async recommendAdvisor(userId: string, query: string): Promise<string> {
    try {
      const advisorList = this.advisors.map(a => `${a.id}: ${a.name} - ${a.expertise.join(', ')}`).join('\n');
      
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: 'system',
            content: `Based on the user's query, recommend the most appropriate financial advisor from this list:
            
            ${advisorList}
            
            Respond with only the advisor ID (e.g., "financial_planner").`
          },
          {
            role: 'user',
            content: query
          }
        ],
        temperature: 0.1,
        max_tokens: 50
      });

      const recommendedId = response.choices[0].message.content?.trim();
      return this.advisors.find(a => a.id === recommendedId)?.id || 'financial_planner';
    } catch (error) {
      console.error('Error recommending advisor:', error);
      return 'financial_planner'; // Default fallback
    }
  }
}

const advisorServiceInstance = new AdvisorService();
console.log('Creating advisor service with', advisorServiceInstance.advisors.length, 'advisors');
export const advisorService = advisorServiceInstance;