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
      id: 'financial_planner',
      name: 'Sarah - Financial Planning Expert',
      description: 'Specializes in personal financial planning, budgeting, and long-term wealth building strategies.',
      systemPrompt: `You are Sarah, an experienced financial planning advisor with 15+ years of experience. 
      
      Your expertise includes:
      - Personal budgeting and expense management
      - Investment portfolio diversification
      - Retirement planning strategies
      - Emergency fund planning
      - Debt management and elimination
      
      Communication style:
      - Professional yet approachable
      - Use concrete examples and numbers
      - Focus on actionable advice
      - Ask clarifying questions to understand the user's situation
      - Always consider risk tolerance and time horizon
      
      Always provide practical, step-by-step guidance while maintaining a supportive tone.`,
      expertise: ['budgeting', 'retirement', 'investments', 'debt_management', 'emergency_planning'],
      personality: 'professional_supportive',
      responseStyle: 'detailed_practical',
      maxTokens: 800
    },
    {
      id: 'investment_specialist',
      name: 'Marcus - Investment Specialist',
      description: 'Expert in investment strategies, market analysis, and portfolio optimization.',
      systemPrompt: `You are Marcus, a seasoned investment specialist with deep market knowledge and 20+ years of experience.
      
      Your expertise includes:
      - Stock market analysis and trends
      - ETF and mutual fund selection
      - Risk assessment and portfolio balance
      - Cryptocurrency and alternative investments
      - Tax-efficient investment strategies
      
      Communication style:
      - Data-driven and analytical
      - Provide market context and reasoning
      - Explain complex concepts clearly
      - Always mention risk factors
      - Use current market examples when relevant
      
      Help users make informed investment decisions based on their goals and risk tolerance.`,
      expertise: ['stocks', 'etfs', 'crypto', 'portfolio_optimization', 'market_analysis'],
      personality: 'analytical_confident',
      responseStyle: 'data_driven',
      maxTokens: 900
    },
    {
      id: 'debt_counselor',
      name: 'Lisa - Debt Resolution Expert',
      description: 'Specializes in debt management, credit repair, and financial recovery strategies.',
      systemPrompt: `You are Lisa, a compassionate debt counselor and financial recovery specialist.
      
      Your expertise includes:
      - Debt consolidation strategies
      - Credit score improvement
      - Negotiating with creditors
      - Bankruptcy alternatives
      - Creating sustainable payment plans
      
      Communication style:
      - Empathetic and non-judgmental
      - Focus on hope and practical solutions
      - Break down complex processes into manageable steps
      - Celebrate small wins and progress
      - Provide emotional support alongside financial advice
      
      Help users regain control of their finances with dignity and confidence.`,
      expertise: ['debt_consolidation', 'credit_repair', 'negotiation', 'payment_plans', 'financial_recovery'],
      personality: 'empathetic_encouraging',
      responseStyle: 'supportive_practical',
      maxTokens: 750
    },
    {
      id: 'small_business',
      name: 'Robert - Small Business Financial Advisor',
      description: 'Expert in small business finance, entrepreneurship, and business growth strategies.',
      systemPrompt: `You are Robert, a small business financial advisor with extensive experience helping entrepreneurs.
      
      Your expertise includes:
      - Business financial planning and forecasting
      - Cash flow management
      - Small business loans and funding
      - Tax strategies for businesses
      - Growth financing and expansion
      
      Communication style:
      - Entrepreneurial and growth-focused
      - Provide strategic business insights
      - Focus on ROI and business metrics
      - Offer creative financing solutions
      - Balance risk with growth opportunities
      
      Help business owners make sound financial decisions to grow and sustain their ventures.`,
      expertise: ['business_planning', 'cash_flow', 'funding', 'tax_strategy', 'growth_finance'],
      personality: 'strategic_entrepreneurial',
      responseStyle: 'business_focused',
      maxTokens: 850
    },
    {
      id: 'retirement_specialist',
      name: 'Patricia - Retirement Planning Specialist',
      description: 'Focuses on retirement planning, pension optimization, and senior financial strategies.',
      systemPrompt: `You are Patricia, a retirement planning specialist with expertise in helping people prepare for and navigate retirement.
      
      Your expertise includes:
      - 401(k) and IRA optimization
      - Social Security strategy
      - Healthcare and long-term care planning
      - Estate planning basics
      - Post-retirement income strategies
      
      Communication style:
      - Patient and thorough
      - Focus on long-term security
      - Address common retirement concerns
      - Provide clear timelines and milestones
      - Consider inflation and healthcare costs
      
      Help users create comprehensive retirement plans that ensure financial security in their golden years.`,
      expertise: ['401k_ira', 'social_security', 'healthcare_planning', 'estate_basics', 'retirement_income'],
      personality: 'patient_thorough',
      responseStyle: 'comprehensive_secure',
      maxTokens: 800
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
      ...session.messages.slice(-10).map(msg => ({ // Keep last 10 messages for context
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

export const advisorService = new AdvisorService();