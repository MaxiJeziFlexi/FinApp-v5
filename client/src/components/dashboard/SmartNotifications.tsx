import { useState, useEffect } from 'react';
import { Bell, TrendingUp, AlertTriangle, Target, DollarSign, X } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';

interface SmartNotification {
  id: string;
  type: 'success' | 'warning' | 'info' | 'urgent';
  title: string;
  message: string;
  actionText?: string;
  actionUrl?: string;
  timestamp: Date;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: 'savings' | 'investment' | 'spending' | 'goal' | 'market' | 'tax';
}

const notificationIcons = {
  success: TrendingUp,
  warning: AlertTriangle,
  info: Bell,
  urgent: AlertTriangle
};

const categoryIcons = {
  savings: DollarSign,
  investment: TrendingUp,
  spending: AlertTriangle,
  goal: Target,
  market: TrendingUp,
  tax: DollarSign
};

export function SmartNotifications({ userId }: { userId: string }) {
  const [notifications, setNotifications] = useState<SmartNotification[]>([
    {
      id: '1',
      type: 'success',
      title: 'Savings Goal Progress',
      message: 'Great job! You\'re 15% ahead of your monthly savings goal with $2,100 saved.',
      actionText: 'View Progress',
      timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
      priority: 'medium',
      category: 'savings'
    },
    {
      id: '2',
      type: 'warning',
      title: 'Market Volatility Alert',
      message: 'Your tech portfolio is down 3.2% today. Consider reviewing your risk allocation.',
      actionText: 'Review Portfolio',
      timestamp: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
      priority: 'high',
      category: 'investment'
    },
    {
      id: '3',
      type: 'info',
      title: 'Smart Spending Insight',
      message: 'You\'ve spent 20% less on dining out this month compared to last month. Keep it up!',
      actionText: 'View Trends',
      timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
      priority: 'low',
      category: 'spending'
    },
    {
      id: '4',
      type: 'urgent',
      title: 'Bill Payment Reminder',
      message: 'Your credit card payment of $1,247 is due in 2 days. Avoid late fees!',
      actionText: 'Pay Now',
      timestamp: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
      priority: 'urgent',
      category: 'spending'
    }
  ]);

  const [isExpanded, setIsExpanded] = useState(false);

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const getNotificationColor = (type: SmartNotification['type']) => {
    switch (type) {
      case 'success': return 'from-green-500 to-green-600';
      case 'warning': return 'from-orange-500 to-orange-600';
      case 'info': return 'from-blue-500 to-blue-600';
      case 'urgent': return 'from-red-500 to-red-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const getPriorityBadgeColor = (priority: SmartNotification['priority']) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'low': return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  const urgentCount = notifications.filter(n => n.priority === 'urgent').length;
  const highCount = notifications.filter(n => n.priority === 'high').length;

  return (
    <div className="relative">
      {/* Notification Bell */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsExpanded(!isExpanded)}
        className="relative"
      >
        <Bell className="h-4 w-4" />
        {(urgentCount + highCount) > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
          >
            {urgentCount + highCount}
          </Badge>
        )}
      </Button>

      {/* Notifications Panel */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 top-12 w-96 max-h-96 overflow-y-auto z-50 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700"
          >
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Smart Notifications
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsExpanded(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {notifications.length} active insights
              </p>
            </div>

            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                  <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No new notifications</p>
                </div>
              ) : (
                notifications.map((notification) => {
                  const IconComponent = notificationIcons[notification.type];
                  const CategoryIcon = categoryIcons[notification.category];
                  
                  return (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg bg-gradient-to-r ${getNotificationColor(notification.type)} text-white flex-shrink-0`}>
                          <IconComponent className="h-4 w-4" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-sm text-gray-900 dark:text-white truncate">
                              {notification.title}
                            </h4>
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${getPriorityBadgeColor(notification.priority)}`}
                            >
                              {notification.priority}
                            </Badge>
                          </div>
                          
                          <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                            {notification.message}
                          </p>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <CategoryIcon className="h-3 w-3" />
                              <span>{formatTimeAgo(notification.timestamp)}</span>
                            </div>
                            
                            <div className="flex gap-1">
                              {notification.actionText && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 px-2 text-xs"
                                >
                                  {notification.actionText}
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={() => dismissNotification(notification.id)}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>

            {notifications.length > 0 && (
              <div className="p-3 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-xs"
                  onClick={() => setNotifications([])}
                >
                  Clear All Notifications
                </Button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}