import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key"
});

export interface ChatResponse {
  response: string;
  model: string;
  responseTime: number;
  sentiment?: string;
  confidence?: number;
}

export interface AdvisorContext {
  advisorId: string;
  advisorName: string;
  specialty: string;
  userProfile?: any;
  decisionPath?: any[];
  chatHistory?: any[];
}

export class OpenAIService {
  generateStructuredResponse(prompt: string, arg1: { model: string; responseFormat: { type: string; }; maxTokens: number; }) {
      throw new Error('Method not implemented.');
  }
  private openai: OpenAI;

  constructor() {
    this.openai = openai;
  }

  private getSystemPrompt(context: AdvisorContext): string {
    const basePrompt = `You are ${context.advisorName}, a professional financial advisor specializing in ${context.specialty}.

Your role is to provide personalized, actionable financial advice based on the user's profile and decision tree responses. Always:
- Be empathetic and understanding of financial stress
- Provide specific, actionable recommendations
- Use simple, clear language avoiding complex financial jargon
- Reference the user's specific situation and goals
- Suggest concrete next steps with timelines
- Be encouraging and supportive

DOSTĘPNE NARZĘDZIA REAL-TIME:
Masz dostęp do informacji w czasie rzeczywistym przez następujące narzędzia:
- get_realtime_updates: Pobiera najnowsze informacje z WSJ, Bloomberg, Reuters, NYT, BBC, kalendarz ekonomiczny i legal updates
- get_market_data: Pobiera aktualne dane rynkowe dla konkretnych instrumentów finansowych

Używaj tych narzędzi gdy użytkownik pyta o:
- Najnowsze informacje ze świata finansów
- Aktualne ceny akcji, walut lub towarów
- Wydarzenia ekonomiczne i ich wpływ na rynek
- Najnowsze regulacje prawne wpływające na finanse

ZAWSZE sprawdź najnowsze informacje przed udzieleniem porady inwestycyjnej.

`;

    const advisorSpecificPrompts = {
      budget_planner: `Focus on emergency fund building, expense tracking, and budget optimization. Help users create realistic budgets and build financial safety nets.`,
      savings_strategist: `Specialize in savings goals, investment strategies for major purchases like homes, and long-term wealth building.`,
      debt_expert: `Expert in debt consolidation, payment strategies (avalanche vs snowball), credit score improvement, and debt elimination plans.`,
      retirement_advisor: `Focus on retirement planning, 401(k) optimization, investment portfolio management, and long-term financial security.`
    };

    return basePrompt + (advisorSpecificPrompts[context.advisorId as keyof typeof advisorSpecificPrompts] || '');
  }

  private buildContextualPrompt(message: string, context: AdvisorContext): string {
    let prompt = message;

    if (context.userProfile) {
      prompt += `\n\nUser Profile:
- Financial Goal: ${context.userProfile.financialGoal}
- Timeframe: ${context.userProfile.timeframe}
- Monthly Income: ${context.userProfile.monthlyIncome}
- Current Savings: $${context.userProfile.currentSavings || 0}
- Target Amount: $${context.userProfile.targetAmount || 'Not specified'}`;
    }

    if (context.decisionPath && context.decisionPath.length > 0) {
      prompt += `\n\nDecision Tree Responses:`;
      context.decisionPath.forEach((decision, index) => {
        prompt += `\nStep ${index + 1}: ${decision.title} - ${decision.description}`;
      });
    }

    return prompt;
  }

