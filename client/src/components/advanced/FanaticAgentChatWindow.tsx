import React, { useState, useEffect, useRef, useCallback } from 'react';
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
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useQuery, useMutation } from '@tanstack/react-query';
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
  DollarSign,
  Upload,
  File,
  Zap,
  Bot,
  MessageCircle,
  Settings,
  Cpu,
  Database,
  Code,
  FileImage,
  PlayCircle,
  StopCircle,
  Loader2,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Eye,
  Copy,
  Save,
  Share2,
  Filter,
  Star
} from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  messageType?: 'text' | 'report' | 'analysis' | 'web_search' | 'file_analysis' | 'code_generation';
  metadata?: {
    sources?: string[];
    confidence?: number;
    reportType?: string;
    searchQuery?: string;
    fileInfo?: {
      name: string;
      type: string;
      size: number;
      url: string;
    };
    processingTime?: number;
    modelUsed?: string;
    tokens?: number;
  };
  attachments?: Array<{
    id: string;
    name: string;
    type: string;
    url: string;
    size: number;
  }>;
}

interface FanaticAgentChatWindowProps {
  userId: string;
  sessionId: string;
  advisorId?: string;
  onMessageSent?: (message: ChatMessage) => void;
}

// Advanced AI Models with GPT-4o and future models
const AI_MODELS = [
  { 
    id: 'gpt-4o', 
    name: 'GPT-4o (Latest)', 
    description: 'Najnowszy model OpenAI z możliwością analizy obrazów i dokumentów',
    capabilities: ['text', 'vision', 'code', 'analysis', 'web'],
    icon: Sparkles,
    premium: false
  },
  { 
    id: 'gpt-5-preview', 
    name: 'GPT-5 Preview', 
    description: 'Eksperymentalny dostęp do modelu przyszłości',
    capabilities: ['text', 'vision', 'code', 'analysis', 'web', 'reasoning'],
    icon: Zap,
    premium: true
  },
  { 
    id: 'claude-3.5-sonnet', 
    name: 'Claude 3.5 Sonnet', 
    description: 'Zaawansowana analiza i długie konteksty',
    capabilities: ['text', 'code', 'analysis'],
    icon: Brain,
    premium: false
  }
];

// Enhanced message types for comprehensive functionality
const MESSAGE_TYPES = [
  { id: 'general', icon: MessageCircle, label: 'Ogólna rozmowa', color: 'bg-blue-500' },
  { id: 'financial_report', icon: FileText, label: 'Raport finansowy', color: 'bg-green-500' },
  { id: 'market_analysis', icon: TrendingUp, label: 'Analiza rynku', color: 'bg-purple-500' },
  { id: 'web_research', icon: Globe, label: 'Badania internetowe', color: 'bg-orange-500' },
  { id: 'data_analysis', icon: BarChart3, label: 'Analiza danych', color: 'bg-cyan-500' },
  { id: 'code_generation', icon: Code, label: 'Generowanie kodu', color: 'bg-indigo-500' },
  { id: 'file_analysis', icon: File, label: 'Analiza plików', color: 'bg-pink-500' }
];

