import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Plus,
  Send,
  Bot,
  User,
  Search,
  MessageSquare,
  Trash2,
  Edit2,
  MoreHorizontal,
  Sparkles,
  Loader2,
  Mic,
  MicOff,
  ChevronDown,
  Menu,
  X
} from 'lucide-react';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  model?: string;
  responseTime?: number;
}

interface Conversation {
  id: string;
  title: string;
  lastMessage?: string;
  updatedAt: Date;
  messageCount: number;
}

interface EnhancedChatInterfaceProps {
  userId: string;
  advisorId: string;
}

export default function EnhancedChatInterface({ userId, advisorId }: EnhancedChatInterfaceProps) {
  // State management
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  
  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const speechRecognition = useRef<any>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

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

  // Fetch conversations list
  const { data: conversations = [] } = useQuery({
    queryKey: ['/api/chat/conversations', userId, advisorId],
    queryFn: async () => {
      const response = await fetch(`/api/chat/conversations?userId=${userId}&advisorId=${advisorId}`);
      if (!response.ok) return [];
      const data = await response.json();
      return data.map((conv: any) => ({
        id: conv.id,
        title: conv.title || 'New Chat',
        lastMessage: conv.lastMessage,
        updatedAt: new Date(conv.updatedAt),
        messageCount: conv.messageCount || 0
      }));
    },
    enabled: !!userId && !!advisorId,
  });

  // Fetch messages for current conversation
  const { data: currentMessages = [] } = useQuery({
    queryKey: ['/api/chat/messages', currentConversationId],
    queryFn: async () => {
      if (!currentConversationId) return [];
      const response = await fetch(`/api/chat/messages/${currentConversationId}`);
      if (!response.ok) return [];
      const data = await response.json();
      return data.map((msg: any) => ({
        id: msg.id,
        content: msg.message,
        role: msg.sender === 'user' ? 'user' : 'assistant',
        timestamp: new Date(msg.createdAt),
        model: msg.metadata?.modelUsed,
        responseTime: msg.metadata?.responseTimeMs
      }));
    },
    enabled: !!currentConversationId,
  });

  // Update messages when current conversation changes
  useEffect(() => {
    setMessages(currentMessages);
  }, [currentMessages]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Start new conversation
  const startNewConversation = async () => {
    try {
      const response = await fetch('/api/chat/conversations/new', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          advisorId,
          title: 'New Chat'
        })
      });

      if (!response.ok) throw new Error('Failed to create conversation');
      
      const newConversation = await response.json();
      setCurrentConversationId(newConversation.id);
      setMessages([]);
      
      // Refetch conversations list
      queryClient.invalidateQueries({ queryKey: ['/api/chat/conversations'] });
      
      toast({
        title: "New Chat Started",
        description: "You can now start chatting with your AI advisor.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to start new conversation.",
        variant: "destructive",
      });
    }
  };

  // Select conversation
  const selectConversation = (conversationId: string) => {
    setCurrentConversationId(conversationId);
  };

  // Send message
  const sendMessage = async () => {
    if (!input.trim() || isLoading || !currentConversationId) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      role: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat/send-enhanced', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: currentConversationId,
          message: input,
          userId,
          advisorId
        })
      });

      if (!response.ok) throw new Error('Failed to send message');

      const data = await response.json();
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.response,
        role: 'assistant',
        timestamp: new Date(),
        model: data.model,
        responseTime: data.responseTime
      };

      setMessages(prev => [...prev, aiMessage]);
      
      // Update conversation title if it's the first message
      if (messages.length === 0) {
        queryClient.invalidateQueries({ queryKey: ['/api/chat/conversations'] });
      }

    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Toggle speech recognition
  const toggleSpeechRecognition = () => {
    if (!speechRecognition.current) return;
    
    if (isListening) {
      speechRecognition.current.stop();
      setIsListening(false);
    } else {
      speechRecognition.current.start();
      setIsListening(true);
    }
  };

  // Filter conversations based on search
  const filteredConversations = conversations.filter(conv =>
    conv.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.lastMessage?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Auto-start first conversation or create new one
  useEffect(() => {
    if (conversations.length > 0 && !currentConversationId) {
      setCurrentConversationId(conversations[0].id);
    } else if (conversations.length === 0 && !currentConversationId) {
      // Auto-create first conversation
      startNewConversation();
    }
  }, [conversations, currentConversationId]);

  return (
    <div className="h-screen flex bg-background">
      {/* Sidebar */}
      <div className={`${isSidebarOpen ? 'w-80' : 'w-0'} transition-all duration-300 overflow-hidden border-r bg-muted/30`}>
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="p-4 border-b">
            <Button
              onClick={startNewConversation}
              className="w-full justify-start gap-2 h-12 bg-primary hover:bg-primary/90"
              data-testid="button-new-chat"
            >
              <Plus className="w-4 h-4" />
              New Chat
            </Button>
          </div>

          {/* Search */}
          <div className="p-4 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
                data-testid="input-search-conversations"
              />
            </div>
          </div>

          {/* Conversations List */}
          <ScrollArea className="flex-1">
            <div className="p-2 space-y-1">
              {filteredConversations.map((conversation) => (
                <Button
                  key={conversation.id}
                  variant={currentConversationId === conversation.id ? "secondary" : "ghost"}
                  className="w-full justify-start h-auto p-3 text-left"
                  onClick={() => selectConversation(conversation.id)}
                  data-testid={`button-conversation-${conversation.id}`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <MessageSquare className="w-4 h-4 flex-shrink-0" />
                      <span className="font-medium truncate text-sm">
                        {conversation.title}
                      </span>
                    </div>
                    {conversation.lastMessage && (
                      <p className="text-xs text-muted-foreground truncate">
                        {conversation.lastMessage}
                      </p>
                    )}
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-muted-foreground">
                        {conversation.messageCount} messages
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {conversation.updatedAt.toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              data-testid="button-toggle-sidebar"
            >
              {isSidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </Button>
            <div className="flex items-center gap-2">
              <Avatar className="w-8 h-8">
                <AvatarFallback className="bg-primary text-primary-foreground">
                  <Bot className="w-4 h-4" />
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="font-semibold text-sm">Financial AI Assistant</h2>
                <p className="text-xs text-muted-foreground">Online • Ready to help</p>
              </div>
            </div>
          </div>
          <Badge variant="secondary" className="gap-1">
            <Sparkles className="w-3 h-3" />
            GPT-4o
          </Badge>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          <div className="max-w-3xl mx-auto space-y-6">
            {messages.length === 0 ? (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                  <Bot className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Start a new conversation</h3>
                <p className="text-muted-foreground mb-4">
                  Ask me anything about finance, investments, budgeting, or financial planning.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-md mx-auto">
                  <Button
                    variant="outline"
                    className="h-auto p-3 text-left justify-start"
                    onClick={() => setInput("How should I start investing as a beginner?")}
                    data-testid="suggestion-investing"
                  >
                    <div>
                      <p className="font-medium text-sm">Investment advice</p>
                      <p className="text-xs text-muted-foreground">Get started with investing</p>
                    </div>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-auto p-3 text-left justify-start"
                    onClick={() => setInput("Help me create a monthly budget")}
                    data-testid="suggestion-budget"
                  >
                    <div>
                      <p className="font-medium text-sm">Budget planning</p>
                      <p className="text-xs text-muted-foreground">Create a personal budget</p>
                    </div>
                  </Button>
                </div>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {message.role === 'assistant' && (
                    <Avatar className="w-8 h-8 flex-shrink-0">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        <Bot className="w-4 h-4" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                  
                  <div className={`max-w-[70%] ${message.role === 'user' ? 'order-first' : ''}`}>
                    <div className={`rounded-2xl px-4 py-3 ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground ml-auto'
                        : 'bg-muted'
                    }`}>
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        {message.role === 'user' ? (
                          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        ) : (
                          <ReactMarkdown remarkPlugins={[remarkGfm]} className="text-sm">
                            {message.content}
                          </ReactMarkdown>
                        )}
                      </div>
                    </div>
                    
                    <div className={`flex items-center gap-2 mt-1 text-xs text-muted-foreground ${
                      message.role === 'user' ? 'justify-end' : 'justify-start'
                    }`}>
                      <span>{message.timestamp.toLocaleTimeString()}</span>
                      {message.model && (
                        <>
                          <span>•</span>
                          <span>{message.model}</span>
                        </>
                      )}
                      {message.responseTime && (
                        <>
                          <span>•</span>
                          <span>{message.responseTime}ms</span>
                        </>
                      )}
                    </div>
                  </div>

                  {message.role === 'user' && (
                    <Avatar className="w-8 h-8 flex-shrink-0">
                      <AvatarFallback className="bg-secondary">
                        <User className="w-4 h-4" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))
            )}
            
            {isLoading && (
              <div className="flex gap-3 justify-start">
                <Avatar className="w-8 h-8 flex-shrink-0">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    <Bot className="w-4 h-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="bg-muted rounded-2xl px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm text-muted-foreground">AI is thinking...</span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-4">
          <div className="max-w-3xl mx-auto">
            <div className="flex gap-3 items-end">
              <div className="flex-1 relative">
                <Textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Type your message..."
                  className="min-h-[44px] max-h-32 resize-none pr-12 py-3"
                  disabled={isLoading || !currentConversationId}
                  data-testid="textarea-message-input"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 bottom-1 w-8 h-8"
                  onClick={toggleSpeechRecognition}
                  disabled={isLoading}
                  data-testid="button-voice-input"
                >
                  {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </Button>
              </div>
              <Button
                onClick={sendMessage}
                disabled={!input.trim() || isLoading || !currentConversationId}
                size="icon"
                className="w-11 h-11 flex-shrink-0"
                data-testid="button-send-message"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
            
            <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
              <span>Press Enter to send, Shift + Enter for new line</span>
              <span>{input.length}/2000</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}