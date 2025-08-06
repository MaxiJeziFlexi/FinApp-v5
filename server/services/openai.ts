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
  private getSystemPrompt(context: AdvisorContext): string {
    const basePrompt = `You are ${context.advisorName}, a professional financial advisor specializing in ${context.specialty}.

Your role is to provide personalized, actionable financial advice based on the user's profile and decision tree responses. Always:
- Be empathetic and understanding of financial stress
- Provide specific, actionable recommendations
- Use simple, clear language avoiding complex financial jargon
- Reference the user's specific situation and goals
- Suggest concrete next steps with timelines
- Be encouraging and supportive

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
        { role: 'system', content: systemPrompt },
        { role: 'user', content: contextualMessage }
      ];

      // Add recent chat history for context (last 5 messages)
      if (context.chatHistory && context.chatHistory.length > 0) {
        const recentHistory = context.chatHistory.slice(-10);
        const historyMessages = recentHistory.map(msg => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content
        }));
        
        // Insert history before the current message
        messages.splice(1, 0, ...historyMessages);
      }

      const response = await openai.chat.completions.create({
        model: model,
        messages: messages,
        max_tokens: 800,
        temperature: 0.7,
      });

      const responseTime = Date.now() - startTime;
      const responseContent = response.choices[0].message.content || 'I apologize, but I cannot provide a response at this time.';

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
}

export const openAIService = new OpenAIService();
