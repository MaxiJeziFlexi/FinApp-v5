import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { 
  MessageSquare, 
  User, 
  Settings, 
  LogOut,
  Menu,
  X,
  Sparkles,
  Brain,
  Home,
  Plus,
  Search,
  ChevronLeft
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

interface UserSideNavProps {
  className?: string;
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
}

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<any>;
  badge?: string;
  disabled?: boolean;
}

export default function UserSideNav({ 
  className, 
  collapsed = false, 
  onCollapsedChange 
}: UserSideNavProps) {
  const { user } = useAuth();
  const [location, setLocation] = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Mock chat history for demo
  const chatHistory = [
    {
      id: '1',
      title: 'Niestety, nie mam dostępu do aktualny',
      preview: 'Niestety, nie mam dostępu do aktualnych dar',
      timestamp: '1d ago'
    }
  ];

  const handleNewChat = () => {
    setLocation('/chat');
    setIsMobileOpen(false);
  };

  const handleLogout = () => {
    // Clear all authentication data
    localStorage.removeItem('finapp_user_auth');
    localStorage.removeItem('finapp_admin_auth');
    // Redirect to landing page
    window.location.href = '/';
  };

  const sidebarContent = (
    <div className="h-full flex flex-col bg-slate-900 text-white">
      {/* Header */}
      <div className="p-4 border-b border-slate-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-white" />
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
          {!collapsed && (
            <Button variant="ghost" size="icon" className="text-slate-300 hover:text-white">
              <ChevronLeft className="h-4 w-4" />
            </Button>
          )}
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
        <div className="flex-1 px-4 pb-4">
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
              {chatHistory.map((chat) => (
                <div 
                  key={chat.id}
                  className="p-3 rounded-lg bg-slate-800 hover:bg-slate-700 cursor-pointer transition-colors border border-slate-700"
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
              ))}
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
            onClick={() => setLocation('/profile')}
          >
            <User className="h-4 w-4 mr-3" />
            {!collapsed && "Profil"}
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start h-10 text-slate-300 hover:text-white hover:bg-slate-800"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4 mr-3" />
            {!collapsed && "Wyloguj"}
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
        className="md:hidden fixed top-4 left-4 z-50"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        {isMobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
      </Button>

      {/* Mobile Sidebar */}
      {isMobileOpen && (
        <div className="md:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setIsMobileOpen(false)} />
          <Card className="absolute left-0 top-0 h-full w-72 border-r">
            <CardContent className="p-0 h-full">
              {sidebarContent}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Desktop Sidebar */}
      <div className={cn(
        "hidden md:flex h-full transition-all duration-300 bg-slate-900",
        collapsed ? "w-16" : "w-80",
        className
      )}>
        {sidebarContent}
      </div>

      {/* Collapse Toggle for Desktop */}
      {onCollapsedChange && (
        <Button
          variant="ghost"
          size="icon"
          className="hidden md:flex absolute -right-3 top-4 z-10 h-6 w-6 rounded-full border bg-background shadow-md"
          onClick={() => onCollapsedChange(!collapsed)}
        >
          {collapsed ? <Menu className="h-3 w-3" /> : <X className="h-3 w-3" />}
        </Button>
      )}
    </>
  );
}