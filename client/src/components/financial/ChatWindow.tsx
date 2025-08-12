import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import useSpeechRecognition from "@/hooks/useSpeechRecognition";
import { 
  Send, 
  Mic, 
  MicOff, 
  ArrowLeft, 
  Download, 
  Settings, 
  Bot, 
  User,
  ChevronsUp,
  TrendingUp,
  Calculator,
  Home,
  PiggyBank
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface ChatWindowProps {
  advisor: any;
  userId: string;
  userProfile: any;
  onBackToDecisionTree: () => void;
  onBackToAdvisors: () => void;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  sentiment?: string;
  confidence?: number;
  advisorId?: string;
  responseTime?: number;
}

export default function ChatWindow({ 
  advisor, 
  userId, 
  userProfile, 
  onBackToDecisionTree, 
  onBackToAdvisors 
}: ChatWindowProps) {
  const { toast } = useToast();
  const [newMessage, setNewMessage] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [selectedModel, setSelectedModel] = useState('gpt-4o');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    isListening,
    transcript,
    startListening,
    stopListening,
    resetTranscript,
    supported: speechSupported
  } = useSpeechRecognition();

  // Fetch available models
  const { data: modelsData } = useQuery({
    queryKey: ['/api/chat/models'],
    retry: false,
  });

  // Fetch chat history
  const { data: chatHistory, refetch: refetchHistory } = useQuery({
    queryKey: ['/api/chat/history', advisor?.id, userId],
    enabled: !!advisor?.id && !!userId,
  });

  // Fetch decision tree progress for context
  const { data: decisionProgress } = useQuery({
    queryKey: ['/api/decision-tree/status', userId, advisor?.id],
    enabled: !!advisor?.id && !!userId,
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (messageData: any) => {
      const response = await apiRequest('POST', '/api/chat/send', messageData);
      return response.json();
    },
    onSuccess: (data) => {
      const assistantMessage: ChatMessage = {
        id: data.message_id || Date.now().toString(),
        role: 'assistant',
        content: data.response || data.message,
        timestamp: new Date().toISOString(),
        sentiment: data.sentiment?.sentiment,
        confidence: data.sentiment?.confidence,
        advisorId: advisor.id,
        responseTime: data.responseTime
      };
      
      setChatMessages(prev => [...prev, assistantMessage]);
      setIsTyping(false);
      refetchHistory();
    },
    onError: (error) => {
      setIsTyping(false);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
      
      const errorMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'system',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date().toISOString()
      };
      setChatMessages(prev => [...prev, errorMessage]);
    },
  });

  // Initialize chat with history and welcome message
  useEffect(() => {
    if (chatHistory && chatHistory.length > 0) {
      setChatMessages(chatHistory);
    } else if (advisor) {
      const welcomeMessage: ChatMessage = {
        id: 'welcome',
        role: 'assistant',
        content: `Welcome! I'm ${advisor.name}, your ${advisor.specialty}. I've reviewed your consultation responses and I'm ready to help you with personalized financial advice. What would you like to discuss first?`,
        timestamp: new Date().toISOString(),
        advisorId: advisor.id
      };
      setChatMessages([welcomeMessage]);
    }
  }, [chatHistory, advisor]);

  // Handle speech recognition transcript
  useEffect(() => {
    if (transcript && !isListening) {
      setNewMessage(prev => prev + ' ' + transcript);
      resetTranscript();
    }
  }, [transcript, isListening, resetTranscript]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isTyping]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || sendMessageMutation.isPending) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: newMessage,
      timestamp: new Date().toISOString()
    };

    setChatMessages(prev => [...prev, userMessage]);
    setIsTyping(true);
    setNewMessage('');

    // Send to API
    sendMessageMutation.mutate({
      message: newMessage,
      advisor_id: advisor.id,
      user_id: userId,
      session_id: `session_${userId}_${advisor.id}`,
      user_profile: userProfile,
      decision_path: decisionProgress?.decision_path || [],
      model: selectedModel
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleSpeechRecognition = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const getAdvisorIcon = () => {
    switch (advisor?.id) {
      case 'budget_planner': return Calculator;
      case 'savings_strategist': return Home;
      case 'debt_expert': return TrendingUp;
      case 'retirement_advisor': return PiggyBank;
      default: return Bot;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const AdvisorIcon = getAdvisorIcon();

  return (
    <Card className="w-full max-w-6xl mx-auto overflow-hidden">
      {/* Chat Header */}
      <CardHeader className="gradient-bg text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <AdvisorIcon className="text-white text-xl" />
            </div>
            <div>
              <CardTitle className="text-xl font-semibold">{advisor?.name}</CardTitle>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-sm opacity-90">Online • Ready to help</span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20"
              onClick={() => {
                toast({
                  title: "Feature Coming Soon",
                  description: "Report generation will be available soon.",
                });
              }}
            >
              <Download className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20"
            >
              <Settings className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </CardHeader>

      {/* Chat Messages */}
      <div className="h-96 overflow-y-auto p-6 space-y-4 bg-muted/20">
        {chatMessages.map((message) => (
          <div
            key={message.id}
            className={`flex items-start space-x-3 animate-slide-up ${
              message.role === 'user' ? 'justify-end' : ''
            }`}
          >
            {message.role !== 'user' && (
              <div className="w-10 h-10 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center flex-shrink-0">
                <Bot className="text-white w-5 h-5" />
              </div>
            )}
            
            <div className={`flex-1 ${message.role === 'user' ? 'max-w-md ml-auto' : 'max-w-lg'}`}>
              <div className={`p-4 rounded-2xl ${
                message.role === 'user' 
                  ? 'chat-bubble-user text-white rounded-tr-sm'
                  : message.role === 'system'
                  ? 'bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-tl-sm'
                  : 'chat-bubble-ai rounded-tl-sm'
              }`}>
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {message.content}
                  </ReactMarkdown>
                </div>
                
                {/* Show embedded content for financial advice */}
                {message.role === 'assistant' && message.content.includes('payoff timeline') && (
                  <div className="mt-4 bg-muted rounded-xl p-4">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-sm">
                        <span className="font-medium">Card 1 (22% APR)</span>
                        <span className="text-red-600 font-semibold">$5,200</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-red-500 h-2 rounded-full" style={{ width: '35%' }}></div>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Payoff: 8 months with $800/month
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <div className={`text-xs text-muted-foreground mt-1 ${
                message.role === 'user' ? 'text-right mr-4' : 'ml-4'
              }`}>
                {formatTimestamp(message.timestamp)}
                {message.responseTime && (
                  <span className="ml-2">• {message.responseTime}ms</span>
                )}
              </div>
            </div>
            
            {message.role === 'user' && (
              <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center flex-shrink-0">
                <User className="text-muted-foreground w-5 h-5" />
              </div>
            )}
          </div>
        ))}
        
        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex items-start space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center flex-shrink-0">
              <Bot className="text-white w-5 h-5" />
            </div>
            <div className="chat-bubble-ai rounded-2xl rounded-tl-sm p-4 max-w-md">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input */}
      <div className="border-t p-6">
        <div className="flex items-end space-x-4">
          <div className="flex-1">
            <Textarea
              placeholder="Ask me anything about your financial plan..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              className="min-h-[80px] resize-none"
              disabled={sendMessageMutation.isPending}
            />
            
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>OpenAI Connected</span>
                </div>
                <Select value={selectedModel} onValueChange={setSelectedModel}>
                  <SelectTrigger className="w-40 h-7 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {modelsData?.models?.map((model: string) => (
                      <SelectItem key={model} value={model}>
                        {model}
                      </SelectItem>
                    )) || [
                      <SelectItem key="gpt-4o" value="gpt-4o">GPT-4o</SelectItem>,
                      <SelectItem key="gpt-3.5-turbo" value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                    ]}
                  </SelectContent>
                </Select>
              </div>
              <div className="text-xs text-muted-foreground">
                {newMessage.length}/500 characters
              </div>
            </div>
          </div>
          
          <div className="flex flex-col space-y-2">
            {/* Voice Input Button */}
            {speechSupported && (
              <Button
                variant="outline"
                size="icon"
                onClick={toggleSpeechRecognition}
                className={`${isListening ? 'voice-recording border-yellow-500' : ''}`}
                disabled={sendMessageMutation.isPending}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </Button>
            )}
            
            {/* Send Button */}
            <Button
              onClick={handleSendMessage}
              disabled={!newMessage.trim() || sendMessageMutation.isPending}
              className="bg-gradient-to-r from-primary to-secondary hover:shadow-lg"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="border-t bg-muted/30 p-4">
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setNewMessage("Show me a detailed breakdown of my financial plan")}
          >
            📊 Show detailed breakdown
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setNewMessage("Help me set up payment reminders")}
          >
            📱 Set up payment reminders
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setNewMessage("How can I track my progress?")}
          >
            📈 Track progress
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setNewMessage("Generate a full financial report for me")}
          >
            📋 Generate full report
          </Button>
        </div>
        
        {/* Navigation */}
        <div className="flex justify-between items-center mt-4">
          <Button
            variant="ghost"
            onClick={onBackToDecisionTree}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Decision Tree
          </Button>
          <Button
            variant="ghost"
            onClick={onBackToAdvisors}
          >
            Choose Different Advisor
          </Button>
        </div>
      </div>
    </Card>
  );
}