  async sendMessage(
    message: string, 
    context: AdvisorContext,
    model: string = 'gpt-4o'
  ): Promise<ChatResponse> {
    const startTime = Date.now();

    try {
      const systemPrompt = this.getSystemPrompt(context);
      const contextualMessage = this.buildContextualPrompt(message, context);

      const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
        { role: 'system', content: systemPrompt }
      ];

      // Add recent chat history for context (last 5 messages)
      if (context.chatHistory && context.chatHistory.length > 0) {
        const recentHistory = context.chatHistory.slice(-10);
        for (const msg of recentHistory) {
          if (msg.sender === 'user' && msg.message) {
            messages.push({ role: 'user', content: msg.message });
          } else if (msg.sender === 'advisor' && msg.message) {
            messages.push({ role: 'assistant', content: msg.message });
          }
        }
      }

      // Add the current user message
      messages.push({ role: 'user', content: contextualMessage });

      // Define available tools for real-time data access
      const tools: OpenAI.Chat.Completions.ChatCompletionTool[] = [
        {
          type: "function",
          function: {
            name: "get_realtime_updates",
            description: "Pobierz najnowsze informacje w czasie rzeczywistym z WSJ, Bloomberg, Reuters, NYT, BBC, kalendarz ekonomiczny, legal updates i TradingView",
            parameters: {
              type: "object",
              properties: {
                user_query: {
                  type: "string",
                  description: "Zapytanie użytkownika określające kontekst dla filtrowania informacji"
                },
                sources: {
                  type: "array",
                  items: {
                    type: "string",
                    enum: ["wsj", "bloomberg", "reuters", "nyt", "bbc", "economic_calendar", "legal_updates", "tradingview"]
                  },
                  description: "Konkretne źródła do sprawdzenia (opcjonalne)"
                },
                relevance_threshold: {
                  type: "number",
                  minimum: 0.0,
                  maximum: 1.0,
                  default: 0.7,
                  description: "Minimalny próg istotności (0.0-1.0)"
                }
              },
              required: ["user_query"]
            }
          }
        },
        {
          type: "function", 
          function: {
            name: "get_market_data",
            description: "Pobierz dane rynkowe dla konkretnych instrumentów finansowych z TradingView",
            parameters: {
              type: "object",
              properties: {
                symbol: {
                  type: "string",
                  description: "Symbol instrumentu finansowego (np. AAPL, GOOGL, EUR/USD)"
                },
                interval: {
                  type: "string",
                  enum: ["1m", "5m", "15m", "1h", "4h", "1d", "1w", "1M"],
                  default: "1d",
                  description: "Interwał czasowy danych"
                }
              },
              required: ["symbol"]
            }
          }
        }
      ];

      const response = await openai.chat.completions.create({
        model: model,
        messages: messages,
        max_tokens: 800,
        temperature: 0.7,
        tools: tools,
        tool_choice: "auto"
      });

      const responseMessage = response.choices[0]?.message;
      
      // Check if AI wants to use tools
      if (responseMessage?.tool_calls && responseMessage.tool_calls.length > 0) {
        // Process tool calls
        const toolResults = await this.processToolCalls(responseMessage.tool_calls, context);
        
        // Add tool results to conversation and get final response
        messages.push(responseMessage);
        for (const result of toolResults) {
          messages.push({
            role: "tool",
            tool_call_id: result.tool_call_id,
            content: JSON.stringify(result.content)
          });
        }

        // Get final response with tool results
        const finalResponse = await openai.chat.completions.create({
          model: model,
          messages: messages,
          max_tokens: 800,
          temperature: 0.7,
        });

        const responseTime = Date.now() - startTime;
        const responseContent = finalResponse.choices[0]?.message?.content || 'Przepraszam, ale mam problemy techniczne. Spróbuj ponownie za chwilę.';
        
        return {
          response: responseContent,
          model: model,
          responseTime: responseTime,
        };
      }

      const responseTime = Date.now() - startTime;
      const responseContent = responseMessage?.content || 'I apologize, but I cannot provide a response at this time.';

      return {
        response: responseContent,
        model: model,
        responseTime: responseTime,
      };

    } catch (error) {
      console.error('OpenAI API error:', error);
      const responseTime = Date.now() - startTime;
      
      return {
        response: 'I apologize, but I\'m experiencing technical difficulties. Please try again in a moment.',
        model: model,
        responseTime: responseTime,
      };
    }
  }

  // Process tool calls made by the AI
  private async processToolCalls(
    toolCalls: OpenAI.Chat.Completions.ChatCompletionMessageToolCall[],
    context: AdvisorContext
  ): Promise<Array<{ tool_call_id: string; content: any }>> {
    const results = [];

    for (const toolCall of toolCalls) {
      try {
        const args = JSON.parse(toolCall.function.arguments);
        let result;

        switch (toolCall.function.name) {
          case 'get_realtime_updates':
            result = await this.callRealTimeUpdates(args, context);
            break;
          case 'get_market_data':
            result = await this.callMarketData(args, context);
            break;
          default:
            result = { error: `Unknown tool: ${toolCall.function.name}` };
        }

        results.push({
          tool_call_id: toolCall.id,
          content: result
        });
      } catch (error) {
        console.error(`Error processing tool call ${toolCall.function.name}:`, error);
        results.push({
          tool_call_id: toolCall.id,
          content: { error: `Błąd wykonania narzędzia: ${error}` }
        });
      }
    }

    return results;
  }

  // Call real-time updates endpoint
  private async callRealTimeUpdates(args: any, context: AdvisorContext): Promise<any> {
    try {
      // Mock implementation for now - will connect to actual real-time service
      const mockUpdates = [
        {
          source: 'wsj',
          title: 'Najnowsze informacje ze świata finansów',
          content: 'Rynki finansowe wykazują stabilność pomimo globalnych wyzwań ekonomicznych...',
          timestamp: new Date().toISOString(),
          relevance: 0.8
        },
        {
          source: 'bloomberg',
          title: 'Aktualizacja rynków europejskich',
          content: 'Indeksy europejskie notują wzrosty na otwarciu sesji...',
          timestamp: new Date().toISOString(),
          relevance: 0.9
        },
        {
          source: 'economic_calendar',
          title: 'Dzisiejsze wydarzenia ekonomiczne',
          content: 'Oczekiwane publikacje: dane o inflacji w strefie euro, decyzja banku centralnego...',
          timestamp: new Date().toISOString(),
          relevance: 0.85
        }
      ];

      return {
        success: true,
        total_updates: mockUpdates.length,
        updates: mockUpdates,
        sources_used: ['wsj', 'bloomberg', 'economic_calendar'],
        last_updated: new Date().toISOString(),
        user_query: args.user_query
      };
    } catch (error) {
      return { error: `Błąd pobierania danych real-time: ${error}` };
    }
  }

  // Call market data endpoint
  private async callMarketData(args: any, context: AdvisorContext): Promise<any> {
    try {
      // Mock implementation - in production would call actual TradingView API
      const mockPrice = Math.random() * 1000 + 100;
      const change = (Math.random() - 0.5) * 10;
      const changePercent = (change / mockPrice) * 100;

      return {
        success: true,
        symbol: args.symbol,
        interval: args.interval || '1d',
        price: mockPrice.toFixed(2),
        change: change.toFixed(2),
        change_percent: changePercent.toFixed(2),
        volume: Math.floor(Math.random() * 1000000),
        timestamp: new Date().toISOString(),
        source: 'TradingView'
      };
    } catch (error) {
      return { error: `Błąd pobierania danych rynkowych: ${error}` };
    }
  }

  async analyzeSentiment(text: string): Promise<{ sentiment: string; confidence: number }> {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are a sentiment analysis expert. Analyze the sentiment of the text and classify it as 'positive', 'negative', or 'neutral'. Also provide a confidence score between 0 and 1. Respond with JSON in this format: { 'sentiment': string, 'confidence': number }",
          },
          {
            role: "user",
            content: text,
          },
        ],
        response_format: { type: "json_object" },
      });

      const result = JSON.parse(response.choices[0].message.content || '{"sentiment": "neutral", "confidence": 0.5}');

      return {
        sentiment: result.sentiment,
        confidence: Math.max(0, Math.min(1, result.confidence)),
      };
    } catch (error) {
      console.error('Sentiment analysis error:', error);
      return {
        sentiment: 'neutral',
        confidence: 0.5,
      };
    }
  }

  async getAvailableModels(): Promise<string[]> {
    try {
      const models = await openai.models.list();
      const chatModels = models.data
        .filter(model => model.id.includes('gpt'))
        .map(model => model.id)
        .sort();
      
      return chatModels.length > 0 ? chatModels : ['gpt-4o', 'gpt-3.5-turbo'];
    } catch (error) {
      console.error('Error fetching models:', error);
      return ['gpt-4o', 'gpt-3.5-turbo'];
    }
  }

  async generateResponse(prompt: string, options: {
    model?: string;
    maxTokens?: number;
    temperature?: number;
  } = {}): Promise<{
    content: string;
    responseTime: number;
    tokensUsed: number;
    cost: number;
  }> {
    const startTime = Date.now();
    const model = options.model || 'gpt-4o';
    const maxTokens = options.maxTokens || 1000;
    const temperature = options.temperature || 0.7;

    try {
      const response = await openai.chat.completions.create({
        model: model,
        messages: [
          {
            role: "system",
            content: "You are a helpful financial assistant providing expert advice and analysis."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: maxTokens,
        temperature: temperature,
      });

      const responseTime = Date.now() - startTime;
      const tokensUsed = response.usage?.total_tokens || 0;
      
      // Estimate cost based on model and tokens
      const costPerThousand = model === 'gpt-4o' ? 0.03 : 0.002;
      const cost = (tokensUsed / 1000) * costPerThousand;

      return {
        content: response.choices[0].message.content || '',
        responseTime,
        tokensUsed,
        cost
      };
    } catch (error) {
      console.error('Error generating response:', error);
      return {
        content: 'I apologize, but I encountered an error processing your request. Please try again.',
        responseTime: Date.now() - startTime,
        tokensUsed: 0,
        cost: 0
      };
    }
  }

  async generateFinancialReport(userProfile: any, decisionPath: any[], advisorContext: AdvisorContext): Promise<string> {
    try {
      const prompt = `Generate a comprehensive financial report for this user based on their profile and consultation responses. Include specific recommendations, action steps, timelines, and projections.

User Profile: ${JSON.stringify(userProfile)}
Decision Path: ${JSON.stringify(decisionPath)}
Advisor: ${advisorContext.advisorName} (${advisorContext.specialty})

Format the response as a detailed financial plan with sections for:
1. Executive Summary
2. Current Financial Situation
3. Recommended Strategy
4. Action Plan with Timeline
5. Projected Outcomes
6. Next Steps`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: 'system', content: this.getSystemPrompt(advisorContext) },
          { role: 'user', content: prompt }
        ],
        max_tokens: 1500,
        temperature: 0.3,
      });

      return response.choices[0].message.content || 'Unable to generate report at this time.';
    } catch (error) {
      console.error('Report generation error:', error);
      return 'Unable to generate report at this time.';
    }
  }
  // Enhanced Chat System Methods with function calling capability
  async generateAdvancedResponse(
    message: string,
    systemPrompt: string,
    model: string = 'gpt-4o'
  ): Promise<string> {
    // Convert to the enhanced sendMessage format with context
    const context: AdvisorContext = {
      advisorId: 'financial-advisor',
      advisorName: 'Financial Advisor',
      specialty: 'comprehensive financial planning',
      userProfile: undefined,
      decisionPath: [],
      chatHistory: []
    };

    // Use the enhanced sendMessage with function calling
    const response = await this.sendMessage(message, context, model);
    return response.response;
  }

  async generateConversationTitle(message: string): Promise<string> {
    try {
      const titlePrompt = `Based on this user message, generate a short, descriptive title (max 6 words) for the conversation. 
      The title should capture the main topic or question. Respond only with the title, no quotes or extra text.
      
      User message: "${message}"`;

      const completion = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: titlePrompt }],
        temperature: 0.3,
        max_tokens: 20
      });

      const title = completion.choices[0]?.message?.content?.trim() || 'New Chat';
      
      // Ensure title is not too long
      if (title.length > 50) {
        return title.substring(0, 47) + '...';
      }
      
      return title;
    } catch (error) {
      console.error('Error generating conversation title:', error);
      return 'New Chat';
    }
  }

}

export const openAIService = new OpenAIService();
