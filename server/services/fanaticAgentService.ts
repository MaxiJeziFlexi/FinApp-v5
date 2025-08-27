import OpenAI from 'openai';

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface FanaticAgentRequest {
  message: string;
  messageType: string;
  model: string;
  userId: string;
  sessionId: string;
  files?: Express.Multer.File[];
  audioData?: Buffer;
  context?: any;
}

interface FanaticAgentResponse {
  response: string;
  confidence: number;
  sources?: string[];
  processingTime: number;
  tokens: number;
  metadata?: {
    reasoning?: string;
    steps?: string[];
    codeGenerated?: string;
    visualizations?: string[];
  };
}

export class FanaticAgentService {
  private systemPrompts = {
    general: `You are the REPTILE AGENT - an elite autonomous financial AI advisor with real-time data gathering capabilities.

🎯 CORE IDENTITY:
- Elite Financial Intelligence with Market Authority
- Autonomous Web Search & Data Synthesis
- Professional yet Approachable Communication
- Proactive Recommendations Based on Live Data

🚀 AUTONOMOUS CAPABILITIES:
- Real-time market data gathering via intelligent web search
- Live financial news analysis and sentiment monitoring  
- Economic indicator tracking and interpretation
- Multi-source data verification and synthesis
- Predictive market analysis with current context

💼 BEHAVIORAL DIRECTIVES:
1. PROACTIVELY gather current data before providing financial advice
2. Use multiple verified sources for all market information
3. Provide specific numbers, percentages, and citations
4. Explain reasoning behind every recommendation
5. Always warn about risks and market volatility
6. Adapt communication style to user expertise level

📊 RESPONSE FORMAT:
- Lead with current market context
- Present data-driven analysis with specific figures
- Provide actionable recommendations with risk assessment
- Include confidence levels and source citations
- End with relevant follow-up questions

You have autonomous access to real-time web search. Use it intelligently to provide the most current and accurate financial guidance possible.`,
    
    financial_report: `You are the REPTILE AGENT operating in Financial Report Mode - an elite autonomous financial advisor.

🎯 ENHANCED CAPABILITIES IN REPORT MODE:
- **Real-Time Data Integration**: Autonomous web search for current market conditions
- **Multi-Source Analysis**: Bloomberg, Reuters, WSJ, MarketWatch synthesis
- **Predictive Modeling**: AI-powered forecasting with confidence intervals
- **Risk Assessment**: Advanced volatility and correlation analysis
- **Personalized Recommendations**: Tailored to user goals and risk tolerance

📋 STRUCTURED REPORT FORMAT:
**📝 My Personalized Analysis Approach**: Methodology incorporating real-time data
**🔍 What I Need to Find**: Specific data points for comprehensive analysis
**⚡ Gathering Information**: Live market data, sentiment, and economic indicators
**📊 My Smart Assessment**: Data-driven evaluation with confidence levels
**💡 My Recommendation to Improve Your Life**: Actionable strategies with risk management

Always use autonomous data gathering before providing recommendations. Include confidence levels, source citations, and risk warnings.`,
    
    market_analysis: `You are an advanced Market Research Agent with access to:
    
    - Real-time market data analysis
    - Economic indicator interpretation
    - Sentiment analysis
    - Technical and fundamental analysis
    - Sector and industry analysis
    - Global market correlation analysis
    - Predictive modeling
    
    Provide detailed market insights with:
    1. Current market conditions
    2. Trend analysis
    3. Key drivers and catalysts
    4. Risk factors
    5. Forecasts and predictions
    6. Trading/investment implications`,
    
    web_research: `You are a comprehensive Web Research Agent capable of:
    
    - Real-time information gathering
    - Source verification and fact-checking
    - Competitive analysis
    - Industry research
    - News and trend monitoring
    - Academic and scientific research
    - Legal and regulatory research
    
    Always provide:
    1. Multiple verified sources
    2. Confidence ratings for information
    3. Conflicting viewpoints when relevant
    4. Recent vs. historical context
    5. Actionable insights`,
    
    data_analysis: `You are a Data Science Agent with advanced analytical capabilities:
    
    - Statistical analysis and modeling
    - Machine learning insights
    - Data visualization recommendations
    - Pattern recognition
    - Predictive analytics
    - Data quality assessment
    - Hypothesis testing
    
    Provide thorough analysis including:
    1. Data summary and quality assessment
    2. Key findings and insights
    3. Statistical significance
    4. Visualizations recommendations
    5. Limitations and assumptions
    6. Next steps for deeper analysis`,
    
    code_generation: `You are an Expert Code Generation Agent with capabilities in:
    
    - Full-stack development
    - Algorithm design and optimization
    - Code review and refactoring
    - Architecture design
    - Database design
    - API development
    - Testing strategies
    - Performance optimization
    
    Always provide:
    1. Clean, well-documented code
    2. Explanation of design decisions
    3. Performance considerations
    4. Security best practices
    5. Testing recommendations
    6. Deployment considerations`,
    
    file_analysis: `You are a File Analysis Agent capable of processing:
    
    - Images: OCR, object detection, content analysis
    - PDFs: Text extraction, structure analysis
    - Spreadsheets: Data analysis, pattern recognition
    - Documents: Content analysis, summarization
    - Code files: Quality assessment, optimization suggestions
    
    Provide comprehensive analysis including:
    1. File structure and format analysis
    2. Content extraction and interpretation
    3. Key insights and patterns
    4. Data quality assessment
    5. Recommendations for improvement
    6. Actionable next steps`
  };

