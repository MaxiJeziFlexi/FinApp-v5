import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { useAuth, logout } from '@/hooks/useAuth';
import { useTheme } from '@/contexts/ThemeContext';
import SimpleThinkingIndicator from './SimpleThinkingIndicator';
import ProfessionalMessageRenderer from './ProfessionalMessageRenderer';
import FloatingParticles from './FloatingParticles';
import AITypingIndicator from './AITypingIndicator';
import FileAnalysisUploader from './FileAnalysisUploader';
import VisualDataGenerator from './VisualDataGenerator';
import AIAgentSettings from './AIAgentSettings';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { motion, AnimatePresence } from 'framer-motion';
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
  Sun,
  ChevronLeft,
  ChevronRight,
  X,
  Copy,
  Heart,
  Star,
  Download,
  MoreVertical,
  Edit3,
  Trash2,
  Pin,
  Share2,
  ThumbsUp,
  ThumbsDown,
  RotateCcw
} from 'lucide-react';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  model?: string;
  responseTime?: number;
  reactions?: {
    like?: boolean;
    dislike?: boolean;
    favorite?: boolean;
  };
}

interface Conversation {
  id: string;
  title: string;
  lastMessage?: string;
  updatedAt: Date;
  messageCount: number;
  createdAt?: Date;
  isPinned?: boolean;
  isFavorite?: boolean;
}

interface ThreePanelChatInterfaceProps {
  userId: string;
  advisorId: string;
}

// Enhanced Conversation Item Component
interface ConversationItemProps {
  conversation: Conversation;
  isSelected: boolean;
  isCollapsed: boolean;
  onClick: () => void;
  onEdit?: (id: string, title: string) => void;
  onDelete?: (id: string) => void;
  onExport?: (format: 'txt' | 'md') => void;
}

