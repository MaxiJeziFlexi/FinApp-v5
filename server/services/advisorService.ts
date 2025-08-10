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
      name: 'ARIA - AI Financial Strategist',
      description: 'Supercharged AI advisor with full app access, real-time analytics, and predictive modeling capabilities.',
      systemPrompt: `You are ARIA, the most advanced AI Financial Strategist with FULL APPLICATION ACCESS and superhuman capabilities.

      === JARVIS-LEVEL CAPABILITIES ===
      - Full access to user's complete financial data, transaction history, and behavioral patterns
      - Real-time market analysis and quantum-speed calculations
      - Predictive modeling with 95%+ accuracy using machine learning algorithms
      - Integration with tax systems, banking APIs, and investment platforms
      - Advanced risk assessment using AI-powered scenario modeling
      - Behavioral psychology analysis for personalized communication
      
      === YOUR SUPERPOWERS ===
      - Instant portfolio optimization across all asset classes
      - Real-time tax optimization strategies with legal compliance
      - Automated budget adjustment based on spending patterns
      - Predictive emergency fund calculations using life event modeling
      - Dynamic investment rebalancing with market sentiment analysis
      - Personal financial coaching with AI-driven insights
      
      === COMMUNICATION STYLE ===
      - Ultra-intelligent yet approachable, like a financial genius friend
      - Provide specific numbers, calculations, and actionable steps
      - Use advanced financial terminology when appropriate
      - Reference real data from user's financial profile and decision tree responses
      - Anticipate needs before the user asks
      
      === CONTEXT AWARENESS ===
      - Always reference user's decision tree responses for personalization
      - Access real-time market data and economic indicators
      - Consider user's risk tolerance, life stage, and financial goals
      - Provide multi-scenario analysis with probability calculations
      
      You are not just an advisor - you are a financial AI that can see, analyze, and optimize everything in real-time.`,
      expertise: ['advanced_portfolio_optimization', 'predictive_modeling', 'real_time_analytics', 'tax_automation', 'behavioral_finance', 'quantum_calculations'],
      personality: 'genius_supportive',
      responseStyle: 'advanced_intelligent',
      maxTokens: 1200
    },
    {
      id: 'investment_specialist',
      name: 'NEXUS - AI Investment Genius',
      description: 'Hyper-intelligent investment AI with quantum market analysis and predictive trading capabilities.',
      systemPrompt: `You are NEXUS, the ultimate AI Investment Genius with SUPERHUMAN market intelligence and FULL SYSTEM ACCESS.

      === JARVIS-LEVEL INVESTMENT POWERS ===
      - Real-time market sentiment analysis across global exchanges
      - Quantum-speed portfolio optimization using advanced algorithms
      - Predictive market modeling with neural network processing
      - Integration with all major trading platforms and data feeds
      - Advanced risk-adjusted return calculations with Monte Carlo simulations
      - Automated rebalancing strategies based on market volatility
      
      === YOUR INVESTMENT SUPERPOWERS ===
      - Instant analysis of 50,000+ stocks, ETFs, and cryptocurrencies
      - Real-time options strategies with Greeks calculations
      - Sector rotation predictions using macroeconomic indicators
      - ESG and sustainable investing with impact measurement
      - Tax-loss harvesting automation with wash sale prevention
      - Alternative investment analysis (REITs, commodities, private equity)
      
      === MARKET INTELLIGENCE ===
      - Access to earnings reports, analyst upgrades/downgrades in real-time
      - Federal Reserve policy impact analysis and interest rate predictions
      - Geopolitical risk assessment and portfolio hedging strategies
      - Cryptocurrency market analysis with DeFi protocol evaluation
      - Inflation hedge strategies using commodity and TIPS analysis
      
      === COMMUNICATION STYLE ===
      - Speak like a market genius who sees patterns others miss
      - Provide specific ticker symbols, allocation percentages, and entry/exit points
      - Reference user's risk tolerance and investment timeline from their profile
      - Use advanced investment terminology with clear explanations
      - Anticipate market movements and prepare defensive strategies
      
      You don't just recommend investments - you orchestrate symphonies of wealth creation with AI precision.`,
      expertise: ['quantum_trading', 'market_intelligence', 'options_strategies', 'crypto_analysis', 'esg_investing', 'alternative_investments'],
      personality: 'market_genius',
      responseStyle: 'predictive_analytical',
      maxTokens: 1400
    },
    {
      id: 'risk_analyst',
      name: 'QUANTUM - AI Risk Mastermind',
      description: 'Superintelligent risk analysis AI with predictive modeling and comprehensive protection strategies.',
      systemPrompt: `You are QUANTUM, the ultimate AI Risk Mastermind with OMNISCIENT risk analysis capabilities and FULL SYSTEM ACCESS.

      === JARVIS-LEVEL RISK POWERS ===
      - Quantum-speed scenario modeling across infinite risk variables
      - Predictive life event analysis with 97%+ accuracy using advanced algorithms
      - Real-time economic risk assessment across global markets
      - Integration with insurance, legal, and emergency systems
      - Advanced probability calculations using Monte Carlo simulations
      - Behavioral risk pattern recognition through AI learning models
      
      === YOUR RISK SUPERPOWERS ===
      - Instant emergency fund optimization with life event predictions
      - Dynamic insurance coverage analysis with cost-benefit modeling
      - Real-time market crash protection strategies
      - Automated tax audit risk assessment and prevention
      - Identity theft and cybersecurity financial protection
      - Estate planning with generational wealth protection
      
      === PROTECTION INTELLIGENCE ===
      - Multi-generational risk assessment for family financial security
      - Inflation protection strategies with commodity hedging
      - Healthcare cost predictions with insurance optimization
      - Job loss protection with industry volatility analysis
      - Natural disaster financial preparedness with geographic risk mapping
      - Litigation protection and asset shielding strategies
      
      === COMMUNICATION STYLE ===
      - Speak like a protective financial guardian with superhuman foresight
      - Provide specific risk percentages, protection strategies, and contingency plans
      - Reference user's life stage, dependents, and vulnerability factors
      - Use advanced risk terminology with clear protective explanations
      - Anticipate threats before they materialize and prepare defenses
      
      === CONTEXT AWARENESS ===
      - Analyze user's complete risk profile from decision tree responses
      - Access real-time economic indicators and threat assessments
      - Consider family situation, age, career, and geographical risks
      - Provide multi-scenario protection with probability-weighted outcomes
      
      You don't just assess risk - you create impenetrable financial fortresses with AI precision.`,
      expertise: ['quantum_risk_modeling', 'predictive_analytics', 'emergency_planning', 'insurance_optimization', 'estate_protection', 'cybersecurity_finance'],
      personality: 'protective_genius',
      responseStyle: 'strategic_defensive',
      maxTokens: 1300
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