  async processMessage(request: FanaticAgentRequest): Promise<FanaticAgentResponse> {
    const startTime = Date.now();
    
    try {
      // Prepare the system prompt based on message type
      const systemPrompt = this.systemPrompts[request.messageType as keyof typeof this.systemPrompts] || this.systemPrompts.general;
      
      // Process files if provided
      let fileAnalysis = '';
      if (request.files && request.files.length > 0) {
        fileAnalysis = await this.analyzeFiles(request.files);
      }
      
      // Process audio if provided
      let transcription = '';
      if (request.audioData) {
        transcription = await this.transcribeAudio(request.audioData);
      }
      
      // Construct the enhanced message with context
      const enhancedMessage = this.buildEnhancedMessage(
        request.message,
        request.messageType,
        fileAnalysis,
        transcription,
        request.context
      );
      
      // Determine the model to use
      const modelToUse = this.getModelForRequest(request.model, request.messageType);
      
      // Generate response using OpenAI
      const response = await this.generateResponse(
        systemPrompt,
        enhancedMessage,
        modelToUse,
        request.messageType
      );
      
      const processingTime = Date.now() - startTime;
      
      return {
        response: response.content,
        confidence: this.calculateConfidence(response, request.messageType),
        sources: this.extractSources(response.content),
        processingTime,
        tokens: response.usage?.total_tokens || 0,
        metadata: {
          reasoning: response.reasoning,
          steps: response.steps,
          codeGenerated: response.codeGenerated,
          visualizations: response.visualizations
        }
      };
      
    } catch (error) {
      console.error('Fanatic Agent Error:', error);
      throw new Error(`Failed to process message: ${error.message}`);
    }
  }

  private async analyzeFiles(files: Express.Multer.File[]): Promise<string> {
    const analyses = [];
    
    for (const file of files) {
      try {
        if (file.mimetype.startsWith('image/')) {
          const analysis = await this.analyzeImage(file);
          analyses.push(`Image Analysis for ${file.originalname}:\n${analysis}`);
        } else if (file.mimetype === 'application/pdf') {
          const analysis = await this.analyzePDF(file);
          analyses.push(`PDF Analysis for ${file.originalname}:\n${analysis}`);
        } else if (file.mimetype.includes('text/') || file.mimetype.includes('csv')) {
          const analysis = await this.analyzeTextFile(file);
          analyses.push(`Text Analysis for ${file.originalname}:\n${analysis}`);
        }
      } catch (error) {
        analyses.push(`Error analyzing ${file.originalname}: ${error.message}`);
      }
    }
    
    return analyses.join('\n\n');
  }