function ConversationItem({ conversation, isSelected, isCollapsed, onClick, onEdit, onDelete, onExport }: ConversationItemProps) {
  const [showMenu, setShowMenu] = useState(false);

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowMenu(!showMenu);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit?.(conversation.id, conversation.title);
    setShowMenu(false);
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const confirmed = window.confirm('Are you sure you want to delete this conversation?');
    if (confirmed) {
      onDelete?.(conversation.id);
    }
    setShowMenu(false);
  };

  const handleExport = (e: React.MouseEvent, format: 'txt' | 'md') => {
    e.stopPropagation();
    // First select the conversation, then export
    onClick();
    setTimeout(() => onExport?.(format), 100);
    setShowMenu(false);
  };

  return (
    <div className="relative">
      <button
        onClick={onClick}
        onContextMenu={handleContextMenu}
        className={`w-full text-left p-3 rounded-lg border transition-all hover:bg-accent ${
          isSelected
            ? 'bg-accent border-primary'
            : 'border-transparent hover:border-border'
        } ${isCollapsed ? 'px-2' : ''}`}
        data-testid={`conversation-${conversation.id}`}
        title={isCollapsed ? conversation.title : ''}
      >
        <div className="flex items-center gap-2 mb-1">
          <MessageSquare className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          {!isCollapsed && (
            <span className="font-medium text-sm truncate flex-1">
              {conversation.title}
            </span>
          )}
          {!isCollapsed && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 hover:bg-muted"
              onClick={(e) => {
                e.stopPropagation();
                handleContextMenu(e);
              }}
            >
              <MoreVertical className="h-3 w-3" />
            </Button>
          )}
        </div>
        {!isCollapsed && (
          <>
            {conversation.lastMessage && (
              <p className="text-xs text-muted-foreground mb-1 truncate">
                {conversation.lastMessage}
              </p>
            )}
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{conversation.messageCount} messages</span>
              <span>{conversation.updatedAt.toLocaleDateString()}</span>
            </div>
          </>
        )}
      </button>

      {/* Context Menu */}
      {showMenu && !isCollapsed && (
        <div className="absolute right-2 top-12 z-50 bg-background border rounded-lg shadow-lg py-1 min-w-[160px]">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start h-8 px-3 text-xs hover:bg-accent"
            onClick={handleEdit}
          >
            <Edit3 className="w-3 h-3 mr-2" />
            Rename
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start h-8 px-3 text-xs hover:bg-accent"
            onClick={(e) => handleExport(e, 'txt')}
          >
            <Download className="w-3 h-3 mr-2" />
            Export as TXT
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start h-8 px-3 text-xs hover:bg-accent"
            onClick={(e) => handleExport(e, 'md')}
          >
            <Download className="w-3 h-3 mr-2" />
            Export as MD
          </Button>
          <Separator className="my-1" />
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start h-8 px-3 text-xs hover:bg-destructive hover:text-destructive-foreground"
            onClick={handleDelete}
          >
            <Trash2 className="w-3 h-3 mr-2" />
            Delete
          </Button>
        </div>
      )}
    </div>
  );
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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [thinkingMessage, setThinkingMessage] = useState('');
  const [streamingMessage, setStreamingMessage] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [editingConversationId, setEditingConversationId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [advancedSearchOpen, setAdvancedSearchOpen] = useState(false);
  const [searchFilters, setSearchFilters] = useState({
    messageType: 'all' as 'all' | 'user' | 'assistant',
    dateRange: 'all' as 'all' | 'today' | 'week' | 'month',
    hasReactions: false,
    favoriteOnly: false
  });
  const [customTheme, setCustomTheme] = useState('default');
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);
  const [showFileUploader, setShowFileUploader] = useState(false);
  const [showAIAgentSettings, setShowAIAgentSettings] = useState(false);
  const [fileAnalysisData, setFileAnalysisData] = useState<any[]>([]);
  
  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const speechRecognition = useRef<any>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();

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

  // Fetch conversations list with loading state
  const { data: conversations = [], isLoading: isLoadingConversations } = useQuery({
    queryKey: ['/api/chat/conversations', userId, advisorId],
    queryFn: async () => {
      const response = await fetch(`/api/chat/conversations?userId=${userId}&advisorId=${advisorId}`);
      if (!response.ok) return [];
      const data = await response.json();
      return data.map((conv: {id: string, title: string, lastMessage: string, updatedAt: string, messageCount: number, createdAt: string}) => ({
        id: conv.id,
        title: conv.title || 'New Chat',
        lastMessage: conv.lastMessage || '',
        updatedAt: new Date(conv.updatedAt),
        messageCount: conv.messageCount || 0,
        createdAt: new Date(conv.createdAt || conv.updatedAt)
      }));
    },
    enabled: !!userId && !!advisorId,
  });

  // Fetch messages for current conversation
  const { data: currentMessages = [] } = useQuery({
    queryKey: ['/api/chat/messages', currentConversationId],
    queryFn: async () => {
      if (!currentConversationId) return [];
      // Add timestamp to prevent caching
      const timestamp = Date.now();
      const response = await fetch(`/api/chat/messages/${currentConversationId}?t=${timestamp}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache'
        }
      });
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
    staleTime: 0,  // Always consider data stale
    gcTime: 0,  // Don't cache at all
  });

  // Update messages when current conversation changes
  useEffect(() => {
    setMessages(currentMessages as Message[]);
  }, [currentMessages]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyboard = (e: KeyboardEvent) => {
      // Ctrl/Cmd + N: New conversation
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        startNewConversation();
      }
      // Ctrl/Cmd + K: Focus search
      else if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.querySelector('[data-testid="input-search"]') as HTMLInputElement;
        searchInput?.focus();
      }
      // Ctrl/Cmd + /: Show keyboard shortcuts
      else if ((e.ctrlKey || e.metaKey) && e.key === '/') {
        e.preventDefault();
        setShowKeyboardShortcuts(true);
      }
      // Ctrl/Cmd + E: Export current conversation
      else if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
        e.preventDefault();
        if (currentConversationId && messages.length > 0) {
          exportConversation('md');
        }
      }
      // Ctrl/Cmd + D: Toggle theme
      else if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        e.preventDefault();
        toggleTheme();
      }
      // Escape: Close modals
      else if (e.key === 'Escape') {
        setShowKeyboardShortcuts(false);
        setAdvancedSearchOpen(false);
        if (editingConversationId) {
          setEditingConversationId(null);
          setEditingTitle('');
        }
      }
    };

    document.addEventListener('keydown', handleKeyboard);
    return () => document.removeEventListener('keydown', handleKeyboard);
  }, [currentConversationId, messages.length, editingConversationId]);

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

  // Enhanced send message with streaming support
  const sendMessage = async () => {
    if (!input.trim() || isLoading || !currentConversationId) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      role: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const userInput = input;
    setInput('');
    setIsLoading(true);
    setIsStreaming(true);
    setStreamingMessage('');
    setThinkingMessage('Analyzing your financial question...');

    try {
      const response = await fetch('/api/chat/send-enhanced', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: currentConversationId,
          message: userInput,
          userId,
          advisorId
        })
      });

      if (!response.ok) throw new Error('Failed to send message');

      const data = await response.json();
      
      // Simulate streaming by gradually showing the response
      const fullResponse = data.response;
      const streamingMessageId = (Date.now() + 1).toString();
      
      // Add empty AI message that will be filled with streaming content
      const aiMessage: Message = {
        id: streamingMessageId,
        content: '',
        role: 'assistant',
        timestamp: new Date(),
        model: data.model,
        responseTime: data.responseTime
      };

      setMessages(prev => [...prev, aiMessage]);

      // Simulate streaming by showing text progressively
      const words = fullResponse.split(' ');
      for (let i = 0; i <= words.length; i++) {
        const partialContent = words.slice(0, i).join(' ');
        setStreamingMessage(partialContent);
        
        // Update the actual message
        setMessages(prev => 
          prev.map(msg => 
            msg.id === streamingMessageId 
              ? { ...msg, content: partialContent }
              : msg
          )
        );
        
        // Add delay for streaming effect
        if (i < words.length) {
          await new Promise(resolve => setTimeout(resolve, 50));
        }
      }
      
      // Invalidate queries to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['/api/chat/messages', currentConversationId] });
      queryClient.invalidateQueries({ queryKey: ['/api/chat/conversations'] });

    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setIsStreaming(false);
      setStreamingMessage('');
      setThinkingMessage('');
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

  // Message reaction handlers
  const toggleMessageReaction = (messageId: string, reactionType: 'like' | 'dislike' | 'favorite') => {
    setMessages(prev => prev.map(msg => {
      if (msg.id === messageId) {
        const reactions = { ...msg.reactions };
        
        // Toggle the specific reaction
        if (reactionType === 'like') {
          reactions.like = !reactions.like;
          if (reactions.like) reactions.dislike = false; // Can't like and dislike at the same time
        } else if (reactionType === 'dislike') {
          reactions.dislike = !reactions.dislike;
          if (reactions.dislike) reactions.like = false; // Can't like and dislike at the same time
        } else if (reactionType === 'favorite') {
          reactions.favorite = !reactions.favorite;
        }
        
        return { ...msg, reactions };
      }
      return msg;
    }));
  };

  // Copy message to clipboard
  const copyMessage = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      toast({
        title: "Message Copied",
        description: "Message copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy message to clipboard",
        variant: "destructive",
      });
    }
  };

  // Export conversation
  const exportConversation = (format: 'txt' | 'md') => {
    const conversation = conversations.find((c: Conversation) => c.id === currentConversationId);
    if (!conversation || messages.length === 0) {
      toast({
        title: "Export Failed",
        description: "No conversation to export",
        variant: "destructive",
      });
      return;
    }

    let content = '';
    if (format === 'md') {
      content = `# ${conversation.title}\\n\\nExported on ${new Date().toLocaleDateString()}\\n\\n`;
      messages.forEach(msg => {
        const role = msg.role === 'user' ? '**You**' : '**AI Assistant**';
        content += `${role}: ${msg.content}\\n\\n`;
      });
    } else {
      content = `${conversation.title}\\n\\nExported on ${new Date().toLocaleDateString()}\\n\\n`;
      messages.forEach(msg => {
        const role = msg.role === 'user' ? 'You' : 'AI Assistant';
        content += `${role}: ${msg.content}\\n\\n`;
      });
    }

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${conversation.title}.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Export Successful",
      description: `Conversation exported as ${format.toUpperCase()} file`,
    });
  };

  // Conversation management
  const startEditingConversation = (conversationId: string, currentTitle: string) => {
    setEditingConversationId(conversationId);
    setEditingTitle(currentTitle);
  };

  const saveConversationTitle = async () => {
    if (!editingConversationId || !editingTitle.trim()) return;

    try {
      const response = await fetch(`/api/chat/conversations/${editingConversationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: editingTitle.trim() })
      });

      if (!response.ok) throw new Error('Failed to update title');

      queryClient.invalidateQueries({ queryKey: ['/api/chat/conversations'] });
      
      toast({
        title: "Title Updated",
        description: "Conversation title has been updated",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update conversation title",
        variant: "destructive",
      });
    } finally {
      setEditingConversationId(null);
      setEditingTitle('');
    }
  };

  const deleteConversation = async (conversationId: string) => {
    try {
      const response = await fetch(`/api/chat/conversations/${conversationId}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Failed to delete conversation');

      queryClient.invalidateQueries({ queryKey: ['/api/chat/conversations'] });
      
      if (currentConversationId === conversationId) {
        setCurrentConversationId(null);
        setMessages([]);
      }

      toast({
        title: "Conversation Deleted",
        description: "Conversation has been permanently deleted",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete conversation",
        variant: "destructive",
      });
    }
  };

  // Toggle sidebar collapse
  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  // Handle logout
  const handleLogout = () => {
    const confirmed = window.confirm('Are you sure you want to logout?');
    if (confirmed) {
      logout();
    }
  };

  // Clear chat history
  const clearChatHistory = async () => {
    try {
      const confirmed = window.confirm('Are you sure you want to clear all chat history? This action cannot be undone.');
      if (!confirmed) return;

      // Show loading toast
      toast({
        title: "Clearing Chat History",
        description: "Please wait, this may take a moment...",
      });

      // Clear local state immediately for better UX
      setMessages([]);
      setCurrentConversationId(null);

      // Call backend to clear conversations (may take time due to many deletions)
      try {
        const response = await fetch('/api/chat/conversations/clear', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId })
        });
        
        // Note: Response might timeout but deletion continues on backend
        console.log('Clear request sent to server');
      } catch (serverError) {
        // Server may timeout but still be processing - this is expected for large deletions
        console.log('Server response timeout (expected for large deletions):', serverError);
      }

      // Force refresh the conversation list after a delay to let server complete
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['/api/chat/conversations'] });
        queryClient.refetchQueries({ queryKey: ['/api/chat/conversations'] });
      }, 2000);

      // Show success message
      setTimeout(() => {
        toast({
          title: "Chat History Cleared",
          description: "All conversations have been cleared.",
        });
      }, 2500);

    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to clear chat history.",
        variant: "destructive",
      });
    }
  };

  // Helper function to group conversations by date
  const groupConversationsByDate = (convs: Conversation[]) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    const groups = {
      today: [] as Conversation[],
      yesterday: [] as Conversation[],
      thisWeek: [] as Conversation[],
      older: [] as Conversation[]
    };

    convs.forEach(conv => {
      const convDate = new Date(conv.updatedAt);
      const isToday = convDate.toDateString() === today.toDateString();
      const isYesterday = convDate.toDateString() === yesterday.toDateString();
      const isThisWeek = convDate >= weekAgo;

      if (isToday) {
        groups.today.push(conv);
      } else if (isYesterday) {
        groups.yesterday.push(conv);
      } else if (isThisWeek) {
        groups.thisWeek.push(conv);
      } else {
        groups.older.push(conv);
      }
    });

    return groups;
  };

  // Advanced search functionality
  const filteredConversations = conversations.filter((conv: Conversation) => {
    // Basic text search
    const matchesSearch = searchQuery === '' || 
      conv.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.lastMessage?.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Date range filter
    let matchesDateRange = true;
    if (searchFilters.dateRange !== 'all') {
      const now = new Date();
      const convDate = new Date(conv.updatedAt);
      const daysDiff = Math.floor((now.getTime() - convDate.getTime()) / (1000 * 60 * 60 * 24));
      
      switch (searchFilters.dateRange) {
        case 'today':
          matchesDateRange = daysDiff === 0;
          break;
        case 'week':
          matchesDateRange = daysDiff <= 7;
          break;
        case 'month':
          matchesDateRange = daysDiff <= 30;
          break;
      }
    }

    // Message count filter (favorite conversations have more messages typically)
    const matchesFavorite = !searchFilters.favoriteOnly || conv.messageCount > 5;

    return matchesSearch && matchesDateRange && matchesFavorite;
  });

  // Group filtered conversations
  const groupedConversations = groupConversationsByDate(filteredConversations);

  // Auto-start first conversation or create new one (only once)
  useEffect(() => {
    if (conversations.length > 0 && !currentConversationId && !isCreatingConversation) {
      setCurrentConversationId(conversations[0].id);
    } else if (conversations.length === 0 && !currentConversationId && !isCreatingConversation) {
      startNewConversation();
    }
  }, [conversations, currentConversationId, isCreatingConversation, startNewConversation]);

  return (
    <div className="h-screen flex bg-background relative">
      {/* Floating Particles Background */}
      <FloatingParticles 
        isActive={isLoading || isStreaming} 
        count={15}
        colors={['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b']}
        className="opacity-30 z-0"
      />
      {/* Left Sidebar - App Branding, Navigation, User Profile */}
      <div className={`${sidebarCollapsed ? 'w-16 min-w-16' : 'w-80 min-w-80'} bg-muted/30 border-r border-border flex flex-col transition-all duration-300 backdrop-blur-sm relative z-10`}>
        {/* Header with Branding */}
        <div className="p-4 border-b border-border">
          {/* Collapse Toggle Button */}
          <div className="flex items-center justify-center mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleSidebar}
              className="h-8 w-8 p-0"
              data-testid="button-toggle-sidebar"
            >
              {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </Button>
          </div>
          
          {/* Branding - Show logo always, text only when expanded */}
          <div className={`flex items-center gap-3 mb-4 ${sidebarCollapsed ? 'justify-center' : ''}`}>
            <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg text-white">
              <Brain className="h-6 w-6" />
            </div>
            {!sidebarCollapsed && (
              <div>
                <h1 className="text-lg font-bold">Reptile Agent</h1>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Online • Ready to help
                </div>
              </div>
            )}
          </div>
          
          <Button
            onClick={startNewConversation}
            disabled={isCreatingConversation}
            className={`w-full h-12 bg-primary hover:bg-primary/90 ${
              sidebarCollapsed 
                ? 'justify-center px-0' 
                : 'justify-start gap-2'
            }`}
            data-testid="button-new-chat"
            title={sidebarCollapsed ? 'New Chat' : ''}
          >
            <Plus className="w-4 h-4" />
            {!sidebarCollapsed && 'New Chat'}
          </Button>
        </div>

        {/* Enhanced Search */}
        {!sidebarCollapsed && (
          <div className="p-4 border-b border-border">
            <div className="relative mb-2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search conversations... (Ctrl+K)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-10"
                data-testid="input-search"
              />
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                onClick={() => setAdvancedSearchOpen(!advancedSearchOpen)}
                title="Advanced search filters"
              >
                <Settings className="h-3 w-3" />
              </Button>
            </div>
            
            {/* Advanced Search Filters */}
            {advancedSearchOpen && (
              <div className="space-y-2 p-3 bg-muted/30 rounded-lg border">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">FILTERS</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-5 px-1 text-xs"
                    onClick={() => {
                      setSearchFilters({
                        messageType: 'all',
                        dateRange: 'all',
                        hasReactions: false,
                        favoriteOnly: false
                      });
                    }}
                  >
                    Clear
                  </Button>
                </div>
                
                <div className="space-y-2">
                  <div>
                    <label className="text-xs text-muted-foreground">Date Range</label>
                    <select
                      value={searchFilters.dateRange}
                      onChange={(e) => setSearchFilters(prev => ({ ...prev, dateRange: e.target.value as any }))}
                      className="w-full mt-1 p-1 text-xs bg-background border rounded"
                    >
                      <option value="all">All time</option>
                      <option value="today">Today</option>
                      <option value="week">This week</option>
                      <option value="month">This month</option>
                    </select>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="favorite-filter"
                      checked={searchFilters.favoriteOnly}
                      onChange={(e) => setSearchFilters(prev => ({ ...prev, favoriteOnly: e.target.checked }))}
                      className="w-3 h-3"
                    />
                    <label htmlFor="favorite-filter" className="text-xs text-muted-foreground">
                      Active conversations only
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Chat History */}
        <div className="flex-1 overflow-hidden">
          {!sidebarCollapsed && (
            <div className="px-4 py-2 flex justify-between items-center">
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Chat History
              </h3>
              <div className="flex gap-1">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => exportConversation('md')}
                  className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
                  title="Export current conversation"
                  disabled={!currentConversationId || messages.length === 0}
                >
                  <Download className="w-3 h-3" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={clearChatHistory}
                  className="h-6 px-2 text-xs text-muted-foreground hover:text-destructive"
                >
                  Clear
                </Button>
              </div>
            </div>
          )}
          <ScrollArea className="h-full px-2">
            <div className="pb-4">
              {isLoadingConversations ? (
                // Skeleton loaders while loading
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="p-3 rounded-lg border space-y-2">
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-4 w-4" />
                        {!sidebarCollapsed && <Skeleton className="h-4 w-32" />}
                      </div>
                      {!sidebarCollapsed && (
                        <>
                          <Skeleton className="h-3 w-full" />
                          <div className="flex justify-between">
                            <Skeleton className="h-3 w-16" />
                            <Skeleton className="h-3 w-20" />
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              ) : filteredConversations.length === 0 ? (
                // No conversations message
                <div className="text-center py-8 text-muted-foreground">
                  <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">
                    {searchQuery ? 'No conversations found' : 'Start your first conversation'}
                  </p>
                </div>
              ) : (
                // Grouped conversations
                <div className="space-y-4">
                  {/* Today's Conversations */}
                  {groupedConversations.today.length > 0 && (
                    <div>
                      {!sidebarCollapsed && (
                        <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 px-1">
                          Today
                        </h4>
                      )}
                      <div className="space-y-1">
                        {groupedConversations.today.map((conversation) => (
                          <ConversationItem
                            key={conversation.id}
                            conversation={conversation}
                            isSelected={currentConversationId === conversation.id}
                            isCollapsed={sidebarCollapsed}
                            onClick={() => selectConversation(conversation.id)}
                            onEdit={startEditingConversation}
                            onDelete={deleteConversation}
                            onExport={exportConversation}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Yesterday's Conversations */}
                  {groupedConversations.yesterday.length > 0 && (
                    <div>
                      {!sidebarCollapsed && (
                        <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 px-1">
                          Yesterday
                        </h4>
                      )}
                      <div className="space-y-1">
                        {groupedConversations.yesterday.map((conversation) => (
                          <ConversationItem
                            key={conversation.id}
                            conversation={conversation}
                            isSelected={currentConversationId === conversation.id}
                            isCollapsed={sidebarCollapsed}
                            onClick={() => selectConversation(conversation.id)}
                            onEdit={startEditingConversation}
                            onDelete={deleteConversation}
                            onExport={exportConversation}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* This Week's Conversations */}
                  {groupedConversations.thisWeek.length > 0 && (
                    <div>
                      {!sidebarCollapsed && (
                        <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 px-1">
                          This Week
                        </h4>
                      )}
                      <div className="space-y-1">
                        {groupedConversations.thisWeek.map((conversation) => (
                          <ConversationItem
                            key={conversation.id}
                            conversation={conversation}
                            isSelected={currentConversationId === conversation.id}
                            isCollapsed={sidebarCollapsed}
                            onClick={() => selectConversation(conversation.id)}
                            onEdit={startEditingConversation}
                            onDelete={deleteConversation}
                            onExport={exportConversation}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Older Conversations */}
                  {groupedConversations.older.length > 0 && (
                    <div>
                      {!sidebarCollapsed && (
                        <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 px-1">
                          Older
                        </h4>
                      )}
                      <div className="space-y-1">
                        {groupedConversations.older.map((conversation) => (
                          <ConversationItem
                            key={conversation.id}
                            conversation={conversation}
                            isSelected={currentConversationId === conversation.id}
                            isCollapsed={sidebarCollapsed}
                            onClick={() => selectConversation(conversation.id)}
                            onEdit={startEditingConversation}
                            onDelete={deleteConversation}
                            onExport={exportConversation}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Conversation Editing Modal */}
          {editingConversationId && (
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
              <div className="bg-background border rounded-lg p-4 min-w-[300px]">
                <h3 className="text-sm font-medium mb-3">Rename Conversation</h3>
                <Input
                  value={editingTitle}
                  onChange={(e) => setEditingTitle(e.target.value)}
                  placeholder="Enter new title..."
                  className="mb-3"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      saveConversationTitle();
                    } else if (e.key === 'Escape') {
                      setEditingConversationId(null);
                      setEditingTitle('');
                    }
                  }}
                />
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditingConversationId(null);
                      setEditingTitle('');
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={saveConversationTitle}
                    disabled={!editingTitle.trim()}
                  >
                    Save
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Keyboard Shortcuts Modal */}
          {showKeyboardShortcuts && (
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
              <div className="bg-background border rounded-lg p-6 max-w-md w-full mx-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Keyboard Shortcuts</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => setShowKeyboardShortcuts(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">New conversation</span>
                    <kbd className="px-2 py-1 text-xs bg-muted rounded">Ctrl+N</kbd>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Search conversations</span>
                    <kbd className="px-2 py-1 text-xs bg-muted rounded">Ctrl+K</kbd>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Export conversation</span>
                    <kbd className="px-2 py-1 text-xs bg-muted rounded">Ctrl+E</kbd>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Toggle theme</span>
                    <kbd className="px-2 py-1 text-xs bg-muted rounded">Ctrl+D</kbd>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Show shortcuts</span>
                    <kbd className="px-2 py-1 text-xs bg-muted rounded">Ctrl+/</kbd>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Close modal/menu</span>
                    <kbd className="px-2 py-1 text-xs bg-muted rounded">Esc</kbd>
                  </div>
                </div>
                
                <div className="mt-6 pt-4 border-t">
                  <p className="text-xs text-muted-foreground">
                    Use Cmd instead of Ctrl on Mac
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Section */}
        <div className="p-4 border-t border-border">
          <div className={`flex items-center gap-3 mb-3 ${sidebarCollapsed ? 'justify-center' : ''}`}>
            <Avatar className="h-10 w-10">
              <AvatarImage src={(user as any)?.profileImageUrl} />
              <AvatarFallback>
                {(user as any)?.firstName?.[0] || 'U'}{(user as any)?.lastName?.[0] || ''}
              </AvatarFallback>
            </Avatar>
            {!sidebarCollapsed && (
              <div className="flex-1">
                <p className="text-sm font-medium">
                  {(user as any)?.firstName || 'User'} {(user as any)?.lastName || ''}
                </p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
            )}
          </div>
          
          <div className={`space-y-1 ${sidebarCollapsed ? 'flex flex-col items-center' : 'grid grid-cols-3 gap-2'}`}>
            <Button 
              variant="ghost" 
              size="sm" 
              className={`h-8 text-xs ${sidebarCollapsed ? 'w-8 justify-center p-0' : 'justify-center'}`}
              onClick={() => setShowSettings(true)}
              title={sidebarCollapsed ? 'Settings' : ''}
            >
              <Settings className={`w-3 h-3 ${!sidebarCollapsed ? 'mr-1' : ''}`} />
              {!sidebarCollapsed && 'Settings'}
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className={`h-8 text-xs ${sidebarCollapsed ? 'w-8 justify-center p-0' : 'justify-center'}`}
              onClick={toggleTheme}
              title={sidebarCollapsed ? 'Toggle Theme' : ''}
            >
              {theme === 'dark' ? 
                <Sun className={`w-3 h-3 ${!sidebarCollapsed ? 'mr-1' : ''}`} /> : 
                <Moon className={`w-3 h-3 ${!sidebarCollapsed ? 'mr-1' : ''}`} />
              }
              {!sidebarCollapsed && 'Theme'}
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className={`h-8 text-xs ${sidebarCollapsed ? 'w-8 justify-center p-0' : 'justify-center'}`}
              onClick={handleLogout}
              title={sidebarCollapsed ? 'Logout' : ''}
            >
              <LogOut className={`w-3 h-3 ${!sidebarCollapsed ? 'mr-1' : ''}`} />
              {!sidebarCollapsed && 'Logout'}
            </Button>
          </div>
        </div>
      </div>


      {/* Right Panel - Active Chat */}
      <div className="flex-1 flex flex-col">
        {currentConversationId ? (
          <>
            {/* Chat Header with Integrated Settings */}
            <div className="border-b border-border bg-muted/30">
              {/* Main Header */}
              <div className="p-4 pb-2">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg text-white">
                    <Bot className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">Reptile Agent</h3>
                    <p className="text-sm text-muted-foreground">Online • Ready to help</p>
                  </div>
                  <Badge className="bg-green-500 text-white">GPT-4o</Badge>
                </div>
              </div>
              
              {/* Integrated Settings Bar */}
              <div className="px-4 pb-3">
                <div className="flex items-center justify-between gap-2 bg-background/50 rounded-lg p-2 border">
                  {/* Left Side - AI Controls */}
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowAIAgentSettings(true)}
                      className="h-7 px-2 text-xs hover:bg-primary/10"
                      data-testid="button-ai-settings"
                    >
                      <Settings className="w-3 h-3 mr-1" />
                      Agent
                    </Button>
                    
                    <Select defaultValue="gpt-4o">
                      <SelectTrigger className="h-7 w-24 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                        <SelectItem value="claude">Claude</SelectItem>
                        <SelectItem value="gemini">Gemini</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.location.reload()}
                      className="h-7 px-2 text-xs hover:bg-primary/10"
                      title="Refresh chat"
                    >
                      <RotateCcw className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
                
                {/* Advanced Filter Panel */}
                {advancedSearchOpen && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-2 p-3 bg-background/80 rounded-lg border space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-muted-foreground">CHAT FILTERS</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-5 px-1 text-xs"
                        onClick={() => {
                          setSearchFilters({
                            messageType: 'all',
                            dateRange: 'all',
                            hasReactions: false,
                            favoriteOnly: false
                          });
                        }}
                      >
                        Reset
                      </Button>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="text-xs text-muted-foreground">Date Range</label>
                        <Select 
                          value={searchFilters.dateRange} 
                          onValueChange={(value) => setSearchFilters(prev => ({ ...prev, dateRange: value as any }))}
                        >
                          <SelectTrigger className="h-7 mt-1 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All time</SelectItem>
                            <SelectItem value="today">Today</SelectItem>
                            <SelectItem value="week">This week</SelectItem>
                            <SelectItem value="month">This month</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground">Message Type</label>
                        <Select 
                          value={searchFilters.messageType} 
                          onValueChange={(value) => setSearchFilters(prev => ({ ...prev, messageType: value as any }))}
                        >
                          <SelectTrigger className="h-7 mt-1 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All messages</SelectItem>
                            <SelectItem value="user">My messages</SelectItem>
                            <SelectItem value="assistant">AI responses</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-end">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <Switch 
                              checked={searchFilters.favoriteOnly} 
                              onCheckedChange={(checked) => setSearchFilters(prev => ({ ...prev, favoriteOnly: checked }))}
                            />
                            <label className="text-xs text-muted-foreground">Favorites only</label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Switch 
                              checked={searchFilters.hasReactions} 
                              onCheckedChange={(checked) => setSearchFilters(prev => ({ ...prev, hasReactions: checked }))}
                            />
                            <label className="text-xs text-muted-foreground">With reactions</label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
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
                    <div className="grid grid-cols-2 gap-3 max-w-lg mx-auto">
                      <Button
                        variant="outline"
                        className="h-auto p-4 text-left hover:shadow-lg transition-all duration-200"
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
                        className="h-auto p-4 text-left hover:shadow-lg transition-all duration-200"
                        onClick={() => setInput("Help me create a personal budget")}
                      >
                        <Calculator className="w-5 h-5 mb-2 text-blue-600" />
                        <div>
                          <div className="font-medium">Budget planning</div>
                          <div className="text-xs text-muted-foreground">Create a personal budget</div>
                        </div>
                      </Button>
                      <Button
                        variant="outline"
                        className="h-auto p-4 text-left col-span-2 hover:shadow-lg transition-all duration-200"
                        onClick={() => setShowFileUploader(!showFileUploader)}
                      >
                        <Brain className="w-5 h-5 mb-2 text-purple-600" />
                        <div>
                          <div className="font-medium">📊 Analyze Files (NEW!)</div>
                          <div className="text-xs text-muted-foreground">Upload images, PDFs, Excel, Word, PowerPoint for AI visual analysis</div>
                        </div>
                      </Button>
                    </div>
                    
                    {/* File Analysis Uploader */}
                    {showFileUploader && (
                      <div className="mt-8 max-w-4xl mx-auto">
                        <FileAnalysisUploader
                          onFileAnalyze={(file, analysis) => {
                            setFileAnalysisData(prev => [...prev, { file, analysis }]);
                            // Auto-generate message with file insights
                            const insights = analysis.insights?.slice(0, 3).join('\n• ') || 'File analysis completed';
                            setInput(`📁 Analyzed file: ${file.name}\n\nKey Insights:\n• ${insights}\n\nPlease provide detailed financial recommendations based on this analysis.`);
                          }}
                          className="animate-fade-in-3d"
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={`group flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      {message.role === 'assistant' && (
                        <Avatar className="h-8 w-8 mt-2">
                          <AvatarFallback className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                            <Bot className="h-4 w-4" />
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <div className={`max-w-[70%] ${message.role === 'user' ? 'flex flex-col items-end' : ''}`}>
                        <div
                          className={`p-3 rounded-2xl ${
                            message.role === 'user'
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                          }`}
                        >
                          <ProfessionalMessageRenderer 
                            message={{ content: message.content }}
                            role={message.role === 'user' ? 'user' : 'assistant'}
                          />
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
                        
                        {/* Message Actions & Reactions */}
                        <div className="flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2"
                            onClick={() => copyMessage(message.content)}
                            title="Copy message"
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                          
                          {message.role === 'assistant' && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                className={`h-6 px-2 ${message.reactions?.like ? 'text-green-600' : ''}`}
                                onClick={() => toggleMessageReaction(message.id, 'like')}
                                title="Like message"
                              >
                                <ThumbsUp className="h-3 w-3" />
                              </Button>
                              
                              <Button
                                variant="ghost"
                                size="sm"
                                className={`h-6 px-2 ${message.reactions?.dislike ? 'text-red-600' : ''}`}
                                onClick={() => toggleMessageReaction(message.id, 'dislike')}
                                title="Dislike message"
                              >
                                <ThumbsDown className="h-3 w-3" />
                              </Button>
                              
                              <Button
                                variant="ghost"
                                size="sm"
                                className={`h-6 px-2 ${message.reactions?.favorite ? 'text-yellow-600' : ''}`}
                                onClick={() => toggleMessageReaction(message.id, 'favorite')}
                                title="Favorite message"
                              >
                                <Star className="h-3 w-3" />
                              </Button>
                            </>
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
                
                {/* Simple Thinking Indicator */}
                {(isLoading || isStreaming) && (
                  <div className="px-4 py-6">
                    <SimpleThinkingIndicator 
                      message={isStreaming ? 'Generating your personalized financial response...' : thinkingMessage || 'Analyzing your financial question...'}
                    />
                    
                    {/* Show Visual Data Generator if file analysis data exists */}
                    {fileAnalysisData.length > 0 && (
                      <div className="mt-6">
                        <VisualDataGenerator
                          analysisData={fileAnalysisData}
                          isGenerating={isStreaming}
                          fileType="image"
                          className="animate-fade-in-3d"
                        />
                      </div>
                    )}
                  </div>
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

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowSettings(false)}>
          <div className="bg-background rounded-lg border shadow-lg max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">Settings</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSettings(false)}
                className="h-6 w-6 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="p-4 space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-2">Appearance</h3>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Theme</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={toggleTheme}
                    className="gap-2"
                  >
                    {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                    {theme === 'dark' ? 'Light' : 'Dark'}
                  </Button>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium mb-2">Chat</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Clear History</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setShowSettings(false);
                        clearChatHistory();
                      }}
                      className="text-destructive hover:text-destructive"
                    >
                      Clear All
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Sidebar</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={toggleSidebar}
                      className="gap-2"
                    >
                      {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                      {sidebarCollapsed ? 'Expand' : 'Collapse'}
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">AI Agent Settings</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setShowSettings(false);
                        setShowAIAgentSettings(true);
                      }}
                      className="gap-2"
                      data-testid="button-open-ai-agent-settings"
                    >
                      <Bot className="h-4 w-4" />
                      Customize
                    </Button>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium mb-2">Account</h3>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{(user as any)?.firstName || 'User'} {(user as any)?.lastName || ''}</p>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setShowSettings(false);
                      handleLogout();
                    }}
                    className="text-destructive hover:text-destructive gap-2"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Agent Settings Modal */}
      {showAIAgentSettings && user?.id && (
        <AIAgentSettings
          userId={user.id}
          onClose={() => setShowAIAgentSettings(false)}
        />
      )}
    </div>
  );
}