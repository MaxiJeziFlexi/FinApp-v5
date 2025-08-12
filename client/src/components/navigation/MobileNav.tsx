import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from 'next-themes';
import {
  Home,
  PlusCircle,
  Calculator,
  PiggyBank,
  Gamepad2,
  Bitcoin,
  Settings,
  BarChart3,
  Brain,
  Menu,
  X,
  Sun,
  Moon,
  Palette,
  LogOut,
  UserIcon
} from 'lucide-react';

// Navigation items
const navigationItems = [
  {
    path: '/',
    label: 'Dashboard',
    icon: Home,
    description: 'Main dashboard overview'
  },
  {
    path: '/finapp-home',
    label: 'FinApp',
    icon: Brain,
    description: 'AI Financial Education Platform',
    badge: 'New'
  }
];

// Premium items
const premiumItems = [
  {
    path: '/ai-report-generator',
    label: 'AI Reports',
    icon: PlusCircle,
    description: 'AI-powered financial reports',
    badge: 'Pro',
    premium: true
  },
  {
    path: '/tax-optimization',
    label: 'Tax Optimization',
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

// Admin items
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

interface MobileNavProps {
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
}

export default function MobileNav({ isOpen, onToggle, onClose }: MobileNavProps) {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const [isThemeExpanded, setIsThemeExpanded] = useState(false);

  // Check if user is on FREE plan
  const isFreeUser = !user || (user as any)?.subscriptionTier === 'FREE';
  
  // Check if user is admin
  const isAdmin = (user as any)?.role === 'admin' || (user as any)?.role === 'ADMIN' || (user as any)?.subscriptionTier === 'ADMIN';

  const isActive = (path: string) => {
    return location === path || (path !== '/' && location.startsWith(path));
  };

  const handleLinkClick = () => {
    onClose();
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="sm"
        className="fixed top-4 left-4 z-50 md:hidden bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border border-gray-200 dark:border-gray-700 shadow-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        onClick={onToggle}
      >
        {isOpen ? <X className="h-5 w-5 text-gray-700 dark:text-gray-200" /> : <Menu className="h-5 w-5 text-gray-700 dark:text-gray-200" />}
      </Button>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
              onClick={onClose}
              aria-hidden="true"
            />
            
            {/* Menu Content */}
            <motion.nav
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="fixed left-0 top-0 h-full w-full max-w-sm bg-white/98 dark:bg-gray-900/98 backdrop-blur-lg z-50 flex flex-col shadow-2xl border-r border-gray-200 dark:border-gray-700"
            >
              {/* Header */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-violet-600 rounded-lg flex items-center justify-center">
                      <Brain className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100">FinApp</h1>
                      <p className="text-xs text-gray-600 dark:text-gray-400">AI Financial Platform</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClose}
                    className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              {/* Navigation Content */}
              <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {/* Main Navigation */}
                <div className="space-y-1">
                  {navigationItems.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.path);
                    
                    return (
                      <Link key={item.path} href={item.path}>
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className={`flex items-center gap-3 p-3 rounded-xl transition-all cursor-pointer ${
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
                                    active ? 'bg-white/20 text-white border-white/30' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
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
                <div>
                  <h3 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3 px-2">Premium Features</h3>
                  <div className="space-y-1">
                    {premiumItems.map((item) => {
                      const Icon = item.icon;
                      const active = isActive(item.path);
                      
                      return (
                        <Link key={item.path} href={item.path}>
                          <motion.div
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className={`flex items-center gap-3 p-3 rounded-xl transition-all cursor-pointer ${
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
                                      active ? 'bg-white/20 text-white border-white/30' : 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200'
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
                {isAdmin && (
                  <div>
                    <h3 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3 px-2">Admin</h3>
                    <div className="space-y-1">
                      {adminItems.map((item) => {
                        const Icon = item.icon;
                        const active = isActive(item.path);
                        
                        return (
                          <Link key={item.path} href={item.path}>
                            <motion.div
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              className={`flex items-center gap-3 p-3 rounded-xl transition-all cursor-pointer ${
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
                                        active ? 'bg-white/20 text-white border-white/30' : 'bg-violet-100 dark:bg-violet-900 text-violet-800 dark:text-violet-200'
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
                )}
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-3">
                {/* Theme Toggle */}
                <div className="space-y-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-between text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                    onClick={() => setIsThemeExpanded(!isThemeExpanded)}
                  >
                    <div className="flex items-center gap-2">
                      <Palette className="h-4 w-4" />
                      Theme
                    </div>
                    <span className="text-xs capitalize">{theme}</span>
                  </Button>
                  
                  <AnimatePresence>
                    {isThemeExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="flex gap-2 pl-6"
                      >
                        <Button
                          variant={theme === 'light' ? 'default' : 'ghost'}
                          size="sm"
                          className="flex-1"
                          onClick={() => setTheme('light')}
                        >
                          <Sun className="h-3 w-3" />
                        </Button>
                        <Button
                          variant={theme === 'dark' ? 'default' : 'ghost'}
                          size="sm"
                          className="flex-1"
                          onClick={() => setTheme('dark')}
                        >
                          <Moon className="h-3 w-3" />
                        </Button>
                        <Button
                          variant={theme === 'system' ? 'default' : 'ghost'}
                          size="sm"
                          className="flex-1"
                          onClick={() => {
                            const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                            setTheme(systemTheme);
                          }}
                        >
                          <Palette className="h-3 w-3" />
                        </Button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                
                {user && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start gap-3 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                    onClick={() => {
                      logout();
                      onClose();
                    }}
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </Button>
                )}
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </>
  );
}