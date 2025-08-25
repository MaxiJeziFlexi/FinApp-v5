import { useState, useMemo } from 'react';
import React from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';
import { 
  Home, 
  Gamepad2, 
  Bitcoin, 
  Brain, 
  BarChart3, 
  Settings, 
  Menu, 
  X,
  User,
  LogOut,
  Shield,
  FileText,
  TrendingUp,
  Calculator,
  PiggyBank,
  BookOpen,
  Users,
  MessageCircle,
  Moon,
  Sun,
  Palette,
  Activity,
  Plus,
  Search,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { logout, useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Link } from 'wouter';

const navigationItems = [
  {
    path: '/',
    label: 'Dashboard',
    icon: Home,
    description: 'Main FinApp Dashboard'
  },
  {
    path: '/ai-report-generator',
    label: 'AI Reports',
    icon: FileText,
    description: 'Generate financial reports with AI',
    badge: 'AI'
  },
  {
    path: '/learning-hub',
    label: 'Learning Hub',
    icon: BookOpen,
    description: 'Financial education & certifications',
    badge: 'Popular'
  },
  {
    path: '/community-discussions',
    label: 'Community',
    icon: Users,
    description: 'Expert discussions & crypto rewards'
  }
];

// Premium features - moved outside for better organization
const premiumItems = [
  {
    path: '/investment-consultation',
    label: 'Investment AI',
    icon: TrendingUp,
    description: 'AI-powered investment advice',
    badge: 'Expert',
    premium: true
  },
  {
    path: '/tax-optimization',
    label: 'Tax Strategy',
    icon: Calculator,
    description: 'Tax optimization & legal strategies',
    badge: 'Premium',
    premium: true
  },
  {
    path: '/retirement-planning',
    label: 'Retirement',
    icon: PiggyBank,
    description: 'Safe retirement planning tools',
    premium: true
  },
  {
    path: '/gaming',
    label: 'Gaming Hub',
    icon: Gamepad2,
    description: 'Financial games & challenges',
    badge: 'Fun',
    premium: true
  },
  {
    path: '/enhanced-crypto',
    label: 'Crypto Market',
    icon: Bitcoin,
    description: 'Cryptocurrency trading platform',
    badge: 'Live',
    premium: true
  }
];

// Admin restricted items
const adminItems = [
  {
    path: '/admin',
    label: 'Admin Panel',
    icon: Settings,
    description: 'System management',
    restricted: true
  },
  {
    path: '/developer-diagnostics',
    label: 'Diagnostics',
    icon: BarChart3,
    description: 'Developer tools & analytics',
    badge: 'Dev',
    restricted: true
  }
];

export default function MainNavigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [location, setLocation] = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { theme, setTheme } = useTheme();
  const { user } = useAuth();

  // Check if user is on FREE plan
  const isFreeUser = !user || (user as any)?.subscriptionTier === 'FREE';
  
  // Check if user is admin (has admin role or is logged in as admin)
  const isAdmin = (user as any)?.role === 'admin' || (user as any)?.role === 'ADMIN' || (user as any)?.subscriptionTier === 'ADMIN';

  const isActive = (path: string) => {
    return location === path || (path !== '/' && location.startsWith(path));
  };

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
            onClick={logout}
          >
            <LogOut className="h-4 w-4 mr-3" />
            {!collapsed && "Wyloguj się"}
          </Button>
        </div>
      </div>
    </div>
  );

  // Close mobile menu when clicking on links
  const handleLinkClick = () => {
    setIsOpen(false);
  };

  // For regular users - show chat interface
  if (!isAdmin) {
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

  // For admins - show full navigation
  return (
    <>
      {/* Mobile Menu Button - Improved positioning and styling */}
      <Button
        variant="ghost"
        size="sm"
        className="fixed top-4 left-4 z-50 md:hidden bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border border-gray-200 dark:border-gray-700 shadow-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors mobile-touch-target"
        onClick={() => setIsOpen(!isOpen)}
        style={{ minHeight: '44px', minWidth: '44px' }}
      >
        {isOpen ? <X className="h-5 w-5 text-gray-700 dark:text-gray-200" /> : <Menu className="h-5 w-5 text-gray-700 dark:text-gray-200" />}
      </Button>

      {/* Desktop Sidebar */}
      <motion.nav
        initial={{ x: -300 }}
        animate={{ x: 0 }}
        transition={{ duration: 0.3 }}
        className="hidden md:flex fixed left-0 top-0 h-full w-72 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-r border-gray-200 dark:border-gray-700 z-40 flex-col shadow-xl"
      >
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-violet-600 rounded-lg flex items-center justify-center">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">FinApp</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">AI Financial Platform</p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {/* Main Navigation */}
          <div className="space-y-2 mb-6">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              
              return (
                <Link key={item.path} href={item.path}>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`flex items-center gap-3 p-3 rounded-lg transition-all cursor-pointer ${
                      active 
                        ? 'bg-gradient-to-r from-cyan-500 to-violet-500 text-white shadow-lg' 
                        : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200'
                    }`}
                  >
                    <Icon className={`h-5 w-5 ${active ? 'text-white' : 'text-gray-500 dark:text-gray-400'}`} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{item.label}</span>
                        {item.badge && (
                          <Badge 
                            variant={active ? "secondary" : "outline"}
                            className={`text-xs ${
                              active ? 'bg-white/20 text-white' : ''
                            }`}
                          >
                            {item.badge}
                          </Badge>
                        )}
                      </div>
                      <p className={`text-xs ${active ? 'text-white/80' : 'text-gray-500 dark:text-gray-400'}`}>
                        {item.description}
                      </p>
                    </div>
                  </motion.div>
                </Link>
              );
            })}
          </div>

          {/* Premium Features Section */}
          <div className="mb-6">
            <h3 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3 px-3">Premium Features</h3>
            <div className="space-y-2">
              {premiumItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                
                return (
                  <Link key={item.path} href={item.path}>
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`flex items-center gap-3 p-3 rounded-lg transition-all cursor-pointer ${
                        active 
                          ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-lg' 
                          : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200'
                      }`}
                    >
                      <Icon className={`h-5 w-5 ${active ? 'text-white' : 'text-gray-500 dark:text-gray-400'}`} />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{item.label}</span>
                          {item.badge && (
                            <Badge 
                              variant={active ? "secondary" : "outline"}
                              className={`text-xs ${
                                active ? 'bg-white/20 text-white' : 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200'
                              }`}
                            >
                              {item.badge}
                            </Badge>
                          )}
                          {isFreeUser && item.premium && (
                            <Badge 
                              variant="outline"
                              className="text-xs bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300 border-orange-300 dark:border-orange-700"
                            >
                              PRO
                            </Badge>
                          )}
                        </div>
                        <p className={`text-xs ${active ? 'text-white/80' : 'text-gray-500 dark:text-gray-400'}`}>
                          {item.description}
                        </p>
                      </div>
                    </motion.div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Admin Section - Only show for admin users */}
          <div className="mb-6">
            <h3 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3 px-3">Admin</h3>
            <div className="space-y-2">
              {adminItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                
                return (
                  <Link key={item.path} href={item.path}>
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`flex items-center gap-3 p-3 rounded-lg transition-all cursor-pointer ${
                        active 
                          ? 'bg-gradient-to-r from-violet-500 to-purple-500 text-white shadow-lg' 
                          : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200'
                      }`}
                    >
                      <Icon className={`h-5 w-5 ${active ? 'text-white' : 'text-gray-500 dark:text-gray-400'}`} />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{item.label}</span>
                          {item.badge && (
                            <Badge 
                              variant={active ? "secondary" : "outline"}
                              className={`text-xs ${
                                active ? 'bg-white/20 text-white' : 'bg-violet-100 dark:bg-violet-900 text-violet-800 dark:text-violet-200'
                              }`}
                            >
                              {item.badge}
                            </Badge>
                          )}
                        </div>
                        <p className={`text-xs ${active ? 'text-white/80' : 'text-gray-500 dark:text-gray-400'}`}>
                          {item.description}
                        </p>
                      </div>
                    </motion.div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="space-y-2">
            <Link href="/user-profile">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start gap-3 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                onClick={handleLinkClick}
              >
                <User className="h-4 w-4" />
                Profil Użytkownika
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start gap-3 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400"
              onClick={logout}
            >
              <LogOut className="h-4 w-4" />
              Wyloguj się
            </Button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <div className="md:hidden fixed inset-0 z-40">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
              onClick={() => setIsOpen(false)}
            />
            <motion.nav
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ duration: 0.3 }}
              className="absolute left-0 top-0 h-full w-80 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-r border-gray-200 dark:border-gray-700 flex flex-col shadow-xl"
            >
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-violet-600 rounded-lg flex items-center justify-center">
                    <Brain className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">FinApp</h1>
                    <p className="text-sm text-gray-600 dark:text-gray-400">AI Financial Platform</p>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4">
                {/* Main Navigation */}
                <div className="space-y-2 mb-6">
                  {navigationItems.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.path);
                    
                    return (
                      <Link key={item.path} href={item.path}>
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className={`flex items-center gap-3 p-3 rounded-lg transition-all cursor-pointer ${
                            active 
                              ? 'bg-gradient-to-r from-cyan-500 to-violet-500 text-white shadow-lg' 
                              : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200'
                          }`}
                          onClick={handleLinkClick}
                        >
                          <Icon className={`h-5 w-5 ${active ? 'text-white' : 'text-gray-500 dark:text-gray-400'}`} />
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{item.label}</span>
                              {item.badge && (
                                <Badge 
                                  variant={active ? "secondary" : "outline"}
                                  className={`text-xs ${
                                    active ? 'bg-white/20 text-white' : ''
                                  }`}
                                >
                                  {item.badge}
                                </Badge>
                              )}
                            </div>
                            <p className={`text-xs ${active ? 'text-white/80' : 'text-gray-500 dark:text-gray-400'}`}>
                              {item.description}
                            </p>
                          </div>
                        </motion.div>
                      </Link>
                    );
                  })}
                </div>

                {/* Premium Features */}
                <div className="mb-6">
                  <h3 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3 px-3">Premium Features</h3>
                  <div className="space-y-2">
                    {premiumItems.map((item) => {
                      const Icon = item.icon;
                      const active = isActive(item.path);
                      
                      return (
                        <Link key={item.path} href={item.path}>
                          <motion.div
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className={`flex items-center gap-3 p-3 rounded-lg transition-all cursor-pointer ${
                              active 
                                ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-lg' 
                                : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200'
                            }`}
                            onClick={handleLinkClick}
                          >
                            <Icon className={`h-5 w-5 ${active ? 'text-white' : 'text-gray-500 dark:text-gray-400'}`} />
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{item.label}</span>
                                {item.badge && (
                                  <Badge 
                                    variant={active ? "secondary" : "outline"}
                                    className={`text-xs ${
                                      active ? 'bg-white/20 text-white' : 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200'
                                    }`}
                                  >
                                    {item.badge}
                                  </Badge>
                                )}
                                {isFreeUser && item.premium && (
                                  <Badge 
                                    variant="outline"
                                    className="text-xs bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300 border-orange-300 dark:border-orange-700"
                                  >
                                    PRO
                                  </Badge>
                                )}
                              </div>
                              <p className={`text-xs ${active ? 'text-white/80' : 'text-gray-500 dark:text-gray-400'}`}>
                                {item.description}
                              </p>
                            </div>
                          </motion.div>
                        </Link>
                      );
                    })}
                  </div>
                </div>

                {/* Admin Section */}
                <div className="mb-6">
                  <h3 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3 px-3">Admin</h3>
                  <div className="space-y-2">
                    {adminItems.map((item) => {
                      const Icon = item.icon;
                      const active = isActive(item.path);
                      
                      return (
                        <Link key={item.path} href={item.path}>
                          <motion.div
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className={`flex items-center gap-3 p-3 rounded-lg transition-all cursor-pointer ${
                              active 
                                ? 'bg-gradient-to-r from-violet-500 to-purple-500 text-white shadow-lg' 
                                : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200'
                            }`}
                            onClick={handleLinkClick}
                          >
                            <Icon className={`h-5 w-5 ${active ? 'text-white' : 'text-gray-500 dark:text-gray-400'}`} />
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{item.label}</span>
                                {item.badge && (
                                  <Badge 
                                    variant={active ? "secondary" : "outline"}
                                    className={`text-xs ${
                                      active ? 'bg-white/20 text-white' : 'bg-violet-100 dark:bg-violet-900 text-violet-800 dark:text-violet-200'
                                    }`}
                                  >
                                    {item.badge}
                                  </Badge>
                                )}
                              </div>
                              <p className={`text-xs ${active ? 'text-white/80' : 'text-gray-500 dark:text-gray-400'}`}>
                                {item.description}
                              </p>
                            </div>
                          </motion.div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                <div className="space-y-2">
                  <Link href="/user-profile">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start gap-3 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                      onClick={handleLinkClick}
                    >
                      <User className="h-4 w-4" />
                      Profil Użytkownika
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start gap-3 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                    onClick={logout}
                  >
                    <LogOut className="h-4 w-4" />
                    Wyloguj się
                  </Button>
                </div>
              </div>
            </motion.nav>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}