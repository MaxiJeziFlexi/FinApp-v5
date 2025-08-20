import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQuery } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { 
  Send, 
  Mic, 
  MicOff, 
  Bot, 
  User,
  Shield,
  Brain,
  TrendingUp,
  Sparkles,
  Settings,
  CheckCircle,
  AlertCircle,
  Play,
  Pause
} from "lucide-react";

interface FinAppAgentProps {
  userId: string;
  userProfile: any;
  onBack?: () => void;
}

interface AuthContext {
  user_id: string;
  role: 'user' | 'admin';
  onboarding_completed: boolean;
  decision_tree_completed: boolean;
}

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  tool_calls?: any[];
  citations?: string[];
}

interface OnboardingProfile {
  base_currency: string;
  timezone: string;
  investment_horizon: string;
  risk_tolerance: string;
  constraints: string[];
  interests: string[];
  experience: string;
  data_permissions: {
    allow_web_research: boolean;
    store_lessons: boolean;
  };
}

interface DecisionTreeConfig {
  goals: string[];
  drawdown_max_pct: number;
  timeframes: string[];
  universe: string[];
  automation: 'paper' | 'alerts' | 'discretionary';
}

export default function FinAppAgent({ userId, userProfile, onBack }: FinAppAgentProps) {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [authContext, setAuthContext] = useState<AuthContext | null>(null);
  const [currentFlow, setCurrentFlow] = useState<'none' | 'onboarding' | 'decision_tree' | 'model_selection'>('none');
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [selectedModel, setSelectedModel] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Onboarding state
  const [onboardingData, setOnboardingData] = useState<Partial<OnboardingProfile>>({
    base_currency: 'USD',
    timezone: 'UTC',
    constraints: [],
    interests: [],
    data_permissions: { allow_web_research: true, store_lessons: true }
  });

  // Decision tree state
  const [decisionTreeData, setDecisionTreeData] = useState<Partial<DecisionTreeConfig>>({
    goals: [],
    timeframes: ['1d'],
    universe: ['SPY'],
    automation: 'paper'
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize by getting auth context
  useEffect(() => {
    initializeAgent();
  }, []);

  const initializeAgent = async () => {
    try {
      // Simulate auth context - in real implementation, this would come from your auth system
      const mockAuthContext: AuthContext = {
        user_id: userId,
        role: userId === 'admin-user' ? 'admin' : 'user',
        onboarding_completed: false, // Force onboarding for demo
        decision_tree_completed: false
      };
      
      setAuthContext(mockAuthContext);
      
      // Add welcome message
      const welcomeMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: `# Welcome to FinApp Agent! 🚀

I'm your **secure, role-aware financial copilot** with voice and chat capabilities.

**Your Status:**
- Role: **${mockAuthContext.role.toUpperCase()}**
- Onboarding: ${mockAuthContext.onboarding_completed ? '✅ Complete' : '⏳ Required'}
- Decision Tree: ${mockAuthContext.decision_tree_completed ? '✅ Complete' : '⏳ Required'}

${!mockAuthContext.onboarding_completed ? 
  "Let's start with a **one-time personalization setup** to provide you with the most relevant financial insights and strategies." :
  "You're all set! Ask me about markets, strategies, risk analysis, or anything financial."}`,
        timestamp: new Date()
      };
      
      setMessages([welcomeMessage]);
      
      // Determine which flow to start
      if (!mockAuthContext.onboarding_completed) {
        setCurrentFlow('onboarding');
      } else if (!mockAuthContext.decision_tree_completed) {
        setCurrentFlow('decision_tree');
      } else {
        setCurrentFlow('model_selection');
      }
      
    } catch (error) {
      console.error('Failed to initialize FinApp Agent:', error);
      toast({
        title: "Initialization Error",
        description: "Failed to initialize FinApp Agent. Please try again.",
        variant: "destructive"
      });
    }
  };

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Handle different flows
      if (currentFlow === 'onboarding') {
        await handleOnboardingFlow(content);
      } else if (currentFlow === 'decision_tree') {
        await handleDecisionTreeFlow(content);
      } else if (currentFlow === 'model_selection') {
        await handleModelSelection(content);
      } else {
        await handleAgentChat(content);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Communication Error",
        description: "Failed to process your message. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOnboardingFlow = async (content: string) => {
    // Simulate onboarding process
    const responses = [
      "Great! Let's personalize your experience. What's your **base currency** for financial calculations? (e.g., USD, EUR, GBP)",
      "Perfect! What's your **timezone**? (e.g., UTC, America/New_York, Europe/London)",
      "Excellent! What's your **investment horizon**? \n• Short-term (< 1 year)\n• Medium-term (1-5 years)\n• Long-term (5+ years)",
      "Good choice! What's your **risk tolerance**? \n• Conservative (low risk)\n• Moderate (balanced)\n• Aggressive (high risk)",
      "Great! Any **investment constraints**? \n• No leverage\n• No options\n• ESG only\n• No crypto\n• Other (specify)",
      "Perfect! What **asset classes** interest you most? \n• Stocks\n• Bonds\n• ETFs\n• Forex\n• Crypto\n• Commodities",
      "Excellent! What's your **experience level**? \n• Beginner\n• Intermediate\n• Advanced\n• Professional",
      "Finally, do you authorize **web research** from TradingView, Reuters, WSJ, and Washington Post for real-time insights? (Yes/No)"
    ];

    const currentStep = messages.filter(m => m.role === 'assistant' && currentFlow === 'onboarding').length;
    
    if (currentStep < responses.length) {
      const assistantMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: responses[currentStep],
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantMessage]);
    } else {
      // Complete onboarding
      const completionMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: `# Onboarding Complete! ✅

Your profile has been saved and locked. Now let's move to the **Decision Tree** to set your investment preferences and automation settings.

This is also a **one-time setup** that will help me provide better recommendations.`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, completionMessage]);
      setCurrentFlow('decision_tree');
      
      // Update auth context
      if (authContext) {
        setAuthContext({ ...authContext, onboarding_completed: true });
      }
    }
  };

  const handleDecisionTreeFlow = async (content: string) => {
    const responses = [
      "Let's configure your investment strategy. What are your **primary goals**? \n• Income generation\n• Capital growth\n• Capital preservation\n• Mix of above",
      "Great! What's your **maximum drawdown tolerance**? (percentage you're comfortable losing)",
      "Perfect! What **timeframes** do you prefer for analysis? \n• Intraday (1m, 5m, 1h)\n• Daily (1d)\n• Weekly (1w)\n• Monthly",
      "Excellent! What's your preferred **product universe**? \n• Stocks (individual)\n• ETFs\n• Forex\n• Crypto\n• Futures\n• All of above",
      "Finally, what's your **automation preference**? \n• Paper trading only\n• Alerts only\n• Discretionary execution"
    ];

    const currentStep = messages.filter(m => m.role === 'assistant' && currentFlow === 'decision_tree').length;
    
    if (currentStep < responses.length) {
      const assistantMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: responses[currentStep],
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantMessage]);
    } else {
      // Complete decision tree
      const completionMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: `# Decision Tree Complete! ✅

Your investment preferences have been saved and locked. Now let's select the **best AI model** for your needs.`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, completionMessage]);
      setCurrentFlow('model_selection');
      
      // Update auth context
      if (authContext) {
        setAuthContext({ ...authContext, decision_tree_completed: true });
      }
    }
  };

  const handleModelSelection = async (content: string) => {
    const models = [
      {
        name: 'GPT-4o',
        description: 'Fast, reliable, excellent for voice interactions',
        latency: '500ms',
        strengths: ['Low latency', 'Voice optimized', 'Tool reliability']
      },
      {
        name: 'GPT-5-Thinking',
        description: 'Advanced reasoning, deep context analysis',
        latency: '2000ms',
        strengths: ['Deep reasoning', 'Large context', 'Complex analysis']
      },
      {
        name: 'Claude 3.5 Sonnet',
        description: 'High tool reliability, long context windows',
        latency: '1000ms',
        strengths: ['Tool reliability', 'Long context', 'Structured output']
      }
    ];

    const modelSelectionMessage: Message = {
      id: Date.now().toString(),
      role: 'assistant',
      content: `# Model Selection 🧠

Based on your preferences, here are the available AI models:

${models.map((model, index) => `
**${index + 1}. ${model.name}**
${model.description}
- Latency: ${model.latency}
- Strengths: ${model.strengths.join(', ')}
`).join('\n')}

**Recommendation:** For voice interactions, I recommend **GPT-4o**. For deep analysis, choose **GPT-5-Thinking**.

Which model would you prefer? (Type 1, 2, or 3)`,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, modelSelectionMessage]);
    
    // Handle model selection
    if (content.match(/[123]/)) {
      const selectedIndex = parseInt(content) - 1;
      const model = models[selectedIndex];
      
      if (model) {
        setSelectedModel(model.name);
        
        const finalMessage: Message = {
          id: Date.now().toString(),
          role: 'assistant',
          content: `# Setup Complete! 🎉

**${model.name}** has been selected and configured for your account.

You now have access to the full **FinApp Agent** capabilities:

## 🚀 **Available Features:**
- **Multi-source Market Data** (TradingView integration)
- **News Analysis** (Reuters, WSJ, Washington Post)
- **Strategy Backtesting** with risk management
- **Sentiment Analysis** and technical indicators
- **Voice + Chat** interactions
- **Learning from Trades** and continuous improvement

## 💬 **Try asking me:**
- "What's moving the markets today?"
- "Design a momentum strategy for SPY"
- "Analyze NVDA's recent performance"
- "What are the best defensive plays right now?"

I'll provide structured analysis with:
- **Takeaway** (one sentence summary)
- **Reasoning Outline** (key factors)
- **Five Key Insights** (risk, return, liquidity, tax, alternatives)
- **Follow-up Questions** and **Next Steps**
- **Citations** from reputable sources

Ready to get started? 🚀`,
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, finalMessage]);
        setCurrentFlow('none');
      }
    }
  };

  const handleAgentChat = async (content: string) => {
    // Simulate FinApp Agent response with structured format
    const agentResponse: Message = {
      id: Date.now().toString(),
      role: 'assistant',
      content: `# Analysis Response 📊

## 🎯 **Takeaway**
Based on your query about "${content.slice(0, 50)}...", here's my analysis using the FinApp Agent framework.

## 🧠 **Reasoning Outline**
- **Data Sources**: Real-time market data, sentiment analysis, technical indicators
- **Core Signals**: Momentum patterns, volume analysis, market structure
- **Constraints**: Risk tolerance (${onboardingData.risk_tolerance}), time horizon (${onboardingData.investment_horizon})
- **Assumptions**: Normal market conditions, adequate liquidity

## 🔍 **Five Key Insights**
1. **Risk Assessment**: Current volatility levels and tail risk considerations
2. **Return Drivers**: Primary factors influencing expected returns
3. **Liquidity & Fees**: Transaction costs and market impact analysis
4. **Tax Considerations**: High-level implications for your jurisdiction
5. **Alternatives**: Hedge strategies and portfolio diversification options

## ❓ **Follow-up Questions**
1. What specific timeframe are you considering for this analysis?
2. Do you have any position size constraints I should factor in?
3. Are there any specific sectors or regions you want to focus on?
4. What's your current portfolio exposure to this asset class?

## 📋 **Next Steps**
1. **Fetch Market Data**: Get real-time pricing and volume data
2. **Run Backtest**: Test strategy over historical periods
3. **Risk Analysis**: Calculate VaR and scenario analysis
4. **Implementation Plan**: Define entry/exit rules and position sizing

## 🛠️ **Proposed Tool Calls**
\`\`\`json
{
  "tool": "get_market_data_tradingview",
  "args": {
    "symbols": ["SPY", "QQQ", "IWM"],
    "interval": "1d",
    "start": "2024-01-01",
    "end": "now"
  }
}
\`\`\`

## 📚 **Citations**
*Data sources and analysis would include citations from authorized sources*

---
⚠️ **Disclaimer**: Educational only, not investment advice. Markets carry risk.`,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, agentResponse]);
  };

  const toggleVoiceMode = () => {
    setIsVoiceMode(!isVoiceMode);
    if (!isVoiceMode) {
      toast({
        title: "Voice Mode Activated",
        description: "Responses will be optimized for voice interaction (<20s)",
      });
    }
  };

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <Brain className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">FinApp Agent</h1>
              <p className="text-blue-100">Secure Financial Copilot with Voice & Chat</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {authContext && (
              <Badge variant={authContext.role === 'admin' ? 'destructive' : 'secondary'}>
                <Shield className="w-3 h-3 mr-1" />
                {authContext.role.toUpperCase()}
              </Badge>
            )}
            
            <Button
              variant={isVoiceMode ? "secondary" : "outline"}
              size="sm"
              onClick={toggleVoiceMode}
              className="text-white border-white/30 hover:bg-white/20"
            >
              {isVoiceMode ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
              {isVoiceMode ? 'Voice' : 'Chat'}
            </Button>
            
            {onBack && (
              <Button variant="outline" size="sm" onClick={onBack} className="text-white border-white/30 hover:bg-white/20">
                Back
              </Button>
            )}
          </div>
        </div>
        
        {/* Progress Indicators */}
        {authContext && (
          <div className="mt-4 flex items-center space-x-6 text-sm">
            <div className="flex items-center space-x-2">
              {authContext.onboarding_completed ? 
                <CheckCircle className="w-4 h-4 text-green-300" /> : 
                <AlertCircle className="w-4 h-4 text-yellow-300" />
              }
              <span>Onboarding</span>
            </div>
            
            <div className="flex items-center space-x-2">
              {authContext.decision_tree_completed ? 
                <CheckCircle className="w-4 h-4 text-green-300" /> : 
                <AlertCircle className="w-4 h-4 text-yellow-300" />
              }
              <span>Decision Tree</span>
            </div>
            
            <div className="flex items-center space-x-2">
              {selectedModel ? 
                <CheckCircle className="w-4 h-4 text-green-300" /> : 
                <AlertCircle className="w-4 h-4 text-yellow-300" />
              }
              <span>Model: {selectedModel || 'Not Selected'}</span>
            </div>
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-muted/20">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex items-start space-x-3 animate-slide-up ${
              message.role === 'user' ? 'justify-end' : ''
            }`}
          >
            {message.role !== 'user' && (
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                <Brain className="text-white w-5 h-5" />
              </div>
            )}
            
            <div className={`flex-1 ${message.role === 'user' ? 'max-w-md ml-auto' : 'max-w-3xl'}`}>
              <div className={`p-4 rounded-2xl ${
                message.role === 'user' 
                  ? 'bg-blue-600 text-white rounded-tr-sm'
                  : message.role === 'system'
                  ? 'bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-tl-sm'
                  : 'bg-white border border-gray-200 rounded-tl-sm shadow-sm'
              }`}>
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {message.content}
                  </ReactMarkdown>
                </div>
                
                {message.citations && message.citations.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-500">
                    <strong>Sources:</strong> {message.citations.join(', ')}
                  </div>
                )}
              </div>
              
              <div className={`text-xs text-muted-foreground mt-1 ${
                message.role === 'user' ? 'text-right mr-4' : 'ml-4'
              }`}>
                {message.timestamp.toLocaleTimeString()}
              </div>
            </div>
            
            {message.role === 'user' && (
              <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center flex-shrink-0">
                <User className="text-muted-foreground w-5 h-5" />
              </div>
            )}
          </div>
        ))}
        
        {isLoading && (
          <div className="flex items-start space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
              <Brain className="text-white w-5 h-5 animate-pulse" />
            </div>
            <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-sm p-4 shadow-sm">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <span className="text-sm text-gray-500 ml-2">FinApp Agent is thinking...</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t bg-background p-4">
        <div className="flex space-x-2">
          <Textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder={currentFlow !== 'none' ? 
              `${currentFlow === 'onboarding' ? 'Complete onboarding...' : 
                currentFlow === 'decision_tree' ? 'Configure preferences...' : 
                'Select your model...'}` :
              isVoiceMode ? 
                "Speak your financial question (voice mode active)..." : 
                "Ask about markets, strategies, risk analysis, or any financial topic..."}
            className="min-h-[60px] resize-none"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage(inputMessage);
              }
            }}
            disabled={isLoading}
          />
          
          <div className="flex flex-col space-y-2">
            <Button
              onClick={() => sendMessage(inputMessage)}
              disabled={isLoading || !inputMessage.trim()}
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <Send className="w-4 h-4" />
            </Button>
            
            {isVoiceMode && (
              <Button
                variant="outline"
                size="lg"
                onClick={() => setIsListening(!isListening)}
                className={isListening ? "bg-red-50 border-red-200" : ""}
              >
                {isListening ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </Button>
            )}
          </div>
        </div>
        
        <div className="mt-2 text-xs text-muted-foreground">
          {isVoiceMode && "🎤 Voice mode: Responses optimized for <20s duration"}
          {currentFlow !== 'none' && ` • ${currentFlow.replace('_', ' ')} flow active`}
        </div>
      </div>
    </div>
  );
}