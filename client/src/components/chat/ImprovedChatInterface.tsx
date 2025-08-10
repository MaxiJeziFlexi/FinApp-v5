import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQuery } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { 
  Send, 
  Mic, 
  MicOff,
  Bot,
  User,
  Sparkles,
  Brain,
  FileText,
  Globe,
  TrendingUp,
  Loader2
} from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  model?: string;
  responseTime?: number;
}

interface ImprovedChatInterfaceProps {
  userId: string;
  advisorId?: string;
  sessionId?: string;
  onDataCollected?: (data: any) => void;
}

export default function ImprovedChatInterface({ 
  userId, 
  advisorId = 'general', 
  sessionId,
  onDataCollected 
}: ImprovedChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState('gpt-4o');
  const [isListening, setIsListening] = useState(false);
  const [messageMode, setMessageMode] = useState<'chat' | 'report' | 'search'>('chat');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const speechRecognition = useRef<any>(null);
  const { toast } = useToast();

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      speechRecognition.current = new (window as any).webkitSpeechRecognition();
      speechRecognition.current.continuous = false;
      speechRecognition.current.interimResults = false;
      speechRecognition.current.lang = 'en-US';

      speechRecognition.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(prev => prev + ' ' + transcript);
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

  // Fetch chat history
  const { data: chatHistory } = useQuery({
    queryKey: ['/api/chat/history', advisorId, userId],
    enabled: !!advisorId && !!userId,
  });

  // Load history on mount
  useEffect(() => {
    if (chatHistory && chatHistory.length > 0) {
      const formattedHistory = chatHistory.map((msg: any) => ({
        id: msg.id,
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.message,
        timestamp: new Date(msg.createdAt),
        model: msg.metadata?.modelUsed,
        responseTime: msg.metadata?.responseTimeMs
      }));
      setMessages(formattedHistory);
    }
  }, [chatHistory]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Track user interaction for analytics
      await fetch('/api/analytics/track-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          eventType: 'chat_message',
          eventData: {
            advisorId,
            messageMode,
            model: selectedModel,
            messageLength: input.length
          }
        })
      });

      // Determine endpoint based on mode
      let endpoint = '/api/chat/send';
      let requestBody: any = {
        message: input,
        advisor_id: advisorId,
        user_id: userId,
        session_id: sessionId || `session_${userId}_${advisorId}`,
        model: selectedModel
      };

      if (messageMode === 'report') {
        endpoint = '/api/reports/generate';
        requestBody = {
          reportType: 'ai_generated',
          prompt: input,
          includeAnalysis: true
        };
      } else if (messageMode === 'search') {
        endpoint = '/api/chat/web-search';
        requestBody.enableWebSearch = true;
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response || data.message || data.data?.analysis || 'I understand your request. Let me help you with that.',
        timestamp: new Date(),
        model: data.model || selectedModel,
        responseTime: data.responseTime
      };

      setMessages(prev => [...prev, aiMessage]);

      // Collect data for admin panel
      if (onDataCollected) {
        onDataCollected({
          userId,
          advisorId,
          messageCount: messages.length + 2,
          model: selectedModel,
          lastInteraction: new Date()
        });
      }

      // Track AI response for analytics
      await fetch('/api/data-collection/ai-interaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          modelName: selectedModel,
          prompt: input,
          response: aiMessage.content,
          metrics: {
            responseTime: data.responseTime || 0,
            tokensUsed: data.tokensUsed || 0
          }
        })
      });

    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const getModeIcon = () => {
    switch (messageMode) {
      case 'report': return <FileText className="w-4 h-4" />;
      case 'search': return <Globe className="w-4 h-4" />;
      default: return <Brain className="w-4 h-4" />;
    }
  };

  return (
    <Card className="w-full h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            AI Financial Assistant
          </CardTitle>
          <div className="flex items-center gap-2">
            <Select value={selectedModel} onValueChange={setSelectedModel}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                <SelectItem value="gpt-4-turbo">GPT-4 Turbo</SelectItem>
                <SelectItem value="gpt-3.5-turbo">GPT-3.5</SelectItem>
              </SelectContent>
            </Select>
            <Badge variant={messageMode === 'chat' ? 'default' : 'secondary'}>
              {getModeIcon()}
              <span className="ml-1 capitalize">{messageMode}</span>
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <Bot className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Start a conversation to get personalized financial advice</p>
                <p className="text-sm mt-2">I can help with budgeting, investments, tax planning, and more!</p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex items-start gap-2 max-w-[80%] ${
                    message.role === 'user' ? 'flex-row-reverse' : ''
                  }`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      message.role === 'user' 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-secondary text-secondary-foreground'
                    }`}>
                      {message.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                    </div>
                    <div className={`rounded-lg px-4 py-2 ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary'
                    }`}>
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      {message.responseTime && (
                        <p className="text-xs opacity-70 mt-1">
                          {message.model} • {message.responseTime}ms
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        <div className="p-4 border-t">
          <div className="flex gap-2 mb-2">
            <Button
              size="sm"
              variant={messageMode === 'chat' ? 'default' : 'outline'}
              onClick={() => setMessageMode('chat')}
            >
              <Brain className="w-4 h-4 mr-1" />
              Chat
            </Button>
            <Button
              size="sm"
              variant={messageMode === 'report' ? 'default' : 'outline'}
              onClick={() => setMessageMode('report')}
            >
              <FileText className="w-4 h-4 mr-1" />
              Report
            </Button>
            <Button
              size="sm"
              variant={messageMode === 'search' ? 'default' : 'outline'}
              onClick={() => setMessageMode('search')}
            >
              <Globe className="w-4 h-4 mr-1" />
              Search
            </Button>
          </div>
          
          <div className="flex gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={
                messageMode === 'report' 
                  ? "Describe the report you need..."
                  : messageMode === 'search'
                  ? "What would you like to search for?"
                  : "Ask me anything about finance..."
              }
              className="flex-1 min-h-[60px] max-h-[120px]"
              disabled={isLoading}
            />
            <div className="flex flex-col gap-2">
              <Button
                onClick={toggleSpeechRecognition}
                variant="outline"
                size="icon"
                disabled={isLoading}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </Button>
              <Button
                onClick={sendMessage}
                disabled={!input.trim() || isLoading}
                size="icon"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}