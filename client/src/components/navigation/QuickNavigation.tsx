import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Home, 
  Gamepad2, 
  Bitcoin, 
  Brain, 
  BarChart3, 
  Settings,
  ArrowRight
} from 'lucide-react';
import { motion } from 'framer-motion';

const navigationItems = [
  {
    path: '/finapp-home',
    label: 'Strona Główna',
    icon: Home,
    description: 'Panel główny',
    color: 'from-blue-500 to-cyan-500'
  },
  {
    path: '/gaming',
    label: 'Gaming Hub',
    icon: Gamepad2,
    description: 'Gry finansowe',
    badge: 'Popularne',
    color: 'from-green-500 to-emerald-500'
  },
  {
    path: '/enhanced-crypto',
    label: 'Crypto Market',
    icon: Bitcoin,
    description: 'Rynek kryptowalut',
    badge: 'Nowe',
    color: 'from-orange-500 to-yellow-500'
  },
  {
    path: '/ai-dashboard',
    label: 'AI Dashboard',
    icon: Brain,
    description: 'Analiza AI',
    badge: 'AI',
    color: 'from-purple-500 to-indigo-500'
  },
  {
    path: '/admin',
    label: 'Panel Admina',
    icon: Settings,
    description: 'Zarządzanie',
    color: 'from-gray-500 to-gray-600'
  },
  {
    path: '/developer-diagnostics',
    label: 'Diagnostyka',
    icon: BarChart3,
    description: 'Analityka systemu',
    badge: 'Dev',
    color: 'from-red-500 to-pink-500'
  }
];

export default function QuickNavigation() {
  return (
    <div className="w-full max-w-4xl mx-auto px-6 py-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Szybki dostęp do funkcji
        </h2>
        <p className="text-gray-600">
          Wybierz funkcję, z której chcesz skorzystać
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {navigationItems.map((item, index) => {
          const Icon = item.icon;
          
          return (
            <motion.div
              key={item.path}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link href={item.path}>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="group relative bg-white border border-gray-200 rounded-xl p-6 cursor-pointer hover:shadow-lg transition-all duration-300"
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${item.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">
                          {item.label}
                        </h3>
                        {item.badge && (
                          <Badge variant="secondary" className="text-xs">
                            {item.badge}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-3">
                        {item.description}
                      </p>
                      <div className="flex items-center text-purple-600 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <span>Przejdź</span>
                        <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform duration-300" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              </Link>
            </motion.div>
          );
        })}
      </div>

      <div className="text-center mt-8">
        <Button
          variant="outline"
          onClick={() => window.location.href = '/api/login'}
          className="px-6 py-2"
        >
          Zaloguj się, aby uzyskać pełny dostęp
        </Button>
      </div>
    </div>
  );
}