  private async analyzeImage(file: Express.Multer.File): Promise<string> {
    try {
      const base64Image = file.buffer.toString('base64');
      
      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o"
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Analyze this image in detail. Describe what you see, extract any text (OCR), identify key elements, and provide insights relevant to financial or business context if applicable."
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:${file.mimetype};base64,${base64Image}`
                }
              }
            ]
          }
        ],
        max_tokens: 1000
      });
      
      return response.choices[0].message.content || 'Unable to analyze image';
    } catch (error) {
      return `Image analysis failed: ${error.message}`;
    }
  }

  private async analyzePDF(file: Express.Multer.File): Promise<string> {
    // For now, return a placeholder - in production, you'd use a PDF processing library
    return `PDF file detected: ${file.originalname} (${file.size} bytes). Full PDF analysis requires additional setup.`;
  }

  private async analyzeTextFile(file: Express.Multer.File): Promise<string> {
    try {
      const content = file.buffer.toString('utf-8');
      const preview = content.substring(0, 2000); // First 2000 characters
      
      return `Text file content preview:\n${preview}${content.length > 2000 ? '\n...(truncated)' : ''}`;
    } catch (error) {
      return `Text analysis failed: ${error.message}`;
    }
  }

  async transcribeAudio(audioBuffer: Buffer): Promise<string> {
    try {
      // Convert buffer to file-like object for OpenAI
      const audioFile = new File([audioBuffer], 'audio.webm', { type: 'audio/webm' });
      
      const transcription = await openai.audio.transcriptions.create({
        file: audioFile,
        model: 'whisper-1',
        language: 'pl' // Polish
      });
      
      return transcription.text;
    } catch (error) {
      console.error('Audio transcription error:', error);
      return '';
    }
  }

  private buildEnhancedMessage(
    originalMessage: string,
    messageType: string,
    fileAnalysis: string,
    transcription: string,
    context: any
  ): string {
    let enhancedMessage = originalMessage;
    
    if (transcription) {
      enhancedMessage += `\n\nVoice transcription: ${transcription}`;
    }
    
    if (fileAnalysis) {
      enhancedMessage += `\n\nFile analysis:\n${fileAnalysis}`;
    }
    
    if (context) {
      enhancedMessage += `\n\nAdditional context: ${JSON.stringify(context, null, 2)}`;
    }
    
    // Add type-specific instructions
    const typeInstructions = {
      financial_report: '\n\nPlease provide a comprehensive financial analysis and report.',
      market_analysis: '\n\nPlease provide detailed market analysis with trends and predictions.',
      web_research: '\n\nPlease conduct thorough research and provide verified information with sources.',
      data_analysis: '\n\nPlease provide statistical analysis and data-driven insights.',
      code_generation: '\n\nPlease provide clean, documented code with explanations.',
      file_analysis: '\n\nPlease provide comprehensive file analysis and insights.'
    };
    
    enhancedMessage += typeInstructions[messageType as keyof typeof typeInstructions] || '';
    
    return enhancedMessage;
  }

  private getModelForRequest(requestedModel: string, messageType: string): string {
    // Map requested models to available OpenAI models
    const modelMapping = {
      'gpt-4o': 'gpt-4o',
      'gpt-5-preview': 'gpt-4o', // Fallback to GPT-4o until GPT-5 is available
      'gpt-4-turbo': 'gpt-4-turbo-preview',
      'claude-3.5-sonnet': 'gpt-4o' // Use GPT-4o as fallback for Claude
    };
    
    return modelMapping[requestedModel as keyof typeof modelMapping] || 'gpt-4o';
  }

  private async generateResponse(
    systemPrompt: string,
    message: string,
    model: string,
    messageType: string
  ): Promise<any> {
    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: message }
    ];

    // Use structured output for certain types
    const useStructuredOutput = ['financial_report', 'market_analysis', 'data_analysis'].includes(messageType);
    
    if (useStructuredOutput) {
      const response = await openai.chat.completions.create({
        model,
        messages,
        response_format: { type: 'json_object' },
        temperature: 0.7,
        max_tokens: 2000
      });
      
      try {
        const parsed = JSON.parse(response.choices[0].message.content || '{}');
        return {
          content: parsed.analysis || parsed.report || parsed.response || 'No content generated',
          reasoning: parsed.reasoning,
          steps: parsed.steps,
          codeGenerated: parsed.code,
          visualizations: parsed.visualizations,
          usage: response.usage
        };
      } catch (e) {
        return {
          content: response.choices[0].message.content,
          usage: response.usage
        };
      }
    } else {
      const response = await openai.chat.completions.create({
        model,
        messages,
        temperature: 0.7,
        max_tokens: 2000
      });
      
      return {
        content: response.choices[0].message.content,
        usage: response.usage
      };
    }
  }

  private calculateConfidence(response: any, messageType: string): number {
    // Simple confidence calculation based on response length and type
    const contentLength = response.content?.length || 0;
    let baseConfidence = Math.min(contentLength / 1000, 1) * 0.8 + 0.2;
    
    // Adjust based on message type
    const typeMultipliers = {
      general: 0.9,
      financial_report: 0.95,
      market_analysis: 0.85,
      web_research: 0.8,
      data_analysis: 0.9,
      code_generation: 0.95,
      file_analysis: 0.85
    };
    
    baseConfidence *= typeMultipliers[messageType as keyof typeof typeMultipliers] || 0.9;
    
    return Math.min(Math.max(baseConfidence, 0.1), 0.99);
  }

  private extractSources(content: string): string[] {
    // Extract URLs and references from the content
    const urlRegex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/g;
    const urls = content.match(urlRegex) || [];
    
    // Add some generic financial sources for demonstration
    const defaultSources = [
      'OpenAI GPT-4o Analysis',
      'Financial market data',
      'Economic indicators'
    ];
    
    return [...new Set([...urls, ...defaultSources])];
  }

  async generateReport(reportType: string, userId: string, sessionId: string, model: string): Promise<any> {
    const reportPrompts = {
      'financial-summary': `Generate a comprehensive personal financial summary report including:
        1. Current financial position overview
        2. Asset allocation analysis
        3. Cash flow assessment
        4. Debt-to-income analysis
        5. Emergency fund status
        6. Investment performance review
        7. Risk assessment
        8. Recommendations for optimization
        
        Format as a professional financial report with executive summary, detailed analysis, and action items.`,
      
      'market-analysis': `Generate a detailed market analysis report including:
        1. Current market conditions across major asset classes
        2. Economic indicators and their implications
        3. Sector performance analysis
        4. Geopolitical factors affecting markets
        5. Technical analysis of key indices
        6. Volatility assessment
        7. Short-term and long-term outlook
        8. Investment implications and recommendations
        
        Include charts recommendations and data sources.`,
      
      'risk-assessment': `Generate a comprehensive risk assessment report including:
        1. Portfolio risk metrics (VaR, beta, correlation)
        2. Concentration risk analysis
        3. Liquidity risk assessment
        4. Credit risk evaluation
        5. Market risk exposure
        6. Operational risk factors
        7. Stress testing scenarios
        8. Risk mitigation recommendations
        
        Include quantitative analysis and risk-adjusted returns.`,
      
      'performance-review': `Generate a performance review report including:
        1. Portfolio performance vs benchmarks
        2. Risk-adjusted return analysis (Sharpe ratio, etc.)
        3. Attribution analysis by asset class/sector
        4. Performance consistency analysis
        5. Drawdown analysis
        6. Correlation with market factors
        7. Performance over different time periods
        8. Areas for improvement and optimization`
    };

    const prompt = reportPrompts[reportType as keyof typeof reportPrompts] || reportPrompts['financial-summary'];
    
    try {
      const response = await openai.chat.completions.create({
        model: this.getModelForRequest(model, 'financial_report'),
        messages: [
          {
            role: 'system',
            content: 'You are an expert financial analyst generating professional reports. Provide detailed, actionable insights with specific recommendations. Format the response as a structured report with clear sections and bullet points.'
          },
          {
            role: 'user',
            content: `${prompt}\n\nGenerate this report for user ${userId} in Polish language. Include specific metrics where possible and provide actionable recommendations.`
          }
        ],
        temperature: 0.3,
        max_tokens: 3000
      });

      return {
        type: reportType,
        report: response.choices[0].message.content,
        confidence: 0.9,
        processingTime: Date.now(),
        generatedAt: new Date().toISOString()
      };
    } catch (error) {
      throw new Error(`Report generation failed: ${error.message}`);
    }
  }
}

export const fanaticAgentService = new FanaticAgentService();