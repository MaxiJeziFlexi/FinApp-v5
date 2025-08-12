import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQuery } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { 
  Brain, 
  MessageSquare, 
  Send, 
  Bot, 
  User, 
  TrendingUp, 
  Target, 
  ArrowRight, 
  Check,
  Mic,
  MicOff,
  Sparkles,
  BarChart3,
  Activity,
  Loader2
} from 'lucide-react';
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface DecisionTreeQuestion {
  id: string;
  question: string;
  description?: string;
  type: 'single_choice' | 'multiple_choice' | 'text';
  category: string;
  options?: {
    id: string;
    value: string;
    title: string;
    description?: string;
    ai_weight: number;
  }[];
  validation?: {
    required: boolean;
  };
  ai_context: string;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  questionContext?: DecisionTreeQuestion;
  aiInsights?: any;
}

interface EnhancedDecisionTreeWithChatProps {
  advisorId: string;
  userId: string;
  advisor: {
    id: string;
    name: string;
    bio?: string;
    specialization?: string;
  };
  onComplete?: (insights: any) => void;
  onBackToAdvisor?: () => void;
}

export function EnhancedDecisionTreeWithChat({ 
  advisorId, 
  userId, 
  advisor, 
  onComplete, 
  onBackToAdvisor 
}: EnhancedDecisionTreeWithChatProps) {
  // State management
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [currentAnswer, setCurrentAnswer] = useState<string>('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isLoadingResponse, setIsLoadingResponse] = useState(false);
  const [isTreeCompleted, setIsTreeCompleted] = useState(false);
  const [finalInsights, setFinalInsights] = useState<any>(null);
  const [messageCount, setMessageCount] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const speechRecognition = useRef<any>(null);
  const { toast } = useToast();

  // Load decision tree questions
  const { data: treeDefinition, isLoading: loadingTree } = useQuery({
    queryKey: ['/api/personalized-tree', advisorId],
    enabled: !!advisorId,
  });

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      speechRecognition.current = new (window as any).webkitSpeechRecognition();
      speechRecognition.current.continuous = false;
      speechRecognition.current.interimResults = false;
      speechRecognition.current.lang = 'en-US';

      speechRecognition.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setChatInput(prev => prev + ' ' + transcript);
        setIsListening(false);
      };

      speechRecognition.current.onerror = () => {
        setIsListening(false);
        toast({
          title: "Speech Recognition Error",
          description: "Unable to process speech. Please try again.",
          variant: "destructive",
        });
      };
    }
  }, [toast]);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Track analytics
  const trackAnalytics = async (eventType: string, data: any) => {
    try {
      await fetch('/api/analytics/track-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          eventType,
          eventData: {
            advisorId,
            currentQuestionIndex,
            totalQuestions: treeDefinition?.questions?.length || 0,
            messageCount,
            sessionTime: Date.now(),
            ...data
          }
        })
      });
    } catch (error) {
      console.warn('Failed to track analytics:', error);
    }
  };

  // Handle decision tree progression
  const proceedToNextQuestion = async () => {
    if (!currentAnswer) {
      toast({
        title: "Answer Required",
        description: "Please select an answer before proceeding.",
        variant: "destructive",
      });
      return;
    }

    const currentQuestion = treeDefinition?.questions[currentQuestionIndex];
    if (!currentQuestion) return;

    // Save response
    const newResponses = {
      ...responses,
      [currentQuestion.id]: currentAnswer
    };
    setResponses(newResponses);

    // Track progress
    await trackAnalytics('decision_tree_progress', {
      questionId: currentQuestion.id,
      answer: currentAnswer,
      progress: ((currentQuestionIndex + 1) / (treeDefinition?.questions?.length || 1)) * 100
    });

    // Send to backend
    try {
      const response = await fetch('/api/personalized-tree/respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          advisorId,
          questionId: currentQuestion.id,
          answer: currentAnswer,
          additionalData: {
            category: currentQuestion.category,
            ai_context: currentQuestion.ai_context
          }
        })
      });

      const result = await response.json();
      
      if (result.success) {
        // Add AI response to chat
        const aiMessage: ChatMessage = {
          id: Date.now().toString(),
          role: 'assistant',
          content: `Great answer! I understand that "${currentAnswer}" regarding ${currentQuestion.question}. ${result.ai_insight || 'This helps me understand your perspective better.'}`,
          timestamp: new Date(),
          questionContext: currentQuestion,
          aiInsights: result.ai_insights
        };
        setChatMessages(prev => [...prev, aiMessage]);

        // Check if completed
        if (currentQuestionIndex + 1 >= (treeDefinition?.questions?.length || 0)) {
          setIsTreeCompleted(true);
          setFinalInsights(result.insights || generateMockInsights(newResponses));
          
          // Track completion
          await trackAnalytics('decision_tree_completed', {
            totalResponses: Object.keys(newResponses).length,
            completionRate: 100
          });
        } else {
          setCurrentQuestionIndex(prev => prev + 1);
        }
      }
    } catch (error) {
      console.error('Error processing response:', error);
      toast({
        title: "Error",
        description: "Failed to process your response. Please try again.",
        variant: "destructive",
      });
    }

    setCurrentAnswer('');
  };

  // Handle chat messages
  const sendChatMessage = async () => {
    if (!chatInput.trim() || isLoadingResponse) return;
    if (messageCount >= 20) {
      toast({
        title: "Message Limit Reached",
        description: "You've reached the 20 message limit for this session.",
        variant: "destructive",
      });
      return;
    }

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: chatInput,
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, userMessage]);
    setChatInput('');
    setIsLoadingResponse(true);
    setMessageCount(prev => prev + 1);

    // Track message
    await trackAnalytics('chat_message_sent', {
      messageLength: chatInput.length,
      messageNumber: messageCount + 1
    });

    try {
      const response = await fetch('/api/chat/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: chatInput,
          advisor_id: advisorId,
          user_id: userId,
          session_id: `enhanced_session_${userId}_${advisorId}`,
          context: {
            decisionTreeResponses: responses,
            currentQuestionIndex,
            isTreeCompleted,
            finalInsights
          }
        })
      });

      const result = await response.json();
      
      if (result.success) {
        const aiMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: result.response,
          timestamp: new Date()
        };
        setChatMessages(prev => [...prev, aiMessage]);
        
        // Track AI response
        await trackAnalytics('chat_response_received', {
          responseLength: result.response.length,
          responseTime: result.responseTime
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    }

    setIsLoadingResponse(false);
  };

  const toggleSpeechRecognition = () => {
    if (!speechRecognition.current) {
      toast({
        title: "Not Supported",
        description: "Speech recognition is not supported in your browser.",
        variant: "destructive",
      });
      return;
    }

    if (isListening) {
      speechRecognition.current.stop();
      setIsListening(false);
    } else {
      speechRecognition.current.start();
      setIsListening(true);
    }
  };

  const generateMockInsights = (responses: Record<string, any>) => {
    return {
      user_profile: {
        risk_tolerance: "moderate",
        financial_experience: "intermediate",
        primary_goals: ["security", "growth"],
        decision_style: "analytical"
      },
      ai_recommendations: {
        recommended_strategies: [
          "Start with emergency fund building",
          "Consider diversified index fund investing",
          "Set up automated savings plan"
        ],
        focus_areas: ["Emergency Planning", "Investment Strategy", "Goal Setting"],
        next_best_actions: [
          "Calculate your ideal emergency fund amount",
          "Research low-cost index funds",
          "Set up automatic transfers to savings"
        ]
      }
    };
  };

  if (loadingTree) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading enhanced assessment...</p>
        </CardContent>
      </Card>
    );
  }

  const currentQuestion = treeDefinition?.questions[currentQuestionIndex];
  const progress = treeDefinition?.questions ? ((currentQuestionIndex + 1) / treeDefinition.questions.length) * 100 : 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
      {/* Decision Tree Section */}
      <Card className="h-fit">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="w-5 h-5 text-blue-600" />
            <span>AI Financial Assessment</span>
          </CardTitle>
          <CardDescription>
            {advisor.name} - Interactive Decision Tree ({currentQuestionIndex + 1}/{treeDefinition?.questions?.length || 0})
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isTreeCompleted && currentQuestion ? (
            <>
              {/* Progress */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="w-full" />
              </div>

              {/* Question */}
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg">{currentQuestion.question}</h3>
                  {currentQuestion.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {currentQuestion.description}
                    </p>
                  )}
                  <Badge variant="outline" className="mt-2">
                    {currentQuestion.category}
                  </Badge>
                </div>

                {/* Answer Options */}
                {currentQuestion.type === 'single_choice' && (
                  <RadioGroup value={currentAnswer} onValueChange={setCurrentAnswer}>
                    {currentQuestion.options?.map((option) => (
                      <div key={option.id} className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                        <RadioGroupItem value={option.value} id={option.id} className="mt-1" />
                        <div className="flex-1">
                          <Label htmlFor={option.id} className="cursor-pointer">
                            <div className="font-medium text-sm">{option.title}</div>
                            {option.description && (
                              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                {option.description}
                              </div>
                            )}
                          </Label>
                        </div>
                      </div>
                    ))}
                  </RadioGroup>
                )}

                {currentQuestion.type === 'text' && (
                  <Textarea
                    value={currentAnswer}
                    onChange={(e) => setCurrentAnswer(e.target.value)}
                    placeholder="Please provide your response..."
                    className="min-h-20"
                  />
                )}

                <Button 
                  onClick={proceedToNextQuestion} 
                  disabled={!currentAnswer}
                  className="w-full"
                >
                  <ArrowRight className="w-4 h-4 mr-2" />
                  {currentQuestionIndex + 1 >= (treeDefinition?.questions?.length || 0) ? 'Complete Assessment' : 'Next Question'}
                </Button>
              </div>
            </>
          ) : isTreeCompleted && finalInsights ? (
            <>
              <div className="text-center py-4">
                <Check className="w-12 h-12 text-green-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-green-600">Assessment Complete!</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  Your personalized financial insights are ready. Continue chatting for detailed advice!
                </p>
              </div>

              {/* Quick Insights Preview */}
              <div className="space-y-3">
                <div>
                  <Label className="text-sm font-medium">Focus Areas</Label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {finalInsights.ai_recommendations?.focus_areas?.map((area: string, index: number) => (
                      <Badge key={index} variant="secondary" className="text-xs">{area}</Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">Next Steps</Label>
                  <div className="space-y-1 mt-1">
                    {finalInsights.ai_recommendations?.next_best_actions?.slice(0, 2).map((action: string, index: number) => (
                      <div key={index} className="text-sm bg-blue-50 dark:bg-blue-900/20 p-2 rounded">
                        {action}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <Button onClick={() => onComplete?.(finalInsights)} className="w-full">
                View Full Analysis
              </Button>
            </>
          ) : null}
        </CardContent>
      </Card>

      {/* Enhanced Chat Section */}
      <Card className="flex flex-col h-[600px]">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <MessageSquare className="w-5 h-5 text-green-600" />
              <span>AI Assistant Chat</span>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="text-xs">
                Messages: {messageCount}/20
              </Badge>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowAnalytics(!showAnalytics)}
              >
                <BarChart3 className="w-4 h-4" />
              </Button>
            </div>
          </CardTitle>
          {showAnalytics && (
            <CardDescription>
              <div className="flex items-center space-x-4 text-xs">
                <div className="flex items-center space-x-1">
                  <Activity className="w-3 h-3 text-blue-500" />
                  <span>Progress: {Math.round(progress)}%</span>
                </div>
                <div className="flex items-center space-x-1">
                  <TrendingUp className="w-3 h-3 text-green-500" />
                  <span>Insights: {isTreeCompleted ? 'Ready' : 'Building'}</span>
                </div>
              </div>
            </CardDescription>
          )}
        </CardHeader>
        
        <CardContent className="flex-1 flex flex-col space-y-4">
          {/* Messages */}
          <ScrollArea className="flex-1 p-4 border rounded-lg">
            <div className="space-y-4">
              {chatMessages.length === 0 && (
                <div className="text-center text-gray-500 py-8">
                  <Bot className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm">Start by answering the assessment questions, then chat for personalized advice!</p>
                </div>
              )}
              
              {chatMessages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.role === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                    }`}
                  >
                    <div className="flex items-center space-x-2 mb-1">
                      {message.role === 'user' ? (
                        <User className="w-4 h-4" />
                      ) : (
                        <Bot className="w-4 h-4" />
                      )}
                      <span className="text-xs opacity-70">
                        {message.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {message.content}
                      </ReactMarkdown>
                    </div>
                    {message.questionContext && (
                      <Badge variant="outline" className="mt-2 text-xs">
                        Re: {message.questionContext.category}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
              
              {isLoadingResponse && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3">
                    <Loader2 className="w-4 h-4 animate-spin" />
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Chat Input */}
          <div className="flex space-x-2">
            <Textarea
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Ask about your assessment, get financial advice, or discuss strategies..."
              className="flex-1 min-h-[60px] resize-none"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendChatMessage();
                }
              }}
              disabled={messageCount >= 20}
            />
            <div className="flex flex-col space-y-2">
              <Button
                size="sm"
                variant="outline"
                onClick={toggleSpeechRecognition}
                disabled={messageCount >= 20}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </Button>
              <Button
                size="sm"
                onClick={sendChatMessage}
                disabled={!chatInput.trim() || isLoadingResponse || messageCount >= 20}
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {messageCount >= 20 && (
            <div className="text-center text-sm text-amber-600 bg-amber-50 dark:bg-amber-900/20 p-2 rounded">
              <Sparkles className="w-4 h-4 inline mr-1" />
              Session limit reached! Upgrade for unlimited conversations.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default EnhancedDecisionTreeWithChat;