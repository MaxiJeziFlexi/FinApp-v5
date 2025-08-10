import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { 
  Send, 
  Mic, 
  MicOff, 
  Download, 
  Search, 
  FileText, 
  Brain, 
  Globe, 
  Sparkles,
  TrendingUp,
  BarChart3,
  DollarSign
} from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  messageType?: 'text' | 'report' | 'analysis' | 'web_search';
  metadata?: {
    sources?: string[];
    confidence?: number;
    reportType?: string;
    searchQuery?: string;
  };
}

interface EnhancedChatWindowProps {
  userId: string;
  sessionId: string;
  advisorId?: string;
  decisionTreeContext?: {
    advisor: any;
    completedResponses: boolean;
    userInsights: boolean;
  };
  onMessageSent?: (message: ChatMessage) => void;
}

const AI_MODELS = [
  { id: 'gpt-4o', name: 'GPT-4o (Advanced)', description: 'Najnowszy model z możliwością wyszukiwania w sieci' },
  { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', description: 'Szybki i wydajny model' },
  { id: 'claude-3.5-sonnet', name: 'Claude 3.5 Sonnet', description: 'Zaawansowana analiza i raportowanie' }
];

const MESSAGE_TYPES = [
  { id: 'general', icon: Brain, label: 'Ogólne pytanie' },
  { id: 'financial_report', icon: FileText, label: 'Raport finansowy' },
  { id: 'market_analysis', icon: TrendingUp, label: 'Analiza rynku' },
  { id: 'web_research', icon: Globe, label: 'Badania internetowe' },
  { id: 'data_analysis', icon: BarChart3, label: 'Analiza danych' }
];

export default function EnhancedChatWindow({ 
  userId, 
  sessionId, 
  advisorId,
  decisionTreeContext,
  onMessageSent 
}: EnhancedChatWindowProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState('gpt-4o');
  const [messageType, setMessageType] = useState('general');
  const [isListening, setIsListening] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [reportContext, setReportContext] = useState('');
  const [decisionTreeData, setDecisionTreeData] = useState<any>(null);
  const [messageCount, setMessageCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Speech recognition setup
  const speechRecognition = useRef<any>(null);

  // Load decision tree data for context
  useEffect(() => {
    const loadDecisionTreeData = async () => {
      if (!advisorId || !userId) return;
      
      try {
        const response = await fetch(`/api/decision-tree-context/${advisorId}/${userId}`);
        if (response.ok) {
          const data = await response.json();
          setDecisionTreeData(data);
          
          // Add context message if decision tree completed
          if (data.completed && data.responses) {
            const contextMessage: ChatMessage = {
              id: 'context_' + Date.now(),
              role: 'system',
              content: `Based on your completed ${decisionTreeContext?.advisor?.name || 'financial'} assessment, I understand your preferences and can provide personalized advice. Feel free to ask about your responses or get recommendations!`,
              timestamp: new Date(),
              messageType: 'analysis'
            };
            setMessages([contextMessage]);
          }
        }
      } catch (error) {
        console.error('Failed to load decision tree context:', error);
      }
    };

    loadDecisionTreeData();
  }, [advisorId, userId, decisionTreeContext]);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      speechRecognition.current = new (window as any).webkitSpeechRecognition();
      speechRecognition.current.continuous = false;
      speechRecognition.current.interimResults = false;
      speechRecognition.current.lang = 'pl-PL';

      speechRecognition.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputMessage(transcript);
        setIsListening(false);
      };

      speechRecognition.current.onerror = () => {
        setIsListening(false);
        toast({
          title: "Błąd rozpoznawania mowy",
          description: "Nie udało się rozpoznać mowy. Spróbuj ponownie.",
          variant: "destructive",
        });
      };
    }
  }, [toast]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const toggleSpeechRecognition = () => {
    if (!speechRecognition.current) {
      toast({
        title: "Rozpoznawanie mowy niedostępne",
        description: "Twoja przeglądarka nie obsługuje rozpoznawania mowy.",
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
    if (!inputMessage.trim()) return;
    
    // Check message limit
    if (messageCount >= 20) {
      toast({
        title: "Message Limit Reached",
        description: "You've reached the 20-message limit. Upgrade for unlimited access!",
        variant: "destructive"
      });
      return;
    }

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date(),
      messageType: messageType as any,
      metadata: {
        searchQuery: messageType === 'web_research' ? searchQuery : undefined,
        reportType: messageType === 'financial_report' ? 'financial' : undefined
      }
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Enhanced API call with advisor context and decision tree data
      let endpoint = '/api/chat/send';
      let requestBody: any = {
        message: inputMessage,
        model: selectedModel,
        messageType,
        user_id: userId,
        advisor_id: advisorId,
        session_id: sessionId,
        context: reportContext,
        include_decision_tree_context: true
      };

      // Add web search capability
      if (messageType === 'web_research') {
        endpoint = '/api/chat/web-search';
        requestBody.searchQuery = searchQuery || inputMessage;
        requestBody.enableWebSearch = true;
      }

      // Add report generation capability
      if (messageType === 'financial_report') {
        endpoint = '/api/chat/generate-report';
        requestBody.reportType = 'financial';
        requestBody.includeAnalysis = true;
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }

      const data = await response.json();

      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response || data.content,
        timestamp: new Date(),
        messageType: messageType as any,
        metadata: {
          sources: data.sources,
          confidence: data.confidence,
          reportType: data.reportType,
          searchQuery: data.searchQuery
        }
      };

      setMessages(prev => [...prev, aiMessage]);
      setMessageCount(prev => prev + 1);

      // Track the interaction for AI training
      await fetch('/api/data-collection/ai-interaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          modelName: selectedModel,
          prompt: inputMessage,
          response: aiMessage.content,
          metrics: {
            responseTime: data.responseTime || 0,
            tokensUsed: data.tokensUsed || 0,
            cost: data.cost || 0
          }
        })
      });

      if (onMessageSent) {
        onMessageSent(aiMessage);
      }

    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Błąd",
        description: "Nie udało się wysłać wiadomości. Spróbuj ponownie.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateReport = async () => {
    if (messages.length === 0) {
      toast({
        title: "Brak danych",
        description: "Rozpocznij rozmowę aby wygenerować raport.",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch('/api/chat/generate-conversation-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: messages.map(msg => ({
            role: msg.role,
            content: msg.content,
            timestamp: msg.timestamp
          })),
          userId,
          sessionId,
          model: selectedModel
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate report');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `conversation-report-${sessionId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);

      toast({
        title: "Raport wygenerowany",
        description: "Raport z rozmowy został pobrany.",
      });

    } catch (error) {
      console.error('Error generating report:', error);
      toast({
        title: "Błąd",
        description: "Nie udało się wygenerować raportu.",
        variant: "destructive",
      });
    }
  };

  const renderMessage = (message: ChatMessage) => {
    const isUser = message.role === 'user';
    
    return (
      <div
        key={message.id}
        className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4 animate-fade-in`}
      >
        <div className={`flex items-start gap-3 max-w-[80%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
          <Avatar className="w-8 h-8">
            <AvatarFallback className={isUser ? 'bg-blue-500 text-white' : 'bg-green-500 text-white'}>
              {isUser ? 'U' : 'AI'}
            </AvatarFallback>
          </Avatar>
          
          <div
            className={`p-4 rounded-2xl shadow-sm ${
              isUser 
                ? 'bg-blue-500 text-white ml-4' 
                : 'bg-gray-100 dark:bg-gray-800 mr-4'
            }`}
          >
            <div className="text-sm mb-1">
              {message.messageType && (
                <Badge variant="outline" className="mb-2">
                  {MESSAGE_TYPES.find(t => t.id === message.messageType)?.label || message.messageType}
                </Badge>
              )}
            </div>
            
            <div className="whitespace-pre-wrap">{message.content}</div>
            
            {message.metadata?.sources && (
              <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-600">
                <div className="text-xs opacity-75">Źródła:</div>
                {message.metadata.sources.map((source, idx) => (
                  <div key={idx} className="text-xs opacity-75 truncate">
                    • {source}
                  </div>
                ))}
              </div>
            )}
            
            <div className="text-xs opacity-50 mt-1">
              {message.timestamp.toLocaleTimeString()}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Zaawansowany Chat AI
          </span>
          <Button
            onClick={generateReport}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Pobierz raport
          </Button>
        </CardTitle>
        
        <div className="flex gap-4">
          <Select value={selectedModel} onValueChange={setSelectedModel}>
            <SelectTrigger className="w-[240px]">
              <SelectValue placeholder="Wybierz model AI" />
            </SelectTrigger>
            <SelectContent>
              {AI_MODELS.map(model => (
                <SelectItem key={model.id} value={model.id}>
                  <div>
                    <div className="font-medium">{model.name}</div>
                    <div className="text-xs text-gray-500">{model.description}</div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={messageType} onValueChange={setMessageType}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Typ wiadomości" />
            </SelectTrigger>
            <SelectContent>
              {MESSAGE_TYPES.map(type => (
                <SelectItem key={type.id} value={type.id}>
                  <div className="flex items-center gap-2">
                    <type.icon className="h-4 w-4" />
                    {type.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col">
        <Tabs defaultValue="chat" className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="chat">Chat</TabsTrigger>
            <TabsTrigger value="advanced">Zaawansowane</TabsTrigger>
          </TabsList>
          
          <TabsContent value="chat" className="flex-1 flex flex-col">
            <ScrollArea className="flex-1 pr-4">
              <div className="space-y-4 pb-4">
                {messages.map(renderMessage)}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-2xl">
                      <div className="flex items-center gap-2">
                        <div className="animate-spin h-4 w-4 border-2 border-gray-400 border-t-transparent rounded-full"></div>
                        AI myśli...
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="advanced" className="flex-1 flex flex-col">
            <div className="space-y-4">
              {messageType === 'web_research' && (
                <div>
                  <label className="text-sm font-medium">Zapytanie do wyszukiwania:</label>
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Co chcesz wyszukać w internecie?"
                    className="mt-1"
                  />
                </div>
              )}
              
              {messageType === 'financial_report' && (
                <div>
                  <label className="text-sm font-medium">Kontekst raportu:</label>
                  <Textarea
                    value={reportContext}
                    onChange={(e) => setReportContext(e.target.value)}
                    placeholder="Podaj dodatkowe informacje dla raportu finansowego..."
                    className="mt-1 h-24"
                  />
                </div>
              )}
              
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Możliwości AI:</h4>
                <ul className="text-sm space-y-1">
                  <li>• Nieograniczone wyszukiwanie w internecie</li>
                  <li>• Generowanie szczegółowych raportów</li>
                  <li>• Analiza danych finansowych</li>
                  <li>• Rozpoznawanie mowy</li>
                  <li>• Eksport rozmów do PDF</li>
                </ul>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <Separator className="my-4" />
        
        <div className="flex gap-2">
          <Textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Napisz wiadomość..."
            className="flex-1 min-h-[60px] max-h-[120px]"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
          />
          
          <div className="flex flex-col gap-2">
            <Button
              onClick={toggleSpeechRecognition}
              variant="outline"
              size="icon"
              className={isListening ? 'bg-red-100 border-red-300' : ''}
              disabled={isLoading}
            >
              {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </Button>
            
            <Button
              onClick={sendMessage}
              disabled={isLoading || !inputMessage.trim()}
              size="icon"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}