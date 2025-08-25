import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Plus,
  Send,
  Bot,
  User,
  Search,
  MessageSquare,
  Settings,
  Palette,
  LogOut,
  Sparkles,
  Loader2,
  Mic,
  MicOff,
  TrendingUp,
  Calculator,
  Clock,
  Brain,
  Moon,
  Sun
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

interface ThreePanelChatInterfaceProps {
  userId: string;
  advisorId: string;
}

export default function ThreePanelChatInterface({ userId, advisorId }: ThreePanelChatInterfaceProps) {
  // State management
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isCreatingConversation, setIsCreatingConversation] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const speechRecognition = useRef<any>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

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
      return data.map((conv: {id: string, title: string, lastMessage: string, updatedAt: string, messageCount: number}) => ({
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
      return data.map((msg: {id: string, message: string, sender: string, createdAt: string, metadata?: any}) => ({
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
  const startNewConversation = useCallback(async () => {
    if (isCreatingConversation) return;
    
    try {
      setIsCreatingConversation(true);
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
    } finally {
      setIsCreatingConversation(false);
    }
  }, [userId, advisorId, isCreatingConversation, queryClient, toast]);

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

  // Toggle theme
  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  // Handle logout
  const handleLogout = () => {
    window.location.href = '/api/logout';
  };

  // Clear chat history
  const clearChatHistory = async () => {
    try {
      const confirmed = window.confirm('Are you sure you want to clear all chat history? This action cannot be undone.');
      if (!confirmed) return;

      // Clear the current conversation
      setMessages([]);
      setCurrentConversationId(null);
      
      // Invalidate queries to refresh the conversation list
      queryClient.invalidateQueries({ queryKey: ['/api/chat/conversations'] });
      
      toast({
        title: "Chat History Cleared",
        description: "All conversations have been cleared.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to clear chat history.",
        variant: "destructive",
      });
    }
  };

  // Filter conversations based on search
  const filteredConversations = conversations.filter((conv: Conversation) =>
    conv.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.lastMessage?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Auto-start first conversation or create new one (only once)
  useEffect(() => {
    if (conversations.length > 0 && !currentConversationId && !isCreatingConversation) {
      setCurrentConversationId(conversations[0].id);
    } else if (conversations.length === 0 && !currentConversationId && !isCreatingConversation) {
      startNewConversation();
    }
  }, [conversations, currentConversationId, isCreatingConversation, startNewConversation]);

  return (
    <div className="h-screen flex bg-background">
      {/* Left Sidebar - App Branding, Navigation, User Profile */}
      <div className="w-80 bg-muted/30 border-r border-border flex flex-col">
        {/* Header with Branding */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg text-white">
              <Brain className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-lg font-bold">FinApp Chat</h1>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                Online • Secure
              </div>
            </div>
          </div>
          
          <Button
            onClick={startNewConversation}
            disabled={isCreatingConversation}
            className="w-full justify-start gap-2 h-12 bg-primary hover:bg-primary/90"
            data-testid="button-new-chat"
          >
            <Plus className="w-4 h-4" />
            New Chat
          </Button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-border">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              data-testid="input-search"
            />
          </div>
        </div>

        {/* Chat History */}
        <div className="flex-1 overflow-hidden">
          <div className="px-4 py-2 flex justify-between items-center">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Chat History
            </h3>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={clearChatHistory}
              className="h-6 px-2 text-xs text-muted-foreground hover:text-destructive"
            >
              Clear
            </Button>
          </div>
          <ScrollArea className="h-full px-2">
            <div className="space-y-1 pb-4">
              {filteredConversations.map((conversation) => (
                <button
                  key={conversation.id}
                  onClick={() => selectConversation(conversation.id)}
                  className={`w-full text-left p-3 rounded-lg border transition-all hover:bg-accent ${
                    currentConversationId === conversation.id
                      ? 'bg-accent border-primary'
                      : 'border-transparent'
                  }`}
                  data-testid={`conversation-${conversation.id}`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <MessageSquare className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium text-sm truncate">
                      {conversation.title}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {conversation.messageCount} messages • {conversation.updatedAt.toLocaleDateString()}
                  </div>
                </button>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* User Profile Section */}
        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3 mb-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={(user as any)?.profileImageUrl} />
              <AvatarFallback>
                {(user as any)?.firstName?.[0] || 'U'}{(user as any)?.lastName?.[0] || ''}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="text-sm font-medium">
                {(user as any)?.firstName || 'User'} {(user as any)?.lastName || ''}
              </p>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-2">
            <Button variant="ghost" size="sm" className="h-8 text-xs">
              <Settings className="w-3 h-3 mr-1" />
              Settings
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 text-xs"
              onClick={toggleTheme}
            >
              {isDarkMode ? <Sun className="w-3 h-3 mr-1" /> : <Moon className="w-3 h-3 mr-1" />}
              Theme
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 text-xs"
              onClick={handleLogout}
            >
              <LogOut className="w-3 h-3 mr-1" />
              Logout
            </Button>
          </div>
        </div>
      </div>


      {/* Right Panel - Active Chat */}
      <div className="flex-1 flex flex-col">
        {currentConversationId ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-border bg-muted/30">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg text-white">
                  <Bot className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold">Financial AI Assistant</h3>
                  <p className="text-sm text-muted-foreground">Online • Ready to help</p>
                </div>
                <Badge className="ml-auto">GPT-4o</Badge>
              </div>
            </div>

            {/* Messages Area */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4 max-w-4xl mx-auto">
                {messages.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="p-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                      <Sparkles className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Start a new conversation</h3>
                    <p className="text-muted-foreground mb-6">
                      Ask me anything about finance, investments, budgeting, or financial planning.
                    </p>
                    <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
                      <Button
                        variant="outline"
                        className="h-auto p-4 text-left"
                        onClick={() => setInput("I need help with investment advice")}
                      >
                        <TrendingUp className="w-5 h-5 mb-2 text-green-600" />
                        <div>
                          <div className="font-medium">Investment advice</div>
                          <div className="text-xs text-muted-foreground">Get started with investing</div>
                        </div>
                      </Button>
                      <Button
                        variant="outline"
                        className="h-auto p-4 text-left"
                        onClick={() => setInput("Help me create a personal budget")}
                      >
                        <Calculator className="w-5 h-5 mb-2 text-blue-600" />
                        <div>
                          <div className="font-medium">Budget planning</div>
                          <div className="text-xs text-muted-foreground">Create a personal budget</div>
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
                        <Avatar className="h-8 w-8 mt-2">
                          <AvatarFallback className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                            <Bot className="h-4 w-4" />
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <div
                        className={`max-w-[70%] p-3 rounded-2xl ${
                          message.role === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}
                      >
                        <div className="prose prose-sm dark:prose-invert max-w-none">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {message.content}
                          </ReactMarkdown>
                        </div>
                        <div className="text-xs opacity-70 mt-2">
                          {message.timestamp.toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                          {message.model && message.responseTime && (
                            <span className="ml-2">
                              {message.model} • {message.responseTime}ms
                            </span>
                          )}
                        </div>
                      </div>
                      {message.role === 'user' && (
                        <Avatar className="h-8 w-8 mt-2">
                          <AvatarFallback>
                            <User className="h-4 w-4" />
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="p-4 border-t border-border bg-muted/30">
              <div className="max-w-4xl mx-auto">
                <div className="flex gap-2 items-end">
                  <div className="flex-1 relative">
                    <Textarea
                      ref={textareaRef}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyPress}
                      placeholder="Type your message..."
                      className="min-h-[44px] max-h-32 resize-none pr-12"
                      disabled={isLoading}
                      data-testid="input-message"
                    />
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                      onClick={toggleSpeechRecognition}
                      disabled={!speechRecognition.current}
                    >
                      {isListening ? (
                        <MicOff className="h-4 w-4 text-red-500" />
                      ) : (
                        <Mic className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <Button
                    onClick={sendMessage}
                    disabled={!input.trim() || isLoading}
                    className="h-11 px-4"
                    data-testid="button-send"
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <div className="text-xs text-muted-foreground text-center mt-2">
                  Press Enter to send, Shift + Enter for new line
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="p-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <MessageSquare className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No conversation selected</h3>
              <p className="text-muted-foreground">
                Select a conversation from the list or start a new chat.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}