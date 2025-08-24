import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  MessageSquare, 
  User, 
  Settings, 
  LogOut,
  Menu,
  X,
  Sparkles,
  Brain,
  Home
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
  const { user, logout } = useAuth();
  const [location, setLocation] = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const navItems: NavItem[] = [
    {
      title: 'Home',
      href: '/',
      icon: Home,
    },
    {
      title: 'Chat with AI',
      href: '/chat',
      icon: MessageSquare,
      badge: 'AI'
    },
    {
      title: 'Profile',
      href: '/profile',
      icon: User,
    },
    {
      title: 'Settings',
      href: '/settings',
      icon: Settings,
    }
  ];

  const handleNavigation = (href: string) => {
    setLocation(href);
    setIsMobileOpen(false);
  };

  const handleLogout = async () => {
    try {
      await logout();
      setLocation('/signin');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const isActive = (href: string) => {
    if (href === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(href);
  };

  const sidebarContent = (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          {!collapsed && (
            <div>
              <h2 className="font-semibold text-lg">FinApp</h2>
              <p className="text-xs text-muted-foreground">Your AI Financial Assistant</p>
            </div>
          )}
        </div>
      </div>

      <Separator />

      {/* User Profile */}
      <div className="p-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user?.profileImageUrl} />
            <AvatarFallback>
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {user?.email}
              </p>
              <Badge variant="secondary" className="text-xs mt-1">
                {user?.systemRole || 'USER'}
              </Badge>
            </div>
          )}
        </div>
      </div>

      <Separator />

      {/* Navigation */}
      <ScrollArea className="flex-1 px-2">
        <div className="space-y-1 p-2">
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Button
                key={item.href}
                variant={active ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start h-10",
                  collapsed ? "px-2" : "px-3",
                  active && "bg-primary/10 text-primary font-medium"
                )}
                onClick={() => handleNavigation(item.href)}
                disabled={item.disabled}
              >
                <item.icon className={cn("h-4 w-4", collapsed ? "" : "mr-3")} />
                {!collapsed && (
                  <>
                    <span className="flex-1 text-left">{item.title}</span>
                    {item.badge && (
                      <Badge variant="outline" className="text-xs">
                        {item.badge}
                      </Badge>
                    )}
                  </>
                )}
              </Button>
            );
          })}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 border-t">
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start h-10 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950",
            collapsed ? "px-2" : "px-3"
          )}
          onClick={handleLogout}
        >
          <LogOut className={cn("h-4 w-4", collapsed ? "" : "mr-3")} />
          {!collapsed && "Sign Out"}
        </Button>
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
      <Card className={cn(
        "hidden md:flex h-full border-r transition-all duration-300",
        collapsed ? "w-16" : "w-72",
        className
      )}>
        <CardContent className="p-0 h-full w-full">
          {sidebarContent}
        </CardContent>
      </Card>

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