import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  Users
, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { logout } from '@/hooks/useAuth';

const navigationItems = [
  {
    path: '/',
    label: 'Dashboard',
    icon: Home,
    description: 'Main FinApp Dashboard'
  },
  {
    path: '/profile',
    label: 'Profile',
    icon: User,
    description: 'User profile and settings'
  },
  {
    path: '/ai-report-generator',
    label: 'AI Reports',
    icon: FileText,
    description: 'Generate financial reports with AI',
    badge: 'AI'
  },
  {
    path: '/investment-consultation',
    label: 'Investment AI',
    icon: TrendingUp,
    description: 'AI-powered investment advice',
    badge: 'Expert'
  },
  {
    path: '/tax-optimization',
    label: 'Tax Strategy',
    icon: Calculator,
    description: 'Tax optimization & legal strategies',
    badge: 'Premium'
  },
  {
    path: '/retirement-planning',
    label: 'Retirement',
    icon: PiggyBank,
    description: 'Safe retirement planning tools'
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
  },
  {
    path: '/gaming',
    label: 'Gaming Hub',
    icon: Gamepad2,
    description: 'Financial games & challenges',
    badge: 'Fun'
  },
  {
    path: '/enhanced-crypto',
    label: 'Crypto Market',
    icon: Bitcoin,
    description: 'Cryptocurrency trading platform',
    badge: 'Live'
  },
  {
    path: '/enhanced-chat',
    label: 'Enhanced AI Chat',
    icon: MessageCircle,
    description: 'Advanced AI chat with web search',
    badge: 'New'
  },

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

  const isActive = (path: string) => {
    return location === path || (path !== '/' && location.startsWith(path));
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="sm"
        className="fixed top-4 left-4 z-50 md:hidden bg-white/90 backdrop-blur-sm border border-gray-200 shadow-lg"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Desktop Sidebar */}
      <motion.nav
        initial={{ x: -300 }}
        animate={{ x: 0 }}
        transition={{ duration: 0.3 }}
        className="hidden md:flex fixed left-0 top-0 h-full w-72 bg-white/95 backdrop-blur-sm border-r border-gray-200 z-40 flex-col shadow-xl"
      >
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">FinApp</h1>
              <p className="text-sm text-gray-600">AI Financial Platform</p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
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
                        ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg' 
                        : 'hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    <Icon className={`h-5 w-5 ${active ? 'text-white' : 'text-gray-500'}`} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{item.label}</span>
                        {item.badge && (
                          <Badge 
                            variant={active ? "secondary" : "outline"}
                            className={`text-xs ${
                              active ? 'bg-white/20 text-white' : ''
                            } ${
                              item.restricted ? 'bg-red-100 text-red-800' : ''
                            }`}
                          >
                            {item.badge}
                          </Badge>
                        )}
                      </div>
                      <p className={`text-xs ${active ? 'text-white/80' : 'text-gray-500'}`}>
                        {item.description}
                      </p>
                    </div>
                  </motion.div>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="p-4 border-t border-gray-200">
          <div className="space-y-2">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start gap-3 text-gray-600 hover:text-gray-900"
            >
              <User className="h-4 w-4" />
              Profil Użytkownika
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start gap-3 text-gray-600 hover:text-red-600"
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
              className="fixed left-0 top-0 h-full w-80 bg-white z-50 flex-col shadow-xl md:hidden"
            >
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                      <Brain className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h1 className="text-xl font-bold text-gray-900">FinApp</h1>
                      <p className="text-sm text-gray-600">AI Financial Platform</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsOpen(false)}
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4">
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
                              ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg' 
                              : 'hover:bg-gray-100 text-gray-700'
                          }`}
                          onClick={() => setIsOpen(false)}
                        >
                          <Icon className={`h-5 w-5 ${active ? 'text-white' : 'text-gray-500'}`} />
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{item.label}</span>
                              {item.badge && (
                                <Badge 
                                  variant={active ? "secondary" : "outline"}
                                  className={`text-xs ${
                                    active ? 'bg-white/20 text-white' : ''
                                  } ${
                                    item.restricted ? 'bg-red-100 text-red-800' : ''
                                  }`}
                                >
                                  {item.badge}
                                </Badge>
                              )}
                            </div>
                            <p className={`text-xs ${active ? 'text-white/80' : 'text-gray-500'}`}>
                              {item.description}
                            </p>
                          </div>
                        </motion.div>
                      </Link>
                    );
                  })}
                </div>
              </div>

              <div className="p-4 border-t border-gray-200">
                <div className="space-y-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start gap-3 text-gray-600 hover:text-gray-900"
                  >
                    <User className="h-4 w-4" />
                    Profil Użytkownika
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start gap-3 text-gray-600 hover:text-red-600"
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