export default function FanaticAgentChatWindow({ 
  userId, 
  sessionId, 
  advisorId,
  onMessageSent 
}: FanaticAgentChatWindowProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedModel, setSelectedModel] = useState('gpt-4o');
  const [selectedType, setSelectedType] = useState('general');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [processingStatus, setProcessingStatus] = useState<'idle' | 'processing' | 'complete' | 'error'>('idle');
  const [agentCapabilities, setAgentCapabilities] = useState({
    codeExecution: true,
    webSearch: true,
    fileAnalysis: true,
    imageGeneration: true,
    dataVisualization: true
  });
  
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Fetch chat history
  const { data: chatHistory, refetch: refetchHistory } = useQuery({
    queryKey: ['/api/chat/messages', sessionId],
    enabled: !!sessionId,
  });

  // Send message mutation with enhanced capabilities
  const sendMessageMutation = useMutation({
    mutationFn: async (messageData: {
      message: string;
      messageType: string;
      model: string;
      files?: File[];
      audioData?: Blob;
    }) => {
      const formData = new FormData();
      formData.append('message', messageData.message);
      formData.append('messageType', messageData.messageType);
      formData.append('model', messageData.model);
      formData.append('sessionId', sessionId);
      formData.append('userId', userId);
      
      if (messageData.files) {
        messageData.files.forEach((file, index) => {
          formData.append(`files`, file);
        });
      }
      
      if (messageData.audioData) {
        formData.append('audio', messageData.audioData, 'recording.webm');
      }

      const response = await fetch('/api/chat/fanatic-send', {
        method: 'POST',
        body: formData,
      });
      return response.json();
    },
    onSuccess: (response) => {
      const newUserMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'user',
        content: newMessage,
        timestamp: new Date(),
        messageType: selectedType as any,
        metadata: {
          modelUsed: selectedModel,
          processingTime: response.processingTime
        },
        attachments: uploadedFiles.map((file, index) => ({
          id: `${Date.now()}_${index}`,
          name: file.name,
          type: file.type,
          url: URL.createObjectURL(file),
          size: file.size
        }))
      };

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.response,
        timestamp: new Date(),
        messageType: selectedType as any,
        metadata: {
          confidence: response.confidence,
          sources: response.sources,
          processingTime: response.processingTime,
          modelUsed: selectedModel,
          tokens: response.tokens
        }
      };

      setMessages(prev => [...prev, newUserMessage, assistantMessage]);
      setNewMessage('');
      setUploadedFiles([]);
      setProcessingStatus('complete');
      
      if (onMessageSent) {
        onMessageSent(assistantMessage);
      }

      toast({
        title: "Wiadomość wysłana",
        description: `Odpowiedź wygenerowana w ${response.processingTime}ms`,
      });

      refetchHistory();
    },
    onError: (error) => {
      setProcessingStatus('error');
      toast({
        title: "Błąd wysyłania",
        description: "Nie udało się wysłać wiadomości. Spróbuj ponownie.",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsLoading(false);
    }
  });

  // Generate report mutation
  const generateReportMutation = useMutation({
    mutationFn: async (reportType: string) => {
      const response = await fetch('/api/reports/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reportType,
          userId,
          sessionId,
          model: selectedModel
        }),
      });
      return response.json();
    },
    onSuccess: (response) => {
      const reportMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: response.report,
        timestamp: new Date(),
        messageType: 'report',
        metadata: {
          reportType: response.type,
          confidence: response.confidence,
          processingTime: response.processingTime,
          modelUsed: selectedModel
        }
      };

      setMessages(prev => [...prev, reportMessage]);
      
      toast({
        title: "Raport wygenerowany",
        description: `${response.type} został utworzony pomyślnie`,
      });
    }
  });

  // Handle file upload
  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const validFiles = files.filter(file => {
      const maxSize = 10 * 1024 * 1024; // 10MB
      const allowedTypes = [
        'image/jpeg', 'image/png', 'image/webp', 'image/gif',
        'application/pdf', 'text/plain', 'text/csv',
        'application/vnd.ms-excel', 
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      ];
      
      if (file.size > maxSize) {
        toast({
          title: "Plik za duży",
          description: `${file.name} przekracza limit 10MB`,
          variant: "destructive",
        });
        return false;
      }
      
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Nieobsługiwany format",
          description: `Format ${file.type} nie jest obsługiwany`,
          variant: "destructive",
        });
        return false;
      }
      
      return true;
    });

    setUploadedFiles(prev => [...prev, ...validFiles]);
    
    if (validFiles.length > 0) {
      toast({
        title: "Pliki dodane",
        description: `Dodano ${validFiles.length} plików do analizy`,
      });
    }
  }, [toast]);

  // Voice recording functionality
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        // Process audio blob for transcription
        transcribeAudio(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      toast({
        title: "Błąd nagrywania",
        description: "Nie udało się uzyskać dostępu do mikrofonu",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
  };

  const transcribeAudio = async (audioBlob: Blob) => {
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');
      
      const response = await fetch('/api/chat/transcribe', {
        method: 'POST',
        body: formData,
      });
      
      const result = await response.json();
      
      setNewMessage(prev => prev + ' ' + result.transcript);
      
      toast({
        title: "Transkrypcja gotowa",
        description: "Nagranie zostało przepisane na tekst",
      });
    } catch (error) {
      toast({
        title: "Błąd transkrypcji",
        description: "Nie udało się przepisać nagrania",
        variant: "destructive",
      });
    }
  };

  // Send message handler
  const handleSendMessage = async () => {
    if (!newMessage.trim() && uploadedFiles.length === 0) return;
    
    setIsLoading(true);
    setProcessingStatus('processing');

    sendMessageMutation.mutate({
      message: newMessage,
      messageType: selectedType,
      model: selectedModel,
      files: uploadedFiles.length > 0 ? uploadedFiles : undefined
    });
  };

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load chat history
  useEffect(() => {
    if (chatHistory && 'messages' in chatHistory && Array.isArray(chatHistory.messages)) {
      setMessages(chatHistory.messages);
    }
  }, [chatHistory]);

  const renderMessage = (message: ChatMessage) => {
    const isUser = message.role === 'user';
    const messageTypeInfo = MESSAGE_TYPES.find(type => type.id === message.messageType) || MESSAGE_TYPES[0];
    const modelInfo = AI_MODELS.find(model => model.id === message.metadata?.modelUsed);

    return (
      <div key={message.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
        <div className={`max-w-[80%] ${isUser ? 'order-2' : 'order-1'}`}>
          <div className={`rounded-2xl p-4 ${
            isUser 
              ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white' 
              : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
          }`}>
            {/* Message header */}
            <div className="flex items-center gap-2 mb-2">
              <messageTypeInfo.icon className="h-4 w-4" />
              <span className="text-xs font-medium">
                {messageTypeInfo.label}
              </span>
              {modelInfo && (
                <Badge variant="secondary" className="text-xs">
                  <modelInfo.icon className="h-3 w-3 mr-1" />
                  {modelInfo.name}
                </Badge>
              )}
              <span className="text-xs opacity-70 ml-auto">
                {message.timestamp.toLocaleTimeString()}
              </span>
            </div>

            {/* Message content */}
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <pre className="whitespace-pre-wrap font-sans">{message.content}</pre>
            </div>

            {/* Attachments */}
            {message.attachments && message.attachments.length > 0 && (
              <div className="mt-3 space-y-2">
                {message.attachments.map((attachment) => (
                  <div key={attachment.id} className="flex items-center gap-2 p-2 bg-white/20 rounded-lg">
                    <FileImage className="h-4 w-4" />
                    <span className="text-xs truncate">{attachment.name}</span>
                    <Badge variant="outline" className="text-xs">
                      {(attachment.size / 1024).toFixed(1)}KB
                    </Badge>
                  </div>
                ))}
              </div>
            )}

            {/* Metadata */}
            {message.metadata && (
              <div className="mt-3 pt-2 border-t border-white/20 text-xs opacity-70">
                <div className="flex flex-wrap gap-3">
                  {message.metadata.confidence && (
                    <span>Pewność: {(message.metadata.confidence * 100).toFixed(0)}%</span>
                  )}
                  {message.metadata.processingTime && (
                    <span>Czas: {message.metadata.processingTime}ms</span>
                  )}
                  {message.metadata.tokens && (
                    <span>Tokeny: {message.metadata.tokens}</span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Avatar */}
        <Avatar className={`h-8 w-8 ${isUser ? 'order-1 mr-2' : 'order-2 ml-2'}`}>
          <AvatarFallback>
            {isUser ? 'U' : <Bot className="h-4 w-4" />}
          </AvatarFallback>
        </Avatar>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-slate-50 to-gray-100 dark:from-gray-900 dark:to-black">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Fanatic AI Agent</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Zaawansowany asystent AI podobny do Replit Agent
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="flex items-center gap-1">
              <Cpu className="h-3 w-3" />
              {AI_MODELS.find(m => m.id === selectedModel)?.name || 'GPT-4o'}
            </Badge>
            <Badge 
              variant={processingStatus === 'complete' ? 'default' : 
                     processingStatus === 'error' ? 'destructive' : 'secondary'}
              className="flex items-center gap-1"
            >
              {processingStatus === 'processing' && <Loader2 className="h-3 w-3 animate-spin" />}
              {processingStatus === 'complete' && <CheckCircle className="h-3 w-3" />}
              {processingStatus === 'error' && <AlertCircle className="h-3 w-3" />}
              {processingStatus}
            </Badge>
          </div>
        </div>
      </div>

      {/* Control Panel */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-3">
        <div className="flex flex-wrap items-center gap-3">
          {/* Model Selection */}
          <Select value={selectedModel} onValueChange={setSelectedModel}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {AI_MODELS.map((model) => (
                <SelectItem key={model.id} value={model.id}>
                  <div className="flex items-center gap-2">
                    <model.icon className="h-4 w-4" />
                    <span>{model.name}</span>
                    {model.premium && <Star className="h-3 w-3 text-yellow-500" />}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Message Type */}
          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MESSAGE_TYPES.map((type) => (
                <SelectItem key={type.id} value={type.id}>
                  <div className="flex items-center gap-2">
                    <type.icon className="h-4 w-4" />
                    <span>{type.label}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <FileText className="h-4 w-4 mr-1" />
                  Raport
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Generuj raport</DialogTitle>
                  <DialogDescription>
                    Wybierz typ raportu do wygenerowania
                  </DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-3 mt-4">
                  {['financial-summary', 'market-analysis', 'risk-assessment', 'performance-review'].map((type) => (
                    <Button
                      key={type}
                      variant="outline"
                      onClick={() => generateReportMutation.mutate(type)}
                      className="h-auto p-3 flex flex-col items-center gap-2"
                    >
                      <FileText className="h-6 w-6" />
                      <span className="text-xs capitalize">{type.replace('-', ' ')}</span>
                    </Button>
                  ))}
                </div>
              </DialogContent>
            </Dialog>

            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-4 w-4 mr-1" />
              Pliki
            </Button>
          </div>
        </div>

        {/* File uploads preview */}
        {uploadedFiles.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {uploadedFiles.map((file, index) => (
              <div key={index} className="flex items-center gap-2 bg-blue-100 dark:bg-blue-900 rounded-lg px-3 py-1">
                <FileImage className="h-4 w-4" />
                <span className="text-sm truncate max-w-32">{file.name}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setUploadedFiles(prev => prev.filter((_, i) => i !== index))}
                  className="h-auto p-1"
                >
                  ×
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.length === 0 && (
            <div className="text-center py-12">
              <Bot className="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-600 dark:text-gray-400 mb-2">
                Witaj w Fanatic AI Agent!
              </h3>
              <p className="text-sm text-gray-500 max-w-md mx-auto">
                Jestem zaawansowanym asystentem AI z możliwościami podobnymi do Replit Agent. 
                Mogę analizować pliki, generować raporty, pisać kod i wiele więcej!
              </p>
            </div>
          )}
          
          {messages.map(renderMessage)}
          
          {isLoading && (
            <div className="flex justify-start mb-4">
              <div className="bg-white dark:bg-gray-800 border rounded-2xl p-4 max-w-xs">
                <div className="flex items-center gap-3">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                  <span className="text-sm text-gray-500">AI myśli...</span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4">
        <div className="flex gap-3">
          <div className="flex-1">
            <Textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Napisz wiadomość do Fanatic AI Agent..."
              className="min-h-[60px] max-h-32 resize-none"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
            />
          </div>
          
          <div className="flex flex-col gap-2">
            <Button
              onClick={handleSendMessage}
              disabled={(!newMessage.trim() && uploadedFiles.length === 0) || isLoading}
              size="sm"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={isRecording ? stopRecording : startRecording}
              className={isRecording ? 'bg-red-100 hover:bg-red-200' : ''}
            >
              {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Processing indicator */}
        {processingStatus === 'processing' && (
          <div className="mt-2">
            <Progress value={66} className="h-1" />
            <p className="text-xs text-gray-500 mt-1">Przetwarzanie przez {selectedModel}...</p>
          </div>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,application/pdf,text/*,.csv,.xlsx,.xls"
        onChange={handleFileUpload}
        className="hidden"
      />
    </div>
  );
}