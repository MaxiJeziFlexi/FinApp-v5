import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { logout, useAuth } from '@/hooks/useAuth';

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
  const [location] = useLocation();
  const [isProfileExpanded, setIsProfileExpanded] = useState(false);
  const { theme, setTheme } = useTheme();
  const { user } = useAuth();
  
  // Check if user is on FREE plan
  const isFreeUser = !user || (user as any)?.subscriptionTier === 'FREE';
  
  // Check if user is admin (has admin role or is logged in as admin)
  const isAdmin = (user as any)?.role === 'admin' || (user as any)?.role === 'ADMIN' || (user as any)?.subscriptionTier === 'ADMIN';

  const isActive = (path: string) => {
    return location === path || (path !== '/' && location.startsWith(path));
  };

  // Close mobile menu when clicking on links
  const handleLinkClick = () => {
    setIsOpen(false);
  };

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
                          {/* Show existing badge */}
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
                          {/* Show PRO indicator for FREE users on premium features */}
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
          {isAdmin && (
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
          )}
        </div>

        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="space-y-2">
            {/* User Profile Section */}
            <div className="space-y-2">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-between gap-3 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                onClick={() => setIsProfileExpanded(!isProfileExpanded)}
              >
                <div className="flex items-center gap-3">
                  <User className="h-4 w-4" />
                  Profil Użytkownika
                </div>
                <motion.div
                  animate={{ rotate: isProfileExpanded ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Settings className="h-4 w-4" />
                </motion.div>
              </Button>
              
              <AnimatePresence>
                {isProfileExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden ml-6 space-y-2"
                  >
                    <Link href="/profile">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start gap-3 text-gray-500 dark:text-gray-500 hover:text-gray-900 dark:hover:text-gray-200"
                      >
                        <User className="h-3 w-3" />
                        Ustawienia Profilu
                      </Button>
                    </Link>
                    
                    {/* Theme Toggle */}
                    <div className="space-y-1">
                      <div className="text-xs text-gray-500 dark:text-gray-500 px-3 font-medium">Motyw</div>
                      <div className="grid grid-cols-3 gap-1">
                        <Button
                          variant={theme === 'light' ? "default" : "ghost"}
                          size="sm"
                          className={`text-xs h-8 ${theme === 'light' ? 'bg-cyan-500 hover:bg-cyan-600 text-white' : 'text-gray-500 dark:text-gray-500'}`}
                          onClick={() => setTheme('light')}
                        >
                          <Sun className="h-3 w-3" />
                        </Button>
                        <Button
                          variant={theme === 'dark' ? "default" : "ghost"}
                          size="sm"
                          className={`text-xs h-8 ${theme === 'dark' ? 'bg-violet-500 hover:bg-violet-600 text-white' : 'text-gray-500 dark:text-gray-500'}`}
                          onClick={() => setTheme('dark')}
                        >
                          <Moon className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs h-8 text-gray-500 dark:text-gray-500"
                          onClick={() => {
                            const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                            setTheme(systemTheme);
                          }}
                        >
                          <Palette className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
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

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
              onClick={() => setIsOpen(false)}
            />
            <motion.nav
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ duration: 0.3 }}
              className="fixed left-0 top-0 h-full w-full max-w-sm bg-white/98 dark:bg-gray-900/98 backdrop-blur-lg z-50 flex flex-col shadow-2xl md:hidden border-r border-gray-200 dark:border-gray-700"
            >
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
                    onClick={() => setIsOpen(false)}
                    className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-1">
                <div className="space-y-2">
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
                                    active ? 'bg-white/20 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
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

                {/* Mobile Premium Features Section */}
                <div className="mt-6">
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
                                {/* Show existing badge */}
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
                                {/* Show PRO indicator for FREE users on premium features */}
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

                {/* Mobile Admin Section - Only show for admin users */}
                {isAdmin && (
                  <div className="mt-6">
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
                              onClick={() => setIsOpen(false)}
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
                )}
              </div>

              <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                <div className="space-y-2">
                  <Link href="/user-profile">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start gap-3 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                      onClick={() => setIsOpen(false)}
                    >
                      <User className="h-4 w-4" />
                      Profil Użytkownika
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start gap-3 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                    onClick={() => window.location.href = '/api/logout'}
                  >
                    <LogOut className="h-4 w-4" />
                    Wyloguj się
                  </Button>
                </div>
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </>
  );
}