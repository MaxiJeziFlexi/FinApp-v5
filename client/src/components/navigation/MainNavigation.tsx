import { useState, useMemo } from 'react';
import React from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';
import { 
  Brain, 
  Settings, 
  Menu, 
  X,
  User,
  LogOut,
  Moon,
  Sun,
  Plus,
  Search,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function MainNavigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [location, setLocation] = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { theme, setTheme } = useTheme();
  const { user } = useAuth();

  // Load real chat history
  const { data: chatHistoryData } = useQuery({
    queryKey: ['/api/chat/history', 'financial-advisor', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const response = await fetch(`/api/chat/history/financial-advisor?user_id=${user.id}`);
      if (!response.ok) return [];
      return response.json();
    },
    enabled: !!user?.id,
  });

  // Format chat history for sidebar display
  const chatHistory = React.useMemo(() => {
    if (!chatHistoryData || !Array.isArray(chatHistoryData)) return [];
    
    // Group messages by session/date and create summaries
    const sessionsMap = new Map();
    chatHistoryData.forEach((msg: any) => {
      const sessionKey = msg.sessionId || 'default';
      if (!sessionsMap.has(sessionKey)) {
        sessionsMap.set(sessionKey, {
          id: sessionKey,
          title: msg.message.slice(0, 40) + (msg.message.length > 40 ? '...' : ''),
          preview: msg.message.slice(0, 60) + (msg.message.length > 60 ? '...' : ''),
          timestamp: new Date(msg.createdAt).toLocaleDateString('pl-PL', {
            day: 'numeric',
            month: 'short'
          }),
          lastMessage: new Date(msg.createdAt)
        });
      } else {
        const session = sessionsMap.get(sessionKey);
        if (new Date(msg.createdAt) > session.lastMessage) {
          session.title = msg.message.slice(0, 40) + (msg.message.length > 40 ? '...' : '');
          session.preview = msg.message.slice(0, 60) + (msg.message.length > 60 ? '...' : '');
          session.lastMessage = new Date(msg.createdAt);
        }
      }
    });
    
    return Array.from(sessionsMap.values()).sort((a, b) => 
      b.lastMessage.getTime() - a.lastMessage.getTime()
    );
  }, [chatHistoryData]);

  const handleNewChat = () => {
    setLocation('/chat');
    setIsOpen(false);
  };

  // Filter chat history based on search query
  const filteredChatHistory = chatHistory.filter(chat =>
    chat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chat.preview.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Chat sidebar content
  const sidebarContent = (
    <div className="h-full flex flex-col bg-slate-900 text-white">
      {/* Header */}
      <div className="p-4 border-b border-slate-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Brain className="h-4 w-4 text-white" />
            </div>
            {!collapsed && (
              <div>
                <h2 className="font-semibold text-lg text-white">FinApp Chat</h2>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <p className="text-xs text-slate-300">Online • Secure</p>
                </div>
              </div>
            )}
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-slate-300 hover:text-white"
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* New Chat Button */}
      {!collapsed && (
        <div className="p-4">
          <Button 
            onClick={handleNewChat}
            className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-lg flex items-center justify-center gap-2"
          >
            <Plus className="h-5 w-5" />
            Nowy Chat
          </Button>
        </div>
      )}

      {/* Chat History Section */}
      {!collapsed && (
        <div className="flex-1 px-4 pb-4 min-h-0">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
            HISTORIA CHATÓW
          </h3>
          
          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input 
              placeholder="Szukaj chatów..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-slate-800 border-slate-600 text-white placeholder:text-slate-400 focus:border-slate-500"
            />
          </div>

          {/* Chat History List */}
          <ScrollArea className="flex-1">
            <div className="space-y-2">
              {filteredChatHistory.length > 0 ? (
                filteredChatHistory.map((chat) => (
                  <div 
                    key={chat.id}
                    className="p-3 rounded-lg bg-slate-800 hover:bg-slate-700 cursor-pointer transition-colors border border-slate-700"
                    onClick={() => setLocation('/chat')}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Brain className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-white truncate">
                          {chat.title}
                        </h4>
                        <p className="text-xs text-slate-400 truncate">
                          {chat.preview}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          {chat.timestamp}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Brain className="h-12 w-12 text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-400 text-sm">
                    {searchQuery ? 'Nie znaleziono chatów' : 'Brak historii chatów'}
                  </p>
                  <p className="text-slate-500 text-xs mt-1">
                    {searchQuery ? 'Spróbuj innego wyszukiwania' : 'Rozpocznij nowy chat'}
                  </p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      )}

      {/* Footer Navigation */}
      <div className="p-4 border-t border-slate-700">
        <div className="space-y-2">
          <Button
            variant="ghost"
            className="w-full justify-start h-10 text-slate-300 hover:text-white hover:bg-slate-800"
            onClick={() => setLocation('/user-profile')}
          >
            <User className="h-4 w-4 mr-3" />
            {!collapsed && "Profil Użytkownika"}
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start h-10 text-slate-300 hover:text-white hover:bg-slate-800"
            onClick={() => setLocation('/user-profile')}
          >
            <Settings className="h-4 w-4 mr-3" />
            {!collapsed && "Ustawienia Profilu"}
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start h-10 text-slate-300 hover:text-white hover:bg-slate-800"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4 mr-3" />
            ) : (
              <Moon className="h-4 w-4 mr-3" />
            )}
            {!collapsed && "Motyw"}
          </Button>
          <div className="border-t border-slate-600 my-2"></div>
          <Button
            variant="ghost"
            className="w-full justify-start h-10 text-slate-300 hover:text-white hover:bg-slate-800"
            onClick={() => window.location.href = '/api/logout'}
          >
            <LogOut className="h-4 w-4 mr-3" />
            {!collapsed && "Wyloguj się"}
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden fixed top-4 left-4 z-50 bg-slate-800 text-white hover:bg-slate-700"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
      </Button>

      {/* Mobile Sidebar */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-80">
            {sidebarContent}
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <motion.nav
        initial={{ x: -300 }}
        animate={{ x: 0 }}
        transition={{ duration: 0.3 }}
        className={`hidden md:flex fixed left-0 top-0 h-full transition-all duration-300 z-40 ${
          collapsed ? 'w-16' : 'w-80'
        }`}
      >
        {sidebarContent}
      </motion.nav>
    </>
  );
}